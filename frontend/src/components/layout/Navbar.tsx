import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS, ROLE_HOME_ROUTES } from '../../types/auth';
import { LogOut, Globe, Loader2, UserCheck, Search, Bell } from 'lucide-react';
import { Button } from '../ui/button';

export const Navbar: React.FC = () => {
  const { user, activeRole, switchRolePreview, logout } = useAuth();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

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
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 md:px-7 flex items-center justify-between sticky top-0 z-40 shadow-xs">
      {/* Brand Identity with Shield Logo (Bersih di sisi kiri) */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5 no-underline hover:opacity-90 transition-opacity" title="Beranda SteelSchool">
          <img
            src="/steelschool-shield.png"
            alt="SteelSchool Logo"
            className="w-8 h-8 object-contain drop-shadow-xs"
          />
          <div className="flex flex-col">
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-none">
              SteelSchool
            </h1>
            <span className="text-[10px] font-semibold text-blue-600 mt-0.5">
              Smart Ecosystem
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-2.5 md:gap-3">
        {/* Search Bar dipindah ke agak kanan agar tidak menutupi area konten kiri */}
        <div className="hidden md:flex items-center relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari jadwal, modul, data..."
            className="pl-9 pr-4 py-1.5 bg-slate-100/70 border border-slate-200/70 rounded-full text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all w-44 lg:w-56"
          />
        </div>

        {/* Quick Link to Landing Page */}
        <Link
          to="/"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-blue-600 bg-blue-50/70 border border-blue-200/60 hover:bg-blue-100/80 transition-colors"
          title="Buka Halaman Promosi & Showcase Ekosistem"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Web Sekolah</span>
        </Link>

        {/* Role Switcher Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200/80 rounded-full text-xs">
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

        {/* Notification Bell with indicator */}
        <button
          type="button"
          className="relative p-2 rounded-full text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
          title="Notifikasi Sekolah"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
        </button>

        {/* User Profile Avatar & Info matching Reference */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200" title={user?.email || 'Pengguna Aktif'}>
          <div className="w-8 h-8 rounded-full bg-[#2857e6] text-white flex items-center justify-center text-xs font-extrabold shadow-xs">
            {getInitials(user?.name)}
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-900 max-w-[120px] truncate leading-tight">
              {user?.name || 'Civitas Sekolah'}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 leading-none">
              {ROLE_LABELS[activeRole] || activeRole}
            </span>
          </div>
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

export default Navbar;
