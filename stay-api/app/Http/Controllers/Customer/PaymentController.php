<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PaymentController extends Controller
{
    /**
     * Upload proof of payment for a booking.
     */
    public function uploadPaymentProof(Request $request, $bookingCode)
    {
        $user = $request->user();

        $booking = Booking::where('booking_code', $bookingCode)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // Must be in pending_payment or rejected status to upload payment proof
        if (!in_array($booking->status, ['pending_payment', 'rejected'])) {
            return response()->json([
                'message' => 'Unggah bukti pembayaran tidak diizinkan untuk status pesanan ini.'
            ], 400);
        }

        // Check if expired
        if ($booking->status === 'pending_payment' && $booking->expires_at && Carbon::now()->gt($booking->expires_at)) {
            $booking->status = 'expired';
            $booking->save();
            return response()->json([
                'message' => 'Batas waktu pembayaran pesanan ini telah habis (Expired).'
            ], 400);
        }

        $request->validate([
            'proof_image' => 'required|image|mimes:jpeg,png,jpg,pdf|max:2048', // max 2MB
        ]);

        if ($request->hasFile('proof_image')) {
            $path = $request->file('proof_image')->store('payment_proofs', 'public');
            
            // Create or update payment record
            $payment = Payment::updateOrCreate(
                ['booking_id' => $booking->id],
                [
                    'proof_path' => $path,
                    'uploaded_at' => Carbon::now(),
                    'status' => 'pending',
                    'rejection_reason' => null, // reset rejection reason if re-uploading
                ]
            );

            // Update booking status
            $booking->status = 'payment_uploaded';
            $booking->save();

            return response()->json([
                'message' => 'Bukti pembayaran berhasil diunggah. Menunggu verifikasi dari Finance.',
                'booking' => $booking,
                'payment' => $payment
            ]);
        }

        return response()->json([
            'message' => 'Gagal mengunggah berkas bukti pembayaran.'
        ], 400);
    }
}
