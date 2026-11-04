import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { Calendar, Clock, CreditCard, CheckCircle2, BookOpen } from 'lucide-react';

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

export const SiswaView: React.FC = () => {
  const [data, setData] = useState<SiswaData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get('/school/siswa');
        setData(res.data.data);
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
          <p>Akses informasi akademik, jadwal kelas harian, presensi, dan saldo digital.</p>
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
            <span className="badge-pill">3 Pertemuan</span>
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
            💡 Sistem presensi terhubung otomatis dengan rekapan absensi guru dan notifikasi wali kelas.
          </div>
        </div>
      </div>
    </div>
  );
};
