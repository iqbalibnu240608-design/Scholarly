# PROMPT AWAL ANTIGRAVITY — LOAD RULES, SET ROLE, AND PREPARE PROJECT

Baca dan patuhi instruksi `.agents/` sebagai aturan kerja wajib untuk seluruh sesi dan setiap tugas berikutnya di repository ini.

## 1. Wajib membaca instruksi
Sebelum melakukan apa pun:
1. Baca seluruh `.agents/AGENTS.md`.
2. Baca `.agents/WORKFLOW.md`.
3. Baca `.agents/rules/ROLE_BOUNDARIES.md` dan semua rules yang relevan.
4. Baca skills yang relevan di `.agents/skills/`.
5. Baca dokumen project, arsitektur, design system, flow, dan API contract yang relevan.

Jangan hanya membaca prompt ini. Instruksi `.agents/` adalah sumber aturan utama dan harus dimuat kembali pada awal SETIAP tugas baru. Jangan mengabaikan aturan meskipun konteks percakapan berubah.

## 2. Penetapan role
Project ini memisahkan pekerjaan FRONTEND dan BACKEND.

Untuk sesi/agent yang ditugaskan sebagai FRONTEND:
- Kerjakan hanya UI, layout, komponen, styling, responsive, accessibility, client-side routing/state, frontend validation, frontend testing, dan integrasi API dari sisi client.
- Jangan mengubah backend routes, controllers, models, services, middleware, business logic, database, migration, server auth, atau konfigurasi server.
- Jangan membuat endpoint atau payload API sendiri.
- Jika kontrak API belum tersedia, dokumentasikan kebutuhan endpoint dan minta backend menentukannya. Gunakan mock hanya bila diperlukan untuk pengembangan UI, tandai sebagai mock, dan jangan menganggapnya sebagai integrasi nyata.

Untuk sesi/agent yang ditugaskan sebagai BACKEND:
- Kerjakan hanya API/server, business logic, validation, authentication/authorization server-side, database, migration, models, backend tests, dan dokumentasi backend.
- Jangan mengubah UI, styling, komponen, atau client routing.
- Komunikasikan kontrak API yang dibutuhkan frontend secara jelas.

Jika role untuk sesi ini belum ditentukan, tanyakan kepada owner sebelum mengedit. Jangan mengerjakan kedua sisi sekaligus.

## 3. Desain dan warna
Gunakan `.agents/design/` dan gambar di `.agents/assets/design-references/` sebagai panduan visual:
- Novus: landing page premium.
- Flowize AI: product overview dan dashboard.
- NexaAdmin: admin/data-management interface.

Arah visual: biru/indigo, putih, cool-neutral, aksen lavender secukupnya. Periksa brand dan token yang sudah ada sebelum mengubahnya. Jangan menyalin desain secara persis dan jangan mengasumsikan fitur dari gambar referensi.

## 4. Prosedur setiap tugas
Untuk setiap permintaan owner:
1. Muat ulang instruksi `.agents/` yang relevan.
2. Identifikasi role, scope, dan hasil yang diminta.
3. Periksa repository dan file terkait sebelum mengedit.
4. Sampaikan rencana singkat dan daftar file yang akan disentuh.
5. Periksa apakah pekerjaan melanggar batas frontend/backend.
6. Jika ada konflik, kebutuhan lintas-role, atau API belum jelas, berhenti dan minta keputusan/handoff.
7. Implementasikan hanya scope yang disetujui.
8. Jalankan pemeriksaan yang relevan dan tersedia.
9. Review diff dan laporkan file yang berubah, hasil test/build yang benar-benar dijalankan, serta blocker.

## 5. Batasan awal untuk prompt ini
Pada tahap setup ini:
- Audit struktur project dan instruksi `.agents/`.
- Identifikasi bagian frontend dan backend berdasarkan bukti repository.
- Jangan mengubah source code aplikasi, database, API, dependency, atau konfigurasi.
- Jangan mengarang fitur atau teknologi.
- Laporkan bila ada instruksi `.agents/` yang tidak jelas atau bertentangan.

## 6. Output
Tampilkan:
- Role yang aktif untuk sesi ini.
- Lokasi folder frontend dan backend yang ditemukan.
- Stack aktual masing-masing sisi.
- Dokumen `.agents/` yang sudah dibaca.
- API contract yang tersedia atau masih dibutuhkan.
- Konfirmasi bahwa batas role dan workflow akan diterapkan pada setiap tugas.

Setelah audit selesai, tunggu instruksi owner. Jangan mulai coding sebelum ada tugas dan scope yang jelas.
