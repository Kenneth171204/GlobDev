import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, RuteLogin, RuteTamu } from './lib/auth.jsx'
import { supabaseSiap } from './lib/supabase.js'
import { KonfirmasiProvider } from './components/Konfirmasi.jsx'
import AppLayout from './components/AppLayout.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Daftar from './pages/Daftar.jsx'
import Masuk from './pages/Masuk.jsx'
import Beranda from './pages/Beranda.jsx'
import Statistik from './pages/Statistik.jsx'
import Profil from './pages/Profil.jsx'
import Ubah from './pages/Ubah.jsx'
import Bantuan from './pages/Bantuan.jsx'

export default function App() {
  if (!supabaseSiap) {
    return (
      <main className="app konten">
        <section className="kartu" style={{ marginTop: 32 }}>
          <h1 className="judul-kartu">Supabase belum disambungkan</h1>
          <p>
            Salin <code>.env.example</code> menjadi <code>.env</code>, isi <code>VITE_SUPABASE_URL</code> dan{' '}
            <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>, lalu jalankan ulang <code>npm run dev</code>.
          </p>
        </section>
      </main>
    )
  }

  return (
    <AuthProvider>
      <KonfirmasiProvider>
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
            <Route path="/bantuan" element={<Bantuan />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </KonfirmasiProvider>
    </AuthProvider>
  )
}
