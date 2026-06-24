<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomTypeImage extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'room_type_id',
        'image_path',
        'order',
    ];

    public function roomType()
    {
        return $this->belongsTo(RoomType::class);
    }
}
