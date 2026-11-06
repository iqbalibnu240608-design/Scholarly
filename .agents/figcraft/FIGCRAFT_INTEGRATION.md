# Integrasi FigCraft & Ekspor Desain SteelSchool

Dokumen ini menjelaskan status koneksi, arsitektur integrasi, serta artefak desain SteelSchool yang diekspor ke FigCraft.

---

## 1. Status Koneksi FigCraft

- **Status**: **TERHUBUNG SEPENUHNYA (Fully Connected & Synchronized)**
- **Aplikasi**: FigCraft v0.15.1 (`D:\figcraft.exe`)
- **Protokol Kontrol**: TCP JSON-RPC Loopback (`127.0.0.1:7979`)
- **Parameter CLI**: `figcraft.exe --control 7979`
- **Konfigurasi MCP**:
  - Konfigurasi Sistem: `C:\Users\Hype\.gemini\config\mcp_config.json`
  - Konfigurasi Project: `.agents/mcp_config.json`

### Perintah Engine yang Didukung:
- `file.new`: Membuat kanvas/dokumen baru.
- `file.open`: Membuka file desain (`path`, `reload`).
- `file.import`: Mengimpor layer vektor SVG / gambar ke dalam kanvas aktif.
- `file.saveAs`: Menyimpan dokumen kerja ke format biner native FigCraft (`.figcraft`).
- `file.export`: Mengekspor kanvas aktif ke PNG beresolusi tinggi.
- `view.get`: Mengambil status viewport, zoom, dan bounding box objek.

---

## 2. File Desain yang Tersedia

Seluruh file desain tersimpan di folder `design-exports/`:

| Nama File | Format | Deskripsi |
| :--- | :--- | :--- |
| `steelschool-full-design.figcraft` | Native FigCraft Project (`.figcraft`) | Proyek FigCraft multi-artboard lengkap berisi Landing Page & Dashboard Portal. Dapat diedit langsung per layer di FigCraft. |
| `steelschool-landing-page.svg` | Vector SVG (1440 x 2150) | Artboard Landing Page sesuai gaya referensi **Novus** (Navbar, Hero Section, 3D Tablet Hub, Metric Cards, 6 Role Simulation, Footer). |
| `steelschool-dashboard.svg` | Vector SVG (1440 x 1024) | Artboard Dashboard Portal sesuai gaya referensi **Flowize AI** & **NexaAdmin** (Sidebar navigasi, Hero Banner selamat datang, 4 KPI cards, Jadwal & Presensi, Transaksi Cashless). |
| `figcraft-landing-preview.png` | Raster Render (PNG) | Hasil render langsung dari engine FigCraft untuk kanvas Landing Page. |
| `figcraft-render-preview.png` | Raster Render (PNG) | Hasil render langsung dari engine FigCraft untuk kanvas Dashboard Portal. |

---

## 3. Cara Membuka & Mengedit di FigCraft

### Opsi A: Buka File Langsung via GUI / Shortcut
Cukup jalankan perintah berikut atau klik ganda file di File Explorer:
```cmd
"D:\figcraft.exe" "C:\laragon\www\ekosistem-sekolah\design-exports\steelschool-full-design.figcraft"
```

### Opsi B: Buka via TCP JSON-RPC (Automasi AI / Script)
Kirim payload JSON berikut ke port `7979`:
```json
{
  "id": 1,
  "method": "engine.execute",
  "params": {
    "command": "file.open",
    "params": {
      "path": "C:/laragon/www/ekosistem-sekolah/design-exports/steelschool-full-design.figcraft"
    }
  }
}
```
