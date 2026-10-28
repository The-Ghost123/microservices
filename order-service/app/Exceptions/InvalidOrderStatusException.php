<?php

// app/Exceptions/InvalidOrderStatusException.php
// Dilempar jika pembayaran dilakukan pada pesanan yang statusnya bukan PENDING.

namespace App\Exceptions;

use RuntimeException;

class InvalidOrderStatusException extends RuntimeException
{
    public function __construct(string $currentStatus)
    {
        parent::__construct("Pesanan berstatus {$currentStatus}, hanya pesanan PENDING yang dapat dibayar");
    }
}
