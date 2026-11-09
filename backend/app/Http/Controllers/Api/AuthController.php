<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * User Login (Mendukung Login via NISN untuk Siswa, serta NIP/Email/Username untuk Staf/Admin)
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'identifier' => 'nullable|string',
            'nisn' => 'nullable|string',
            'email' => 'nullable|string',
            'password' => 'required|string',
        ]);

        // Prioritas pencarian: nisn -> identifier -> email
        $loginId = trim((string)($validated['nisn'] ?? $validated['identifier'] ?? $validated['email'] ?? ''));

        if (empty($loginId)) {
            return response()->json([
                'success' => false,
                'message' => 'NISN, Email, atau Nomor Identitas wajib diisi.',
            ], 422);
        }

        // Cari user berdasarkan NISN (identifier_number), email, nama, atau alias role/username
        $user = User::with('role.permissions')
            ->where(function ($query) use ($loginId) {
                $query->where('identifier_number', $loginId)
                      ->orWhere('email', $loginId)
                      ->orWhere('name', $loginId)
                      ->orWhere('role_name', strtolower($loginId));

                $lowId = strtolower($loginId);
                if (in_array($lowId, ['kopsis', 'koperasi', 'pengelola_koperasi', 'pengelola koperasi', 'pengelola koperasi siswa'], true)) {
                    $query->orWhere('role_name', 'kopsis');
                }
                if (in_array($lowId, ['kantin', 'pengelola_kantin', 'pengelola kantin'], true)) {
                    $query->orWhere('role_name', 'kantin');
                }
                if (in_array($lowId, ['satpam', 'security', 'keamanan'], true)) {
                    $query->orWhere('role_name', 'security');
                }
                if (in_array($lowId, ['perpus', 'perpustakaan'], true)) {
                    $query->orWhere('role_name', 'perpustakaan');
                }
                if (in_array($lowId, ['petugas', 'tu', 'administrasi'], true)) {
                    $query->orWhere('role_name', 'petugas');
                }
                if (in_array($lowId, ['kepsek', 'kepala sekolah', 'kepala_sekolah'], true)) {
                    $query->orWhere('role_name', 'kepsek');
                }
                if (in_array($lowId, ['guru', 'pengajar', 'dewan guru'], true)) {
                    $query->orWhere('role_name', 'guru');
                }
            })
            ->first();

        // 1. Verifikasi Keberadaan Pengguna (Sesuai Flowchart: Server Cari User di DB)
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Kredensial tidak sesuai dengan data kami. Silakan periksa kembali NISN/Username Anda.',
            ], 401);
        }

        // 2. Verifikasi Password Bcrypt (Sesuai Flowchart: Verifikasi Password Bcrypt Hash)
        if (!Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Kata sandi tidak valid. Silakan coba lagi atau hubungi admin.',
            ], 401);
        }

        // 3. Verifikasi Status Akun (Sesuai Flowchart: Cek Status Akun is_active)
        if ($user->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda dinonaktifkan. Silakan hubungi admin sekolah.',
            ], 403);
        }

        // 4. Hapus Token Lama Pengguna (Sesuai Flowchart: Hapus Token Lama User)
        $user->tokens()->delete();

        // 5. Generate Token Baru Sanctum (Sesuai Flowchart: Generate Laravel Sanctum Token Baru)
        $token = $user->createToken('auth-token')->plainTextToken;

        // 6. Response Payload Lengkap (Sesuai Flowchart: Bangun Payload Response)
        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'nisn' => $user->identifier_number,
                'identifier_number' => $user->identifier_number,
                'email' => $user->email,
                'role' => $user->role_name,
                'role_display' => $user->role?->display_name ?? ucfirst($user->role_name),
                'status' => $user->status,
                'phone' => $user->phone,
                'gender' => $user->gender,
                'avatar' => $user->avatar,
                'permissions' => $user->role?->permissions->pluck('name') ?? [],
            ],
        ]);
    }

    /**
     * User Register (Defaults to Siswa or given role)
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'nullable|string|exists:roles,name',
            'identifier_number' => 'nullable|string|max:50',
            'phone' => 'nullable|string|max:20',
        ]);

        $roleName = $validated['role'] ?? 'siswa';
        $role = Role::where('name', $roleName)->first();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => $role?->id,
            'role_name' => $roleName,
            'identifier_number' => $validated['identifier_number'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'status' => 'active',
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran akun berhasil.',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role_name,
                'role_display' => $role?->display_name ?? ucfirst($user->role_name),
                'identifier_number' => $user->identifier_number,
                'phone' => $user->phone,
                'permissions' => $role?->permissions->pluck('name') ?? [],
            ],
        ], 201);
    }

    /**
     * Get Current Authenticated User Profile
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('role.permissions');

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role_name,
                'role_display' => $user->role?->display_name ?? ucfirst($user->role_name),
                'identifier_number' => $user->identifier_number,
                'phone' => $user->phone,
                'gender' => $user->gender,
                'avatar' => $user->avatar,
                'permissions' => $user->role?->permissions->pluck('name') ?? [],
            ],
        ]);
    }

    /**
     * User Logout
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil. Sesi telah diakhiri.',
        ]);
    }

    /**
     * Switch Demo / Active Account by Role Name (Menghubungkan Sesi ke Akun Riil Setiap Role)
     */
    public function switchRole(Request $request): JsonResponse
    {
        $currentUser = $request->user();
        if (app()->environment('production') && ($currentUser->role_name ?? '') !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Peralihan peran langsung dibatasi hanya untuk Administrator pada lingkungan produksi.',
            ], 403);
        }

        $validated = $request->validate([
            'role' => 'required|string',
        ]);

        $roleName = strtolower(trim($validated['role']));

        $roleAliases = [
            'koperasi' => 'kopsis',
            'pengelola_koperasi' => 'kopsis',
            'pengelola koperasi' => 'kopsis',
            'pengelola koperasi siswa' => 'kopsis',
            'satpam' => 'security',
            'keamanan' => 'security',
            'perpus' => 'perpustakaan',
            'tu' => 'petugas',
            'administrasi' => 'petugas',
            'kepala_sekolah' => 'kepsek',
            'kepala sekolah' => 'kepsek',
        ];
        if (isset($roleAliases[$roleName])) {
            $roleName = $roleAliases[$roleName];
        }

        // Cari pengguna pertama yang memiliki role tersebut di database
        $user = User::with('role.permissions')
            ->where('role_name', $roleName)
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => "Akun dengan peran '{$roleName}' tidak ditemukan.",
            ], 404);
        }

        // Buat token baru untuk akun target
        $token = $user->createToken('role-switch-' . $roleName)->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => "Berhasil beralih ke akun {$user->name} ({$user->role_name}).",
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'nisn' => $user->identifier_number,
                'identifier_number' => $user->identifier_number,
                'role' => $user->role_name,
                'role_display' => $user->role?->display_name ?? ucfirst($user->role_name),
                'status' => $user->status,
                'phone' => $user->phone,
                'gender' => $user->gender,
                'avatar' => $user->avatar,
                'permissions' => $user->role?->permissions->pluck('name') ?? [],
            ],
        ]);
    }
}
