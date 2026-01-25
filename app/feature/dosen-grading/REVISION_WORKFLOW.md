# Workflow Revisi Penilaian Dosen

## Deskripsi
Fitur ini memungkinkan dosen untuk melakukan review revisi dokumen mahasiswa sebelum memberikan penilaian final. Dosen dapat memilih apakah dokumen memerlukan revisi atau dapat langsung dinilai.

## Alur Kerja

### 1. Dosen Membuka Halaman Beri Nilai
- Dosen mengakses halaman penilaian mahasiswa
- Sistem menampilkan 2 tab: **Revisi** dan **Penilaian**
- Tab **Penilaian** terkunci sampai revisi disetujui

### 2. Opsi A: Tidak Ada Revisi Diperlukan
Jika dokumen mahasiswa sudah sempurna:
- Dosen mengaktifkan toggle **"Tidak Ada Revisi Diperlukan"**
- Tab **Penilaian** otomatis terbuka
- Dosen dapat langsung memberikan nilai

### 3. Opsi B: Revisi Diperlukan
Jika dokumen memerlukan perbaikan:

#### 3a. Review Dokumen
- Dosen melihat daftar dokumen yang diunggah mahasiswa (Laporan KP, Slide Presentasi)
- Setiap dokumen menampilkan:
  - Nama file
  - Ukuran file
  - Versi
  - Tanggal upload
  - Tombol **Lihat** dan **Unduh**

#### 3b. Setujui atau Tolak
**Menyetujui Revisi:**
- Klik tombol **"Setujui Revisi"**
- Dokumen berpindah ke tab **"Disetujui"**
- Progress bar bertambah

**Menolak Revisi:**
- Klik tombol **"Tolak Revisi"**
- Masukkan **alasan penolakan** di dialog
- Mahasiswa akan menerima notifikasi dengan alasan penolakan
- Mahasiswa harus mengupload ulang dokumen yang diperbaiki
- Dokumen berpindah ke tab **"Ditolak"**

#### 3c. Semua Revisi Disetujui
- Ketika semua dokumen disetujui:
  - Muncul alert hijau: "Semua revisi telah disetujui"
  - Tab **Penilaian** otomatis terbuka dan tidak lagi terkunci
  - Dosen dapat memberikan penilaian final

### 4. Memberikan Penilaian
- Dosen mengisi form penilaian dengan komponen:
  - Kesesuaian Laporan dengan Format (30%)
  - Penguasaan Materi KP (30%)
  - Analisis dan Perancangan (30%)
  - Sikap dan Etika (10%)
- Dosen dapat menambahkan catatan
- Klik **"Simpan Penilaian"**

## Status Revisi

### Di Daftar Mahasiswa
Setiap mahasiswa menampilkan badge status revisi:
- 🟢 **Sudah Direvisi**: Semua revisi disetujui, siap dinilai
- 🔵 **Proses**: Sedang dalam proses review revisi
- 🟠 **Belum Direvisi**: Belum ada revisi atau ada revisi yang ditolak

## Komponen Utama

### 1. RevisionReviewSection
Komponen untuk review revisi dokumen dengan fitur:
- Toggle "Tidak Ada Revisi Diperlukan"
- Tab Menunggu/Disetujui/Ditolak
- Approve/Reject per dokumen
- Progress tracking

### 2. GiveGradePage
Halaman utama dengan:
- Tab Revisi dan Penilaian
- Status alert
- Lock/unlock mechanism
- Grading form

### 3. StudentGradingCard
Card mahasiswa dengan:
- Status penilaian (Sudah Dinilai/Belum Dinilai)
- Status revisi (badge warna)
- Informasi mahasiswa
- Tombol aksi

## Data Mock
File: `app/feature/dosen-grading/data/mock-students.ts`

Contoh mahasiswa dengan berbagai status:
- **std-001**: Sudah dinilai, revisi selesai
- **std-002**: Sudah dinilai, revisi selesai
- **std-003**: Belum dinilai, revisi dalam proses
- **std-004**: Belum dinilai, belum ada revisi

## Integrasi dengan Backend
Ketika mengintegrasikan dengan API:

### Endpoints yang Diperlukan
```typescript
// Get revisions for student
GET /api/students/:id/revisions
Response: Revision[]

// Approve revision
POST /api/revisions/:id/approve

// Reject revision
POST /api/revisions/:id/reject
Body: { reason: string }

// Set no revision needed
POST /api/students/:id/no-revision

// Submit grade
POST /api/students/:id/grade
Body: GradingFormData
```

### State Management
- Gunakan React Query atau SWR untuk caching
- Real-time updates dengan WebSocket (optional)
- Optimistic updates untuk UX yang lebih baik

## Keamanan
- ✅ Dosen hanya bisa menilai mahasiswa bimbingannya
- ✅ Penilaian terkunci sampai revisi disetujui (kecuali "no revision" mode)
- ✅ Alasan penolakan wajib diisi
- ✅ Audit trail untuk semua approve/reject

## Testing
Skenario test yang harus dicakup:
1. ✅ Toggle "no revision" membuka tab penilaian
2. ✅ Approve semua dokumen membuka tab penilaian
3. ✅ Reject dokumen mengunci tab penilaian
4. ✅ Progress bar update sesuai approval
5. ✅ Form validation saat reject tanpa alasan
