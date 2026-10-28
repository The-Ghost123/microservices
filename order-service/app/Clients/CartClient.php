<?php

// app/Clients/CartClient.php
// Lapisan client: bertanggung jawab untuk berkomunikasi dengan cart-service via HTTP REST API.
// Digunakan untuk mengambil isi keranjang belanja user dan mengosongkan keranjang setelah checkout.

namespace App\Clients;

use App\Exceptions\CartServiceUnavailableException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class CartClient
{
    private string $baseUrl;
    private int $timeout;

    public function __construct(?string $baseUrl = null, ?int $timeout = null)
    {
        $this->baseUrl = rtrim($baseUrl ?? config('services.carts.url', 'http://cart-service:3001'), '/');
        $this->timeout = $timeout ?? (int) config('services.carts.timeout', 5);
    }

    /**
     * Mengambil data keranjang user dari cart-service.
     * Mengembalikan list items di dalam keranjang belanja.
     *
     * @return array<int, array{product_id: int, quantity: int}>
     *
     * @throws CartServiceUnavailableException
     */
    public function getCart(int $userId): array
    {
        $url = "{$this->baseUrl}/carts/{$userId}";

        try {
            $response = Http::timeout($this->timeout)->get($url);
        } catch (ConnectionException $e) {
            Log::error("Koneksi ke cart-service gagal: {$e->getMessage()}", [
                'url' => $url,
                'user_id' => $userId,
                'timeout' => $this->timeout,
            ]);

            throw new CartServiceUnavailableException(
                'Cart service tidak dapat dihubungi, coba lagi nanti',
                503,
                $e
            );
        } catch (Throwable $e) {
            Log::error("Error saat memanggil cart-service: {$e->getMessage()}", [
                'url' => $url,
                'user_id' => $userId,
            ]);

            throw new CartServiceUnavailableException(
                'Cart service tidak dapat dihubungi, coba lagi nanti',
                503,
                $e
            );
        }

        if (! $response->successful()) {
            Log::error("Cart-service membalas status error {$response->status()}", [
                'url' => $url,
                'body' => $response->body(),
            ]);

            throw new CartServiceUnavailableException(
                'Cart service tidak dapat dihubungi, coba lagi nanti',
                503
            );
        }

        $body = $response->json();
        $items = $body['data']['items'] ?? [];

        return is_array($items) ? $items : [];
    }

    /**
     * Meminta cart-service mengosongkan keranjang belanja user setelah pesanan berhasil dibuat.
     * Jika terjadi kegagalan, tidak melempar exception agar pesanan yang sudah tersimpan tidak dibatalkan,
     * melainkan mencatat kegagalan di log dan mengembalikan false sesuai ketentuan tugas.
     */
    public function clearCart(int $userId): bool
    {
        $url = "{$this->baseUrl}/carts/{$userId}";

        try {
            $response = Http::timeout($this->timeout)->delete($url);

            if ($response->successful()) {
                return true;
            }

            Log::warning("Gagal mengosongkan keranjang user {$userId} di cart-service", [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return false;
        } catch (Throwable $e) {
            Log::warning("Gagal mengosongkan keranjang user {$userId} karena kendala koneksi", [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }
}
