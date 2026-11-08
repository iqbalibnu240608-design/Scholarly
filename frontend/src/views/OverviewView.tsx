import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import {
  Calendar,
  Clock,
  Phone,
  ArrowRight,
  Sparkles,
  UtensilsCrossed,
  ShoppingBag,
  CreditCard,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  BookMarked,
  X,
  Mail,
  Building,
  Users,
  MessageCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

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

interface TeacherContact {
  name: string;
  role: string;
  initials: string;
  phone: string;
  email: string;
  ruang: string;
}

export const OverviewView: React.FC = () => {
  const { user, activeRole } = useAuth();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Contact Modal State
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherContact | null>(null);

  // Personalized student data & utility status
  const [studentStats, setStudentStats] = useState<{
    kelas: string;
    waliKelas: string;
    saldoKopsis: number;
    saldoKantin: number;
    sppStatus: string;
    presensiGerbangJam: string;
  }>({
    kelas: 'XII RPL 1',
    waliKelas: 'Drs. Budi Santoso',
    saldoKopsis: 75000,
    saldoKantin: 45000,
    sppStatus: 'Lunas',
    presensiGerbangJam: '06:48 WIB',
  });

  // Today's schedule data
  const [schedules, setSchedules] = useState<ScheduleItem[]>([
    {
      jam: '07:30 - 09:00 WIB',
      mapel: 'Pemrograman Web & Framework',
      guru: 'Drs. Budi Santoso',
      ruang: 'Lab Komputer 2',
      status: 'Sedang Berlangsung',
    },
    {
      jam: '09:15 - 10:45 WIB',
      mapel: 'Basis Data & SQL Terapan',
      guru: 'Siti Rahmawati, S.Kom',
      ruang: 'Lab RPL 1',
      status: 'Sesi Berikutnya',
    },
    {
      jam: '11:00 - 12:30 WIB',
      mapel: 'Matematika Terapan & Logika',
      guru: 'Hendra Wijaya, M.Pd',
      ruang: 'Ruang Teori 204',
      status: 'Sesi Siang',
    },
  ]);

  const teachersList: TeacherContact[] = [
    {
      name: studentStats.waliKelas,
      role: 'Wali Kelas • Pemrograman Web',
      initials: 'BS',
      phone: '+62 812-3456-7891',
      email: 'budi.santoso@steelschool.sch.id',
      ruang: 'Ruang Guru Lt. 2',
    },
    {
      name: 'Siti Rahmawati, S.Kom',
      role: 'Guru Pengampu • Basis Data',
      initials: 'SR',
      phone: '+62 813-9876-5432',
      email: 'siti.rahmawati@steelschool.sch.id',
      ruang: 'Lab Komputer 1',
    },
    {
      name: 'Hendra Wijaya, M.Pd',
      role: 'Guru Pengampu • Matematika',
      initials: 'HW',
      phone: '+62 821-1122-3344',
      email: 'hendra.wijaya@steelschool.sch.id',
      ruang: 'Ruang Guru Lt. 1',
    },
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

        setStudentStats({
          kelas: siswaData?.kelas ?? 'XII RPL 1',
          waliKelas: siswaData?.wali_kelas ?? 'Drs. Budi Santoso',
          saldoKopsis: walletData?.balance_kopsis ?? 75000,
          saldoKantin: walletData?.balance_kantin ?? 45000,
          sppStatus: siswaData?.tagihan_spp?.status ?? 'Lunas',
          presensiGerbangJam: '06:48 WIB',
        });

        if (
          siswaData?.jadwal_hari_ini &&
          Array.isArray(siswaData.jadwal_hari_ini) &&
          siswaData.jadwal_hari_ini.length > 0
        ) {
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

  const isStudent = activeRole === 'siswa';

  const displayName = user?.name
    ? user.name.toLowerCase().includes('admin')
      ? 'Administrator'
      : user.name.split(' ')[0]
    : 'Civitas';

  const copyContact = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} disalin ke clipboard!`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[420px] text-sm text-slate-500 font-semibold">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
        Menghubungkan ekosistem Smart SteelSchool...
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-[1400px] mx-auto text-slate-800">
      {/* ============================================================== */}
      {/* 1. WELCOME CARD (Bersih, Rapi, Lega)                           */}
      {/* ============================================================== */}
      <section className="rounded-2xl bg-white border border-slate-200/80 p-6 md:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-50/80 via-blue-50/20 to-transparent rounded-full -mr-16 -mt-16 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            {/* Tag Peran & Tanggal */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200/80 text-blue-700 rounded-lg text-xs font-bold leading-none">
                <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>
                  {isStudent
                    ? `Siswa Aktif • ${studentStats.kelas}`
                    : `Sistem Operasional • ${activeRole.toUpperCase()}`}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold leading-none">
                <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>
                  {new Date().toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </span>
            </div>

            {/* Sapaan Utama */}
            <h1 className="text-2xl md:text-[28px] font-extrabold text-slate-900 tracking-tight leading-tight">
              Halo, {displayName}! 👋
            </h1>

            <p className="text-[13.5px] md:text-[14px] text-slate-600 mt-2 leading-relaxed">
              {isStudent
                ? `Selamat datang di portal akademik Smart SteelSchool. Presensi gerbang RFID dan dompet cashless Anda telah aktif dan tersinkronisasi realtime.`
                : `Selamat datang di portal operasional Smart SteelSchool. Seluruh layanan akademik, administrasi TU, kasir koperasi, kantin, dan presensi terhubung realtime.`}
            </p>

            {/* Tombol Aksi */}
            <div className="flex items-center gap-3 mt-4 pt-1">
              <Link
                to={isStudent ? '/app/siswa' : `/app/${activeRole}`}
                className="btn-primary-action text-xs font-bold leading-none gap-2 inline-flex items-center justify-center shrink-0 shadow-sm"
              >
                <span>
                  {isStudent ? 'Buka Portal Akademik' : `Kelola Modul ${activeRole.toUpperCase()}`}
                </span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>
          </div>

          {/* Ilustrasi 3D Siswa */}
          <div className="hidden sm:flex items-center justify-center shrink-0 pr-2">
            <img
              src="/login-3d-character.svg"
              alt="Student Character"
              className="w-32 h-32 md:w-36 md:h-36 object-contain select-none pointer-events-none drop-shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. SUMMARY CARDS (4 Kartu Statistik Sejajar & Simetris)        */}
      {/* ============================================================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        {isStudent ? (
          <>
            {/* Saldo Kantin */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between hover:border-blue-300 transition-all">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
                  <UtensilsCrossed className="w-5 h-5 shrink-0" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                    Saldo Kantin
                  </span>
                  <span className="text-[20px] font-extrabold text-slate-900 block leading-tight mt-0.5 truncate tracking-tight">
                    Rp {studentStats.saldoKantin.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium block mt-0.5 truncate">
                    Kantin Sehat Cashless
                  </span>
                </div>
              </div>
              <Link
                to="/app/kantin"
                className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 hover:bg-blue-600 hover:border-blue-600 hover:text-white text-slate-500 inline-flex items-center justify-center transition-all shrink-0 p-0 ml-2"
                title="Pesan Menu Kantin"
              >
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>

            {/* Saldo Koperasi */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between hover:border-blue-300 transition-all">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5 shrink-0" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                    Saldo Koperasi
                  </span>
                  <span className="text-[20px] font-extrabold text-slate-900 block leading-tight mt-0.5 truncate tracking-tight">
                    Rp {studentStats.saldoKopsis.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium block mt-0.5 truncate">
                    Belanja ATK & Seragam
                  </span>
                </div>
              </div>
              <Link
                to="/app/kopsis"
                className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 hover:bg-blue-600 hover:border-blue-600 hover:text-white text-slate-500 inline-flex items-center justify-center transition-all shrink-0 p-0 ml-2"
                title="Belanja Koperasi Siswa"
              >
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>

            {/* Presensi Gerbang */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between hover:border-blue-300 transition-all">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                    Presensi Gerbang
                  </span>
                  <span className="text-[20px] font-extrabold text-slate-900 block leading-tight mt-0.5 truncate tracking-tight">
                    {studentStats.presensiGerbangJam}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 block mt-0.5 truncate">
                    ✓ Gate 1 Tepat Waktu
                  </span>
                </div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 shrink-0 ml-2"></span>
            </div>

            {/* Tagihan SPP */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between hover:border-blue-300 transition-all">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 shrink-0" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                    Status SPP
                  </span>
                  <span className="text-[20px] font-extrabold text-blue-600 block leading-tight mt-0.5 truncate tracking-tight">
                    {studentStats.sppStatus}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium block mt-0.5 truncate">
                    Bulan Berjalan Lunas
                  </span>
                </div>
              </div>
              <Link
                to="/app/petugas"
                className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 hover:bg-blue-600 hover:border-blue-600 hover:text-white text-slate-500 inline-flex items-center justify-center transition-all shrink-0 p-0 ml-2"
                title="Buku Kas & Kwitansi TU"
              >
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>
          </>
        ) : (
          /* Metrik Guru / Admin / Staf */
          <>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 shrink-0" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                    Total Siswa
                  </span>
                  <span className="text-[20px] font-extrabold text-slate-900 block leading-tight mt-0.5 truncate tracking-tight">
                    {data?.metrics?.total_siswa ?? 2} Siswa
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium block mt-0.5 truncate">
                    Terdaftar Aktif
                  </span>
                </div>
              </div>
              <Link to="/app/siswa" className="text-blue-600 hover:underline text-xs font-bold shrink-0 ml-2">
                Detail
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 shrink-0" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                    Dewan Guru
                  </span>
                  <span className="text-[20px] font-extrabold text-slate-900 block leading-tight mt-0.5 truncate tracking-tight">
                    {data?.metrics?.total_guru ?? 1} Pengajar
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium block mt-0.5 truncate">
                    Pengajar Aktif
                  </span>
                </div>
              </div>
              <Link to="/app/guru" className="text-blue-600 hover:underline text-xs font-bold shrink-0 ml-2">
                Detail
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                  <Building className="w-5 h-5 shrink-0" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                    Rombel Kelas
                  </span>
                  <span className="text-[20px] font-extrabold text-slate-900 block leading-tight mt-0.5 truncate tracking-tight">
                    {data?.metrics?.total_kelas ?? 5} Rombel
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium block mt-0.5 truncate">
                    Ruang Belajar Aktif
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg shrink-0 ml-2">
                Normal
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                    Koneksi Server
                  </span>
                  <span className="text-[20px] font-extrabold text-emerald-600 block leading-tight mt-0.5 truncate tracking-tight">
                    Online
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 block mt-0.5 truncate">
                    ✓ Realtime 100%
                  </span>
                </div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 shrink-0 ml-2"></span>
            </div>
          </>
        )}
      </section>

      {/* ============================================================== */}
      {/* 3. WORKSPACE 2 KOLOM (Layanan Cepat di Kiri & Jadwal di Kanan) */}
      {/* ============================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ============================================================ */}
        {/* KOLOM KIRI (Col Span 7): LAYANAN & AKSES CEPAT SEKOLAH        */}
        {/* ============================================================ */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-slate-100">
                <div>
                  <h2 className="text-[18px] font-extrabold text-slate-900 tracking-tight">
                    Layanan & Akses Cepat Sekolah
                  </h2>
                  <p className="text-[12.5px] text-slate-500 mt-1">
                    Pintasan langsung ke modul operasional ekosistem Smart SteelSchool.
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg shrink-0">
                  4 Layanan
                </span>
              </div>

              {/* Grid 4 Modul Layanan (2 Kolom x 2 Baris yang Sangat Bersih) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Akademik */}
                <Link
                  to="/app/siswa"
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all group flex flex-col justify-between no-underline"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shrink-0">
                      <GraduationCap className="w-5 h-5 shrink-0" />
                    </div>
                    <h3 className="text-[14.5px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      Akademik & Nilai
                    </h3>
                    <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
                      Pantau buku nilai semester, rekap absensi, dan jadwal ujian.
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-blue-600 mt-3 pt-2.5 border-t border-slate-100/90 group-hover:translate-x-0.5 transition-transform">
                    <span>Buka Layanan</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </div>
                </Link>

                {/* 2. Kantin Sehat */}
                <Link
                  to="/app/kantin"
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all group flex flex-col justify-between no-underline"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shrink-0">
                      <UtensilsCrossed className="w-5 h-5 shrink-0" />
                    </div>
                    <h3 className="text-[14.5px] font-bold text-slate-900 group-hover:text-amber-600 transition-colors leading-snug">
                      Kantin Sehat Cashless
                    </h3>
                    <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
                      Pesan menu makan siang sehat tanpa perlu membawa uang tunai.
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-600 mt-3 pt-2.5 border-t border-slate-100/90 group-hover:translate-x-0.5 transition-transform">
                    <span>Pesan Menu</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </div>
                </Link>

                {/* 3. Koperasi Siswa */}
                <Link
                  to="/app/kopsis"
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all group flex flex-col justify-between no-underline"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shrink-0">
                      <ShoppingBag className="w-5 h-5 shrink-0" />
                    </div>
                    <h3 className="text-[14.5px] font-bold text-slate-900 group-hover:text-emerald-600 transition-colors leading-snug">
                      Koperasi Siswa (ATK)
                    </h3>
                    <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
                      Belanja buku panduan, alat tulis ujian, dan seragam sekolah.
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 mt-3 pt-2.5 border-t border-slate-100/90 group-hover:translate-x-0.5 transition-transform">
                    <span>Belanja Kopsis</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </div>
                </Link>

                {/* 4. E-Library */}
                <Link
                  to="/app/perpus"
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all group flex flex-col justify-between no-underline"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shrink-0">
                      <BookMarked className="w-5 h-5 shrink-0" />
                    </div>
                    <h3 className="text-[14.5px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                      E-Library & Modul
                    </h3>
                    <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
                      Peminjaman e-book kejuruan, jurnal ilmiah, dan modul digital.
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 mt-3 pt-2.5 border-t border-slate-100/90 group-hover:translate-x-0.5 transition-transform">
                    <span>Pinjam Buku</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </div>
                </Link>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Kartu Pelajar RFID aktif dan terverifikasi untuk seluruh modul.</span>
              <span className="font-bold text-blue-600">Terhubung</span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* KOLOM KANAN (Col Span 5): JADWAL KELAS HARI INI               */}
        {/* ============================================================ */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-slate-100">
                <div>
                  <h2 className="text-[18px] font-extrabold text-slate-900 tracking-tight">
                    Jadwal Kelas Hari Ini
                  </h2>
                  <p className="text-[12.5px] text-slate-500 mt-1">
                    {schedules.length} sesi pembelajaran aktif semester berjalan.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Hari Ini</span>
                </span>
              </div>

              {/* Daftar Jadwal yang Rapi, Bersih, dan Tenang */}
              <div className="space-y-3">
                {schedules.map((item, index) => {
                  const isActive = index === 0;
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-blue-50/60 border-blue-200 shadow-2xs'
                          : 'bg-slate-50/60 border-slate-200/70 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <Clock
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isActive ? 'text-blue-600' : 'text-slate-400'
                            }`}
                          />
                          <span
                            className={`text-xs font-bold leading-none ${
                              isActive ? 'text-blue-700' : 'text-slate-600'
                            }`}
                          >
                            {item.jam}
                          </span>
                        </div>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md shrink-0 leading-none ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'bg-slate-200/80 text-slate-600'
                          }`}
                        >
                          {isActive ? 'Aktif Sekarang' : `Sesi ${index + 1}`}
                        </span>
                      </div>

                      <h3 className="text-[14.5px] font-bold tracking-tight text-slate-900 leading-snug">
                        {item.mapel}
                      </h3>

                      <span className="text-xs block mt-1.5 leading-normal text-slate-500 font-medium">
                        {item.guru} • {item.ruang}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100">
              <Link
                to="/app/siswa"
                className="btn-secondary-action w-full justify-center text-xs font-semibold"
              >
                <span>Lihat Seluruh Kalender Akademik →</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. BOTTOM SECTION: GURU PENGAJAR & PENGUMUMAN RESMI            */}
      {/* ============================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom 1: Guru Pengajar & Pembimbing */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3.5 mb-4.5 border-b border-slate-100">
            <div>
              <h2 className="text-[18px] font-extrabold text-slate-900 tracking-tight">
                Guru Pengajar & Pembimbing
              </h2>
              <p className="text-[12.5px] text-slate-500 mt-1">
                Kontak langsung wali kelas dan guru pembimbing akademik.
              </p>
            </div>
            <Link
              to="/app/siswa"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors shrink-0"
            >
              Lihat Semua →
            </Link>
          </div>

          <div className="space-y-3">
            {teachersList.map((teacher, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-xs shadow-2xs shrink-0">
                    {teacher.initials}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[14px] font-bold text-slate-900 leading-snug truncate">
                      {teacher.name}
                    </h3>
                    <span className="text-[11.5px] text-slate-500 font-medium block truncate mt-0.5">
                      {teacher.role} • {teacher.ruang}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedTeacher(teacher)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs transition-all"
                    title="Buka Detail Kontak & WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Kontak</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => copyContact(teacher.phone, `Nomor ${teacher.name}`)}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-600 inline-flex items-center justify-center shadow-2xs transition-all shrink-0 p-0 leading-none text-slate-500"
                    title="Salin Kontak Telepon"
                  >
                    <Phone className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom 2: Agenda & Acara Sekolah */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3.5 mb-4.5 border-b border-slate-100">
            <div>
              <h2 className="text-[18px] font-extrabold text-slate-900 tracking-tight">
                Agenda & Acara Sekolah
              </h2>
              <p className="text-[12.5px] text-slate-500 mt-1">
                Informasi resmi dan agenda kegiatan civitas akademik.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg shrink-0">
              Terkini
            </span>
          </div>

          <div className="space-y-3">
            {visibleAnnouncements.length > 0 ? (
              visibleAnnouncements.slice(0, 3).map((ann) => (
                <div
                  key={ann.id}
                  className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:bg-white hover:border-blue-200 transition-all flex items-start gap-3.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5 shrink-0" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-[14px] font-bold text-slate-900 line-clamp-1 leading-snug">
                        {ann.title}
                      </h3>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md shrink-0">
                        {ann.target_role.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-500 line-clamp-2 leading-relaxed">
                      {ann.content}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2 font-medium leading-none">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {new Date(ann.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="w-5 h-5 shrink-0" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-[14px] font-bold text-slate-900 leading-snug">
                        Pekan Ujian Akhir Semester CBT
                      </h3>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md shrink-0">
                        AKADEMIK
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-500 leading-relaxed">
                      Persiapan ujian akhir semester terpadu berbasis Computer Based Test (CBT) di laboratorium komputer.
                    </p>
                    <span className="text-[11px] text-slate-400 block mt-2 font-medium leading-none">
                      14 - 19 Desember 2026 • 07:30 WIB
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100/70 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5 shrink-0" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-[14px] font-bold text-slate-900 leading-snug">
                        Workshop Digital & Cloud Computing
                      </h3>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md shrink-0">
                        KEJURUAN
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-500 leading-relaxed">
                      Pelatihan teknologi cloud infrastructure dan modern web development bersama praktisi industri.
                    </p>
                    <span className="text-[11px] text-slate-400 block mt-2 font-medium leading-none">
                      22 Desember 2026 • 09:00 WIB
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. MODAL INTERAKTIF KONTAK GURU                                */}
      {/* ============================================================== */}
      {selectedTeacher && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in"
          onClick={() => setSelectedTeacher(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full border border-slate-200/90 shadow-2xl overflow-hidden p-6 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-xs shrink-0">
                  {selectedTeacher.initials}
                </div>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-bold text-slate-900 leading-tight truncate">
                    {selectedTeacher.name}
                  </h3>
                  <span className="text-xs text-slate-500 block truncate mt-0.5">
                    {selectedTeacher.role}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTeacher(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 inline-flex items-center justify-center shrink-0 p-0"
              >
                <X className="w-5 h-5 shrink-0" />
              </button>
            </div>

            <div className="space-y-3.5 my-5 text-xs text-slate-600">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3 min-w-0">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                      Nomor Telepon / WhatsApp
                    </span>
                    <span className="font-bold text-slate-900 block truncate mt-0.5">
                      {selectedTeacher.phone}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyContact(selectedTeacher.phone, 'Nomor Telepon')}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-blue-600 font-bold hover:bg-blue-50 shrink-0 text-xs leading-none"
                >
                  Salin
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3 min-w-0">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                      Email Resmi Sekolah
                    </span>
                    <span className="font-bold text-slate-900 block truncate mt-0.5">
                      {selectedTeacher.email}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyContact(selectedTeacher.email, 'Alamat Email')}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-blue-600 font-bold hover:bg-blue-50 shrink-0 text-xs leading-none"
                >
                  Salin
                </button>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <Building className="w-4 h-4 text-indigo-600 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                    Lokasi Ruangan
                  </span>
                  <span className="font-bold text-slate-900 block truncate mt-0.5">
                    {selectedTeacher.ruang}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedTeacher(null)}
                className="btn-secondary-action text-xs"
              >
                Tutup
              </button>
              <a
                href={`https://wa.me/${selectedTeacher.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="btn-success-action text-xs font-bold"
              >
                Chat WhatsApp Langsung
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewView;
