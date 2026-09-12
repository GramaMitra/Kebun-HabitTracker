# Kebun — Habit Tracker sebagai Kebun Hidup

> Simulasi habit tracker yang tenang dan personal: setiap habit adalah tanaman,
> dan konsistensi merawatnya membuat kebunmu tumbuh pelan-pelan, hari demi hari.

## Konsep

- Setiap habit adalah satu tanaman di kebun pribadimu.
- Konsistensi menumbuhkan tanaman melalui tahap: **benih → tunas → tumbuh → berbunga**.
- **Melewatkan hari tidak membunuh tanaman.** Tanaman hanya layu bertahap,
  dan pulih dari titik terakhir begitu disiram kembali — progress historis
  tidak pernah hilang. Ini kebalikan dari mekanik streak yang menghukum.

## Fitur

- Kebun organik: kartu tanaman dengan posisi & kemiringan acak deterministik per tanaman.
- Siram hari ini — sekali per hari kalender, reset otomatis begitu tanggal berganti — plus tombol urungkan siraman.
- Pertumbuhan bertahap dan layu bertahap tanpa reset progress.
- 5 spesies tanaman: Sukulen, Bunga, Pohon Kecil, Herba, Tanaman Rambat.
- Frekuensi perawatan: setiap hari, atau hari-hari tertentu per minggu.
- Riwayat sepekan per tanaman + catatan opsional tiap kali menyiram.
- Mode siang / senja — otomatis mengikuti jam perangkat, bisa dioverride manual.
- Kehidupan ambient: kupu-kupu (siang), kunang-kunang (senja), kawanan burung,
  kucing kampung yang sesekali mampir, dan angin interaktif (ketuk area kosong kebun).
- Hiasan kebun terbuka bertahap dari total hari merawat:
  kerikil (5 hari), jamur kecil (15), lampu taman (30), rumah burung (60).
- Musik instrumental looping (siang & senja) dengan volume yang bisa diaturdan batas maksimum keras yang bisa
  dikunci di kode.
- Foto kebun: mode potret bersih + unduh PNG yang dirender ulang di canvas.
- Nama kebun bisa diganti, jam berdetak di header, skeleton loading siluet pot.
- Data 100% lokal di browser (localStorage) — tidak ada yang dikirim ke mana pun.

## Tech Stack

- React 18 + Vite
- Framer Motion untuk animasi berbasis state
- CSS keyframes untuk animasi ambient (sway, kunang-kunang, dll.)
- Tanpa backend — persistensi via localStorage

## Menjalankan Proyek

Prasyarat: Node.js versi 18 atau lebih baru.

    npm install
    npm run dev      # buka http://localhost:5173
    npm run build    # hasil build statis ada di dist/
    npm run preview  # pratinjau hasil build

Folder `dist/` bisa di-deploy ke Netlify, Vercel, GitHub Pages, atau hosting
statis apa pun.

## Struktur Proyek

    kebun/
    ├─ index.html
    ├─ package.json
    ├─ vite.config.js
    ├─ public/
    │  └─ sounds/
    │     ├─ garden-day.mp3     ← ambience siang (looping)
    │     └─ garden-dusk.mp3    ← ambience senja (looping)
    └─ src/
       ├─ main.jsx
       ├─ App.jsx
       ├─ styles.css
       ├─ data/
       │  └─ plantSpecies.json      ← metadata 5 spesies
       ├─ lib/
       │  ├─ garden.js              ← logika tanggal, pertumbuhan, layu, jitter
       │  ├─ species.js             ← pembaca plantSpecies.json
       │  ├─ dev.js                 ← flag DEV_MODE (true/false)
       │  └─ useIsMobile.js         ← breakpoint responsif untuk logika JS
       ├─ hooks/
       │  ├─ useHabits.js           ← CRUD habit + persist localStorage
       │  ├─ useGardenName.js       ← nama kebun (localStorage)
       │  ├─ useGardenSnapshot.js   ← komposisi foto kebun di canvas
       │  └─ useAmbientSound.js     ← suara looping + volume + batas keras
       ├─ components/
       │  ├─ Header.jsx             ← judul editable, jam, aksi
       │  ├─ GardenScene.jsx        ← scene kebun + angin interaktif
          ├─ PlantCard.jsx          ← kartu tanaman (memo, layout organik)
          ├─ PlantVisual.jsx        ← crossfade tahap, sway, FX air
          ├─ PlantDetail.jsx        ← sheet detail + urungkan siraman
          ├─ AddHabitModal.jsx      ← form tambah/edit + validasi instan
          ├─ WaterButton.jsx
          ├─ WeeklyHistoryStrip.jsx
          ├─ SnapshotMode.jsx
          ├─ EmptyGarden.jsx
          ├─ SkeletonPlant.jsx
          ├─ AmbientLife.jsx        ← kupu-kupu, burung, kucing, kunang-kunang
          ├─ GardenDecor.jsx        ← hiasan bertahap (kerikil, jamur, dll.)
          ├─ SoundControl.jsx       ← popover suara
          ├─ Clock.jsx              ← jam + detik terisolasi
          ├─ DevPanel.jsx           ← panel pengembang (time travel, dsb.)
          └─ Icons.jsx              ← ikon inline SVG
       └─ assets/
          ├─ index.js               ← resolver aset (PNG otomatis diutamakan)
          ├─ pot-silhouette.svg     ← skeleton loading
          ├─ garden/
          │  ├─ garden-bg-day.svg
          │  └─ garden-bg-dusk.svg
          └─ plants/
             ├─ succulent/  (seed, sprout, growing, bloom, wilted)
             ├─ flower/     (seed, sprout, growing, bloom, wilted)
             ├─ tree/       (seed, sprout, growing, bloom, wilted)
             ├─ herb/       (seed, sprout, growing, bloom, wilted)
             └─ vine/       (seed, sprout, growing, bloom, wilted)

## Aset Gambar

Semua visual tanaman dan latar saat ini adalah placeholder SVG buatan kode,
dengan nama file yang dipetakan mengikuti struktur final:

- `src/assets/plants/<spesies>/<tahap>.png` — 25 file (5 spesies × 5 tahap)
- `src/assets/garden/garden-bg-day.png` dan `garden-bg-dusk.png`

Resolver di `src/assets/index.js` otomatis memilih PNG di atas SVG dengan nama
basis yang sama — cukup drop file PNG ke folder yang sesuai, tanpa mengubah
kode apa pun. WebP dan JPG juga didukung.

Aset tanaman idealnya PNG transparan rasio 16:9 dengan pot di tengah dan
posisi konsisten antar tahap (supaya transisi tahap terasa mulus).
Latar kebun full-bleed 16:9 (mis. 1920×1080).

## Suara

Taruh dua file di `public/sounds/`:

- `garden-day.mp3` — lagu untuk mode siang
- `garden-dusk.mp3` — lagu untuk mode senja

Keduanya looping otomatis, setting nyala/mati dan volume tersimpan di localStorage.
Volume maksimum bisa dikunci lewat konstanta `SOUND_MAX_VOLUME` di `src/hooks/useAmbientSound.js` (default `0.35` — angkat/turunkan sesuaikarakter lagumu).

## Dev Mode

Ubah `DEV_MODE = true` di `src/lib/dev.js` untuk memunculkan panel pengembang:

- lompat maju/mundur per hari (melihat layu, pemulihan, dan pertumbuhan)
- siram semua, tanam kebun contoh dengan riwayat 18 hari
- paksa mode siang/senja, hapus semua data

Selalu kembalikan ke `false` sebelum build produksi.

## Logika Pertumbuhan & Layu

- Semua state tanaman adalah *derived* dari `waterLog` (fakta per tanggal),
  jadi progress tidak pernah tersimpan ganda dan tidak mungkin hilang.
- Tahap naik berdasarkan total hari dirawat: tunas (3), tumbuh (7), berbunga (14).
- Layu = jumlah hari jadwal berturut-turut yang terlewat dibagi 3 (maksimal penuh);
  menyiram kembali memulihkan tanaman dari titik terakhir.

## Desain

- Palet: krem `#F7F2E9`, ink `#2F3B2E`, dusty rose `#C97B6B`,
  gold `#D4A24C`, garis `#E3DBC8`, layu `#A89C89`.
- Tipografi: Instrument Serif (display) + Nunito Sans (body).
- Layout organik, mobile-first, animasi transform/opacity saja,
  menghormati `prefers-reduced-motion`.

## Penyimpanan Data

Semua data hidup di localStorage browser perangkat ini:

- `kebun.v1` — daftar habit + riwayat penyiraman
- `kebun.name` — nama kebun
- `kebun.sound` — setting suara

Menghapus data situs di browser berarti kebun dimulai dari nol.

## Lisensi

Proyek pribadi — sesuaikan bagian ini dengan lisensi pilihanmu
(MIT, Apache-2.0, dll.) sebelum dipublikasikan.
