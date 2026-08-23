/* =============================================================================
 * DATA LISTING / LISTING DATA
 * =============================================================================
 *
 * ID — Semua properti yang tampil di website ini diambil dari file ini saja.
 *      Untuk menambah, mengubah, atau menghapus listing, cukup edit daftar di
 *      bawah. Tidak perlu menyentuh file lain.
 *
 * EN — Every property on the site comes from this one file. To add, change, or
 *      remove a listing, edit the list below. No other file needs touching.
 *
 * -----------------------------------------------------------------------------
 * PENTING / IMPORTANT
 * -----------------------------------------------------------------------------
 * ID — Isi file ini masih DATA CONTOH untuk keperluan pratinjau desain. Website
 *      menandainya sebagai contoh di setiap kartu dan di setiap halaman detail.
 *      Setelah data asli dimasukkan, ubah SAMPLE_DATA di bawah menjadi false
 *      supaya penanda "contoh" hilang dari seluruh website.
 *
 * EN — The entries below are SAMPLE DATA for this design preview. The site
 *      marks them as samples on every card and detail page. Once real listings
 *      replace them, set SAMPLE_DATA to false and the sample markers disappear
 *      site-wide.
 *
 * -----------------------------------------------------------------------------
 * CARA MENGISI SETIAP KOLOM / WHAT EACH FIELD MEANS
 * -----------------------------------------------------------------------------
 * code         Kode listing, huruf besar, unik. Contoh: "IP-RM-001".
 *              Kode ini juga dipakai di pesan WhatsApp dan alamat halaman,
 *              jadi jangan diubah setelah listing dipublikasikan.
 *
 * type         Salah satu dari: rumah, villa, tanah, hotel, komersial.
 *
 * status       "dijual" atau "disewa".
 *
 * title        Judul listing. Wajib dua bahasa:
 *                id: judul Bahasa Indonesia
 *                en: judul Bahasa Inggris
 *
 * area         Nama daerah atau kecamatan saja, misalnya "Kesiman Kertalangu".
 *              JANGAN menulis alamat lengkap atau nomor rumah di sini.
 *
 * regency      Kabupaten atau kota, misalnya "Denpasar" atau "Badung".
 *
 * price        Angka rupiah tanpa titik dan tanpa "Rp".
 *              Contoh: 2750000000 berarti Rp 2.750.000.000
 *
 * pricePeriod  Hanya untuk status "disewa". Isi "tahun" atau "bulan".
 *              Untuk status "dijual", hapus baris ini.
 *
 * bedrooms     Jumlah kamar tidur. Hapus baris ini untuk tanah.
 * bathrooms    Jumlah kamar mandi. Hapus baris ini untuk tanah.
 * landArea     Luas tanah dalam meter persegi. Angka saja.
 * buildingArea Luas bangunan dalam meter persegi. Angka saja.
 *              Hapus baris ini untuk tanah kosong.
 *
 * certificate  Jenis sertifikat: SHM, HGB, SHGB, Hak Pakai, atau Girik.
 *              Tulis JENIS-nya saja. Jangan pernah menulis nomor sertifikat.
 *
 * description  Deskripsi singkat, dua bahasa. Dua sampai empat kalimat cukup.
 *
 * views        Berapa panel gambar yang muncul di galeri listing ini (2 - 4).
 *
 * -----------------------------------------------------------------------------
 * SETELAH MENGEDIT / AFTER EDITING
 * -----------------------------------------------------------------------------
 * ID — Kalau menambah listing baru, jalankan `npm run build:tiles` sekali
 *      supaya gambar penggantinya ikut dibuat, lalu simpan dan deploy.
 * EN — After adding a listing, run `npm run build:tiles` once so its artwork is
 *      generated, then save and deploy.
 * ========================================================================== */

import type { Listing } from "./types.ts";

/**
 * ID — Ubah menjadi false setelah semua listing di bawah diganti data asli.
 * EN — Set to false once every listing below holds real data.
 */
export const SAMPLE_DATA = true;

export const LISTINGS: Listing[] = [
  {
    code: "IP-RM-001",
    type: "rumah",
    status: "dijual",
    title: {
      id: "Rumah dua lantai di Kesiman Kertalangu",
      en: "Two-storey house in Kesiman Kertalangu",
    },
    area: "Kesiman Kertalangu",
    regency: "Denpasar",
    price: 2750000000,
    bedrooms: 4,
    bathrooms: 3,
    landArea: 210,
    buildingArea: 175,
    certificate: "SHM",
    description: {
      id: "Rumah dua lantai dengan carport dan halaman belakang. Berada di jalur lingkungan Denpasar Timur, dekat akses menuju Jalan Gatot Subroto Timur.",
      en: "A two-storey house with a carport and a rear yard, on a residential lane in East Denpasar near the Gatot Subroto Timur approach.",
    },
    views: 4,
  },
  {
    code: "IP-RM-002",
    type: "rumah",
    status: "disewa",
    title: {
      id: "Rumah satu lantai dekat Renon",
      en: "Single-storey house near Renon",
    },
    area: "Sumerta Kelod",
    regency: "Denpasar",
    price: 95000000,
    pricePeriod: "tahun",
    bedrooms: 3,
    bathrooms: 2,
    landArea: 160,
    buildingArea: 120,
    certificate: "SHM",
    description: {
      id: "Rumah satu lantai dengan tiga kamar tidur dan taman kecil di depan. Cocok untuk keluarga yang bekerja di sekitar kawasan Renon.",
      en: "A single-storey, three-bedroom house with a small front garden, suited to a family working around the Renon district.",
    },
    views: 3,
  },
  {
    code: "IP-VL-001",
    type: "villa",
    status: "dijual",
    title: {
      id: "Villa tiga kamar dengan kolam renang di Canggu",
      en: "Three-bedroom villa with pool in Canggu",
    },
    area: "Canggu",
    regency: "Badung",
    price: 6900000000,
    bedrooms: 3,
    bathrooms: 3,
    landArea: 400,
    buildingArea: 260,
    certificate: "HGB",
    description: {
      id: "Villa satu lantai dengan kolam renang, ruang terbuka, dan area parkir. Berada di lingkungan villa sewa harian di kawasan Canggu.",
      en: "A single-storey villa with a pool, open living area, and parking, set among daily-rental villas in the Canggu area.",
    },
    views: 4,
  },
  {
    code: "IP-VL-002",
    type: "villa",
    status: "disewa",
    title: {
      id: "Villa dua kamar dengan taman tertutup di Ubud",
      en: "Two-bedroom villa with enclosed garden in Ubud",
    },
    area: "Ubud",
    regency: "Gianyar",
    price: 320000000,
    pricePeriod: "tahun",
    bedrooms: 2,
    bathrooms: 2,
    landArea: 300,
    buildingArea: 150,
    certificate: "Hak Pakai",
    description: {
      id: "Villa dua kamar dengan taman tertutup dan teras panjang menghadap sawah. Disewakan per tahun.",
      en: "A two-bedroom villa with an enclosed garden and a long terrace facing rice fields. Let by the year.",
    },
    views: 3,
  },
  {
    code: "IP-VL-003",
    type: "villa",
    status: "dijual",
    title: {
      id: "Villa empat kamar dengan akses pantai di Sanur",
      en: "Four-bedroom villa with beach access in Sanur",
    },
    area: "Sanur",
    regency: "Denpasar",
    price: 11500000000,
    bedrooms: 4,
    bathrooms: 4,
    landArea: 650,
    buildingArea: 420,
    certificate: "SHM",
    description: {
      id: "Villa empat kamar dengan kolam renang panjang dan bangunan terpisah untuk dapur dan ruang makan. Jalur menuju pantai berjarak jalan kaki.",
      en: "A four-bedroom villa with a lap pool and a separate kitchen and dining pavilion, a walk from the beach path.",
    },
    views: 4,
  },
  {
    code: "IP-TN-001",
    type: "tanah",
    status: "dijual",
    title: {
      id: "Tanah kavling siap bangun di Kesiman",
      en: "Building plot in Kesiman",
    },
    area: "Kesiman",
    regency: "Denpasar",
    price: 1850000000,
    landArea: 300,
    certificate: "SHM",
    description: {
      id: "Kavling siap bangun dengan lebar muka menghadap jalan lingkungan. Cocok untuk rumah tinggal.",
      en: "A ready-to-build plot with frontage onto a residential lane, suited to a single house.",
    },
    views: 2,
  },
  {
    code: "IP-TN-002",
    type: "tanah",
    status: "dijual",
    title: {
      id: "Tanah sawah dengan pemandangan terbuka di Tabanan",
      en: "Open rice-field land in Tabanan",
    },
    area: "Kediri",
    regency: "Tabanan",
    price: 4200000000,
    landArea: 2100,
    certificate: "SHM",
    description: {
      id: "Bidang tanah luas dengan kontur bertingkat dan pemandangan terbuka ke arah sawah. Akses melalui jalan desa.",
      en: "A large parcel on stepped contours with an open outlook across the fields, reached by a village road.",
    },
    views: 2,
  },
  {
    code: "IP-TN-003",
    type: "tanah",
    status: "disewa",
    title: {
      id: "Tanah komersial pinggir jalan di Denpasar Timur",
      en: "Roadside commercial land in East Denpasar",
    },
    area: "Penatih",
    regency: "Denpasar",
    price: 180000000,
    pricePeriod: "tahun",
    landArea: 500,
    certificate: "HGB",
    description: {
      id: "Bidang tanah pinggir jalan dengan lebar muka lebar, disewakan per tahun untuk penggunaan komersial.",
      en: "A roadside parcel with wide frontage, let by the year for commercial use.",
    },
    views: 2,
  },
  {
    code: "IP-HT-001",
    type: "hotel",
    status: "dijual",
    title: {
      id: "Hotel dua puluh empat kamar di Kuta",
      en: "Twenty-four room hotel in Kuta",
    },
    area: "Kuta",
    regency: "Badung",
    price: 34000000000,
    bedrooms: 24,
    bathrooms: 24,
    landArea: 1200,
    buildingArea: 1850,
    certificate: "HGB",
    description: {
      id: "Bangunan hotel empat lantai dengan lobi, restoran, dan kolam renang di lantai dasar. Berada di jalur kawasan wisata Kuta.",
      en: "A four-storey hotel building with lobby, restaurant, and ground-floor pool, on a route through the Kuta tourist area.",
    },
    views: 4,
  },
  {
    code: "IP-HT-002",
    type: "hotel",
    status: "disewa",
    title: {
      id: "Guesthouse dua belas kamar di Jimbaran",
      en: "Twelve-room guesthouse in Jimbaran",
    },
    area: "Jimbaran",
    regency: "Badung",
    price: 850000000,
    pricePeriod: "tahun",
    bedrooms: 12,
    bathrooms: 12,
    landArea: 700,
    buildingArea: 640,
    certificate: "HGB",
    description: {
      id: "Bangunan penginapan tiga lantai dengan dua belas kamar, area sarapan, dan parkir di halaman depan. Disewakan per tahun.",
      en: "A three-storey guesthouse with twelve rooms, a breakfast area, and forecourt parking. Let by the year.",
    },
    views: 3,
  },
  {
    code: "IP-KM-001",
    type: "komersial",
    status: "disewa",
    title: {
      id: "Ruko dua lantai di Jalan Gatot Subroto Timur",
      en: "Two-storey shophouse on Gatot Subroto Timur",
    },
    area: "Kesiman Kertalangu",
    regency: "Denpasar",
    price: 140000000,
    pricePeriod: "tahun",
    bathrooms: 2,
    landArea: 90,
    buildingArea: 160,
    certificate: "HGB",
    description: {
      id: "Ruko dua lantai dengan muka toko lebar dan ruang penyimpanan di belakang. Berada di jalur utama Denpasar Timur.",
      en: "A two-storey shophouse with a wide shopfront and storage to the rear, on a main East Denpasar route.",
    },
    views: 3,
  },
  {
    code: "IP-KM-002",
    type: "komersial",
    status: "dijual",
    title: {
      id: "Bangunan usaha tiga lantai di Denpasar Selatan",
      en: "Three-storey commercial building in South Denpasar",
    },
    area: "Sesetan",
    regency: "Denpasar",
    price: 8400000000,
    bathrooms: 5,
    landArea: 320,
    buildingArea: 720,
    certificate: "SHGB",
    description: {
      id: "Bangunan tiga lantai dengan ruang terbuka di setiap lantai dan parkir di halaman depan.",
      en: "A three-storey building with open floorplates on each level and forecourt parking.",
    },
    views: 3,
  },
  {
    code: "IP-RM-003",
    type: "rumah",
    status: "dijual",
    title: {
      id: "Rumah dengan halaman luas dan bangunan terpisah di Penatih",
      en: "House with a large yard and a separate pavilion in Penatih",
    },
    area: "Penatih",
    regency: "Denpasar",
    price: 3950000000,
    bedrooms: 5,
    bathrooms: 4,
    landArea: 450,
    buildingArea: 280,
    certificate: "SHM",
    description: {
      id: "Rumah utama dengan lima kamar tidur, ditambah bangunan terpisah di belakang untuk dapur dan ruang cuci. Halaman cukup luas untuk beberapa kendaraan.",
      en: "A five-bedroom main house with a separate rear pavilion for the kitchen and laundry, and a yard wide enough for several vehicles.",
    },
    views: 4,
  },
  {
    code: "IP-VL-004",
    type: "villa",
    status: "disewa",
    title: {
      id: "Villa satu kamar dengan kolam kecil di Kerobokan",
      en: "One-bedroom villa with plunge pool in Kerobokan",
    },
    area: "Kerobokan",
    regency: "Badung",
    price: 18000000,
    pricePeriod: "bulan",
    bedrooms: 1,
    bathrooms: 1,
    landArea: 180,
    buildingArea: 85,
    certificate: "Hak Pakai",
    description: {
      id: "Villa satu kamar dengan kolam kecil dan teras tertutup. Disewakan per bulan.",
      en: "A one-bedroom villa with a plunge pool and a covered terrace. Let by the month.",
    },
    views: 3,
  },
];
