import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'

/** Pengingat mode coba: data contoh, hilang saat keluar. */
export default function BannerDemo() {
  const { user, keluar } = useAuth()
  const navigate = useNavigate()
  if (!user?.demo) return null

  async function daftar() {
    await keluar()
    navigate('/daftar')
  }

  return (
    <div className="banner-demo" role="note">
      <p><strong>Mode coba.</strong> Ini data contoh dan akan hilang saat kamu keluar.</p>
      <button type="button" className="tombol tombol-hitam tombol-kecil" onClick={daftar}>Daftar gratis</button>
    </div>
  )
}
