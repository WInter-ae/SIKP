# Fitur Pengujian Sidang Kerja Praktik

## 📋 Deskripsi

Fitur untuk mahasiswa mengajukan berita acara sidang Kerja Praktik, dengan alur:

1. Input data berita acara
2. Ajukan ke dosen pembimbing/penguji
3. Generate surat berita acara setelah disetujui

## 🗂️ Struktur File

```
hearing/
├── components/
│   ├── berita-acara-form.tsx      # Form input data berita acara
│   └── berita-acara-status.tsx    # Tampilan status pengajuan
├── pages/
│   └── pengujian-sidang-page.tsx  # Halaman utama
├── types/
│   └── index.d.ts                 # Type definitions
└── index.ts                       # Export barrel file
```

## 🎯 Fitur

### Mahasiswa:

- ✅ Input data berita acara (judul, tempat, tanggal, waktu)
- ✅ Simpan sebagai draft
- ✅ Ajukan ke dosen
- ✅ Lihat status pengajuan
- ✅ Edit jika ditolak
- ✅ Generate surat jika disetujui

### Status Berita Acara:

- **Draft**: Masih dalam proses pengeditan
- **Submitted**: Sudah diajukan, menunggu persetujuan dosen
- **Approved**: Disetujui, dapat generate surat
- **Rejected**: Ditolak, perlu perbaikan

## 🔧 Teknologi

- React Hook Form + Zod untuk form validation
- Lucide React untuk icons
- shadcn/ui components (Card, Button, Input, dll)
- localStorage untuk menyimpan draft

## 🚀 Penggunaan

### Akses Halaman

```
URL: /mahasiswa/kp/pengujian-sidang
```

### Component Usage

```tsx
import { BeritaAcaraForm, BeritaAcaraStatus } from "~/feature/hearing";

// Gunakan form
<BeritaAcaraForm
  onSubmit={handleSubmit}
  onSaveDraft={handleSaveDraft}
  initialData={data}
  isSubmitting={isLoading}
/>

// Gunakan status card
<BeritaAcaraStatus
  beritaAcara={data}
  dosenPenguji={dosenList}
  onGenerateSurat={handleGenerate}
  onEdit={handleEdit}
/>
```

## 📝 Todo / Pengembangan Selanjutnya

- [ ] Integrasi dengan backend API
- [ ] Generate PDF surat berita acara
- [ ] Upload dokumen pendukung
- [ ] Notifikasi realtime saat status berubah
- [ ] Fitur untuk dosen (approve/reject)
- [ ] Riwayat revisi berita acara
- [ ] Export data ke berbagai format

## 🧪 Testing

Halaman dilengkapi dengan testing controls untuk development:

- Set status ke Submitted
- Set status ke Approved (dengan nilai)
- Set status ke Rejected (dengan catatan)
- Reset semua data

**Note**: Testing controls hanya muncul di development mode.
