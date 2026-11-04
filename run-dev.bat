@echo off
title SteelSchool - Full Stack Runner
echo ===================================================
echo        STEELSCHOOL FULL STACK DEV RUNNER
echo ===================================================
echo.
echo Pastikan Laragon / MySQL Anda sudah berjalan (Start All).
echo Database: ekosistem_sekolah (MySQL di port 3306)
echo phpMyAdmin: http://localhost/phpmyadmin
echo.

echo [1/2] Menjalankan Backend Laravel di http://localhost:8000 ...
start "Backend Laravel API" cmd /k "cd backend && C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe artisan serve --port=8000"

echo [2/2] Menjalankan Frontend React Vite TSX di http://localhost:5173 ...
start "Frontend React Vite" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo Server frontend dan backend telah diluncurkan!
echo Buka browser di: http://localhost:5173
echo ===================================================
pause
