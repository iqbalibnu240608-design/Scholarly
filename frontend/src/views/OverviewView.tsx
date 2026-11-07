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

// Circular Gauge Component matching the Reference Dashboard ("My visit")
const CircularGauge: React.FC<{
  percentage: number;
  label: string;
  color?: string;
}> = ({ percentage, label, color = '#2857e6' }) => {
  const size = 60;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative inline-flex items-center justify-center mb-1.5" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#edf2f7"
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
      <span className="text-[11px] font-semibold text-slate-600 leading-tight max-w-[70px]">
        {label}
      </span>
    </div>
  );
};

export const OverviewView: React.FC = () => {
  const { user, activeRole } = useAuth();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Personalized student data
  const [studentStats, setStudentStats] = useState<{
    kelas: string;
    waliKelas: string;
    kehadiran: string;
    kehadiranPct: number;
  }>({
    kelas: 'XII RPL 1',
    waliKelas: 'Drs. Budi Santoso',
    kehadiran: '95.4',
    kehadiranPct: 95,
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

  // Subject performance bar chart items (Matching Reference Bar Chart)
  const subjectGrades: SubjectGrade[] = [
    { subject: 'Algoritma & Struktur Data', shortName: 'Algoritma', score: 85.3 },
    { subject: 'Pemrograman Berorientasi Objek', shortName: 'PBO', score: 64.7 },
    { subject: 'Basis Data Relasional', shortName: 'Basis Data', score: 84.2 },
    { subject: 'Pemrograman Web & Framework', shortName: 'Web Dev', score: 78.0 },
    { subject: 'Mobile Application & API', shortName: 'Mobile', score: 74.4 },
    { subject: 'Machine Learning & Big Data', shortName: 'ML & AI', score: 88.5 },
  ];

  // Visit / Attendance circular gauges (Matching Reference "My visit")
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
        const res = await apiClient.get('/school/overview');
        setData(res.data);

        if (activeRole === 'siswa') {
          const resSiswa = await apiClient.get('/school/siswa').catch(() => null);
          const siswaData = resSiswa?.data?.data;
          const rawKehadiran = siswaData?.presensi_bulan_ini?.persentase ?? '95.4%';
          const parsedPct = parseFloat(rawKehadiran.replace('%', '')) || 95;

          setStudentStats({
            kelas: siswaData?.kelas ?? 'XII RPL 1',
            waliKelas: siswaData?.wali_kelas ?? 'Drs. Budi Santoso',
            kehadiran: rawKehadiran.replace('%', ''),
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
      {/* 2-Column Responsive Workspace matching the Student Dashboard Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ============================================================== */}
        {/* LEFT / CENTER MAIN COLUMN (Col Span 8)                         */}
        {/* ============================================================== */}
        <div className="lg:col-span-8 space-y-6">

          {/* 1. HELLO GREETING CARD (Matching Reference Layout) */}
          <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-100 p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="max-w-md">
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Halo, {user?.name ? user.name.split(' ')[0] : 'Siswa'}! 👋
                </h2>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Anda memiliki {schedules.length} jadwal pelajaran hari ini di kelas {studentStats.kelas}. Tetap fokus dan raih capaian terbaik!
                </p>
                <div className="mt-4">
                  <Link
                    to="/app/siswa"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4 decoration-2"
                  >
                    <span>Buka Rincian Akademik</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* 3D Student Character Asset */}
              <div className="shrink-0 flex items-center justify-center sm:justify-end">
                <img
                  src="/login-3d-character.svg"
                  alt="Student Working Illustration"
                  className="w-36 h-36 md:w-44 md:h-44 object-contain select-none pointer-events-none drop-shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* 2. PERFORMANCE & MY VISIT SECTION (Matching Reference Center) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* Left Box: Performance & Bar Chart (Col Span 7) */}
            <div className="md:col-span-7 bg-white rounded-3xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-extrabold text-slate-900">Performa Nilai</h3>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <span>Semester Ini</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block">Mata Pelajaran Terbaik:</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl font-black text-slate-900 tracking-tight">
                        {studentStats.kehadiran}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        Pemrograman Web
                      </span>
                    </div>
                  </div>
                  <Link
                    to="/app/siswa"
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 border border-slate-200 hover:border-blue-500 hover:text-blue-600 transition-colors"
                  >
                    Semua Mapel
                  </Link>
                </div>
              </div>

              {/* Vertical Bar Chart matching the Reference Image */}
              <div className="mt-6 pt-4 border-t border-slate-50">
                <div className="flex items-end justify-between gap-2 h-40">
                  {subjectGrades.map((item, idx) => {
                    const isTop = idx === 0 || idx === 2;
                    return (
                      <div key={idx} className="flex flex-col items-center flex-1 group">
                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 mb-1.5 transition-colors">
                          {item.score}
                        </span>
                        <div className="w-6 sm:w-8 md:w-9 h-28 bg-slate-100 rounded-xl relative flex items-end overflow-hidden p-0.5">
                          <div
                            className={`w-full rounded-lg transition-all duration-700 ease-out ${
                              isTop ? 'bg-[#2857e6]' : 'bg-[#4070f4]'
                            } group-hover:bg-blue-600`}
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
            <div className="md:col-span-5 bg-white rounded-3xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-extrabold text-slate-900">Kehadiran (Presensi)</h3>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <span>Bulan Ini</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>

                {/* 2x3 Circular Gauges matching Reference */}
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 my-2">
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

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Rata-Rata Disiplin</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 95.8% Hadir Tepat Waktu
                </span>
              </div>
            </div>
          </div>

          {/* 3. LINKED TEACHERS (Guru Pengajar / Wali Kelas - Matching Reference) */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Guru Pengajar & Pembimbing
              </h3>
              <Link
                to="/app/siswa"
                className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors"
              >
                Lihat Semua
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Teacher 1: Wali Kelas */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-white hover:border-blue-200 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-xs">
                    BS
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {studentStats.waliKelas}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Wali Kelas • Pemrograman Web
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full hover:bg-slate-200 hover:text-blue-600 flex items-center justify-center transition-colors"
                    title="Kirim Pesan"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full hover:bg-slate-200 hover:text-blue-600 flex items-center justify-center transition-colors"
                    title="Kontak Telepon"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Teacher 2: Guru Mapel */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-white hover:border-blue-200 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-xs">
                    SR
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Siti Rahmawati, S.Kom
                    </h4>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Guru Pengampu • Basis Data
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full hover:bg-slate-200 hover:text-blue-600 flex items-center justify-center transition-colors"
                    title="Kirim Pesan"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full hover:bg-slate-200 hover:text-blue-600 flex items-center justify-center transition-colors"
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

          {/* 1. CALENDAR / TODAY'S SCHEDULE (Matching Reference Right Top) */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Jadwal Kelas</h3>
                <span className="text-xs text-slate-400">{schedules.length} Sesi Terjadwal</span>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <span>Hari Ini</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* Vertical Timeline */}
            <div className="space-y-3 mt-4">
              {schedules.map((item, index) => {
                const isActive = index === 0;
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-2xl transition-all ${
                      isActive
                        ? 'bg-[#2857e6] text-white shadow-md'
                        : 'bg-slate-50/80 border border-slate-100 hover:bg-white hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className={`w-3.5 h-3.5 ${isActive ? 'text-white/80' : 'text-slate-400'}`} />
                        <span className={`text-[11px] font-bold ${isActive ? 'text-white' : 'text-slate-500'}`}>
                          {item.jam}
                        </span>
                      </div>
                      {isActive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                          Aktif
                        </span>
                      )}
                    </div>

                    <h4 className={`text-sm font-bold tracking-tight ${isActive ? 'text-white' : 'text-slate-900'}`}>
                      {item.mapel}
                    </h4>

                    <span className={`text-xs block mt-1 ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                      {item.guru} • {item.ruang}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. UPCOMING EVENTS / PENGUMUMAN (Matching Reference Right Bottom) */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-900">Agenda & Acara</h3>
              <Link
                to="/app/siswa"
                className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors"
              >
                Lihat Semua
              </Link>
            </div>

            <div className="space-y-3">
              {visibleAnnouncements.length > 0 ? (
                visibleAnnouncements.slice(0, 2).map((ann) => (
                  <div
                    key={ann.id}
                    className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-white hover:border-blue-200 transition-all flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate leading-snug">
                        {ann.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
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
                <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-slate-900">
                      Pekan Ujian & Workshop Digital
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
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
