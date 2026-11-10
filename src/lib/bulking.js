// Aturan dan perhitungan untuk Log Harian (Fase 1).

export const TARGET_PROTEIN = 130 // gram per hari (default; bisa diubah di Profil)

export const DAFTAR_SPLIT = ['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Full Body', 'Rest']

/** Tanggal lokal (bukan UTC) dalam format YYYY-MM-DD. */
export function tanggalLokal(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const h = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${h}`
}

function keDate(tanggal) {
  return new Date(tanggal + 'T00:00:00')
}

/** Contoh: "Sab, 8 Nov 2026". */
export function formatTanggal(tanggal) {
  return keDate(tanggal).toLocaleDateString('id-ID', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}

/** Protein yang tercatat untuk hari ini (0 kalau belum ada log). */
export function proteinHariIni(logs, hariIni = new Date()) {
  const log = logs.find((l) => l.tanggal === tanggalLokal(hariIni))
  return log ? log.protein_gram : 0
}

/** Rata-rata protein dari log 7 hari terakhir (hari ini + 6 hari sebelumnya). */
export function rataProtein7Hari(logs, hariIni = new Date()) {
  const awal = new Date(hariIni)
  awal.setHours(0, 0, 0, 0)
  awal.setDate(awal.getDate() - 6)
  const akhir = tanggalLokal(hariIni)
  const dalamRentang = logs.filter((l) => keDate(l.tanggal) >= awal && l.tanggal <= akhir)
  if (dalamRentang.length === 0) return { rata: 0, jumlahHari: 0 }
  const total = dalamRentang.reduce((s, l) => s + l.protein_gram, 0)
  return { rata: Math.round(total / dalamRentang.length), jumlahHari: dalamRentang.length }
}

/** Jumlah hari latihan (selain Rest) di minggu ini, Senin–Minggu. */
export function hariLatihanMingguIni(logs, hariIni = new Date()) {
  const senin = new Date(hariIni)
  senin.setHours(0, 0, 0, 0)
  const hari = senin.getDay() // 0 = Minggu
  senin.setDate(senin.getDate() - (hari === 0 ? 6 : hari - 1))
  const seninBerikutnya = new Date(senin)
  seninBerikutnya.setDate(senin.getDate() + 7)
  return logs.filter((l) => {
    const t = keDate(l.tanggal)
    return l.split !== 'Rest' && t >= senin && t < seninBerikutnya
  }).length
}

/** Berat badan terakhir dan selisihnya dengan berat yang tercatat sebelumnya. */
export function beratTerakhir(logs) {
  const adaBerat = logs
    .filter((l) => l.berat_badan_kg != null)
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
  if (adaBerat.length === 0) return null
  const sekarang = Number(adaBerat[0].berat_badan_kg)
  const sebelum = adaBerat[1] ? Number(adaBerat[1].berat_badan_kg) : null
  return {
    berat: sekarang,
    selisih: sebelum == null ? null : Math.round((sekarang - sebelum) * 10) / 10,
  }
}

/** Validasi isian form log. Mengembalikan objek galat per kolom (kosong = valid). */
export function validasiLog(isian, hariIni = new Date()) {
  const galat = {}
  if (!isian.tanggal) galat.tanggal = 'Tanggal wajib diisi.'
  else if (isian.tanggal > tanggalLokal(hariIni)) galat.tanggal = 'Tanggal tidak boleh di masa depan.'

  if (!DAFTAR_SPLIT.includes(isian.split)) galat.split = 'Pilih split latihan.'

  const protein = Number(isian.protein_gram)
  if (isian.protein_gram === '') galat.protein_gram = 'Protein wajib diisi.'
  else if (!Number.isInteger(protein) || protein < 0 || protein > 500)
    galat.protein_gram = 'Isi angka bulat 0–500 gram.'

  if (isian.berat_badan_kg !== '') {
    const berat = Number(isian.berat_badan_kg)
    if (Number.isNaN(berat) || berat < 20 || berat > 300) galat.berat_badan_kg = 'Isi angka 20–300 kg.'
  }

  if (isian.catatan.length > 200) galat.catatan = 'Maksimal 200 karakter.'
  return galat
}

/** Ubah isian form (string) ke baris tabel log_harian. */
export function keBarisLog(isian) {
  return {
    tanggal: isian.tanggal,
    split: isian.split,
    protein_gram: Number(isian.protein_gram),
    berat_badan_kg: isian.berat_badan_kg === '' ? null : Math.round(Number(isian.berat_badan_kg) * 10) / 10,
    catatan: isian.catatan.trim(),
  }
}

/** Ubah baris tabel ke isian form (string). */
export function keIsianForm(log) {
  return {
    tanggal: log.tanggal,
    split: log.split,
    protein_gram: String(log.protein_gram),
    berat_badan_kg: log.berat_badan_kg == null ? '' : String(log.berat_badan_kg),
    catatan: log.catatan ?? '',
  }
}

/** Teks galat (termasuk dari Supabase) dalam Bahasa Indonesia. */
export function pesanGalat(error) {
  if (!error) return ''
  if (error.code === '23505') return 'Log untuk tanggal ini sudah ada. Ubah log yang sudah ada saja.'
  if (error.code === '23514') return 'Ada isian di luar batas yang diizinkan. Periksa lagi angkanya.'
  // Layanan email bawaan Supabase hanya mengirim sedikit email per jam (email konfirmasi pendaftaran).
  if (error.code === 'over_email_send_rate_limit' || /email rate limit/i.test(error.message || '')) {
    return 'Pendaftaran baru sedang dibatasi karena batas kirim email konfirmasi tercapai. Coba lagi sekitar 1 jam lagi, atau pakai "Coba tanpa akun" dulu.'
  }
  if (error.code === 'email_address_invalid') return 'Alamat email ini ditolak. Pakai alamat email yang aktif.'
  const m = error.message || ''
  if (/invalid login credentials/i.test(m)) return 'Email atau password salah.'
  if (/already registered|already exists/i.test(m)) return 'Email sudah terdaftar. Silakan masuk.'
  if (/password should be at least/i.test(m)) return 'Password minimal 6 karakter.'
  if (/email not confirmed/i.test(m)) return 'Email belum dikonfirmasi. Buka link konfirmasi di email-mu dulu.'
  if (/rate limit|too many/i.test(m)) return 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.'
  if (/invalid.*email|email.*invalid/i.test(m)) return 'Alamat email tidak valid.'
  if (/jwt|session.*(missing|expired)|not authenticated/i.test(m)) return 'Sesi berakhir. Silakan masuk lagi.'
  if (/failed to fetch|network|load failed/i.test(m)) return 'Tidak bisa terhubung ke server. Cek koneksi internet.'
  return m || 'Terjadi kesalahan. Coba lagi.'
}

/** Warna aksen per split (dipakai badge dan ikon kartu). */
export const WARNA_SPLIT = {
  Push: 'oranye', Pull: 'biru', Legs: 'lime', Upper: 'kuning', Lower: 'langit', 'Full Body': 'hitam', Rest: 'abu',
}

/**
 * Deret harian untuk grafik: `jumlahHari` hari terakhir sampai hari ini.
 * Hari tanpa log bernilai null.
 */
export function seriHarian(logs, jumlahHari, hariIni = new Date()) {
  const peta = new Map(logs.map((l) => [l.tanggal, l]))
  const hasil = []
  for (let i = jumlahHari - 1; i >= 0; i--) {
    const d = new Date(hariIni)
    d.setDate(d.getDate() - i)
    const t = tanggalLokal(d)
    const log = peta.get(t)
    hasil.push({
      tanggal: t,
      label: jumlahHari <= 7
        ? d.toLocaleDateString('id-ID', { weekday: 'short' })
        : String(d.getDate()),
      protein: log ? log.protein_gram : null,
      berat: log?.berat_badan_kg != null ? Number(log.berat_badan_kg) : null,
    })
  }
  return hasil
}

/** Jumlah hari berturut-turut (sampai hari ini atau kemarin) yang mencapai target protein. */
export function streakTarget(logs, target, hariIni = new Date()) {
  const peta = new Map(logs.map((l) => [l.tanggal, l.protein_gram]))
  const d = new Date(hariIni)
  // Hari ini belum mencapai target? Mulai hitung dari kemarin supaya streak tidak "putus" pagi-pagi.
  if (!((peta.get(tanggalLokal(d)) ?? 0) >= target)) d.setDate(d.getDate() - 1)
  let n = 0
  while ((peta.get(tanggalLokal(d)) ?? -1) >= target) {
    n++
    d.setDate(d.getDate() - 1)
  }
  return n
}

/** Validasi target protein di halaman Profil. */
export function validasiTarget(nilai) {
  const n = Number(nilai)
  if (nilai === '' || !Number.isInteger(n) || n < 50 || n > 400) return 'Isi angka bulat 50–400 gram.'
  return ''
}

/** Penjelasan singkat setiap split untuk pengguna yang belum familiar. */
export const INFO_SPLIT = {
  Push: 'Gerakan mendorong: dada, bahu, trisep (mis. bench press, push-up).',
  Pull: 'Gerakan menarik: punggung dan bisep (mis. pull-up, rowing).',
  Legs: 'Kaki dan bokong (mis. squat, leg press, lunges).',
  Upper: 'Seluruh tubuh bagian atas dalam satu sesi.',
  Lower: 'Seluruh tubuh bagian bawah: kaki, bokong, betis.',
  'Full Body': 'Seluruh tubuh dalam satu sesi.',
  Rest: 'Hari istirahat, tidak latihan. Protein tetap dicatat karena otot tumbuh saat istirahat.',
}

/** Contoh kandungan protein makanan sehari-hari (perkiraan). */
export const CONTOH_PROTEIN = [
  { makanan: '1 butir telur', gram: 6 },
  { makanan: '100 g dada ayam', gram: 31 },
  { makanan: '1 potong tempe (50 g)', gram: 10 },
  { makanan: '1 potong tahu (50 g)', gram: 4 },
  { makanan: '1 gelas susu (250 ml)', gram: 8 },
  { makanan: '1 scoop whey', gram: 24 },
  { makanan: '100 g ikan tuna', gram: 26 },
  { makanan: '1 piring nasi (150 g)', gram: 4 },
]
