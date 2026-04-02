# SIKP Backend — Frontend API Documentation

**Base URL:** `https://backend-sikp.mukarrobinujiantik.workers.dev`  
**Last Updated:** March 12, 2026

---

## Autentikasi

Semua endpoint yang membutuhkan autentikasi harus menyertakan header:

```
Authorization: Bearer <token>
```

Token didapat dari endpoint **POST /api/auth/login**.

---

## Roles

| Role | Deskripsi |
|---|---|
| `MAHASISWA` | Mahasiswa yang sedang atau akan KP |
| `PEMBIMBING_LAPANGAN` | Mentor dari perusahaan |
| `DOSEN` | Dosen pembimbing akademik |
| `ADMIN` / `KAPRODI` / `WAKIL_DEKAN` | Staf administrasi |

---

## Response Format (Semua Endpoint)

```json
{
  "success": true | false,
  "message": "Pesan deskriptif",
  "data": { ... } | null
}
```

---

# 1. Mahasiswa Endpoints

> **Auth:** Bearer Token + Role `MAHASISWA`  
> **Prefix:** `/api/mahasiswa`

---

## 1.1 GET /api/mahasiswa/profile

Ambil data profil mahasiswa yang sedang login.

**Response `200`:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "usr_abc123",
    "name": "Budi Santoso",
    "nim": "12250111234",
    "email": "budi@student.uin-suska.ac.id",
    "prodi": "Teknik Informatika",
    "fakultas": "Sains dan Teknologi",
    "angkatan": "2022",
    "semester": 6,
    "phone": "081234567890"
  }
}
```

---

## 1.2 PUT /api/mahasiswa/profile

Update data profil mahasiswa.

**Request Body (semua field opsional):**
```json
{
  "nama": "Budi Santoso",
  "phone": "081234567890",
  "prodi": "Teknik Informatika",
  "fakultas": "Sains dan Teknologi",
  "semester": 6,
  "angkatan": "2022"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "usr_abc123",
    "name": "Budi Santoso",
    "nim": "12250111234",
    "email": "budi@student.uin-suska.ac.id",
    "prodi": "Teknik Informatika",
    "fakultas": "Sains dan Teknologi",
    "angkatan": "2022",
    "semester": 6,
    "phone": "081234567890"
  }
}
```

---

## 1.3 GET /api/mahasiswa/internship

Ambil data lengkap internship mahasiswa (termasuk mentor & dosen pembimbing).

**Response `200`:**
```json
{
  "success": true,
  "message": "Internship data retrieved successfully",
  "data": {
    "student": {
      "id": "usr_abc123",
      "name": "Budi Santoso",
      "nim": "12250111234",
      "email": "budi@student.uin-suska.ac.id",
      "prodi": "Teknik Informatika",
      "fakultas": "Sains dan Teknologi",
      "angkatan": "2022",
      "semester": 6
    },
    "submission": {
      "id": "sub_xyz",
      "teamId": "team_abc",
      "company": "PT. Contoh Teknologi",
      "companyAddress": "Jl. Contoh No. 1, Pekanbaru",
      "division": "Backend Development",
      "startDate": "2026-02-01",
      "endDate": "2026-04-30",
      "status": "APPROVED",
      "submittedAt": "2026-01-20T10:00:00.000Z",
      "approvedAt": "2026-01-25T09:00:00.000Z",
      "approvedBy": "usr_admin1"
    },
    "internship": {
      "id": "int_001",
      "status": "AKTIF",
      "studentId": "usr_abc123",
      "submissionId": "sub_xyz",
      "mentorId": "usr_mentor1",
      "supervisorId": "usr_dosen1",
      "startDate": "2026-02-01",
      "endDate": "2026-04-30",
      "createdAt": "2026-01-26T00:00:00.000Z",
      "updatedAt": "2026-01-26T00:00:00.000Z"
    },
    "mentor": {
      "id": "usr_mentor1",
      "name": "Andi Wijaya",
      "email": "andi@contoh.co.id",
      "company": "PT. Contoh Teknologi",
      "position": "Senior Engineer",
      "phone": "082345678901",
      "signature": "data:image/png;base64,iVBORw0KGgo..." 
    },
    "lecturer": {
      "id": "usr_dosen1",
      "name": "Dr. Siti Rahayu",
      "email": "siti@uin-suska.ac.id",
      "nip": "197501012005012001",
      "phone": "083456789012",
      "jabatan": "Lektor Kepala"
    }
  }
}
```

> `mentor` dan `lecturer` bisa `null` jika belum ditugaskan.

**Response `404`:** Tidak ada internship aktif.

---

# 2. Logbook Endpoints

> **Auth:** Bearer Token + Role `MAHASISWA`  
> **Prefix:** `/api/mahasiswa/logbook`

Status logbook: `PENDING` → (submit) → `PENDING` → (mentor) → `APPROVED` atau `REJECTED`

---

## 2.1 POST /api/mahasiswa/logbook

Buat entri logbook baru.

**Request Body:**
```json
{
  "date": "2026-03-12",
  "activity": "Implementasi fitur login",
  "description": "Membuat halaman login menggunakan React dan mengintegrasikan dengan API backend",
  "hours": 8
}
```

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `date` | string (YYYY-MM-DD) | ✅ | |
| `activity` | string (max 255) | ✅ | Judul singkat aktivitas |
| `description` | string | ✅ | Deskripsi detail |
| `hours` | integer | ❌ | Jumlah jam kerja |

**Response `201`:**
```json
{
  "success": true,
  "message": "Logbook entry created successfully",
  "data": {
    "id": "log_abc123",
    "internshipId": "int_001",
    "date": "2026-03-12",
    "activity": "Implementasi fitur login",
    "description": "Membuat halaman login...",
    "hours": 8,
    "status": "PENDING",
    "rejectionReason": null,
    "verifiedBy": null,
    "verifiedAt": null,
    "createdAt": "2026-03-12T08:00:00.000Z",
    "updatedAt": "2026-03-12T08:00:00.000Z"
  }
}
```

**Response `422`:** Tidak ada internship aktif.

---

## 2.2 GET /api/mahasiswa/logbook

Ambil semua entri logbook untuk internship aktif mahasiswa.

**Response `200`:**
```json
{
  "success": true,
  "message": "Logbook entries retrieved successfully",
  "data": {
    "internshipId": "int_001",
    "entries": [
      {
        "id": "log_abc123",
        "internshipId": "int_001",
        "date": "2026-03-12",
        "activity": "Implementasi fitur login",
        "description": "...",
        "hours": 8,
        "status": "APPROVED",
        "rejectionReason": null,
        "verifiedBy": "usr_mentor1",
        "verifiedAt": "2026-03-13T10:00:00.000Z",
        "createdAt": "2026-03-12T08:00:00.000Z",
        "updatedAt": "2026-03-13T10:00:00.000Z"
      }
    ]
  }
}
```

---

## 2.3 GET /api/mahasiswa/logbook/stats

Ambil statistik logbook untuk internship aktif.

**Response `200`:**
```json
{
  "success": true,
  "message": "Logbook stats retrieved successfully",
  "data": {
    "internshipId": "int_001",
    "total": 30,
    "approved": 20,
    "pending": 8,
    "rejected": 2,
    "totalHours": 240,
    "approvedHours": 160
  }
}
```

---

## 2.4 GET /api/mahasiswa/logbook/:id

Ambil satu entri logbook berdasarkan ID.

**Response `200`:** Data logbook entry (format sama seperti di 2.1)  
**Response `404`:** Entry tidak ditemukan atau bukan milik mahasiswa ini.

---

## 2.5 PUT /api/mahasiswa/logbook/:id

Update entri logbook. **Hanya bisa diubah jika status `PENDING`.**

**Request Body (semua opsional):**
```json
{
  "date": "2026-03-12",
  "activity": "Implementasi fitur login - revisi",
  "description": "Deskripsi yang diperbarui",
  "hours": 7
}
```

**Response `200`:** Data logbook yang sudah diupdate.  
**Response `404`:** Entry tidak ditemukan.  
**Response `422`:** Entry berstatus `APPROVED` atau `REJECTED`, tidak bisa diubah.

---

## 2.6 DELETE /api/mahasiswa/logbook/:id

Hapus entri logbook. **Hanya bisa dihapus jika status `PENDING`.**

**Response `200`:**
```json
{
  "success": true,
  "message": "Logbook entry deleted successfully"
}
```

**Response `404`:** Entry tidak ditemukan.  
**Response `422`:** Entry sudah `APPROVED`/`REJECTED`.

---

## 2.7 POST /api/mahasiswa/logbook/:id/submit

Submit logbook untuk direview mentor. Entry harus berstatus `PENDING`.

**Response `200`:**
```json
{
  "success": true,
  "message": "Logbook entry submitted for review",
  "data": { ... }
}
```

**Response `404`:** Entry tidak ditemukan.  
**Response `422`:** Status bukan `PENDING`.

---

# 3. Mentor Endpoints

> **Auth:** Bearer Token + Role `PEMBIMBING_LAPANGAN`  
> **Prefix:** `/api/mentor`

---

## 3.1 GET /api/mentor/profile

Ambil profil mentor.

**Response `200`:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "usr_mentor1",
    "nama": "Andi Wijaya",
    "email": "andi@contoh.co.id",
    "phone": "082345678901",
    "companyName": "PT. Contoh Teknologi",
    "position": "Senior Engineer",
    "companyAddress": "Jl. Contoh No. 1, Pekanbaru",
    "signature": "data:image/png;base64,...",
    "signatureSetAt": "2026-02-01T10:00:00.000Z"
  }
}
```

`signature` bernilai `null` jika belum pernah diisi.

---

## 3.2 PUT /api/mentor/profile

Update profil mentor.

**Request Body (semua opsional):**
```json
{
  "nama": "Andi Wijaya",
  "phone": "082345678901",
  "companyName": "PT. Contoh Teknologi",
  "position": "Senior Software Engineer",
  "companyAddress": "Jl. Contoh No. 1, Pekanbaru"
}
```

**Response `200`:** Data profil yang sudah diupdate.

---

## 3.3 GET /api/mentor/signature

Ambil data tanda tangan mentor.

**Response `200`:**
```json
{
  "success": true,
  "message": "Signature data retrieved",
  "data": {
    "signature": "data:image/png;base64,iVBORw0KGgo...",
    "signatureSetAt": "2026-02-01T10:00:00.000Z"
  }
}
```

`signature` bernilai `null` jika belum ada.

---

## 3.4 PUT /api/mentor/signature

Upload/update tanda tangan mentor. Signature harus berupa **Base64 Data URL**.

**Request Body:**
```json
{
  "signature": "data:image/png;base64,iVBORw0KGgo..."
}
```

> Format yang diterima: `data:image/png;base64,...` atau `data:image/jpeg;base64,...`

**Response `200`:**
```json
{
  "success": true,
  "message": "Signature updated successfully",
  "data": {
    "signature": "data:image/png;base64,...",
    "signatureSetAt": "2026-03-12T09:00:00.000Z"
  }
}
```

**Response `400`:** Format Base64 tidak valid.

---

## 3.5 POST /api/mentor/signature/delete

Hapus tanda tangan mentor.

**Response `200`:**
```json
{
  "success": true,
  "message": "Signature deleted successfully"
}
```

---

## 3.6 GET /api/mentor/mentees

Ambil daftar semua mahasiswa bimbingan mentor ini.

**Response `200`:**
```json
{
  "success": true,
  "message": "Mentees retrieved successfully",
  "data": [
    {
      "internshipId": "int_001",
      "internshipStatus": "AKTIF",
      "internshipStartDate": "2026-02-01",
      "internshipEndDate": "2026-04-30",
      "companyName": "PT. Contoh Teknologi",
      "division": "Backend Development",
      "nim": "12250111234",
      "fakultas": "Sains dan Teknologi",
      "prodi": "Teknik Informatika",
      "semester": 6,
      "angkatan": "2022",
      "userId": "usr_abc123",
      "nama": "Budi Santoso",
      "email": "budi@student.uin-suska.ac.id",
      "phone": "081234567890"
    }
  ]
}
```

---

## 3.7 GET /api/mentor/mentees/:studentId

Ambil detail satu mahasiswa bimbingan berdasarkan **userId** mahasiswa.

**Path Param:** `studentId` = `userId` mahasiswa (bukan NIM)

**Response `200`:** Satu objek mentee (format sama seperti item di 3.6).  
**Response `404`:** Mahasiswa tidak ditemukan atau bukan bimbingan mentor ini.

---

## 3.8 GET /api/mentor/logbook/:studentId

Ambil semua logbook milik mahasiswa bimbingan.

**Path Param:** `studentId` = `userId` mahasiswa

**Response `200`:**
```json
{
  "success": true,
  "message": "Student logbooks retrieved successfully",
  "data": {
    "internshipId": "int_001",
    "entries": [
      {
        "id": "log_abc123",
        "date": "2026-03-12",
        "activity": "Implementasi fitur login",
        "description": "...",
        "hours": 8,
        "status": "PENDING",
        "rejectionReason": null,
        "verifiedBy": null,
        "verifiedAt": null,
        "createdAt": "2026-03-12T08:00:00.000Z",
        "updatedAt": "2026-03-12T08:00:00.000Z"
      }
    ]
  }
}
```

---

## 3.9 POST /api/mentor/logbook/:logbookId/approve

Setujui satu entri logbook.

**Path Param:** `logbookId` = ID dari entri logbook

**No Request Body Required.**

**Response `200`:**
```json
{
  "success": true,
  "message": "Logbook entry approved",
  "data": {
    "id": "log_abc123",
    "status": "APPROVED",
    "verifiedBy": "usr_mentor1",
    "verifiedAt": "2026-03-13T10:00:00.000Z",
    ...
  }
}
```

**Response `404`:** Logbook tidak ditemukan.  
**Response `403`:** Logbook bukan milik mahasiswa bimbingan mentor ini.

---

## 3.10 POST /api/mentor/logbook/:logbookId/reject

Tolak satu entri logbook dengan alasan.

**Request Body:**
```json
{
  "rejectionReason": "Deskripsi aktivitas kurang detail, mohon dilengkapi"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Logbook entry rejected",
  "data": {
    "id": "log_abc123",
    "status": "REJECTED",
    "rejectionReason": "Deskripsi aktivitas kurang detail, mohon dilengkapi",
    "verifiedBy": "usr_mentor1",
    "verifiedAt": "2026-03-13T10:00:00.000Z",
    ...
  }
}
```

**Response `400`:** `rejectionReason` wajib diisi.

---

## 3.11 POST /api/mentor/logbook/:studentId/approve-all

Setujui semua logbook berstatus `PENDING` milik mahasiswa bimbingan.

**Path Param:** `studentId` = `userId` mahasiswa

**No Request Body Required.**

**Response `200`:**
```json
{
  "success": true,
  "message": "All pending logbook entries approved",
  "data": {
    "message": "All pending logbook entries approved",
    "internshipId": "int_001"
  }
}
```

---

## 3.12 POST /api/mentor/assessment

Buat penilaian untuk mahasiswa bimbingan.

> ⚠️ Setiap mahasiswa hanya boleh dinilai **satu kali**. Gunakan PUT untuk mengubah nilai yang sudah ada.

**Request Body:**
```json
{
  "studentUserId": "usr_abc123",
  "kehadiran": 85,
  "kerjasama": 90,
  "sikapEtika": 88,
  "prestasiKerja": 82,
  "kreatifitas": 78,
  "feedback": "Mahasiswa menunjukkan performa yang baik selama KP"
}
```

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `studentUserId` | string | ✅ | userId mahasiswa |
| `kehadiran` | integer (0-100) | ✅ | Nilai kehadiran |
| `kerjasama` | integer (0-100) | ✅ | Nilai kerjasama |
| `sikapEtika` | integer (0-100) | ✅ | Nilai sikap & etika |
| `prestasiKerja` | integer (0-100) | ✅ | Nilai prestasi kerja |
| `kreatifitas` | integer (0-100) | ✅ | Nilai kreatifitas |
| `feedback` | string | ❌ | Catatan/komentar |

**Formula `totalScore`:**
```
totalScore = (kehadiran × 0.2) + (kerjasama × 0.3) + (sikapEtika × 0.2) + (prestasiKerja × 0.2) + (kreatifitas × 0.1)
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Assessment created successfully",
  "data": {
    "id": "asmnt_001",
    "internshipId": "int_001",
    "pembimbingLapanganId": "usr_mentor1",
    "kehadiran": 85,
    "kerjasama": 90,
    "sikapEtika": 88,
    "prestasiKerja": 82,
    "kreatifitas": 78,
    "totalScore": 86,
    "feedback": "Mahasiswa menunjukkan performa yang baik selama KP",
    "assessedAt": "2026-03-12T10:00:00.000Z",
    "createdAt": "2026-03-12T10:00:00.000Z",
    "updatedAt": "2026-03-12T10:00:00.000Z"
  }
}
```

**Response `404`:** Mahasiswa tidak ditemukan / bukan bimbingan mentor ini.  
**Response `409`:** Penilaian sudah ada untuk mahasiswa ini.  
**Response `400`:** Nilai di luar range 0-100.

---

## 3.13 GET /api/mentor/assessment/:studentId

Ambil penilaian milik satu mahasiswa bimbingan.

**Path Param:** `studentId` = `userId` mahasiswa

**Response `200`:** Data assessment (format sama seperti 3.12), atau `"data": null` jika belum ada penilaian.

---

## 3.14 PUT /api/mentor/assessment/:assessmentId

Update penilaian yang sudah ada.

**Path Param:** `assessmentId` = ID assessment (dari response 3.12)

**Request Body (semua opsional):**
```json
{
  "kehadiran": 90,
  "kerjasama": 92,
  "sikapEtika": 88,
  "prestasiKerja": 85,
  "kreatifitas": 80,
  "feedback": "Catatan yang diperbarui"
}
```

**Response `200`:** Data assessment yang sudah diupdate.  
**Response `404`:** Assessment tidak ditemukan.  
**Response `403`:** Assessment milik mentor lain.  
**Response `400`:** Nilai di luar range 0-100.

---

# 4. Penilaian Kriteria Endpoints

---

## 4.1 GET /api/penilaian/kriteria

Ambil daftar kriteria penilaian beserta bobot masing-masing. **Tidak memerlukan autentikasi.**

**Response `200`:**
```json
{
  "success": true,
  "message": "Penilaian kriteria retrieved successfully",
  "data": {
    "kriteria": [
      {
        "id": "kehadiran",
        "category": "kehadiran",
        "label": "Kehadiran",
        "description": "Tingkat kehadiran dan kedisiplinan mahasiswa selama KP",
        "weight": 20,
        "maxScore": 100
      },
      {
        "id": "kerjasama",
        "category": "kerjasama",
        "label": "Kerjasama",
        "description": "Kemampuan bekerja sama dalam tim dan lingkungan kerja",
        "weight": 30,
        "maxScore": 100
      },
      {
        "id": "sikap_etika",
        "category": "sikapEtika",
        "label": "Sikap & Etika",
        "description": "Sikap profesional dan etika kerja mahasiswa",
        "weight": 20,
        "maxScore": 100
      },
      {
        "id": "prestasi_kerja",
        "category": "prestasiKerja",
        "label": "Prestasi Kerja",
        "description": "Kualitas dan hasil pekerjaan yang diselesaikan",
        "weight": 20,
        "maxScore": 100
      },
      {
        "id": "kreatifitas",
        "category": "kreatifitas",
        "label": "Kreatifitas",
        "description": "Kreativitas dan inisiatif dalam menyelesaikan tugas",
        "weight": 10,
        "maxScore": 100
      }
    ],
    "totalWeight": 100,
    "note": "Weights reflect the scoring formula: totalScore = Σ(score × weight/100)"
  }
}
```

---

## 4.2 PUT /api/admin/penilaian/kriteria

Update kriteria penilaian. **Auth: Role `ADMIN`/`KAPRODI`/`WAKIL_DEKAN`.**

> ⚠️ Total `weight` dari semua kriteria **harus = 100**.

**Request Body:**
```json
{
  "kriteria": [
    { "category": "kehadiran",    "label": "Kehadiran",     "weight": 20, "maxScore": 100 },
    { "category": "kerjasama",    "label": "Kerjasama",     "weight": 30, "maxScore": 100 },
    { "category": "sikapEtika",   "label": "Sikap & Etika", "weight": 20, "maxScore": 100 },
    { "category": "prestasiKerja","label": "Prestasi Kerja","weight": 20, "maxScore": 100 },
    { "category": "kreatifitas",  "label": "Kreatifitas",   "weight": 10, "maxScore": 100 }
  ]
}
```

**Response `200`:** Kriteria yang dikirim (terkonfirmasi valid).  
**Response `400`:** Total weight ≠ 100, atau field wajib tidak lengkap.

---

# 5. Error Reference

| HTTP Status | Arti |
|---|---|
| `400` | Request tidak valid (field wajib kosong, format salah) |
| `401` | Token tidak ada atau tidak valid |
| `403` | Role tidak punya akses ke endpoint ini |
| `404` | Resource tidak ditemukan |
| `409` | Konflik (misal: assessment sudah ada) |
| `422` | Unprocessable (misal: internship tidak aktif, status logbook tidak bisa diubah) |
| `500` | Server error |

---

# 6. Catatan Implementasi Frontend

### Alur Logbook Mahasiswa

```
Mahasiswa buat logbook (POST)
  → status: PENDING
  → Mahasiswa submit (POST /:id/submit)
  → Mentor review → APPROVED / REJECTED
  → Jika REJECTED: mahasiswa tidak bisa edit (harus buat baru)
```

### Alur Penilaian Mentor

```
1. Mentor login (role: PEMBIMBING_LAPANGAN)
2. GET /api/mentor/mentees → lihat daftar mahasiswa
3. GET /api/mentor/logbook/:studentId → review logbook
4. POST /api/mentor/logbook/:logbookId/approve → approve satu-satu
   ATAU POST /api/mentor/logbook/:studentId/approve-all → approve semua
5. POST /api/mentor/assessment → beri nilai akhir
6. PUT /api/mentor/signature → upload TTD untuk sertifikat PDF
```

### studentId vs NIM

- Semua endpoint mentor menggunakan **`userId`** (bukan NIM) sebagai `studentId`.
- `userId` tersedia di response GET mentees pada field `userId`.

### Signature (Tanda Tangan)

- Format: **Base64 Data URL** → `data:image/png;base64,...`
- Digunakan untuk generate sertifikat/dokumen PDF penilaian.
- Konversi dari file di frontend:
  ```javascript
  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
  ```

### Total Score Calculation

```javascript
const totalScore = Math.round(
  kehadiran    * 0.2 +
  kerjasama    * 0.3 +
  sikapEtika   * 0.2 +
  prestasiKerja * 0.2 +
  kreatifitas  * 0.1
);
```

---

# 7. Ringkasan Endpoint Baru (Quick Reference)

| Method | Endpoint | Role | Keterangan |
|---|---|---|---|
| `PUT` | `/api/mahasiswa/profile` | MAHASISWA | Update profil |
| `POST` | `/api/mahasiswa/logbook` | MAHASISWA | Buat logbook |
| `GET` | `/api/mahasiswa/logbook` | MAHASISWA | List semua logbook |
| `GET` | `/api/mahasiswa/logbook/stats` | MAHASISWA | Statistik logbook |
| `GET` | `/api/mahasiswa/logbook/:id` | MAHASISWA | Detail satu logbook |
| `PUT` | `/api/mahasiswa/logbook/:id` | MAHASISWA | Update logbook |
| `DELETE` | `/api/mahasiswa/logbook/:id` | MAHASISWA | Hapus logbook |
| `POST` | `/api/mahasiswa/logbook/:id/submit` | MAHASISWA | Submit ke mentor |
| `GET` | `/api/mentor/profile` | PEMBIMBING_LAPANGAN | Profil mentor |
| `PUT` | `/api/mentor/profile` | PEMBIMBING_LAPANGAN | Update profil |
| `GET` | `/api/mentor/signature` | PEMBIMBING_LAPANGAN | Ambil TTD |
| `PUT` | `/api/mentor/signature` | PEMBIMBING_LAPANGAN | Upload TTD |
| `POST` | `/api/mentor/signature/delete` | PEMBIMBING_LAPANGAN | Hapus TTD |
| `GET` | `/api/mentor/mentees` | PEMBIMBING_LAPANGAN | Daftar mahasiswa |
| `GET` | `/api/mentor/mentees/:studentId` | PEMBIMBING_LAPANGAN | Detail mahasiswa |
| `GET` | `/api/mentor/logbook/:studentId` | PEMBIMBING_LAPANGAN | Logbook mahasiswa |
| `POST` | `/api/mentor/logbook/:logbookId/approve` | PEMBIMBING_LAPANGAN | Approve logbook |
| `POST` | `/api/mentor/logbook/:logbookId/reject` | PEMBIMBING_LAPANGAN | Reject logbook |
| `POST` | `/api/mentor/logbook/:studentId/approve-all` | PEMBIMBING_LAPANGAN | Approve semua |
| `POST` | `/api/mentor/assessment` | PEMBIMBING_LAPANGAN | Buat penilaian |
| `GET` | `/api/mentor/assessment/:studentId` | PEMBIMBING_LAPANGAN | Lihat penilaian |
| `PUT` | `/api/mentor/assessment/:assessmentId` | PEMBIMBING_LAPANGAN | Update penilaian |
| `GET` | `/api/penilaian/kriteria` | — (public) | Kriteria penilaian |
| `PUT` | `/api/admin/penilaian/kriteria` | ADMIN | Update kriteria |
