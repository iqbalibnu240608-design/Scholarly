import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient, getCachedData } from '../api/client';
import {
  Calendar,
  Clock,
  Phone,
  ArrowRight,
  UtensilsCrossed,
  ShoppingBag,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  X,
  Mail,
  CheckCircle2,
  Megaphone,

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
  const [data, setData] = useState<OverviewData | null>(() => getCachedData('/school/overview')?.data || getCachedData('/school/overview') || null);
  const [loading, setLoading] = useState<boolean>(() => !getCachedData('/school/overview'));

  // Contact Modal State
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherContact | null>(null);

  // Personalized student data & utility status
  const [studentStats, setStudentStats] = useState<{
    kelas: string;
    waliKelas: string;
    sppStatus: string;
    presensiGerbangJam: string;
  }>({
    kelas: 'XII RPL 1',
    waliKelas: 'Drs. Budi Santoso',
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
      email: 'budi.santoso@stillschool.sch.id',
      ruang: 'Ruang Guru Lt. 2',
    },
    {
      name: 'Siti Rahmawati, S.Kom',
      role: 'Guru Pengampu • Basis Data',
      initials: 'SR',
      phone: '+62 813-9876-5432',
      email: 'siti.rahmawati@stillschool.sch.id',
      ruang: 'Lab Komputer 1',
    },
    {
      name: 'Hendra Wijaya, M.Pd',
      role: 'Guru Pengampu • Matematika',
      initials: 'HW',
      phone: '+62 821-1122-3344',
      email: 'hendra.wijaya@stillschool.sch.id',
      ruang: 'Ruang Guru Lt. 1',
    },
  ];

  const defaultEvents = [
    {
      id: 1,
      month: 'NOV',
      day: '12',
      isAnnouncement: false,
      title: 'Simulasi CBT Penilaian Akhir Semester',
      desc: 'Wajib diikuti oleh seluruh peserta didik tingkat X, XI, dan XII di laboratorium komputer masing-masing.',
      time: '08:00 - 11:30 WIB',
      location: 'Lab CBT 1 & 2',
      category: 'Akademik',
    },
    {
      id: 2,
      month: 'NOV',
      day: '18',
      isAnnouncement: false,
      title: 'Pekan Gelar Karya Kewirausahaan Siswa',
      desc: 'Bazar produk kreatif siswa, kerja sama kantin sehat dan koperasi sekolah digital.',
      time: '09:00 - 15:00 WIB',
      location: 'Plaza Utama StillSchool',
      category: 'Kesiswaan',
    },
    {
      id: 3,
      month: 'DES',
      day: '05',
      isAnnouncement: false,
      title: 'Batas Akhir Sinkronisasi Nilai Rapor',
      desc: 'Verifikasi nilai capaian kompetensi oleh dewan guru pengampu dan wali kelas.',
      time: '23:59 WIB',
      location: 'Sistem Rapor Digital',
      category: 'Kurikulum',
    },
  ];

  const serverEvents = (data?.announcements || []).map((ann) => ({
    id: ann.id,
    month: 'INFO',
    day: 'BARU',
    isAnnouncement: true,
    title: ann.title,
    desc: ann.content,
    time: 'Pengumuman Resmi',
    location: 'Portal Sekolah',
    category: ann.target_role.toUpperCase(),
  }));

  const schoolEvents = serverEvents.length > 0 ? [...serverEvents, ...defaultEvents].slice(0, 3) : defaultEvents;

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const [resOverview, resSiswa] = await Promise.all([
          apiClient.get('/school/overview').catch(() => null),
          activeRole === 'siswa' ? apiClient.get('/school/siswa').catch(() => null) : Promise.resolve(null),
        ]);

        if (resOverview?.data) {
          setData(resOverview.data);
        }

        const siswaData = resSiswa?.data?.data;
                setStudentStats({
          kelas: siswaData?.kelas ?? 'XII RPL 1',
          waliKelas: siswaData?.wali_kelas ?? 'Drs. Budi Santoso',
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

  if (loading && !data) {
    return (
      <div
        className="w-full max-w-[1540px] mx-auto py-20 flex flex-col items-center justify-center min-h-[400px]"
        style={{ padding: '60px 24px', textAlign: 'center' }}
      >
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500 mt-3" style={{ marginTop: '12px', display: 'block' }}>
          Memuat data ekosistem sekolah...
        </span>
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-[1540px] mx-auto pb-10 box-border"
    >
      {/* =========================================================================
          BARIS 1 & 2: 2 KOLOM UTAMA (BENTO GRID)
          Kolom Kiri (2/3): Banner Hitam, Saldo Digital Siswa, 4 Modul Layanan
          Kolom Kanan (1/3): Status Civitas & Verifikasi, Jadwal Kelas Hari Ini
          ========================================================================= */}
      <section
        className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 box-border"
        style={{
          boxSizing: 'border-box',
        }}
      >
        {/* Kolom Kiri 2/3 (lg:col-span-8): Banner, Saldo Digital, & 4 Modul */}
        <div className="lg:col-span-8 flex flex-col gap-4 sm:gap-5 box-border">
          {/* 1. Banner Hitam 'Selamat Datang, Ahmad' (Height proporsional h-auto, px-7 py-6) */}
          <div
            className="bg-[#0F172A] text-white px-7 py-6 rounded-2xl border border-slate-800 flex flex-col h-auto relative overflow-hidden box-border shadow-md"
          >
            {/* Subtle Ambient Glow */}
            <div
              className="absolute -top-8 -right-8 w-48 sm:w-60 h-48 sm:h-60 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"
            />

            {/* Top Badges */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-white/90 border border-white/15">
                  <Calendar className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                  <span>T.A. 2026/2027 Ganjil</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-white/90 border border-white/15 uppercase">
                  <UserCheck className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                  <span>{isStudent ? 'Siswa Terverifikasi' : `Peran: ${activeRole}`}</span>
                </span>
              </div>

              {/* Live Status Chip */}
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse shrink-0" />
                <span>RFID Smart Gate: Terhubung</span>
              </span>
            </div>

            {/* Heading (mt-3.5 = 14px jarak proporsional dari baris badge) */}
            <div className="relative z-10 mt-3.5">
              <h2 className="text-xl sm:text-2xl lg:text-[28px] font-extrabold text-white leading-tight tracking-tight m-0">
                Selamat Datang, {displayName}
              </h2>
            </div>
          </div>

          

          {/* 2. Sub-Baris Bawah: 4 Modul Layanan & Akses Cepat */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 box-border"
          >
            {/* Featured Card: Portal Akademik & Penilaian */}
            <div
              className="p-4 sm:p-5 rounded-xl border border-blue-200 bg-blue-50/70 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between box-border group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-600 text-white tracking-wider">
                    Modul Utama
                  </span>
                </div>

                <h4 className="text-[15px] font-extrabold text-blue-950 mb-1.5 tracking-tight">
                  Portal Akademik & Penilaian
                </h4>
                <p className="text-xs text-blue-900 m-0 leading-relaxed">
                  Pantau buku nilai, transkrip rapor semester terpadu, dan jadwal ujian CBT sekolah secara realtime.
                </p>

                {/* Micro Sub-Features */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="text-[10px] font-bold bg-white text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">
                    Buku Nilai
                  </span>
                  <span className="text-[10px] font-bold bg-white text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">
                    Transkrip Rapor
                  </span>
                  <span className="text-[10px] font-bold bg-white text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">
                    Jadwal CBT
                  </span>
                </div>
              </div>

              <Link
                to={activeRole === 'guru' ? '/app/guru' : activeRole === 'kepsek' ? '/app/kepsek' : '/app/siswa'}
                className="mt-4 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs hover:shadow-md active:scale-[0.97] transition-all duration-200 cursor-pointer w-full sm:w-auto self-start group/btn"
              >
                <span>Buka Modul Akademik</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Modul 2: Kantin Digital */}
            <div
              className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-blue-300 transition-all flex flex-col justify-between box-border group"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 shrink-0">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <h4 className="text-[15px] font-bold text-slate-900 mb-1.5">
                  Kantin Sehat Digital
                </h4>
                <p className="text-xs text-slate-500 m-0 leading-relaxed">
                  Pesan makanan higienis tanpa antre, pre-order jam istirahat, dan transaksi cashless kartu pelajar.
                </p>
                <div className="flex items-center gap-1.5 mt-3 text-[11px] text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
                  <span>Kantin Buka • 18 Menu Tersedia</span>
                </div>
              </div>

              <Link
                to="/app/kantin"
                className="mt-4 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200/90 hover:border-emerald-600 font-bold text-xs shadow-2xs hover:shadow-xs active:scale-[0.97] transition-all duration-200 cursor-pointer w-full sm:w-auto self-start group/btn"
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>Pesan Menu Kantin</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Modul 3: Koperasi Siswa */}
            <div
              className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-blue-300 transition-all flex flex-col justify-between box-border group"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h4 className="text-[15px] font-bold text-slate-900 mb-1.5">
                  Koperasi Siswa
                </h4>
                <p className="text-xs text-slate-500 m-0 leading-relaxed">
                  Kebutuhan seragam resmi, atribut OSIS, buku paket kurikulum merdeka, dan alat tulis sekolah.
                </p>
                <div className="flex items-center gap-1.5 mt-3 text-[11px] text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block shrink-0" />
                  <span>Stok Seragam & Buku Siap</span>
                </div>
              </div>

              <Link
                to="/app/kopsis"
                className="mt-4 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200/90 hover:border-indigo-600 font-bold text-xs shadow-2xs hover:shadow-xs active:scale-[0.97] transition-all duration-200 cursor-pointer w-full sm:w-auto self-start group/btn"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Katalog Koperasi</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Modul 4: Presensi Digital & RFID */}
            <div
              className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-blue-300 transition-all flex flex-col justify-between box-border group"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-[15px] font-bold text-slate-900 mb-1.5">
                  Presensi & Kartu RFID
                </h4>
                <p className="text-xs text-slate-500 m-0 leading-relaxed">
                  Rekapitulasi absensi 100% hadir, riwayat tap kartu gerbang otomatis, dan pengajuan surat izin online.
                </p>
                <div className="flex items-center gap-1.5 mt-3 text-[11px] text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
                  <span>Gerbang Aktif: Gate 1 & 2</span>
                </div>
              </div>

              <Link
                to="/app/security"
                className="mt-4 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-900 text-slate-700 hover:text-white border border-slate-200 hover:border-slate-900 font-bold text-xs shadow-2xs hover:shadow-xs active:scale-[0.97] transition-all duration-200 cursor-pointer w-full sm:w-auto self-start group/btn"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Cek Rekap Presensi</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Kolom Kanan 1/3 (lg:col-span-4): Status Civitas & Jadwal Kelas */}
        <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-5 box-border">
          {/* Kolom Kanan: Panel 'Status Civitas' */}
        <div
          className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between shadow-2xs box-border"
        >
          {/* Header Panel */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 m-0">
                  Status Civitas & Verifikasi
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 m-0">Presensi Gerbang & Finansial</p>
              </div>
            </div>
            <span className="px-2 py-1 rounded-md text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase shrink-0">
              Terverifikasi
            </span>
          </div>

          {/* Blok 1: Presensi Gerbang RFID */}
          <div className="py-3.5 border-b border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Presensi Gerbang RFID
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3 h-3" />
                <span>Tepat Waktu</span>
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-2xl font-black text-slate-900">
                {studentStats.presensiGerbangJam}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">Gate 1 • Gerbang Utama</span>
            </div>
          </div>

          {/* Blok 2: Status SPP */}
          <div className="pt-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Status Pembayaran SPP
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                <span>Lunas (Bulan Berjalan)</span>
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="font-bold text-sm text-emerald-600 block">
                  Periode November 2026
                </span>
                <span className="text-[11px] text-slate-400">Bebas Tunggakan Administrasi</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                Next: 10 Des 2026
              </span>
            </div>
          </div>
        </div>

          {/* Kolom Kanan 1/3: Panel 'Jadwal Kelas Hari Ini' */}
        <div
          className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between box-border"
        >
          <div>
            {/* Header Jadwal */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 m-0">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Jadwal Kelas Hari Ini</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 m-0">Senin • Semester Ganjil</p>
              </div>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md shrink-0">
                {studentStats.kelas}
              </span>
            </div>

            {/* List Kartu Per Mata Pelajaran Berlatar #F8FAFC */}
            <div className="flex flex-col gap-3 mt-4">
              {schedules.map((item, idx) => {
                const isOngoing = item.status?.includes('Berlangsung') || idx === 0;

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border box-border ${
                      isOngoing ? 'border-blue-200 bg-blue-50/60' : 'border-slate-200 bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                        {isOngoing && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse shrink-0" />
                        )}
                        {item.jam}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isOngoing ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {item.status || 'Terjadwal'}
                      </span>
                    </div>

                    <h4 className="text-[13px] font-bold text-slate-900 mb-1.5 leading-snug">
                      {item.mapel}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="truncate pr-2">
                        {item.guru}
                      </span>
                      <span className="font-semibold text-slate-700 bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                        {item.ruang}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-4 mt-4 border-t border-slate-100">
            <Link
              to="/app/siswa"
              className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs text-center border border-slate-200 hover:border-blue-200 shadow-2xs hover:shadow-xs active:scale-[0.98] flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer group"
            >
              <span>Lihat Jadwal Lengkap Mingguan</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
        </div>
      </section>

      {/* =========================================================================
          BARIS 3 (BAWAH): 2 KOLOM SEIMBANG
          Kiri: Guru Pengajar & Pembimbing (Padding: 20px, Border-radius: 12px)
          Kanan: Agenda & Acara Sekolah (Padding: 20px, Border-radius: 12px)
          ========================================================================= */}
      <section
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mt-5 sm:mt-6 box-border"
      >
        {/* Kolom Kiri: Guru Pengajar & Pembimbing */}
        <div
          className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white shadow-2xs box-border"
        >
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 m-0">
                  Guru Pengajar & Pembimbing
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 m-0">Daftar pendidik aktif kelas Anda</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-400">3 Pendidik</span>
          </div>

          <div className="flex flex-col gap-3">
            {teachersList.map((teacher, idx) => (
              <div
                key={idx}
                className="p-3 sm:p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3 box-border hover:border-blue-200 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    {teacher.initials}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 m-0 truncate">
                      {teacher.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 my-0.5 truncate">
                      {teacher.role}
                    </p>
                    <span className="text-[10px] text-slate-400 block">{teacher.ruang}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTeacher(teacher)}
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-[11px] font-bold inline-flex items-center gap-1.5 shadow-2xs hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 hover:shadow-xs active:scale-95 transition-all duration-150 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Kontak</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom Kanan: Agenda & Acara Sekolah */}
        <div
          className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white shadow-2xs box-border"
        >
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Calendar className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 m-0">
                  Agenda & Acara Sekolah
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 m-0">Kalender kegiatan dan pengumuman resmi</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-400">Semester Ganjil</span>
          </div>

          <div className="flex flex-col gap-3">
            {schoolEvents.map((event) => (
              <div
                key={event.id}
                className="p-3 sm:p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 flex items-center gap-3 sm:gap-3.5 box-border hover:border-blue-200 transition-all"
              >
                {/* Date or Announcement Icon Badge */}
                <div
                  className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex flex-col items-center justify-center"
                >
                  {event.isAnnouncement || event.month === 'INFO' || isNaN(Number(event.day)) ? (
                    <Megaphone className="w-5 h-5 text-blue-700" />
                  ) : (
                    <>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider leading-none text-blue-600">
                        {event.month}
                      </span>
                      <span className="text-base font-black leading-none mt-0.5 text-blue-700">
                        {event.day}
                      </span>
                    </>
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 m-0 truncate">
                      {event.title}
                    </h4>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 shrink-0">
                      {event.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 my-0.5 truncate">
                    {event.desc}
                  </p>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {event.time} • {event.location}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          MODAL DETAIL KONTAK GURU & WALI KELAS
          ========================================================================= */}
      {selectedTeacher && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div
            className="bg-white rounded-2xl max-w-sm sm:max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm m-0">
                  Informasi Kontak Pengajar
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTeacher(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center mx-auto shadow-sm">
                {selectedTeacher.initials}
              </div>
              <h4 className="font-extrabold text-slate-900 text-base mt-3 mb-0.5">
                {selectedTeacher.name}
              </h4>
              <p className="text-xs font-semibold text-blue-600 m-0">
                {selectedTeacher.role}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 m-0">
                {selectedTeacher.ruang}
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-xs text-slate-700 min-w-0">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-mono font-medium truncate">
                    {selectedTeacher.phone}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyContact(selectedTeacher.phone, 'Nomor WhatsApp')}
                  className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer p-0 border-0 bg-transparent shrink-0 ml-2"
                >
                  Salin
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-xs text-slate-700 min-w-0">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-mono font-medium truncate">
                    {selectedTeacher.email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyContact(selectedTeacher.email, 'Alamat Email')}
                  className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer p-0 border-0 bg-transparent shrink-0 ml-2"
                >
                  Salin
                </button>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2.5">
              <a
                href={`https://wa.me/${selectedTeacher.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center inline-flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Kirim WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => setSelectedTeacher(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer border-0 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewView;
