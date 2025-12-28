import type { PengajuanJudul } from "../types/title";

// Mock data pengajuan judul dari mahasiswa
export const mockPengajuanList: PengajuanJudul[] = [
  {
    id: "JDL-001",
    mahasiswa: {
      id: "MHS-001",
      nama: "Budi Santoso",
      nim: "12345001",
      prodi: "Teknik Informatika",
      email: "budi.santoso@student.ac.id",
    },
    tim: {
      id: "TIM-001",
      nama: "Frontend Dev Team",
      anggota: ["Budi Santoso", "Siti Rahayu"],
    },
    data: {
      judulLaporan:
        "Sistem Informasi Manajemen Perpustakaan Berbasis Web dengan Teknologi React dan Node.js",
      judulInggris:
        "Web-Based Library Management Information System Using React and Node.js Technology",
      tempatMagang: "PT Maju Bersama Indonesia",
      periode: {
        mulai: "2024-09-01",
        selesai: "2024-12-01",
      },
      deskripsi:
        "Proyek ini bertujuan untuk membangun sistem informasi manajemen perpustakaan yang modern dan user-friendly. Sistem akan memiliki fitur peminjaman buku, pengembalian, katalog online, dan laporan statistik. Menggunakan React untuk frontend dan Node.js dengan Express untuk backend API.",
      metodologi:
        "Pengembangan menggunakan metode Agile dengan sprint 2 minggu. Teknologi: React, TypeScript, Node.js, PostgreSQL, dan Docker untuk deployment.",
      teknologi: ["React", "TypeScript", "Node.js", "Express", "PostgreSQL", "Docker"],
    },
    status: "diajukan",
    tanggalPengajuan: "2024-11-20T09:30:00",
  },
  {
    id: "JDL-002",
    mahasiswa: {
      id: "MHS-002",
      nama: "Siti Rahayu",
      nim: "12345002",
      prodi: "Sistem Informasi",
    },
    data: {
      judulLaporan:
        "Implementasi Aplikasi Mobile E-Commerce dengan Fitur Augmented Reality untuk Visualisasi Produk",
      tempatMagang: "CV Digital Creative Solutions",
      periode: {
        mulai: "2024-09-15",
        selesai: "2024-12-15",
      },
      deskripsi:
        "Pengembangan aplikasi e-commerce mobile yang memanfaatkan teknologi AR untuk membantu customer memvisualisasikan produk furniture sebelum membeli. Aplikasi akan dibangun menggunakan React Native dan ARCore.",
      teknologi: ["React Native", "ARCore", "Firebase", "Redux"],
    },
    status: "diajukan",
    tanggalPengajuan: "2024-11-21T14:20:00",
  },
  {
    id: "JDL-003",
    mahasiswa: {
      id: "MHS-003",
      nama: "Ahmad Fauzi",
      nim: "12345003",
      prodi: "Teknik Informatika",
    },
    data: {
      judulLaporan:
        "Sistem Prediksi Cuaca Menggunakan Machine Learning dengan Algoritma Random Forest",
      tempatMagang: "BMKG Regional Jawa Timur",
      periode: {
        mulai: "2024-08-01",
        selesai: "2024-11-30",
      },
      deskripsi:
        "Implementasi sistem prediksi cuaca menggunakan machine learning untuk meningkatkan akurasi peramalan. Data historis cuaca akan dianalisis dan digunakan untuk melatih model Random Forest.",
      teknologi: ["Python", "Scikit-learn", "Pandas", "Flask", "PostgreSQL"],
    },
    status: "diajukan",
    tanggalPengajuan: "2024-11-19T10:00:00",
  },
  {
    id: "JDL-004",
    mahasiswa: {
      id: "MHS-004",
      nama: "Dewi Lestari",
      nim: "12345004",
      prodi: "Teknik Informatika",
    },
    data: {
      judulLaporan:
        "Pengembangan Dashboard Analytics untuk Monitoring Performa Website E-Learning",
      tempatMagang: "PT Edukasi Digital Indonesia",
      periode: {
        mulai: "2024-09-01",
        selesai: "2024-12-01",
      },
      deskripsi:
        "Membangun dashboard analytics real-time untuk memonitor berbagai metrik performa website e-learning seperti jumlah user aktif, engagement rate, dan conversion rate.",
      teknologi: ["Vue.js", "D3.js", "Node.js", "MongoDB", "Redis"],
    },
    status: "disetujui",
    tanggalPengajuan: "2024-11-15T08:30:00",
    tanggalVerifikasi: "2024-11-18T10:00:00",
    catatanDosen:
      "Judul sudah bagus dan jelas. Pastikan fokus pada implementasi visualisasi data yang menarik dan informatif. Sertakan analisis perbandingan dengan tools analytics yang sudah ada.",
  },
  {
    id: "JDL-005",
    mahasiswa: {
      id: "MHS-005",
      nama: "Rudi Hartono",
      nim: "12345005",
      prodi: "Sistem Informasi",
    },
    data: {
      judulLaporan: "Aplikasi Chatbot Customer Service Berbasis AI",
      tempatMagang: "PT Bank Digital Nusantara",
      periode: {
        mulai: "2024-09-01",
        selesai: "2024-12-01",
      },
      deskripsi:
        "Pengembangan chatbot AI untuk menangani pertanyaan customer service secara otomatis menggunakan natural language processing.",
      teknologi: ["Python", "TensorFlow", "FastAPI", "React"],
    },
    status: "revisi",
    tanggalPengajuan: "2024-11-17T13:00:00",
    tanggalVerifikasi: "2024-11-22T09:00:00",
    catatanDosen:
      "Judul terlalu umum. Tolong spesifikkan teknologi AI yang digunakan (NLP, LLM, dll) dan domain spesifik dalam banking yang ditangani. Contoh: 'Aplikasi Chatbot Customer Service Berbasis Natural Language Processing untuk Layanan Informasi Rekening'.",
    revisi: {
      count: 1,
      history: [
        {
          tanggal: "2024-11-22T09:00:00",
          catatan:
            "Judul terlalu umum. Tolong spesifikkan teknologi AI yang digunakan dan domain spesifik dalam banking yang ditangani.",
        },
      ],
    },
  },
  {
    id: "JDL-006",
    mahasiswa: {
      id: "MHS-006",
      nama: "Lisa Permata",
      nim: "12345006",
      prodi: "Teknik Informatika",
    },
    data: {
      judulLaporan: "Website Pemesanan Tiket Online",
      tempatMagang: "CV Startup Travel Indonesia",
      periode: {
        mulai: "2024-09-01",
        selesai: "2024-12-01",
      },
      deskripsi:
        "Membuat website untuk pemesanan tiket pesawat dan hotel secara online dengan integrasi payment gateway.",
      teknologi: ["PHP", "Laravel", "MySQL", "Bootstrap"],
    },
    status: "ditolak",
    tanggalPengajuan: "2024-11-16T11:00:00",
    tanggalVerifikasi: "2024-11-20T14:00:00",
    catatanDosen:
      "Judul terlalu sederhana dan tidak menunjukkan kontribusi teknis yang signifikan. Website pemesanan tiket adalah aplikasi umum yang sudah banyak ada. Harap ajukan judul baru yang menunjukkan inovasi atau fokus pada aspek teknis tertentu, misalnya: sistem rekomendasi, optimasi harga dinamis, atau implementasi microservices architecture.",
  },
];
