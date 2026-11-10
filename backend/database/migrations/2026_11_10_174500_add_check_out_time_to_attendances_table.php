<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            if (!Schema::hasColumn('attendances', 'check_out_time')) {
                $table->time('check_out_time')->nullable()->after('check_in_time');
            }
            if (!Schema::hasColumn('attendances', 'check_out_verified_by')) {
                $table->foreignId('check_out_verified_by')->nullable()->after('verified_by')->constrained('users')->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            if (Schema::hasColumn('attendances', 'check_out_verified_by')) {
                $table->dropForeign(['check_out_verified_by']);
                $table->dropColumn('check_out_verified_by');
            }
            if (Schema::hasColumn('attendances', 'check_out_time')) {
                $table->dropColumn('check_out_time');
            }
        });
    }
};
