import { useCallback, useEffect, useState } from 'react'
import * as db from './db.js'
import { pesanGalat } from './bulking.js'

/** Memuat semua log milik user aktif (dipakai Beranda, Statistik, Profil). */
export function useLogs() {
  const [logs, setLogs] = useState([])
  const [memuat, setMemuat] = useState(true)
  const [galat, setGalat] = useState('')

  const muat = useCallback(async () => {
    const { data, error } = await db.ambilLogs()
    if (error) setGalat(pesanGalat(error))
    else {
      setGalat('')
      setLogs(data)
    }
    setMemuat(false)
  }, [])

  useEffect(() => { muat() }, [muat])

  return { logs, setLogs, memuat, galat, setGalat, muat }
}
