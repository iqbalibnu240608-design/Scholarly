import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  Settings,
  BookOpen,
  School,
  ClipboardList,
  ShoppingCart,
  UtensilsCrossed,
  Shield,
  Library,
  Sparkles,
  Loader2,
} from 'lucide-react';
import './LoginView.css';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState<string>('0061234567');
  const [password, setPassword] = useState<string>('password123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDemoRoles, setShowDemoRoles] = useState<boolean>(false);

  const demoAccounts = [
    { role: 'Siswa 1', id: '0061234567', pwd: 'password123', icon: GraduationCap, bg: '#e0e7ff', color: '#356df3' },
    { role: 'Siswa 2', id: '0089876543', pwd: 'password123', icon: GraduationCap, bg: '#e0e7ff', color: '#356df3' },
    { role: 'Admin IT', id: 'admin', pwd: 'admin123', icon: Settings, bg: '#ede9fe', color: '#6366f1' },
    { role: 'Guru', id: '198503152010011002', pwd: 'password123', icon: BookOpen, bg: '#e0f2fe', color: '#0284c7' },
    { role: 'Kepsek', id: '197001011995031001', pwd: 'password123', icon: School, bg: '#fef3c7', color: '#d97706' },
    { role: 'Petugas TU', id: '199008202015022003', pwd: 'password123', icon: ClipboardList, bg: '#d1fae5', color: '#059669' },
    { role: 'Kopsis', id: 'KOP-2026', pwd: 'password123', icon: ShoppingCart, bg: '#fce7f3', color: '#db2777' },
    { role: 'Kantin', id: 'KTN-01', pwd: 'password123', icon: UtensilsCrossed, bg: '#ffedd5', color: '#ea580c' },
    { role: 'Satpam', id: 'SEC-01', pwd: 'password123', icon: Shield, bg: '#e0e7ff', color: '#4338ca' },
    { role: 'Perpus', id: 'LIB-01', pwd: 'password123', icon: Library, bg: '#ede9fe', color: '#7c3aed' },
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
    <div className="login-viewport">
      {/* Decorative Atmosphere Glows */}
      <div className="login-glow-orb-top" aria-hidden="true" />
      <div className="login-glow-orb-bottom" aria-hidden="true" />

      {/* Floating Card */}
      <div className="login-card">
        {/* Card Header with Brand Logo */}
        <div className="login-header">
          <Link to="/" className="login-logo-link" title="Kembali ke Beranda">
            <img
              src="/steelschool-shield.png"
              alt="SteelSchool Logo"
              className="login-logo-img"
            />
          </Link>
          <h2 className="login-title">Masuk ke SteelSchool</h2>
          <p className="login-subtitle">
            Gunakan NISN (Siswa), NIP (Guru/Staf), atau ID Akun Anda
          </p>
        </div>

        {/* Demo Account Quick-Picker (NexaAdmin Style) */}
        <div className="demo-accounts-wrapper">
          <button
            type="button"
            className="demo-accounts-toggle-btn"
            onClick={() => setShowDemoRoles(!showDemoRoles)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} />
              <span>Pilihan Akun Demo (10 Peran Siap Pakai)</span>
            </div>
            {showDemoRoles ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showDemoRoles && (
            <div className="demo-grid-container">
              {demoAccounts.map((acc, idx) => {
                const AccIcon = acc.icon;
                const isSelected = identifier === acc.id;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectDemoAccount(acc.id, acc.pwd)}
                    className="demo-account-item-btn"
                    style={{
                      borderColor: isSelected ? '#356df3' : '#e2e8f0',
                      background: isSelected ? '#eef2ff' : '#ffffff',
                    }}
                  >
                    <div
                      className="demo-icon-box"
                      style={{ background: acc.bg, color: acc.color }}
                    >
                      <AccIcon size={15} />
                    </div>
                    <div className="demo-text-box">
                      <span className="demo-text-role">{acc.role}</span>
                      <span className="demo-text-id">{acc.id}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="login-error-banner" role="alert">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="identifier">
              Nomor Identitas (NISN / NIP / Username)
            </label>
            <input
              id="identifier"
              type="text"
              className="input-field"
              placeholder="Contoh: 0061234567 atau admin"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Kata Sandi
            </label>
            <div className="input-with-icon-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                placeholder="Masukkan kata sandi..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Memverifikasi Sesi...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Portal Sekolah</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="login-back-footer">
          <Link to="/" className="login-back-link">
            <ArrowLeft size={15} />
            <span>Kembali ke Beranda Sekolah</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
