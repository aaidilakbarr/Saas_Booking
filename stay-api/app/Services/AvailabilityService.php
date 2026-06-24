<?php

namespace App\Services;

use App\Models\RoomType;
use App\Models\Booking;
use Carbon\Carbon;

class AvailabilityService
{
    /**
     * Get the remaining available stock of a room type for a date range.
     */
    public function checkAvailability(RoomType $roomType, $checkIn, $checkOut): int
    {
        $start = Carbon::parse($checkIn);
        $end = Carbon::parse($checkOut);
        
        if ($start->gte($end)) {
            return 0;
        }

        $maxBooked = 0;
        $current = $start->copy();

        while ($current->lt($end)) {
            $dateStr = $current->toDateString();
            
            $bookedCount = Booking::where('room_type_id', $roomType->id)
                ->whereNotIn('status', ['expired', 'cancelled', 'rejected'])
                ->where('check_in', '<=', $dateStr)
                ->where('check_out', '>', $dateStr)
                ->count();
                
            if ($bookedCount > $maxBooked) {
                $maxBooked = $bookedCount;
            }
            
            $current->addDay();
        }

        $availableStock = $roomType->stock - $maxBooked;
        return max(0, $availableStock);
    }

    /**
     * Get availability schedule/calendar for a room type.
     */
    public function getAvailabilityCalendar(RoomType $roomType, $monthStr): array
    {
        $date = Carbon::parse($monthStr . '-01');
        $daysInMonth = $date->daysInMonth;
        
        $calendar = [];
        
        for ($day = 1; $day <= $daysInMonth; $day++) {
            $currentDate = $date->copy()->day($day);
            $dateStr = $currentDate->toDateString();
            
            $bookedCount = Booking::where('room_type_id', $roomType->id)
                ->whereNotIn('status', ['expired', 'cancelled', 'rejected'])
                ->where('check_in', '<=', $dateStr)
                ->where('check_out', '>', $dateStr)
                ->count();
                
            $available = max(0, $roomType->stock - $bookedCount);
            
            $calendar[] = [
                'date' => $dateStr,
                'day' => $day,
                'day_name' => $currentDate->format('l'),
                'stock' => $roomType->stock,
                'booked' => $bookedCount,
                'available' => $available,
                'status' => $available > 0 ? 'available' : 'full',
            ];
        }
        
        return $calendar;
    }
}
