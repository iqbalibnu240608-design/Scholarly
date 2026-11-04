<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Academic Classes (Kelas)
        Schema::create('academic_classes', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. "X RPL 1", "XI TKJ 2"
            $table->string('grade'); // "10", "11", "12"
            $table->string('major')->nullable(); // "Rekayasa Perangkat Lunak"
            $table->foreignId('homeroom_teacher_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // 2. Announcements (Pengumuman Sekolah)
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content');
            $table->string('target_role')->default('all'); // all, siswa, guru, etc.
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });

        // 3. Kopsis Products (Koperasi Siswa)
        Schema::create('kopsis_products', function (Blueprint $table) {
            $table->id();
            $table->string('sku')->unique();
            $table->string('name');
            $table->string('category')->default('Alat Tulis'); // Alat Tulis, Seragam, Buku, Makanan
            $table->decimal('price', 12, 2);
            $table->integer('stock')->default(0);
            $table->timestamps();
        });

        // 4. Kantin Menus (Kantin Sekolah)
        Schema::create('kantin_menus', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category')->default('Makanan'); // Makanan, Minuman, Snack
            $table->decimal('price', 12, 2);
            $table->boolean('is_available')->default(true);
            $table->string('stall_name')->default('Kantin Utama'); // Nama Stand Kantin
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kantin_menus');
        Schema::dropIfExists('kopsis_products');
        Schema::dropIfExists('announcements');
        Schema::dropIfExists('academic_classes');
    }
};
