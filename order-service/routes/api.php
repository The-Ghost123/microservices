<?php

// routes/api.php
// Memetakan method dan path endpoint REST API order-service ke fungsi OrderController.
// Controller menangani request, sedangkan service memproses logika bisnis.

use App\Http\Controllers\OrderController;
use Illuminate\Support\Facades\Route;

// Health check endpoint
Route::get('/health', [OrderController::class, 'health']);

// Checkout: membuat pesanan dari isi keranjang
Route::post('/orders', [OrderController::class, 'store']);

// Detail satu pesanan beserta item-itemnya
Route::get('/orders/{id}', [OrderController::class, 'show'])->whereNumber('id');

// Daftar pesanan satu user (terbaru di atas, filter opsional ?status=)
Route::get('/orders/user/{userId}', [OrderController::class, 'userOrders'])->whereNumber('userId');

// Bayar pesanan (simulasi: PENDING menjadi PAID)
Route::patch('/orders/{id}/pay', [OrderController::class, 'pay'])->whereNumber('id');

// Fallback untuk route yang tidak dikenal atau parameter path non-angka
Route::fallback(function () {
    return response()->json([
        'message' => 'Endpoint tidak ditemukan',
    ], 404);
});
