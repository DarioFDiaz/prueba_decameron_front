/** Muestra los botones para pasar de página. */
export default function Pagination({ page, lastPage, onPage }) {
  if (lastPage <= 1) {
    return null
  }

  return (
    <nav className="pager" aria-label="Páginas">
      <button type="button" className="button button-quiet" onClick={() => onPage(page - 1)} disabled={page <= 1}>
        Anterior
      </button>
      <span>Página {page} de {lastPage}</span>
      <button type="button" className="button button-quiet" onClick={() => onPage(page + 1)} disabled={page >= lastPage}>
        Siguiente
      </button>
    </nav>
  )
}
