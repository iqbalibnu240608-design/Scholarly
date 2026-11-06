import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { ROLE_LABELS } from '../types/auth';
import {
  Users,
  GraduationCap,
  Store,
  Building,
  Bell,
  ArrowRight,
  ShieldCheck,
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
    jadwal_count: number;
    kehadiran: string;
  }>({
    saldo_kopsis: 75000,
    saldo_kantin: 45000,
    spp_status: 'Lunas',
    kelas: 'XII RPL 1',
    jadwal_count: 3,
    kehadiran: '96.2%',
  });

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

          setStudentStats({
            saldo_kopsis: resWallet?.data?.wallet?.balance_kopsis ?? 75000,
            saldo_kantin: resWallet?.data?.wallet?.balance_kantin ?? 45000,
            spp_status: resSiswa?.data?.data?.tagihan_spp?.status ?? 'Lunas',
            kelas: resSiswa?.data?.data?.kelas ?? 'XII RPL 1',
            jadwal_count: resSiswa?.data?.data?.jadwal_hari_ini?.length ?? 3,
            kehadiran: resSiswa?.data?.data?.presensi_bulan_ini?.persentase ?? '96.2%',
          });
        }
      } catch (err) {
        console.error('Gagal mengambil overview data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, [activeRole]);

  // Clean NexaAdmin role portal items with Lucide icons (No raw emoji)
  const allPortals = [
    {
      to: '/app/siswa',
      icon: GraduationCap,
      iconBg: '#e0e7ff',
      iconColor: '#356df3',
      title: isStudent ? 'Akademik & Nilai Saya' : 'Portal Siswa',
      desc: isStudent ? 'Lihat jadwal kelas, presensi, buku nilai & rapor' : 'Jadwal pelajaran, nilai, presensi & saldo digital',
      allowedRoles: ['admin', 'siswa', 'guru', 'kepsek', 'petugas'],
    },
    {
      to: '/app/kantin',
      icon: UtensilsCrossed,
      iconBg: '#ffedd5',
      iconColor: '#ea580c',
      title: isStudent || activeRole === 'guru' ? 'Pesan Kantin Sekolah' : 'Kasir Kantin Sekolah',
      desc: isStudent || activeRole === 'guru' ? 'Pesan menu makanan & minuman secara cashless' : 'Kasir POS stan kantin & kelola menu makanan',
      allowedRoles: ['admin', 'kantin', 'siswa', 'guru'],
    },
    {
      to: '/app/kopsis',
      icon: ShoppingBag,
      iconBg: '#fce7f3',
      iconColor: '#db2777',
      title: isStudent || activeRole === 'guru' ? 'Belanja Koperasi (Kopsis)' : 'Kasir Koperasi (Kopsis)',
      desc: isStudent || activeRole === 'guru' ? 'Beli alat tulis, seragam, & buku pelajaran sekolah' : 'Kasir POS koperasi, stok ATK & seragam sekolah',
      allowedRoles: ['admin', 'kopsis', 'siswa', 'guru'],
    },
    {
      to: '/app/petugas',
      icon: FileSpreadsheet,
      iconBg: '#d1fae5',
      iconColor: '#059669',
      title: isStudent ? 'Layanan SPP & Administrasi' : 'Portal Tata Usaha (TU)',
      desc: isStudent ? 'Bayar tagihan SPP bulanan mandiri & cek riwayat kuitansi' : 'Buku induk, verifikasi pembayaran SPP & top-up wallet',
      allowedRoles: ['admin', 'petugas', 'siswa'],
    },
    {
      to: '/app/perpus',
      icon: BookMarked,
      iconBg: '#ede9fe',
      iconColor: '#7c3aed',
      title: isStudent ? 'Perpustakaan (E-Library)' : 'Portal Perpustakaan',
      desc: isStudent ? 'Pinjam buku pelajaran, modul, sastra & referensi' : 'Katalog inventaris buku & sirkulasi peminjaman',
      allowedRoles: ['admin', 'perpustakaan', 'siswa', 'guru'],
    },
    {
      to: '/app/guru',
      icon: BookOpen,
      iconBg: '#e0f2fe',
      iconColor: '#0284c7',
      title: 'Portal Dewan Guru',
      desc: 'Input nilai evaluasi (Tugas/UTS/UAS), absensi kelas & jurnal pengajaran',
      allowedRoles: ['admin', 'guru', 'kepsek'],
    },
    {
      to: '/app/kepsek',
      icon: Award,
      iconBg: '#fef3c7',
      iconColor: '#d97706',
      title: 'Monitoring Kepala Sekolah',
      desc: 'Monitoring eksekutif KPI, akreditasi & perputaran omset unit usaha',
      allowedRoles: ['admin', 'kepsek'],
    },
    {
      to: '/app/security',
      icon: Shield,
      iconBg: '#e0e7ff',
      iconColor: '#4338ca',
      title: 'Presensi Gerbang Satpam',
      desc: 'Gate check-in RFID gerbang sekolah, auto-kalkulasi menit keterlambatan',
      allowedRoles: ['admin', 'security'],
    },
    {
      to: '/app/admin',
      icon: Settings,
      iconBg: '#ede9fe',
      iconColor: '#6366f1',
      title: 'Manajemen Sistem & Role',
      desc: 'Kelola akun pengguna, reset sandi & konfigurasi hak akses RBAC',
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
      <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
        Memuat data ekosistem sekolah...
      </div>
    );
  }

  return (
    <div className="view-container">
      {/* Welcome Greeting Banner (Flowize AI Style) */}
      <div
        className="card-panel"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%)',
          border: '1px solid #e0e7ff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '28px',
          padding: '28px 32px',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: '#e0e7ff', color: '#4338ca', borderRadius: 9999, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
            <UserCheck size={14} />
            <span>Sesi Aktif: {ROLE_LABELS[activeRole] || activeRole}</span>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: -0.5, marginBottom: 6 }}>
            Selamat Datang, {user?.name || (isAdmin ? 'Administrator' : 'Pengguna')}
          </h2>
          <p style={{ fontSize: 14, color: '#64748b' }}>
            {isStudent
              ? `NISN: ${user?.identifier_number || '0061234567'} • Rombel Kelas: ${studentStats.kelas}`
              : 'Ekosistem Sekolah Terpadu berjalan lancar dan terintegrasi.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {isAdmin ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#d1fae5', color: '#065f46', borderRadius: 9999, fontSize: 13, fontWeight: 700 }}>
              <ShieldCheck size={16} />
              <span>Full Admin Access</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 9999, fontSize: 13, fontWeight: 600, color: '#334155' }}>
              <CheckCircle2 size={16} style={{ color: '#10b981' }} />
              <span>Status Terverifikasi</span>
            </div>
          )}
        </div>
      </div>

      {/* NexaAdmin 4-Grid Key Stat Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-content">
            <span className="kpi-label">{isStudent ? 'Saldo Koperasi Siswa' : 'Total Siswa Terdaftar'}</span>
            <span className="kpi-value">
              {isStudent ? `Rp ${studentStats.saldo_kopsis.toLocaleString('id-ID')}` : (data?.metrics?.total_siswa || 348)}
            </span>
            <span className="kpi-trend">
              <TrendingUp size={12} /> {isStudent ? 'Siap Dibelanjakan' : '+12 Siswa Baru'}
            </span>
          </div>
          <div className="kpi-icon-box icon-blue">
            <GraduationCap size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-content">
            <span className="kpi-label">{isStudent ? 'Saldo Kantin Sehat' : 'Dewan Guru & Staf'}</span>
            <span className="kpi-value">
              {isStudent ? `Rp ${studentStats.saldo_kantin.toLocaleString('id-ID')}` : (data?.metrics?.total_guru || 24)}
            </span>
            <span className="kpi-trend" style={{ color: '#6366f1' }}>
              <CheckCircle2 size={12} /> {isStudent ? 'Bebas Tunai' : 'Aktif Mengajar'}
            </span>
          </div>
          <div className="kpi-icon-box icon-purple">
            {isStudent ? <UtensilsCrossed size={24} /> : <Users size={24} />}
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-content">
            <span className="kpi-label">{isStudent ? 'Kehadiran Bulan Ini' : 'Rombongan Belajar'}</span>
            <span className="kpi-value">
              {isStudent ? studentStats.kehadiran : (data?.metrics?.total_kelas || 12)}
            </span>
            <span className="kpi-trend" style={{ color: '#059669' }}>
              <CheckCircle2 size={12} /> {isStudent ? 'Disiplin Tinggi' : 'Kelas X, XI, XII'}
            </span>
          </div>
          <div className="kpi-icon-box icon-emerald">
            {isStudent ? <Calendar size={24} /> : <Building size={24} />}
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-content">
            <span className="kpi-label">{isStudent ? 'Status SPP Bulan Ini' : 'Unit Usaha Sekolah'}</span>
            <span className="kpi-value" style={{ color: isStudent ? '#059669' : '#0f172a' }}>
              {isStudent ? studentStats.spp_status : ((data?.metrics?.total_kopsis_products || 28) + ' ATK / ' + (data?.metrics?.total_kantin_menus || 19) + ' Menu')}
            </span>
            <span className="kpi-trend" style={{ color: '#d97706' }}>
              <CheckCircle2 size={12} /> {isStudent ? 'Kuitansi Digital' : 'Kopsis & Kantin'}
            </span>
          </div>
          <div className="kpi-icon-box icon-amber">
            {isStudent ? <CreditCard size={24} /> : <Store size={24} />}
          </div>
        </div>
      </div>

      {/* Grid: Modul Civitas (NexaAdmin) + Papan Pengumuman (Flowize AI) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 24, marginBottom: 28 }}>
        {/* Modul Akses Cepat */}
        <div className="card-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Modul Civitas Sekolah</h3>
              <p style={{ fontSize: 13, color: '#64748b' }}>Pilih modul untuk mulai mengelola operasional peran Anda</p>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#356df3', background: '#eef2ff', padding: '4px 10px', borderRadius: 9999 }}>
              {visiblePortals.length} Modul Tersedia
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {visiblePortals.map((portal, idx) => {
              const PortalIcon = portal.icon;
              return (
                <Link
                  key={idx}
                  to={portal.to}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 14,
                    padding: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  className="card-panel-hover"
                >
                  <div>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: portal.iconBg,
                        color: portal.iconColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 12,
                      }}
                    >
                      <PortalIcon size={20} />
                    </div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                      {portal.title}
                    </h4>
                    <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, marginBottom: 14 }}>
                      {portal.desc}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#356df3' }}>
                    <span>Buka Portal</span>
                    <ArrowRight size={14} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Papan Pengumuman Sekolah */}
        <div className="card-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <Bell size={18} style={{ color: '#356df3' }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Pengumuman Sekolah</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {visibleAnnouncements.length > 0 ? (
              visibleAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: 9999 }}>
                      {ann.target_role === 'all' ? 'Semua Civitas' : ann.target_role.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>
                      {new Date(ann.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <h5 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                    {ann.title}
                  </h5>
                  <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                    {ann.content}
                  </p>
                </div>
              ))
            ) : (
              <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                Belum ada pengumuman baru untuk peran Anda.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewView;
