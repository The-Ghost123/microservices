<?php

// app/Models/OrderItem.php
// Lapisan model: menyimpan rincian item pesanan (snapshot produk) pada tabel order_items.

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    /**
     * Kolom yang dapat diisi secara mass assignment.
     */
    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'unit_price',
        'quantity',
        'subtotal',
    ];

    /**
     * Sembunyikan atribut internal agar format response sesuai dengan kontrak JSON spesifikasi.
     */
    protected $hidden = [
        'id',
        'order_id',
        'created_at',
        'updated_at',
    ];

    /**
     * Casting tipe data kolom.
     */
    protected $casts = [
        'product_id' => 'integer',
        'unit_price' => 'float',
        'quantity' => 'integer',
        'subtotal' => 'float',
    ];

    /**
     * Relasi belongsTo ke Order.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }
}
