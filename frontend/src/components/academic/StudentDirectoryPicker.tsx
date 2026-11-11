import React, { useEffect, useId, useState } from 'react';
import { Search } from 'lucide-react';
import { apiClient } from '../../api/client';
import { Input } from '../ui/input';

export interface StudentDirectoryStudent {
  name: string;
  identifier_number: string;
  academic_class?: {
    id: number;
    name: string;
    grade: string;
  } | null;
}

interface StudentDirectoryClass {
  id: number;
  name: string;
  grade: string;
}

interface StudentDirectoryResponse {
  students: StudentDirectoryStudent[];
  classes: StudentDirectoryClass[];
}

interface StudentDirectoryPickerProps {
  value: string;
  onChange: (identifier: string) => void;
  onSelectStudent?: (student: StudentDirectoryStudent) => void;
}

export const StudentDirectoryPicker: React.FC<StudentDirectoryPickerProps> = ({ value, onChange, onSelectStudent }) => {
  const [classId, setClassId] = useState('');
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState<StudentDirectoryStudent[]>([]);
  const [classes, setClasses] = useState<StudentDirectoryClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const classSelectId = useId();
  const searchInputId = useId();

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      setStudents([]);
      try {
        const params: { class_id?: string; search?: string } = {};
        if (classId) params.class_id = classId;
        if (search.trim()) params.search = search.trim();

        const response = await apiClient.get<StudentDirectoryResponse>('/school/students', { params, skipCache: true });
        if (!active) return;
        setClasses(response.data.classes);
        setStudents(classId || search.trim() ? response.data.students : []);
      } catch (requestError) {
        console.error('Error fetching student directory', requestError);
        if (active) {
          setStudents([]);
          setError('Daftar murid belum dapat dimuat. Coba lagi atau masukkan NISN secara langsung.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }, search.trim() ? 250 : 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [classId, search, refreshKey]);

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
      <div>
        <p className="text-sm font-bold text-slate-800">Cari murid berdasarkan kelas</p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
          Pilih kelas atau cari nama/NISN, lalu pilih murid untuk mengisi NISN.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor={classSelectId} className="text-xs font-semibold text-slate-700">Kelas</label>
          <select
            id={classSelectId}
            value={classId}
            onChange={(event) => {
              setClassId(event.target.value);
              setSearch('');
              setStudents([]);
              onChange('');
            }}
            className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 focus-visible:outline-none focus-visible:border-blue-600 focus-visible:ring-3 focus-visible:ring-blue-500/15"
          >
            <option value="">Semua kelas</option>
            {classes.map((studentClass) => (
              <option key={studentClass.id} value={studentClass.id}>
                {studentClass.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor={searchInputId} className="text-xs font-semibold text-slate-700">Nama atau NISN</label>
          <div className="relative">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              id={searchInputId}
              value={search}
              maxLength={100}
              onChange={(event) => {
                setSearch(event.target.value);
                setStudents([]);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') event.preventDefault();
              }}
              placeholder="Contoh: Ahmad atau 0061234567"
              className="min-h-11 pl-9 pr-3 text-base sm:text-sm"
            />
          </div>
        </div>
      </div>

      {loading && (
        <p className="text-xs font-medium text-slate-600" role="status">Memuat daftar murid...</p>
      )}

      {error && (
        <div className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <p role="alert">{error}</p>
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            className="min-h-10 shrink-0 rounded-lg border border-amber-300 bg-white px-3 font-semibold text-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Coba lagi
          </button>
        </div>
      )}

      {!loading && !error && (classId || search.trim()) && students.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-xs text-slate-600">
          Murid tidak ditemukan. Periksa kelas atau kata kunci.
        </p>
      )}

      {!loading && !error && students.length > 0 && (
        <div className="max-h-48 space-y-1 overflow-y-auto overscroll-contain rounded-lg border border-slate-200 bg-white p-1">
          {students.map((student) => (
            <button
              key={student.identifier_number}
              type="button"
              aria-pressed={value === student.identifier_number}
              onClick={() => {
                onChange(student.identifier_number);
                onSelectStudent?.(student);
              }}
              className={`flex min-h-12 w-full min-w-0 items-center justify-between gap-3 rounded-md px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 ${
                value === student.identifier_number
                  ? 'bg-blue-50 text-blue-900'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{student.name}</span>
                <span className="block font-mono text-xs text-slate-600">{student.identifier_number || 'NISN belum tersedia'}</span>
              </span>
              <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                {student.academic_class?.name || 'Belum ada kelas'}
              </span>
            </button>
          ))}
          {students.length === 100 && (
            <p className="px-3 py-2 text-[11px] text-slate-600">
              Menampilkan maksimal 100 hasil. Perjelas kelas atau kata kunci.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
