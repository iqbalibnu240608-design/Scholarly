import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import {
  Shield,
  Users,
  Database,
  Server,
  KeyRound,
  Power,
  UserPlus,
  Check,
  X,
  Search
} from 'lucide-react';
import { ROLE_LABELS, ROLE_BADGE_COLORS } from '../types/auth';
import './EcosystemModals.css';

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
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<string | null>(null);
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
    } catch (err) {
      console.error('Gagal mengambil data admin', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRoleChange = async (userId: number, newRoleName: string) => {
    setAssigningUserId(userId);
    try {
      const res = await apiClient.post('/admin/assign-role', {
        user_id: userId,
        role: newRoleName,
      });
      showToast(res.data.message);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengubah role.');
    } finally {
      setAssigningUserId(null);
    }
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      const res = await apiClient.post(`/admin/users/${userId}/toggle-status`);
      showToast(res.data.message);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengubah status akun.');
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
      showToast(res.data.message);
      setShowResetModal(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mereset kata sandi.');
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
      showToast(res.data.message);
      setShowAddModal(false);
      setNewName('');
      setNewNisn('');
      await fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mendaftarkan akun baru.');
    } finally {
      setSubmittingUser(false);
    }
  };

  if (loading) return <div className="loading-container">Memuat modul Admin...</div>;

  const usersList = data?.recent_users || [];
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.identifier_number && u.identifier_number.includes(searchTerm)) ||
      u.role_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      selectedRoleFilter === 'all' || u.role_name === selectedRoleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="view-container">
      {/* View Header */}
      <div className="view-header">
        <div>
          <h2>⚙️ Portal Administrator & Pemantauan Sistem (SteelSchool)</h2>
          <p>
            Pantau akun civitas sekolah, daftarkan siswa dengan <strong>NISN</strong>, tentukan kata sandi dari admin, serta kelola hak akses role.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary-action"
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          <UserPlus size={16} />
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

      {/* Modal Pendaftaran Akun Baru (Popup Bersih & Scrollable) */}
      {showAddModal && (
        <div className="eco-modal-backdrop">
          <div className="eco-modal-card">
            <div className="eco-modal-header">
              <h3>
                <UserPlus size={18} className="text-indigo-600" />
                Pendaftaran Akun Baru (Siswa / Staf)
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="eco-modal-form">
              <div className="eco-modal-body">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nama Lengkap Siswa / Staf *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Muhammad Rizky"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full p-2 border rounded text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nomor Identitas (NISN untuk Siswa / NIP / Username) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 0098765432"
                    value={newNisn}
                    onChange={(e) => setNewNisn(e.target.value)}
                    className="w-full p-2 border rounded text-xs bg-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Peran (Role) *</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full p-2 border rounded text-xs bg-white"
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
                    <label className="text-xs font-bold text-slate-700 block mb-1">Jenis Kelamin</label>
                    <select
                      value={newGender}
                      onChange={(e) => setNewGender(e.target.value as 'L' | 'P')}
                      className="w-full p-2 border rounded text-xs bg-white"
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
                  <input
                    type="text"
                    required
                    placeholder="Minimal 4 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2 border rounded text-xs bg-white font-mono"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Kata sandi ini diberikan langsung ke siswa/staf saat penyerahan akun.
                  </span>
                </div>
              </div>

              <div className="eco-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary-action"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingUser}
                  className="btn-primary-action"
                  style={{ opacity: submittingUser ? 0.6 : 1 }}
                >
                  {submittingUser ? 'Menyimpan...' : 'Simpan & Terbitkan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Distribution Badges */}
      <div className="overview-card mt-6">
        <div className="card-header">
          <h3>
            <Shield size={18} className="inline mr-2 text-indigo-600" />
            Distribusi Hak Akses Role
          </h3>
          <span className="badge-pill">Filter Cepat:</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedRoleFilter('all')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer ${
              selectedRoleFilter === 'all'
                ? 'bg-indigo-600 text-white border-indigo-700'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            Semua Role ({usersList.length})
          </button>
          {data?.role_distribution.map((r) => {
            const color = ROLE_BADGE_COLORS[r.role] || { bg: '#f1f5f9', border: '#cbd5e1', text: '#334155' };
            const isActive = selectedRoleFilter === r.role;
            return (
              <button
                key={r.role}
                onClick={() => setSelectedRoleFilter(isActive ? 'all' : r.role)}
                className="px-3 py-1.5 rounded-lg border flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                style={{
                  backgroundColor: isActive ? color.text : color.bg,
                  borderColor: color.border,
                  color: isActive ? '#ffffff' : color.text,
                }}
              >
                <span>{r.display_name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white text-slate-800 font-mono">
                  {r.users_count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Users and Role Assignment Table */}
      <div className="overview-card mt-6">
        <div className="card-header">
          <h3>Daftar Pengguna & Pemantauan Akun (NISN / Kredensial)</h3>
          <div className="card-header-actions">
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Cari NISN, nama, role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '30px', paddingRight: '12px', paddingTop: '5px', paddingBottom: '5px' }}
                className="text-xs border rounded bg-white"
              />
            </div>
            <span className="badge-pill">{filteredUsers.length} Ditemukan</span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama Pengguna</th>
                <th>NISN / No. Identitas</th>
                <th>Role Saat Ini</th>
                <th>Status</th>
                <th>Ubah Role</th>
                <th style={{ minWidth: '100px' }}>Aksi Admin</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td>
                    <strong>{u.name}</strong>
                    {u.email && <div className="text-xs text-slate-400">{u.email}</div>}
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
                      className={`badge-pill text-xs font-semibold ${
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
                        onClick={() => handleOpenResetModal(u.id, u.name)}
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

      {/* Modal Reset Password */}
      {showResetModal && resetTargetUser && (
        <div className="eco-modal-backdrop">
          <div className="eco-modal-card" style={{ maxWidth: '440px' }}>
            <div className="eco-modal-header">
              <h3>
                <KeyRound size={18} className="text-indigo-600" />
                Reset Kata Sandi Pengguna
              </h3>
              <button
                onClick={() => setShowResetModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleExecuteResetPassword} className="eco-modal-form">
              <div className="eco-modal-body">
                <p className="text-xs text-slate-600">
                  Perbarui kata sandi untuk <strong>{resetTargetUser.name}</strong>. Token login lama akan otomatis dicabut.
                </p>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Kata Sandi Baru *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Minimal 4 karakter"
                    value={resetPasswordVal}
                    onChange={(e) => setResetPasswordVal(e.target.value)}
                    className="w-full p-2 border rounded text-xs bg-white font-mono"
                  />
                </div>
              </div>
              <div className="eco-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="btn-secondary-action"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingReset}
                  className="btn-primary-action"
                  style={{ opacity: submittingReset ? 0.6 : 1 }}
                >
                  {submittingReset ? 'Memperbarui...' : 'Simpan Kata Sandi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
