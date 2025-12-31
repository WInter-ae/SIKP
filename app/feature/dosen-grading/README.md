# Dosen Grading Feature

Fitur penilaian mahasiswa untuk dosen yang memungkinkan dosen memberikan nilai kepada mahasiswa bimbingannya dan melihat nilai dari pembimbing lapangan.

## 📁 Struktur Folder

```
dosen-grading/
├── components/
│   ├── grading-form.tsx           # Form input nilai dengan validasi
│   └── student-grading-card.tsx   # Card mahasiswa dengan status penilaian
├── data/
│   └── mock-students.ts           # Data dummy 3 mahasiswa (2 sudah dinilai, 1 belum)
├── pages/
│   ├── dosen-grading-list-page.tsx        # Halaman daftar mahasiswa bimbingan
│   ├── give-grade-page.tsx                # Halaman form pemberian nilai
│   └── student-grade-detail-page.tsx      # Halaman detail nilai lengkap
├── types/
│   └── index.d.ts                 # Type definitions untuk grading
└── index.ts                       # Barrel export file
```

## 🎯 Fitur

### Halaman Daftar Mahasiswa (`/dosen/penilaian`)
- **Dashboard Statistik**: 4 metric cards
  - Total Mahasiswa Bimbingan
  - Mahasiswa Sudah Dinilai
  - Mahasiswa Belum Dinilai
  - Rata-rata Nilai
- **Grid Mahasiswa**: Menampilkan student grading cards
- **Student Grading Card**: Setiap card menampilkan:
  - Avatar dan info mahasiswa
  - Status penilaian (Sudah Dinilai / Belum Dinilai / Pending)
  - Badge grade dan nilai akhir (untuk yang sudah dinilai)
  - Info perusahaan, periode magang, pembimbing lapangan
  - Breakdown nilai dosen dan pembimbing lapangan
  - Action buttons (Beri Nilai / Edit Nilai + Lihat Detail)

### Halaman Pemberian Nilai (`/dosen/penilaian/beri-nilai/:id`)
- **Informasi Mahasiswa**: Card dengan data lengkap mahasiswa
- **Form Penilaian**: Terbagi 2 kategori
  
  **1. Penilaian Laporan Kerja Praktik**
  - Sistematika Penulisan (Bobot 20%)
  - Isi dan Pembahasan (Bobot 40%)
  - Analisis dan Kesimpulan (Bobot 40%)
  
  **2. Penilaian Presentasi & Ujian**
  - Penyampaian Materi (Bobot 30%)
  - Penguasaan Materi (Bobot 50%)
  - Kemampuan Menjawab (Bobot 20%)
  
- **Catatan Penilaian**: Textarea opsional untuk komentar
- **Ringkasan Nilai Akhir**: Real-time calculation
  - Nilai Laporan
  - Nilai Presentasi
  - Total Nilai Dosen (rata-rata dari kedua nilai)
- **Validasi**: Input hanya menerima nilai 0-100
- **Fitur Edit**: Jika mahasiswa sudah dinilai, form akan terisi dengan nilai sebelumnya

### Halaman Detail Nilai (`/dosen/penilaian/detail/:id`)
- **Header Mahasiswa**: Info lengkap dengan grade, status, dan nilai akhir
- **Penilaian Dosen Pembimbing (Anda)**:
  - Laporan Kerja Praktik dengan komponen dan progress bar
  - Presentasi & Ujian dengan komponen dan progress bar
- **Penilaian Pembimbing Lapangan** (Read-only):
  - Keterampilan Teknis
  - Soft Skills
- **Rekap Nilai Akhir**: 3 summary cards
  - Nilai Dosen Pembimbing
  - Nilai Pembimbing Lapangan
  - Nilai Akhir (Grade)
- **Catatan Penilaian**: Catatan dari dosen
- **Button Edit Nilai**: Quick access ke form edit nilai

## 📊 Data Mock

File `mock-students.ts` berisi 3 mahasiswa bimbingan:

1. **Ahmad Fauzi** (NIM: 1234567890)
   - PT. Teknologi Nusantara
   - Status: Sudah Dinilai
   - Nilai Akhir: 85.44 (Grade A)

2. **Siti Nurhaliza** (NIM: 1234567891)
   - PT. Digital Indonesia
   - Status: Sudah Dinilai
   - Nilai Akhir: 91.29 (Grade A)

3. **Rizki Maulana** (NIM: 1234567892)
   - PT. Inovasi Teknologi
   - Status: Belum Dinilai
   - Nilai Pembimbing Lapangan: Sudah ada

## 🎨 Komponen

### StudentGradingCard
Props: `studentInfo`, `onGiveGrade`, `onViewDetail`
- Menampilkan card mahasiswa dengan status penilaian
- Badge untuk status (Sudah/Belum/Pending) dan grade
- Action buttons kondisional berdasarkan status

### GradingForm
Props: `initialData`, `onSubmit`, `onCancel`, `isSubmitting`
- Form lengkap untuk pemberian nilai dengan validasi
- Real-time calculation untuk setiap kategori
- Alert info untuk menjelaskan bobot penilaian
- Ringkasan nilai akhir dengan 3 cards
- Error handling untuk input invalid

## 🛣️ Routes

Routes yang dibuat:
- `_sidebar.dosen.penilaian.tsx` - Layout wrapper
- `_sidebar.dosen.penilaian._index.tsx` - Halaman daftar
- `_sidebar.dosen.penilaian.beri-nilai.$id.tsx` - Halaman form pemberian nilai
- `_sidebar.dosen.penilaian.detail.$id.tsx` - Halaman detail nilai

## 📝 Types

```typescript
interface StudentForGrading {
  id: string;
  name: string;
  studentId: string;
  photo: string;
  company: string;
  fieldSupervisor: string;
  internPeriod: { start: string; end: string };
}

interface GradeComponent {
  name: string;
  score: number;
  maxScore: number;
  weight: number;
}

interface AcademicGradeCategory {
  category: string;
  components: GradeComponent[];
  totalScore: number;
  maxScore: number;
  percentage: number;
}

interface GradingFormData {
  reportSystematics: number;
  reportContent: number;
  reportAnalysis: number;
  presentationDelivery: number;
  presentationMastery: number;
  presentationQA: number;
  notes?: string;
}

type GradingStatus = "graded" | "not-graded" | "pending";

interface StudentGradingInfo {
  student: StudentForGrading;
  gradingStatus: GradingStatus;
  academicGrades?: AcademicGradeCategory[];
  fieldSupervisorGrades?: FieldSupervisorGrade[];
  summary?: {
    academicSupervisorTotal: number;
    fieldSupervisorTotal: number;
    finalScore: number;
    grade: "A" | "B" | "C" | "D" | "E";
    status: "passed" | "failed" | "pending";
  };
  notes?: string;
  gradedAt?: string;
}
```

## 🔄 Alur Kerja

1. **Dosen Login** → Akses menu "Penilaian KP"
2. **Lihat Daftar** → Dashboard dengan statistik dan list mahasiswa
3. **Pilih Mahasiswa**:
   - **Belum Dinilai**: Klik "Beri Nilai" → Form input nilai
   - **Sudah Dinilai**: Klik "Lihat Detail" atau "Edit Nilai"
4. **Input Nilai**:
   - Isi 6 aspek penilaian (Laporan + Presentasi)
   - Lihat perhitungan otomatis
   - Tambah catatan (opsional)
   - Simpan nilai
5. **Lihat Detail**: Lihat nilai lengkap termasuk nilai dari pembimbing lapangan

## ⚙️ Perhitungan Nilai

### Nilai Laporan KP
```
Nilai Laporan = (Sistematika × 20%) + (Isi & Pembahasan × 40%) + (Analisis × 40%)
```

### Nilai Presentasi & Ujian
```
Nilai Presentasi = (Penyampaian × 30%) + (Penguasaan × 50%) + (Kemampuan Menjawab × 20%)
```

### Total Nilai Dosen
```
Total Nilai Dosen = (Nilai Laporan + Nilai Presentasi) / 2
```

### Nilai Akhir Mahasiswa
```
Nilai Akhir = (Total Nilai Dosen + Nilai Pembimbing Lapangan) / 2
```

## ✅ Status

- [x] Folder structure
- [x] Type definitions
- [x] Components (StudentGradingCard, GradingForm)
- [x] Mock data (3 students: 2 graded, 1 not graded)
- [x] List page (dosen-grading-list-page.tsx)
- [x] Give grade page (give-grade-page.tsx)
- [x] Detail page (student-grade-detail-page.tsx)
- [x] Route files
- [x] Sidebar menu integration
- [x] Barrel export (index.ts)
- [x] Validation & error handling
- [x] Real-time calculation

## 🚀 Cara Menggunakan

1. Akses halaman penilaian di `/dosen/penilaian`

2. Pilih mahasiswa yang ingin dinilai

3. Isi form penilaian dengan nilai 0-100 untuk setiap aspek

4. Sistem akan otomatis menghitung:
   - Nilai per kategori (Laporan & Presentasi)
   - Total nilai dosen
   - Preview nilai akhir (kombinasi dengan nilai pembimbing lapangan)

5. Simpan nilai dan lihat detail lengkap

## 🎨 Design System

- **Status Badge Colors**:
  - Sudah Dinilai: Green (bg-green-100 text-green-800)
  - Belum Dinilai: Gray (bg-gray-100 text-gray-800)
  - Pending: Yellow (bg-yellow-100 text-yellow-800)

- **Grade Badge Colors**:
  - Grade A: Green (bg-green-500)
  - Grade B: Blue (bg-blue-500)
  - Grade C: Yellow (bg-yellow-500)
  - Grade D: Orange (bg-orange-500)
  - Grade E: Red (bg-red-500)

- **Score Display Colors**:
  - Nilai Laporan: Blue (bg-blue-50)
  - Nilai Presentasi: Purple (bg-purple-50)
  - Nilai Akhir: Green (bg-green-50)

## 🔗 Integrasi dengan Evaluation Feature

Halaman detail menggunakan komponen `GradeSection` dari `evaluation` feature untuk konsistensi UI dalam menampilkan breakdown nilai.

## 📌 Catatan Penting

- Form validasi memastikan input hanya 0-100
- Perhitungan nilai real-time saat user mengetik
- Data mahasiswa yang belum dinilai tetap menampilkan nilai dari pembimbing lapangan
- Status "graded" akan mengubah tampilan card dan menampilkan nilai
- Dosen dapat mengedit nilai kapan saja setelah dinilai
