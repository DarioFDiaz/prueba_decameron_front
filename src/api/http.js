const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

/** Error de la API, con el código HTTP y los mensajes por campo. */
export class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

/** Llama a la API y convierte los errores de validación en una excepción. */
export async function request(path, { method = 'GET', body, signal } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    signal,
    headers: {
      Accept: 'application/json',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (response.status === 204) {
    return null
  }

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new ApiError(
      payload.message || 'No se pudo completar la operación.',
      response.status,
      payload.errors || {},
    )
  }

  return payload
}
