import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav.jsx'

/** Kerangka halaman setelah login: konten + bottom navigation hitam. */
export default function AppLayout() {
  return (
    <div className="app">
      <main className="konten">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
