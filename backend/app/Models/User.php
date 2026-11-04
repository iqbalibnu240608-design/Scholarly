<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'role_name',
        'identifier_number',
        'phone',
        'gender',
        'avatar',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Check if user has specific role or one of given roles
     */
    public function hasRole(string|array $roles): bool
    {
        if (is_string($roles)) {
            $roles = [$roles];
        }

        return in_array($this->role_name, $roles, true);
    }

    /**
     * Check if user has a permission
     */
    public function hasPermission(string $permissionName): bool
    {
        if ($this->role_name === 'admin') {
            return true;
        }

        if (!$this->relationLoaded('role')) {
            $this->load('role.permissions');
        }

        return $this->role?->permissions->contains('name', $permissionName) ?? false;
    }

    public function isSiswa(): bool { return $this->role_name === 'siswa'; }
    public function isGuru(): bool { return $this->role_name === 'guru'; }
    public function isPetugas(): bool { return $this->role_name === 'petugas'; }
    public function isKepsek(): bool { return $this->role_name === 'kepsek'; }
    public function isKopsis(): bool { return $this->role_name === 'kopsis'; }
    public function isKantin(): bool { return $this->role_name === 'kantin'; }
    public function isAdmin(): bool { return $this->role_name === 'admin'; }
}
