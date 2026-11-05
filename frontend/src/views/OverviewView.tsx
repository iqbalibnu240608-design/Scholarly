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
  ShieldAlert,
  ShieldCheck,
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

  const isAdmin = activeRole === 'admin';

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await apiClient.get('/school/overview');
        setData(res.data);
      } catch (err) {
        console.error('Gagal mengambil overview data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  // Daftar portal peran dengan batasan izin masing-masing
  const allPortals = [
    {
      to: '/app/siswa',
      icon: '🎓',
      title: 'Portal Siswa',
      desc: 'Jadwal pelajaran, nilai, presensi & saldo digital',
      allowedRoles: ['admin', 'siswa', 'guru', 'kepsek', 'petugas'],
    },
    {
      to: '/app/guru',
      icon: '👨‍🏫',
      title: 'Portal Guru',
      desc: 'Input nilai evaluasi, absensi kelas & rekap',
      allowedRoles: ['admin', 'guru', 'kepsek'],
    },
    {
      to: '/app/kepsek',
      icon: '🏫',
      title: 'Portal Kepala Sekolah',
      desc: 'Monitoring eksekutif, akreditasi & keuangan',
      allowedRoles: ['admin', 'kepsek'],
    },
    {
      to: '/app/petugas',
      icon: '📋',
      title: 'Portal Petugas TU',
      desc: 'Buku induk, verifikasi pembayaran SPP & surat',
      allowedRoles: ['admin', 'petugas'],
    },
    {
      to: '/app/kopsis',
      icon: '🛒',
      title: 'Portal Koperasi (Kopsis)',
      desc: 'Kasir POS koperasi, stok ATK & seragam sekolah',
      allowedRoles: ['admin', 'kopsis'],
    },
    {
      to: '/app/kantin',
      icon: '🍜',
      title: 'Portal Kantin Sekolah',
      desc: 'Kasir POS stan kantin, kelola menu makanan & pesanan',
      allowedRoles: ['admin', 'kantin'],
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
          <h2>Selamat Datang di SteelSchool 🎓</h2>
          {isAdmin ? (
            <p>
              Anda sedang mengelola sistem dalam mode{' '}
              <strong className="text-indigo-700">Administrator Penuh</strong> (Akun:{' '}
              {user?.name || 'Admin'}).
            </p>
          ) : (
            <p>
              Anda sedang mengakses portal sebagai{' '}
              <strong className="text-indigo-700">
                {ROLE_LABELS[activeRole] || activeRole}
              </strong>{' '}
              (Wewenang terbatas sesuai peran).
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
              <ShieldAlert size={14} /> Hak Akses Khusus: {ROLE_LABELS[activeRole] || activeRole}
            </span>
          )}
        </div>
      </section>

      {/* Metric Cards Grid - Tampilkan overview metrik sekolah */}
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

      {/* Two Column Grid: Role Portals & Announcements */}
      <div className="overview-columns">
        {/* Left Column: Quick Navigation to Allowed Modules */}
        <div className="overview-card">
          <div className="card-header">
            <h3>
              {isAdmin
                ? 'Navigasi Modul Peran (Seluruh Modul)'
                : `Modul Khusus Wewenang: ${ROLE_LABELS[activeRole] || activeRole}`}
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
              🔒 <strong>Isolasi Hak Akses Aktif:</strong> Anda sedang dalam mode peran{' '}
              <strong>{ROLE_LABELS[activeRole] || activeRole}</strong>. Modul di luar wewenang Anda
              secara otomatis disembunyikan dan diproteksi oleh sistem keamanan.
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
