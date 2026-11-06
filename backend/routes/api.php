<?php

use App\Http\Controllers\Api\AcademicController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LibraryController;
use App\Http\Controllers\Api\POSController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SchoolEcosystemController;
use App\Http\Controllers\Api\SecurityController;
use App\Http\Controllers\Api\WalletController;
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
        'app' => 'SteelSchool API',
        'framework' => 'Laravel ' . app()->version(),
        'php' => phpversion(),
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Authentication & Public Endpoints
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::get('/roles', [RoleController::class, 'index']);
Route::post('/auth/switch-role', [AuthController::class, 'switchRole']);

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

    // Dompet Digital / E-Wallet Endpoints (Siswa & Petugas)
    Route::post('/wallet/topup', [WalletController::class, 'topup']);
    Route::get('/wallet/balance', [WalletController::class, 'getBalance']);
    Route::get('/wallet/transactions', [WalletController::class, 'getTransactions']);

    // Kasir POS Endpoints (Kopsis & Kantin Cashless/Cash)
    Route::post('/kopsis/checkout', [POSController::class, 'checkoutKopsis']);
    Route::post('/kantin/checkout', [POSController::class, 'checkoutKantin']);

    // Presensi Gerbang Satpam (Gate Attendance RFID / NISN)
    Route::post('/security/gate-checkin', [SecurityController::class, 'gateCheckin']);
    Route::get('/security/today-logs', [SecurityController::class, 'getTodayLogs']);

    // Modul Akademik (Guru & Siswa)
    Route::post('/guru/grades', [AcademicController::class, 'inputGrade']);
    Route::get('/guru/my-grades', [AcademicController::class, 'getTeacherGrades']);
    Route::get('/siswa/my-grades', [AcademicController::class, 'getMyGrades']);
    Route::get('/school/schedules', [AcademicController::class, 'getSchedules']);

    // Modul Perpustakaan Sekolah (E-Library)
    Route::get('/school/library', [LibraryController::class, 'getLibraryData']);
    Route::post('/library/books', [LibraryController::class, 'addBook']);
    Route::post('/library/borrow', [LibraryController::class, 'borrowBook']);
    Route::post('/library/return', [LibraryController::class, 'returnBook']);

    // Modul Petugas TU (SPP)
    Route::post('/petugas/spp-payment', [SchoolEcosystemController::class, 'paySPP']);
    Route::get('/petugas/spp-history', [SchoolEcosystemController::class, 'getSPPHistory']);

    // Admin Endpoints
    Route::get('/school/admin', [SchoolEcosystemController::class, 'getAdminData']);
    Route::post('/admin/assign-role', [RoleController::class, 'assignRole']);
    Route::post('/admin/users', [SchoolEcosystemController::class, 'createUser']);
    Route::post('/admin/users/{id}/toggle-status', [SchoolEcosystemController::class, 'toggleUserStatus']);
    Route::post('/admin/users/{id}/reset-password', [SchoolEcosystemController::class, 'resetUserPassword']);
});
