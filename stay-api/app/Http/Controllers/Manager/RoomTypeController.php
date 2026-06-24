<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\RoomType;
use App\Models\RoomTypeImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RoomTypeController extends Controller
{
    /**
     * List all room types for a specific property.
     */
    public function index(Request $request, $propertyId)
    {
        $user = $request->user();
        
        // Ensure property belongs to PM
        $property = Property::where('id', $propertyId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $roomTypes = RoomType::where('property_id', $property->id)
            ->with('images')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($roomTypes);
    }

    /**
     * Store a new room type.
     */
    public function store(Request $request, $propertyId)
    {
        $user = $request->user();
        
        $property = Property::where('id', $propertyId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'capacity' => 'required|integer|min:1',
            'size_sqm' => 'nullable|numeric|min:1',
            'price_weekday' => 'required|numeric|min:0',
            'price_weekend' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'amenities' => 'nullable|array',
            'status' => 'required|in:available,unavailable',
        ]);

        $roomType = RoomType::create([
            'property_id' => $property->id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'capacity' => $validated['capacity'],
            'size_sqm' => $validated['size_sqm'] ?? null,
            'price_weekday' => $validated['price_weekday'],
            'price_weekend' => $validated['price_weekend'],
            'stock' => $validated['stock'],
            'amenities' => $validated['amenities'] ?? [],
            'status' => $validated['status'],
        ]);

        return response()->json([
            'message' => 'Tipe kamar berhasil ditambahkan.',
            'room_type' => $roomType
        ], 201);
    }

    /**
     * Update room type.
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        
        $roomType = RoomType::with('property')->findOrFail($id);

        // Ensure property belongs to PM
        if ($roomType->property->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'capacity' => 'required|integer|min:1',
            'size_sqm' => 'nullable|numeric|min:1',
            'price_weekday' => 'required|numeric|min:0',
            'price_weekend' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'amenities' => 'nullable|array',
            'status' => 'required|in:available,unavailable',
        ]);

        $roomType->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'capacity' => $validated['capacity'],
            'size_sqm' => $validated['size_sqm'] ?? null,
            'price_weekday' => $validated['price_weekday'],
            'price_weekend' => $validated['price_weekend'],
            'stock' => $validated['stock'],
            'amenities' => $validated['amenities'] ?? [],
            'status' => $validated['status'],
        ]);

        return response()->json([
            'message' => 'Tipe kamar berhasil diperbarui.',
            'room_type' => $roomType
        ]);
    }

    /**
     * Delete room type.
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $roomType = RoomType::with('property')->findOrFail($id);

        if ($roomType->property->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        // Delete associated files
        foreach ($roomType->images as $image) {
            Storage::disk('public')->delete($image->image_path);
        }

        $roomType->delete();

        return response()->json([
            'message' => 'Tipe kamar berhasil dihapus.'
        ]);
    }

    /**
     * Upload room type gallery images.
     */
    public function uploadImages(Request $request, $id)
    {
        $user = $request->user();
        $roomType = RoomType::with('property')->findOrFail($id);

        if ($roomType->property->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $request->validate([
            'images' => 'required|array|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048', // max 2MB
        ]);

        $uploadedImages = [];
        if ($request->hasFile('images')) {
            $images = $request->file('images');
            
            // Get last order
            $lastOrder = RoomTypeImage::where('room_type_id', $roomType->id)->max('order') ?? 0;

            foreach ($images as $image) {
                $lastOrder++;
                $path = $image->store('rooms/gallery', 'public');
                
                $roomImg = RoomTypeImage::create([
                    'room_type_id' => $roomType->id,
                    'image_path' => $path,
                    'order' => $lastOrder,
                ]);

                $uploadedImages[] = $roomImg;
            }
        }

        return response()->json([
            'message' => 'Gambar kamar berhasil diunggah.',
            'images' => $uploadedImages
        ]);
    }
}
