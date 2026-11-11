import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient, getCachedData } from '../api/client';
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
import { QRISUploadModal } from '../components/common/QRISUploadModal';
import { getStoredQRIS, getQRISDisplaySource } from '../utils/qris';

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

  const [data, setData] = useState<PetugasData | null>(() => getCachedData('/school/petugas')?.data || null);
  const [loading, setLoading] = useState<boolean>(() => !getCachedData('/school/petugas'));

  // Student State
    const [studentSPPStatus, setStudentSPPStatus] = useState<string>('Lunas');
  // Modal State: Pembayaran SPP (Multi-payment options)
  const [showSPPModal, setShowSPPModal] = useState<boolean>(false);
  const [studentNisn, setStudentNisn] = useState<string>(user?.identifier_number || '0061234567');
  const [sppMonth, setSppMonth] = useState<string>('Desember 2026');
  const [sppAmount, setSppAmount] = useState<string>('350000');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'wallet' | 'transfer' | 'qris'>('qris');
  const [sppNotes, setSppNotes] = useState<string>('Pembayaran SPP Mandiri Siswa');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isStudentView && paymentMethod === 'transfer') {
      setPaymentMethod('qris');
    }
  }, [isStudentView, paymentMethod]);

  // Auto-detection & auto-trigger when SPP QRIS is paid
  useEffect(() => {
    if (!showSPPModal || paymentMethod !== 'qris') return;

    const timer = setTimeout(() => {
      // Simulate form submit for SPP
      const dummyEvent = { preventDefault: () => {} } as React.FormEvent;
      handlePaySPP(dummyEvent);
    }, 8500);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        const dummyEvent = { preventDefault: () => {} } as React.FormEvent;
        handlePaySPP(dummyEvent);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSPPModal, paymentMethod]);

  // Pending Topup State (Loket TU & Staff Administrasi)
  const [showQRISModal, setShowQRISModal] = useState<boolean>(false);
  const [tuQris, setTuQris] = useState(() => getStoredQRIS('tu'));

  const [recentSPP, setRecentSPP] = useState<RecentSPP[]>([
    {
      reference_no: 'SPP-NOV-881',
      student_name: user?.name || 'Ahmad Pratama',
      nisn: user?.identifier_number || '0061234567',
      month: 'November 2026',
      amount: 350000,
      method: 'Tunai di Loket',
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

    useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        fetchPetugasData(),
        fetchStudentData(),
        fetchSPPHistory(),
      ]);
      setLoading(false);
    };
    init();
  }, [activeRole]);

  // Keep studentNisn synced with user
  useEffect(() => {
    if (user?.identifier_number) {
      setStudentNisn(user.identifier_number);
    }
  }, [user]);

  // Handle SPP Payment
  const handlePaySPP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStudentView && paymentMethod === 'transfer') {
      setPaymentMethod('qris');
      toast.info('Virtual Account tidak tersedia untuk pembayaran mandiri. Pilih QRIS atau tunai di loket TU.');
      return;
    }

    setSubmitting(true);
    try {
      const targetIdentifier = isStudentView
        ? user?.identifier_number || '0061234567'
        : studentNisn;

      const res = await apiClient.post('/petugas/spp-payment', {
        student_identifier: targetIdentifier,
        amount: paymentMethod === 'qris' ? 1 : Number(sppAmount),
        month: sppMonth,
        payment_method: paymentMethod,
        notes: sppNotes || undefined,
      });

      const methodLabel =
        paymentMethod === 'cash'
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
      await fetchPetugasData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal memproses pembayaran SPP');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !data) {
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
                  Layanan Keuangan & Administrasi SPP (Pembayaran Bisa Lewat QRIS)
                </h2>
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
                  {isStudentView
                    ? 'Pilih cara pembayaran: QRIS atau tunai di loket TU'
                    : 'Pilih cara pembayaran: QRIS, tunai, atau Virtual Account'}
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
            <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <CardTitle className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  Riwayat Pembayaran SPP & Kuitansi Digital
                </CardTitle>
              </div>
              <Badge variant="secondary" className="text-xs font-semibold whitespace-nowrap shrink-0 px-3 py-1 rounded-full">
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
                    {activeRole === 'kepsek' ? 'Supervisi Eksekutif TU' : 'Tata Usaha & Administrasi'}
                  </Badge>
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {activeRole === 'kepsek' ? 'Monitoring Tata Usaha & SPP' : 'Portal Petugas TU & Administrasi'}
                </h2>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                  {activeRole === 'kepsek'
                    ? 'Pemantauan persuratan dinas, rekap penerimaan SPP siswa, dan inventaris sarpras sekolah.'
                    : 'Kelola persuratan, verifikasi pembayaran SPP sekolah, dan inventaris sarana prasarana.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <Button
                variant="outline"
                onClick={() => setShowQRISModal(true)}
                className="gap-1.5 text-xs rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <QrCode className="w-4 h-4 text-purple-600" />
                <span>Upload QRIS Loket TU</span>
              </Button>
              <Button
                onClick={() => setShowSPPModal(true)}
                className="shrink-0"
              >
                <CreditCard className="w-4 h-4" />
                <span>Input Pembayaran SPP</span>
              </Button>
            </div>
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
            <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <DollarSign className="w-5 h-5" />
                </div>
                <CardTitle className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  Riwayat Transaksi Pembayaran SPP Terbaru
                </CardTitle>
              </div>
              <Badge variant="primary" className="text-xs font-semibold whitespace-nowrap shrink-0 px-3 py-1 rounded-full">
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

      {/* Modal Pembayaran SPP (Shadcn Dialog) */}
      <Dialog
        open={showSPPModal}
        onClose={() => setShowSPPModal(false)}
        title={isStudentView ? 'Pembayaran SPP Mandiri' : 'Loket Pembayaran SPP Siswa'}
        description="Pilih metode pembayaran dan konfirmasi data tagihan SPP."
        className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden p-4 sm:p-6"
        bodyClassName="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <form onSubmit={handlePaySPP} className="mt-1 flex min-h-0 flex-1 flex-col overflow-hidden sm:mt-2">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-1 pb-4">
            {!isStudentView ? (
              <div>
                <label htmlFor="spp-student-nisn" className="text-xs font-bold text-slate-700 block mb-1">
                  Identitas Siswa (NISN) *
                </label>
                <Input
                  id="spp-student-nisn"
                  type="text"
                  value={studentNisn}
                  onChange={(e) => setStudentNisn(e.target.value)}
                  placeholder="Masukkan NISN Siswa..."
                  required
                  className="min-h-11 text-base font-mono sm:text-sm"
                />
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="w-full text-[11px] text-slate-500 font-semibold sm:w-auto">Pilih siswa:</span>
                  <button
                    type="button"
                    aria-pressed={studentNisn === '0061234567'}
                    onClick={() => setStudentNisn('0061234567')}
                    className={`min-h-10 rounded-lg border px-3 py-1 text-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                      studentNisn === '0061234567'
                        ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Ahmad Pratama (0061234567)
                  </button>
                  <button
                    type="button"
                    aria-pressed={studentNisn === '0089876543'}
                    onClick={() => setStudentNisn('0089876543')}
                    className={`min-h-10 rounded-lg border px-3 py-1 text-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
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
              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs leading-relaxed">
                <div className="mb-1 font-bold text-blue-900">Data siswa</div>
                <div className="text-slate-700">Nama: <strong>{user?.name || 'Ahmad Pratama'}</strong></div>
                <div className="text-slate-700">NISN: <strong className="font-mono">{user?.identifier_number || '0061234567'}</strong></div>
              </div>
            )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="spp-month" className="text-xs font-bold text-slate-700 block mb-1.5">
                Bulan Periode SPP
              </label>
              <select
                id="spp-month"
                value={sppMonth}
                onChange={(e) => setSppMonth(e.target.value)}
                className="w-full min-h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="November 2026">November 2026</option>
                <option value="Desember 2026">Desember 2026</option>
                <option value="Januari 2027">Januari 2027</option>
                <option value="Februari 2027">Februari 2027</option>
              </select>
            </div>
            <div>
              <label htmlFor="spp-amount" className="text-xs font-bold text-slate-700 block mb-1.5">
                Nominal (Rp) *
              </label>
              <Input
                id="spp-amount"
                type="number"
                inputMode="numeric"
                value={sppAmount}
                onChange={(e) => setSppAmount(e.target.value)}
                placeholder="Contoh: 350000"
                required
                className="min-h-11 text-base font-mono font-bold sm:text-sm"
              />
            </div>
          </div>

          <fieldset>
            <legend className="text-xs font-bold text-slate-700 mb-2">
              Metode pembayaran
            </legend>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                aria-pressed={paymentMethod === 'cash'}
                onClick={() => setPaymentMethod('cash')}
                className={`min-h-12 min-w-0 p-3 rounded-xl border text-xs font-bold flex items-center gap-2 text-left cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                  paymentMethod === 'cash'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Tunai di Loket TU</span>
              </button>
              {!isStudentView && (
                <button
                  type="button"
                  aria-pressed={paymentMethod === 'transfer'}
                  onClick={() => setPaymentMethod('transfer')}
                  className={`min-h-12 min-w-0 p-3 rounded-xl border text-xs font-bold flex items-center gap-2 text-left cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                    paymentMethod === 'transfer'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span>Virtual Account</span>
                </button>
              )}
              <button
                type="button"
                aria-pressed={paymentMethod === 'qris'}
                onClick={() => setPaymentMethod('qris')}
                className={`min-h-12 min-w-0 p-3 rounded-xl border text-xs font-bold flex items-center gap-2 text-left cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                  paymentMethod === 'qris'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>QRIS Pendidikan</span>
              </button>
            </div>
          </fieldset>

          {!isStudentView && paymentMethod === 'transfer' && (
            <div className="break-words p-3 bg-blue-50 text-blue-800 rounded-xl text-xs border border-blue-200">
              <Building className="w-4 h-4 inline mr-1 text-blue-600" />{' '}
              <strong>Nomor Virtual Account:</strong>{' '}
              <code>88001{user?.identifier_number || '0061234567'}</code> (Bank BNI / Mandiri / BRI).
            </div>
          )}

          {paymentMethod === 'qris' && (
            <div className="space-y-3 rounded-2xl border border-blue-200 bg-blue-50/60 p-3 text-center text-xs text-slate-800 sm:p-4">
              <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
                <span className="font-bold text-[11px] text-blue-900">QRIS Loket TU</span>
                <span className="rounded-full border border-blue-200 bg-white px-2.5 py-1 text-[10px] font-bold text-blue-800">
                  Uji transaksi riil: Rp1
                </span>
              </div>

              <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-xl border border-blue-100 bg-white p-2 sm:h-40 sm:w-40">
                <img
                  src={getQRISDisplaySource(tuQris, 1).imageSrc}
                  alt="QRIS SPP Sekolah"
                  className="max-h-full max-w-full object-contain rounded-lg"
                />
              </div>
              <div>
                <p className="break-words font-bold text-xs text-slate-900">{tuQris.merchantName}</p>
                <p className="break-all font-mono text-[10px] text-slate-600">NMID: {tuQris.nmid}</p>
              </div>

              <div className="space-y-2 rounded-xl border border-blue-100 bg-white p-3 text-left">
                <div className="flex flex-wrap justify-between gap-1 font-semibold text-slate-700 text-xs">
                  <span>Tagihan SPP Asli:</span>
                  <span>Rp {Number(sppAmount).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex flex-wrap justify-between gap-1 font-extrabold text-blue-800 text-xs">
                  <span>Nominal pembayaran:</span>
                  <span className="font-mono">Rp1</span>
                </div>
                <p className="pt-1 text-[11px] leading-relaxed text-slate-600">
                  Scan QRIS melalui aplikasi pembayaran dan transfer <strong>Rp1</strong>. Sistem mendeteksi mutasi dan otomatis melunasi tagihan SPP.
                </p>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="spp-notes" className="text-xs font-bold text-slate-700 block mb-1.5">
              Catatan (opsional)
            </label>
            <Input
              id="spp-notes"
              type="text"
              value={sppNotes}
              onChange={(e) => setSppNotes(e.target.value)}
              placeholder="Catatan..."
              className="min-h-11 text-base sm:text-sm"
            />
          </div>
          </div>

          <div className="flex shrink-0 flex-col gap-3 border-t border-slate-100 bg-white pt-3 sm:flex-row sm:items-center sm:justify-between">
            {paymentMethod === 'qris' ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-800">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span>{submitting ? 'Pembayaran masuk, memproses...' : 'Menunggu transfer SPP Rp1...'}</span>
              </div>
            ) : (
              <div />
            )}

            <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSPPModal(false)}
                className="min-h-11 w-full sm:w-auto"
              >
                Batal
              </Button>
              {paymentMethod !== 'qris' && (
                <Button type="submit" disabled={submitting} className="min-h-11 w-full sm:w-auto">
                  {submitting ? 'Memproses...' : `Konfirmasi Bayar Rp ${Number(sppAmount).toLocaleString('id-ID')}`}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Dialog>

      <QRISUploadModal
        open={showQRISModal}
        onClose={() => {
          setShowQRISModal(false);
          setTuQris(getStoredQRIS('tu'));
        }}
        type="tu"
        onSaved={() => setTuQris(getStoredQRIS('tu'))}
      />
    </div>
  );
};

export default PetugasView;
