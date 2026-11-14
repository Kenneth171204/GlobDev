import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, CircleHelp, X } from 'lucide-react'
import { bacaPenanda, setPenanda } from '../lib/panduan.js'

/**
 * Kartu "Mulai di sini" untuk pengguna baru: 4 langkah yang tercentang otomatis.
 * onCatat: fungsi untuk menggulir ke form catat.
 */
export default function Panduan({ user, jumlahLog, adaDataTubuh, onCatat }) {
  const [tutup, setTutup] = useState(() => bacaPenanda(user.id, 'tutup'))
  if (tutup) return null

  const langkah = [
    {
      judul: 'Isi berat & tinggi badan',
      isi: 'Cukup sekali. Setelah itu kamu hanya diingatkan seminggu sekali.',
      selesai: adaDataTubuh,
      aksi: (
        <button type="button" className="tautan-langkah"
          onClick={() => document.getElementById('judul-tubuh')?.scrollIntoView({ block: 'center' })}>
          Isi sekarang
        </button>
      ),
    },
    {
      judul: 'Cek target protein harian',
      isi: `Sekarang ${user.target_protein} g per hari. Ubah di Profil kalau perlu.`,
      selesai: bacaPenanda(user.id, 'profil'),
      aksi: <Link to="/profil" className="tautan-langkah">Buka Profil</Link>,
    },
    {
      judul: 'Catat log pertamamu',
      isi: 'Pilih latihan hari ini, isi protein yang kamu makan, lalu Simpan.',
      selesai: jumlahLog >= 1,
      aksi: <button type="button" className="tautan-langkah" onClick={onCatat}>Isi form</button>,
    },
    {
      judul: 'Catat minimal 3 hari',
      isi: 'Grafik di halaman Statistik mulai terbentuk setelah ada beberapa hari data.',
      selesai: jumlahLog >= 3,
      aksi: <Link to="/statistik" className="tautan-langkah">Lihat Statistik</Link>,
    },
  ]
  const jumlahSelesai = langkah.filter((l) => l.selesai).length
  const semua = jumlahSelesai === langkah.length

  function sembunyikan() {
    setPenanda(user.id, 'tutup')
    setTutup(true)
  }

  return (
    <section className="kartu panduan" aria-labelledby="judul-panduan">
      <div className="panduan-atas">
        <div>
          <h2 id="judul-panduan">{semua ? 'Semua siap! 🎉' : 'Mulai di sini'}</h2>
          <p>{semua ? 'Lanjutkan mencatat setiap hari supaya progresmu terlihat.' : `${jumlahSelesai} dari ${langkah.length} langkah selesai`}</p>
        </div>
        <button type="button" className="tombol-ikon" onClick={sembunyikan} aria-label="Tutup panduan">
          <X size={20} strokeWidth={2.6} />
        </button>
      </div>
      {!semua && <>
      <div className="panduan-bar" aria-hidden="true"><span style={{ width: `${(jumlahSelesai / langkah.length) * 100}%` }} /></div>
      <ol className="panduan-langkah">
        {langkah.map((l, i) => (
          <li key={l.judul} className={l.selesai ? 'selesai' : ''}>
            <span className="panduan-nomor" aria-hidden="true">{l.selesai ? <Check size={16} strokeWidth={3} /> : i + 1}</span>
            <div>
              <strong>{l.judul}{l.selesai && <span className="sr-only"> (selesai)</span>}</strong>
              <p>{l.isi}</p>
              {!l.selesai && l.aksi}
            </div>
          </li>
        ))}
      </ol>
      </>}
      <p className="panduan-bawah">
        <CircleHelp size={16} strokeWidth={2.4} aria-hidden="true" /> Butuh penjelasan lain? Buka <Link to="/bantuan">Bantuan</Link>.
      </p>
    </section>
  )
}
