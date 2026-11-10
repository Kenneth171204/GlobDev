// Penanda kecil per user untuk kartu "Mulai di sini" (disimpan di browser).
// Hanya untuk kenyamanan: kalau localStorage diblokir, kartu tetap tampil normal.

const kunci = (userId, nama) => `bulkup_panduan_${nama}_${userId}`

export function bacaPenanda(userId, nama) {
  try { return localStorage.getItem(kunci(userId, nama)) === '1' } catch { return false }
}

export function setPenanda(userId, nama, nilai = true) {
  try {
    if (nilai) localStorage.setItem(kunci(userId, nama), '1')
    else localStorage.removeItem(kunci(userId, nama))
  } catch { /* abaikan */ }
}
