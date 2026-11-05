<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Books Catalog (Katalog Buku Perpustakaan)
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->string('isbn', 50)->unique();
            $table->string('title');
            $table->string('author');
            $table->string('publisher')->nullable();
            $table->string('category')->default('Pelajaran'); // Pelajaran, Fiksi, Sains, Komik, Referensi
            $table->integer('stock')->default(1);
            $table->string('shelf_location')->default('Rak A-1');
            $table->string('cover_url')->nullable();
            $table->timestamps();
        });

        // 2. Book Loans (Sirkulasi Peminjaman & Pengembalian Buku)
        Schema::create('book_loans', function (Blueprint $table) {
            $table->id();
            $table->string('reference_no', 50)->unique(); // e.g. LOAN-2026-001
            $table->foreignId('book_id')->constrained('books')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->date('borrow_date');
            $table->date('due_date');
            $table->date('return_date')->nullable();
            $table->enum('status', ['borrowed', 'returned', 'overdue'])->default('borrowed');
            $table->decimal('fine_amount', 10, 2)->default(0);
            $table->foreignId('operator_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('book_loans');
        Schema::dropIfExists('books');
    }
};
