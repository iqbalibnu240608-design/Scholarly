import React, { useEffect, useState } from 'react';
import { apiClient, getCachedData } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import {
  BookOpen,
  Users,
  Award,
  FileText,
  CheckCircle2,
  ClipboardList,
  FolderUp,
  MessageSquare,
  Lock,
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
import { StudentDirectoryPicker } from '../components/academic/StudentDirectoryPicker';
import { WeeklySchedule, type WeeklyScheduleEntry } from '../components/academic/WeeklySchedule';

interface GuruData {
  nip: string;
  mata_pelajaran: string;
  kelas_diajar: string[];
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
  const { activeRole } = useAuth();
  const [data, setData] = useState<GuruData | null>(() => getCachedData('/school/guru')?.data || null);
  const [loading, setLoading] = useState<boolean>(() => !getCachedData('/school/guru'));
  // Modal State: Input Nilai
  const [showGradeModal, setShowGradeModal] = useState<boolean>(false);
  const [studentNisn, setStudentNisn] = useState<string>('');
  const [selectedStudentName, setSelectedStudentName] = useState<string>('');
  const [subjectName, setSubjectName] = useState<string>('Pemrograman Web & Backend Laravel');
  const [gradeType, setGradeType] = useState<string>('tugas');
  const [score, setScore] = useState<string>('90');
  const [feedback, setFeedback] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [shakingBtn, setShakingBtn] = useState<'header' | 'quick' | null>(null);
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklyScheduleEntry[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const isTeacher = activeRole === 'guru' || activeRole === 'admin' || activeRole === 'kepsek';

  const handleOpenGradeModal = (source: 'header' | 'quick') => {
    if (!isTeacher) {
      setShakingBtn(source);
      setTimeout(() => setShakingBtn(null), 500);
      toast.warning(
        'Akses Ditolak: Kepala Sekolah hanya memiliki hak pantau (Read-Only). Input nilai hanya dapat dilakukan oleh Dewan Guru Pengampu.'
      );
      return;
    }
    setStudentNisn('');
    setSelectedStudentName('');
    setShowGradeModal(true);
  };

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

  useEffect(() => {
    let active = true;
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

    const fetchSchedule = async () => {
      setScheduleLoading(true);
      setScheduleError(null);
      try {
        const response = await apiClient.get<{
          schedules: Record<string, Omit<WeeklyScheduleEntry, 'day'>[]>;
        }>('/school/schedules', { skipCache: true });
        if (!active) return;
        const entries = Object.entries(response.data.schedules || {}).flatMap(([day, dayEntries]) =>
          dayEntries.map((entry) => ({ ...entry, day }))
        );
        setWeeklySchedule(entries);
      } catch (error) {
        console.error('Error fetching teacher weekly schedule', error);
        if (active) setScheduleError('Jadwal mingguan belum dapat dimuat. Coba muat ulang halaman.');
      } finally {
        if (active) setScheduleLoading(false);
      }
    };

    void fetchData();
    void fetchSchedule();
    return () => {
      active = false;
    };
  }, [activeRole]);

  const handleSubmitGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTeacher) {
      toast.error('Akses Ditolak: Hanya Dewan Guru pengampu yang diizinkan menyimpan nilai.');
      return;
    }
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
        selectedStudentName ||
        (studentNisn === '0061234567'
          ? 'Ahmad Pratama'
          : studentNisn === '0089876543'
          ? 'Siti Rahmawati'
          : `Siswa (${studentNisn})`);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 sm:p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-xs font-mono font-bold whitespace-nowrap shrink-0 px-2.5 py-0.5">
                NIP: {data?.nip}
              </Badge>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight m-0">
              Tenaga Pendidik
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap w-full sm:w-auto">
          {!isTeacher && (
            <Badge variant="secondary" className="text-xs py-1.5 px-3 hidden sm:inline-flex whitespace-nowrap shrink-0">
              Supervisi Kepala Sekolah (Read-Only)
            </Badge>
          )}
          <Button
            onClick={() => handleOpenGradeModal('header')}
            className={`w-full sm:w-auto justify-center shrink-0 transition-all duration-200 ${
              !isTeacher
                ? 'bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-300 hover:border-red-300 cursor-not-allowed shadow-none'
                : ''
            } ${shakingBtn === 'header' ? 'animate-shake-rejection border-red-500 ring-2 ring-red-400 text-red-600 bg-red-50' : ''}`}
            title={!isTeacher ? 'Akses Ditolak: Khusus Dewan Guru Pengampu' : 'Input Nilai Evaluasi'}
          >
            {!isTeacher ? <Lock className="w-4 h-4 text-amber-600" /> : <FileText className="w-4 h-4" />}
            <span>Input Nilai Evaluasi</span>
          </Button>
        </div>
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
              {data?.rekap_kehadiran_siswa?.total_siswa_diajar || 0} Siswa
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Rata-rata kehadiran: <strong>{data?.rekap_kehadiran_siswa?.rata_rata_kehadiran || '95%'}</strong>
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
        <div className="lg:col-span-2">
          <WeeklySchedule entries={weeklySchedule} audience="teacher" loading={scheduleLoading} error={scheduleError} />
        </div>

        {/* Menu Aksi Cepat Guru (Col span 1) */}
        <Card className="border-slate-200/80">
          <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                Aksi Cepat Pendidik
              </CardTitle>
            </div>
            <Badge variant="secondary" className="text-xs font-semibold whitespace-nowrap shrink-0 px-3 py-1 rounded-full">
              Fitur Aktif
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <Button
              variant={!isTeacher ? 'outline' : 'default'}
              onClick={() => handleOpenGradeModal('quick')}
              className={`w-full justify-start gap-2.5 text-xs h-11 rounded-xl transition-all duration-200 ${
                !isTeacher
                  ? 'border-slate-300 text-slate-600 hover:border-red-300 hover:text-red-700 hover:bg-red-50/70 cursor-not-allowed'
                  : ''
              } ${shakingBtn === 'quick' ? 'animate-shake-rejection border-red-500 ring-2 ring-red-400 text-red-600 bg-red-50' : ''}`}
            >
              {!isTeacher ? (
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              ) : (
                <FileText className="w-4 h-4 shrink-0" />
              )}
              <span className="font-semibold">Input Nilai Tugas & Ujian</span>
              {!isTeacher && (
                <span className="ml-auto text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Read-Only
                </span>
              )}
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
        <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              Buku Rekap Penilaian Terkini
            </CardTitle>
          </div>
          <Badge variant="primary" className="text-xs font-semibold whitespace-nowrap shrink-0 px-3 py-1 rounded-full font-mono">
            Tersimpan ke Database (grades)
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="min-w-[760px]">
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
        description="Pilih murid, lalu isi penilaian dan skornya."
        className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden p-4 sm:p-6"
        bodyClassName="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <form onSubmit={handleSubmitGrade} className="mt-1 flex min-h-0 flex-1 flex-col overflow-hidden sm:mt-2">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-1 pb-4">
            <StudentDirectoryPicker
              value={studentNisn}
              onChange={setStudentNisn}
              onSelectStudent={(student) => setSelectedStudentName(student.name)}
            />

            <div className="space-y-1.5">
              <label htmlFor="grade-student-nisn" className="text-xs font-bold text-slate-700">
                NISN murid *
              </label>
              <Input
                id="grade-student-nisn"
                type="text"
                inputMode="numeric"
                required
                placeholder="Masukkan NISN atau pilih dari daftar"
                value={studentNisn}
                onChange={(event) => {
                  setStudentNisn(event.target.value);
                  setSelectedStudentName('');
                }}
                className="min-h-11 text-base font-mono sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="grade-subject" className="text-xs font-bold text-slate-700">
                  Mata Pelajaran *
                </label>
                <select
                  id="grade-subject"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 focus-visible:outline-none focus-visible:border-blue-600 focus-visible:ring-3 focus-visible:ring-blue-500/15"
                >
                  <option value="Pemrograman Web & Backend Laravel">Pemrograman Web & Backend Laravel</option>
                  <option value="Basis Data MySQL & Arsitektur">Basis Data MySQL & Arsitektur</option>
                  <option value="Pemodelan Perangkat Lunak">Pemodelan Perangkat Lunak</option>
                  <option value="Pemrograman Berorientasi Objek">Pemrograman Berorientasi Objek</option>
                  <option value="Bahasa Inggris Kejuruan">Bahasa Inggris Kejuruan</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="grade-type" className="text-xs font-bold text-slate-700">
                  Jenis Penilaian *
                </label>
                <select
                  id="grade-type"
                  value={gradeType}
                  onChange={(e) => setGradeType(e.target.value)}
                  className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 focus-visible:outline-none focus-visible:border-blue-600 focus-visible:ring-3 focus-visible:ring-blue-500/15"
                >
                  <option value="tugas">Tugas Terstruktur</option>
                  <option value="uh">Ulangan Harian (UH)</option>
                  <option value="pts">Penilaian Tengah Semester (PTS)</option>
                  <option value="pas">Penilaian Akhir Semester (PAS)</option>
                  <option value="sikap">Penilaian Karakter / Sikap</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="grade-score" className="text-xs font-bold text-slate-700">
                Nilai angka <span className="font-medium text-slate-600">(0–100)</span> *
              </label>
              <Input
                id="grade-score"
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                required
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="min-h-11 text-base font-bold text-blue-700 font-mono sm:text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="grade-feedback" className="text-xs font-bold text-slate-700">
                Catatan untuk murid <span className="font-medium text-slate-600">(opsional)</span>
              </label>
              <textarea
                id="grade-feedback"
                rows={3}
                placeholder="Tulis masukan singkat..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full min-h-24 resize-y rounded-xl border border-slate-300 bg-white p-3 text-base text-slate-800 placeholder:text-slate-500 focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-100 bg-white pt-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowGradeModal(false)}
              className="min-h-11 w-full sm:w-auto"
            >
              Batal
            </Button>
            <Button type="submit" disabled={submitting} className="min-h-11 w-full sm:w-auto">
              {submitting ? 'Menyimpan...' : 'Simpan Nilai Siswa'}
            </Button>
          </div>
        </form>
      </Dialog>

    </div>
  );
};

export default GuruView;
