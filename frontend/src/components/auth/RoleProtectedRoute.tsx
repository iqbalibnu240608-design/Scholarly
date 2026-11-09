import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS, ROLE_HOME_ROUTES } from '../../types/auth';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RoleProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

const ROLE_ALIASES: Record<string, string> = {
  koperasi: 'kopsis',
  pengelola_koperasi: 'kopsis',
  'pengelola koperasi': 'kopsis',
  'pengelola koperasi siswa': 'kopsis',
  satpam: 'security',
  keamanan: 'security',
  perpus: 'perpustakaan',
  tu: 'petugas',
  administrasi: 'petugas',
  kepala_sekolah: 'kepsek',
  'kepala sekolah': 'kepsek',
};

const resolveRole = (r: string) => {
  const clean = (r || '').trim().toLowerCase();
  return ROLE_ALIASES[clean] || clean;
};

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { activeRole } = useAuth();
  const navigate = useNavigate();

  const currentRole = resolveRole(activeRole);
  const normalizedAllowedRoles = allowedRoles.map(resolveRole);

  // Admin memiliki akses inspeksi ke seluruh modul
  const hasAccess = currentRole === 'admin' || normalizedAllowedRoles.includes(currentRole);

  if (!hasAccess) {
    const targetHome = ROLE_HOME_ROUTES[currentRole] || ROLE_HOME_ROUTES[activeRole] || '/app';

    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mb-4 shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Akses Dibatasi (Hak Akses Tidak Memadai)
        </h2>

        <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed">
          Modul ini dibatasi hanya untuk wewenang peran:{' '}
          <strong className="text-slate-800">
            {allowedRoles.map((r) => ROLE_LABELS[r] || r).join(', ')}
          </strong>
          .<br />
          Peran akses aktif Anda saat ini adalah{' '}
          <span className="inline-block mt-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-bold border border-slate-200">
            {ROLE_LABELS[activeRole] || activeRole}
          </span>
        </p>

        <button
          onClick={() => navigate(targetHome)}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Portal Anda</span>
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
