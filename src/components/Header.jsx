import { useAuth } from '../lib/auth.jsx'
import { supabase } from '../lib/supabase.js'

export default function Header() {
  const { session } = useAuth()
  const nama = session?.user?.user_metadata?.nama || session?.user?.email

  return (
    <header className="header">
      <div className="logo">
        <img src="/gerak.svg" alt="" />
        Gerak
      </div>
      {session && (
        <div className="header-akun">
          <span>Halo, {nama}</span>
          <button className="tombol-garis" type="button" onClick={() => supabase.auth.signOut()}>Keluar</button>
        </div>
      )}
    </header>
  )
}
