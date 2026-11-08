import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS, ROLE_HOME_ROUTES } from '../../types/auth';
import {
  LogOut,
  Loader2,
  UserCheck,
  Search,
  Bell,
  Menu,
  Check,
  Sparkles,
  X,
} from 'lucide-react';

interface NavbarProps {
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu }) => {
  const { user, activeRole, switchRolePreview, logout } = useAuth();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [hasUnread, setHasUnread] = useState<boolean>(true);
  const notifRef = useRef<HTMLDivElement>(null);

  const notifications = [
    {
      id: 1,
      title: 'Presensi RFID Gerbang Berhasil',
      desc: 'Kartu pelajar tap gerbang utama tercatat pukul 06:48 WIB (Tepat Waktu).',
      time: '15 mnt lalu',
      unread: true,
    },
    {
      id: 2,
      title: 'Pekan Ujian & Workshop Digital',
      desc: 'Jadwal persiapan CBT semester genap telah diperbarui.',
      time: '1 jam lalu',
      unread: true,
    },
    {
      id: 3,
      title: 'Menu Kantin Sehat Diperbarui',
      desc: 'Stand 1 Bu Titin menambahkan paket makan siang baru.',
      time: 'Kemarin',
      unread: false,
    },
  ];

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    if (q.includes('kantin') || q.includes('makan') || q.includes('menu')) {
      navigate('/app/kantin');
    } else if (q.includes('kopsis') || q.includes('koperasi') || q.includes('atk') || q.includes('seragam')) {
      navigate('/app/kopsis');
    } else if (q.includes('nilai') || q.includes('jadwal') || q.includes('absen') || q.includes('rapor')) {
      navigate('/app/siswa');
    } else if (q.includes('buku') || q.includes('perpus')) {
      navigate('/app/perpus');
    } else if (q.includes('spp') || q.includes('tu') || q.includes('bayar')) {
      navigate('/app/petugas');
    } else {
      navigate('/app/siswa');
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Hamburger Mobile Toggle + Search Input */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden w-8 h-8 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors inline-flex items-center justify-center p-0 shrink-0"
          title="Buka Navigasi Menu"
        >
          <Menu className="w-5 h-5 shrink-0" />
        </button>

        {/* Search Input with Enter Submit */}
        <form onSubmit={handleSearchSubmit} className="flex items-center relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari jadwal, modul, layanan..."
            className="pl-9 pr-8 py-2 bg-slate-100/80 border border-slate-200/70 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all w-44 sm:w-64 md:w-80 shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* Right Controls: Beranda Link + Role + Notif + Profil */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Tombol ke Beranda SteelSchool */}
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100/90 border border-slate-200/80 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all shadow-2xs leading-none shrink-0"
          title="Buka Beranda Publik SteelSchool"
        >
          <img
            src="/steelschool-shield.png"
            alt="SteelSchool Logo"
            className="w-4 h-4 object-contain shrink-0 block"
          />
          <span className="hidden sm:inline leading-none">Beranda SteelSchool</span>
        </Link>

        {/* Role Switcher Pill */}
        <div className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs h-8.5 leading-none shrink-0">
          <span className="inline-flex items-center justify-center gap-1 text-slate-500 font-semibold text-[11px] leading-none shrink-0">
            {switching ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 shrink-0" />
            ) : (
              <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            )}
            <span className="hidden lg:inline leading-none">Peran:</span>
          </span>
          <select
            className="border-none bg-transparent text-xs font-bold text-blue-600 cursor-pointer outline-none pr-1 leading-none py-0 m-0"
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

        {/* Notification Bell with Dropdown Popover */}
        <div className="relative inline-flex items-center justify-center" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setShowNotifications((prev) => !prev);
              setHasUnread(false);
            }}
            className="relative w-8 h-8 rounded-full text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors inline-flex items-center justify-center p-0 shrink-0"
            title="Notifikasi Sekolah"
          >
            <Bell className="w-4 h-4 shrink-0" />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200/90 shadow-xl py-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-900">Notifikasi Terkini</span>
                </div>
                <button
                  type="button"
                  onClick={() => setHasUnread(false)}
                  className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  <span>Tandai dibaca</span>
                </button>
              </div>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3.5 hover:bg-slate-50 transition-colors text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{n.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 px-4 border-t border-slate-100 text-center">
                <Link
                  to="/app/siswa"
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] font-bold text-blue-600 hover:underline"
                >
                  Lihat Seluruh Aktivitas Akademik →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Info */}
        <div className="flex items-center gap-2.5 pl-2.5 border-l border-slate-200" title={user?.email || 'Pengguna Aktif'}>
          <div className="w-8 h-8 rounded-full bg-[#2857e6] text-white flex items-center justify-center text-xs font-extrabold shadow-xs shrink-0">
            {getInitials(user?.name)}
          </div>
          <div className="hidden lg:flex flex-col text-left gap-0.5">
            <span className="text-xs font-bold text-slate-900 max-w-[150px] truncate leading-none">
              {user?.name || 'Civitas Sekolah'}
            </span>
            <span className="text-[10.5px] font-medium text-slate-500 leading-none">
              {ROLE_LABELS[activeRole] || activeRole}
            </span>
          </div>
          <button
            type="button"
            onClick={logout}
            title="Keluar dari Sesi"
            className="w-8 h-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full shrink-0 inline-flex items-center justify-center transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
