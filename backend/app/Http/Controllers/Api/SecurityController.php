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
     * Presensi Gerbang Masuk Sekolah (Sesuai Flowchart Presensi Gerbang Satpam)
     */
    public function gateCheckin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'identifier_number' => 'required|string', // Scan kartu RFID / Input NISN Siswa
        ]);

        $student = User::where('identifier_number', $validated['identifier_number'])->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => "Kartu atau NISN '{$validated['identifier_number']}' tidak dikenali di sistem.",
            ], 404);
        }

        $today = Carbon::today()->toDateString();
        $now = Carbon::now();
        $timeStr = $now->format('H:i:s');

        // Logika Status Kedatangan Sesuai Flowchart Figma
        // Batas normal: 07:00
        $threshold = Carbon::today()->setTime(7, 0, 0);
        $lateThreshold = Carbon::today()->setTime(7, 15, 0);

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

        $attendance = Attendance::updateOrCreate(
            ['user_id' => $student->id, 'date' => $today],
            [
                'check_in_time' => $timeStr,
                'status' => $status,
                'minutes_late' => $minutesLate,
                'verified_by' => $request->user()->id,
                'notes' => $note,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => "Presensi gerbang berhasil dicatat: {$student->name} ({$note}).",
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

        $logs = Attendance::with('user:id,name,identifier_number,role_name', 'verifier:id,name')
            ->where('date', $today)
            ->latest('check_in_time')
            ->get();

        $stats = [
            'total_masuk' => $logs->count(),
            'tepat_waktu' => $logs->where('status', 'hadir')->count(),
            'terlambat' => $logs->where('status', 'terlambat')->count(),
        ];

        return response()->json([
            'success' => true,
            'date' => $today,
            'stats' => $stats,
            'logs' => $logs,
        ]);
    }
}
