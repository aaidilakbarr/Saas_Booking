<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class PaymentController extends Controller
{
    /**
     * Get the payment verification queue (payment_uploaded).
     */
    public function index(Request $request)
    {
        $bookings = Booking::where('status', 'payment_uploaded')
            ->with(['user', 'roomType.property', 'payment'])
            ->orderBy(
                Payment::select('uploaded_at')
                    ->whereColumn('booking_id', 'bookings.id')
                    ->limit(1), 
                'asc'
            )
            ->get();

        return response()->json($bookings);
    }

    /**
     * Get specific payment details.
     */
    public function show($id)
    {
        $payment = Payment::with(['booking.user', 'booking.roomType.property', 'verifier'])
            ->findOrFail($id);

        return response()->json($payment);
    }

    /**
     * Confirm a payment.
     */
    public function confirm(Request $request, $id)
    {
        $finance = $request->user();
        $payment = Payment::findOrFail($id);
        $booking = $payment->booking;

        if ($booking->status !== 'payment_uploaded') {
            return response()->json([
                'message' => 'Status pesanan tidak valid untuk dikonfirmasi.'
            ], 400);
        }

        // Update payment
        $payment->status = 'confirmed';
        $payment->confirmed_by = $finance->id;
        $payment->confirmed_at = Carbon::now();
        $payment->save();

        // Update booking
        $booking->status = 'confirmed';
        $booking->save();

        // Send email notification to customer
        $email = $booking->user->email;
        Mail::raw("Halo {$booking->user->name}, pembayaran Anda untuk booking code {$booking->booking_code} telah dikonfirmasi oleh Finance. Status pesanan Anda sekarang aktif (Confirmed). Detail check-in: Kamar: {$booking->roomType->name}, Tanggal: {$booking->check_in->toDateString()} s/d {$booking->check_out->toDateString()}.", function ($message) use ($email, $booking) {
            $message->to($email)
                ->subject("Pembayaran Dikonfirmasi ✅ - {$booking->booking_code}");
        });

        return response()->json([
            'message' => 'Pembayaran berhasil dikonfirmasi.',
            'booking' => $booking,
            'payment' => $payment
        ]);
    }

    /**
     * Reject a payment.
     */
    public function reject(Request $request, $id)
    {
        $finance = $request->user();
        $payment = Payment::findOrFail($id);
        $booking = $payment->booking;

        if ($booking->status !== 'payment_uploaded') {
            return response()->json([
                'message' => 'Status pesanan tidak valid untuk ditolak.'
            ], 400);
        }

        $request->validate([
            'rejection_reason' => 'required|string|max:1000'
        ]);

        $reason = $request->rejection_reason;

        // Update payment
        $payment->status = 'rejected';
        $payment->confirmed_by = $finance->id;
        $payment->confirmed_at = Carbon::now();
        $payment->rejection_reason = $reason;
        $payment->save();

        // Update booking
        $booking->status = 'rejected';
        $booking->save();

        // Send email notification to customer
        $email = $booking->user->email;
        Mail::raw("Halo {$booking->user->name}, pembayaran Anda untuk booking code {$booking->booking_code} ditolak oleh Finance dengan alasan: \"{$reason}\". Silakan unggah ulang bukti transfer yang benar di dashboard akun Anda.", function ($message) use ($email, $booking) {
            $message->to($email)
                ->subject("Pembayaran Ditolak ❌ - {$booking->booking_code}");
        });

        return response()->json([
            'message' => 'Pembayaran berhasil ditolak.',
            'booking' => $booking,
            'payment' => $payment
        ]);
    }
}
