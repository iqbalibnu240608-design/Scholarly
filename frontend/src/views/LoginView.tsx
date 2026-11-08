import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiArrowLeft,
} from 'react-icons/fi';
import {
  HiOutlineShieldCheck,
} from 'react-icons/hi2';
import './LoginView.css';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState<string>('0061234567');
  const [password, setPassword] = useState<string>('password123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(identifier, password);
      toast.success('Login berhasil! Mengalihkan ke portal sekolah...');
      navigate('/app');
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'Kredensial atau kata sandi tidak valid. Pastikan backend server dan MySQL aktif.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="login-screen-root">
      {/* Subtle Purple Aura in Top-Right Corner */}
      <div className="login-purple-aura" aria-hidden="true" />

      {/* Main Two-Column Card Modal */}
      <div className="login-master-container">
        {/* ================= LEFT HERO CARD (BLUE) ================= */}
        <div className="login-left-banner">
          <div>
            <h1 className="login-banner-title">
              Simplify<br />
              management with<br />
              our dashboard
            </h1>
            <p className="login-banner-desc">
              Simplify your e-commerce &amp; school management with our user friendly admin dashboard.
            </p>
          </div>

          {/* 3D Character Illustration at desk with waving hands & laptop */}
          <div className="login-banner-illustration-wrap">
            <img
              src="/login-3d-character.svg"
              alt="3D Character at Desk"
              className="login-3d-char-img"
            />
          </div>
        </div>

        {/* ================= RIGHT FORM CONTAINER ================= */}
        <div className="login-right-form-wrap">
          {/* Top Brand Logo */}
          <div className="login-brand-header">
            <Link to="/" className="login-brand-logo-link">
              <div className="login-brand-icon-drop">
                <HiOutlineShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="login-brand-name">SteelSchool</span>
            </Link>
          </div>

          {/* Welcome Text */}
          <div className="login-welcome-header">
            <h2 className="login-welcome-title">Welcome Back</h2>
            <p className="login-welcome-subtitle">Please Login to your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="login-error-alert" role="alert">
              <FiAlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email / Identifier Input */}
            <div className="login-input-group">
              <input
                id="identifier"
                type="text"
                placeholder="Email or NISN / Username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="login-input-field"
              />
            </div>

            {/* Password Input */}
            <div className="login-input-group">
              <div className="login-password-container">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="login-input-field pr-11"
                />
                <button
                  type="button"
                  className="login-password-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>

              {/* Forgot Password Right-Aligned */}
              <div className="login-forgot-container">
                <button
                  type="button"
                  onClick={() => toast.info('Silakan hubungi Administrator TU Sekolah untuk reset password.')}
                  className="login-forgot-link"
                >
                  Forgot Password
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="login-submit-btn"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>


          {/* Back to Home Link */}
          <div className="login-back-home-wrap">
            <Link to="/" className="login-back-home-link">
              <FiArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Beranda Sekolah</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
