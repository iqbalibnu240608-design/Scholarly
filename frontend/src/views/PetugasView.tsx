import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import {
  FileText,
  DollarSign,
  Package,
  CheckCircle,
  CreditCard,
  Banknote,
  Receipt,
  X,
  Check
} from 'lucide-react';
import './EcosystemModals.css';

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

interface RecentSPP {
  reference_no: string;
  student_name: string;
  nisn: string;
  month: string;
  amount: number;
  method: string;
  time: string;
}

export const PetugasView: React.FC = () => {
  const [data, setData] = useState<PetugasData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal State: Pembayaran SPP
  const [showSPPModal, setShowSPPModal] = useState<boolean>(false);
  const [studentNisn, setStudentNisn] = useState<string>('0061234567');
  const [sppMonth, setSppMonth] = useState<string>('November 2026');
  const [sppAmount, setSppAmount] = useState<string>('350000');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'wallet'>('cash');
  const [sppNotes, setSppNotes] = useState<string>('Lunas kasir loket TU');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [recentSPP, setRecentSPP] = useState<RecentSPP[]>([
    {
      reference_no: 'SPP-INIT-01',
      student_name: 'Ahmad Pratama',
      nisn: '0061234567',
      month: 'November 2026',
      amount: 350000,
      method: 'Tunai (Cash)',
      time: 'Hari ini',
    },
  ]);

  const fetchPetugasData = async () => {
    try {
      const res = await apiClient.get('/school/petugas');
      setData(res.data.data);
    } catch (err) {
      console.error('Error fetching petugas data', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchPetugasData();
      setLoading(false);
    };
    init();
  }, []);

  const handlePaySPP = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiClient.post('/petugas/spp-payment', {
        student_identifier: studentNisn,
        amount: Number(sppAmount),
        month: sppMonth,
        payment_method: paymentMethod,
        notes: sppNotes || undefined,
      });

      setSuccessMsg(res.data.message);
      setTimeout(() => setSuccessMsg(null), 3500);

      const studentLabel = studentNisn === '0061234567' ? 'Ahmad Pratama' : studentNisn === '0089876543' ? 'Siti Rahmawati' : `Siswa (${studentNisn})`;
      setRecentSPP((prev) => [
        {
          reference_no: res.data.transaction?.reference_no || 'SPP-' + Math.floor(Math.random() * 90000 + 10000),
          student_name: studentLabel,
          nisn: studentNisn,
          month: sppMonth,
          amount: Number(sppAmount),
          method: paymentMethod === 'cash' ? 'Tunai (Cash)' : 'Potong Saldo E-Wallet',
          time: 'Baru saja',
        },
        ...prev,
      ]);

      setShowSPPModal(false);
      await fetchPetugasData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memproses pembayaran SPP.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-container">Memuat modul Petugas TU...</div>;

  return (
    <div className="view-container">
      {/* Header Halaman */}
      <div className="view-header">
        <div>
          <h2>📋 Portal Petugas Tata Usaha (TU) & Administrasi</h2>
          <p>Pengelolaan buku induk siswa, administrasi persuratan, loket pembayaran SPP, dan sarpras.</p>
        </div>
      </div>

      {/* Alert Notifikasi Sukses */}
      {successMsg && (
        <div className="p-3 mb-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center gap-2">
          <Check size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Ringkasan Statistik TU */}
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

      {/* Kolom Informasi & Aksi */}
      <div className="overview-columns mt-6">
        <div className="overview-card">
          <div className="card-header">
            <h3>Buku Induk Siswa & Dapodik</h3>
            <span className="badge-pill">Sinkronisasi</span>
          </div>
          <div className="p-4 bg-slate-50 rounded space-y-2">
            <div className="flex justify-between items-center text-sm py-1 border-b">
              <span>Validasi NISN Kemdikbud</span>
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle size={14} /> Terverifikasi
              </span>
            </div>
            <div className="flex justify-between items-center text-sm py-1 border-b">
              <span>Rombel Kelas X, XI, XII</span>
              <span className="font-semibold">Lengkap ({data?.inventaris_sekolah.total_ruang_kelas} Rombel)</span>
            </div>
            <div className="flex justify-between items-center text-sm py-1">
              <span>Cetak Leger Nilai & Surat Keterangan</span>
              <button
                onClick={() => alert('Dokumen leger nilai siswa siap dicetak.')}
                className="btn-secondary-action cursor-pointer"
              >
                Generate Dokumen
              </button>
            </div>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-header">
            <h3>Menu Administrasi TU</h3>
            <span className="badge-pill">Fitur Aktif</span>
          </div>
          <div className="action-buttons-list">
            <button
              onClick={() => setShowSPPModal(true)}
              className="btn-action bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold hover:bg-emerald-100"
            >
              💳 Input Pembayaran SPP Tunai / Manual (Loket Kasir)
            </button>
            <button
              onClick={() => alert('Formulir pencatatan surat masuk siap digunakan.')}
              className="btn-action"
            >
              📥 Catat Surat Masuk & Agenda Baru
            </button>
            <button
              onClick={() => alert('Nomor surat keluar otomatis diterbitkan sistem penomoran.')}
              className="btn-action"
            >
              📤 Terbitkan Nomor Surat Keluar Resmi
            </button>
            <button
              onClick={() => alert('Pendataan aset dan sarpras ruang kelas terkoneksi.')}
              className="btn-action"
            >
              🏷️ Pendataan Aset & Inventaris Sekolah
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Input Pembayaran SPP Siswa */}
      {showSPPModal && (
        <div className="eco-modal-backdrop">
          <div className="eco-modal-card">
            <div className="eco-modal-header">
              <h3>
                <Receipt size={18} className="text-emerald-600" />
                Loket Pembayaran SPP Siswa (Tata Usaha)
              </h3>
              <button onClick={() => setShowSPPModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePaySPP} className="eco-modal-form">
              <div className="eco-modal-body">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nomor Identitas (NISN Siswa) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 0061234567"
                    value={studentNisn}
                    onChange={(e) => setStudentNisn(e.target.value)}
                    className="w-full p-2 border rounded text-xs bg-white"
                  />
                  <div className="quick-preset-container">
                    <span className="text-[11px] text-slate-500">Pilih Cepat Siswa:</span>
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
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Periode Bulan SPP *
                    </label>
                    <select
                      value={sppMonth}
                      onChange={(e) => setSppMonth(e.target.value)}
                      className="w-full p-2 border rounded text-xs bg-white"
                    >
                      <option value="November 2026">November 2026</option>
                      <option value="Desember 2026">Desember 2026</option>
                      <option value="Januari 2027">Januari 2027</option>
                      <option value="Februari 2027">Februari 2027</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Nominal SPP (Rp) *
                    </label>
                    <input
                      type="number"
                      required
                      value={sppAmount}
                      onChange={(e) => setSppAmount(e.target.value)}
                      className="w-full p-2 border rounded text-xs bg-white font-bold text-emerald-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Metode Pembayaran *
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`flex-1 p-2 rounded border text-xs font-bold flex items-center justify-center gap-1 cursor-pointer ${
                        paymentMethod === 'cash'
                          ? 'bg-amber-50 border-amber-500 text-amber-700'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <Banknote size={14} /> Tunai (Loket TU)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('wallet')}
                      className={`flex-1 p-2 rounded border text-xs font-bold flex items-center justify-center gap-1 cursor-pointer ${
                        paymentMethod === 'wallet'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <CreditCard size={14} /> Potong Saldo E-Wallet Siswa
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Catatan Kwitansi / Keterangan
                  </label>
                  <input
                    type="text"
                    value={sppNotes}
                    onChange={(e) => setSppNotes(e.target.value)}
                    className="w-full p-2 border rounded text-xs bg-white"
                  />
                </div>
              </div>

              <div className="eco-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowSPPModal(false)}
                  className="btn-secondary-action"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-success-action"
                  style={{ opacity: submitting ? 0.6 : 1 }}
                >
                  {submitting ? 'Mencatat...' : `Terbitkan Bukti Lunas Rp ${Number(sppAmount).toLocaleString('id-ID')}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabel Riwayat Pembayaran SPP Terkini */}
      <div className="overview-card mt-6">
        <div className="card-header">
          <h3>
            <Receipt size={18} className="inline mr-2 text-emerald-600" />
            Riwayat Pembayaran SPP Terkini (MySQL Table: `transactions`)
          </h3>
          <span className="badge-pill bg-emerald-50 text-emerald-700">Tersinkronisasi Kasir TU</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>No. Kwitansi</th>
                <th>Nama Siswa</th>
                <th>NISN</th>
                <th>Periode Bulan</th>
                <th>Nominal</th>
                <th>Metode</th>
                <th>Waktu</th>
              </tr>
            </thead>
            <tbody>
              {recentSPP.map((spp, idx) => (
                <tr key={idx}>
                  <td><code>{spp.reference_no}</code></td>
                  <td><strong>{spp.student_name}</strong></td>
                  <td><code>{spp.nisn}</code></td>
                  <td><span className="badge-pill text-xs">{spp.month}</span></td>
                  <td className="font-bold text-emerald-700">
                    Rp {spp.amount.toLocaleString('id-ID')}
                  </td>
                  <td><span className="badge-pill text-xs">{spp.method}</span></td>
                  <td className="text-xs text-slate-500">{spp.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
