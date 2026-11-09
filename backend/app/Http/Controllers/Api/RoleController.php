<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    /**
     * List all available school roles and their permissions
     */
    public function index(): JsonResponse
    {
        $roles = Role::with('permissions')->withCount('users')->get();
        $permissions = Permission::all()->groupBy('module');

        return response()->json([
            'success' => true,
            'roles' => $roles,
            'permissions_by_module' => $permissions,
        ]);
    }

    /**
     * Change user role (accessible by admin/kepsek)
     */
    public function assignRole(Request $request): JsonResponse
    {
        $roleName = $request->input('role_name') ?? $request->input('role');
        $request->merge(['role_name' => $roleName]);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role_name' => 'required|exists:roles,name',
        ]);

        $role = Role::where('name', $validated['role_name'])->firstOrFail();
        $user = User::findOrFail($validated['user_id']);

        $user->update([
            'role_id' => $role->id,
            'role_name' => $role->name,
        ]);

        // Cabut token aktif agar pengguna wajib login dengan wewenang baru
        $user->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => "Role untuk pengguna {$user->name} berhasil diubah menjadi {$role->display_name}.",
            'user' => $user->load('role'),
        ]);
    }
}
