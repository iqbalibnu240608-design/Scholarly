<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicClass;
use App\Models\Announcement;
use App\Models\KantinMenu;
use App\Models\KopsisProduct;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
     * Siswa Portal Data
     */
    public function getSiswaData(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'role' => 'siswa',
            'data' => [
                'kelas' => 'XII RPL 1',
                'wali_kelas' => 'Budi Santoso, S.Pd',
                'presensi_bulan_ini' => [
                    'hadir' => 22,
                    'izin' => 1,
                    'sakit' => 0,
                    'alpha' => 0,
                    'persentase' => '95.6%',
                ],
                'jadwal_hari_ini' => [
                    ['jam' => '07:30 - 09:00', 'mapel' => 'Pemrograman Web & Perangkat Bergerak', 'guru' => 'Budi Santoso, S.Pd', 'ruang' => 'Lab RPL 1'],
                    ['jam' => '09:15 - 10:45', 'mapel' => 'Basis Data & SQL', 'guru' => 'Dewi Lestari, M.Kom', 'ruang' => 'Lab RPL 2'],
                    ['jam' => '11:00 - 12:30', 'mapel' => 'Bahasa Inggris Kejuruan', 'guru' => 'Ahmad Fauzi, M.Pd', 'ruang' => 'Ruang 12'],
                ],
                'saldo_digital' => [
                    'saldo_kopsis' => 125000,
                    'saldo_kantin' => 45000,
                ],
                'tagihan_spp' => [
                    'status' => 'Lunas',
                    'bulan' => 'Oktober 2026',
                    'jatuh_tempo' => '10 November 2026',
                ]
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
                    'total_siswa_diajar' => 108,
                    'rata_rata_kehadiran' => '96.2%',
                ],
            ],
        ]);
    }

    /**
     * Kepala Sekolah Portal Data
     */
    public function getKepsekData(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'role' => 'kepsek',
            'data' => [
                'ringkasan_eksekutif' => [
                    'kehadiran_guru_hari_ini' => '98%',
                    'kehadiran_siswa_hari_ini' => '96.4%',
                    'status_akreditasi' => 'A (Unggul)',
                    'total_pendapatan_kopsis_bulan_ini' => 14850000,
                    'total_transaksi_kantin_hari_ini' => 3240000,
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
                    'total_siswa_lunas' => 420,
                    'siswa_menunggak' => 32,
                    'penerimaan_bulan_ini' => 63000000,
                ],
                'inventaris_sekolah' => [
                    'total_ruang_kelas' => 24,
                    'total_komputer_lab' => 120,
                    'kondisi_baik' => 114,
                    'dalam_perbaikan' => 6,
                ],
            ],
        ]);
    }

    /**
     * Kopsis (Koperasi Siswa) Data
     */
    public function getKopsisData(Request $request): JsonResponse
    {
        $products = KopsisProduct::latest()->get();

        return response()->json([
            'success' => true,
            'role' => 'kopsis',
            'data' => [
                'kasir_status' => 'Online',
                'transaksi_hari_ini' => [
                    'total_transaksi' => 58,
                    'total_omset' => 1420000,
                    'pembayaran_digital' => '72%',
                    'pembayaran_tunai' => '28%',
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
     * Kantin Sekolah Data
     */
    public function getKantinData(Request $request): JsonResponse
    {
        $menus = KantinMenu::latest()->get();

        return response()->json([
            'success' => true,
            'role' => 'kantin',
            'data' => [
                'status_kantin' => 'Buka',
                'pesanan_aktif' => 12,
                'pesanan_selesai_hari_ini' => 84,
                'omset_hari_ini' => 1680000,
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
}
