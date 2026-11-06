import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  GraduationCap,
  BookOpen,
  Award,
  FileSpreadsheet,
  ShoppingBag,
  UtensilsCrossed,
  Shield,
  Sparkles,
  CheckCircle2,
  Lock,
  Play,
  Globe,
  Layers,
} from 'lucide-react';
import './LandingPageView.css';

export const LandingPageView: React.FC = () => {
  const [activeRoleTab, setActiveRoleTab] = useState<string>('siswa');

  const roleShowcaseData: Record<
    string,
    {
      title: string;
      roleBadge: string;
      desc: string;
      features: string[];
      demoUser: string;
      widgetTitle: string;
      widgetRows: Array<{ label: string; value: string }>;
    }
  > = {
    siswa: {
      title: 'Portal Siswa Cerdas & Terkoneksi',
      roleBadge: 'Peserta Didik',
      desc: 'Membantu siswa memantau jadwal pelajaran, nilai akademik, rekap kehadiran harian, dan menikmati transaksi cashless di kopsis serta kantin sekolah.',
      features: [
        'Akses jadwal pelajaran & ruang kelas real-time',
        'Saldo digital terintegrasi untuk jajan kantin & belanja ATK',
        'Rekap kehadiran presensi gerbang & status pelunasan SPP transparan',
      ],
      demoUser: 'Ahmad Pratama (XII RPL 1)',
      widgetTitle: 'Ringkasan Portal Siswa',
      widgetRows: [
        { label: 'Jadwal Hari Ini', value: 'Pemrograman Web (Lab 1)' },
        { label: 'Presensi Bulan Ini', value: '98.5% Hadir Tepat Waktu' },
        { label: 'Saldo Kantin & Kopsis', value: 'Rp 170.000' },
        { label: 'Status SPP', value: 'Lunas (November 2026)' },
      ],
    },
    guru: {
      title: 'Portal Guru & Tenaga Pendidik Efisien',
      roleBadge: 'Dewan Guru',
      desc: 'Memangkas beban administrasi manual agar guru dapat fokus membimbing dan memaksimalkan potensi setiap siswa di dalam kelas.',
      features: [
        'Input nilai tugas, PTS, dan PAS langsung dalam hitungan menit',
        'Presensi digital kelas otomatis tersinkron dengan wali murid',
        'Jurnal pengajaran mingguan dan modul bahan ajar terpusat',
      ],
      demoUser: 'Budi Santoso, S.Pd',
      widgetTitle: 'Aktivitas Pengajaran Guru',
      widgetRows: [
        { label: 'Rombel Diampu', value: '3 Kelas (X, XI, XII RPL)' },
        { label: 'Jadwal Mengajar', value: 'Senin, Selasa, Kamis' },
        { label: 'Siswa Dibimbing', value: '108 Peserta Didik' },
        { label: 'Penilaian Semester', value: 'Status Aktif (Terbuka)' },
      ],
    },
    kepsek: {
      title: 'Dashboard Eksekutif Kepala Sekolah',
      roleBadge: 'Kepemimpinan',
      desc: 'Pengambilan keputusan berbasis data akurat (Executive BI) mengenai kehadiran dewan pengajar, prestasi siswa, dan perputaran unit usaha sekolah.',
      features: [
        'Pantauan KPI kehadiran guru & siswa harian secara komprehensif',
        'Laporan analitik keuangan kopsis dan perputaran kantin sekolah',
        'Disposisi persuratan dan pengesahan rapor digital berstandar',
      ],
      demoUser: 'Dr. H. Soekarno, M.Pd',
      widgetTitle: 'Executive KPI Monitor',
      widgetRows: [
        { label: 'Kehadiran Pengajar', value: '98.0% Hari Ini' },
        { label: 'Status Akreditasi', value: 'A (Unggul)' },
        { label: 'Omset Kopsis Bulan Ini', value: 'Rp 14.850.000' },
        { label: 'Evaluasi Semester', value: '92% Tercapai' },
      ],
    },
    petugas: {
      title: 'Tata Usaha & Administrasi Modern',
      roleBadge: 'Administrasi TU',
      desc: 'Otomatisasi buku induk siswa, penerbitan tanda bukti pembayaran SPP, dan pengisian saldo dompet digital siswa secara instan.',
      features: [
        'Pencatatan pelunasan SPP digital dengan struk kuitansi instan',
        'Loket top-up dompet digital siswa (alokasi Kopsis & Kantin)',
        'Sinkronisasi data pokok siswa dan rombongan belajar',
      ],
      demoUser: 'Rina Wulandari, S.AP',
      widgetTitle: 'Layanan Tata Usaha',
      widgetRows: [
        { label: 'Penerimaan SPP Bulan Ini', value: 'Rp 63.000.000' },
        { label: 'Siswa Lunas', value: '312 dari 348 Siswa' },
        { label: 'Top-up E-Wallet Hari Ini', value: 'Rp 4.250.000' },
        { label: 'Status Rekonsiliasi', value: 'Seimbang (Balance)' },
      ],
    },
    kopsis: {
      title: 'Koperasi Siswa (Kopsis) Smart POS',
      roleBadge: 'Unit Usaha Edukasi',
      desc: 'Kasir Point of Sale modern untuk pembelian alat tulis, seragam, dan buku cetak secara cashless dengan pengurangan stok real-time.',
      features: [
        'Checkout instan via scan kartu/input NISN saldo Kopsis',
        'Manajemen stok produk otomatis dengan concurrency protection',
        'Rekap transaksi kasir dan mutasi inventaris harian',
      ],
      demoUser: 'Kasir Koperasi Sekolah',
      widgetTitle: 'Ringkasan Kasir Kopsis',
      widgetRows: [
        { label: 'Katalog Produk Aktif', value: '28 Item Barang' },
        { label: 'Transaksi Hari Ini', value: '47 Transaksi' },
        { label: 'Total Penjualan Hari Ini', value: 'Rp 1.420.000' },
        { label: 'Metode Terbanyak', value: 'E-Wallet Siswa (82%)' },
      ],
    },
    kantin: {
      title: 'Kantin Sehat Sekolah Terpadu',
      roleBadge: 'Unit Usaha Sehat',
      desc: 'Sistem pemesanan makanan dan minuman sehat siswa tanpa uang tunai fisik, menjaga kebersihan makanan dan mencegah kehilangan uang.',
      features: [
        'Pembayaran makanan via Saldo Kantin siswa secara cepat',
        'Manajemen menu makanan/minuman sehat per stand kantin',
        'Bebas antrean panjang dan risiko uang palsu/kembalian',
      ],
      demoUser: 'Pengelola Stand Kantin',
      widgetTitle: 'Aktivitas Kantin Sehat',
      widgetRows: [
        { label: 'Menu Makanan & Minuman', value: '19 Menu Tersedia' },
        { label: 'Pesanan Hari Ini', value: '124 Porsi' },
        { label: 'Perputaran Saldo Kantin', value: 'Rp 2.180.000' },
        { label: 'Stand Kantin Terdaftar', value: '3 Stand Aktif' },
      ],
    },
  };

  const activeRoleData = roleShowcaseData[activeRoleTab] || roleShowcaseData.siswa;

  return (
    <div className="lp-wrapper">
      {/* Decorative Atmosphere Glows (Novus & Flowize Style) */}
      <div className="lp-bg-glow-orb-1" aria-hidden="true" />
      <div className="lp-bg-glow-orb-2" aria-hidden="true" />

      {/* Top Header Navbar */}
      <header className="lp-header">
        <div className="lp-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Link to="/" className="lp-nav-brand">
            <img src="/steelschool-shield.png" alt="SteelSchool" className="lp-nav-brand-logo" />
            <div>
              <div className="lp-nav-brand-title">SteelSchool</div>
              <div className="lp-nav-brand-tagline">Ekosistem Sekolah Terpadu</div>
            </div>
          </Link>

          <nav>
            <ul className="lp-nav-links">
              <li><a href="#hero" className="lp-nav-link">Beranda</a></li>
              <li><a href="#highlights" className="lp-nav-link">Keunggulan</a></li>
              <li><a href="#roles" className="lp-nav-link">Simulasi Peran</a></li>
              <li><a href="#features" className="lp-nav-link">Program</a></li>
            </ul>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link to="/login" className="lp-nav-cta">
              <span>Masuk Portal</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section (Novus + Flowize AI 3D Tablet Showcase) */}
      <section id="hero" className="lp-hero-section">
        <div className="lp-container">
          <div className="lp-hero-grid">
            {/* Left Content */}
            <div>
              <div className="lp-hero-badge">
                <Sparkles size={14} />
                <span>Kompetisi Inovasi Teknologi Pendidikan 2026</span>
              </div>

              <h1 className="lp-hero-title">
                Ekosistem Digital Sekolah{' '}
                <span className="lp-hero-title-highlight">Cerdas & Terpadu</span>
              </h1>

              <p className="lp-hero-desc">
                Satu platform terintegrasi untuk 9 civitas: manajemen akademik, presensi gerbang RFID, unit usaha kopsis & kantin cashless, hingga pemantauan eksekutif pimpinan sekolah.
              </p>

              <div className="lp-hero-buttons">
                <Link to="/login" className="lp-btn-primary">
                  <span>Masuk ke Portal Sekolah</span>
                  <ArrowRight size={18} />
                </Link>

                <a href="#roles" className="lp-btn-secondary">
                  <div className="lp-btn-icon-circle">
                    <Play size={12} style={{ marginLeft: 2 }} />
                  </div>
                  <span>Lihat Simulasi 6 Peran</span>
                </a>
              </div>
            </div>

            {/* Right 3D Tablet Showcase (Novus & Flowize Mockup) */}
            <div className="lp-hero-showcase">
              <div className="lp-showcase-tablet">
                <div className="lp-showcase-header">
                  <div className="lp-showcase-brand">
                    <img src="/steelschool-shield.png" alt="Shield" style={{ width: 24, height: 24 }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>SteelSchool Operational Hub</span>
                  </div>
                  <div className="lp-showcase-badge-active">
                    <span className="lp-showcase-pulse-dot" />
                    <span>Sistem Aktif</span>
                  </div>
                </div>

                <div className="lp-showcase-stats-grid">
                  <div className="lp-mini-stat-card">
                    <div className="lp-mini-stat-label">Total Civitas</div>
                    <div className="lp-mini-stat-val">380+</div>
                  </div>
                  <div className="lp-mini-stat-card">
                    <div className="lp-mini-stat-label">Kehadiran Gerbang</div>
                    <div className="lp-mini-stat-val" style={{ color: '#059669' }}>98.8%</div>
                  </div>
                  <div className="lp-mini-stat-card">
                    <div className="lp-mini-stat-label">Saldo Cashless</div>
                    <div className="lp-mini-stat-val" style={{ color: '#356df3' }}>Aktif</div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', borderRadius: 14, padding: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Layers size={14} className="text-primary" />
                    <span>Alur Ekosistem Waktu-Nyata</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                    ✓ Check-in Gerbang Otomatis via RFID/NISN<br />
                    ✓ Belanja Kopsis & Kantin via Dual-Balance Wallet<br />
                    ✓ Evaluasi Nilai Guru & Rekap SPP Terpusat
                  </div>
                </div>
              </div>

              {/* Floating Cards (Novus Style) */}
              <div className="lp-floating-card-1">
                <div className="lp-floating-icon" style={{ background: '#d1fae5', color: '#059669' }}>
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Presensi Gerbang</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Ahmad P. Hadir 06:45 WIB</div>
                </div>
              </div>

              <div className="lp-floating-card-2">
                <div className="lp-floating-icon" style={{ background: '#e0e7ff', color: '#356df3' }}>
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Kopsis Smart POS</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Transaksi Saldo Sukses</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Partnership Section (Novus / Flowize Logos) */}
      <section className="lp-trust-section">
        <div className="lp-container">
          <div className="lp-trust-label">Standar Integrasi & Kompatibilitas Ekosistem Pendidikan</div>
          <div className="lp-trust-logos-row">
            <div className="lp-trust-logo-item">
              <Globe size={18} />
              <span>Kemendikbudristek Dapodik</span>
            </div>
            <div className="lp-trust-logo-item">
              <Sparkles size={18} />
              <span>Google for Education</span>
            </div>
            <div className="lp-trust-logo-item">
              <Shield size={18} />
              <span>Bank Indonesia QRIS</span>
            </div>
            <div className="lp-trust-logo-item">
              <Lock size={18} />
              <span>ISO 27001 Data Security</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Grid Key Highlights (Flowize AI Style: 10x, 99.8%, 100%, Enterprise) */}
      <section id="highlights" className="lp-highlights-section">
        <div className="lp-container">
          <div className="lp-section-header">
            <span className="lp-section-tag">Efisiensi Maksimal</span>
            <h2 className="lp-section-title">Mengapa Memilih SteelSchool?</h2>
            <p className="lp-section-desc">
              Dirancang untuk mengatasi friksi konvensional di sekolah, dari antrean kasir hingga rekapitulasi penilaian guru.
            </p>
          </div>

          <div className="lp-highlights-grid">
            <div className="lp-highlight-card">
              <div className="lp-highlight-metric">10x</div>
              <div className="lp-highlight-title">Akselerasi Administrasi</div>
              <p className="lp-highlight-text">
                Pemangkasan jam kerja manual rekap rapor, buku induk tata usaha, dan penerbitan kuitansi SPP.
              </p>
            </div>

            <div className="lp-highlight-card">
              <div className="lp-highlight-metric" style={{ color: '#059669' }}>99.8%</div>
              <div className="lp-highlight-title">Akurasi Presensi Gerbang</div>
              <p className="lp-highlight-text">
                Deteksi otomatis waktu check-in satpam dengan kalkulasi menit keterlambatan yang objektif.
              </p>
            </div>

            <div className="lp-highlight-card">
              <div className="lp-highlight-metric" style={{ color: '#7c3aed' }}>100%</div>
              <div className="lp-highlight-title">Cashless Dual-Balance</div>
              <p className="lp-highlight-text">
                Pemisahan ketat saldo belanja Kopsis dan jajan Kantin agar uang saku edukasi siswa terarah.
              </p>
            </div>

            <div className="lp-highlight-card">
              <div className="lp-highlight-metric" style={{ color: '#0284c7' }}>RBAC</div>
              <div className="lp-highlight-title">Keamanan Multi-Peran</div>
              <p className="lp-highlight-text">
                Setiap peran memiliki hak akses terisolasi ketat dengan enkripsi token API berstandar tinggi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Role Simulator (Novus & Flowize Tabs) */}
      <section id="roles" className="lp-roles-section">
        <div className="lp-container">
          <div className="lp-section-header">
            <span className="lp-section-tag">Simulasi 6 Peran Civitas</span>
            <h2 className="lp-section-title">Satu Platform, Pengalaman Spesifik</h2>
            <p className="lp-section-desc">
              Pilih peran di bawah ini untuk melihat bagaimana antarmuka menyesuaikan dengan alur kerja masing-masing pengguna.
            </p>
          </div>

          <div className="lp-role-tabs-nav">
            {[
              { id: 'siswa', label: 'Siswa / Murid', icon: GraduationCap },
              { id: 'guru', label: 'Dewan Guru', icon: BookOpen },
              { id: 'kepsek', label: 'Kepala Sekolah', icon: Award },
              { id: 'petugas', label: 'Tata Usaha (TU)', icon: FileSpreadsheet },
              { id: 'kopsis', label: 'Koperasi Siswa', icon: ShoppingBag },
              { id: 'kantin', label: 'Kantin Sehat', icon: UtensilsCrossed },
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveRoleTab(tab.id)}
                  className={`lp-role-tab-btn ${activeRoleTab === tab.id ? 'active' : ''}`}
                  type="button"
                >
                  <TabIcon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="lp-role-display-card">
            <div>
              <div style={{ display: 'inline-block', padding: '4px 12px', background: '#e0e7ff', color: '#4338ca', borderRadius: 9999, fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
                {activeRoleData.roleBadge}
              </div>
              <h3 className="lp-role-info-title">{activeRoleData.title}</h3>
              <p className="lp-role-info-desc">{activeRoleData.desc}</p>

              <div className="lp-role-features-list">
                {activeRoleData.features.map((feat, idx) => (
                  <div key={idx} className="lp-role-feature-item">
                    <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <Link to="/login" className="lp-btn-primary" style={{ padding: '10px 22px', fontSize: 13 }}>
                <span>Coba Masuk Akun Ini</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="lp-role-preview-widget">
              <div className="lp-widget-header">
                <span>{activeRoleData.widgetTitle}</span>
                <span style={{ color: '#356df3' }}>{activeRoleData.demoUser}</span>
              </div>
              {activeRoleData.widgetRows.map((row, idx) => (
                <div key={idx} className="lp-widget-row">
                  <span className="lp-widget-label">{row.label}</span>
                  <span className="lp-widget-val">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <div className="lp-container">
        <div className="lp-cta-banner">
          <h2 className="lp-cta-title">Siap Mentransformasi Sekolah Anda?</h2>
          <p className="lp-cta-desc">
            Bergabunglah dengan ekosistem digital terpadu untuk efisiensi akademik, transparansi unit usaha, dan kemudahan bagi seluruh civitas.
          </p>
          <Link to="/login" className="lp-btn-primary" style={{ background: '#ffffff', color: '#1e1b4b', fontWeight: 700, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <span>Masuk ke Portal Sekolah Sekarang</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-grid">
            <div>
              <div className="lp-footer-brand-title">SteelSchool</div>
              <p style={{ lineHeight: 1.6, maxWidth: 280 }}>
                Platform digitalisasi sekolah modern yang mengintegrasikan akademik, tata usaha, koperasi siswa, dan kantin sehat berstandar nasional.
              </p>
            </div>

            <div>
              <div className="lp-footer-heading">Modul Civitas</div>
              <ul className="lp-footer-links">
                <li><Link to="/login" className="lp-footer-link">Portal Siswa</Link></li>
                <li><Link to="/login" className="lp-footer-link">Portal Dewan Guru</Link></li>
                <li><Link to="/login" className="lp-footer-link">Portal Kepala Sekolah</Link></li>
                <li><Link to="/login" className="lp-footer-link">Portal Tata Usaha</Link></li>
              </ul>
            </div>

            <div>
              <div className="lp-footer-heading">Unit Usaha</div>
              <ul className="lp-footer-links">
                <li><Link to="/login" className="lp-footer-link">Koperasi Siswa (Kopsis)</Link></li>
                <li><Link to="/login" className="lp-footer-link">Kantin Sehat</Link></li>
                <li><Link to="/login" className="lp-footer-link">Presensi RFID Satpam</Link></li>
                <li><Link to="/login" className="lp-footer-link">E-Library Perpustakaan</Link></li>
              </ul>
            </div>

            <div>
              <div className="lp-footer-heading">Kontak & Lokasi</div>
              <p style={{ lineHeight: 1.6 }}>
                Jl. Pendidikan No. 45, Indonesia<br />
                Telepon: (021) 8876-2026<br />
                Email: info@steelschool.sch.id
              </p>
            </div>
          </div>

          <div className="lp-footer-bottom">
            <span>© 2026 SteelSchool Ekosistem Sekolah Terpadu. All rights reserved.</span>
            <span>Dirancang khusus untuk Kompetisi Inovasi Teknologi Pendidikan 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageView;
