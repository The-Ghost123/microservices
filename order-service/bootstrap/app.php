<?php

// bootstrap/app.php
// Titik konfigurasi utama aplikasi Laravel: routing, middleware, dan penanganan error.

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        apiPrefix: '', // endpoint tanpa awalan /api, sesuai spesifikasi
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Semua response error dibalas format JSON
        $exceptions->shouldRenderJsonWhen(fn (Request $request, Throwable $e) => true);

        // Kustomisasi response validasi sesuai format spesifikasi (422)
        $exceptions->render(function (ValidationException $e, Request $request) {
            return response()->json([
                'message' => 'Data yang dikirim tidak valid',
                'errors' => $e->errors(),
            ], 422);
        });

        // Tangani endpoint atau resource yang tidak ditemukan (404)
        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            return response()->json([
                'message' => $e->getMessage() ?: 'Endpoint tidak ditemukan',
            ], 404);
        });
    })->create();
