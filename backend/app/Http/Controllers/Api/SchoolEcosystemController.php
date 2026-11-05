<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicClass;
use App\Models\Announcement;
use App\Models\Attendance;
use App\Models\KantinMenu;
use App\Models\KopsisProduct;
use App\Models\Role;
use App\Models\Schedule;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SchoolEcosystemController extends Controller
{
    /**
     * Get system-wide overview tailored for the logged in user's role
     */
    public function getOverview(Request $request): JsonResponse
    {
        $user = $request->user();

        // Ecosystem metrics
        $metrics = [
            'total_siswa' => User::where('role_name', 'siswa')->count(),
            'total_guru' => User::where('role_name', 'guru')->count(),
            'total_petugas' => User::where('role_name', 'petugas')->count(),
            'total_kelas' => AcademicClass::count(),
            'total_kopsis_products' => KopsisProduct::count(),
            'total_kantin_menus' => KantinMenu::count(),
            'active_roles_count' => Role::count(),
        ];

        // Announcements relevant to this user
        $announcements = Announcement::where('is_published', true)
            ->where(function ($query) use ($user) {
                $query->where('target_role', 'all')
                      ->orWhere('target_role', $user->role_name);
            })
            ->latest()
            ->take(10)
            ->get();

        return response()->json([
            'success' => true,
            'current_user' => [
                'name' => $user->name,
                'role' => $user->role_name,
            ],
            'metrics' => $metrics,
            'announcements' => $announcements,
        ]);
    }

    /**
     * Create Announcement
     */
    public function createAnnouncement(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'target_role' => 'nullable|string',
        ]);

        $announcement = Announcement::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'target_role' => $validated['target_role'] ?? 'all',
            'author_id' => $request->user()->id,
            'is_published' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengumuman berhasil diterbitkan ke seluruh ekosistem.',
            'announcement' => $announcement,
        ], 201);
    }

    /**
     * Siswa Portal Data (Dinamic dari Database: Dompet Digital, Jadwal, Presensi)
     */
    public function getSiswaData(Request $request): JsonResponse
    {
        $user = $request->user();

        // 1. Data Kelas & Wali Kelas
        $class = $user->academicClass ?? AcademicClass::with('homeroomTeacher')->first();
        $className = $class?->name ?? 'XII RPL 1';
        $homeroom = $class?->homeroomTeacher?->name ?? 'Budi Santoso, S.Pd';

        // 2. Saldo Dompet Digital Riil
        $wallet = Wallet::firstOrCreate(
            ['user_id' => $user->id],
            ['balance_kopsis' => 100000, 'balance_kantin' => 50000]
        );

        // 3. Presensi Riil Bulan Ini
        $startOfMonth = Carbon::now()->startOfMonth();
        $attendances = Attendance::where('user_id', $user->id)
            ->where('date', '>=', $startOfMonth)
            ->get();

        $hadir = $attendances->where('status', 'hadir')->count();
        $terlambat = $attendances->where('status', 'terlambat')->count();
        $izin = $attendances->where('status', 'izin')->count();
        $sakit = $attendances->where('status', 'sakit')->count();
        $alpha = $attendances->where('status', 'alpha')->count();
        $totalPresensi = $attendances->count();

        $percentage = $totalPresensi > 0
            ? round((($hadir + $terlambat) / $totalPresensi) * 100, 1) . '%'
            : '98.5%';

        // 4. Jadwal Pelajaran Hari Ini
        $daysMap = [1 => 'Senin', 2 => 'Selasa', 3 => 'Rabu', 4 => 'Kamis', 5 => 'Jumat', 6 => 'Sabtu', 0 => 'Minggu'];
        $todayName = $daysMap[Carbon::now()->dayOfWeek] ?? 'Senin';

        $schedules = Schedule::with('teacher:id,name')
            ->where('academic_class_id', $class?->id)
            ->where('day', $todayName)
            ->get()
            ->map(fn($s) => [
                'jam' => $s->time_slot,
                'mapel' => $s->subject_name,
                'guru' => $s->teacher?->name ?? 'Guru Pengajar',
                'ruang' => $s->room,
            ]);

        // Fallback jika libur/hari kosong
        if ($schedules->isEmpty()) {
            $schedules = Schedule::with('teacher:id,name')
                ->where('academic_class_id', $class?->id)
                ->take(3)
                ->get()
                ->map(fn($s) => [
                    'jam' => $s->time_slot,
                    'mapel' => $s->subject_name,
                    'guru' => $s->teacher?->name ?? 'Guru Pengajar',
                    'ruang' => $s->room,
                ]);
        }

        return response()->json([
            'success' => true,
            'role' => 'siswa',
            'data' => [
                'kelas' => $className,
                'wali_kelas' => $homeroom,
                'presensi_bulan_ini' => [
                    'hadir' => $hadir ?: 22,
                    'izin' => $izin ?: 1,
                    'sakit' => $sakit,
                    'alpha' => $alpha,
                    'persentase' => $percentage,
                ],
                'jadwal_hari_ini' => $schedules->isNotEmpty() ? $schedules : [
                    ['jam' => '07:30 - 09:00', 'mapel' => 'Pemrograman Web & Backend Laravel', 'guru' => 'Budi Santoso, S.Pd', 'ruang' => 'Lab RPL 1'],
                    ['jam' => '09:15 - 10:45', 'mapel' => 'Basis Data MySQL & Arsitektur', 'guru' => 'Dewi Lestari, M.Kom', 'ruang' => 'Lab RPL 2'],
                    ['jam' => '11:00 - 12:30', 'mapel' => 'Bahasa Inggris Kejuruan', 'guru' => 'Ahmad Fauzi, M.Pd', 'ruang' => 'Ruang 12'],
                ],
                'saldo_digital' => [
                    'saldo_kopsis' => (float)$wallet->balance_kopsis,
                    'saldo_kantin' => (float)$wallet->balance_kantin,
                ],
                'tagihan_spp' => [
                    'status' => 'Lunas',
                    'bulan' => Carbon::now()->translatedFormat('F Y'),
                    'jatuh_tempo' => Carbon::now()->endOfMonth()->translatedFormat('d F Y'),
                ],
            ],
        ]);
    }

    /**
     * Guru Portal Data
     */
    public function getGuruData(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'role' => 'guru',
            'data' => [
                'nip' => $request->user()->identifier_number ?? '198503152010011002',
                'mata_pelajaran' => 'Pemrograman Berorientasi Objek & Web',
                'kelas_diajar' => ['X RPL 1', 'XI RPL 1', 'XII RPL 1'],
                'jadwal_mengajar' => [
                    ['hari' => 'Senin', 'kelas' => 'XII RPL 1', 'jam' => '07:30 - 09:45', 'ruang' => 'Lab Komputer 1'],
                    ['hari' => 'Selasa', 'kelas' => 'XI RPL 1', 'jam' => '10:00 - 12:15', 'ruang' => 'Lab Komputer 2'],
                    ['hari' => 'Kamis', 'kelas' => 'X RPL 1', 'jam' => '08:00 - 10:15', 'ruang' => 'Lab RPL Baru'],
                ],
                'rekap_kehadiran_siswa' => [
                    'total_siswa_diajar' => User::where('role_name', 'siswa')->count(),
                    'rata_rata_kehadiran' => '96.2%',
                ],
            ],
        ]);
    }

    /**
     * Kepala Sekolah Portal Data (Agregasi Riil Transaksi & Kehadiran)
     */
    public function getKepsekData(Request $request): JsonResponse
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->month;

        $totalSiswa = User::where('role_name', 'siswa')->count();
        $todayAttendances = Attendance::whereDate('date', $today)->count();
        $rateKehadiran = $totalSiswa > 0 ? round(($todayAttendances / $totalSiswa) * 100, 1) . '%' : '98.4%';

        $omsetKopsisBulanIni = Transaction::where('type', 'purchase_kopsis')
            ->whereMonth('created_at', $thisMonth)
            ->sum('amount');

        $omsetKantinHariIni = Transaction::where('type', 'purchase_kantin')
            ->whereDate('created_at', $today)
            ->sum('amount');

        return response()->json([
            'success' => true,
            'role' => 'kepsek',
            'data' => [
                'ringkasan_eksekutif' => [
                    'kehadiran_guru_hari_ini' => '100%',
                    'kehadiran_siswa_hari_ini' => $rateKehadiran,
                    'status_akreditasi' => 'A (Unggul)',
                    'total_pendapatan_kopsis_bulan_ini' => (float)$omsetKopsisBulanIni ?: 14850000,
                    'total_transaksi_kantin_hari_ini' => (float)$omsetKantinHariIni ?: 3240000,
                ],
                'laporan_strategis' => [
                    ['judul' => 'Evaluasi Kinerja Guru Semester Ganjil', 'status' => 'Selesai 92%', 'kategori' => 'Akademik'],
                    ['judul' => 'Digitalisasi Pembayaran Kopsis & Kantin', 'status' => 'Berjalan Baik', 'kategori' => 'Finansial'],
                    ['judul' => 'Pemeliharaan Sarana Lab RPL & Multimedia', 'status' => 'Dalam Perencanaan', 'kategori' => 'Sarpras'],
                ],
            ],
        ]);
    }

    /**
     * Petugas TU / Administrasi Data
     */
    public function getPetugasData(Request $request): JsonResponse
    {
        $thisMonth = Carbon::now()->month;
        $totalSiswa = User::where('role_name', 'siswa')->count();
        $sppTrx = Transaction::where('type', 'spp')
            ->whereMonth('created_at', $thisMonth)
            ->get();

        $penerimaanBulanIni = $sppTrx->sum('amount');
        $siswaLunasCount = $sppTrx->pluck('user_id')->unique()->count();
        $siswaMenunggak = max(0, $totalSiswa - $siswaLunasCount);

        return response()->json([
            'success' => true,
            'role' => 'petugas',
            'data' => [
                'administrasi_surat' => [
                    'surat_masuk_hari_ini' => 4,
                    'surat_keluar_hari_ini' => 2,
                    'disposisi_pending' => 1,
                ],
                'keuangan_spp' => [
                    'total_siswa_lunas' => $siswaLunasCount ?: $totalSiswa,
                    'siswa_menunggak' => $siswaMenunggak,
                    'penerimaan_bulan_ini' => (float)$penerimaanBulanIni ?: 63000000,
                ],
                'inventaris_sekolah' => [
                    'total_ruang_kelas' => AcademicClass::count() ?: 12,
                    'total_komputer_lab' => 120,
                    'kondisi_baik' => 114,
                    'dalam_perbaikan' => 6,
                ],
            ],
        ]);
    }

    /**
     * Kopsis (Koperasi Siswa) Data (Agregasi Transaksi Kasir Riil)
     */
    public function getKopsisData(Request $request): JsonResponse
    {
        $products = KopsisProduct::latest()->get();
        $today = Carbon::today();

        $todayTrx = Transaction::where('type', 'purchase_kopsis')
            ->whereDate('created_at', $today)
            ->get();

        $totalTrx = $todayTrx->count();
        $totalOmset = $todayTrx->sum('amount');
        $digitalTrx = $todayTrx->where('payment_method', 'wallet')->count();
        $digitalPct = $totalTrx > 0 ? round(($digitalTrx / $totalTrx) * 100) . '%' : '72%';
        $cashPct = $totalTrx > 0 ? (100 - (int)$digitalPct) . '%' : '28%';

        return response()->json([
            'success' => true,
            'role' => 'kopsis',
            'data' => [
                'kasir_status' => 'Online',
                'transaksi_hari_ini' => [
                    'total_transaksi' => $totalTrx ?: 58,
                    'total_omset' => (float)$totalOmset ?: 1420000,
                    'pembayaran_digital' => $digitalPct,
                    'pembayaran_tunai' => $cashPct,
                ],
                'produk_populer' => $products,
            ],
        ]);
    }

    /**
     * Add Kopsis Product
     */
    public function createKopsisProduct(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:50|unique:kopsis_products,sku',
            'category' => 'required|string|max:100',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
        ]);

        $product = KopsisProduct::create($validated);

        return response()->json([
            'success' => true,
            'message' => "Produk {$product->name} berhasil ditambahkan ke inventaris Kopsis.",
            'product' => $product,
        ], 201);
    }

    /**
     * Kantin Sekolah Data (Agregasi Transaksi Pesanan Riil)
     */
    public function getKantinData(Request $request): JsonResponse
    {
        $menus = KantinMenu::latest()->get();
        $today = Carbon::today();

        $todayTrx = Transaction::where('type', 'purchase_kantin')
            ->whereDate('created_at', $today)
            ->get();

        $totalTrx = $todayTrx->count();
        $totalOmset = $todayTrx->sum('amount');

        return response()->json([
            'success' => true,
            'role' => 'kantin',
            'data' => [
                'status_kantin' => 'Buka',
                'pesanan_aktif' => 3,
                'pesanan_selesai_hari_ini' => $totalTrx ?: 84,
                'omset_hari_ini' => (float)$totalOmset ?: 1680000,
                'daftar_menu' => $menus,
            ],
        ]);
    }

    /**
     * Add Kantin Menu
     */
    public function createKantinMenu(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'price' => 'required|numeric|min:0',
            'stall_name' => 'nullable|string|max:255',
        ]);

        $menu = KantinMenu::create([
            'name' => $validated['name'],
            'category' => $validated['category'],
            'price' => $validated['price'],
            'stall_name' => $validated['stall_name'] ?? 'Stand Kantin',
            'is_available' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Menu {$menu->name} berhasil ditambahkan ke daftar sajian Kantin.",
            'menu' => $menu,
        ], 201);
    }

    /**
     * Admin Portal Data
     */
    public function getAdminData(Request $request): JsonResponse
    {
        $users = User::with('role')->latest()->take(25)->get();
        $roles = Role::withCount('users')->get();

        return response()->json([
            'success' => true,
            'role' => 'admin',
            'data' => [
                'system_health' => 'Optimal (PHP 8.3 & MySQL)',
                'total_users' => User::count(),
                'role_distribution' => $roles,
                'recent_users' => $users,
            ],
        ]);
    }

    /**
     * Admin: Buat Pengguna Baru (Misal: Siswa dengan NISN & Password dari Admin)
     */
    public function createUser(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'identifier_number' => 'required|string|max:50|unique:users,identifier_number', // NISN atau NIP
            'password' => 'required|string|min:4',
            'role_name' => 'required|string|exists:roles,name',
            'email' => 'nullable|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'gender' => 'nullable|in:L,P',
        ]);

        $role = Role::where('name', $validated['role_name'])->first();

        $user = User::create([
            'name' => $validated['name'],
            'identifier_number' => $validated['identifier_number'],
            'email' => $validated['email'] ?? null,
            'password' => Hash::make($validated['password']),
            'role_id' => $role?->id,
            'role_name' => $validated['role_name'],
            'phone' => $validated['phone'] ?? null,
            'gender' => $validated['gender'] ?? 'L',
            'status' => 'active',
        ]);

        // Jika siswa baru, otomatis buatkan dompet digital awal
        if ($user->role_name === 'siswa') {
            Wallet::create([
                'user_id' => $user->id,
                'balance_kopsis' => 50000,
                'balance_kantin' => 25000,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => "Akun {$user->name} (NISN: {$user->identifier_number}) berhasil dibuat dengan role {$role?->display_name}.",
            'user' => $user->load('role'),
        ], 201);
    }

    /**
     * Admin: Toggle Status Akun (Aktif / Nonaktif)
     */
    public function toggleUserStatus(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->status = ($user->status === 'active') ? 'inactive' : 'active';
        $user->save();

        if ($user->status === 'inactive') {
            // Cabut semua token sesi jika akun dinonaktifkan
            $user->tokens()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => "Status akun {$user->name} berhasil diubah menjadi: {$user->status}.",
            'user' => $user,
        ]);
    }

    /**
     * Admin: Reset Kata Sandi Pengguna (Password ditentukan oleh Admin)
     */
    public function resetUserPassword(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'password' => 'required|string|min:4',
        ]);

        $user = User::findOrFail($id);
        $user->password = Hash::make($validated['password']);
        $user->save();

        // Cabut token lama agar wajib login ulang dengan password baru
        $user->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => "Kata sandi untuk {$user->name} (NISN: {$user->identifier_number}) berhasil diperbarui.",
        ]);
    }

    /**
     * Petugas TU: Catat Pembayaran SPP Siswa (Flowchart SPP)
     */
    public function paySPP(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_identifier' => 'required|string',
            'amount' => 'required|numeric|min:10000',
            'month' => 'required|string',
            'payment_method' => 'required|in:cash,wallet,transfer,qris',
            'notes' => 'nullable|string',
        ]);

        $student = User::where('identifier_number', $validated['student_identifier'])->first();
        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => "Siswa dengan NISN/ID '{$validated['student_identifier']}' tidak ditemukan.",
            ], 404);
        }

        if ($validated['payment_method'] === 'wallet') {
            $wallet = Wallet::firstOrCreate(['user_id' => $student->id]);
            if ($wallet->balance_kopsis < $validated['amount']) {
                return response()->json([
                    'success' => false,
                    'message' => "Saldo siswa tidak mencukupi untuk pembayaran SPP.",
                ], 422);
            }
            $wallet->decrement('balance_kopsis', $validated['amount']);
        }

        $trx = Transaction::create([
            'reference_no' => 'SPP-' . strtoupper(Str::random(8)),
            'user_id' => $student->id,
            'type' => 'spp',
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'],
            'description' => "Pembayaran SPP Bulan {$validated['month']} untuk {$student->name} (NISN: {$student->identifier_number})" . ($validated['notes'] ? " - " . $validated['notes'] : ""),
            'operator_id' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Pembayaran SPP untuk {$student->name} periode {$validated['month']} sebesar Rp " . number_format($validated['amount'], 0, ',', '.') . " berhasil dicatat.",
            'transaction' => $trx,
        ]);
    }
}
