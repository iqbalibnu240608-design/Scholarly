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
     * User Login
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::with('role.permissions')->where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Kredensial yang diberikan tidak cocok dengan data kami.'],
            ]);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda dinonaktifkan. Silakan hubungi admin sekolah.',
            ], 403);
        }

        // Delete old tokens if desired or create a new token
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'token' => $token,
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
}
