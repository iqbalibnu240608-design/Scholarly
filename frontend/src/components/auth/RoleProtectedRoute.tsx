import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS, ROLE_HOME_ROUTES } from '../../types/auth';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RoleProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { activeRole } = useAuth();
  const navigate = useNavigate();

  // Admin memiliki akses inspeksi ke seluruh modul
  const hasAccess = activeRole === 'admin' || allowedRoles.includes(activeRole);

  if (!hasAccess) {
    const targetHome = ROLE_HOME_ROUTES[activeRole] || '/app';

    return (
      <div className="view-container">
        <div className="overview-card mt-6" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <ShieldAlert size={32} />
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
            Akses Dibatasi (Hak Akses Tidak Memadai)
          </h2>

          <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '480px', margin: '0 auto 20px', lineHeight: 1.6 }}>
            Modul ini dibatasi hanya untuk wewenang peran:{' '}
            <strong style={{ color: '#1e293b' }}>
              {allowedRoles.map((r) => ROLE_LABELS[r] || r).join(', ')}
            </strong>
            .<br />
            Peran akses aktif Anda saat ini adalah{' '}
            <span className="badge-pill font-bold" style={{ display: 'inline-block', marginTop: '6px' }}>
              {ROLE_LABELS[activeRole] || activeRole}
            </span>
          </p>

          <button
            onClick={() => navigate(targetHome)}
            className="btn-primary-action"
            style={{ padding: '8px 20px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeft size={16} /> Kembali ke Portal Anda
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
