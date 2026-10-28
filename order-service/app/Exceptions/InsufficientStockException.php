<?php

// app/Exceptions/InsufficientStockException.php
// Dilempar jika kuantitas item yang dipesan melebihi stok yang tersedia di product-service.

namespace App\Exceptions;

use RuntimeException;

class InsufficientStockException extends RuntimeException
{
    public function __construct(string $productName, int $requested, int $available)
    {
        parent::__construct("Stok {$productName} tidak mencukupi: diminta {$requested}, tersedia {$available}");
    }
}
