# 🚀 Panduan Penggunaan Postman - Scholarly API

Folder ini berisi file konfigurasi Postman yang sudah **100% siap pakai** untuk menguji seluruh endpoint backend Laravel tanpa perlu menyalin token secara manual!

---

## 📁 Berkas yang Tersedia
1. **`Scholarly_API.postman_collection.json`**  
   Koleksi lengkap seluruh endpoint backend (Auth, Siswa, Guru, TU, Kantin, Kopsis, Perpustakaan, Satpam, Admin).
2. **`Scholarly_Local.postman_environment.json`**  
   Variabel environment lokal (`base_url`, `auth_token`, kredensial login default untuk tiap role).

---

## ⚡ Cara Pakai (Hanya 3 Langkah Cepat)

### Langkah 1: Buka Postman & Import
1. Buka aplikasi **Postman**.
2. Klik tombol **Import** (di pojok kiri atas jendela Postman).
3. Tarik (*drag & drop*) kedua file berikut sekaligus:
   * `Scholarly_API.postman_collection.json`
   * `Scholarly_Local.postman_environment.json`

### Langkah 2: Pilih Environment
1. Di pojok kanan atas jendela Postman, klik dropdown **No Environment**.
2. Pilih **`Scholarly - Local Environment`**.

### Langkah 3: Eksekusi Request (Token Otomatis Tersimpan!)
1. Buka folder **`01. Authentication & Role Switcher`**.
2. Klik request **`Login Admin`** atau **`Login Siswa`** atau **`Login Guru`**, lalu klik tombol **Send**.
3. **Selesai!** Token otentikasi Sanctum otomatis tersimpan ke variabel `{{auth_token}}`.
4. Anda sekarang dapat langsung menjalankan request di folder mana pun (**Modul Kantin, Perpustakaan, Kasir POS, Nilai Guru, TU, dll.**) tanpa perlu memasukkan header Authorization secara manual.

---

## 🛡️ Daftar Akun Uji Coba Default

| Peran (Role) | Identifier / NISN / Email | Kata Sandi (Password) |
| :--- | :--- | :--- |
| **Super Admin** | `admin@sekolah.test` | `admin123` |
| **Siswa (Ahmad Pratama)** | `0061234567` | `password123` |
| **Guru (Budi Santoso)** | `guru@sekolah.test` | `password123` |
| **Petugas TU (Siti Aminah)** | `petugas@sekolah.test` | `password123` |
| **Kantin (Ibu Titin)** | `kantin@sekolah.test` | `password123` |
| **Kopsis (Rudi Hermawan)** | `kopsis@sekolah.test` | `password123` |
| **Perpus (Dewi Lestari)** | `perpus@sekolah.test` | `password123` |
| **Satpam (Joko Widodo)** | `satpam@sekolah.test` | `password123` |
| **Kepsek (Dr. Soekarno)** | `kepsek@sekolah.test` | `password123` |

---

## 💡 Fitur Unggulan di Koleksi Ini
* **Auto-Token Capture**: Setiap kali Anda menekan `Send` pada request Login atau Switch Role, script pengujian secara otomatis menangkap Bearer token dan menyimpannya di environment.
* **Inherited Auth**: Seluruh 30+ request di sub-folder otomatis mewarisi token dari koleksi induk (`Bearer {{auth_token}}`).
* **Payload Lengkap**: Semua endpoint `POST` (seperti tambah buku, bayar SPP, input nilai, checkout kantin) sudah terisi contoh data JSON yang valid dan siap dikirim.
