import { request } from './http'

/** Busca hoteles por nombre o NIT y trae la página indicada. */
export function fetchHotels({ search = '', page = 1, signal }) {
  const params = new URLSearchParams({ page: String(page), per_page: '10' })

  if (search) {
    params.set('search', search)
  }

  return request(`/hotels?${params.toString()}`, { signal })
}

/** Trae el detalle de un hotel. */
export function fetchHotel(id, signal) {
  return request(`/hotels/${id}`, { signal })
}

/** Crea un hotel. */
export function createHotel(payload) {
  return request('/hotels', { method: 'POST', body: payload })
}

/** Actualiza un hotel. */
export function updateHotel(id, payload) {
  return request(`/hotels/${id}`, { method: 'PUT', body: payload })
}

/** Elimina un hotel. */
export function deleteHotel(id) {
  return request(`/hotels/${id}`, { method: 'DELETE' })
}

/** Trae los tipos de habitación y sus acomodaciones permitidas. */
export function fetchRoomTypes(signal) {
  return request('/room-types', { signal })
}
