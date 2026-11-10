import { Link, NavLink, Outlet } from 'react-router-dom'
import { CircleHelp, Plus } from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'
import Logo from './Logo.jsx'
import BottomNav, { MENU, useBukaFormCatat } from './BottomNav.jsx'

/**
 * Kerangka semua halaman setelah login.
 * Header sama di setiap halaman: logo, (menu di layar lebar), avatar.
 * Di layar sempit menu ada di bottom navigation.
 */
export default function AppLayout() {
  const { user } = useAuth()
  const bukaForm = useBukaFormCatat()

  return (
    <div className="app app-masuk">
      <header className="app-header">
        <Link to="/" className="app-header-logo" aria-label="BulkUp, ke Beranda">
          <Logo />
        </Link>
        <nav className="nav-atas" aria-label="Navigasi utama">
          {MENU.map(({ ke, label, ikon: Ikon, end }) => (
            <NavLink key={ke} to={ke} end={end} className="nav-atas-item">
              <Ikon size={18} strokeWidth={2.4} aria-hidden="true" /> {label}
            </NavLink>
          ))}
          <button type="button" className="tombol tombol-oranye tombol-kecil" onClick={bukaForm}>
            <Plus size={18} strokeWidth={3} aria-hidden="true" /> Catat log
          </button>
        </nav>
        <div className="header-kanan">
          <NavLink to="/bantuan" className="tombol-bantuan" aria-label="Bantuan cara pakai" title="Bantuan">
            <CircleHelp size={22} strokeWidth={2.4} aria-hidden="true" />
            <span>Bantuan</span>
          </NavLink>
          <Link to="/profil" className="avatar avatar-kecil" aria-label={`Profil ${user.nama}`}>
            {user.nama.charAt(0).toUpperCase()}
          </Link>
        </div>
      </header>
      <main className="konten">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
