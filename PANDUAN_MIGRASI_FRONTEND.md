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
| **VERIFIKASI MENTOR (Dosen PA / Staff)** | | | |
| Lihat Daftar Pengajuan | GET | `/api/admin/mentorship/requests` | `/api/mentorship/requests` |
| Approve Pengajuan | POST | `/api/admin/mentorship/approve` | `/api/mentorship/requests/:id/approve` |
| Tolak Pengajuan | POST | `/api/admin/mentorship/reject` | `/api/mentorship/requests/:id/reject` |

### C. Fitur Monitoring & Verifikasi (Dosen PA / Pembimbing)
| Fitur | Method | Rute LAMA | Rute BARU |
| :--- | :--- | :--- | :--- |
| Daftar Mentees (Progres) | GET | `/api/dosen/internship/list` | `/api/internship-monitoring/mentees` |
| Detail Logbook Mentee | GET | `/api/dosen/internship/logbook/:id` | `/api/internship-monitoring/mentees/:studentId/logbooks` |
| Cek Mentees Inaktif | GET | *(Baru)* | `/api/internship-monitoring/inactive` |
| **Logbook Monitor (Global)** | GET | *(Baru)* | `/api/mentorship/logbook-monitor` |

### D. Fitur Pelaksanaan Magang (Mahasiswa)
| Fitur | Method | Rute LAMA | Rute BARU |
| :--- | :--- | :--- | :--- |
| Info Magang Aktif | GET | `/api/mahasiswa/internship` | `/api/internships` |

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

Backend sekarang menggunakan pola **Clean Response**. Seluruh response sukses maupun error sudah seragam.

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

### Tanda Tangan Mentor (`POST /api/mentorship/profile/signature`)
- **Field name**: `file`
- **Max Size**: 2MB
- **Allowed Types**: `image/jpeg`, `image/png`

> [!TIP]
> URL foto/tanda tangan yang dikembalikan backend sudah merupakan **Proxy URL** internal (`/api/assets/r2/...`). Cukup gunakan URL tersebut sebagai `src` pada `<img>` tag.

---

## 6. Tanya Jawab (FAQ) - Tim Frontend

**Q: HTTP Client mana yang harus dipakai untuk endpoint magang?**
**A**: Gunakan `internshipClient` (bukan `iget`/`iput`/`ipost`).

**Q: Apakah rute akan digabung di belakang API Gateway?**
**A**: Seluruh rute saat ini sudah berada dalam **satu worker (Monolith)**. Cukup satu variabel `VITE_API_BASE_URL=http://localhost:8789`.

---

## 7. Checklist Audit Integrasi (v1.4.2)

### 1. Pelaporan Mahasiswa (`KPReportPage`)
- [ ] **Update Endpoint**: Pastikan menggunakan prefix `/api/reporting/...`.

### 2. Verifikasi Mentor (Dosen PA Dashboard)
- [ ] **Migrasi UI**: Pindahkan menu "Verifikasi Mentor" dari Admin ke Dashboard Dosen (untuk Dosen PA).
- [ ] **Alur Approval**: Gunakan `POST /api/mentorship/requests/:id/approve` tanpa payload `mentorProfileId`.
- [ ] **Detail Review**: Tampilkan Nama, Email, dan Instansi mentor yang diajukan mahasiswa.

### 3. Penilaian Dosen (`GiveGradePage`)
- [ ] **Integrasi API**: Gunakan `POST /api/reporting/score-fast`.
- [ ] **Split-Screen**: Implementasikan PDF Viewer laporan di samping form penilaian.

---

**Status Dokumentasi**: v1.4.2 — Migrated Mentor Approval to Dosen PA & Automated SSO Registration.
