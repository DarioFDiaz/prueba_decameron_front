import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createHotel, fetchHotel, fetchRoomTypes, updateHotel } from '../api/hotels'
import HotelForm from '../components/HotelForm'
import { emptyHotel, hotelToForm } from '../utils/hotelFormState'

/** Pantalla para crear un hotel o editar uno existente. */
export default function HotelFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [roomTypes, setRoomTypes] = useState([])
  const [initial, setInitial] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    const requests = [fetchRoomTypes(controller.signal)]

    if (isEdit) {
      requests.push(fetchHotel(id, controller.signal))
    }

    Promise.all(requests)
      .then(([typesPayload, hotelPayload]) => {
        setRoomTypes(typesPayload.data)
        setInitial(hotelPayload ? hotelToForm(hotelPayload.data) : emptyHotel)
      })
      .catch((requestError) => {
        if (requestError.name === 'AbortError') {
          return
        }
        setLoadError(requestError.status === 404
          ? 'No se encontró el hotel.'
          : requestError.message || 'No se pudo preparar el formulario.')
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [id, isEdit])

  /** Envía el formulario para crear o actualizar el hotel. */
  async function handleSubmit(payload) {
    setSaving(true)
    setErrors({})
    setFormError('')

    try {
      const response = isEdit
        ? await updateHotel(id, payload)
        : await createHotel(payload)

      navigate(`/hoteles/${response.data.id}`, {
        state: { notice: isEdit ? 'Hotel actualizado.' : 'Hotel creado.' },
      })
    } catch (requestError) {
      setErrors(requestError.errors || {})
      setFormError(requestError.message || 'Revisa los datos del hotel.')
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="status">Cargando formulario...</p>
  }

  if (loadError || !initial) {
    return <p className="alert">{loadError || 'No se pudo preparar el formulario.'}</p>
  }

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">{isEdit ? 'Edición' : 'Registro'}</p>
          <h1>{isEdit ? 'Editar hotel' : 'Nuevo hotel'}</h1>
        </div>
      </div>
      <HotelForm
        key={isEdit ? id : 'nuevo'}
        initial={initial}
        roomTypes={roomTypes}
        errors={errors}
        formError={formError}
        saving={saving}
        submitLabel={isEdit ? 'Guardar cambios' : 'Crear hotel'}
        onSubmit={handleSubmit}
        onCancel={() => navigate(isEdit ? `/hoteles/${id}` : '/')}
      />
    </section>
  )
}
