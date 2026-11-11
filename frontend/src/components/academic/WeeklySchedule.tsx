import React, { useEffect, useId, useState } from 'react';
import { CalendarDays, Clock3, MapPin, Users } from 'lucide-react';

export interface WeeklyScheduleEntry {
  day: string;
  time_slot: string;
  subject_name: string;
  room: string;
  teacher?: {
    name: string;
  } | null;
  academic_class?: {
    name: string;
  } | null;
}

interface WeeklyScheduleProps {
  entries: WeeklyScheduleEntry[];
  audience: 'teacher' | 'student';
  loading?: boolean;
  error?: string | null;
}

const WEEKDAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const TODAY_BY_INDEX = ['Minggu', ...WEEKDAYS];
const TODAY = TODAY_BY_INDEX[new Date().getDay()];

const getStartMinutes = (timeSlot: string) => {
  const match = timeSlot.match(/\d{1,2}:\d{2}/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  const [hours, minutes] = match[0].split(':').map(Number);
  return hours * 60 + minutes;
};

export const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({ entries, audience, loading = false, error }) => {
  const [selectedDay, setSelectedDay] = useState(TODAY);
  const titleId = useId();

  useEffect(() => {
    if (entries.some((entry) => entry.day === TODAY)) return;
    const firstScheduledDay = WEEKDAYS.find((day) => entries.some((entry) => entry.day === day));
    if (firstScheduledDay) setSelectedDay(firstScheduledDay);
  }, [entries]);

  const selectedEntries = entries
    .filter((entry) => entry.day === selectedDay)
    .sort((first, second) => getStartMinutes(first.time_slot) - getStartMinutes(second.time_slot));

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs" aria-labelledby={titleId}>
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 id={titleId} className="text-base font-bold text-slate-900 sm:text-lg">
              Jadwal {audience === 'teacher' ? 'Mengajar' : 'Pelajaran'} Mingguan
            </h3>
            <p className="mt-0.5 text-xs text-slate-600">Pilih hari untuk melihat jadwal.</p>
          </div>
        </div>
        <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
          {entries.length} jadwal
        </span>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6" role="group" aria-label="Pilih hari jadwal">
          {WEEKDAYS.map((day) => {
            const count = entries.filter((entry) => entry.day === day).length;
            return (
              <button
                key={day}
                type="button"
                aria-pressed={selectedDay === day}
                onClick={() => setSelectedDay(day)}
                className={`min-h-11 rounded-xl border px-2 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                  selectedDay === day
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <span className="block">{day}</span>
                <span className={`mt-0.5 block text-[10px] ${selectedDay === day ? 'text-blue-100' : 'text-slate-600'}`}>
                  {count} jadwal
                </span>
              </button>
            );
          })}
        </div>

        {loading && <p className="py-4 text-center text-sm text-slate-600" role="status">Memuat jadwal mingguan...</p>}

        {!loading && error && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && entries.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-600">
            Belum ada jadwal mingguan yang tersedia.
          </p>
        )}

        {!loading && !error && entries.length > 0 && selectedEntries.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-600">
            Tidak ada jadwal pada hari {selectedDay}. Pilih hari lain untuk melihat jadwal.
          </p>
        )}

        {!loading && !error && selectedEntries.length > 0 && (
          <div className="space-y-2" aria-live="polite">
            {selectedEntries.map((entry, index) => (
              <article
                key={`${entry.day}-${entry.time_slot}-${entry.subject_name}-${index}`}
                className="grid min-w-0 grid-cols-1 gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-[minmax(8rem,auto)_minmax(0,1fr)] sm:items-center sm:gap-4 sm:p-4"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-blue-800">
                  <Clock3 className="h-4 w-4 shrink-0" />
                  <span>{entry.time_slot}</span>
                </div>
                <div className="min-w-0">
                  <h4 className="break-words text-sm font-bold text-slate-900">{entry.subject_name}</h4>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
                    {audience === 'teacher' && entry.academic_class?.name && (
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 shrink-0" />
                        {entry.academic_class.name}
                      </span>
                    )}
                    {audience === 'student' && entry.teacher?.name && (
                      <span>Guru: {entry.teacher.name}</span>
                    )}
                    {entry.room && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {entry.room}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
