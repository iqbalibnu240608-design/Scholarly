import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  ScanLine,
  X,
  History
} from 'lucide-react';
import './EcosystemModals.css';

interface AttendanceLog {
  id: number;
  date: string;
  check_in_time: string;
  status: 'hadir' | 'terlambat' | 'izin' | 'sakit' | 'alpha';
  minutes_late: number;
  notes?: string;
  user?: {
    name: string;
    identifier_number: string;
    role_name: string;
  };
  verifier?: {
    name: string;
  };
}

export const SecurityView: React.FC = () => {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [stats, setStats] = useState({ total_masuk: 0, tepat_waktu: 0, terlambat: 0 });
  const [loading, setLoading] = useState<boolean>(true);

  // Form State
  const [studentNisn, setStudentNisn] = useState<string>('0061234567');
  const [scanning, setScanning] = useState<boolean>(false);
  const [checkinResult, setCheckinResult] = useState<{
    success: boolean;
    studentName: string;
    status: string;
    notes: string;
    checkInTime: string;
  } | null>(null);

  const fetchTodayLogs = async () => {
    try {
      const res = await apiClient.get('/security/today-logs');
      setLogs(res.data.logs || []);
      setStats(res.data.stats || { total_masuk: 0, tepat_waktu: 0, terlambat: 0 });
    } catch (err) {
      console.error('Error fetching security logs', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchTodayLogs();
      setLoading(false);
    };
    init();
  }, []);

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    setScanning(true);
    try {
      const res = await apiClient.post('/security/gate-checkin', {
        identifier_number: studentNisn,
      });

      const att = res.data.attendance;
      const std = res.data.student;

      setCheckinResult({
        success: true,
        studentName: std.name,
        status: att.status,
        notes: att.notes || 'Tepat Waktu',
        checkInTime: att.check_in_time,
      });

      await fetchTodayLogs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'NISN / Kartu tidak terdaftar.');
    } finally {
      setScanning(false);
    }
  };

  if (loading) return <div className="loading-container">Memuat modul Keamanan Gerbang...</div>;

  return (
    <div className="view-container">
      {/* Header Halaman */}
      <div className="view-header">
        <div>
          <h2>🛡️ Portal Keamanan & Presensi Gerbang (Satpam)</h2>
          <p>Verifikasi kedatangan siswa, pemindaian kartu RFID/NISN, dan pemantauan keterlambatan sekolah.</p>
        </div>
        <div className="header-meta">
          <span className="badge-status-paid">Pos Utama: Gerbang A</span>
        </div>
      </div>

      {/* Ringkasan Metrik Gerbang Hari Ini */}
      <div className="grid-cards-3">
        <div className="feature-card">
          <div className="card-top-icon text-indigo-600">
            <UserCheck size={22} />
          </div>
          <h4>Total Siswa Masuk</h4>
          <div className="amount-display text-indigo-700">{stats.total_masuk} Siswa</div>
          <p className="card-subtext">Gerbang dibuka mulai jam 06:15</p>
        </div>

        <div className="feature-card">
          <div className="card-top-icon text-emerald-600">
            <CheckCircle size={22} />
          </div>
          <h4>Hadir Tepat Waktu</h4>
          <div className="amount-display text-emerald-700">{stats.tepat_waktu} Siswa</div>
          <p className="card-subtext">Masuk sebelum jam 07:00 WIB</p>
        </div>

        <div className="feature-card">
          <div className="card-top-icon text-amber-600">
            <Clock size={22} />
          </div>
          <h4>Terlambat Hari Ini</h4>
          <div className="amount-display text-amber-700">{stats.terlambat} Siswa</div>
          <p className="card-subtext">Diberikan catatan pembinaan piket / BK</p>
        </div>
      </div>

      {/* Form Check-In Gerbang Utama */}
      <div className="overview-card mt-6">
        <div className="card-header">
          <h3>
            <ScanLine size={18} className="inline mr-2 text-indigo-600" />
            Pemindaian Kartu Gerbang (RFID / Input NISN)
          </h3>
          <span className="badge-pill">Batas Masuk: 07:00 WIB</span>
        </div>

        {/* Alert Hasil Scan Terbaru */}
        {checkinResult && (
          <div
            className={`p-4 mb-4 rounded-lg flex items-start gap-3 border ${
              checkinResult.status === 'hadir'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            {checkinResult.status === 'hadir' ? (
              <CheckCircle size={24} className="text-emerald-600 flex-shrink-0 mt-1" />
            ) : (
              <AlertTriangle size={24} className="text-amber-600 flex-shrink-0 mt-1" />
            )}
            <div className="flex-1">
              <h4 className="font-bold text-sm">
                {checkinResult.studentName} — {checkinResult.status === 'hadir' ? '✅ TEPAT WAKTU' : '⚠️ TERLAMBAT'}
              </h4>
              <p className="text-xs mt-1">
                Waktu Kedatangan: <strong>{checkinResult.checkInTime}</strong> • {checkinResult.notes}
              </p>
            </div>
            <button
              onClick={() => setCheckinResult(null)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className="gate-scanner-box">
          <form onSubmit={handleCheckin}>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Tempelkan Kartu RFID Siswa atau Masukkan NISN:
            </label>
            <div className="gate-scan-group">
              <input
                type="text"
                required
                placeholder="Contoh: 0061234567"
                value={studentNisn}
                onChange={(e) => setStudentNisn(e.target.value)}
                className="flex-1 p-2 border rounded text-xs bg-white font-mono"
              />
              <button
                type="submit"
                disabled={scanning}
                className="btn-primary-action"
                style={{ padding: '8px 18px' }}
              >
                <ScanLine size={16} />
                {scanning ? 'Memeriksa...' : 'Catat Presensi'}
              </button>
            </div>

            <div className="quick-preset-container mt-3">
              <span className="text-[11px] text-slate-500">Pilih Cepat Siswa Demo:</span>
              <button
                type="button"
                onClick={() => setStudentNisn('0061234567')}
                className={`quick-preset-btn ${studentNisn === '0061234567' ? 'active' : ''}`}
              >
                Ahmad Pratama (0061234567)
              </button>
              <button
                type="button"
                onClick={() => setStudentNisn('0089876543')}
                className={`quick-preset-btn ${studentNisn === '0089876543' ? 'active' : ''}`}
              >
                Siti Rahmawati (0089876543)
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Tabel Log Kedatangan Gerbang Hari Ini */}
      <div className="overview-card mt-6">
        <div className="card-header">
          <h3>
            <History size={18} className="inline mr-2 text-indigo-600" />
            Log Kedatangan Gerbang Hari Ini (MySQL: `attendances`)
          </h3>
          <span className="badge-pill bg-indigo-50 text-indigo-700">{logs.length} Riwayat Presensi</span>
        </div>

        <div className="table-responsive">
          {logs.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">
              Belum ada data presensi hari ini. Silakan catat presensi siswa di atas.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Siswa</th>
                  <th>NISN</th>
                  <th>Jam Kedatangan</th>
                  <th>Status</th>
                  <th>Keterangan / Tindak Lanjut</th>
                  <th>Petugas Pos</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td><strong>{log.user?.name || 'Siswa'}</strong></td>
                    <td><code>{log.user?.identifier_number}</code></td>
                    <td className="font-mono font-semibold">{log.check_in_time}</td>
                    <td>
                      <span
                        className={`badge-pill text-xs font-bold ${
                          log.status === 'hadir'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {log.status === 'hadir' ? 'Tepat Waktu' : `Terlambat ${log.minutes_late}m`}
                      </span>
                    </td>
                    <td className="text-xs text-slate-600">{log.notes || '-'}</td>
                    <td className="text-xs text-slate-500">{log.verifier?.name || 'Satpam Pos'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
