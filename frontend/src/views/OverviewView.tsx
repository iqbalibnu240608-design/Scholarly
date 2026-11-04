import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import {
  Users,
  GraduationCap,
  Briefcase,
  Store,
  Coffee,
  Building,
  Bell,
  ArrowRight,
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

  return (
    <div className="view-container">
      {/* Banner Selamat Datang */}
      <section className="welcome-banner">
        <div className="welcome-text">
          <h2>Selamat Datang di SteelSchool 🎓</h2>
          <p>
            Anda sedang melihat sistem dari sudut pandang{' '}
            <strong className="capitalize text-indigo-700">Role: {activeRole}</strong> (Akun Asli:{' '}
            {user?.name} - {user?.role}).
          </p>
        </div>
        <div className="system-chip">
          <span>Sistem Full Akses (Semua Role Terbuka)</span>
        </div>
      </section>

      {/* Metric Cards Grid */}
      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-wrapper bg-blue-100 text-blue-600">
            <GraduationCap size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Total Siswa</span>
            <span className="metric-value">{data?.metrics.total_siswa ?? '1+'}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper bg-emerald-100 text-emerald-600">
            <Briefcase size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Guru & Pengajar</span>
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
        {/* Left Column: Quick Navigation to All Roles */}
        <div className="overview-card">
          <div className="card-header">
            <h3>Navigasi Cepat Modul Peran (Roles)</h3>
            <span className="badge-pill">Semua Akses</span>
          </div>
          <div className="portal-links-grid">
            <Link to="/app/siswa" className="portal-tile">
              <span className="portal-icon">🎓</span>
              <div>
                <h4>Portal Siswa</h4>
                <p>Jadwal pelajaran, nilai, presensi & saldo</p>
              </div>
              <ArrowRight size={16} className="tile-arrow" />
            </Link>

            <Link to="/app/guru" className="portal-tile">
              <span className="portal-icon">👨‍🏫</span>
              <div>
                <h4>Portal Guru</h4>
                <p>Input nilai, jurnal mengajar & presensi</p>
              </div>
              <ArrowRight size={16} className="tile-arrow" />
            </Link>

            <Link to="/app/kepsek" className="portal-tile">
              <span className="portal-icon">🏫</span>
              <div>
                <h4>Portal Kepala Sekolah</h4>
                <p>Monitoring eksekutif, akreditasi & keuangan</p>
              </div>
              <ArrowRight size={16} className="tile-arrow" />
            </Link>

            <Link to="/app/petugas" className="portal-tile">
              <span className="portal-icon">📋</span>
              <div>
                <h4>Portal Petugas TU</h4>
                <p>Buku induk, verifikasi SPP & surat</p>
              </div>
              <ArrowRight size={16} className="tile-arrow" />
            </Link>

            <Link to="/app/kopsis" className="portal-tile">
              <span className="portal-icon">🛒</span>
              <div>
                <h4>Portal Kopsis</h4>
                <p>Kasir koperasi, stok ATK, & seragam</p>
              </div>
              <ArrowRight size={16} className="tile-arrow" />
            </Link>

            <Link to="/app/kantin" className="portal-tile">
              <span className="portal-icon">🍜</span>
              <div>
                <h4>Portal Kantin</h4>
                <p>Menu stand makanan/minuman & pesanan</p>
              </div>
              <ArrowRight size={16} className="tile-arrow" />
            </Link>
          </div>
        </div>

        {/* Right Column: Papan Pengumuman Sekolah */}
        <div className="overview-card">
          <div className="card-header">
            <h3>
              <Bell size={18} className="inline mr-2 text-indigo-600" />
              Papan Pengumuman Terpadu
            </h3>
            <span className="badge-pill text-xs">Database MySQL</span>
          </div>
          <div className="announcements-list">
            {loading ? (
              <p className="loading-state">Memuat pengumuman sekolah...</p>
            ) : data?.announcements && data.announcements.length > 0 ? (
              data.announcements.map((ann) => (
                <div key={ann.id} className="announcement-item">
                  <div className="announcement-top">
                    <h4>{ann.title}</h4>
                    <span className="target-pill">Target: {ann.target_role.toUpperCase()}</span>
                  </div>
                  <p>{ann.content}</p>
                </div>
              ))
            ) : (
              <p className="empty-state">Belum ada pengumuman terbaru.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
