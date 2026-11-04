export type RoleName = 
  | 'admin'
  | 'kepsek'
  | 'guru'
  | 'siswa'
  | 'petugas'
  | 'kopsis'
  | 'kantin'
  | 'perpustakaan'
  | 'bk'
  | string;

export interface RoleInfo {
  id?: number;
  name: RoleName;
  display_name: string;
  description?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: RoleName;
  role_display?: string;
  identifier_number?: string | null;
  phone?: string | null;
  gender?: 'L' | 'P' | null;
  avatar?: string | null;
  permissions?: string[];
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token: string;
  user: User;
}

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator Sistem',
  kepsek: 'Kepala Sekolah',
  guru: 'Guru / Pengajar',
  siswa: 'Siswa / Peserta Didik',
  petugas: 'Petugas TU & Administrasi',
  kopsis: 'Pengelola Koperasi Siswa',
  kantin: 'Pengelola Kantin Sekolah',
  perpustakaan: 'Petugas Perpustakaan',
  bk: 'Bimbingan Konseling',
};

export const ROLE_BADGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  admin: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
  kepsek: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  guru: { bg: '#e0e7ff', text: '#3730a3', border: '#a5b4fc' },
  siswa: { bg: '#dcfce7', text: '#166534', border: '#86efac' },
  petugas: { bg: '#f3e8ff', text: '#6b21a8', border: '#d8b4fe' },
  kopsis: { bg: '#ffedd5', text: '#9a3412', border: '#fdba74' },
  kantin: { bg: '#cffafe', text: '#155e75', border: '#67e8f9' },
};
