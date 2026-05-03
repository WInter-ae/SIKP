# 🚨 Panduan Migrasi API: Internship Module (Refactor v1.4)

Dokumen ini ditujukan untuk **Tim Frontend** guna menyelaraskan integrasi setelah dilakukannya refactor besar-besaran pada backend (Big-Bang SSO Cutover).

## 1. Perubahan Fundamental
Backend telah beralih dari **Identity-Based Routes** ke **Domain-Based Routes**.

- **DULU**: Rute dikelompokkan berdasarkan siapa yang memanggil (`/api/mahasiswa/...`, `/api/dosen/...`).
- **SEKARANG**: Rute dikelompokkan berdasarkan fitur (`/api/logbooks/...`, `/api/internships/...`).

> [!IMPORTANT]
> Seluruh rute lama di bawah `/api/mahasiswa`, `/api/dosen`, dan `/api/admin` sekarang akan mengembalikan HTTP Status **410 Gone**. Rute-rute tersebut **tidak lagi tersedia**.

---

## 1.1 Fitur Siap Integrasi (Ready for Manual Testing)
Fitur-fitur berikut sudah diimplementasikan di backend dan siap dihubungkan ke frontend:
- **Logbook & Foto**: CRUD logbook + upload foto kegiatan.
- **Mentorship**: Approval logbook, tanda tangan mentor, dan penilaian mentor.
- **Standard Flow Pelaporan**: Pengajuan judul, approval judul, dan upload laporan.
- **Fast Track Reporting**: Submit judul + laporan sekaligus dalam satu step.
- **Penilaian Akhir**: Kalkulasi grade gabungan dan download PDF Rekap Nilai Akhir.
- **Arsip**: Riwayat magang mahasiswa dan dashboard arsip admin.

---

## 2. HTTP Client yang Direkomendasikan

Gunakan `internshipClient` (bukan `iget`/`iput`/`ipost`) untuk semua endpoint modul magang dan mentorship. Pola ini sudah seragam dengan `main`.

```ts
// ✅ BENAR — gunakan internshipClient
const res = await internshipClient.get<LogbookEntry[]>("/api/logbooks");
const res = await internshipClient.post<LogbookEntry>("/api/logbooks", body);
const res = await internshipClient.put<LogbookEntry>("/api/logbooks/:id", body);

// ❌ SALAH — jangan gunakan helper lama
const res = await iget<LogbookEntry[]>("/api/logbooks");
const res = await ipost<LogbookEntry>("/api/logbooks", body);
```

---

## 3. Pemetaan Rute Baru (Mapping Table)

Silakan perbarui seluruh URL fetch di frontend mengikuti tabel di bawah ini:

### A. Fitur Logbook (Mahasiswa)
| Fitur | Method | Rute LAMA | Rute BARU |
| :--- | :--- | :--- | :--- |
| Get Daftar Logbook | GET | `/api/mahasiswa/logbook` | `/api/logbooks` |
| Get Statistik Jam | GET | `/api/mahasiswa/logbook/stats` | `/api/logbooks/stats` |
| Create Logbook | POST | `/api/mahasiswa/logbook` | `/api/logbooks` |
| Get Detail Logbook | GET | `/api/mahasiswa/logbook/:id` | `/api/logbooks/:id` |
| Update Logbook | PUT | `/api/mahasiswa/logbook/:id` | `/api/logbooks/:id` |
| Delete Logbook | DELETE | `/api/mahasiswa/logbook/:id` | `/api/logbooks/:id` |
| Submit Logbook | POST | `/api/mahasiswa/logbook/:id/submit` | `/api/logbooks/:id/submit` |
| Upload Foto Kegiatan | POST | *(Endpoint Baru)* | `/api/logbooks/:id/photo` |

### B. Fitur Mentorship (Pembimbing Lapangan)
| Fitur | Method | Rute LAMA | Rute BARU |
| :--- | :--- | :--- | :--- |
| Profil Mentor | GET | `/api/mentor/profile` | `/api/mentorship/profile` |
| Upload Tanda Tangan Mentor | POST | *(Endpoint Baru)* | `/api/mentorship/profile/signature` |
| Daftar Mahasiswa (Mentees) | GET | `/api/mentor/mentees` | `/api/mentorship/mentees` |
| Detail Mahasiswa | GET | `/api/mentor/mentees/:id` | `/api/mentorship/mentees/:studentId` |
| Lihat Logbook Mahasiswa | GET | `/api/mentor/logbook/:studentId` | `/api/mentorship/mentees/:studentId/logbooks` |
| Approve Logbook | POST | `/api/mentor/verify/:id` | `/api/mentorship/logbooks/:id/approve` |
| Tolak Logbook | POST | `/api/mentor/reject/:id` | `/api/mentorship/logbooks/:id/reject` |
| Approve Semua Logbook | POST | `/api/mentor/logbook/:id/approve-all` | `/api/mentorship/mentees/:studentId/approve-all` |
| Beri Penilaian | POST | `/api/mentor/assessment` | `/api/mentorship/assessments` |
| Lihat Penilaian | GET | `/api/mentor/assessment/:id` | `/api/mentorship/assessments/:studentId` |
| Update Penilaian | PUT | `/api/mentor/assessment/:id` | `/api/mentorship/assessments/:assessmentId` |

> [!WARNING]
> Perhatikan URL `/approve-all` — rute lama (`/api/mentor/logbook/:id/approve-all`) **salah** dan sudah tidak ada. Rute yang benar adalah `/api/mentorship/mentees/:studentId/approve-all`.

### C. Fitur Monitoring (Dosen Pembimbing)
| Fitur | Method | Rute LAMA | Rute BARU |
| :--- | :--- | :--- | :--- |
| Daftar Mentees (Progres) | GET | `/api/dosen/internship/list` | `/api/internship-monitoring/mentees` |
| Detail Logbook Mentee | GET | `/api/dosen/internship/logbook/:id` | `/api/internship-monitoring/mentees/:studentId/logbooks` |
| Cek Mentees Inaktif | GET | *(Baru)* | `/api/internship-monitoring/inactive` |

### D. Fitur Pelaksanaan Magang (Mahasiswa)
| Fitur | Method | Rute LAMA | Rute BARU |
| :--- | :--- | :--- | :--- |
| Info Magang Aktif | GET | `/api/mahasiswa/internship` | `/api/internships` |

> [!IMPORTANT]
> Rute info magang adalah **`GET /api/internships`** (tanpa suffix `/active`). Endpoint ini sudah mengembalikan data magang aktif milik mahasiswa yang sedang login.

### E. Fitur Pelaporan & Penilaian (Mahasiswa & Dosen)
| Fitur | Method | Rute LAMA | Rute BARU |
| :--- | :--- | :--- | :--- |
| **PENGELOLAAN JUDUL** | | | |
| Ajukan Judul (Standard) | POST | *(Baru)* | `/api/reporting/title` |
| Cek Status Judul | GET | `/api/mahasiswa/internship/title` | `/api/reporting/title/:internshipId` |
| Approve Judul (Dosen) | POST | `/api/dosen/internship/approve-title` | `/api/reporting/title/:id/approve` |
| Tolak Judul (Dosen) | POST | `/api/dosen/internship/reject-title` | `/api/reporting/title/:id/reject` |
| **UPLOAD LAPORAN** | | | |
| Submit Judul + Laporan (Fast) | POST | `/api/mahasiswa/internship/submit` | `/api/reporting/submit-fast` |
| Submit Laporan (Standard) | POST | *(Baru)* | `/api/reporting/report` |
| Cek Data Laporan | GET | `/api/mahasiswa/internship/report` | `/api/reporting/report/:internshipId` |
| **PENILAIAN AKHIR** | | | |
| Beri Nilai Laporan (Dosen) | POST | `/api/dosen/internship/score` | `/api/reporting/score-fast` |
| Lihat Rekap Nilai | GET | *(Baru)* | `/api/penilaian/recap/:internshipId` |
| Cetak/Download PDF Nilai | GET | *(Baru)* | `/api/penilaian/print/:internshipId` |
| Ambil Kriteria Nilai | GET | `/api/penilaian/kriteria` | `/api/penilaian/kriteria` |

### F. Fitur Arsip & Riwayat (Mahasiswa & Admin)
| Fitur | Method | Rute LAMA | Rute BARU |
| :--- | :--- | :--- | :--- |
| Riwayat Magang (Student) | GET | `/api/mahasiswa/history` | `/api/archive/student` |
| Daftar Magang Selesai (Admin) | GET | `/api/admin/internship/finished` | `/api/archive/admin/internships` |
| Daftar Pengajuan Selesai (Admin) | GET | `/api/admin/submission/history` | `/api/archive/admin/submissions` |
| Arsipkan Manual (Admin) | POST | *(Baru)* | `/api/archive/internship/:id` |

### G. Endpoint Pengajuan Mentor Lapangan (Mahasiswa)
| Fitur | Method | Rute |
| :--- | :--- | :--- |
| Ajukan Pembimbing Lapangan | POST | `/api/mentorship/requests` |

---

## 4. Perubahan Struktur Response (Penting!)

Backend sekarang menggunakan pola **Clean Response**. Pastikan pengecekan status di frontend lebih ketat.

### Contoh Response Sukses (200 OK)
```json
{
  "success": true,
  "data": { "...": "hasil data" }
}
```

### Contoh Response Error (400, 403, 404, 500)
```json
{
  "success": false,
  "message": "Pesan error yang user-friendly"
}
```

---

## 5. Validasi & Upload File

### Foto Kegiatan Logbook (`POST /api/logbooks/:id/photo`)
- **Field name**: `file`
- **Max Size**: 2MB
- **Allowed Types**: `image/jpeg`, `image/png`, `image/webp`
- **Error Code**: `400 Bad Request` jika tidak memenuhi syarat

### Tanda Tangan Mentor (`POST /api/mentorship/profile/signature`)
- **Field name**: `file`
- **Max Size**: 2MB
- **Allowed Types**: `image/jpeg`, `image/png`
- **Error Code**: `400 Bad Request` jika format file tidak valid

> [!TIP]
> URL foto/tanda tangan yang dikembalikan backend sudah merupakan **Proxy URL** internal (`/api/assets/r2/...`), bukan URL R2 publik langsung. Cukup gunakan URL tersebut sebagai `src` pada `<img>` tag.

---

## 6. Tanya Jawab (FAQ) - Tim Frontend

**Q: HTTP Client mana yang harus dipakai untuk endpoint magang?**
**A**: Gunakan `internshipClient` (bukan `iget`/`iput`/`ipost`). Pastikan client ini sudah dikonfigurasi dengan `baseURL` yang mengarah ke backend magang.

**Q: Konfirmasi Port Lokal?**
**A**: Ya, benar. Worker backend berjalan di port **8789** saat development lokal (`wrangler dev`).

**Q: Apakah rute akan digabung di belakang API Gateway?**
**A**: Seluruh rute (`/api/auth`, `/api/logbooks`, `/api/mentorship`, dll) saat ini sudah berada dalam **satu worker (Monolith)**. Cukup satu variabel `VITE_API_BASE_URL=http://localhost:8789`.

**Q: Bagaimana dengan konfigurasi CORS?**
**A**: Backend sudah dikonfigurasi untuk menerima request dari semua origin (`*`) di lingkungan dev, termasuk port frontend Anda.

**Q: Apa URL Production-nya?**
**A**: URL Production resmi adalah `https://backend-sikp.backend-sikp.workers.dev`.

## 7. Checklist Audit Integrasi (PENTING)

Berdasarkan audit terakhir, beberapa fitur frontend masih bersifat **Mock/Disconnected**. Tim Frontend **WAJIB** melakukan update pada bagian berikut:

### 1. Pelaporan Mahasiswa (`KPReportPage`)
- [ ] **Ganti Mock Handler**: `handleTitleSubmit` dan `handleReportUpload` harus memanggil API asli, bukan sekadar menampilkan toast sukses.
- [ ] **Update Endpoint**: Pastikan `reporting-api.ts` menggunakan prefix `/api/reporting/...` (bukan `/api/report/...`).
- [ ] **Status Mapping**: Mapping status dari backend (`APPROVED`, `SUBMITTED`) ke UI harus konsisten (lowercase vs uppercase).

### 2. Verifikasi Judul Dosen (`LecturerTitleVerificationPage`)
- [ ] **Hapus Fallback Legacy**: Hapus rute lama seperti `/api/dosen/kp/verifikasi-judul` di `title-verification-api.ts`.
- [ ] **Gunakan Endpoint Baru**: Gunakan `POST /api/reporting/title/:id/approve` untuk persetujuan judul.

### 3. Penilaian Dosen (`GiveGradePage`)
- [ ] **Hapus LocalStorage**: Fitur penilaian **TIDAK BOLEH** menyimpan hasil nilai ke `localStorage`. 
- [ ] **Integrasi API**: Gunakan `POST /api/reporting/score-fast` untuk mengirimkan nilai akhir (70%) ke backend.
- [ ] **Hapus Mock Data**: Hapus penggunaan `MOCK_STUDENTS_FOR_GRADING` dan gunakan data asli dari `GET /api/internship-monitoring/mentees`.
- [ ] **UI Penilaian & Laporan**: Implementasikan tampilan **Split-Screen** atau **Side-by-Side**. Dosen harus bisa membaca file laporan (PDF Viewer) sambil mengisi form nilai di layar yang sama agar alur Fast Track efisien.

### 4. Modul Arsip
- [ ] **Data Mapping**: Gunakan field `finalGrade` untuk menampilkan huruf nilai (A/B/C/D).
- [ ] **Response Format**: Endpoint `/api/archive/student` sekarang mengembalikan **Array langsung** (bukan object `{ internships: [] }`). Pastikan `.filter()` dipanggil langsung pada `res.data`.

---

**Kontak Backend**: Tim Lead Backend.
**Status Dokumentasi**: v1.4.1 — Added Integration Audit Checklist.
