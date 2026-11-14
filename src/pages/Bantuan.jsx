import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChartColumn, ClipboardPen, Target } from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'
import { DAFTAR_SPLIT, INFO_SPLIT } from '../lib/bulking.js'
import { setPenanda } from '../lib/panduan.js'
import SplitIkon from '../components/SplitIkon.jsx'
import { useBukaFormCatat } from '../components/BottomNav.jsx'

const FAQ = [
  {
    t: 'Lupa mencatat kemarin. Bisa diisi sekarang?',
    j: 'Bisa. Di form "Catat hari ini", ganti Tanggal ke hari yang terlewat, isi datanya, lalu Simpan.',
  },
  {
    t: 'Kenapa muncul "Log untuk tanggal ini sudah ada"?',
    j: 'Setiap tanggal hanya punya satu log. Kalau mau menambah protein di hari yang sama, ubah log yang sudah ada: tekan ikon pensil di Riwayat log, ganti angkanya, lalu Simpan perubahan.',
  },
  {
    t: 'Bagaimana cara mengubah atau menghapus log?',
    j: 'Di Beranda bagian Riwayat log, tekan ikon pensil untuk mengubah atau ikon tempat sampah untuk menghapus. Sebelum menghapus, aplikasi akan meminta konfirmasi.',
  },
  {
    t: 'Kenapa grafik di Statistik masih kosong?',
    j: 'Grafik butuh data. Catat beberapa hari dulu. Grafik berat badan berasal dari data tubuh yang kamu isi atau konfirmasi setiap minggu.',
  },
  {
    t: 'Kalau hari ini tidak latihan, perlu dicatat?',
    j: 'Perlu. Pilih "Rest" lalu isi protein. Otot justru tumbuh saat istirahat, jadi asupan protein tetap penting.',
  },
  {
    t: 'Kenapa berat badan tidak diisi setiap hari?',
    j: 'Berat badan naik-turun setiap hari karena air dan makanan, jadi cukup dicek seminggu sekali. Isi berat & tinggi sekali di awal. Setiap 7 hari muncul pengingat kecil di Beranda: tekan "Masih sama" kalau tidak berubah, atau "Perbarui" untuk mengisi angka baru. Bisa juga diubah kapan saja di Profil, bagian Data tubuh.',
  },
  {
    t: 'Bisa masuk dengan akun Google?',
    j: 'Bisa. Tekan "Lanjutkan dengan Google" di halaman awal, Masuk, atau Daftar. Kalau email Google-mu sama dengan akun yang sudah ada, keduanya otomatis menjadi satu akun.',
  },
  {
    t: 'Apa bedanya akun dan "Coba tanpa akun"?',
    j: 'Dengan akun, data tersimpan di server dan bisa dibuka di perangkat mana pun. Mode coba hanya berisi data contoh di browser ini dan langsung dihapus saat kamu keluar.',
  },
  {
    t: 'Apakah orang lain bisa melihat dataku?',
    j: 'Tidak. Setiap akun hanya bisa membaca dan mengubah datanya sendiri.',
  },
]

const ISTILAH = [
  { k: 'Bulking', a: 'Fase menambah berat badan dan massa otot: makan sedikit di atas kebutuhan dengan protein cukup, sambil rutin latihan beban.' },
  { k: 'Target protein', a: 'Jumlah gram protein yang ingin kamu makan per hari. Umumnya 1,6–2,2 g per kg berat badan. Bisa diubah di Profil.' },
  { k: 'Split latihan', a: 'Cara membagi latihan per bagian tubuh di hari yang berbeda, supaya otot sempat pulih.' },
  { k: 'Berturut-turut capai target', a: 'Berapa hari berturut-turut (sampai hari ini atau kemarin) protein kamu mencapai target.' },
]

export default function Bantuan() {
  const { user } = useAuth()
  const bukaForm = useBukaFormCatat()
  const [info, setInfo] = useState('')

  function tampilkanPanduan() {
    setPenanda(user.id, 'tutup', false)
    setInfo('Kartu "Mulai di sini" akan tampil lagi di Beranda.')
  }

  return (
    <>
      <h1 className="judul-halaman">Bantuan</h1>
      <p className="sub-halaman">Panduan singkat memakai BulkUp.</p>

      <section className="kartu" aria-labelledby="judul-cara">
        <h2 className="judul-kartu" id="judul-cara">Cara pakai dalam 3 langkah</h2>
        <ol className="cara-pakai">
          <li>
            <span className="chip-ikon warna-oranye" aria-hidden="true"><Target size={18} strokeWidth={2.6} /></span>
            <div>
              <strong>Tentukan target protein</strong>
              <p>Buka <Link to="/profil">Profil</Link> dan sesuaikan target gram protein per hari.</p>
            </div>
          </li>
          <li>
            <span className="chip-ikon warna-lime" aria-hidden="true"><ClipboardPen size={18} strokeWidth={2.6} /></span>
            <div>
              <strong>Catat setiap hari</strong>
              <p>
                Tekan tombol <b>+</b> (atau <b>Catat log</b> di layar lebar), pilih latihan hari itu, isi total protein,
                lalu Simpan. Berat & tinggi badan cukup diisi sekali; kamu diingatkan seminggu sekali.{' '}
                <button type="button" className="tautan" onClick={bukaForm}>Catat sekarang</button>
              </p>
            </div>
          </li>
          <li>
            <span className="chip-ikon warna-biru" aria-hidden="true"><ChartColumn size={18} strokeWidth={2.6} /></span>
            <div>
              <strong>Pantau progres</strong>
              <p>Buka <Link to="/statistik">Statistik</Link> untuk melihat grafik protein dan berat badan per minggu atau bulan.</p>
            </div>
          </li>
        </ol>
        <button type="button" className="tombol tombol-garis tombol-kecil" onClick={tampilkanPanduan}>
          Tampilkan lagi panduan di Beranda
        </button>
        {info && <p className="berhasil" role="status">{info}</p>}
      </section>

      <div className="kolom-dua">
        <section className="kartu" aria-labelledby="judul-split">
          <h2 className="judul-kartu" id="judul-split">Arti pilihan latihan</h2>
          <ul className="daftar-istilah">
            {DAFTAR_SPLIT.map((s) => (
              <li key={s}>
                <SplitIkon split={s} size={18} />
                <div><strong>{s}</strong><p>{INFO_SPLIT[s]}</p></div>
              </li>
            ))}
          </ul>
        </section>

        <div className="kolom">
          <section className="kartu" aria-labelledby="judul-istilah">
            <h2 className="judul-kartu" id="judul-istilah">Istilah</h2>
            <dl className="glosarium">
              {ISTILAH.map((i) => (
                <div key={i.k}><dt>{i.k}</dt><dd>{i.a}</dd></div>
              ))}
            </dl>
          </section>

          <section className="kartu" aria-labelledby="judul-faq">
            <h2 className="judul-kartu" id="judul-faq">Pertanyaan umum</h2>
            <div className="faq">
              {FAQ.map((f) => (
                <details key={f.t}>
                  <summary>{f.t}</summary>
                  <p>{f.j}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
