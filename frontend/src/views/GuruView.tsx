import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { BookOpen, Users, Calendar, Award } from 'lucide-react';

interface GuruData {
  nip: string;
  mata_pelajaran: string;
  kelas_diajar: string[];
  jadwal_mengajar: Array<{
    hari: string;
    kelas: string;
    jam: string;
    ruang: string;
  }>;
  rekap_kehadiran_siswa: {
    total_siswa_diajar: number;
    rata_rata_kehadiran: string;
  };
}

export const GuruView: React.FC = () => {
  const [data, setData] = useState<GuruData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get('/school/guru');
        setData(res.data.data);
      } catch (err) {
        console.error('Error fetching guru data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading-container">Memuat modul Guru...</div>;

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h2>👨‍🏫 Portal Guru & Tenaga Pendidik</h2>
          <p>Kelola jadwal mengajar, presensi siswa di kelas, input nilai, dan materi ajar.</p>
        </div>
        <div className="header-meta">
          <span className="info-chip">NIP: {data?.nip}</span>
          <span className="info-chip">Mapel: {data?.mata_pelajaran}</span>
        </div>
      </div>

      <div className="grid-cards-3">
        <div className="feature-card">
          <div className="card-top-icon text-indigo-600">
            <BookOpen size={22} />
          </div>
          <h4>Rombel Kelas Diampu</h4>
          <div className="amount-display">{data?.kelas_diajar.length} Kelas</div>
          <div className="flex gap-1 mt-2">
            {data?.kelas_diajar.map((k) => (
              <span key={k} className="badge-pill text-xs">{k}</span>
            ))}
          </div>
        </div>

        <div className="feature-card">
          <div className="card-top-icon text-emerald-600">
            <Users size={22} />
          </div>
          <h4>Total Siswa Dibimbing</h4>
          <div className="amount-display">{data?.rekap_kehadiran_siswa.total_siswa_diajar} Siswa</div>
          <p className="card-subtext">Rata-rata kehadiran kelas: {data?.rekap_kehadiran_siswa.rata_rata_kehadiran}</p>
        </div>

        <div className="feature-card">
          <div className="card-top-icon text-amber-600">
            <Award size={22} />
          </div>
          <h4>Penilaian Semester</h4>
          <div className="amount-display text-amber-700">Aktif</div>
          <p className="card-subtext">Input nilai PTS & PAS terbuka untuk rombel semester ini</p>
        </div>
      </div>

      <div className="overview-columns mt-6">
        <div className="overview-card">
          <div className="card-header">
            <h3>
              <Calendar size={18} className="inline mr-2 text-indigo-600" />
              Jadwal Mengajar Mingguan
            </h3>
            <span className="badge-pill">Tahun Ajaran 2026/2027</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Hari</th>
                <th>Kelas</th>
                <th>Jam Pelajaran</th>
                <th>Ruangan</th>
              </tr>
            </thead>
            <tbody>
              {data?.jadwal_mengajar.map((item, idx) => (
                <tr key={idx}>
                  <td><strong>{item.hari}</strong></td>
                  <td><span className="badge-pill">{item.kelas}</span></td>
                  <td>{item.jam}</td>
                  <td>{item.ruang}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="overview-card">
          <div className="card-header">
            <h3>Aksi Cepat Guru</h3>
            <span className="badge-pill">Fitur Sistem</span>
          </div>
          <div className="action-buttons-list">
            <button className="btn-action">
              📝 Input Nilai Ulangan Harian / Tugas
            </button>
            <button className="btn-action">
              📋 Buka Presensi Kelas Hari Ini
            </button>
            <button className="btn-action">
              📂 Unggah Modul & Bahan Ajar PDF
            </button>
            <button className="btn-action">
              💬 Catatan Karakter Siswa (Terhubung ke BK)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
