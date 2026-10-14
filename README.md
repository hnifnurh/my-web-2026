# Personal Portfolio (Astro) — Indonesia & English

## Menjalankan
Butuh Node.js 18.20+ (disarankan 20 atau 22).

```bash
npm install
npm run dev       # buka http://localhost:4321
npm run build     # hasil statis ada di folder dist/
npm run preview   # cek hasil build
```

## Bahasa
- Bahasa Indonesia: `/`, `/work`, `/work/<id>`
- English: `/en/`, `/en/work`, `/en/work/<id>`
- Tombol **ID | EN** di navbar mengganti bahasa **seketika, tanpa memuat ulang halaman**: posisi scroll, animasi, dan isian form tetap utuh, alamat (URL) ikut berubah, dan tombol Back berfungsi.
- Pilihan bahasa diingat di browser. Pengunjung baru dengan browser berbahasa Inggris yang membuka halaman Indonesia diarahkan sekali ke versi English (bisa diganti lewat tombol).

### Dari mana teks English diambil
Untuk setiap teks, urutannya:
1. **English yang kamu tulis manual** di blok `"en"` → selalu dipakai dan tidak pernah ditimpa.
2. **Terjemahan otomatis** dari teks Indonesia (tersimpan di `src/data/translations.auto.json`).
3. **Teks Indonesia** sebagai cadangan, jadi tidak pernah error.

Cukup tulis Indonesia saja. Untuk membuat terjemahan otomatis:
```bash
export ANTHROPIC_API_KEY=sk-ant-...     # sekali saja (di Netlify/Vercel: isi sebagai Environment Variable)
npm run translate                       # atau cukup npm run build, karena otomatis dijalankan sebelum build
```
- Hanya teks yang belum punya English manual yang diterjemahkan, dan hasilnya disimpan sehingga tidak diterjemahkan ulang.
- Jika teks Indonesia kamu ubah, terjemahannya otomatis dibuat ulang saat build berikutnya.
- Untuk mengoreksi hasilnya, tulis versi yang benar di `"en"` pada JSON. Versi manual itu yang dipakai.
- Tanpa `ANTHROPIC_API_KEY`, langkah ini dilewati dan halaman English memakai teks Indonesia untuk bagian yang belum ada English-nya.
- Model bisa diganti lewat variabel `TRANSLATE_MODEL`.

## CV (pasang manual)
Taruh dua file PDF di `public/cv/` dengan nama persis:

- `public/cv/cv-id.pdf` → CV Bahasa Indonesia
- `public/cv/cv-en.pdf` → CV English

Tombol "Unduh CV" / "Download CV" (hero, About, dan footer) otomatis mengambil CV sesuai bahasa halaman.
File yang ada sekarang hanya placeholder, tinggal ditimpa. Jika ingin nama file lain, ubah `cv` di `src/data/site.json`.

## Mengisi konten (tanpa menyentuh kode tampilan)
Semua isi ada di `src/data/`. Teks ada di dalam blok `"i18n"`: `"id"` (wajib) dan `"en"` (opsional, jika kosong dipakai teks Indonesia).

| File | Isi |
|---|---|
| `site.json` | Data umum (nama, email, foto, logo, link sosial, path CV, proyek `featured`) dan teks hero/About/kontak per bahasa di `i18n` |
| `categories.json` | Daftar bidang, nama dan deskripsi per bahasa |
| `projects.json` | Semua proyek. Satu objek = satu halaman studi kasus (ada versi ID dan EN) |
| `../i18n/ui.json` | Teks antarmuka (tombol, judul bagian, label form) per bahasa |

### Format satu proyek (`projects.json`)
```json
{
  "id": "nova",                  // alamat: /work/nova dan /en/work/nova
  "cat": "mobile",               // sama dengan id di categories.json
  "y": "2026",
  "c": "c1",                     // warna cover bila belum ada gambar: c1 sampai c6
  "img": "/images/nova.jpg",     // gambar cover ("" = pakai warna)
  "gallery": ["/images/nova-1.jpg"],
  "alat": ["Figma", "Flutter"],  // nama alat, sama di dua bahasa
  "i18n": {
    "id": { "t": "Aplikasi Nova", "d": "...", "role": "...", "team": "...", "dur": "5 bulan",
            "tag": "iOS · Android", "ov": "Ringkasan", "pr": ["Langkah 1", "Langkah 2"], "hasil": "..." },
    "en": { "t": "Nova App", "d": "...", "role": "...", "team": "...", "dur": "5 months",
            "tag": "iOS · Android", "ov": "Overview", "pr": ["Step 1", "Step 2"], "hasil": "..." }
  }
}
```
Versi English **boleh dikosongkan** (hapus blok `"en"` atau isi sebagian field saja). Yang kosong akan diterjemahkan otomatis (lihat bagian Bahasa), atau memakai teks Indonesia jika terjemahan belum dibuat.

### Gambar, foto, logo
Taruh file di `public/images/`, lalu tulis path-nya, misalnya `"/images/foto.jpg"`.
- Foto profil: `site.json` → `"photo"`
- Logo navbar: `site.json` → `"logo"` (kosong = pakai huruf `initial`)

### Menambah proyek
Tambah satu objek di `projects.json`. Halaman Indonesia dan English dibuat otomatis saat build.

## Hosting
Upload isi folder `dist/` ke Netlify, Vercel, Cloudflare Pages, atau GitHub Pages.
Jika di subfolder (GitHub Pages), isi `base` di `astro.config.mjs`.

## Catatan
- Form kontak membuka aplikasi email. Agar pesan masuk otomatis, sambungkan layanan seperti Formspree.
- Gaya: `src/styles/global.css`. Animasi dan perilaku: `src/scripts/main.js`.
