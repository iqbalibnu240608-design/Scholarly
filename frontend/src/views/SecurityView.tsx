import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { toast } from 'sonner';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  ScanLine,
  X,
  History,
  Shield,
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

interface AttendanceLog {
  id: number;
  date: string;
  check_in_time: string;
  status: 'hadir' | 'terlambat' | 'izin' | 'sakit' | 'alpha';
  minutes_late: number;
  notes?: string;
  user?: {
    name: string;
    identifier_number: string;
    role_name: string;
  };
  verifier?: {
    name: string;
  };
}

export const SecurityView: React.FC = () => {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [stats, setStats] = useState({ total_masuk: 0, tepat_waktu: 0, terlambat: 0 });
  const [loading, setLoading] = useState<boolean>(true);

  // Form State
  const [studentNisn, setStudentNisn] = useState<string>('0061234567');
  const [scanning, setScanning] = useState<boolean>(false);
  const [checkinResult, setCheckinResult] = useState<{
    success: boolean;
    studentName: string;
    status: string;
    notes: string;
    checkInTime: string;
  } | null>(null);

  const fetchTodayLogs = async () => {
    try {
      const res = await apiClient.get('/security/today-logs');
      setLogs(res.data.logs || []);
      setStats(res.data.stats || { total_masuk: 0, tepat_waktu: 0, terlambat: 0 });
    } catch (err) {
      console.error('Error fetching security logs', err);
      toast.error('Gagal mengambil riwayat presensi gerbang');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchTodayLogs();
      setLoading(false);
    };
    init();
  }, []);

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    setScanning(true);
    try {
      const res = await apiClient.post('/security/gate-checkin', {
        identifier_number: studentNisn,
      });

      const att = res.data.attendance;
      const std = res.data.student;

      setCheckinResult({
        success: true,
        studentName: std.name,
        status: att.status,
        notes: att.notes || 'Tepat Waktu',
        checkInTime: att.check_in_time,
      });

      toast.success(
        att.status === 'hadir'
          ? `Presensi Berhasil: ${std.name} tepat waktu (${att.check_in_time})`
          : `Presensi Terlambat: ${std.name} (${att.check_in_time})`
      );

      await fetchTodayLogs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'NISN / Kartu tidak terdaftar.');
    } finally {
      setScanning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-sm text-slate-500 font-medium">
        Memuat modul Keamanan Gerbang...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="primary" className="text-xs">
                Keamanan & Presensi
              </Badge>
              <Badge variant="success" className="text-xs font-bold">
                Pos Utama: Gerbang A
              </Badge>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              Portal Keamanan & Gate Presensi RFID
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Verifikasi kedatangan siswa, pemindaian kartu RFID/NISN, dan pencatatan keterlambatan.
            </p>
          </div>
        </div>
      </div>

      {/* Ringkasan Metrik Gerbang Hari Ini */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-indigo-100/80 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Siswa Masuk
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-indigo-700 tracking-tight">
              {stats.total_masuk} Siswa
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Gerbang dibuka mulai jam 06:15 WIB
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-100/80 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Hadir Tepat Waktu
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-700 tracking-tight">
              {stats.tepat_waktu} Siswa
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Masuk sebelum batas 07:00 WIB
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-100/80 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Terlambat Hari Ini
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-amber-700 tracking-tight">
              {stats.terlambat} Siswa
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Otomatis tercatat untuk evaluasi piket / BK
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Form Check-In Gerbang Utama */}
      <Card className="border-slate-200/80">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanLine className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-base font-bold text-slate-900">
              Pemindaian Kartu Gerbang (RFID / Input NISN)
            </CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs font-bold">
            Batas Masuk: 07:00 WIB
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Alert Hasil Scan Terbaru */}
          {checkinResult && (
            <div
              className={`p-4 rounded-2xl flex items-start gap-3 border transition-all ${
                checkinResult.status === 'hadir'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              {checkinResult.status === 'hadir' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h4 className="font-bold text-sm">
                  {checkinResult.studentName} —{' '}
                  <span
                    className={
                      checkinResult.status === 'hadir'
                        ? 'text-emerald-700 font-extrabold'
                        : 'text-amber-700 font-extrabold'
                    }
                  >
                    {checkinResult.status === 'hadir' ? 'TEPAT WAKTU' : 'TERLAMBAT'}
                  </span>
                </h4>
                <p className="text-xs mt-1">
                  Waktu Kedatangan: <strong>{checkinResult.checkInTime}</strong> • {checkinResult.notes}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCheckinResult(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <form onSubmit={handleCheckin} className="space-y-3">
            <label className="text-xs font-bold text-slate-700 block">
              Tempelkan Kartu RFID Siswa atau Masukkan NISN:
            </label>
            <div className="flex flex-wrap gap-3">
              <Input
                type="text"
                required
                placeholder="Contoh: 0061234567"
                value={studentNisn}
                onChange={(e) => setStudentNisn(e.target.value)}
                className="font-mono text-sm flex-1 min-w-[180px]"
              />
              <Button
                type="submit"
                disabled={scanning}
                className="shrink-0 h-9 px-6 gap-1.5 text-[9.5px] font-bold tracking-wide"
              >
                <ScanLine className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[9.5px] font-bold leading-none">
                  {scanning ? 'Memeriksa...' : 'Catat Presensi'}
                </span>
              </Button>
            </div>

            <div className="flex items-center gap-1.5 pt-1 flex-wrap">
              <span className="text-[11px] text-slate-400 font-semibold">Pilih Cepat Siswa Demo:</span>
              <button
                type="button"
                onClick={() => setStudentNisn('0061234567')}
                className={`px-4 py-1.5 rounded-full border text-xs cursor-pointer transition-colors ${
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
                className={`px-4 py-1.5 rounded-full border text-xs cursor-pointer transition-colors ${
                  studentNisn === '0089876543'
                    ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Siti Rahmawati (0089876543)
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tabel Log Kedatangan Gerbang Hari Ini */}
      <Card className="border-slate-200/80">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-base font-bold text-slate-900">
              Log Kedatangan Gerbang Hari Ini
            </CardTitle>
          </div>
          <Badge variant="primary" className="text-xs font-mono">
            {logs.length} Riwayat Presensi
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Belum ada data presensi hari ini. Silakan catat presensi siswa di atas.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Siswa</TableHead>
                  <TableHead>NISN</TableHead>
                  <TableHead>Jam Kedatangan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Keterangan / Tindak Lanjut</TableHead>
                  <TableHead>Petugas Pos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-bold text-slate-900">
                      {log.user?.name || 'Siswa'}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {log.user?.identifier_number}
                      </code>
                    </TableCell>
                    <TableCell className="font-mono font-semibold text-slate-700">
                      {log.check_in_time}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={log.status === 'hadir' ? 'success' : 'warning'}
                        className="text-xs font-bold"
                      >
                        {log.status === 'hadir' ? 'Tepat Waktu' : `Terlambat ${log.minutes_late}m`}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {log.notes || '-'}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {log.verifier?.name || 'Satpam Pos'}
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

export default SecurityView;
