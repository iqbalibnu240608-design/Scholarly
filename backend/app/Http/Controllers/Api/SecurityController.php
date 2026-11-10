<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SecurityController extends Controller
{
    /**
     * Presensi Gerbang Sekolah (RFID / NISN Siswa)
     * Aturan Bisnis:
     * 1. Presensi pertama pada pagi hari (sebelum 11:59) -> 'datang' (Check In).
     *    - Jam batas tepat waktu: 07:00 (<= 07:00 Hadir Tepat Waktu, > 07:00 Terlambat).
     * 2. Presensi kedua pada pagi hari (disengaja maupun tidak sengaja) -> 'pulang' (Check Out).
     * 3. Cut-off Pukul 11:59:
     *    - Begitu memasuki atau melewati pukul 11:59, tanpa mempedulikan log sebelumnya,
     *      presensi pertama berikutnya otomatis kembali menjadi 'datang' (Sesi Siang/Sore).
     *    - Jika ada presensi lagi setelah sesi siang 'datang', maka otomatis menjadi 'pulang'.
     * 4. Pergantian Hari (setelah 23:59 / 00:00):
     *    - Tanggal berganti, riwayat dimulai dari awal dan presensi pertama adalah 'datang'.
     * 5. Data kedatangan pagi tidak pernah ditimpa oleh presensi kepulangan.
     */
    public function gateCheckin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'identifier_number' => 'required|string', // Scan kartu RFID / Input NISN Siswa
            'simulated_time' => 'nullable|string',     // Opsional untuk pengujian otomasi
        ]);

        $student = User::where('identifier_number', $validated['identifier_number'])->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => "Kartu atau NISN '{$validated['identifier_number']}' tidak dikenali di sistem.",
            ], 404);
        }

        // Tentukan waktu sekarang (atau simulated_time jika disediakan dalam environment testing)
        $now = !empty($validated['simulated_time'])
            ? Carbon::parse($validated['simulated_time'])
            : Carbon::now();

        $today = $now->toDateString(); // Berganti otomatis setiap melewati 23:59:59 (00:00:00)
        $timeStr = $now->format('H:i:s');
        $verifierId = $request->user()?->id;

        // Cut-off 11:59 siang
        $isAfternoonSession = $now->format('H:i') >= '11:59';

        if ($isAfternoonSession) {
            // KASUS SESI SIANG (>= 11:59)
            // Cari apakah siswa sudah memiliki presensi 'datang' pada sesi siang (antara 11:59 s/d waktu scan sekarang)
            $afternoonRecord = Attendance::where('user_id', $student->id)
                ->where('date', $today)
                ->whereTime('check_in_time', '>=', '11:59:00')
                ->whereTime('check_in_time', '<=', $timeStr)
                ->latest('id')
                ->first();

            if (!$afternoonRecord) {
                // ATURAN 11:59: Tanpa peduli log terakhir pagi apa, presensi pertama setelah 11:59 adalah 'datang'
                $attendance = Attendance::create([
                    'user_id' => $student->id,
                    'date' => $today,
                    'check_in_time' => $timeStr,
                    'check_out_time' => null,
                    'status' => 'hadir',
                    'minutes_late' => 0,
                    'verified_by' => $verifierId,
                    'notes' => 'Presensi Datang Sesi Siang',
                ]);

                return response()->json([
                    'success' => true,
                    'type' => 'datang',
                    'action' => 'datang',
                    'session' => 'siang',
                    'message' => "Presensi Datang Sesi Siang berhasil dicatat: {$student->name} pukul {$timeStr}.",
                    'student' => [
                        'name' => $student->name,
                        'nisn' => $student->identifier_number,
                        'role' => $student->role_name,
                    ],
                    'attendance' => $attendance,
                ]);
            }

            // Siswa sudah scan datang siang -> scan berikutnya (tidak sengaja / sengaja) menjadi 'pulang'
            $cleanNotes = trim(preg_replace('/\s*•\s*Pulang:.*$/', '', $afternoonRecord->notes ?? ''));
            $updatedNotes = $cleanNotes !== '' ? "{$cleanNotes} • Pulang: {$timeStr}" : "Pulang: {$timeStr}";

            $afternoonRecord->update([
                'check_out_time' => $timeStr,
                'check_out_verified_by' => $verifierId,
                'notes' => $updatedNotes,
            ]);
            $afternoonRecord->refresh();

            return response()->json([
                'success' => true,
                'type' => 'pulang',
                'action' => 'pulang',
                'session' => 'siang',
                'message' => "Presensi Pulang Sesi Siang berhasil dicatat: {$student->name} pukul {$timeStr} (Datang: {$afternoonRecord->check_in_time}).",
                'student' => [
                    'name' => $student->name,
                    'nisn' => $student->identifier_number,
                    'role' => $student->role_name,
                ],
                'attendance' => $afternoonRecord,
            ]);
        }

        // KASUS SESI PAGI (< 11:59)
        // Cek apakah siswa sudah memiliki presensi pada pagi hari (antara 00:00 s/d waktu scan sekarang)
        $morningRecord = Attendance::where('user_id', $student->id)
            ->where('date', $today)
            ->whereTime('check_in_time', '<', '11:59:00')
            ->whereTime('check_in_time', '<=', $timeStr)
            ->latest('id')
            ->first();

        if ($morningRecord) {
            // Sudah ada presensi pagi -> Scan kedua (tidak sengaja / sengaja) menjadi 'pulang'
            $cleanNotes = trim(preg_replace('/\s*•\s*Pulang:.*$/', '', $morningRecord->notes ?? ''));
            $updatedNotes = $cleanNotes !== '' ? "{$cleanNotes} • Pulang: {$timeStr}" : "Pulang: {$timeStr}";

            $morningRecord->update([
                'check_out_time' => $timeStr,
                'check_out_verified_by' => $verifierId,
                'notes' => $updatedNotes,
            ]);
            $morningRecord->refresh();

            return response()->json([
                'success' => true,
                'type' => 'pulang',
                'action' => 'pulang',
                'session' => 'pagi',
                'message' => "Presensi Pulang berhasil dicatat: {$student->name} pukul {$timeStr} (Datang: {$morningRecord->check_in_time}).",
                'student' => [
                    'name' => $student->name,
                    'nisn' => $student->identifier_number,
                    'role' => $student->role_name,
                ],
                'attendance' => $morningRecord,
            ]);
        }

        // Belum ada presensi pagi -> Jadikan 'datang'
        // Batas maksimal kedatangan tepat waktu adalah jam 07:00
        $threshold = $now->copy()->setTime(7, 0, 0);
        $lateThreshold = $now->copy()->setTime(7, 15, 0);

        $status = 'hadir';
        $minutesLate = 0;
        $note = 'Hadir Tepat Waktu';

        if ($now->greaterThan($threshold)) {
            $minutesLate = $threshold->diffInMinutes($now);
            if ($now->lessThanOrEqualTo($lateThreshold)) {
                $status = 'terlambat';
                $note = "Terlambat {$minutesLate} menit.";
            } else {
                $status = 'terlambat';
                $note = "Sangat Terlambat ({$minutesLate} menit). Wajib melapor ke Guru Piket / BK.";
            }
        }

        $attendance = Attendance::create([
            'user_id' => $student->id,
            'date' => $today,
            'check_in_time' => $timeStr,
            'check_out_time' => null,
            'status' => $status,
            'minutes_late' => $minutesLate,
            'verified_by' => $verifierId,
            'notes' => $note,
        ]);

        return response()->json([
            'success' => true,
            'type' => 'datang',
            'action' => 'datang',
            'session' => 'pagi',
            'message' => "Presensi Datang berhasil dicatat: {$student->name} pukul {$timeStr} ({$note}).",
            'student' => [
                'name' => $student->name,
                'nisn' => $student->identifier_number,
                'role' => $student->role_name,
            ],
            'attendance' => $attendance,
        ]);
    }

    /**
     * Dapatkan Log Kedatangan Gerbang Hari Ini (Untuk Pos Satpam & Kepsek)
     */
    public function getTodayLogs(Request $request): JsonResponse
    {
        $today = Carbon::today()->toDateString();

        $logs = Attendance::with('user:id,name,identifier_number,role_name', 'verifier:id,name', 'checkOutVerifier:id,name')
            ->where('date', $today)
            ->latest('updated_at')
            ->get()
            ->map(function ($log) {
                $log->type = $log->check_out_time ? 'pulang' : 'datang';
                return $log;
            });

        $stats = [
            'total_masuk' => $logs->count(),
            'tepat_waktu' => $logs->where('status', 'hadir')->count(),
            'terlambat' => $logs->where('status', 'terlambat')->count(),
            'total_pulang' => $logs->whereNotNull('check_out_time')->count(),
        ];

        return response()->json([
            'success' => true,
            'date' => $today,
            'stats' => $stats,
            'logs' => $logs,
        ]);
    }
}
