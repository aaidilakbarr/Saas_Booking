<?php

namespace App\Console\Commands;

use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class ExpireBookings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'booking:expire';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically expire bookings that have passed their payment deadline (30 minutes)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = Carbon::now();
        
        $expiredBookings = Booking::where('status', 'pending_payment')
            ->where('expires_at', '<', $now)
            ->with('user')
            ->get();

        $count = $expiredBookings->count();

        if ($count === 0) {
            $this->info('Tidak ada pesanan tertunda yang melewati tenggat waktu.');
            return 0;
        }

        foreach ($expiredBookings as $booking) {
            $booking->status = 'expired';
            $booking->save();

            // Send notification
            $email = $booking->user->email;
            Mail::raw("Halo {$booking->user->name}, pemesanan Anda dengan kode {$booking->booking_code} telah kadaluarsa (Expired) karena kami tidak menerima bukti pembayaran dalam waktu 30 menit. Silakan lakukan pemesanan ulang jika Anda masih ingin menginap.", function ($message) use ($email, $booking) {
                $message->to($email)
                    ->subject("Pemesanan Kadaluarsa ⏰ - {$booking->booking_code}");
            });

            $this->info("Pemesanan {$booking->booking_code} diubah menjadi kadaluarsa.");
        }

        $this->info("Berhasil membatalkan {$count} pesanan yang kadaluarsa.");
        return 0;
    }
}
