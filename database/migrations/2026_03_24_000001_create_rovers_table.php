<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rovers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('status', ['online', 'offline', 'error', 'maintenance'])->default('offline');
            $table->string('stream_url')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->unsignedSmallInteger('stream_port')->nullable()->default(8081);
            $table->json('hardware_info')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rovers');
    }
};
