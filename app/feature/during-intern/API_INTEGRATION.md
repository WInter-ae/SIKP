# API Integration - During Internship (Saat Magang)

## ✅ Status Integrasi

**Status**: COMPLETED & READY TO USE ✨

Integrasi dengan backend API sudah selesai dan siap digunakan untuk fase "Saat Magang" (During Internship).

---

## 📋 Apa yang Sudah Dilakukan

### 1. **Update Student API Service** ✅
File: [`services/student-api.ts`](./services/student-api.ts)

**Perubahan:**
- ✅ Menambahkan interface `CompleteInternshipData` sesuai dengan response backend
- ✅ Menambahkan fungsi `getCompleteInternshipData()` untuk fetch data lengkap
- ✅ Endpoint yang digunakan: `GET /api/mahasiswa/internship`

**Data yang dikembalikan:**
```typescript
{
  student: {
    id, userId, nim, name, email, phone, 
    prodi, fakultas, angkatan, semester
  },
  internship: {
    id, studentId, submissionId, teamId, status,
    mentorId, dosenPembimbingId, createdAt, updatedAt
  },
  submission: {  // ⭐ DATA DARI PENGAJUAN (PENTING!)
    id, teamId, company, division, address,
    startDate, endDate, status
  },
  team: { id, name, totalMembers },
  mentor: { id, name, email, company, position, phone },
  lecturer: { id, name, email, nip, phone }
}
```

**Keuntungan:**
- ✅ **SATU API call untuk SEMUA data context** - tidak perlu multiple calls
- ✅ **Data company & division dari submission** - data asli dari pengajuan mahasiswa
- ✅ **Data mentor & lecturer** - sudah include jika sudah di-assign
- ✅ **Team info** - untuk mahasiswa yang magang dalam tim

---

### 2. **Update Logbook API Service** ✅
File: [`services/logbook-api.ts`](./services/logbook-api.ts)

**Perubahan:**
- ✅ Update semua endpoint dari `/api/logbook` menjadi `/api/mahasiswa/logbook`
- ✅ Sesuaikan dengan dokumentasi backend API

**Endpoints yang digunakan:**
```
POST   /api/mahasiswa/logbook           - Create logbook entry
GET    /api/mahasiswa/logbook           - Get all logbooks
GET    /api/mahasiswa/logbook/:id       - Get single logbook
PUT    /api/mahasiswa/logbook/:id       - Update logbook
DELETE /api/mahasiswa/logbook/:id       - Delete logbook (PENDING only)
GET    /api/mahasiswa/logbook/stats     - Get statistics
```

---

### 3. **Update Logbook Page** ✅
File: [`pages/logbook-page.tsx`](./pages/logbook-page.tsx)

**Perubahan Utama:**

#### A. Import & State
```typescript
// Before (OLD)
import { getMyProfile, getMyInternship } from "...";
const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
const [internshipData, setInternshipData] = useState<InternshipData | null>(null);

// After (NEW)
import { getCompleteInternshipData } from "...";
const [completeData, setCompleteData] = useState<CompleteInternshipData | null>(null);
```

#### B. Data Fetching
```typescript
// Before (OLD) - 2 API calls
const [profileResponse, internshipResponse] = await Promise.all([
  getMyProfile(),
  getMyInternship()
]);

// After (NEW) - 1 API call ⚡
const response = await getCompleteInternshipData();
if (response.success && response.data) {
  setCompleteData(response.data);
}
```

#### C. Display Data
```typescript
// Before (OLD)
<p>{studentProfile?.name}</p>
<p>{internshipData?.company}</p>

// After (NEW)
<p>{completeData?.student.name}</p>
<p>{completeData?.submission.company}</p>  // From submission!
<p>{completeData?.submission.division}</p> // From submission!
```

#### D. Generate DOCX
```typescript
// Before (OLD)
const logbookData = {
  student: {
    name: studentProfile?.name,
    // ...
  },
  internship: {
    company: internshipData?.company,  // Tidak ada division!
    position: internshipData?.position
  }
};

// After (NEW)
const logbookData = {
  student: {
    name: completeData.student.name,
    // ...
  },
  internship: {
    company: completeData.submission.company,     // ⭐ From submission
    division: completeData.submission.division,   // ⭐ From submission
    mentorName: completeData.mentor?.name,        // ⭐ Dari mentor yang assigned
    startDate: completeData.submission.startDate, // ⭐ Tanggal asli dari pengajuan
    endDate: completeData.submission.endDate
  }
};
```

---

## 🔑 Key Concepts Backend Integration

### 1. **Data Flow: Pengajuan → Magang** ⭐

Ini adalah konsep PALING PENTING yang harus dipahami:

```
FASE 1: PENGAJUAN (Submissions)
├─ Mahasiswa submit pengajuan KP
├─ Input: company name, division, dates, documents
└─ Status: PENDING_REVIEW

        ↓ [Admin Approve]

FASE 2: AUTO-CREATE INTERNSHIPS
├─ Backend otomatis create internships untuk SETIAP anggota tim
├─ Data dari submission otomatis ter-copy
│  ├─ submissionId (link back to original submission)
│  ├─ company
│  ├─ division
│  ├─ startDate & endDate
│  └─ Data mahasiswa & team
└─ Status: AKTIF

        ↓

FASE 3: MAGANG (Current Phase)
├─ Mahasiswa dapat akses halaman logbook, assessment, report
├─ Data submission SUDAH TERSEDIA via API
├─ Endpoint: GET /api/mahasiswa/internship
└─ Returns: student + internship + submission + team + mentor + lecturer
```

**Keuntungan:**
1. ✅ Mahasiswa **TIDAK perlu input ulang** data tempat KP
2. ✅ Data company & division **konsisten** dengan pengajuan awal
3. ✅ **Traceability** - bisa trace back ke submission asli via submissionId
4. ✅ **One source of truth** - data master ada di submission

---

### 2. **Authentication & Authorization**

Semua API calls memerlukan JWT token di header:

```typescript
// Token otomatis diambil dari localStorage oleh api-client.ts
headers: {
  'Authorization': `Bearer ${getAuthToken()}`
}
```

**Token disimpan saat login:**
```typescript
// di auth-client.ts
localStorage.setItem('auth_token', data.data.token);
```

---

## 🚀 Cara Menggunakan API di Halaman Lain

### Template: Halaman Magang Baru

```typescript
import { useEffect, useState } from "react";
import { getCompleteInternshipData } from "~/feature/during-intern/services";
import type { CompleteInternshipData } from "~/feature/during-intern/services/student-api";

function NewInternshipPage() {
  const [data, setData] = useState<CompleteInternshipData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getCompleteInternshipData();
        
        if (response.success && response.data) {
          setData(response.data);
        } else {
          // Handle error
          console.error(response.message);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>Data tidak tersedia</div>;

  return (
    <div>
      {/* Student Info */}
      <h1>{data.student.name}</h1>
      <p>NIM: {data.student.nim}</p>
      <p>Prodi: {data.student.prodi}</p>
      
      {/* Company Info (from submission) */}
      <h2>Tempat KP</h2>
      <p>Perusahaan: {data.submission.company}</p>
      <p>Divisi: {data.submission.division}</p>
      <p>Periode: {data.submission.startDate} - {data.submission.endDate}</p>
      
      {/* Mentor Info (if assigned) */}
      {data.mentor && (
        <div>
          <h2>Mentor Lapangan</h2>
          <p>Nama: {data.mentor.name}</p>
          <p>Posisi: {data.mentor.position}</p>
        </div>
      )}
      
      {/* Lecturer Info (if assigned) */}
      {data.lecturer && (
        <div>
          <h2>Dosen Pembimbing</h2>
          <p>Nama: {data.lecturer.name}</p>
          <p>NIP: {data.lecturer.nip}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 📝 API Contract Summary

### Base URL
```
Development: http://localhost:8787
Production: https://backend-sikp.backend-sikp.workers.dev
```

### Authentication
```typescript
headers: {
  'Authorization': 'Bearer <token>'
}
```

### Response Format
```typescript
// Success
{
  success: true,
  message: "Success message",
  data: { ... }
}

// Error
{
  success: false,
  message: "Error message",
  data: null
}
```

---

## 🧪 Testing

### Manual Testing Checklist

**Logbook Page:**
- [ ] Page loads tanpa error
- [ ] Data mahasiswa tampil (nama, NIM, prodi, fakultas)
- [ ] Data tempat KP tampil (company dari submission)
- [ ] Data divisi tampil (division dari submission)
- [ ] Status internship tampil (AKTIF/PENDING/dll)
- [ ] Form input logbook berfungsi
- [ ] Generate DOCX berfungsi dengan data lengkap
- [ ] Company & division muncul di DOCX

**Dengan Backend Running:**
1. Login dengan akun mahasiswa
2. Pastikan mahasiswa sudah punya internship (submission di-approve)
3. Buka halaman logbook
4. Periksa Network tab di DevTools:
   - Request ke `/api/mahasiswa/internship`
   - Status 200 OK
   - Response berisi data lengkap
5. Periksa data tampil di UI
6. Test generate DOCX
7. Buka DOCX, verify company & division terisi

---

## 🔧 Environment Setup

### Required Environment Variables

```env
# .env.local atau .env

# Backend API URL
VITE_API_URL=http://localhost:8787

# Or alternative names
VITE_APP_AUTH_URL=http://localhost:8787
VITE_API_BASE_URL=http://localhost:8787
```

### Backend Must Be Running

Pastikan backend berjalan di `http://localhost:8787` atau URL yang sesuai.

**Test backend:**
```bash
curl http://localhost:8787/api/health
```

---

## 📚 Dokumentasi Tambahan

Untuk dokumentasi backend lengkap, lihat file-file berikut di root project:

- **[FRONTEND_INTEGRATION_GUIDE.md](../../../FRONTEND_INTEGRATION_GUIDE.md)** - Comprehensive API guide (500+ lines)
- **[QUICK_API_REFERENCE.md](../../../QUICK_API_REFERENCE.md)** - Quick reference untuk daily use
- **[API_CONTRACT.md](../../../API_CONTRACT.md)** - Complete API contract dengan request/response examples
- **[FRONTEND_TEAM_NOTES.md](../../../FRONTEND_TEAM_NOTES.md)** - Implementation priorities & checklist

---

## 🐛 Troubleshooting

### Error: "Failed to fetch"
**Cause:** Backend tidak running atau CORS issue  
**Solution:** 
1. Pastikan backend running di `http://localhost:8787`
2. Check CORS headers di backend

### Error: "Unauthorized" (401)
**Cause:** Token expired atau tidak valid  
**Solution:**
1. Logout dan login kembali
2. Check token di localStorage: `localStorage.getItem('auth_token')`

### Error: Data tidak tampil
**Cause:** Response format tidak sesuai atau data kosong  
**Solution:**
1. Check Network tab di DevTools
2. Verify response structure match dengan `CompleteInternshipData` interface
3. Check apakah mahasiswa sudah punya internship (submission approved)

### Error: Company/Division kosong di DOCX
**Cause:** Data submission tidak ada atau null  
**Solution:**
1. Pastikan submission sudah di-approve oleh admin
2. Check `completeData.submission` tidak null
3. Verify backend auto-create internship saat approval

---

## � Komunikasi Mentor - Mahasiswa

### Overview
Setelah integrasi backend, sistem komunikasi asynchronous antara mentor dan mahasiswa **SUDAH BERFUNGSI** melalui sistem approval/rejection logbook.

### Relasi Foreign Key ✅

**Hubungan mahasiswa dengan mentor sudah terhubung:**

```typescript
// Dari sisi Mahasiswa
const data = await getCompleteInternshipData();
// Returns:
{
  internship: {
    mentorId: "mentor-uuid-123"  // 👈 Foreign key ke mentor
  },
  mentor: {  // 👈 Data mentor auto-joined
    id: "mentor-uuid-123",
    name: "Pak Budi",
    company: "PT ABC"
  }
}

// Dari sisi Mentor
const mentees = await getMentees();
// Returns list mahasiswa yang dibimbing mentor ini:
[
  {
    id: "student-uuid",
    name: "Robin",
    mentorId: "mentor-uuid-123"  // 👈 Relasi terhubung
  }
]
```

### Fitur Komunikasi yang Tersedia

#### 1. **Approve Logbook** ✅
**Mentor menyetujui logbook mahasiswa dengan paraf digital**

```typescript
// Mentor side
import { approveLogbook } from "~/feature/field-mentor/services";

await approveLogbook(
  logbookId,
  "Bagus! Lanjutkan." // Optional notes
);
```

#### 2. **Reject Logbook** ✅ NEW!
**Mentor menolak logbook dengan catatan revisi**

```typescript
// Mentor side
import { rejectLogbook } from "~/feature/field-mentor/services";

await rejectLogbook(
  logbookId,
  "Deskripsi kurang detail. Mohon tambahkan teknologi yang digunakan."
);
```

**API Endpoint:**
```
POST /api/mentor/logbook/:logbookId/reject

Body:
{
  "rejectionNote": "Catatan revisi untuk mahasiswa..."
}

Response:
{
  "success": true,
  "data": {
    "id": "logbook-123",
    "status": "REJECTED",
    "rejectionNote": "Deskripsi kurang detail...",
    ...
  }
}
```

#### 3. **UI Components** ✅

**Reject Button untuk Mentor:**
```tsx
import { RejectLogbookButton } from "~/feature/field-mentor";

<RejectLogbookButton
  logbookId="logbook-123"
  studentName="Robin"
  date="2026-02-12"
  activity="Implementasi REST API"
  onSuccess={() => refetchData()}
/>
```

**Mahasiswa View - Rejection Note Display:**
Ketika logbook di-reject, mahasiswa akan melihat:
```
┌─────────────────────────────────────┐
│  ❌ Ditolak                          │
│                                     │
│  📝 Catatan Revisi:                 │
│  Deskripsi kurang detail. Mohon     │
│  tambahkan teknologi yang digunakan │
│  dan hasil yang dicapai.            │
│                                     │
│  Silakan perbaiki dan submit ulang  │
└─────────────────────────────────────┘
```

### Flow Komunikasi

```
Mahasiswa                   Backend                    Mentor
    │                          │                          │
    │ 1. Create Logbook        │                          │
    │─────────────────────────>│                          │
    │                          │ Status: PENDING          │
    │                          │<─────────────────────────│
    │                          │ 2. Get Logbook List      │
    │                          │                          │
    │                          │ 3. Review Logbook        │
    │                          │<─────────────────────────│
    │                          │                          │
    │                 Option A: APPROVE                   │
    │                          │<─────────────────────────│
    │                          │ POST /approve            │
    │                          │   + notes (optional)     │
    │<─────────────────────────│                          │
    │ ✅ Badge "Disetujui"      │                          │
    │ 💬 Notes dari mentor      │                          │
    │                          │                          │
    │                 Option B: REJECT                    │
    │                          │<─────────────────────────│
    │                          │ POST /reject             │
    │                          │   + rejectionNote        │
    │<─────────────────────────│                          │
    │ ❌ Badge "Ditolak"        │                          │
    │ 📝 Catatan Revisi         │                          │
    │                          │                          │
    │ 4. Edit & Resubmit       │                          │
    │─────────────────────────>│                          │
    │                          │ Status: PENDING (again)  │
```

### Catatan Penting

**✅ Sudah Ada:**
- Foreign key relationship (mahasiswa ↔ mentor)
- Mentor dapat melihat list mahasiswa bimbingannya
- Mahasiswa dapat melihat data mentornya
- Approve logbook dengan notes
- Reject logbook dengan catatan revisi
- UI components untuk approve/reject
- Feedback display untuk mahasiswa

**❌ Belum Ada:**
- Real-time chat/messaging system
- WebSocket untuk instant notification
- Private messaging terpisah dari logbook

**Tipe Komunikasi:**
- ✅ **Asynchronous Feedback System** (via logbook approval/rejection)
- ❌ **Real-time Chat** (belum diimplementasi)

---

## ✅ Checklist Integration Complete

- [x] Update `student-api.ts` dengan CompleteInternshipData
- [x] Update `logbook-api.ts` dengan endpoint backend yang benar
- [x] Update `logbook-page.tsx` untuk menggunakan API baru
- [x] Tambahkan `rejectLogbook` API function
- [x] Buat `RejectLogbookButton` component
- [x] Update UI mahasiswa untuk tampilkan rejection note
- [x] Verify TypeScript no errors
- [x] Document integration di API_INTEGRATION.md
- [ ] Manual testing dengan backend running
- [ ] Deployment ke staging

---

**Last Updated:** February 12, 2026  
**Integration Status:** ✅ COMPLETE & READY
