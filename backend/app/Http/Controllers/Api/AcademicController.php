<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AcademicController extends Controller
{
    /**
     * Guru: Input Nilai Akademik Siswa (Sesuai Flowchart Input Nilai)
     */
    public function inputGrade(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_identifier' => 'required|string', // NISN Siswa
            'subject_name' => 'required|string|max:255',
            'type' => 'required|in:tugas,uh,pts,pas,sikap',
            'score' => 'required|numeric|between:0,100',
            'feedback' => 'nullable|string',
        ]);

        $student = User::where('identifier_number', $validated['student_identifier'])
            ->where('role_name', 'siswa')
            ->first();
        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => "Siswa dengan NISN {$validated['student_identifier']} tidak ditemukan.",
            ], 404);
        }

        $grade = Grade::create([
            'student_id' => $student->id,
            'teacher_id' => $request->user()->id,
            'subject_name' => $validated['subject_name'],
            'type' => $validated['type'],
            'score' => $validated['score'],
            'feedback' => $validated['feedback'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Nilai {$validated['type']} ({$validated['score']}) untuk {$student->name} berhasil disimpan.",
            'grade' => $grade,
        ], 201);
    }

    /**
     * Siswa: Dapatkan Daftar Nilai Pribadi
     */
    public function getMyGrades(Request $request): JsonResponse
    {
        $user = $request->user();

        $grades = Grade::with('teacher:id,name')
            ->where('student_id', $user->id)
            ->latest()
            ->get();

        $average = $grades->count() > 0 ? round($grades->avg('score'), 1) : 0;

        return response()->json([
            'success' => true,
            'student_name' => $user->name,
            'nisn' => $user->identifier_number,
            'average_score' => $average,
            'grades' => $grades,
        ]);
    }

    /**
     * Guru: Dapatkan Riwayat Seluruh Nilai yang Telah Diinput oleh Guru Ini
     */
    public function getTeacherGrades(Request $request): JsonResponse
    {
        $teacherId = $request->user()->id;

        $grades = Grade::with(['student:id,name,identifier_number'])
            ->where('teacher_id', $teacherId)
            ->latest()
            ->take(50)
            ->get();

        return response()->json([
            'success' => true,
            'grades' => $grades,
        ]);
    }

    /**
     * Dapatkan Jadwal Pelajaran (Berdasarkan Kelas Siswa atau Seluruh Kelas)
     */
    public function getSchedules(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Schedule::with('academicClass:id,name,grade', 'teacher:id,name');

        if ($user->role_name === 'siswa' && $user->academic_class_id) {
            $query->where('academic_class_id', $user->academic_class_id);
        }

        $schedules = $query->orderBy('day')->get()->groupBy('day');

        return response()->json([
            'success' => true,
            'schedules' => $schedules,
        ]);
    }
}
