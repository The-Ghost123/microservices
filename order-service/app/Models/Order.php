<?php

// app/Models/Order.php
// Lapisan model: merepresentasikan data pesanan pada tabel orders
// serta relasinya dengan order_items.

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    /**
     * Kolom yang dapat diisi secara mass assignment.
     */
    protected $fillable = [
        'user_id',
        'status',
        'total_amount',
    ];

    /**
     * Casting tipe data kolom agar sesuai format response JSON yang diharapkan.
     */
    protected $casts = [
        'user_id' => 'integer',
        'total_amount' => 'float',
    ];

    /**
     * Relasi hasMany ke OrderItem.
     * Satu pesanan dapat memiliki banyak item pesanan.
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    /**
     * Scope untuk menyaring pesanan berdasarkan user_id.
     */
    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }
}
