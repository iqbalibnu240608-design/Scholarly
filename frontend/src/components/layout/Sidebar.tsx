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
        <div
          className="relative z-10 flex-1 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{
            paddingTop: '20px',
            paddingBottom: '20px',
            boxSizing: 'border-box',
          }}
        >
          <nav
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              paddingTop: '14px',
              paddingBottom: '14px',
              boxSizing: 'border-box',
            }}
          >
            {/* Continuous Lighter Blue Pill Rail behind the icons with symmetrical py-3.5 padding */}
            <div
              style={{
                position: 'absolute',
                left: '8px',
                top: '0px',
                bottom: '0px',
                width: '44px',
                backgroundColor: '#3f6ef5',
                borderRadius: '22px',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />

            {visibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => onCloseMobile?.()}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    height: '48px',
                    width: '100%',
                    textDecoration: 'none',
                    zIndex: 1,
                    boxSizing: 'border-box',
                  }}
                  className="group"
                >
                  {({ isActive }) => (
                    <>
                      {/* Left Icon Rail Segment - Exactly 60px wide, Center = 30px (coaxial with 44px capsule at left 8px) */}
                      <div
                        style={{
                          width: '60px',
                          height: '48px',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                        }}
                      >
                        {/* Active Indicator: White vertical sliver on the very left, center-aligned */}
                        {isActive && (
                          <span
                            style={{
                              position: 'absolute',
                              left: '0',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: '4px',
                              height: '24px',
                              backgroundColor: '#ffffff',
                              borderTopRightRadius: '9999px',
                              borderBottomRightRadius: '9999px',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            }}
                          />
                        )}
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon
                            style={{
                              width: '20px',
                              height: '20px',
                              flexShrink: 0,
                              color: '#ffffff',
                              opacity: isActive ? 1 : 0.85,
                              transform: isActive ? 'scale(1.1)' : 'scale(1)',
                              transition: 'all 0.2s ease',
                            }}
                          />
                        </div>
                      </div>

                      {/* Right Label Area: Putih Nyatu di Kanan, Melengkung di Kiri */}
                      <div
                        className={`sidebar-nav-label ${
                          isActive ? 'sidebar-tab-merged' : ''
                        }`}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          height: '48px',
                          paddingRight: '12px',
                          color: isActive ? '#2857e6' : 'rgba(255, 255, 255, 0.9)',
                          fontWeight: isActive ? 800 : 600,
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.label}
                        </span>
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
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              height: '48px',
              width: '100%',
              padding: 0,
              border: 0,
              backgroundColor: 'transparent',
              cursor: 'pointer',
              textDecoration: 'none',
              boxSizing: 'border-box',
            }}
            className="group text-white/80 hover:text-white transition-colors"
          >
            {/* Left Icon Rail Segment - Exactly matching NavLink */}
            <div
              style={{
                width: '60px',
                height: '48px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LogOut style={{ width: '20px', height: '20px', flexShrink: 0 }} />
              </div>
            </div>

            {/* Right Label Area - Exactly matching NavLink */}
            <div
              className="sidebar-nav-label"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                height: '48px',
                paddingRight: '12px',
                color: 'rgba(255, 255, 255, 0.85)',
                fontWeight: 600,
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Keluar Sesi
              </span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
