import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, RuteLogin, RuteTamu } from './lib/auth.jsx'
import AppLayout from './components/AppLayout.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Daftar from './pages/Daftar.jsx'
import Masuk from './pages/Masuk.jsx'
import Beranda from './pages/Beranda.jsx'
import Statistik from './pages/Statistik.jsx'
import Profil from './pages/Profil.jsx'
import Ubah from './pages/Ubah.jsx'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Tamu (belum login) */}
          <Route path="/selamat-datang" element={<RuteTamu><Onboarding /></RuteTamu>} />
          <Route path="/daftar" element={<RuteTamu><Daftar /></RuteTamu>} />
          <Route path="/masuk" element={<RuteTamu><Masuk /></RuteTamu>} />

          {/* Wajib login: semua memakai bottom navigation */}
          <Route element={<RuteLogin><AppLayout /></RuteLogin>}>
            <Route path="/" element={<Beranda />} />
            <Route path="/statistik" element={<Statistik />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/ubah/:id" element={<Ubah />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
