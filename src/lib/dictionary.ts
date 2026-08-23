/**
 * All user-facing copy, in both languages.
 *
 * Copy rules for this site, applied throughout:
 *   - No ratings, review counts, properties-sold counts, years in business.
 *   - No testimonials, no named agents, no "trusted" or "number one".
 *   - No promised response or turnaround times.
 * Section titles, page titles and neutral descriptions only.
 */

import type { Locale } from "./site";

const id = {
  meta: {
    langName: "Bahasa Indonesia",
    langShort: "ID",
    switchLabel: "Pilih bahasa",
  },
  nav: {
    home: "Home",
    listing: "Listing",
    construction: "Konstruksi",
    consign: "Titipkan Properti",
    contact: "Kontak",
    mainLabel: "Navigasi utama",
    openMenu: "Buka menu",
    closeMenu: "Tutup menu",
    skipToContent: "Lompat ke konten utama",
  },
  common: {
    sampleBadge: "Data contoh",
    sampleNoticeShort: "Listing di halaman ini adalah data contoh untuk pratinjau desain, bukan properti yang sedang dipasarkan.",
    sampleNoticeListing: "Listing ini adalah data contoh untuk pratinjau desain. Spesifikasi, harga, dan lokasinya bukan penawaran yang sedang berjalan.",
    whatsapp: "Tanya lewat WhatsApp",
    viewDetail: "Lihat detail",
    viewAll: "Lihat semua listing",
    code: "Kode listing",
    close: "Tutup",
    previous: "Sebelumnya",
    next: "Berikutnya",
    loading: "Memuat",
    required: "wajib diisi",
    optional: "opsional",
    send: "Kirim lewat WhatsApp",
    backToListing: "Kembali ke listing",
    image: "Gambar",
    of: "dari",
  },
  status: {
    dijual: "Dijual",
    disewa: "Disewakan",
    label: "Status",
  },
  types: {
    rumah: "Rumah",
    villa: "Villa",
    tanah: "Tanah",
    hotel: "Hotel",
    komersial: "Komersial",
    konstruksi: "Konstruksi",
    label: "Tipe properti",
  },
  specs: {
    bedrooms: "Kamar tidur",
    bathrooms: "Kamar mandi",
    landArea: "Luas tanah",
    buildingArea: "Luas bangunan",
    certificate: "Sertifikat",
    location: "Lokasi",
    price: "Harga",
    perYear: "per tahun",
    perMonth: "per bulan",
    sqm: "m²",
    notListed: "Tidak dicantumkan",
  },
  search: {
    keyword: "Kata kunci",
    keywordPlaceholder: "Cari judul, area, atau kode listing",
    type: "Tipe",
    status: "Status",
    location: "Lokasi",
    priceMin: "Harga minimum",
    priceMax: "Harga maksimum",
    anyType: "Semua tipe",
    anyStatus: "Semua status",
    anyLocation: "Semua lokasi",
    submit: "Cari properti",
    filters: "Filter",
    openFilters: "Buka filter",
    applyFilters: "Terapkan filter",
    reset: "Atur ulang",
    resultsOne: "1 listing ditemukan",
    /** {n} is replaced with the result count. */
    resultsMany: "{n} listing ditemukan",
    resultsNone: "Tidak ada listing yang cocok",
    emptyBody:
      "Coba longgarkan filter, atau tanyakan kebutuhan Anda langsung lewat WhatsApp.",
    sort: "Urutkan",
    sortNewest: "Urutan bawaan",
    sortPriceAsc: "Harga terendah",
    sortPriceDesc: "Harga tertinggi",
  },
  home: {
    heroTitle: "Properti dan konstruksi di Bali",
    heroLede:
      "Rumah, villa, tanah, dan hotel untuk dijual maupun disewakan, dari kantor kami di Kesiman Kertalangu, Denpasar Timur.",
    searchHeading: "Cari properti",
    latest: {
      sectionTitle: "Listing",
      headline: "Listing terbaru",
      body: "Pilihan properti dari berbagai tipe dan status, lengkap dengan spesifikasi dan tombol tanya langsung.",
      cta: "Lihat semua listing",
    },
    construction: {
      sectionTitle: "Konstruksi",
      headline: "Kami juga mengerjakan konstruksi",
      body: "Pembangunan rumah dan villa, renovasi, serta pekerjaan bangunan komersial, dikerjakan sebagai lini kedua di samping properti.",
      cta: "Lihat layanan konstruksi",
    },
  },
  listingPage: {
    sectionTitle: "Listing",
    headline: "Semua properti",
    body: "Saring berdasarkan tipe, status, lokasi, dan rentang harga untuk mempersempit pilihan.",
    cta: "Tanya lewat WhatsApp",
    title: "Listing Properti",
  },
  detail: {
    sectionTitle: "Detail properti",
    specsHeading: "Spesifikasi",
    descriptionHeading: "Deskripsi",
    locationHeading: "Lokasi",
    galleryHeading: "Galeri",
    askHeading: "Tertarik dengan properti ini?",
    askBody:
      "Kirim pertanyaan lewat WhatsApp. Kode listing dan alamat halaman ini ikut terkirim otomatis.",
    similarHeading: "Listing lain",
    similarBody: "Properti lain dengan tipe atau status yang sama.",
    notFound: "Listing tidak ditemukan",
    notFoundBody: "Listing dengan kode ini tidak ada di daftar kami.",
    /** {type} is the property type, {n} the panel number. */
    artworkAlt:
      "Ilustrasi geometris {type}, panel {n}. Gambar ini adalah grafis pengganti, bukan foto bangunan.",
  },
  construction: {
    title: "Konstruksi",
    hero: {
      sectionTitle: "Konstruksi",
      headline: "Pekerjaan bangunan",
      body: "Lini kedua kami di samping properti: membangun, merenovasi, dan menyelesaikan pekerjaan bangunan di Bali.",
      cta: "Tanya kebutuhan konstruksi",
    },
    scope: {
      sectionTitle: "Lingkup",
      headline: "Jenis pekerjaan yang kami terima",
      body: "Sampaikan kebutuhan Anda dan kami tinjau apakah pekerjaan itu masuk dalam lingkup yang kami kerjakan.",
      cta: "Tanya lewat WhatsApp",
      items: [
        {
          name: "Pembangunan rumah tinggal",
          body: "Pekerjaan bangunan baru untuk rumah tinggal, dari pekerjaan struktur sampai finishing.",
        },
        {
          name: "Pembangunan villa",
          body: "Bangunan villa beserta pekerjaan pendukung seperti kolam, pagar, dan area terbuka.",
        },
        {
          name: "Renovasi dan perluasan",
          body: "Perubahan tata ruang, penambahan lantai atau bangunan, dan perbaikan bagian bangunan yang ada.",
        },
        {
          name: "Bangunan komersial",
          body: "Ruko, bangunan usaha, dan penginapan berskala kecil sampai menengah.",
        },
        {
          name: "Pekerjaan interior dan finishing",
          body: "Pekerjaan lantai, plafon, kusen, dan penyelesaian permukaan.",
        },
        {
          name: "Pekerjaan luar bangunan",
          body: "Perkerasan halaman, saluran, pagar, dan penataan area sekitar bangunan.",
        },
      ],
    },
    process: {
      sectionTitle: "Alur kerja",
      headline: "Bagaimana pekerjaan berjalan",
      body: "Enam langkah yang kami lalui pada setiap pekerjaan, dari pertanyaan awal sampai serah terima.",
      cta: "Mulai dari langkah pertama",
      steps: [
        {
          name: "Pertanyaan awal",
          body: "Anda menyampaikan lokasi, jenis pekerjaan, dan gambaran kebutuhan lewat WhatsApp atau formulir di halaman ini.",
        },
        {
          name: "Peninjauan lokasi",
          body: "Kami meninjau kondisi lahan atau bangunan yang ada, beserta akses menuju lokasi.",
        },
        {
          name: "Gambar kerja dan lingkup",
          body: "Lingkup pekerjaan disusun bersama gambar kerja, sehingga jelas apa yang termasuk dan tidak termasuk.",
        },
        {
          name: "Penawaran dan perjanjian",
          body: "Rincian pekerjaan, tahapan, dan ketentuan pembayaran dituangkan dalam perjanjian tertulis.",
        },
        {
          name: "Pelaksanaan",
          body: "Pekerjaan berjalan sesuai tahapan yang disepakati, dengan laporan kemajuan kepada pemilik.",
        },
        {
          name: "Serah terima",
          body: "Pemeriksaan bersama atas hasil pekerjaan, penyelesaian catatan perbaikan, lalu serah terima.",
        },
      ],
    },
    form: {
      sectionTitle: "Tanya konstruksi",
      headline: "Sampaikan kebutuhan pekerjaan",
      body: "Isi keterangan singkat di bawah. Isian ini disusun menjadi pesan WhatsApp yang bisa Anda periksa sebelum dikirim.",
      cta: "Kirim lewat WhatsApp",
    },
    noProjects:
      "Halaman ini belum memuat daftar proyek yang pernah dikerjakan. Dokumentasi proyek akan ditambahkan oleh pemilik website.",
  },
  consign: {
    title: "Titipkan Properti",
    hero: {
      sectionTitle: "Titipkan properti",
      headline: "Titipkan properti Anda kepada kami",
      body: "Kirim keterangan properti Anda dan kami tinjau untuk dimasukkan ke daftar listing.",
      cta: "Isi keterangan properti",
    },
    steps: {
      sectionTitle: "Cara kerja",
      headline: "Tiga langkah menitipkan properti",
      body: "Alur singkat dari keterangan awal sampai listing tampil di website.",
      cta: "Mulai isi keterangan",
      items: [
        {
          name: "Kirim keterangan",
          body: "Isi formulir di halaman ini dengan tipe, lokasi, luas, dan harga yang Anda inginkan.",
        },
        {
          name: "Peninjauan",
          body: "Kami meninjau keterangan dan dokumen kepemilikan bersama Anda.",
        },
        {
          name: "Publikasi listing",
          body: "Setelah disepakati, properti dimasukkan ke daftar listing beserta foto dan spesifikasinya.",
        },
      ],
    },
    form: {
      sectionTitle: "Formulir",
      headline: "Keterangan properti",
      body: "Isian ini disusun menjadi pesan WhatsApp yang bisa Anda periksa sebelum dikirim. Tidak ada data yang disimpan di website ini.",
      cta: "Kirim lewat WhatsApp",
    },
  },
  contact: {
    title: "Kontak",
    hero: {
      sectionTitle: "Kontak",
      headline: "Hubungi kami",
      body: "Kantor kami berada di Kesiman Kertalangu, Denpasar Timur. Pertanyaan properti dan konstruksi bisa masuk lewat WhatsApp, telepon, atau surel.",
      cta: "Tanya lewat WhatsApp",
    },
    details: {
      sectionTitle: "Keterangan",
      headline: "Alamat dan jam buka",
      body: "Keterangan kontak dan jam operasional kantor.",
      cta: "Buka di peta",
      address: "Alamat",
      phone: "Telepon dan WhatsApp",
      email: "Surel",
      hours: "Jam buka",
      hoursWeekday: "Senin - Jumat",
      hoursSaturday: "Sabtu",
      hoursSunday: "Minggu",
      byAppointment: "Dengan janji temu",
      wita: "WITA",
    },
    other: {
      sectionTitle: "Layanan lain",
      headline: "Di luar properti dan konstruksi",
      body: "Selain properti dan konstruksi, kelompok usaha ini juga menyediakan layanan pembiayaan dengan jaminan aset. Ketentuannya tidak dicantumkan di website ini; silakan tanyakan langsung.",
      cta: "Tanya lewat WhatsApp",
    },
  },
  forms: {
    name: "Nama",
    phone: "Nomor WhatsApp",
    email: "Surel",
    message: "Keterangan",
    propertyType: "Tipe properti",
    location: "Lokasi properti",
    landArea: "Luas tanah (m²)",
    buildingArea: "Luas bangunan (m²)",
    askingPrice: "Harga yang diinginkan (Rp)",
    workType: "Jenis pekerjaan",
    projectLocation: "Lokasi pekerjaan",
    budget: "Perkiraan anggaran (Rp)",
    messagePlaceholderConsign:
      "Ceritakan kondisi properti, akses jalan, dan hal lain yang perlu kami ketahui.",
    messagePlaceholderConstruction:
      "Ceritakan pekerjaan yang Anda rencanakan, kondisi lokasi, dan hal lain yang perlu kami ketahui.",
    review: "Periksa pesan sebelum dikirim",
    reviewBody:
      "Tombol di bawah membuka WhatsApp dengan pesan yang sudah terisi. Anda masih bisa mengubahnya sebelum mengirim.",
    errorGeneric: "Ada isian yang perlu diperbaiki.",
    errorRequired: "Isian ini wajib diisi.",
    errorTooShort: "Isian ini terlalu pendek.",
    errorTooLong: "Isian ini terlalu panjang.",
    errorPhone: "Masukkan nomor telepon yang benar.",
    errorEmail: "Masukkan alamat surel yang benar.",
    errorNumber: "Masukkan angka.",
    submitting: "Memeriksa",
    successTitle: "Pesan siap dikirim",
    successBody: "Tekan tombol di bawah untuk membuka WhatsApp.",
    openWhatsApp: "Buka WhatsApp",
    editAgain: "Ubah isian",
    serverError: "Pemeriksaan gagal. Coba lagi.",
  },
  cookies: {
    title: "Cookie",
    body: "Website ini hanya menyimpan satu hal di peramban Anda tanpa persetujuan: pilihan bahasa. Statistik kunjungan hanya dinyalakan bila Anda menyetujuinya.",
    accept: "Terima statistik",
    decline: "Hanya yang diperlukan",
    settings: "Kebijakan privasi",
    manage: "Pengaturan cookie",
    statusAccepted: "Statistik kunjungan menyala.",
    statusDeclined: "Statistik kunjungan mati.",
    change: "Ubah pilihan",
  },
  footer: {
    ctaSectionTitle: "Langkah berikutnya",
    ctaHeadline: "Ada yang ingin ditanyakan?",
    ctaBody: "Kirim pertanyaan lewat WhatsApp, atau lihat daftar listing yang tersedia.",
    rights: "Seluruh hak dilindungi.",
    legal: "Legal",
    privacy: "Kebijakan Privasi",
    terms: "Syarat dan Ketentuan",
    office: "Kantor",
    navigate: "Halaman",
    previewNotice:
      "Website ini adalah pratinjau desain. Isi listing masih berupa data contoh.",
  },
  privacy: {
    title: "Kebijakan Privasi",
    sectionTitle: "Legal",
    headline: "Kebijakan Privasi",
    body: "Keterangan mengenai data yang diproses website ini.",
    cta: "Hubungi kami",
    sections: [
      {
        h: "Data yang kami proses",
        p: "Website ini tidak memiliki formulir yang mengirim data ke server kami untuk disimpan. Isian pada formulir di website ini diperiksa lalu disusun menjadi pesan WhatsApp yang Anda kirim sendiri dari perangkat Anda.",
      },
      {
        h: "Penyimpanan di peramban",
        p: "Pilihan bahasa disimpan di peramban Anda agar tetap berlaku saat berpindah halaman. Pilihan Anda mengenai statistik kunjungan juga disimpan di peramban.",
      },
      {
        h: "Statistik kunjungan",
        p: "Statistik kunjungan hanya diaktifkan bila Anda menyetujuinya melalui pemberitahuan cookie. Bila Anda menolak, statistik tidak dijalankan.",
      },
      {
        h: "Pesan WhatsApp",
        p: "Ketika Anda menekan tombol WhatsApp, percakapan berlangsung di layanan WhatsApp dan tunduk pada ketentuan layanan tersebut.",
      },
      {
        h: "Pihak ketiga",
        p: "Halaman website ini dilayani oleh penyedia hosting kami. Penyedia hosting dapat mencatat permintaan halaman sebagaimana lazim pada layanan hosting.",
      },
      {
        h: "Hak Anda",
        p: "Anda dapat menghubungi kami untuk menanyakan data yang berkaitan dengan Anda, atau meminta agar percakapan dan keterangan yang Anda kirimkan dihapus.",
      },
      {
        h: "Perubahan",
        p: "Kebijakan ini dapat diperbarui. Versi yang berlaku adalah versi yang tampil di halaman ini.",
      },
      {
        h: "Menghubungi kami",
        p: "Pertanyaan mengenai kebijakan ini dapat disampaikan melalui keterangan kontak di halaman Kontak.",
      },
    ],
  },
  terms: {
    title: "Syarat dan Ketentuan",
    sectionTitle: "Legal",
    headline: "Syarat dan Ketentuan",
    body: "Ketentuan penggunaan website ini.",
    cta: "Hubungi kami",
    sections: [
      {
        h: "Penggunaan website",
        p: "Website ini disediakan untuk memberikan keterangan mengenai properti dan layanan konstruksi. Dengan menggunakan website ini Anda menyetujui ketentuan di halaman ini.",
      },
      {
        h: "Keterangan properti",
        p: "Keterangan pada setiap listing disusun berdasarkan informasi yang tersedia pada saat listing dibuat dan dapat berubah sewaktu-waktu. Keterangan pada website ini bukan penawaran yang mengikat.",
      },
      {
        h: "Data contoh",
        p: "Selama website ini berstatus pratinjau desain, listing yang tampil adalah data contoh dan ditandai sebagai contoh pada setiap halaman. Data contoh tidak mewakili properti yang sedang dipasarkan.",
      },
      {
        h: "Gambar",
        p: "Gambar pada listing di dalam pratinjau ini adalah grafis pengganti, bukan foto properti.",
      },
      {
        h: "Ketersediaan",
        p: "Kami berupaya menjaga website tetap dapat diakses, namun tidak menjamin website bebas dari gangguan atau kesalahan.",
      },
      {
        h: "Tautan ke pihak lain",
        p: "Website ini memuat tautan ke layanan pihak lain, termasuk WhatsApp dan layanan peta. Kami tidak mengendalikan isi maupun ketentuan layanan tersebut.",
      },
      {
        h: "Hak kekayaan intelektual",
        p: "Teks, tata letak, dan grafis pada website ini adalah milik pemilik website kecuali dinyatakan lain.",
      },
      {
        h: "Perubahan ketentuan",
        p: "Ketentuan ini dapat diperbarui. Versi yang berlaku adalah versi yang tampil di halaman ini.",
      },
      {
        h: "Hukum yang berlaku",
        p: "Ketentuan ini tunduk pada hukum yang berlaku di Republik Indonesia.",
      },
    ],
  },
  notFound: {
    title: "Halaman tidak ditemukan",
    sectionTitle: "404",
    headline: "Halaman tidak ditemukan",
    body: "Alamat yang Anda buka tidak ada di website ini.",
    cta: "Kembali ke beranda",
  },
};

const en: typeof id = {
  meta: {
    langName: "English",
    langShort: "EN",
    switchLabel: "Choose language",
  },
  nav: {
    home: "Home",
    listing: "Listings",
    construction: "Construction",
    consign: "List Your Property",
    contact: "Contact",
    mainLabel: "Main navigation",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    skipToContent: "Skip to main content",
  },
  common: {
    sampleBadge: "Sample data",
    sampleNoticeShort: "The listings on this page are sample data for a design preview, not properties currently on the market.",
    sampleNoticeListing: "This listing is sample data for a design preview. Its specification, price and location are not a live offer.",
    whatsapp: "Ask on WhatsApp",
    viewDetail: "View details",
    viewAll: "View all listings",
    code: "Listing code",
    close: "Close",
    previous: "Previous",
    next: "Next",
    loading: "Loading",
    required: "required",
    optional: "optional",
    send: "Send on WhatsApp",
    backToListing: "Back to listings",
    image: "Image",
    of: "of",
  },
  status: {
    dijual: "For sale",
    disewa: "For rent",
    label: "Status",
  },
  types: {
    rumah: "House",
    villa: "Villa",
    tanah: "Land",
    hotel: "Hotel",
    komersial: "Commercial",
    konstruksi: "Construction",
    label: "Property type",
  },
  specs: {
    bedrooms: "Bedrooms",
    bathrooms: "Bathrooms",
    landArea: "Land area",
    buildingArea: "Building area",
    certificate: "Certificate",
    location: "Location",
    price: "Price",
    perYear: "per year",
    perMonth: "per month",
    sqm: "m²",
    notListed: "Not listed",
  },
  search: {
    keyword: "Keyword",
    keywordPlaceholder: "Search title, area or listing code",
    type: "Type",
    status: "Status",
    location: "Location",
    priceMin: "Minimum price",
    priceMax: "Maximum price",
    anyType: "All types",
    anyStatus: "All statuses",
    anyLocation: "All locations",
    submit: "Search properties",
    filters: "Filters",
    openFilters: "Open filters",
    applyFilters: "Apply filters",
    reset: "Reset",
    resultsOne: "1 listing found",
    resultsMany: "{n} listings found",
    resultsNone: "No listings match",
    emptyBody: "Try loosening the filters, or ask about what you need on WhatsApp.",
    sort: "Sort",
    sortNewest: "Default order",
    sortPriceAsc: "Lowest price",
    sortPriceDesc: "Highest price",
  },
  home: {
    heroTitle: "Property and construction in Bali",
    heroLede:
      "Houses, villas, land and hotels for sale or rent, from our office in Kesiman Kertalangu, East Denpasar.",
    searchHeading: "Search properties",
    latest: {
      sectionTitle: "Listings",
      headline: "Latest listings",
      body: "A selection across property types and statuses, each with its specification and a direct way to ask.",
      cta: "View all listings",
    },
    construction: {
      sectionTitle: "Construction",
      headline: "We also take construction work",
      body: "House and villa builds, renovations and commercial building work, run as a second line alongside property.",
      cta: "See construction services",
    },
  },
  listingPage: {
    sectionTitle: "Listings",
    headline: "All properties",
    body: "Filter by type, status, location and price range to narrow the selection.",
    cta: "Ask on WhatsApp",
    title: "Property Listings",
  },
  detail: {
    sectionTitle: "Property details",
    specsHeading: "Specification",
    descriptionHeading: "Description",
    locationHeading: "Location",
    galleryHeading: "Gallery",
    askHeading: "Interested in this property?",
    askBody:
      "Send your question on WhatsApp. The listing code and this page address are included automatically.",
    similarHeading: "Other listings",
    similarBody: "Other properties of the same type or status.",
    notFound: "Listing not found",
    notFoundBody: "There is no listing with this code in our list.",
    artworkAlt:
      "Geometric illustration of a {type}, panel {n}. This is placeholder artwork, not a photograph of a building.",
  },
  construction: {
    title: "Construction",
    hero: {
      sectionTitle: "Construction",
      headline: "Building work",
      body: "Our second line alongside property: building, renovating and completing building work in Bali.",
      cta: "Ask about construction",
    },
    scope: {
      sectionTitle: "Scope",
      headline: "Work we take on",
      body: "Tell us what you need and we will review whether it falls within the work we carry out.",
      cta: "Ask on WhatsApp",
      items: [
        {
          name: "Residential builds",
          body: "New building work for houses, from structural work through to finishes.",
        },
        {
          name: "Villa builds",
          body: "Villa buildings together with supporting work such as pools, walls and open areas.",
        },
        {
          name: "Renovation and extension",
          body: "Reworking layouts, adding floors or buildings, and repairing parts of an existing building.",
        },
        {
          name: "Commercial buildings",
          body: "Shophouses, business premises and small to medium accommodation buildings.",
        },
        {
          name: "Interior and finishing work",
          body: "Floors, ceilings, joinery and surface finishes.",
        },
        {
          name: "External works",
          body: "Yard paving, drainage, walls and the treatment of the area around a building.",
        },
      ],
    },
    process: {
      sectionTitle: "Process",
      headline: "How the work runs",
      body: "The six steps we go through on every job, from first question to handover.",
      cta: "Start at step one",
      steps: [
        {
          name: "First enquiry",
          body: "You tell us the location, the type of work and an outline of what you need, on WhatsApp or through the form on this page.",
        },
        {
          name: "Site visit",
          body: "We look at the condition of the land or the existing building, and at the access to the site.",
        },
        {
          name: "Drawings and scope",
          body: "The scope of work is set out alongside working drawings, so what is and is not included is clear.",
        },
        {
          name: "Quotation and agreement",
          body: "The work, its stages and the payment terms are set down in a written agreement.",
        },
        {
          name: "Construction",
          body: "Work proceeds through the agreed stages, with progress reported to the owner.",
        },
        {
          name: "Handover",
          body: "A joint inspection of the finished work, any remedial items closed out, then handover.",
        },
      ],
    },
    form: {
      sectionTitle: "Construction enquiry",
      headline: "Tell us about the work",
      body: "Fill in a short outline below. It is assembled into a WhatsApp message you can check before sending.",
      cta: "Send on WhatsApp",
    },
    noProjects:
      "This page does not yet list completed projects. Project documentation will be added by the site owner.",
  },
  consign: {
    title: "List Your Property",
    hero: {
      sectionTitle: "List your property",
      headline: "Place your property with us",
      body: "Send us the details of your property and we will review it for inclusion in our listings.",
      cta: "Fill in the details",
    },
    steps: {
      sectionTitle: "How it works",
      headline: "Three steps to list a property",
      body: "The short path from first details to a listing on the site.",
      cta: "Start filling in the details",
      items: [
        {
          name: "Send the details",
          body: "Complete the form on this page with the type, location, area and the price you have in mind.",
        },
        {
          name: "Review",
          body: "We review the details and the ownership documents with you.",
        },
        {
          name: "Listing published",
          body: "Once agreed, the property is added to the listings with its photographs and specification.",
        },
      ],
    },
    form: {
      sectionTitle: "Form",
      headline: "Property details",
      body: "These fields are assembled into a WhatsApp message you can check before sending. Nothing is stored on this website.",
      cta: "Send on WhatsApp",
    },
  },
  contact: {
    title: "Contact",
    hero: {
      sectionTitle: "Contact",
      headline: "Get in touch",
      body: "Our office is in Kesiman Kertalangu, East Denpasar. Property and construction enquiries can reach us on WhatsApp, by phone or by email.",
      cta: "Ask on WhatsApp",
    },
    details: {
      sectionTitle: "Details",
      headline: "Address and opening hours",
      body: "Contact details and office opening hours.",
      cta: "Open in maps",
      address: "Address",
      phone: "Phone and WhatsApp",
      email: "Email",
      hours: "Opening hours",
      hoursWeekday: "Monday - Friday",
      hoursSaturday: "Saturday",
      hoursSunday: "Sunday",
      byAppointment: "By appointment",
      wita: "WITA",
    },
    other: {
      sectionTitle: "Other services",
      headline: "Beyond property and construction",
      body: "Alongside property and construction, the group also offers asset-backed financing. Its terms are not set out on this website; please ask us directly.",
      cta: "Ask on WhatsApp",
    },
  },
  forms: {
    name: "Name",
    phone: "WhatsApp number",
    email: "Email",
    message: "Details",
    propertyType: "Property type",
    location: "Property location",
    landArea: "Land area (m²)",
    buildingArea: "Building area (m²)",
    askingPrice: "Asking price (IDR)",
    workType: "Type of work",
    projectLocation: "Site location",
    budget: "Approximate budget (IDR)",
    messagePlaceholderConsign:
      "Tell us about the condition of the property, road access, and anything else we should know.",
    messagePlaceholderConstruction:
      "Tell us about the work you are planning, the condition of the site, and anything else we should know.",
    review: "Check the message before sending",
    reviewBody:
      "The button below opens WhatsApp with the message filled in. You can still change it before you send.",
    errorGeneric: "Some fields need fixing.",
    errorRequired: "This field is required.",
    errorTooShort: "This is too short.",
    errorTooLong: "This is too long.",
    errorPhone: "Enter a valid phone number.",
    errorEmail: "Enter a valid email address.",
    errorNumber: "Enter a number.",
    submitting: "Checking",
    successTitle: "Message ready to send",
    successBody: "Press the button below to open WhatsApp.",
    openWhatsApp: "Open WhatsApp",
    editAgain: "Edit the details",
    serverError: "The check failed. Please try again.",
  },
  cookies: {
    title: "Cookies",
    body: "This site stores one thing in your browser without asking: your language choice. Visit statistics run only if you agree to them.",
    accept: "Accept statistics",
    decline: "Necessary only",
    settings: "Privacy policy",
    manage: "Cookie settings",
    statusAccepted: "Visit statistics are on.",
    statusDeclined: "Visit statistics are off.",
    change: "Change choice",
  },
  footer: {
    ctaSectionTitle: "Next step",
    ctaHeadline: "Anything you would like to ask?",
    ctaBody: "Send a question on WhatsApp, or look through the listings that are available.",
    rights: "All rights reserved.",
    legal: "Legal",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    office: "Office",
    navigate: "Pages",
    previewNotice:
      "This site is a design preview. The listing content is still sample data.",
  },
  privacy: {
    title: "Privacy Policy",
    sectionTitle: "Legal",
    headline: "Privacy Policy",
    body: "What this website does with data.",
    cta: "Contact us",
    sections: [
      {
        h: "What we process",
        p: "This website has no form that sends data to our servers for storage. Fields you complete here are checked and then assembled into a WhatsApp message that you send yourself from your own device.",
      },
      {
        h: "Browser storage",
        p: "Your language choice is stored in your browser so it holds as you move between pages. Your choice about visit statistics is stored in your browser as well.",
      },
      {
        h: "Visit statistics",
        p: "Visit statistics run only if you agree to them through the cookie notice. If you decline, they are not run.",
      },
      {
        h: "WhatsApp messages",
        p: "When you press a WhatsApp button, the conversation takes place on the WhatsApp service and is governed by that service's own terms.",
      },
      {
        h: "Third parties",
        p: "The pages of this site are served by our hosting provider. Hosting providers commonly log page requests as part of running the service.",
      },
      {
        h: "Your rights",
        p: "You can contact us to ask about data relating to you, or to ask that conversations and details you have sent us be deleted.",
      },
      {
        h: "Changes",
        p: "This policy may be updated. The version that applies is the one shown on this page.",
      },
      {
        h: "Contacting us",
        p: "Questions about this policy can be sent using the contact details on the Contact page.",
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    sectionTitle: "Legal",
    headline: "Terms of Service",
    body: "The terms on which this website is provided.",
    cta: "Contact us",
    sections: [
      {
        h: "Use of this website",
        p: "This website is provided to give information about property and construction services. By using it you accept the terms on this page.",
      },
      {
        h: "Property information",
        p: "The details on each listing are drawn from the information available when the listing was made and may change at any time. Nothing on this website is a binding offer.",
      },
      {
        h: "Sample data",
        p: "While this website is a design preview, the listings shown are sample data and are marked as samples on every page. Sample data does not represent property currently on the market.",
      },
      {
        h: "Images",
        p: "The images on listings in this preview are placeholder artwork, not photographs of property.",
      },
      {
        h: "Availability",
        p: "We aim to keep the website reachable, but we do not guarantee it will be free of interruption or error.",
      },
      {
        h: "Links to others",
        p: "This website links to services run by others, including WhatsApp and mapping services. We do not control their content or their terms.",
      },
      {
        h: "Intellectual property",
        p: "The text, layout and graphics on this website belong to the site owner unless stated otherwise.",
      },
      {
        h: "Changes to these terms",
        p: "These terms may be updated. The version that applies is the one shown on this page.",
      },
      {
        h: "Governing law",
        p: "These terms are governed by the law of the Republic of Indonesia.",
      },
    ],
  },
  notFound: {
    title: "Page not found",
    sectionTitle: "404",
    headline: "Page not found",
    body: "The address you opened does not exist on this website.",
    cta: "Back to home",
  },
};

export type Dict = typeof id;

/**
 * Fills `{name}` placeholders in a dictionary string.
 *
 * The dictionary holds plain strings rather than functions on purpose: these
 * objects cross the server/client boundary, and a function cannot make that
 * trip.
 */
export function fill(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in values ? String(values[key]) : match,
  );
}

export const DICTIONARIES: Record<Locale, Dict> = { id, en };

export function getDictionary(locale: Locale): Dict {
  return DICTIONARIES[locale] as Dict;
}
