import React, { useState, useEffect } from 'react';
import { X, QrCode, Banknote, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { getStoredQRIS, DEFAULT_QRIS_SVG, type QRISConfig } from '../../utils/qris';
import { toast } from 'sonner';

interface UniversalTopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialAmount?: number;
}

const PRESET_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];

export const UniversalTopupModal: React.FC<UniversalTopupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialAmount = 50000,
}) => {
  const { user, activeRole } = useAuth();
  const [amount, setAmount] = useState<number>(initialAmount);
  const [customAmountStr, setCustomAmountStr] = useState<string>(initialAmount.toString());
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'cash'>('qris');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [qrisConfig, setQrisConfig] = useState<QRISConfig>(() => getStoredQRIS('universal'));

  useEffect(() => {
    if (isOpen) {
      setQrisConfig(getStoredQRIS('tu'));
      setAmount(initialAmount);
      setCustomAmountStr(initialAmount.toString());
    }
  }, [isOpen, initialAmount]);

  if (!isOpen) return null;

  const handleSelectPreset = (val: number) => {
    setAmount(val);
    setCustomAmountStr(val.toString());
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setCustomAmountStr(raw);
    const parsed = parseInt(raw, 10);
    setAmount(isNaN(parsed) ? 0 : parsed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amount < 5000) {
      toast.error('Nominal top-up minimal Rp 5.000');
      return;
    }
    if (amount > 2000000) {
      toast.error('Nominal top-up maksimal Rp 2.000.000 per transaksi');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.post('/wallet/topup', {
        amount,
        payment_method: paymentMethod,
        target_wallet: 'universal',
        notes: notes.trim()
          ? `${notes.trim()} (via ${paymentMethod === 'qris' ? 'QRIS' : 'Setor Tunai'})`
          : `Pengajuan top-up mandiri (${paymentMethod === 'qris' ? 'Scan QRIS' : 'Setor Tunai Loket'})`,
      });

      if (res.data?.status === 'pending') {
        toast.success(
          paymentMethod === 'qris'
            ? `Pengajuan top-up QRIS Rp ${amount.toLocaleString('id-ID')} berhasil dibuat! Menunggu verifikasi petugas loket TU / Kopsis.`
            : `Pengajuan top-up tunai Rp ${amount.toLocaleString('id-ID')} dicatat! Silakan serahkan uang ke loket TU atau kasir kopsis.`
        );
      } else {
        toast.success(`Saldo sebesar Rp ${amount.toLocaleString('id-ID')} berhasil ditambahkan!`);
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      console.error('Topup error:', err);
      toast.error(err.response?.data?.message || 'Gagal mengajukan top-up. Pastikan jaringan stabil.');
    } finally {
      setSubmitting(false);
    }
  };

  const qrImageSrc = qrisConfig.imageUrl || DEFAULT_QRIS_SVG;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-xs">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Isi Saldo E-Wallet</h3>
              <p className="text-xs text-blue-100">
                Universal untuk Kantin, Koperasi Siswa, & Ekosistem Sekolah
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Badge Info */}
        <div className="px-6 py-2.5 bg-blue-50 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/30 flex items-center justify-between text-xs">
          <span className="text-slate-600 dark:text-slate-400">
            Akun:{' '}
            <strong className="text-slate-900 dark:text-white font-semibold">
              {user?.name || 'Pengguna'}
            </strong>{' '}
            ({activeRole.toUpperCase()})
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400">
            <ShieldCheck className="w-3.5 h-3.5" /> ID:{' '}
            {user?.identifier_number || `USR-${user?.id || '01'}`}
          </span>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Preset Amounts */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Pilih Nominal Saldo
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map((val) => {
                const isSelected = amount === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleSelectPreset(val)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-500/30'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                  >
                    Rp {val.toLocaleString('id-ID')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Atau Masukkan Nominal Kustom
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 dark:text-slate-400 text-sm">
                Rp
              </span>
              <input
                type="text"
                value={amount > 0 ? amount.toLocaleString('id-ID') : customAmountStr}
                onChange={handleCustomAmountChange}
                placeholder="Contoh: 75.000"
                className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-bold text-base focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Minimal Rp 5.000 • Maksimal Rp 2.000.000 per transaksi
            </p>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('qris')}
                className={`p-3 rounded-2xl border text-left flex items-start space-x-3 transition-all ${
                  paymentMethod === 'qris'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    paymentMethod === 'qris'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Scan QRIS
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                    BCA, Mandiri, GoPay, Dana, OVO, ShopeePay
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-2xl border text-left flex items-start space-x-3 transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    paymentMethod === 'cash'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Setor Tunai Loket
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                    Bayar langsung ke TU atau Kasir Kopsis
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* QRIS Display Container */}
          {paymentMethod === 'qris' && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center animate-fade-in">
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 mb-2.5">
                <img
                  src={qrImageSrc}
                  alt="QRIS Sekolah"
                  className="w-44 h-44 object-contain rounded-lg"
                />
              </div>
              <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                {qrisConfig.merchantName}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                NMID: {qrisConfig.nmid}
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                Scan & transfer Rp {amount.toLocaleString('id-ID')} via aplikasi apapun
              </div>
            </div>
          )}

          {/* Cash Notice */}
          {paymentMethod === 'cash' && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start space-x-3 text-amber-900 dark:text-amber-200 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5">Instruksi Pembayaran Tunai:</strong>
                Setelah menekan tombol kirim di bawah, segera kunjungi loket Tata Usaha (TU) atau kasir Koperasi Siswa untuk menyerahkan uang fisik sebesar <strong>Rp {amount.toLocaleString('id-ID')}</strong>. Petugas akan langsung menyetujui transaksi Anda.
              </div>
            </div>
          )}

          {/* Notes Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Catatan Pengajuan (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Isi saldo jajan minggu ini / saldo pustakawan"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || amount < 5000}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 hover:shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <span>{submitting ? 'Memproses...' : `Kirim Pengajuan (Rp ${amount.toLocaleString('id-ID')})`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
