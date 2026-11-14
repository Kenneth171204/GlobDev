import { useState } from 'react'
import { BellRing, Check, Ruler, X } from 'lucide-react'
import {
  HARI_PENGINGAT, angkaId, beratTerakhir, statusPengukuran, teksHariLalu, tanggalLokal, validasiPengukuran,
} from '../lib/bulking.js'

/** Form berat + tinggi badan. onSimpan({ berat, tinggi }) mengembalikan pesan galat ('' = berhasil). */
export function FormDataTubuh({ awal, onSimpan, onBatal, labelSimpan = 'Simpan' }) {
  const [isian, setIsian] = useState({
    berat: awal?.berat != null ? String(awal.berat) : '',
    tinggi: awal?.tinggi != null ? String(awal.tinggi) : '',
  })
  const [galat, setGalat] = useState({})
  const [galatServer, setGalatServer] = useState('')
  const [menyimpan, setMenyimpan] = useState(false)

  async function kirim(e) {
    e.preventDefault()
    const g = validasiPengukuran(isian)
    setGalat(g)
    setGalatServer('')
    if (Object.keys(g).length > 0) return
    setMenyimpan(true)
    const pesan = await onSimpan({
      berat: Math.round(Number(isian.berat) * 10) / 10,
      tinggi: Math.round(Number(isian.tinggi) * 10) / 10,
    })
    setMenyimpan(false)
    if (pesan) setGalatServer(pesan)
  }

  return (
    <form className="form" onSubmit={kirim} noValidate>
      <div className="form-baris">
        <div className="isian">
          <label htmlFor="berat-tubuh">Berat badan</label>
          <div className={`isian-satuan ${galat.berat ? 'salah' : ''}`}>
            <input id="berat-tubuh" type="number" inputMode="decimal" min="20" max="300" step="0.1" placeholder="65.5"
              value={isian.berat} onChange={(e) => setIsian({ ...isian, berat: e.target.value })} />
            <span>kg</span>
          </div>
          {galat.berat && <p className="pesan-salah">{galat.berat}</p>}
        </div>
        <div className="isian">
          <label htmlFor="tinggi-tubuh">Tinggi badan</label>
          <div className={`isian-satuan ${galat.tinggi ? 'salah' : ''}`}>
            <input id="tinggi-tubuh" type="number" inputMode="decimal" min="100" max="250" step="0.1" placeholder="170"
              value={isian.tinggi} onChange={(e) => setIsian({ ...isian, tinggi: e.target.value })} />
            <span>cm</span>
          </div>
          {galat.tinggi && <p className="pesan-salah">{galat.tinggi}</p>}
        </div>
      </div>
      <p className="petunjuk">Timbang pagi hari sebelum makan supaya hasilnya konsisten dari minggu ke minggu.</p>
      {galatServer && <p className="galat" role="alert">{galatServer}</p>}
      <div className="aksi-form aksi-tubuh">
        {onBatal && <button type="button" className="tombol tombol-garis" onClick={onBatal} disabled={menyimpan}>Batal</button>}
        <button type="submit" className="tombol tombol-oranye" disabled={menyimpan}>{menyimpan ? 'Menyimpan…' : labelSimpan}</button>
      </div>
    </form>
  )
}

// "Nanti": sembunyikan pengingat sampai besok (disimpan di browser).
const kunciTunda = (userId) => `bulkup_tunda_pengukuran_${userId}`
function ditundaHariIni(userId) {
  try { return localStorage.getItem(kunciTunda(userId)) === tanggalLokal() } catch { return false }
}
function tundaSampaiBesok(userId) {
  try { localStorage.setItem(kunciTunda(userId), tanggalLokal()) } catch { /* abaikan */ }
}

/**
 * Kartu di Beranda:
 * - belum pernah isi → minta berat & tinggi sekali
 * - sudah ≥ 7 hari   → pengingat kecil: "Masih sama" / "Perbarui" / "Nanti"
 * - masih baru       → tidak tampil
 */
export default function KartuDataTubuh({ user, pengukuran, simpan }) {
  const [mode, setMode] = useState('pengingat') // 'pengingat' | 'form' | 'terimakasih'
  const [tunda, setTunda] = useState(() => ditundaHariIni(user.id))
  const [galat, setGalat] = useState('')
  const status = statusPengukuran(pengukuran)
  const terakhir = beratTerakhir(pengukuran)

  if (mode === 'terimakasih') {
    return (
      <p className="berhasil kartu-tubuh-sukses" role="status">
        <Check size={18} strokeWidth={3} aria-hidden="true" /> Data tubuh tersimpan. Pengingat berikutnya {HARI_PENGINGAT} hari lagi.
      </p>
    )
  }
  if (status === 'baru' || (status === 'perlu' && tunda)) return null

  async function simpanDanSelesai(nilai) {
    const pesan = await simpan(nilai)
    if (!pesan) setMode('terimakasih')
    return pesan
  }

  async function masihSama() {
    setGalat('')
    const pesan = await simpanDanSelesai({ berat: terakhir.berat, tinggi: terakhir.tinggi })
    if (pesan) setGalat(pesan)
  }

  if (status === 'kosong') {
    return (
      <section className="kartu kartu-tubuh" aria-labelledby="judul-tubuh">
        <div className="kartu-tubuh-atas">
          <span className="chip-ikon warna-biru" aria-hidden="true"><Ruler size={18} strokeWidth={2.6} /></span>
          <div>
            <h2 id="judul-tubuh">Isi berat & tinggi badanmu</h2>
            <p>Cukup sekali. Setelah itu kamu tidak perlu mengisinya setiap hari; kami ingatkan seminggu sekali.</p>
          </div>
        </div>
        <FormDataTubuh onSimpan={simpanDanSelesai} labelSimpan="Simpan data tubuh" />
      </section>
    )
  }

  // status === 'perlu'
  return (
    <section className="kartu kartu-tubuh kartu-pengingat" aria-labelledby="judul-tubuh" role="region">
      <div className="kartu-tubuh-atas">
        <span className="chip-ikon warna-lime" aria-hidden="true"><BellRing size={18} strokeWidth={2.6} /></span>
        <div>
          <h2 id="judul-tubuh">Waktunya cek berat badan</h2>
          <p>
            Terakhir diperbarui {teksHariLalu(terakhir.tanggal)}:{' '}
            <strong>{angkaId(terakhir.berat)} kg</strong>
            {terakhir.tinggi != null && <> · <strong>{angkaId(terakhir.tinggi)} cm</strong></>}. Masih sama?
          </p>
        </div>
        {mode === 'pengingat' && (
          <button type="button" className="tombol-ikon" aria-label="Ingatkan besok"
            onClick={() => { tundaSampaiBesok(user.id); setTunda(true) }}>
            <X size={20} strokeWidth={2.6} />
          </button>
        )}
      </div>

      {mode === 'pengingat' ? (
        <>
          {terakhir.tinggi == null && (
            <p className="petunjuk">Tinggi badan belum ada. Tekan <strong>Perbarui</strong> untuk melengkapinya.</p>
          )}
          <div className="aksi-pengingat">
            <button type="button" className="tombol tombol-hitam" onClick={masihSama} disabled={terakhir.tinggi == null}>
              <Check size={18} strokeWidth={3} aria-hidden="true" /> Masih sama
            </button>
            <button type="button" className="tombol tombol-garis" onClick={() => setMode('form')}>Perbarui</button>
          </div>
          {galat && <p className="galat" role="alert">{galat}</p>}
        </>
      ) : (
        <FormDataTubuh awal={terakhir} onSimpan={simpanDanSelesai} onBatal={() => setMode('pengingat')} labelSimpan="Simpan" />
      )}
    </section>
  )
}
