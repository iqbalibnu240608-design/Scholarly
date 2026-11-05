import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS, ROLE_BADGE_COLORS, ROLE_HOME_ROUTES } from '../../types/auth';
import { LogOut, User as UserIcon, Shield, Sparkles, Globe, Loader2 } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, activeRole, switchRolePreview, logout } = useAuth();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState<boolean>(false);

  const allRoles = ['admin', 'kepsek', 'guru', 'siswa', 'petugas', 'kopsis', 'kantin', 'security', 'perpustakaan'];
  const badgeStyle = ROLE_BADGE_COLORS[activeRole] || { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' };

  const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRole = e.target.value;
    setSwitching(true);
    try {
      await switchRolePreview(selectedRole);
      // Otomatis arahkan tampilan langsung ke portal peran yang dipilih
      const targetRoute = ROLE_HOME_ROUTES[selectedRole] || '/app';
      navigate(targetRoute);
    } finally {
      setSwitching(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return '';
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
      <div className="navbar-brand">
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="brand-logo">🏫</div>
          <div>
            <h1 className="brand-title">SteelSchool</h1>
            <span className="brand-subtitle">Platform Ekosistem Sekolah Terpadu</span>
          </div>
        </Link>
      </div>

      <div className="navbar-actions">
        {/* Quick Link to Public Landing Page */}
        <Link
          to="/"
          className="badge-pill"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            textDecoration: 'none',
            padding: '6px 14px',
            background: '#fae467',
            color: '#000000',
            border: '1px solid #fae467',
            borderRadius: '20px',
            fontWeight: 600,
          }}
          title="Buka Halaman Promosi SteelSchool"
        >
          <Globe size={14} />
          <span>Web Sekolah</span>
        </Link>

        {/* Role Preview & Real Account Switcher Tool */}
        <div className="role-switcher-container">
          <span className="switcher-label">
            {switching ? (
              <Loader2 size={14} className="animate-spin text-indigo-600" />
            ) : (
              <Sparkles size={14} />
            )}
            <span>Preview & Ganti Akun:</span>
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

        {/* Current Active Role Badge */}
        <div
          className="role-badge"
          style={{
            backgroundColor: badgeStyle.bg,
            color: badgeStyle.text,
            borderColor: badgeStyle.border,
          }}
        >
          <Shield size={14} />
          <span>{ROLE_LABELS[activeRole] || activeRole}</span>
        </div>

        {/* User Profile Info - Real Active User Session */}
        <div className="user-profile">
          <div className="avatar-circle font-bold text-xs" style={{ background: '#3b82f6', color: '#ffffff' }}>
            {getInitials(user?.name) || <UserIcon size={16} />}
          </div>
          <div className="user-text">
            <span className="user-name">{user?.name || 'Pengguna'}</span>
            <span className="user-email">
              {user?.identifier_number ? `ID/NISN: ${user.identifier_number}` : (user?.email || 'Akun Aktif')}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button className="btn-logout" onClick={logout} title="Keluar dari Aplikasi">
          <LogOut size={16} />
          <span>Keluar</span>
        </button>
      </div>
    </header>
  );
};
