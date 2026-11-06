import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
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
} from 'lucide-react';
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
  const { user } = useAuth();
  const [data, setData] = useState<SiswaData | null>(null);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [averageScore, setAverageScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Top Up Modal State
  const [showTopupModal, setShowTopupModal] = useState<boolean>(false);
  const [topupTarget, setTopupTarget] = useState<'kopsis' | 'kantin'>('kantin');
  const [topupAmount, setTopupAmount] = useState<number>(50000);
  const [topupSubmitting, setTopupSubmitting] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    try {
      const [resSiswa, resGrades, resWallet] = await Promise.all([
        apiClient.get('/school/siswa'),
        apiClient.get('/siswa/my-grades').catch(() => ({ data: { grades: [], average_score: 0 } })),
        apiClient.get('/wallet/balance').catch(() => ({ data: null })),
      ]);

      const siswaData = resSiswa.data.data;
      if (resWallet.data?.wallet) {
        siswaData.saldo_digital = {
          saldo_kopsis: Number(resWallet.data.wallet.balance_kopsis),
          saldo_kantin: Number(resWallet.data.wallet.balance_kantin),
        };
      }

      setData(siswaData);
      setGrades(resGrades.data.grades || []);
      setAverageScore(resGrades.data.average_score || 0);
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
  }, [fetchData]);

  // Handle Top Up
  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopupSubmitting(true);
    try {
      const targetNisn = user?.identifier_number || '0061234567';
      await apiClient.post('/wallet/topup', {
        identifier_number: targetNisn,
        amount: topupAmount,
        target_wallet: topupTarget,
        notes: `Top up mandiri ${topupTarget} siswa`,
      });

      await fetchData();
      setShowTopupModal(false);
      toast.success(
        `Top-up Rp ${topupAmount.toLocaleString('id-ID')} ke Saldo ${topupTarget.toUpperCase()} berhasil!`
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal melakukan top-up');
    } finally {
      setTopupSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-sm text-slate-500 font-medium">
        Memuat modul Siswa...
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                NISN: {user?.identifier_number || '0061234567'}
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

      {/* Saldo Digital & SPP Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Saldo Koperasi Siswa */}
        <Card className="border-indigo-100/80 bg-white flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Saldo Koperasi Siswa
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              Rp {(data?.saldo_digital.saldo_kopsis ?? 0).toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Dapat digunakan untuk pembelian ATK & seragam di Kopsis
            </p>

            <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
              <Link to="/app/kopsis" className="flex-1">
                <Button size="sm" className="w-full gap-1.5 text-xs rounded-xl">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Belanja</span>
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setTopupTarget('kopsis');
                  setShowTopupModal(true);
                }}
                className="gap-1 text-xs rounded-xl"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Top Up</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Saldo Kantin Sekolah */}
        <Card className="border-emerald-100/80 bg-white flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Saldo Kantin Sehat
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              Rp {(data?.saldo_digital.saldo_kantin ?? 0).toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Dapat digunakan untuk pemesanan makanan cashless di kantin
            </p>

            <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
              <Link to="/app/kantin" className="flex-1">
                <Button size="sm" variant="success" className="w-full gap-1.5 text-xs rounded-xl">
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>Pesan Menu</span>
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setTopupTarget('kantin');
                  setShowTopupModal(true);
                }}
                className="gap-1 text-xs rounded-xl"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Top Up</span>
              </Button>
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
                {data?.tagihan_spp.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Periode {data?.tagihan_spp.bulan} (Jatuh tempo: {data?.tagihan_spp.jatuh_tempo})
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              {data?.jadwal_hari_ini.length || 0} Pertemuan
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.jadwal_hari_ini.map((j, idx) => (
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
              {data?.presensi_bulan_ini.persentase}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2.5">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                <span className="text-xl font-black text-emerald-700 block">
                  {data?.presensi_bulan_ini.hadir}
                </span>
                <span className="text-[11px] font-bold text-emerald-800">Hadir</span>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-center">
                <span className="text-xl font-black text-blue-700 block">
                  {data?.presensi_bulan_ini.izin}
                </span>
                <span className="text-[11px] font-bold text-blue-800">Izin</span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100 text-center">
                <span className="text-xl font-black text-amber-700 block">
                  {data?.presensi_bulan_ini.sakit}
                </span>
                <span className="text-[11px] font-bold text-amber-800">Sakit</span>
              </div>
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-center">
                <span className="text-xl font-black text-rose-700 block">
                  {data?.presensi_bulan_ini.alpha}
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
        title={`Isi Saldo ${topupTarget === 'kantin' ? 'Kantin Sehat' : 'Koperasi Siswa'}`}
        description="Pilih nominal saldo yang ingin Anda tambahkan ke Saldo E-Wallet Sekolah."
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

          <div className="p-3 rounded-2xl bg-sky-50 border border-sky-100 text-xs text-sky-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
            <span>Saldo ini langsung masuk ke akun Anda dan dapat dipakai belanja secara cashless.</span>
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
    </div>
  );
};

export default SiswaView;
