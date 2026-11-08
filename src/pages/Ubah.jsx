import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import * as db from '../lib/db.js'
import { keBarisLog, keIsianForm, pesanGalat } from '../lib/bulking.js'
import FormLog from '../components/FormLog.jsx'

export default function Ubah() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [log, setLog] = useState(null)
  const [memuat, setMemuat] = useState(true)
  const [galat, setGalat] = useState('')

  useEffect(() => {
    db.ambilLog(id).then(({ data, error }) => {
      if (error) setGalat(pesanGalat(error))
      setLog(data ?? null)
      setMemuat(false)
    })
  }, [id])

  async function simpan(isian) {
    const { error } = await db.ubahLog(id, keBarisLog(isian))
    if (error) return pesanGalat(error)
    navigate('/')
    return ''
  }

  return (
    <>
      <div className="topbar">
        <button type="button" className="tombol-ikon" onClick={() => navigate('/')} aria-label="Kembali">
          <ChevronLeft size={22} strokeWidth={2.6} />
        </button>
        <h1 className="judul-halaman">Ubah log</h1>
        <span style={{ width: 40 }} />
      </div>
      <section className="kartu">
        {memuat ? (
          <p className="status">Memuat log…</p>
        ) : galat ? (
          <p className="galat" role="alert">{galat}</p>
        ) : !log ? (
          <div className="status">
            <p><strong>Log tidak ditemukan.</strong></p>
            <p><Link to="/">Kembali ke Beranda</Link></p>
          </div>
        ) : (
          <FormLog awal={keIsianForm(log)} labelSimpan="Simpan perubahan" onSimpan={simpan}
            onBatal={() => navigate('/')} />
        )}
      </section>
    </>
  )
}
