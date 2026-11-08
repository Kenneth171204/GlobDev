import { useAuth } from '../lib/auth.jsx'

export default function Header() {
  const { user, keluar } = useAuth()

  return (
    <header className="header">
      <div className="logo">
        <img src="/gerak.svg" alt="" />
        Gerak
      </div>
      {user && (
        <div className="header-akun">
          <span>Halo, {user.nama}</span>
          <button className="tombol-garis" type="button" onClick={keluar}>Keluar</button>
        </div>
      )}
    </header>
  )
}
