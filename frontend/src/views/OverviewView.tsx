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
  GraduationCap,
  BookMarked,
  X,
  Mail,
  Building,
  Users,
  CheckCircle2,
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
  const { activeRole } = useAuth();
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

  const copyContact = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} disalin ke clipboard!`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[420px] text-sm text-slate-500 font-semibold">
        <div className="w-5 h-5 border-2 border-[#2857e6] border-t-transparent rounded-full animate-spin mr-3"></div>
        Menghubungkan ekosistem Smart SteelSchool...
      </div>
    );
  }

  return (
    <div className="space-y-12 sm:space-y-14 w-full max-w-[1560px] mx-auto text-slate-800 pb-28">
      {/* ============================================================== */}
      {/* 1. TOP METRIC CARDS (Tipografi Proporsional & Elegan)          */}
      {/* ============================================================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-7">
        {isStudent ? (
          <>
            {/* Card 1: Saldo Kantin Sehat */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_4px_24px_-4px_rgba(40,87,230,0.06)] border border-slate-200/90 hover:border-[#2857e6]/50 hover:shadow-[0_12px_28px_-6px_rgba(40,87,230,0.12)] transition-all duration-200 flex items-center justify-between group">
              <div className="flex items-center gap-4 min-w-0 pr-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/70 text-[#2857e6] flex items-center justify-center shrink-0 border border-blue-200/60 shadow-2xs group-hover:scale-105 transition-transform">
                  <UtensilsCrossed className="w-5 h-5 shrink-0" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10.5px] font-extrabold text-slate-400 uppercase tracking-wider block truncate">
                    Saldo Kantin
                  </span>
                  <span className="text-[22px] sm:text-[24px] font-black text-slate-900 block leading-tight mt-0.5 truncate tracking-tight">
                    Rp {studentStats.saldoKantin.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-bold block mt-0.5 truncate flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    Cashless Siap Pakai
                  </span>
                </div>
              </div>
              <Link
                to="/app/kantin"
                className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-[#2857e6] hover:border-[#2857e6] hover:text-white text-slate-400 inline-flex items-center justify-center transition-all shrink-0 shadow-2xs"
                title="Pesan Menu Kantin"
              >
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>

            {/* Card 2: Saldo Koperasi Siswa */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_4px_24px_-4px_rgba(40,87,230,0.06)] border border-slate-200/90 hover:border-[#2857e6]/50 hover:shadow-[0_12px_28px_-6px_rgba(40,87,230,0.12)] transition-all duration-200 flex items-center justify-between group">
              <div className="flex items-center gap-4 min-w-0 pr-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/70 text-[#2857e6] flex items-center justify-center shrink-0 border border-blue-200/60 shadow-2xs group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-5 h-5 shrink-0" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10.5px] font-extrabold text-slate-400 uppercase tracking-wider block truncate">
                    Saldo Koperasi
                  </span>
                  <span className="text-[22px] sm:text-[24px] font-black text-slate-900 block leading-tight mt-0.5 truncate tracking-tight">
                    Rp {studentStats.saldoKopsis.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[11px] text-[#2857e6] font-bold block mt-0.5 truncate flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2857e6] shrink-0" />
                    Belanja ATK & Seragam
                  </span>
                </div>
              </div>
              <Link
                to="/app/kopsis"
                className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-[#2857e6] hover:border-[#2857e6] hover:text-white text-slate-400 inline-flex items-center justify-center transition-all shrink-0 shadow-2xs"
                title="Belanja Koperasi Siswa"
              >
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>

            {/* Card 3: Presensi Gerbang RFID */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_4px_24px_-4px_rgba(40,87,230,0.06)] border border-slate-200/90 hover:border-[#2857e6]/50 hover:shadow-[0_12px_28px_-6px_rgba(40,87,230,0.12)] transition-all duration-200 flex items-center justify-between group">
              <div className="flex items-center gap-4 min-w-0 pr-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/70 text-[#2857e6] flex items-center justify-center shrink-0 border border-blue-200/60 shadow-2xs group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10.5px] font-extrabold text-slate-400 uppercase tracking-wider block truncate">
                    Presensi Hari Ini
                  </span>
                  <span className="text-[22px] sm:text-[24px] font-black text-slate-900 block leading-tight mt-0.5 truncate tracking-tight">
                    {studentStats.presensiGerbangJam}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-bold text-emerald-600 leading-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span>Gate 1 Tepat Waktu</span>
                  </div>
                </div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 shrink-0 ml-1" />
            </div>

            {/* Card 4: Tagihan SPP */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_4px_24px_-4px_rgba(40,87,230,0.06)] border border-slate-200/90 hover:border-[#2857e6]/50 hover:shadow-[0_12px_28px_-6px_rgba(40,87,230,0.12)] transition-all duration-200 flex items-center justify-between group">
              <div className="flex items-center gap-4 min-w-0 pr-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/70 text-[#2857e6] flex items-center justify-center shrink-0 border border-blue-200/60 shadow-2xs group-hover:scale-105 transition-transform">
                  <CreditCard className="w-5 h-5 shrink-0" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10.5px] font-extrabold text-slate-400 uppercase tracking-wider block truncate">
                    Status SPP
                  </span>
                  <span className="text-[22px] sm:text-[24px] font-black text-slate-900 block leading-tight mt-0.5 truncate tracking-tight">
                    {studentStats.sppStatus}
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold block mt-0.5 truncate">
                    Semester Berjalan Lunas
                  </span>
                </div>
              </div>
              <Link
                to="/app/petugas"
                className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-[#2857e6] hover:border-[#2857e6] hover:text-white text-slate-400 inline-flex items-center justify-center transition-all shrink-0 shadow-2xs"
                title="Buku Kas & Kwitansi TU"
              >
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>
          </>
        ) : (
          /* Metrik Guru / Admin / Staf */
          <>
            {/* 1. Total Siswa */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_4px_24px_-4px_rgba(40,87,230,0.06)] border border-slate-200/90 hover:border-[#2857e6]/50 hover:shadow-[0_12px_28px_-6px_rgba(40,87,230,0.12)] transition-all duration-200 flex items-center justify-between group">
              <div className="flex items-center gap-4 min-w-0 pr-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/70 text-[#2857e6] flex items-center justify-center shrink-0 border border-blue-200/60 shadow-2xs group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5 shrink-0" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10.5px] font-extrabold text-slate-400 uppercase tracking-wider block truncate">
                    Total Siswa
                  </span>
                  <span className="text-[22px] sm:text-[24px] font-black text-slate-900 block leading-tight mt-0.5 truncate tracking-tight">
                    {data?.metrics?.total_siswa ?? 2} Siswa
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold block mt-0.5 truncate">
                    Terdaftar Aktif
                  </span>
                </div>
              </div>
              <Link to="/app/siswa" className="text-[#2857e6] hover:underline text-xs font-bold shrink-0">
                Detail
              </Link>
            </div>

            {/* 2. Dewan Guru */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_4px_24px_-4px_rgba(40,87,230,0.06)] border border-slate-200/90 hover:border-[#2857e6]/50 hover:shadow-[0_12px_28px_-6px_rgba(40,87,230,0.12)] transition-all duration-200 flex items-center justify-between group">
              <div className="flex items-center gap-4 min-w-0 pr-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/70 text-[#2857e6] flex items-center justify-center shrink-0 border border-blue-200/60 shadow-2xs group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-5 h-5 shrink-0" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10.5px] font-extrabold text-slate-400 uppercase tracking-wider block truncate">
                    Dewan Guru
                  </span>
                  <span className="text-[22px] sm:text-[24px] font-black text-slate-900 block leading-tight mt-0.5 truncate tracking-tight">
                    {data?.metrics?.total_guru ?? 1} Pengajar
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold block mt-0.5 truncate">
                    Pengajar Aktif
                  </span>
                </div>
              </div>
              <Link to="/app/guru" className="text-[#2857e6] hover:underline text-xs font-bold shrink-0">
                Detail
              </Link>
            </div>

            {/* 3. Rombel Kelas */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_4px_24px_-4px_rgba(40,87,230,0.06)] border border-slate-200/90 hover:border-[#2857e6]/50 hover:shadow-[0_12px_28px_-6px_rgba(40,87,230,0.12)] transition-all duration-200 flex items-center justify-between group">
              <div className="flex items-center gap-4 min-w-0 pr-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/70 text-[#2857e6] flex items-center justify-center shrink-0 border border-blue-200/60 shadow-2xs group-hover:scale-105 transition-transform">
                  <Building className="w-5 h-5 shrink-0" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10.5px] font-extrabold text-slate-400 uppercase tracking-wider block truncate">
                    Rombel Kelas
                  </span>
                  <span className="text-[22px] sm:text-[24px] font-black text-slate-900 block leading-tight mt-0.5 truncate tracking-tight">
                    {data?.metrics?.total_kelas ?? 5} Rombel
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold block mt-0.5 truncate">
                    Ruang Belajar Aktif
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#2857e6] bg-blue-50 border border-blue-200/70 px-3 py-1 rounded-full shrink-0">
                Normal
              </span>
            </div>

            {/* 4. Koneksi Server */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_4px_24px_-4px_rgba(40,87,230,0.06)] border border-slate-200/90 hover:border-[#2857e6]/50 hover:shadow-[0_12px_28px_-6px_rgba(40,87,230,0.12)] transition-all duration-200 flex items-center justify-between group">
              <div className="flex items-center gap-4 min-w-0 pr-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/70 text-[#2857e6] flex items-center justify-center shrink-0 border border-blue-200/60 shadow-2xs group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10.5px] font-extrabold text-slate-400 uppercase tracking-wider block truncate">
                    Koneksi Server
                  </span>
                  <span className="text-[22px] sm:text-[24px] font-black text-slate-900 block leading-tight mt-0.5 truncate tracking-tight">
                    Online
                  </span>
                  <span className="text-[11px] text-emerald-600 font-bold block mt-0.5 truncate flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    Realtime API 100%
                  </span>
                </div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 shrink-0 ml-1" />
            </div>
          </>
        )}
      </section>

      {/* ============================================================== */}
      {/* 2. LAYANAN & AKSES CEPAT (Ukuran Teks Proporsional Sesuai Sidebar) */}
      {/* ============================================================== */}
      <section className="bg-white rounded-3xl p-7 sm:p-8 lg:p-9 shadow-[0_4px_28px_-4px_rgba(40,87,230,0.06)] border border-slate-200/90">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-5 bg-[#2857e6] rounded-full inline-block shrink-0 shadow-2xs" />
            <div>
              <h2 className="text-[16px] sm:text-[17px] font-extrabold text-slate-900 tracking-tight leading-none">
                Layanan & Akses Cepat Sekolah
              </h2>
              <p className="text-[11.5px] text-slate-400 mt-1">
                Pintasan instan ke modul operasional ekosistem Smart SteelSchool.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-[#2857e6] bg-blue-50 border border-blue-200/70 px-3.5 py-1 rounded-full self-start sm:self-auto shrink-0 shadow-2xs">
            4 Layanan Terintegrasi
          </span>
        </div>

        {/* 4 Cards Grid - Nyaman dan Enak Dilihat */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-6">
          {/* 1. Akademik */}
          <Link
            to="/app/siswa"
            className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-[#2857e6]/50 hover:shadow-[0_12px_28px_-6px_rgba(40,87,230,0.12)] transition-all duration-200 group flex flex-col justify-between no-underline"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#2857e6] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 border border-blue-200/60 shadow-2xs">
                  <GraduationCap className="w-5 h-5 shrink-0" />
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2857e6] border border-blue-200/60">
                  Akademik
                </span>
              </div>
              <h3 className="text-[14px] font-bold text-slate-900 group-hover:text-[#2857e6] transition-colors leading-snug tracking-tight">
                Akademik & Nilai
              </h3>
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-[10.5px] font-medium text-slate-600 shadow-2xs">
                  Buku Nilai
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-[10.5px] font-medium text-slate-600 shadow-2xs">
                  Rekap Absensi
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-[10.5px] font-medium text-slate-600 shadow-2xs">
                  Jadwal Ujian
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11.5px] font-bold text-[#2857e6] mt-5 pt-3 border-t border-slate-100 group-hover:translate-x-0.5 transition-transform">
              <span>Buka Portal</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </div>
          </Link>

          {/* 2. Kantin Sehat */}
          <Link
            to="/app/kantin"
            className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-[#2857e6]/50 hover:shadow-[0_12px_28px_-6px_rgba(40,87,230,0.12)] transition-all duration-200 group flex flex-col justify-between no-underline"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#2857e6] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 border border-blue-200/60 shadow-2xs">
                  <UtensilsCrossed className="w-5 h-5 shrink-0" />
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2857e6] border border-blue-200/60">
                  Kantin
                </span>
              </div>
              <h3 className="text-[14px] font-bold text-slate-900 group-hover:text-[#2857e6] transition-colors leading-snug tracking-tight">
                Kantin Sehat Cashless
              </h3>
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-[10.5px] font-medium text-slate-600 shadow-2xs">
                  Menu Makanan
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-[10.5px] font-medium text-slate-600 shadow-2xs">
                  Saldo Digital
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-[10.5px] font-medium text-slate-600 shadow-2xs">
                  Pesan Cepat
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11.5px] font-bold text-[#2857e6] mt-5 pt-3 border-t border-slate-100 group-hover:translate-x-0.5 transition-transform">
              <span>Pesan Menu</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </div>
          </Link>

          {/* 3. Koperasi Siswa */}
          <Link
            to="/app/kopsis"
            className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-[#2857e6]/50 hover:shadow-[0_12px_28px_-6px_rgba(40,87,230,0.12)] transition-all duration-200 group flex flex-col justify-between no-underline"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#2857e6] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 border border-blue-200/60 shadow-2xs">
                  <ShoppingBag className="w-5 h-5 shrink-0" />
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2857e6] border border-blue-200/60">
                  Koperasi
                </span>
              </div>
              <h3 className="text-[14px] font-bold text-slate-900 group-hover:text-[#2857e6] transition-colors leading-snug tracking-tight">
                Koperasi Siswa (Kopsis)
              </h3>
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-[10.5px] font-medium text-slate-600 shadow-2xs">
                  Buku & Modul
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-[10.5px] font-medium text-slate-600 shadow-2xs">
                  ATK Ujian
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-[10.5px] font-medium text-slate-600 shadow-2xs">
                  Seragam
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11.5px] font-bold text-[#2857e6] mt-5 pt-3 border-t border-slate-100 group-hover:translate-x-0.5 transition-transform">
              <span>Belanja ATK</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </div>
          </Link>

          {/* 4. E-Library */}
          <Link
            to="/app/perpus"
            className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-[#2857e6]/50 hover:shadow-[0_12px_28px_-6px_rgba(40,87,230,0.12)] transition-all duration-200 group flex flex-col justify-between no-underline"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#2857e6] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 border border-blue-200/60 shadow-2xs">
                  <BookMarked className="w-5 h-5 shrink-0" />
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2857e6] border border-blue-200/60">
                  E-Library
                </span>
              </div>
              <h3 className="text-[14px] font-bold text-slate-900 group-hover:text-[#2857e6] transition-colors leading-snug tracking-tight">
                Perpustakaan Digital
              </h3>
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-[10.5px] font-medium text-slate-600 shadow-2xs">
                  Katalog Buku
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-[10.5px] font-medium text-slate-600 shadow-2xs">
                  E-Book Kejuruan
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-[10.5px] font-medium text-slate-600 shadow-2xs">
                  Peminjaman
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11.5px] font-bold text-[#2857e6] mt-5 pt-3 border-t border-slate-100 group-hover:translate-x-0.5 transition-transform">
              <span>Pinjam Buku</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </div>
          </Link>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11.5px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            Kartu Pelajar RFID terhubung aktif untuk seluruh modul ekosistem.
          </span>
          <span className="font-bold text-[#2857e6]">Realtime Sync</span>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. JADWAL KELAS HARI INI (Horizontal 3-Card Row Proporsional)  */}
      {/* ============================================================== */}
      <section className="bg-white rounded-3xl p-7 sm:p-8 lg:p-9 shadow-[0_4px_28px_-4px_rgba(40,87,230,0.06)] border border-slate-200/90">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-5 bg-[#2857e6] rounded-full inline-block shrink-0 shadow-2xs" />
            <div>
              <h2 className="text-[16px] sm:text-[17px] font-extrabold text-slate-900 tracking-tight leading-none">
                Jadwal Pembelajaran Hari Ini
              </h2>
              <p className="text-[11.5px] text-slate-400 mt-1">
                {schedules.length} sesi pembelajaran aktif semester berjalan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-[#2857e6] bg-blue-50 border border-blue-200/60 shrink-0 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-[#2857e6] shrink-0" />
              <span>Hari Ini</span>
            </span>
            <Link
              to="/app/siswa"
              className="text-[11.5px] font-extrabold text-[#2857e6] hover:underline transition-colors shrink-0"
            >
              Lihat Kalender Lengkap →
            </Link>
          </div>
        </div>

        {/* 3 Kelas dalam Row Horizontal */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
          {schedules.map((item, index) => {
            const isActive = index === 0;
            return (
              <div
                key={index}
                className={`p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  isActive
                    ? 'bg-blue-50/70 border-[#2857e6]/50 shadow-[0_6px_20px_-2px_rgba(40,87,230,0.12)] border-l-4 border-l-[#2857e6]'
                    : 'bg-slate-50/60 border-slate-200/70 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <Clock
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive ? 'text-[#2857e6]' : 'text-slate-400'
                        }`}
                      />
                      <span
                        className={`text-[11.5px] font-mono font-bold leading-none ${
                          isActive ? 'text-[#2857e6]' : 'text-slate-700'
                        }`}
                      >
                        {item.jam}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shrink-0 leading-none ${
                        isActive
                          ? 'bg-[#2857e6] text-white shadow-2xs'
                          : 'bg-slate-200/80 text-slate-700'
                      }`}
                    >
                      {isActive ? 'Aktif Sekarang' : `Sesi ${index + 1}`}
                    </span>
                  </div>

                  <h3 className="text-[14px] font-bold tracking-tight text-slate-900 leading-snug mt-2">
                    {item.mapel}
                  </h3>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200/60 text-[11.5px] text-slate-500 font-medium">
                  <span>Pengajar: <strong className="text-slate-700">{item.guru}</strong></span>
                  <span className="block mt-0.5 text-slate-400">Ruangan: {item.ruang}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. GURU PENGAJAR & PENGUMUMAN RESMI (Spacious 2-Col di Bawah)   */}
      {/* ============================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-7 lg:gap-8">
        {/* Kolom 1: Guru Pengajar & Pembimbing */}
        <div className="bg-white rounded-3xl p-7 sm:p-8 shadow-[0_4px_28px_-4px_rgba(40,87,230,0.06)] border border-slate-200/90">
          <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-5 bg-[#2857e6] rounded-full inline-block shrink-0 shadow-2xs" />
              <div>
                <h2 className="text-[16px] sm:text-[17px] font-extrabold text-slate-900 tracking-tight leading-none">
                  Guru Pengajar & Pembimbing
                </h2>
                <p className="text-[11.5px] text-slate-400 mt-1">
                  Kontak cepat wali kelas dan guru pengampu akademik.
                </p>
              </div>
            </div>
            <Link
              to="/app/siswa"
              className="text-[11.5px] font-extrabold text-[#2857e6] hover:underline transition-colors shrink-0"
            >
              Lihat Semua →
            </Link>
          </div>

          <div className="space-y-3.5">
            {teachersList.map((teacher, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 sm:p-4.5 rounded-2xl bg-slate-50/60 border border-slate-200/70 hover:border-[#2857e6]/50 hover:bg-white hover:shadow-xs transition-all duration-200"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/70 text-[#2857e6] font-black flex items-center justify-center text-xs shrink-0 border border-blue-200/70 shadow-2xs">
                    {teacher.initials}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[13.5px] font-bold text-slate-900 leading-snug truncate">
                      {teacher.name}
                    </h3>
                    <span className="text-[11.5px] text-slate-400 font-medium block truncate mt-0.5">
                      {teacher.role} • {teacher.ruang}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedTeacher(teacher)}
                    className="h-8 px-3 rounded-lg bg-white border border-slate-200/90 hover:bg-blue-50 hover:text-[#2857e6] hover:border-[#2857e6]/40 text-slate-700 font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    title="Buka Kontak WhatsApp"
                  >
                    <Phone className="w-3 h-3 text-[#2857e6]" />
                    <span>Kontak</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => copyContact(teacher.phone, `Nomor ${teacher.name}`)}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200/90 hover:bg-blue-50 hover:text-[#2857e6] hover:border-[#2857e6]/40 inline-flex items-center justify-center transition-all shadow-2xs text-slate-400 hover:text-[#2857e6] p-0 cursor-pointer"
                    title="Salin Nomor HP"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom 2: Agenda & Pengumuman Sekolah */}
        <div className="bg-white rounded-3xl p-7 sm:p-8 shadow-[0_4px_28px_-4px_rgba(40,87,230,0.06)] border border-slate-200/90">
          <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-5 bg-[#2857e6] rounded-full inline-block shrink-0 shadow-2xs" />
              <div>
                <h2 className="text-[16px] sm:text-[17px] font-extrabold text-slate-900 tracking-tight leading-none">
                  Agenda & Pengumuman
                </h2>
                <p className="text-[11.5px] text-slate-400 mt-1">
                  Pemberitahuan resmi civitas akademik SteelSchool.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full shrink-0 shadow-2xs">
              Terkini
            </span>
          </div>

          <div className="space-y-3.5">
            {visibleAnnouncements.length > 0 ? (
              visibleAnnouncements.slice(0, 3).map((ann) => (
                <div
                  key={ann.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-50/60 border border-slate-200/70 hover:border-[#2857e6]/50 hover:bg-white hover:shadow-xs transition-all duration-200 flex items-start gap-3.5"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2857e6] flex items-center justify-center shrink-0 mt-0.5 border border-blue-200/60 shadow-2xs">
                    <Sparkles className="w-4 h-4 shrink-0" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-[13.5px] font-bold text-slate-900 line-clamp-1 leading-snug">
                        {ann.title}
                      </h3>
                      <span className="text-[9.5px] font-extrabold text-[#2857e6] bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 rounded-full shrink-0">
                        {ann.target_role.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-500 line-clamp-2 leading-relaxed">
                      {ann.content}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400 mt-2 font-medium">
                      <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
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
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/60 border border-slate-200/70 hover:border-[#2857e6]/50 hover:bg-white hover:shadow-xs transition-all duration-200 flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2857e6] flex items-center justify-center shrink-0 mt-0.5 border border-blue-200/60 shadow-2xs">
                    <Calendar className="w-4 h-4 shrink-0" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-[13.5px] font-bold text-slate-900 leading-snug">
                        Pekan Ujian Akhir Semester CBT
                      </h3>
                      <span className="text-[9.5px] font-extrabold text-[#2857e6] bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 rounded-full shrink-0">
                        AKADEMIK
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-500 leading-relaxed">
                      Persiapan ujian akhir semester terpadu berbasis Computer Based Test (CBT) di laboratorium komputer.
                    </p>
                    <span className="text-[10.5px] text-slate-400 block mt-2 font-medium">
                      14 - 19 Desember 2026 • 07:30 WIB
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/60 border border-slate-200/70 hover:border-[#2857e6]/50 hover:bg-white hover:shadow-xs transition-all duration-200 flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2857e6] flex items-center justify-center shrink-0 mt-0.5 border border-blue-200/60 shadow-2xs">
                    <Sparkles className="w-4 h-4 shrink-0" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-[13.5px] font-bold text-slate-900 leading-snug">
                        Workshop Digital & Cloud Computing
                      </h3>
                      <span className="text-[9.5px] font-extrabold text-[#2857e6] bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 rounded-full shrink-0">
                        KEJURUAN
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-500 leading-relaxed">
                      Pelatihan teknologi cloud infrastructure dan modern web development bersama praktisi industri.
                    </p>
                    <span className="text-[10.5px] text-slate-400 block mt-2 font-medium">
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
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2857e6] font-black flex items-center justify-center text-xs shrink-0 border border-blue-200/70">
                  {selectedTeacher.initials}
                </div>
                <div className="min-w-0">
                  <h3 className="text-[14.5px] font-bold text-slate-900 leading-tight truncate">
                    {selectedTeacher.name}
                  </h3>
                  <span className="text-[11.5px] text-slate-400 block truncate mt-0.5 font-medium">
                    {selectedTeacher.role}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTeacher(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 inline-flex items-center justify-center shrink-0 p-0 cursor-pointer"
              >
                <X className="w-4 h-4 shrink-0" />
              </button>
            </div>

            <div className="space-y-3 my-5 text-xs text-slate-600">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3 min-w-0">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">
                      Nomor Telepon / WhatsApp
                    </span>
                    <span className="text-[13px] font-bold text-slate-900 block truncate mt-0.5">
                      {selectedTeacher.phone}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyContact(selectedTeacher.phone, 'Nomor Telepon')}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[#2857e6] font-bold hover:bg-blue-50 shrink-0 text-xs leading-none cursor-pointer shadow-2xs"
                >
                  Salin
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3 min-w-0">
                  <Mail className="w-4 h-4 text-[#2857e6] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">
                      Email Resmi Sekolah
                    </span>
                    <span className="text-[13px] font-bold text-slate-900 block truncate mt-0.5">
                      {selectedTeacher.email}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyContact(selectedTeacher.email, 'Alamat Email')}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[#2857e6] font-bold hover:bg-blue-50 shrink-0 text-xs leading-none cursor-pointer shadow-2xs"
                >
                  Salin
                </button>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <Building className="w-4 h-4 text-[#2857e6] shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">
                    Lokasi Ruangan
                  </span>
                  <span className="text-[13px] font-bold text-slate-900 block truncate mt-0.5">
                    {selectedTeacher.ruang}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedTeacher(null)}
                className="h-8.5 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                Tutup
              </button>
              <a
                href={`https://wa.me/${selectedTeacher.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="h-8.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5 no-underline shadow-2xs"
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
