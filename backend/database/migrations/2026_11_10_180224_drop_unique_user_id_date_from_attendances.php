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
            // First add an index on user_id so MySQL foreign key constraint remains satisfied
            $table->index('user_id');
        });

        Schema::table('attendances', function (Blueprint $table) {
            // Now safe to drop the composite unique constraint
            $table->dropUnique('attendances_user_id_date_unique');
            // Add composite index for (user_id, date)
            $table->index(['user_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'date']);
            $table->unique(['user_id', 'date']);
            $table->dropIndex(['user_id']);
        });
    }
};
