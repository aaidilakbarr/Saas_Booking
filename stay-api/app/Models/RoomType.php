<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoomType extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id',
        'name',
        'description',
        'capacity',
        'size_sqm',
        'price_weekday',
        'price_weekend',
        'stock',
        'amenities',
        'status',
    ];

    protected $casts = [
        'amenities' => 'array',
        'capacity' => 'integer',
        'size_sqm' => 'float',
        'price_weekday' => 'float',
        'price_weekend' => 'float',
        'stock' => 'integer',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function images()
    {
        return $this->hasMany(RoomTypeImage::class)->orderBy('order');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
