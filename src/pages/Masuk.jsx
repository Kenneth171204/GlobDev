import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { pesanGalat } from '../lib/bulking.js'
import Header from '../components/Header.jsx'

export default function Masuk() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [galat, setGalat] = useState({})
  const [galatServer, setGalatServer] = useState('')
  const [mengirim, setMengirim] = useState(false)

  async function kirim(e) {
    e.preventDefault()
    const g = {}
    if (!email.trim()) g.email = 'Email wajib diisi.'
    if (!password) g.password = 'Password wajib diisi.'
    setGalat(g)
    setGalatServer('')
    if (Object.keys(g).length > 0) return

    setMengirim(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setMengirim(false)
    if (error) setGalatServer(pesanGalat(error))
    // Berhasil → RuteTamu otomatis mengarahkan ke Beranda.
  }

  return (
    <main className="halaman">
      <Header />
      <section className="panel masuk">
        <h1>Masuk</h1>
        <p>Lanjutkan mencatat progres bulking-mu.</p>
        <form className="form" onSubmit={kirim} noValidate>
          <div className="isian">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" value={email}
              onChange={(e) => setEmail(e.target.value)} className={galat.email ? 'salah' : ''} />
            {galat.email && <p className="pesan-salah">{galat.email}</p>}
          </div>
          <div className="isian">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="current-password" value={password}
              onChange={(e) => setPassword(e.target.value)} className={galat.password ? 'salah' : ''} />
            {galat.password && <p className="pesan-salah">{galat.password}</p>}
          </div>
          {galatServer && <p className="galat" role="alert">{galatServer}</p>}
          <button className="tombol" type="submit" disabled={mengirim}>{mengirim ? 'Masuk…' : 'Masuk'}</button>
        </form>
        <p className="tautan-bawah">Belum punya akun? <Link to="/daftar">Daftar</Link></p>
      </section>
    </main>
  )
}
