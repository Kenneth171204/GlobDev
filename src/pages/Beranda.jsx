import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import {
  TARGET_PROTEIN, beratTerakhir, formatTanggal, hariLatihanMingguIni, keBarisLog,
  pesanGalat, proteinHariIni, rataProtein7Hari,
} from '../lib/bulking.js'
import Header from '../components/Header.jsx'
import FormLog from '../components/FormLog.jsx'

const IKON_SPLIT = { Push: '💪', Pull: '🏋️', Legs: '🦵', Upper: '💪', Lower: '🦵', 'Full Body': '🔥', Rest: '😴' }

export default function Beranda() {
  const [logs, setLogs] = useState([])
  const [memuat, setMemuat] = useState(true)
  const [galat, setGalat] = useState('')
  const [berhasil, setBerhasil] = useState('')

  const muat = useCallback(async () => {
    const { data, error } = await supabase
      .from('log_harian')
      .select('*')
      .order('tanggal', { ascending: false })
    if (error) setGalat(pesanGalat(error))
    else {
      setGalat('')
      setLogs(data)
    }
    setMemuat(false)
  }, [])

  useEffect(() => { muat() }, [muat])

  async function tambah(isian) {
    const { error } = await supabase.from('log_harian').insert(keBarisLog(isian))
    if (error) return pesanGalat(error)
    setBerhasil('Log tersimpan.')
    setTimeout(() => setBerhasil(''), 2500)
    await muat()
    return ''
  }

  async function hapus(log) {
    if (!window.confirm(`Hapus log ${formatTanggal(log.tanggal)}? Data tidak bisa dikembalikan.`)) return
    const { error } = await supabase.from('log_harian').delete().eq('id', log.id)
    if (error) return setGalat(pesanGalat(error))
    setLogs((l) => l.filter((x) => x.id !== log.id))
  }

  return (
    <main className="halaman">
      <Header />
      <Ringkasan logs={logs} />

      <section className="panel">
        <h2>Tambah log harian</h2>
        <FormLog labelSimpan="Simpan log" onSimpan={tambah} kosongkanSetelahSimpan />
        {berhasil && <p className="berhasil" style={{ marginTop: 12 }}>{berhasil}</p>}
      </section>

      <section className="panel">
        <h2>Riwayat log</h2>
        {galat && <p className="galat" role="alert">{galat}</p>}
        {memuat ? (
          <p className="status">Memuat log…</p>
        ) : logs.length === 0 ? (
          <p className="status">Belum ada log. Tambahkan log pertamamu di atas.</p>
        ) : (
          <ul className="daftar">
            {logs.map((log) => (
              <li key={log.id} className="kartu">
                <div className="kartu-ikon" aria-hidden="true">{IKON_SPLIT[log.split]}</div>
                <div className="kartu-isi">
                  <strong>{formatTanggal(log.tanggal)}</strong>{' '}
                  <span className={`badge ${log.split === 'Rest' ? 'badge-rest' : ''}`}>{log.split}</span>
                  <p>
                    <span className={log.protein_gram >= TARGET_PROTEIN ? 'tercapai' : ''}>
                      {log.protein_gram} g protein{log.protein_gram >= TARGET_PROTEIN ? ' ✓' : ''}
                    </span>
                    {log.berat_badan_kg != null && <> · {Number(log.berat_badan_kg)} kg</>}
                  </p>
                  {log.catatan && <p>{log.catatan}</p>}
                </div>
                <div className="kartu-aksi">
                  <Link className="tombol-garis" to={`/ubah/${log.id}`}>Ubah</Link>
                  <button className="tombol-garis tombol-bahaya" type="button" onClick={() => hapus(log)}>Hapus</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

function Ringkasan({ logs }) {
  const hariIni = proteinHariIni(logs)
  const persen = Math.min(100, Math.round((hariIni / TARGET_PROTEIN) * 100))
  const { rata, jumlahHari } = rataProtein7Hari(logs)
  const latihan = hariLatihanMingguIni(logs)
  const berat = beratTerakhir(logs)

  return (
    <section className="panel">
      <h2>Ringkasan</h2>
      <div className="ringkasan ringkasan-4">
        <div>
          <strong>{hariIni}<span className="satuan">/{TARGET_PROTEIN} g</span></strong>
          <small>Protein hari ini</small>
        </div>
        <div>
          <strong>{rata} g</strong>
          <small>Rata-rata 7 hari{jumlahHari > 0 ? ` (${jumlahHari} log)` : ''}</small>
        </div>
        <div>
          <strong>{latihan}×</strong>
          <small>Latihan minggu ini</small>
        </div>
        <div>
          <strong>{berat ? `${berat.berat} kg` : '–'}</strong>
          <small>
            Berat terakhir
            {berat?.selisih != null && ` (${berat.selisih > 0 ? '+' : ''}${berat.selisih} kg)`}
          </small>
        </div>
      </div>
      <div className="target" role="progressbar" aria-valuenow={persen} aria-valuemin="0" aria-valuemax="100"
        aria-label="Progres protein hari ini">
        <span style={{ width: `${persen}%`, background: persen >= 100 ? 'var(--hijau)' : undefined }} />
      </div>
    </section>
  )
}
