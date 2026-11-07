import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS, ROLE_BADGE_COLORS, ROLE_HOME_ROUTES } from '../../types/auth';
import { LogOut, Globe, Loader2, UserCheck } from 'lucide-react';
import { Button } from '../ui/button';

export const Navbar: React.FC = () => {
  const { user, activeRole, switchRolePreview, logout } = useAuth();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState<boolean>(false);

  const allRoles = [
    'admin',
    'kepsek',
    'guru',
    'siswa',
    'petugas',
    'kopsis',
    'kantin',
    'security',
    'perpustakaan',
  ];
  const badgeStyle = ROLE_BADGE_COLORS[activeRole] || {
    bg: '#eef2ff',
    text: '#356df3',
    border: '#cbd5e1',
  };

  const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRole = e.target.value;
    setSwitching(true);
    try {
      await switchRolePreview(selectedRole);
      const targetRoute = ROLE_HOME_ROUTES[selectedRole] || '/app';
      navigate(targetRoute);
    } finally {
      setSwitching(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'SS';
    return name
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 shadow-xs">
      {/* Brand Identity with 3D Shield */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5 no-underline hover:opacity-90 transition-opacity" title="Beranda SteelSchool">
          <img
            src="/steelschool-shield.png"
            alt="SteelSchool Logo"
            className="w-9 h-9 object-contain drop-shadow-sm"
          />
          <div className="flex flex-col">
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-none">
              SteelSchool
            </h1>
            <span className="text-[11px] font-semibold text-blue-600 mt-0.5">
              Ekosistem Sekolah Terpadu
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Link to Landing Page */}
        <Link
          to="/"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-blue-600 bg-blue-50/70 border border-blue-200/60 hover:bg-blue-100/80 transition-colors"
          title="Buka Halaman Promosi & Showcase Ekosistem"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Web Sekolah</span>
        </Link>

        {/* NexaAdmin Style Role Switcher Tool */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs">
          <span className="flex items-center gap-1 text-slate-500 font-semibold text-[11px]">
            {switching ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            ) : (
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            )}
            <span className="hidden md:inline">Peran:</span>
          </span>
          <select
            className="border-none bg-transparent text-xs font-bold text-blue-600 cursor-pointer outline-none pr-1"
            value={activeRole}
            onChange={handleRoleChange}
            disabled={switching}
          >
            {allRoles.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r] || r.toUpperCase()} {user?.role === r ? '(Akun Anda)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Current Role Badge */}
        <div
          className="hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
          style={{
            backgroundColor: badgeStyle.bg,
            color: badgeStyle.text,
            border: `1px solid ${badgeStyle.border}`,
          }}
        >
          <span>{ROLE_LABELS[activeRole] || activeRole}</span>
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200" title={user?.email || 'Pengguna Aktif'}>
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-extrabold shadow-xs">
            {getInitials(user?.name)}
          </div>
          <span className="hidden lg:inline text-xs font-bold text-slate-800 max-w-[120px] truncate">
            {user?.name || 'Civitas Sekolah'}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={logout}
            title="Keluar dari Sesi"
            className="w-8 h-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
