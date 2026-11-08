import { createContext, useContext, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from './supabase.js'

const AuthContext = createContext({ session: null, memuat: true })

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [memuat, setMemuat] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setMemuat(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ session, memuat }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

/** Halaman yang wajib login (Beranda, Ubah). */
export function RuteLogin({ children }) {
  const { session, memuat } = useAuth()
  if (memuat) return <p className="status">Memuat…</p>
  if (!session) return <Navigate to="/masuk" replace />
  return children
}

/** Halaman untuk tamu (Daftar, Masuk): kalau sudah login, langsung ke Beranda. */
export function RuteTamu({ children }) {
  const { session, memuat } = useAuth()
  if (memuat) return <p className="status">Memuat…</p>
  if (session) return <Navigate to="/" replace />
  return children
}
