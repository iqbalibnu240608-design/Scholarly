import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
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
          <Route path="/login" element={<LoginView />} />

          {/* Protected Routes inside App Layout */}
          <Route
            path="/"
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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
