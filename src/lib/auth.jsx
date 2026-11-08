import { createContext, useContext, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import * as db from './db.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => db.userAktif())

  // Ikuti login/keluar dari tab browser lain.
  useEffect(() => {
    const sinkron = () => setUser(db.userAktif())
    window.addEventListener('storage', sinkron)
    return () => window.removeEventListener('storage', sinkron)
  }, [])

  async function daftar(isian) {
    const { data, error } = await db.daftar(isian)
    if (data) setUser(data)
    return error
  }

  async function masuk(isian) {
    const { data, error } = await db.masuk(isian)
    if (data) setUser(data)
    return error
  }

  function keluar() {
    db.keluar()
    setUser(null)
  }

  async function perbaruiProfil(perubahan) {
    const { data, error } = await db.ubahProfil(perubahan)
    if (data) setUser(data)
    return error
  }

  return <AuthContext.Provider value={{ user, daftar, masuk, keluar, perbaruiProfil }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

/** Halaman yang wajib login (Beranda, Ubah). */
export function RuteLogin({ children }) {
  return useAuth().user ? children : <Navigate to="/selamat-datang" replace />
}

/** Halaman untuk tamu (Daftar, Masuk): kalau sudah login, langsung ke Beranda. */
export function RuteTamu({ children }) {
  return useAuth().user ? <Navigate to="/" replace /> : children
}
