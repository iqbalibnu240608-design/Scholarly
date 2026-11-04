import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS, ROLE_BADGE_COLORS } from '../../types/auth';
import { LogOut, User as UserIcon, Shield, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, activeRole, switchRolePreview, logout } = useAuth();

  const allRoles = ['admin', 'kepsek', 'guru', 'siswa', 'petugas', 'kopsis', 'kantin'];
  const badgeStyle = ROLE_BADGE_COLORS[activeRole] || { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' };

  return (
    <header className="top-navbar">
      <div className="navbar-brand">
        <div className="brand-logo">🏫</div>
        <div>
          <h1 className="brand-title">EKOSISTEM SEKOLAH</h1>
          <span className="brand-subtitle">Platform Terpadu Manajemen Civitas Akademika</span>
        </div>
      </div>

      <div className="navbar-actions">
        {/* Role Preview Switcher Tool */}
        <div className="role-switcher-container">
          <span className="switcher-label">
            <Sparkles size={14} /> Preview Akses Sebagai:
          </span>
          <select
            className="role-select"
            value={activeRole}
            onChange={(e) => switchRolePreview(e.target.value)}
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

        {/* User Profile Info */}
        <div className="user-profile">
          <div className="avatar-circle">
            <UserIcon size={16} />
          </div>
          <div className="user-text">
            <span className="user-name">{user?.name || 'Pengguna'}</span>
            <span className="user-email">{user?.email || 'Demo Mode'}</span>
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
