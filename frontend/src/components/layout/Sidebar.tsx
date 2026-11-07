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
  LogOut,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeRole, logout } = useAuth();
  const isAdmin = activeRole === 'admin';

  const navigationItems = [
    {
      to: '/app',
      label: 'Dashboard',
      icon: LayoutDashboard,
      allowedRoles: ['admin', 'siswa', 'guru', 'kepsek', 'petugas', 'kopsis', 'kantin', 'security', 'perpustakaan', 'bk'],
      end: true,
    },
    {
      to: '/app/siswa',
      label: activeRole === 'siswa' ? 'Akademik' : 'Portal Siswa',
      icon: GraduationCap,
      allowedRoles: ['admin', 'siswa', 'guru', 'kepsek', 'petugas', 'bk'],
    },
    {
      to: '/app/kantin',
      label: 'Kantin Sekolah',
      icon: UtensilsCrossed,
      allowedRoles: ['admin', 'kantin', 'siswa', 'guru'],
    },
    {
      to: '/app/kopsis',
      label: 'Koperasi (Kopsis)',
      icon: ShoppingBag,
      allowedRoles: ['admin', 'kopsis', 'siswa', 'guru'],
    },
    {
      to: '/app/petugas',
      label: 'Tata Usaha & SPP',
      icon: FileSpreadsheet,
      allowedRoles: ['admin', 'petugas', 'siswa'],
    },
    {
      to: '/app/perpus',
      label: 'Perpustakaan',
      icon: BookMarked,
      allowedRoles: ['admin', 'perpustakaan', 'siswa', 'guru'],
    },
    {
      to: '/app/guru',
      label: 'Dewan Guru',
      icon: BookOpen,
      allowedRoles: ['admin', 'guru', 'kepsek'],
    },
    {
      to: '/app/kepsek',
      label: 'Monitoring Kepsek',
      icon: Award,
      allowedRoles: ['admin', 'kepsek'],
    },
    {
      to: '/app/security',
      label: 'Gerbang Satpam',
      icon: Shield,
      allowedRoles: ['admin', 'security'],
    },
    {
      to: '/app/admin',
      label: 'Manajemen Sistem',
      icon: Settings,
      allowedRoles: ['admin'],
    },
  ];

  const visibleItems = navigationItems.filter(
    (item) => isAdmin || item.allowedRoles.includes(activeRole)
  );

  return (
    <aside className="w-72 bg-[#2857e6] p-6 shrink-0 hidden md:flex flex-col justify-between text-white shadow-xl min-h-screen">
      <div>
        {/* Brand Header - "Smart SteelSchool" */}
        <div className="flex items-center gap-3.5 px-2 py-2 mb-8">
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white border border-white/30 shadow-xs shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none text-white">
              Smart
            </h1>
            <span className="text-xs font-bold text-white/80 block mt-1 tracking-wide">
              SteelSchool Ecosystem
            </span>
          </div>
        </div>

        {/* Navigation Items (Ukuran Isi Disesuaikan Lebih Besar & Prominen Seimbang dengan Header) */}
        <nav className="space-y-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-5 py-3.5 rounded-2xl text-[15px] transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-[#2857e6] shadow-md font-black scale-[1.02]'
                      : 'text-white/85 hover:text-white hover:bg-white/10 font-bold'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-5.5 h-5.5 shrink-0 ${isActive ? 'text-[#2857e6]' : 'text-white/85'}`} />
                    <span className="truncate tracking-tight">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout Action at Bottom - Prominent and Sized to Match */}
      <div className="pt-6 border-t border-white/20">
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3.5 px-5 py-3.5 rounded-2xl text-[15px] font-bold text-white/85 hover:text-white hover:bg-white/10 transition-colors"
        >
          <LogOut className="w-5.5 h-5.5 shrink-0" />
          <span>Keluar Sesi</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
