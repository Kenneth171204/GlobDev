import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Lock, Mail, UserRound } from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'
import { pesanGalat } from '../lib/bulking.js'
import AuthLayout, { IsianIkon } from '../components/AuthLayout.jsx'

export default function Daftar() {
  const { daftar } = useAuth()
  const [nama, setNama] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [galat, setGalat] = useState({})
  const [galatServer, setGalatServer] = useState('')
  const [mengirim, setMengirim] = useState(false)
  const [info, setInfo] = useState('')

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
    const { error, perluKonfirmasi } = await daftar({ nama, email, password })
    setMengirim(false)
    if (error) setGalatServer(pesanGalat(error))
    else if (perluKonfirmasi) setInfo(email.trim())
    // Berhasil tanpa konfirmasi → langsung login dan RuteTamu mengarahkan ke Beranda.
  }

  if (info) {
    return (
      <AuthLayout
        judul="Cek email-mu"
        subjudul="Satu langkah lagi sebelum mulai."
        bawah={<>Sudah konfirmasi? <Link to="/masuk">Masuk</Link></>}
      >
        <p className="info-konfirmasi">
          Kami mengirim link konfirmasi ke <strong>{info}</strong>. Buka email itu dan klik linknya,
          lalu masuk dengan email dan password yang tadi kamu buat.
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      judul="Buat akun"
      subjudul="Mulai catat latihan & protein harianmu."
      bawah={<>Sudah punya akun? <Link to="/masuk">Masuk</Link></>}
    >
      <form className="form" onSubmit={kirim} noValidate>
        <IsianIkon id="nama" label="Nama" ikon={UserRound} autoComplete="name" placeholder="Nama kamu"
          value={nama} onChange={(e) => setNama(e.target.value)} galat={galat.nama} />
        <IsianIkon id="email" label="Email" ikon={Mail} type="email" autoComplete="email" placeholder="kamu@email.com"
          value={email} onChange={(e) => setEmail(e.target.value)} galat={galat.email} />
        <IsianIkon id="password" label="Password" ikon={Lock} type="password" autoComplete="new-password"
          placeholder="Minimal 6 karakter" value={password} onChange={(e) => setPassword(e.target.value)}
          galat={galat.password} />
        {galatServer && <p className="galat" role="alert">{galatServer}</p>}
        <button className="tombol tombol-biru" type="submit" disabled={mengirim}>
          {mengirim ? 'Mendaftar…' : <>Daftar <ArrowRight size={20} strokeWidth={2.6} /></>}
        </button>
      </form>
    </AuthLayout>
  )
}
