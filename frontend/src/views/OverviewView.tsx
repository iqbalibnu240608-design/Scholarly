import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import {
  Calendar,
  Clock,
  ChevronDown,
  MessageSquare,
  Phone,
  MoreVertical,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  UtensilsCrossed,
  ShoppingBag,
  CreditCard,
  ShieldCheck,
  ExternalLink,
  UserCheck,
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

interface SubjectGrade {
  subject: string;
  shortName: string;
  score: number;
}

// Circular Gauge Component with centered, balanced geometry
const CircularGauge: React.FC<{
  percentage: number;
  label: string;
  color?: string;
}> = ({ percentage, label, color = '#2857e6' }) => {
  const size = 58;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center text-center p-2 rounded-xl bg-slate-50/60 border border-slate-100/80 hover:bg-white hover:border-blue-200 transition-all">
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
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span className="absolute text-xs font-bold text-slate-800">
          {percentage}%
        </span>
      </div>
      <span className="text-[11px] font-semibold text-slate-600 leading-tight truncate max-w-[72px]">
        {label}
      </span>
    </div>
  );
};

export const OverviewView: React.FC = () => {
  const { user, activeRole } = useAuth();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [periodFilter, setPeriodFilter] = useState<string>('Semester Genap');

  // Personalized student data & utility status
  const [studentStats, setStudentStats] = useState<{
    kelas: string;
    waliKelas: string;
    kehadiran: string;
    kehadiranPct: number;
    saldoKopsis: number;
    saldoKantin: number;
    sppStatus: string;
    presensiGerbangJam: string;
  }>({
    kelas: 'XII RPL 1',
    waliKelas: 'Drs. Budi Santoso',
    kehadiran: '95.4',
    kehadiranPct: 95,
    saldoKopsis: 75000,
    saldoKantin: 45000,
    sppStatus: 'Lunas',
    presensiGerbangJam: '06:48 WIB',
  });

  // Today's schedule data
  const [schedules, setSchedules] = useState<ScheduleItem[]>([
    {
      jam: '07:30 - 09:00',
      mapel: 'Pemrograman Web & PBO',
      guru: 'Drs. Budi Santoso',
      ruang: 'Lab RPL 2',
      status: 'Sesi Aktif',
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
      ruang: 'Ruang 204',
      status: 'Sesi 3',
    },
  ]);

  // Subject performance bar chart items
  const subjectGrades: SubjectGrade[] = [
    { subject: 'Algoritma & Struktur Data', shortName: 'Algoritma', score: 85.3 },
    { subject: 'Pemrograman Berorientasi Objek', shortName: 'PBO', score: 64.7 },
    { subject: 'Basis Data Relasional', shortName: 'Basis Data', score: 84.2 },
    { subject: 'Pemrograman Web & Framework', shortName: 'Web Dev', score: 78.0 },
    { subject: 'Mobile Application & API', shortName: 'Mobile', score: 74.4 },
    { subject: 'Machine Learning & Big Data', shortName: 'ML & AI', score: 88.5 },
  ];

  // Visit / Attendance circular gauges
  const visitStats = [
    { label: 'Algoritma', percentage: 92 },
    { label: 'PBO', percentage: 83 },
    { label: 'Basis Data', percentage: 78 },
    { label: 'Web Dev', percentage: 97 },
    { label: 'Mobile App', percentage: 96 },
    { label: 'ML & AI', percentage: 89 },
  ];

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const [resOverview, resWallet, resSiswa] = await Promise.all([
          apiClient.get('/school/overview').catch(() => null),
          apiClient.get('/wallet/balance').catch(() => null),
          apiClient.get('/school/siswa').catch(() => null),
        ]);

        if (resOverview?.data) {
          setData(resOverview.data);
        }

        const siswaData = resSiswa?.data?.data;
        const walletData = resWallet?.data?.wallet;
        const rawKehadiran = siswaData?.presensi_bulan_ini?.persentase ?? '95.4%';
        const parsedPct = parseFloat(rawKehadiran.replace('%', '')) || 95;

        setStudentStats({
          kelas: siswaData?.kelas ?? 'XII RPL 1',
          waliKelas: siswaData?.wali_kelas ?? 'Drs. Budi Santoso',
          kehadiran: rawKehadiran.replace('%', ''),
          kehadiranPct: parsedPct,
          saldoKopsis: walletData?.balance_kopsis ?? 75000,
          saldoKantin: walletData?.balance_kantin ?? 45000,
          sppStatus: siswaData?.tagihan_spp?.status ?? 'Lunas',
          presensiGerbangJam: '06:48 WIB',
        });

        if (siswaData?.jadwal_hari_ini && Array.isArray(siswaData.jadwal_hari_ini) && siswaData.jadwal_hari_ini.length > 0) {
          setSchedules(siswaData.jadwal_hari_ini);
        }
      } catch (err) {
        console.error('Gagal mengambil overview data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, [activeRole]);

  const visibleAnnouncements = (data?.announcements || []).filter(
    (ann) =>
      activeRole === 'admin' ||
      ann.target_role === 'all' ||
      ann.target_role === activeRole
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-sm text-slate-500 font-semibold">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
        Menghubungkan ekosistem SteelSchool...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ============================================================== */}
      {/* 1. HERO GREETING CARD (Presisi, Proporsional, Tidak Di Pojokan) */}
      {/* ============================================================== */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 md:p-8 shadow-xs relative overflow-hidden">
        {/* Soft background ambient gradient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-50 via-blue-50/20 to-transparent rounded-full -mr-16 -mt-16 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl">
            {/* Role & Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200/80 text-blue-700 rounded-full text-xs font-bold mb-3 shadow-2xs">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Siswa Aktif • {studentStats.kelas}</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Halo, {user?.name ? user.name.split(' ')[0] : 'Siswa'}! 👋
            </h2>
            <p className="text-xs md:text-sm text-slate-600 mt-2 leading-relaxed">
              Anda memiliki <strong>{schedules.length} sesi pembelajaran aktif</strong> hari ini. Seluruh presensi RFID gerbang dan dompet digital Anda telah tersinkronisasi otomatis.
            </p>

            <div className="flex items-center gap-3 mt-4 pt-2">
              <Link
                to="/app/siswa"
                className="btn-primary-action text-xs font-semibold"
                style={{ padding: '7.5px 18px' }}
              >
                <span>Buka Rincian Akademik</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 3D Student Character Asset (Centered & Well-Spaced) */}
          <div className="hidden sm:flex items-center justify-center shrink-0 pr-4">
            <div className="relative p-2">
              <div className="w-36 h-36 rounded-full bg-blue-100/50 absolute inset-0 -z-10 filter blur-xs"></div>
              <img
                src="/login-3d-character.svg"
                alt="Student Working Illustration"
                className="w-36 h-36 md:w-40 md:h-40 object-contain select-none pointer-events-none drop-shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. HIGH-EFFICIENCY UTILITY STRIP (Memaksimalkan Fungsi Utility)  */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Utility 1: Saldo Kantin Sehat */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between hover:border-blue-300 transition-all group">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Saldo Kantin</span>
              <span className="text-sm md:text-base font-extrabold text-slate-900 block leading-tight">
                Rp {studentStats.saldoKantin.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
          <Link
            to="/app/kantin"
            className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 hover:bg-blue-600 hover:border-blue-600 hover:text-white text-slate-500 flex items-center justify-center transition-all shrink-0"
            title="Pesan Menu Kantin"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Utility 2: Saldo Koperasi Siswa */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between hover:border-blue-300 transition-all group">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Saldo Kopsis</span>
              <span className="text-sm md:text-base font-extrabold text-slate-900 block leading-tight">
                Rp {studentStats.saldoKopsis.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
          <Link
            to="/app/kopsis"
            className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 hover:bg-blue-600 hover:border-blue-600 hover:text-white text-slate-500 flex items-center justify-center transition-all shrink-0"
            title="Belanja Koperasi ATK"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Utility 3: Presensi Gerbang Satpam (RFID) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between hover:border-blue-300 transition-all group">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Presensi Gerbang</span>
              <span className="text-xs md:text-sm font-extrabold text-emerald-600 block leading-tight">
                {studentStats.presensiGerbangJam} (Tepat Waktu)
              </span>
            </div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 shrink-0"></span>
        </div>

        {/* Utility 4: Status Tagihan SPP */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between hover:border-blue-300 transition-all group">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tagihan SPP</span>
              <span className="text-xs md:text-sm font-extrabold text-blue-600 block leading-tight">
                {studentStats.sppStatus} (Bulan Berjalan)
              </span>
            </div>
          </div>
          <Link
            to="/app/petugas"
            className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 hover:bg-blue-600 hover:border-blue-600 hover:text-white text-slate-500 flex items-center justify-center transition-all shrink-0"
            title="Buku Kas & Kwitansi TU"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. WORKSPACE 2 KOLOM: GRAFIK & STATISTIK (KIRI) | JADWAL (KANAN)*/}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ============================================================== */}
        {/* LEFT / CENTER COLUMN (Col Span 8)                              */}
        {/* ============================================================== */}
        <div className="lg:col-span-8 space-y-6">

          {/* Performance & My Visit Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* Left Box: Performance & Bar Chart (Col Span 7) */}
            <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <h3 className="text-base font-extrabold text-slate-900">Performa Nilai</h3>
                  
                  {/* Interactive Period Filter */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setPeriodFilter(periodFilter === 'Semester Genap' ? 'Semester Ganjil' : 'Semester Genap')}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      <span>{periodFilter}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between px-1">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold block">Mata Pelajaran Terbaik:</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        {studentStats.kehadiran}
                      </span>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        Pemrograman Web
                      </span>
                    </div>
                  </div>
                  <Link
                    to="/app/siswa"
                    className="btn-secondary-action text-xs font-semibold"
                    style={{ padding: '6px 14px' }}
                  >
                    Semua Mapel
                  </Link>
                </div>
              </div>

              {/* Vertical Bar Chart with Balanced Padding (Tidak Mepet Pojokan) */}
              <div className="mt-5 pt-4 border-t border-slate-100 px-2">
                <div className="flex items-end justify-between gap-2.5 h-36">
                  {subjectGrades.map((item, idx) => {
                    const isTop = idx === 0 || idx === 2;
                    return (
                      <div key={idx} className="flex flex-col items-center flex-1 group">
                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 mb-1.5 transition-colors">
                          {item.score}
                        </span>
                        <div className="w-7 sm:w-8 md:w-9 h-24 bg-slate-100 rounded-xl relative flex items-end overflow-hidden p-0.5 shadow-2xs">
                          <div
                            className={`w-full rounded-lg transition-all duration-700 ease-out ${
                              isTop ? 'bg-[#2857e6]' : 'bg-[#3b82f6]'
                            } group-hover:bg-blue-500`}
                            style={{ height: `${(item.score / 100) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-600 mt-2 text-center line-clamp-1 group-hover:text-blue-600">
                          {item.shortName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Box: My visit / Attendance (Col Span 5) */}
            <div className="md:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <h3 className="text-base font-extrabold text-slate-900">Kehadiran (Presensi)</h3>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    Bulan Ini
                  </span>
                </div>

                {/* 2x3 Centered Circular Gauges */}
                <div className="grid grid-cols-2 gap-2.5 my-1">
                  {visitStats.map((stat, idx) => (
                    <CircularGauge
                      key={idx}
                      percentage={stat.percentage}
                      label={stat.label}
                      color="#2857e6"
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-1">
                <span>Rata-Rata Disiplin</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 95.8% Tepat Waktu
                </span>
              </div>
            </div>
          </div>

          {/* Linked Teachers / Wali Kelas (Presisi, Berjarak Aman dari Sudut) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">
                Guru Pengajar & Pembimbing
              </h3>
              <Link
                to="/app/siswa"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Lihat Semua Guru
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Teacher 1: Wali Kelas */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-xs shadow-2xs">
                    BS
                  </div>
                  <div>
                    <h4 className="text-xs md:text-sm font-bold text-slate-900 leading-snug">
                      {studentStats.waliKelas}
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium block">
                      Wali Kelas • Pemrograman Web
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full bg-white border border-slate-200/80 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center shadow-2xs transition-all"
                    title="Kirim Pesan"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full bg-white border border-slate-200/80 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center shadow-2xs transition-all"
                    title="Kontak Telepon"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Teacher 2: Guru Mapel */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-xs shadow-2xs">
                    SR
                  </div>
                  <div>
                    <h4 className="text-xs md:text-sm font-bold text-slate-900 leading-snug">
                      Siti Rahmawati, S.Kom
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium block">
                      Guru Pengampu • Basis Data
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full bg-white border border-slate-200/80 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center shadow-2xs transition-all"
                    title="Kirim Pesan"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full bg-white border border-slate-200/80 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center shadow-2xs transition-all"
                    title="Kontak Telepon"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: CALENDAR & UPCOMING EVENTS (Col Span 4)          */}
        {/* ============================================================== */}
        <div className="lg:col-span-4 space-y-6">

          {/* 1. CALENDAR / TODAY'S SCHEDULE (Presisi & Rapi) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Jadwal Kelas</h3>
                <span className="text-xs text-slate-500">{schedules.length} Sesi Terjadwal</span>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-slate-700 bg-slate-100">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Hari Ini</span>
              </span>
            </div>

            {/* Vertical Timeline */}
            <div className="space-y-3">
              {schedules.map((item, index) => {
                const isActive = index === 0;
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#2857e6] text-white shadow-sm'
                        : 'bg-slate-50/80 border border-slate-200/70 hover:bg-white hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Clock className={`w-3.5 h-3.5 ${isActive ? 'text-white/80' : 'text-slate-400'}`} />
                        <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-600'}`}>
                          {item.jam}
                        </span>
                      </div>
                      {isActive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                          Sesi Aktif
                        </span>
                      )}
                    </div>

                    <h4 className={`text-sm font-bold tracking-tight ${isActive ? 'text-white' : 'text-slate-900'}`}>
                      {item.mapel}
                    </h4>

                    <span className={`text-xs block mt-1 ${isActive ? 'text-white/85' : 'text-slate-500'}`}>
                      {item.guru} • {item.ruang}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link
                to="/app/siswa"
                className="btn-secondary-action w-full justify-center text-xs font-semibold"
                style={{ padding: '7.5px 14px' }}
              >
                <span>Lihat Seluruh Kalender Akademik →</span>
              </Link>
            </div>
          </div>

          {/* 2. UPCOMING EVENTS / PENGUMUMAN (Tata Letak Presisi) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Agenda & Acara</h3>
              <Link
                to="/app/siswa"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Lihat Semua
              </Link>
            </div>

            <div className="space-y-3">
              {visibleAnnouncements.length > 0 ? (
                visibleAnnouncements.slice(0, 2).map((ann) => (
                  <div
                    key={ann.id}
                    className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:bg-white hover:border-blue-200 transition-all flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs md:text-sm font-bold text-slate-900 truncate leading-snug">
                        {ann.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {ann.content}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1.5 font-medium">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>
                          {new Date(ann.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-slate-300 hover:text-slate-500 p-1"
                      title="Opsi"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs md:text-sm font-bold text-slate-900">
                      Pekan Ujian & Workshop Digital
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Persiapan ujian akhir semester terpadu berbasis Computer Based Test (CBT).
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      14 Desember 2026 • 12:00 WIB
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OverviewView;
