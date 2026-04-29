# 🚨 Panduan Migrasi API: Internship Module (Refactor v1.2)

Dokumen ini ditujukan untuk **Tim Frontend** guna menyelaraskan integrasi setelah dilakukannya refactor besar-besaran pada backend (Big-Bang SSO Cutover).

## 1. Perubahan Fundamental
Backend telah beralih dari **Identity-Based Routes** ke **Domain-Based Routes**.

- **DULU**: Rute dikelompokkan berdasarkan siapa yang memanggil (`/api/mahasiswa/...`, `/api/dosen/...`).
- **SEKARANG**: Rute dikelompokkan berdasarkan fitur (`/api/logbooks/...`, `/api/internships/...`).

> [!IMPORTANT]
> Seluruh rute lama di bawah `/api/mahasiswa`, `/api/dosen`, dan `/api/admin` sekarang akan mengembalikan HTTP Status **410 Gone**. Rute-rute tersebut **tidak lagi tersedia**.

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

### C. Fitur Pelaksanaan Magang (Mahasiswa)
| Fitur | Method | Rute LAMA | Rute BARU |
| :--- | :--- | :--- | :--- |
| Info Magang Aktif | GET | `/api/mahasiswa/internship` | `/api/internships` |

> [!IMPORTANT]
> Rute info magang adalah **`GET /api/internships`** (tanpa suffix `/active`). Endpoint ini sudah mengembalikan data magang aktif milik mahasiswa yang sedang login.

### D. Endpoint Pengajuan Mentor Lapangan (Mahasiswa)
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

---

**Kontak Backend**: Tim Lead Backend.
**Status Dokumentasi**: v1.2 — Updated Route Mapping, HTTP Client Guide & File Upload Docs.
