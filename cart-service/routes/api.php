<?php

// routes/api.php
// Hanya memetakan method dan path ke fungsi controller, tanpa logika apapun.

use App\Http\Controllers\CartController;
use Illuminate\Support\Facades\Route;

Route::get('/carts/{userId}', [CartController::class, 'show'])->whereNumber('userId');
Route::post('/carts', [CartController::class, 'store']);
Route::put('/carts/items/{id}', [CartController::class, 'update'])->whereNumber('id');
Route::delete('/carts/items/{id}', [CartController::class, 'destroy'])->whereNumber('id');
Route::delete('/carts/{userId}', [CartController::class, 'clear'])->whereNumber('userId');
