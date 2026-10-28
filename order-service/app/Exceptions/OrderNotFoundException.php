<?php

// app/Exceptions/OrderNotFoundException.php
// Dilempar jika pesanan dengan id yang dicari tidak ditemukan.

namespace App\Exceptions;

use RuntimeException;

class OrderNotFoundException extends RuntimeException
{
    public function __construct(int|string $id)
    {
        parent::__construct("Pesanan dengan id {$id} tidak ditemukan");
    }
}
