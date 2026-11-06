# Git Branching & Push Policy — SteelSchool

> **Dokumen**: Kebijakan Branching & Tata Kelola Push Repositori  
> **Status**: Wajib Dipatuhi oleh Seluruh Anggota Tim & AI Assistant  
> **Lokasi File**: `.agents/rules/GIT_BRANCHING_POLICY.md`

---

## 1. Tujuan Kebijakan

Kebijakan ini dibuat agar seluruh anggota tim pengembang dan asisten AI yang bekerja di repositori ini memiliki pemahaman yang sama mengenai:
1. Pemisahan branch antara **Production** dan **Development**.
2. Perlindungan branch **Production** agar hanya memuat kode inti aplikasi (`frontend/` dan `backend/`).
3. Pemeliharaan sistem instruksi `.agents/` di branch **Development** agar rekan tim yang melakukan *clone* dapat langsung memberikan instruksi ke asisten AI masing-masing sesuai perannya (misal: Backend murni).
4. Pencegahan salah push (*accidental push*) lintas branch maupun pelanggaran batas peran (*role boundary violations*).

---

## 2. Struktur & Fungsi Branch

### A. Branch `production` (dan `productions`)
* **Fungsi**: Lingkungan rilis produksi yang stabil dan bersih (*Clean Production Build*).
* **Konten yang Diizinkan**:
  - `frontend/` (Kode sumber antarmuka pengguna)
  - `backend/` (Kode sumber server dan API)
  - File root standar: `.gitignore`, `README.md`, `run-dev.bat`
* **ATURAN MUTLAK**:
  - **DILARANG KERAS** menyertakan atau melakukan push folder `.agents/` ke branch `production`. Folder `.agents/` adalah lingkungan sistem operasi AI internal tim dan tidak boleh dipublikasikan ke production.
  - Jangan melakukan commit harian langsung di `production`. Seluruh pembaruan ke `production` hanya boleh melalui merge atau pull request dari `development` setelah diuji.

### B. Branch `development`
* **Fungsi**: Branch kolaborasi aktif utama untuk seluruh tim pengembang dan integrasi AI.
* **Konten yang Diizinkan**:
  - Seluruh kode aplikasi (`frontend/`, `backend/`, root files).
  - **Seluruh sistem instruksi dan pengetahuan `.agents/`** (termasuk rules, workflow, PRD, architecture, skills, dan design references).
* **Alur Kerja Anggota Tim Baru**:
  1. Clone repositori:
     ```bash
     git clone https://github.com/iqbalibnu240608-design/Scholarly.git
     cd Scholarly
     ```
  2. Pindah ke branch `development`:
     ```bash
     git checkout development
     ```
  3. Seluruh instruksi `.agents/` otomatis tersedia di komputer lokal rekan tim dan siap dibaca oleh AI yang mereka gunakan.

---

## 3. Instruksi Khusus Rekan Tim Backend (BE)

Saat rekan tim bertugas mengerjakan sisi **Backend**, berikan prompt instruksi berikut kepada AI mereka:

```markdown
PROMPT UNTUK AI REKAN TIM (ROLE: BACKEND):

"Baca dan patuhi seluruh aturan di .agents/AGENTS.md, .agents/WORKFLOW.md, dan .agents/rules/ROLE_BOUNDARIES.md.
Peran saya dalam sesi ini adalah BACKEND (BE) murni.
Batasan ketat:
1. Kerjakan HANYA file di folder backend/ (API routes, Controllers, Models, Migrations, Seeders, Services, Tests).
2. DILARANG KERAS menyentuh atau mengedit file di folder frontend/ (UI, styling, React components, client routing).
3. Jika membutuhkan data baru untuk frontend, komunikasikan kontrak API di .agents/architecture/API_CONTRACTS.md.
4. Lakukan commit dan push HANYA ke branch development atau feature branch (e.g. feat/be-xxx). JANGAN pernah push langsung ke production."
```

### Tabel Batasan Folder per Role:
| Folder / Layer | Anggota Tim Backend (BE) | Anggota Tim Frontend (FE) |
| :--- | :---: | :---: |
| `backend/**` | ✅ **Boleh Disentuh** | ❌ **DILARANG KERAS** |
| `frontend/**` | ❌ **DILARANG KERAS** | ✅ **Boleh Disentuh** |
| `.agents/architecture/` | 📝 Koordinasi Kontrak API | 📝 Koordinasi Kontrak API |
| `.agents/project/` | 👁️ Baca Konteks & Requirements | 👁️ Baca Konteks & Requirements |

---

## 4. Checklist Wajib Sebelum Push (Push Checklist)

Sebelum menjalankan perintah `git push`, setiap anggota tim dan AI wajib melakukan verifikasi berikut:

1. **Periksa Branch Aktif**:
   ```bash
   git branch --show-current
   ```
   Pastikan Anda berada di `development` atau branch fitur Anda (`feat/...`), **BUKAN** di `production`.

2. **Periksa File yang Berubah**:
   ```bash
   git status
   ```
   Pastikan tidak ada file di luar batasan peran yang ikut ter-stage (misal: jika tugas BE, pastikan tidak ada file `frontend/` yang berubah).

3. **Verifikasi Pesan Commit**:
   Gunakan format Conventional Commits:
   - `feat(backend): implement wallet topup transaction logic`
   - `fix(backend): correct attendance cut-off calculation`
   - `feat(frontend): add responsive role selector cards`
   - `chore(agents): update api contracts and documentation`

4. **Larangan Force Push**:
   - **JANGAN PERNAH** menjalankan `git push -f` atau `git push --force` ke branch `development` maupun `production`.

---

## 5. Ringkasan Perintah Git

```bash
# Memastikan berada di branch development
git checkout development
git pull origin development

# Membuat branch fitur baru untuk Backend
git checkout -b feat/be-database-migrations

# Melakukan commit pekerjaan
git add backend/
git commit -m "feat(backend): execute pending migrations and seeds"

# Mengirim branch ke remote repository
git push -u origin feat/be-database-migrations
# Atau jika langsung di development (sesuai persetujuan tim):
# git push origin development
```
