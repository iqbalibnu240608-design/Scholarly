import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { LandingPageView } from './views/LandingPageView';
import { LoginView } from './views/LoginView';
import { OverviewView } from './views/OverviewView';
import { SiswaView } from './views/SiswaView';
import { GuruView } from './views/GuruView';
import { KepsekView } from './views/KepsekView';
import { PetugasView } from './views/PetugasView';
import { KopsisView } from './views/KopsisView';
import { KantinView } from './views/KantinView';
import { AdminView } from './views/AdminView';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-fullscreen">
        <div className="spinner"></div>
        <p>Memuat Ekosistem Sekolah...</p>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page (School Promotion & Competition Showcase) */}
          <Route path="/" element={<LandingPageView />} />

          {/* Scholarly 16:9 Login Page */}
          <Route path="/login" element={<LoginView />} />

          {/* Protected School Ecosystem Dashboard Routes */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<OverviewView />} />
            <Route path="siswa" element={<SiswaView />} />
            <Route path="guru" element={<GuruView />} />
            <Route path="kepsek" element={<KepsekView />} />
            <Route path="petugas" element={<PetugasView />} />
            <Route path="kopsis" element={<KopsisView />} />
            <Route path="kantin" element={<KantinView />} />
            <Route path="admin" element={<AdminView />} />
          </Route>

          {/* Helpful Aliases for Direct Navigation */}
          <Route path="/dashboard" element={<Navigate to="/app" replace />} />
          <Route path="/siswa" element={<Navigate to="/app/siswa" replace />} />
          <Route path="/guru" element={<Navigate to="/app/guru" replace />} />
          <Route path="/kepsek" element={<Navigate to="/app/kepsek" replace />} />
          <Route path="/petugas" element={<Navigate to="/app/petugas" replace />} />
          <Route path="/kopsis" element={<Navigate to="/app/kopsis" replace />} />
          <Route path="/kantin" element={<Navigate to="/app/kantin" replace />} />
          <Route path="/admin" element={<Navigate to="/app/admin" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
