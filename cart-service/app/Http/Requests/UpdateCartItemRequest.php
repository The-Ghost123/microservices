<?php

// app/Http/Requests/UpdateCartItemRequest.php
// Aturan validasi untuk PUT /carts/items/{id}: hanya quantity yang boleh diubah.

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCartItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'quantity' => 'required|integer|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'Field :attribute wajib diisi',
            'integer' => 'Field :attribute harus berupa angka bulat',
            'min' => 'Field :attribute minimal bernilai :min',
        ];
    }
}
