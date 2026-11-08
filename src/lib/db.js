// Penyimpanan lokal (localStorage) untuk Fase 1 — pengganti sementara Supabase.
// Semua fungsi async dan mengembalikan { data, error } supaya nanti mudah
// diganti ke Supabase tanpa mengubah halaman.
//
// Catatan: ini simulasi untuk demo. Data hanya ada di browser ini, dan siapa pun
// yang memakai browser yang sama bisa membacanya lewat DevTools.

import { TARGET_PROTEIN } from './bulking.js'

const KUNCI_USER = 'gerak_users'
const KUNCI_SESI = 'gerak_sesi'
const KUNCI_LOG = 'gerak_logs'

function baca(kunci, cadangan) {
  try {
    const teks = localStorage.getItem(kunci)
    return teks ? JSON.parse(teks) : cadangan
  } catch {
    return cadangan
  }
}

function tulis(kunci, nilai) {
  try {
    localStorage.setItem(kunci, JSON.stringify(nilai))
    return null
  } catch {
    return { message: 'Penyimpanan browser penuh atau diblokir.' }
  }
}

function buatId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

/** Hash password (SHA-256) supaya tidak tersimpan sebagai teks biasa. */
async function hash(teks) {
  if (!crypto.subtle) return teks // konteks tidak aman (http non-localhost): simpan apa adanya
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(teks))
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('')
}

function publik(user) {
  return {
    id: user.id,
    nama: user.nama,
    email: user.email,
    target_protein: user.target_protein ?? TARGET_PROTEIN,
  }
}

// ---------- Autentikasi ----------

export function userAktif() {
  const id = baca(KUNCI_SESI, null)
  const user = id && baca(KUNCI_USER, []).find((u) => u.id === id)
  return user ? publik(user) : null
}

export async function daftar({ nama, email, password }) {
  const users = baca(KUNCI_USER, [])
  const emailRapi = email.trim().toLowerCase()
  if (users.some((u) => u.email === emailRapi)) {
    return { data: null, error: { message: 'Email sudah terdaftar. Silakan masuk.' } }
  }
  const user = {
    id: buatId(),
    nama: nama.trim(),
    email: emailRapi,
    password: await hash(password),
    target_protein: TARGET_PROTEIN,
  }
  const error = tulis(KUNCI_USER, [...users, user]) || tulis(KUNCI_SESI, user.id)
  return error ? { data: null, error } : { data: publik(user), error: null }
}

export async function masuk({ email, password }) {
  const emailRapi = email.trim().toLowerCase()
  const kata = await hash(password)
  const user = baca(KUNCI_USER, []).find((u) => u.email === emailRapi && u.password === kata)
  if (!user) return { data: null, error: { message: 'Email atau password salah.' } }
  const error = tulis(KUNCI_SESI, user.id)
  return error ? { data: null, error } : { data: publik(user), error: null }
}

export function keluar() {
  try { localStorage.removeItem(KUNCI_SESI) } catch { /* abaikan */ }
}

/** Ubah profil user aktif (nama dan/atau target protein). */
export async function ubahProfil(perubahan) {
  const { user, error } = wajibLogin()
  if (error) return { data: null, error }
  const users = baca(KUNCI_USER, [])
  const i = users.findIndex((u) => u.id === user.id)
  users[i] = { ...users[i], ...perubahan }
  const galat = tulis(KUNCI_USER, users)
  return galat ? { data: null, error: galat } : { data: publik(users[i]), error: null }
}

// ---------- Log Harian (CRUD) ----------

function wajibLogin() {
  const user = userAktif()
  return user ? { user } : { error: { message: 'Sesi berakhir. Silakan masuk lagi.' } }
}

const GALAT_TANGGAL_GANDA = { message: 'Log untuk tanggal ini sudah ada. Ubah log yang sudah ada saja.' }

/** Semua log milik user aktif, terbaru di atas. */
export async function ambilLogs() {
  const { user, error } = wajibLogin()
  if (error) return { data: null, error }
  const data = baca(KUNCI_LOG, [])
    .filter((l) => l.user_id === user.id)
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
  return { data, error: null }
}

export async function ambilLog(id) {
  const { user, error } = wajibLogin()
  if (error) return { data: null, error }
  const log = baca(KUNCI_LOG, []).find((l) => l.id === id && l.user_id === user.id)
  return { data: log ?? null, error: null }
}

export async function tambahLog(baris) {
  const { user, error } = wajibLogin()
  if (error) return { data: null, error }
  const semua = baca(KUNCI_LOG, [])
  if (semua.some((l) => l.user_id === user.id && l.tanggal === baris.tanggal)) {
    return { data: null, error: GALAT_TANGGAL_GANDA }
  }
  const log = { id: buatId(), user_id: user.id, ...baris, created_at: new Date().toISOString() }
  const galat = tulis(KUNCI_LOG, [...semua, log])
  return galat ? { data: null, error: galat } : { data: log, error: null }
}

export async function ubahLog(id, baris) {
  const { user, error } = wajibLogin()
  if (error) return { data: null, error }
  const semua = baca(KUNCI_LOG, [])
  const i = semua.findIndex((l) => l.id === id && l.user_id === user.id)
  if (i === -1) return { data: null, error: { message: 'Log tidak ditemukan.' } }
  if (semua.some((l) => l.id !== id && l.user_id === user.id && l.tanggal === baris.tanggal)) {
    return { data: null, error: GALAT_TANGGAL_GANDA }
  }
  semua[i] = { ...semua[i], ...baris }
  const galat = tulis(KUNCI_LOG, semua)
  return galat ? { data: null, error: galat } : { data: semua[i], error: null }
}

export async function hapusLog(id) {
  const { user, error } = wajibLogin()
  if (error) return { error }
  const semua = baca(KUNCI_LOG, [])
  return { error: tulis(KUNCI_LOG, semua.filter((l) => !(l.id === id && l.user_id === user.id))) }
}
