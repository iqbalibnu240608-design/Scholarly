import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ChevronDown, ChevronUp, AlertCircle, ArrowLeft } from 'lucide-react';
import './LoginView.css';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Default to Siswa Ahmad Pratama (NISN)
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
              fill="#F1F5F9"
            />
          </svg>
        </div>

        {/* Left Planet with Blue Orbit Ring */}
        <div className="decor-item decor-planet-left">
          <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 28 85 C 10 105, 30 145, 110 135 C 170 127, 212 95, 195 72"
              stroke="#1D63FF"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              opacity="0.35"
            />
            <circle cx="110" cy="110" r="50" fill="#E2E8F0" />
            <path
              d="M 28 85 C 50 65, 120 50, 195 72"
              stroke="#1D63FF"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>

        {/* Top-Right Big Soft Saturn */}
        <div className="decor-item decor-planet-top-right">
          <svg viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse
              cx="130"
              cy="130"
              rx="110"
              ry="42"
              transform="rotate(-25 130 130)"
              stroke="#E2E8F0"
              strokeWidth="5"
            />
            <circle cx="130" cy="130" r="62" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
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
      <header className="steelschool-header">
        <Link
          to="/"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}
          title="Kembali ke Web Sekolah"
        >
          <svg className="brand-logo-svg" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20 2 C25 2, 29 6, 29 11 C29 16, 25 20, 20 20 C15 20, 11 16, 11 11 C11 6, 15 2, 20 2 Z"
              fill="#FBBF24"
            />
            <path
              d="M29 11 C34 11, 38 15, 38 20 C38 25, 34 29, 29 29 C24 29, 20 25, 20 20 C20 15, 24 11, 29 11 Z"
              fill="#4ADE80"
            />
            <path
              d="M20 20 C25 20, 29 24, 29 29 C29 34, 25 38, 20 38 C15 38, 11 34, 11 29 C11 24, 15 20, 20 20 Z"
              fill="#38BDF8"
            />
            <path
              d="M11 11 C16 11, 20 15, 20 20 C20 25, 16 29, 11 29 C6 29, 2 25, 2 20 C2 15, 6 11, 11 11 Z"
              fill="#F472B6"
            />
          </svg>
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

            {/* Primary Sign In Button */}
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
