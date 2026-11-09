import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient, getCachedData } from '../api/client';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  CreditCard,
  CheckCircle2,
  BookOpen,
  Award,
  ShoppingCart,
  UtensilsCrossed,
  PlusCircle,
  GraduationCap,
  Sparkles,
  Wallet,
  ArrowRight,
  QrCode,
  Banknote,
} from 'lucide-react';
import { getStoredQRIS } from '../utils/qris';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
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
    saldo_utama?: number;
    saldo_kopsis: number;
    saldo_kantin: number;
  };
  tagihan_spp: {
    status: string;
    bulan: string;
    jatuh_tempo: string;
  };
}


export interface WalletTransaction {
  id: number;
  reference_no: string;
  type: string;
  amount: number;
  payment_method: string;
  status: 'pending' | 'completed' | 'rejected' | 'failed';
  description: string;
  created_at: string;
  operator?: {
    id: number;
    name: string;
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
  const { user, activeRole } = useAuth();
  const [data, setData] = useState<SiswaData | null>(() => getCachedData('/school/siswa')?.data || null);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [averageScore, setAverageScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(() => !getCachedData('/school/siswa'));

  // Top Up Modal State
  const [showTopupModal, setShowTopupModal] = useState<boolean>(false);
  const [topupAmount, setTopupAmount] = useState<number>(50000);
  const [topupSubmitting, setTopupSubmitting] = useState<boolean>(false);
  const [topupMethod, setTopupMethod] = useState<'cash' | 'qris'>('qris');
  const [qrisConfig, setQrisConfig] = useState(() => getStoredQRIS('tu'));
  const [pendingTopupCount, setPendingTopupCount] = useState<number>(0);

  const fetchData = useCallback(async () => {
    try {
      const [resSiswa, resGrades, resWallet, resTransactions] = await Promise.all([
        apiClient.get('/school/siswa'),
        apiClient.get('/siswa/my-grades').catch(() => ({ data: { grades: [], average_score: 0 } })),
        apiClient.get('/wallet/balance').catch(() => ({ data: null })),
        apiClient.get('/wallet/transactions').catch(() => ({ data: { transactions: [] } })),
      ]);

      const siswaData = resSiswa.data.data;
      if (resWallet.data?.wallet) {
        const unified = Number(resWallet.data.wallet.balance ?? resWallet.data.wallet.balance_kopsis);
        siswaData.saldo_digital = {
          saldo_utama: unified,
          saldo_kopsis: unified,
          saldo_kantin: unified,
        };
      }

      setData(siswaData);
      setGrades(resGrades.data.grades || []);
      setAverageScore(resGrades.data.average_score || 0);

      const trxs: WalletTransaction[] = resTransactions.data?.transactions || [];
      const pendingCount = trxs.filter(
        (t) => t.status === 'pending' && t.type?.startsWith('topup_')
      ).length;
      setPendingTopupCount(pendingCount);
    } catch (err) {
      console.error('Error fetching siswa data', err);
      toast.error('Gagal mengambil data siswa');
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    init();
  }, [fetchData, activeRole]);

  // Handle Top Up
  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.identifier_number) {
      toast.error('Profil NISN Anda tidak ditemukan. Hubungi operator TU.');
      return;
    }
    setTopupSubmitting(true);
    try {
      const res = await apiClient.post('/wallet/topup', {
        identifier_number: user.identifier_number,
        amount: topupAmount,
        payment_method: topupMethod,
        target_wallet: 'universal',
        notes: `Top up mandiri saldo digital siswa (${topupMethod === 'qris' ? 'Scan QRIS' : 'Setor Tunai'})`,
      });

      await fetchData();
      setShowTopupModal(false);
      if (res.data?.status === 'pending') {
        toast.info(
          res.data.message ||
            `Pengajuan top-up Rp ${topupAmount.toLocaleString('id-ID')} diajukan. Menunggu persetujuan petugas loket!`
        );
      } else {
        toast.success(
          `Top-up sebesar Rp ${topupAmount.toLocaleString('id-ID')} ke Saldo Digital Universal berhasil!`
        );
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal melakukan top-up');
    } finally {
      setTopupSubmitting(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-sm text-slate-500 font-medium">
        Memuat modul Siswa...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="primary" className="text-xs">
                Portal Siswa
              </Badge>
              <Badge variant="secondary" className="text-xs font-mono">
                {activeRole === 'siswa' ? `NISN: ${user?.identifier_number || '0061234567'}` : `Akses Pemantauan: ${(activeRole || '').toUpperCase()}`}
              </Badge>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              Portal Akademik & Kehadiran Siswa
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Pantau jadwal kelas, rekap absensi harian, saldo digital cashless, dan buku nilai evaluasi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Badge variant="secondary" className="px-3 py-1 text-xs font-bold">
            Kelas: {data?.kelas}
          </Badge>
          <Badge variant="outline" className="px-3 py-1 text-xs font-semibold">
            Wali: {data?.wali_kelas}
          </Badge>
        </div>
      </div>

      {/* Notifikasi Pengajuan Top-Up Pending */}
      {pendingTopupCount > 0 && activeRole === 'siswa' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-sm block">Pengajuan Top-Up Menunggu Verifikasi & Persetujuan</span>
              <span className="text-slate-700">
                Anda memiliki <strong>{pendingTopupCount} pengajuan top-up</strong> yang sedang menunggu persetujuan kasir. Silakan serahkan setoran tunai ke loket TU atau kasir Koperasi Siswa agar saldo segera aktif.
              </span>
            </div>
          </div>
          <Badge variant="warning" className="text-xs font-bold shrink-0 self-start sm:self-center">
            {pendingTopupCount} Menunggu Verifikasi
          </Badge>
        </div>
      )}

      {/* Saldo Digital & SPP Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 & 2 (Span 2 cols): Saldo Digital Terpadu / Universal E-Wallet */}
        <Card className="md:col-span-2 border-blue-200/80 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 shadow-xs flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Saldo Digital Siswa (Universal E-Wallet)
                </CardTitle>
                <p className="text-[11px] text-slate-500">
                  Satu saldo terpadu untuk semua transaksi di lingkungan sekolah
                </p>
              </div>
            </div>
            <Badge variant="primary" className="text-xs font-bold shrink-0">
              Terhubung ke Kartu Siswa / NISN
            </Badge>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Saldo Aktif
                </span>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-0.5">
                  Rp {Math.round(Number(data?.saldo_digital?.saldo_utama ?? data?.saldo_digital?.saldo_kopsis ?? 0)).toLocaleString('id-ID')}
                </div>
              </div>
              <div className="text-xs text-slate-500 bg-white/80 border border-slate-200/60 rounded-xl px-3 py-1.5 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Bebas belanja di <strong>Koperasi</strong>, jajan di <strong>Kantin</strong>, & administrasi.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-5 pt-3.5 border-t border-slate-100">
              {activeRole === 'siswa' ? (
                <button
                  type="button"
                  onClick={() => { setQrisConfig(getStoredQRIS('tu')); setShowTopupModal(true); }}
                  className="group relative inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs hover:shadow-md hover:shadow-blue-500/25 active:scale-[0.97] transition-all duration-200 cursor-pointer overflow-hidden"
                >
                  <PlusCircle className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:rotate-90 group-hover:scale-110" />
                  <span>Isi Saldo Digital</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-0 -ml-1 transition-all duration-200 group-hover:opacity-100 group-hover:ml-0 group-hover:translate-x-0.5" />
                </button>
              ) : (
                <div className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-semibold">
                  <span>Mode Pemantauan ({(activeRole || '').toUpperCase()})</span>
                </div>
              )}
              <Link to="/app/kopsis" className="w-full">
                <div className="group relative inline-flex items-center justify-center gap-2 w-full px-3.5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200/90 hover:border-indigo-600 font-bold text-xs shadow-2xs hover:shadow-md hover:shadow-indigo-500/20 active:scale-[0.97] transition-all duration-200 cursor-pointer">
                  <div className="w-5 h-5 rounded-lg bg-indigo-100 group-hover:bg-indigo-500/40 flex items-center justify-center transition-colors">
                    <ShoppingCart className="w-3 h-3 text-indigo-700 group-hover:text-white transition-colors" />
                  </div>
                  <span>Belanja di Kopsis</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0 text-indigo-600 group-hover:text-white opacity-0 -ml-1 transition-all duration-200 group-hover:opacity-100 group-hover:ml-0 group-hover:translate-x-0.5" />
                </div>
              </Link>
              <Link to="/app/kantin" className="w-full">
                <div className="group relative inline-flex items-center justify-center gap-2 w-full px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200/90 hover:border-emerald-600 font-bold text-xs shadow-2xs hover:shadow-md hover:shadow-emerald-500/20 active:scale-[0.97] transition-all duration-200 cursor-pointer">
                  <div className="w-5 h-5 rounded-lg bg-emerald-100 group-hover:bg-emerald-500/40 flex items-center justify-center transition-colors">
                    <UtensilsCrossed className="w-3 h-3 text-emerald-700 group-hover:text-white transition-colors" />
                  </div>
                  <span>Pesan di Kantin</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0 text-emerald-600 group-hover:text-white opacity-0 -ml-1 transition-all duration-200 group-hover:opacity-100 group-hover:ml-0 group-hover:translate-x-0.5" />
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Status Pembayaran SPP */}
        <Card className="border-amber-100/80 bg-white flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Status SPP Bulanan
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="success" className="text-sm font-bold px-3 py-0.5">
                {data?.tagihan_spp?.status || 'Lunas'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Periode {data?.tagihan_spp?.bulan || '-'} (Jatuh tempo: {data?.tagihan_spp?.jatuh_tempo || '-'})
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link to="/app/petugas">
                <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs rounded-xl">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Layanan TU & Riwayat SPP</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jadwal & Presensi Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Jadwal Pelajaran */}
        <Card className="border-slate-200/80">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <CardTitle className="text-base font-bold text-slate-900">
                Jadwal Pelajaran Hari Ini
              </CardTitle>
            </div>
            <Badge variant="secondary" className="text-xs">
              {(data?.jadwal_hari_ini?.length || 0) || 0} Pertemuan
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.jadwal_hari_ini || []).map((j, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:shadow-xs transition-all"
              >
                <div className="px-2.5 py-1 rounded-xl bg-blue-100/80 text-blue-700 text-xs font-bold font-mono shrink-0">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  {j.jam}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900">{j.mapel}</h4>
                  <div className="text-xs text-slate-500 mt-0.5">
                    <span>Pengajar: {j.guru}</span> • <span>Ruang: {j.ruang}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Rekap Kehadiran Siswa */}
        <Card className="border-slate-200/80">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <CardTitle className="text-base font-bold text-slate-900">
                Presensi & Kehadiran Bulan Ini
              </CardTitle>
            </div>
            <Badge variant="success" className="text-xs font-bold">
              {data?.presensi_bulan_ini?.persentase || '100%'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2.5">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                <span className="text-xl font-black text-emerald-700 block">
                  {data?.presensi_bulan_ini?.hadir ?? 0}
                </span>
                <span className="text-[11px] font-bold text-emerald-800">Hadir</span>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-center">
                <span className="text-xl font-black text-blue-700 block">
                  {data?.presensi_bulan_ini?.izin ?? 0}
                </span>
                <span className="text-[11px] font-bold text-blue-800">Izin</span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100 text-center">
                <span className="text-xl font-black text-amber-700 block">
                  {data?.presensi_bulan_ini?.sakit ?? 0}
                </span>
                <span className="text-[11px] font-bold text-amber-800">Sakit</span>
              </div>
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-center">
                <span className="text-xl font-black text-rose-700 block">
                  {data?.presensi_bulan_ini?.alpha ?? 0}
                </span>
                <span className="text-[11px] font-bold text-rose-800">Alpha</span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Presensi otomatis terhubung dengan RFID gate gerbang satpam dan absensi kelas guru.</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rekap Nilai Akademik Siswa */}
      <Card className="border-slate-200/80">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <CardTitle className="text-base font-bold text-slate-900">
              Transkrip Nilai Akademik Siswa
            </CardTitle>
          </div>
          <Badge variant="warning" className="text-xs font-bold">
            Rata-rata: {averageScore}
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          {grades.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Belum ada nilai yang diinput oleh guru untuk semester ini.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mata Pelajaran</TableHead>
                  <TableHead>Jenis Evaluasi</TableHead>
                  <TableHead>Nilai Angka</TableHead>
                  <TableHead>Guru Pengampu</TableHead>
                  <TableHead>Catatan / Evaluasi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell className="font-bold text-slate-900">
                      {g.subject_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[11px] uppercase">
                        {g.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono font-black text-blue-600 text-sm">
                        {Number(g.score)}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {g.teacher?.name || 'Guru Pengampu'}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {g.feedback || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal Top Up Saldo Digital (Shadcn Dialog) */}
      <Dialog
        open={showTopupModal}
        onClose={() => setShowTopupModal(false)}
        title="Isi Saldo Digital E-Wallet (Universal)"
        description="Pilih nominal saldo yang ingin ditambahkan. Saldo dapat dipakai belanja di Kantin Sehat, Koperasi Siswa, maupun transaksi sekolah."
      >
        <form onSubmit={handleTopup} className="space-y-4 mt-2">
          <div className="grid grid-cols-3 gap-2">
            {[10000, 20000, 50000, 100000, 150000, 200000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setTopupAmount(amt)}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  topupAmount === amt
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                }`}
              >
                Rp {amt.toLocaleString('id-ID')}
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Pilih Metode Pembayaran</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTopupMethod('qris')}
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  topupMethod === 'qris'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <QrCode className="w-4 h-4 text-blue-600" />
                <span>Scan QRIS Sekolah</span>
              </button>
              <button
                type="button"
                onClick={() => setTopupMethod('cash')}
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  topupMethod === 'cash'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span>Tunai di Loket</span>
              </button>
            </div>
          </div>

          {topupMethod === 'qris' ? (
            <div className="p-4 bg-blue-50/70 text-slate-900 rounded-2xl text-xs border border-blue-200 text-center space-y-2">
              <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl border border-blue-200 shadow-xs flex items-center justify-center">
                <img
                  src={qrisConfig.imageUrl}
                  alt="QRIS Sekolah Resmi"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div>
                <p className="font-bold text-xs text-blue-950">{qrisConfig.merchantName}</p>
                <p className="font-mono text-[10px] text-blue-600">NMID: {qrisConfig.nmid}</p>
              </div>
              <p className="text-[11px] text-slate-600">
                Scan barcode di atas dengan aplikasi m-Banking atau dompet digital (GoPay, OVO, Dana, BCA, dll), lalu klik tombol Ajukan Top Up di bawah.
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">Alur Setoran Tunai di Loket TU / Kopsis:</span>
                <p className="text-amber-800 leading-relaxed">
                  Setelah mengirimkan pengajuan, mohon bayarkan setoran tunai sebesar <strong>Rp {topupAmount.toLocaleString('id-ID')}</strong> ke kasir loket TU atau Koperasi Siswa agar saldo langsung diverifikasi dan aktif.
                </p>
              </div>
            </div>
          )}

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
                ? 'Mengirim Pengajuan...'
                : `Ajukan Top Up Rp ${topupAmount.toLocaleString('id-ID')}`}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default SiswaView;
