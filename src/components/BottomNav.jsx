import { NavLink, useNavigate } from 'react-router-dom'
import { ChartColumn, House, Plus, UserRound } from 'lucide-react'

export const MENU = [
  { ke: '/', label: 'Beranda', ikon: House, end: true },
  { ke: '/statistik', label: 'Statistik', ikon: ChartColumn },
  { ke: '/profil', label: 'Profil', ikon: UserRound },
]

/** Buka Beranda lalu gulir ke form "Catat hari ini". */
export function useBukaFormCatat() {
  const navigate = useNavigate()
  return () => navigate('/', { state: { tambah: Date.now() } })
}

/** Navigasi bawah (layar sempit). Di layar lebar menu pindah ke header. */
export default function BottomNav() {
  const bukaForm = useBukaFormCatat()
  const [beranda, ...lainnya] = MENU

  function item({ ke, label, ikon: Ikon, end }) {
    return (
      <NavLink key={ke} to={ke} end={end} className="nav-item">
        <Ikon size={22} strokeWidth={2.4} aria-hidden="true" />
        <span>{label}</span>
      </NavLink>
    )
  }

  return (
    <nav className="bottom-nav" aria-label="Navigasi utama">
      {item(beranda)}
      <button type="button" className="nav-tambah" aria-label="Catat log hari ini" onClick={bukaForm}>
        <Plus size={26} strokeWidth={3} />
      </button>
      {lainnya.map(item)}
    </nav>
  )
}
