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
        if (Schema::hasTable('transactions')) {
            // Ubah kolom type dari enum terbatas menjadi varchar(50) agar mendukung topup_wallet dll
            DB::statement("ALTER TABLE transactions MODIFY COLUMN `type` VARCHAR(50) NOT NULL");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('transactions')) {
            DB::statement("ALTER TABLE transactions MODIFY COLUMN `type` ENUM('topup_kopsis', 'topup_kantin', 'purchase_kopsis', 'purchase_kantin', 'spp', 'topup_wallet') NOT NULL");
        }
    }
};
