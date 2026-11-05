import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  GraduationCap,
  BookOpen,
  Award,
  FileSpreadsheet,
  ShoppingBag,
  UtensilsCrossed,
  ShieldCheck,
  TrendingUp,
  Laptop,
  Check,
  Building,
  Star,
} from 'lucide-react';
import './LandingPageView.css';

export const LandingPageView: React.FC = () => {
  const { user } = useAuth();
  const [activeRoleTab, setActiveRoleTab] = useState<string>('siswa');

  const roleShowcaseData: Record<
    string,
    {
      title: string;
      roleBadge: string;
      badgeColor: string;
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
      badgeColor: 'lp-badge-emerald',
      desc: 'Membantu siswa memantau jadwal harian, nilai akademik, rekap kehadiran, dan menikmati transaksi cashless di kopsis serta kantin sekolah.',
      features: [
        'Akses jadwal pelajaran & ruang kelas real-time',
        'Saldo digital terintegrasi untuk jajan kantin & belanja ATK',
        'Rekap kehadiran presensi & status pelunasan SPP transparan',
      ],
      demoUser: 'Ahmad Pratama (XII RPL 1)',
      widgetTitle: 'Ringkasan Portal Siswa',
      widgetRows: [
        { label: 'Jadwal Hari Ini', value: 'Pemrograman Web (Lab 1)' },
        { label: 'Presensi Bulan Ini', value: '98.5% Hadir' },
        { label: 'Saldo Kantin & Kopsis', value: 'Rp 170.000' },
        { label: 'Status SPP', value: 'Lunas (November 2026)' },
      ],
    },
    guru: {
      title: 'Portal Guru & Tenaga Pendidik Efisien',
      roleBadge: 'Dewan Guru',
      badgeColor: 'lp-badge-pill',
      desc: 'Memangkas beban administrasi manual agar guru dapat fokus membimbing dan memaksimalkan potensi setiap siswa di kelas.',
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
      badgeColor: 'lp-badge-amber',
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
      roleBadge: 'Administrasi & Sarpras',
      badgeColor: 'lp-badge-pill',
      desc: 'Otomatisasi buku induk siswa, penerbitan nomor surat keluar masuk, pencatatan SPP, dan inventaris fasilitas sarana prasarana sekolah.',
      features: [
        'Sinkronisasi data pokok siswa dan riwayat akademik terstruktur',
        'Manajemen surat masuk, disposisi instan, dan arsip digital',
        'Validasi tagihan SPP dan inventaris laboratorium komputer',
      ],
      demoUser: 'Siti Aminah, S.AP',
      widgetTitle: 'Sistem Administrasi TU',
      widgetRows: [
        { label: 'Surat Masuk/Keluar', value: '6 Dokumen Hari Ini' },
        { label: 'Penerimaan SPP', value: 'Rp 63.000.000' },
        { label: 'Siswa Lunas', value: '420 dari 452 Siswa' },
        { label: 'Aset Komputer Lab', value: '114 Unit Kondisi Prima' },
      ],
    },
    kopsis: {
      title: 'Koperasi Siswa (Kopsis) Smart POS',
      roleBadge: 'Unit Usaha Sekolah',
      badgeColor: 'lp-badge-amber',
      desc: 'Point of Sale (POS) cerdas untuk penyediaan seragam, buku panduan, dan alat tulis dengan transaksi cepat tanpa uang tunai.',
      features: [
        'Sistem kasir barcode & QRIS dengan saldo dompet siswa',
        'Manajemen stok otomatis dengan peringatan stok menipis',
        'Laporan laba rugi dan rekap transaksi harian transparan',
      ],
      demoUser: 'Rudi Hermawan (Kopsis)',
      widgetTitle: 'Status Kasir Kopsis',
      widgetRows: [
        { label: 'Kasir Status', value: 'Online (Ready)' },
        { label: 'Transaksi Hari Ini', value: '58 Transaksi' },
        { label: 'Omset Penjualan', value: 'Rp 1.420.000' },
        { label: 'Metode Non-Tunai', value: '72% Digital / QRIS' },
      ],
    },
    kantin: {
      title: 'Kantin Sehat Digital & Higienis',
      roleBadge: 'Kantin Sekolah',
      badgeColor: 'lp-badge-emerald',
      desc: 'Mendukung asupan gizi bergizi bagi siswa dengan sistem pemesanan teratur saat istirahat dan pembayaran cashless yang higienis.',
      features: [
        'Katalog menu makanan & minuman terdaftar per stand kantin',
        'Pemesanan tanpa berdesakan saat jam istirahat sekolah',
        'Pantauan higienitas makanan dan rekapan omset pedagang',
      ],
      demoUser: 'Ibu Titin (Kantin Stand 1)',
      widgetTitle: 'Operasional Kantin Sehat',
      widgetRows: [
        { label: 'Status Stan', value: 'Buka & Melayani' },
        { label: 'Antrean Pesanan', value: '12 Porsi Dalam Proses' },
        { label: 'Pesanan Selesai', value: '84 Porsi Hari Ini' },
        { label: 'Omset Stan', value: 'Rp 1.680.000' },
      ],
    },
  };

  const currentRole = roleShowcaseData[activeRoleTab];

  return (
    <div className="lp-wrapper">
      {/* ------------------------------------------------------------------
          1. Modern Navbar (Blurred Glass)
         ------------------------------------------------------------------ */}
      <nav className="lp-navbar">
        <div className="lp-container lp-nav-inner">

          <ul className="lp-nav-links">
            <li><a href="#keunggulan" className="lp-nav-item">Keunggulan</a></li>
            <li><a href="#ekosistem" className="lp-nav-item">Modul Civitas</a></li>
            <li><a href="#program" className="lp-nav-item">Program Unggulan</a></li>
            <li><a href="#prestasi" className="lp-nav-item">Prestasi</a></li>
            <li><a href="#testimoni" className="lp-nav-item">Testimoni</a></li>
          </ul>

          <div className="lp-nav-actions">
            {user ? (
              <Link to="/app" className="lp-btn-login">
                <span>Buka Dashboard</span>
                <ArrowRight size={15} />
              </Link>
            ) : (
              <Link to="/login" className="lp-btn-login">
                <span>Masuk Portal</span>
                <ArrowRight size={15} />
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ------------------------------------------------------------------
          2. Hero Section
         ------------------------------------------------------------------ */}
      <header className="lp-hero-section">
        <div className="lp-container">
          <div className="lp-hero-grid">
            {/* Left Content */}
            <div className="lp-hero-content">
              <h1 className="lp-hero-title">
                SteelSchool
              </h1>

              <p className="lp-hero-desc">
                Solusi all-in-one terintegrasi yang menyatukan portal <strong>Siswa</strong>, <strong>Guru</strong>, <strong>Kepala Sekolah</strong>, <strong>Tata Usaha</strong>, <strong>Koperasi Siswa</strong>, hingga <strong>Kantin Sehat</strong> dalam satu pengalaman digital modern dan efisien.
              </p>

              <div className="lp-hero-cta-group">
                <Link to="/login" className="lp-btn-primary">
                  <span>Akses Portal Civitas</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Right Showcase: 3D Metallic Shield with Top-Down Studio Spotlight */}
            <div className="lp-hero-shield-container">
              <div className="lp-hero-spotlight-beam" aria-hidden="true" />
              <div className="lp-hero-shield-wrapper">
                <img
                  src="/steelschool-shield.png"
                  alt="SteelSchool 3D Metallic Emblem"
                  className="lp-hero-shield-img"
                />
                <div className="lp-hero-shield-floor-shadow" aria-hidden="true" />
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------
          3. Metric Stats Bar
         ------------------------------------------------------------------ */}
      <section className="lp-metrics-section">
        <div className="lp-container">
          <div className="lp-metrics-box">
            <div className="lp-metric-item">
              <div className="lp-metric-icon-circle bg-blue-50 text-blue-600">
                <GraduationCap size={24} />
              </div>
              <div className="lp-metric-data">
                <h3>1.250+</h3>
                <p>Siswa & Siswi Aktif</p>
              </div>
            </div>

            <div className="lp-metric-item">
              <div className="lp-metric-icon-circle bg-emerald-50 text-emerald-600">
                <BookOpen size={24} />
              </div>
              <div className="lp-metric-data">
                <h3>85+</h3>
                <p>Guru & Tenaga Ahli</p>
              </div>
            </div>

            <div className="lp-metric-item">
              <div className="lp-metric-icon-circle bg-amber-50 text-amber-600">
                <Award size={24} />
              </div>
              <div className="lp-metric-data">
                <h3>48+</h3>
                <p>Prestasi Juara 2026</p>
              </div>
            </div>

            <div className="lp-metric-item">
              <div className="lp-metric-icon-circle bg-purple-50 text-purple-600">
                <Building size={24} />
              </div>
              <div className="lp-metric-data">
                <h3>100%</h3>
                <p>Digitalisasi Sekolah</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          4. Interactive 6-in-1 Ecosystem Spotlight
         ------------------------------------------------------------------ */}
      <section id="ekosistem" className="lp-ecosystem-section">
        <div className="lp-container">
          <div className="lp-section-header">
            <span className="lp-badge-pill">Fitur Inti Ekosistem</span>
            <h2 className="lp-section-title">Satu Platform, 6 Peran Civitas Terintegrasi</h2>
            <p className="lp-section-subtitle">
              Pilih peran di bawah ini untuk melihat bagaimana sistem mendukung setiap kebutuhan aktivitas sekolah secara spesifik dan terpadu.
            </p>
          </div>

          {/* Interactive Role Tabs */}
          <div className="lp-role-tab-selector">
            {[
              { id: 'siswa', label: 'Siswa', icon: GraduationCap },
              { id: 'guru', label: 'Guru', icon: BookOpen },
              { id: 'kepsek', label: 'Kepala Sekolah', icon: Award },
              { id: 'petugas', label: 'Tata Usaha (TU)', icon: FileSpreadsheet },
              { id: 'kopsis', label: 'Koperasi (Kopsis)', icon: ShoppingBag },
              { id: 'kantin', label: 'Kantin Sehat', icon: UtensilsCrossed },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeRoleTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveRoleTab(tab.id)}
                  className={`lp-role-tab-btn ${isActive ? 'is-active' : ''}`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Role Card Presentation */}
          <div className="lp-showcase-display-card">
            <div className="lp-showcase-details">
              <div className={`lp-badge-pill ${currentRole.badgeColor}`}>
                <span>{currentRole.roleBadge}</span>
              </div>
              <h3>{currentRole.title}</h3>
              <p>{currentRole.desc}</p>

              <ul className="lp-feature-checklist">
                {currentRole.features.map((feat, idx) => (
                  <li key={idx}>
                    <Check size={16} className="lp-feature-check-icon" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <div>
                <Link to="/login" className="lp-btn-primary" style={{ padding: '10px 20px', fontSize: '13.5px' }}>
                  <span>Uji Coba Demo Sebagai {currentRole.roleBadge}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Widget Interactive Preview */}
            <div className="lp-showcase-widget">
              <div className="lp-widget-header">
                <span className="lp-widget-title">{currentRole.widgetTitle}</span>
                <span className="text-xs font-semibold text-slate-400">Akun: {currentRole.demoUser}</span>
              </div>
              <div className="lp-widget-content">
                {currentRole.widgetRows.map((row, i) => (
                  <div key={i} className="lp-widget-row">
                    <span>{row.label}</span>
                    <strong>{row.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          5. Keunggulan Arsitektur Sistem (Why Choose Us)
         ------------------------------------------------------------------ */}
      <section id="keunggulan" className="lp-features-section">
        <div className="lp-container">
          <div className="lp-section-header">
            <span className="lp-badge-pill">Nilai Tambah & Inovasi</span>
            <h2 className="lp-section-title">Standar Baru Pendidikan Digital</h2>
            <p className="lp-section-subtitle">
              Dirancang dengan prinsip desain bersih, efisiensi waktu, dan transparansi data tanpa membebani civitas sekolah.
            </p>
          </div>

          <div className="lp-features-grid">
            <div className="lp-feature-card">
              <div className="lp-feature-icon-box bg-blue-50 text-blue-600">
                <Laptop size={24} />
              </div>
              <h4>All-in-One Centralized Hub</h4>
              <p>
                Menghilangkan fragmentasi aplikasi. Akademik, finansial SPP, koperasi, dan absensi terpusat dalam satu database terpadu.
              </p>
            </div>

            <div className="lp-feature-card">
              <div className="lp-feature-icon-box bg-emerald-50 text-emerald-600">
                <TrendingUp size={24} />
              </div>
              <h4>Ekosistem Finansial 100% Cashless</h4>
              <p>
                Transaksi belanja alat tulis di Kopsis dan makan siang di kantin menggunakan saldo digital siswa untuk meminimalisir kehilangan uang tunai.
              </p>
            </div>

            <div className="lp-feature-card">
              <div className="lp-feature-icon-box bg-amber-50 text-amber-600">
                <Award size={24} />
              </div>
              <h4>Executive BI & Pengawasan Real-time</h4>
              <p>
                Kepala Sekolah memiliki akses ke analitik kinerja dewan guru, rata-rata kehadiran rombel, dan evaluasi unit usaha sekolah.
              </p>
            </div>

            <div className="lp-feature-card">
              <div className="lp-feature-icon-box bg-purple-50 text-purple-600">
                <ShieldCheck size={24} />
              </div>
              <h4>Keamanan Token & Akurasi Data</h4>
              <p>
                Didukung arsitektur REST API Laravel Sanctum berstandar industri dengan kontrol hak akses multi-role (RBAC) yang ketat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          6. Program Unggulan Sekolah
         ------------------------------------------------------------------ */}
      <section id="program" className="lp-programs-section">
        <div className="lp-container">
          <div className="lp-section-header">
            <span className="lp-badge-pill">Kurikulum Unggul</span>
            <h2 className="lp-section-title">Program Pembinaan Generasi Masa Depan</h2>
            <p className="lp-section-subtitle">
              Mengombinasikan penguasaan sains teknologi, pembentukan karakter luhur, dan inkubasi wirausaha mandiri.
            </p>
          </div>

          <div className="lp-programs-grid">
            <div className="lp-program-card">
              <div>
                <span className="lp-program-tag">Teknologi & Vokasi</span>
                <h4>Lab Rekayasa Perangkat Lunak & AI</h4>
                <p>
                  Pusat pembelajaran komputasi modern dengan kurikulum berbasis industri web, mobile app development, dan kecerdasan buatan.
                </p>
              </div>
              <div className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--color-midnight-navy)' }}>
                <span>Fasilitas Lab Multimedia Terkini</span>
                <Check size={14} />
              </div>
            </div>

            <div className="lp-program-card">
              <div>
                <span className="lp-program-tag">Kewirausahaan</span>
                <h4>Inkubator Bisnis & Kopsis Digital</h4>
                <p>
                  Melatih siswa mengelola bisnis nyata melalui praktik kasir retail digital, supply chain ATK, dan pencatatan akuntansi koperasi.
                </p>
              </div>
              <div className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--color-midnight-navy)' }}>
                <span>Praktik Nyata Berbasis Smart POS</span>
                <Check size={14} />
              </div>
            </div>

            <div className="lp-program-card">
              <div>
                <span className="lp-program-tag">Kesehatan & Karakter</span>
                <h4>Gerakan Kantin Sehat & Bersih</h4>
                <p>
                  Standar higienitas ketat dengan menu bergizi bersertifikasi untuk menunjang daya konsentrasi belajar siswa sepanjang hari.
                </p>
              </div>
              <div className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--color-midnight-navy)' }}>
                <span>Pemesanan Pre-Order Tanpa Antre</span>
                <Check size={14} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          7. Prestasi & Rekognisi
         ------------------------------------------------------------------ */}
      <section id="prestasi" className="lp-features-section" style={{ background: '#f8fafc' }}>
        <div className="lp-container">
          <div className="lp-section-header">
            <span className="lp-badge-pill">Jejak Prestasi</span>
            <h2 className="lp-section-title">Pencapaian Gemilang Civitas Sekolah</h2>
            <p className="lp-section-subtitle">
              Bukti nyata dedikasi tenaga pendidik dan kerja keras siswa dalam berbagai ajang kompetisi regional dan nasional.
            </p>
          </div>

          <div className="lp-features-grid">
            <div className="lp-feature-card">
              <span className="lp-badge-pill lp-badge-amber text-xs w-fit">Tingkat Nasional</span>
              <h4>Medali Emas Olimpiade Sains & Informatika 2026</h4>
              <p>Diraih oleh tim perwakilan siswa kelas XI dalam kategori Algoritma Pemrograman dan Basis Data.</p>
            </div>

            <div className="lp-feature-card">
              <span className="lp-badge-pill lp-badge-emerald text-xs w-fit">Inovasi Lembaga</span>
              <h4>Sekolah Rujukan Digitalisasi Terbaik Provinsi</h4>
              <p>Penghargaan atas implementasi ekosistem terpadu bebas kertas dan cashless smart school.</p>
            </div>

            <div className="lp-feature-card">
              <span className="lp-badge-pill lp-badge-pill text-xs w-fit">Karier & Lulusan</span>
              <h4>98% Keterserapan Lulusan Perguruan Tinggi & Industri</h4>
              <p>Alumni tersebar di kampus negeri unggulan dan perusahaan teknologi terkemuka.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          8. Testimoni Civitas Sekolah
         ------------------------------------------------------------------ */}
      <section id="testimoni" className="lp-testimonials-section">
        <div className="lp-container">
          <div className="lp-section-header">
            <span className="lp-badge-pill">Suara Civitas</span>
            <h2 className="lp-section-title">Apa Kata Mereka Tentang Ekosistem Ini?</h2>
            <p className="lp-section-subtitle">
              Pengalaman nyata siswa, guru, dan pengelola yang merasakan kemudahan sistem terpadu setiap harinya.
            </p>
          </div>

          <div className="lp-testimonials-grid">
            <div className="lp-testimonial-card">
              <div className="lp-star-rating" aria-label="Rating 5 dari 5 bintang">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={15} fill="var(--color-sunlit-yellow)" color="var(--color-sunlit-yellow)" />
                ))}
              </div>
              <p className="lp-testimonial-quote">
                "Jajan di kantin dan beli buku di Kopsis sekarang sangat cepat pakai saldo digital. Jadwal pelajaran dan nilai ujian juga langsung bisa dilihat di HP tanpa perlu tanya manual."
              </p>
              <div className="lp-testimonial-author">
                <div className="lp-author-avatar">AP</div>
                <div className="lp-author-info">
                  <h5>Ahmad Pratama</h5>
                  <span>Ketua OSIS / Siswa Kelas XII</span>
                </div>
              </div>
            </div>

            <div className="lp-testimonial-card">
              <div className="lp-star-rating" aria-label="Rating 5 dari 5 bintang">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={15} fill="var(--color-sunlit-yellow)" color="var(--color-sunlit-yellow)" />
                ))}
              </div>
              <p className="lp-testimonial-quote">
                "Sebagai guru, saya tidak perlu lagi membawa tumpukan buku nilai fisik. Presensi kelas otomatis terdata dan nilai ujian semester langsung tersusun rapi untuk rapor siswa."
              </p>
              <div className="lp-testimonial-author">
                <div className="lp-author-avatar">BS</div>
                <div className="lp-author-info">
                  <h5>Budi Santoso, S.Pd</h5>
                  <span>Guru Rekayasa Perangkat Lunak</span>
                </div>
              </div>
            </div>

            <div className="lp-testimonial-card">
              <div className="lp-star-rating" aria-label="Rating 5 dari 5 bintang">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={15} fill="var(--color-sunlit-yellow)" color="var(--color-sunlit-yellow)" />
                ))}
              </div>
              <p className="lp-testimonial-quote">
                "Platform ini memberikan visibilitas penuh bagi saya selaku pimpinan sekolah. Rekap kehadiran guru dan laporan omset unit kopsis dapat saya tinjau dalam satu dashboard eksekutif."
              </p>
              <div className="lp-testimonial-author">
                <div className="lp-author-avatar">SK</div>
                <div className="lp-author-info">
                  <h5>Dr. H. Soekarno, M.Pd</h5>
                  <span>Kepala Sekolah</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          9. High Impact Call to Action (CTA)
         ------------------------------------------------------------------ */}
      <section className="lp-cta-section">
        <div className="lp-container">
          <div className="lp-cta-card">
            <h2>Wujudkan Pengelolaan Sekolah Masa Depan Hari Ini</h2>
            <p>
              Bergabunglah dengan ekosistem digital terpadu untuk efisiensi akademik, transparansi unit usaha, dan kemudahan bagi seluruh civitas sekolah.
            </p>
            <div>
              <Link to="/login" className="lp-btn-cta-white">
                <span>Masuk ke Portal Sekolah Sekarang</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          10. Comprehensive Modern Footer
         ------------------------------------------------------------------ */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-grid">
            <div className="lp-footer-brand-col">
              <div className="lp-brand-group">
                <svg className="lp-logo-svg" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 2 C25 2, 29 6, 29 11 C29 16, 25 20, 20 20 C15 20, 11 16, 11 11 C11 6, 15 2, 20 2 Z" fill="#FBBF24" />
                  <path d="M29 11 C34 11, 38 15, 38 20 C38 25, 34 29, 29 29 C24 29, 20 25, 20 20 C20 15, 24 11, 29 11 Z" fill="#4ADE80" />
                  <path d="M20 20 C25 20, 29 24, 29 29 C29 34, 25 38, 20 38 C15 38, 11 34, 11 29 C11 24, 15 20, 20 20 Z" fill="#38BDF8" />
                  <path d="M11 11 C16 11, 20 15, 20 20 C20 25, 16 29, 11 29 C6 29, 2 25, 2 20 C2 15, 6 11, 11 11 Z" fill="#F472B6" />
                </svg>
                <div className="lp-brand-text">
                  <span className="lp-brand-name">SteelSchool</span>
                  <span className="lp-brand-tagline">Ekosistem Sekolah Terpadu</span>
                </div>
              </div>
              <p>
                Platform digitalisasi sekolah modern yang mengintegrasikan akademik, tata usaha, koperasi siswa, dan kantin sehat berstandar nasional.
              </p>
            </div>

            <div className="lp-footer-col">
              <h5>Modul Civitas</h5>
              <ul className="lp-footer-links">
                <li><Link to="/login">Portal Siswa</Link></li>
                <li><Link to="/login">Portal Dewan Guru</Link></li>
                <li><Link to="/login">Portal Kepala Sekolah</Link></li>
                <li><Link to="/login">Portal Tata Usaha</Link></li>
                <li><Link to="/login">Portal Kasir Kopsis</Link></li>
                <li><Link to="/login">Portal Kantin Sehat</Link></li>
              </ul>
            </div>

            <div className="lp-footer-col">
              <h5>Navigasi Halaman</h5>
              <ul className="lp-footer-links">
                <li><a href="#keunggulan">Keunggulan Ekosistem</a></li>
                <li><a href="#ekosistem">Simulasi 6 Peran</a></li>
                <li><a href="#program">Program Unggulan</a></li>
                <li><a href="#prestasi">Jejak Prestasi</a></li>
                <li><a href="#testimoni">Testimoni Pengguna</a></li>
              </ul>
            </div>

            <div className="lp-footer-col">
              <h5>Kontak & Layanan</h5>
              <ul className="lp-footer-links">
                <li><span>📍 Jl. Pendidikan No. 45, Indonesia</span></li>
                <li><span>📞 (021) 8876-2026</span></li>
                <li><span>✉️ info@steelschool.sch.id</span></li>
                <li><span>🕒 Senin - Jumat, 07:00 - 16:00</span></li>
              </ul>
            </div>
          </div>

          <div className="lp-footer-bottom">
            <span>&copy; {new Date().getFullYear()} SteelSchool Ekosistem Sekolah Terpadu. All rights reserved.</span>
            <span>Dirancang khusus untuk Kompetisi Inovasi Teknologi Pendidikan 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
