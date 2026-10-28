<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party & Microservice Connections
    |--------------------------------------------------------------------------
    |
    | Konfigurasi URL dan timeout untuk komunikasi HTTP antar service:
    | - product-service (katalog produk)
    | - cart-service (keranjang belanja)
    |
    */

    'products' => [
        'url' => env('PRODUCT_SERVICE_URL', 'http://product-service:3000'),
        'timeout' => (int) env('PRODUCT_SERVICE_TIMEOUT', 5),
    ],

    'carts' => [
        'url' => env('CART_SERVICE_URL', 'http://cart-service:3001'),
        'timeout' => (int) env('CART_SERVICE_TIMEOUT', 5),
    ],

];
