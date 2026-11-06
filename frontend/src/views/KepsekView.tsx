import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { Award, TrendingUp, CheckCircle, ShieldAlert, FileCheck, FileText, BarChart3, School } from 'lucide-react';

interface KepsekData {
  ringkasan_eksekutif: {
    kehadiran_guru_hari_ini: string;
    kehadiran_siswa_hari_ini: string;
    status_akreditasi: string;
    total_pendapatan_kopsis_bulan_ini: number;
    total_transaksi_kantin_hari_ini: number;
  };
  laporan_strategis: Array<{
    judul: string;
    status: string;
    kategori: string;
  }>;
}

export const KepsekView: React.FC = () => {
  const [data, setData] = useState<KepsekData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get('/school/kepsek');
        setData(res.data.data);
      } catch (err) {
        console.error('Error fetching kepsek data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading-container">Memuat modul Kepala Sekolah...</div>;

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><School size={24} style={{ color: '#356df3' }} /> Portal Kepala Sekolah (Pimpinan Eksekutif)</h2>
          <p>Pemantauan KPI sekolah, pengawasan integritas akademik, keuangan kopsis, dan evaluasi unit.</p>
        </div>
        <div className="header-meta">
          <span className="badge-status-paid">Akreditasi: {data?.ringkasan_eksekutif.status_akreditasi}</span>
        </div>
      </div>

      <div className="grid-cards-4">
        <div className="feature-card">
          <div className="card-top-icon text-indigo-600">
            <CheckCircle size={22} />
          </div>
          <h4>Kehadiran Guru Hari Ini</h4>
          <div className="amount-display text-indigo-700">
            {data?.ringkasan_eksekutif.kehadiran_guru_hari_ini}
          </div>
          <p className="card-subtext">Disiplin dan absensi dewan pengajar optimal</p>
        </div>

        <div className="feature-card">
          <div className="card-top-icon text-emerald-600">
            <CheckCircle size={22} />
          </div>
          <h4>Kehadiran Siswa Hari Ini</h4>
          <div className="amount-display text-emerald-700">
            {data?.ringkasan_eksekutif.kehadiran_siswa_hari_ini}
          </div>
          <p className="card-subtext">Akumulasi seluruh jenjang kelas X, XI, XII</p>
        </div>

        <div className="feature-card">
          <div className="card-top-icon text-amber-600">
            <TrendingUp size={22} />
          </div>
          <h4>Omset Kopsis Bulan Ini</h4>
          <div className="amount-display text-amber-700">
            Rp {(data?.ringkasan_eksekutif.total_pendapatan_kopsis_bulan_ini ?? 0).toLocaleString('id-ID')}
          </div>
          <p className="card-subtext">Laba unit usaha koperasi siswa</p>
        </div>

        <div className="feature-card">
          <div className="card-top-icon text-cyan-600">
            <TrendingUp size={22} />
          </div>
          <h4>Transaksi Kantin Hari Ini</h4>
          <div className="amount-display text-cyan-700">
            Rp {(data?.ringkasan_eksekutif.total_transaksi_kantin_hari_ini ?? 0).toLocaleString('id-ID')}
          </div>
          <p className="card-subtext">Perputaran digital kantin sehat</p>
        </div>
      </div>

      <div className="overview-columns mt-6">
        <div className="overview-card">
          <div className="card-header">
            <h3>
              <Award size={18} className="inline mr-2 text-indigo-600" />
              Laporan Strategis & Kebijakan Sekolah
            </h3>
            <span className="badge-pill">Tinjauan Eksekutif</span>
          </div>
          <div className="space-y-3">
            {data?.laporan_strategis.map((item, idx) => (
              <div key={idx} className="p-4 border rounded-lg flex items-center justify-between bg-white shadow-sm">
                <div>
                  <h4 className="font-semibold text-slate-800">{item.judul}</h4>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">{item.kategori}</span>
                </div>
                <span className="badge-pill bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="overview-card">
          <div className="card-header">
            <h3>Persetujuan Disposisi & Pengesahan</h3>
            <span className="badge-pill">Otoritas Kepsek</span>
          </div>
          <div className="action-buttons-list">
            <button className="btn-action">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FileCheck size={16} style={{ color: '#10b981' }} /> Pengesahan Nilai Rapor Semester Siswa</span>
            </button>
            <button className="btn-action">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={16} style={{ color: '#356df3' }} /> Tanda Tangan Digital Surat Keputusan (SK)</span>
            </button>
            <button className="btn-action">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart3 size={16} style={{ color: '#6366f1' }} /> Ekspor Laporan Tahunan Sekolah (PDF/Excel)</span>
            </button>
            <button className="btn-action">
              <ShieldAlert size={16} className="inline mr-1 text-amber-500" /> Audit Keuangan Kopsis & Kantin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
