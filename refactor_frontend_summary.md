# Refactor Frontend Summary: Internship Module (Domain-Based Sync)

Dokumen ini merangkum perubahan pada sisi frontend untuk menyelaraskan dengan refactoring backend (Arsitektur Service-Based & Domain-Based Routing).

---

## ✅ Perubahan yang Dilakukan (Completed)

### 1. Migrasi Endpoint Domain-Based
Seluruh pemanggilan API telah dipindahkan dari rute berbasis identitas ke rute berbasis domain fitur:
| Rute Lama (DAPUS) | Rute Baru |
| :--- | :--- |
| `/api/mahasiswa/logbook` | `/api/logbooks` |
| `/api/mahasiswa/internship` | `/api/internships` |
| `/api/mentor/...` | `/api/mentorship/...` |
| `/api/dosen/logbook-monitor` | `/api/internship-monitoring/logbook` |
| `/api/mentor/logbook/:id/approve-all` | `/api/mentorship/mentees/:id/approve-all` |
| `/api/mentor/assessment` | `/api/mentorship/assessments` |

### 2. Adopsi Pola `createApiClient` Factory (Sinkron dengan Main)
Mengikuti pola utama dari branch `main` secara penuh:
- **`createApiClient(baseUrl)`** — factory function yang menghasilkan instance client dengan method `get`, `post`, `put`, `patch`, `del`, `upload`, dan `request`.
- **`sikpClient`** — digunakan untuk fitur pengajuan KP (submission, team, surat, dll.), menggunakan `API_BASE_URL`.
- **`internshipClient`** — digunakan untuk seluruh fitur pelaksanaan magang (logbook, mentorship, penilaian), menggunakan `INTERNSHIP_API_BASE_URL`.
- **Zod Runtime Validation** — `apiClient` kini mendukung validasi skema Zod opsional pada setiap response.
- **`iget/ipost/iput/idel`** — dipertahankan sebagai alias ke `internshipClient.*` untuk backward compatibility, namun sudah deprecated.

### 3. Penyatuan Base URL (Konfirmasi Tim Backend)
Berdasarkan konfirmasi bahwa backend adalah **Monolith** (satu worker, port 8789):
- `INTERNSHIP_API_BASE_URL` diarahkan ke `API_BASE_URL` secara default (fallback).
31: 
32: ### 4. Audit Responsivitas Global (v2.4)
33: Seluruh halaman pada fase **pelaksanaan magang** telah dioptimalkan untuk semua ukuran layar:
34: - **Mobile & Tablet**: Penambahan `overflow-x-auto` pada seluruh tabel (Logbook, Monitoring, Persetujuan Mentor) agar tidak merusak layout.
35: - **Layout Grid**: Optimasi grid menggunakan prefix Tailwind (`sm:`, `md:`, `lg:`) pada dashboard dan halaman penilaian.
36: - **UI/UX**: Penyelarasan padding dan font-size untuk keterbacaan yang lebih baik di perangkat mobile.
37: 
38: ### 5. Sinkronisasi Modul Mentorship & Approval (v2.4)
39: - **Request Mentor**: Migrasi `FieldMentorPage` ke endpoint `POST /api/mentorship/requests` dengan state pemuatan riil.
40: - **Persetujuan Dosen PA**: Refactoring `RegisterApprovalPage` dan `register-approval-api.ts` menggunakan `internshipClient` untuk menyelaraskan dengan domain *mentorship*.
41: - **Logbook Monitoring**: Perbaikan tabel monitoring dosen agar mendukung tampilan responsif.
- `VITE_API_INTERNSHIP_URL` dihapus dari `.env` — cukup gunakan `VITE_SIKP_API_BASE_URL=http://localhost:8789`.
- Tidak ada lagi URL produksi hardcoded di kode.

### 4. Penyelarasan Fitur Logbook
- **Upload Foto**: `uploadLogbookPhoto` menggunakan `internshipClient.upload` → `POST /api/logbooks/:id/photo`.
- **Field Name**: Pengiriman file menggunakan field **`file`** sesuai middleware `validateFileUpload` backend (bukan `photo`).
- **Type**: Menambahkan `photoUrl` pada interface `LogbookEntry`.
- **Auto-context**: `internshipId` tidak perlu dikirim manual — backend mendeteksi dari session JWT.

### 5. Refactor Modul Mentorship (Pembimbing Lapangan)
- Semua endpoint `iget/ipost/iput` diganti ke `internshipClient.get/post/put`.
- `approveAllLogbooks` diperbarui ke endpoint yang benar: `/api/mentorship/mentees/:id/approve-all`.
- `getStudentAssessment` dan `updateAssessment` mengarah ke `/api/mentorship/assessments`.
- **Baru**: `uploadMentorSignature(file)` ditambahkan → `POST /api/mentorship/profile/signature`, field **`file`** (Max 2MB, JPEG/PNG).

### 6. Refactor Monitoring Dosen
- `logbook-monitor-api.ts` menggunakan `sikpClient.request` (sebelumnya `apiClient` legacy).
- Endpoint: `/api/internship-monitoring/logbook` (single endpoint, tidak ada fallback legacy lagi).

### 7. Pembersihan Kode Legacy
- Seluruh referensi ke `/api/mahasiswa/*`, `/api/mentor/*`, `/api/dosen/*` telah dihapus dari service layer.
- `handleLegacyAuthCutover` dan `_baseUrl` custom option dihapus dari `apiClient`.
- `getStudentAssessment` tidak lagi memiliki fallback ke endpoint lama.

### 8. Sinkronisasi Struktur Response
- Seluruh response menggunakan pola `{ success: boolean, message: string, data: T | null }`.
- Penanganan error konsisten melalui `getErrorMessage` dan `handleUnauthorized` terpusat.

### 9. 📸 Fitur Foto Kegiatan Logbook
Menambahkan dukungan foto kegiatan pada halaman logbook — **opsional saat input**, dan **read-only saat ditampilkan ke mentor/dosen**.

#### Sisi Mahasiswa (Input Opsional)
- File picker foto opsional pada form tambah & edit logbook (validasi klien: max 2MB, JPEG/PNG/WebP).
- Kolom "Foto" di tabel logbook: thumbnail yang bisa diklik (buka fullscreen) jika ada, tombol upload langsung dari baris tabel jika belum ada.
- Upload memanggil `POST /api/logbooks/:id/photo` dengan field `file`.
- URL foto dari backend (`/api/assets/r2/...`) digunakan langsung sebagai `src` — sudah berupa Proxy URL.

#### Sisi Mentor & Dosen Pembimbing (Read-Only)
- Halaman **detail logbook mentor** (`field-mentor/pages/student-logbook-detail-page.tsx`): kolom Foto baru, thumbnail jika ada, `—` jika tidak ada. Tidak ada kontrol upload/delete.
- Halaman **monitoring logbook dosen** (`dosen-grading/pages/dosen-logbook-monitor-detail-page.tsx`): kolom Foto baru, thumbnail jika ada, ikon kamera abu-abu jika tidak ada.

#### File yang Diubah
| File | Perubahan |
| :--- | :--- |
| `logbook-api.ts` | Sudah ada `uploadLogbookPhoto` (field `file`) |
| `logbook-page.tsx` | Photo state, handler, picker UI, kolom Foto di tabel |
| `student-logbook-detail-page.tsx` | Kolom Foto read-only di tabel mentor |
| `dosen-logbook-monitor-detail-page.tsx` | Kolom Foto read-only di tabel monitoring dosen |

---

## 🛠️ Mapping Service yang Diperbarui

| File Service | Client Digunakan | Cakupan Perubahan |
| :--- | :--- | :--- |
| `app/lib/api-client.ts` | — (core) | Factory pattern, Zod validation, dual client instances |
| `logbook-api.ts` | `internshipClient` | CRUD Logbook, Statistik, Upload Foto |
| `student-api.ts` | `internshipClient` + `sikpClient` | Info Magang Aktif, Profil Mahasiswa |
| `mentor-api.ts` | `internshipClient` | Profil Mentor, Mentees, Verifikasi, Penilaian, Upload Signature |
| `logbook-monitor-api.ts` | `sikpClient` | Monitoring Dosen (Staff) |

---

## 📈 Status Integrasi

| Aspek | Status |
| :--- | :--- |
| Endpoint Sync | 🟢 100% — Matching Backend v1.0 |
| API Client Pattern | 🟢 Sinkron dengan `main` (`createApiClient` factory) |
| Type Safety | 🟢 Interface disesuaikan dengan OpenAPI & backend response |
| Legacy Route Removal | 🟢 Bebas dari `/api/mahasiswa/*`, `/api/mentor/*`, `/api/dosen/*` |
| Base URL Unification | 🟢 Monolith — satu port (8789) untuk semua layanan |
| Merge Conflict Resolution | 🟢 Diselesaikan — mengikuti `main` sebagai rujukan utama |
| Fitur Foto Logbook | 🟢 Selesai — upload mahasiswa + read-only mentor & dosen |

---

**Referensi Dokumentasi Backend:**
- `refactor_magang_summary.md`
- `PANDUAN_MIGRASI_FRONTEND.md`
- `openapi-magang.yaml`

**Versi:** v2.2 — Fitur Foto Logbook Selesai
**Versi:** v2.3 — Responsiveness & Bug Fixes (Functional Data Loading)

---

## 📋 TODO — Pekerjaan Selanjutnya

### 1. 🧪 Testing & QA
- [ ] E2E Testing untuk alur lengkap: *Student Request Mentor -> Dosen PA Approve -> Student Logbook -> Mentor Verify*.
- [ ] Validasi integrasi Cloudflare R2 untuk upload foto logbook di lingkungan staging.

### 2. 🚀 Persiapan Produksi
- [ ] Final build audit untuk memastikan tidak ada dead code dari legacy services.
- [ ] Update dokumentasi `deployment_guide.md` jika ada perubahan pada environment variables.

---

**Versi:** v2.5 — Migration & Responsiveness Audit Complete
