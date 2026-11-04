import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { FileText, DollarSign, Package, CheckCircle } from 'lucide-react';

interface PetugasData {
  administrasi_surat: {
    surat_masuk_hari_ini: number;
    surat_keluar_hari_ini: number;
    disposisi_pending: number;
  };
  keuangan_spp: {
    total_siswa_lunas: number;
    siswa_menunggak: number;
    penerimaan_bulan_ini: number;
  };
  inventaris_sekolah: {
    total_ruang_kelas: number;
    total_komputer_lab: number;
    kondisi_baik: number;
    dalam_perbaikan: number;
  };
}

export const PetugasView: React.FC = () => {
  const [data, setData] = useState<PetugasData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get('/school/petugas');
        setData(res.data.data);
      } catch (err) {
        console.error('Error fetching petugas data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading-container">Memuat modul Petugas TU...</div>;

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h2>📋 Portal Petugas Tata Usaha (TU) & Administrasi</h2>
          <p>Pengelolaan buku induk siswa, administrasi persuratan, verifikasi SPP, dan sarpras.</p>
        </div>
      </div>

      <div className="grid-cards-3">
        <div className="feature-card">
          <div className="card-top-icon text-indigo-600">
            <FileText size={22} />
          </div>
          <h4>Surat Menyurat Hari Ini</h4>
          <div className="amount-display">{data?.administrasi_surat.surat_masuk_hari_ini} Surat Masuk</div>
          <p className="card-subtext">
            {data?.administrasi_surat.surat_keluar_hari_ini} Surat Keluar | {data?.administrasi_surat.disposisi_pending} Disposisi Pending
          </p>
        </div>

        <div className="feature-card">
          <div className="card-top-icon text-emerald-600">
            <DollarSign size={22} />
          </div>
          <h4>Penerimaan SPP Bulan Ini</h4>
          <div className="amount-display text-emerald-700">
            Rp {(data?.keuangan_spp.penerimaan_bulan_ini ?? 0).toLocaleString('id-ID')}
          </div>
          <p className="card-subtext">
            {data?.keuangan_spp.total_siswa_lunas} Siswa Lunas • {data?.keuangan_spp.siswa_menunggak} Siswa Belum Lunas
          </p>
        </div>

        <div className="feature-card">
          <div className="card-top-icon text-purple-600">
            <Package size={22} />
          </div>
          <h4>Inventaris Lab & Kelas</h4>
          <div className="amount-display">{data?.inventaris_sekolah.total_komputer_lab} Komputer</div>
          <p className="card-subtext">
            {data?.inventaris_sekolah.kondisi_baik} Kondisi Baik • {data?.inventaris_sekolah.dalam_perbaikan} Perlu Servis
          </p>
        </div>
      </div>

      <div className="overview-columns mt-6">
        <div className="overview-card">
          <div className="card-header">
            <h3>Buku Induk Siswa & Dapodik</h3>
            <span className="badge-pill">Sinkronisasi</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg space-y-2">
            <div className="flex justify-between items-center text-sm py-1 border-b">
              <span>Validasi NISN Kemdikbud</span>
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle size={14} /> Terverifikasi
              </span>
            </div>
            <div className="flex justify-between items-center text-sm py-1 border-b">
              <span>Rombel Kelas X, XI, XII</span>
              <span className="font-semibold">Lengkap</span>
            </div>
            <div className="flex justify-between items-center text-sm py-1">
              <span>Cetak Leger Nilai & Surat Keterangan</span>
              <button className="badge-pill bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
                Generate Dokumen
              </button>
            </div>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-header">
            <h3>Menu Administrasi TU</h3>
            <span className="badge-pill">Fitur</span>
          </div>
          <div className="action-buttons-list">
            <button className="btn-action">
              📥 Catat Surat Masuk & Agenda Baru
            </button>
            <button className="btn-action">
              📤 Terbitkan Nomor Surat Keluar Resmi
            </button>
            <button className="btn-action">
              💳 Input Pembayaran SPP Tunai / Manual
            </button>
            <button className="btn-action">
              🏷️ Pendataan Aset & Inventaris Sekolah
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
