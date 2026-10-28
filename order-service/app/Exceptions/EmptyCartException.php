<?php

// app/Exceptions/EmptyCartException.php
// Dilempar oleh OrderService jika keranjang belanja pengguna kosong saat checkout.

namespace App\Exceptions;

use RuntimeException;

class EmptyCartException extends RuntimeException
{
    public function __construct(string $message = 'Keranjang belanja masih kosong')
    {
        parent::__construct($message);
    }
}
