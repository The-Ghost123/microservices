<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderDetailAndPaymentTest extends TestCase
{
    use RefreshDatabase;

    private function createDummyOrder(int $userId = 7, string $status = 'PENDING'): Order
    {
        $order = Order::create([
            'user_id' => $userId,
            'status' => $status,
            'total_amount' => 450000,
        ]);

        $order->items()->create([
            'product_id' => 1,
            'product_name' => 'Keyboard Mekanikal',
            'unit_price' => 450000,
            'quantity' => 1,
            'subtotal' => 450000,
        ]);

        return $order->load('items');
    }

    /**
     * Test GET /orders/{id} berhasil mengambil detail pesanan.
     */
    public function test_get_order_detail_success(): void
    {
        $order = $this->createDummyOrder();

        $response = $this->getJson("/orders/{$order->id}");

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Berhasil mengambil pesanan')
            ->assertJsonPath('data.id', $order->id)
            ->assertJsonPath('data.status', 'PENDING')
            ->assertJsonCount(1, 'data.items');
    }

    /**
     * Test GET /orders/{id} gagal 404 jika pesanan tidak ditemukan.
     */
    public function test_get_order_detail_not_found(): void
    {
        $response = $this->getJson('/orders/999');

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'Pesanan dengan id 999 tidak ditemukan',
            ]);
    }

    /**
     * Test GET /orders/{id} gagal 404 jika id bukan angka.
     */
    public function test_get_order_detail_invalid_id_not_numeric(): void
    {
        $response = $this->getJson('/orders/abc');

        $response->assertStatus(404);
    }

    /**
     * Test GET /orders/user/{userId} sukses mengambil list pesanan user.
     */
    public function test_get_user_orders_success(): void
    {
        $this->createDummyOrder(7, 'PENDING');
        $this->createDummyOrder(7, 'PAID');

        $response = $this->getJson('/orders/user/7');

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Berhasil mengambil daftar pesanan')
            ->assertJsonCount(2, 'data');
    }

    /**
     * Test GET /orders/user/{userId}?status=PENDING filter status berhasil.
     */
    public function test_get_user_orders_filtered_by_status(): void
    {
        $this->createDummyOrder(7, 'PENDING');
        $this->createDummyOrder(7, 'PAID');

        $response = $this->getJson('/orders/user/7?status=PENDING');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.status', 'PENDING');
    }

    /**
     * Test GET /orders/user/{userId}?status=SHIPPED gagal 422 karena nilai status tidak valid.
     */
    public function test_get_user_orders_invalid_status_returns_422(): void
    {
        $response = $this->getJson('/orders/user/7?status=SHIPPED');

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Data yang dikirim tidak valid')
            ->assertJsonStructure(['errors' => ['status']]);
    }

    /**
     * Test PATCH /orders/{id}/pay berhasil mengubah status dari PENDING ke PAID.
     */
    public function test_pay_order_success(): void
    {
        $order = $this->createDummyOrder(7, 'PENDING');

        $response = $this->patchJson("/orders/{$order->id}/pay");

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Pesanan berhasil dibayar')
            ->assertJsonPath('data.id', $order->id)
            ->assertJsonPath('data.status', 'PAID');

        $this->assertEquals('PAID', $order->fresh()->status);
    }

    /**
     * Test PATCH /orders/{id}/pay gagal 409 jika status sudah PAID.
     */
    public function test_pay_order_fails_when_already_paid(): void
    {
        $order = $this->createDummyOrder(7, 'PAID');

        $response = $this->patchJson("/orders/{$order->id}/pay");

        $response->assertStatus(409)
            ->assertJson([
                'message' => 'Pesanan berstatus PAID, hanya pesanan PENDING yang dapat dibayar',
            ]);
    }

    /**
     * Test PATCH /orders/{id}/pay gagal 404 jika pesanan tidak ada.
     */
    public function test_pay_order_not_found(): void
    {
        $response = $this->patchJson('/orders/999/pay');

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'Pesanan dengan id 999 tidak ditemukan',
            ]);
    }
}
