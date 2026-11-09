<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_scheduled_tasks', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('company_id');
            // The member the task runs as: it sees what they may see, and the result lands in their chat history.
            $table->unsignedInteger('user_id');
            $table->string('name', 120);
            $table->text('prompt');
            $table->string('frequency', 16);
            // Weekday 1-7 (Monday-Sunday) for weekly, day of the month for monthly, unused otherwise.
            $table->unsignedTinyInteger('day')->nullable();
            // Local time of day in the company timezone, HH:MM.
            $table->string('run_at', 5)->default('18:00');
            $table->boolean('enabled')->default(true);
            $table->dateTime('next_run_at')->nullable();
            $table->dateTime('last_run_at')->nullable();
            $table->string('last_status', 16)->nullable();
            $table->text('last_error')->nullable();
            $table->unsignedBigInteger('last_conversation_id')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'user_id']);
            $table->index(['enabled', 'next_run_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_scheduled_tasks');
    }
};
