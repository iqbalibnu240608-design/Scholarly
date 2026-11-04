import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { ROLE_LABELS, ROLE_BADGE_COLORS } from '../types/auth';
import { Shield, Database, Users, Server, Check } from 'lucide-react';

interface RoleDist {
  id: number;
  name: string;
  display_name: string;
  users_count: number;
}

interface UserItem {
  id: number;
  name: string;
  email: string;
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

  if (loading) return <div className="loading-container">Memuat modul Admin...</div>;

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h2>⚙️ Portal Administrator & Sistem Arsitektur</h2>
          <p>Kontrol hak akses seluruh role, konfigurasi database MySQL, dan parameter ekosistem.</p>
        </div>
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
          <h4>Backend Framework</h4>
          <div className="amount-display text-indigo-700">Laravel 12 (PHP 8.3)</div>
          <p className="card-subtext">RESTful API dengan Laravel Sanctum Token Auth</p>
        </div>

        <div className="feature-card">
          <div className="card-top-icon text-emerald-600">
            <Database size={22} />
          </div>
          <h4>Database Engine</h4>
          <div className="amount-display text-emerald-700">MySQL / MariaDB</div>
          <p className="card-subtext">Kelola via phpMyAdmin: <code>http://localhost/phpmyadmin</code></p>
        </div>

        <div className="feature-card">
          <div className="card-top-icon text-purple-600">
            <Users size={22} />
          </div>
          <h4>Total Akun Terdaftar</h4>
          <div className="amount-display text-purple-700">{data?.total_users} Akun</div>
          <p className="card-subtext">Tersedia akun demo untuk setiap role sekolah</p>
        </div>
      </div>

      {/* Role Distribution Badges */}
      <div className="overview-card mt-6">
        <div className="card-header">
          <h3>
            <Shield size={18} className="inline mr-2 text-indigo-600" />
            Daftar Role Ekosistem Sekolah (Tabel MySQL: `roles`)
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
        <div className="card-header">
          <h3>Manajemen Pengguna & Pengaturan Role Langsung</h3>
          <span className="badge-pill">Ubah Role Real-time</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Pengguna</th>
              <th>Email</th>
              <th>Nomor Identitas (NISN/NIP)</th>
              <th>Role Saat Ini</th>
              <th>Ganti Role</th>
            </tr>
          </thead>
          <tbody>
            {data?.recent_users.map((u) => (
              <tr key={u.id}>
                <td>#{u.id}</td>
                <td><strong>{u.name}</strong></td>
                <td>{u.email}</td>
                <td>{u.identifier_number || '-'}</td>
                <td>
                  <span className="badge-pill">
                    {ROLE_LABELS[u.role_name] || u.role_name}
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
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
