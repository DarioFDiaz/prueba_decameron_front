import { Link } from 'react-router-dom'

/** Encabezado y contenedor común de todas las pantallas. */
export default function Layout({ children }) {
  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">H</span>
          <span>
            <strong>Hoteles</strong>
            <small>Acomodaciones por tipo</small>
          </span>
        </Link>
      </header>
      <main className="shell">{children}</main>
    </div>
  )
}
