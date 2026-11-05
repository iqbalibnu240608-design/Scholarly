import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ChevronDown, ChevronUp, AlertCircle, ArrowLeft } from 'lucide-react';
import './LoginView.css';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Support login using NISN (students), NIP (teachers), or email/id (admin/staff)
  const [identifier, setIdentifier] = useState<string>('0061234567');
  const [password, setPassword] = useState<string>('password123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [inputFocused, setInputFocused] = useState<boolean>(false);
  const [passwordFocused, setPasswordFocused] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDemoRoles, setShowDemoRoles] = useState<boolean>(false);

  const demoAccounts = [
    { label: 'Siswa 1 (NISN: 0061234567)', id: '0061234567', pwd: 'password123', icon: '🎓' },
    { label: 'Siswa 2 (NISN: 0089876543)', id: '0089876543', pwd: 'password123', icon: '🎓' },
    { label: 'Admin IT (ID: admin)', id: 'admin', pwd: 'admin123', icon: '⚙️' },
    { label: 'Guru (NIP: 19850315...)', id: '198503152010011002', pwd: 'password123', icon: '👨‍🏫' },
    { label: 'Kepsek (NIP: 19700101...)', id: '197001011995031001', pwd: 'password123', icon: '🏫' },
    { label: 'Petugas TU', id: '199008202015022003', pwd: 'password123', icon: '📋' },
    { label: 'Kopsis', id: 'KOP-2026', pwd: 'password123', icon: '🛒' },
    { label: 'Kantin', id: 'KTN-01', pwd: 'password123', icon: '🍜' },
    { label: 'Satpam Gerbang', id: 'SEC-01', pwd: 'password123', icon: '🛡️' },
    { label: 'Perpustakaan', id: 'LIB-01', pwd: 'password123', icon: '📚' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(identifier, password);
      navigate('/app');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Kredensial atau kata sandi tidak valid. Pastikan server backend dan MySQL aktif.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemoAccount = (accId: string, accPwd?: string) => {
    setIdentifier(accId);
    setPassword(accPwd || 'password123');
  };

  return (
    <div className="steelschool-login-viewport">
      {/* ------------------------------------------------------------------
          Floating Decorative SVG Elements in Background (16:9 Desktop)
         ------------------------------------------------------------------ */}
      <div className="bg-decorations-container" aria-hidden="true">
        {/* Top-Left Starburst */}
        <div className="decor-item decor-star-top-left">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M100 0 L115 65 L175 35 L135 90 L200 100 L135 110 L175 165 L115 135 L100 200 L85 135 L25 165 L65 110 L0 100 L65 90 L25 35 L85 65 Z"
              fill="#EAE4DC"
            />
          </svg>
        </div>

        {/* Left Planet with Midnight Navy Orbit Ring */}
        <div className="decor-item decor-planet-left">
          <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 28 85 C 10 105, 30 145, 110 135 C 170 127, 212 95, 195 72"
              stroke="#1a365d"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              opacity="0.3"
            />
            {/* Planet Body */}
            <defs>
              <radialGradient id="planetGrad" cx="38%" cy="32%" r="68%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="60%" stopColor="#FAF8F6" />
                <stop offset="100%" stopColor="#E2E8F0" />
              </radialGradient>
              <filter id="planetShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#1a365d" floodOpacity="0.12" />
              </filter>
            </defs>
            <circle cx="110" cy="100" r="50" fill="url(#planetGrad)" filter="url(#planetShadow)" />
            {/* Front half of tilted navy ring */}
            <path
              d="M 195 72 C 180 50, 120 70, 50 92 C 18 102, 10 115, 28 126 C 42 135, 75 138, 120 132 C 185 122, 215 95, 195 72 Z"
              stroke="#1a365d"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>

        {/* Bottom-Left Starburst */}
        <div className="decor-item decor-star-bottom-left">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M100 10 L120 75 L185 50 L145 105 L190 160 L125 140 L100 190 L75 140 L10 160 L55 105 L15 50 L80 75 Z"
              fill="#EAE4DC"
            />
          </svg>
        </div>

        {/* Top-Right Sunburst with Fine Rays */}
        <div className="decor-item decor-sunburst-top-right">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {Array.from({ length: 24 }).map((_, i) => (
              <line
                key={i}
                x1="100"
                y1="100"
                x2={100 + 90 * Math.cos((i * 15 * Math.PI) / 180)}
                y2={100 + 90 * Math.sin((i * 15 * Math.PI) / 180)}
                stroke="#EAE4DC"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            ))}
          </svg>
        </div>

        {/* Upper-Right Sunlit Yellow Sparkle */}
        <div className="decor-item decor-lime-sparkle-right">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M50 0 C50 32, 68 50, 100 50 C68 50, 50 68, 50 100 C50 68, 32 50, 0 50 C32 50, 50 32, 50 0 Z"
              fill="#fae467"
            />
          </svg>
        </div>

        {/* Mid-Right Curved Pencil */}
        <div className="decor-item decor-pencil-right">
          <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="pencilBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="60%" stopColor="#FAF8F6" />
                <stop offset="100%" stopColor="#E6E6E6" />
              </linearGradient>
            </defs>
            {/* Curved Pencil Arc */}
            <path
              d="M 25 105 C 50 120, 105 135, 145 105 C 185 75, 195 25, 160 10 C 130 -2, 100 30, 120 70 C 135 100, 180 115, 215 110"
              stroke="url(#pencilBodyGrad)"
              strokeWidth="26"
              strokeLinecap="round"
              fill="none"
              opacity="0.95"
            />
            {/* Pencil Tip (Graphite & Yellow Wood) */}
            <path d="M 22 96 L 2 108 L 26 118 Z" fill="#191923" />
            <path d="M 26 96 L 22 96 L 26 118 L 36 116 Z" fill="#fae467" opacity="0.9" />
            {/* Navy Accent Collar at Tail */}
            <circle cx="215" cy="110" r="14" fill="#1a365d" />
            <circle cx="205" cy="112" r="13" fill="#fae467" opacity="0.75" />
          </svg>
        </div>

        {/* Bottom-Right Soft Starburst */}
        <div className="decor-item decor-star-bottom-right">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M100 10 L125 75 L190 70 L140 115 L170 180 L110 145 L80 190 L60 130 L5 110 L65 75 Z"
              fill="#EAE4DC"
            />
          </svg>
        </div>
      </div>

      {/* ------------------------------------------------------------------
          Header: Brand Logo & Title (Click to return to Landing Page)
         ------------------------------------------------------------------ */}
      <header className="steelschool-header">
        <Link
          to="/"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}
          title="Kembali ke Web Sekolah"
        >
          <img src="/steelschool-shield.png" alt="SteelSchool" style={{ width: "36px", height: "42px", objectFit: "contain" }} />
          <span className="brand-name-text">SteelSchool</span>
        </Link>
      </header>

      {/* ------------------------------------------------------------------
          Login Card (Centered on Desktop)
         ------------------------------------------------------------------ */}
      <main className="steelschool-main-content">
        <div className="steelschool-card">
          <div className="steelschool-card-header">
            <h1 className="steelschool-card-title">Sign in</h1>
            <p className="steelschool-card-subtitle">
              Masuk dengan <strong>NISN</strong> (Siswa) atau <strong>ID / Email</strong> (Staf & Admin).
            </p>
          </div>

          {error && (
            <div className="steelschool-alert-error" role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="steelschool-form">
            {/* Input Identifier (NISN / NIP / Username / Email) */}
            <div className={`steelschool-field-group ${inputFocused || identifier ? 'is-focused' : ''}`}>
              <label className="steelschool-field-label" htmlFor="identifier-input">
                NISN / ID Akun / Email
              </label>
              <div className="steelschool-input-wrapper">
                <input
                  id="identifier-input"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder="Contoh: 0061234567 atau admin"
                  className="steelschool-input"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Input Password with Outlined Style & Eye Toggle */}
            <div className={`steelschool-field-group ${passwordFocused || password ? 'is-focused' : ''}`}>
              <label className="steelschool-field-label" htmlFor="password-input">
                Password (dari Admin)
              </label>
              <div className="steelschool-input-wrapper">
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="Password yang diberikan admin"
                  className="steelschool-input"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="steelschool-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3.5-6 10-6 10 6 10 6" />
                      <line x1="3" y1="12" x2="1" y2="15" />
                      <line x1="7" y1="14" x2="6" y2="18" />
                      <line x1="12" y1="15" x2="12" y2="19" />
                      <line x1="17" y1="14" x2="18" y2="18" />
                      <line x1="21" y1="12" x2="23" y2="15" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Primary Sign In Button: Sunlit Yellow Pill per Sandland Specifications */}
            <button
              type="submit"
              disabled={loading}
              className="steelschool-btn-submit"
            >
              {loading ? 'Memverifikasi...' : 'Masuk ke Sistem'}
            </button>
          </form>

          {/* Forgot Password Link */}
          <div className="steelschool-forgot-link-wrapper">
            <a
              href="#forgot-password"
              onClick={(e) => {
                e.preventDefault();
                alert('Silakan hubungi administrator sekolah untuk reset atau meminta kata sandi Anda.');
              }}
              className="steelschool-forgot-link"
            >
              Lupa kata sandi? Hubungi Admin
            </a>
          </div>

          {/* Discreet Collapsible Demo Roles Panel for Easy Testing */}
          <div className="steelschool-demo-drawer">
            <button
              type="button"
              className="steelschool-demo-toggle-btn"
              onClick={() => setShowDemoRoles(!showDemoRoles)}
            >
              <Sparkles size={14} className="text-amber-500" />
              <span>Pilihan Akun Demo (Siswa via NISN, Admin, Staf)</span>
              {showDemoRoles ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showDemoRoles && (
              <div className="steelschool-demo-pills-grid">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    className="steelschool-role-pill"
                    onClick={() => handleSelectDemoAccount(acc.id, acc.pwd)}
                    title={`Isi otomatis ${acc.label}`}
                  >
                    <span>{acc.icon}</span>
                    <span>{acc.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Back Link to Landing Page */}
        <div style={{ marginTop: '16px' }}>
          <Link
            to="/"
            className="steelschool-back-link"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Halaman Web Promosi Sekolah</span>
          </Link>
        </div>
      </main>

      {/* ------------------------------------------------------------------
          Footer: Copyright & Policy Links
         ------------------------------------------------------------------ */}
      <footer className="steelschool-footer">
        <p className="steelschool-footer-text">
          <span>&copy;SteelSchool 2026</span>
          <span className="footer-bullet">&middot;</span>
          <a href="#privacy" className="footer-link">Kebijakan Privasi</a>
          <span className="footer-bullet">&middot;</span>
          <a href="#terms" className="footer-link">Syarat & Ketentuan</a>
        </p>
      </footer>
    </div>
  );
};
