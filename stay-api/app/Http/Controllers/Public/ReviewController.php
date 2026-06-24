<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Submit review for a booking.
     */
    public function store($bookingCode, Request $request)
    {
        $user = $request->user();

        $booking = Booking::where('booking_code', $bookingCode)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // Must be checked_out
        if ($booking->status !== 'checked_out') {
            return response()->json([
                'message' => 'Anda hanya dapat memberikan ulasan setelah status check-out selesai.'
            ], 400);
        }

        // Must not already have a review
        $exists = Review::where('booking_id', $booking->id)->exists();
        if ($exists) {
            return response()->json([
                'message' => 'Anda sudah memberikan ulasan untuk pesanan ini.'
            ], 400);
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'comment' => 'nullable|string',
        ]);

        // Find the property via the room type
        $propertyId = $booking->roomType->property_id;

        $review = Review::create([
            'booking_id' => $booking->id,
            'user_id' => $user->id,
            'property_id' => $propertyId,
            'rating' => $validated['rating'],
            'title' => $validated['title'] ?? null,
            'comment' => $validated['comment'] ?? null,
        ]);

        return response()->json([
            'message' => 'Ulasan berhasil dikirim. Terima kasih atas masukan Anda!',
            'review' => $review
        ], 201);
    }
}
