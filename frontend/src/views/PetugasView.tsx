import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
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
  PlusCircle,
  Wallet,
  Sparkles,
  Building,
  QrCode,
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
  const { user, activeRole } = useAuth();
  const isStudentView = activeRole === 'siswa';

  const [data, setData] = useState<PetugasData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Student State
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [studentSPPStatus, setStudentSPPStatus] = useState<string>('Lunas');
  const [showTopupModal, setShowTopupModal] = useState<boolean>(false);
  const [topupAmount, setTopupAmount] = useState<number>(100000);
  const [topupSubmitting, setTopupSubmitting] = useState<boolean>(false);

  // Modal State: Pembayaran SPP (Multi-payment options)
  const [showSPPModal, setShowSPPModal] = useState<boolean>(false);
  const [studentNisn, setStudentNisn] = useState<string>(user?.identifier_number || '0061234567');
  const [sppMonth, setSppMonth] = useState<string>('Desember 2026');
  const [sppAmount, setSppAmount] = useState<string>('350000');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'wallet' | 'transfer' | 'qris'>('wallet');
  const [sppNotes, setSppNotes] = useState<string>('Pembayaran SPP Mandiri Siswa');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [recentSPP, setRecentSPP] = useState<RecentSPP[]>([
    {
      reference_no: 'SPP-NOV-881',
      student_name: user?.name || 'Ahmad Pratama',
      nisn: user?.identifier_number || '0061234567',
      month: 'November 2026',
      amount: 350000,
      method: 'Saldo Digital',
      time: 'Hari ini, 08:30 WIB',
    },
  ]);

  const [lastReceipt, setLastReceipt] = useState<{
    reference_no: string;
    student: string;
    month: string;
    amount: number;
    method: string;
  } | null>(null);

  const fetchPetugasData = async () => {
    try {
      const res = await apiClient.get('/school/petugas');
      setData(res.data.data);
    } catch (err) {
      console.error('Error fetching petugas data', err);
    }
  };

  const fetchStudentData = async () => {
    try {
      const res = await apiClient.get('/school/siswa');
      if (res.data?.data?.tagihan_spp) {
        setStudentSPPStatus(res.data.data.tagihan_spp.status);
      }
    } catch (err) {
      console.error('Error fetching student spp data', err);
    }
  };

  const fetchWalletBalance = useCallback(async () => {
    try {
      const res = await apiClient.get('/wallet/balance');
      if (res.data?.wallet) {
        setWalletBalance(Number(res.data.wallet.balance_kopsis) || 0);
      }
    } catch (err) {
      console.error('Error fetching wallet balance', err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchPetugasData(), fetchStudentData(), fetchWalletBalance()]);
      setLoading(false);
    };
    init();
  }, [fetchWalletBalance]);

  // Keep studentNisn synced with user
  useEffect(() => {
    if (user?.identifier_number) {
      setStudentNisn(user.identifier_number);
    }
  }, [user]);

  // Top Up Handler
  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopupSubmitting(true);
    try {
      const targetNisn = user?.identifier_number || '0061234567';
      await apiClient.post('/wallet/topup', {
        identifier_number: targetNisn,
        amount: topupAmount,
        target_wallet: 'kopsis',
        notes: 'Top-up saldo administrasi SPP siswa',
      });
      await fetchWalletBalance();
      setShowTopupModal(false);
      setSuccessMsg(`Top-up sebesar Rp ${topupAmount.toLocaleString('id-ID')} berhasil ditambahkan!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal melakukan top-up');
    } finally {
      setTopupSubmitting(false);
    }
  };

  // Pay SPP Handler
  const handlePaySPP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'wallet' && walletBalance < Number(sppAmount)) {
      alert('Saldo E-Wallet Anda tidak mencukupi. Anda dapat memilih metode Virtual Account, Tunai di Loket TU, atau QRIS!');
      return;
    }

    setSubmitting(true);
    try {
      const targetIdentifier = isStudentView
        ? user?.identifier_number || '0061234567'
        : studentNisn;

      const res = await apiClient.post('/petugas/spp-payment', {
        student_identifier: targetIdentifier,
        amount: Number(sppAmount),
        month: sppMonth,
        payment_method: paymentMethod,
        notes: sppNotes || undefined,
      });

      const methodLabel =
        paymentMethod === 'wallet'
          ? 'Saldo E-Wallet'
          : paymentMethod === 'cash'
          ? 'Tunai di Loket TU'
          : paymentMethod === 'transfer'
          ? 'Virtual Account / Transfer'
          : 'QRIS Pendidikan';

      const newTrx: RecentSPP = {
        reference_no: res.data.transaction?.reference_no || 'SPP-' + Math.floor(Math.random() * 900000 + 100000),
        student_name: isStudentView ? (user?.name || 'Ahmad Pratama') : studentNisn,
        nisn: targetIdentifier,
        month: sppMonth,
        amount: Number(sppAmount),
        method: methodLabel,
        time: 'Baru saja',
      };

      setRecentSPP((prev) => [newTrx, ...prev]);
      setLastReceipt({
        reference_no: newTrx.reference_no,
        student: newTrx.student_name,
        month: newTrx.month,
        amount: newTrx.amount,
        method: newTrx.method,
      });

      setSuccessMsg(res.data.message || 'Pembayaran SPP berhasil diproses.');
      setStudentSPPStatus('Lunas');
      setShowSPPModal(false);
      await Promise.all([fetchPetugasData(), fetchWalletBalance()]);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memproses pembayaran SPP');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-container">Memuat modul Petugas TU...</div>;

  return (
    <div className="view-container">
      {/* Alert Receipt Notifikasi */}
      {lastReceipt && (
        <div className="receipt-alert-box">
          <Receipt size={24} className="receipt-alert-icon" />
          <div className="receipt-alert-content">
            <div className="receipt-alert-title">
              ✅ Kuitansi Pembayaran SPP Resmi: {lastReceipt.reference_no}
            </div>
            <div className="receipt-alert-desc">
              Pembayaran SPP Bulan <strong>{lastReceipt.month}</strong> sebesar{' '}
              <strong>Rp {Number(lastReceipt.amount).toLocaleString('id-ID')}</strong> ({lastReceipt.method}) untuk {lastReceipt.student} telah terverifikasi lunas di sistem Tata Usaha.
            </div>
          </div>
          <button onClick={() => setLastReceipt(null)} className="btn-close-modal">
            <X size={16} />
          </button>
        </div>
      )}

      {successMsg && !lastReceipt && (
        <div className="feedback-alert mb-4">
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAMPILAN 1: STUDENT VIEW (LAYANAN TU & SPP SISWA)              */}
      {/* ============================================================== */}
      {isStudentView ? (
        <>
          {/* Hero Saldo & Status SPP */}
          <div className="wallet-hero-banner" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)' }}>
            <div className="wallet-hero-left">
              <h3>
                <Building size={20} className="text-purple-400" />
                Layanan Keuangan & Administrasi SPP Siswa
              </h3>
              <p>
                Pantau tagihan iuran sekolah dan lakukan pembayaran SPP bulanan mandiri via E-Wallet, Tunai di Loket, atau QRIS.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="wallet-balance-box">
                <Wallet size={20} className="text-purple-300" />
                <div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                    Saldo Digital Anda
                  </div>
                  <div className="wallet-amount-val" style={{ color: '#c084fc' }}>
                    Rp {walletBalance.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowTopupModal(true)}
                className="btn-success-action"
                style={{ padding: '10px 16px', fontSize: '13px' }}
              >
                <PlusCircle size={16} /> Isi Saldo
              </button>
            </div>
          </div>

          {/* Kartu Status Tagihan SPP */}
          <div className="grid-cards-3">
            <div className="feature-card highlight-card">
              <div className="card-top-icon text-indigo-600"><CheckCircle size={22} /></div>
              <h4>Status Tagihan Bulan Berjalan</h4>
              <div className={studentSPPStatus === 'Lunas' ? 'badge-status-paid' : 'badge-pill bg-amber-100 text-amber-800'}>
                {studentSPPStatus} (November 2026)
              </div>
              <p className="card-subtext">Biaya SPP Reguler: Rp 350.000 / bulan</p>
            </div>

            <div className="feature-card">
              <div className="card-top-icon text-purple-600"><DollarSign size={22} /></div>
              <h4>Periode Tagihan Berikutnya</h4>
              <div className="amount-display" style={{ fontSize: '18px' }}>Desember 2026</div>
              <p className="card-subtext">Jatuh tempo pada tanggal 10 Desember 2026</p>
            </div>

            <div className="feature-card flex flex-col justify-between">
              <div>
                <div className="card-top-icon text-emerald-600"><CreditCard size={22} /></div>
                <h4>Aksi Pembayaran</h4>
                <p className="text-xs text-slate-500 mt-1">Pilih metode bayar: E-Wallet, VA, Tunai, atau QRIS</p>
              </div>
              <button
                onClick={() => {
                  setSppMonth('Desember 2026');
                  setShowSPPModal(true);
                }}
                className="btn-primary-action w-full mt-3"
                style={{ justifyContent: 'center' }}
              >
                <CreditCard size={16} /> Bayar SPP Sekarang
              </button>
            </div>
          </div>

          {/* Riwayat Pembayaran SPP Siswa */}
          <div className="overview-card mt-6">
            <div className="card-header">
              <h3>
                <Sparkles size={18} className="inline mr-2 text-purple-600" />
                Riwayat Pembayaran SPP & Kuitansi Digital
              </h3>
              <span className="badge-pill">Arsip Resmi TU</span>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>No. Kuitansi</th>
                    <th>Periode Bulan</th>
                    <th>Nominal</th>
                    <th>Metode Pembayaran</th>
                    <th>Waktu Pembayaran</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSPP.map((item, idx) => (
                    <tr key={idx}>
                      <td><strong className="text-purple-700">{item.reference_no}</strong></td>
                      <td><strong>{item.month}</strong></td>
                      <td>Rp {item.amount.toLocaleString('id-ID')}</td>
                      <td>
                        <span className="badge-pill text-xs">{item.method}</span>
                      </td>
                      <td className="text-xs text-slate-500">{item.time}</td>
                      <td>
                        <span className="badge-pill bg-emerald-100 text-emerald-700 text-xs font-bold">
                          LUNAS
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* ============================================================== */
        /* TAMPILAN 2: PETUGAS TU & ADMIN DASHBOARD                       */
        /* ============================================================== */
        <>
          <div className="view-header">
            <div>
              <h2>📋 Portal Petugas TU & Administrasi</h2>
              <p>Kelola surat-menyurat, verifikasi pembayaran SPP sekolah, dan inventaris sarana prasarana.</p>
            </div>
            <div className="card-header-actions">
              <button onClick={() => setShowSPPModal(true)} className="btn-success-action">
                <CreditCard size={16} /> Input Pembayaran SPP Siswa
              </button>
            </div>
          </div>

          {/* Metric Cards Petugas TU */}
          <div className="grid-cards-3">
            <div className="feature-card highlight-card">
              <div className="card-top-icon text-purple-600"><FileText size={22} /></div>
              <h4>Surat Masuk Hari Ini</h4>
              <div className="amount-display">{data?.administrasi_surat.surat_masuk_hari_ini ?? 0} Surat</div>
              <p className="card-subtext">{data?.administrasi_surat.disposisi_pending ?? 0} disposisi kepala sekolah pending</p>
            </div>

            <div className="feature-card">
              <div className="card-top-icon text-emerald-600"><DollarSign size={22} /></div>
              <h4>Penerimaan SPP Bulan Ini</h4>
              <div className="amount-display">
                Rp {(data?.keuangan_spp.penerimaan_bulan_ini ?? 0).toLocaleString('id-ID')}
              </div>
              <p className="card-subtext">{data?.keuangan_spp.total_siswa_lunas ?? 0} siswa terverifikasi lunas</p>
            </div>

            <div className="feature-card">
              <div className="card-top-icon text-indigo-600"><Package size={22} /></div>
              <h4>Inventaris Lab Komputer</h4>
              <div className="amount-display">{data?.inventaris_sekolah.total_komputer_lab ?? 0} Unit</div>
              <p className="card-subtext">{data?.inventaris_sekolah.kondisi_baik ?? 0} siap pakai, {data?.inventaris_sekolah.dalam_perbaikan ?? 0} perbaikan</p>
            </div>
          </div>

          {/* Riwayat Pembayaran SPP Masuk */}
          <div className="overview-card mt-6">
            <div className="card-header">
              <h3>Riwayat Transaksi Pembayaran SPP Terbaru</h3>
              <span className="badge-pill">{recentSPP.length} Transaksi</span>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>No. Referensi</th>
                    <th>Nama Siswa</th>
                    <th>NISN</th>
                    <th>Bulan SPP</th>
                    <th>Nominal</th>
                    <th>Metode</th>
                    <th>Waktu Input</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSPP.map((spp, idx) => (
                    <tr key={idx}>
                      <td><strong>{spp.reference_no}</strong></td>
                      <td>{spp.student_name}</td>
                      <td><code>{spp.nisn}</code></td>
                      <td><strong>{spp.month}</strong></td>
                      <td>Rp {spp.amount.toLocaleString('id-ID')}</td>
                      <td>
                        <span className="badge-pill text-xs">{spp.method}</span>
                      </td>
                      <td className="text-xs text-slate-500">{spp.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* MODAL: TOP-UP SALDO DIGITAL SISWA                              */}
      {/* ============================================================== */}
      {showTopupModal && (
        <div className="eco-modal-backdrop" onClick={() => setShowTopupModal(false)}>
          <div className="eco-modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="eco-modal-header">
              <h3><Wallet size={18} className="text-purple-500" /> Isi Saldo Digital</h3>
              <button onClick={() => setShowTopupModal(false)} className="btn-close-modal"><X size={18} /></button>
            </div>
            <form onSubmit={handleTopup} className="eco-modal-form">
              <div className="eco-modal-body">
                <p className="text-xs text-slate-600">
                  Pilih nominal saldo yang ingin Anda tambahkan ke Saldo E-Wallet untuk pembayaran SPP / administrasi:
                </p>
                <div className="topup-grid">
                  {[50000, 100000, 200000, 350000, 500000, 700000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopupAmount(amt)}
                      className={`topup-btn ${topupAmount === amt ? 'selected' : ''}`}
                    >
                      Rp {amt.toLocaleString('id-ID')}
                    </button>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-purple-50 rounded text-xs text-purple-800 border border-purple-200">
                  💡 Saldo ini dapat langsung dipakai untuk membayar tagihan SPP bulanan sekolah.
                </div>
              </div>
              <div className="eco-modal-footer">
                <button type="button" onClick={() => setShowTopupModal(false)} className="btn-secondary-action">
                  Batal
                </button>
                <button type="submit" disabled={topupSubmitting} className="btn-success-action">
                  {topupSubmitting ? 'Memproses...' : `Konfirmasi Top Up Rp ${topupAmount.toLocaleString('id-ID')}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: PEMBAYARAN SPP (MULTI-PAYMENT SUPPORT)                  */}
      {/* ============================================================== */}
      {showSPPModal && (
        <div className="eco-modal-backdrop" onClick={() => setShowSPPModal(false)}>
          <div className="eco-modal-card" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="eco-modal-header">
              <h3>
                <CreditCard size={18} className="text-emerald-600" />
                {isStudentView ? 'Pembayaran SPP Mandiri' : 'Loket Kasir Pembayaran SPP'}
              </h3>
              <button onClick={() => setShowSPPModal(false)} className="btn-close-modal">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePaySPP} className="eco-modal-form">
              <div className="eco-modal-body">
                {!isStudentView ? (
                  <div className="eco-form-group">
                    <label className="eco-form-label">Identitas Siswa (NISN / Nomor Induk)</label>
                    <input
                      type="text"
                      value={studentNisn}
                      onChange={(e) => setStudentNisn(e.target.value)}
                      placeholder="Masukkan NISN Siswa..."
                      required
                      className="eco-form-input"
                    />
                    <div className="quick-preset-container">
                      <span className="text-xs text-slate-500 font-semibold">Pilih Cepat Siswa:</span>
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
                ) : (
                  <div className="p-3 bg-purple-50 rounded border border-purple-200 text-xs">
                    <div className="font-semibold text-purple-900">Data Siswa:</div>
                    <div className="mt-1 text-slate-700">Nama: <strong>{user?.name || 'Ahmad Pratama'}</strong></div>
                    <div className="text-slate-700">NISN: <code>{user?.identifier_number || '0061234567'}</code></div>
                    <div className="mt-2 text-purple-800">
                      Saldo E-Wallet Anda: <strong>Rp {walletBalance.toLocaleString('id-ID')}</strong>
                    </div>
                  </div>
                )}

                <div className="eco-form-group">
                  <label className="eco-form-label">Bulan Periode SPP</label>
                  <select
                    value={sppMonth}
                    onChange={(e) => setSppMonth(e.target.value)}
                    className="eco-form-input"
                  >
                    <option value="November 2026">November 2026</option>
                    <option value="Desember 2026">Desember 2026</option>
                    <option value="Januari 2027">Januari 2027</option>
                    <option value="Februari 2027">Februari 2027</option>
                  </select>
                </div>

                <div className="eco-form-group">
                  <label className="eco-form-label">Nominal Pembayaran (Rp)</label>
                  <input
                    type="number"
                    value={sppAmount}
                    onChange={(e) => setSppAmount(e.target.value)}
                    placeholder="Contoh: 350000"
                    required
                    className="eco-form-input"
                  />
                </div>

                {/* Pilihan Metode Pembayaran Fleksibel */}
                <div className="eco-form-group">
                  <label className="eco-form-label font-bold">Pilih Cara Pembayaran:</label>
                  <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('wallet')}
                      className={`payment-method-btn ${paymentMethod === 'wallet' ? 'selected' : ''}`}
                    >
                      <CreditCard size={16} /> Saldo E-Wallet Siswa
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`payment-method-btn ${paymentMethod === 'cash' ? 'selected' : ''}`}
                    >
                      <Banknote size={16} /> Tunai di Loket TU
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('transfer')}
                      className={`payment-method-btn ${paymentMethod === 'transfer' ? 'selected' : ''}`}
                    >
                      <Building size={16} /> Virtual Account Bank
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('qris')}
                      className={`payment-method-btn ${paymentMethod === 'qris' ? 'selected' : ''}`}
                    >
                      <QrCode size={16} /> QRIS Pendidikan
                    </button>
                  </div>
                </div>

                {paymentMethod === 'transfer' && (
                  <div className="p-3 bg-blue-50 text-blue-800 rounded text-xs border border-blue-200">
                    🏦 <strong>Nomor Virtual Account:</strong> <code>88001{user?.identifier_number || '0061234567'}</code> (Bank BNI / Mandiri / BRI). Konfirmasi instan tanpa upload slip transfer.
                  </div>
                )}

                {paymentMethod === 'qris' && (
                  <div className="p-3 bg-indigo-50 text-indigo-800 rounded text-xs border border-indigo-200 text-center">
                    <QrCode size={36} className="mx-auto text-indigo-600 mb-1" />
                    <p className="font-bold">QRIS Pembayaran SPP Sekolah</p>
                  </div>
                )}

                <div className="eco-form-group">
                  <label className="eco-form-label">Catatan Tambahan (Opsional)</label>
                  <input
                    type="text"
                    value={sppNotes}
                    onChange={(e) => setSppNotes(e.target.value)}
                    placeholder="Catatan..."
                    className="eco-form-input"
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
                >
                  {submitting ? 'Memproses...' : `Konfirmasi Bayar Rp ${Number(sppAmount).toLocaleString('id-ID')}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
