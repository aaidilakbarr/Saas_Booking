<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'type',
        'description',
        'address',
        'city',
        'province',
        'latitude',
        'longitude',
        'thumbnail',
        'amenities',
        'status',
    ];

    protected $casts = [
        'amenities' => 'array', // automatically casts JSON column to array
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    public function manager()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function images()
    {
        return $this->hasMany(PropertyImage::class)->orderBy('order');
    }

    public function roomTypes()
    {
        return $this->hasMany(RoomType::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
