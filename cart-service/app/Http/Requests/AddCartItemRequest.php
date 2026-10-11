<?php

// app/Http/Requests/AddCartItemRequest.php
// Aturan validasi untuk POST /carts, dijalankan Laravel sebelum controller dipanggil.
// Kalau gagal, otomatis dibalas 422 beserta pesan kesalahan dan controller tidak sempat jalan.

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddCartItemRequest extends FormRequest
{
    // Belum ada autentikasi di service ini, jadi semua request diizinkan.
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => 'required|integer|min:1',
            'product_id' => 'required|integer|min:1',
            'quantity' => 'sometimes|integer|min:1',
        ];
    }

    // Pesan kesalahan berbahasa Indonesia. Kunci berupa nama aturan, berlaku untuk semua field.
    public function messages(): array
    {
        return [
            'required' => 'Field :attribute wajib diisi',
            'integer' => 'Field :attribute harus berupa angka bulat',
            'min' => 'Field :attribute minimal bernilai :min',
        ];
    }
}
