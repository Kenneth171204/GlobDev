import { useState } from 'react'
import { LogOut, Mail, Target } from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'
import { useLogs } from '../lib/useLogs.js'
import { beratTerakhir, pesanGalat, streakTarget, validasiTarget } from '../lib/bulking.js'
import BannerDemo from '../components/BannerDemo.jsx'
import { useKonfirmasi } from '../components/Konfirmasi.jsx'

export default function Profil() {
  const { user, keluar, perbaruiProfil } = useAuth()
  const konfirmasi = useKonfirmasi()
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

  async function konfirmasiKeluar() {
    const yakin = await konfirmasi(user.demo
      ? {
          judul: 'Keluar dari mode coba?',
          pesan: 'Data contoh akan dihapus. Daftar gratis kalau ingin menyimpan progresmu.',
          labelYa: 'Keluar', ikon: 'keluar', bahaya: true,
        }
      : {
          judul: 'Keluar dari akun?',
          pesan: 'Data kamu tetap aman. Masuk lagi kapan saja dengan email dan password-mu.',
          labelYa: 'Keluar', ikon: 'keluar',
        })
    if (yakin) keluar()
  }

  return (
    <>
      <h1 className="judul-halaman">Profil</h1>
      <BannerDemo />

      <div className="kolom-dua">
      <section className="kartu-hero kartu-profil" aria-label="Data akun">
        <div className="avatar avatar-besar" aria-hidden="true">{user.nama.charAt(0).toUpperCase()}</div>
        <h2>{user.nama}</h2>
        <p>
          {user.demo ? 'Akun mode coba' : <><Mail size={16} strokeWidth={2.4} aria-hidden="true" /> {user.email}</>}
        </p>
        <dl className="hero-stat">
          <div><dt>Total log</dt><dd><strong>{logs.length}</strong> hari</dd></div>
          <div><dt>Latihan</dt><dd><strong>{totalLatihan}</strong> kali</dd></div>
          <div><dt>Capai target</dt><dd><strong>{streak}</strong> hari</dd><dd className="ket">berturut-turut</dd></div>
        </dl>
      </section>

      <div className="kolom">
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
              Saran untuk bulking: sekitar 2 g per kg berat badan × {String(berat.berat).replace('.', ',')} kg ={' '}
              <strong>{saran} g</strong>.{' '}
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
        <LogOut size={20} strokeWidth={2.6} aria-hidden="true" /> Keluar
      </button>
      </div>
      </div>
    </>
  )
}
