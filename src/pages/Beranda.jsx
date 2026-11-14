import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChartColumn, Pencil, Trash2 } from 'lucide-react'
import * as db from '../lib/db.js'
import { useAuth } from '../lib/auth.jsx'
import { useLogs } from '../lib/useLogs.js'
import { usePengukuran } from '../lib/usePengukuran.js'
import {
  WARNA_SPLIT, angkaId, beratTerakhir, formatTanggal, hariLatihanMingguIni, keBarisLog, teksHariLalu,
  pesanGalat, proteinHariIni, rataProtein7Hari,
} from '../lib/bulking.js'
import FormLog from '../components/FormLog.jsx'
import SplitIkon from '../components/SplitIkon.jsx'
import BannerDemo from '../components/BannerDemo.jsx'
import { useKonfirmasi } from '../components/Konfirmasi.jsx'
import Panduan from '../components/Panduan.jsx'
import { useBukaFormCatat } from '../components/BottomNav.jsx'
import KartuDataTubuh from '../components/DataTubuh.jsx'

export default function Beranda() {
  const { user } = useAuth()
  const target = user.target_protein
  const { logs, setLogs, memuat, galat, setGalat, muat } = useLogs()
  const { pengukuran, memuat: memuatTubuh, simpan: simpanTubuh } = usePengukuran()
  const [berhasil, setBerhasil] = useState('')
  const refForm = useRef(null)
  const refProtein = useRef(null)
  const { state } = useLocation()
  const konfirmasi = useKonfirmasi()
  const bukaForm = useBukaFormCatat()

  // Tombol "Catat" (bottom nav / header) → gulir ke form dan fokus ke isian protein.
  useEffect(() => {
    if (!state?.tambah) return
    const form = refForm.current
    const halus = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    form?.scrollIntoView({ behavior: halus ? 'smooth' : 'auto', block: 'start' })
    const t = setTimeout(() => {
      // Cadangan: kalau browser tidak menjalankan smooth scroll, lompat langsung.
      if (form && form.getBoundingClientRect().top > window.innerHeight / 2) form.scrollIntoView({ block: 'start' })
      refProtein.current?.focus({ preventScroll: true })
    }, 450)
    return () => clearTimeout(t)
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
    const yakin = await konfirmasi({
      judul: 'Hapus log ini?',
      pesan: `Log ${log.split} tanggal ${formatTanggal(log.tanggal)} (${log.protein_gram} g protein) akan dihapus permanen.`,
      labelYa: 'Hapus', ikon: 'hapus', bahaya: true,
    })
    if (!yakin) return
    const { error } = await db.hapusLog(log.id)
    if (error) return setGalat(pesanGalat(error))
    setLogs((l) => l.filter((x) => x.id !== log.id))
  }

  const hariIni = proteinHariIni(logs)
  const persen = Math.min(100, Math.round((hariIni / target) * 100))
  const sisa = Math.max(0, target - hariIni)
  const { rata, jumlahHari } = rataProtein7Hari(logs)
  const latihan = hariLatihanMingguIni(logs)
  const berat = beratTerakhir(pengukuran)

  return (
    <>
      <BannerDemo />
      {!memuatTubuh && <KartuDataTubuh user={user} pengukuran={pengukuran} simpan={simpanTubuh} />}
      {!memuat && !memuatTubuh && (
        <Panduan user={user} jumlahLog={logs.length} adaDataTubuh={pengukuran.length > 0} onCatat={bukaForm} />
      )}

      <div className="beranda-atas">
        {/* Satu kartu ringkasan: setiap angka hanya muncul sekali */}
        <section className="kartu-hero" aria-labelledby="sapaan">
          <p className="hero-kecil">Selamat datang kembali</p>
          <h1 id="sapaan">Halo, {user.nama.split(' ')[0]}! 👋</h1>

          <div className="hero-protein">
            <div className="hero-protein-atas">
              <span>Protein hari ini</span>
              <strong>{hariIni}<small> / {target} g</small></strong>
            </div>
            <div className="bar-progres" role="progressbar" aria-valuenow={persen} aria-valuemin="0"
              aria-valuemax="100" aria-label="Progres protein hari ini">
              <span style={{ width: `${persen}%` }} />
            </div>
            <p>{sisa > 0 ? `Kurang ${sisa} g lagi untuk mencapai target.` : 'Target protein hari ini tercapai! 🎉'}</p>
          </div>

          <dl className="hero-stat">
            <div>
              <dt>Latihan</dt>
              <dd><strong>{latihan}</strong> hari</dd>
              <dd className="ket">minggu ini</dd>
            </div>
            <div>
              <dt>Rata-rata protein</dt>
              <dd><strong>{rata}</strong> g</dd>
              <dd className="ket">{jumlahHari > 0 ? `${jumlahHari} hari tercatat` : '7 hari terakhir'}</dd>
            </div>
            <div>
              <dt>Berat badan</dt>
              <dd><strong>{berat ? angkaId(berat.berat) : '–'}</strong>{berat && ' kg'}</dd>
              <dd className="ket">
                {!berat ? 'belum diisi'
                  : berat.selisih != null
                    ? `${berat.selisih > 0 ? '+' : ''}${angkaId(berat.selisih)} kg dari sebelumnya`
                    : `dicek ${teksHariLalu(berat.tanggal)}`}
              </dd>
            </div>
          </dl>

          <Link to="/statistik" className="tombol-pil">
            <ChartColumn size={16} strokeWidth={2.6} aria-hidden="true" /> Lihat statistik lengkap
          </Link>
        </section>

        <section className="kartu kartu-form" ref={refForm} id="tambah" aria-labelledby="judul-catat">
          <h2 className="judul-kartu" id="judul-catat">Catat hari ini</h2>
          <FormLog ref={refProtein} labelSimpan="Simpan log" onSimpan={tambah} kosongkanSetelahSimpan />
          {berhasil && <p className="berhasil" role="status">{berhasil}</p>}
        </section>
      </div>

      <section aria-labelledby="judul-riwayat">
        <div className="judul-bagian">
          <h2 id="judul-riwayat">Riwayat log</h2>
          {logs.length > 0 && <span className="lencana">{logs.length} log</span>}
        </div>
        {galat && <p className="galat" role="alert">{galat}</p>}
        {memuat ? (
          <p className="status">Memuat log…</p>
        ) : logs.length === 0 ? (
          <div className="status">
            <p><strong>Belum ada log.</strong></p>
            <p>Catat latihan dan protein pertamamu di atas.</p>
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
                      <span className={`badge badge-${WARNA_SPLIT[log.split]}`}>{formatTanggal(log.tanggal)}</span>
                    </div>
                    <p>
                      <span className={capai ? 'tercapai' : ''}>{log.protein_gram} g protein{capai && ' ✓'}</span>
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
