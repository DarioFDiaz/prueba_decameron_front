/** Valores vacíos con los que empieza el formulario de creación. */
export const emptyHotel = {
  name: '',
  address: '',
  city: '',
  nit: '',
  room_count: '',
  accommodations: [{ room_type_id: '', accommodation_id: '', quantity: '' }],
}

/** Convierte un hotel de la API al formato que usa el formulario. */
export function hotelToForm(hotel) {
  return {
    name: hotel.name,
    address: hotel.address,
    city: hotel.city,
    nit: hotel.nit,
    room_count: String(hotel.room_count),
    accommodations: hotel.accommodations.map((row) => ({
      room_type_id: String(row.room_type.id),
      accommodation_id: String(row.accommodation.id),
      quantity: String(row.quantity),
    })),
  }
}
