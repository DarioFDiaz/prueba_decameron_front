import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { deleteHotel, fetchHotel } from '../api/hotels'

/** Muestra los datos de un hotel y sus acomodaciones. */
export default function HotelDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [hotel, setHotel] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const notice = location.state?.notice || ''

  useEffect(() => {
    const controller = new AbortController()

    fetchHotel(id, controller.signal)
      .then((payload) => setHotel(payload.data))
      .catch((requestError) => {
        if (requestError.name === 'AbortError') {
          return
        }
        setError(requestError.status === 404
          ? 'No se encontró el hotel.'
          : requestError.message || 'No se pudo cargar el hotel.')
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [id])

  /** Elimina el hotel y regresa al listado. */
  async function removeHotel() {
    const confirmed = window.confirm(`¿Eliminar el hotel ${hotel.name}? También se eliminarán sus acomodaciones.`)

    if (!confirmed) {
      return
    }

    try {
      await deleteHotel(hotel.id)
      navigate('/', { state: { notice: 'Hotel eliminado.' } })
    } catch (requestError) {
      setError(requestError.message || 'No se pudo eliminar el hotel.')
    }
  }

  if (loading) {
    return <p className="status">Cargando hotel...</p>
  }

  if (!hotel) {
    return (
      <section className="page">
        <p className="alert">{error || 'No se encontró el hotel.'}</p>
        <Link to="/" className="button button-quiet">Volver al listado</Link>
      </section>
    )
  }

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Detalle</p>
          <h1>{hotel.name}</h1>
        </div>
        <div className="button-row">
          <Link to="/" className="button button-quiet">Volver</Link>
          <Link to={`/hoteles/${hotel.id}/editar`} className="button button-primary">Editar</Link>
          <button type="button" className="button button-danger" onClick={removeHotel}>Eliminar</button>
        </div>
      </div>

      {notice ? <p className="notice">{notice}</p> : null}
      {error ? <p className="alert">{error}</p> : null}

      <dl className="facts">
        <div>
          <dt>Dirección</dt>
          <dd>{hotel.address}</dd>
        </div>
        <div>
          <dt>Ciudad</dt>
          <dd>{hotel.city}</dd>
        </div>
        <div>
          <dt>NIT</dt>
          <dd>{hotel.nit}</dd>
        </div>
        <div>
          <dt>Habitaciones</dt>
          <dd>{hotel.configured_rooms} configuradas de {hotel.room_count}</dd>
        </div>
      </dl>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Cantidad</th>
              <th>Tipo de habitación</th>
              <th>Acomodación</th>
            </tr>
          </thead>
          <tbody>
            {hotel.accommodations.map((row) => (
              <tr key={row.id}>
                <td data-label="Cantidad">{row.quantity}</td>
                <td data-label="Tipo de habitación">{row.room_type.name}</td>
                <td data-label="Acomodación">{row.accommodation.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
