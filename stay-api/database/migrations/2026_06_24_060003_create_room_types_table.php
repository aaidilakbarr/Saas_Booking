<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained('properties')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('capacity')->default(2);
            $table->decimal('size_sqm', 6, 2)->nullable();
            $table->decimal('price_weekday', 12, 2);
            $table->decimal('price_weekend', 12, 2);
            $table->integer('stock')->default(1);
            $table->json('amenities')->nullable(); // e.g. ["ac", "tv", "hot_water"]
            $table->enum('status', ['available', 'unavailable'])->default('available');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_types');
    }
};
