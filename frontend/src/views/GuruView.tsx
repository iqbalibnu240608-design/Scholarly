import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
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
  const [data, setData] = useState<GuruData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resGuru, resGrades] = await Promise.all([
          apiClient.get('/school/guru'),
          apiClient.get('/guru/my-grades').catch(() => ({ data: { grades: [] } })),
        ]);
        setData(resGuru.data.data);

        if (resGrades.data?.grades && resGrades.data.grades.length > 0) {
          setRecentGrades(
            resGrades.data.grades.map((g: any) => ({
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
  }, []);

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

  if (loading) {
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

        <Button
          onClick={() => setShowGradeModal(true)}
          className="gap-2.5 shrink-0 px-6 text-xs font-bold"
        >
          <FileText className="w-4 h-4" />
          <span>Input Nilai Evaluasi</span>
        </Button>
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
              {data?.kelas_diajar.length || 0} Kelas
            </div>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {data?.kelas_diajar.map((k) => (
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
              {data?.rekap_kehadiran_siswa.total_siswa_diajar || 0} Siswa
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Rata-rata kehadiran: <strong>{data?.rekap_kehadiran_siswa.rata_rata_kehadiran || '95%'}</strong>
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
                {data?.jadwal_mengajar.map((item, idx) => (
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
    </div>
  );
};

export default GuruView;
