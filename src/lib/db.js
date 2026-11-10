// Lapisan data BulkUp.
// - Akun sungguhan → Supabase (Auth + tabel `profil` dan `log_harian`, keduanya dengan RLS).
// - Mode coba      → localStorage lewat db-demo.js.
// Semua fungsi mengembalikan { data, error } supaya halaman tidak perlu tahu bedanya.

import { supabase } from './supabase.js'
import * as demo from './db-demo.js'
import { TARGET_PROTEIN } from './bulking.js'

const modeDemo = () => demo.userDemo() !== null

/** Gabungkan user Supabase Auth + baris tabel profil → bentuk user yang dipakai aplikasi. */
function keUserApp(authUser, profil) {
  return {
    id: authUser.id,
    nama: profil?.nama || authUser.user_metadata?.nama || authUser.email?.split('@')[0] || 'Kamu',
    email: authUser.email ?? '',
    target_protein: profil?.target_protein ?? TARGET_PROTEIN,
    demo: false,
  }
}

/**
 * Ambil profil user yang sedang login dari tabel `profil`.
 * Baris profil dibuat otomatis oleh trigger saat daftar; kalau tidak ada
 * (mis. akun dibuat sebelum trigger dipasang), buat sekarang.
 */
export async function muatUser(authUser) {
  if (!authUser) return { data: null, error: null }
  let { data: profil, error } = await supabase.from('profil').select('nama, target_protein').eq('id', authUser.id).maybeSingle()
  if (!error && !profil) {
    const nama = (authUser.user_metadata?.nama || authUser.email?.split('@')[0] || 'Kamu').slice(0, 80)
    ;({ data: profil, error } = await supabase.from('profil')
      .insert({ id: authUser.id, nama }).select('nama, target_protein').single())
  }
  return { data: keUserApp(authUser, profil), error }
}

// ---------- Autentikasi ----------

export async function daftar({ nama, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { nama: nama.trim(), target_protein: TARGET_PROTEIN },
      // Link konfirmasi email kembali ke situs tempat user mendaftar (localhost atau bulkup.pages.dev).
      // Alamat ini harus terdaftar di Supabase: Authentication → URL Configuration → Redirect URLs.
      emailRedirectTo: `${window.location.origin}/masuk`,
    },
  })
  if (error) return { data: null, error }
  // Supabase membalas "berhasil" tanpa identitas kalau email sudah terdaftar (perlindungan enumerasi).
  if (data.user && data.user.identities?.length === 0) {
    return { data: null, error: { message: 'Email sudah terdaftar. Silakan masuk.' } }
  }
  // Tanpa session = konfirmasi email masih aktif di dashboard Supabase.
  if (!data.session) return { data: null, error: null, perluKonfirmasi: true }
  return muatUser(data.user)
}

export async function masuk({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
  if (error) return { data: null, error }
  return muatUser(data.user)
}

export const masukDemo = demo.masukDemo
export const userDemo = demo.userDemo

export async function keluar() {
  if (modeDemo()) return demo.keluarDemo()
  await supabase.auth.signOut()
}

/** Ubah profil (nama / target protein) → tabel `profil`. */
export async function ubahProfil(perubahan) {
  if (modeDemo()) return demo.ubahProfil(perubahan)
  const { data: sesi } = await supabase.auth.getUser()
  if (!sesi?.user) return { data: null, error: { message: 'Sesi berakhir. Silakan masuk lagi.' } }
  const { data: profil, error } = await supabase.from('profil')
    .update(perubahan).eq('id', sesi.user.id).select('nama, target_protein').single()
  return error ? { data: null, error } : { data: keUserApp(sesi.user, profil), error: null }
}

// ---------- Log Harian (CRUD) ----------

export async function ambilLogs() {
  if (modeDemo()) return demo.ambilLogs()
  return supabase.from('log_harian').select('*').order('tanggal', { ascending: false })
}

export async function ambilLog(id) {
  if (modeDemo()) return demo.ambilLog(id)
  const { data, error } = await supabase.from('log_harian').select('*').eq('id', id).maybeSingle()
  // id yang bukan UUID valid (22P02) dianggap "tidak ditemukan".
  if (error?.code === '22P02') return { data: null, error: null }
  return { data, error }
}

export async function tambahLog(baris) {
  if (modeDemo()) return demo.tambahLog(baris)
  return supabase.from('log_harian').insert(baris).select().single()
}

export async function ubahLog(id, baris) {
  if (modeDemo()) return demo.ubahLog(id, baris)
  const { data, error } = await supabase.from('log_harian').update(baris).eq('id', id).select().maybeSingle()
  if (!error && !data) return { data: null, error: { message: 'Log tidak ditemukan.' } }
  return { data, error }
}

export async function hapusLog(id) {
  if (modeDemo()) return demo.hapusLog(id)
  const { error } = await supabase.from('log_harian').delete().eq('id', id)
  return { error }
}
