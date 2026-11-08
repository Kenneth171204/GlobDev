import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, CalendarCheck, Check, Flame, Pencil, Trash2 } from 'lucide-react'
import * as db from '../lib/db.js'
import { useAuth } from '../lib/auth.jsx'
import { useLogs } from '../lib/useLogs.js'
import {
  WARNA_SPLIT, beratTerakhir, formatTanggal, hariLatihanMingguIni, keBarisLog,
  pesanGalat, proteinHariIni, rataProtein7Hari,
} from '../lib/bulking.js'
import Logo from '../components/Logo.jsx'
import FormLog from '../components/FormLog.jsx'
import RingProgress from '../components/RingProgress.jsx'
import SplitIkon from '../components/SplitIkon.jsx'

export default function Beranda() {
  const { user } = useAuth()
  const target = user.target_protein
  const { logs, setLogs, memuat, galat, setGalat, muat } = useLogs()
  const [berhasil, setBerhasil] = useState('')
  const refForm = useRef(null)
  const refProtein = useRef(null)
  const { state } = useLocation()

  // Tombol + di bottom nav → gulir ke form dan fokus ke isian protein.
  useEffect(() => {
    if (!state?.tambah) return
    refForm.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => refProtein.current?.focus({ preventScroll: true }), 350)
  }, [state?.tambah])

  async function tambah(isian) {
    const { error } = await db.tambahLog(keBarisLog(isian))
    if (error) return pesanGalat(error)
    setBerhasil('Log tersimpan. Mantap! 💪')
    setTimeout(() => setBerhasil(''), 2500)
    await muat()
    return ''
  }

  async function hapus(log) {
    if (!window.confirm(`Hapus log ${formatTanggal(log.tanggal)}? Data tidak bisa dikembalikan.`)) return
    const { error } = await db.hapusLog(log.id)
    if (error) return setGalat(pesanGalat(error))
    setLogs((l) => l.filter((x) => x.id !== log.id))
  }

  const hariIni = proteinHariIni(logs)
  const sisa = Math.max(0, target - hariIni)
  const { rata, jumlahHari } = rataProtein7Hari(logs)
  const latihan = hariLatihanMingguIni(logs)
  const berat = beratTerakhir(logs)

  return (
    <>
      <div className="topbar">
        <Logo />
        <Link to="/profil" className="avatar avatar-kecil" aria-label="Profil">
          {user.nama.charAt(0).toUpperCase()}
        </Link>
      </div>

      {/* Hero oranye */}
      <section className="kartu-hero">
        <p className="hero-kecil">Selamat datang kembali</p>
        <h1>Halo, {user.nama.split(' ')[0]}! 👋</h1>
        <div className="hero-stat">
          <div><small>Berat</small><strong>{berat ? berat.berat : '–'}<span>kg</span></strong></div>
          <div><small>Protein</small><strong>{hariIni}<span>g</span></strong></div>
          <div><small>Latihan</small><strong>{latihan}<span>×/mgg</span></strong></div>
        </div>
      </section>

      {/* Kartu biru: target protein hari ini */}
      <section className="kartu-warna kartu-biru kartu-target">
        <div>
          <h2>Target Protein</h2>
          <ul className="daftar-mini">
            <li><Flame size={16} strokeWidth={2.6} /> Hari ini <strong>{hariIni} g</strong></li>
            <li><Check size={16} strokeWidth={2.6} /> Target <strong>{target} g</strong></li>
            <li><ArrowRight size={16} strokeWidth={2.6} /> {sisa > 0 ? <>Sisa <strong>{sisa} g</strong></> : <strong>Tercapai! 🎉</strong>}</li>
          </ul>
          <Link to="/statistik" className="tombol-pil">Lihat statistik</Link>
        </div>
        <RingProgress nilai={hariIni} maks={target} ukuran={112} tebal={12} warna="lime"
          label={`Protein hari ini ${hariIni} dari ${target} gram`}>
          <strong>{Math.round((hariIni / target) * 100)}%</strong>
        </RingProgress>
      </section>

      {/* Dua kartu kecil */}
      <div className="grid-dua">
        <section className="kartu-warna kartu-lime kartu-kecil">
          <div className="kartu-kecil-atas"><h2>Latihan</h2><CalendarCheck size={20} strokeWidth={2.6} /></div>
          <strong className="angka-besar">{latihan}<span>/7 hari</span></strong>
          <small>minggu ini</small>
        </section>
        <section className="kartu-warna kartu-oranye kartu-kecil">
          <div className="kartu-kecil-atas"><h2>Rata-rata</h2><Flame size={20} strokeWidth={2.6} /></div>
          <strong className="angka-besar">{rata}<span> g</span></strong>
          <small>{jumlahHari > 0 ? `protein · ${jumlahHari} hari` : 'protein 7 hari'}</small>
        </section>
      </div>

      {/* Form tambah */}
      <section className="kartu" ref={refForm} id="tambah">
        <h2 className="judul-kartu">Catat hari ini</h2>
        <FormLog ref={refProtein} labelSimpan="Simpan log" onSimpan={tambah} kosongkanSetelahSimpan />
        {berhasil && <p className="berhasil">{berhasil}</p>}
      </section>

      {/* Riwayat */}
      <section>
        <div className="judul-bagian">
          <h2>Riwayat log</h2>
          {logs.length > 0 && <span className="lencana">{logs.length} log</span>}
        </div>
        {galat && <p className="galat" role="alert">{galat}</p>}
        {memuat ? (
          <p className="status">Memuat log…</p>
        ) : logs.length === 0 ? (
          <div className="status">
            <p><strong>Belum ada log.</strong></p>
            <p>Catat latihan & protein pertamamu di atas.</p>
          </div>
        ) : (
          <ul className="daftar-log">
            {logs.map((log) => {
              const capai = log.protein_gram >= target
              return (
                <li key={log.id} className="log">
                  <SplitIkon split={log.split} />
                  <div className="log-isi">
                    <div className="log-atas">
                      <strong>{log.split}</strong>
                      <span className={`badge warna-${WARNA_SPLIT[log.split]}`}>{formatTanggal(log.tanggal)}</span>
                    </div>
                    <p>
                      <span className={capai ? 'tercapai' : ''}>{log.protein_gram} g protein{capai && ' ✓'}</span>
                      {log.berat_badan_kg != null && <> · {Number(log.berat_badan_kg)} kg</>}
                    </p>
                    {log.catatan && <p className="log-catatan">{log.catatan}</p>}
                  </div>
                  <div className="log-aksi">
                    <Link className="tombol-ikon" to={`/ubah/${log.id}`} aria-label={`Ubah log ${formatTanggal(log.tanggal)}`}>
                      <Pencil size={18} strokeWidth={2.4} />
                    </Link>
                    <button className="tombol-ikon tombol-ikon-bahaya" type="button" onClick={() => hapus(log)}
                      aria-label={`Hapus log ${formatTanggal(log.tanggal)}`}>
                      <Trash2 size={18} strokeWidth={2.4} />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </>
  )
}
