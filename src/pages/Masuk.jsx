import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Lock, Mail } from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'
import { pesanGalat } from '../lib/bulking.js'
import AuthLayout, { IsianIkon } from '../components/AuthLayout.jsx'
import TombolGoogle, { PemisahAtau } from '../components/TombolGoogle.jsx'

export default function Masuk() {
  const { masuk } = useAuth()
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
    const error = await masuk({ email, password })
    setMengirim(false)
    if (error) setGalatServer(pesanGalat(error))
    // Berhasil → RuteTamu otomatis mengarahkan ke Beranda.
  }

  return (
    <AuthLayout
      judul="Selamat datang lagi"
      subjudul="Lanjutkan progres bulking-mu."
      bawah={<>Belum punya akun? <Link to="/daftar">Daftar</Link></>}
    >
      <TombolGoogle label="Masuk dengan Google" />
      <PemisahAtau />
      <form className="form" onSubmit={kirim} noValidate>
        <IsianIkon id="email" label="Email" ikon={Mail} type="email" autoComplete="email" placeholder="kamu@email.com"
          value={email} onChange={(e) => setEmail(e.target.value)} galat={galat.email} />
        <IsianIkon id="password" label="Password" ikon={Lock} type="password" autoComplete="current-password"
          placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
          galat={galat.password} />
        {galatServer && <p className="galat" role="alert">{galatServer}</p>}
        <button className="tombol tombol-biru" type="submit" disabled={mengirim}>
          {mengirim ? 'Masuk…' : <>Masuk <ArrowRight size={20} strokeWidth={2.6} /></>}
        </button>
      </form>
    </AuthLayout>
  )
}
