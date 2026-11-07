import { latihanContoh } from './data/contoh.js'

// Starter Gerak (sesi 1). Kalau halaman ini tampil di browser, setup-mu berhasil.
// Di sesi 2 kita ganti isi halaman ini dengan komponen: ringkasan, form, dan
// daftar latihan.
export default function App() {
  return (
    <main className="halaman">
      <header className="header">
        <div className="logo">
          <img src="/gerak.svg" alt="" />
          Gerak
        </div>
      </header>

      <section className="panel">
        <h2>Setup berhasil 🎉</h2>
        <p>
          Starter Gerak sudah jalan di laptopmu. Ada {latihanContoh.length} latihan contoh
          di <code>src/data/contoh.js</code>. Di sesi 2 kita tampilkan sebagai kartu.
        </p>
      </section>

      <section className="panel">
        <h2>Data contoh</h2>
        <pre>{JSON.stringify(latihanContoh, null, 2)}</pre>
      </section>
    </main>
  )
}
