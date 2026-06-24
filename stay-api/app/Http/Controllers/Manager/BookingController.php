<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Property;
use App\Models\RoomType;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    /**
     * List all reservations for the properties managed by this user.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $propertyIds = Property::where('user_id', $user->id)->pluck('id');
        $roomTypeIds = RoomType::whereIn('property_id', $propertyIds)->pluck('id');

        $bookings = Booking::whereIn('room_type_id', $roomTypeIds)
            ->with(['user', 'roomType.property', 'payment'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($bookings);
    }

    /**
     * Show detail of a reservation.
     */
    public function show(Request $request, $bookingCode)
    {
        $user = $request->user();
        
        $propertyIds = Property::where('user_id', $user->id)->pluck('id');
        $roomTypeIds = RoomType::whereIn('property_id', $propertyIds)->pluck('id');

        $booking = Booking::where('booking_code', $bookingCode)
            ->whereIn('room_type_id', $roomTypeIds)
            ->with(['user', 'roomType.property', 'payment', 'review'])
            ->firstOrFail();

        return response()->json($booking);
    }

    /**
     * Update booking status to checked_in.
     */
    public function checkIn(Request $request, $bookingCode)
    {
        $user = $request->user();
        
        $propertyIds = Property::where('user_id', $user->id)->pluck('id');
        $roomTypeIds = RoomType::whereIn('property_id', $propertyIds)->pluck('id');

        $booking = Booking::where('booking_code', $bookingCode)
            ->whereIn('room_type_id', $roomTypeIds)
            ->firstOrFail();

        if ($booking->status !== 'confirmed') {
            return response()->json([
                'message' => 'Status pesanan harus dikonfirmasi terlebih dahulu sebelum melakukan Check-In.'
            ], 400);
        }

        $booking->status = 'checked_in';
        $booking->save();

        return response()->json([
            'message' => 'Check-In berhasil dikonfirmasi.',
            'booking' => $booking
        ]);
    }

    /**
     * Update booking status to checked_out.
     */
    public function checkOut(Request $request, $bookingCode)
    {
        $user = $request->user();
        
        $propertyIds = Property::where('user_id', $user->id)->pluck('id');
        $roomTypeIds = RoomType::whereIn('property_id', $propertyIds)->pluck('id');

        $booking = Booking::where('booking_code', $bookingCode)
            ->whereIn('room_type_id', $roomTypeIds)
            ->firstOrFail();

        if ($booking->status !== 'checked_in') {
            return response()->json([
                'message' => 'Tamu harus Check-In terlebih dahulu sebelum melakukan Check-Out.'
            ], 400);
        }

        $booking->status = 'checked_out';
        $booking->save();

        return response()->json([
            'message' => 'Check-Out berhasil dikonfirmasi. Tamu sekarang dapat memberikan ulasan.',
            'booking' => $booking
        ]);
    }
}
