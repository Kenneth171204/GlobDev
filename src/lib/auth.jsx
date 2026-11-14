import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from './supabase.js'
import * as db from './db.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Mode coba langsung tersedia dari localStorage; akun Supabase menunggu getSession().
  const [user, setUser] = useState(() => db.userDemo())
  const [memuat, setMemuat] = useState(() => db.userDemo() === null)

  const idTermuat = useRef(null)
  // Kalau login Google dibatalkan/gagal, Supabase kembali ke situs dengan ?error_description=…
  const [galatOAuth, setGalatOAuth] = useState(() => {
    const p = new URLSearchParams(window.location.search + '&' + window.location.hash.slice(1))
    const pesan = p.get('error_description')
    if (!pesan) return ''
    window.history.replaceState(null, '', window.location.pathname)
    return /access_denied|cancel/i.test(p.get('error') + pesan)
      ? 'Login Google dibatalkan.'
      : `Login Google gagal: ${pesan}`
  })

  useEffect(() => {
    // Ikuti sesi awal, login, dan keluar (juga dari tab lain).
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (db.userDemo()) return setMemuat(false)
      const authUser = session?.user ?? null
      if (!authUser) {
        idTermuat.current = null
        setUser(null)
        return setMemuat(false)
      }
      // Refresh token / user yang sama sudah termuat → tidak perlu ambil profil lagi.
      if (event === 'TOKEN_REFRESHED' || idTermuat.current === authUser.id) return setMemuat(false)
      // Panggilan Supabase di dalam callback ini bisa deadlock → tunda ke tick berikutnya.
      setTimeout(async () => {
        const { data: userApp } = await db.muatUser(authUser)
        idTermuat.current = authUser.id
        setUser(userApp)
        setMemuat(false)
      }, 0)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  /** Mengembalikan { error, perluKonfirmasi }. */
  function pakaiUser(data) {
    idTermuat.current = data.id
    setUser(data)
  }

  async function daftar(isian) {
    const { data, error, perluKonfirmasi } = await db.daftar(isian)
    if (data) pakaiUser(data)
    return { error, perluKonfirmasi }
  }

  async function masuk(isian) {
    const { data, error } = await db.masuk(isian)
    if (data) pakaiUser(data)
    return error
  }

  /** Mengarahkan browser ke Google. Mengembalikan galat hanya kalau gagal sebelum pindah halaman. */
  async function masukGoogle() {
    setGalatOAuth('')
    const { error } = await db.masukGoogle()
    return error
  }

  async function masukDemo() {
    const { data, error } = db.masukDemo()
    if (data) setUser(data)
    return error
  }

  async function keluar() {
    await db.keluar()
    idTermuat.current = null
    setUser(null)
  }

  async function perbaruiProfil(perubahan) {
    const { data, error } = await db.ubahProfil(perubahan)
    if (data) setUser(data)
    return error
  }

  return (
    <AuthContext.Provider value={{ user, memuat, daftar, masuk, masukGoogle, galatOAuth, masukDemo, keluar, perbaruiProfil }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

function Memuat() {
  return <p className="status layar-memuat">Memuat…</p>
}

/** Halaman yang wajib login. */
export function RuteLogin({ children }) {
  const { user, memuat } = useAuth()
  if (memuat) return <Memuat />
  return user ? children : <Navigate to="/selamat-datang" replace />
}

/** Halaman untuk tamu (Onboarding, Daftar, Masuk): kalau sudah login, langsung ke Beranda. */
export function RuteTamu({ children }) {
  const { user, memuat } = useAuth()
  if (memuat) return <Memuat />
  return user ? <Navigate to="/" replace /> : children
}
