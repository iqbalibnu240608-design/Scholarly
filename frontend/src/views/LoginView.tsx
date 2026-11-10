import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ROLE_HOME_ROUTES } from '../types/auth';
import { toast } from 'sonner';
import {
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiArrowLeft,
} from 'react-icons/fi';
import {
} from 'react-icons/hi2';
import {
  Clock,
  ArrowRight,
  Trash2,
  X,
} from 'lucide-react';
import studentLearningImg from '../assets/image_37.png';
import './LoginView.css';

interface HistoryAccount {
  name: string;
  role: string;
  roleLabel: string;
  identifier: string;
  password?: string;
  lastLoginTime?: string;
  avatarBg?: string;
  avatarColor?: string;
  initials?: string;
}

const DEFAULT_HISTORY: HistoryAccount[] = [
  {
    name: 'Rudi Hermawan (Kopsis)',
    role: 'kopsis',
    roleLabel: 'Pengelola Koperasi Siswa',
    identifier: 'KOP-2026',
    password: 'password123',
    lastLoginTime: 'Pernah Masuk di Perangkat Ini',
    avatarBg: '#FFEDD5',
    avatarColor: '#EA580C',
    initials: 'RH',
  },
  {
    name: 'Super Administrator',
    role: 'admin',
    roleLabel: 'Administrator Sistem',
    identifier: 'admin',
    password: 'admin123',
    lastLoginTime: 'Pernah Masuk di Perangkat Ini',
    avatarBg: '#F5F3FF',
    avatarColor: '#7C3AED',
    initials: 'AD',
  },
  {
    name: 'Ahmad Pratama',
    role: 'siswa',
    roleLabel: 'Siswa / Murid',
    identifier: '0061234567',
    password: 'password123',
    lastLoginTime: 'Pernah Masuk di Perangkat Ini',
    avatarBg: '#EFF6FF',
    avatarColor: '#2563EB',
    initials: 'AP',
  },
  {
    name: 'Budi Santoso, S.Pd',
    role: 'guru',
    roleLabel: 'Dewan Guru',
    identifier: '198503152010011002',
    password: 'password123',
    lastLoginTime: 'Pernah Masuk di Perangkat Ini',
    avatarBg: '#ECFDF5',
    avatarColor: '#059669',
    initials: 'BS',
  },
  {
    name: 'Siti Aminah, S.AP',
    role: 'petugas',
    roleLabel: 'Petugas TU & Administrasi',
    identifier: '199008202015022003',
    password: 'password123',
    lastLoginTime: 'Pernah Masuk di Perangkat Ini',
    avatarBg: '#F3E8FF',
    avatarColor: '#6B21A8',
    initials: 'SA',
  },
  {
    name: 'Ibu Titin (Kantin)',
    role: 'kantin',
    roleLabel: 'Pengelola Kantin Sekolah',
    identifier: 'KTN-01',
    password: 'password123',
    lastLoginTime: 'Pernah Masuk di Perangkat Ini',
    avatarBg: '#CFFAFE',
    avatarColor: '#0891B2',
    initials: 'IT',
  },
];

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Kolom input dimulai dari keadaan kosong sesuai instruksi pengguna
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // State Riwayat Akun yang Pernah Masuk
  const [savedAccounts, setSavedAccounts] = useState<HistoryAccount[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const historyRef = useRef<HTMLDivElement>(null);

  // Muat riwayat akun dari localStorage saat pertama kali render
  useEffect(() => {
    try {
      const raw = localStorage.getItem('school_login_history');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedAccounts(parsed);
          return;
        }
      }
    } catch {
      // fallback jika ada error parsing
    }
    setSavedAccounts(DEFAULT_HISTORY);
    localStorage.setItem('school_login_history', JSON.stringify(DEFAULT_HISTORY));
  }, []);

  // Tutup panel riwayat jika pengguna mengklik di luar area input / popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Simpan akun ke riwayat lokal setelah login berhasil
  const saveAccountToHistory = (id: string, pwd: string) => {
    let name = 'Pengguna Terdaftar';
    let role = 'siswa';
    let roleLabel = 'Siswa';
    let avatarBg = '#EFF6FF';
    let avatarColor = '#2563EB';

    const lowId = id.toLowerCase();
    if (lowId === 'admin') {
      name = 'Super Administrator';
      role = 'admin';
      roleLabel = 'Administrator Sistem';
      avatarBg = '#F5F3FF';
      avatarColor = '#7C3AED';
    } else if (lowId.includes('kop') || lowId.includes('koperasi')) {
      name = 'Rudi Hermawan (Kopsis)';
      role = 'kopsis';
      roleLabel = 'Pengelola Koperasi Siswa';
      avatarBg = '#FFEDD5';
      avatarColor = '#EA580C';
    } else if (lowId.includes('ktn') || lowId.includes('kantin')) {
      name = 'Ibu Titin (Kantin)';
      role = 'kantin';
      roleLabel = 'Pengelola Kantin Sekolah';
      avatarBg = '#CFFAFE';
      avatarColor = '#0891B2';
    } else if (lowId.includes('sec') || lowId.includes('satpam') || lowId.includes('security')) {
      name = 'Joko Widodo (Satpam)';
      role = 'security';
      roleLabel = 'Petugas Satpam Gerbang';
      avatarBg = '#F1F5F9';
      avatarColor = '#475569';
    } else if (lowId.includes('lib') || lowId.includes('perpus')) {
      name = 'Dewi Lestari (Perpus)';
      role = 'perpustakaan';
      roleLabel = 'Petugas Perpustakaan';
      avatarBg = '#FEF9C3';
      avatarColor = '#CA8A04';
    } else if (id.startsWith('1990')) {
      name = 'Siti Aminah, S.AP';
      role = 'petugas';
      roleLabel = 'Petugas TU & Administrasi';
      avatarBg = '#F3E8FF';
      avatarColor = '#6B21A8';
    } else if (id.startsWith('1985') || id.startsWith('19')) {
      name = 'Budi Santoso, S.Pd';
      role = 'guru';
      roleLabel = 'Dewan Guru';
      avatarBg = '#ECFDF5';
      avatarColor = '#059669';
    } else if (id.startsWith('00')) {
      name = 'Ahmad Pratama';
      role = 'siswa';
      roleLabel = 'Siswa';
      avatarBg = '#EFF6FF';
      avatarColor = '#2563EB';
    }

    const newAcc: HistoryAccount = {
      name,
      role,
      roleLabel,
      identifier: id,
      password: pwd,
      lastLoginTime: 'Baru saja masuk',
      avatarBg,
      avatarColor,
      initials: name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase(),
    };

    setSavedAccounts((prev) => {
      const filtered = prev.filter((a) => a.identifier !== id);
      const updated = [newAcc, ...filtered].slice(0, 6);
      localStorage.setItem('school_login_history', JSON.stringify(updated));
      return updated;
    });
  };

  // Langsung login otomatis saat salah satu riwayat akun diklik tanpa mengetik sandi
  const handleSelectAccountAndLogin = async (acc: HistoryAccount) => {
    const targetPassword = acc.password || 'password123';
    setIdentifier(acc.identifier);
    setPassword(targetPassword);
    setShowHistory(false);
    setError(null);
    setLoading(true);

    try {
      toast.loading(`Masuk otomatis sebagai ${acc.name}...`, { id: 'autologin' });
      await login(acc.identifier, targetPassword);
      toast.success(`Selamat datang kembali, ${acc.name}!`, { id: 'autologin' });
      const targetHome = ROLE_HOME_ROUTES[acc.role] || '/app';
      navigate(targetHome);
    } catch (err: any) {
      toast.dismiss('autologin');
      const msg =
        err.response?.data?.message ||
        'Gagal login otomatis. Pastikan server backend sedang aktif.';
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  // Hapus akun dari riwayat login di perangkat ini
  const handleDeleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = savedAccounts.filter((a) => a.identifier !== id);
    setSavedAccounts(updated);
    localStorage.setItem('school_login_history', JSON.stringify(updated));
    toast.info('Akun dihapus dari riwayat login.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowHistory(false);
    setError(null);
    setLoading(true);

    try {
      await login(identifier, password);
      saveAccountToHistory(identifier, password);
      toast.success('Login berhasil! Mengalihkan ke portal sekolah...');
      const storedUser = localStorage.getItem('school_auth_user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      const targetHome = parsedUser?.role ? (ROLE_HOME_ROUTES[parsedUser.role] || '/app') : '/app';
      navigate(targetHome);
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
              <span className="hidden md:inline">
                Kelola<br />
                aktivitas sekolah<br />
                dalam satu dasbor
              </span>
              <span className="md:hidden">
                Kelola aktivitas sekolah dalam satu dasbor
              </span>
            </h1>
            <p className="login-banner-desc">
              Akses mudah ke layanan akademik, presensi RFID, dan transaksi cashless sekolah dalam satu akun terpusat.
            </p>
          </div>

          {/* Ilustrasi Siswa Belajar Baru */}
          <div className="login-banner-illustration-wrap mt-8 lg:mt-10">
            <img
              src={studentLearningImg}
              alt="Siswa Belajar di Meja Kelas"
              className="login-3d-char-img"
            />
          </div>
        </div>

        {/* ================= RIGHT FORM CONTAINER ================= */}
        <div className="login-right-form-wrap">
          {/* Top Brand Logo */}
          <div className="login-brand-header">
            <Link to="/" className="login-brand-logo-link">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center p-0.5 overflow-hidden">
                <img
                  src="/stillschool-logo.png"
                  alt="StillSchool Logo"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <span className="login-brand-name">StillSchool</span>
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
            {/* Input Anchor Wrapper untuk Dropdown Riwayat */}
            <div className="login-history-anchor" ref={historyRef}>
              {/* Email / Identifier Input */}
              <div className="login-input-group">
                <input
                  id="identifier"
                  type="text"
                  placeholder="Email or NISN / Username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  onFocus={() => setShowHistory(true)}
                  onClick={() => setShowHistory(true)}
                  required
                  className="login-input-field"
                  autoComplete="off"
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
                    onFocus={() => setShowHistory(true)}
                    onClick={() => setShowHistory(true)}
                    required
                    className="login-input-field pr-11"
                    autoComplete="off"
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

              {/* Popover Riwayat Akun yang Pernah Masuk */}
              {showHistory && savedAccounts.length > 0 && (
                <div className="login-history-popover animate-in fade-in slide-in-from-top-2">
                  <div className="login-history-header">
                    <div className="flex items-center gap-1.5 text-blue-600">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-bold text-slate-900">Pernah Masuk Sebagai</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowHistory(false);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                      title="Tutup riwayat"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 px-4 pb-2 m-0 text-left">
                    Klik akun di bawah untuk langsung login tanpa mengetik sandi:
                  </p>

                  <div className="login-history-list">
                    {savedAccounts.map((acc, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectAccountAndLogin(acc)}
                        className="login-history-item group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div
                            className="login-history-avatar"
                            style={{
                              backgroundColor: acc.avatarBg || '#EFF6FF',
                              color: acc.avatarColor || '#2563EB',
                            }}
                          >
                            {acc.initials || acc.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                {acc.name}
                              </span>
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wider"
                                style={{
                                  backgroundColor: acc.avatarBg || '#EFF6FF',
                                  color: acc.avatarColor || '#2563EB',
                                }}
                              >
                                {acc.roleLabel || acc.role}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400 font-mono">
                              <span>ID: {acc.identifier}</span>
                              <span>•</span>
                              <span className="font-sans text-[10px] text-slate-400 truncate">
                                {acc.lastLoginTime || 'Pernah Masuk'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <span className="hidden sm:inline-flex text-[11px] font-bold text-blue-600 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white px-2.5 py-1 rounded-lg transition-all items-center gap-1">
                            <span>Masuk</span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteHistoryItem(e, acc.identifier)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                            title="Hapus dari riwayat"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="login-history-footer">
                    <span className="text-[11px] text-slate-400">
                      Atau ketik kredensial baru secara manual di kolom input
                    </span>
                  </div>
                </div>
              )}
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
