# 🏫 SteelSchool - Ekosistem Sekolah Terpadu

Platform Ekosistem Sekolah Terpadu modern dan berdaya saing tinggi yang menghubungkan seluruh civitas akademika: **Siswa**, **Guru**, **Petugas TU**, **Koperasi Siswa (Kopsis)**, **Kepala Sekolah (Kepsek)**, dan **Kantin Sekolah**.

Dibangun dengan arsitektur bersih, desain antarmuka modern (Blue & White palette), pengalaman pengguna tanpa _cognitive overload_ (Zero TMI), dan fitur **Role Switcher** instan untuk kebutuhan pengujian maupun kompetisi.

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite + TypeScript (TSX) + React Router v7 + Axios + Lucide Icons
- **Backend**: Laravel 12 (PHP 8.3) RESTful API + Laravel Sanctum Token Authentication
- **Database**: MySQL 8.4 via Laragon & phpMyAdmin (`http://localhost/phpmyadmin`)

---

## 📂 Struktur Proyek

```
C:\laragon\www\ekosistem-sekolah\
├── backend\                           # Aplikasi Backend Laravel 12 (SteelSchool API)
│   ├── app\
│   │   ├── Http\
│   │   │   ├── Controllers\Api\       # AuthController, RoleController, SchoolEcosystemController
│   │   │   └── Middleware\            # CheckRole.php
│   │   └── Models\                    # User, Role, Permission, AcademicClass, Announcement, KopsisProduct, KantinMenu
│   ├── database\
│   │   ├── migrations\                # Migrations untuk roles, permissions, users, classes, kopsis, kantin
│   │   └── seeders\DatabaseSeeder.php # Seeder akun demo semua role, data rombel, kopsis & kantin
│   ├── routes\api.php                 # Rute RESTful API SteelSchool
│   └── run-backend.bat                # Shortcut jalankan backend (port 8000)
│
├── frontend\                          # Aplikasi Frontend React 19 Vite TSX (SteelSchool Web)
│   ├── src\
│   │   ├── api\client.ts              # Axios HTTP client dengan Bearer token interceptor
│   │   ├── context\AuthContext.tsx    # State autentikasi & Role Preview Switcher
│   │   ├── types\auth.ts              # Interface User, RoleName, badge styling
│   │   ├── components\layout\         # Navbar (Brand SteelSchool & Role Switcher), Sidebar
│   │   ├── views\                     # Modul Tampilan:
│   │   │   ├── LandingPageView.tsx    # Landing Page Promosi Sekolah & Showcase Ekosistem
│   │   │   ├── LoginView.tsx          # 16:9 Desktop Playful Login Page (Mockup-grade)
│   │   │   ├── OverviewView.tsx       # Ringkasan sistem & pengumuman
│   │   │   ├── SiswaView.tsx          # Jadwal, nilai, absensi, saldo digital
│   │   │   ├── GuruView.tsx           # Jadwal mengajar, absensi, input nilai
│   │   │   ├── KepsekView.tsx         # KPI eksekutif, akreditasi, keuangan
│   │   │   ├── PetugasView.tsx        # Buku induk, SPP, administrasi TU
│   │   │   ├── KopsisView.tsx         # Kasir POS, stok barang ATK/seragam
│   │   │   ├── KantinView.tsx         # Menu makanan sehat & antrean pesanan
│   │   │   └── AdminView.tsx          # Manajemen user & role assignment real-time
│   │   └── App.tsx                    # Routing & protected routes
│   └── run-frontend.bat               # Shortcut jalankan frontend (port 5173)
│
├── run-dev.bat                        # 1-Click Runner: jalankan backend & frontend bersamaan
└── README.md                          # Dokumentasi lengkap SteelSchool
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

> *Tip: Pada halaman login SteelSchool (`http://localhost:5173/login`), terdapat tombol cepat (1-Click Demo Login) untuk setiap role di atas sehingga penguji tidak perlu mengetik kredensial secara manual.*

---

## 🚀 Cara Menjalankan Project

### 1. Pastikan MySQL di Laragon Sudah Berjalan
- Buka aplikasi **Laragon** di komputer Anda.
- Klik tombol **"Start All"** (memastikan MySQL aktif di port 3306).
- Database **`ekosistem_sekolah`** sudah dibuat dan ter-seeder.

### 2. Jalankan Server Development (Frontend + Backend)
Cukup **klik ganda (double click)** file:
```
C:\laragon\www\ekosistem-sekolah\run-dev.bat
```
Atau jalankan manual melalui terminal:

**Terminal 1 (Backend API):**
```powershell
cd C:\laragon\www\ekosistem-sekolah\backend
php artisan serve --port=8000
```
Backend API aktif di: `http://localhost:8000/api`

**Terminal 2 (Frontend Web):**
```powershell
cd C:\laragon\www\ekosistem-sekolah\frontend
npm run dev
```
Frontend Web aktif di: `http://localhost:5173` (Landing Page) & `http://localhost:5173/login` (Login Page).

---

## 🌟 Fitur Unggulan SteelSchool

1. **Competition-Grade Landing Page (`/`)**:
   - Hero Section dengan CTA ganda ("Eksplorasi Ekosistem" & "Masuk ke Portal").
   - 4-Stat Metric Strip (1.200+ Siswa, 98.4% Kelulusan, Akreditasi A Unggul, 100% Paperless).
   - Interactive 6-in-1 Role Ecosystem Showcase dengan live preview widget interaktif.
   - 3 Program Unggulan (Kurikulum Merdeka Plus, Digital Smart Campus, Pembinaan Karakter & Prestasi).
   - Dynamic CTA Banner & Modern Clean Footer.

2. **16:9 Playful Desktop Login Page (`/login`)**:
   - Background `#F8FAFC` dengan ornamen SVG mengambang (Saturn planet, curved pencil with eraser, lime sparkles, sunbursts).
   - Centered card dengan shadow halus (`shadow-xl shadow-slate-200/60`).
   - Floating label inputs, show/hide password toggle, vibrant blue CTA button (`#1D63FF`).
   - Collapsible **1-Click Demo Quick Login** untuk semua 7 role.

3. **Role Preview Switcher**:
   - Menguji dan mendemokan seluruh role secara langsung dari navbar atas tanpa perlu bolak-balik logout.
   - Portal Admin untuk simulasi penggantian role user secara real-time tersimpan ke MySQL.
