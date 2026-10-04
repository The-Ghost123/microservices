/**
 * Validasi field `image` Base64.
 *
 * Urutan validasi:
 *  1. Kosong / null / undefined  → 400 "Field image wajib diisi"
 *  2. Bukan Base64 valid          → 400 "Field image harus berupa Base64 yang valid"
 *  3. Ukuran decoded > 2 MB       → 400 "Ukuran image maksimal 2 MB"
 *
 * @param {string|undefined|null} image - Nilai image dari request body
 * @returns {{ valid: boolean, error?: string, clean?: string }}
 */
function validateImage(image) {
    // 1. Cek kosong
    if (image === undefined || image === null || image === '') {
        return { valid: false, error: 'Field image wajib diisi' };
    }

    // Bersihkan prefix Data URI jika ada  (contoh: "data:image/png;base64,...")
    const clean = String(image).replace(/^data:[^;]+;base64,/, '');

    // 2. Cek format Base64 valid: hanya karakter Base64 + padding habis dibagi 4
    const BASE64_REGEX = /^[A-Za-z0-9+/]+={0,2}$/;
    if (!BASE64_REGEX.test(clean) || clean.length % 4 !== 0) {
        return { valid: false, error: 'Field image harus berupa Base64 yang valid' };
    }

    // 3. Cek ukuran hasil decode ≤ 2 MB
    const MAX_BYTES = 2 * 1024 * 1024; // 2.097.152 byte
    const decodedBytes = Buffer.byteLength(clean, 'base64');
    if (decodedBytes > MAX_BYTES) {
        return { valid: false, error: 'Ukuran image maksimal 2 MB' };
    }

    return { valid: true, clean };
}

module.exports = { validateImage };
