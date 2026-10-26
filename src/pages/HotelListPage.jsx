import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { deleteHotel, fetchHotels } from '../api/hotels'
import Pagination from '../components/Pagination'

/** Pantalla que lista los hoteles y permite buscarlos, verlos, editarlos o eliminarlos. */
export default function HotelListPage() {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const page = Number(searchParams.get('page') || 1)
  const [draft, setDraft] = useState(search)
  const [hotels, setHotels] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [flash, setFlash] = useState(location.state?.notice || '')

  useEffect(() => {
    const controller = new AbortController()

    fetchHotels({ search, page, signal: controller.signal })
      .then((payload) => {
        setHotels(payload.data)
        setMeta(payload.meta)
        setError('')
      })
      .catch((requestError) => {
        if (requestError.name === 'AbortError') {
          return
        }
        setError(requestError.message || 'No se pudo cargar el listado.')
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [search, page])

  /** Aplica la búsqueda por nombre o NIT y vuelve a la primera página. */
  function applySearch(event) {
    event.preventDefault()
    const next = new URLSearchParams()
    const term = draft.trim()

    if (term) {
      next.set('search', term)
    }

    if (term === search && page === 1) {
      return
    }

    setLoading(true)
    setError('')
    setSearchParams(next)
  }

  /** Cambia la página del listado. */
  function changePage(nextPage) {
    const next = new URLSearchParams(searchParams)

    if (nextPage <= 1) {
      next.delete('page')
    } else {
      next.set('page', String(nextPage))
    }

    setLoading(true)
    setError('')
    setSearchParams(next)
  }

  /** Elimina un hotel y refresca el listado. */
  async function removeHotel(hotel) {
    const confirmed = window.confirm(`¿Eliminar el hotel ${hotel.name}? También se eliminarán sus acomodaciones.`)

    if (!confirmed) {
      return
    }

    try {
      await deleteHotel(hotel.id)
      const payload = await fetchHotels({ search, page })

      if (payload.data.length === 0 && page > 1) {
        changePage(page - 1)
      } else {
        setHotels(payload.data)
        setMeta(payload.meta)
      }

      setError('')
      setFlash('Hotel eliminado.')
    } catch (requestError) {
      setError(requestError.message || 'No se pudo eliminar el hotel.')
    }
  }

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <h1>Hoteles</h1>
          <p className="lede">Consulta, crea y actualiza los hoteles y sus acomodaciones.</p>
        </div>
        <Link className="button button-primary" to="/hoteles/nuevo">Nuevo hotel</Link>
      </div>

      {flash ? <p className="notice">{flash}</p> : null}
      {error ? <p className="alert">{error}</p> : null}

      <form className="search" onSubmit={applySearch}>
        <label>
          <span className="sr-only">Buscar por nombre o NIT</span>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Buscar por nombre o NIT"
          />
        </label>
        <button type="submit" className="button button-quiet">Buscar</button>
      </form>

      {loading ? <p className="status">Cargando hoteles...</p> : null}

      {!loading && hotels.length === 0 ? (
        <p className="status">No hay hoteles para mostrar.</p>
      ) : null}

      {!loading && hotels.length > 0 ? (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Ciudad</th>
                <th>NIT</th>
                <th>Habitaciones</th>
                <th>Configuradas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {hotels.map((hotel) => (
                <tr key={hotel.id}>
                  <td data-label="Nombre">{hotel.name}</td>
                  <td data-label="Ciudad">{hotel.city}</td>
                  <td data-label="NIT">{hotel.nit}</td>
                  <td data-label="Habitaciones">{hotel.room_count}</td>
                  <td data-label="Configuradas">{hotel.configured_rooms}</td>
                  <td data-label="Acciones">
                    <span className="actions">
                      <Link className="button button-small button-quiet" to={`/hoteles/${hotel.id}`}>Ver</Link>
                      <Link className="button button-small button-primary" to={`/hoteles/${hotel.id}/editar`}>Editar</Link>
                      <button type="button" className="button button-small button-danger" onClick={() => removeHotel(hotel)}>
                        Eliminar
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <Pagination page={meta.current_page || page} lastPage={meta.last_page || 1} onPage={changePage} />
      {!loading && meta.total > 0 ? (
        <p className="result-count">{meta.total === 1 ? '1 hotel' : `${meta.total} hoteles`}</p>
      ) : null}
    </section>
  )
}
