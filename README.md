# 🏫 Ekosistem Sekolah - Full Stack Application Setup

Setup arsitektur dan sistem full-stack untuk **Ekosistem Sekolah**, menghubungkan seluruh civitas akademika (Siswa, Guru, Petugas TU, Koperasi Siswa / Kopsis, Kepala Sekolah / Kepsek, dan Kantin Sekolah).

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite + TypeScript (TSX) + React Router v7 + Axios + Lucide Icons
- **Backend**: Laravel 12 (PHP 8.3) RESTful API + Laravel Sanctum Token Authentication
- **Database**: MySQL 8.4 via Laragon & phpMyAdmin (`http://localhost/phpmyadmin`)

---

## 📂 Struktur Proyek

```
C:\laragon\www\ekosistem-sekolah\
├── backend\                           # Aplikasi Backend Laravel 12
│   ├── app\
│   │   ├── Http\
│   │   │   ├── Controllers\Api\       # AuthController, RoleController, SchoolEcosystemController
│   │   │   └── Middleware\            # CheckRole.php
│   │   └── Models\                    # User, Role, Permission, AcademicClass, Announcement, KopsisProduct, KantinMenu
│   ├── database\
│   │   ├── migrations\                # Migrations untuk roles, permissions, users, classes, kopsis, kantin
│   │   └── seeders\DatabaseSeeder.php # Seeder akun demo semua role, data rombel, kopsis & kantin
│   ├── routes\api.php                 # Rute RESTful API sistem sekolah
│   └── run-backend.bat                # Shortcut jalankan backend (port 8000)
│
├── frontend\                          # Aplikasi Frontend React Vite TSX
│   ├── src\
│   │   ├── api\client.ts              # Axios HTTP client dengan Bearer token interceptor
│   │   ├── context\AuthContext.tsx    # State autentikasi & Role Preview Switcher
│   │   ├── types\auth.ts              # Interface User, RoleName, badge styling
│   │   ├── components\layout\         # Navbar, Sidebar (role navigation), Layout
│   │   ├── views\                     # Modul per role:
│   │   │   ├── OverviewView.tsx       # Ringkasan sistem & pengumuman
│   │   │   ├── SiswaView.tsx          # Jadwal, nilai, absensi, saldo digital
│   │   │   ├── GuruView.tsx           # Jadwal mengajar, absensi, input nilai
│   │   │   ├── KepsekView.tsx         # KPI eksekutif, akreditasi, keuangan
│   │   │   ├── PetugasView.tsx        # Buku induk, SPP, administrasi TU
│   │   │   ├── KopsisView.tsx         # Kasir POS, stok barang ATK/seragam
│   │   │   ├── KantinView.tsx         # Menu makanan sehat & antrean pesanan
│   │   │   ├── AdminView.tsx          # Manajemen user & ganti role real-time
│   │   │   └── LoginView.tsx          # Login dengan tombol 1-Click Demo untuk semua role
│   │   └── App.tsx                    # Routing & protected routes
│   └── run-frontend.bat               # Shortcut jalankan frontend (port 5173)
│
├── run-dev.bat                        # 1-Click Runner: jalankan backend & frontend bersamaan
└── README.md                          # Dokumentasi lengkap setup ini
```

---

## 👥 Daftar Akun Demo (Semua Role Terdaftar di MySQL)

Semua akun menggunakan kata sandi default: **`password123`**

| Role | Nama Pengguna | Email | Deskripsi Peran |
| :--- | :--- | :--- | :--- |
| **Admin** | Super Administrator | `admin@sekolah.test` | Akses penuh sistem, role switcher, dan audit |
| **Kepsek** | Dr. H. Soekarno, M.Pd | `kepsek@sekolah.test` | Laporan eksekutif, KPI kehadiran, pengawasan |
| **Guru** | Budi Santoso, S.Pd | `guru@sekolah.test` | Jadwal mengajar, rombel kelas, penilaian siswa |
| **Siswa** | Ahmad Pratama | `siswa@sekolah.test` | Jadwal pelajaran, presensi, saldo kopsis & kantin |
| **Petugas TU**| Siti Aminah, S.AP | `petugas@sekolah.test`| Administrasi surat, buku induk, SPP, sarpras |
| **Kopsis** | Rudi Hermawan | `kopsis@sekolah.test` | POS kasir koperasi, stok seragam & ATK |
| **Kantin** | Ibu Titin | `kantin@sekolah.test` | Menu makanan/minuman, pesanan siswa, omset |

> *Tip: Pada halaman login di frontend (`http://localhost:5173/login`), terdapat tombol cepat (1-Click Demo Login) untuk setiap role di atas sehingga tidak perlu mengetik manual saat pengujian.*

---

## 🚀 Cara Menjalankan Project

### 1. Pastikan MySQL di Laragon Sudah Berjalan
- Buka aplikasi **Laragon** di komputer Anda.
- Klik tombol **"Start All"** (memastikan MySQL aktif di port 3306 dan Apache/Nginx aktif).
- Cek phpMyAdmin di browser: [http://localhost/phpmyadmin](http://localhost/phpmyadmin).
  - Database **`ekosistem_sekolah`** sudah dibuat dan ter-seeder.

### 2. Jalankan Server Development (Frontend + Backend)
Cukup **klik ganda (double click)** file:
```
C:\laragon\www\ekosistem-sekolah\run-dev.bat
```
Atau jalankan manual melalui terminal:

**Terminal 1 (Backend):**
```powershell
cd C:\laragon\www\ekosistem-sekolah\backend
php artisan serve --port=8000
```
Backend API aktif di: `http://localhost:8000/api`

**Terminal 2 (Frontend):**
```powershell
cd C:\laragon\www\ekosistem-sekolah\frontend
npm run dev
```
Frontend Web aktif di: `http://localhost:5173`

---

## 🔄 Fitur Khusus: Role Preview Switcher
Sesuai dengan instruksi Anda bahwa saat ini tahap fokus pada **arsitektur sistem** dan **semua role & semua akses terbuka**:
- Pengguna yang masuk dapat melihat modul seluruh role via Sidebar.
- Di bagian atas navbar terdapat dropdown **"Preview Akses Sebagai"** untuk beralih perspektif secara real-time antar role tanpa perlu logout.
- Pada halaman **Portal Admin**, terdapat tabel pengguna di mana admin dapat mengubah role pengguna mana pun secara langsung (tersimpan ke database MySQL).

---

## 🗄️ Menambah Role Baru (Ekstensibilitas)
Untuk menambahkan role baru (misal `satpam`, `perpustakaan`, `bk`, `wali_murid`):
1. Tambahkan baris di database seeder `backend/database/seeders/DatabaseSeeder.php` pada array `$rolesData`.
2. Role otomatis memiliki entri di tabel `roles` MySQL dan relasi ke `users`.
3. Middleware `CheckRole` di backend siap menerima role apa pun: `Route::middleware('role:nama_role')->...`.
