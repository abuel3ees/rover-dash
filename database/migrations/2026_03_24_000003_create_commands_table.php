<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commands', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rover_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->json('payload');
            $table->enum('status', ['pending', 'sent', 'executed', 'failed', 'expired'])->default('pending');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('executed_at')->nullable();
            $table->text('response')->nullable();
            $table->timestamps();

            $table->index(['rover_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commands');
    }
};
