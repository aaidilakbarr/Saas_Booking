<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PropertyImage extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'property_id',
        'image_path',
        'order',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }
}
