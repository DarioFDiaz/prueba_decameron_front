import { useMemo, useState } from 'react'
import { firstError } from '../utils/errors'

const EMPTY_ROW = { room_type_id: '', accommodation_id: '', quantity: '' }

/** Formulario de datos del hotel y de sus acomodaciones. */
export default function HotelForm({
  initial,
  roomTypes,
  errors,
  formError,
  saving,
  submitLabel,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState(initial)
  const [localError, setLocalError] = useState('')

  const configured = useMemo(
    () => form.accommodations.reduce((sum, row) => sum + (Number.parseInt(row.quantity, 10) || 0), 0),
    [form.accommodations],
  )
  const capacity = Number.parseInt(form.room_count, 10) || 0
  const overLimit = capacity > 0 && configured > capacity
  const pairCount = roomTypes.reduce((sum, type) => sum + type.accommodations.length, 0)

  /** Actualiza un campo del hotel. */
  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  /** Actualiza una fila y limpia la acomodación si ya no corresponde al tipo. */
  function updateRow(index, field, value) {
    setForm((current) => ({
      ...current,
      accommodations: current.accommodations.map((row, rowIndex) => {
        if (rowIndex !== index) {
          return row
        }

        const next = { ...row, [field]: value }

        if (field === 'room_type_id') {
          const type = roomTypes.find((item) => String(item.id) === value)
          const allowed = type?.accommodations.some((item) => String(item.id) === next.accommodation_id)
          if (!allowed) {
            next.accommodation_id = ''
          }
        }

        return next
      }),
    }))
  }

  /** Agrega una fila vacía de acomodación. */
  function addRow() {
    setForm((current) => ({
      ...current,
      accommodations: [...current.accommodations, { ...EMPTY_ROW }],
    }))
  }

  /** Quita una fila de acomodación. */
  function removeRow(index) {
    setForm((current) => ({
      ...current,
      accommodations: current.accommodations.filter((_, rowIndex) => rowIndex !== index),
    }))
  }

  /** Envía el formulario si la cantidad configurada no supera el máximo. */
  function handleSubmit(event) {
    event.preventDefault()
    setLocalError('')

    if (overLimit) {
      setLocalError('La cantidad de habitaciones configuradas no puede superar el máximo del hotel.')
      return
    }

    onSubmit({
      name: form.name,
      address: form.address,
      city: form.city,
      nit: form.nit,
      room_count: Number(form.room_count),
      accommodations: form.accommodations.map((row) => ({
        room_type_id: Number(row.room_type_id),
        accommodation_id: Number(row.accommodation_id),
        quantity: Number(row.quantity),
      })),
    })
  }

  const summaryError = localError || firstError(errors, 'accommodations')

  return (
    <form className="form" onSubmit={handleSubmit} noValidate={false}>
      {formError ? <p className="alert">{formError}</p> : null}

      <section className="panel">
        <header className="panel-head">
          <h2>Datos del hotel</h2>
        </header>
        <div className="fields">
          <Field label="Nombre" error={firstError(errors, 'name')}>
            <input
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              maxLength={255}
              required
            />
          </Field>
          <Field label="Dirección" error={firstError(errors, 'address')}>
            <input
              value={form.address}
              onChange={(event) => updateField('address', event.target.value)}
              maxLength={255}
              required
            />
          </Field>
          <Field label="Ciudad" error={firstError(errors, 'city')}>
            <input
              value={form.city}
              onChange={(event) => updateField('city', event.target.value)}
              maxLength={255}
              required
            />
          </Field>
          <Field label="NIT" error={firstError(errors, 'nit')} hint="Incluye el dígito de verificación. Ejemplo: 12345678-8">
            <input
              value={form.nit}
              onChange={(event) => updateField('nit', event.target.value)}
              inputMode="numeric"
              autoComplete="off"
              required
            />
          </Field>
          <Field label="Número de habitaciones" error={firstError(errors, 'room_count')}>
            <input
              type="number"
              min="1"
              step="1"
              value={form.room_count}
              onChange={(event) => updateField('room_count', event.target.value)}
              required
            />
          </Field>
        </div>
      </section>

      <section className="panel">
        <header className="panel-head">
          <h2>Acomodaciones</h2>
          <p className={overLimit ? 'meter meter-over' : 'meter'}>
            Configuradas: <strong>{configured}</strong> de <strong>{capacity || 0}</strong>
          </p>
        </header>

        {summaryError ? <p className="alert">{summaryError}</p> : null}

        <div className="assignments">
          {form.accommodations.map((row, index) => {
            const selectedType = roomTypes.find((type) => String(type.id) === row.room_type_id)
            const options = selectedType?.accommodations ?? []
            const rowError = [
              firstError(errors, `accommodations.${index}.room_type_id`),
              firstError(errors, `accommodations.${index}.accommodation_id`),
              firstError(errors, `accommodations.${index}.quantity`),
            ].filter(Boolean).join(' ')

            return (
              <div className="assignment" key={index}>
                <Field label="Tipo de habitación">
                  <select
                    value={row.room_type_id}
                    onChange={(event) => updateRow(index, 'room_type_id', event.target.value)}
                    required
                  >
                    <option value="">Selecciona</option>
                    {roomTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Acomodación">
                  <select
                    value={row.accommodation_id}
                    onChange={(event) => updateRow(index, 'accommodation_id', event.target.value)}
                    required
                    disabled={!selectedType}
                  >
                    <option value="">Selecciona</option>
                    {options.map((accommodation) => (
                      <option
                        key={accommodation.id}
                        value={accommodation.id}
                        disabled={isPairUsed(form.accommodations, row.room_type_id, accommodation.id, index)}
                      >
                        {accommodation.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Cantidad">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={row.quantity}
                    onChange={(event) => updateRow(index, 'quantity', event.target.value)}
                    required
                  />
                </Field>
                <button
                  type="button"
                  className="button button-danger"
                  onClick={() => removeRow(index)}
                  disabled={form.accommodations.length === 1}
                >
                  Quitar
                </button>
                {rowError ? <p className="field-error assignment-error">{rowError}</p> : null}
              </div>
            )
          })}
        </div>

        <button
          type="button"
          className="button button-add"
          onClick={addRow}
          disabled={!canAddMore(form.accommodations.length, pairCount)}
        >
          Agregar acomodación
        </button>
      </section>

      <div className="form-actions">
        <button type="button" className="button button-quiet" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="button button-primary" disabled={saving}>
          {saving ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

/** Muestra una etiqueta, el campo y su error. */
function Field({ label, hint, error, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint ? <small className="hint">{hint}</small> : null}
      {error ? <small className="field-error">{error}</small> : null}
    </label>
  )
}

/** Indica si otra fila ya usa la misma pareja de tipo y acomodación. */
function isPairUsed(rows, roomTypeId, accommodationId, currentIndex) {
  return rows.some((row, index) =>
    index !== currentIndex
    && row.room_type_id === String(roomTypeId)
    && row.accommodation_id === String(accommodationId),
  )
}

/** Permite agregar filas mientras queden combinaciones disponibles. */
function canAddMore(current, total) {
  return total === 0 || current < total
}
