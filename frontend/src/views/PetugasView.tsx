import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { toast } from 'sonner';
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
  Building,
  QrCode,
  ClipboardList,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui/table';
import { Dialog } from '../components/ui/dialog';

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

  const fetchSPPHistory = async () => {
    try {
      const res = await apiClient.get('/petugas/spp-history');
      if (res.data?.transactions && res.data.transactions.length > 0) {
        setRecentSPP(
          res.data.transactions.map((t: any) => ({
            reference_no: t.reference_no,
            student_name: t.user?.name || 'Siswa',
            nisn: t.user?.identifier_number || '-',
            month: t.description || 'SPP Bulanan',
            amount: Number(t.amount),
            method:
              t.payment_method === 'wallet'
                ? 'Saldo Digital'
                : t.payment_method === 'cash'
                ? 'Tunai di Loket'
                : t.payment_method === 'qris'
                ? 'QRIS'
                : 'Transfer Bank',
            time: new Date(t.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            }),
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching SPP history', err);
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
      await Promise.all([fetchPetugasData(), fetchStudentData(), fetchWalletBalance(), fetchSPPHistory()]);
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
      toast.success(`Top-up sebesar Rp ${topupAmount.toLocaleString('id-ID')} berhasil ditambahkan!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal melakukan top-up');
    } finally {
      setTopupSubmitting(false);
    }
  };

  // Pay SPP Handler
  const handlePaySPP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'wallet' && walletBalance < Number(sppAmount)) {
      toast.error('Saldo E-Wallet Anda tidak mencukupi. Pilih opsi Virtual Account, Tunai, atau QRIS!');
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

      toast.success(res.data.message || 'Pembayaran SPP berhasil diproses.');
      setStudentSPPStatus('Lunas');
      setShowSPPModal(false);
      await Promise.all([fetchPetugasData(), fetchWalletBalance()]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal memproses pembayaran SPP');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-sm text-slate-500 font-medium">
        Memuat modul Petugas Tata Usaha...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Alert Receipt Notifikasi */}
      {lastReceipt && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3 shadow-xs">
          <Receipt className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <div className="font-extrabold text-sm flex items-center gap-1.5 text-emerald-800">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Kuitansi Pembayaran SPP Resmi: {lastReceipt.reference_no}</span>
            </div>
            <div className="mt-1 text-slate-700 leading-relaxed">
              Pembayaran SPP Bulan <strong>{lastReceipt.month}</strong> sebesar{' '}
              <strong>Rp {Number(lastReceipt.amount).toLocaleString('id-ID')}</strong> ({lastReceipt.method}) untuk {lastReceipt.student} telah terverifikasi lunas di sistem Tata Usaha.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLastReceipt(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAMPILAN 1: STUDENT VIEW (LAYANAN TU & SPP SISWA) */}
      {isStudentView ? (
        <>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 text-white p-6 md:p-8 border border-indigo-900/50 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
              <div>
                <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1 bg-purple-500/20 text-purple-300 rounded-full text-[11px] font-bold mb-2">
                  <Building className="w-3.5 h-3.5" />
                  <span>Tata Usaha & Keuangan SPP</span>
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
                  Layanan Keuangan & Administrasi SPP Siswa
                </h2>
                <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                  Pantau tagihan iuran sekolah dan lakukan pembayaran SPP bulanan mandiri via E-Wallet, Tunai di Loket TU, Virtual Account, atau QRIS.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/10">
                <Wallet className="w-6 h-6 text-purple-300" />
                <div>
                  <div className="text-[11px] text-slate-300 uppercase font-bold tracking-wider">
                    Saldo Digital Anda
                  </div>
                  <div className="text-xl font-black text-purple-300">
                    Rp {walletBalance.toLocaleString('id-ID')}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowTopupModal(true)}
                  className="gap-1.5 ml-2 text-xs rounded-xl bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Isi Saldo</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Kartu Status Tagihan SPP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-indigo-100/80 bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Status Tagihan Bulan Berjalan
                </CardTitle>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <Badge
                  variant={studentSPPStatus === 'Lunas' ? 'success' : 'warning'}
                  className="text-sm font-bold px-3 py-1"
                >
                  {studentSPPStatus} (November 2026)
                </Badge>
                <p className="text-xs text-slate-500 mt-2">
                  Biaya SPP Reguler: Rp 350.000 / bulan
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-100/80 bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Periode Tagihan Berikutnya
                </CardTitle>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  Desember 2026
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Jatuh tempo pada tanggal 10 Desember 2026
                </p>
              </CardContent>
            </Card>

            <Card className="border-emerald-100/80 bg-white flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Aksi Pembayaran
                </CardTitle>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-500 mb-3">
                  Pilih cara pembayaran: E-Wallet, VA Bank, Tunai, atau QRIS
                </p>
                <Button
                  onClick={() => {
                    setSppMonth('Desember 2026');
                    setShowSPPModal(true);
                  }}
                  className="w-full gap-2 text-xs rounded-xl"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Bayar SPP Sekarang</span>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Riwayat Pembayaran SPP Siswa */}
          <Card className="border-slate-200/80">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <CardTitle className="text-base font-bold text-slate-900">
                  Riwayat Pembayaran SPP & Kuitansi Digital
                </CardTitle>
              </div>
              <Badge variant="secondary" className="text-xs">
                Arsip Resmi TU
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Kuitansi</TableHead>
                    <TableHead>Periode Bulan</TableHead>
                    <TableHead>Nominal</TableHead>
                    <TableHead>Metode Pembayaran</TableHead>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSPP.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono text-xs font-bold text-purple-700">
                        {item.reference_no}
                      </TableCell>
                      <TableCell className="font-bold text-slate-900">
                        {item.month}
                      </TableCell>
                      <TableCell className="font-mono font-semibold text-slate-800">
                        Rp {item.amount.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {item.method}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {item.time}
                      </TableCell>
                      <TableCell>
                        <Badge variant="success" className="text-xs font-bold">
                          LUNAS
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : (
        /* TAMPILAN 2: PETUGAS TU & ADMIN DASHBOARD */
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="primary" className="text-xs">
                    Tata Usaha & Administrasi
                  </Badge>
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Portal Petugas TU & Administrasi
                </h2>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                  Kelola persuratan, verifikasi pembayaran SPP sekolah, dan inventaris sarana prasarana.
                </p>
              </div>
            </div>

            <Button
              onClick={() => setShowSPPModal(true)}
              className="shrink-0"
            >
              <CreditCard className="w-4 h-4" />
              <span>Input Pembayaran SPP</span>
            </Button>
          </div>

          {/* Metric Cards Petugas TU */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-purple-100/80 bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Surat Masuk Hari Ini
                </CardTitle>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {data?.administrasi_surat.surat_masuk_hari_ini ?? 0} Surat
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {data?.administrasi_surat.disposisi_pending ?? 0} disposisi kepala sekolah pending
                </p>
              </CardContent>
            </Card>

            <Card className="border-emerald-100/80 bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Penerimaan SPP Bulan Ini
                </CardTitle>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-emerald-700 tracking-tight">
                  Rp {(data?.keuangan_spp.penerimaan_bulan_ini ?? 0).toLocaleString('id-ID')}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {data?.keuangan_spp.total_siswa_lunas ?? 0} siswa terverifikasi lunas
                </p>
              </CardContent>
            </Card>

            <Card className="border-indigo-100/80 bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Inventaris Lab Komputer
                </CardTitle>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {data?.inventaris_sekolah.total_komputer_lab ?? 0} Unit
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {data?.inventaris_sekolah.kondisi_baik ?? 0} siap pakai, {data?.inventaris_sekolah.dalam_perbaikan ?? 0} perbaikan
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Riwayat Pembayaran SPP Masuk */}
          <Card className="border-slate-200/80">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Riwayat Transaksi Pembayaran SPP Terbaru
                </CardTitle>
              </div>
              <Badge variant="primary" className="text-xs font-bold">
                {recentSPP.length} Transaksi
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Referensi</TableHead>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead>NISN</TableHead>
                    <TableHead>Bulan SPP</TableHead>
                    <TableHead>Nominal</TableHead>
                    <TableHead>Metode</TableHead>
                    <TableHead>Waktu Input</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSPP.map((spp, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono text-xs font-bold text-blue-600">
                        {spp.reference_no}
                      </TableCell>
                      <TableCell className="font-bold text-slate-900">
                        {spp.student_name}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {spp.nisn}
                        </code>
                      </TableCell>
                      <TableCell className="font-bold text-slate-800">
                        {spp.month}
                      </TableCell>
                      <TableCell className="font-mono font-semibold text-slate-800">
                        Rp {spp.amount.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {spp.method}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {spp.time}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Modal Top Up Saldo Digital (Shadcn Dialog) */}
      <Dialog
        open={showTopupModal}
        onClose={() => setShowTopupModal(false)}
        title="Isi Saldo Digital Siswa"
        description="Pilih nominal saldo yang ingin Anda tambahkan untuk pembayaran SPP / administrasi sekolah."
      >
        <form onSubmit={handleTopup} className="space-y-4 mt-2">
          <div className="grid grid-cols-3 gap-2">
            {[50000, 100000, 200000, 350000, 500000, 700000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setTopupAmount(amt)}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  topupAmount === amt
                    ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-purple-300'
                }`}
              >
                Rp {amt.toLocaleString('id-ID')}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowTopupModal(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={topupSubmitting}>
              {topupSubmitting
                ? 'Memproses...'
                : `Konfirmasi Top Up Rp ${topupAmount.toLocaleString('id-ID')}`}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal Pembayaran SPP (Shadcn Dialog) */}
      <Dialog
        open={showSPPModal}
        onClose={() => setShowSPPModal(false)}
        title={isStudentView ? 'Pembayaran SPP Mandiri' : 'Loket Pembayaran SPP Siswa'}
        description="Pilih metode pembayaran dan konfirmasi data tagihan SPP."
      >
        <form onSubmit={handlePaySPP} className="space-y-4 mt-2">
          {!isStudentView ? (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Identitas Siswa (NISN) *
              </label>
              <Input
                type="text"
                value={studentNisn}
                onChange={(e) => setStudentNisn(e.target.value)}
                placeholder="Masukkan NISN Siswa..."
                required
                className="font-mono"
              />
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[11px] text-slate-400 font-semibold">Pilih Cepat:</span>
                <button
                  type="button"
                  onClick={() => setStudentNisn('0061234567')}
                  className={`px-2 py-0.5 rounded-lg border text-xs cursor-pointer ${
                    studentNisn === '0061234567'
                      ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  Ahmad Pratama (0061234567)
                </button>
                <button
                  type="button"
                  onClick={() => setStudentNisn('0089876543')}
                  className={`px-2 py-0.5 rounded-lg border text-xs cursor-pointer ${
                    studentNisn === '0089876543'
                      ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  Siti Rahmawati (0089876543)
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 text-xs space-y-1">
              <div className="font-bold text-purple-900 text-sm">Data Siswa:</div>
              <div className="text-slate-700">Nama: <strong>{user?.name || 'Ahmad Pratama'}</strong></div>
              <div className="text-slate-700">NISN: <code>{user?.identifier_number || '0061234567'}</code></div>
              <div className="mt-2 text-purple-800 font-bold">
                Saldo E-Wallet Anda: Rp {walletBalance.toLocaleString('id-ID')}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Bulan Periode SPP
              </label>
              <select
                value={sppMonth}
                onChange={(e) => setSppMonth(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="November 2026">November 2026</option>
                <option value="Desember 2026">Desember 2026</option>
                <option value="Januari 2027">Januari 2027</option>
                <option value="Februari 2027">Februari 2027</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nominal (Rp) *
              </label>
              <Input
                type="number"
                value={sppAmount}
                onChange={(e) => setSppAmount(e.target.value)}
                placeholder="Contoh: 350000"
                required
                className="font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Pilih Metode Pembayaran:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('wallet')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  paymentMethod === 'wallet'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Saldo E-Wallet</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Tunai di Loket TU</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  paymentMethod === 'transfer'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Virtual Account</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('qris')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  paymentMethod === 'qris'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>QRIS Pendidikan</span>
              </button>
            </div>
          </div>

          {paymentMethod === 'transfer' && (
            <div className="p-3 bg-blue-50 text-blue-800 rounded-xl text-xs border border-blue-200">
              <Building className="w-4 h-4 inline mr-1 text-blue-600" />{' '}
              <strong>Nomor Virtual Account:</strong>{' '}
              <code>88001{user?.identifier_number || '0061234567'}</code> (Bank BNI / Mandiri / BRI).
            </div>
          )}

          {paymentMethod === 'qris' && (
            <div className="p-3 bg-indigo-50 text-indigo-800 rounded-xl text-xs border border-indigo-200 text-center">
              <QrCode className="w-8 h-8 mx-auto text-indigo-600 mb-1" />
              <p className="font-bold">QRIS Pembayaran SPP Sekolah Resmi</p>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Catatan Tambahan (Opsional)
            </label>
            <Input
              type="text"
              value={sppNotes}
              onChange={(e) => setSppNotes(e.target.value)}
              placeholder="Catatan..."
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSPPModal(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? 'Memproses...'
                : `Konfirmasi Bayar Rp ${Number(sppAmount).toLocaleString('id-ID')}`}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default PetugasView;
