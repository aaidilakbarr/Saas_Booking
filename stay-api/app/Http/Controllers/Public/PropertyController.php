<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\RoomType;
use App\Services\AvailabilityService;
use App\Services\PriceCalculatorService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PropertyController extends Controller
{
    protected $availabilityService;
    protected $priceCalculator;

    public function __construct(
        AvailabilityService $availabilityService,
        PriceCalculatorService $priceCalculator
    ) {
        $this->availabilityService = $availabilityService;
        $this->priceCalculator = $priceCalculator;
    }

    /**
     * Get list of properties with search and filter.
     */
    public function index(Request $request)
    {
        $query = Property::with(['images', 'roomTypes'])
            ->where('status', 'active');

        // Text search (name, city, province, address)
        if ($request->filled('query')) {
            $search = $request->input('query');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhere('province', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }

        // Filter by property type (hotel, villa, homestay)
        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        // Filter by property amenities (JSON array check)
        if ($request->filled('amenities')) {
            $amenities = $request->input('amenities');
            if (is_string($amenities)) {
                $amenities = explode(',', $amenities);
            }
            foreach ($amenities as $amenity) {
                $query->whereJsonContains('amenities', trim($amenity));
            }
        }

        // Load all properties matching filters first
        $properties = $query->get();

        // Perform in-memory calculation/filtering for dates/stock/pricing if search dates are provided
        $checkIn = $request->input('check_in');
        $checkOut = $request->input('check_out');
        $guests = $request->input('guests', 1);

        $filteredProperties = [];

        foreach ($properties as $property) {
            // Eagerly calculate ratings
            $avgRating = $property->reviews()->avg('rating') ?: 0;
            $reviewsCount = $property->reviews()->count();
            
            $property->avg_rating = round($avgRating, 1);
            $property->reviews_count = $reviewsCount;

            // Apply rating filter
            if ($request->filled('rating') && $avgRating < $request->input('rating')) {
                continue;
            }

            $availableRoomTypes = [];
            $lowestPrice = null;

            foreach ($property->roomTypes as $roomType) {
                if ($roomType->status !== 'available') {
                    continue;
                }

                // Check guest capacity
                if ($roomType->capacity < $guests) {
                    continue;
                }

                // Check pricing filters
                // For simplicity, we use weekday price for range checking
                if ($request->filled('min_price') && $roomType->price_weekday < $request->input('min_price')) {
                    continue;
                }
                if ($request->filled('max_price') && $roomType->price_weekday > $request->input('max_price')) {
                    continue;
                }

                // Check real-time date availability if dates are chosen
                if ($checkIn && $checkOut) {
                    $available = $this->availabilityService->checkAvailability($roomType, $checkIn, $checkOut);
                    if ($available < 1) {
                        continue;
                    }
                    
                    // Add total pricing info for the search selection
                    $priceInfo = $this->priceCalculator->calculate($roomType, $checkIn, $checkOut);
                    $roomType->total_stay_price = $priceInfo['total_price'];
                    $roomType->avg_stay_price = $priceInfo['price_per_night'];
                }

                $availableRoomTypes[] = $roomType;
                
                // Track lowest price for "start from" label
                $price = $roomType->price_weekday;
                if ($lowestPrice === null || $price < $lowestPrice) {
                    $lowestPrice = $price;
                }
            }

            // If user searched for dates, property must have at least one available room
            if ($checkIn && $checkOut && count($availableRoomTypes) === 0) {
                continue;
            }

            $property->lowest_price = $lowestPrice;
            // Temp attach filtered room types
            $property->available_room_types = $availableRoomTypes;

            $filteredProperties[] = $property;
        }

        return response()->json($filteredProperties);
    }

    /**
     * Get property details.
     */
    public function show($slug, Request $request)
    {
        $property = Property::with(['images', 'roomTypes.images'])
            ->where('slug', $slug)
            ->where('status', 'active')
            ->firstOrFail();

        // Calculate average rating
        $avgRating = $property->reviews()->avg('rating') ?: 0;
        $reviewsCount = $property->reviews()->count();
        $property->avg_rating = round($avgRating, 1);
        $property->reviews_count = $reviewsCount;

        // If dates are specified, calculate pricing for each room type and verify availability
        $checkIn = $request->input('check_in');
        $checkOut = $request->input('check_out');

        foreach ($property->roomTypes as $roomType) {
            if ($checkIn && $checkOut && $roomType->status === 'available') {
                $available = $this->availabilityService->checkAvailability($roomType, $checkIn, $checkOut);
                $roomType->available_stock = $available;
                
                $priceInfo = $this->priceCalculator->calculate($roomType, $checkIn, $checkOut);
                $roomType->total_stay_price = $priceInfo['total_price'];
                $roomType->avg_stay_price = $priceInfo['price_per_night'];
                $roomType->price_breakdown = $priceInfo['breakdown'];
            } else {
                $roomType->available_stock = $roomType->stock;
            }
        }

        return response()->json($property);
    }

    /**
     * Get availability calendar for property room types.
     */
    public function availability($slug, Request $request)
    {
        $property = Property::where('slug', $slug)->firstOrFail();
        
        $request->validate([
            'room_type_id' => 'required|exists:room_types,id',
            'month' => 'required|date_format:Y-m', // e.g. "2026-06"
        ]);

        $roomType = RoomType::where('id', $request->room_type_id)
            ->where('property_id', $property->id)
            ->firstOrFail();

        $calendar = $this->availabilityService->getAvailabilityCalendar($roomType, $request->month);

        return response()->json($calendar);
    }

    /**
     * Get reviews list.
     */
    public function reviews($slug)
    {
        $property = Property::where('slug', $slug)->firstOrFail();

        $reviews = $property->reviews()
            ->with('user:id,name,avatar')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($reviews);
    }
}
