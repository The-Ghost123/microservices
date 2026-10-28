<?php

// app/Exceptions/ProductNotFoundException.php
// Dilempar jika produk di dalam keranjang tidak ditemukan pada product-service (404 dari product-service).

namespace App\Exceptions;

use RuntimeException;

class ProductNotFoundException extends RuntimeException
{
    public function __construct(int|string $productId)
    {
        parent::__construct("Produk dengan id {$productId} tidak ditemukan");
    }
}
