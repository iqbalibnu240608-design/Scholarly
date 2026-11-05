<?php

namespace Database\Seeders;

use App\Models\AcademicClass;
use App\Models\Announcement;
use App\Models\Attendance;
use App\Models\Grade;
use App\Models\KantinMenu;
use App\Models\KopsisProduct;
use App\Models\Permission;
use App\Models\Role;
use App\Models\Schedule;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

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
            [
                'name' => 'perpustakaan',
                'display_name' => 'Petugas Perpustakaan',
                'description' => 'Peminjaman dan katalog buku perpustakaan.',
            ],
            [
                'name' => 'security',
                'display_name' => 'Petugas Keamanan / Satpam',
                'description' => 'Presensi gerbang utama, verifikasi kartu RFID/NIS, dan izin dispensasi keluar.',
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
            ['name' => 'manage_users', 'display_name' => 'Kelola Pengguna', 'module' => 'system'],
            ['name' => 'manage_roles', 'display_name' => 'Kelola Role & Akses', 'module' => 'system'],
            ['name' => 'view_audit_log', 'display_name' => 'Lihat Audit Log', 'module' => 'system'],
            ['name' => 'manage_curriculum', 'display_name' => 'Kelola Kurikulum & Mapel', 'module' => 'academic'],
            ['name' => 'input_grades', 'display_name' => 'Input Nilai Siswa', 'module' => 'academic'],
            ['name' => 'view_grades', 'display_name' => 'Lihat Nilai', 'module' => 'academic'],
            ['name' => 'manage_attendance', 'display_name' => 'Kelola Presensi Siswa', 'module' => 'academic'],
            ['name' => 'view_executive_reports', 'display_name' => 'Lihat Laporan Eksekutif', 'module' => 'executive'],
            ['name' => 'approve_budget', 'display_name' => 'Persetujuan Anggaran', 'module' => 'executive'],
            ['name' => 'manage_student_registry', 'display_name' => 'Kelola Buku Induk Siswa', 'module' => 'administration'],
            ['name' => 'manage_tu_fees', 'display_name' => 'Kelola Tagihan SPP', 'module' => 'administration'],
            ['name' => 'manage_correspondence', 'display_name' => 'Kelola Surat & Dokumen', 'module' => 'administration'],
            ['name' => 'manage_kopsis_inventory', 'display_name' => 'Kelola Stok Kopsis', 'module' => 'kopsis'],
            ['name' => 'kopsis_pos_checkout', 'display_name' => 'Kasir Transaksi Kopsis', 'module' => 'kopsis'],
            ['name' => 'manage_canteen_menu', 'display_name' => 'Kelola Menu Kantin', 'module' => 'kantin'],
            ['name' => 'process_canteen_orders', 'display_name' => 'Proses Pesanan Kantin', 'module' => 'kantin'],
            ['name' => 'manage_gate_attendance', 'display_name' => 'Presensi Gerbang & RFID', 'module' => 'security'],
            ['name' => 'verify_exit_permit', 'display_name' => 'Verifikasi Dispensasi Keluar', 'module' => 'security'],
        ];

        foreach ($permissionsData as $perm) {
            Permission::updateOrCreate(['name' => $perm['name']], $perm);
        }

        // 3. Academic Classes Seed
        $classesData = [
            ['name' => 'X RPL 1', 'grade' => '10', 'major' => 'Rekayasa Perangkat Lunak'],
            ['name' => 'XI RPL 1', 'grade' => '11', 'major' => 'Rekayasa Perangkat Lunak'],
            ['name' => 'XII RPL 1', 'grade' => '12', 'major' => 'Rekayasa Perangkat Lunak'],
            ['name' => 'X TKJ 1', 'grade' => '10', 'major' => 'Teknik Komputer & Jaringan'],
            ['name' => 'XI TKJ 1', 'grade' => '11', 'major' => 'Teknik Komputer & Jaringan'],
        ];
        $classes = [];
        foreach ($classesData as $cls) {
            $classes[$cls['name']] = AcademicClass::updateOrCreate(['name' => $cls['name']], $cls);
        }

        // 4. Demo Users for Every Role (NISN & Admin Password Ready)
        $usersData = [
            [
                'name' => 'Super Administrator',
                'email' => 'admin@sekolah.test',
                'role_name' => 'admin',
                'identifier_number' => 'admin',
                'password' => 'admin123',
                'phone' => '081234567890',
                'gender' => 'L',
                'class' => null,
            ],
            [
                'name' => 'Dr. H. Soekarno, M.Pd',
                'email' => 'kepsek@sekolah.test',
                'role_name' => 'kepsek',
                'identifier_number' => '197001011995031001',
                'password' => 'password123',
                'phone' => '081234567891',
                'gender' => 'L',
                'class' => null,
            ],
            [
                'name' => 'Budi Santoso, S.Pd',
                'email' => 'guru@sekolah.test',
                'role_name' => 'guru',
                'identifier_number' => '198503152010011002',
                'password' => 'password123',
                'phone' => '081234567892',
                'gender' => 'L',
                'class' => null,
            ],
            [
                'name' => 'Ahmad Pratama',
                'email' => 'siswa@sekolah.test',
                'role_name' => 'siswa',
                'identifier_number' => '0061234567', // NISN Siswa 1
                'password' => 'password123',
                'phone' => '081234567893',
                'gender' => 'L',
                'class' => 'XII RPL 1',
            ],
            [
                'name' => 'Siti Rahmawati',
                'email' => 'rahma@sekolah.test',
                'role_name' => 'siswa',
                'identifier_number' => '0089876543', // NISN Siswa 2
                'password' => 'password123',
                'phone' => '081234567899',
                'gender' => 'P',
                'class' => 'XII RPL 1',
            ],
            [
                'name' => 'Siti Aminah, S.AP',
                'email' => 'petugas@sekolah.test',
                'role_name' => 'petugas',
                'identifier_number' => '199008202015022003',
                'password' => 'password123',
                'phone' => '081234567894',
                'gender' => 'P',
                'class' => null,
            ],
            [
                'name' => 'Rudi Hermawan (Kopsis)',
                'email' => 'kopsis@sekolah.test',
                'role_name' => 'kopsis',
                'identifier_number' => 'KOP-2026',
                'password' => 'password123',
                'phone' => '081234567895',
                'gender' => 'L',
                'class' => null,
            ],
            [
                'name' => 'Ibu Titin (Kantin)',
                'email' => 'kantin@sekolah.test',
                'role_name' => 'kantin',
                'identifier_number' => 'KTN-01',
                'password' => 'password123',
                'phone' => '081234567896',
                'gender' => 'P',
                'class' => null,
            ],
            [
                'name' => 'Joko Widodo (Satpam Gerbang)',
                'email' => 'satpam@sekolah.test',
                'role_name' => 'security',
                'identifier_number' => 'SEC-01',
                'password' => 'password123',
                'phone' => '081234567897',
                'gender' => 'L',
                'class' => null,
            ],
            [
                'name' => 'Dewi Lestari (Perpus)',
                'email' => 'perpus@sekolah.test',
                'role_name' => 'perpustakaan',
                'identifier_number' => 'LIB-01',
                'password' => 'password123',
                'phone' => '081234567898',
                'gender' => 'P',
                'class' => null,
            ],
        ];

        $users = [];
        foreach ($usersData as $u) {
            $role = $roles[$u['role_name']] ?? null;
            $classId = isset($u['class']) && isset($classes[$u['class']]) ? $classes[$u['class']]->id : null;

            $users[$u['role_name']] = User::updateOrCreate(
                ['identifier_number' => $u['identifier_number']],
                [
                    'name' => $u['name'],
                    'email' => $u['email'] ?? null,
                    'password' => Hash::make($u['password']),
                    'role_id' => $role?->id,
                    'role_name' => $u['role_name'],
                    'academic_class_id' => $classId,
                    'identifier_number' => $u['identifier_number'],
                    'phone' => $u['phone'],
                    'gender' => $u['gender'],
                    'status' => 'active',
                ]
            );
        }

        // Set Wali Kelas XII RPL 1 = Guru Budi Santoso
        if (isset($classes['XII RPL 1']) && isset($users['guru'])) {
            $classes['XII RPL 1']->update(['homeroom_teacher_id' => $users['guru']->id]);
        }

        // 5. Initial Wallets (Dompet Digital Siswa)
        $studentAhmad = User::where('identifier_number', '0061234567')->first();
        if ($studentAhmad) {
            Wallet::updateOrCreate(
                ['user_id' => $studentAhmad->id],
                ['balance_kopsis' => 125000, 'balance_kantin' => 65000]
            );
        }

        $studentSiti = User::where('identifier_number', '0089876543')->first();
        if ($studentSiti) {
            Wallet::updateOrCreate(
                ['user_id' => $studentSiti->id],
                ['balance_kopsis' => 80000, 'balance_kantin' => 45000]
            );
        }

        // 6. Initial Announcements
        $announcements = [
            [
                'title' => 'Selamat Datang di Portal Terpadu SteelSchool',
                'content' => 'Portal ekosistem sekolah SteelSchool kini telah aktif untuk menghubungkan seluruh civitas akademika: Siswa, Guru, TU, Kepala Sekolah, Kopsis, Kantin, dan Satpam.',
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

        // 7. Initial Kopsis Products
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

        // 8. Initial Kantin Menus
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

        // 9. Initial Schedules (Jadwal Pelajaran Kelas XII RPL 1)
        if (isset($classes['XII RPL 1']) && isset($users['guru'])) {
            $classId = $classes['XII RPL 1']->id;
            $teacherId = $users['guru']->id;

            $schedulesData = [
                ['day' => 'Senin', 'time_slot' => '07:30 - 09:00', 'subject_name' => 'Pemrograman Web & Backend Laravel', 'room' => 'Lab RPL 1'],
                ['day' => 'Senin', 'time_slot' => '09:15 - 10:45', 'subject_name' => 'Basis Data MySQL & Arsitektur', 'room' => 'Lab RPL 2'],
                ['day' => 'Senin', 'time_slot' => '11:00 - 12:30', 'subject_name' => 'Bahasa Inggris Kejuruan', 'room' => 'Ruang 12'],

                ['day' => 'Selasa', 'time_slot' => '07:30 - 09:45', 'subject_name' => 'Pemodelan Perangkat Lunak', 'room' => 'Lab RPL 1'],
                ['day' => 'Selasa', 'time_slot' => '10:00 - 12:15', 'subject_name' => 'Pemrograman Berorientasi Objek', 'room' => 'Lab Komputer 2'],

                ['day' => 'Rabu', 'time_slot' => '07:30 - 09:45', 'subject_name' => 'Proyek Kreatif & Kewirausahaan', 'room' => 'Lab RPL 2'],
                ['day' => 'Rabu', 'time_slot' => '10:00 - 11:30', 'subject_name' => 'Pendidikan Pancasila & Kewarganegaraan', 'room' => 'Ruang 12'],

                ['day' => 'Kamis', 'time_slot' => '08:00 - 10:15', 'subject_name' => 'Administrasi Sistem Jaringan & Cloud', 'room' => 'Lab RPL Baru'],
                ['day' => 'Kamis', 'time_slot' => '10:30 - 12:00', 'subject_name' => 'Matematika Terapan', 'room' => 'Ruang 12'],

                ['day' => 'Jumat', 'time_slot' => '07:00 - 08:30', 'subject_name' => 'Bimbingan Konseling & Karakter', 'room' => 'Aula Utama'],
                ['day' => 'Jumat', 'time_slot' => '08:45 - 10:30', 'subject_name' => 'Pendidikan Agama & Budi Pekerti', 'room' => 'Masjid Sekolah'],
            ];

            foreach ($schedulesData as $sch) {
                Schedule::updateOrCreate(
                    [
                        'academic_class_id' => $classId,
                        'day' => $sch['day'],
                        'time_slot' => $sch['time_slot'],
                    ],
                    [
                        'subject_name' => $sch['subject_name'],
                        'teacher_id' => $teacherId,
                        'room' => $sch['room'],
                    ]
                );
            }
        }

        // 10. Initial Attendances (Presensi Gerbang & Kelas)
        if ($studentAhmad && isset($users['security'])) {
            $satpamId = $users['security']->id;

            // Buat rekap presensi 10 hari terakhir
            for ($i = 10; $i >= 0; $i--) {
                $date = Carbon::today()->subDays($i);
                // Lewati hari Minggu (0) dan Sabtu (6)
                if ($date->isWeekend()) {
                    continue;
                }

                $status = ($i === 2) ? 'terlambat' : 'hadir';
                $checkIn = ($status === 'terlambat') ? '07:12:00' : '06:45:00';
                $minsLate = ($status === 'terlambat') ? 12 : 0;
                $note = ($status === 'terlambat') ? 'Terlambat 12 menit.' : 'Tepat Waktu';

                Attendance::updateOrCreate(
                    ['user_id' => $studentAhmad->id, 'date' => $date->toDateString()],
                    [
                        'check_in_time' => $checkIn,
                        'status' => $status,
                        'minutes_late' => $minsLate,
                        'verified_by' => $satpamId,
                        'notes' => $note,
                    ]
                );

                if ($studentSiti) {
                    Attendance::updateOrCreate(
                        ['user_id' => $studentSiti->id, 'date' => $date->toDateString()],
                        [
                            'check_in_time' => '06:50:00',
                            'status' => 'hadir',
                            'minutes_late' => 0,
                            'verified_by' => $satpamId,
                            'notes' => 'Tepat Waktu',
                        ]
                    );
                }
            }
        }

        // 11. Initial Transactions (Kopsis, Kantin, SPP, Topup)
        if ($studentAhmad && isset($users['petugas']) && isset($users['kopsis']) && isset($users['kantin'])) {
            $tuId = $users['petugas']->id;
            $kopId = $users['kopsis']->id;
            $ktnId = $users['kantin']->id;

            // Top-up awal
            Transaction::firstOrCreate(
                ['reference_no' => 'TOPUP-INIT-01'],
                [
                    'user_id' => $studentAhmad->id,
                    'type' => 'topup_kopsis',
                    'amount' => 150000,
                    'payment_method' => 'cash',
                    'description' => 'Top-up saldo awal Kopsis siswa oleh Petugas TU',
                    'operator_id' => $tuId,
                ]
            );

            // Belanja Kopsis
            Transaction::firstOrCreate(
                ['reference_no' => 'KOP-INIT-01'],
                [
                    'user_id' => $studentAhmad->id,
                    'type' => 'purchase_kopsis',
                    'amount' => 25000,
                    'payment_method' => 'wallet',
                    'description' => 'Belanja Kopsis: Buku Tulis Campus x2, Bolpoin Gel Hitam x2',
                    'operator_id' => $kopId,
                ]
            );

            // Belanja Kantin
            Transaction::firstOrCreate(
                ['reference_no' => 'KTN-INIT-01'],
                [
                    'user_id' => $studentAhmad->id,
                    'type' => 'purchase_kantin',
                    'amount' => 15000,
                    'payment_method' => 'wallet',
                    'description' => 'Pesanan Kantin: Nasi Goreng Spesial Telur x1, Es Teh Manis Jumbo x1',
                    'operator_id' => $ktnId,
                ]
            );

            // SPP Bulan Berjalan
            Transaction::firstOrCreate(
                ['reference_no' => 'SPP-INIT-01'],
                [
                    'user_id' => $studentAhmad->id,
                    'type' => 'spp',
                    'amount' => 350000,
                    'payment_method' => 'cash',
                    'description' => 'Pembayaran SPP Bulan ' . Carbon::now()->translatedFormat('F Y') . ' Lunas',
                    'operator_id' => $tuId,
                ]
            );
        }

        // 12. Initial Grades (Penilaian Guru Budi Santoso)
        if ($studentAhmad && isset($users['guru'])) {
            $guruId = $users['guru']->id;

            $gradesData = [
                ['subject' => 'Pemrograman Web & Backend Laravel', 'type' => 'tugas', 'score' => 92, 'feedback' => 'Implementasi API Laravel sangat baik dan terstruktur.'],
                ['subject' => 'Pemrograman Web & Backend Laravel', 'type' => 'uh', 'score' => 88, 'feedback' => 'Memahami arsitektur MVC, database migration, dan routing.'],
                ['subject' => 'Pemrograman Web & Backend Laravel', 'type' => 'pts', 'score' => 95, 'feedback' => 'Hasil ujian tengah semester memuaskan.'],
                ['subject' => 'Basis Data MySQL & Arsitektur', 'type' => 'tugas', 'score' => 85, 'feedback' => 'Normalisasi database 3NF tepat.'],
                ['subject' => 'Basis Data MySQL & Arsitektur', 'type' => 'uh', 'score' => 90, 'feedback' => 'Penggunaan relasi Eloquent dan foreign key rapi.'],
                ['subject' => 'Bahasa Inggris Kejuruan', 'type' => 'tugas', 'score' => 84, 'feedback' => 'Vocabulary teknis software engineering sangat baik.'],
            ];

            foreach ($gradesData as $g) {
                Grade::firstOrCreate(
                    [
                        'student_id' => $studentAhmad->id,
                        'subject_name' => $g['subject'],
                        'type' => $g['type'],
                    ],
                    [
                        'teacher_id' => $guruId,
                        'score' => $g['score'],
                        'feedback' => $g['feedback'],
                    ]
                );
            }
        }
    }
}
