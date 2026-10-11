<?php

// app/Services/CartService.php
// Lapisan service: tempat logika bisnis keranjang.
// Dipanggil oleh controller, memakai model untuk mengakses data.
// Tidak mengenal request atau response HTTP sama sekali, jadi mudah dipakai ulang dan dites.

namespace App\Services;

use App\Exceptions\CartItemNotFoundException;
use App\Models\CartItem;

class CartService
{
    // Isi keranjang satu user beserta total jumlah barangnya.
    public function getCart(int $userId): array
    {
        $items = CartItem::forUser($userId)->get();

        return [
            'user_id' => $userId,
            'items' => $items,
            'total_quantity' => $items->sum('quantity'),
        ];
    }

    // Tambah item. Kalau produk yang sama sudah ada di keranjang user, jumlahnya ditambah.
    public function addItem(int $userId, int $productId, int $quantity): CartItem
    {
        $item = CartItem::firstOrNew(['user_id' => $userId, 'product_id' => $productId]);
        $item->quantity = ($item->exists ? $item->quantity : 0) + $quantity;
        $item->save();

        return $item;
    }

    // Ubah jumlah item. Melempar exception kalau id tidak ditemukan.
    public function updateQuantity(int $id, int $quantity): CartItem
    {
        $item = CartItem::find($id);
        if (! $item) {
            throw new CartItemNotFoundException($id);
        }

        $item->update(['quantity' => $quantity]);

        return $item;
    }

    // Hapus satu item. Melempar exception kalau id tidak ditemukan.
    public function removeItem(int $id): void
    {
        if (CartItem::destroy($id) === 0) {
            throw new CartItemNotFoundException($id);
        }
    }

    // Kosongkan keranjang satu user. Balikin jumlah item yang terhapus.
    public function clearCart(int $userId): int
    {
        return CartItem::where('user_id', $userId)->delete();
    }
}
