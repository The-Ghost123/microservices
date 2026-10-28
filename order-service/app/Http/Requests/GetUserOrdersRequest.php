<?php

// app/Http/Requests/GetUserOrdersRequest.php
// Lapisan Form Request: memvalidasi parameter query untuk GET /orders/user/{userId}.

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class GetUserOrdersRequest extends FormRequest
{
    /**
     * Semua request diizinkan tanpa autentikasi.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Aturan validasi query parameter status.
     * Status bersifat opsional, namun jika diisi harus bernilai PENDING atau PAID.
     */
    public function rules(): array
    {
        return [
            'status' => ['nullable', 'string', 'in:PENDING,PAID'],
        ];
    }

    /**
     * Pesan kesalahan khusus sesuai spesifikasi API.
     */
    public function messages(): array
    {
        return [
            'in' => 'Status harus PENDING atau PAID',
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
