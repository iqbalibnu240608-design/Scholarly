import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
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
  LogOut,
  SunMedium,
  CheckCircle2,
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
  check_out_time?: string | null;
  status: 'hadir' | 'terlambat' | 'izin' | 'sakit' | 'alpha';
  minutes_late: number;
  notes?: string;
  type?: 'datang' | 'pulang';
  session?: 'pagi' | 'siang';
  user?: {
    name: string;
    identifier_number: string;
    role_name: string;
  };
  verifier?: {
    name: string;
  };
  checkOutVerifier?: {
    name: string;
  };
}

export const SecurityView: React.FC = () => {
  const { activeRole } = useAuth();
  const [logs, setLogs] = useState<AttendanceLog[]>([
    {
      id: 1,
      date: '2026-11-10',
      check_in_time: '06:48 WIB',
      check_out_time: '14:05 WIB',
      status: 'hadir',
      minutes_late: 0,
      notes: 'Tepat Waktu via RFID Gerbang Utama • Pulang: 14:05 WIB',
      type: 'pulang',
      session: 'pagi',
      user: { name: 'Ahmad Pratama', identifier_number: '0061234567', role_name: 'siswa' },
      verifier: { name: 'Pak Joko (Satpam Pos)' },
      checkOutVerifier: { name: 'Pak Joko (Satpam Pos)' },
    },
    {
      id: 2,
      date: '2026-11-10',
      check_in_time: '07:14 WIB',
      check_out_time: null,
      status: 'terlambat',
      minutes_late: 14,
      notes: 'Kendaraan bocor ban (piket pembinaan)',
      type: 'datang',
      session: 'pagi',
      user: { name: 'Siti Rahmawati', identifier_number: '0089876543', role_name: 'siswa' },
      verifier: { name: 'Pak Joko (Satpam Pos)' },
    },
  ]);

  const [stats, setStats] = useState({
    total_masuk: 42,
    tepat_waktu: 39,
    terlambat: 3,
    total_pulang: 28,
  });

  // Form State
  const [studentNisn, setStudentNisn] = useState<string>('0061234567');
  const [scanning, setScanning] = useState<boolean>(false);
  const [checkinResult, setCheckinResult] = useState<{
    success: boolean;
    studentName: string;
    type: 'datang' | 'pulang';
    status: string;
    notes: string;
    checkInTime: string;
    checkOutTime?: string | null;
    session?: string;
  } | null>(null);

  const fetchTodayLogs = async () => {
    try {
      const res = await apiClient.get('/security/today-logs');
      if (res.data && Array.isArray(res.data.logs)) {
        setLogs(res.data.logs);
        setStats(
          res.data.stats || {
            total_masuk: res.data.logs.length,
            tepat_waktu: res.data.logs.filter((l: any) => l.status === 'hadir').length,
            terlambat: res.data.logs.filter((l: any) => l.status === 'terlambat').length,
            total_pulang: res.data.logs.filter((l: any) => !!l.check_out_time).length,
          }
        );
      }
    } catch (err) {
      console.warn('Backend security logs offline or syncing, using offline demo logs', err);
    }
  };

  useEffect(() => {
    fetchTodayLogs();
  }, [activeRole]);

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    setScanning(true);
    try {
      const res = await apiClient.post('/security/gate-checkin', {
        identifier_number: studentNisn,
      });

      const att = res.data.attendance;
      const std = res.data.student;
      const actionType: 'datang' | 'pulang' = res.data.type || (att.check_out_time ? 'pulang' : 'datang');

      setCheckinResult({
        success: true,
        studentName: std.name,
        type: actionType,
        status: att.status,
        notes: att.notes || (actionType === 'pulang' ? 'Presensi Pulang Selesai' : 'Tepat Waktu'),
        checkInTime: att.check_in_time,
        checkOutTime: att.check_out_time,
        session: res.data.session,
      });

      if (actionType === 'pulang') {
        toast.success(
          `Presensi Pulang Berhasil: ${std.name} pukul ${att.check_out_time || 'sekarang'} (Datang: ${att.check_in_time})`
        );
      } else {
        toast.success(
          att.status === 'hadir'
            ? `Presensi Datang: ${std.name} tepat waktu (${att.check_in_time})`
            : `Presensi Datang Terlambat: ${std.name} (${att.check_in_time})`
        );
      }

      await fetchTodayLogs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'NISN / Kartu tidak terdaftar.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="primary" className="text-xs">
                Keamanan & Presensi
              </Badge>
              <Badge variant="success" className="text-xs font-bold">
                Pos Utama: Gerbang A
              </Badge>
              <Badge variant="secondary" className="text-xs font-medium text-slate-600">
                Pagi (Maks. 07:00) • Cut-off 11:59 Datang Siang
              </Badge>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              Portal Keamanan & Gate Presensi RFID
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Pencatatan ganda otomatis: Scan pertama Datang, Scan kedua Pulang. Melewati 11:59 otomatis masuk Sesi Datang Siang.
            </p>
          </div>
        </div>
      </div>

      {/* Ringkasan Metrik Gerbang Hari Ini (4 Kolom Lengkap) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
              Gerbang dibuka 06:15 WIB
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
              Masuk sebelum 07:00 WIB
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-100/80 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Terlambat Pagi
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
              Masuk setelah 07:00 WIB
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-100/80 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Presensi Pulang
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-blue-700 tracking-tight">
              {stats.total_pulang} Siswa
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Sudah tap kartu kepulangan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Form Check-In Gerbang Utama */}
      <Card className="border-slate-200/80">
        <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ScanLine className="w-5 h-5" />
            </div>
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              Pemindaian Kartu Gerbang (RFID / Input NISN)
            </CardTitle>
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <Badge variant="secondary" className="text-xs font-semibold whitespace-nowrap shrink-0 px-3 py-1 rounded-full">
              Batas Datang Pagi: 07:00 WIB
            </Badge>
            <Badge variant="primary" className="text-xs font-semibold whitespace-nowrap shrink-0 px-3 py-1 rounded-full">
              <SunMedium className="w-3.5 h-3.5 mr-1" />
              Cut-off Siang: 11:59 WIB
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Alert Hasil Scan Terbaru (Datang vs Pulang) */}
          {checkinResult && (
            <div
              className={`p-4 rounded-2xl flex items-start gap-3 border transition-all ${
                checkinResult.type === 'pulang'
                  ? 'bg-blue-50/90 border-blue-200 text-blue-950'
                  : checkinResult.status === 'hadir'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              {checkinResult.type === 'pulang' ? (
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <LogOut className="w-4 h-4" />
                </div>
              ) : checkinResult.status === 'hadir' ? (
                <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-extrabold text-sm text-slate-900">
                    {checkinResult.studentName}
                  </h4>
                  <Badge
                    variant={
                      checkinResult.type === 'pulang'
                        ? 'primary'
                        : checkinResult.status === 'hadir'
                        ? 'success'
                        : 'warning'
                    }
                    className="text-xs uppercase font-black"
                  >
                    {checkinResult.type === 'pulang'
                      ? 'PRESENSI PULANG'
                      : checkinResult.status === 'hadir'
                      ? 'PRESENSI DATANG (TEPAT WAKTU)'
                      : 'PRESENSI DATANG (TERLAMBAT)'}
                  </Badge>
                  {checkinResult.session && (
                    <Badge variant="secondary" className="text-[11px] capitalize">
                      Sesi {checkinResult.session}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs mt-1.5 flex-wrap">
                  <span className="font-medium">
                    Jam Kedatangan: <strong className="font-mono">{checkinResult.checkInTime}</strong>
                  </span>
                  {checkinResult.checkOutTime && (
                    <span className="font-medium text-blue-700">
                      • Jam Kepulangan: <strong className="font-mono">{checkinResult.checkOutTime}</strong>
                    </span>
                  )}
                  <span className="text-slate-500">• {checkinResult.notes}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCheckinResult(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                aria-label="Tutup notifikasi presensi"
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
                className="shrink-0 h-10 px-6 gap-2 text-xs font-bold tracking-wide"
              >
                <ScanLine className="w-4 h-4 shrink-0" />
                <span>
                  {scanning ? 'Memeriksa...' : 'Catat Presensi Gerbang'}
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

      {/* Tabel Log Kedatangan & Kepulangan Gerbang Hari Ini */}
      <Card className="border-slate-200/80">
        <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <History className="w-5 h-5" />
            </div>
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              Log Presensi Gerbang Hari Ini (Datang & Pulang)
            </CardTitle>
          </div>
          <Badge variant="primary" className="text-xs font-semibold whitespace-nowrap shrink-0 px-3 py-1 rounded-full font-mono">
            {logs.length} Riwayat Presensi Hari Ini
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Belum ada data presensi hari ini. Silakan catat presensi siswa di atas.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead>NISN</TableHead>
                    <TableHead>Jam Datang</TableHead>
                    <TableHead>Jam Pulang</TableHead>
                    <TableHead>Status / Sesi</TableHead>
                    <TableHead>Keterangan / Tindak Lanjut</TableHead>
                    <TableHead>Petugas Pos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <TableCell className="font-bold text-slate-900">
                        {log.user?.name || 'Siswa'}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {log.user?.identifier_number}
                        </code>
                      </TableCell>
                      <TableCell className="font-mono font-semibold text-slate-800 text-xs">
                        {log.check_in_time}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.check_out_time ? (
                          <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            {log.check_out_time}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Belum Pulang</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          <Badge
                            variant={log.status === 'hadir' ? 'success' : 'warning'}
                            className="text-[11px] font-bold"
                          >
                            {log.status === 'hadir' ? 'Datang: Tepat Waktu' : `Terlambat ${log.minutes_late}m`}
                          </Badge>
                          {log.check_out_time && (
                            <Badge variant="primary" className="text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Pulang Selesai
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 max-w-[240px]">
                        {log.notes || '-'}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                        <div>
                          <span>Masuk: {log.verifier?.name || 'Satpam Pos'}</span>
                          {log.checkOutVerifier && (
                            <div className="text-[10px] text-slate-400">
                              Pulang: {log.checkOutVerifier.name}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityView;
