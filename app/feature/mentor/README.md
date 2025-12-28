# Mentor Feature Module

Modul fitur ini mengelola semua halaman dan komponen yang berkaitan dengan mentor dalam sistem SIKP.

## Struktur Direktori

```
mentor/
├── components/           # Komponen spesifik untuk fitur mentor
│   ├── back-button.tsx          # Tombol kembali ke dashboard
│   ├── document-card.tsx        # Card untuk menampilkan dokumen arsip
│   ├── document-filter.tsx      # Filter untuk pencarian dokumen
│   ├── mentee-card.tsx          # Card untuk menampilkan informasi mentee
│   ├── notification-card.tsx    # Card untuk notifikasi
│   ├── page-header.tsx          # Header halaman
│   └── stats-card.tsx           # Card statistik
├── pages/                # Page components
│   ├── arsip-page.tsx           # Halaman arsip dokumen
│   ├── mentee-page.tsx          # Halaman daftar mentee
│   ├── notifikasi-page.tsx      # Halaman notifikasi
│   ├── pengaturan-page.tsx      # Halaman pengaturan
│   ├── penilaian-page.tsx       # Halaman penilaian mentee
│   └── profil-page.tsx          # Halaman profil mentor
├── types/                # Type definitions
│   └── index.d.ts               # Interface dan type definitions
├── index.ts              # Export module
└── README.md             # Dokumentasi ini
```

## Penggunaan

### Import di Route Files

```tsx
// Import page dari feature module
import { ArsipPage } from "~/feature/mentor";

export default function ArsipRoute() {
  return <ArsipPage />;
}
```

### Import Types

```tsx
import type { ArchivedDocument, Mentee, Notification } from "~/feature/mentor";
```

### Import Components

```tsx
import { BackButton, StatsCard, PageHeader } from "~/feature/mentor";
```

## Types yang Tersedia

- `ArchivedDocument` - Data dokumen yang diarsipkan
- `AssessmentCriteria` - Kriteria penilaian mentee
- `Mentee` - Data mentee lengkap
- `MenteeOption` - Data mentee untuk dropdown select
- `Notification` - Data notifikasi
- `ProfileData` - Data profil mentor
- `Settings` - Pengaturan aplikasi

## Halaman yang Tersedia

1. **ArsipPage** - Menampilkan dokumen yang telah diarsipkan (penilaian, logbook, laporan)
2. **MenteePage** - Daftar mentee yang dibimbing
3. **NotifikasiPage** - Notifikasi untuk mentor
4. **PengaturanPage** - Pengaturan tampilan, notifikasi, dan password
5. **PenilaianPage** - Form penilaian untuk mentee
6. **ProfilPage** - Profil mentor dengan fitur tanda tangan digital
