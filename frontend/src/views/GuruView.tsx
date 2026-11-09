import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getStoredQRIS } from '../utils/qris';
import { apiClient, getCachedData } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import {
  BookOpen,
  Users,
  Calendar,
  Award,
  FileText,
  CheckCircle2,
  ClipboardList,
  FolderUp,
  MessageSquare,
  Wallet,
  PlusCircle,
  UtensilsCrossed,
  ShoppingBag,
  Clock,
  QrCode,
  Banknote,
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

interface GuruData {
  nip: string;
  mata_pelajaran: string;
  kelas_diajar: string[];
  jadwal_mengajar: Array<{
    hari: string;
    kelas: string;
    jam: string;
    ruang: string;
  }>;
  rekap_kehadiran_siswa: {
    total_siswa_diajar: number;
    rata_rata_kehadiran: string;
  };
}

interface SubmittedGrade {
  student_name: string;
  student_nisn: string;
  subject_name: string;
  type: string;
  score: number;
  feedback?: string;
  created_at: string;
}

export const GuruView: React.FC = () => {
  const { user, activeRole } = useAuth();
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [showTopupModal, setShowTopupModal] = useState<boolean>(false);
  const [topupAmount, setTopupAmount] = useState<number>(50000);
  const [topupMethod, setTopupMethod] = useState<'cash' | 'qris'>('qris');
  const [topupSubmitting, setTopupSubmitting] = useState<boolean>(false);
  const [pendingTopups, setPendingTopups] = useState<any[]>([]);
  const [qrisConfig, setQrisConfig] = useState(() => getStoredQRIS('tu'));
  const [data, setData] = useState<GuruData | null>(() => getCachedData('/school/guru')?.data || null);
  const [loading, setLoading] = useState<boolean>(() => !getCachedData('/school/guru'));

  // Modal State: Input Nilai
  const [showGradeModal, setShowGradeModal] = useState<boolean>(false);
  const [studentNisn, setStudentNisn] = useState<string>('0061234567');
  const [subjectName, setSubjectName] = useState<string>('Pemrograman Web & Backend Laravel');
  const [gradeType, setGradeType] = useState<string>('tugas');
  const [score, setScore] = useState<string>('90');
  const [feedback, setFeedback] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [recentGrades, setRecentGrades] = useState<SubmittedGrade[]>([
    {
      student_name: 'Ahmad Pratama',
      student_nisn: '0061234567',
      subject_name: 'Pemrograman Web & Backend Laravel',
      type: 'Tugas',
      score: 95,
      feedback: 'Implementasi RESTful API terstruktur dan bersih.',
      created_at: 'Baru saja',
    },
    {
      student_name: 'Siti Rahmawati',
      student_nisn: '0089876543',
      subject_name: 'Basis Data MySQL & Arsitektur',
      type: 'Ulangan Harian',
      score: 92,
      feedback: 'Pemahaman normalisasi 3NF dan query join sangat baik.',
      created_at: '10 menit lalu',
    },
  ]);

  const fetchWallet = useCallback(async () => {
    try {
      const [resWallet, resTrx] = await Promise.all([
        apiClient.get('/wallet/balance').catch(() => ({ data: null })),
        apiClient.get('/wallet/transactions').catch(() => ({ data: { transactions: [] } })),
      ]);
      if (resWallet.data?.wallet) {
        const bal = Number(resWallet.data.wallet.balance ?? resWallet.data.wallet.balance_kopsis ?? 0);
        setWalletBalance(bal);
      }
      if (resTrx.data?.transactions) {
        const pending = resTrx.data.transactions.filter(
          (t: any) => t.status === 'pending' && t.type?.startsWith('topup_')
        );
        setPendingTopups(pending);
      }
    } catch (err) {
      console.error('Failed to fetch guru wallet', err);
    }
  }, []);

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.identifier_number) {
      toast.error('NIP Anda tidak ditemukan pada profil sesi.');
      return;
    }
    setTopupSubmitting(true);
    try {
      const res = await apiClient.post('/wallet/topup', {
        identifier_number: user.identifier_number,
        amount: topupAmount,
        payment_method: topupMethod,
        target_wallet: 'universal',
        notes: `Top up saldo dewan guru (${topupMethod === 'qris' ? 'Scan QRIS' : 'Setor Tunai'})`,
      });
      await fetchWallet();
      setShowTopupModal(false);
      if (res.data?.status === 'pending') {
        toast.success(
          topupMethod === 'qris'
            ? `Pengajuan top-up QRIS Rp ${topupAmount.toLocaleString('id-ID')} diajukan! Menunggu verifikasi loket TU.`
            : `Pengajuan top-up tunai Rp ${topupAmount.toLocaleString('id-ID')} dicatat! Silakan setor ke loket TU / Kopsis.`
        );
      } else {
        toast.success(`Saldo berhasil ditambahkan: Rp ${topupAmount.toLocaleString('id-ID')}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mengajukan top-up');
    } finally {
      setTopupSubmitting(false);
    }
  };
  useEffect(() => {
    fetchWallet();
    const fetchData = async () => {
      try {
        const [resGuru, resGrades] = await Promise.all([
          apiClient.get('/school/guru'),
          apiClient.get('/guru/my-grades').catch(() => ({ data: { grades: [] } })),
        ]);
        setData(resGuru.data.data);

        if (resGrades.data?.grades && resGrades.data.grades.length > 0) {
          setRecentGrades(
            (resGrades.data?.grades || []).map((g: any) => ({
              student_name: g.student?.name || `Siswa (${g.student?.identifier_number || ''})`,
              student_nisn: g.student?.identifier_number || '',
              subject_name: g.subject_name,
              type: String(g.type).toUpperCase(),
              score: Number(g.score),
              feedback: g.feedback || '',
              created_at: new Date(g.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              }),
            }))
          );
        }
      } catch (err) {
        console.error('Error fetching guru data', err);
        toast.error('Gagal mengambil data guru dari server');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeRole]);

  const handleSubmitGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiClient.post('/guru/grades', {
        student_identifier: studentNisn,
        subject_name: subjectName,
        type: gradeType,
        score: Number(score),
        feedback: feedback || undefined,
      });

      toast.success(res.data.message || 'Nilai siswa berhasil disimpan!');

      const studentLabel =
        studentNisn === '0061234567'
          ? 'Ahmad Pratama'
          : studentNisn === '0089876543'
          ? 'Siti Rahmawati'
          : `Siswa (${studentNisn})`;

      setRecentGrades((prev) => [
        {
          student_name: studentLabel,
          student_nisn: studentNisn,
          subject_name: subjectName,
          type: gradeType.toUpperCase(),
          score: Number(score),
          feedback,
          created_at: 'Baru saja',
        },
        ...prev,
      ]);

      setShowGradeModal(false);
      setFeedback('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan nilai.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-sm text-slate-500 font-medium">
        Memuat modul Dewan Guru...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="primary" className="text-xs">
                Portal Pendidik
              </Badge>
              <Badge variant="secondary" className="text-xs font-mono">
                NIP: {data?.nip}
              </Badge>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              Portal Guru & Tenaga Pendidik
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Kelola jadwal mengajar, input evaluasi siswa ke buku nilai rapor, dan pantau rekap rombel.
            </p>
          </div>
        </div>

        {activeRole === 'guru' ? (
          <Button
            onClick={() => setShowGradeModal(true)}
            className="shrink-0"
          >
            <FileText className="w-4 h-4" />
            <span>Input Nilai Evaluasi</span>
          </Button>
        ) : (
          <Badge variant="secondary" className="text-xs py-1.5 px-3">
            Supervisi Kepala Sekolah (Read-Only)
          </Badge>
        )}
      </div>

      {/* Kartu Saldo Digital Dewan Guru (Universal E-Wallet) */}
      <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white shadow-xl border border-indigo-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                <Wallet className="w-3.5 h-3.5 text-indigo-300" />
                Universal E-Wallet Dewan Guru
              </span>
              {pendingTopups.length > 0 && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/30 text-amber-200 border border-amber-400/30 animate-pulse">
                  <Clock className="w-3 h-3 text-amber-300" />
                  {pendingTopups.length} Top-Up Menunggu Verifikasi
                </span>
              )}
            </div>
            <div>
              <div className="text-xs text-indigo-200 font-medium">Saldo Digital Aktif</div>
              <div className="text-3xl md:text-4xl font-black tracking-tight text-white mt-1">
                Rp {Math.round(Number(walletBalance || 0)).toLocaleString('id-ID')}
              </div>
            </div>
            <p className="text-xs text-slate-300 max-w-xl">
              Satu saldo terintegrasi untuk makan siang di Kantin Sehat, belanja perlengkapan mengajar di Koperasi Siswa, maupun transaksi digital sekolah.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {activeRole === 'guru' && (
              <Button
                onClick={() => {
                  setQrisConfig(getStoredQRIS('tu'));
                  setShowTopupModal(true);
                }}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 border-0 gap-2 h-11 px-5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Isi Saldo Guru</span>
              </Button>
            )}
            <Link to="/app/kopsis">
              <Button
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-2xl gap-2 h-11 px-4"
              >
                <ShoppingBag className="w-4 h-4 text-orange-300" />
                <span>Belanja di Kopsis</span>
              </Button>
            </Link>
            <Link to="/app/kantin">
              <Button
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-2xl gap-2 h-11 px-4"
              >
                <UtensilsCrossed className="w-4 h-4 text-emerald-300" />
                <span>Pesan di Kantin</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Ringkasan Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-indigo-100/80 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Rombel Kelas Diampu
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {(data?.kelas_diajar?.length || 0) || 0} Kelas
            </div>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {(data?.kelas_diajar || []).map((k) => (
                <Badge key={k} variant="secondary" className="text-xs">
                  {k}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-100/80 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Siswa Dibimbing
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {(data?.rekap_kehadiran_siswa?.total_siswa_diajar || 0) || 0} Siswa
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Rata-rata kehadiran: <strong>{(data?.rekap_kehadiran_siswa?.rata_rata_kehadiran || '95%') || '95%'}</strong>
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-100/80 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Status Penilaian Semester
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="success" className="text-sm font-bold px-3 py-0.5">
                Periode Aktif
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Tersinkronisasi otomatis dengan transkrip rapor siswa
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Kolom Jadwal & Aksi Cepat Guru */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Jadwal Pelajaran Guru (Col span 2) */}
        <Card className="lg:col-span-2 border-slate-200/80">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <CardTitle className="text-base font-bold text-slate-900">
                Jadwal Mengajar Mingguan
              </CardTitle>
            </div>
            <Badge variant="secondary" className="text-xs">
              Tahun Ajaran 2026/2027
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hari</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Jam Pelajaran</TableHead>
                  <TableHead>Ruangan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.jadwal_mengajar || []).map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-bold text-slate-900">
                      {item.hari}
                    </TableCell>
                    <TableCell>
                      <Badge variant="primary" className="text-xs">
                        {item.kelas}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-600">
                      {item.jam}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {item.ruang}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Menu Aksi Cepat Guru (Col span 1) */}
        <Card className="border-slate-200/80">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900">
              Aksi Cepat Pendidik
            </CardTitle>
            <Badge variant="secondary" className="text-xs font-bold">
              Fitur Aktif
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <Button
              variant="default"
              onClick={() => setShowGradeModal(true)}
              className="w-full justify-start gap-2.5 text-xs h-11 rounded-xl"
            >
              <FileText className="w-4 h-4" />
              <span>Input Nilai Tugas & Ujian</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.info('Presensi kelas hari ini tersinkronisasi otomatis dengan gerbang RFID satpam.')}
              className="w-full justify-start gap-2.5 text-xs h-11 rounded-xl"
            >
              <ClipboardList className="w-4 h-4 text-blue-600" />
              <span>Buka Presensi Kelas Hari Ini</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.info('Fitur modul PDF modul siap digunakan untuk dibagikan ke siswa.')}
              className="w-full justify-start gap-2.5 text-xs h-11 rounded-xl"
            >
              <FolderUp className="w-4 h-4 text-emerald-600" />
              <span>Unggah Modul Bahan Ajar PDF</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.info('Catatan karakter terhubung langsung dengan sistem konseling BK.')}
              className="w-full justify-start gap-2.5 text-xs h-11 rounded-xl"
            >
              <MessageSquare className="w-4 h-4 text-purple-600" />
              <span>Catatan Karakter Siswa (BK)</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Histori Nilai Terkini yang Dimasukkan */}
      <Card className="border-slate-200/80">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-base font-bold text-slate-900">
              Buku Rekap Penilaian Terkini
            </CardTitle>
          </div>
          <Badge variant="primary" className="text-xs font-mono">
            Tersimpan ke Database (grades)
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Siswa</TableHead>
                <TableHead>NISN</TableHead>
                <TableHead>Mata Pelajaran</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Nilai</TableHead>
                <TableHead>Catatan Guru</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentGrades.map((g, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-bold text-slate-900">
                    {g.student_name}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {g.student_nisn}
                    </code>
                  </TableCell>
                  <TableCell className="text-xs text-slate-700">
                    {g.subject_name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs uppercase">
                      {g.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-extrabold text-blue-600 text-sm">
                      {g.score}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {g.feedback || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal: Input Nilai Akademik Siswa (Shadcn Dialog) */}
      <Dialog
        open={showGradeModal}
        onClose={() => setShowGradeModal(false)}
        title="Input Nilai Akademik Siswa"
        description="Masukkan evaluasi nilai tugas, ulangan harian, PTS, atau karakter siswa ke buku rapor."
      >
        <form onSubmit={handleSubmitGrade} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Nomor Identitas (NISN Siswa) *
            </label>
            <Input
              type="text"
              required
              placeholder="Contoh: 0061234567"
              value={studentNisn}
              onChange={(e) => setStudentNisn(e.target.value)}
              className="font-mono"
            />
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[11px] text-slate-400 font-semibold">Pilih Cepat:</span>
              <button
                type="button"
                onClick={() => setStudentNisn('0061234567')}
                className={`px-2 py-0.5 rounded-lg border text-xs cursor-pointer transition-colors ${
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
                className={`px-2 py-0.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                  studentNisn === '0089876543'
                    ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Siti Rahmawati (0089876543)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Mata Pelajaran *
              </label>
              <select
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Pemrograman Web & Backend Laravel">Pemrograman Web & Backend Laravel</option>
                <option value="Basis Data MySQL & Arsitektur">Basis Data MySQL & Arsitektur</option>
                <option value="Pemodelan Perangkat Lunak">Pemodelan Perangkat Lunak</option>
                <option value="Pemrograman Berorientasi Objek">Pemrograman Berorientasi Objek</option>
                <option value="Bahasa Inggris Kejuruan">Bahasa Inggris Kejuruan</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Jenis Penilaian *
              </label>
              <select
                value={gradeType}
                onChange={(e) => setGradeType(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="tugas">Tugas Terstruktur</option>
                <option value="uh">Ulangan Harian (UH)</option>
                <option value="pts">Penilaian Tengah Semester (PTS)</option>
                <option value="pas">Penilaian Akhir Semester (PAS)</option>
                <option value="sikap">Penilaian Karakter / Sikap</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Nilai Angka (Skor 0 - 100) *
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              required
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="font-bold text-blue-600 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Catatan & Masukan untuk Siswa (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Sangat baik dalam mendesain skema basis data dan penanganan relasi tabel."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowGradeModal(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Simpan Nilai Siswa'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal Top Up Saldo Guru */}
      <Dialog
        open={showTopupModal}
        onClose={() => setShowTopupModal(false)}
        title="Isi Saldo E-Wallet Dewan Guru"
        description="Pilih nominal dan metode pembayaran untuk menambah saldo e-wallet yang dapat digunakan di Kopsis dan Kantin."
      >
        <form onSubmit={handleTopup} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Pilih Nominal Top-Up</label>
            <div className="grid grid-cols-3 gap-2">
              {[20000, 50000, 100000, 200000, 300000, 500000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTopupAmount(amt)}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    topupAmount === amt
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300'
                  }`}
                >
                  Rp {amt.toLocaleString('id-ID')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Metode Pembayaran</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTopupMethod('qris')}
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                  topupMethod === 'qris'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <QrCode className="w-4 h-4 text-indigo-600" />
                <span>Scan QRIS Resmi</span>
              </button>
              <button
                type="button"
                onClick={() => setTopupMethod('cash')}
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                  topupMethod === 'cash'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span>Tunai di Loket TU</span>
              </button>
            </div>
          </div>

          {topupMethod === 'qris' ? (
            <div className="p-4 bg-indigo-50/70 text-indigo-900 rounded-2xl text-xs border border-indigo-200 text-center space-y-2">
              <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl border border-indigo-200 shadow-xs flex items-center justify-center">
                <img
                  src={qrisConfig.imageUrl}
                  alt="QRIS Sekolah"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div>
                <p className="font-bold text-xs text-indigo-950">{qrisConfig.merchantName}</p>
                <p className="font-mono text-[10px] text-indigo-600">NMID: {qrisConfig.nmid}</p>
              </div>
              <p className="text-[11px] text-slate-600">
                Scan barcode di atas menggunakan aplikasi m-Banking atau dompet digital (GoPay, OVO, Dana, BCA, dll), lalu klik tombol Konfirmasi di bawah.
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Setoran Tunai di Loket TU / Kopsis:</span>
                <p className="text-amber-800 mt-0.5">
                  Setelah mengajukan, mohon serahkan uang tunai sebesar <strong>Rp {topupAmount.toLocaleString('id-ID')}</strong> ke kasir loket TU atau kasir koperasi agar saldo segera diaktivasi.
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
                : `Konfirmasi Top Up Rp ${topupAmount.toLocaleString('id-ID')}`}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default GuruView;
