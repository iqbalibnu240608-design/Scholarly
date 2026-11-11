<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicClass;
use App\Models\Grade;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AcademicController extends Controller
{
    /**
     * Directory used by teachers and gate staff to find students by class.
     */
    public function getStudentDirectory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => 'nullable|string|max:100',
            'class_id' => 'nullable|integer|exists:academic_classes,id',
        ]);

        $query = User::with('academicClass:id,name,grade')
            ->where('role_name', 'siswa')
            ->whereNotNull('identifier_number')
            ->select(['name', 'identifier_number', 'academic_class_id'])
            ->orderBy('name');

        if (!empty($validated['class_id'])) {
            $query->where('academic_class_id', $validated['class_id']);
        }

        if (!empty($validated['search'])) {
            $search = $validated['search'];
            $query->where(function ($studentQuery) use ($search) {
                $studentQuery->where('name', 'like', "%{$search}%")
                    ->orWhere('identifier_number', 'like', "%{$search}%");
            });
        }

        $hasStudentFilter = !empty($validated['class_id']) || !empty($validated['search']);

        return response()->json([
            'success' => true,
            'students' => $hasStudentFilter ? $query->limit(100)->get() : [],
            'classes' => AcademicClass::query()
                ->orderBy('grade')
                ->orderBy('name')
                ->get(['id', 'name', 'grade']),
        ]);
    }

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
     * Return schedules scoped to the current student's class or teacher.
     */
    public function getSchedules(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Schedule::with('academicClass:id,name,grade', 'teacher:id,name');

        if ($user->role_name === 'siswa') {
            $query->where('academic_class_id', $user->academic_class_id);
        } elseif ($user->role_name === 'guru') {
            $query->where('teacher_id', $user->id);
        }

        $schedules = $query->orderBy('day')->get()->groupBy('day');

        return response()->json([
            'success' => true,
            'schedules' => $schedules,
        ]);
    }
}
