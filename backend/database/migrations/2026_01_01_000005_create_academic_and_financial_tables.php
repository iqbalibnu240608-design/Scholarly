<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tambah relasi kelas di tabel users
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('academic_class_id')->nullable()->after('role_name')->constrained('academic_classes')->nullOnDelete();
        });

        // 2. Wallets (Dompet Digital Siswa: Saldo Kopsis & Kantin)
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('balance_kopsis', 12, 2)->default(0);
            $table->decimal('balance_kantin', 12, 2)->default(0);
            $table->timestamps();
        });

        // 3. Transactions (Buku Besar Keuangan: Top-up, Belanja Kopsis, Kantin, SPP)
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('reference_no')->unique(); // e.g. TRX-2026-0001
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // Siswa atau Pelanggan
            $table->enum('type', ['topup_kopsis', 'topup_kantin', 'purchase_kopsis', 'purchase_kantin', 'spp']);
            $table->decimal('amount', 12, 2);
            $table->enum('payment_method', ['wallet', 'cash'])->default('wallet');
            $table->string('description');
            $table->foreignId('operator_id')->nullable()->constrained('users')->nullOnDelete(); // Kasir / Petugas
            $table->timestamps();
        });

        // 4. Attendances (Presensi Siswa Harian / Gerbang Utama)
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->date('date')->index();
            $table->time('check_in_time');
            $table->enum('status', ['hadir', 'terlambat', 'izin', 'sakit', 'alpha'])->default('hadir');
            $table->integer('minutes_late')->default(0);
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete(); // Satpam / Petugas
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'date']);
        });

        // 5. Schedules (Jadwal Pelajaran Sekolah)
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_class_id')->constrained('academic_classes')->cascadeOnDelete();
            $table->enum('day', ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']);
            $table->string('time_slot'); // e.g. "07:30 - 09:00"
            $table->string('subject_name');
            $table->foreignId('teacher_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('room')->default('Ruang Kelas');
            $table->timestamps();
        });

        // 6. Grades (Penilaian Akademik Siswa)
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('teacher_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('subject_name');
            $table->enum('type', ['tugas', 'uh', 'pts', 'pas', 'sikap'])->default('tugas');
            $table->decimal('score', 5, 2); // 0 - 100
            $table->text('feedback')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grades');
        Schema::dropIfExists('schedules');
        Schema::dropIfExists('attendances');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('wallets');

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['academic_class_id']);
            $table->dropColumn('academic_class_id');
        });
    }
};
