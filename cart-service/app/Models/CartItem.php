<?php

// app/Models/CartItem.php
// Lapisan model: mendefinisikan tabel cart_items dan scope query yang bisa dipakai ulang.
// Logika bisnis ada di CartService, bukan di sini.

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    // Kolom yang boleh diisi massal lewat create() atau firstOrNew(), pengaman mass assignment.
    protected $fillable = ['user_id', 'product_id', 'quantity'];

    // Scope: dipakai sebagai CartItem::forUser($id)->get(). Item milik satu user, terbaru di atas.
    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId)->latest();
    }
}
