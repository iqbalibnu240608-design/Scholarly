import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, RoleName } from '../types/auth';
import { apiClient } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  activeRole: RoleName;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  switchRolePreview: (role: RoleName) => Promise<void>;
  resetRoleToActual: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('school_auth_token'));
  const [activeRole, setActiveRole] = useState<RoleName>('siswa');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore user from localStorage or API on load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('school_auth_token');
      const storedUser = localStorage.getItem('school_auth_user');

      if (storedToken && storedUser) {
        try {
          const parsedUser: User = JSON.parse(storedUser);
          setUser(parsedUser);
          setActiveRole(parsedUser.role || 'siswa');

          // Verify token silently
          const res = await apiClient.get('/me');
          if (res.data?.user) {
            setUser(res.data.user);
            setActiveRole(res.data.user.role);
            localStorage.setItem('school_auth_user', JSON.stringify(res.data.user));
          }
        } catch {
          // If token verification fails, clear cached data
          localStorage.removeItem('school_auth_token');
          localStorage.removeItem('school_auth_user');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      // Mengirimkan identifier (bisa berupa NISN siswa, Username admin, atau Email)
      const response = await apiClient.post('/login', {
        identifier,
        nisn: identifier,
        email: identifier,
        password,
      });
      const { token: receivedToken, user: receivedUser } = response.data;

      localStorage.setItem('school_auth_token', receivedToken);
      localStorage.setItem('school_auth_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);
      setActiveRole(receivedUser.role);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('school_auth_token');
      localStorage.removeItem('school_auth_user');
      setToken(null);
      setUser(null);
      setActiveRole('siswa');
    }
  };

  // Otomatis menukar sesi akun aktif di backend ke user riil dari role yang dipilih
  const switchRolePreview = async (role: RoleName) => {
    setActiveRole(role);
    try {
      const response = await apiClient.post('/auth/switch-role', { role });
      const { token: receivedToken, user: receivedUser } = response.data;

      if (receivedToken && receivedUser) {
        localStorage.setItem('school_auth_token', receivedToken);
        localStorage.setItem('school_auth_user', JSON.stringify(receivedUser));
        setToken(receivedToken);
        setUser(receivedUser);
        setActiveRole(receivedUser.role);
      }
    } catch (err) {
      console.warn('Gagal beralih akun riil di backend, tetap menggunakan mode simulasi role', err);
    }
  };

  const resetRoleToActual = () => {
    if (user) {
      setActiveRole(user.role);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        activeRole,
        isLoading,
        login,
        logout,
        switchRolePreview,
        resetRoleToActual,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
