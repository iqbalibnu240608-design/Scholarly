import React, { useEffect, useState } from 'react';
import { apiClient, getCachedData } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Users,
  Database,
  Server,
  KeyRound,
  Power,
  UserPlus,
  Search,
  Settings,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { ROLE_LABELS, ROLE_BADGE_COLORS } from '../types/auth';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui/table';
import { Dialog } from '../components/ui/dialog';

interface AdminUser {
  id: number;
  name: string;
  email: string | null;
  role_name: string;
  identifier_number: string | null;
  status: 'active' | 'inactive';
  created_at: string;
}

interface RoleCount {
  role: string;
  display_name: string;
  users_count: number;
}

interface AdminData {
  system_health: string;
  total_users: number;
  role_distribution: RoleCount[];
  recent_users: AdminUser[];
}

export const AdminView: React.FC = () => {
  const { activeRole } = useAuth();
  const [data, setData] = useState<AdminData | null>(() => getCachedData('/school/admin')?.data || null);
  const [loading, setLoading] = useState<boolean>(() => !getCachedData('/school/admin'));
  const [assigningUserId, setAssigningUserId] = useState<number | null>(null);

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');

  // Modal Create User State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newNisn, setNewNisn] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('password123');
  const [newRole, setNewRole] = useState<string>('siswa');
  const [newGender, setNewGender] = useState<'L' | 'P'>('L');
  const [submittingUser, setSubmittingUser] = useState<boolean>(false);

  // Modal Reset Password State
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [resetTargetUser, setResetTargetUser] = useState<{ id: number; name: string } | null>(null);
  const [resetPasswordVal, setResetPasswordVal] = useState<string>('password123');
  const [submittingReset, setSubmittingReset] = useState<boolean>(false);

  const fetchAdminData = async () => {
    try {
      const res = await apiClient.get('/school/admin');
      setData(res.data.data);
    } catch (err: any) {
      console.error('Gagal mengambil data admin', err);
      toast.error('Gagal mengambil data admin dari server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [activeRole]);

  const handleRoleChange = async (userId: number, newRoleName: string) => {
    setAssigningUserId(userId);
    try {
      const res = await apiClient.post('/admin/assign-role', {
        user_id: userId,
        role_name: newRoleName,
        role: newRoleName,
      });
      toast.success(res.data.message || 'Role pengguna berhasil diperbarui.');
      await fetchAdminData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mengubah role.');
    } finally {
      setAssigningUserId(null);
    }
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      const res = await apiClient.post(`/admin/users/${userId}/toggle-status`);
      toast.success(res.data.message || 'Status akun berhasil diubah.');
      await fetchAdminData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mengubah status akun.');
    }
  };

  const handleOpenResetModal = (id: number, name: string) => {
    setResetTargetUser({ id, name });
    setResetPasswordVal('password123');
    setShowResetModal(true);
  };

  const handleExecuteResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser) return;
    setSubmittingReset(true);
    try {
      const res = await apiClient.post(`/admin/users/${resetTargetUser.id}/reset-password`, {
        password: resetPasswordVal,
      });
      toast.success(res.data.message || 'Kata sandi berhasil direset.');
      setShowResetModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mereset kata sandi.');
    } finally {
      setSubmittingReset(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingUser(true);
    try {
      const res = await apiClient.post('/admin/users', {
        name: newName,
        identifier_number: newNisn,
        password: newPassword,
        role_name: newRole,
        gender: newGender,
      });
      toast.success(res.data.message || 'Akun baru berhasil diterbitkan.');
      setShowAddModal(false);
      setNewName('');
      setNewNisn('');
      await fetchAdminData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mendaftarkan akun baru.');
    } finally {
      setSubmittingUser(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-sm text-slate-500 font-medium">
        Memuat modul Administrator Ekosistem...
      </div>
    );
  }

  const usersList = data?.recent_users || [];
  const term = (searchTerm || '').toLowerCase();
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(term) ||
      (u.identifier_number && u.identifier_number.includes(searchTerm)) ||
      (u.role_name || '').toLowerCase().includes(term);

    const matchesRole =
      selectedRoleFilter === 'all' || u.role_name === selectedRoleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8">
      {/* View Header with NexaAdmin Design */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="primary" className="text-xs">
                RBAC & User Management
              </Badge>
              <Badge variant="secondary" className="text-xs font-mono">
                {usersList.length} Akun
              </Badge>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              Portal Administrator & Kontrol Sistem
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Kelola civitas sekolah, daftarkan siswa dengan <strong>NISN</strong>, tetapkan kata sandi, dan atur izin akses role.
            </p>
          </div>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Buat Akun Baru</span>
        </Button>
      </div>

      {/* System Health Cards (NexaAdmin 3-Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-indigo-100/80 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Backend API Service
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-indigo-700 tracking-tight">
              Laravel 12
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Sanctum Bearer Token & Multi-Role RBAC
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-100/80 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Database Ekosistem
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-700 tracking-tight">
              MySQL 8.4
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Tabel: users, roles, wallets, presensi, spp
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-100/80 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Pengguna Aktif
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-purple-700 tracking-tight">
              {data?.total_users || usersList.length} Akun
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Siswa (NISN), Guru (NIP), Admin & Staf
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Role Distribution Filter Badges */}
      <Card className="border-slate-200/80">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-sm font-bold text-slate-900">
              Distribusi Hak Akses Role
            </CardTitle>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Cepat</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedRoleFilter('all')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                selectedRoleFilter === 'all'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
              }`}
            >
              Semua Role ({data?.total_users ?? usersList.length})
            </button>
            {(data?.role_distribution || []).map((r) => {
              const color = ROLE_BADGE_COLORS[r.role] || {
                bg: '#f1f5f9',
                border: '#cbd5e1',
                text: '#334155',
              };
              const isActive = selectedRoleFilter === r.role;
              return (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => setSelectedRoleFilter(isActive ? 'all' : r.role)}
                  className="px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer"
                  style={{
                    backgroundColor: isActive ? color.text : color.bg,
                    borderColor: color.border,
                    color: isActive ? '#ffffff' : color.text,
                  }}
                >
                  <span>{r.display_name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/90 text-slate-800 font-mono font-bold">
                    {r.users_count}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Users and Role Assignment Table (NexaAdmin Style) */}
      <Card className="border-slate-200/80">
        <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Daftar Pengguna & Pemantauan Akun
            </CardTitle>
            <CardDescription className="text-xs">
              Pencarian cepat berdasarkan nama, NISN, atau peranan
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Cari NISN, nama, role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <Badge variant="secondary" className="text-xs shrink-0 font-bold">
              {filteredUsers.length} Ditemukan
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Nama Pengguna</TableHead>
                <TableHead>NISN / Identitas</TableHead>
                <TableHead>Role Saat Ini</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ubah Role</TableHead>
                <TableHead className="text-right">Aksi Admin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-mono text-xs font-semibold text-slate-400">
                    #{u.id}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-slate-900 text-sm">{u.name}</div>
                    {u.email && <div className="text-xs text-slate-400 font-mono">{u.email}</div>}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono px-2 py-0.5 bg-slate-100 border border-slate-200/80 rounded-md text-xs font-medium text-slate-700">
                      {u.identifier_number || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="primary" className="text-xs">
                      {ROLE_LABELS[u.role_name] || u.role_name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={u.status === 'active' ? 'success' : 'destructive'}
                      className="text-[11px]"
                    >
                      {u.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <select
                      className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                      value={u.role_name}
                      disabled={assigningUserId === u.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    >
                      <option value="admin">Administrator</option>
                      <option value="kepsek">Kepala Sekolah</option>
                      <option value="guru">Guru</option>
                      <option value="siswa">Siswa</option>
                      <option value="petugas">Petugas TU</option>
                      <option value="kopsis">Kopsis</option>
                      <option value="kantin">Kantin</option>
                      <option value="security">Satpam</option>
                      <option value="perpustakaan">Perpustakaan</option>
                    </select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      <Button
                        size="sm"
                        variant={u.status === 'active' ? 'destructive' : 'success'}
                        onClick={() => handleToggleStatus(u.id)}
                        title={u.status === 'active' ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                        className="h-8 w-8 p-0 rounded-lg"
                      >
                        <Power className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="subtle"
                        onClick={() => handleOpenResetModal(u.id, u.name)}
                        title="Reset Kata Sandi"
                        className="h-8 w-8 p-0 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Pendaftaran Akun Baru (Shadcn Dialog) */}
      <Dialog
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Pendaftaran Akun Baru"
        description="Terbitkan akun baru untuk civitas sekolah (Siswa dengan NISN, Guru dengan NIP, atau Staf)"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Nama Lengkap Siswa / Staf *
            </label>
            <Input
              type="text"
              required
              placeholder="Contoh: Muhammad Rizky"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Nomor Identitas (NISN untuk Siswa / NIP / Username) *
            </label>
            <Input
              type="text"
              required
              placeholder="Contoh: 0098765432"
              value={newNisn}
              onChange={(e) => setNewNisn(e.target.value)}
              className="font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Peran (Role) *
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="siswa">Siswa / Peserta Didik</option>
                <option value="guru">Guru / Pengajar</option>
                <option value="kepsek">Kepala Sekolah</option>
                <option value="petugas">Petugas Tata Usaha</option>
                <option value="kopsis">Petugas Koperasi</option>
                <option value="kantin">Pengelola Kantin</option>
                <option value="security">Petugas Keamanan / Satpam</option>
                <option value="perpustakaan">Petugas Perpustakaan</option>
                <option value="admin">Administrator Sistem</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Jenis Kelamin
              </label>
              <select
                value={newGender}
                onChange={(e) => setNewGender(e.target.value as 'L' | 'P')}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="L">Laki-Laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Kata Sandi Awal (Ditentukan oleh Admin) *
            </label>
            <Input
              type="text"
              required
              placeholder="Minimal 4 karakter"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="font-mono"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Kata sandi ini diberikan langsung ke siswa/staf saat penyerahan akun.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddModal(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={submittingUser}>
              {submittingUser ? 'Menyimpan...' : 'Simpan & Terbitkan Akun'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal Reset Password (Shadcn Dialog) */}
      <Dialog
        open={showResetModal && !!resetTargetUser}
        onClose={() => setShowResetModal(false)}
        title="Reset Kata Sandi Pengguna"
        description={resetTargetUser ? `Perbarui kata sandi untuk ${resetTargetUser.name}. Token login lama akan otomatis dicabut.` : ''}
      >
        <form onSubmit={handleExecuteResetPassword} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Kata Sandi Baru *
            </label>
            <Input
              type="text"
              required
              placeholder="Minimal 4 karakter"
              value={resetPasswordVal}
              onChange={(e) => setResetPasswordVal(e.target.value)}
              className="font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowResetModal(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={submittingReset}>
              {submittingReset ? 'Memperbarui...' : 'Simpan Kata Sandi'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
