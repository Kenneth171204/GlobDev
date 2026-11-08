import { useState } from 'react'
import { LogOut, Mail, Target } from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'
import { useLogs } from '../lib/useLogs.js'
import { beratTerakhir, pesanGalat, streakTarget, validasiTarget } from '../lib/bulking.js'

export default function Profil() {
  const { user, keluar, perbaruiProfil } = useAuth()
  const { logs } = useLogs()
  const [target, setTarget] = useState(String(user.target_protein))
  const [galat, setGalat] = useState('')
  const [berhasil, setBerhasil] = useState('')
  const [menyimpan, setMenyimpan] = useState(false)

  const berat = beratTerakhir(logs)
  const saran = berat ? Math.round(berat.berat * 2) : null
  const totalLatihan = logs.filter((l) => l.split !== 'Rest').length
  const streak = streakTarget(logs, user.target_protein)

  async function simpan(e) {
    e.preventDefault()
    const g = validasiTarget(target)
    setGalat(g)
    setBerhasil('')
    if (g) return
    setMenyimpan(true)
    const error = await perbaruiProfil({ target_protein: Number(target) })
    setMenyimpan(false)
    if (error) setGalat(pesanGalat(error))
    else setBerhasil('Target protein diperbarui.')
  }

  function konfirmasiKeluar() {
    if (window.confirm('Keluar dari akun ini?')) keluar()
  }

  return (
    <>
      <div className="topbar">
        <h1 className="judul-halaman">Profil</h1>
      </div>

      <section className="kartu-hero kartu-profil">
        <div className="avatar avatar-besar">{user.nama.charAt(0).toUpperCase()}</div>
        <h2>{user.nama}</h2>
        <p><Mail size={14} strokeWidth={2.4} /> {user.email}</p>
        <div className="hero-stat">
          <div><small>Total log</small><strong>{logs.length}</strong></div>
          <div><small>Latihan</small><strong>{totalLatihan}</strong></div>
          <div><small>Streak</small><strong>{streak}<span>hr</span></strong></div>
        </div>
      </section>

      <section className="kartu">
        <div className="judul-kartu-baris">
          <h2 className="judul-kartu">Target protein harian</h2>
          <span className="chip-ikon warna-oranye"><Target size={18} strokeWidth={2.6} /></span>
        </div>
        <form className="form" onSubmit={simpan} noValidate>
          <div className="isian">
            <label htmlFor="target">Target per hari</label>
            <div className={`isian-satuan isian-besar ${galat ? 'salah' : ''}`}>
              <input id="target" type="number" inputMode="numeric" min="50" max="400" step="1" value={target}
                onChange={(e) => { setTarget(e.target.value); setBerhasil('') }} />
              <span>g</span>
            </div>
            {galat && <p className="pesan-salah">{galat}</p>}
          </div>
          {saran && (
            <p className="saran">
              Saran bulking ±2 g/kg × {berat.berat} kg = <strong>{saran} g</strong>.{' '}
              <button type="button" className="tautan" onClick={() => { setTarget(String(saran)); setBerhasil('') }}>
                Pakai angka ini
              </button>
            </p>
          )}
          {berhasil && <p className="berhasil">{berhasil}</p>}
          <button className="tombol tombol-oranye" type="submit"
            disabled={menyimpan || Number(target) === user.target_protein}>
            {menyimpan ? 'Menyimpan…' : 'Simpan target'}
          </button>
        </form>
      </section>

      <button type="button" className="tombol tombol-hitam tombol-keluar" onClick={konfirmasiKeluar}>
        <LogOut size={20} strokeWidth={2.6} /> Keluar
      </button>
    </>
  )
}
