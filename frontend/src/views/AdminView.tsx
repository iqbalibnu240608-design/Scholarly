import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { ROLE_LABELS, ROLE_BADGE_COLORS } from '../types/auth';
import { Shield, Database, Users, Server, Check, UserPlus, KeyRound, Power, Search } from 'lucide-react';

interface RoleDist {
  id: number;
  name: string;
  display_name: string;
  users_count: number;
}

interface UserItem {
  id: number;
  name: string;
  email?: string | null;
  role_name: string;
  identifier_number?: string;
  status: string;
}

export const AdminView: React.FC = () => {
  const [data, setData] = useState<{
    system_health: string;
    total_users: number;
    role_distribution: RoleDist[];
    recent_users: UserItem[];
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [assigningUserId, setAssigningUserId] = useState<number | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newNisn, setNewNisn] = useState<string>('');
  const [newRole, setNewRole] = useState<string>('siswa');
  const [newPassword, setNewPassword] = useState<string>('password123');
  const [newGender, setNewGender] = useState<'L' | 'P'>('L');
  const [submittingUser, setSubmittingUser] = useState<boolean>(false);

  const fetchAdminData = async () => {
    try {
      const res = await apiClient.get('/school/admin');
      setData(res.data.data);
    } catch (err) {
      console.error('Error fetching admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    setAssigningUserId(userId);
    try {
      const res = await apiClient.post('/admin/assign-role', {
        user_id: userId,
        role_name: newRole,
      });
      setNotification(res.data.message);
      setTimeout(() => setNotification(null), 3500);
      await fetchAdminData();
    } catch (err) {
      console.error('Error changing role', err);
    } finally {
      setAssigningUserId(null);
    }
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      const res = await apiClient.post(`/admin/users/${userId}/toggle-status`);
      setNotification(res.data.message);
      setTimeout(() => setNotification(null), 3500);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengubah status akun');
    }
  };

  const handleResetPassword = async (userId: number, userName: string) => {
    const inputPwd = prompt(`Masukkan kata sandi baru untuk ${userName}:`, 'password123');
    if (!inputPwd) return;

    try {
      const res = await apiClient.post(`/admin/users/${userId}/reset-password`, {
        password: inputPwd,
      });
      setNotification(res.data.message);
      setTimeout(() => setNotification(null), 3500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mereset kata sandi');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingUser(true);
    try {
      const res = await apiClient.post('/admin/users', {
        name: newName,
        identifier_number: newNisn,
        role_name: newRole,
        password: newPassword,
        gender: newGender,
      });
      setNotification(res.data.message);
      setTimeout(() => setNotification(null), 4000);
      setShowAddModal(false);
      setNewName('');
      setNewNisn('');
      setNewPassword('password123');
      await fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mendaftarkan pengguna baru');
    } finally {
      setSubmittingUser(false);
    }
  };

  const filteredUsers = (data?.recent_users || []).filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      (u.identifier_number && u.identifier_number.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      u.role_name.toLowerCase().includes(term)
    );
  });

  if (loading) return <div className="loading-container">Memuat modul Admin...</div>;

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h2>⚙️ Portal Administrator & Pemantauan Sistem (AkatOs)</h2>
          <p>
            Pantau akun civitas sekolah, daftarkan siswa dengan <strong>NISN</strong>, tentukan kata sandi dari admin, serta kelola hak akses role.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <UserPlus size={18} />
          <span>+ Buat Akun Pengguna / Siswa</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 mb-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center gap-2">
          <Check size={18} />
          <span>{notification}</span>
        </div>
      )}

      {/* System Health Cards */}
      <div className="grid-cards-3">
        <div className="feature-card">
          <div className="card-top-icon text-indigo-600">
            <Server size={22} />
          </div>
          <h4>Backend API Service</h4>
          <div className="amount-display text-indigo-700">Laravel 12 (Sanctum)</div>
          <p className="card-subtext">RESTful API Otentikasi Token & Multi-Role</p>
        </div>

        <div className="feature-card">
          <div className="card-top-icon text-emerald-600">
            <Database size={22} />
          </div>
          <h4>Database Ekosistem</h4>
          <div className="amount-display text-emerald-700">MySQL 8.4</div>
          <p className="card-subtext">Tabel: <code>users</code>, <code>roles</code>, <code>permissions</code></p>
        </div>

        <div className="feature-card">
          <div className="card-top-icon text-purple-600">
            <Users size={22} />
          </div>
          <h4>Total Pengguna</h4>
          <div className="amount-display text-purple-700">{data?.total_users} Akun</div>
          <p className="card-subtext">Siswa (NISN), Guru (NIP), Admin, dll.</p>
        </div>
      </div>

      {/* Modal / Card Form Buat Akun Baru */}
      {showAddModal && (
        <div className="overview-card mt-6 border-indigo-200 bg-indigo-50/40">
          <div className="card-header flex justify-between items-center">
            <h3>
              <UserPlus size={18} className="inline mr-2 text-indigo-600" />
              Pendaftaran Akun Baru (Siswa / Staf)
            </h3>
            <button
              onClick={() => setShowAddModal(false)}
              className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
            >
              ✕ Tutup
            </button>
          </div>
          <form onSubmit={handleCreateUser} className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Lengkap Siswa / Staf *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Muhammad Rizky"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-2 border rounded-lg bg-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nomor Identitas (NISN untuk Siswa / NIP / Username) *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: 0098765432"
                value={newNisn}
                onChange={(e) => setNewNisn(e.target.value)}
                className="w-full p-2 border rounded-lg bg-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Peran (Role) *</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full p-2 border rounded-lg bg-white text-sm"
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
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Kata Sandi Awal (Ditentukan oleh Admin) *
              </label>
              <input
                type="text"
                required
                placeholder="Minimal 4 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border rounded-lg bg-white text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Jenis Kelamin</label>
              <select
                value={newGender}
                onChange={(e) => setNewGender(e.target.value as 'L' | 'P')}
                className="w-full p-2 border rounded-lg bg-white text-sm"
              >
                <option value="L">Laki-Laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={submittingUser}
                className="w-full p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition"
              >
                {submittingUser ? 'Menyimpan...' : 'Simpan & Terbitkan Akun'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Role Distribution Badges */}
      <div className="overview-card mt-6">
        <div className="card-header">
          <h3>
            <Shield size={18} className="inline mr-2 text-indigo-600" />
            Distribusi Hak Akses Role (AkatOs Architecture)
          </h3>
          <span className="badge-pill">Sistem Hak Akses</span>
        </div>
        <div className="flex flex-wrap gap-2 p-2">
          {data?.role_distribution.map((r) => {
            const color = ROLE_BADGE_COLORS[r.name] || { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' };
            return (
              <div
                key={r.id}
                className="px-3 py-2 rounded-lg border flex items-center gap-2"
                style={{ backgroundColor: color.bg, borderColor: color.border, color: color.text }}
              >
                <span className="font-semibold">{r.display_name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white font-mono">
                  {r.users_count} user
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Users and Role Assignment Table */}
      <div className="overview-card mt-6">
        <div className="card-header flex justify-between items-center">
          <h3>Daftar Pengguna & Pemantauan Akun (NISN / Kredensial)</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari NISN, nama, atau role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs border rounded-lg bg-white"
              />
            </div>
            <span className="badge-pill">{filteredUsers.length} Ditemukan</span>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Pengguna</th>
              <th>NISN / No. Identitas</th>
              <th>Role Saat Ini</th>
              <th>Status</th>
              <th>Ubah Role</th>
              <th>Aksi Admin</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td>#{u.id}</td>
                <td>
                  <strong>{u.name}</strong>
                  {u.email && <div className="text-xs text-gray-400">{u.email}</div>}
                </td>
                <td>
                  <span className="font-mono px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs">
                    {u.identifier_number || '-'}
                  </span>
                </td>
                <td>
                  <span className="badge-pill">
                    {ROLE_LABELS[u.role_name] || u.role_name}
                  </span>
                </td>
                <td>
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
                      u.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {u.status === 'active' ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td>
                  <select
                    className="p-1 border rounded text-xs bg-white"
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
                </td>
                <td>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleStatus(u.id)}
                      title={u.status === 'active' ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                      className={`p-1.5 rounded text-xs border cursor-pointer ${
                        u.status === 'active'
                          ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                          : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      <Power size={13} />
                    </button>
                    <button
                      onClick={() => handleResetPassword(u.id, u.name)}
                      title="Reset Kata Sandi"
                      className="p-1.5 rounded text-xs border border-indigo-200 text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                    >
                      <KeyRound size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
