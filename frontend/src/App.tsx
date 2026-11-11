import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { RoleProtectedRoute } from './components/auth/RoleProtectedRoute';
import { ROLE_HOME_ROUTES } from './types/auth';
import { LandingPageView } from './views/LandingPageView';
import { LoginView } from './views/LoginView';
import { OverviewView } from './views/OverviewView';
import { SiswaView } from './views/SiswaView';
import { GuruView } from './views/GuruView';
import { KepsekView } from './views/KepsekView';
import { PetugasView } from './views/PetugasView';
import { KopsisView } from './views/KopsisView';
import { KantinView } from './views/KantinView';
import { PerpusView } from './views/PerpusView';
import { SecurityView } from './views/SecurityView';
import { AdminView } from './views/AdminView';
import { Toaster } from 'sonner';

// Protected Route Wrapper for Authenticated Session
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-fullscreen">
        <div className="spinner"></div>
        <p>Memuat StillSchool...</p>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Index route guard: Only 'admin', 'siswa', and 'guru' have access to the Dashboard overview.
// Other roles (kepsek, petugas, kopsis, kantin, security, perpustakaan) are automatically redirected to their dedicated workspace.
const DashboardIndexRoute: React.FC = () => {
  const { activeRole } = useAuth();
  if (activeRole !== 'admin' && activeRole !== 'siswa' && activeRole !== 'guru') {
    const target = ROLE_HOME_ROUTES[activeRole] || '/login';
    return <Navigate to={target} replace />;
  }
  return <OverviewView />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster richColors position="top-right" />
        <Routes>
          {/* Public Landing Page (School Promotion & Competition Showcase) */}
          <Route path="/" element={<LandingPageView />} />

          {/* StillSchool 16:9 Login Page */}
          <Route path="/login" element={<LoginView />} />

          {/* Protected School Ecosystem Dashboard Routes with Strict RBAC Isolation */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardIndexRoute />} />
            
            {/* Portal Siswa (Akademik & Presensi) */}
            <Route
              path="siswa"
              element={
                <RoleProtectedRoute allowedRoles={['siswa', 'guru', 'bk']}>
                  <SiswaView />
                </RoleProtectedRoute>
              }
            />

            {/* Portal Guru (Evaluasi Nilai & Jurnal) */}
            <Route
              path="guru"
              element={
                <RoleProtectedRoute allowedRoles={['guru', 'kepsek']}>
                  <GuruView />
                </RoleProtectedRoute>
              }
            />

            {/* Portal Kepsek (Monitoring Eksekutif) */}
            <Route
              path="kepsek"
              element={
                <RoleProtectedRoute allowedRoles={['kepsek']}>
                  <KepsekView />
                </RoleProtectedRoute>
              }
            />

            {/* Layanan TU & SPP: Staff mengelola buku induk/verifikasi, Siswa membayar SPP mandiri, Kepsek monitoring */}
            <Route
              path="petugas"
              element={
                <RoleProtectedRoute allowedRoles={['petugas', 'siswa', 'kepsek']}>
                  <PetugasView />
                </RoleProtectedRoute>
              }
            />

            {/* Koperasi Siswa: Staff mengelola kasir & inventaris, Siswa & Guru berbelanja ATK/seragam, Kepsek monitoring */}
            <Route
              path="kopsis"
              element={
                <RoleProtectedRoute allowedRoles={['kopsis', 'koperasi', 'pengelola_koperasi', 'siswa', 'guru', 'admin', 'petugas', 'perpustakaan', 'kepsek']}>
                  <KopsisView />
                </RoleProtectedRoute>
              }
            />

            {/* Alias rute Koperasi */}
            <Route path="koperasi" element={<Navigate to="/app/kopsis" replace />} />

            {/* Kantin Sekolah: Staff kasir & stand makanan, Siswa & Guru memesan makanan online, Kepsek monitoring */}
            <Route
              path="kantin"
              element={
                <RoleProtectedRoute allowedRoles={['kantin', 'siswa', 'guru', 'admin', 'perpustakaan', 'petugas', 'kepsek']}>
                  <KantinView />
                </RoleProtectedRoute>
              }
            />

            {/* Perpustakaan Sekolah (E-Library): Petugas mengelola katalog & sirkulasi, Siswa & Guru meminjam buku, Kepsek monitoring */}
            <Route
              path="perpus"
              element={
                <RoleProtectedRoute allowedRoles={['perpustakaan', 'siswa', 'guru', 'admin', 'kepsek']}>
                  <PerpusView />
                </RoleProtectedRoute>
              }
            />

            {/* Gate Keamanan & Presensi Satpam (Satpam & Kepsek Monitoring) */}
            <Route
              path="security"
              element={
                <RoleProtectedRoute allowedRoles={['security', 'kepsek']}>
                  <SecurityView />
                </RoleProtectedRoute>
              }
            />

            {/* Manajemen Sistem & Konfigurasi Role (Khusus Admin) */}
            <Route
              path="admin"
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminView />
                </RoleProtectedRoute>
              }
            />
          </Route>

          {/* Helpful Aliases for Direct Navigation */}
          <Route path="/dashboard" element={<Navigate to="/app" replace />} />
          <Route path="/siswa" element={<Navigate to="/app/siswa" replace />} />
          <Route path="/guru" element={<Navigate to="/app/guru" replace />} />
          <Route path="/kepsek" element={<Navigate to="/app/kepsek" replace />} />
          <Route path="/petugas" element={<Navigate to="/app/petugas" replace />} />
          <Route path="/kopsis" element={<Navigate to="/app/kopsis" replace />} />
          <Route path="/koperasi" element={<Navigate to="/app/kopsis" replace />} />
          <Route path="/kantin" element={<Navigate to="/app/kantin" replace />} />
          <Route path="/perpus" element={<Navigate to="/app/perpus" replace />} />
          <Route path="/security" element={<Navigate to="/app/security" replace />} />
          <Route path="/admin" element={<Navigate to="/app/admin" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
