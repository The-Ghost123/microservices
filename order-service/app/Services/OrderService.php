<?php

// app/Services/OrderService.php
// Lapisan service: mengimplementasikan seluruh aturan bisnis transaksi pesanan.
// Bertanggung jawab atas alur checkout, validasi aturan bisnis (keranjang kosong, stok, produk),
// database transaction, snapshot harga produk, dan pembayaran.
// Service tidak berinteraksi langsung dengan HTTP request maupun response.

namespace App\Services;

use App\Clients\CartClient;
use App\Clients\ProductClient;
use App\Exceptions\EmptyCartException;
use App\Exceptions\InsufficientStockException;
use App\Exceptions\InvalidOrderStatusException;
use App\Exceptions\OrderNotFoundException;
use App\Exceptions\ProductNotFoundException;
use App\Models\Order;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function __construct(
        private CartClient $cartClient,
        private ProductClient $productClient
    ) {
    }

    /**
     * Alur checkout:
     * 1. Ambil isi keranjang user dari cart-service
     * 2. Periksa apakah keranjang kosong
     * 3. Validasi keberadaan setiap produk dan kecukupan stok di product-service
     * 4. Simpan pesanan & snapshot item pesanan dalam DB::transaction
     * 5. Minta cart-service mengosongkan keranjang
     * 6. Kembalikan data pesanan lengkap dengan relasi item-itemnya
     */
    public function checkout(int $userId): Order
    {
        // 1. Ambil isi keranjang user
        $cartItems = $this->cartClient->getCart($userId);

        // 2. Periksa aturan bisnis: keranjang tidak boleh kosong
        if (empty($cartItems)) {
            throw new EmptyCartException('Keranjang belanja masih kosong');
        }

        // 3. Periksa setiap produk dan hitung snapshot item
        $preparedItems = [];
        $totalAmount = 0.0;

        foreach ($cartItems as $item) {
            $productId = (int) ($item['product_id'] ?? 0);
            $quantity = (int) ($item['quantity'] ?? 0);

            $product = $this->productClient->getProduct($productId);

            // Validasi produk ada di product-service
            if (! $product) {
                throw new ProductNotFoundException($productId);
            }

            // Validasi kecukupan stok
            $stock = (int) ($product['stock'] ?? 0);
            $productName = (string) ($product['name'] ?? "Produk #{$productId}");

            if ($quantity > $stock) {
                throw new InsufficientStockException($productName, $quantity, $stock);
            }

            // Snapshot harga produk diubah ke angka (float)
            $unitPrice = (float) ($product['price'] ?? 0);
            $subtotal = $unitPrice * $quantity;
            $totalAmount += $subtotal;

            $preparedItems[] = [
                'product_id' => $productId,
                'product_name' => $productName,
                'unit_price' => $unitPrice,
                'quantity' => $quantity,
                'subtotal' => $subtotal,
            ];
        }

        // 4. Simpan pesanan dan snapshot item dalam satu transaksi database
        $order = DB::transaction(function () use ($userId, $totalAmount, $preparedItems) {
            $order = Order::create([
                'user_id' => $userId,
                'status' => 'PENDING',
                'total_amount' => $totalAmount,
            ]);

            foreach ($preparedItems as $itemData) {
                $order->items()->create($itemData);
            }

            return $order;
        });

        // 5. Minta cart-service mengosongkan keranjang user
        // Catatan: Jika gagal, pesanan tetap 201 dan kegagalan dicatat di log (ditangani di CartClient)
        $this->cartClient->clearCart($userId);

        // 6. Muat relasi items untuk dikembalikan
        return $order->load('items');
    }

    /**
     * Mengambil detail satu pesanan beserta item-itemnya.
     */
    public function getOrder(int $id): Order
    {
        $order = Order::with('items')->find($id);

        if (! $order) {
            throw new OrderNotFoundException($id);
        }

        return $order;
    }

    /**
     * Mengambil daftar pesanan satu user, diurutkan terbaru di atas.
     * Mendukung filter opsional berdasarkan status.
     *
     * @return Collection<int, Order>
     */
    public function getUserOrders(int $userId, ?string $status = null): Collection
    {
        $query = Order::forUser($userId)->with('items')->latest();

        if ($status !== null && $status !== '') {
            $query->where('status', $status);
        }

        return $query->get();
    }

    /**
     * Memproses simulasi pembayaran pesanan dari PENDING menjadi PAID.
     */
    public function payOrder(int $id): Order
    {
        $order = Order::with('items')->find($id);

        if (! $order) {
            throw new OrderNotFoundException($id);
        }

        if ($order->status !== 'PENDING') {
            throw new InvalidOrderStatusException($order->status);
        }

        $order->update(['status' => 'PAID']);

        return $order->fresh('items');
    }
}
