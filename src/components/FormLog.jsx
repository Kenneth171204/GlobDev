import { forwardRef, useState } from 'react'
import { DAFTAR_SPLIT, tanggalLokal, validasiLog } from '../lib/bulking.js'
import SplitIkon from './SplitIkon.jsx'

export const ISIAN_KOSONG = { tanggal: '', split: 'Push', protein_gram: '', berat_badan_kg: '', catatan: '' }

/**
 * Form Log Harian, dipakai di Beranda (tambah) dan Ubah (edit).
 * onSimpan(isian) harus mengembalikan pesan galat (string) atau '' kalau berhasil.
 * ref diteruskan ke input protein (supaya tombol + di navbar bisa memfokuskannya).
 */
const FormLog = forwardRef(function FormLog(
  { awal, labelSimpan, onSimpan, onBatal, kosongkanSetelahSimpan = false },
  refProtein,
) {
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

  return (
    <form className="form" onSubmit={kirim} noValidate>
      <div className="isian">
        <label htmlFor="tanggal">Tanggal</label>
        <input id="tanggal" type="date" max={tanggalLokal()} value={isian.tanggal}
          onChange={ubah('tanggal')} className={galat.tanggal ? 'salah' : ''} />
        {galat.tanggal && <p className="pesan-salah">{galat.tanggal}</p>}
      </div>

      <fieldset className="isian">
        <legend>Split latihan</legend>
        <div className="pilihan-split" role="radiogroup">
          {DAFTAR_SPLIT.map((s) => (
            <label key={s} className={`chip-split ${isian.split === s ? 'aktif' : ''}`}>
              <input type="radio" name="split" value={s} checked={isian.split === s} onChange={ubah('split')} />
              <SplitIkon split={s} size={16} />
              {s}
            </label>
          ))}
        </div>
        {galat.split && <p className="pesan-salah">{galat.split}</p>}
      </fieldset>

      <div className="form-baris">
        <div className="isian">
          <label htmlFor="protein_gram">Protein</label>
          <div className={`isian-satuan ${galat.protein_gram ? 'salah' : ''}`}>
            <input id="protein_gram" ref={refProtein} type="number" inputMode="numeric" min="0" max="500" step="1"
              placeholder="130" value={isian.protein_gram} onChange={ubah('protein_gram')} />
            <span>g</span>
          </div>
          {galat.protein_gram && <p className="pesan-salah">{galat.protein_gram}</p>}
        </div>
        <div className="isian">
          <label htmlFor="berat_badan_kg">Berat <small>(opsional)</small></label>
          <div className={`isian-satuan ${galat.berat_badan_kg ? 'salah' : ''}`}>
            <input id="berat_badan_kg" type="number" inputMode="decimal" min="20" max="300" step="0.1"
              placeholder="65.5" value={isian.berat_badan_kg} onChange={ubah('berat_badan_kg')} />
            <span>kg</span>
          </div>
          {galat.berat_badan_kg && <p className="pesan-salah">{galat.berat_badan_kg}</p>}
        </div>
      </div>

      <div className="isian">
        <label htmlFor="catatan">Catatan <small>(opsional)</small></label>
        <textarea id="catatan" rows="2" maxLength={200} placeholder="mis. PR bench 80 kg"
          value={isian.catatan} onChange={ubah('catatan')} className={galat.catatan ? 'salah' : ''} />
        {galat.catatan && <p className="pesan-salah">{galat.catatan}</p>}
      </div>

      {galatServer && <p className="galat" role="alert">{galatServer}</p>}

      <div className="aksi-form">
        {onBatal && (
          <button className="tombol tombol-garis" type="button" onClick={onBatal} disabled={menyimpan}>Batal</button>
        )}
        <button className="tombol tombol-oranye" type="submit" disabled={menyimpan}>
          {menyimpan ? 'Menyimpan…' : labelSimpan}
        </button>
      </div>
    </form>
  )
})

export default FormLog
