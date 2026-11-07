// Fungsi dari latihan persiapan (pra-kelas). Bandingkan dengan jawabanmu sendiri:
// hasilnya harus sama, cara menulisnya boleh berbeda.

/** Jumlah durasi_menit dari semua latihan. */
export function totalMenit(daftar) {
  let total = 0
  for (const latihan of daftar) {
    total = total + latihan.durasi_menit
  }
  return total
}

/** Latihan dengan jenis tertentu saja, mis. filterJenis(daftar, 'lari'). */
export function filterJenis(daftar, jenis) {
  return daftar.filter((latihan) => latihan.jenis === jenis)
}

/** Latihan yang tanggalnya di minggu yang sama dengan `hariIni` (Senin–Minggu). */
export function latihanMingguIni(daftar, hariIni = new Date()) {
  const senin = new Date(hariIni)
  senin.setHours(0, 0, 0, 0)
  const hari = senin.getDay() // 0 = Minggu, 1 = Senin, ...
  senin.setDate(senin.getDate() - (hari === 0 ? 6 : hari - 1))
  const seninBerikutnya = new Date(senin)
  seninBerikutnya.setDate(senin.getDate() + 7)

  return daftar.filter((latihan) => {
    const tanggal = new Date(latihan.tanggal + 'T00:00:00')
    return tanggal >= senin && tanggal < seninBerikutnya
  })
}
