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
    <aside className="w-68 bg-[#2857e6] shrink-0 hidden md:flex flex-col justify-between text-white relative z-30 select-none min-h-screen">
      {/* Background Pill Rail for Icons on the Left (Matching Reference Visual) */}
      <div className="absolute left-3.5 top-20 bottom-24 w-12 bg-[#4272f6] rounded-3xl pointer-events-none -z-0 shadow-inner" />

      <div className="relative z-10 pt-5">
        {/* Brand Header: "🔷 Smart" */}
        <div className="flex items-center gap-3 pl-6 pr-4 mb-6">
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white border border-white/30 shadow-xs shrink-0">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none text-white">
              Smart
            </h1>
            <span className="text-[10px] font-bold text-white/75 block mt-0.5 tracking-wider uppercase">
              SteelSchool
            </span>
          </div>
        </div>

        {/* Navigation Items (Left Icon Strip + Right Text with Merged Active Tab) */}
        <nav className="space-y-1.5">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className="relative flex items-center h-12 w-full group no-underline"
              >
                {({ isActive }) => (
                  <>
                    {/* Left Icon Rail Segment */}
                    <div className="w-16 shrink-0 flex items-center justify-center relative">
                      {/* Active Indicator: White vertical sliver on the very left */}
                      {isActive && (
                        <span className="absolute left-0 w-1.5 h-6 bg-white rounded-r-full shadow-2xs" />
                      )}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                          isActive
                            ? 'bg-white/25 text-white shadow-2xs'
                            : 'text-white/80 group-hover:text-white group-hover:bg-white/10'
                        }`}
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                      </div>
                    </div>

                    {/* Right Label Area: Putih Nyatu di Kanan, Melengkung di Kiri */}
                    <div
                      className={`flex-1 flex items-center h-full pl-3.5 pr-4 text-sm tracking-tight transition-all ${
                        isActive
                          ? 'sidebar-tab-merged font-black'
                          : 'text-white/85 group-hover:text-white font-bold pl-4'
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout Action at Bottom */}
      <div className="relative z-10 pb-6 pt-3 border-t border-white/15">
        <button
          onClick={() => logout()}
          className="relative flex items-center h-12 w-full group text-white/80 hover:text-white transition-colors"
        >
          {/* Left Icon */}
          <div className="w-16 shrink-0 flex items-center justify-center">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center group-hover:bg-white/10 text-white/80 group-hover:text-white transition-all">
              <LogOut className="w-5 h-5 shrink-0" />
            </div>
          </div>
          {/* Right Text */}
          <div className="flex-1 text-left pl-3.5 pr-4 text-sm font-bold tracking-tight">
            <span>Keluar Sesi</span>
          </div>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
