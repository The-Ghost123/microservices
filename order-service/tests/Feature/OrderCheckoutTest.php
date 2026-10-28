<?php

namespace Tests\Feature;

use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class OrderCheckoutTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Skenario Sukses: Checkout membuat order dan snapshot item dari cart-service & product-service.
     */
    public function test_checkout_successfully_creates_order_and_snapshots_items(): void
    {
        Http::fake([
            'http://cart-service:3001/carts/7' => Http::response([
                'message' => 'Berhasil mengambil keranjang',
                'data' => [
                    'user_id' => 7,
                    'items' => [
                        ['id' => 1, 'user_id' => 7, 'product_id' => 1, 'quantity' => 2],
                        ['id' => 2, 'user_id' => 7, 'product_id' => 2, 'quantity' => 1],
                    ],
                    'total_quantity' => 3,
                ],
            ], 200),

            'http://product-service:3000/products/1' => Http::response([
                'message' => 'Berhasil mengambil produk',
                'data' => [
                    'id' => 1,
                    'name' => 'Keyboard Mekanikal',
                    'price' => '450000.00',
                    'stock' => 25,
                ],
            ], 200),

            'http://product-service:3000/products/2' => Http::response([
                'message' => 'Berhasil mengambil produk',
                'data' => [
                    'id' => 2,
                    'name' => 'Mouse Wireless',
                    'price' => '150000.00',
                    'stock' => 40,
                ],
            ], 200),

            'http://cart-service:3001/carts/7' => function ($request) {
                if ($request->method() === 'DELETE') {
                    return Http::response(['message' => 'Keranjang berhasil dikosongkan', 'data' => ['deleted_items' => 2]], 200);
                }
                return Http::response([
                    'message' => 'Berhasil mengambil keranjang',
                    'data' => [
                        'user_id' => 7,
                        'items' => [
                            ['id' => 1, 'user_id' => 7, 'product_id' => 1, 'quantity' => 2],
                            ['id' => 2, 'user_id' => 7, 'product_id' => 2, 'quantity' => 1],
                        ],
                    ],
                ], 200);
            },
        ]);

        $response = $this->postJson('/orders', ['user_id' => 7]);

        $response->assertStatus(201)
            ->assertJsonPath('message', 'Pesanan berhasil dibuat')
            ->assertJsonPath('data.user_id', 7)
            ->assertJsonPath('data.status', 'PENDING')
            ->assertJsonPath('data.total_amount', 1050000)
            ->assertJsonCount(2, 'data.items')
            ->assertJsonPath('data.items.0.product_name', 'Keyboard Mekanikal')
            ->assertJsonPath('data.items.0.unit_price', 450000)
            ->assertJsonPath('data.items.0.subtotal', 900000);

        $this->assertDatabaseHas('orders', [
            'user_id' => 7,
            'status' => 'PENDING',
            'total_amount' => 1050000,
        ]);
    }

    /**
     * Skenario Gagal 422: Body tanpa user_id.
     */
    public function test_checkout_fails_validation_when_user_id_missing(): void
    {
        $response = $this->postJson('/orders', []);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'message',
                'errors' => ['user_id'],
            ]);
    }

    /**
     * Skenario Gagal 409: Keranjang belanja kosong.
     */
    public function test_checkout_fails_when_cart_is_empty(): void
    {
        Http::fake([
            'http://cart-service:3001/carts/7' => Http::response([
                'message' => 'Berhasil mengambil keranjang',
                'data' => [
                    'user_id' => 7,
                    'items' => [],
                    'total_quantity' => 0,
                ],
            ], 200),
        ]);

        $response = $this->postJson('/orders', ['user_id' => 7]);

        $response->assertStatus(409)
            ->assertJson([
                'message' => 'Keranjang belanja masih kosong',
            ]);
    }

    /**
     * Skenario Gagal 409: Stok produk tidak mencukupi.
     */
    public function test_checkout_fails_when_stock_insufficient(): void
    {
        Http::fake([
            'http://cart-service:3001/carts/7' => Http::response([
                'message' => 'Berhasil mengambil keranjang',
                'data' => [
                    'user_id' => 7,
                    'items' => [
                        ['id' => 1, 'user_id' => 7, 'product_id' => 3, 'quantity' => 11],
                    ],
                ],
            ], 200),

            'http://product-service:3000/products/3' => Http::response([
                'message' => 'Berhasil mengambil produk',
                'data' => [
                    'id' => 3,
                    'name' => 'Monitor 24 Inch',
                    'price' => '1200000.00',
                    'stock' => 10,
                ],
            ], 200),
        ]);

        $response = $this->postJson('/orders', ['user_id' => 7]);

        $response->assertStatus(409)
            ->assertJson([
                'message' => 'Stok Monitor 24 Inch tidak mencukupi: diminta 11, tersedia 10',
            ]);
    }

    /**
     * Skenario Gagal 409: Produk di keranjang tidak ditemukan di katalog product-service (404).
     */
    public function test_checkout_fails_when_product_not_found(): void
    {
        Http::fake([
            'http://cart-service:3001/carts/7' => Http::response([
                'message' => 'Berhasil mengambil keranjang',
                'data' => [
                    'user_id' => 7,
                    'items' => [
                        ['id' => 1, 'user_id' => 7, 'product_id' => 999, 'quantity' => 1],
                    ],
                ],
            ], 200),

            'http://product-service:3000/products/999' => Http::response([
                'message' => 'Produk tidak ditemukan',
            ], 404),
        ]);

        $response = $this->postJson('/orders', ['user_id' => 7]);

        $response->assertStatus(409)
            ->assertJson([
                'message' => 'Produk dengan id 999 tidak ditemukan',
            ]);
    }

    /**
     * Skenario Gagal 503: Product-service mati / connection refused.
     */
    public function test_checkout_fails_with_503_when_product_service_down(): void
    {
        Http::fake([
            'http://cart-service:3001/carts/7' => Http::response([
                'message' => 'Berhasil mengambil keranjang',
                'data' => [
                    'user_id' => 7,
                    'items' => [
                        ['id' => 1, 'user_id' => 7, 'product_id' => 1, 'quantity' => 1],
                    ],
                ],
            ], 200),

            'http://product-service:3000/products/1' => Http::response('Service Unavailable', 500),
        ]);

        $response = $this->postJson('/orders', ['user_id' => 7]);

        $response->assertStatus(503)
            ->assertJson([
                'message' => 'Product service tidak dapat dihubungi, coba lagi nanti',
            ]);
    }

    /**
     * Skenario Gagal 503: Cart-service mati.
     */
    public function test_checkout_fails_with_503_when_cart_service_down(): void
    {
        Http::fake([
            'http://cart-service:3001/carts/7' => Http::response('Internal Server Error', 500),
        ]);

        $response = $this->postJson('/orders', ['user_id' => 7]);

        $response->assertStatus(503)
            ->assertJson([
                'message' => 'Cart service tidak dapat dihubungi, coba lagi nanti',
            ]);
    }

    /**
     * Skenario Khusus: Jika keranjang gagal dikosongkan setelah pesanan tersimpan,
     * pesanan tidak dibatalkan dan tetap membalas 201.
     */
    public function test_checkout_succeeds_even_if_cart_clear_fails(): void
    {
        Http::fake([
            'http://cart-service:3001/carts/7' => function ($request) {
                if ($request->method() === 'DELETE') {
                    return Http::response('Server Error', 500);
                }
                return Http::response([
                    'message' => 'Berhasil mengambil keranjang',
                    'data' => [
                        'user_id' => 7,
                        'items' => [
                            ['id' => 1, 'user_id' => 7, 'product_id' => 1, 'quantity' => 1],
                        ],
                    ],
                ], 200);
            },

            'http://product-service:3000/products/1' => Http::response([
                'message' => 'Berhasil mengambil produk',
                'data' => [
                    'id' => 1,
                    'name' => 'Keyboard Mekanikal',
                    'price' => '450000.00',
                    'stock' => 10,
                ],
            ], 200),
        ]);

        $response = $this->postJson('/orders', ['user_id' => 7]);

        $response->assertStatus(201)
            ->assertJsonPath('message', 'Pesanan berhasil dibuat');

        $this->assertDatabaseHas('orders', ['user_id' => 7]);
    }
}
