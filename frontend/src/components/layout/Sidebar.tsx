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
    <aside className="w-64 bg-white border-r border-slate-200/80 p-4 shrink-0 hidden md:flex flex-col justify-between">
      <div>
        <div className="px-3 pb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Menu Ekosistem
        </div>
        <ul className="space-y-1 list-none p-0 m-0">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-center">
        <span className="text-[11px] font-bold text-slate-700 block">SteelSchool v2.0</span>
        <span className="text-[10px] text-slate-400">Active Build: Production</span>
      </div>
    </aside>
  );
};
