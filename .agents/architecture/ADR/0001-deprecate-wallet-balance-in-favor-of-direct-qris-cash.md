# ADR 0001: Penghapusan Sistem Saldo E-Wallet Akun demi Pembayaran Langsung (Direct Payment) via QRIS & Tunai (Cash)

> **Status**: Diterima & Diimplementasikan (Approved)  
> **Tanggal**: 9 November 2026  
> **Pemilik Keputusan**: Tim Pengembang & Tim Produk SteelSchool  
> **Lingkup**: Backend Core Payment, POS Kasir Kopsis, Kasir Kantin, SPP  

---

## 1. Konteks & Masalah
Sebelumnya, sistem pembayaran Koperasi Siswa (Kopsis) dan Kantin menggunakan model **Saldo E-Wallet Internal**:
1. Siswa/Guru harus mengajukan permohonan isi saldo (Top-up).
2. Petugas Tata Usaha atau Kopsis harus membuka antrean dan memverifikasi permohonan top-up.
3. Setelah saldo bertambah, siswa/guru baru dapat berbelanja di kasir Kopsis atau Stan Kantin.
4. Jika saldo akun kurang dari total belanja, transaksi dibatalkan dengan galat *"Saldo tidak mencukupi"*.

Model ini dinilai oleh tim terlalu rumit, memperlambat proses transaksi di lapangan (terutama saat jam istirahat sekolah yang singkat), serta membebani petugas TU dengan birokrasi verifikasi saldo top-up harian.

---

## 2. Keputusan Arsitektur
Tim memutuskan untuk **menghilangkan kewajiban dan mekanisme saldo e-wallet akun**, dan beralih ke **Direct Payment (Pembayaran Langsung di Tempat)**:
1. **QRIS Langsung (Direct Digital Payment)**: Pembeli memindai QRIS kasir/stan dan membayar secara instan melalui aplikasi m-banking atau e-wallet nasional mana pun (BCA, Mandiri, BRI, GoPay, OVO, Dana, ShopeePay).
2. **Tunai Langsung (Direct Cash Payment)**: Pembeli membayar tunai secara langsung di loket kasir / stan.

---

## 3. Implementasi Backend & Backward Compatibility (Backend Only)
Sesuai aturan batas peran (*Role Boundaries*), perubahan ini diterapkan murni di layer **Backend** tanpa menyenggol file `frontend/`:

1. **`POSController.php` (`/api/kopsis/checkout` & `/api/kantin/checkout`)**:
   - Menghapus pengecekan saldo akun (`$currentBalance < $totalAmount`) dan pemotongan saldo wallet (`$wallet->decrement(...)`).
   - Menerima `payment_method`: `qris`, `cash`, dan fallback `wallet`.
   - Transaksi langsung tercatat dengan status `approved` (lunas).
   - Jika frontend lama masih mengirimkan `payment_method = 'wallet'`, backend secara otomatis memetakannya ke `qris` tanpa memblokir transaksi, sehingga tim Frontend yang sedang berproses tidak mengalami error/breaking changes.

2. **`SchoolEcosystemController.php` (`/api/petugas/spp-payment`)**:
   - Pembayaran SPP tidak lagi memerlukan pemotongan saldo akun. Pembayaran dapat dilakukan via `cash`, `qris`, atau `transfer`.

3. **`WalletController.php` (`/api/wallet/balance`, `/api/wallet/topup`, & `/api/wallet/pending-topups`)**:
   - Endpoint `GET /api/wallet/balance` tetap dipertahankan dan mengembalikan saldo default `0.00` dengan metadata `payment_mode: direct_payment` agar antarmuka frontend yang masih memanggilnya tidak crash (`undefined`).
   - Endpoint `POST /api/wallet/topup` dinonaktifkan dengan status `422` informatif.
   - Endpoint `GET /api/wallet/pending-topups` mengembalikan `total_pending: 0` dan daftar kosong `[]`.
   - Endpoint `POST /api/wallet/topup/{id}/approve` dan `/reject` dinonaktifkan secara aman.

4. **`SchoolEcosystemController.php`**:
   - `getSidebarNotifications`: Counter antrean top-up TU dan pribadi di-set menjadi `0`.
   - `getSiswaData`: Menghapus injeksi saldo awal 50rb/25rb, properti `saldo_digital` mengembalikan `0.00` dengan `is_active: false`.
   - `createUser`: Pendaftaran siswa baru tidak lagi menginjeksi saldo default.

5. **`DatabaseSeeder.php`**:
   - Inisialisasi wallet seluruh akun demo di-set menjadi Rp 0.00.
   - Transaksi contoh demo disesuaikan menggunakan `payment_method` riil (`qris` dan `cash`). Antrean dummy pending top-up yang usang ditiadakan.

---

## 4. Konsekuensi
- **Positif**:
  - Alur kasir jauh lebih cepat, realistis, dan mencerminkan transaksi nyata di sekolah.
  - Beban verifikasi antrean top-up di loket TU berkurang drastis.
  - Zero breaking changes untuk rekan tim Frontend yang sedang mengembangkan UI.
- **Tindak Lanjut Tim Frontend**:
  - Tim Frontend dapat menyederhanakan modal checkout kasir Kopsis dan Kantin menjadi 2 opsi pembayaran langsung: **QRIS** dan **Tunai (Cash)**, serta menghilangkan tombol / alur Top-Up saldo yang tidak lagi diperlukan.
