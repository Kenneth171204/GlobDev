// Aturan dan perhitungan untuk Log Harian (Fase 1).

export const TARGET_PROTEIN = 130 // gram per hari

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

/** Teks galat untuk ditampilkan ke user. */
export function pesanGalat(error) {
  if (!error) return ''
  return error.message || 'Terjadi kesalahan. Coba lagi.'
}
