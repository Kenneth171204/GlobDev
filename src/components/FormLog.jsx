import { forwardRef, useState } from 'react'
import { CONTOH_PROTEIN, DAFTAR_SPLIT, INFO_SPLIT, tanggalLokal, validasiLog } from '../lib/bulking.js'
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
        <legend>Latihan hari ini <small>(bagian tubuh yang dilatih)</small></legend>
        <div className="pilihan-split" role="radiogroup" aria-describedby="info-split">
          {DAFTAR_SPLIT.map((s) => (
            <label key={s} className={`chip-split ${isian.split === s ? 'aktif' : ''}`}>
              <input type="radio" name="split" value={s} checked={isian.split === s} onChange={ubah('split')} />
              <SplitIkon split={s} size={16} />
              {s}
            </label>
          ))}
        </div>
        <p className="petunjuk" id="info-split" aria-live="polite">
          <strong>{isian.split}:</strong> {INFO_SPLIT[isian.split]}
        </p>
        {galat.split && <p className="pesan-salah">{galat.split}</p>}
      </fieldset>

      <div className="form-baris">
        <div className="isian">
          <label htmlFor="protein_gram">Protein dimakan</label>
          <div className={`isian-satuan ${galat.protein_gram ? 'salah' : ''}`}>
            <input id="protein_gram" ref={refProtein} type="number" inputMode="numeric" min="0" max="500" step="1"
              placeholder="130" value={isian.protein_gram} onChange={ubah('protein_gram')}
              aria-describedby="petunjuk-protein" />
            <span>g</span>
          </div>
          <p className="petunjuk" id="petunjuk-protein">Total gram protein dari semua makanan hari ini.</p>
          {galat.protein_gram && <p className="pesan-salah">{galat.protein_gram}</p>}
        </div>
        <div className="isian">
          <label htmlFor="berat_badan_kg">Berat badan <small>(opsional)</small></label>
          <div className={`isian-satuan ${galat.berat_badan_kg ? 'salah' : ''}`}>
            <input id="berat_badan_kg" type="number" inputMode="decimal" min="20" max="300" step="0.1"
              placeholder="65.5" value={isian.berat_badan_kg} onChange={ubah('berat_badan_kg')}
              aria-describedby="petunjuk-berat" />
            <span>kg</span>
          </div>
          <p className="petunjuk" id="petunjuk-berat">Timbang pagi hari sebelum makan agar konsisten.</p>
          {galat.berat_badan_kg && <p className="pesan-salah">{galat.berat_badan_kg}</p>}
        </div>
      </div>

      <details className="bantu-protein">
        <summary>Bingung menghitung protein? Lihat contoh</summary>
        <p>Jumlahkan protein dari setiap makanan yang kamu makan hari ini. Perkiraan:</p>
        <ul>
          {CONTOH_PROTEIN.map((c) => (
            <li key={c.makanan}><span>{c.makanan}</span><strong>± {c.gram} g</strong></li>
          ))}
        </ul>
        <p>Contoh: 3 telur (18 g) + 200 g dada ayam (62 g) + 1 scoop whey (24 g) = <strong>104 g</strong>.</p>
      </details>

      <div className="isian">
        <label htmlFor="catatan">Catatan <small>(opsional)</small></label>
        <textarea id="catatan" rows="2" maxLength={200} placeholder="mis. PR bench 80 kg, tidur kurang"
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
