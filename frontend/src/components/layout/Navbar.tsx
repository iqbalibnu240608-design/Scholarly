import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS, ROLE_BADGE_COLORS, ROLE_HOME_ROUTES } from '../../types/auth';
import { LogOut, Sparkles, Globe, Loader2 } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, activeRole, switchRolePreview, logout } = useAuth();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState<boolean>(false);

  const allRoles = ['admin', 'kepsek', 'guru', 'siswa', 'petugas', 'kopsis', 'kantin', 'security', 'perpustakaan'];
  const badgeStyle = ROLE_BADGE_COLORS[activeRole] || { bg: '#eef2ff', text: '#356df3', border: '#cbd5e1' };

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
    <header className="top-navbar">
      {/* Brand Identity with 3D Shield */}
      <div className="navbar-brand">
        <Link to="/" className="brand-link" title="Beranda SteelSchool">
          <img
            src="/steelschool-shield.png"
            alt="SteelSchool Logo"
            className="brand-shield-img"
          />
          <div className="brand-title-wrap">
            <h1 className="brand-title">SteelSchool</h1>
            <span className="brand-subtitle">Ekosistem Sekolah Terpadu</span>
          </div>
        </Link>
      </div>

      <div className="navbar-actions">
        {/* Quick Link to Landing Page */}
        <Link
          to="/"
          className="nav-web-link"
          title="Buka Halaman Promosi & Showcase Ekosistem"
        >
          <Globe size={15} />
          <span>Web Sekolah</span>
        </Link>

        {/* NexaAdmin Style Role Switcher Tool */}
        <div className="role-switcher-container">
          <span className="switcher-label">
            {switching ? (
              <Loader2 size={14} className="animate-spin text-primary" />
            ) : (
              <Sparkles size={14} className="text-primary" />
            )}
            <span>Peran:</span>
          </span>
          <select
            className="role-select"
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
          className="role-badge-pill"
          style={{
            backgroundColor: badgeStyle.bg,
            color: badgeStyle.text,
            border: `1px solid ${badgeStyle.border}`,
          }}
        >
          <span>{ROLE_LABELS[activeRole] || activeRole}</span>
        </div>

        {/* User Profile & Logout */}
        <div className="user-profile-btn" title={user?.email || 'Pengguna Aktif'}>
          <div className="user-avatar-circle">
            {getInitials(user?.name)}
          </div>
          <span className="user-name-text">
            {user?.name || 'Civitas Sekolah'}
          </span>
          <button
            onClick={logout}
            className="logout-icon-btn"
            title="Keluar dari Sesi"
            type="button"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
