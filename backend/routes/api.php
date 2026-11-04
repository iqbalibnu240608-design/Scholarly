<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SchoolEcosystemController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Ekosistem Sekolah
|--------------------------------------------------------------------------
*/

// Health Check
Route::get('/health', function () {
    return response()->json([
        'status' => 'OK',
        'app' => 'Ekosistem Sekolah API',
        'framework' => 'Laravel ' . app()->version(),
        'php' => phpversion(),
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Authentication & Public Endpoints
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::get('/roles', [RoleController::class, 'index']);

// Authenticated Routes
Route::middleware('auth:sanctum')->group(function () {
    // Current User & Logout
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // General School Overview (Accessible by all logged in roles)
    Route::get('/school/overview', [SchoolEcosystemController::class, 'getOverview']);
    Route::post('/school/announcements', [SchoolEcosystemController::class, 'createAnnouncement']);

    // Role-specific System Endpoints
    Route::get('/school/siswa', [SchoolEcosystemController::class, 'getSiswaData']);
    Route::get('/school/guru', [SchoolEcosystemController::class, 'getGuruData']);
    Route::get('/school/kepsek', [SchoolEcosystemController::class, 'getKepsekData']);
    Route::get('/school/petugas', [SchoolEcosystemController::class, 'getPetugasData']);
    
    // Kopsis Endpoints
    Route::get('/school/kopsis', [SchoolEcosystemController::class, 'getKopsisData']);
    Route::post('/school/kopsis/products', [SchoolEcosystemController::class, 'createKopsisProduct']);

    // Kantin Endpoints
    Route::get('/school/kantin', [SchoolEcosystemController::class, 'getKantinData']);
    Route::post('/school/kantin/menus', [SchoolEcosystemController::class, 'createKantinMenu']);

    // Admin Endpoints
    Route::get('/school/admin', [SchoolEcosystemController::class, 'getAdminData']);
    Route::post('/admin/assign-role', [RoleController::class, 'assignRole']);
});
