import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { ROLE_LABELS } from '../types/auth';
import {
  GraduationCap,
  Bell,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  BookOpen,
  Award,
  Calendar,
  ShoppingBag,
  UtensilsCrossed,
  FileSpreadsheet,
  BookMarked,
  Shield,
  Settings,
  CreditCard,
  TrendingUp,
  Sparkles,
  Clock,
  MapPin,
  Check,
  CalendarDays,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface OverviewData {
  current_user: { name: string; role: string };
  metrics: {
    total_siswa: number;
    total_guru: number;
    total_petugas: number;
    total_kelas: number;
    total_kopsis_products: number;
    total_kantin_menus: number;
    active_roles_count: number;
  };
  announcements: Array<{
    id: number;
    title: string;
    content: string;
    target_role: string;
    created_at: string;
  }>;
}

interface ScheduleItem {
  jam: string;
  mapel: string;
  guru: string;
  ruang: string;
  status?: string;
}

// Circular Gauge Component matching the Reference Dashboard with balanced sizing
const CircularGauge: React.FC<{
  percentage: number;
  label: string;
  color: string;
  sublabel?: string;
}> = ({ percentage, label, color, sublabel }) => {
  const size = 64;
  const strokeWidth = 5.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-white hover:border-blue-200 hover:shadow-xs transition-all">
      <div className="relative inline-flex items-center justify-center mb-2" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span className="absolute text-xs md:text-sm font-black text-slate-900">
          {percentage}%
        </span>
      </div>
      <span className="text-xs md:text-sm font-bold text-slate-800 leading-tight">
        {label}
      </span>
      {sublabel && (
        <span className="text-[11px] text-slate-500 mt-0.5 font-medium">
          {sublabel}
        </span>
      )}
    </div>
  );
};

export const OverviewView: React.FC = () => {
  const { user, activeRole } = useAuth();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Student personalized stats
  const [studentStats, setStudentStats] = useState<{
    saldo_kopsis: number;
    saldo_kantin: number;
    spp_status: string;
    kelas: string;
    kehadiran: string;
    kehadiranPct: number;
  }>({
    saldo_kopsis: 75000,
    saldo_kantin: 45000,
    spp_status: 'Lunas',
    kelas: 'XII RPL 1',
    kehadiran: '96.2%',
    kehadiranPct: 96,
  });

  // Today's schedule data
  const [schedules, setSchedules] = useState<ScheduleItem[]>([
    {
      jam: '07:30 - 09:00',
      mapel: 'Pemrograman Web & PBO',
      guru: 'Drs. Budi Santoso',
      ruang: 'Lab RPL 2',
      status: 'Sedang Berlangsung',
    },
    {
      jam: '09:15 - 10:45',
      mapel: 'Basis Data Relasional',
      guru: 'Siti Rahmawati, S.Kom',
      ruang: 'Lab RPL 1',
      status: 'Sesi 2',
    },
    {
      jam: '11:00 - 12:30',
      mapel: 'Matematika Terapan & Logika',
      guru: 'Hendra Wijaya, M.Pd',
      ruang: 'Ruang Teori 204',
      status: 'Sesi 3',
    },
  ]);

  const isAdmin = activeRole === 'admin';
  const isStudent = activeRole === 'siswa';

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await apiClient.get('/school/overview');
        setData(res.data);

        if (activeRole === 'siswa') {
          const [resWallet, resSiswa] = await Promise.all([
            apiClient.get('/wallet/balance').catch(() => null),
            apiClient.get('/school/siswa').catch(() => null),
          ]);

          const siswaData = resSiswa?.data?.data;
          const rawKehadiran = siswaData?.presensi_bulan_ini?.persentase ?? '96.2%';
          const parsedPct = parseFloat(rawKehadiran.replace('%', '')) || 96;

          setStudentStats({
            saldo_kopsis: resWallet?.data?.wallet?.balance_kopsis ?? 75000,
            saldo_kantin: resWallet?.data?.wallet?.balance_kantin ?? 45000,
            spp_status: siswaData?.tagihan_spp?.status ?? 'Lunas',
            kelas: siswaData?.kelas ?? 'XII RPL 1',
            kehadiran: rawKehadiran,
            kehadiranPct: parsedPct,
          });

          if (siswaData?.jadwal_hari_ini && Array.isArray(siswaData.jadwal_hari_ini) && siswaData.jadwal_hari_ini.length > 0) {
            setSchedules(siswaData.jadwal_hari_ini);
          }
        }
      } catch (err) {
        console.error('Gagal mengambil overview data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, [activeRole]);

  // Modul Portal Cards for Civitas
  const allPortals = [
    {
      to: '/app/siswa',
      icon: GraduationCap,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
      borderColor: '#bfdbfe',
      title: isStudent ? 'Akademik & Nilai Saya' : 'Portal Siswa',
      desc: isStudent
        ? 'Jadwal pelajaran harian, presensi gerbang, buku nilai & rapor terpadu'
        : 'Jadwal pelajaran, nilai, presensi & saldo digital siswa terdaftar',
      buttonText: 'Buka Portal Siswa',
      allowedRoles: ['admin', 'siswa', 'guru', 'kepsek', 'petugas'],
      tag: 'Akademik',
    },
    {
      to: '/app/kantin',
      icon: UtensilsCrossed,
      iconBg: '#eff6ff',
      iconColor: '#0284c7',
      borderColor: '#bae6fd',
      title: isStudent || activeRole === 'guru' ? 'Pesan Makanan Kantin' : 'Kasir Stan Kantin',
      desc: isStudent || activeRole === 'guru'
        ? 'Pesan aneka menu makanan lezat cashless dari saldo dompet digital Anda'
        : 'Kelola daftar menu stan kantin, stok, & antrean transaksi siswa',
      buttonText: 'Menuju Kantin',
      allowedRoles: ['admin', 'kantin', 'siswa', 'guru'],
      tag: 'Unit Usaha',
    },
    {
      to: '/app/kopsis',
      icon: ShoppingBag,
      iconBg: '#eff6ff',
      iconColor: '#4f46e5',
      borderColor: '#c7d2fe',
      title: isStudent || activeRole === 'guru' ? 'Koperasi Siswa (Kopsis)' : 'Kasir POS Koperasi',
      desc: isStudent || activeRole === 'guru'
        ? 'Belanja perlengkapan alat tulis kantor (ATK), seragam sekolah & modul'
        : 'Kasir POS penjualan langsung, inventaris ATK, & rekapan mutasi omset',
      buttonText: 'Buka Koperasi',
      allowedRoles: ['admin', 'kopsis', 'siswa', 'guru'],
      tag: 'Unit Usaha',
    },
    {
      to: '/app/petugas',
      icon: FileSpreadsheet,
      iconBg: '#eff6ff',
      iconColor: '#0d9488',
      borderColor: '#99f6e4',
      title: isStudent ? 'Layanan SPP & Administrasi' : 'Tata Usaha (TU & SPP)',
      desc: isStudent
        ? 'Cek status pembayaran SPP bulanan & unduh kuitansi sah digital'
        : 'Buku kas pembayaran SPP, arsip kwitansi, & verifikasi transaksi siswa',
      buttonText: 'Layanan TU & SPP',
      allowedRoles: ['admin', 'petugas', 'siswa'],
      tag: 'Administrasi',
    },
    {
      to: '/app/perpus',
      icon: BookMarked,
      iconBg: '#eff6ff',
      iconColor: '#7c3aed',
      borderColor: '#ddd6fe',
      title: isStudent ? 'Perpustakaan (E-Library)' : 'Portal Pustakawan',
      desc: isStudent
        ? 'Katalog buku pelajaran, peminjaman 7/14 hari & countdown jatuh tempo denda'
        : 'Inventaris koleksi buku rak, sirkulasi peminjaman, & pengembalian buku',
      buttonText: 'Buka E-Library',
      allowedRoles: ['admin', 'perpustakaan', 'siswa', 'guru'],
      tag: 'Pustaka',
    },
    {
      to: '/app/guru',
      icon: BookOpen,
      iconBg: '#eff6ff',
      iconColor: '#1d4ed8',
      borderColor: '#bfdbfe',
      title: 'Portal Dewan Guru',
      desc: 'Input nilai evaluasi (Tugas/UH/PTS/PAS) & rekapitulasi absensi rombel kelas',
      buttonText: 'Portal Guru',
      allowedRoles: ['admin', 'guru', 'kepsek'],
      tag: 'Pengajaran',
    },
    {
      to: '/app/kepsek',
      icon: Award,
      iconBg: '#eff6ff',
      iconColor: '#b45309',
      borderColor: '#fde68a',
      title: 'Monitoring Kepala Sekolah',
      desc: 'Dashboard KPI eksekutif, rekap kehadiran sekolah & perputaran omset unit',
      buttonText: 'Monitoring Kepsek',
      allowedRoles: ['admin', 'kepsek'],
      tag: 'Manajerial',
    },
    {
      to: '/app/security',
      icon: Shield,
      iconBg: '#eff6ff',
      iconColor: '#334155',
      borderColor: '#cbd5e1',
      title: 'Presensi Gerbang Satpam',
      desc: 'Gate check-in RFID & NISN gerbang utama, auto-deteksi keterlambatan siswa',
      buttonText: 'Pos Gerbang Satpam',
      allowedRoles: ['admin', 'security'],
      tag: 'Keamanan',
    },
    {
      to: '/app/admin',
      icon: Settings,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
      borderColor: '#bfdbfe',
      title: 'Manajemen Sistem & Role',
      desc: 'Manajemen master akun pengguna, penugasan role dinamis & audit trail log',
      buttonText: 'Panel Administrator',
      allowedRoles: ['admin'],
      tag: 'Sistem',
    },
  ];

  const visiblePortals = allPortals.filter(
    (p) => isAdmin || p.allowedRoles.includes(activeRole)
  );

  const visibleAnnouncements = (data?.announcements || []).filter(
    (ann) =>
      isAdmin ||
      ann.target_role === 'all' ||
      ann.target_role === activeRole
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[350px] text-sm text-slate-500 font-semibold">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
        Menghubungkan ekosistem SteelSchool...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. GREETING HERO CARD (Sesuai Hirarki: Tombol Penting Lebih Besar) */}
      {/* ============================================================== */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-blue-100 p-6 md:p-8 shadow-xs">
        {/* Soft background blue ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100/50 via-blue-50/20 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            {/* Status Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 border border-blue-200/80 text-blue-700 rounded-full text-xs font-bold mb-3 shadow-xs">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>
                {isStudent
                  ? `Siswa Aktif • Kelas ${studentStats.kelas}`
                  : `Sesi Peran: ${ROLE_LABELS[activeRole] || activeRole}`}
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Halo, {user?.name || (isAdmin ? 'Administrator' : 'Civitas SteelSchool')}! 👋
            </h2>
            <p className="text-xs md:text-sm text-slate-600 mt-2 leading-relaxed">
              {isStudent
                ? `Selamat datang kembali di ekosistem sekolah! Seluruh kegiatan kelas hari ini, presensi gerbang, dan dompet digital Anda telah tersinkronisasi otomatis.`
                : 'Sistem operasional sekolah terpadu aktif. Akses seluruh data civitas, rombel pembelajaran, dan unit usaha dengan aman dan terverifikasi.'}
            </p>

            {/* ACTION ROW: Sesuai Hirarki (Tombol Paling Penting Lebih Besar) */}
            <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-slate-100">
              {isStudent ? (
                <>
                  {/* P0 / Primary Action - Tombol Utama Berukuran Paling Besar */}
                  <Link to="/app/kantin" className="btn-hero-primary">
                    <UtensilsCrossed size={16} />
                    <span>Pesan Kantin</span>
                    <ArrowRight size={14} />
                  </Link>

                  {/* P1 / Secondary Action - Tombol Pendukung Berukuran Proporsional */}
                  <Link to="/app/kopsis" className="btn-hero-secondary">
                    <ShoppingBag size={15} />
                    <span>Belanja Kopsis</span>
                  </Link>
                  <Link to="/app/petugas" className="btn-hero-secondary">
                    <CreditCard size={15} />
                    <span>Bayar SPP</span>
                  </Link>
                  <Link to="/app/perpus" className="btn-hero-secondary">
                    <BookMarked size={15} />
                    <span>E-Library</span>
                  </Link>
                </>
              ) : (
                <>
                  {/* P0 / Primary Action untuk Staf / Admin */}
                  <Link to="/app/siswa" className="btn-hero-primary">
                    <GraduationCap size={16} />
                    <span>Buka Data Siswa</span>
                    <ArrowRight size={14} />
                  </Link>
                  <Link to="/app/guru" className="btn-hero-secondary">
                    <BookOpen size={15} />
                    <span>Jurnal Guru</span>
                  </Link>
                  <Link to="/app/kantin" className="btn-hero-secondary">
                    <UtensilsCrossed size={15} />
                    <span>Stan Kantin</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* 3D Character Illustration dari Referensi */}
          <div className="hidden md:flex items-center justify-center shrink-0 pr-4">
            <div className="relative">
              <div className="w-40 h-40 rounded-full bg-blue-100/60 absolute -bottom-1 -left-1 -z-10 filter blur-xs"></div>
              <img
                src="/login-3d-character.svg"
                alt="3D Student Character"
                className="w-40 h-40 lg:w-44 lg:h-44 object-contain drop-shadow-md select-none pointer-events-none transform hover:scale-105 transition-transform"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. ACADEMIC & PERFORMANCE GAUGES (Tipografi Presisi & Seimbang) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Large Score Card (Col Span 5) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider">
                {isStudent ? 'Indeks Kedisiplinan & Prestasi' : 'Statistik Civitas Terdaftar'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Semester Genap
              </span>
            </div>

            <div className="flex items-baseline gap-2.5 mt-2">
              <span className="text-4xl md:text-5xl font-black text-blue-600 tracking-tight">
                {isStudent ? studentStats.kehadiran : `${data?.metrics?.total_siswa || 348}`}
              </span>
              <span className="text-sm font-bold text-slate-700">
                {isStudent ? 'Rata-Rata Kehadiran' : 'Siswa Aktif Terdata'}
              </span>
            </div>

            <p className="text-xs md:text-sm text-slate-600 mt-2.5 leading-relaxed">
              {isStudent
                ? `Catatan presensi gerbang satpam dan kelas menunjukkan performa disiplin sangat baik (${studentStats.kehadiranPct}% hadir tepat waktu tanpa alpha).`
                : `Total ${data?.metrics?.total_guru || 24} tenaga pendidik dan ${data?.metrics?.total_kelas || 12} rombongan belajar aktif terdata dalam sistem.`}
            </p>
          </div>

          {/* Micro Progress Bars */}
          <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Ketepatan Waktu Presensi</span>
                <span className="font-bold text-blue-600">{studentStats.kehadiran}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-700"
                  style={{ width: `${studentStats.kehadiranPct}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Penyelesaian Tugas & Evaluasi</span>
                <span className="font-bold text-indigo-600">89.4%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '89.4%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Circular Gauges / Key Metrics (Col Span 7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3.5 mb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4.5 h-4.5 text-blue-600" />
                <span>Indikator Performa & Saldo Layanan</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Parameter harian terintegrasi otomatis dari basis data</p>
            </div>
            {isStudent && (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <Check className="w-3.5 h-3.5 text-emerald-600" /> SPP {studentStats.spp_status}
              </span>
            )}
          </div>

          {/* 4 Radial Gauges matching Reference */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 my-2">
            <CircularGauge
              percentage={studentStats.kehadiranPct}
              label="Kehadiran"
              color="#2857e6"
              sublabel="Presensi Gerbang"
            />
            <CircularGauge
              percentage={92}
              label="Tugas Selesai"
              color="#4f46e5"
              sublabel="E-Learning"
            />
            <CircularGauge
              percentage={84}
              label="Ulangan Harian"
              color="#0284c7"
              sublabel="Nilai Rapor"
            />
            <CircularGauge
              percentage={98}
              label="Kedisiplinan"
              color="#10b981"
              sublabel="Tata Tertib"
            />
          </div>

          {/* Bottom Summary Bar with Quick Action */}
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs md:text-sm text-slate-600 gap-3">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                <ShoppingBag className="w-4 h-4 text-blue-600" />
                Kopsis: <strong className="text-blue-600 font-bold">Rp {studentStats.saldo_kopsis.toLocaleString('id-ID')}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                <UtensilsCrossed className="w-4 h-4 text-sky-600" />
                Kantin: <strong className="text-sky-600 font-bold">Rp {studentStats.saldo_kantin.toLocaleString('id-ID')}</strong>
              </span>
            </div>
            <Link
              to="/app/kantin"
              className="btn-compact-action text-xs font-bold"
            >
              <span>Transaksi Dompet</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. TWO-COLUMN WORKSPACE: MODULES (LEFT) & SCHEDULE (RIGHT)     */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Modul Civitas Terpadu (Col span 7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <div>
              <h3 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span>Modul Layanan Civitas</span>
              </h3>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                Pilih modul kerja sesuai hak akses peran Anda untuk mengelola aktivitas sekolah
              </p>
            </div>
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {visiblePortals.length} Modul Terbuka
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {visiblePortals.map((portal, idx) => {
              const PortalIcon = portal.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col justify-between p-5 rounded-2xl bg-slate-50/60 border border-slate-200/80 hover:border-blue-400 hover:bg-white hover:shadow-md transition-all duration-200 group"
                >
                  <div>
                    {/* Header: Icon & Category Tag */}
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center border shadow-xs"
                        style={{
                          backgroundColor: portal.iconBg,
                          color: portal.iconColor,
                          borderColor: portal.borderColor,
                        }}
                      >
                        <PortalIcon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
                        {portal.tag}
                      </span>
                    </div>

                    {/* Content: Title & Description */}
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {portal.title}
                    </h4>
                    <p className="text-xs md:text-sm text-slate-600 mt-1.5 leading-relaxed line-clamp-2 min-h-[38px]">
                      {portal.desc}
                    </p>
                  </div>

                  {/* Footer Action Row: Seimbang dan Tombol Jelas Terlihat */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">Modul Terhubung</span>
                    <Link
                      to={portal.to}
                      className="btn-primary-action"
                    >
                      <span>{portal.buttonText}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Schedule Timeline & Announcements (Col span 5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Jadwal Pelajaran Hari Ini (Matching Reference Schedule) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                  <Calendar className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Jadwal Hari Ini</h4>
                  <p className="text-xs text-slate-500">Agenda pembelajaran kelas</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {schedules.length} Sesi Terjadwal
              </span>
            </div>

            {/* Schedule Cards List */}
            <div className="space-y-3">
              {schedules.map((item, index) => {
                const isActive = index === 0;
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#2857e6] text-white shadow-xs'
                        : 'bg-slate-50/70 border border-slate-200/70 hover:bg-white hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Clock className={`w-3.5 h-3.5 ${isActive ? 'text-white/80' : 'text-slate-400'}`} />
                        <span
                          className={`text-xs font-bold ${
                            isActive ? 'text-white' : 'text-slate-700'
                          }`}
                        >
                          {item.jam}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white border border-white/30'
                            : 'bg-slate-200/80 text-slate-700'
                        }`}
                      >
                        {item.status || `Sesi ${index + 1}`}
                      </span>
                    </div>

                    <h5
                      className={`text-sm md:text-base font-bold tracking-tight ${
                        isActive ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {item.mapel}
                    </h5>

                    <div
                      className={`flex items-center gap-3 text-xs mt-1.5 ${
                        isActive ? 'text-white/90' : 'text-slate-500'
                      }`}
                    >
                      <span className="font-medium">{item.guru}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {item.ruang}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Schedule View All Button */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link
                to="/app/siswa"
                className="btn-secondary-action w-full justify-center text-xs md:text-sm font-semibold"
              >
                <CalendarDays className="w-4 h-4 text-blue-600" />
                <span>Lihat Seluruh Kalender Akademik</span>
              </Link>
            </div>
          </div>

          {/* Papan Pengumuman Sekolah */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                  <Bell className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Pengumuman Sekolah</h4>
                  <p className="text-xs text-slate-500">Pemberitahuan terpusat civitas</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live
              </span>
            </div>

            <div className="space-y-3">
              {visibleAnnouncements.length > 0 ? (
                visibleAnnouncements.slice(0, 3).map((ann) => (
                  <div
                    key={ann.id}
                    className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:bg-white hover:border-blue-200 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] md:text-xs uppercase font-bold bg-blue-100 text-blue-800">
                        {ann.target_role === 'all' ? 'Semua Civitas' : ann.target_role}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(ann.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                    <h5 className="text-sm font-bold text-slate-900 mb-1 leading-snug">
                      {ann.title}
                    </h5>
                    <p className="text-xs md:text-sm text-slate-600 leading-relaxed line-clamp-2">
                      {ann.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-5 text-center text-xs md:text-sm text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Belum ada pengumuman baru untuk peran Anda.
                </div>
              )}
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Status Ekosistem</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Tersinkronisasi MySQL
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewView;
