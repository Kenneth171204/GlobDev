# Gerak — starter (sesi 1)

Proyek kelas Global Developer Fast Track: tracker olahraga pribadi dengan React, Supabase, dan Cloudflare Pages.

## Menjalankan

1. Pastikan Node.js versi 20.19 atau lebih baru: buka terminal, ketik `node -v`.
2. Buka folder ini di VS Code, lalu buka terminal (menu **Terminal → New Terminal**).
3. Pasang paket (sekali saja):
   ```
   npm install
   ```
4. Jalankan:
   ```
   npm run dev
   ```
5. Buka alamat yang muncul (biasanya `http://localhost:5173`). Kalau tampil "Setup berhasil 🎉", kamu siap untuk sesi 2.

Hentikan server dengan `Ctrl + C` di terminal.

## Isi folder

| File | Gunanya |
|---|---|
| `src/App.jsx` | Halaman utama. Di sesi 2 diisi komponen. |
| `src/index.css` | Gaya tampilan, sudah lengkap. Tidak perlu diubah. |
| `src/data/contoh.js` | Data latihan contoh (rekaan). |
| `src/lib/ringkasan.js` | Fungsi dari latihan persiapan: `totalMenit`, `filterJenis`, `latihanMingguIni`. |
