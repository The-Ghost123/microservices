<?php

// app/Http/Requests/CreateOrderRequest.php
// Lapisan Form Request: memvalidasi payload request untuk POST /orders.

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class CreateOrderRequest extends FormRequest
{
    /**
     * Layanan saat ini belum memakai autentikasi, jadi semua request diizinkan.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Aturan validasi payload pesanan.
     */
    public function rules(): array
    {
        return [
            'user_id' => ['required', 'integer', 'min:1'],
        ];
    }

    /**
     * Kustomisasi pesan kesalahan validasi dalam bahasa Indonesia sesuai spesifikasi.
     */
    public function messages(): array
    {
        return [
            'required' => 'Field :attribute wajib diisi',
            'integer' => 'Field :attribute harus berupa angka bulat',
            'min' => 'Field :attribute minimal bernilai :min',
        ];
    }

    /**
     * Format response validasi 422 sesuai kontrak spesifikasi.
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'message' => 'Data yang dikirim tidak valid',
            'errors' => $validator->errors(),
        ], 422));
    }
}
