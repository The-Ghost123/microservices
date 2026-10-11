<?php

// database/migrations/xxxx_create_cart_items_table.php
// Migration mendefinisikan skema tabel lewat kode, supaya struktur database bisa
// dibuat ulang di komputer manapun dengan satu perintah.

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Dijalankan oleh `php artisan migrate`.
    public function up(): void
    {
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('product_id'); // rujukan ke product-service, bukan foreign key
            $table->unsignedInteger('quantity')->default(1);
            $table->timestamps();

            // Satu produk hanya boleh muncul sekali per keranjang user.
            $table->unique(['user_id', 'product_id']);
        });
    }

    // Dijalankan oleh `php artisan migrate:rollback`.
    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};
