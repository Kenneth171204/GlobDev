import { useState } from 'react'
import { DAFTAR_SPLIT, tanggalLokal, validasiLog } from '../lib/bulking.js'

export const ISIAN_KOSONG = { tanggal: '', split: 'Push', protein_gram: '', berat_badan_kg: '', catatan: '' }

/**
 * Form Log Harian, dipakai di Beranda (tambah) dan Ubah (edit).
 * onSimpan(isian) harus mengembalikan pesan galat (string) atau '' kalau berhasil.
 */
export default function FormLog({ awal, labelSimpan, onSimpan, onBatal, kosongkanSetelahSimpan = false }) {
  const isianAwal = () => awal ?? { ...ISIAN_KOSONG, tanggal: tanggalLokal() }
  const [isian, setIsian] = useState(isianAwal)
  const [galat, setGalat] = useState({})
  const [galatServer, setGalatServer] = useState('')
  const [menyimpan, setMenyimpan] = useState(false)

  function ubah(kolom) {
    return (e) => setIsian({ ...isian, [kolom]: e.target.value })
  }

  async function kirim(e) {
    e.preventDefault()
    const g = validasiLog(isian)
    setGalat(g)
    setGalatServer('')
    if (Object.keys(g).length > 0) return
    setMenyimpan(true)
    const pesan = await onSimpan(isian)
    setMenyimpan(false)
    if (pesan) setGalatServer(pesan)
    else if (kosongkanSetelahSimpan) setIsian(isianAwal())
  }

  function kolom(nama, label, input) {
    return (
      <div className="isian">
        <label htmlFor={nama}>{label}</label>
        {input}
        {galat[nama] && <p className="pesan-salah">{galat[nama]}</p>}
      </div>
    )
  }

  return (
    <form className="form" onSubmit={kirim} noValidate>
      <div className="form-baris">
        {kolom('tanggal', 'Tanggal',
          <input id="tanggal" type="date" max={tanggalLokal()} value={isian.tanggal}
            onChange={ubah('tanggal')} className={galat.tanggal ? 'salah' : ''} />)}
        {kolom('split', 'Split latihan',
          <select id="split" value={isian.split} onChange={ubah('split')} className={galat.split ? 'salah' : ''}>
            {DAFTAR_SPLIT.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>)}
      </div>
      <div className="form-baris">
        {kolom('protein_gram', 'Protein (gram)',
          <input id="protein_gram" type="number" inputMode="numeric" min="0" max="500" step="1"
            placeholder="mis. 130" value={isian.protein_gram} onChange={ubah('protein_gram')}
            className={galat.protein_gram ? 'salah' : ''} />)}
        {kolom('berat_badan_kg', 'Berat badan (kg, opsional)',
          <input id="berat_badan_kg" type="number" inputMode="decimal" min="20" max="300" step="0.1"
            placeholder="mis. 65.5" value={isian.berat_badan_kg} onChange={ubah('berat_badan_kg')}
            className={galat.berat_badan_kg ? 'salah' : ''} />)}
      </div>
      {kolom('catatan', 'Catatan (opsional)',
        <textarea id="catatan" rows="2" maxLength={200} placeholder="mis. PR bench 80 kg"
          value={isian.catatan} onChange={ubah('catatan')} className={galat.catatan ? 'salah' : ''} />)}

      {galatServer && <p className="galat" role="alert">{galatServer}</p>}

      <div className="aksi-form">
        <button className="tombol" type="submit" disabled={menyimpan}>
          {menyimpan ? 'Menyimpan…' : labelSimpan}
        </button>
        {onBatal && (
          <button className="tombol-garis" type="button" onClick={onBatal} disabled={menyimpan}>Batal</button>
        )}
      </div>
    </form>
  )
}
