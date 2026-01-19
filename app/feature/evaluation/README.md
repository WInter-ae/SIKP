# Evaluation Feature

Fitur penilaian mahasiswa untuk admin yang menampilkan daftar mahasiswa dengan ringkasan nilai dan detail penilaian lengkap.

## 📁 Struktur Folder

```
evaluation/
├── components/
│   ├── grade-section.tsx      # Komponen untuk menampilkan bagian nilai dengan progress bar
│   ├── student-card.tsx       # Komponen card untuk menampilkan mahasiswa
│   └── student-list.tsx       # Komponen grid untuk menampilkan list student cards
├── data/
│   └── mock-evaluations.ts    # Data dummy untuk evaluasi mahasiswa (2 mahasiswa)
├── pages/
│   ├── evaluation-page.tsx                    # Halaman utama daftar mahasiswa
│   └── student-evaluation-detail-page.tsx     # Halaman detail nilai mahasiswa
├── types/
│   └── index.d.ts             # Type definitions untuk Student, Grade, Evaluation
└── index.ts                   # Barrel export file
```

## 🎯 Fitur

### Halaman Daftar Penilaian (`/admin/penilaian`)
- **Dashboard Statistik**: 4 metric cards menampilkan Total Students, Passed Students, Average Score, Highest Score
- **Grid Mahasiswa**: Menampilkan student cards dalam grid layout responsive
- **Student Card**: Setiap card menampilkan:
  - Avatar mahasiswa
  - Nama dan NIM
  - Perusahaan tempat magang
  - Periode magang
  - Pembimbing lapangan dan dosen
  - Nilai akhir dan grade (A-E)
  - Status kelulusan (Lulus/Tidak Lulus)
  - Breakdown nilai (Pembimbing Lapangan + Dosen Pembimbing)

### Halaman Detail Penilaian (`/admin/penilaian/:id`)
- **Header Mahasiswa**: Info lengkap mahasiswa dengan avatar, badge grade & status
- **Penilaian Pembimbing Lapangan**:
  - Keterampilan Teknis (Pemahaman Teknologi, Problem Solving, Kualitas Hasil Kerja)
  - Soft Skills (Komunikasi, Kerjasama Tim, Inisiatif, Disiplin)
- **Penilaian Dosen Pembimbing**:
  - Laporan Kerja Praktik (Sistematika, Isi & Pembahasan, Analisis)
  - Presentasi & Ujian (Penyampaian, Penguasaan Materi, Kemampuan Menjawab)
- **Rekap Nilai Akhir**: Summary cards untuk nilai pembimbing lapangan, dosen, dan nilai akhir
- **Catatan Penilaian**: Catatan evaluasi dari dosen pembimbing

## 📊 Data Mock

File `mock-evaluations.ts` berisi 2 evaluasi mahasiswa:

1. **Ahmad Fauzi** (NIM: 1234567890)
   - PT. Teknologi Nusantara
   - Nilai Akhir: 85.44 (Grade A)
   - Status: Lulus

2. **Siti Nurhaliza** (NIM: 1234567891)
   - PT. Digital Indonesia
   - Nilai Akhir: 90.99 (Grade A)
   - Status: Lulus

## 🎨 Komponen

### StudentCard
Props: `student`, `summary`, `onClick`
- Menampilkan card mahasiswa dengan ringkasan nilai
- Badge untuk grade dan status
- Progress untuk breakdown nilai

### StudentList
Props: `evaluations`, `onStudentClick`
- Grid responsive (1 col mobile, 2 cols tablet, 3 cols desktop)
- Loading state dengan skeleton
- Empty state ketika tidak ada data

### GradeSection
Props: `title`, `grades`, `totalScore`, `maxScore`
- Menampilkan kategori penilaian dengan komponen-komponennya
- Progress bar untuk setiap komponen
- Total score untuk setiap kategori

## 🛣️ Routes

Routes yang dibuat:
- `_sidebar.admin.penilaian.tsx` - Layout wrapper
- `_sidebar.admin.penilaian._index.tsx` - Halaman daftar
- `_sidebar.admin.penilaian.$id.tsx` - Halaman detail

## 🔧 Setup

### Install Dependencies

Package yang diperlukan:
```bash
bun add @radix-ui/react-progress
```

### Update Sidebar

Menu "Penilaian" sudah ditambahkan ke `adminMenu` di `sidebar-data.ts` dengan icon Award.

## 📝 Types

```typescript
interface Student {
  id: string;
  name: string;
  studentId: string;
  photo: string;
  company: string;
  supervisor: string;
  academicSupervisor: string;
  internPeriod: { start: string; end: string };
}

interface GradeComponent {
  name: string;
  score: number;
  maxScore: number;
  weight: number;
}

interface FieldSupervisorGrade {
  category: string;
  components: GradeComponent[];
  totalScore: number;
  maxScore: number;
  percentage: number;
}

interface AcademicSupervisorGrade {
  category: string;
  components: GradeComponent[];
  totalScore: number;
  maxScore: number;
  percentage: number;
}

interface EvaluationSummary {
  fieldSupervisorTotal: number;
  academicSupervisorTotal: number;
  finalScore: number;
  grade: "A" | "B" | "C" | "D" | "E";
  status: "passed" | "failed" | "pending";
}

interface StudentEvaluation {
  student: Student;
  fieldSupervisorGrades: FieldSupervisorGrade[];
  academicSupervisorGrades: AcademicSupervisorGrade[];
  summary: EvaluationSummary;
  notes?: string;
  evaluatedAt?: string;
}
```

## ✅ Status

- [x] Folder structure
- [x] Type definitions
- [x] Components (StudentCard, StudentList, GradeSection)
- [x] Mock data (2 evaluations)
- [x] Main page (evaluation-page.tsx)
- [x] Detail page (student-evaluation-detail-page.tsx)
- [x] Route files
- [x] Sidebar menu integration
- [x] Barrel export (index.ts)
- [ ] Install @radix-ui/react-progress (manual installation required)

## 🚀 Cara Menggunakan

1. Install dependency yang diperlukan:
   ```bash
   bun add @radix-ui/react-progress
   ```

2. Akses halaman penilaian di `/admin/penilaian`

3. Klik card mahasiswa untuk melihat detail penilaian

## 🎨 Design System

- **Colors**:
  - Grade A: Green (bg-green-500)
  - Grade B: Blue (bg-blue-500)
  - Grade C: Yellow (bg-yellow-500)
  - Grade D: Orange (bg-orange-500)
  - Grade E: Red (bg-red-500)
  - Status Lulus: Green (bg-green-100 text-green-800)
  - Status Tidak Lulus: Red (bg-red-100 text-red-800)

- **Icons**:
  - Users: Total Students
  - CheckCircle2: Passed Students
  - TrendingUp: Average Score
  - Award: Highest Score, Penilaian Menu
