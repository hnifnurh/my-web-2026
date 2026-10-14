# Personal Portfolio (Astro) - Indonesia & English

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