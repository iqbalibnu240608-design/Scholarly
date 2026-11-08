import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
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
  Radio,
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
      location: 'Plaza Utama SteelSchool',
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
      className="w-full max-w-[1540px] mx-auto"
      style={{
        width: '100%',
        maxWidth: '1540px',
        margin: '0 auto',
        padding: '0 0 40px 0',
        boxSizing: 'border-box',
      }}
    >
      {/* =========================================================================
          BARIS 1 (ATAS): 2 KOLOM ASIMETRIS
          Kiri: Banner Hitam 'Selamat Datang, Ahmad' (Deep Navy #0F172A)
          Kanan: Panel Ringkasan 'Status Civitas' (Presensi RFID 06:48 WIB & SPP)
          ========================================================================= */}
      <section
        className="grid grid-cols-1 lg:grid-cols-12 items-stretch"
        style={{
          display: 'grid',
          gap: '20px',
          boxSizing: 'border-box',
        }}
      >
        {/* Kolom Kiri: Banner Hitam 'Selamat Datang, Ahmad' */}
        <div
          className="lg:col-span-8 bg-[#0F172A] text-white"
          style={{
            padding: '28px 32px',
            borderRadius: '16px',
            backgroundColor: '#0F172A',
            border: '1px solid #1E293B',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            boxSizing: 'border-box',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
          }}
        >
          {/* Subtle Ambient Glow */}
          <div
            style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              width: '240px',
              height: '240px',
              backgroundColor: 'rgba(37, 99, 235, 0.15)',
              borderRadius: '9999px',
              filter: 'blur(50px)',
              pointerEvents: 'none',
            }}
          />

          {/* Top Badges */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                <Calendar className="w-3.5 h-3.5 text-blue-300" style={{ width: '14px', height: '14px' }} />
                <span>T.A. 2026/2027 Ganjil</span>
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  textTransform: 'uppercase',
                }}
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-300" style={{ width: '14px', height: '14px' }} />
                <span>{isStudent ? 'Siswa Terverifikasi' : `Peran: ${activeRole}`}</span>
              </span>
            </div>

            {/* Live Status Chip */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#6ee7b7',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '9999px',
                  backgroundColor: '#34d399',
                  display: 'inline-block',
                }}
                className="animate-pulse"
              />
              <span>RFID Smart Gate: Terhubung</span>
            </span>
          </div>

          {/* Heading & Subtitle */}
          <div style={{ position: 'relative', zIndex: 10, margin: '8px 0' }}>
            <h2
              style={{
                fontSize: '28px',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.25,
                letterSpacing: '-0.02em',
                margin: '0 0 8px 0',
              }}
            >
              Selamat Datang, {displayName}
            </h2>
            <p
              style={{
                color: '#cbd5e1',
                fontSize: '13px',
                lineHeight: 1.6,
                maxWidth: '620px',
                margin: 0,
              }}
            >
              {isStudent
                ? 'Portal terpadu Smart SteelSchool siap menemani aktivitas belajar Anda. Pantau jadwal kelas harian, kelola saldo dompet digital kantin & koperasi, serta verifikasi status presensi secara instan.'
                : 'Pusat komando operasional ekosistem sekolah. Pantau aktivitas belajar mengajar, sinkronisasi kehadiran gerbang RFID, dan kelola administrasi civitas sekolah secara menyeluruh.'}
            </p>
          </div>

          {/* Tombol Putih 'Buka Jadwal & Kelas' */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <Link
              to={isStudent ? '/app/siswa' : '/app/admin'}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                color: '#0F172A',
                fontWeight: 700,
                fontSize: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
              }}
              className="hover:bg-slate-100 group"
            >
              <span>{isStudent ? 'Buka Jadwal & Kelas' : 'Kelola Modul Administrator'}</span>
              <ArrowRight className="w-4 h-4 text-slate-900 group-hover:translate-x-1 transition-transform" style={{ width: '16px', height: '16px' }} />
            </Link>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94a3b8' }}>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" style={{ width: '16px', height: '16px' }} />
              <span>Terverifikasi Sistem Smart Identity Card</span>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Panel 'Status Civitas' */}
        <div
          className="lg:col-span-4"
          style={{
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
          {/* Header Panel */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '14px',
              borderBottom: '1px solid #F1F5F9',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                }}
              >
                <ShieldCheck style={{ width: '18px', height: '18px' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Status Civitas & Verifikasi
                </h3>
                <p style={{ fontSize: '11px', color: '#94A3B8', margin: '2px 0 0 0' }}>Presensi Gerbang & Finansial</p>
              </div>
            </div>
            <span
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 800,
                backgroundColor: '#ECFDF5',
                color: '#047857',
                border: '1px solid #A7F3D0',
                textTransform: 'uppercase',
              }}
            >
              Terverifikasi
            </span>
          </div>

          {/* Blok 1: Presensi Gerbang RFID */}
          <div style={{ padding: '14px 0', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8' }}>
                Presensi Gerbang RFID
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '10px',
                  fontWeight: 700,
                  backgroundColor: '#D1FAE5',
                  color: '#065F46',
                }}
              >
                <CheckCircle2 style={{ width: '12px', height: '12px' }} />
                <span>Tepat Waktu</span>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '24px', fontWeight: 900, color: '#0F172A' }}>
                {studentStats.presensiGerbangJam}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>Gate 1 • Gerbang Utama</span>
            </div>
          </div>

          {/* Blok 2: Status SPP */}
          <div style={{ paddingTop: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8' }}>
                Status Pembayaran SPP
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '10px',
                  fontWeight: 700,
                  backgroundColor: '#DBEAFE',
                  color: '#1E40AF',
                }}
              >
                <span>Lunas (Bulan Berjalan)</span>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: '14px', color: '#059669', display: 'block' }}>
                  Periode November 2026
                </span>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>Bebas Tunggakan Administrasi</span>
              </div>
              <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748B', backgroundColor: '#F1F5F9', padding: '3px 6px', borderRadius: '4px' }}>
                Next: 10 Des 2026
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BARIS 2 (TENGAH): 3 KOLOM BENTO GRID
          margin-top: 24px (mt-6) antara banner hitam dengan barisan kartu di bawahnya
          Kolom 1 & 2 (Kiri 2/3): Dompet Digital & 4 Modul Layanan
          Kolom 3 (Kanan 1/3): Panel 'Jadwal Kelas Hari Ini'
          ========================================================================= */}
      <section
        className="grid grid-cols-1 lg:grid-cols-12 items-stretch"
        style={{
          display: 'grid',
          gap: '20px',
          marginTop: '24px',
          boxSizing: 'border-box',
        }}
      >
        {/* Kolom Kiri 2/3: E-Wallet Cards & 4 Modul Akses Cepat */}
        <div
          className="lg:col-span-8"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '20px',
            boxSizing: 'border-box',
          }}
        >
          {/* Sub-Baris Atas: 2 Kartu Dompet Digital E-Wallet */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2"
            style={{
              display: 'grid',
              gap: '20px',
              boxSizing: 'border-box',
            }}
          >
            {/* E-Wallet Card 1: Saldo Kantin Digital */}
            <div
              style={{
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxSizing: 'border-box',
              }}
              className="hover:border-blue-300 transition-all group"
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: '#EFF6FF',
                        color: '#2563EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <UtensilsCrossed style={{ width: '16px', height: '16px' }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                        Kantin Digital
                      </h4>
                      <span style={{ fontSize: '10px', color: '#94A3B8' }}>E-Wallet Jajan Siswa</span>
                    </div>
                  </div>
                  <Radio style={{ width: '16px', height: '16px', color: '#94A3B8', transform: 'rotate(90deg)' }} />
                </div>

                <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#94A3B8', margin: '14px 0 4px 0', letterSpacing: '0.1em' }}>
                  ID KARTU: •••• 4829
                </p>

                <div style={{ margin: '4px 0 12px 0' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8', display: 'block' }}>
                    Sisa Saldo Jajan
                  </span>
                  <span style={{ fontFamily: 'monospace', fontSize: '26px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>
                    Rp {studentStats.saldoKantin.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '14px', borderTop: '1px solid #F1F5F9', marginTop: '12px' }}>
                <Link
                  to="/app/kantin"
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#EFF6FF',
                    color: '#1D4ED8',
                    fontWeight: 700,
                    fontSize: '12px',
                    textDecoration: 'none',
                  }}
                  className="hover:bg-blue-100 transition-colors"
                >
                  Pesan Menu
                </Link>
                <Link
                  to="/app/kantin"
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#F1F5F9',
                    color: '#334155',
                    fontWeight: 700,
                    fontSize: '12px',
                    textDecoration: 'none',
                  }}
                  className="hover:bg-slate-200 transition-colors"
                >
                  Top Up
                </Link>
              </div>
            </div>

            {/* E-Wallet Card 2: Saldo Koperasi Siswa */}
            <div
              style={{
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxSizing: 'border-box',
              }}
              className="hover:border-blue-300 transition-all group"
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: '#EFF6FF',
                        color: '#2563EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ShoppingBag style={{ width: '16px', height: '16px' }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                        Koperasi Siswa
                      </h4>
                      <span style={{ fontSize: '10px', color: '#94A3B8' }}>E-Wallet Kopsis</span>
                    </div>
                  </div>
                  <Radio style={{ width: '16px', height: '16px', color: '#94A3B8', transform: 'rotate(90deg)' }} />
                </div>

                <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#94A3B8', margin: '14px 0 4px 0', letterSpacing: '0.1em' }}>
                  ID REKENING: •••• 9102
                </p>

                <div style={{ margin: '4px 0 12px 0' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8', display: 'block' }}>
                    Sisa Saldo Belanja
                  </span>
                  <span style={{ fontFamily: 'monospace', fontSize: '26px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>
                    Rp {studentStats.saldoKopsis.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '14px', borderTop: '1px solid #F1F5F9', marginTop: '12px' }}>
                <Link
                  to="/app/kopsis"
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#EFF6FF',
                    color: '#1D4ED8',
                    fontWeight: 700,
                    fontSize: '12px',
                    textDecoration: 'none',
                  }}
                  className="hover:bg-blue-100 transition-colors"
                >
                  Katalog Toko
                </Link>
                <Link
                  to="/app/kopsis"
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#F1F5F9',
                    color: '#334155',
                    fontWeight: 700,
                    fontSize: '12px',
                    textDecoration: 'none',
                  }}
                  className="hover:bg-slate-200 transition-colors"
                >
                  Top Up
                </Link>
              </div>
            </div>
          </div>

          {/* Sub-Baris Bawah: 4 Modul Layanan & Akses Cepat */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2"
            style={{
              display: 'grid',
              gap: '20px',
              boxSizing: 'border-box',
            }}
          >
            {/* Featured Card: Portal Akademik & Penilaian (#EFF6FF / border #BFDBFE) */}
            <div
              style={{
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #BFDBFE',
                backgroundColor: '#EFF6FF',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxSizing: 'border-box',
              }}
              className="hover:shadow-md transition-all group"
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: '#2563EB',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <GraduationCap style={{ width: '20px', height: '20px' }} />
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      padding: '3px 8px',
                      borderRadius: '9999px',
                      backgroundColor: '#2563EB',
                      color: '#ffffff',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Modul Utama
                  </span>
                </div>

                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#1E3A8A', margin: '0 0 6px 0', letterSpacing: '-0.01em' }}>
                  Portal Akademik & Penilaian
                </h4>
                <p style={{ fontSize: '12px', color: '#1E40AF', margin: 0, lineHeight: 1.5 }}>
                  Pantau buku nilai, transkrip rapor semester terpadu, dan jadwal ujian CBT sekolah secara realtime.
                </p>

                {/* Micro Sub-Features */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, backgroundColor: '#ffffff', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '2px 8px', borderRadius: '6px' }}>
                    Buku Nilai
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: 700, backgroundColor: '#ffffff', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '2px 8px', borderRadius: '6px' }}>
                    Transkrip Rapor
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: 700, backgroundColor: '#ffffff', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '2px 8px', borderRadius: '6px' }}>
                    Jadwal CBT
                  </span>
                </div>
              </div>

              <Link
                to="/app/siswa"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#1D4ED8',
                  textDecoration: 'none',
                  marginTop: '16px',
                }}
                className="group-hover:translate-x-1 transition-transform"
              >
                <span>Buka Modul Akademik</span>
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </Link>
            </div>

            {/* Modul 2: Kantin Digital */}
            <div
              style={{
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxSizing: 'border-box',
              }}
              className="hover:border-blue-300 transition-all group"
            >
              <div>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <UtensilsCrossed style={{ width: '20px', height: '20px' }} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
                  Kantin Sehat Digital
                </h4>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                  Pesan makanan higienis tanpa antre, pre-order jam istirahat, dan transaksi cashless kartu pelajar.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '11px', color: '#64748B' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: '#10B981', display: 'inline-block' }} />
                  <span>Kantin Buka • 18 Menu Tersedia</span>
                </div>
              </div>

              <Link
                to="/app/kantin"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#334155',
                  textDecoration: 'none',
                  marginTop: '16px',
                }}
                className="hover:text-blue-600 group-hover:translate-x-1 transition-all"
              >
                <span>Buka Kantin</span>
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </Link>
            </div>

            {/* Modul 3: Koperasi Siswa */}
            <div
              style={{
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxSizing: 'border-box',
              }}
              className="hover:border-blue-300 transition-all group"
            >
              <div>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <ShoppingBag style={{ width: '20px', height: '20px' }} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
                  Koperasi Siswa
                </h4>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                  Kebutuhan seragam resmi, atribut OSIS, buku paket kurikulum merdeka, dan alat tulis sekolah.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '11px', color: '#64748B' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: '#2563EB', display: 'inline-block' }} />
                  <span>Stok Seragam & Buku Siap</span>
                </div>
              </div>

              <Link
                to="/app/kopsis"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#334155',
                  textDecoration: 'none',
                  marginTop: '16px',
                }}
                className="hover:text-blue-600 group-hover:translate-x-1 transition-all"
              >
                <span>Katalog Koperasi</span>
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </Link>
            </div>

            {/* Modul 4: Presensi Digital & RFID */}
            <div
              style={{
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxSizing: 'border-box',
              }}
              className="hover:border-blue-300 transition-all group"
            >
              <div>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <ShieldCheck style={{ width: '20px', height: '20px' }} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
                  Presensi & Kartu RFID
                </h4>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                  Rekapitulasi absensi 100% hadir, riwayat tap kartu gerbang otomatis, dan pengajuan surat izin online.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '11px', color: '#64748B' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: '#10B981', display: 'inline-block' }} />
                  <span>Gerbang Aktif: Gate 1 & 2</span>
                </div>
              </div>

              <Link
                to="/app/security"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#334155',
                  textDecoration: 'none',
                  marginTop: '16px',
                }}
                className="hover:text-blue-600 group-hover:translate-x-1 transition-all"
              >
                <span>Cek Rekap Presensi</span>
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </Link>
            </div>
          </div>
        </div>

        {/* Kolom Kanan 1/3: Panel 'Jadwal Kelas Hari Ini' */}
        <div
          className="lg:col-span-4"
          style={{
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        >
          <div>
            {/* Header Jadwal */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '14px',
                borderBottom: '1px solid #F1F5F9',
              }}
            >
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Clock style={{ width: '16px', height: '16px', color: '#2563EB' }} />
                  <span>Jadwal Kelas Hari Ini</span>
                </h3>
                <p style={{ fontSize: '11px', color: '#94A3B8', margin: '2px 0 0 0' }}>Senin • Semester Ganjil</p>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#1D4ED8',
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  padding: '2px 8px',
                  borderRadius: '6px',
                }}
              >
                {studentStats.kelas}
              </span>
            </div>

            {/* List Kartu Per Mata Pelajaran Berlatar #F8FAFC */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {schedules.map((item, idx) => {
                const isOngoing = item.status?.includes('Berlangsung') || idx === 0;

                return (
                  <div
                    key={idx}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '10px',
                      border: isOngoing ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                      backgroundColor: isOngoing ? '#F0F7FF' : '#F8FAFC',
                      boxSizing: 'border-box',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#334155',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {isOngoing && <span style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: '#10B981', display: 'inline-block' }} className="animate-pulse" />}
                        {item.jam}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          backgroundColor: isOngoing ? '#D1FAE5' : '#E2E8F0',
                          color: isOngoing ? '#065F46' : '#475569',
                        }}
                      >
                        {item.status || 'Terjadwal'}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0', lineHeight: 1.4 }}>
                      {item.mapel}
                    </h4>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#64748B' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>
                        {item.guru}
                      </span>
                      <span style={{ fontWeight: 600, color: '#334155', backgroundColor: '#ffffff', border: '1px solid #E2E8F0', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', flexShrink: 0 }}>
                        {item.ruang}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Action */}
          <div style={{ paddingTop: '16px', marginTop: '16px', borderTop: '1px solid #F1F5F9' }}>
            <Link
              to="/app/siswa"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: '#F8FAFC',
                color: '#334155',
                fontWeight: 700,
                fontSize: '12px',
                textAlign: 'center',
                border: '1px solid #E2E8F0',
                display: 'block',
                textDecoration: 'none',
                boxSizing: 'border-box',
              }}
              className="hover:bg-slate-100 transition-colors"
            >
              Lihat Jadwal Lengkap Mingguan →
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BARIS 3 (BAWAH): 2 KOLOM SEIMBANG
          Kiri: Guru Pengajar & Pembimbing (Padding: 20px, Border-radius: 12px)
          Kanan: Agenda & Acara Sekolah (Padding: 20px, Border-radius: 12px)
          ========================================================================= */}
      <section
        className="grid grid-cols-1 lg:grid-cols-2"
        style={{
          display: 'grid',
          gap: '20px',
          marginTop: '24px',
          boxSizing: 'border-box',
        }}
      >
        {/* Kolom Kiri: Guru Pengajar & Pembimbing */}
        <div
          style={{
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '14px',
              borderBottom: '1px solid #F1F5F9',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <GraduationCap style={{ width: '18px', height: '18px' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Guru Pengajar & Pembimbing
                </h3>
                <p style={{ fontSize: '11px', color: '#94A3B8', margin: '2px 0 0 0' }}>Daftar pendidik aktif kelas Anda</p>
              </div>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>3 Pendidik</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {teachersList.map((teacher, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F8FAFC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  boxSizing: 'border-box',
                }}
                className="hover:border-blue-200 transition-all"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: '#2563EB',
                      color: '#ffffff',
                      fontWeight: 900,
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {teacher.initials}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {teacher.name}
                    </h4>
                    <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {teacher.role}
                    </p>
                    <span style={{ fontSize: '10px', color: '#94A3B8', display: 'block' }}>{teacher.ruang}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTeacher(teacher)}
                  style={{
                    flexShrink: 0,
                    padding: '6px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #E2E8F0',
                    color: '#334155',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                >
                  <Phone style={{ width: '14px', height: '14px', color: '#059669' }} />
                  <span>Kontak</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom Kanan: Agenda & Acara Sekolah */}
        <div
          style={{
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '14px',
              borderBottom: '1px solid #F1F5F9',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Calendar style={{ width: '18px', height: '18px' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Agenda & Acara Sekolah
                </h3>
                <p style={{ fontSize: '11px', color: '#94A3B8', margin: '2px 0 0 0' }}>Kalender kegiatan dan pengumuman resmi</p>
              </div>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>Semester Ganjil</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {schoolEvents.map((event) => (
              <div
                key={event.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F8FAFC',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  boxSizing: 'border-box',
                }}
                className="hover:border-blue-200 transition-all"
              >
                {/* Date or Announcement Icon Badge */}
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    minWidth: '48px',
                    minHeight: '48px',
                    borderRadius: '12px',
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    color: '#1D4ED8',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxSizing: 'border-box',
                  }}
                  className="w-12 h-12 shrink-0 rounded-xl"
                >
                  {event.isAnnouncement || event.month === 'INFO' || isNaN(Number(event.day)) ? (
                    <Megaphone style={{ width: '22px', height: '22px', color: '#1D4ED8' }} />
                  ) : (
                    <>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          lineHeight: 1,
                          color: '#2563EB',
                        }}
                      >
                        {event.month}
                      </span>
                      <span
                        style={{
                          fontSize: '16px',
                          fontWeight: 900,
                          lineHeight: 1,
                          marginTop: '2px',
                          color: '#1D4ED8',
                        }}
                      >
                        {event.day}
                      </span>
                    </>
                  )}
                </div>

                {/* Details */}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {event.title}
                    </h4>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#ffffff', border: '1px solid #E2E8F0', color: '#475569', flexShrink: 0 }}>
                      {event.category}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#64748B', margin: '3px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {event.desc}
                  </p>
                  <span style={{ fontSize: '10px', color: '#94A3B8', display: 'block' }}>
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
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '420px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid #E2E8F0',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '12px',
                borderBottom: '1px solid #F1F5F9',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GraduationCap style={{ width: '20px', height: '20px', color: '#2563EB' }} />
                <h3 style={{ fontWeight: 700, color: '#0F172A', fontSize: '14px', margin: 0 }}>
                  Informasi Kontak Pengajar
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTeacher(null)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  color: '#94A3B8',
                  border: 'none',
                  backgroundColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                className="hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '14px',
                  backgroundColor: '#2563EB',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
                }}
              >
                {selectedTeacher.initials}
              </div>
              <h4 style={{ fontWeight: 800, color: '#0F172A', fontSize: '16px', margin: '12px 0 2px 0' }}>
                {selectedTeacher.name}
              </h4>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#2563EB', margin: 0 }}>
                {selectedTeacher.role}
              </p>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: '2px 0 0 0' }}>
                {selectedTeacher.ruang}
              </p>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#334155', minWidth: 0 }}>
                  <Phone style={{ width: '16px', height: '16px', color: '#059669', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'monospace', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedTeacher.phone}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyContact(selectedTeacher.phone, 'Nomor WhatsApp')}
                  style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', padding: 0 }}
                  className="hover:underline"
                >
                  Salin
                </button>
              </div>

              <div
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#334155', minWidth: 0 }}>
                  <Mail style={{ width: '16px', height: '16px', color: '#2563EB', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'monospace', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedTeacher.email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyContact(selectedTeacher.email, 'Alamat Email')}
                  style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', padding: 0 }}
                  className="hover:underline"
                >
                  Salin
                </button>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <a
                href={`https://wa.me/${selectedTeacher.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '10px',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '12px',
                  textAlign: 'center',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                }}
                className="hover:bg-emerald-700 transition-colors"
              >
                <Phone style={{ width: '14px', height: '14px' }} />
                <span>Kirim Pesan WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => setSelectedTeacher(null)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '10px',
                  backgroundColor: '#F1F5F9',
                  color: '#334155',
                  fontWeight: 700,
                  fontSize: '12px',
                  border: 'none',
                  cursor: 'pointer',
                }}
                className="hover:bg-slate-200 transition-colors"
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
