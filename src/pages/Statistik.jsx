import { useState } from 'react'
import { Dumbbell, Flame, Trophy } from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'
import { useLogs } from '../lib/useLogs.js'
import {
  DAFTAR_SPLIT, WARNA_SPLIT, hariLatihanMingguIni, proteinHariIni, rataProtein7Hari, seriHarian, streakTarget,
} from '../lib/bulking.js'
import RingProgress from '../components/RingProgress.jsx'
import LineChart from '../components/LineChart.jsx'

const RENTANG = [
  { hari: 7, label: '7 hari' },
  { hari: 30, label: '30 hari' },
]

export default function Statistik() {
  const { user } = useAuth()
  const target = user.target_protein
  const { logs, memuat } = useLogs()
  const [rentang, setRentang] = useState(7)

  const hariIni = proteinHariIni(logs)
  const { rata } = rataProtein7Hari(logs)
  const latihan = hariLatihanMingguIni(logs)
  const streak = streakTarget(logs, target)
  const seri = seriHarian(logs, rentang)
  const awalRentang = seri[0].tanggal
  const logRentang = logs.filter((l) => l.tanggal >= awalRentang)
  const jumlahSplit = DAFTAR_SPLIT.map((s) => ({ split: s, n: logRentang.filter((l) => l.split === s).length }))
    .filter((x) => x.n > 0)
  const totalSplit = jumlahSplit.reduce((a, b) => a + b.n, 0)
  const sisa = Math.max(0, target - hariIni)

  if (memuat) return <p className="status">Memuat statistik…</p>

  return (
    <>
      <h1 className="judul-halaman">Statistik</h1>

      <div className="kolom-dua">
      <div className="kolom">
      <section className="kartu kartu-ring">
        <RingProgress nilai={hariIni} maks={target} ukuran={230} tebal={20}
          label={`Protein hari ini ${hariIni} dari ${target} gram`}>
          <span className="ring-ikon"><Flame size={54} strokeWidth={2.4} /></span>
        </RingProgress>
        <p className="ring-angka">{hariIni}<span> / {target} g</span></p>
        <p className="ring-sub">
          {sisa > 0 ? `Protein hari ini. Kurang ${sisa} g lagi untuk mencapai target.` : 'Target protein hari ini tercapai! 🎉'}
        </p>
      </section>

      <section className="strip-hitam" aria-label="Ringkasan">
        <div>
          <Flame size={20} strokeWidth={2.6} aria-hidden="true" />
          <strong>{rata}<small> g</small></strong>
          <span>rata-rata protein 7 hari terakhir</span>
        </div>
        <div>
          <Dumbbell size={20} strokeWidth={2.6} aria-hidden="true" />
          <strong>{latihan}<small> hari</small></strong>
          <span>latihan minggu ini</span>
        </div>
        <div>
          <Trophy size={20} strokeWidth={2.6} aria-hidden="true" />
          <strong>{streak}<small> hari</small></strong>
          <span>berturut-turut capai target</span>
        </div>
      </section>
      </div>

      <div className="kolom">
      <div className="segmen" role="tablist" aria-label="Rentang waktu">
        {RENTANG.map((r) => (
          <button key={r.hari} type="button" role="tab" aria-selected={rentang === r.hari}
            className={rentang === r.hari ? 'aktif' : ''} onClick={() => setRentang(r.hari)}>
            {r.label}
          </button>
        ))}
      </div>

      <section className="kartu">
        <div className="judul-kartu-baris">
          <h2 className="judul-kartu">Protein harian</h2>
          <span className="legenda"><i className="titik-oranye" /> gram</span>
        </div>
        <LineChart data={seri.map((d) => ({ label: d.label, nilai: d.protein }))} target={target} satuan="g"
          label="Grafik protein harian" kosong="Belum ada log protein di rentang ini." />
      </section>

      <section className="kartu">
        <div className="judul-kartu-baris">
          <h2 className="judul-kartu">Berat badan</h2>
          <span className="legenda"><i className="titik-biru" /> kg</span>
        </div>
        <LineChart data={seri.map((d) => ({ label: d.label, nilai: d.berat }))} warna="#1F6BFF" satuan="kg"
          label="Grafik berat badan" kosong="Isi berat badan di log untuk melihat grafiknya." />
      </section>

      <section className="kartu">
        <h2 className="judul-kartu">Komposisi split</h2>
        {totalSplit === 0 ? (
          <p className="grafik-kosong">Belum ada latihan di rentang ini.</p>
        ) : (
          <>
            <div className="bar-split" role="img"
              aria-label={jumlahSplit.map((x) => `${x.split} ${x.n}`).join(', ')}>
              {jumlahSplit.map((x) => (
                <span key={x.split} className={`warna-${WARNA_SPLIT[x.split]}`}
                  style={{ flexGrow: x.n }} title={`${x.split}: ${x.n}`} />
              ))}
            </div>
            <ul className="legenda-split">
              {jumlahSplit.map((x) => (
                <li key={x.split}><i className={`warna-${WARNA_SPLIT[x.split]}`} />{x.split} <strong>{x.n}</strong></li>
              ))}
            </ul>
          </>
        )}
      </section>
      </div>
      </div>
    </>
  )
}
