/** Toma el primer mensaje de error de un campo. */
export function firstError(errors, key) {
  const value = errors?.[key]

  if (Array.isArray(value)) {
    return value[0] || ''
  }

  return value || ''
}
