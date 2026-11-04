<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     * Accepts comma-separated roles or multiple arguments: 'role:admin,kepsek'
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.'
            ], 401);
        }

        // Admin always has full access to any role route
        if ($user->role_name === 'admin') {
            return $next($request);
        }

        // Flatten roles if passed like 'admin,kepsek'
        $allowedRoles = [];
        foreach ($roles as $roleGroup) {
            foreach (explode(',', $roleGroup) as $role) {
                $allowedRoles[] = trim($role);
            }
        }

        if (!empty($allowedRoles) && !in_array($user->role_name, $allowedRoles, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Role ' . $user->role_name . ' tidak memiliki akses ke endpoint ini.',
                'required_roles' => $allowedRoles,
                'your_role' => $user->role_name,
            ], 403);
        }

        return $next($request);
    }
}
