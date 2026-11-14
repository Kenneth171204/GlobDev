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

### Penyimpanan: Supabase

Akun dan log disimpan di Supabase (project **GlobDev**, region ap-southeast-2).

- **Akun:** Supabase Auth: email + password, atau **Google** (`signInWithOAuth`, alur PKCE). Provider Google diatur di Supabase → Authentication → Sign In / Providers; Redirect URLs harus memuat `https://bulkup.pages.dev/**` dan `http://localhost:5173/**`.
- **Tabel** (skema lengkap di `supabase/schema.sql`):

| Tabel | Isi | Catatan |
|---|---|---|
| `profil` | `id` (= user Auth), `nama`, `target_protein` (50–400 g, default 130), `created_at`, `updated_at` | Dibuat otomatis oleh trigger `saat_user_baru` saat daftar |
| `log_harian` | `id`, `user_id`, `tanggal`, `split`, `protein_gram` (0–500), `berat_badan_kg` (20–300, opsional), `catatan` (≤ 200), `created_at` | Unik per `(user_id, tanggal)` |
| `pengukuran_badan` | `id`, `user_id`, `tanggal`, `berat_badan_kg` (20–300), `tinggi_badan_cm` (100–250), `created_at` | Riwayat berat & tinggi; unik per `(user_id, tanggal)`. Diisi sekali, lalu pengingat tiap 7 hari (Masih sama / Perbarui) |

  Menghapus akun di Supabase Auth ikut menghapus profil dan semua log-nya.
- **Keamanan:** Row Level Security aktif di kedua tabel; setiap user hanya bisa membaca dan mengubah profil serta log miliknya sendiri. Fungsi trigger ada di schema `private` yang tidak terekspos lewat API. Frontend hanya memegang *publishable key*, yang memang aman ada di browser.
- **Mode coba** tetap memakai `localStorage` (kunci `bulkup_demo`) dan dihapus saat keluar, jadi tidak membuat akun di Supabase.

Kode: `src/lib/supabase.js` (client), `src/lib/db.js` (semua akses data, `{ data, error }`), `src/lib/db-demo.js` (mode coba).

**Konfirmasi email:** kalau "Confirm email" di Supabase (Authentication → Sign In / Providers → Email) masih aktif, user baru diminta membuka link di email sebelum bisa masuk. Matikan opsi itu kalau ingin langsung masuk setelah daftar.

## Menjalankan

Butuh Node.js 20.19 atau lebih baru (`node -v`).

```
npm install
cp .env.example .env   # lalu isi URL dan publishable key Supabase
npm run dev
```

Buka `http://localhost:5173`, lalu daftar akun baru.

## Deploy ke Cloudflare Pages

Live: **https://bulkup.pages.dev** (project Cloudflare Pages `bulkup`).

Untuk deploy ulang setelah ada perubahan (butuh `npx wrangler login` sekali). Nilai di `.env` ikut dibundel saat `npm run build`, jadi pastikan `.env` sudah terisi:

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
    ├── db.js               Akses data: Supabase (Auth, tabel profil & log_harian) atau mode coba
    ├── db-demo.js          Mode coba (localStorage)
    ├── supabase.js         Client Supabase
    └── useLogs.js          Hook memuat log user
```

`supabase/schema.sql` adalah skema tabel `profil` dan `log_harian` + RLS + trigger yang sudah diterapkan ke Supabase. `src/lib/ringkasan.js` dan `src/data/contoh.js` adalah sisa latihan sesi 1 dan tidak dipakai aplikasi.
