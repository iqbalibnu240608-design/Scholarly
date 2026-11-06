import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiChevronDown,
  FiChevronUp,
  FiArrowLeft,
  FiCheckCircle,
} from 'react-icons/fi';
import {
  HiOutlineAcademicCap,
  HiOutlineBookOpen,
  HiOutlineBuildingLibrary,
  HiOutlineShieldCheck,
  HiOutlineCog6Tooth,
} from 'react-icons/hi2';
import {
  RiSchoolLine,
  RiFileList3Line,
  RiShoppingCart2Line,
  RiRestaurantLine,
} from 'react-icons/ri';
import { FaFacebook } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
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
    { role: 'Siswa 1', id: '0061234567', pwd: 'password123', icon: HiOutlineAcademicCap, bg: '#e0e7ff', color: '#356df3' },
    { role: 'Siswa 2', id: '0089876543', pwd: 'password123', icon: HiOutlineAcademicCap, bg: '#e0e7ff', color: '#356df3' },
    { role: 'Admin IT', id: 'admin', pwd: 'admin123', icon: HiOutlineCog6Tooth, bg: '#ede9fe', color: '#6366f1' },
    { role: 'Guru', id: '198503152010011002', pwd: 'password123', icon: HiOutlineBookOpen, bg: '#e0f2fe', color: '#0284c7' },
    { role: 'Kepsek', id: '197001011995031001', pwd: 'password123', icon: RiSchoolLine, bg: '#fef3c7', color: '#d97706' },
    { role: 'Petugas TU', id: '199008202015022003', pwd: 'password123', icon: RiFileList3Line, bg: '#d1fae5', color: '#059669' },
    { role: 'Kopsis', id: 'KOP-2026', pwd: 'password123', icon: RiShoppingCart2Line, bg: '#fce7f3', color: '#db2777' },
    { role: 'Kantin', id: 'KTN-01', pwd: 'password123', icon: RiRestaurantLine, bg: '#ffedd5', color: '#ea580c' },
    { role: 'Satpam', id: 'SEC-01', pwd: 'password123', icon: HiOutlineShieldCheck, bg: '#e0e7ff', color: '#4338ca' },
    { role: 'Perpus', id: 'LIB-01', pwd: 'password123', icon: HiOutlineBuildingLibrary, bg: '#ede9fe', color: '#7c3aed' },
  ];

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

  const handleSelectDemoAccount = (accRole: string, accId: string, accPwd?: string) => {
    setIdentifier(accId);
    setPassword(accPwd || 'password123');
    toast.info(`Akun demo ${accRole} dipilih (${accId})`);
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
          <div className="mb-6">
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Identifier Input */}
            <div>
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
            <div>
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
              <div className="flex justify-end mt-2">
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

          {/* Divider */}
          <div className="login-divider-row">
            <div className="login-divider-line" />
            <span className="login-divider-text">or Login with</span>
            <div className="login-divider-line" />
          </div>

          {/* Social Buttons */}
          <div className="login-social-row">
            <button
              type="button"
              onClick={() => toast.info('Fitur SSO Facebook aktif dalam mode integrasi OAuth.')}
              className="login-social-btn"
            >
              <FaFacebook className="w-5 h-5 text-[#1877F2]" />
              <span>Facebook</span>
            </button>

            <button
              type="button"
              onClick={() => toast.info('Fitur SSO Google aktif dalam mode integrasi Google for Education.')}
              className="login-social-btn"
            >
              <FcGoogle className="w-5 h-5" />
              <span>Google</span>
            </button>
          </div>

          {/* Demo Accounts Quick-Picker Drawer */}
          <div className="login-demo-drawer">
            <button
              type="button"
              className="login-demo-toggle-btn"
              onClick={() => setShowDemoRoles(!showDemoRoles)}
            >
              <div className="flex items-center gap-1.5">
                <FiCheckCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>Pilihan Cepat Akun Demo (10 Peran Civitas)</span>
              </div>
              {showDemoRoles ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
            </button>

            {showDemoRoles && (
              <div className="login-demo-grid">
                {demoAccounts.map((acc, idx) => {
                  const AccIcon = acc.icon;
                  const isSelected = identifier === acc.id;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectDemoAccount(acc.role, acc.id, acc.pwd)}
                      className={`login-demo-item ${isSelected ? 'active' : ''}`}
                    >
                      <div
                        className="login-demo-icon-wrap"
                        style={{ background: acc.bg, color: acc.color }}
                      >
                        <AccIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col overflow-hidden text-left leading-tight">
                        <span className="text-xs font-bold text-slate-800 truncate">{acc.role}</span>
                        <span className="text-[10px] text-slate-500 font-mono truncate">{acc.id}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Back to Home Link */}
          <div className="text-center mt-5">
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
