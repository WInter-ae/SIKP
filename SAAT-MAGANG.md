# Dokumentasi Branch Saat-Magang

Branch ini berisi implementasi fitur-fitur yang dibutuhkan mahasiswa selama masa kerja praktik (magang), serta fitur verifikasi untuk dosen pembimbing.

## 📋 Daftar Isi

- [Overview](#overview)
- [Alur Interaksi](#alur-interaksi)
- [Struktur Feature](#struktur-feature)
- [Fitur yang Diimplementasikan](#fitur-yang-diimplementasikan)
  - [1. Halaman Saat Magang (Hub)](#1-halaman-saat-magang-hub)
  - [2. Pendaftaran Mentor Lapangan](#2-pendaftaran-mentor-lapangan)
  - [3. Logbook Harian](#3-logbook-harian)
  - [4. Penilaian dari Mentor](#4-penilaian-dari-mentor)
  - [5. Pengajuan & Verifikasi Judul Laporan](#5-pengajuan--verifikasi-judul-laporan)
- [File yang Dibuat/Dimodifikasi](#file-yang-dibuatdimodifikasi)
- [Route dan Navigasi](#route-dan-navigasi)
- [Type Definitions](#type-definitions)
- [Cara Menggunakan](#cara-menggunakan)
- [Commit History](#commit-history)

---

## Overview

Branch **Saat-Magang** mengimplementasikan fitur-fitur yang diperlukan mahasiswa selama masa kerja praktik, termasuk:
1. Pendaftaran mentor lapangan
2. Pencatatan logbook harian
3. Melihat penilaian dari mentor lapangan
4. Pengajuan judul laporan KP dan verifikasi oleh dosen ⭐ NEW

---

## Alur Interaksi

```
MAHASISWA                                    DOSEN
    │                                           │
    ├─► 1. Daftar Mentor Lapangan              │
    │   (field-mentor-page)                     │
    │                                           │
    ├─► 2. Catat Logbook Harian                │
    │   (logbook-page)                          │
    │                                           │
    ├─► 3. Lihat Penilaian dari Mentor        │
    │   (assessment-page)                       │
    │                                           │
    ├─► 4. Ajukan Judul Laporan               │
    │   (title-submission-form)                 │
    │                                           │
    │                           ◄───────────────┤
    │                           5. Review Judul │
    │                           (verifikasi-    │
    │                            judul-page)    │
    │                                           │
    │   6. Terima Feedback      ◄───────────────┤
    │   (Disetujui/Revisi/      Kirim Catatan   │
    │    Ditolak)                               │
    │                                           │
    └─► 7. (Jika Revisi) Update & Submit Ulang │
```

---

## Struktur Feature

### 1. During Intern (`app/feature/during-intern/`)

```
during-intern/
├── components/
│   └── card.tsx                 # Reusable card component untuk menu
├── pages/
│   ├── during-intern-page.tsx   # Halaman utama saat magang (menu hub)
│   ├── logbook-page.tsx         # Halaman pencatatan logbook
│   └── assessment-page.tsx      # Halaman penilaian dari mentor
└── types/
    └── index.d.ts               # Type definitions untuk during-intern
```

### 2. Field Mentor (`app/feature/field-mentor/`)

```
field-mentor/
├── components/                   # (Empty - belum ada komponen khusus)
├── pages/
│   └── field-mentor-page.tsx    # Halaman pendaftaran mentor lapangan
└── types/
    └── index.d.ts               # Type definitions untuk mentor
```

### 3. KP Report (`app/feature/kp-report/`) ⭐ NEW

```
kp-report/
├── components/
│   ├── title-submission-form.tsx           # Form pengajuan judul mahasiswa
│   ├── pengajuan-judul-card.tsx           # Card untuk display pengajuan
│   └── verifikasi-judul-dialog.tsx        # Dialog verifikasi dosen
├── pages/
│   └── verifikasi-judul-dosen-page.tsx    # Halaman verifikasi dosen
└── types/
    └── judul.ts                           # Type definitions untuk judul
```

---

## Fitur yang Diimplementasikan

### 1. Halaman Saat Magang (Hub)

**File**: `app/feature/during-intern/pages/during-intern-page.tsx`

**Fungsi:**
- Hub menu untuk fitur-fitur saat magang
- Navigasi ke Logbook, Penilaian, dan Pengesahan (OLS)

**Fitur:**
- Card menu dengan icon Lucide
- Link internal (Logbook, Penilaian)
- Link eksternal ke OLS untuk pengesahan
- Navigasi ke halaman sebelumnya/berikutnya

**Komponen:**
- `Card` component (custom dari `during-intern/components/card.tsx`)
- Icons: `BookOpen`, `ClipboardCheck`, `FileCheck`, `ArrowLeft`, `ArrowRight`

---

### 2. Pendaftaran Mentor Lapangan

**File**: `app/feature/field-mentor/pages/field-mentor-page.tsx`

**Fungsi:**
- Mahasiswa mendaftarkan mentor lapangan
- Generate kode unik untuk mentor
- Tracking status mentor

**Fitur:**

#### Info Section
- Panduan pendaftaran mentor
- Instruksi penggunaan kode

#### Status Mentor
- Display mentor yang sudah terdaftar
- Status: pending, registered, approved, rejected
- Kode mentor dengan tombol copy

#### Form Pendaftaran
- Nama mentor (required)
- Email mentor (required)
- No. telepon mentor (required)
- Perusahaan/Instansi (required)
- Posisi/Jabatan (required)
- Alamat perusahaan (required)

#### Generate Kode
- Auto-generate kode format `MNT-XXXXXX`
- Copy to clipboard functionality
- Kode diberikan ke mentor untuk registrasi

**Flow:**
1. Mahasiswa mengisi form data mentor
2. Submit → Generate kode unik
3. Kode ditampilkan dan bisa dicopy
4. Mahasiswa memberikan kode ke mentor
5. Mentor registrasi menggunakan kode
6. Status berubah: pending → registered → approved

**UI Components:**
- Form dengan input fields
- Card untuk display status mentor
- Button copy kode
- Badge status berwarna
- Icons: `UserPlus`, `CheckCircle`, `Copy`, `User`

---

### 3. Logbook Harian

**File**: `app/feature/during-intern/pages/logbook-page.tsx`

**Fungsi:**
- Pencatatan aktivitas harian mahasiswa selama magang
- Generate tanggal kerja otomatis berdasarkan periode

**Fitur:**

#### Input Periode Kerja
- Tanggal mulai (required)
- Tanggal selesai (required)
- Pilih hari kerja:
  - Senin - Jumat
  - Senin - Sabtu
- Button "Generate Tanggal Kerja"
- Auto-generate list tanggal sesuai hari kerja

#### Pencatatan Logbook
- Pilih tanggal dari dropdown (tanggal yang sudah di-generate)
- Input deskripsi aktivitas (textarea)
- Button "Tambah Logbook"
- List logbook yang sudah dibuat (table)

#### Validasi
- Periode kerja harus diisi lengkap sebelum generate
- Tanggal dan deskripsi wajib diisi sebelum tambah entry
- Hanya tanggal yang di-generate yang bisa dipilih

**State Management:**
```typescript
interface WorkPeriod {
  startDate?: string;
  endDate?: string;
  startDay?: string;
  endDay?: string;
}

interface LogbookEntry {
  id: string;
  date: string;
  description: string;
}
```

**UI Components:**
- Input date dengan label
- Select untuk hari kerja dan pilih tanggal
- Textarea untuk deskripsi
- Table untuk display logbook entries
- Form validation messages

---

### 4. Penilaian dari Mentor

**File**: `app/feature/during-intern/pages/assessment-page.tsx`

**Fungsi:**
- Menampilkan penilaian dari mentor lapangan
- Melihat detail skor per kategori penilaian

**Fitur:**

#### Info Mentor
- Nama mentor
- Posisi dan perusahaan
- Status penilaian (Sudah Dinilai/Belum)

#### Kategori Penilaian
1. **Kedisiplinan**
   - Kehadiran dan ketepatan waktu
   - Progress bar visual
   - Skor/Max Score

2. **Kerjasama**
   - Kemampuan bekerja dalam tim
   - Progress bar visual
   - Skor/Max Score

3. **Inisiatif**
   - Proaktif dalam bekerja
   - Progress bar visual
   - Skor/Max Score

4. **Kualitas Kerja**
   - Hasil pekerjaan yang dihasilkan
   - Progress bar visual
   - Skor/Max Score

#### Total Skor
- Rata-rata skor keseluruhan
- Grade (A/B/C/D)
- Visual star rating

**Mock Data:**
```typescript
const assessments = [
  {
    id: 1,
    category: "Kedisiplinan",
    score: 85,
    maxScore: 100,
    description: "Kehadiran dan ketepatan waktu",
  },
  // ... kategori lainnya
];
```

**UI Components:**
- Card untuk info mentor
- Progress bars dengan warna gradasi (hijau-kuning-merah)
- Star icons untuk rating
- Responsive layout

---

### 5. Pengajuan & Verifikasi Judul Laporan

#### A. Pengajuan Judul (Mahasiswa)

**File**: `app/feature/kp-report/components/title-submission-form.tsx`

**Fungsi:**
- Form pengajuan judul laporan KP oleh mahasiswa
- Submit judul untuk mendapat persetujuan dosen

**Fitur:**

##### Input Judul
- **Judul Bahasa Indonesia** (required)
- **Judul Bahasa Inggris** (optional)

##### Deskripsi Proyek
- **Deskripsi lengkap** (required, minimal 100 karakter)
  - Character counter
  - Validasi real-time
- **Metodologi pengembangan** (optional)
  - Contoh: Waterfall, Agile, Scrum, dll

##### Teknologi
- Input multiple teknologi yang digunakan
- Add teknologi dengan:
  - Tekan Enter
  - Klik tombol +
- Remove teknologi dengan klik X pada badge
- Display sebagai badge berwarna

##### Status Tracking
1. **Draft** - Belum diajukan (gray)
2. **Diajukan** - Menunggu verifikasi dosen (blue)
3. **Disetujui** - Judul disetujui, form disabled (green)
4. **Revisi** - Perlu perbaikan, form enabled (yellow)
5. **Ditolak** - Harus ajukan judul baru, form enabled (red)

##### Catatan Dosen
- Display catatan dengan background berwarna:
  - Hijau (border-green) untuk disetujui
  - Biru (border-blue) untuk revisi
  - Merah (border-red) untuk ditolak
- Icon sesuai status
- Text catatan dari dosen

**Props Interface:**
```typescript
interface TitleSubmissionFormProps {
  onSubmit: (data: PengajuanJudulFormData) => void;
  isLoading?: boolean;
  initialData?: Partial<PengajuanJudulFormData>;
  status?: 'draft' | 'diajukan' | 'disetujui' | 'ditolak' | 'revisi';
  catatanDosen?: string;
}
```

**Validasi:**
- Judul Indonesia wajib diisi
- Deskripsi minimal 100 karakter
- Teknologi bisa kosong atau multiple
- Form disabled jika sudah disetujui

**UI Components:**
- Input text untuk judul
- Textarea untuk deskripsi
- Badge untuk teknologi (removable)
- Alert untuk catatan dosen dengan color-coding
- Button submit dengan text dinamis
- Icons: `FileText`, `Plus`, `X`, `CheckCircle`, `XCircle`, `Clock`, `AlertCircle`

---

#### B. Verifikasi Judul (Dosen)

**File**: `app/feature/kp-report/pages/verifikasi-judul-dosen-page.tsx`

**Fungsi:**
- Halaman dosen untuk verifikasi judul yang diajukan mahasiswa
- Approve, request revision, atau reject judul

**Fitur:**

##### Dashboard Statistik
- 4 Stats cards dengan counter dan icon:
  1. **Menunggu Verifikasi** (blue, Clock icon)
  2. **Disetujui** (green, CheckCircle icon)
  3. **Perlu Revisi** (yellow, FileEdit icon)
  4. **Ditolak** (red, XCircle icon)
- Hover effect pada cards
- Icon dalam circle dengan background warna

##### Search & Filter
- Search bar dengan icon
- Filter berdasarkan:
  - Nama mahasiswa
  - NIM
  - Judul laporan
  - Tempat magang
- Filter real-time saat mengetik

##### Tab Navigation
4 tabs dengan badge counter:
1. **Menunggu** (submitted)
2. **Disetujui** (approved)
3. **Perlu Revisi** (revision)
4. **Ditolak** (rejected)
- Badge menampilkan jumlah per kategori
- Responsive untuk mobile (scrollable tabs)

##### Pengajuan Card
Setiap card menampilkan:
- Info mahasiswa:
  - Foto (avatar)
  - Nama
  - NIM
  - Prodi
  - Tim
- Judul highlighted dengan background
- Detail (toggle view):
  - Tempat magang
  - Periode magang
  - Deskripsi
  - Teknologi (badges)
  - Metodologi
- Riwayat revisi (timeline)
- Catatan dosen dengan border berwarna
- Button "Verifikasi" atau "Lihat Detail"
- Border-left berwarna sesuai status

##### Verifikasi Dialog
Modal dengan:
- Preview mahasiswa dan judul
- 3 pilihan keputusan (radio button):
  - ✅ **Setujui** - Judul sesuai
  - 📝 **Revisi** - Perlu perbaikan
  - ❌ **Tolak** - Tidak sesuai
- Textarea catatan (required, minimal 10 karakter)
- Validation sebelum submit
- Visual indicator untuk setiap opsi (icon + color)
- Error handling

##### Notification System
- Toast notification setelah verifikasi
- Auto-hide setelah 4 detik
- Success message

##### Panduan Verifikasi
- Info card dengan guideline:
  - Cek kesesuaian judul dengan scope
  - Validasi metodologi
  - Review teknologi
  - Berikan feedback konstruktif
- Gradient background

**Mock Data:**
```typescript
// 6 contoh pengajuan dengan berbagai status:
// - 3 submitted (menunggu verifikasi)
// - 1 approved (disetujui)
// - 1 revision (perlu revisi)
// - 1 rejected (ditolak)
```

**UI Components:**
- Stats cards dengan gradient
- Tabs responsive (TabsList, TabsTrigger, TabsContent)
- Search input dengan icon
- Card dengan border dinamis
- Dialog modal untuk verifikasi
- Badge status berwarna
- Progress indicator (loading state)
- Empty state untuk setiap tab
- Icons: `FileText`, `CheckCircle`, `XCircle`, `Clock`, `FileEdit`, `Search`, `Info`, `Eye`

---

#### C. Supporting Components

##### 1. Pengajuan Judul Card

**File**: `app/feature/kp-report/components/pengajuan-judul-card.tsx`

**Props:**
```typescript
interface PengajuanJudulCardProps {
  pengajuan: PengajuanJudul;
  onVerifikasi: (pengajuan: PengajuanJudul) => void;
}
```

**Features:**
- Border-left dinamis berdasarkan status
- Highlighted title section dengan background
- Grid layout untuk tempat & periode magang
- Toggle detail view (deskripsi, metodologi, teknologi)
- Display riwayat revisi dengan timeline
- Display catatan dosen dengan border berwarna
- Action button untuk verifikasi

---

##### 2. Verifikasi Dialog

**File**: `app/feature/kp-report/components/verifikasi-judul-dialog.tsx`

**Props:**
```typescript
interface VerifikasiJudulDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pengajuan: PengajuanJudul;
  onSubmit: (data: VerifikasiJudulFormData) => void;
}
```

**Features:**
- Modal dialog dengan overlay
- Radio button group dengan 3 opsi
- Textarea dengan validation (min 10 char)
- Preview data mahasiswa dan judul
- Validation sebelum submit
- Visual indicator per opsi (icon + color)
- Error handling dan messages

---

#### D. Type Definitions

**File**: `app/feature/kp-report/types/judul.ts`

```typescript
export interface PengajuanJudul {
  id: string;
  mahasiswa: {
    nama: string;
    nim: string;
    jurusan: string;
    angkatan: string;
  };
  tim: {
    nama: string;
    tempatMagang: string;
    periode: string;
  };
  data: {
    judulLaporanIndo: string;
    judulLaporanEng?: string;
    deskripsi: string;
    metodologi?: string;
    teknologi: string[];
  };
  status: 'draft' | 'diajukan' | 'disetujui' | 'ditolak' | 'revisi';
  tanggalDiajukan: string;
  tanggalDiverifikasi?: string;
  catatanDosen?: string;
  revisi?: Array<{
    tanggal: string;
    catatan: string;
    status: 'revisi' | 'ditolak';
  }>;
}

export interface VerifikasiJudulFormData {
  status: 'disetujui' | 'revisi' | 'ditolak';
  catatan: string;
}
```

---

#### E. Integration

**Routes:**
- `/mahasiswa/kp/laporan` - Tab "Judul" menampilkan TitleSubmissionForm
- `/dosen/kp/verifikasi-judul` - VerifikasiJudulDosenPage

**Sidebar Menu:**
- **Mahasiswa**: Menu "Laporan KP" → Tab "Judul"
- **Dosen**: Menu "Verifikasi Judul" di section Kerja Praktik

---

## File yang Dibuat/Dimodifikasi

### File Baru

#### During Intern
1. `app/feature/during-intern/components/card.tsx`
2. `app/feature/during-intern/pages/during-intern-page.tsx`
3. `app/feature/during-intern/pages/logbook-page.tsx`
4. `app/feature/during-intern/pages/assessment-page.tsx`
5. `app/feature/during-intern/types/index.d.ts`

#### Field Mentor
6. `app/feature/field-mentor/pages/field-mentor-page.tsx`
7. `app/feature/field-mentor/types/index.d.ts`

#### KP Report ⭐ NEW
8. `app/feature/kp-report/components/title-submission-form.tsx`
9. `app/feature/kp-report/components/pengajuan-judul-card.tsx`
10. `app/feature/kp-report/components/verifikasi-judul-dialog.tsx`
11. `app/feature/kp-report/pages/verifikasi-judul-dosen-page.tsx`
12. `app/feature/kp-report/types/judul.ts`

#### Routes
13. `app/routes/_sidebar.mahasiswa.kp._timeline.saat-magang.tsx`
14. `app/routes/_sidebar.mahasiswa.kp._timeline.logbook.tsx`
15. `app/routes/_sidebar.mahasiswa.kp._timeline.penilaian.tsx`
16. `app/routes/_sidebar.mahasiswa.mentor-lapangan.tsx`
17. `app/routes/_sidebar.dosen.kp.verifikasi-judul.tsx` ⭐ NEW

### File Dimodifikasi

1. `app/feature/sidebar/data/sidebar-data.ts`
   - Menambahkan menu "Mentor Lapangan" di sidebar mahasiswa
   - Menambahkan menu "Verifikasi Judul" di sidebar dosen ⭐

2. `app/feature/timeline/context/timeline-context.tsx`
   - Menambahkan `SAAT_MAGANG` step ke timeline

3. `app/feature/timeline/components/timeline.tsx`
   - Menambahkan route mapping untuk `SAAT_MAGANG`

---

## Route dan Navigasi

### Routes yang Ditambahkan

| Route | Component | Deskripsi |
|-------|-----------|-----------|
| `/mahasiswa/kp/saat-magang` | `DuringInternPage` | Hub menu saat magang |
| `/mahasiswa/kp/logbook` | `LogbookPage` | Pencatatan logbook |
| `/mahasiswa/kp/penilaian` | `AssessmentPage` | Lihat penilaian |
| `/mahasiswa/mentor-lapangan` | `FieldMentorPage` | Pendaftaran mentor |
| `/mahasiswa/kp/laporan` | `KPReportPage` | Tab "Judul" untuk pengajuan ⭐ |
| `/dosen/kp/verifikasi-judul` | `VerifikasiJudulDosenPage` | Verifikasi judul laporan ⭐ |

### Sidebar Menu

**Mahasiswa:**
```typescript
{
  title: "Laporan KP",
  url: "/mahasiswa/kp/laporan",
  icon: BookMarked,
},
{
  title: "Mentor Lapangan",
  url: "/mahasiswa/mentor-lapangan",
  icon: UserCircle,
},
```

**Dosen:** ⭐
```typescript
{
  title: "Kerja Praktik",
  url: "#",
  icon: GraduationCap,
  items: [
    {
      title: "Verifikasi Judul",
      url: "/dosen/kp/verifikasi-judul",
    },
    {
      title: "Verifikasi Sidang",
      url: "/dosen/kp/verifikasi-sidang",
    },
  ],
},
```

---

## Type Definitions

### During Intern Types

**File**: `app/feature/during-intern/types/index.d.ts`

```typescript
import type { LucideIcon } from "lucide-react";

export interface CardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  to: string;
}
```

### Field Mentor Types

**File**: `app/feature/field-mentor/types/index.d.ts`

```typescript
export interface FieldMentor {
  id: string;
  code: string;
  name: string;
  email: string;
  company: string;
  position: string;
  phone: string;
  status: "pending" | "registered" | "approved" | "rejected";
  createdAt: string;
  registeredAt?: string;
  approvedAt?: string;
  photo?: string;
  nip: string;
}

export interface MentorRequest {
  mentorName: string;
  mentorEmail: string;
  mentorPhone: string;
  company: string;
  position: string;
  address: string;
}
```

### KP Report Types ⭐

**File**: `app/feature/kp-report/types/judul.ts`

```typescript
export interface PengajuanJudul {
  id: string;
  mahasiswa: {
    nama: string;
    nim: string;
    jurusan: string;
    angkatan: string;
  };
  tim: {
    nama: string;
    tempatMagang: string;
    periode: string;
  };
  data: {
    judulLaporanIndo: string;
    judulLaporanEng?: string;
    deskripsi: string;
    metodologi?: string;
    teknologi: string[];
  };
  status: 'draft' | 'diajukan' | 'disetujui' | 'ditolak' | 'revisi';
  tanggalDiajukan: string;
  tanggalDiverifikasi?: string;
  catatanDosen?: string;
  revisi?: Array<{
    tanggal: string;
    catatan: string;
    status: 'revisi' | 'ditolak';
  }>;
}

export interface VerifikasiJudulFormData {
  status: 'disetujui' | 'revisi' | 'ditolak';
  catatan: string;
}
```

---

## Cara Menggunakan

### Untuk Mahasiswa

#### 1. Mengakses Halaman Saat Magang
```
Dashboard Mahasiswa → Timeline KP → Saat Magang
atau: /mahasiswa/kp/saat-magang
```

#### 2. Mendaftar Mentor Lapangan
```
Dashboard Mahasiswa → Mentor Lapangan
atau: /mahasiswa/mentor-lapangan
```

**Langkah:**
1. Isi form data mentor dengan lengkap
2. Klik "Submit Pendaftaran"
3. Copy kode mentor yang di-generate
4. Berikan kode ke mentor untuk registrasi
5. Status akan berubah setelah mentor registrasi

#### 3. Mengisi Logbook
```
Dashboard Mahasiswa → Timeline KP → Saat Magang → Logbook
atau: /mahasiswa/kp/logbook
```

**Langkah:**
1. Isi periode kerja (tanggal mulai, selesai, hari kerja)
2. Klik "Generate Tanggal Kerja"
3. Pilih tanggal dari dropdown
4. Isi deskripsi aktivitas
5. Klik "Tambah Logbook"
6. Logbook tersimpan dan tampil di tabel

#### 4. Melihat Penilaian
```
Dashboard Mahasiswa → Timeline KP → Saat Magang → Penilaian
atau: /mahasiswa/kp/penilaian
```

**Langkah:**
1. Lihat detail penilaian per kategori
2. Lihat total skor dan grade
3. Lihat info mentor yang menilai

#### 5. Mengajukan Judul Laporan ⭐
```
Dashboard Mahasiswa → Laporan KP → Tab "Judul"
atau: /mahasiswa/kp/laporan
```

**Langkah:**
1. Buka halaman Laporan KP
2. Klik tab "Judul"
3. Isi form pengajuan judul:
   - Judul Bahasa Indonesia (wajib)
   - Judul Bahasa Inggris (opsional)
   - Deskripsi proyek (wajib, min 100 karakter)
   - Metodologi (opsional)
   - Teknologi yang digunakan (opsional, bisa multiple)
4. Klik "Ajukan Judul Laporan"
5. Tunggu verifikasi dari dosen pembimbing

**Status:**
- **Draft**: Belum diajukan
- **Diajukan**: Menunggu verifikasi dosen
- **Disetujui**: Judul disetujui, lanjut ke tahap berikutnya
- **Revisi**: Perbaiki sesuai catatan dosen, ajukan ulang
- **Ditolak**: Ajukan judul baru yang berbeda

---

### Untuk Dosen ⭐

#### Verifikasi Judul Laporan KP
```
Dashboard Dosen → Kerja Praktik → Verifikasi Judul
atau: /dosen/kp/verifikasi-judul
```

**Langkah:**

1. **Lihat Dashboard**
   - Stats cards menampilkan overview pengajuan
   - Menunggu: Pengajuan baru yang perlu di-review
   - Disetujui: Judul yang sudah diverifikasi
   - Revisi: Mahasiswa diminta perbaiki
   - Ditolak: Judul tidak sesuai

2. **Search & Filter**
   - Gunakan search untuk mencari mahasiswa/judul tertentu
   - Ketik nama, NIM, judul, atau tempat magang

3. **Pilih Tab**
   - Klik tab sesuai status yang ingin dilihat
   - Badge menampilkan jumlah per kategori

4. **Review Pengajuan**
   - Klik "Lihat Detail" untuk informasi lengkap:
     - Judul (Indonesia & Inggris)
     - Deskripsi proyek
     - Metodologi
     - Teknologi yang digunakan
     - Tempat dan periode magang
     - Riwayat revisi (jika ada)

5. **Verifikasi**
   - Untuk pengajuan yang menunggu, klik "Verifikasi Judul"
   - Pilih keputusan verifikasi:
     - ✅ **Setujui**: Judul sudah sesuai dan layak dilanjutkan
     - 📝 **Minta Revisi**: Judul perlu diperbaiki dengan catatan
     - ❌ **Tolak**: Judul tidak sesuai, mahasiswa harus ajukan judul baru

6. **Isi Catatan**
   - Wajib isi catatan (minimal 10 karakter)
   - Untuk disetujui: Berikan apresiasi dan saran
   - Untuk revisi: Jelaskan apa yang perlu diperbaiki
   - Untuk ditolak: Jelaskan alasan penolakan dan arahan

7. **Submit**
   - Klik "Simpan Verifikasi"
   - Notification muncul
   - Mahasiswa akan menerima notifikasi dan melihat catatan

**Tips Verifikasi:**
- Pastikan judul mencerminkan isi dan ruang lingkup pekerjaan
- Judul harus spesifik, tidak terlalu umum atau terlalu teknis
- Perhatikan penggunaan teknologi dan metodologi yang disebutkan
- Berikan feedback konstruktif untuk membantu mahasiswa berkembang

---

## Commit History

### Main Commits

```bash
# Commit terakhir di branch ⭐ NEW
0f3be70 (HEAD -> Saat-Magang, origin/Saat-Magang) 
  Tambahan Untuk Halaman Pengajuan Judul (Mahasiswa) dan 
  Membuat Halaman Verifikasi Judul (Dosen)
  - Created: title-submission-form.tsx (comprehensive update)
  - Created: verifikasi-judul-dosen-page.tsx
  - Created: pengajuan-judul-card.tsx
  - Created: verifikasi-judul-dialog.tsx
  - Created: kp-report/types/judul.ts
  - Created: route _sidebar.dosen.kp.verifikasi-judul.tsx
  - Modified: sidebar-data.ts (added Verifikasi Judul menu)

ba946bb Tampian Halaman Laporan KP

1b31d92 Merge remote-tracking branch 'origin/main' into Saat-Magang

b806c24 Membuat Halaman Logbook, Penilaian dan Halaman Mentor Lapangan
  - Created: during-intern pages (logbook, assessment, during-intern)
  - Created: field-mentor page
  - Created: route files
  - Modified: sidebar data
```

### Related Commits
```bash
059d787 (origin/Pembimbing-Lapangan) Membuat Halaman Lengkap Untuk Mentor

12fb617 menu penilaian to ols
```

---

## UI/UX Highlights

### Design Patterns
- **Card-based Navigation**: Menu menggunakan card dengan icon
- **Form Validation**: Input validation sebelum submit
- **Progress Indicators**: Visual feedback dengan progress bar
- **Status Badges**: Color-coded status untuk tracking
- **Responsive Layout**: Mobile-friendly design
- **Modal Dialogs**: Untuk actions penting (verifikasi)
- **Search & Filter**: Real-time filtering
- **Tab Navigation**: Organize content by status

### Colors & Styling
- **Primary**: Blue untuk CTA buttons dan info
- **Success**: Green untuk status approved/disetujui
- **Warning**: Yellow untuk status pending/revision
- **Danger**: Red untuk status rejected/ditolak
- **Neutral**: Gray untuk backgrounds dan borders

### Icons Used (Lucide React)
- `BookOpen` - Logbook
- `ClipboardCheck` - Penilaian
- `FileCheck` - Pengesahan
- `FileText` - Judul laporan
- `FileEdit` - Revisi
- `UserPlus` - Tambah mentor
- `User`, `Users`, `UserCircle` - User profiles
- `Building2` - Perusahaan
- `Copy` - Copy button
- `CheckCircle`, `CheckCircle2` - Success/Approved
- `XCircle` - Error/Reject/Ditolak
- `Clock` - Pending/Menunggu
- `ArrowLeft`, `ArrowRight` - Navigation
- `Plus`, `X` - Add/Remove
- `Eye` - View detail
- `AlertCircle` - Warning
- `Info` - Information
- `Search` - Search
- `Calendar` - Date
- `Star` - Rating
- `GraduationCap` - Kerja Praktik menu

---

## Testing Checklist

### Mentor Lapangan
- [ ] Form validation
- [ ] Generate kode mentor
- [ ] Copy to clipboard
- [ ] Display status mentor
- [ ] Status badge colors

### Logbook
- [ ] Generate tanggal berdasarkan periode
- [ ] Validasi periode kerja
- [ ] Tambah logbook entry
- [ ] Display daftar logbook
- [ ] Table responsive

### Penilaian
- [ ] Display penilaian per kategori
- [ ] Progress bar sesuai skor
- [ ] Perhitungan rata-rata
- [ ] Display grade
- [ ] Info mentor lengkap

### Pengajuan Judul (Mahasiswa) ⭐
- [ ] Form judul Indonesia (required)
- [ ] Form judul Inggris (optional)
- [ ] Textarea deskripsi (min 100 char)
- [ ] Character counter
- [ ] Input metodologi
- [ ] Add/remove teknologi
- [ ] Enter key untuk add teknologi
- [ ] Submit form validation
- [ ] Status badge display
- [ ] Catatan dosen display
- [ ] Form disabled saat disetujui
- [ ] Form enabled untuk revisi

### Verifikasi Judul (Dosen) ⭐
- [ ] Stats cards dengan counter
- [ ] Search functionality
- [ ] Real-time filter
- [ ] Tab navigation
- [ ] Badge counter per tab
- [ ] Pengajuan card display
- [ ] Toggle detail view
- [ ] Border color by status
- [ ] Verifikasi dialog open/close
- [ ] Radio button selection
- [ ] Catatan textarea validation (min 10 char)
- [ ] Preview mahasiswa data
- [ ] Submit verifikasi
- [ ] Notification display
- [ ] Auto-hide notification
- [ ] Status update
- [ ] Riwayat revisi display
- [ ] Empty state per tab
- [ ] Responsive layout

### Navigation
- [ ] Timeline integration
- [ ] Sidebar menu
- [ ] Breadcrumb
- [ ] Back/Forward buttons
- [ ] Tab switching

---

## Code Conventions

Sesuai `CODE_CONVENTION.md`:

- ✅ **Function Declaration**: Menggunakan `function` keyword, bukan arrow function
- ✅ **Export Default**: Di akhir file
- ✅ **File Naming**: kebab-case
- ✅ **TypeScript**: Strict typing dengan interfaces
- ✅ **Tailwind CSS**: Utility classes dengan `cn()` helper
- ✅ **Icons**: Lucide React icons

Contoh:
```typescript
function MyComponent(props: MyProps) {
  // ... component logic
  return <div>...</div>;
}

export default MyComponent;
```

---

**Branch**: `Saat-Magang`  
**Last Updated**: December 28, 2025  
**Author**: Development Team  
**Status**: ✅ Completed (Ready for Backend Integration)
