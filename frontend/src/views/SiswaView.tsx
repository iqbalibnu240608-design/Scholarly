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
  Users,
  User,
  IdCard,
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


export interface GradeRecord {
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
  const fetchData = useCallback(async () => {
    try {
      const [resSiswa, resGrades] = await Promise.all([
        apiClient.get('/school/siswa'),
        apiClient.get('/siswa/my-grades').catch(() => ({ data: { grades: [], average_score: 0 } })),
      ]);

      const siswaData = resSiswa.data.data;
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
  }, [fetchData, activeRole]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-sm text-slate-500 font-medium">
        Memuat modul Siswa...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* View Header Info Card (Horizontal Minimalis 3 Kolom) */}
      <div className="bg-white rounded-2xl border border-slate-100 px-6 sm:px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0 shadow-2xs">
        {/* Kolom 1 (Kelas) */}
        <div className="flex items-center gap-3.5 flex-1">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm text-slate-500 block">Kelas</span>
            <span className="text-base font-bold text-slate-800 block">
              {data?.kelas || 'XII RPL 1'}
            </span>
          </div>
        </div>

        {/* Garis Pemisah 1 */}
        <div className="hidden md:block h-10 w-px bg-slate-200 shrink-0 mx-6 lg:mx-8" />

        {/* Kolom 2 (Wali Kelas) */}
        <div className="flex items-center gap-3.5 flex-1">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm text-slate-500 block">Wali Kelas</span>
            <span className="text-base font-bold text-slate-800 block">
              {data?.wali_kelas || 'Budi Santoso, S.Pd'}
            </span>
          </div>
        </div>

        {/* Garis Pemisah 2 */}
        <div className="hidden md:block h-10 w-px bg-slate-200 shrink-0 mx-6 lg:mx-8" />

        {/* Kolom 3 (NISN) */}
        <div className="flex items-center gap-3.5 flex-1">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IdCard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm text-slate-500 block">NISN</span>
            <span className="text-base font-bold text-slate-800 block">
              {user?.identifier_number || '0061234567'}
            </span>
          </div>
        </div>
      </div>

      {/* Informasi Kehadiran & Status SPP (2:1 Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Rekap Kehadiran Siswa */}
        <Card className="md:col-span-2 border-slate-200/80 bg-white shadow-2xs flex flex-col justify-between">
          <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                Kehadiran Bulan Ini
              </CardTitle>
            </div>
            <Badge variant="success" className="text-xs font-semibold whitespace-nowrap shrink-0 px-3 py-1 rounded-full">
              {data?.presensi_bulan_ini?.persentase || '100%'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
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

      {/* Jadwal Pelajaran Hari Ini (Full-Width Card) */}
      <Card className="border-slate-200/80 bg-white shadow-2xs">
        <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              Jadwal Pelajaran Hari Ini
            </CardTitle>
          </div>
          <Badge variant="secondary" className="hidden md:inline-flex text-xs font-semibold whitespace-nowrap shrink-0 px-3 py-1 rounded-full">
            {(data?.jadwal_hari_ini?.length || 0) || 0} Pertemuan
          </Badge>
        </CardHeader>
        <CardContent>
          {(data?.jadwal_hari_ini || []).length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              Tidak ada jadwal pelajaran untuk hari ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {(data?.jadwal_hari_ini || []).map((j, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:shadow-xs transition-all"
                >
                  <div className="px-2.5 py-1 rounded-xl bg-blue-100/80 text-blue-700 text-xs font-bold font-mono shrink-0">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {j.jam}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{j.mapel}</h4>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">
                      <span>Pengajar: {j.guru}</span> • <span>Ruang: {j.ruang}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rekap Nilai Akademik Siswa */}
      <Card className="border-slate-200/80">
        <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              Transkrip Nilai Akademik Siswa
            </CardTitle>
          </div>
          <Badge variant="warning" className="text-xs font-semibold whitespace-nowrap shrink-0 px-3 py-1 rounded-full">
            Rata-rata: {averageScore}
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          {grades.length === 0 ? (
            null
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
    </div>
  );
};

export default SiswaView;
