import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, RuteLogin, RuteTamu } from './lib/auth.jsx'
import Daftar from './pages/Daftar.jsx'
import Masuk from './pages/Masuk.jsx'
import Beranda from './pages/Beranda.jsx'
import Ubah from './pages/Ubah.jsx'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/daftar" element={<RuteTamu><Daftar /></RuteTamu>} />
          <Route path="/masuk" element={<RuteTamu><Masuk /></RuteTamu>} />
          <Route path="/" element={<RuteLogin><Beranda /></RuteLogin>} />
          <Route path="/ubah/:id" element={<RuteLogin><Ubah /></RuteLogin>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
