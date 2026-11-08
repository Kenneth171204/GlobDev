import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { pesanGalat } from '../lib/bulking.js'
import Header from '../components/Header.jsx'

export default function Daftar() {
  const [nama, setNama] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [galat, setGalat] = useState({})
  const [galatServer, setGalatServer] = useState('')
  const [info, setInfo] = useState('')
  const [mengirim, setMengirim] = useState(false)

  async function kirim(e) {
    e.preventDefault()
    const g = {}
    if (!nama.trim()) g.nama = 'Nama wajib diisi.'
    if (!email.trim()) g.email = 'Email wajib diisi.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) g.email = 'Format email tidak valid.'
    if (password.length < 6) g.password = 'Password minimal 6 karakter.'
    setGalat(g)
    setGalatServer('')
    if (Object.keys(g).length > 0) return

    setMengirim(true)
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { nama: nama.trim() } },
    })
    setMengirim(false)
    if (error) return setGalatServer(pesanGalat(error))
    // Konfirmasi email mati → session langsung ada dan RuteTamu mengarahkan ke Beranda.
    if (!data.session) setInfo('Akun dibuat. Cek email-mu untuk konfirmasi, lalu masuk.')
  }

  return (
    <main className="halaman">
      <Header />
      <section className="panel masuk">
        <h1>Daftar</h1>
        <p>Buat akun untuk mulai mencatat latihan dan protein harianmu.</p>
        <form className="form" onSubmit={kirim} noValidate>
          <div className="isian">
            <label htmlFor="nama">Nama</label>
            <input id="nama" autoComplete="name" value={nama} onChange={(e) => setNama(e.target.value)}
              className={galat.nama ? 'salah' : ''} />
            {galat.nama && <p className="pesan-salah">{galat.nama}</p>}
          </div>
          <div className="isian">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" value={email}
              onChange={(e) => setEmail(e.target.value)} className={galat.email ? 'salah' : ''} />
            {galat.email && <p className="pesan-salah">{galat.email}</p>}
          </div>
          <div className="isian">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="new-password" value={password}
              onChange={(e) => setPassword(e.target.value)} className={galat.password ? 'salah' : ''} />
            {galat.password && <p className="pesan-salah">{galat.password}</p>}
          </div>
          {galatServer && <p className="galat" role="alert">{galatServer}</p>}
          {info && <p className="info">{info}</p>}
          <button className="tombol" type="submit" disabled={mengirim}>{mengirim ? 'Mendaftar…' : 'Daftar'}</button>
        </form>
        <p className="tautan-bawah">Sudah punya akun? <Link to="/masuk">Masuk</Link></p>
      </section>
    </main>
  )
}
