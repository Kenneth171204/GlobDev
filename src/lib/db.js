// Lapisan data BulkUp.
// - Akun sungguhan → Supabase (Auth + tabel `profil` dan `log_harian`, keduanya dengan RLS).
// - Mode coba      → localStorage lewat db-demo.js.
// Semua fungsi mengembalikan { data, error } supaya halaman tidak perlu tahu bedanya.

import { supabase } from './supabase.js'
import * as demo from './db-demo.js'
import { TARGET_PROTEIN, tanggalLokal } from './bulking.js'

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
  const kolom = 'nama, target_protein, email_sambutan_at'
  let { data: profil, error } = await supabase.from('profil').select(kolom).eq('id', authUser.id).maybeSingle()
  if (!error && !profil) {
    const nama = (authUser.user_metadata?.nama || authUser.email?.split('@')[0] || 'Kamu').slice(0, 80)
    ;({ data: profil, error } = await supabase.from('profil')
      .insert({ id: authUser.id, nama }).select(kolom).single())
  }
  if (profil && !profil.email_sambutan_at) kirimEmailSambutan(authUser.id)
  return { data: keUserApp(authUser, profil), error }
}

// Satu panggilan per user per sesi browser; fungsi di server juga menjamin hanya terkirim sekali.
const sambutanDiminta = new Set()

/**
 * Minta Edge Function `kirim-email-sambutan` mengirim email sambutan (Resend) ke user ini.
 * Tidak ditunggu: email adalah bonus, kegagalannya tidak boleh mengganggu login.
 */
function kirimEmailSambutan(userId) {
  if (sambutanDiminta.has(userId)) return
  sambutanDiminta.add(userId)
  supabase.functions.invoke('kirim-email-sambutan', { body: {} }).then(({ data, error }) => {
    if (error) console.warn('Email sambutan belum terkirim:', error.message)
    else if (data?.terkirim) console.info('Email sambutan terkirim.')
  })
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

/**
 * Masuk / daftar dengan Google. Browser pindah ke halaman Google, lalu kembali ke
 * situs ini; supabase-js membaca sesi dari URL dan AuthProvider mengarahkan ke Beranda.
 * Alamat kembali harus terdaftar di Supabase: Authentication → URL Configuration → Redirect URLs.
 */
export async function masukGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`,
      queryParams: { prompt: 'select_account' }, // selalu tampilkan pilihan akun Google
    },
  })
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

// ---------- Berat & tinggi badan (pengukuran_badan) ----------

export async function ambilPengukuran() {
  if (modeDemo()) return demo.ambilPengukuran()
  return supabase.from('pengukuran_badan').select('*').order('tanggal', { ascending: false }).limit(400)
}

/**
 * Simpan berat & tinggi untuk hari ini. Kalau hari ini sudah ada, ditimpa.
 * Dipakai juga untuk tombol "Masih sama" (nilai sama, tanggal hari ini).
 */
export async function simpanPengukuran({ berat, tinggi }) {
  if (modeDemo()) return demo.simpanPengukuran({ berat, tinggi })
  return supabase.from('pengukuran_badan')
    .upsert({ tanggal: tanggalLokal(), berat_badan_kg: berat, tinggi_badan_cm: tinggi }, { onConflict: 'user_id,tanggal' })
    .select().single()
}
