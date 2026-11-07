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

// Circular Gauge Component matching the Reference Dashboard
const CircularGauge: React.FC<{
  percentage: number;
  label: string;
  color: string;
  sublabel?: string;
}> = ({ percentage, label, color, sublabel }) => {
  const size = 52;
  const strokeWidth = 4.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-white hover:border-blue-200 hover:shadow-xs transition-all">
      <div className="relative inline-flex items-center justify-center mb-1.5" style={{ width: size, height: size }}>
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
          />
        </svg>
        <span className="absolute text-[11px] font-extrabold text-slate-800">
          {percentage}%
        </span>
      </div>
      <span className="text-[11px] font-bold text-slate-800 leading-tight">
        {label}
      </span>
      {sublabel && (
        <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
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
        ? 'Jadwal kelas harian, presensi, rapor berkala & tugas mandiri'
        : 'Jadwal pelajaran, nilai, presensi & saldo digital siswa',
      buttonText: 'Buka Portal',
      allowedRoles: ['admin', 'siswa', 'guru', 'kepsek', 'petugas'],
    },
    {
      to: '/app/kantin',
      icon: UtensilsCrossed,
      iconBg: '#eff6ff',
      iconColor: '#0284c7',
      borderColor: '#bae6fd',
      title: isStudent || activeRole === 'guru' ? 'Pesan Makanan Kantin' : 'Kasir Stan Kantin',
      desc: isStudent || activeRole === 'guru'
        ? 'Pesan aneka menu makanan lezat cashless dari saldo dompet Anda'
        : 'Kelola menu stan kantin, stok, & antrean pesanan siswa',
      buttonText: 'Menuju Kantin',
      allowedRoles: ['admin', 'kantin', 'siswa', 'guru'],
    },
    {
      to: '/app/kopsis',
      icon: ShoppingBag,
      iconBg: '#eff6ff',
      iconColor: '#4f46e5',
      borderColor: '#c7d2fe',
      title: isStudent || activeRole === 'guru' ? 'Koperasi Siswa (Kopsis)' : 'Kasir POS Koperasi',
      desc: isStudent || activeRole === 'guru'
        ? 'Belanja perlengkapan alat tulis (ATK), atribut seragam & buku'
        : 'Kasir POS penjualan langsung, inventaris ATK, & mutasi omset',
      buttonText: 'Buka Koperasi',
      allowedRoles: ['admin', 'kopsis', 'siswa', 'guru'],
    },
    {
      to: '/app/petugas',
      icon: FileSpreadsheet,
      iconBg: '#eff6ff',
      iconColor: '#0d9488',
      borderColor: '#99f6e4',
      title: isStudent ? 'Layanan SPP & Administrasi' : 'Tata Usaha (TU & SPP)',
      desc: isStudent
        ? 'Cek status pembayaran SPP bulanan & kuitansi sah digital'
        : 'Buku kas pembayaran SPP, arsip kwitansi, & verifikasi transaksi',
      buttonText: 'Layanan TU',
      allowedRoles: ['admin', 'petugas', 'siswa'],
    },
    {
      to: '/app/perpus',
      icon: BookMarked,
      iconBg: '#eff6ff',
      iconColor: '#7c3aed',
      borderColor: '#ddd6fe',
      title: isStudent ? 'Perpustakaan (E-Library)' : 'Portal Pustakawan',
      desc: isStudent
        ? 'Katalog buku pelajaran, peminjaman 7/14 hari & countdown jatuh tempo'
        : 'Inventaris koleksi buku rak, sirkulasi peminjaman, & pengembalian',
      buttonText: 'E-Library',
      allowedRoles: ['admin', 'perpustakaan', 'siswa', 'guru'],
    },
    {
      to: '/app/guru',
      icon: BookOpen,
      iconBg: '#eff6ff',
      iconColor: '#1d4ed8',
      borderColor: '#bfdbfe',
      title: 'Portal Dewan Guru',
      desc: 'Input nilai evaluasi (Tugas/UH/PTS/PAS) & rekap absensi rombel',
      buttonText: 'Portal Guru',
      allowedRoles: ['admin', 'guru', 'kepsek'],
    },
    {
      to: '/app/kepsek',
      icon: Award,
      iconBg: '#eff6ff',
      iconColor: '#b45309',
      borderColor: '#fde68a',
      title: 'Monitoring Kepala Sekolah',
      desc: 'Dashboard KPI eksekutif, rekap kehadiran sekolah & omset unit',
      buttonText: 'Monitoring',
      allowedRoles: ['admin', 'kepsek'],
    },
    {
      to: '/app/security',
      icon: Shield,
      iconBg: '#eff6ff',
      iconColor: '#334155',
      borderColor: '#cbd5e1',
      title: 'Presensi Gerbang Satpam',
      desc: 'Gate check-in RFID & NISN gerbang utama, deteksi keterlambatan',
      buttonText: 'Pos Satpam',
      allowedRoles: ['admin', 'security'],
    },
    {
      to: '/app/admin',
      icon: Settings,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
      borderColor: '#bfdbfe',
      title: 'Manajemen Sistem & Role',
      desc: 'Manajemen master akun pengguna, penugasan role dinamis & log',
      buttonText: 'Panel Admin',
      allowedRoles: ['admin'],
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
      {/* 1. GREETING HERO CARD (Reference Layout with 3D Character)    */}
      {/* ============================================================== */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-blue-100 p-6 md:p-8 shadow-xs">
        {/* Soft background blue ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-100/50 via-blue-50/20 to-transparent rounded-full -mr-16 -mt-16 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            {/* Status Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200/80 text-blue-700 rounded-full text-xs font-bold mb-3 shadow-xs">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>
                {isStudent
                  ? `Siswa Aktif • ${studentStats.kelas}`
                  : `Sesi: ${ROLE_LABELS[activeRole] || activeRole}`}
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Halo, {user?.name || (isAdmin ? 'Administrator' : 'Civitas SteelSchool')}! 👋
            </h2>
            <p className="text-xs md:text-sm text-slate-600 mt-1.5 leading-relaxed">
              {isStudent
                ? `Selamat datang kembali! Seluruh kegiatan akademik, presensi gerbang, dan transaksi dompet digital Anda telah tersinkronisasi otomatis.`
                : 'Sistem operasional sekolah terpadu aktif. Akses seluruh data civitas, rombel, dan unit transaksi dengan aman.'}
            </p>

            {/* Quick Micro-Pill Action Buttons (Refined Sizing, Tidak Kegedean) */}
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100">
              {isStudent ? (
                <>
                  <Link to="/app/kantin" className="btn-primary-action text-xs" style={{ padding: '6px 14px' }}>
                    <UtensilsCrossed size={13} /> Pesan Kantin
                  </Link>
                  <Link to="/app/kopsis" className="btn-secondary-action text-xs" style={{ padding: '6px 14px' }}>
                    <ShoppingBag size={13} /> Belanja Kopsis
                  </Link>
                  <Link to="/app/petugas" className="btn-secondary-action text-xs" style={{ padding: '6px 14px' }}>
                    <CreditCard size={13} /> Bayar SPP
                  </Link>
                  <Link to="/app/perpus" className="btn-secondary-action text-xs" style={{ padding: '6px 14px' }}>
                    <BookMarked size={13} /> E-Library
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/app/siswa" className="btn-primary-action text-xs" style={{ padding: '6px 14px' }}>
                    <GraduationCap size={13} /> Data Siswa
                  </Link>
                  <Link to="/app/guru" className="btn-secondary-action text-xs" style={{ padding: '6px 14px' }}>
                    <BookOpen size={13} /> Jurnal Guru
                  </Link>
                  <Link to="/app/kantin" className="btn-secondary-action text-xs" style={{ padding: '6px 14px' }}>
                    <UtensilsCrossed size={13} /> Stan Kantin
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* 3D Character from Reference Asset */}
          <div className="hidden md:flex items-center justify-center shrink-0 pr-2">
            <div className="relative">
              <div className="w-36 h-36 rounded-full bg-blue-100/60 absolute -bottom-1 -left-1 -z-10 filter blur-xs"></div>
              <img
                src="/login-3d-character.svg"
                alt="3D Student Character"
                className="w-36 h-36 lg:w-40 lg:h-40 object-contain drop-shadow-md select-none pointer-events-none transform hover:scale-105 transition-transform"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. ACADEMIC & PERFORMANCE GAUGES (Reference Pattern)           */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Large Score Card (Col Span 5) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {isStudent ? 'Indeks Kedisiplinan & Prestasi' : 'Statistik Civitas Terdaftar'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Semester Genap
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl md:text-4xl font-extrabold text-blue-600 tracking-tight">
                {isStudent ? studentStats.kehadiran : `${data?.metrics?.total_siswa || 348}`}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {isStudent ? 'Rata-Rata Kehadiran' : 'Siswa Aktif Terdata'}
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {isStudent
                ? `Catatan presensi gerbang satpam dan kelas menunjukkan performa disiplin sangat baik (${studentStats.kehadiranPct}% hadir tepat waktu).`
                : `Total ${data?.metrics?.total_guru || 24} tenaga pendidik dan ${data?.metrics?.total_kelas || 12} rombongan belajar aktif dalam sistem.`}
            </p>
          </div>

          {/* Micro Progress Bars */}
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                <span>Ketepatan Waktu Presensi</span>
                <span className="font-bold text-blue-600">{studentStats.kehadiran}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-700"
                  style={{ width: `${studentStats.kehadiranPct}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                <span>Penyelesaian Tugas & Evaluasi</span>
                <span className="font-bold text-indigo-600">89.4%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '89.4%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Circular Gauges / Key Metrics (Col Span 7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Indikator Performa & Saldo Layanan</span>
              </h3>
              <p className="text-[11px] text-slate-500">Parameter harian terintegrasi otomatis</p>
            </div>
            {isStudent && (
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <Check className="w-3 h-3" /> SPP {studentStats.spp_status}
              </span>
            )}
          </div>

          {/* 4 Radial Gauges matching Reference */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-1">
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

          {/* Bottom Micro Summary Bar */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                Kopsis: <strong className="text-blue-600">Rp {studentStats.saldo_kopsis.toLocaleString('id-ID')}</strong>
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                <UtensilsCrossed className="w-3.5 h-3.5 text-sky-600" />
                Kantin: <strong className="text-sky-600">Rp {studentStats.saldo_kantin.toLocaleString('id-ID')}</strong>
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Saldo Dompet Terverifikasi</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. TWO-COLUMN WORKSPACE: MODULES (LEFT) & SCHEDULE (RIGHT)     */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Modul Civitas Terpadu (Col span 7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Modul Layanan Civitas</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih modul kerja sesuai hak akses peran Anda
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {visiblePortals.length} Modul Terbuka
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {visiblePortals.map((portal, idx) => {
              const PortalIcon = portal.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col justify-between p-4 rounded-xl bg-slate-50/60 border border-slate-200/80 hover:border-blue-400 hover:bg-white hover:shadow-md transition-all duration-200 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center border shadow-xs"
                        style={{
                          backgroundColor: portal.iconBg,
                          color: portal.iconColor,
                          borderColor: portal.borderColor,
                        }}
                      >
                        <PortalIcon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-600 transition-colors">
                        Aktif
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {portal.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                      {portal.desc}
                    </p>
                  </div>

                  {/* Refined Pill Button (Tidak Kegedean, Sangat Jelas Tombol) */}
                  <div className="mt-3.5 pt-2 border-t border-slate-100/80 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-400">Modul Terhubung</span>
                    <Link
                      to={portal.to}
                      className="btn-primary-action text-xs"
                      style={{ padding: '5.5px 13px', fontSize: '11px' }}
                    >
                      <span>{portal.buttonText}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
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
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Jadwal Hari Ini</h4>
                  <p className="text-[10px] text-slate-500">Agenda pembelajaran aktif</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {schedules.length} Sesi
              </span>
            </div>

            {/* Schedule Cards List */}
            <div className="space-y-2.5">
              {schedules.map((item, index) => {
                const isActive = index === 0;
                return (
                  <div
                    key={index}
                    className={`p-3.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#2857e6] text-white shadow-xs'
                        : 'bg-slate-50/70 border border-slate-200/70 hover:bg-white hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className={`w-3.5 h-3.5 ${isActive ? 'text-white/80' : 'text-slate-400'}`} />
                        <span
                          className={`text-[11px] font-bold ${
                            isActive ? 'text-white' : 'text-slate-600'
                          }`}
                        >
                          {item.jam}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white border border-white/30'
                            : 'bg-slate-200/80 text-slate-700'
                        }`}
                      >
                        {item.status || `Sesi ${index + 1}`}
                      </span>
                    </div>

                    <h5
                      className={`text-xs font-bold tracking-tight ${
                        isActive ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {item.mapel}
                    </h5>

                    <div
                      className={`flex items-center gap-3 text-[11px] mt-1 ${
                        isActive ? 'text-white/80' : 'text-slate-500'
                      }`}
                    >
                      <span>{item.guru}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {item.ruang}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Papan Pengumuman Sekolah */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Pengumuman Sekolah</h4>
                  <p className="text-[10px] text-slate-500">Pemberitahuan terpusat</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live
              </span>
            </div>

            <div className="space-y-2.5">
              {visibleAnnouncements.length > 0 ? (
                visibleAnnouncements.slice(0, 3).map((ann) => (
                  <div
                    key={ann.id}
                    className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:bg-white hover:border-blue-200 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold bg-blue-100 text-blue-800">
                        {ann.target_role === 'all' ? 'Semua Civitas' : ann.target_role}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(ann.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 mb-0.5">
                      {ann.title}
                    </h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                      {ann.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Belum ada pengumuman baru untuk peran Anda.
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Status Ekosistem</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Tersinkronisasi
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewView;
