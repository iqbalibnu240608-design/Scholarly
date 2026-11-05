<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Book extends Model
{
    use HasFactory;

    protected $fillable = [
        'isbn',
        'title',
        'author',
        'publisher',
        'category',
        'stock',
        'shelf_location',
        'cover_url',
    ];

    public function loans(): HasMany
    {
        return $this->hasMany(BookLoan::class);
    }
}
