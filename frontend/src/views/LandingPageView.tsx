import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiCheckCircle,
  FiLayers,
} from 'react-icons/fi';
import {
  HiOutlineAcademicCap,
  HiOutlineBookOpen,
} from 'react-icons/hi2';
import {
  RiAwardLine,
  RiFileList3Line,
  RiShoppingCart2Line,
  RiRestaurantLine,
} from 'react-icons/ri';
import { Badge } from '../components/ui/badge';
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

      {/* Top Header Navbar with Tailwind & Shadcn styling */}
      <header className="lp-header">
        <div className="lp-container flex items-center justify-between w-full">
          <Link to="/" className="lp-nav-brand">
            <img src="/stillschool-logo.png" alt="StillSchool" className="lp-nav-brand-logo" />
            <div>
              <div className="lp-nav-brand-title">StillSchool</div>
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

          <div className="flex items-center">
            <Link to="/login" className="lp-nav-pill-cta">
              <span>Masuk Portal</span>
              <FiArrowRight className="w-4 h-4 shrink-0" />
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
              <h1 className="lp-hero-title">
                Ekosistem Digital Sekolah{' '}
                <span className="lp-hero-title-highlight">Cerdas & Terpadu</span>
              </h1>

              <p className="lp-hero-desc">
                Satu platform terintegrasi untuk 9 civitas: manajemen akademik, presensi gerbang RFID, unit usaha kopsis & kantin cashless, hingga pemantauan eksekutif pimpinan sekolah.
              </p>

              <div className="lp-hero-buttons">
                <Link
                  to="/login"
                  className="lp-hero-btn-primary"
                >
                  <span>Masuk ke Portal Sekolah</span>
                  <FiArrowRight className="w-4 h-4 shrink-0" />
                </Link>
              </div>
            </div>

            {/* Right 3D Tablet Showcase (Novus & Flowize Mockup) */}
            <div className="lp-hero-showcase">
              <div className="lp-showcase-tablet">
                <div className="lp-showcase-header">
                  <div className="lp-showcase-brand">
                    <img src="/stillschool-logo.png" alt="Shield" className="w-6 h-6 object-contain" />
                    <span className="text-xs font-bold text-slate-900">StillSchool Operational Hub</span>
                  </div>
                  <Badge variant="success" className="text-[10px] uppercase font-bold py-0.5 px-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-ping" />
                    <span>Sistem Aktif</span>
                  </Badge>
                </div>

                <div className="lp-showcase-stats-grid">
                  <div className="lp-mini-stat-card">
                    <div className="lp-mini-stat-label">Total Civitas</div>
                    <div className="lp-mini-stat-val">380+</div>
                  </div>
                  <div className="lp-mini-stat-card">
                    <div className="lp-mini-stat-label">Kehadiran Gerbang</div>
                    <div className="lp-mini-stat-val text-emerald-600">98.8%</div>
                  </div>
                  <div className="lp-mini-stat-card">
                    <div className="lp-mini-stat-label">Saldo Cashless</div>
                    <div className="lp-mini-stat-val text-blue-600">Aktif</div>
                  </div>
                </div>

                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80">
                  <div className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                    <FiLayers className="w-3.5 h-3.5 text-blue-600" />
                    <span>Alur Ekosistem Waktu-Nyata</span>
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed space-y-1">
                    <div className="flex items-center gap-1.5">
                      <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Check-in Gerbang Otomatis via RFID/NISN</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Belanja Kopsis & Kantin via QRIS Instan & Kasir Tunai</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Evaluasi Nilai Guru & Rekap SPP Terpusat</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Cards (Novus Style) */}
              <div className="lp-floating-card-1">
                <div className="lp-floating-icon bg-emerald-100 text-emerald-600">
                  <FiCheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Presensi Gerbang</div>
                  <div className="text-[11px] text-slate-500">Ahmad P. Hadir 06:45 WIB</div>
                </div>
              </div>

              <div className="lp-floating-card-2">
                <div className="lp-floating-icon bg-blue-100 text-blue-600">
                  <RiShoppingCart2Line className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Kopsis Smart POS</div>
                  <div className="text-[11px] text-slate-500">Transaksi Saldo Sukses</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Grid Key Highlights (Flowize AI Style: 10x, 99.8%, 100%, Enterprise) */}
      <section id="highlights" className="lp-highlights-section">
        <div className="lp-container">
          <div className="lp-section-header">
            <span className="lp-section-tag">Efisiensi Maksimal</span>
            <h2 className="lp-section-title">Mengapa Memilih StillSchool?</h2>
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
              <div className="lp-highlight-metric text-emerald-600">99.8%</div>
              <div className="lp-highlight-title">Akurasi Presensi Gerbang</div>
              <p className="lp-highlight-text">
                Deteksi otomatis waktu check-in satpam dengan kalkulasi menit keterlambatan yang objektif.
              </p>
            </div>

            <div className="lp-highlight-card">
              <div className="lp-highlight-metric text-purple-600">100%</div>
              <div className="lp-highlight-title">Cashless Dual-Balance</div>
              <p className="lp-highlight-text">
                Pemisahan ketat saldo belanja Kopsis dan jajan Kantin agar uang saku edukasi siswa terarah.
              </p>
            </div>

            <div className="lp-highlight-card">
              <div className="lp-highlight-metric text-sky-600">RBAC</div>
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
            <span className="lp-section-tag">Simulasi Peran Civitas</span>
            <h2 className="lp-section-title">Satu Platform, Pengalaman Spesifik</h2>
            <p className="lp-section-desc">
              Pilih peran di bawah ini untuk melihat bagaimana antarmuka menyesuaikan dengan alur kerja masing-masing pengguna.
            </p>
          </div>

          <div className="lp-role-tabs-nav">
            {[
              { id: 'siswa', label: 'Siswa / Murid', icon: HiOutlineAcademicCap },
              { id: 'guru', label: 'Dewan Guru', icon: HiOutlineBookOpen },
              { id: 'kepsek', label: 'Kepala Sekolah', icon: RiAwardLine },
              { id: 'petugas', label: 'Tata Usaha (TU)', icon: RiFileList3Line },
              { id: 'kopsis', label: 'Koperasi Siswa', icon: RiShoppingCart2Line },
              { id: 'kantin', label: 'Kantin Sehat', icon: RiRestaurantLine },
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveRoleTab(tab.id)}
                  className={`lp-role-tab-btn ${activeRoleTab === tab.id ? 'active' : ''}`}
                  type="button"
                >
                  <TabIcon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="lp-role-display-card">
            <div>
              <div className="inline-block mb-3">
                <Badge variant="primary" className="text-xs font-bold px-3 py-1">
                  {activeRoleData.roleBadge}
                </Badge>
              </div>
              <h3 className="lp-role-info-title">{activeRoleData.title}</h3>
              <p className="lp-role-info-desc">{activeRoleData.desc}</p>

              <div className="lp-role-features-list">
                {activeRoleData.features.map((feat, idx) => (
                  <div key={idx} className="lp-role-feature-item">
                    <FiCheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <Link to="/login" className="lp-role-btn-cta">
                <span>Coba Masuk Akun Ini</span>
                <FiArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>

            <div className="lp-role-preview-widget">
              <div className="lp-widget-header">
                <span>{activeRoleData.widgetTitle}</span>
                <span className="text-blue-600 font-bold">{activeRoleData.demoUser}</span>
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

      {/* Call to Action Banner (Hidden on Mobile, Displayed on Desktop) */}
      <div className="hidden md:block lp-container">
        <div className="lp-cta-banner">
          <h2 className="lp-cta-title">Siap Mentransformasi Sekolah Anda?</h2>
          <p className="lp-cta-desc">
            Bergabunglah dengan ekosistem digital terpadu untuk efisiensi akademik, transparansi unit usaha, dan kemudahan bagi seluruh civitas.
          </p>
          <Link to="/login" className="lp-cta-btn">
            <span>Masuk ke Portal Sekolah Sekarang</span>
            <FiArrowRight className="w-4 h-4 shrink-0" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-grid">
            <div>
              <div className="lp-footer-brand-title">StillSchool</div>
              <p className="leading-relaxed max-w-xs text-slate-400">
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
              <p className="leading-relaxed text-slate-400">
                Jl. Pendidikan No. 45, Indonesia<br />
                Telepon: (021) 8876-2026<br />
                Email: info@stillschool.sch.id
              </p>
            </div>
          </div>

          <div className="lp-footer-bottom">
            <span>© 2026 StillSchool Ekosistem Sekolah Terpadu. All rights reserved.</span>
            <span>Dirancang khusus untuk Kompetisi Inovasi Teknologi Pendidikan 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageView;
