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
  X,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onCloseMobile }) => {
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
      label: activeRole === 'siswa' ? 'Akademik Siswa' : 'Portal Siswa',
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
      label: 'Koperasi Siswa',
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
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Main Aside Navigation */}
      <aside
        className={`w-[250px] bg-[#2857e6] shrink-0 text-white select-none overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden transition-transform duration-300 z-50 ${
          mobileOpen
            ? 'fixed inset-y-0 left-0 flex flex-col justify-between shadow-2xl translate-x-0'
            : 'hidden md:flex md:flex-col md:justify-between sticky top-0 h-screen'
        }`}
      >
        {/* Brand Header: Exactly h-16 (64px) for perfect symmetry with top Navbar */}
        <div className="h-16 shrink-0 flex items-center justify-between px-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white border border-white/30 shadow-xs shrink-0">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none text-white">
                Smart
              </h1>
              <span className="text-[10px] font-bold text-white/75 block mt-0.5 tracking-wider uppercase">
                SteelSchool
              </span>
            </div>
          </div>

          {/* Mobile Close Button */}
          {mobileOpen && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              title="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items (Left Icon Strip + Right Text with Merged Active Tab) */}
        <div className="relative z-10 py-4 flex-1 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <nav className="relative space-y-2.5">
            {/* Continuous Lighter Blue Pill Rail behind the icons - Perfectly Coaxial at 28px Center */}
            <div className="absolute left-2 top-0 bottom-0 w-10 bg-[#3f6ef5] rounded-full pointer-events-none -z-0" />

            {visibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => onCloseMobile?.()}
                  className="relative flex items-center h-[46px] w-full group no-underline"
                >
                  {({ isActive }) => (
                    <>
                      {/* Left Icon Rail Segment - Perfectly Centered */}
                      <div className="w-14 shrink-0 flex items-center justify-center relative h-full">
                        {/* Active Indicator: White vertical sliver on the very left */}
                        {isActive && (
                          <span className="absolute left-0 w-1.5 h-6 bg-white rounded-r-full shadow-2xs top-1/2 -translate-y-1/2" />
                        )}
                        <div className="w-8 h-8 flex items-center justify-center transition-all">
                          <Icon
                            className={`w-5 h-5 shrink-0 transition-transform ${
                              isActive
                                ? 'text-white scale-110 drop-shadow-xs'
                                : 'text-white/80 group-hover:text-white'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Right Label Area: Putih Nyatu di Kanan, Melengkung di Kiri */}
                      <div
                        className={`flex-1 flex items-center h-full pr-3 tracking-tight transition-all sidebar-nav-label ${
                          isActive
                            ? 'sidebar-tab-merged font-extrabold text-[14px]'
                            : 'text-white/85 group-hover:text-white font-semibold text-[14px]'
                        }`}
                      >
                        <span className="truncate leading-none">{item.label}</span>
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
            type="button"
            onClick={() => {
              onCloseMobile?.();
              logout();
            }}
            className="relative flex items-center h-[46px] w-full group text-white/80 hover:text-white transition-colors p-0 border-0 bg-transparent cursor-pointer no-underline"
          >
            {/* Left Icon Rail Segment - Exactly matching NavLink */}
            <div className="w-14 shrink-0 flex items-center justify-center relative h-full">
              <div className="w-8 h-8 flex items-center justify-center text-white/80 group-hover:text-white transition-all">
                <LogOut className="w-5 h-5 shrink-0" />
              </div>
            </div>

            {/* Right Label Area - Exactly matching NavLink */}
            <div className="flex-1 flex items-center h-full pr-3 tracking-tight transition-all font-semibold text-[14px] sidebar-nav-label">
              <span className="truncate leading-none">Keluar Sesi</span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
