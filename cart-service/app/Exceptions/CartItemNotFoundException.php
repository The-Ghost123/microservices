<?php

// app/Exceptions/CartItemNotFoundException.php
// Dilempar oleh CartService kalau item keranjang yang dicari tidak ada.
// Controller menangkapnya dan mengubahnya menjadi response 404.

namespace App\Exceptions;

use RuntimeException;

class CartItemNotFoundException extends RuntimeException
{
    public function __construct(int $id)
    {
        parent::__construct("Item keranjang dengan id {$id} tidak ditemukan");
    }
}
