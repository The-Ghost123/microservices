<?php

// app/Exceptions/CartServiceUnavailableException.php
// Dilempar jika cart-service tidak dapat dihubungi, timeout, atau membalas error server (5xx).

namespace App\Exceptions;

use RuntimeException;
use Throwable;

class CartServiceUnavailableException extends RuntimeException
{
    public function __construct(string $message = 'Cart service tidak dapat dihubungi, coba lagi nanti', int $code = 0, ?Throwable $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}
