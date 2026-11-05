import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { ROLE_LABELS } from '../types/auth';
import {
  Users,
  GraduationCap,
  Briefcase,
  Store,
  Coffee,
  Building,
  Bell,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  BookOpen,
  Award,
  Calendar,
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

        // Jika user adalah siswa, ambil juga data wallet & presensi personal
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

  // Daftar portal peran dengan batasan izin masing-masing
  const allPortals = [
    {
      to: '/app/siswa',
      icon: '🎓',
      title: isStudent ? 'Akademik & Nilai Saya' : 'Portal Siswa',
      desc: isStudent ? 'Lihat jadwal kelas, presensi, buku nilai & rapor' : 'Jadwal pelajaran, nilai, presensi & saldo digital',
      allowedRoles: ['admin', 'siswa', 'guru', 'kepsek', 'petugas'],
    },
    {
      to: '/app/kantin',
      icon: '🍜',
      title: isStudent || activeRole === 'guru' ? 'Pesan Kantin Sekolah' : 'Portal Kantin Sekolah',
      desc: isStudent || activeRole === 'guru' ? 'Pesan menu makanan & minuman secara cashless' : 'Kasir POS stan kantin & kelola menu makanan',
      allowedRoles: ['admin', 'kantin', 'siswa', 'guru'],
    },
    {
      to: '/app/kopsis',
      icon: '🛒',
      title: isStudent || activeRole === 'guru' ? 'Belanja Koperasi (Kopsis)' : 'Portal Koperasi (Kopsis)',
      desc: isStudent || activeRole === 'guru' ? 'Beli alat tulis, seragam, & buku pelajaran sekolah' : 'Kasir POS koperasi, stok ATK & seragam sekolah',
      allowedRoles: ['admin', 'kopsis', 'siswa', 'guru'],
    },
    {
      to: '/app/petugas',
      icon: '📋',
      title: isStudent ? 'Layanan SPP & Administrasi' : 'Portal Petugas TU',
      desc: isStudent ? 'Bayar tagihan SPP bulanan mandiri & cek riwayat kuitansi' : 'Buku induk, verifikasi pembayaran SPP & surat',
      allowedRoles: ['admin', 'petugas', 'siswa'],
    },
    {
      to: '/app/guru',
      icon: '👨‍🏫',
      title: 'Portal Guru',
      desc: 'Input nilai evaluasi, absensi kelas & rekap pengajaran',
      allowedRoles: ['admin', 'guru', 'kepsek'],
    },
    {
      to: '/app/kepsek',
      icon: '🏫',
      title: 'Portal Kepala Sekolah',
      desc: 'Monitoring eksekutif, akreditasi & keuangan sekolah',
      allowedRoles: ['admin', 'kepsek'],
    },
    {
      to: '/app/security',
      icon: '🛡️',
      title: 'Keamanan & Satpam',
      desc: 'Gate check-in RFID gerbang, kalkulasi keterlambatan',
      allowedRoles: ['admin', 'security'],
    },
    {
      to: '/app/admin',
      icon: '⚙️',
      title: 'Manajemen Sistem & Role',
      desc: 'Kelola akun pengguna, hak akses & konfigurasi sistem',
      allowedRoles: ['admin'],
    },
  ];

  // Filter modul yang hanya boleh diakses peran aktif
  const visiblePortals = allPortals.filter(
    (p) => isAdmin || p.allowedRoles.includes(activeRole)
  );

  // Filter pengumuman sesuai target peran aktif atau untuk semua
  const visibleAnnouncements = (data?.announcements || []).filter(
    (ann) =>
      isAdmin ||
      ann.target_role === 'all' ||
      ann.target_role === activeRole
  );

  return (
    <div className="view-container">
      {/* Banner Selamat Datang */}
      <section className="welcome-banner">
        <div className="welcome-text">
          <h2>
            Selamat Datang, {user?.name || (isAdmin ? 'Administrator' : 'Pengguna')} 🎓
          </h2>
          {isStudent ? (
            <p>
              Akun Siswa Aktif: <strong className="text-indigo-700">{user?.name}</strong> • NISN:{' '}
              <code>{user?.identifier_number || '0061234567'}</code> • Kelas: {studentStats.kelas}
            </p>
          ) : isAdmin ? (
            <p>
              Anda sedang mengelola sistem dalam mode{' '}
              <strong className="text-indigo-700">Administrator Penuh</strong> (Akun: {user?.name}).
            </p>
          ) : (
            <p>
              Anda sedang mengakses portal sebagai{' '}
              <strong className="text-indigo-700">{ROLE_LABELS[activeRole] || activeRole}</strong> (Akun: {user?.name}).
            </p>
          )}
        </div>
        <div className="system-chip">
          {isAdmin ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} /> Full Superuser Access
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e40af' }}>
              <UserCheck size={14} /> Akun: {ROLE_LABELS[activeRole] || activeRole}
            </span>
          )}
        </div>
      </section>

      {/* Metric Cards Grid - Disesuaikan apakah Siswa atau Staff */}
      {isStudent ? (
        <section className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon-wrapper bg-emerald-100 text-emerald-600">
              <Coffee size={24} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Saldo Kantin Anda</span>
              <span className="metric-value">Rp {studentStats.saldo_kantin.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrapper bg-orange-100 text-orange-600">
              <Store size={24} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Saldo Kopsis Anda</span>
              <span className="metric-value">Rp {studentStats.saldo_kopsis.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrapper bg-blue-100 text-blue-600">
              <CheckCircle2 size={24} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Status Tagihan SPP</span>
              <span className="metric-value" style={{ fontSize: '18px', color: '#16a34a' }}>
                {studentStats.spp_status}
              </span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrapper bg-indigo-100 text-indigo-600">
              <Calendar size={24} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Jadwal Hari Ini</span>
              <span className="metric-value">{studentStats.jadwal_count} Mapel</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrapper bg-purple-100 text-purple-600">
              <BookOpen size={24} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Tingkat Kehadiran</span>
              <span className="metric-value">{studentStats.kehadiran}</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrapper bg-amber-100 text-amber-600">
              <Award size={24} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Rombongan Belajar</span>
              <span className="metric-value">{studentStats.kelas}</span>
            </div>
          </div>
        </section>
      ) : (
        <section className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon-wrapper bg-blue-100 text-blue-600">
              <GraduationCap size={24} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Total Siswa Terdaftar</span>
              <span className="metric-value">{data?.metrics.total_siswa ?? '1+'}</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrapper bg-emerald-100 text-emerald-600">
              <Briefcase size={24} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Guru & Tenaga Pendidik</span>
              <span className="metric-value">{data?.metrics.total_guru ?? '1+'}</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrapper bg-purple-100 text-purple-600">
              <Users size={24} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Petugas TU & Staff</span>
              <span className="metric-value">{data?.metrics.total_petugas ?? '1+'}</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrapper bg-amber-100 text-amber-600">
              <Building size={24} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Rombongan Kelas</span>
              <span className="metric-value">{data?.metrics.total_kelas ?? '5'}</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrapper bg-orange-100 text-orange-600">
              <Store size={24} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Produk Kopsis</span>
              <span className="metric-value">{data?.metrics.total_kopsis_products ?? '5'}</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrapper bg-cyan-100 text-cyan-600">
              <Coffee size={24} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Menu Kantin</span>
              <span className="metric-value">{data?.metrics.total_kantin_menus ?? '6'}</span>
            </div>
          </div>
        </section>
      )}

      {/* Two Column Grid: Role Portals & Announcements */}
      <div className="overview-columns">
        {/* Left Column: Quick Navigation to Allowed Modules */}
        <div className="overview-card">
          <div className="card-header">
            <h3>
              {isAdmin
                ? 'Navigasi Modul Peran (Seluruh Modul)'
                : `Menu Akses: ${ROLE_LABELS[activeRole] || activeRole}`}
            </h3>
            <span className="badge-pill">
              {isAdmin ? 'Semua Akses' : `${visiblePortals.length} Modul Terbuka`}
            </span>
          </div>

          <div className="portal-links-grid">
            {visiblePortals.map((portal) => (
              <Link key={portal.to} to={portal.to} className="portal-tile">
                <span className="portal-icon">{portal.icon}</span>
                <div>
                  <h4>{portal.title}</h4>
                  <p>{portal.desc}</p>
                </div>
                <ArrowRight size={16} className="tile-arrow" />
              </Link>
            ))}
          </div>

          {!isAdmin && (
            <div className="mt-4 p-3 rounded text-xs bg-slate-50 text-slate-600 border border-slate-200">
              💡 <strong>Akun Riil Terhubung:</strong> Sesi Anda saat ini terhubung langsung ke akun{' '}
              <strong>{user?.name}</strong> ({ROLE_LABELS[activeRole] || activeRole}).
            </div>
          )}
        </div>

        {/* Right Column: Papan Pengumuman Sekolah */}
        <div className="overview-card">
          <div className="card-header">
            <h3>
              <Bell size={18} className="inline mr-2 text-indigo-600" />
              Papan Pengumuman Terpadu
            </h3>
            <span className="badge-pill text-xs">
              {isAdmin ? 'Semua Pengumuman' : `Target: ${ROLE_LABELS[activeRole] || activeRole}`}
            </span>
          </div>
          <div className="announcements-list">
            {loading ? (
              <p className="loading-state">Memuat pengumuman sekolah...</p>
            ) : visibleAnnouncements.length > 0 ? (
              visibleAnnouncements.map((ann) => (
                <div key={ann.id} className="announcement-item">
                  <div className="announcement-top">
                    <h4>{ann.title}</h4>
                    <span className="target-pill">Target: {ann.target_role.toUpperCase()}</span>
                  </div>
                  <p>{ann.content}</p>
                </div>
              ))
            ) : (
              <p className="empty-state">
                Tidak ada pengumuman khusus untuk peran {ROLE_LABELS[activeRole] || activeRole} saat ini.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
