// src/api/http.js
// Pembungkus fetch yang dipakai semua client API: timeout, parsing JSON,
// dan penyeragaman error menjadi satu bentuk (ApiError).

const TIMEOUT_MS = 5000

export class ApiError extends Error {
  constructor(message, { status = 0, errors = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status // 0 berarti permintaan tidak sampai ke server
    this.errors = errors // kesalahan validasi per field (status 422)
  }
}

export async function request(baseUrl, path, { method = 'GET', body } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    // Semua service membalas JSON. Jaga-jaga kalau ada balasan yang bukan JSON.
    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      throw new ApiError(payload?.message ?? `Permintaan gagal (${response.status})`, {
        status: response.status,
        errors: payload?.errors ?? null,
      })
    }

    return payload
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error.name === 'AbortError') throw new ApiError('Server terlalu lama menjawab')
    // fetch hanya melempar error untuk kegagalan jaringan,
    // termasuk permintaan yang diblokir CORS.
    throw new ApiError('Tidak dapat terhubung ke server')
  } finally {
    clearTimeout(timer)
  }
}
