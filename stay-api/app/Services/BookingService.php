<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\RoomType;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Exception;

class BookingService
{
    protected $priceCalculator;
    protected $availabilityService;

    public function __construct(
        PriceCalculatorService $priceCalculator,
        AvailabilityService $availabilityService
    ) {
        $this->priceCalculator = $priceCalculator;
        $this->availabilityService = $availabilityService;
    }

    /**
     * Create a new booking with inventory locking.
     */
    public function createBooking(array $data)
    {
        return DB::transaction(function () use ($data) {
            // Lock room type row to prevent race conditions on stock check
            $roomType = RoomType::where('id', $data['room_type_id'])
                ->lockForUpdate()
                ->first();

            if (!$roomType) {
                throw new Exception('Room type not found.');
            }

            if ($roomType->status !== 'available') {
                throw new Exception('Room type is currently unavailable.');
            }

            // Check availability
            $available = $this->availabilityService->checkAvailability(
                $roomType,
                $data['check_in'],
                $data['check_out']
            );

            if ($available < 1) {
                throw new Exception('Rooms are fully booked for the selected dates.');
            }

            // Calculate price
            $pricing = $this->priceCalculator->calculate(
                $roomType,
                $data['check_in'],
                $data['check_out']
            );

            // Generate unique booking code: STY-YYYYMMDD-XXXX
            $bookingCode = $this->generateUniqueBookingCode();

            $booking = Booking::create([
                'booking_code' => $bookingCode,
                'user_id' => $data['user_id'],
                'room_type_id' => $roomType->id,
                'guest_name' => $data['guest_name'],
                'guest_phone' => $data['guest_phone'],
                'guest_count' => $data['guest_count'] ?? 1,
                'check_in' => $data['check_in'],
                'check_out' => $data['check_out'],
                'nights' => $pricing['nights'],
                'price_per_night' => $pricing['price_per_night'],
                'total_price' => $pricing['total_price'],
                'special_request' => $data['special_request'] ?? null,
                'status' => 'pending_payment',
                'expires_at' => Carbon::now()->addMinutes(30),
            ]);

            return $booking;
        });
    }

    /**
     * Generate unique booking code with retry on collision.
     */
    protected function generateUniqueBookingCode(): string
    {
        $dateStr = Carbon::now()->format('Ymd');
        do {
            // Generate a 4-character random alphanumeric string
            $characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            $randomPart = '';
            for ($i = 0; $i < 4; $i++) {
                $randomPart .= $characters[rand(0, strlen($characters) - 1)];
            }
            $code = "STY-{$dateStr}-{$randomPart}";
        } while (Booking::where('booking_code', $code)->exists());

        return $code;
    }
}
