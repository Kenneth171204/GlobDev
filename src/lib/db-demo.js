// Penyimpanan untuk MODE COBA saja (localStorage).
// Akun tamu + data contoh hidup di browser ini dan dihapus saat keluar,
// supaya orang yang sekadar mencoba tidak membuat akun sampah di Supabase.

import { TARGET_PROTEIN, tanggalLokal } from './bulking.js'

const KUNCI_DEMO = 'bulkup_demo' // { user, logs }

function baca() {
  try {
    const teks = localStorage.getItem(KUNCI_DEMO)
    return teks ? JSON.parse(teks) : null
  } catch {
    return null
  }
}

function tulis(nilai) {
  try {
    localStorage.setItem(KUNCI_DEMO, JSON.stringify(nilai))
    return null
  } catch {
    return { message: 'Penyimpanan browser penuh atau diblokir.' }
  }
}

function buatId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const GALAT_TANGGAL_GANDA = { message: 'Log untuk tanggal ini sudah ada. Ubah log yang sudah ada saja.' }

export function userDemo() {
  return baca()?.user ?? null
}

export function masukDemo() {
  const user = { id: `demo-${buatId()}`, nama: 'Tamu', email: '', target_protein: TARGET_PROTEIN, demo: true }
  const split = ['Push', 'Pull', 'Legs', 'Rest', 'Upper', 'Lower', 'Full Body']
  const protein = [118, 135, 142, 105, 128, 131, 150, 122, 138, 96, 140, 133, 127, 145]
  const logs = []
  for (let i = 13; i >= 1; i--) {
    if (i === 5) continue // satu hari bolong, supaya realistis
    const d = new Date()
    d.setDate(d.getDate() - i)
    logs.push({
      id: buatId(), user_id: user.id, tanggal: tanggalLokal(d), split: split[i % 7], protein_gram: protein[i],
      berat_badan_kg: i % 2 ? Math.round((64 + (13 - i) * 0.12) * 10) / 10 : null,
      catatan: i === 2 ? 'PR squat 100 kg' : '', created_at: new Date().toISOString(),
    })
  }
  const error = tulis({ user, logs })
  return error ? { data: null, error } : { data: user, error: null }
}

export function keluarDemo() {
  try { localStorage.removeItem(KUNCI_DEMO) } catch { /* abaikan */ }
}

export function ubahProfil(perubahan) {
  const isi = baca()
  if (!isi) return { data: null, error: { message: 'Mode coba sudah berakhir.' } }
  isi.user = { ...isi.user, ...perubahan }
  const error = tulis(isi)
  return error ? { data: null, error } : { data: isi.user, error: null }
}

export function ambilLogs() {
  const logs = [...(baca()?.logs ?? [])].sort((a, b) => b.tanggal.localeCompare(a.tanggal))
  return { data: logs, error: null }
}

export function ambilLog(id) {
  return { data: baca()?.logs.find((l) => l.id === id) ?? null, error: null }
}

export function tambahLog(baris) {
  const isi = baca()
  if (isi.logs.some((l) => l.tanggal === baris.tanggal)) return { data: null, error: GALAT_TANGGAL_GANDA }
  const log = { id: buatId(), user_id: isi.user.id, ...baris, created_at: new Date().toISOString() }
  isi.logs.push(log)
  const error = tulis(isi)
  return error ? { data: null, error } : { data: log, error: null }
}

export function ubahLog(id, baris) {
  const isi = baca()
  const i = isi.logs.findIndex((l) => l.id === id)
  if (i === -1) return { data: null, error: { message: 'Log tidak ditemukan.' } }
  if (isi.logs.some((l) => l.id !== id && l.tanggal === baris.tanggal)) return { data: null, error: GALAT_TANGGAL_GANDA }
  isi.logs[i] = { ...isi.logs[i], ...baris }
  const error = tulis(isi)
  return error ? { data: null, error } : { data: isi.logs[i], error: null }
}

export function hapusLog(id) {
  const isi = baca()
  isi.logs = isi.logs.filter((l) => l.id !== id)
  return { error: tulis(isi) }
}
