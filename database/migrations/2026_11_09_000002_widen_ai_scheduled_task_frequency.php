<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** `month_end_weekday` is 17 characters; the column was created at 16. */
    public function up(): void
    {
        Schema::table('ai_scheduled_tasks', function (Blueprint $table) {
            $table->string('frequency', 24)->change();
        });
    }

    public function down(): void
    {
        // Fold the longer schedule into the nearest older one so the narrower column still fits.
        DB::table('ai_scheduled_tasks')->where('frequency', 'month_end_weekday')->update(['frequency' => 'month_end']);

        Schema::table('ai_scheduled_tasks', function (Blueprint $table) {
            $table->string('frequency', 16)->change();
        });
    }
};
