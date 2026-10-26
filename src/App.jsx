import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import HotelDetailPage from './pages/HotelDetailPage'
import HotelFormPage from './pages/HotelFormPage'
import HotelListPage from './pages/HotelListPage'

/** Define las pantallas de la aplicación. */
export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HotelListPage />} />
          <Route path="/hoteles/nuevo" element={<HotelFormPage />} />
          <Route path="/hoteles/:id" element={<HotelDetailPage />} />
          <Route path="/hoteles/:id/editar" element={<HotelFormPage />} />
          <Route path="*" element={<p className="status">La página no existe.</p>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
