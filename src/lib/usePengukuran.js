import { useCallback, useEffect, useState } from 'react'
import * as db from './db.js'
import { pesanGalat } from './bulking.js'

/** Memuat riwayat berat & tinggi badan user aktif (terbaru di depan). */
export function usePengukuran() {
  const [pengukuran, setPengukuran] = useState([])
  const [memuat, setMemuat] = useState(true)
  const [galat, setGalat] = useState('')

  const muat = useCallback(async () => {
    const { data, error } = await db.ambilPengukuran()
    if (error) setGalat(pesanGalat(error))
    else {
      setGalat('')
      setPengukuran(data ?? [])
    }
    setMemuat(false)
  }, [])

  useEffect(() => { muat() }, [muat])

  /** Simpan lalu muat ulang. Mengembalikan pesan galat ('' kalau berhasil). */
  const simpan = useCallback(async (nilai) => {
    const { error } = await db.simpanPengukuran(nilai)
    if (error) return pesanGalat(error)
    await muat()
    return ''
  }, [muat])

  return { pengukuran, memuat, galat, simpan }
}
