import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  FiArrowRight,
  FiArrowLeft,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiChevronDown,
  FiChevronUp,
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
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
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
    <div className="login-viewport">
      {/* Decorative Atmosphere Glows */}
      <div className="login-glow-orb-top" aria-hidden="true" />
      <div className="login-glow-orb-bottom" aria-hidden="true" />

      {/* Floating Card with Tailwind & Shadcn styling */}
      <div className="login-card max-w-lg w-full bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-8 md:p-10 shadow-2xl shadow-blue-500/10">
        {/* Card Header with Brand Logo */}
        <div className="login-header text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-3 no-underline mb-3 hover:opacity-90 transition-opacity">
            <img
              src="/steelschool-shield.png"
              alt="SteelSchool Logo"
              className="w-12 h-12 object-contain drop-shadow-md"
            />
          </Link>
          <div className="flex items-center justify-center gap-2 mb-1">
            <Badge variant="primary" className="text-xs font-semibold px-3 py-1">
              Portal Terintegrasi
            </Badge>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Masuk ke SteelSchool
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Gunakan NISN (Siswa), NIP (Guru/Staf), atau ID Akun Anda
          </p>
        </div>

        {/* Demo Account Quick-Picker (NexaAdmin Style) */}
        <div className="demo-accounts-wrapper mb-6 border border-indigo-100 rounded-2xl bg-slate-50/70 overflow-hidden transition-all">
          <button
            type="button"
            className="w-full px-4 py-3 bg-transparent border-none flex items-center justify-between text-xs font-bold text-blue-600 hover:bg-blue-50/60 cursor-pointer transition-colors"
            onClick={() => setShowDemoRoles(!showDemoRoles)}
          >
            <div className="flex items-center gap-2">
              <span>Pilihan Akun Demo (10 Peran Siap Pakai)</span>
            </div>
            {showDemoRoles ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
          </button>

          {showDemoRoles && (
            <div className="p-3 border-t border-indigo-100 grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {demoAccounts.map((acc, idx) => {
                const AccIcon = acc.icon;
                const isSelected = identifier === acc.id;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectDemoAccount(acc.role, acc.id, acc.pwd)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/90 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: acc.bg, color: acc.color }}
                    >
                      <AccIcon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col overflow-hidden leading-tight">
                      <span className="text-xs font-bold text-slate-900 truncate">{acc.role}</span>
                      <span className="text-[10px] text-slate-500 font-mono truncate">{acc.id}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2.5 p-3.5 mb-5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium" role="alert">
            <FiAlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form with Shadcn Input & Button */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="identifier">
              Nomor Identitas (NISN / NIP / Username)
            </label>
            <Input
              id="identifier"
              type="text"
              placeholder="Contoh: 0061234567 atau admin"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="password">
              Kata Sandi
            </label>
            <div className="relative flex items-center">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan kata sandi..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-2 h-12 text-sm font-bold shadow-lg shadow-blue-500/30"
          >
            {loading ? (
              <span>Memverifikasi Sesi...</span>
            ) : (
              <>
                <span>Masuk ke Portal Sekolah</span>
                <FiArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        {/* Back Link */}
        <div className="text-center mt-6 pt-4 border-t border-slate-100">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors">
            <FiArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda Sekolah</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
