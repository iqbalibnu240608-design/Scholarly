@echo off
title Scholarly Web App Runner
echo ========================================================
echo   Menjalankan Ekosistem Sekolah (Scholarly)
echo ========================================================
echo.

:: Menambahkan path PHP dan Node.js dari Laragon ke environment
set PATH=C:\laragon\bin\php\php-8.3.36-Win32-vs16-x64;C:\laragon\bin\nodejs\node-v22;%PATH%

echo [1/2] Menjalankan Backend Laravel di http://127.0.0.1:8000 ...
start "Scholarly Backend (Laravel)" cmd /k "cd backend && php artisan serve --host=127.0.0.1 --port=8000"

echo [2/2] Menjalankan Frontend React/Vite di http://localhost:5173 ...
start "Scholarly Frontend (Vite)" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo   Semua server sedang berjalan di jendela terpisah!
echo   - Akses Web Siswa/Admin : http://localhost:5173
echo   - API Backend           : http://localhost:8000
echo ========================================================
echo Jendela ini akan tertutup otomatis dalam 5 detik.
timeout /t 5 >nul
