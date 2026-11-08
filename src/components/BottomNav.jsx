import { NavLink, useNavigate } from 'react-router-dom'
import { ChartColumn, House, Plus, UserRound } from 'lucide-react'

export default function BottomNav() {
  const navigate = useNavigate()

  return (
    <nav className="bottom-nav" aria-label="Navigasi utama">
      <NavLink to="/" end className="nav-item" aria-label="Beranda">
        <House size={22} strokeWidth={2.4} />
        <span>Beranda</span>
      </NavLink>
      <button
        type="button"
        className="nav-tambah"
        aria-label="Tambah log"
        onClick={() => navigate('/', { state: { tambah: Date.now() } })}
      >
        <Plus size={26} strokeWidth={3} />
      </button>
      <NavLink to="/statistik" className="nav-item" aria-label="Statistik">
        <ChartColumn size={22} strokeWidth={2.4} />
        <span>Statistik</span>
      </NavLink>
      <NavLink to="/profil" className="nav-item" aria-label="Profil">
        <UserRound size={22} strokeWidth={2.4} />
        <span>Profil</span>
      </NavLink>
    </nav>
  )
}
