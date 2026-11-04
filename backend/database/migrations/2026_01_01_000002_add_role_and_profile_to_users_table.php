<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')->nullable()->after('email')->constrained('roles')->nullOnDelete();
            $table->string('role_name')->default('siswa')->after('role_id')->index();
            $table->string('identifier_number')->nullable()->after('role_name'); // NISN / NIP / ID Karyawan
            $table->string('phone')->nullable()->after('identifier_number');
            $table->enum('gender', ['L', 'P'])->nullable()->after('phone');
            $table->string('avatar')->nullable()->after('gender');
            $table->enum('status', ['active', 'inactive'])->default('active')->after('avatar');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropColumn([
                'role_id',
                'role_name',
                'identifier_number',
                'phone',
                'gender',
                'avatar',
                'status'
            ]);
        });
    }
};
