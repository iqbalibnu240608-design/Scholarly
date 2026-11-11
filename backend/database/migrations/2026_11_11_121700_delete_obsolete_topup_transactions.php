<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Hapus riwayat top-up saldo. Sistem e-wallet sudah diganti pembayaran langsung QRIS dan tunai.
     */
    public function up(): void
    {
        if (!Schema::hasTable('transactions')) {
            return;
        }

        DB::table('transactions')
            ->where('type', 'like', 'topup%')
            ->orWhere('reference_no', 'like', 'TOPUP-%')
            ->delete();
    }

    /**
     * Data top-up yang dihapus tidak dikembalikan.
     */
    public function down(): void
    {
        //
    }
};
