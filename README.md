# Gerak — Bulking & Workout Tracker

Aplikasi web sederhana untuk mencatat split latihan gym harian (Push/Pull/Legs, dst.) dan asupan protein harian. Dibuat dengan React, Supabase, dan Cloudflare Pages.

## Fase 1

Satu data utama: **Log Harian** (tanggal, split, protein, berat badan opsional, catatan opsional), satu log per tanggal. Target protein: **130 g/hari** (`TARGET_PROTEIN` di `src/lib/bulking.js`).

| Halaman | URL | Isi |
|---|---|---|
| Daftar | `/daftar` | Nama, email, password |
| Masuk | `/masuk` | Email, password |
| Beranda | `/` | Ringkasan, form tambah log, riwayat log, tombol Ubah dan Hapus |
| Ubah | `/ubah/:id` | Form yang sudah terisi, tombol Simpan perubahan dan Batal |

## Setup Supabase (sekali saja)

1. Masuk ke [supabase.com](https://supabase.com/dashboard), klik **New project**, isi nama (mis. `gerak`), password database, dan region terdekat (mis. Singapore). Tunggu sampai project siap.
2. Buka **SQL Editor → New query**, tempel seluruh isi `supabase/schema.sql`, lalu klik **Run**. Perintah ini membuat tabel `log_harian` beserta aturan keamanan (RLS).
3. Buka **Authentication → Sign In / Providers → Email**, matikan **Confirm email**, lalu simpan. Dengan begitu user langsung bisa masuk setelah daftar.
4. Buka **Project Settings → API** (atau tombol **Connect**). Salin **Project URL** dan **anon / publishable key**.
5. Di folder proyek, salin `.env.example` menjadi `.env`, lalu isi:
   ```
   VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=key-yang-tadi-disalin
   ```
   File `.env` tidak ikut ter-commit (sudah ada di `.gitignore`).

## Menjalankan

Butuh Node.js 20.19 atau lebih baru (`node -v`).

```
npm install
npm run dev
```

Buka `http://localhost:5173`. Kalau `.env` belum diisi, halaman akan menampilkan petunjuk setup.

## Deploy ke Cloudflare Pages

Build command: `npm run build`, output folder: `dist`. Tambahkan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` di **Settings → Environment variables**. File `public/_redirects` sudah disiapkan agar URL seperti `/ubah/...` tidak 404 saat dimuat ulang.

## Isi folder

| File | Gunanya |
|---|---|
| `supabase/schema.sql` | Tabel `log_harian` + RLS |
| `src/App.jsx` | Routing 4 halaman |
| `src/pages/` | Halaman Daftar, Masuk, Beranda, Ubah |
| `src/components/FormLog.jsx` | Form log yang dipakai di Beranda dan Ubah |
| `src/components/Header.jsx` | Logo, sapaan, dan tombol Keluar |
| `src/lib/bulking.js` | Target protein, daftar split, validasi, perhitungan ringkasan |
| `src/lib/auth.jsx` | Sesi login dan proteksi halaman |
| `src/lib/supabase.js` | Koneksi Supabase |
| `src/lib/ringkasan.js`, `src/data/contoh.js` | Sisa latihan sesi 1 (tidak dipakai aplikasi) |
