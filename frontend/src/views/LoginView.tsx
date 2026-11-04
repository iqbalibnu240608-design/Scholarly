import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ChevronDown, ChevronUp, AlertCircle, ArrowLeft } from 'lucide-react';
import './LoginView.css';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>('Leila57@gmail.com');
  const [password, setPassword] = useState<string>('password123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [emailFocused, setEmailFocused] = useState<boolean>(false);
  const [passwordFocused, setPasswordFocused] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDemoRoles, setShowDemoRoles] = useState<boolean>(false);

  const demoAccounts = [
    { label: 'Siswa', email: 'siswa@sekolah.test', icon: '🎓' },
    { label: 'Guru', email: 'guru@sekolah.test', icon: '👨‍🏫' },
    { label: 'Kepsek', email: 'kepsek@sekolah.test', icon: '🏫' },
    { label: 'Petugas TU', email: 'petugas@sekolah.test', icon: '📋' },
    { label: 'Kopsis', email: 'kopsis@sekolah.test', icon: '🛒' },
    { label: 'Kantin', email: 'kantin@sekolah.test', icon: '🍜' },
    { label: 'Admin', email: 'admin@sekolah.test', icon: '⚙️' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/app');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Email atau kata sandi tidak valid. Pastikan server backend dan MySQL aktif.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="scholarly-login-viewport">
      {/* ------------------------------------------------------------------
          Floating Decorative SVG Elements in Background (16:9 Desktop)
         ------------------------------------------------------------------ */}
      <div className="bg-decorations-container" aria-hidden="true">
        {/* Top-Left Starburst */}
        <div className="decor-item decor-star-top-left">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M100 0 L115 65 L175 35 L135 90 L200 100 L135 110 L175 165 L115 135 L100 200 L85 135 L25 165 L65 110 L0 100 L65 90 L25 35 L85 65 Z"
              fill="#F1F5F9"
            />
          </svg>
        </div>

        {/* Left Planet with Blue Orbit Ring */}
        <div className="decor-item decor-planet-left">
          <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Back half of tilted blue ring */}
            <path
              d="M 28 85 C 10 105, 30 145, 110 135 C 170 127, 212 95, 195 72"
              stroke="#1D63FF"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              opacity="0.35"
            />
            {/* Planet Body */}
            <defs>
              <radialGradient id="planetGrad" cx="38%" cy="32%" r="68%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="60%" stopColor="#F1F5F9" />
                <stop offset="100%" stopColor="#CBD5E1" />
              </radialGradient>
              <filter id="planetShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#94A3B8" floodOpacity="0.2" />
              </filter>
            </defs>
            <circle cx="110" cy="100" r="50" fill="url(#planetGrad)" filter="url(#planetShadow)" />
            {/* Front half of tilted blue ring */}
            <path
              d="M 195 72 C 180 50, 120 70, 50 92 C 18 102, 10 115, 28 126 C 42 135, 75 138, 120 132 C 185 122, 215 95, 195 72 Z"
              stroke="#1D63FF"
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
              fill="#F1F5F9"
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
                stroke="#F1F5F9"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            ))}
          </svg>
        </div>

        {/* Upper-Right Lime Sparkle Star */}
        <div className="decor-item decor-lime-sparkle-right">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M50 0 C50 32, 68 50, 100 50 C68 50, 50 68, 50 100 C50 68, 32 50, 0 50 C32 50, 50 32, 50 0 Z"
              fill="#84CC16"
            />
          </svg>
        </div>

        {/* Mid-Right Curved Pencil */}
        <div className="decor-item decor-pencil-right">
          <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="pencilBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="60%" stopColor="#F1F5F9" />
                <stop offset="100%" stopColor="#E2E8F0" />
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
            {/* Pencil Tip (Graphite & Wood) */}
            <path d="M 22 96 L 2 108 L 26 118 Z" fill="#1E293B" />
            <path d="M 26 96 L 22 96 L 26 118 L 36 116 Z" fill="#FDE047" opacity="0.8" />
            {/* Pink Eraser at Tail */}
            <circle cx="215" cy="110" r="14" fill="#F472B6" />
            <circle cx="205" cy="112" r="13" fill="#CBD5E1" opacity="0.6" />
          </svg>
        </div>

        {/* Bottom-Right Soft Starburst */}
        <div className="decor-item decor-star-bottom-right">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M100 10 L125 75 L190 70 L140 115 L170 180 L110 145 L80 190 L60 130 L5 110 L65 75 Z"
              fill="#F1F5F9"
            />
          </svg>
        </div>
      </div>

      {/* ------------------------------------------------------------------
          Header: Brand Logo & Title (Click to return to Landing Page)
         ------------------------------------------------------------------ */}
      <header className="scholarly-header">
        <Link
          to="/"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}
          title="Kembali ke Web Sekolah"
        >
          <svg className="brand-logo-svg" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Top Petal - Yellow */}
            <path
              d="M20 2 C25 2, 29 6, 29 11 C29 16, 25 20, 20 20 C15 20, 11 16, 11 11 C11 6, 15 2, 20 2 Z"
              fill="#FBBF24"
            />
            {/* Right Petal - Green */}
            <path
              d="M29 11 C34 11, 38 15, 38 20 C38 25, 34 29, 29 29 C24 29, 20 25, 20 20 C20 15, 24 11, 29 11 Z"
              fill="#4ADE80"
            />
            {/* Bottom Petal - Sky Blue */}
            <path
              d="M20 20 C25 20, 29 24, 29 29 C29 34, 25 38, 20 38 C15 38, 11 34, 11 29 C11 24, 15 20, 20 20 Z"
              fill="#38BDF8"
            />
            {/* Left Petal - Magenta / Pink */}
            <path
              d="M11 11 C16 11, 20 15, 20 20 C20 25, 16 29, 11 29 C6 29, 2 25, 2 20 C2 15, 6 11, 11 11 Z"
              fill="#F472B6"
            />
          </svg>
          <span className="brand-name-text">Scholarly</span>
        </Link>
      </header>

      {/* ------------------------------------------------------------------
          Login Card (Centered on Desktop)
         ------------------------------------------------------------------ */}
      <main className="scholarly-main-content">
        <div className="scholarly-card">
          <div className="scholarly-card-header">
            <h1 className="scholarly-card-title">Sign in</h1>
            <p className="scholarly-card-subtitle">
              Enter details to get sign in to your account.
            </p>
          </div>

          {error && (
            <div className="scholarly-alert-error" role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="scholarly-form">
            {/* Input Email with Outlined Floating Label Style */}
            <div className={`scholarly-field-group ${emailFocused || email ? 'is-focused' : ''}`}>
              <label className="scholarly-field-label" htmlFor="email-input">
                Email
              </label>
              <div className="scholarly-input-wrapper">
                <input
                  id="email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  placeholder="name@example.com"
                  className="scholarly-input"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Input Password with Outlined Style & Eye Toggle */}
            <div className={`scholarly-field-group ${passwordFocused || password ? 'is-focused' : ''}`}>
              <label className="scholarly-field-label" htmlFor="password-input">
                Password
              </label>
              <div className="scholarly-input-wrapper">
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="Password"
                  className="scholarly-input"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="scholarly-password-toggle"
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

            {/* Primary Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="scholarly-btn-submit"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Forgot Password Link */}
          <div className="scholarly-forgot-link-wrapper">
            <a
              href="#forgot-password"
              onClick={(e) => {
                e.preventDefault();
                alert('Silakan hubungi administrator sekolah untuk mengatur ulang kata sandi Anda.');
              }}
              className="scholarly-forgot-link"
            >
              Forgot password?
            </a>
          </div>

          {/* Discreet Collapsible Demo Roles Panel for Easy Testing */}
          <div className="scholarly-demo-drawer">
            <button
              type="button"
              className="scholarly-demo-toggle-btn"
              onClick={() => setShowDemoRoles(!showDemoRoles)}
            >
              <Sparkles size={14} className="text-amber-500" />
              <span>Akun Demo Role Sekolah</span>
              {showDemoRoles ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showDemoRoles && (
              <div className="scholarly-demo-pills-grid">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    className="scholarly-role-pill"
                    onClick={() => handleSelectDemoAccount(acc.email)}
                    title={`Isi otomatis ${acc.label} (${acc.email})`}
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
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12.5px',
              color: '#64748b',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Halaman Web Promosi Sekolah</span>
          </Link>
        </div>
      </main>

      {/* ------------------------------------------------------------------
          Footer: Copyright & Policy Links
         ------------------------------------------------------------------ */}
      <footer className="scholarly-footer">
        <p className="scholarly-footer-text">
          <span>&copy;Scholarly 2026</span>
          <span className="footer-bullet">&middot;</span>
          <a href="#privacy" className="footer-link">Privacy Policy</a>
          <span className="footer-bullet">&middot;</span>
          <a href="#terms" className="footer-link">Terms of Service</a>
        </p>
      </footer>
    </div>
  );
};
