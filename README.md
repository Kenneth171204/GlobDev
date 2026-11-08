# Gerak — Bulking & Workout Tracker

Aplikasi web sederhana untuk mencatat split latihan gym harian (Push/Pull/Legs, dst.) dan asupan protein harian. Dibuat dengan React dan Vite.

## Fase 1

Satu data utama: **Log Harian** (tanggal, split, protein, berat badan opsional, catatan opsional), satu log per tanggal. Target protein: **130 g/hari** (`TARGET_PROTEIN` di `src/lib/bulking.js`).

| Halaman | URL | Isi |
|---|---|---|
| Daftar | `/daftar` | Nama, email, password |
| Masuk | `/masuk` | Email, password |
| Beranda | `/` | Ringkasan, form tambah log, riwayat log, tombol Ubah dan Hapus |
| Ubah | `/ubah/:id` | Form yang sudah terisi, tombol Simpan perubahan dan Batal |

### Penyimpanan: localStorage (mode demo)

Untuk sementara semua data (akun, sesi login, dan log) disimpan di `localStorage` browser lewat `src/lib/db.js`. Tidak perlu setup apa pun.

- Kunci yang dipakai: `gerak_users`, `gerak_sesi`, `gerak_logs`.
- Data hanya ada di browser dan perangkat itu. Membuka di browser lain atau mode incognito berarti mulai dari kosong.
- Password di-hash (SHA-256) sebelum disimpan, tapi ini **bukan** keamanan sungguhan. Jangan pakai password asli.
- Untuk mengosongkan data: DevTools → Application → Local Storage → hapus tiga kunci di atas.

Semua fungsi di `db.js` mengembalikan `{ data, error }`, jadi nanti bisa diganti ke Supabase tanpa mengubah halaman. Skema tabel untuk tahap itu sudah ada di `supabase/schema.sql`.

## Menjalankan

Butuh Node.js 20.19 atau lebih baru (`node -v`).

```
npm install
npm run dev
```

Buka `http://localhost:5173`, lalu daftar akun baru.

## Deploy ke Cloudflare Pages

Build command: `npm run build`, output folder: `dist`. File `public/_redirects` sudah disiapkan agar URL seperti `/ubah/...` tidak 404 saat dimuat ulang.

## Isi folder

| File | Gunanya |
|---|---|
| `supabase/schema.sql` | Skema Supabase untuk nanti (belum dipakai) |
| `src/App.jsx` | Routing 4 halaman |
| `src/pages/` | Halaman Daftar, Masuk, Beranda, Ubah |
| `src/components/FormLog.jsx` | Form log yang dipakai di Beranda dan Ubah |
| `src/components/Header.jsx` | Logo, sapaan, dan tombol Keluar |
| `src/lib/bulking.js` | Target protein, daftar split, validasi, perhitungan ringkasan |
| `src/lib/db.js` | Penyimpanan localStorage: akun, sesi, CRUD log |
| `src/lib/auth.jsx` | Sesi login dan proteksi halaman |
| `src/lib/ringkasan.js`, `src/data/contoh.js` | Sisa latihan sesi 1 (tidak dipakai aplikasi) |
