<?php

// app/Http/Controllers/OrderController.php
// Lapisan controller: menerima request HTTP, memanggil OrderService,
// menangani exception menggunakan blok try-catch, dan membentuk response JSON yang konsisten.
// Tidak ada aturan bisnis atau query database langsung di sini.

namespace App\Http\Controllers;

use App\Exceptions\CartServiceUnavailableException;
use App\Exceptions\EmptyCartException;
use App\Exceptions\InsufficientStockException;
use App\Exceptions\InvalidOrderStatusException;
use App\Exceptions\OrderNotFoundException;
use App\Exceptions\ProductNotFoundException;
use App\Exceptions\ProductServiceUnavailableException;
use App\Http\Requests\CreateOrderRequest;
use App\Http\Requests\GetUserOrdersRequest;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Throwable;

class OrderController extends Controller
{
    public function __construct(private OrderService $orderService)
    {
    }

    /**
     * GET /health
     * Mengecek ketersediaan service.
     */
    public function health(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'service' => 'order-service',
        ], 200);
    }

    /**
     * POST /orders
     * Alur checkout: membuat pesanan baru dari isi keranjang belanja.
     */
    public function store(CreateOrderRequest $request): JsonResponse
    {
        try {
            $userId = (int) $request->validated()['user_id'];
            $order = $this->orderService->checkout($userId);

            return response()->json([
                'message' => 'Pesanan berhasil dibuat',
                'data' => $order,
            ], 201);
        } catch (EmptyCartException|ProductNotFoundException|InsufficientStockException $e) {
            // Pelanggaran aturan bisnis menghasilkan kode status 409 Conflict
            return response()->json([
                'message' => $e->getMessage(),
            ], 409);
        } catch (CartServiceUnavailableException|ProductServiceUnavailableException $e) {
            // Layanan eksternal tidak dapat dihubungi menghasilkan 503 Service Unavailable
            return $this->serviceUnavailableResponse($e);
        } catch (Throwable $e) {
            return $this->errorResponse($e, 'membuat pesanan');
        }
    }

    /**
     * GET /orders/{id}
     * Detail satu pesanan beserta snapshot item-itemnya.
     */
    public function show(mixed $id): JsonResponse
    {
        if (! is_numeric($id)) {
            return response()->json(['message' => "Pesanan dengan id {$id} tidak ditemukan"], 404);
        }

        try {
            $order = $this->orderService->getOrder((int) $id);

            return response()->json([
                'message' => 'Berhasil mengambil pesanan',
                'data' => $order,
            ], 200);
        } catch (OrderNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        } catch (Throwable $e) {
            return $this->errorResponse($e, 'mengambil pesanan');
        }
    }

    /**
     * GET /orders/user/{userId}
     * Daftar pesanan satu pengguna, terbaru di atas, dengan filter status opsional.
     */
    public function userOrders(GetUserOrdersRequest $request, mixed $userId): JsonResponse
    {
        if (! is_numeric($userId)) {
            return response()->json(['message' => 'User id tidak valid'], 404);
        }

        try {
            $status = $request->validated('status');
            $orders = $this->orderService->getUserOrders((int) $userId, $status);

            return response()->json([
                'message' => 'Berhasil mengambil daftar pesanan',
                'data' => $orders,
            ], 200);
        } catch (Throwable $e) {
            return $this->errorResponse($e, 'mengambil daftar pesanan');
        }
    }

    /**
     * PATCH /orders/{id}/pay
     * Simulasi pembayaran pesanan dari PENDING menjadi PAID.
     */
    public function pay(mixed $id): JsonResponse
    {
        if (! is_numeric($id)) {
            return response()->json(['message' => "Pesanan dengan id {$id} tidak ditemukan"], 404);
        }

        try {
            $order = $this->orderService->payOrder((int) $id);

            return response()->json([
                'message' => 'Pesanan berhasil dibayar',
                'data' => $order,
            ], 200);
        } catch (OrderNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        } catch (InvalidOrderStatusException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        } catch (Throwable $e) {
            return $this->errorResponse($e, 'memproses pembayaran pesanan');
        }
    }

    /**
     * Format response 503 untuk service eksternal yang gagal atau timeout.
     * Detail teknis hanya dimunculkan jika mode debug (APP_DEBUG=true) aktif.
     */
    private function serviceUnavailableResponse(Throwable $e): JsonResponse
    {
        $body = ['message' => $e->getMessage()];

        if (config('app.debug')) {
            $body['debug'] = [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ];
        }

        return response()->json($body, 503);
    }

    /**
     * Format response 500 untuk error tak terduga.
     * Mencatat pesan log lengkap untuk keperluan pelacakan masalah.
     */
    private function errorResponse(Throwable $e, string $action): JsonResponse
    {
        Log::error("Gagal {$action}: {$e->getMessage()}", [
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
        ]);

        $body = ['message' => "Gagal {$action}"];

        if (config('app.debug')) {
            $body['error'] = $e->getMessage();
            $body['location'] = $e->getFile().':'.$e->getLine();
        }

        return response()->json($body, 500);
    }
}
