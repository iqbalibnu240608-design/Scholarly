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
    name: 'Dr. H. Soekarno, M.Pd',
    role: 'kepsek',
    roleLabel: 'Kepala Sekolah (Pimpinan)',
    identifier: '197001011995031001',
    password: 'password123',
    lastLoginTime: 'Pernah Masuk di Perangkat Ini',
    avatarBg: '#FEF3C7',
    avatarColor: '#92400E',
    initials: 'SK',
  },
  {
    name: 'Budi Santoso, S.Pd',
    role: 'guru',
    roleLabel: 'Dewan Guru Pengampu',
    identifier: '198503152010011002',
    password: 'password123',
    lastLoginTime: 'Pernah Masuk di Perangkat Ini',
    avatarBg: '#ECFDF5',
    avatarColor: '#059669',
    initials: 'BS',
  },
  {
    name: 'Ahmad Pratama',
    role: 'siswa',
    roleLabel: 'Siswa / Murid (NISN)',
    identifier: '0061234567',
    password: 'password123',
    lastLoginTime: 'Pernah Masuk di Perangkat Ini',
    avatarBg: '#EFF6FF',
    avatarColor: '#2563EB',
    initials: 'AP',
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
    name: 'Rudi Hermawan (Kopsis)',
    role: 'kopsis',
    roleLabel: 'Pengelola Koperasi Siswa',
    identifier: '199407152020011001',
    password: 'password123',
    lastLoginTime: 'Pernah Masuk di Perangkat Ini',
    avatarBg: '#FFEDD5',
    avatarColor: '#EA580C',
    initials: 'RH',
  },
  {
    name: 'Ibu Titin (Kantin)',
    role: 'kantin',
    roleLabel: 'Pengelola Kantin Sekolah',
    identifier: '198611202021022001',
    password: 'password123',
    lastLoginTime: 'Pernah Masuk di Perangkat Ini',
    avatarBg: '#CFFAFE',
    avatarColor: '#0891B2',
    initials: 'IT',
  },
  {
    name: 'Joko Widodo (Satpam)',
    role: 'security',
    roleLabel: 'Petugas Keamanan Gerbang',
    identifier: '198805102019031001',
    password: 'password123',
    lastLoginTime: 'Pernah Masuk di Perangkat Ini',
    avatarBg: '#F1F5F9',
    avatarColor: '#334155',
    initials: 'JW',
  },
  {
    name: 'Dewi Lestari (Perpus)',
    role: 'perpustakaan',
    roleLabel: 'Pustakawan Sekolah',
    identifier: '199204122018012001',
    password: 'password123',
    lastLoginTime: 'Pernah Masuk di Perangkat Ini',
    avatarBg: '#FEF9C3',
    avatarColor: '#854D0E',
    initials: 'DL',
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
      {/* Background SVG Pattern Bertema Alat Sekolah & Kertas Kotak Matematika (Khusus Desktop) */}
      <div
        className="absolute inset-0 pointer-events-none hidden md:block z-0 overflow-hidden"
        aria-hidden="true"
      >
        <svg
          className="w-full h-full"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Pattern 1: Grid Kertas Kotak Matematika (24px x 24px) */}
            <pattern
              id="login-math-grid"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 24 0 L 0 0 0 24"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="0.8"
                strokeOpacity="0.75"
              />
            </pattern>

            {/* Pattern 2: Doodle Alat Sekolah Biru (240px x 240px Tile) */}
            <pattern
              id="login-school-doodles"
              width="240"
              height="240"
              patternUnits="userSpaceOnUse"
            >
              <g stroke="#2563eb" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                {/* 1. Penggaris Segitiga Siku-Siku (Triangle Ruler) */}
                <g transform="translate(18, 16) rotate(10)">
                  <polygon points="0,0 48,0 0,48" strokeWidth="2" />
                  <polygon points="8,8 30,8 8,30" strokeWidth="1.5" />
                  <line x1="12" y1="0" x2="12" y2="4" strokeWidth="1.5" />
                  <line x1="18" y1="0" x2="18" y2="4" strokeWidth="1.5" />
                  <line x1="24" y1="0" x2="24" y2="4" strokeWidth="1.5" />
                  <line x1="30" y1="0" x2="30" y2="4" strokeWidth="1.5" />
                  <line x1="36" y1="0" x2="36" y2="4" strokeWidth="1.5" />
                  <line x1="42" y1="0" x2="42" y2="4" strokeWidth="1.5" />
                  <line x1="0" y1="12" x2="4" y2="12" strokeWidth="1.5" />
                  <line x1="0" y1="18" x2="4" y2="18" strokeWidth="1.5" />
                  <line x1="0" y1="24" x2="4" y2="24" strokeWidth="1.5" />
                  <line x1="0" y1="30" x2="4" y2="30" strokeWidth="1.5" />
                  <line x1="0" y1="36" x2="4" y2="36" strokeWidth="1.5" />
                  <line x1="0" y1="42" x2="4" y2="42" strokeWidth="1.5" />
                </g>

                {/* 2. Pensil Kayu Klasik (Pencil) */}
                <g transform="translate(138, 26) rotate(-36)">
                  <polygon points="0,-14 5,0 -5,0" strokeWidth="2" />
                  <polygon points="0,-14 2,-8 -2,-8" fill="#2563eb" stroke="#2563eb" strokeWidth="1" />
                  <rect x="-5" y="0" width="10" height="34" strokeWidth="2" />
                  <line x1="0" y1="0" x2="0" y2="34" strokeWidth="1.5" />
                  <rect x="-5" y="34" width="10" height="4" strokeWidth="1.5" />
                  <path d="M -5 38 C -5 44 5 44 5 38 Z" strokeWidth="2" />
                </g>

                {/* 3. Penghapus (Eraser) */}
                <g transform="translate(180, 36) rotate(22)">
                  <polygon points="3,9 18,2 29,7 14,14" strokeWidth="2" />
                  <polygon points="3,9 14,14 14,20 3,15" strokeWidth="2" />
                  <polygon points="14,14 29,7 29,13 14,20" strokeWidth="2" />
                  <line x1="11" y1="5" x2="6" y2="11" strokeWidth="1.5" />
                  <line x1="6" y1="11" x2="6" y2="17" strokeWidth="1.5" />
                </g>

                {/* 4. Bintang Nilai (Star) */}
                <g transform="translate(26, 90) rotate(-6)">
                  <polygon
                    points="10,0 12.5,6.5 19,7.5 14,12 15.5,18.5 10,15 4.5,18.5 6,12 1,7.5 7.5,6.5"
                    strokeWidth="2"
                  />
                </g>
                <g transform="translate(176, 100) scale(0.65) rotate(18)">
                  <polygon
                    points="10,0 12.5,6.5 19,7.5 14,12 15.5,18.5 10,15 4.5,18.5 6,12 1,7.5 7.5,6.5"
                    strokeWidth="2"
                  />
                </g>

                {/* 5. Nilai Huruf 'A' (Grade A) */}
                <g transform="translate(100, 86) rotate(12)">
                  <path d="M 2 18 L 9 2 L 16 18" strokeWidth="2.5" />
                  <line x1="5" y1="12" x2="13" y2="12" strokeWidth="2.5" />
                </g>

                {/* 6. Jangka Geometri (Drawing Compass) */}
                <g transform="translate(64, 140) rotate(16)">
                  <line x1="15" y1="-2" x2="15" y2="2" strokeWidth="2" />
                  <circle cx="15" cy="4" r="2.5" strokeWidth="2" />
                  <line x1="13" y1="6" x2="4" y2="36" strokeWidth="2" />
                  <line x1="4" y1="36" x2="2" y2="42" strokeWidth="1.5" />
                  <line x1="17" y1="6" x2="26" y2="30" strokeWidth="2" />
                  <rect x="23" y="28" width="6" height="8" rx="1" strokeWidth="1.5" />
                  <polygon points="26,41 23,38 29,38" fill="#2563eb" stroke="#2563eb" strokeWidth="1" />
                  <path d="M 8 20 Q 15 24 22 20" strokeWidth="1.5" />
                </g>

                {/* 7. Klip Kertas (Paperclip) */}
                <g transform="translate(132, 174) rotate(48)">
                  <path
                    d="M 3 6 L 3 20 C 3 24 10 24 10 20 L 10 5 C 10 1 0 1 0 5 L 0 21 C 0 27 13 27 13 21 L 13 8"
                    strokeWidth="2"
                  />
                </g>

                {/* 8. Tas Sekolah (School Bag / Satchel) */}
                <g transform="translate(178, 142) rotate(-14)">
                  <path d="M 10 0 C 10 -6 24 -6 24 0" strokeWidth="2" />
                  <rect x="0" y="0" width="34" height="26" rx="4" strokeWidth="2" />
                  <path d="M 0 10 L 12 17 L 22 17 L 34 10" strokeWidth="2" />
                  <circle cx="17" cy="15" r="1.8" strokeWidth="2" />
                  <line x1="0" y1="17" x2="5" y2="17" strokeWidth="1.5" />
                  <line x1="29" y1="17" x2="34" y2="17" strokeWidth="1.5" />
                </g>

                {/* 9. Nilai Huruf 'B' (Grade B) */}
                <g transform="translate(14, 180) rotate(-14)">
                  <line x1="3" y1="2" x2="3" y2="17" strokeWidth="2.5" />
                  <path d="M 3 2 C 9 2 9 9.5 3 9.5" strokeWidth="2.5" />
                  <path d="M 3 9.5 C 10 9.5 10 17 3 17" strokeWidth="2.5" />
                </g>

                {/* 10. Penggaris Lurus Pendek (Ruler) */}
                <g transform="translate(80, 210) rotate(-6)">
                  <rect x="0" y="0" width="42" height="12" rx="2" strokeWidth="2" />
                  <line x1="6" y1="0" x2="6" y2="4" strokeWidth="1.5" />
                  <line x1="12" y1="0" x2="12" y2="6" strokeWidth="1.5" />
                  <line x1="18" y1="0" x2="18" y2="4" strokeWidth="1.5" />
                  <line x1="24" y1="0" x2="24" y2="6" strokeWidth="1.5" />
                  <line x1="30" y1="0" x2="30" y2="4" strokeWidth="1.5" />
                  <line x1="36" y1="0" x2="36" y2="6" strokeWidth="1.5" />
                </g>

                {/* 11. Titik Aksentuasi Doodle (Accent Dots) */}
                <circle cx="108" cy="42" r="2" fill="#2563eb" stroke="none" />
                <circle cx="60" cy="70" r="1.6" fill="#2563eb" stroke="none" />
                <circle cx="214" cy="110" r="2" fill="#2563eb" stroke="none" />
                <circle cx="148" cy="124" r="1.6" fill="#2563eb" stroke="none" />
                <circle cx="44" cy="222" r="1.8" fill="#2563eb" stroke="none" />
                <circle cx="228" cy="204" r="1.8" fill="#2563eb" stroke="none" />
              </g>
            </pattern>
          </defs>

          {/* Layer 1: Garis Kotak Kertas Matematika */}
          <rect width="100%" height="100%" fill="url(#login-math-grid)" />

          {/* Layer 2: Doodle Alat Sekolah Biru (Opasitas Proporsional ~28%) */}
          <rect
            width="100%"
            height="100%"
            fill="url(#login-school-doodles)"
            opacity="0.28"
          />
        </svg>
      </div>

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
