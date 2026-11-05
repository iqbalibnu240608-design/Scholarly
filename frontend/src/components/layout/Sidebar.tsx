import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../types/auth';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Award,
  FileSpreadsheet,
  ShoppingBag,
  UtensilsCrossed,
  Settings,
  ShieldCheck,
  Shield,
  Lock,
  BookMarked,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeRole } = useAuth();
  const isAdmin = activeRole === 'admin';

  const navigationItems = [
    {
      to: '/app',
      label: 'Dashboard Utama',
      icon: LayoutDashboard,
      badge: 'Semua',
      allowedRoles: ['admin', 'siswa', 'guru', 'kepsek', 'petugas', 'kopsis', 'kantin', 'security', 'perpustakaan', 'bk'],
      end: true,
    },
    {
      to: '/app/siswa',
      label: activeRole === 'siswa' ? 'Akademik & Presensi' : 'Portal Siswa',
      icon: GraduationCap,
      badge: 'Siswa',
      allowedRoles: ['admin', 'siswa', 'guru', 'kepsek', 'petugas', 'bk'],
    },
    {
      to: '/app/kantin',
      label: activeRole === 'siswa' || activeRole === 'guru' ? 'Kantin Sekolah' : 'Portal Kantin Sekolah',
      icon: UtensilsCrossed,
      badge: activeRole === 'siswa' || activeRole === 'guru' ? 'Pesan Makanan' : 'Kantin',
      allowedRoles: ['admin', 'kantin', 'siswa', 'guru'],
    },
    {
      to: '/app/kopsis',
      label: activeRole === 'siswa' || activeRole === 'guru' ? 'Koperasi Siswa' : 'Portal Koperasi (Kopsis)',
      icon: ShoppingBag,
      badge: activeRole === 'siswa' || activeRole === 'guru' ? 'Belanja ATK' : 'Kopsis',
      allowedRoles: ['admin', 'kopsis', 'siswa', 'guru'],
    },
    {
      to: '/app/petugas',
      label: activeRole === 'siswa' ? 'Layanan TU & SPP' : 'Portal TU & Petugas',
      icon: FileSpreadsheet,
      badge: activeRole === 'siswa' ? 'Bayar SPP' : 'Petugas',
      allowedRoles: ['admin', 'petugas', 'siswa'],
    },
    {
      to: '/app/perpus',
      label: activeRole === 'perpustakaan' ? 'Portal Perpustakaan' : 'Perpustakaan (Perpus)',
      icon: BookMarked,
      badge: activeRole === 'siswa' ? 'Pinjam Buku' : 'Perpus',
      allowedRoles: ['admin', 'perpustakaan', 'siswa', 'guru'],
    },
    {
      to: '/app/guru',
      label: 'Portal Guru',
      icon: BookOpen,
      badge: 'Guru',
      allowedRoles: ['admin', 'guru', 'kepsek'],
    },
    {
      to: '/app/kepsek',
      label: 'Portal Kepsek',
      icon: Award,
      badge: 'Kepsek',
      allowedRoles: ['admin', 'kepsek'],
    },
    {
      to: '/app/security',
      label: 'Keamanan & Satpam',
      icon: Shield,
      badge: 'Satpam',
      allowedRoles: ['admin', 'security'],
    },
    {
      to: '/app/admin',
      label: 'Manajemen Sistem & Role',
      icon: Settings,
      badge: 'Admin',
      allowedRoles: ['admin'],
    },
  ];

  // Hanya tampilkan modul yang berhak diakses oleh peran aktif saat ini
  const visibleItems = navigationItems.filter(
    (item) => isAdmin || item.allowedRoles.includes(activeRole)
  );

  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        {isAdmin ? (
          <>
            <div className="sidebar-indicator">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span>Akses Admin (Full Setup)</span>
            </div>
            <p className="sidebar-note">
              Mode inspeksi seluruh modul ekosistem sekolah aktif untuk Administrator.
            </p>
          </>
        ) : (
          <>
            <div className="sidebar-indicator" style={{ color: '#2563eb' }}>
              <Lock size={15} style={{ color: '#2563eb' }} />
              <span>Akses Peran: {ROLE_LABELS[activeRole] || activeRole}</span>
            </div>
            <p className="sidebar-note">
              Navigasi disesuaikan untuk kebutuhan{' '}
              <strong style={{ color: '#1e293b' }}>{ROLE_LABELS[activeRole] || activeRole}</strong>.
            </p>
          </>
        )}
      </div>

      <nav className="sidebar-nav">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isTargetRole = item.allowedRoles.includes(activeRole) && item.to !== '/app';

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : ''} ${
                  isTargetRole ? 'nav-item-highlight' : ''
                }`
              }
            >
              <Icon size={18} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
              {item.badge && (
                <span className={`nav-badge ${isTargetRole ? 'nav-badge-focused' : ''}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="system-pill">
          <span className="dot dot-online" />
          <span>Backend Laravel 12 API Ready</span>
        </div>
      </div>
    </aside>
  );
};
