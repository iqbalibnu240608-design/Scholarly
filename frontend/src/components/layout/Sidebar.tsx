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
  ShieldCheck,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeRole } = useAuth();

  const navigationItems = [
    {
      to: '/app',
      label: 'Dashboard Utama',
      icon: LayoutDashboard,
      badge: 'Semua',
      role: 'all',
      end: true,
    },
    {
      to: '/app/siswa',
      label: 'Portal Siswa',
      icon: GraduationCap,
      badge: 'Siswa',
      role: 'siswa',
    },
    {
      to: '/app/guru',
      label: 'Portal Guru',
      icon: BookOpen,
      badge: 'Guru',
      role: 'guru',
    },
    {
      to: '/app/kepsek',
      label: 'Portal Kepsek',
      icon: Award,
      badge: 'Kepsek',
      role: 'kepsek',
    },
    {
      to: '/app/petugas',
      label: 'Portal TU & Petugas',
      icon: FileSpreadsheet,
      badge: 'Petugas',
      role: 'petugas',
    },
    {
      to: '/app/kopsis',
      label: 'Portal Koperasi (Kopsis)',
      icon: ShoppingBag,
      badge: 'Kopsis',
      role: 'kopsis',
    },
    {
      to: '/app/kantin',
      label: 'Portal Kantin Sekolah',
      icon: UtensilsCrossed,
      badge: 'Kantin',
      role: 'kantin',
    },
    {
      to: '/app/admin',
      label: 'Manajemen Sistem & Role',
      icon: Settings,
      badge: 'Admin',
      role: 'admin',
    },
  ];

  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-indicator">
          <ShieldCheck size={16} className="text-emerald-500" />
          <span>Akses Terbuka (Full Setup)</span>
        </div>
        <p className="sidebar-note">
          Mode eksplorasi semua modul role aktif untuk tahap sistem & arsitektur.
        </p>
      </div>

      <nav className="sidebar-nav">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isCurrentActiveRole = activeRole === item.role;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : ''} ${
                  isCurrentActiveRole ? 'nav-item-highlight' : ''
                }`
              }
            >
              <Icon size={18} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
              {item.badge && (
                <span className={`nav-badge ${isCurrentActiveRole ? 'nav-badge-focused' : ''}`}>
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
