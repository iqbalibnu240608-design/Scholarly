import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Award,
  FileSpreadsheet,
  ShoppingBag,
  UtensilsCrossed,
  Settings,
  Shield,
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
      label: activeRole === 'siswa' || activeRole === 'guru' ? 'Kantin Sekolah' : 'Kasir Kantin',
      icon: UtensilsCrossed,
      badge: 'Kantin',
      allowedRoles: ['admin', 'kantin', 'siswa', 'guru'],
    },
    {
      to: '/app/kopsis',
      label: activeRole === 'siswa' || activeRole === 'guru' ? 'Koperasi Siswa' : 'Kasir Kopsis',
      icon: ShoppingBag,
      badge: 'Kopsis',
      allowedRoles: ['admin', 'kopsis', 'siswa', 'guru'],
    },
    {
      to: '/app/petugas',
      label: activeRole === 'siswa' ? 'Layanan TU & SPP' : 'Tata Usaha (TU)',
      icon: FileSpreadsheet,
      badge: 'SPP',
      allowedRoles: ['admin', 'petugas', 'siswa'],
    },
    {
      to: '/app/perpus',
      label: 'Perpustakaan (E-Library)',
      icon: BookMarked,
      badge: 'Perpus',
      allowedRoles: ['admin', 'perpustakaan', 'siswa', 'guru'],
    },
    {
      to: '/app/guru',
      label: 'Portal Dewan Guru',
      icon: BookOpen,
      badge: 'Nilai',
      allowedRoles: ['admin', 'guru', 'kepsek'],
    },
    {
      to: '/app/kepsek',
      label: 'Monitoring Kepsek',
      icon: Award,
      badge: 'Eksekutif',
      allowedRoles: ['admin', 'kepsek'],
    },
    {
      to: '/app/security',
      label: 'Gate Presensi Satpam',
      icon: Shield,
      badge: 'RFID',
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

  const visibleItems = navigationItems.filter(
    (item) => isAdmin || item.allowedRoles.includes(activeRole)
  );

  return (
    <aside className="app-sidebar">
      <div className="sidebar-heading">Menu Ekosistem</div>
      <ul className="sidebar-nav-list">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  isActive ? 'sidebar-nav-item active' : 'sidebar-nav-item'
                }
              >
                <div className="nav-link-content">
                  <Icon className="nav-icon" />
                  <span>{item.label}</span>
                </div>
                {item.badge && <span className="nav-item-badge">{item.badge}</span>}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};
