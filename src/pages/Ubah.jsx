import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { keBarisLog, keIsianForm, pesanGalat } from '../lib/bulking.js'
import Header from '../components/Header.jsx'
import FormLog from '../components/FormLog.jsx'

export default function Ubah() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [log, setLog] = useState(null)
  const [memuat, setMemuat] = useState(true)
  const [galat, setGalat] = useState('')

  useEffect(() => {
    supabase.from('log_harian').select('*').eq('id', id).maybeSingle().then(({ data, error }) => {
      // id bukan UUID valid juga dianggap "tidak ditemukan".
      if (error && error.code !== '22P02') setGalat(pesanGalat(error))
      setLog(data ?? null)
      setMemuat(false)
    })
  }, [id])

  async function simpan(isian) {
    const { error } = await supabase.from('log_harian').update(keBarisLog(isian)).eq('id', id)
    if (error) return pesanGalat(error)
    navigate('/')
    return ''
  }

  return (
    <main className="halaman">
      <Header />
      <section className="panel">
        <h2>Ubah log</h2>
        {memuat ? (
          <p className="status">Memuat log…</p>
        ) : galat ? (
          <p className="galat" role="alert">{galat}</p>
        ) : !log ? (
          <p className="status">Log tidak ditemukan. <Link to="/">Kembali ke Beranda</Link></p>
        ) : (
          <FormLog awal={keIsianForm(log)} labelSimpan="Simpan perubahan" onSimpan={simpan}
            onBatal={() => navigate('/')} />
        )}
      </section>
    </main>
  )
}
