<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Wallet extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'balance',
        'balance_kopsis',
        'balance_kantin',
    ];

    protected $casts = [
        'balance' => 'decimal:2',
        'balance_kopsis' => 'decimal:2',
        'balance_kantin' => 'decimal:2',
    ];

    protected static function booted()
    {
        static::saving(function ($wallet) {
            // Sinkronkan balance_kopsis dan balance_kantin dengan saldo universal
            if ($wallet->isDirty('balance')) {
                $wallet->balance_kopsis = $wallet->balance;
                $wallet->balance_kantin = $wallet->balance;
            } elseif ($wallet->isDirty('balance_kopsis') && $wallet->isDirty('balance_kantin')) {
                // Jika kedua kolom lama diubah bersamaan (misal alur legacy split)
                $wallet->balance = (float)$wallet->balance_kopsis + (float)$wallet->balance_kantin;
                $wallet->balance_kopsis = $wallet->balance;
                $wallet->balance_kantin = $wallet->balance;
            } elseif ($wallet->isDirty('balance_kopsis')) {
                $wallet->balance = $wallet->balance_kopsis;
                $wallet->balance_kantin = $wallet->balance_kopsis;
            } elseif ($wallet->isDirty('balance_kantin')) {
                $wallet->balance = $wallet->balance_kantin;
                $wallet->balance_kopsis = $wallet->balance_kantin;
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
