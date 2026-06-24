<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\PropertyImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PropertyController extends Controller
{
    /**
     * List all properties managed by this user.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $properties = Property::where('user_id', $user->id)
            ->with(['images', 'roomTypes'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($properties);
    }

    /**
     * Store a new property.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:hotel,villa,homestay',
            'description' => 'nullable|string',
            'address' => 'required|string',
            'city' => 'required|string|max:100',
            'province' => 'required|string|max:100',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'amenities' => 'nullable|array',
            'status' => 'required|in:active,inactive',
        ]);

        // Generate unique slug
        $slug = Str::slug($validated['name']);
        $originalSlug = $slug;
        $count = 1;
        while (Property::where('slug', $slug)->exists()) {
            $slug = "{$originalSlug}-" . $count++;
        }

        $thumbnailPath = null;
        if ($request->hasFile('thumbnail')) {
            $thumbnailPath = $request->file('thumbnail')->store('properties/thumbnails', 'public');
        }

        $property = Property::create([
            'user_id' => $user->id,
            'name' => $validated['name'],
            'slug' => $slug,
            'type' => $validated['type'],
            'description' => $validated['description'] ?? null,
            'address' => $validated['address'],
            'city' => $validated['city'],
            'province' => $validated['province'],
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'thumbnail' => $thumbnailPath,
            'amenities' => $validated['amenities'] ?? [],
            'status' => $validated['status'],
        ]);

        return response()->json([
            'message' => 'Properti berhasil ditambahkan.',
            'property' => $property
        ], 201);
    }

    /**
     * Show a property details.
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $property = Property::where('id', $id)
            ->where('user_id', $user->id)
            ->with(['images', 'roomTypes.images'])
            ->firstOrFail();

        return response()->json($property);
    }

    /**
     * Update property.
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $property = Property::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:hotel,villa,homestay',
            'description' => 'nullable|string',
            'address' => 'required|string',
            'city' => 'required|string|max:100',
            'province' => 'required|string|max:100',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'amenities' => 'nullable|array',
            'status' => 'required|in:active,inactive',
        ]);

        // Generate slug if name changed
        if ($property->name !== $validated['name']) {
            $slug = Str::slug($validated['name']);
            $originalSlug = $slug;
            $count = 1;
            while (Property::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                $slug = "{$originalSlug}-" . $count++;
            }
            $property->slug = $slug;
        }

        if ($request->hasFile('thumbnail')) {
            if ($property->thumbnail) {
                Storage::disk('public')->delete($property->thumbnail);
            }
            $property->thumbnail = $request->file('thumbnail')->store('properties/thumbnails', 'public');
        }

        $property->name = $validated['name'];
        $property->type = $validated['type'];
        $property->description = $validated['description'] ?? null;
        $property->address = $validated['address'];
        $property->city = $validated['city'];
        $property->province = $validated['province'];
        $property->latitude = $validated['latitude'] ?? null;
        $property->longitude = $validated['longitude'] ?? null;
        $property->amenities = $validated['amenities'] ?? [];
        $property->status = $validated['status'];
        
        $property->save();

        return response()->json([
            'message' => 'Properti berhasil diperbarui.',
            'property' => $property
        ]);
    }

    /**
     * Delete property.
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $property = Property::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // Delete files
        if ($property->thumbnail) {
            Storage::disk('public')->delete($property->thumbnail);
        }

        foreach ($property->images as $image) {
            Storage::disk('public')->delete($image->image_path);
        }

        $property->delete();

        return response()->json([
            'message' => 'Properti berhasil dihapus.'
        ]);
    }

    /**
     * Upload property gallery images.
     */
    public function uploadImages(Request $request, $id)
    {
        $user = $request->user();
        $property = Property::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $request->validate([
            'images' => 'required|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048', // max 2MB
        ]);

        $uploadedImages = [];
        if ($request->hasFile('images')) {
            $images = $request->file('images');
            
            // Get last order
            $lastOrder = PropertyImage::where('property_id', $property->id)->max('order') ?? 0;

            foreach ($images as $image) {
                $lastOrder++;
                $path = $image->store('properties/gallery', 'public');
                
                $propImg = PropertyImage::create([
                    'property_id' => $property->id,
                    'image_path' => $path,
                    'order' => $lastOrder,
                ]);

                $uploadedImages[] = $propImg;
            }
        }

        return response()->json([
            'message' => 'Gambar galeri berhasil diunggah.',
            'images' => $uploadedImages
        ]);
    }

    /**
     * Delete specific property gallery image.
     */
    public function deleteImage(Request $request, $propertyId, $imageId)
    {
        $user = $request->user();
        $property = Property::where('id', $propertyId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $image = PropertyImage::where('id', $imageId)
            ->where('property_id', $property->id)
            ->firstOrFail();

        Storage::disk('public')->delete($image->image_path);
        $image->delete();

        return response()->json([
            'message' => 'Gambar berhasil dihapus dari galeri.'
        ]);
    }
}
