<?php

namespace App\Services;

use App\Models\RoomType;
use Carbon\Carbon;

class PriceCalculatorService
{
    /**
     * Calculate total booking price based on weekday/weekend rates.
     */
    public function calculate(RoomType $roomType, $checkIn, $checkOut): array
    {
        $start = Carbon::parse($checkIn);
        $end = Carbon::parse($checkOut);
        $totalPrice = 0;
        $nights = 0;
        $breakdown = [];

        $current = $start->copy();
        while ($current->lt($end)) {
            $dayOfWeek = $current->dayOfWeek;
            // 0 = Sunday, 6 = Saturday
            $isWeekend = ($dayOfWeek === Carbon::SATURDAY || $dayOfWeek === Carbon::SUNDAY);
            $price = $isWeekend ? $roomType->price_weekend : $roomType->price_weekday;
            
            $totalPrice += $price;
            $nights++;
            
            $breakdown[] = [
                'date' => $current->toDateString(),
                'day' => $current->format('l'),
                'is_weekend' => $isWeekend,
                'price' => $price,
            ];
            
            $current->addDay();
        }

        return [
            'total_price' => $totalPrice,
            'nights' => $nights,
            'price_per_night' => $nights > 0 ? round($totalPrice / $nights, 2) : 0,
            'breakdown' => $breakdown,
        ];
    }
}
