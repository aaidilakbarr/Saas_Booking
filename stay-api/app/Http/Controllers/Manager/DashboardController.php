<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Property;
use App\Models\RoomType;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get manager dashboard statistics.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Find properties managed by this user
        $properties = Property::where('user_id', $user->id)->get();
        $propertyIds = $properties->pluck('id');
        $roomTypes = RoomType::whereIn('property_id', $propertyIds)->get();
        $roomTypeIds = $roomTypes->pluck('id');

        // Total reservations
        $allTimeBookingsCount = Booking::whereIn('room_type_id', $roomTypeIds)->count();
        $thisMonthBookingsCount = Booking::whereIn('room_type_id', $roomTypeIds)
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->count();

        // Total revenue (only count confirmed, checked_in, checked_out)
        $revenueAllTime = Booking::whereIn('room_type_id', $roomTypeIds)
            ->whereIn('status', ['confirmed', 'checked_in', 'checked_out'])
            ->sum('total_price');

        // Revenue per month (last 6 months)
        $revenueMonthly = Booking::select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('YEAR(created_at) as year'),
                DB::raw('SUM(total_price) as total')
            )
            ->whereIn('room_type_id', $roomTypeIds)
            ->whereIn('status', ['confirmed', 'checked_in', 'checked_out'])
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->groupBy('year', 'month')
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get();

        // Most frequently booked room types
        $popularRooms = Booking::select('room_type_id', DB::raw('count(*) as count'))
            ->whereIn('room_type_id', $roomTypeIds)
            ->groupBy('room_type_id')
            ->orderBy('count', 'desc')
            ->with('roomType:id,name,property_id', 'roomType.property:id,name')
            ->limit(5)
            ->get();

        // Recent reservations
        $recentBookings = Booking::whereIn('room_type_id', $roomTypeIds)
            ->with(['user:id,name', 'roomType:id,name,property_id', 'roomType.property:id,name'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Today's occupancy summary
        $todayStr = Carbon::now()->toDateString();
        $occupiedRoomsToday = Booking::whereIn('room_type_id', $roomTypeIds)
            ->whereNotIn('status', ['expired', 'cancelled', 'rejected'])
            ->where('check_in', '<=', $todayStr)
            ->where('check_out', '>', $todayStr)
            ->count();

        $totalRoomStock = $roomTypes->sum('stock');
        $availableRoomsToday = max(0, $totalRoomStock - $occupiedRoomsToday);

        return response()->json([
            'stats' => [
                'total_properties' => $properties->count(),
                'total_room_types' => $roomTypes->count(),
                'bookings_all_time' => $allTimeBookingsCount,
                'bookings_this_month' => $thisMonthBookingsCount,
                'revenue_all_time' => (float)$revenueAllTime,
                'rooms_total_stock' => $totalRoomStock,
                'rooms_occupied_today' => $occupiedRoomsToday,
                'rooms_available_today' => $availableRoomsToday,
            ],
            'revenue_monthly' => $revenueMonthly,
            'popular_rooms' => $popularRooms,
            'recent_bookings' => $recentBookings,
        ]);
    }
}
