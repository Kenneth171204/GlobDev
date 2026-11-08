import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import Logo from './Logo.jsx'

/** Kerangka halaman Daftar & Masuk: header oranye + kartu putih. */
export default function AuthLayout({ judul, subjudul, children, bawah }) {
  return (
    <div className="app app-auth">
      <header className="auth-header">
        <div className="auth-header-atas">
          <Link to="/selamat-datang" className="tombol-ikon tombol-ikon-terang" aria-label="Kembali">
            <ChevronLeft size={22} strokeWidth={2.6} />
          </Link>
          <Logo terang size={30} />
          <span style={{ width: 40 }} />
        </div>
        <h1>{judul}</h1>
        <p>{subjudul}</p>
      </header>
      <section className="auth-kartu">
        {children}
        <p className="auth-bawah">{bawah}</p>
      </section>
    </div>
  )
}

/** Input dengan ikon di kiri. */
export function IsianIkon({ id, label, ikon: Ikon, galat, ...props }) {
  return (
    <div className="isian">
      <label htmlFor={id}>{label}</label>
      <div className={`isian-ikon ${galat ? 'salah' : ''}`}>
        <Ikon size={20} strokeWidth={2.2} aria-hidden="true" />
        <input id={id} {...props} />
      </div>
      {galat && <p className="pesan-salah">{galat}</p>}
    </div>
  )
}
