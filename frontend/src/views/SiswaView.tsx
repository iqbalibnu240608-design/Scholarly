import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { Calendar, Clock, CreditCard, CheckCircle2, BookOpen, Award } from 'lucide-react';

interface SiswaData {
  kelas: string;
  wali_kelas: string;
  presensi_bulan_ini: {
    hadir: number;
    izin: number;
    sakit: number;
    alpha: number;
    persentase: string;
  };
  jadwal_hari_ini: Array<{
    jam: string;
    mapel: string;
    guru: string;
    ruang: string;
  }>;
  saldo_digital: {
    saldo_kopsis: number;
    saldo_kantin: number;
  };
  tagihan_spp: {
    status: string;
    bulan: string;
    jatuh_tempo: string;
  };
}

interface GradeRecord {
  id: number;
  subject_name: string;
  type: string;
  score: number;
  feedback?: string;
  teacher?: {
    name: string;
  };
}

export const SiswaView: React.FC = () => {
  const [data, setData] = useState<SiswaData | null>(null);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [averageScore, setAverageScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resSiswa, resGrades] = await Promise.all([
          apiClient.get('/school/siswa'),
          apiClient.get('/siswa/my-grades').catch(() => ({ data: { grades: [], average_score: 0 } })),
        ]);
        setData(resSiswa.data.data);
        setGrades(resGrades.data.grades || []);
        setAverageScore(resGrades.data.average_score || 0);
      } catch (err) {
        console.error('Error fetching siswa data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading-container">Memuat modul Siswa...</div>;

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h2>🎓 Portal Siswa (Peserta Didik)</h2>
          <p>Akses informasi akademik, jadwal kelas harian, presensi, saldo digital, dan buku nilai.</p>
        </div>
        <div className="header-meta">
          <span className="info-chip">Kelas: {data?.kelas}</span>
          <span className="info-chip">Wali: {data?.wali_kelas}</span>
        </div>
      </div>

      {/* Saldo Digital & SPP Grid */}
      <div className="grid-cards-3">
        <div className="feature-card highlight-card">
          <div className="card-top-icon text-indigo-600">
            <CreditCard size={22} />
          </div>
          <h4>Saldo Koperasi Siswa</h4>
          <div className="amount-display">
            Rp {(data?.saldo_digital.saldo_kopsis ?? 0).toLocaleString('id-ID')}
          </div>
          <p className="card-subtext">Dapat digunakan untuk pembelian ATK & seragam di Kopsis</p>
        </div>

        <div className="feature-card highlight-card">
          <div className="card-top-icon text-emerald-600">
            <CreditCard size={22} />
          </div>
          <h4>Saldo Kantin Sekolah</h4>
          <div className="amount-display">
            Rp {(data?.saldo_digital.saldo_kantin ?? 0).toLocaleString('id-ID')}
          </div>
          <p className="card-subtext">Dapat digunakan untuk pemesanan makanan cashless di kantin</p>
        </div>

        <div className="feature-card">
          <div className="card-top-icon text-amber-600">
            <CheckCircle2 size={22} />
          </div>
          <h4>Status Pembayaran SPP</h4>
          <div className="badge-status-paid">{data?.tagihan_spp.status}</div>
          <p className="card-subtext">Periode {data?.tagihan_spp.bulan} (Jatuh tempo: {data?.tagihan_spp.jatuh_tempo})</p>
        </div>
      </div>

      {/* Jadwal & Presensi Section */}
      <div className="overview-columns mt-6">
        {/* Jadwal Pelajaran */}
        <div className="overview-card">
          <div className="card-header">
            <h3>
              <Clock size={18} className="inline mr-2 text-indigo-600" />
              Jadwal Pelajaran Hari Ini
            </h3>
            <span className="badge-pill">{data?.jadwal_hari_ini.length || 0} Pertemuan</span>
          </div>
          <div className="schedule-list">
            {data?.jadwal_hari_ini.map((j, idx) => (
              <div key={idx} className="schedule-item">
                <div className="schedule-time">
                  <Calendar size={14} className="inline mr-1" /> {j.jam}
                </div>
                <div className="schedule-details">
                  <h4>{j.mapel}</h4>
                  <div className="schedule-meta">
                    <span>Pengajar: {j.guru}</span> • <span>Lokasi: {j.ruang}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rekap Kehadiran Siswa */}
        <div className="overview-card">
          <div className="card-header">
            <h3>
              <BookOpen size={18} className="inline mr-2 text-emerald-600" />
              Presensi & Kehadiran Bulan Ini
            </h3>
            <span className="badge-pill bg-emerald-100 text-emerald-800">
              {data?.presensi_bulan_ini.persentase}
            </span>
          </div>
          <div className="attendance-stats-grid">
            <div className="att-box hadir">
              <span className="att-number">{data?.presensi_bulan_ini.hadir}</span>
              <span className="att-label">Hadir</span>
            </div>
            <div className="att-box izin">
              <span className="att-number">{data?.presensi_bulan_ini.izin}</span>
              <span className="att-label">Izin</span>
            </div>
            <div className="att-box sakit">
              <span className="att-number">{data?.presensi_bulan_ini.sakit}</span>
              <span className="att-label">Sakit</span>
            </div>
            <div className="att-box alpha">
              <span className="att-number">{data?.presensi_bulan_ini.alpha}</span>
              <span className="att-label">Alpha</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-slate-50 rounded text-sm text-slate-600">
            💡 Presensi otomatis terhubung dengan gate gerbang satpam dan absensi kelas guru.
          </div>
        </div>
      </div>

      {/* Rekap Nilai Akademik Siswa */}
      <div className="overview-card mt-6">
        <div className="card-header">
          <h3>
            <Award size={18} className="inline mr-2 text-amber-500" />
            Transkrip Nilai Akademik Siswa (MySQL Table: `grades`)
          </h3>
          <span className="badge-pill bg-amber-50 text-amber-800 font-bold">
            Rata-rata: {averageScore}
          </span>
        </div>

        {grades.length === 0 ? (
          <div className="p-4 text-center text-sm text-slate-500">
            Belum ada nilai yang diinput oleh guru untuk semester ini.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mata Pelajaran</th>
                <th>Jenis Evaluasi</th>
                <th>Nilai Angka</th>
                <th>Guru Pengampu</th>
                <th>Catatan / Evaluasi</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => (
                <tr key={g.id}>
                  <td><strong>{g.subject_name}</strong></td>
                  <td>
                    <span className="badge-pill text-xs uppercase">{g.type}</span>
                  </td>
                  <td>
                    <strong className="text-indigo-700 text-sm">{Number(g.score)}</strong>
                  </td>
                  <td>{g.teacher?.name || 'Guru Pengampu'}</td>
                  <td className="text-xs text-slate-600">{g.feedback || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
