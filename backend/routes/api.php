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
        'app' => 'StillSchool API',
        'framework' => 'Laravel ' . app()->version(),
        'php' => phpversion(),
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Authentication & Public Endpoints
Route::get('/login', function () {
    return response()->json([
        'status' => 'error',
        'message' => 'Unauthenticated. Silakan kirimkan kredensial akun via formulir login.',
    ], 401);
})->name('login');

Route::post('/login', [AuthController::class, 'login'])->name('login.post');
Route::post('/register', [AuthController::class, 'register']);
Route::get('/roles', [RoleController::class, 'index']);

// Authenticated Routes
Route::middleware('auth:sanctum')->group(function () {
    // Current User, Role Switcher & Logout
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/auth/switch-role', [AuthController::class, 'switchRole']);

    // General School Overview (Accessible by all logged in roles)
    Route::get('/school/overview', [SchoolEcosystemController::class, 'getOverview']);
    Route::get('/school/sidebar-notifications', [SchoolEcosystemController::class, 'getSidebarNotifications']);
    Route::post('/school/announcements', [SchoolEcosystemController::class, 'createAnnouncement'])->middleware('role:admin,guru,petugas,kepsek');

    // Role-specific System Endpoints
    Route::get('/school/siswa', [SchoolEcosystemController::class, 'getSiswaData']);
    Route::get('/school/guru', [SchoolEcosystemController::class, 'getGuruData'])->middleware('role:guru,kepsek,admin');
    Route::get('/school/kepsek', [SchoolEcosystemController::class, 'getKepsekData'])->middleware('role:kepsek,admin');
    Route::get('/school/petugas', [SchoolEcosystemController::class, 'getPetugasData'])->middleware('role:petugas,admin,kepsek');
    
    // Kopsis Endpoints
    Route::get('/school/kopsis', [SchoolEcosystemController::class, 'getKopsisData']);
    Route::post('/school/kopsis/products', [SchoolEcosystemController::class, 'createKopsisProduct'])->middleware('role:kopsis,admin');

    // Kantin Endpoints
    Route::get('/school/kantin', [SchoolEcosystemController::class, 'getKantinData']);
    Route::post('/school/kantin/menus', [SchoolEcosystemController::class, 'createKantinMenu'])->middleware('role:kantin,admin');

    // Dompet Digital / E-Wallet Endpoints (Siswa & Petugas)
    Route::post('/wallet/topup', [WalletController::class, 'topup']);
    Route::get('/wallet/balance', [WalletController::class, 'getBalance']);
    Route::get('/wallet/transactions', [WalletController::class, 'getTransactions']);
    Route::get('/wallet/pending-topups', [WalletController::class, 'getPendingTopups'])->middleware('role:admin,petugas,kopsis');
    Route::post('/wallet/topup/{id}/approve', [WalletController::class, 'approveTopup'])->middleware('role:admin,petugas,kopsis');
    Route::post('/wallet/topup/{id}/reject', [WalletController::class, 'rejectTopup'])->middleware('role:admin,petugas,kopsis');

    // Kasir POS Endpoints (Kopsis & Kantin Cashless/Cash)
    Route::post('/kopsis/checkout', [POSController::class, 'checkoutKopsis']);
    Route::post('/kantin/checkout', [POSController::class, 'checkoutKantin']);

    // Presensi Gerbang Satpam (Gate Attendance RFID / NISN)
    Route::post('/security/gate-checkin', [SecurityController::class, 'gateCheckin'])->middleware('role:security,admin,kepsek');
    Route::get('/security/today-logs', [SecurityController::class, 'getTodayLogs'])->middleware('role:security,kepsek,admin');

    // Modul Akademik (Guru & Siswa)
    Route::post('/guru/grades', [AcademicController::class, 'inputGrade'])->middleware('role:guru,admin,kepsek');
    Route::get('/guru/my-grades', [AcademicController::class, 'getTeacherGrades'])->middleware('role:guru,admin,kepsek');
    Route::get('/siswa/my-grades', [AcademicController::class, 'getMyGrades']);
    Route::get('/school/schedules', [AcademicController::class, 'getSchedules']);

    // Modul Perpustakaan Sekolah (E-Library)
    Route::get('/school/library', [LibraryController::class, 'getLibraryData']);
    Route::post('/library/books', [LibraryController::class, 'addBook'])->middleware('role:perpustakaan,admin,kepsek');
    Route::post('/library/borrow', [LibraryController::class, 'borrowBook']);
    Route::post('/library/return', [LibraryController::class, 'returnBook']);
    Route::delete('/library/loans/{id}', [LibraryController::class, 'deleteLoan'])->middleware('role:perpustakaan,admin,kepsek');

    // Modul Petugas TU (SPP)
    Route::post('/petugas/spp-payment', [SchoolEcosystemController::class, 'paySPP'])->middleware('role:petugas,admin,siswa,kepsek');
    Route::get('/petugas/spp-history', [SchoolEcosystemController::class, 'getSPPHistory']);

    // Admin Endpoints (Wewenang Khusus Admin)
    Route::middleware('role:admin')->group(function () {
        Route::get('/school/admin', [SchoolEcosystemController::class, 'getAdminData']);
        Route::post('/admin/assign-role', [RoleController::class, 'assignRole']);
        Route::post('/admin/users', [SchoolEcosystemController::class, 'createUser']);
        Route::post('/admin/users/{id}/toggle-status', [SchoolEcosystemController::class, 'toggleUserStatus']);
        Route::post('/admin/users/{id}/reset-password', [SchoolEcosystemController::class, 'resetUserPassword']);
    });
});
