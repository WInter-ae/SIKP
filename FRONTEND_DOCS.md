# SIKP Frontend Documentation

Dokumentasi terpadu untuk proyek SIKP (Sistem Informasi Kerja Praktik) — frontend.

---

## Daftar Isi

1. [Tech Stack](#tech-stack)
2. [Struktur Proyek](#struktur-proyek)
3. [Autentikasi](#autentikasi)
4. [Backend & API](#backend--api)
5. [Modul: Saat Magang (During Intern)](#modul-saat-magang-during-intern)
6. [Integrasi Signature Mentor di PDF](#integrasi-signature-mentor-di-pdf)
7. [Troubleshooting](#troubleshooting)

---

## Tech Stack

| Teknologi | Keterangan |
|-----------|-----------|
| React Router v7 | Framework utama |
| React 19 | Runtime |
| TypeScript | Bahasa pemrograman |
| Tailwind CSS v4 | Styling |
| shadcn/ui + Radix UI | Komponen UI |
| Lucide React | Ikon |
| React Hook Form + Zod | Form handling |
| Better Auth | Autentikasi |
| pnpm | Package manager |

---

## Struktur Proyek

```
app/
├── assets/          # Aset statis (gambar, font)
├── components/      # Komponen global (header, footer, ui/)
├── contexts/        # Context providers (theme-context.tsx)
├── feature/         # Fitur aplikasi (modular)
│   ├── during-intern/   # Modul saat magang
│   ├── hearing/         # Modul sidang
│   ├── submission/      # Modul pengajuan
│   ├── template/        # Modul template dokumen
│   ├── dosen-grading/   # Modul penilaian dosen
│   └── ...
├── hooks/           # Custom hooks
├── lib/             # Utilities & config (api-client.ts, auth-client.ts)
├── routes/          # Route files (file-based routing)
├── app.css          # Global styles
├── root.tsx         # Root component
└── routes.ts        # Konfigurasi route
```

---

## Autentikasi

### Token Storage
Token JWT disimpan di `localStorage` dengan key:
```
auth_token
```

### Membaca Token
```typescript
const token = localStorage.getItem('auth_token');
```

### Auto-redirect saat 401
File `app/lib/api-client.ts` menangani respons 401 secara otomatis:
- Clear semua data di `localStorage`
- Redirect ke `/login?reason=unauthorized`

### Data User di localStorage
```
user_data  → data profil mahasiswa dari Better Auth
```

---

## Backend & API

### URL Backend

| Environment | URL |
|-------------|-----|
| Production  | `https://backend-sikp.backend-sikp.workers.dev` |
| Local (dev) | `http://localhost:8787` |

### Status Endpoint

| Endpoint | Method | Status | Keterangan |
|----------|--------|--------|------------|
| `/api/auth/sign-in` | POST | ✅ AKTIF | Login |
| `/api/auth/sign-up` | POST | ✅ AKTIF | Register |
| `/api/submissions/my-submissions` | GET | ✅ AKTIF | Data pengajuan mahasiswa |
| `/api/mahasiswa/profile` | GET | ⚠️ Perlu verify | Profil mahasiswa |
| `/api/mahasiswa/internship` | GET | ⚠️ Perlu verify | Data magang lengkap |
| `/api/mahasiswa/logbook` | GET/POST | ✅ AKTIF | Logbook entry |
| `/api/mahasiswa/logbook/:id` | GET/PUT/DELETE | ✅ AKTIF | Operasi logbook |
| `/api/mahasiswa/logbook/stats` | GET | ✅ AKTIF | Statistik logbook |

### GET /api/mahasiswa/internship

**Auth:** Required (Bearer JWT)

**Response (ketika berhasil):**
```json
{
  "success": true,
  "message": "Internship data retrieved successfully",
  "data": {
    "student": {
      "id": "uuid",
      "name": "string",
      "nim": "string",
      "email": "string",
      "prodi": "string",
      "fakultas": "string",
      "angkatan": "string",
      "semester": 6
    },
    "submission": {
      "id": "uuid",
      "teamId": "uuid",
      "teamName": "string",
      "companyName": "PT ABC Indonesia",
      "companyAddress": "string",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "status": "APPROVED",
      "approvedAt": "ISO8601"
    },
    "internship": {
      "id": "uuid",
      "status": "ACTIVE",
      "pembimbingLapanganId": 5,
      "pembimbingDosenId": 12,
      "createdAt": "ISO8601"
    },
    "mentor": {
      "id": 5,
      "name": "string",
      "email": "string",
      "company": "string",
      "position": "string",
      "phone": "string",
      "signature": "data:image/png;base64,..."
    },
    "lecturer": {
      "id": 12,
      "name": "string",
      "email": "string",
      "nip": "string",
      "phone": "string"
    }
  }
}
```

**Response (tidak ada magang aktif):**
```json
{
  "success": false,
  "message": "No active internship found for this student"
}
```

### GET /api/mahasiswa/profile

**Auth:** Required (Bearer JWT)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "string",
    "nim": "string",
    "email": "string",
    "prodi": "string",
    "fakultas": "string",
    "angkatan": "string",
    "semester": 6,
    "phone": "string",
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601"
  }
}
```

### Standard Error Responses

```json
// 401 Unauthorized
{ "success": false, "message": "Unauthorized: Invalid token" }

// 404 Not Found
{ "success": false, "message": "Student profile not found" }

// 500 Server Error
{ "success": false, "message": "Internal server error" }
```

---

## Modul: Saat Magang (During Intern)

**Direktori:** `app/feature/during-intern/`

```
during-intern/
├── components/       # Komponen UI modul ini
├── hooks/            # Custom hooks
├── pages/
│   └── logbook-page.tsx
├── services/
│   ├── student-api.ts   # API client untuk data mahasiswa/magang
│   └── logbook-api.ts   # API client untuk logbook
├── types/            # TypeScript interfaces
└── utils/
    ├── logbook-template.ts         # HTML template logbook PDF
    └── generate-logbook-docx.ts    # Generate file DOCX
```

### Mekanisme Fallback

`student-api.ts` menggunakan 3 lapis fallback untuk mengambil data:

```
Tier 1 → GET /api/mahasiswa/internship          (data lengkap dari backend)
         ↓ gagal
Tier 2 → GET /api/mahasiswa/profile
       + GET /api/submissions/my-submissions    (gabungkan 2 sumber)
         ↓ gagal
Tier 3 → localStorage user_data
       + GET /api/submissions/my-submissions    (fallback lokal)
```

### Field Mapping Backend → Frontend

| Backend Field | Frontend Field | Keterangan |
|---------------|----------------|------------|
| `companyName` | `company` | Nama perusahaan |
| `pembimbingLapanganId` | `mentorId` | ID mentor |
| `pembimbingDosenId` | `supervisorId` | ID dosen pembimbing |
| `mentor.signature` | `mentorSignature` | Base64 PNG untuk PDF |

### Interface TypeScript Utama

```typescript
// services/student-api.ts

interface BackendInternshipResponse {
  success: boolean;
  message?: string;
  data?: {
    student: BackendStudent;
    submission: BackendSubmission;
    internship: BackendInternship;
    mentor?: BackendMentor;
    lecturer?: BackendLecturer;
  };
}

interface BackendMentor {
  id: number;
  name: string;
  email: string;
  company: string;
  position: string;
  phone: string;
  signature?: string; // Base64 PNG — digunakan untuk PDF
}
```

### Logbook Endpoints

```
POST   /api/mahasiswa/logbook           Buat entry logbook baru
GET    /api/mahasiswa/logbook           Ambil semua logbook
GET    /api/mahasiswa/logbook/:id       Ambil satu logbook
PUT    /api/mahasiswa/logbook/:id       Edit logbook
DELETE /api/mahasiswa/logbook/:id       Hapus logbook (status PENDING saja)
GET    /api/mahasiswa/logbook/stats     Statistik logbook
```

---

## Integrasi Signature Mentor di PDF

Signature mentor (Base64 PNG) dari backend ditampilkan di generated PDF logbook.

### Alur Data

```
API /api/mahasiswa/internship
  └── data.mentor.signature (Base64)
        └── logbook-page.tsx
              └── generate-logbook-docx.ts / logbook-template.ts
                    └── PDF output (gambar signature)
```

### Implementasi di `logbook-page.tsx`

```typescript
// Ambil data lengkap termasuk mentor
const response = await getCompleteInternshipData();
if (response.success && response.data) {
  setCompleteData(response.data);
}

// Saat generate PDF
const pdfData = {
  ...otherData,
  mentorSignature: completeData?.mentor?.signature,
};

// Debug log
console.log('🖊️ Mentor Signature:', completeData?.mentor?.signature ? 'Available ✓' : 'Not available');
```

### Di `logbook-template.ts` (HTML template)

```typescript
interface InternshipData {
  // ... field lainnya
  mentorSignature?: string; // Base64 PNG
}

// Di template HTML:
${data.mentorSignature
  ? `<img src="${data.mentorSignature}" style="max-width: 150px; max-height: 80px;" />`
  : `<span style="color: #999;">-- Tanda Tangan Mentor --</span>`
}
```

### Requirement untuk Backend

- Field `mentor.signature` harus berisi string Base64 dengan format: `data:image/png;base64,...`
- Jika mentor belum upload signature, field bisa `null` atau tidak ada
- Maksimal ukuran string Base64: tidak ada batas keras, tapi rekomendasikan compress gambar agar < 100KB

---

## Troubleshooting

### Error: "Unauthorized: Invalid token" / 401

**Penyebab:** Token JWT expired atau tidak valid.

**Solusi cepat:**
1. Logout lalu login ulang
2. Atau manual: buka DevTools (F12) → Console → ketik `localStorage.clear()` → refresh → login ulang

**Verify token ada:**
```javascript
// Di browser console
localStorage.getItem('auth_token')
// → null = belum login atau sudah logout
// → string = token ada (mungkin expired di sisi server)
```

---

### Error: "Gagal memuat data magang"

**Checklist:**

- [ ] Backend running? Test: `GET [BACKEND_URL]/health`
- [ ] Token ada? `localStorage.getItem('auth_token')` bukan null
- [ ] Submission mahasiswa sudah di-approve admin?
- [ ] Cek Network tab di DevTools — status code berapa?

---

### Endpoint 404

Backend mungkin belum deploy endpoint terbaru. Cek:

```javascript
// Verify manual di console browser
const token = localStorage.getItem('auth_token');
const res = await fetch('https://backend-sikp.backend-sikp.workers.dev/api/mahasiswa/internship', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await res.json();
console.log(res.status, data);
```

Jika hasilnya 404 → endpoint belum di-deploy, frontend akan otomatis pakai **fallback Tier 2 / Tier 3**.

---

### CORS Error

Tambahkan di `.env` atau `.env.local`:

```env
VITE_API_BASE_URL=https://backend-sikp.backend-sikp.workers.dev
```

Pastikan backend sudah mengizinkan origin frontend di CORS config.

---

### PDF tidak ada signature mentor

- Pastikan backend mengembalikan `data.mentor.signature` di response `/api/mahasiswa/internship`
- Cek format: harus diawali `data:image/png;base64,` atau `data:image/jpeg;base64,`
- Jika `null` / tidak ada, PDF akan menampilkan placeholder teks

---

## Changelog Integrasi

| Tanggal | Versi | Perubahan |
|---------|-------|-----------|
| 18 Feb 2026 | v1.0 | Integrasi API saat magang, auto-populate periode dari submission |
| 18 Feb 2026 | v1.0 | Fallback mechanism 3 tier |
| 19 Feb 2026 | v1.0 | Fitur tolak logbook dengan catatan mentor |
| 20 Feb 2026 | v1.1 | Support signature mentor di generate PDF |
| 20 Feb 2026 | v1.1 | Interface `BackendMentor` + field `mentor.signature` |
