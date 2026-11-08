import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, RuteLogin, RuteTamu } from './lib/auth.jsx'
import { supabaseSiap } from './lib/supabase.js'
import Daftar from './pages/Daftar.jsx'
import Masuk from './pages/Masuk.jsx'
import Beranda from './pages/Beranda.jsx'
import Ubah from './pages/Ubah.jsx'

export default function App() {
  if (!supabaseSiap) {
    return (
      <main className="halaman">
        <section className="panel">
          <h2>Supabase belum disambungkan</h2>
          <p className="info">
            Buat file <code>.env</code> di folder proyek (salin dari <code>.env.example</code>), isi
            <code> VITE_SUPABASE_URL</code> dan <code>VITE_SUPABASE_ANON_KEY</code>, lalu jalankan ulang{' '}
            <code>npm run dev</code>. Langkah lengkapnya ada di README.
          </p>
        </section>
      </main>
    )
  }

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
