# Student Grading Feature

Fitur penilaian untuk mahasiswa yang menampilkan hasil penilaian dari Mentor Lapangan dan Dosen Pembimbing KP.

## Struktur

```
student-grading/
├── components/
│   ├── field-mentor-grade-card.tsx       # Card penilaian mentor lapangan (30%)
│   ├── academic-supervisor-grade-card.tsx # Card penilaian dosen pembimbing (70%)
│   └── combined-grade-card.tsx           # Card rekap nilai akhir
├── data/
│   └── mock-data.ts                      # Mock data untuk testing
├── pages/
│   └── student-grading-page.tsx          # Halaman utama penilaian mahasiswa
├── types/
│   └── index.d.ts                        # Type definitions
└── index.ts                              # Export barrel
```

## Fitur Utama

### 1. Card Penilaian Mentor Lapangan (30%)
- Menampilkan penilaian dari mentor lapangan
- Bobot 30% dari nilai akhir
- Kategori penilaian:
  - Kedisiplinan
  - Kualitas Kerja
  - Sikap & Etika
- Dapat melihat detail penilaian per komponen

### 2. Card Penilaian Dosen Pembimbing KP (70%)
- Menampilkan penilaian dari dosen pembimbing
- Bobot 70% dari nilai akhir
- Kategori penilaian:
  - Format Laporan
  - Penguasaan Materi
  - Analisis & Perancangan
  - Sikap & Etika
- Dapat melihat detail penilaian per komponen

### 3. Card Rekap Nilai Akhir
- Menampilkan gabungan nilai dari kedua penilai
- Formula perhitungan:
  - Nilai Mentor Lapangan × 30%
  - Nilai Dosen Pembimbing × 70%
  - Total = (Mentor × 0.3) + (Dosen × 0.7)
  - Rata-rata = Total / 2
- Menampilkan:
  - Nilai huruf (A, B, C, D, E)
  - Status kelulusan (Lulus/Tidak Lulus)
  - Breakdown nilai per komponen
  - Rata-rata nilai
- Card ini hanya aktif setelah kedua penilaian selesai

## Routing

Route: `/mahasiswa/penilaian`

File: `app/routes/_sidebar.mahasiswa.penilaian.tsx`

## Sidebar Menu

Menu ditambahkan di sidebar mahasiswa:
- Judul: "Penilaian KP"
- Icon: Award
- URL: `/mahasiswa/penilaian`

## Formula Perhitungan Nilai

1. **Nilai Mentor Lapangan (30%)**
   ```
   Weighted Score = (Total Score / Max Score) × 100 × 0.3
   ```

2. **Nilai Dosen Pembimbing (70%)**
   ```
   Weighted Score = (Total Score / Max Score) × 100 × 0.7
   ```

3. **Total Nilai**
   ```
   Total = Weighted Score Mentor + Weighted Score Dosen
   ```

4. **Rata-rata Nilai**
   ```
   Average = Total / 2
   ```

## Status Badge

- **Belum Dinilai**: Badge abu-abu
- **Sudah Dinilai**: Badge hijau/biru
- **Terkunci**: Card rekap terkunci sampai kedua penilaian selesai

## Konversi Nilai Huruf

| Nilai | Grade |
|-------|-------|
| ≥ 85  | A     |
| 70-84 | B     |
| 60-69 | C     |
| 50-59 | D     |
| < 50  | E     |

## Penggunaan

```tsx
import { StudentGradingPage } from "~/feature/student-grading";

export default function MahasiswaPenilaianRoute() {
  return <StudentGradingPage />;
}
```

## TODO: Integrasi API

Untuk integrasi dengan backend, update fungsi berikut di `student-grading-page.tsx`:

```tsx
// Replace mock data dengan API call
const { data: studentGrade } = useQuery({
  queryKey: ["student-grade", studentId],
  queryFn: () => fetchStudentGrade(studentId),
});
```

API endpoints yang dibutuhkan:
- `GET /api/students/{id}/grades` - Mendapatkan semua penilaian mahasiswa
- `GET /api/students/{id}/grades/field-mentor` - Penilaian mentor lapangan
- `GET /api/students/{id}/grades/academic-supervisor` - Penilaian dosen pembimbing

## Catatan

- Halaman ini read-only untuk mahasiswa
- Tidak terintegrasi dengan timeline (standalone page)
- Mock data tersedia untuk testing di `data/mock-data.ts`
