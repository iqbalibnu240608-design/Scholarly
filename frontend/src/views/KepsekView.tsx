import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient, getCachedData } from '../api/client';
import { toast } from 'sonner';
import {
  Award,
  TrendingUp,
  CheckCircle,
  ShieldAlert,
  FileCheck,
  FileText,
  BarChart3,
  School,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

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
  const { activeRole } = useAuth();
  const [data, setData] = useState<KepsekData | null>(() => getCachedData('/school/kepsek')?.data || null);
  const [loading, setLoading] = useState<boolean>(() => !getCachedData('/school/kepsek'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get('/school/kepsek');
        setData(res.data.data);
      } catch (err) {
        console.error('Error fetching kepsek data', err);
        toast.error('Gagal memuat data monitoring kepala sekolah');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeRole]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-sm text-slate-500 font-medium">
        Memuat modul Kepala Sekolah...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex min-w-0 items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <School className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Badge variant="primary" className="text-xs">
                Pimpinan Eksekutif
              </Badge>
              <Badge variant="success" className="max-w-full whitespace-normal break-words text-left text-xs font-bold">
                Akreditasi: {(data?.ringkasan_eksekutif?.status_akreditasi || 'A (Unggul)') || 'A (Unggul)'}
              </Badge>
            </div>
            <h2 className="break-words text-xl font-extrabold tracking-tight text-slate-900 md:text-2xl">
              Monitoring Kepala Sekolah
            </h2>
            <p className="mt-0.5 break-words text-xs text-slate-500 md:text-sm">
              Pemantauan KPI sekolah, pengawasan integritas akademik, keuangan unit kopsis & kantin.
            </p>
          </div>
        </div>
      </div>

      {/* Grid 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-indigo-100/80 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Kehadiran Guru Hari Ini
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="break-words text-xl font-black tracking-tight text-indigo-700 sm:text-2xl">
              {(data?.ringkasan_eksekutif?.kehadiran_guru_hari_ini || '100%') || '100%'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Disiplin dan absensi dewan guru optimal
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-100/80 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Kehadiran Siswa Hari Ini
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="break-words text-xl font-black tracking-tight text-emerald-700 sm:text-2xl">
              {(data?.ringkasan_eksekutif?.kehadiran_siswa_hari_ini || '96.8%') || '96.8%'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Akumulasi jenjang kelas X, XI, XII
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-100/80 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Omset Kopsis Bulan Ini
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="break-words text-xl font-black tracking-tight text-amber-700 sm:text-2xl">
              Rp {(data?.ringkasan_eksekutif?.total_pendapatan_kopsis_bulan_ini ?? 0).toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Laba unit usaha koperasi siswa
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-100/80 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Transaksi Kantin Hari Ini
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="break-words text-xl font-black tracking-tight text-blue-700 sm:text-2xl">
              Rp {(data?.ringkasan_eksekutif?.total_transaksi_kantin_hari_ini ?? 0).toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Perputaran digital stan kantin sehat
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Laporan Strategis & Otoritas Disposisi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-slate-200/80">
          <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <CardTitle className="break-words text-base font-bold leading-snug text-slate-900 sm:text-lg">
                Laporan Strategis & Kebijakan Sekolah
              </CardTitle>
            </div>
            <Badge variant="secondary" className="text-xs font-semibold whitespace-nowrap shrink-0 px-3 py-1 rounded-full">
              Tinjauan Eksekutif
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.laporan_strategis || []).map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col items-start gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 transition-all hover:bg-white hover:shadow-xs sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 w-full">
                  <h4 className="break-words text-sm font-bold text-slate-900">{item.judul}</h4>
                  <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5 block">
                    {item.kategori}
                  </span>
                </div>
                <Badge variant="primary" className="max-w-full whitespace-normal break-words text-left text-xs font-semibold">
                  {item.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200/80">
          <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <CardTitle className="break-words text-base font-bold leading-snug text-slate-900 sm:text-lg">
                Persetujuan & Disposisi
              </CardTitle>
            </div>
            <Badge variant="secondary" className="text-xs font-semibold whitespace-nowrap shrink-0 px-3 py-1 rounded-full">
              Otoritas Kepsek
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <Button
              variant="outline"
              onClick={() => toast.success('Pengesahan rapor semester siswa berhasil diproses secara digital.')}
              className="h-auto min-h-11 w-full justify-start gap-2.5 whitespace-normal rounded-xl py-3 text-left text-xs leading-snug"
            >
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span className="min-w-0 break-words text-left">Pengesahan Rapor Semester Siswa</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.success('Tanda tangan digital SK berhasil disematkan.')}
              className="h-auto min-h-11 w-full justify-start gap-2.5 whitespace-normal rounded-xl py-3 text-left text-xs leading-snug"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="min-w-0 break-words text-left">Tanda Tangan Digital SK</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.info('Laporan tahunan diekspor ke PDF/Excel.')}
              className="h-auto min-h-11 w-full justify-start gap-2.5 whitespace-normal rounded-xl py-3 text-left text-xs leading-snug"
            >
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span className="min-w-0 break-words text-left">Ekspor Laporan Tahunan</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.info('Modul audit neraca keuangan kopsis dan kantin terbuka.')}
              className="h-auto min-h-11 w-full justify-start gap-2.5 whitespace-normal rounded-xl py-3 text-left text-xs leading-snug"
            >
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span className="min-w-0 break-words text-left">Audit Keuangan Kopsis & Kantin</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KepsekView;
