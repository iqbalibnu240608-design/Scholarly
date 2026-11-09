<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('wallets')) {
            Schema::table('wallets', function (Blueprint $table) {
                if (!Schema::hasColumn('wallets', 'balance')) {
                    $table->decimal('balance', 12, 2)->default(0.00)->after('user_id');
                }
            });

            // Sinkronisasi saldo universal awal dari penjumlahan balance_kopsis + balance_kantin
            DB::statement("UPDATE wallets SET balance = balance_kopsis + balance_kantin WHERE balance = 0");
            // Sinkronkan kembali balance_kopsis dan balance_kantin agar pembacaan legacy tetap kompatibel
            DB::statement("UPDATE wallets SET balance_kopsis = balance, balance_kantin = balance");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('wallets') && Schema::hasColumn('wallets', 'balance')) {
            Schema::table('wallets', function (Blueprint $table) {
                $table->dropColumn('balance');
            });
        }
    }
};
