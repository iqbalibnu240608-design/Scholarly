import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import {
  Calendar,
  Clock,
  MessageSquare,
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
    kehadiranPct: number;
    saldoKopsis: number;
    saldoKantin: number;
    sppStatus: string;
    presensiGerbangJam: string;
  }>({
    kelas: 'XII RPL 1',
    waliKelas: 'Drs. Budi Santoso',
    kehadiranPct: 95.4,
    saldoKopsis: 75000,
    saldoKantin: 45000,
    sppStatus: 'Lunas',
    presensiGerbangJam: '06:48 WIB',
  });

  // Today's schedule data
  const [schedules, setSchedules] = useState<ScheduleItem[]>([
    {
      jam: '07:30 - 09:00',
      mapel: 'Pemrograman Web & Framework',
      guru: 'Drs. Budi Santoso',
      ruang: 'Lab Komputer 2',
      status: 'Sesi Aktif',
    },
    {
      jam: '09:15 - 10:45',
      mapel: 'Basis Data & SQL Terapan',
      guru: 'Siti Rahmawati, S.Kom',
      ruang: 'Lab RPL 1',
      status: 'Sesi Berikutnya',
    },
    {
      jam: '11:00 - 12:30',
      mapel: 'Matematika Terapan & Logika',
      guru: 'Hendra Wijaya, M.Pd',
      ruang: 'Ruang Teori 204',
      status: 'Sesi Siang',
    },
  ]);

  const teachersList: TeacherContact[] = [
    {
      name: studentStats.waliKelas,
      role: 'Wali Kelas • Guru Pemrograman Web',
      initials: 'BS',
      phone: '+62 812-3456-7891',
      email: 'budi.santoso@steelschool.sch.id',
      ruang: 'Ruang Guru Lantai 2',
    },
    {
      name: 'Siti Rahmawati, S.Kom',
      role: 'Guru Pengampu • Basis Data',
      initials: 'SR',
      phone: '+62 813-9876-5432',
      email: 'siti.rahmawati@steelschool.sch.id',
      ruang: 'Lab Komputer 1',
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
        const rawKehadiran = siswaData?.presensi_bulan_ini?.persentase ?? '95.4%';
        const parsedPct = parseFloat(rawKehadiran.replace('%', '')) || 95.4;

        setStudentStats({
          kelas: siswaData?.kelas ?? 'XII RPL 1',
          waliKelas: siswaData?.wali_kelas ?? 'Drs. Budi Santoso',
          kehadiranPct: parsedPct,
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

  const copyContact = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} disalin ke clipboard!`);
  };

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
      {/* 1. HERO GREETING BANNER (Role-Aware & Proporsional)            */}
      {/* ============================================================== */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 md:p-8 shadow-xs relative overflow-hidden">
        {/* Soft background ambient gradient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-50 via-blue-50/20 to-transparent rounded-full -mr-16 -mt-16 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl">
            {/* Role & Date Pill */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200/80 text-blue-700 rounded-full text-xs font-bold shadow-2xs">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {isStudent
                    ? `Siswa Aktif • ${studentStats.kelas}`
                    : `Sistem Aktif • ${activeRole.toUpperCase()}`}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded-full text-xs font-semibold">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
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

            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Halo, {user?.name ? user.name.split(' ')[0] : 'Civitas'}! 👋
            </h2>
            <p className="text-xs md:text-sm text-slate-600 mt-2 leading-relaxed">
              {isStudent
                ? `Selamat datang di portal akademik SteelSchool. Anda memiliki ${schedules.length} sesi pembelajaran aktif hari ini. Kartu digital RFID dan dompet cashless Anda telah tersinkronisasi.`
                : `Selamat datang di portal operasional terpadu SteelSchool. Seluruh layanan akademik, administrasi TU, kasir koperasi, kantin sehat, dan presensi gerbang terhubung realtime.`}
            </p>

            <div className="flex items-center gap-3 mt-4 pt-1">
              <Link
                to={isStudent ? '/app/siswa' : `/app/${activeRole}`}
                className="btn-primary-action text-xs font-bold"
              >
                <span>
                  {isStudent ? 'Buka Portal Akademik' : `Kelola Modul ${activeRole.toUpperCase()}`}
                </span>
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
      {/* 2. HIGH-EFFICIENCY UTILITY STRIP                               */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isStudent ? (
          <>
            {/* Utility 1: Saldo Kantin Sehat */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between hover:border-blue-300 transition-all group">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Saldo Kantin
                  </span>
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
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Saldo Kopsis
                  </span>
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
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Presensi Gerbang
                  </span>
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
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Tagihan SPP
                  </span>
                  <span className="text-xs md:text-sm font-extrabold text-blue-600 block leading-tight">
                    {studentStats.sppStatus} (Bulan Ini)
                  </span>
                </div>
              </div>
              <Link
                to="/app/petugas"
                className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 hover:bg-blue-600 hover:border-blue-600 hover:text-white text-slate-500 flex items-center justify-center transition-all shrink-0"
                title="Buku Kas & Kwitansi TU"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        ) : (
          /* Tampilan Metrik Khusus Guru / Admin / Staf */
          <>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-2xs">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Siswa
                  </span>
                  <span className="text-base font-extrabold text-slate-900 block leading-tight">
                    {data?.metrics?.total_siswa ?? 2} Siswa Terdaftar
                  </span>
                </div>
              </div>
              <Link to="/app/siswa" className="text-blue-600 hover:underline text-xs font-bold">
                Detail
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 shadow-2xs">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Dewan Guru
                  </span>
                  <span className="text-base font-extrabold text-slate-900 block leading-tight">
                    {data?.metrics?.total_guru ?? 1} Pengajar Aktif
                  </span>
                </div>
              </div>
              <Link to="/app/guru" className="text-blue-600 hover:underline text-xs font-bold">
                Detail
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 shadow-2xs">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Rombel Kelas
                  </span>
                  <span className="text-base font-extrabold text-slate-900 block leading-tight">
                    {data?.metrics?.total_kelas ?? 5} Kelas Aktif
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Normal
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0 shadow-2xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Status Server
                  </span>
                  <span className="text-xs font-extrabold text-emerald-600 block leading-tight">
                    Online (100% Terhubung)
                  </span>
                </div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 shrink-0"></span>
            </div>
          </>
        )}
      </div>

      {/* ============================================================== */}
      {/* 3. WORKSPACE 2 KOLOM (BERSIH DARI GRAFIK PALSU & PERSENTASE GAGAL) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ============================================================== */}
        {/* LEFT COLUMN (Col Span 7): AKSI CEPAT & GURU PEMBIMBING         */}
        {/* ============================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card Aksi Cepat Layanan Sekolah */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Layanan & Akses Cepat Sekolah
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pintasan langsung ke modul utama ekosistem digital SteelSchool.
                </p>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                4 Modul Terhubung
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Item 1: Akademik & Nilai */}
              <Link
                to="/app/siswa"
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all group block no-underline"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Akademik & Transkrip
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  Pantau buku nilai semester, rekap absensi, dan jadwal harian.
                </p>
              </Link>

              {/* Item 2: Kantin Sekolah */}
              <Link
                to="/app/kantin"
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all group block no-underline"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                  Kantin Sehat Cashless
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  Pesan makanan sehat di stan kantin tanpa antre uang tunai.
                </p>
              </Link>

              {/* Item 3: Koperasi Siswa */}
              <Link
                to="/app/kopsis"
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all group block no-underline"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Koperasi Siswa (Kopsis)
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  Beli buku materi, alat tulis kantor (ATK), dan seragam sekolah.
                </p>
              </Link>

              {/* Item 4: Perpustakaan Digital */}
              <Link
                to="/app/perpus"
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all group block no-underline"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <BookMarked className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  E-Library & Modul
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  Peminjaman e-book, jurnal referensi, dan materi belajar online.
                </p>
              </Link>
            </div>
          </div>

          {/* Guru Pengajar & Pembimbing (dengan Modal / Kontak yang Berfungsi) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Guru Pengajar & Pembimbing
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hubungi wali kelas atau guru mata pelajaran untuk konsultasi.
                </p>
              </div>
              <Link
                to="/app/siswa"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Lihat Semua Guru →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {teachersList.map((teacher, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-xs shadow-2xs">
                      {teacher.initials}
                    </div>
                    <div>
                      <h4 className="text-xs md:text-sm font-bold text-slate-900 leading-snug">
                        {teacher.name}
                      </h4>
                      <span className="text-[11px] text-slate-500 font-medium block">
                        {teacher.role}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <button
                      type="button"
                      onClick={() => setSelectedTeacher(teacher)}
                      className="w-8 h-8 rounded-full bg-white border border-slate-200/80 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center shadow-2xs transition-all"
                      title="Kirim Pesan / Email"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => copyContact(teacher.phone, `Nomor ${teacher.name}`)}
                      className="w-8 h-8 rounded-full bg-white border border-slate-200/80 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center shadow-2xs transition-all"
                      title="Salin Kontak Telepon"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN (Col Span 5): JADWAL HARI INI & PENGUMUMAN        */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. JADWAL KELAS HARI INI */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Jadwal Kelas Hari Ini</h3>
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
                        <Clock
                          className={`w-3.5 h-3.5 ${isActive ? 'text-white/80' : 'text-slate-400'}`}
                        />
                        <span
                          className={`text-xs font-bold ${
                            isActive ? 'text-white' : 'text-slate-600'
                          }`}
                        >
                          {item.jam}
                        </span>
                      </div>
                      {isActive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                          Sedang Berlangsung
                        </span>
                      )}
                    </div>

                    <h4
                      className={`text-sm font-bold tracking-tight ${
                        isActive ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {item.mapel}
                    </h4>

                    <span
                      className={`text-xs block mt-1 ${
                        isActive ? 'text-white/85' : 'text-slate-500'
                      }`}
                    >
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
              >
                <span>Lihat Seluruh Kalender Akademik →</span>
              </Link>
            </div>
          </div>

          {/* 2. PAPAN PENGUMUMAN & AGENDA SEKOLAH */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">
                Papan Pengumuman Sekolah
              </h3>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                Terkini
              </span>
            </div>

            <div className="space-y-3">
              {visibleAnnouncements.length > 0 ? (
                visibleAnnouncements.slice(0, 3).map((ann) => (
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

      {/* ============================================================== */}
      {/* 4. MODAL KONTAK GURU / WALI KELAS                              */}
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
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-xs">
                  {selectedTeacher.initials}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">
                    {selectedTeacher.name}
                  </h4>
                  <span className="text-[11px] text-slate-500">{selectedTeacher.role}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTeacher(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 my-5 text-xs text-slate-600">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Nomor Telepon / WA
                    </span>
                    <span className="font-bold text-slate-800">{selectedTeacher.phone}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyContact(selectedTeacher.phone, 'Nomor Telepon')}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-blue-600 font-bold hover:bg-blue-50"
                >
                  Salin
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Email Resmi Sekolah
                    </span>
                    <span className="font-bold text-slate-800">{selectedTeacher.email}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyContact(selectedTeacher.email, 'Alamat Email')}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-blue-600 font-bold hover:bg-blue-50"
                >
                  Salin
                </button>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Building className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Lokasi Ruangan
                  </span>
                  <span className="font-bold text-slate-800">{selectedTeacher.ruang}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
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
