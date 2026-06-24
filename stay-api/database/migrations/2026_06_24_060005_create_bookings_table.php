<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_code', 30)->unique();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('room_type_id')->constrained('room_types')->onDelete('cascade');
            $table->string('guest_name');
            $table->string('guest_phone', 20);
            $table->integer('guest_count')->default(1);
            $table->date('check_in');
            $table->date('check_out');
            $table->integer('nights');
            $table->decimal('price_per_night', 12, 2);
            $table->decimal('total_price', 12, 2);
            $table->text('special_request')->nullable();
            $table->enum('status', [
                'pending_payment',
                'payment_uploaded',
                'confirmed',
                'checked_in',
                'checked_out',
                'cancelled',
                'expired',
                'rejected'
            ])->default('pending_payment');
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
