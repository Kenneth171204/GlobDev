import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Beef, ChartColumn, Dumbbell, Play } from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'
import { pesanGalat } from '../lib/bulking.js'
import Logo from '../components/Logo.jsx'

/** Ilustrasi buatan sendiri: dumbbell besar terangkat + konfeti sporty. */
function Ilustrasi() {
  return (
    <svg className="onb-ilustrasi" viewBox="0 0 300 240" aria-hidden="true">
      <circle cx="150" cy="128" r="92" fill="#C8F31D" />
      <circle cx="150" cy="128" r="92" fill="none" stroke="#141414" strokeWidth="4" strokeDasharray="4 12" opacity="0.25" />
      {/* Dumbbell (di belakang kepalan) */}
      <rect x="96" y="78" width="160" height="12" rx="6" fill="#141414" />
      <rect x="100" y="52" width="18" height="64" rx="7" fill="#1F6BFF" stroke="#141414" strokeWidth="4" />
      <rect x="84" y="62" width="14" height="44" rx="6" fill="#1F6BFF" stroke="#141414" strokeWidth="4" />
      <rect x="234" y="52" width="18" height="64" rx="7" fill="#1F6BFF" stroke="#141414" strokeWidth="4" />
      <rect x="252" y="62" width="14" height="44" rx="6" fill="#1F6BFF" stroke="#141414" strokeWidth="4" />
      {/* Lengan flexing: bentuk digambar dua kali (garis tebal dulu, lalu isi) supaya outline-nya menyatu */}
      <g stroke="#141414" strokeWidth="10" fill="#141414">
        <rect x="56" y="160" width="130" height="46" rx="23" />
        <ellipse cx="122" cy="156" rx="40" ry="29" />
        <rect x="152" y="92" width="42" height="112" rx="21" />
        <rect x="146" y="68" width="54" height="42" rx="16" />
      </g>
      <g fill="#FF6A2B">
        <rect x="56" y="160" width="130" height="46" rx="23" />
        <ellipse cx="122" cy="156" rx="40" ry="29" />
        <rect x="152" y="92" width="42" height="112" rx="21" />
        <rect x="146" y="68" width="54" height="42" rx="16" />
      </g>
      <path d="M100 150 q 22 -22 46 0" fill="none" stroke="#141414" strokeWidth="4" strokeLinecap="round" />
      <path d="M160 82 h 30 M160 94 h 30" stroke="#141414" strokeWidth="4" strokeLinecap="round" />
      <rect x="40" y="152" width="30" height="62" rx="10" fill="#1F6BFF" stroke="#141414" strokeWidth="4" />
      {/* Konfeti */}
      <path d="M40 70 l18 -10 l-2 20 z" fill="#1F6BFF" />
      <circle cx="262" cy="170" r="8" fill="#141414" />
      <circle cx="60" cy="160" r="6" fill="#FF6A2B" />
      <rect x="250" y="20" width="14" height="14" rx="3" fill="#FF6A2B" transform="rotate(20 257 27)" />
      <path d="M30 120 q 10 -14 20 0 t 20 0" fill="none" stroke="#141414" strokeWidth="4" strokeLinecap="round" />
      <path d="M232 214 q 10 -14 20 0 t 20 0" fill="none" stroke="#1F6BFF" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

export default function Onboarding() {
  const { masukDemo } = useAuth()
  const [galat, setGalat] = useState('')

  async function coba() {
    const error = await masukDemo()
    if (error) setGalat(pesanGalat(error))
    // Berhasil → RuteTamu otomatis mengarahkan ke Beranda.
  }

  return (
    <div className="app app-onb">
      <section className="onb-hero">
        <Logo terang size={30} />
        <h1>
          <span>Bentuk tubuhmu,</span>
          BULK UP
        </h1>
        <Ilustrasi />
      </section>

      <section className="onb-bawah">
        <p className="onb-intro">
          Catat split latihan, protein, dan berat badan harian. Lihat progres bulking-mu dalam satu tempat.
        </p>
        <ul className="onb-fitur">
          <li><span className="chip-ikon warna-oranye"><Dumbbell size={18} strokeWidth={2.6} /></span>Catat split</li>
          <li><span className="chip-ikon warna-lime"><Beef size={18} strokeWidth={2.6} /></span>Pantau protein</li>
          <li><span className="chip-ikon warna-biru"><ChartColumn size={18} strokeWidth={2.6} /></span>Lihat progres</li>
        </ul>
        <div className="onb-aksi">
          <Link to="/daftar" className="tombol tombol-biru tombol-besar">
            Daftar gratis <ArrowRight size={22} strokeWidth={2.6} aria-hidden="true" />
          </Link>
          <button type="button" className="tombol tombol-garis tombol-besar" onClick={coba}>
            <Play size={20} strokeWidth={2.6} aria-hidden="true" /> Coba tanpa akun
          </button>
          {galat && <p className="galat" role="alert">{galat}</p>}
        </div>
        <p className="auth-bawah">Sudah punya akun? <Link to="/masuk">Masuk</Link></p>
      </section>
    </div>
  )
}
