<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KantinMenu extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category',
        'price',
        'is_available',
        'stall_name',
    ];
}
