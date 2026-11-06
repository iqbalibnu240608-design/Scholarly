import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { BookOpen, Users, Calendar, Award, Check, X, FileText, CheckCircle2, ClipboardList, FolderUp, MessageSquare } from 'lucide-react';
import './EcosystemModals.css';

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
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
        const res = await apiClient.get('/school/guru');
        setData(res.data.data);
      } catch (err) {
        console.error('Error fetching guru data', err);
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

      setSuccessMsg(res.data.message);
      setTimeout(() => setSuccessMsg(null), 3500);

      const studentLabel = studentNisn === '0061234567' ? 'Ahmad Pratama' : studentNisn === '0089876543' ? 'Siti Rahmawati' : `Siswa (${studentNisn})`;
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
      alert(err.response?.data?.message || 'Gagal menyimpan nilai.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-container">Memuat modul Guru...</div>;

  return (
    <div className="view-container">
      {/* Header Halaman */}
      <div className="view-header">
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><BookOpen size={24} style={{ color: '#356df3' }} /> Portal Guru & Tenaga Pendidik</h2>
          <p>Kelola jadwal mengajar, input nilai siswa ke database rapor, dan pantau rekapitulasi rombel.</p>
        </div>
        <div className="header-meta">
          <span className="info-chip">NIP: {data?.nip}</span>
          <span className="info-chip">Mapel: {data?.mata_pelajaran}</span>
        </div>
      </div>

      {/* Alert Notifikasi Berhasil */}
      {successMsg && (
        <div className="p-3 mb-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center gap-2">
          <Check size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Ringkasan Statistik */}
      <div className="grid-cards-3">
        <div className="feature-card">
          <div className="card-top-icon text-indigo-600">
            <BookOpen size={22} />
          </div>
          <h4>Rombel Kelas Diampu</h4>
          <div className="amount-display">{data?.kelas_diajar.length} Kelas</div>
          <div className="flex gap-1 mt-2">
            {data?.kelas_diajar.map((k) => (
              <span key={k} className="badge-pill text-xs">{k}</span>
            ))}
          </div>
        </div>

        <div className="feature-card">
          <div className="card-top-icon text-emerald-600">
            <Users size={22} />
          </div>
          <h4>Total Siswa Dibimbing</h4>
          <div className="amount-display">{data?.rekap_kehadiran_siswa.total_siswa_diajar} Siswa</div>
          <p className="card-subtext">Rata-rata kehadiran: {data?.rekap_kehadiran_siswa.rata_rata_kehadiran}</p>
        </div>

        <div className="feature-card">
          <div className="card-top-icon text-amber-600">
            <Award size={22} />
          </div>
          <h4>Penilaian Semester</h4>
          <div className="amount-display text-amber-700">Aktif</div>
          <p className="card-subtext">Sinkron dengan database penilaian akademik</p>
        </div>
      </div>

      {/* Kolom Jadwal & Aksi Cepat Guru */}
      <div className="overview-columns mt-6">
        {/* Jadwal Pelajaran Guru */}
        <div className="overview-card">
          <div className="card-header">
            <h3>
              <Calendar size={18} className="inline mr-2 text-indigo-600" />
              Jadwal Mengajar Mingguan
            </h3>
            <span className="badge-pill">Tahun Ajaran 2026/2027</span>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Hari</th>
                  <th>Kelas</th>
                  <th>Jam Pelajaran</th>
                  <th>Ruangan</th>
                </tr>
              </thead>
              <tbody>
                {data?.jadwal_mengajar.map((item, idx) => (
                  <tr key={idx}>
                    <td><strong>{item.hari}</strong></td>
                    <td><span className="badge-pill">{item.kelas}</span></td>
                    <td>{item.jam}</td>
                    <td>{item.ruang}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Menu Aksi Cepat Guru */}
        <div className="overview-card">
          <div className="card-header">
            <h3>Aksi Cepat Guru</h3>
            <span className="badge-pill">Fitur Aktif</span>
          </div>
          <div className="action-buttons-list">
            <button
              onClick={() => setShowGradeModal(true)}
              className="btn-action bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold hover:bg-indigo-100"
            >
              <FileText size={16} /> <span>Input Nilai Ulangan Harian / Tugas / PTS</span>
            </button>
            <button
              onClick={() => alert('Presensi kelas hari ini tersinkronisasi otomatis dengan gerbang satpam.')}
              className="btn-action"
            >
              <ClipboardList size={16} /> <span>Buka Presensi Kelas Hari Ini</span>
            </button>
            <button
              onClick={() => alert('Fitur repositori modul PDF siap diintegrasikan.')}
              className="btn-action"
            >
              <FolderUp size={16} /> <span>Unggah Modul & Bahan Ajar PDF</span>
            </button>
            <button
              onClick={() => alert('Catatan karakter terhubung dengan sistem konseling BK.')}
              className="btn-action"
            >
              <MessageSquare size={16} /> <span>Catatan Karakter Siswa (Terhubung ke BK)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Input Nilai Akademik Siswa */}
      {showGradeModal && (
        <div className="eco-modal-backdrop">
          <div className="eco-modal-card">
            <div className="eco-modal-header">
              <h3>
                <FileText size={18} className="text-indigo-600" />
                Input Nilai Akademik Siswa
              </h3>
              <button onClick={() => setShowGradeModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitGrade} className="eco-modal-form">
              <div className="eco-modal-body">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nomor Identitas (NISN Siswa) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 0061234567"
                    value={studentNisn}
                    onChange={(e) => setStudentNisn(e.target.value)}
                    className="w-full p-2 border rounded text-xs bg-white"
                  />
                  <div className="quick-preset-container">
                    <span className="text-[11px] text-slate-500">Pilih Cepat Siswa:</span>
                    <button
                      type="button"
                      onClick={() => setStudentNisn('0061234567')}
                      className={`quick-preset-btn ${studentNisn === '0061234567' ? 'active' : ''}`}
                    >
                      Ahmad Pratama (0061234567)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStudentNisn('0089876543')}
                      className={`quick-preset-btn ${studentNisn === '0089876543' ? 'active' : ''}`}
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
                      className="w-full p-2 border rounded text-xs bg-white"
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
                      className="w-full p-2 border rounded text-xs bg-white"
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
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-full p-2 border rounded text-xs bg-white font-bold text-indigo-700"
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
                    className="w-full p-2 border rounded text-xs bg-white"
                  />
                </div>
              </div>

              <div className="eco-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowGradeModal(false)}
                  className="btn-secondary-action"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary-action"
                  style={{ opacity: submitting ? 0.6 : 1 }}
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Nilai'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabel Histori Nilai Terkini yang Dimasukkan */}
      <div className="overview-card mt-6">
        <div className="card-header">
          <h3>
            <CheckCircle2 size={18} className="inline mr-2 text-indigo-600" />
            Buku Rekap Penilaian Terkini (MySQL: `grades`)
          </h3>
          <span className="badge-pill bg-indigo-50 text-indigo-700">Tersimpan ke Database</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama Siswa</th>
                <th>NISN</th>
                <th>Mata Pelajaran</th>
                <th>Jenis</th>
                <th>Nilai</th>
                <th>Catatan Guru</th>
              </tr>
            </thead>
            <tbody>
              {recentGrades.map((g, idx) => (
                <tr key={idx}>
                  <td><strong>{g.student_name}</strong></td>
                  <td><code>{g.student_nisn}</code></td>
                  <td>{g.subject_name}</td>
                  <td><span className="badge-pill text-xs">{g.type}</span></td>
                  <td>
                    <span className="font-extrabold text-indigo-700 text-sm">{g.score}</span>
                  </td>
                  <td className="text-xs text-slate-600">{g.feedback || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
