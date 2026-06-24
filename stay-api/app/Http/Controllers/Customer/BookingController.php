<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BankAccount;
use App\Services\BookingService;
use Exception;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    protected $bookingService;

    public function __construct(BookingService $bookingService)
    {
        $this->bookingService = $bookingService;
    }

    /**
     * Create a new booking (locks inventory via Service).
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'room_type_id' => 'required|exists:room_types,id',
            'guest_name' => 'required|string|max:255',
            'guest_phone' => 'required|string|max:20',
            'guest_count' => 'required|integer|min:1',
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'special_request' => 'nullable|string',
        ]);

        $validated['user_id'] = $user->id;

        try {
            $booking = $this->bookingService->createBooking($validated);
            return response()->json([
                'message' => 'Reservasi berhasil dibuat. Silakan selesaikan pembayaran.',
                'booking' => $booking->load('roomType.property')
            ], 211); // Standard 201 Created or custom. Let's return 201.
        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get booking history for customer.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $bookings = Booking::where('user_id', $user->id)
            ->with(['roomType.property', 'payment'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($bookings);
    }

    /**
     * Get booking details.
     */
    public function show($bookingCode, Request $request)
    {
        $user = $request->user();

        $booking = Booking::where('booking_code', $bookingCode)
            ->where('user_id', $user->id)
            ->with(['roomType.property.images', 'roomType.images', 'payment', 'review'])
            ->firstOrFail();

        // Also fetch active bank accounts for display
        $bankAccounts = BankAccount::where('is_active', true)->get();

        return response()->json([
            'booking' => $booking,
            'bank_accounts' => $bankAccounts
        ]);
    }

    /**
     * Cancel booking.
     */
    public function destroy($bookingCode, Request $request)
    {
        $user = $request->user();

        $booking = Booking::where('booking_code', $bookingCode)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // Check if cancellable: status must not be checked_in, checked_out, cancelled, expired, or rejected
        $cancellableStatuses = ['pending_payment', 'payment_uploaded', 'confirmed'];
        
        if (!in_array($booking->status, $cancellableStatuses)) {
            return response()->json([
                'message' => 'Pemesanan tidak dapat dibatalkan pada status saat ini.'
            ], 400);
        }

        $booking->status = 'cancelled';
        $booking->save();

        // If there's a payment record, update its status or handle it
        if ($booking->payment) {
            $booking->payment->status = 'rejected';
            $booking->payment->rejection_reason = 'Dibatalkan oleh pelanggan.';
            $booking->payment->save();
        }

        return response()->json([
            'message' => 'Pemesanan berhasil dibatalkan.',
            'booking' => $booking
        ]);
    }
}
