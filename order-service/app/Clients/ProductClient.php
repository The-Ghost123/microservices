<?php

// app/Clients/ProductClient.php
// Lapisan client: bertanggung jawab untuk berkomunikasi dengan product-service via HTTP REST API.
// Membaca URL dari konfigurasi/environment variable, menerapkan timeout <= 5 detik,
// serta menerjemahkan kegagalan jaringan atau server menjadi ProductServiceUnavailableException.

namespace App\Clients;

use App\Exceptions\ProductServiceUnavailableException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class ProductClient
{
    private string $baseUrl;
    private int $timeout;

    public function __construct(?string $baseUrl = null, ?int $timeout = null)
    {
        $this->baseUrl = rtrim($baseUrl ?? config('services.products.url', 'http://product-service:3000'), '/');
        $this->timeout = $timeout ?? (int) config('services.products.timeout', 5);
    }

    /**
     * Mengambil detail produk berdasarkan product_id dari product-service.
     * Mengembalikan array detail produk atau null jika produk tidak ditemukan (404).
     *
     * @throws ProductServiceUnavailableException
     */
    public function getProduct(int $productId): ?array
    {
        $url = "{$this->baseUrl}/products/{$productId}";

        try {
            $response = Http::timeout($this->timeout)->get($url);
        } catch (ConnectionException $e) {
            Log::error("Koneksi ke product-service gagal: {$e->getMessage()}", [
                'url' => $url,
                'product_id' => $productId,
                'timeout' => $this->timeout,
            ]);

            throw new ProductServiceUnavailableException(
                'Product service tidak dapat dihubungi, coba lagi nanti',
                503,
                $e
            );
        } catch (Throwable $e) {
            Log::error("Error saat memanggil product-service: {$e->getMessage()}", [
                'url' => $url,
                'product_id' => $productId,
            ]);

            throw new ProductServiceUnavailableException(
                'Product service tidak dapat dihubungi, coba lagi nanti',
                503,
                $e
            );
        }

        // Jika produk tidak ditemukan di product-service (404)
        if ($response->status() === 404) {
            return null;
        }

        // Jika respons bukan 200 OK
        if (! $response->successful()) {
            Log::error("Product-service membalas status error {$response->status()}", [
                'url' => $url,
                'body' => $response->body(),
            ]);

            throw new ProductServiceUnavailableException(
                'Product service tidak dapat dihubungi, coba lagi nanti',
                503
            );
        }

        $body = $response->json();
        $product = $body['data'] ?? null;

        if (! is_array($product)) {
            Log::error('Format respons product-service tidak sesuai', ['response' => $body]);
            throw new ProductServiceUnavailableException('Product service tidak dapat dihubungi, coba lagi nanti', 503);
        }

        // Ubah harga dari format teks (misal: "450000.00") menjadi angka desimal/float
        if (isset($product['price'])) {
            $product['price'] = (float) $product['price'];
        }

        if (isset($product['stock'])) {
            $product['stock'] = (int) $product['stock'];
        }

        return $product;
    }
}
