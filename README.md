# BulkUp — Bulking & Workout Tracker

Aplikasi web mobile-first untuk mencatat split latihan gym harian (Push/Pull/Legs, dst.), asupan protein, dan berat badan selama bulking. Dibuat dengan React, Vite, React Router, dan ikon Lucide.

## Fase 1

Satu data utama: **Log Harian** (tanggal, split, protein, berat badan opsional, catatan opsional), satu log per tanggal. Target protein default **130 g/hari**, bisa diubah per user di halaman Profil.

| Halaman | URL | Isi |
|---|---|---|
| Onboarding | `/selamat-datang` | Judul besar "BULK UP", ilustrasi, tombol **Daftar gratis** dan **Coba tanpa akun** |
| Daftar | `/daftar` | Nama, email, password |
| Masuk | `/masuk` | Email, password |
| Beranda | `/` | Satu kartu ringkasan, form catat log (langsung di bawahnya), riwayat log (ubah/hapus) |
| Statistik | `/statistik` | Ring progres protein hari ini, grafik protein & berat (minggu/bulan), komposisi split |
| Profil | `/profil` | Nama, email, edit target protein, tombol Keluar |
| Ubah | `/ubah/:id` | Form yang sudah terisi, Simpan perubahan / Batal |

Semua halaman setelah login memakai header yang sama (logo + avatar). Di ponsel, menu ada di **bottom navigation** hitam (Beranda, tombol **+** untuk lompat ke form, Statistik, Profil); di layar ≥ 960px menu pindah ke header dan halaman memakai tata letak dua kolom.

**Mode coba tanpa akun:** tombol "Coba tanpa akun" membuat akun tamu sementara berisi data contoh 2 minggu. Data itu dihapus otomatis saat keluar.

### Desain

- Warna: oranye `#FF5A1F`, biru `#1F6BFF`, hijau stabilo `#C8F31D`, hitam `#141414`, putih. Semua ada sebagai variabel CSS di awal `src/index.css`.
- Kontras dicek dengan rumus WCAG 2.1: teks putih hanya di atas oranye tua (`#D2460E`–`#B93A0A`, ≥ 4.5:1) atau biru tombol (`#2563EB`–`#1A56DB`); oranye terang hanya untuk dekorasi dan ikon. Teks di atas hijau stabilo selalu hitam (14:1).
- Font Poppins (Google Fonts), kartu bersudut bulat dengan bayangan lembut.
- Logo BulkUp dan ilustrasi onboarding digambar sendiri dengan SVG (`src/components/Logo.jsx`, `src/pages/Onboarding.jsx`). Ikon lain dari `lucide-react`.
- Grafik dan ring progres dibuat dengan SVG sendiri, tanpa library chart.

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

Live: **https://bulkup.pages.dev** (project Cloudflare Pages `bulkup`).

Untuk deploy ulang setelah ada perubahan (butuh `npx wrangler login` sekali):

```
npm run build
npx wrangler pages deploy dist --project-name bulkup --branch main
```

File `public/_redirects` membuat URL seperti `/statistik` atau `/ubah/...` tetap jalan saat dimuat ulang.

## Struktur folder

```
src/
├── App.jsx                 Routing semua halaman
├── index.css               Design system (warna, kartu, tombol, nav, grafik)
├── components/
│   ├── AppLayout.jsx       Header bersama + menu desktop + bottom nav
│   ├── AuthLayout.jsx      Kerangka Daftar/Masuk + input berikon
│   ├── BannerDemo.jsx      Pengingat mode coba
│   ├── BottomNav.jsx       Navigasi bawah hitam
│   ├── FormLog.jsx         Form log (Beranda & Ubah)
│   ├── LineChart.jsx       Grafik garis SVG
│   ├── Logo.jsx            Logo BulkUp (SVG)
│   ├── RingProgress.jsx    Circular progress SVG
│   └── SplitIkon.jsx       Ikon & warna per split
├── pages/
│   ├── Onboarding.jsx  Daftar.jsx  Masuk.jsx
│   ├── Beranda.jsx  Statistik.jsx  Profil.jsx  Ubah.jsx
└── lib/
    ├── auth.jsx            Context login + proteksi rute
    ├── bulking.js          Target, split, validasi, perhitungan ringkasan & grafik
    ├── db.js               Penyimpanan localStorage (akun, sesi, CRUD log, profil)
    └── useLogs.js          Hook memuat log user
```

`supabase/schema.sql` adalah skema untuk tahap berikutnya (belum dipakai). `src/lib/ringkasan.js` dan `src/data/contoh.js` adalah sisa latihan sesi 1 dan tidak dipakai aplikasi.
