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
│   ├── archive-page.tsx         # Halaman arsip dokumen
│   ├── mentee-page.tsx          # Halaman daftar mentee
│   ├── notification-page.tsx    # Halaman notifikasi
│   ├── settings-page.tsx        # Halaman pengaturan
│   ├── assessment-page.tsx      # Halaman penilaian mentee
│   └── profile-page.tsx         # Halaman profil mentor
├── types/                # Type definitions
│   └── index.d.ts               # Interface dan type definitions
├── index.ts              # Export module
└── README.md             # Dokumentasi ini
```

## Penggunaan

### Import di Route Files

```tsx
// Import page dari feature module
import { ArchivePage } from "~/feature/mentor";

export default function ArsipRoute() {
  return <ArchivePage />;
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

1. **ArchivePage** - Menampilkan dokumen yang telah diarsipkan (penilaian, logbook, laporan)
2. **MenteePage** - Daftar mentee yang dibimbing
3. **NotificationPage** - Notifikasi untuk mentor
4. **SettingsPage** - Pengaturan tampilan, notifikasi, dan password
5. **AssessmentPage** - Form penilaian untuk mentee
6. **ProfilePage** - Profil mentor dengan fitur tanda tangan digital
