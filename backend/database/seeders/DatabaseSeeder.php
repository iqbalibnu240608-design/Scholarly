<?php

namespace Database\Seeders;

use App\Models\AcademicClass;
use App\Models\Announcement;
use App\Models\KantinMenu;
use App\Models\KopsisProduct;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Roles Seed
        $rolesData = [
            [
                'name' => 'admin',
                'display_name' => 'Administrator Sistem',
                'description' => 'Akses penuh ke semua konfigurasi sistem, audit log, dan manajemen pengguna.',
            ],
            [
                'name' => 'kepsek',
                'display_name' => 'Kepala Sekolah',
                'description' => 'Memantau seluruh aktivitas sekolah, laporan akademik, keuangan, dan evaluasi staff.',
            ],
            [
                'name' => 'guru',
                'display_name' => 'Guru / Tenaga Pendidik',
                'description' => 'Mengelola kelas, materi pelajaran, absensi siswa, dan input nilai.',
            ],
            [
                'name' => 'siswa',
                'display_name' => 'Siswa / Peserta Didik',
                'description' => 'Melihat jadwal, nilai, absensi, saldo belanja kopsis, dan menu kantin.',
            ],
            [
                'name' => 'petugas',
                'display_name' => 'Petugas TU & Administrasi',
                'description' => 'Mengelola data pokok pendidikan, administrasi surat menyurat, dan pembayaran SPP.',
            ],
            [
                'name' => 'kopsis',
                'display_name' => 'Pengelola Koperasi Siswa',
                'description' => 'Point of Sale kasir koperasi, manajemen stok ATK/seragam, dan riwayat belanja.',
            ],
            [
                'name' => 'kantin',
                'display_name' => 'Pengelola Kantin Sekolah',
                'description' => 'Manajemen stan makanan/minuman, kasir pemesanan, dan transaksi harian kantin.',
            ],
            // Extensible roles:
            [
                'name' => 'perpustakaan',
                'display_name' => 'Petugas Perpustakaan',
                'description' => 'Peminjaman dan katalog buku perpustakaan.',
            ],
            [
                'name' => 'bk',
                'display_name' => 'Guru Bimbingan Konseling',
                'description' => 'Konseling siswa, poin pelanggaran, dan catatan prestasi.',
            ],
        ];

        $roles = [];
        foreach ($rolesData as $role) {
            $roles[$role['name']] = Role::updateOrCreate(
                ['name' => $role['name']],
                $role
            );
        }

        // 2. Permissions Seed
        $permissionsData = [
            // Modul Sistem
            ['name' => 'manage_users', 'display_name' => 'Kelola Pengguna', 'module' => 'system'],
            ['name' => 'manage_roles', 'display_name' => 'Kelola Role & Akses', 'module' => 'system'],
            ['name' => 'view_audit_log', 'display_name' => 'Lihat Audit Log', 'module' => 'system'],
            
            // Modul Akademik
            ['name' => 'manage_curriculum', 'display_name' => 'Kelola Kurikulum & Mapel', 'module' => 'academic'],
            ['name' => 'input_grades', 'display_name' => 'Input Nilai Siswa', 'module' => 'academic'],
            ['name' => 'view_grades', 'display_name' => 'Lihat Nilai', 'module' => 'academic'],
            ['name' => 'manage_attendance', 'display_name' => 'Kelola Presensi Siswa', 'module' => 'academic'],
            
            // Modul Eksekutif (Kepsek)
            ['name' => 'view_executive_reports', 'display_name' => 'Lihat Laporan Eksekutif', 'module' => 'executive'],
            ['name' => 'approve_budget', 'display_name' => 'Persetujuan Anggaran', 'module' => 'executive'],

            // Modul Tata Usaha (Petugas)
            ['name' => 'manage_student_registry', 'display_name' => 'Kelola Buku Induk Siswa', 'module' => 'administration'],
            ['name' => 'manage_tu_fees', 'display_name' => 'Kelola Tagihan SPP', 'module' => 'administration'],
            ['name' => 'manage_correspondence', 'display_name' => 'Kelola Surat & Dokumen', 'module' => 'administration'],

            // Modul Kopsis
            ['name' => 'manage_kopsis_inventory', 'display_name' => 'Kelola Stok Kopsis', 'module' => 'kopsis'],
            ['name' => 'kopsis_pos_checkout', 'display_name' => 'Kasir Transaksi Kopsis', 'module' => 'kopsis'],

            // Modul Kantin
            ['name' => 'manage_canteen_menu', 'display_name' => 'Kelola Menu Kantin', 'module' => 'kantin'],
            ['name' => 'process_canteen_orders', 'display_name' => 'Proses Pesanan Kantin', 'module' => 'kantin'],
        ];

        foreach ($permissionsData as $perm) {
            Permission::updateOrCreate(['name' => $perm['name']], $perm);
        }

        // 3. Demo Users for Every Role (All password: password123)
        $usersData = [
            [
                'name' => 'Super Administrator',
                'email' => 'admin@sekolah.test',
                'role_name' => 'admin',
                'identifier_number' => 'ADM-001',
                'phone' => '081234567890',
                'gender' => 'L',
            ],
            [
                'name' => 'Dr. H. Soekarno, M.Pd',
                'email' => 'kepsek@sekolah.test',
                'role_name' => 'kepsek',
                'identifier_number' => '197001011995031001',
                'phone' => '081234567891',
                'gender' => 'L',
            ],
            [
                'name' => 'Budi Santoso, S.Pd',
                'email' => 'guru@sekolah.test',
                'role_name' => 'guru',
                'identifier_number' => '198503152010011002',
                'phone' => '081234567892',
                'gender' => 'L',
            ],
            [
                'name' => 'Ahmad Pratama',
                'email' => 'siswa@sekolah.test',
                'role_name' => 'siswa',
                'identifier_number' => '0061234567', // NISN
                'phone' => '081234567893',
                'gender' => 'L',
            ],
            [
                'name' => 'Siti Aminah, S.AP',
                'email' => 'petugas@sekolah.test',
                'role_name' => 'petugas',
                'identifier_number' => '199008202015022003',
                'phone' => '081234567894',
                'gender' => 'P',
            ],
            [
                'name' => 'Rudi Hermawan (Kopsis)',
                'email' => 'kopsis@sekolah.test',
                'role_name' => 'kopsis',
                'identifier_number' => 'KOP-2026',
                'phone' => '081234567895',
                'gender' => 'L',
            ],
            [
                'name' => 'Ibu Titin (Kantin Stand 1)',
                'email' => 'kantin@sekolah.test',
                'role_name' => 'kantin',
                'identifier_number' => 'KTN-01',
                'phone' => '081234567896',
                'gender' => 'P',
            ],
        ];

        foreach ($usersData as $u) {
            $role = $roles[$u['role_name']] ?? null;
            User::updateOrCreate(
                ['email' => $u['email']],
                [
                    'name' => $u['name'],
                    'password' => Hash::make('password123'),
                    'role_id' => $role?->id,
                    'role_name' => $u['role_name'],
                    'identifier_number' => $u['identifier_number'],
                    'phone' => $u['phone'],
                    'gender' => $u['gender'],
                    'status' => 'active',
                ]
            );
        }

        // 4. Initial Academic Classes
        $classes = [
            ['name' => 'X RPL 1', 'grade' => '10', 'major' => 'Rekayasa Perangkat Lunak'],
            ['name' => 'XI RPL 1', 'grade' => '11', 'major' => 'Rekayasa Perangkat Lunak'],
            ['name' => 'XII RPL 1', 'grade' => '12', 'major' => 'Rekayasa Perangkat Lunak'],
            ['name' => 'X TKJ 1', 'grade' => '10', 'major' => 'Teknik Komputer & Jaringan'],
            ['name' => 'XI TKJ 1', 'grade' => '11', 'major' => 'Teknik Komputer & Jaringan'],
        ];
        foreach ($classes as $cls) {
            AcademicClass::firstOrCreate(['name' => $cls['name']], $cls);
        }

        // 5. Initial Announcements
        $announcements = [
            [
                'title' => 'Selamat Datang di Portal Terpadu Ekosistem Sekolah',
                'content' => 'Portal ekosistem sekolah kini telah aktif untuk menghubungkan seluruh civitas akademika: Siswa, Guru, TU, Kepala Sekolah, Kopsis, dan Kantin.',
                'target_role' => 'all',
                'is_published' => true,
            ],
            [
                'title' => 'Pengumuman Penilaian Tengah Semester (PTS) Ganjil',
                'content' => 'Jadwal PTS akan dimulai tanggal 15 November 2026. Harap seluruh siswa mempersiapkan kartu ujian dan absensi minimum 85%.',
                'target_role' => 'siswa',
                'is_published' => true,
            ],
            [
                'title' => 'Rapat Koordinasi Evaluasi Pembelajaran & Kurikulum',
                'content' => 'Kepada bapak/ibu dewan guru, rapat koordinasi bulanan akan diadakan pada hari Jumat jam 13:30 di Ruang Guru Utama.',
                'target_role' => 'guru',
                'is_published' => true,
            ],
        ];
        foreach ($announcements as $ann) {
            Announcement::firstOrCreate(['title' => $ann['title']], $ann);
        }

        // 6. Initial Kopsis Products
        $products = [
            ['sku' => 'ATK-001', 'name' => 'Buku Tulis Campus 58 Lembar', 'category' => 'Alat Tulis', 'price' => 6000, 'stock' => 150],
            ['sku' => 'ATK-002', 'name' => 'Bolpoin Gel Hitam 0.5mm', 'category' => 'Alat Tulis', 'price' => 3500, 'stock' => 200],
            ['sku' => 'SRG-001', 'name' => 'Badge & Logo Sekolah Bordir', 'category' => 'Seragam', 'price' => 12000, 'stock' => 85],
            ['sku' => 'SRG-002', 'name' => 'Dasi Resmi Sekolah', 'category' => 'Seragam', 'price' => 15000, 'stock' => 60],
            ['sku' => 'BKU-001', 'name' => 'Buku Modul Praktikum RPL Web', 'category' => 'Buku', 'price' => 35000, 'stock' => 45],
        ];
        foreach ($products as $prod) {
            KopsisProduct::firstOrCreate(['sku' => $prod['sku']], $prod);
        }

        // 7. Initial Kantin Menus
        $menus = [
            ['name' => 'Nasi Goreng Spesial Telur', 'category' => 'Makanan', 'price' => 12000, 'stall_name' => 'Stand 1 Bu Titin'],
            ['name' => 'Mie Ayam Bakso Urat', 'category' => 'Makanan', 'price' => 14000, 'stall_name' => 'Stand 2 Pak Joko'],
            ['name' => 'Nasi Ayam Geprek Sambal Bawang', 'category' => 'Makanan', 'price' => 13000, 'stall_name' => 'Stand 3 Mbak Rini'],
            ['name' => 'Es Teh Manis Jumbo', 'category' => 'Minuman', 'price' => 3000, 'stall_name' => 'Stand 1 Bu Titin'],
            ['name' => 'Jus Buah Segar (Alpukat/Mangga)', 'category' => 'Minuman', 'price' => 8000, 'stall_name' => 'Stand 4 Bar Minuman'],
            ['name' => 'Gorengan Tempe / Bakwan (3 Pcs)', 'category' => 'Snack', 'price' => 5000, 'stall_name' => 'Stand 1 Bu Titin'],
        ];
        foreach ($menus as $m) {
            KantinMenu::firstOrCreate(['name' => $m['name']], $m);
        }
    }
}
