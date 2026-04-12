# Branch Created Documentation (Combined)

Dokumen ini sekarang mencakup:
- Konten dokumen yang dibuat di branch ini (embedded di bawah)
- Referensi dokumen tambahan dari folder `document/` (dikelompokkan per alur)

## Master Structure (Per Alur dan Per Section)

### Alur 1 - Project Setup dan Integrasi Awal

#### Section 1.1 - API Integration Core
- `document/API_INTEGRATION.md`
- `document/STUDENT_DATA_INTEGRATION.md`
- `document/Integrasi Dari Backend/API_CONTRACT.md`
- `document/Integrasi Dari Backend/FRONTEND_INTEGRATION_GUIDE.md`
- `document/Integrasi Dari Backend/QUICK_API_REFERENCE.md`

#### Section 1.2 - Getting Started dan Ringkasan Proyek
- `document/Integrasi Dari Backend/GETTING_STARTED.md`
- `document/Integrasi Dari Backend/PROJECT_OVERVIEW.md`
- `document/Integrasi Dari Backend/DOCUMENTATION_INDEX.md`

### Alur 2 - Auth, Register Mentor, dan Identitas User

#### Section 2.1 - Login/Register dan Mentor Flow
- `document/LOGIKA REGISTER PEMBIMBING LAPANGAN.txt`
- `document/Integrasi Dari Backend/EMAIL_TO_FRONTEND_TEAM.md`
- `document/Integrasi dari Backend 2/BACKEND_UPDATE_MENTOR_LECTURER.md`

#### Section 2.2 - Endpoint Update Mahasiswa
- `document/Integrasi dari Backend 2/CHANGELOG_MAHASISWA_ENDPOINTS.md`
- `document/Integrasi dari Backend 2/KIRIM_KE_FRONTEND.md`

### Alur 3 - Pengajuan ke Saat Magang

#### Section 3.1 - During Internship (Saat Magang)
- `document/SAAT-MAGANG.md`
- `document/SAAT-MAGANG.md.backup`
- `FRONTEND_DOCS.md` (embedded di file ini)
- `FRONTEND_API_DOCS.md` (embedded di file ini)

#### Section 3.2 - Backend Contract dan Data Schema
- `document/Integrasi Dari Backend/DATABASE_SCHEMA_DRIZZLE.md`
- `document/Integrasi Dari Backend/SUMMARY_FOR_FRONTEND.md`

### Alur 4 - Logbook Review, Approval, Revisi

#### Section 4.1 - Logbook Workflow Mahasiswa dan Mentor
- `document/LOGBOOK_IMPROVEMENTS.md`
- `document/TESTING_NILAI_KP.md`
- `app/feature/field-mentor/README.md` (embedded di file ini)
- `app/feature/during-intern/TROUBLESHOOTING.md` (embedded di file ini)

#### Section 4.2 - Read-only Monitoring dan Flow Dosen
- `docs/backend-flow-pembimbing-lapangan.md` (embedded di file ini)

### Alur 5 - E-Signature, Template, dan Dokumen Output

#### Section 5.1 - Tanda Tangan Digital dan Dokumen
- `document/E-SIGNATURE_FLOW.md`
- `document/TEMPLATE_MANAGEMENT_GUIDE.md`
- `app/feature/during-intern/API_INTEGRATION.md` (embedded di file ini)

### Alur 6 - Release, Deployment, dan Changelog

#### Section 6.1 - Release Notes dan Validasi
- `document/RECENTLY_UPDATED.md`
- `document/Integrasi dari Backend 2/DEPLOYMENT_SUCCESS.md`
- `CHANGELOG_MERGE_COMPLETE.md` (embedded di file ini)
- `PR_BODY_DESCRIPTION.md` (embedded di file ini)

#### Section 6.2 - Deployment Checklist
- `document/Integrasi Dari Backend/FRONTEND_DEPLOYMENT_CHECKLIST.md`
- `document/Integrasi dari Backend 2/postman_collection.json`
- `document/Integrasi dari Backend 2/UPDATE_NOTIFICATION_V1.1.0.md`

---

## Embedded Branch-Created Docs

## app/feature/field-mentor/README.md

# Field Mentor (Pembimbing Lapangan) - Components & Services

## ðŸ“ Struktur Folder

```
field-mentor/
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ approve-logbook-button.tsx       âœ… Button approve logbook
â”‚   â”œâ”€â”€ approve-logbook-button.example.tsx
â”‚   â”œâ”€â”€ reject-logbook-button.tsx        âœ… NEW! Button reject logbook
â”‚   â”œâ”€â”€ reject-logbook-button.example.tsx
â”‚   â””â”€â”€ signature-setup.tsx              âœ… Setup paraf digital
â”œâ”€â”€ pages/
â”‚   â”œâ”€â”€ field-mentor-page.tsx            âœ… Dashboard mentor
â”‚   â”œâ”€â”€ mentor-logbook-page.tsx          âœ… List all logbooks
â”‚   â””â”€â”€ student-logbook-detail-page.tsx  âœ… Detail logbook per mahasiswa
â”œâ”€â”€ services/
â”‚   â”œâ”€â”€ mentor-api.ts                    âœ… API functions
â”‚   â””â”€â”€ index.ts
â”œâ”€â”€ types/
â”‚   â”œâ”€â”€ index.d.ts
â”‚   â””â”€â”€ logbook.d.ts
â””â”€â”€ index.ts                             âœ… Exports
```

---

## ðŸŽ¯ Fitur Utama

### 1. **Approve Logbook** âœ…
Mentor menyetujui logbook mahasiswa dengan paraf digital (dari profile).

**API:**
```typescript
POST /api/mentor/logbook/:logbookId/approve
```

**Component:**
```tsx
import { ApproveLogbookButton } from "~/feature/field-mentor";

<ApproveLogbookButton
  logbookId="logbook-123"
  studentName="Robin"
  date="2026-02-12"
  activity="Implementasi REST API"
  onSuccess={() => refetch()}
/>
```

### 2. **Reject Logbook** âœ… NEW!
Mentor menolak logbook dengan catatan revisi untuk mahasiswa.

**API:**
```typescript
POST /api/mentor/logbook/:logbookId/reject

Body: {
  "rejectionNote": "Catatan revisi..."
}
```

**Component:**
```tsx
import { RejectLogbookButton } from "~/feature/field-mentor";

<RejectLogbookButton
  logbookId="logbook-123"
  studentName="Robin"
  date="2026-02-12"
  activity="Implementasi REST API"
  onSuccess={() => refetch()}
/>
```

### 3. **Lihat Mahasiswa Bimbingan**
Mentor dapat melihat list mahasiswa yang dibimbingnya.

**API:**
```typescript
GET /api/mentor/mentees

Response: [
  {
    id: "student-uuid",
    name: "Robin",
    nim: "12345",
    company: "PT ABC",
    mentorId: "mentor-uuid",
    status: "AKTIF"
  }
]
```

### 4. **Lihat Logbook Mahasiswa**
Mentor dapat melihat semua logbook dari mahasiswa tertentu.

**API:**
```typescript
GET /api/mentor/logbook/:studentId

Response: [
  {
    id: "logbook-123",
    date: "2026-02-12",
    activity: "Implementasi REST API",
    description: "...",
    status: "PENDING" | "APPROVED" | "REJECTED",
    rejectionNote?: "..."
  }
]
```

---

## ðŸ’¡ Cara Pakai

### Setup di Halaman Mentor

```tsx
import { 
  ApproveLogbookButton, 
  RejectLogbookButton 
} from "~/feature/field-mentor";
import { getStudentLogbook } from "~/feature/field-mentor/services";

export default function MentorDashboard() {
  const [logbooks, setLogbooks] = useState([]);
  
  useEffect(() => {
    loadLogbooks();
  }, []);
  
  const loadLogbooks = async () => {
    const response = await getStudentLogbook("student-id");
    if (response.success) {
      setLogbooks(response.data);
    }
  };
  
  return (
    <div>
      {logbooks.map(log => (
        <div key={log.id} className="flex gap-2">
          <p>{log.activity}</p>
          
          {log.status === "PENDING" && (
            <>
              <ApproveLogbookButton
                logbookId={log.id}
                studentName="Robin"
                onSuccess={loadLogbooks}
              />
              
              <RejectLogbookButton
                logbookId={log.id}
                studentName="Robin"
                onSuccess={loadLogbooks}
              />
            </>
          )}
          
          {log.status === "APPROVED" && (
            <Badge className="bg-green-500">âœ… Disetujui</Badge>
          )}
          
          {log.status === "REJECTED" && (
            <div>
              <Badge variant="destructive">âŒ Ditolak</Badge>
              <p className="text-sm text-red-600">
                {log.rejectionNote}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## ðŸ”— Relasi dengan Mahasiswa

### Foreign Key Relationship

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”       mentorId        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Internships â”‚â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€>â”‚ Mentors  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                       â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
       â”‚
       â”‚ studentId
       â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Students    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
       â”‚
       â”‚ id
       â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Logbooks    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Dari API:**
- Mentor â†’ Mahasiswa: `GET /api/mentor/mentees`
- Mahasiswa â†’ Mentor: `GET /api/mahasiswa/internship` (includes mentor data)
- Logbook: `GET /api/mentor/logbook/:studentId`

---

## ðŸ“Š Status Logbook

| Status    | Deskripsi | Actions Available |
|-----------|-----------|-------------------|
| `PENDING` | Menunggu approval | Approve, Reject |
| `APPROVED` | Disetujui mentor | View only |
| `REJECTED` | Ditolak dengan catatan | Mahasiswa harus edit & resubmit |

---

## ðŸŽ¨ UI Components

### ApproveLogbookButton
- âœ… Dialog konfirmasi dengan info logbook
- âœ… Optional notes untuk mahasiswa
- âœ… Auto-signature dari mentor profile
- âœ… Toast notification
- âœ… Callback onSuccess

### RejectLogbookButton â­ NEW
- âœ… Dialog konfirmasi dengan warning
- âœ… **Required** rejection note (textarea)
- âœ… Character counter (max 500)
- âœ… Alert untuk inform mahasiswa
- âœ… Toast notification
- âœ… Callback onSuccess

---

## ðŸš€ Next Steps

1. **Testing**: Test dengan backend running
2. **Integration**: Gunakan di halaman mentor
3. **UI/UX**: Customize styling sesuai kebutuhan
4. **Notification**: Tambahkan email/notif untuk mahasiswa (future)

---

**Last Updated:** February 12, 2026
**Status:** âœ… Ready to Use


## app/feature/during-intern/API_INTEGRATION.md

# API Integration - During Internship (Saat Magang)

## âœ… Status Integrasi

**Status**: COMPLETED & READY TO USE âœ¨

Integrasi dengan backend API sudah selesai dan siap digunakan untuk fase "Saat Magang" (During Internship).

---

## ðŸ“‹ Apa yang Sudah Dilakukan

### 1. **Update Student API Service** âœ…
File: [`services/student-api.ts`](./services/student-api.ts)

**Perubahan:**
- âœ… Menambahkan interface `CompleteInternshipData` sesuai dengan response backend
- âœ… Menambahkan fungsi `getCompleteInternshipData()` untuk fetch data lengkap
- âœ… Endpoint yang digunakan: `GET /api/mahasiswa/internship`

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
  submission: {  // â­ DATA DARI PENGAJUAN (PENTING!)
    id, teamId, company, division, address,
    startDate, endDate, status
  },
  team: { id, name, totalMembers },
  mentor: { id, name, email, company, position, phone },
  lecturer: { id, name, email, nip, phone }
}
```

**Keuntungan:**
- âœ… **SATU API call untuk SEMUA data context** - tidak perlu multiple calls
- âœ… **Data company & division dari submission** - data asli dari pengajuan mahasiswa
- âœ… **Data mentor & lecturer** - sudah include jika sudah di-assign
- âœ… **Team info** - untuk mahasiswa yang magang dalam tim

---

### 2. **Update Logbook API Service** âœ…
File: [`services/logbook-api.ts`](./services/logbook-api.ts)

**Perubahan:**
- âœ… Update semua endpoint dari `/api/logbook` menjadi `/api/mahasiswa/logbook`
- âœ… Sesuaikan dengan dokumentasi backend API

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

### 3. **Update Logbook Page** âœ…
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

// After (NEW) - 1 API call âš¡
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
    company: completeData.submission.company,     // â­ From submission
    division: completeData.submission.division,   // â­ From submission
    mentorName: completeData.mentor?.name,        // â­ Dari mentor yang assigned
    startDate: completeData.submission.startDate, // â­ Tanggal asli dari pengajuan
    endDate: completeData.submission.endDate
  }
};
```

---

## ðŸ”‘ Key Concepts Backend Integration

### 1. **Data Flow: Pengajuan â†’ Magang** â­

Ini adalah konsep PALING PENTING yang harus dipahami:

```
FASE 1: PENGAJUAN (Submissions)
â”œâ”€ Mahasiswa submit pengajuan KP
â”œâ”€ Input: company name, division, dates, documents
â””â”€ Status: PENDING_REVIEW

        â†“ [Admin Approve]

FASE 2: AUTO-CREATE INTERNSHIPS
â”œâ”€ Backend otomatis create internships untuk SETIAP anggota tim
â”œâ”€ Data dari submission otomatis ter-copy
â”‚  â”œâ”€ submissionId (link back to original submission)
â”‚  â”œâ”€ company
â”‚  â”œâ”€ division
â”‚  â”œâ”€ startDate & endDate
â”‚  â””â”€ Data mahasiswa & team
â””â”€ Status: AKTIF

        â†“

FASE 3: MAGANG (Current Phase)
â”œâ”€ Mahasiswa dapat akses halaman logbook, assessment, report
â”œâ”€ Data submission SUDAH TERSEDIA via API
â”œâ”€ Endpoint: GET /api/mahasiswa/internship
â””â”€ Returns: student + internship + submission + team + mentor + lecturer
```

**Keuntungan:**
1. âœ… Mahasiswa **TIDAK perlu input ulang** data tempat KP
2. âœ… Data company & division **konsisten** dengan pengajuan awal
3. âœ… **Traceability** - bisa trace back ke submission asli via submissionId
4. âœ… **One source of truth** - data master ada di submission

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

## ðŸš€ Cara Menggunakan API di Halaman Lain

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

## ðŸ“ API Contract Summary

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

## ðŸ§ª Testing

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

## ðŸ”§ Environment Setup

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

## ðŸ“š Dokumentasi Tambahan

Untuk dokumentasi backend lengkap, lihat file-file berikut di root project:

- **[FRONTEND_INTEGRATION_GUIDE.md](../../../FRONTEND_INTEGRATION_GUIDE.md)** - Comprehensive API guide (500+ lines)
- **[QUICK_API_REFERENCE.md](../../../QUICK_API_REFERENCE.md)** - Quick reference untuk daily use
- **[API_CONTRACT.md](../../../API_CONTRACT.md)** - Complete API contract dengan request/response examples
- **[FRONTEND_TEAM_NOTES.md](../../../FRONTEND_TEAM_NOTES.md)** - Implementation priorities & checklist

---

## ðŸ› Troubleshooting

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

## ï¿½ Komunikasi Mentor - Mahasiswa

### Overview
Setelah integrasi backend, sistem komunikasi asynchronous antara mentor dan mahasiswa **SUDAH BERFUNGSI** melalui sistem approval/rejection logbook.

### Relasi Foreign Key âœ…

**Hubungan mahasiswa dengan mentor sudah terhubung:**

```typescript
// Dari sisi Mahasiswa
const data = await getCompleteInternshipData();
// Returns:
{
  internship: {
    mentorId: "mentor-uuid-123"  // ðŸ‘ˆ Foreign key ke mentor
  },
  mentor: {  // ðŸ‘ˆ Data mentor auto-joined
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
    mentorId: "mentor-uuid-123"  // ðŸ‘ˆ Relasi terhubung
  }
]
```

### Fitur Komunikasi yang Tersedia

#### 1. **Approve Logbook** âœ…
**Mentor menyetujui logbook mahasiswa dengan paraf digital**

```typescript
// Mentor side
import { approveLogbook } from "~/feature/field-mentor/services";

await approveLogbook(
  logbookId,
  "Bagus! Lanjutkan." // Optional notes
);
```

#### 2. **Reject Logbook** âœ… NEW!
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

#### 3. **UI Components** âœ…

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
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  âŒ Ditolak                          â”‚
â”‚                                     â”‚
â”‚  ðŸ“ Catatan Revisi:                 â”‚
â”‚  Deskripsi kurang detail. Mohon     â”‚
â”‚  tambahkan teknologi yang digunakan â”‚
â”‚  dan hasil yang dicapai.            â”‚
â”‚                                     â”‚
â”‚  Silakan perbaiki dan submit ulang  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Flow Komunikasi

```
Mahasiswa                   Backend                    Mentor
    â”‚                          â”‚                          â”‚
    â”‚ 1. Create Logbook        â”‚                          â”‚
    â”‚â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€>â”‚                          â”‚
    â”‚                          â”‚ Status: PENDING          â”‚
    â”‚                          â”‚<â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚
    â”‚                          â”‚ 2. Get Logbook List      â”‚
    â”‚                          â”‚                          â”‚
    â”‚                          â”‚ 3. Review Logbook        â”‚
    â”‚                          â”‚<â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚
    â”‚                          â”‚                          â”‚
    â”‚                 Option A: APPROVE                   â”‚
    â”‚                          â”‚<â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚
    â”‚                          â”‚ POST /approve            â”‚
    â”‚                          â”‚   + notes (optional)     â”‚
    â”‚<â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚                          â”‚
    â”‚ âœ… Badge "Disetujui"      â”‚                          â”‚
    â”‚ ðŸ’¬ Notes dari mentor      â”‚                          â”‚
    â”‚                          â”‚                          â”‚
    â”‚                 Option B: REJECT                    â”‚
    â”‚                          â”‚<â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚
    â”‚                          â”‚ POST /reject             â”‚
    â”‚                          â”‚   + rejectionNote        â”‚
    â”‚<â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚                          â”‚
    â”‚ âŒ Badge "Ditolak"        â”‚                          â”‚
    â”‚ ðŸ“ Catatan Revisi         â”‚                          â”‚
    â”‚                          â”‚                          â”‚
    â”‚ 4. Edit & Resubmit       â”‚                          â”‚
    â”‚â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€>â”‚                          â”‚
    â”‚                          â”‚ Status: PENDING (again)  â”‚
```

### Catatan Penting

**âœ… Sudah Ada:**
- Foreign key relationship (mahasiswa â†” mentor)
- Mentor dapat melihat list mahasiswa bimbingannya
- Mahasiswa dapat melihat data mentornya
- Approve logbook dengan notes
- Reject logbook dengan catatan revisi
- UI components untuk approve/reject
- Feedback display untuk mahasiswa

**âŒ Belum Ada:**
- Real-time chat/messaging system
- WebSocket untuk instant notification
- Private messaging terpisah dari logbook

**Tipe Komunikasi:**
- âœ… **Asynchronous Feedback System** (via logbook approval/rejection)
- âŒ **Real-time Chat** (belum diimplementasi)

---

## âœ… Checklist Integration Complete

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
**Integration Status:** âœ… COMPLETE & READY


## app/feature/during-intern/TROUBLESHOOTING.md

# Troubleshooting - During Internship Module

## ðŸ”’ Error: "Unauthorized: Invalid token"

### Penyebab
- Token JWT expired (masa berlaku habis)
- Token tidak valid
- Session timeout
- User logout dari device lain

### Solusi

#### 1. **Logout dan Login Ulang** âœ… (RECOMMENDED)
Cara paling mudah dan pasti berhasil:

1. Klik nama Anda di sidebar â†’ **Logout**
2. Login kembali dengan email & password
3. Token baru akan di-generate
4. Coba buka halaman logbook lagi

#### 2. **Manual Clear Cache**
Jika auto-redirect tidak bekerja:

1. Buka **Developer Tools** (F12)
2. Tab **Console**
3. Ketik:
   ```javascript
   localStorage.clear()
   ```
4. Refresh halaman (Ctrl + R)
5. Login kembali

#### 3. **Hard Refresh**
Clear cache browser:
- **Chrome/Edge**: `Ctrl + Shift + R`
- **Firefox**: `Ctrl + F5`
- Lalu login ulang

---

## ðŸ“¡ Error: "Gagal memuat data magang"

### Checklist

#### Backend
- [ ] Backend sudah running?
  - **Local**: `http://localhost:8787`
  - **Production**: `https://backend-sikp.backend-sikp.workers.dev`
- [ ] Test backend health: Buka `[BACKEND_URL]/health` di browser
- [ ] Check CORS settings di backend

#### Authentication
- [ ] Sudah login?
- [ ] Token tersedia? Check di Console:
  ```javascript
  console.log(localStorage.getItem('auth_token'))
  ```
- [ ] Token tidak expired?

#### Data Mahasiswa
- [ ] Submission sudah di-approve admin?
- [ ] Backend sudah auto-create internship record?
- [ ] Check di Network tab: status code 200 atau error?

---

## ðŸŒ Network Error / Timeout

### Penyebab
- Backend tidak running
- URL backend salah
- Network issue
- CORS issue

### Solusi

#### 1. **Check Environment Variable**
File: `.env` atau `.env.local`

```env
# Untuk development (local backend)
VITE_API_URL=http://localhost:8787

# Untuk production (Workers)
VITE_API_URL=https://backend-sikp.backend-sikp.workers.dev
```

#### 2. **Test Backend Connectivity**
Buka browser, coba akses:
```
http://localhost:8787/health
```

Harusnya return JSON:
```json
{
  "status": "ok",
  "message": "SIKP Backend API is running"
}
```

#### 3. **Check CORS**
Jika ada CORS error di Console:
- Pastikan backend sudah set CORS headers dengan benar
- Allow origin dari frontend URL

---

## ðŸ“Š Data Mahasiswa Kosong (Nama: -, NIM: -)

### Penyebab
- API return success tapi data null
- Internship record belum dibuat
- Submission belum approved

### Solusi

#### 1. **Check Response di Network Tab**
1. Buka **DevTools** (F12)
2. Tab **Network**
3. Filter: **Fetch/XHR**
4. Refresh halaman
5. Klik request `/api/mahasiswa/internship`
6. Tab **Response** - lihat isi response

**Response yang benar:**
```json
{
  "success": true,
  "data": {
    "student": {
      "name": "Robin",
      "nim": "12345",
      ...
    },
    "submission": {
      "company": "PT ABC",
      "division": "IT",
      ...
    }
  }
}
```

#### 2. **Check Status Pengajuan**
- Buka halaman **Pengajuan**
- Pastikan status: **APPROVED** (hijau)
- Jika masih PENDING/REJECTED, tunggu approval admin

#### 3. **Check Backend Data**
Akses backend endpoint langsung (buka di browser):
```
http://localhost:8787/api/mahasiswa/internship
```

**Catatan:** Harus sudah login agar token tersedia.

---

## ðŸ”„ Auto-Populate Periode Tidak Bekerja

### Penyebab
- Submission tidak punya `startDate` dan `endDate`
- Data submission null
- Approval belum lengkap

### Solusi

1. **Check Console Log**
   ```
   âœ… AUTO-GENERATE SUCCESS: {...}
   ```
   
2. **Check Submission Data**
   Di Console, setelah halaman load:
   ```javascript
   // Lihat data submission
   console.log(completeData?.submission)
   ```

3. **Manual Input Periode**
   Jika auto-populate gagal:
   - Scroll ke **Step 1: Setup Periode**
   - Input manual tanggal mulai & selesai
   - Pilih hari kerja
   - Klik **Simpan Periode**

---

## ðŸš¨ Quick Fixes

### "Cannot read property of null"
**Fix:** Logout dan login ulang

### "Network error"
**Fix:** Check backend running di port 8787

### "CORS error"
**Fix:** Tambahkan CORS headers di backend

### "Token expired"
**Fix:** Auto-redirect ke login (sudah di-handle otomatis)

### Data tidak update
**Fix:** Hard refresh (Ctrl + Shift + R)

---

## ðŸ“ž Masih Bermasalah?

### Langkah Debugging:

1. **Buka DevTools** (F12)
2. **Console Tab** - Copy semua error
3. **Network Tab** - Screenshot request yang failed
4. **Application Tab** â†’ Storage â†’ Local Storage
   - Copy: `auth_token` dan `user_data`

5. **Report ke Developer** dengan info:
   - Screenshot error
   - Console logs
   - Network request/response
   - Browser & version
   - Environment (local/production)

---

## âœ… Checklist Sebelum Report Bug

- [ ] Sudah logout dan login ulang?
- [ ] Backend sudah running?
- [ ] Environment variable sudah benar?
- [ ] Token masih valid? (cek di localStorage)
- [ ] Submission sudah approved?
- [ ] Hard refresh sudah dicoba?
- [ ] Clear cache sudah dicoba?

---

**Last Updated:** February 18, 2026  
**Module:** During Internship - Logbook


## FRONTEND_DOCS.md

# SIKP Frontend Documentation

Dokumentasi terpadu untuk proyek SIKP (Sistem Informasi Kerja Praktik) â€” frontend.

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
â”œâ”€â”€ assets/          # Aset statis (gambar, font)
â”œâ”€â”€ components/      # Komponen global (header, footer, ui/)
â”œâ”€â”€ contexts/        # Context providers (theme-context.tsx)
â”œâ”€â”€ feature/         # Fitur aplikasi (modular)
â”‚   â”œâ”€â”€ during-intern/   # Modul saat magang
â”‚   â”œâ”€â”€ hearing/         # Modul sidang
â”‚   â”œâ”€â”€ submission/      # Modul pengajuan
â”‚   â”œâ”€â”€ template/        # Modul template dokumen
â”‚   â”œâ”€â”€ dosen-grading/   # Modul penilaian dosen
â”‚   â””â”€â”€ ...
â”œâ”€â”€ hooks/           # Custom hooks
â”œâ”€â”€ lib/             # Utilities & config (api-client.ts, auth-client.ts)
â”œâ”€â”€ routes/          # Route files (file-based routing)
â”œâ”€â”€ app.css          # Global styles
â”œâ”€â”€ root.tsx         # Root component
â””â”€â”€ routes.ts        # Konfigurasi route
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
user_data  â†’ data profil mahasiswa dari Better Auth
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
| `/api/auth/sign-in` | POST | âœ… AKTIF | Login |
| `/api/auth/sign-up` | POST | âœ… AKTIF | Register |
| `/api/submissions/my-submissions` | GET | âœ… AKTIF | Data pengajuan mahasiswa |
| `/api/mahasiswa/profile` | GET | âš ï¸ Perlu verify | Profil mahasiswa |
| `/api/mahasiswa/internship` | GET | âš ï¸ Perlu verify | Data magang lengkap |
| `/api/mahasiswa/logbook` | GET/POST | âœ… AKTIF | Logbook entry |
| `/api/mahasiswa/logbook/:id` | GET/PUT/DELETE | âœ… AKTIF | Operasi logbook |
| `/api/mahasiswa/logbook/stats` | GET | âœ… AKTIF | Statistik logbook |

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
â”œâ”€â”€ components/       # Komponen UI modul ini
â”œâ”€â”€ hooks/            # Custom hooks
â”œâ”€â”€ pages/
â”‚   â””â”€â”€ logbook-page.tsx
â”œâ”€â”€ services/
â”‚   â”œâ”€â”€ student-api.ts   # API client untuk data mahasiswa/magang
â”‚   â””â”€â”€ logbook-api.ts   # API client untuk logbook
â”œâ”€â”€ types/            # TypeScript interfaces
â””â”€â”€ utils/
    â”œâ”€â”€ logbook-template.ts         # HTML template logbook PDF
    â””â”€â”€ generate-logbook-docx.ts    # Generate file DOCX
```

### Mekanisme Fallback

`student-api.ts` menggunakan 3 lapis fallback untuk mengambil data:

```
Tier 1 â†’ GET /api/mahasiswa/internship          (data lengkap dari backend)
         â†“ gagal
Tier 2 â†’ GET /api/mahasiswa/profile
       + GET /api/submissions/my-submissions    (gabungkan 2 sumber)
         â†“ gagal
Tier 3 â†’ localStorage user_data
       + GET /api/submissions/my-submissions    (fallback lokal)
```

### Field Mapping Backend â†’ Frontend

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
  signature?: string; // Base64 PNG â€” digunakan untuk PDF
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
  â””â”€â”€ data.mentor.signature (Base64)
        â””â”€â”€ logbook-page.tsx
              â””â”€â”€ generate-logbook-docx.ts / logbook-template.ts
                    â””â”€â”€ PDF output (gambar signature)
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
console.log('ðŸ–Šï¸ Mentor Signature:', completeData?.mentor?.signature ? 'Available âœ“' : 'Not available');
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
2. Atau manual: buka DevTools (F12) â†’ Console â†’ ketik `localStorage.clear()` â†’ refresh â†’ login ulang

**Verify token ada:**
```javascript
// Di browser console
localStorage.getItem('auth_token')
// â†’ null = belum login atau sudah logout
// â†’ string = token ada (mungkin expired di sisi server)
```

---

### Error: "Gagal memuat data magang"

**Checklist:**

- [ ] Backend running? Test: `GET [BACKEND_URL]/health`
- [ ] Token ada? `localStorage.getItem('auth_token')` bukan null
- [ ] Submission mahasiswa sudah di-approve admin?
- [ ] Cek Network tab di DevTools â€” status code berapa?

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

Jika hasilnya 404 â†’ endpoint belum di-deploy, frontend akan otomatis pakai **fallback Tier 2 / Tier 3**.

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


## FRONTEND_API_DOCS.md

# SIKP Backend â€” Frontend API Documentation

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

Status logbook: `PENDING` â†’ (submit) â†’ `PENDING` â†’ (mentor) â†’ `APPROVED` atau `REJECTED`

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
| `date` | string (YYYY-MM-DD) | âœ… | |
| `activity` | string (max 255) | âœ… | Judul singkat aktivitas |
| `description` | string | âœ… | Deskripsi detail |
| `hours` | integer | âŒ | Jumlah jam kerja |

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

> âš ï¸ Setiap mahasiswa hanya boleh dinilai **satu kali**. Gunakan PUT untuk mengubah nilai yang sudah ada.

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
| `studentUserId` | string | âœ… | userId mahasiswa |
| `kehadiran` | integer (0-100) | âœ… | Nilai kehadiran |
| `kerjasama` | integer (0-100) | âœ… | Nilai kerjasama |
| `sikapEtika` | integer (0-100) | âœ… | Nilai sikap & etika |
| `prestasiKerja` | integer (0-100) | âœ… | Nilai prestasi kerja |
| `kreatifitas` | integer (0-100) | âœ… | Nilai kreatifitas |
| `feedback` | string | âŒ | Catatan/komentar |

**Formula `totalScore`:**
```
totalScore = (kehadiran Ã— 0.2) + (kerjasama Ã— 0.3) + (sikapEtika Ã— 0.2) + (prestasiKerja Ã— 0.2) + (kreatifitas Ã— 0.1)
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
    "note": "Weights reflect the scoring formula: totalScore = Î£(score Ã— weight/100)"
  }
}
```

---

## 4.2 PUT /api/admin/penilaian/kriteria

Update kriteria penilaian. **Auth: Role `ADMIN`/`KAPRODI`/`WAKIL_DEKAN`.**

> âš ï¸ Total `weight` dari semua kriteria **harus = 100**.

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
**Response `400`:** Total weight â‰  100, atau field wajib tidak lengkap.

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
  â†’ status: PENDING
  â†’ Mahasiswa submit (POST /:id/submit)
  â†’ Mentor review â†’ APPROVED / REJECTED
  â†’ Jika REJECTED: mahasiswa tidak bisa edit (harus buat baru)
```

### Alur Penilaian Mentor

```
1. Mentor login (role: PEMBIMBING_LAPANGAN)
2. GET /api/mentor/mentees â†’ lihat daftar mahasiswa
3. GET /api/mentor/logbook/:studentId â†’ review logbook
4. POST /api/mentor/logbook/:logbookId/approve â†’ approve satu-satu
   ATAU POST /api/mentor/logbook/:studentId/approve-all â†’ approve semua
5. POST /api/mentor/assessment â†’ beri nilai akhir
6. PUT /api/mentor/signature â†’ upload TTD untuk sertifikat PDF
```

### studentId vs NIM

- Semua endpoint mentor menggunakan **`userId`** (bukan NIM) sebagai `studentId`.
- `userId` tersedia di response GET mentees pada field `userId`.

### Signature (Tanda Tangan)

- Format: **Base64 Data URL** â†’ `data:image/png;base64,...`
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
| `GET` | `/api/penilaian/kriteria` | â€” (public) | Kriteria penilaian |
| `PUT` | `/api/admin/penilaian/kriteria` | ADMIN | Update kriteria |


## docs/backend-flow-pembimbing-lapangan.md

# Dokumentasi Backend: Flow Pembimbing Lapangan, Dosen PA, dan Login Email

## Tujuan
Dokumen ini menjelaskan alur yang diperlukan agar pembimbing lapangan bisa memakai aplikasi tanpa dibuatkan email baru, dengan approval oleh Dosen PA.

## Prinsip Utama
- Email pembimbing lapangan memakai email kerja yang sudah ada.
- Aplikasi tidak membuat inbox email baru.
- Saat disetujui, sistem membuat akun aplikasi dan mengirim aktivasi ke email mentor.
- Email mentor tidak diedit langsung dari profil, tetapi lewat pengajuan perubahan email.
- Dosen PA dapat melihat logbook mahasiswa secara read-only.

## Klarifikasi Email Otomatis
Yang dimaksud "otomatis" di sini bukan membuat alamat email baru seperti `nama@domain.com` dari nol. Yang dibuat otomatis adalah:
- akun aplikasi pembimbing lapangan di sistem,
- status akun mentor (active/verified),
- token aktivasi atau magic link,
- email notifikasi/invitation ke alamat email yang sudah dimiliki mentor.

Jadi, backend hanya perlu mengelola akun aplikasi dan pengiriman email undangan/aktivasi. Pembuatan inbox email baru tidak termasuk scope aplikasi ini.

## Ringkasan Flow
```text
Mahasiswa mengajukan mentor
  â†“
Pengajuan masuk status pending
  â†“
Dosen PA review
  â†“
Jika approve â†’ buat akun aplikasi mentor + kirim aktivasi ke email mentor
Jika reject  â†’ tandai rejected + kirim notifikasi penolakan
```

## Alur Registrasi Pembimbing Lapangan
1. Mahasiswa mengisi data pembimbing lapangan.
2. Data masuk ke status pending.
3. Dosen PA meninjau pengajuan.
4. Jika disetujui, backend:
   - Membuat akun mentor jika belum ada.
   - Menandai mentor sebagai verified/active.
   - Mengirim email aktivasi atau magic link.
5. Jika ditolak, status menjadi rejected dan mahasiswa diberi notifikasi.

## Alur Login Mentor
- Mentor login menggunakan email kerja yang terdaftar.
- Rekomendasi implementasi: magic link atau invitation link.
- Jika memakai password, mentor set password pertama kali setelah aktivasi.

## Perubahan Email Mentor
- Field email di profil mentor read-only.
- Mentor dapat mengajukan perubahan email beserta alasan.
- Dosen PA/Admin meninjau pengajuan.
- Jika disetujui, email akun diperbarui dan token/aktivasi baru dikirim.
- Jika ditolak, email tetap tidak berubah.

## Monitoring Logbook oleh Dosen PA
- Dosen PA hanya melihat logbook mahasiswa.
- Tidak ada aksi approve/reject pada logbook.
- Data yang ditampilkan minimal: mahasiswa, NIM, perusahaan, mentor, tanggal, aktivitas, dan status.

## Endpoint yang Diperlukan

### Format response umum yang disarankan
Semua endpoint sebaiknya mengembalikan format berikut agar konsisten dengan frontend:
```json
{
  "success": true,
  "message": "string",
  "data": {},
  "errors": []
}
```

### Persetujuan Pembimbing Lapangan
| Method | Endpoint | Fungsi | Catatan |
| --- | --- | --- | --- |
| GET | `/api/dosen/pembimbing-lapangan/requests` | Ambil daftar pengajuan mentor | Hanya untuk role Dosen PA/Admin |
| POST | `/api/dosen/pembimbing-lapangan/:id/approve` | Setujui pengajuan mentor | Membuat/aktivasi akun mentor |
| POST | `/api/dosen/pembimbing-lapangan/:id/reject` | Tolak pengajuan mentor | Status menjadi rejected |

### Pengajuan Perubahan Email Mentor
| Method | Endpoint | Fungsi | Catatan |
| --- | --- | --- | --- |
| POST | `/api/mentor/email-change-requests` | Buat pengajuan perubahan email | Diisi mentor dari profil |
| GET | `/api/dosen/mentor-email-change-requests` | Ambil daftar pengajuan email | Untuk Dosen PA/Admin |
| POST | `/api/dosen/mentor-email-change-requests/:id/approve` | Setujui perubahan email | Update email akun mentor |
| POST | `/api/dosen/mentor-email-change-requests/:id/reject` | Tolak perubahan email | Email lama tetap aktif |

### Aktivasi Akun Mentor
| Method | Endpoint | Fungsi | Catatan |
| --- | --- | --- | --- |
| POST | `/api/auth/mentor/invite` | Kirim email aktivasi / magic link | Dipanggil saat approve |
| POST | `/api/auth/mentor/activate` | Verifikasi token aktivasi | Token one-time use |
| POST | `/api/auth/mentor/set-password` | Set password awal | Jika flow memakai password |

### Monitoring Logbook Dosen PA
| Method | Endpoint | Fungsi | Catatan |
| --- | --- | --- | --- |
| GET | `/api/dosen/logbook-monitor` | Ambil daftar logbook mahasiswa | Read-only |
| GET | `/api/dosen/logbook-monitor/:studentId` | Ambil detail logbook mahasiswa | Optional |

## Format Data yang Disarankan

### Pengajuan Pembimbing Lapangan
```json
{
  "id": "req_123",
  "mentorName": "Ahmad Fauzi",
  "email": "ahmad.fauzi@company.com",
  "nip": "198501012010011001",
  "company": "PT Teknologi Nusantara",
  "position": "Senior Software Engineer",
  "phone": "081234567890",
  "student": {
    "id": "mhs_001",
    "name": "Budi Santoso",
    "nim": "2021110001",
    "email": "budi.santoso@student.ac.id"
  },
  "status": "pending",
  "createdAt": "2026-04-03T10:00:00Z"
}
```

### Pengajuan Perubahan Email
```json
{
  "id": "emailchg_123",
  "mentorId": "mnt_001",
  "mentorName": "Ahmad Fauzi",
  "currentEmail": "ahmad.fauzi@company.com",
  "requestedEmail": "a.fauzi@company.com",
  "reason": "Email kerja resmi yang aktif",
  "status": "pending",
  "requestedAt": "2026-04-03T10:00:00Z"
}
```

### Logbook Monitoring
```json
{
  "id": "lb_001",
  "studentId": "mhs_001",
  "studentName": "Budi Santoso",
  "nim": "2021110001",
  "company": "PT Teknologi Nusantara",
  "mentorName": "Ahmad Fauzi",
  "activity": "Implementasi dashboard",
  "date": "2026-04-02",
  "status": "PENDING"
}
```

## Aturan Bisnis
- Email harus unik.
- Token aktivasi harus one-time use dan expired.
- Semua aksi approve/reject wajib masuk audit log.
- Alur mentor harus minim friksi untuk pihak eksternal.
- Jika backend belum siap, frontend bisa memakai mock sementara.

## Acceptance Criteria
- Mentor dapat login dengan email aktif yang disetujui.
- Mentor tidak perlu membuat inbox email baru.
- Email tidak bisa diubah langsung dari profil.
- Pengajuan perubahan email dapat dibuat dari frontend.
- Dosen PA dapat approve/reject pengajuan email.
- Dosen PA dapat melihat logbook mahasiswa secara read-only.

## Checklist Implementasi Backend
- [ ] Siapkan endpoint approval pembimbing lapangan.
- [ ] Siapkan endpoint pengajuan perubahan email mentor.
- [ ] Siapkan endpoint kirim aktivasi / magic link mentor.
- [ ] Pastikan email unik dan tervalidasi sebelum approve.
- [ ] Tambahkan audit log untuk approve/reject.
- [ ] Tambahkan notifikasi email ke mentor saat approval atau perubahan email disetujui.
- [ ] Pastikan logbook monitoring hanya bisa diakses read-only.


## CHANGELOG_MERGE_COMPLETE.md

# ðŸ“‹ CHANGELOG - Merge Selesai & Integrasi API Saat Magang

**Commit**: `02246fd1a6bc10eb07a5c06d2b4b5a0e59e1149f`  
**Branch**: `Generate-Saat-Magang` â†’ Origin/Generate-Saat-Magang  
**Tanggal**: Mar 31 23:56:45 2026 +0700  
**Penulis**: Mvb1n <mukarrobinujiantik@gmail.com>

---

## ðŸ“Š Ringkasan Statistik Perubahan

```
Total File Berubah: 90 file
Total Penambahan: 11,125 baris (+)
Total Pengurangan: 1,982 baris (-)
Net Perubahan: +9,143 baris
```

### Breakdown per Kategori:
| Kategori | File | Status | Tujuan |
|----------|-------|--------|--------|
| **Fitur Baru** | 35+ | Ditambah | Modul fitur, service API, utilities |
| **Dimodifikasi** | 50+ | Diupdate | Bug fixes, type corrections, API alignment |
| **Refactored** | 5+ | Dipindah/Direname | Organisasi lebih baik, konsolidasi |

---

## ðŸ”‘ Breakdown Perubahan Utama

### 1. **BARU: Dukungan Fase Saat Magang (During Internship)** â­
**File**: 
- `app/feature/during-intern/services/student-api.ts` â†’ Tambah `getCompleteInternshipData()`
- `app/lib/services/` â†’ Modul service baru

**Apa Yang Berubah**:
```typescript
// ENDPOINT BARU: GET /api/mahasiswa/internship
getCompleteInternshipData() mengembalikan {
  mahasiswa: { id, nim, nama, email, ... },
  magang: { id, status, mentorId, dosenPembimbingId, ... },
  pengajuan: { perusahaan, divisi, tanggalMulai, tanggalSelesai, ... },  // â† Dari pengajuan asli
  tim: { id, nama, totalAnggota },
  mentor: { id, nama, email, perusahaan, posisi, telepon, signature },  // â† BARU: field signature
  dosen: { id, nama, email, nip, telepon }
}
```

**Mengapa Berubah**:
- âœ… Single API call untuk SEMUA data context magang
- âœ… Referensi perusahaan & divisi dari pengajuan asli (konsistensi data)
- âœ… Dukungan signature mentor untuk dokumen PDF digital
- âœ… Tidak perlu multiple API calls

---

### 2. **BARU: Modul Surat Balasan (Response Letter)**
**File Dibuat** (35+ file):
- `response-letter/components/` â†’ Komponen UI
- `response-letter/pages/` â†’ Halaman admin & mahasiswa
- `response-letter/hooks/` â†’ Manajemen state
- `response-letter/types/` â†’ Definisi tipe
- `response-letter/utils/` â†’ Timeline & mapper utilities
- `response-letter/constants/status-config.tsx` â†’ Konfigurasi status

**Fitur**:
- âœ… Mahasiswa dapat lihat & submit surat balasan
- âœ… Admin dapat kelola & verifikasi
- âœ… Upload file & validasi
- âœ… Timeline & tracking status
- âœ… Workflow multi-step

**Tipe Utama**:
```typescript
interface DataSuratBalasan {
  id: string;
  mahasiswaId: string;
  pengajuanId: string;
  urlFile?: string;
  status: "draft" | "pending" | "verified" | "approved" | "rejected";
  alasanPenolakan?: string;
  dibuatAt: string;
  diupdateAt: string;
}
```

---

### 3. **BARU: Peningkatan Modul Sidang KP**
**File Dimodifikasi/Ditambah** (15+ file):
- `hearing/pages/verifikasi-sidang-dosen-page.tsx` â†’ Rewrite besar (306 baris berubah)
- `hearing/components/berita-acara-status.tsx` â†’ Tracking status
- `hearing/types/index.d.ts` â†’ Konsolidasi tipe
- `esignature/` â†’ Dipindah dari modul hearing

**Apa Yang Berubah**:
- âœ… Workflow approval untuk dosen
- âœ… Tracking status Berita Acara
- âœ… Integrasi e-signature
- âœ… Error handling lebih baik

**Tipe Baru Ditambah**:
```typescript
interface PropLangkahProses {
  judul: string;
  deskripsi: string;
  status: "pending" | "completed" | "failed";
  waktu?: string;
}

type StatusHistoryEntry = 
  | "submitted"
  | "reviewed"
  | "approved"
  | "jadwal_approved"      // â† BARU
  | "rejected";
```

---

### 4. **BARU: Refactoring Modul Profil**
**File**:
- `app/feature/dosen/pages/profil-page.tsx` â†’ **DIHAPUS** (503 baris)
- `app/feature/profil/pages/profil-dosen-page.tsx` â†’ **BARU** (682 baris)
- `app/feature/profil/pages/profil-mahasiswa-page.tsx` â†’ **BARU** (723 baris)
- `profil/components/esignature-dialog.tsx` â†’ **BARU**

**Mengapa Berubah**:
- âœ… Konsolidasi dari fitur dosen ke modul profil
- âœ… Dukungan profil mahasiswa juga
- âœ… E-signature setup di profil
- âœ… Organisasi kode lebih baik & reusable

---

### 5. **BARU: Overhaul Modul Pengajuan**
**File Dimodifikasi/Ditambah** (20+ file):
- `submission/pages/submission-admin-page.tsx` â†’ Halaman admin baru
- `submission/pages/submission-dosen-page.tsx` â†’ Halaman dosen baru
- `submission/pages/submission-page.tsx` â†’ Enhanced (610 baris berubah)
- `submission/utils/submission-mapper.ts` â†’ Rewrite besar (511 baris)
- `submission/utils/timeline-builder.ts` â†’ **BARU** (268 baris)
- `submission/constants/document-types.ts` â†’ **BARU** (49 baris)
- `submission/constants/status-config.tsx` â†’ **BARU** (89 baris)
- `submission/types/index.d.ts` â†’ Diperluas (75 baris)

**Fitur Baru**:
- âœ… Dashboard admin untuk kelola semua pengajuan
- âœ… Dosen dapat approve/reject pengajuan
- âœ… Klasifikasi tipe dokumen
- âœ… Manajemen workflow status
- âœ… Visualisasi timeline

**Tipe Utama**:
```typescript
interface DataPengajuan {
  id: string;
  timId: string;
  perusahaan: string;
  divisi: string;
  alamat: string;
  dokumen: DokumenUpload[];
  status: StatusPengajuan;
  tanggalMulai: string;
  tanggalSelesai: string;
  catatanApproval?: string;
  dibuatAt: string;
  diupdateAt: string;
}

type StatusPengajuan = 
  | "draft"
  | "submitted"
  | "rejected"
  | "revision_needed"
  | "approved_admin"
  | "waiting_dosen_approval"
  | "approved_dosen"
  | "dosen_rejected";
```

---

### 6. **BARU: Konsolidasi Service Layer**
**File Dibuat** (8 file service baru):
- `app/lib/services/dosen-api.ts` â†’ Operasi dosen
- `app/lib/services/mahasiswa-api.ts` â†’ Operasi mahasiswa
- `app/lib/services/submission-api.ts` â†’ Operasi pengajuan
- `app/lib/services/response-letter-api.ts` â†’ Operasi surat balasan
- `app/lib/services/surat-pengantar-dosen-api.ts` â†’ API surat
- `app/lib/services/surat-permohonan-api.ts` â†’ API surat
- `app/lib/services/surat-kesediaan-api.ts` â†’ API surat
- `app/lib/services/letter-request-status-api.ts` â†’ Tracking status

**Mengapa Dibuat**:
- âœ… Manajemen API terpusat
- âœ… API calls aman dengan type
- âœ… Standardisasi error handling
- âœ… Organisasi kode lebih baik

---

### 7. **DIUPDATE: Auth & Autentikasi**
**File Dimodifikasi**:
- `app/lib/auth-client.ts` â†’ Enhanced registration payload

**Apa Yang Berubah**:
```typescript
// Sebelum
daftarMahasiswa(data): {
  nim, nama, email, telepon, prodi, fakultas, semester, angkatan
}

// Sesudah - Field opsional dengan default fallback
daftarMahasiswa(data): {
  nim, nama, email, 
  telepon?: string,          // â† Dibuat opsional
  prodi, 
  fakultas?: string,         // â† Dibuat opsional
  semester?: number,         // â† Dibuat opsional
  angkatan?: string          // â† Dibuat opsional
}
```

**Mengapa Berubah**:
- âœ… Fleksibilitas dalam form registrasi
- âœ… Default fallback untuk field yang hilang
- âœ… Error resilience lebih baik

---

### 8. **DIUPDATE: Komponen UI**
**File Dibuat/Diupdate**:
- `app/components/ui/calendar.tsx` â†’ **BARU** (69 baris)
- `app/components/ui/popover.tsx` â†’ **BARU** (29 baris)
- `app/components/ui/badge.tsx` â†’ Diupdate
- `app/components/ui/tooltip.tsx` â†’ Diperbaiki

**Dependency Baru Ditambah**:
- `@radix-ui/react-popover` â†’ Untuk popover date picker
- `date-fns` â†’ Utilities tanggal
- `react-day-picker` â†’ Komponen kalender

---

### 9. **DIPERBAIKI: Koreksi Path Import**
**File Diperbaiki** (15+ file):
- `hearing/components/pengajuan-card.tsx` â†’ `"../types/dosen"` â†’ `"../types"`
- `response-letter/components/file-upload.tsx` â†’ Koreksi path
- File lainnya yang serupa

**Mengapa Diperbaiki**:
- âœ… Konsolidasi dari `types/dosen.d.ts` â†’ `types/index.d.ts`
- âœ… Mengurangi fragmentasi
- âœ… Tipe definitions terpusat

---

### 10. **DIPERBAIKI: Ekspansi Union Tipe Template**
**File Dimodifikasi**:
- `app/feature/template/types/template.types.ts`

**Apa Yang Berubah**:
```typescript
// Sebelum
type TipeTemplate = "surat-pengantar" | "surat-permohonan"

// Sesudah - Tipe baru ditambah
type TipeTemplate = 
  | "surat-pengantar"
  | "surat-permohonan"
  | "surat-kesediaan"      // â† BARU
  | "berita-acara"         // â† BARU
```

**Mengapa Berubah**:
- âœ… Dukungan untuk tipe surat baru
- âœ… Konsistensi template

---

### 11. **DIHAPUS: File yang Dihapus**
**File Dihapus** (2 file):
- `app/feature/dosen/pages/profil-page.tsx` (503 baris) â†’ Dipindah ke modul `profil/`
- `app/feature/hearing/types/dosen.d.ts` (30 baris) â†’ Dikonsolidasi ke `hearing/types/index.d.ts`

**File Direname/Dipindah**:
- `hearing/surat-preview.tsx` â†’ `hearing/preview-berita-acara.tsx` (rename)
- `hearing/types/esignature.ts` â†’ `esignature/types/esignature.ts` (dipindah)

**Mengapa Dihapus**:
- âœ… Organisasi kode lebih baik
- âœ… Hindari duplikasi
- âœ… Tipe definitions terpusat

---

## ðŸ”Œ Integrasi API Backend - Fase Saat Magang

### Endpoint: `GET /api/mahasiswa/internship` â­

**Tujuan**: Ambil SEMUA data context magang dalam SATU API call

**Struktur Response**:
```json
{
  "success": true,
  "message": "Data magang berhasil diambil",
  "data": {
    "mahasiswa": {
      "id": "1",
      "userId": "1",
      "nim": "17051234",
      "nama": "John Doe",
      "email": "john@unsri.ac.id",
      "telepon": "081234567890",
      "prodi": "Teknik Informatika",
      "fakultas": "Teknik",
      "angkatan": "2017",
      "semester": 8
    },
    "magang": {
      "id": "1",
      "mahasiswaId": "1",
      "pengajuanId": "1",
      "timId": "1",
      "status": "AKTIF",
      "mentorId": "1",
      "dosenPembimbingId": "1",
      "dibuatAt": "2026-03-01T10:00:00Z",
      "diupdateAt": "2026-03-01T10:00:00Z"
    },
    "pengajuan": {
      "id": "1",
      "timId": "1",
      "perusahaan": "PT. Indonesia Digital",
      "divisi": "Backend Development",
      "alamat": "Jl. Sudirman No. 123, Jakarta",
      "tanggalMulai": "2026-02-01",
      "tanggalSelesai": "2026-04-30",
      "status": "APPROVED"
    },
    "tim": {
      "id": "1",
      "nama": "Tim A",
      "totalAnggota": 3
    },
    "mentor": {
      "id": "1",
      "nama": "Budi Santoso",
      "email": "budi.santoso@company.com",
      "perusahaan": "PT. Indonesia Digital",
      "posisi": "Senior Developer",
      "telepon": "081234567890",
      "signature": "data:image/png;base64,iVBORw0KGgo..."  // â† Base64 PNG/PDF signature
    },
    "dosen": {
      "id": "1",
      "nama": "Dr. Ahmad Wijaya",
      "email": "ahmad.wijaya@unsri.ac.id",
      "nip": "197501011999031001",
      "telepon": "082123456789"
    }
  }
}
```

### Endpoint Logbook Terkait:
```
POST   /api/mahasiswa/logbook           Buat entry logbook
GET    /api/mahasiswa/logbook           Ambil semua logbook
GET    /api/mahasiswa/logbook/:id       Ambil satu logbook
PUT    /api/mahasiswa/logbook/:id       Update entry logbook
DELETE /api/mahasiswa/logbook/:id       Hapus logbook (PENDING only)
GET    /api/mahasiswa/logbook/stats     Ambil statistik logbook
```

### Cara Pakai di Frontend:

```typescript
import { getCompleteInternshipData } from "~/feature/during-intern/services/student-api";
import type { CompleteInternshipData } from "~/feature/during-intern/services/student-api";

function HalamanMagang() {
  const [data, setData] = useState<CompleteInternshipData | null>(null);

  useEffect(() => {
    async function ambilData() {
      const response = await getCompleteInternshipData();
      if (response.success) {
        setData(response.data);
      }
    }
    ambilData();
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h1>Data Magang untuk {data.mahasiswa.nama}</h1>
      <p>Perusahaan: {data.pengajuan.perusahaan}</p>
      <p>Divisi: {data.pengajuan.divisi}</p>
      <p>Mentor: {data.mentor?.nama}</p>
      <p>Tanggal Mulai: {data.pengajuan.tanggalMulai}</p>
      <p>Tanggal Selesai: {data.pengajuan.tanggalSelesai}</p>
    </div>
  );
}
```

### Fitur Utama:
âœ… **Single API Call** - Tidak perlu multiple endpoints  
âœ… **Konsistensi Data Perusahaan** - Data dari pengajuan asli  
âœ… **Dukungan Mentor** - Info mentor included jika sudah di-assign  
âœ… **E-Signature Ready** - Signature mentor tersedia dalam format Base64  
âœ… **Traceability** - Bisa trace balik ke pengajuan via `pengajuanId`

---

## ðŸ“ Definisi Tipe Ditambah/Diupdate

### CompleteInternshipData
```typescript
export interface CompleteInternshipData {
  mahasiswa: ProfilMahasiswa;
  magang: RecordMagang;
  pengajuan: RecordPengajuan;
  tim?: RecordTim;
  mentor?: RecordMentor;      // â† BARU: field signature untuk PDF
  dosen?: RecordDosen;
}
```

### PropLangkahProses (Sidang)
```typescript
export interface PropLangkahProses {
  judul: string;
  deskripsi: string;
  status: "pending" | "completed" | "failed";
  waktu?: string;
}
```

### DataPengajuan
```typescript
export interface DataPengajuan {
  id: string;
  timId: string;
  perusahaan: string;
  divisi: string;
  alamat: string;
  dokumen: DokumenUpload[];
  status: StatusPengajuan;
  tanggalMulai: string;
  tanggalSelesai: string;
  catatanApproval?: string;
  dibuatAt: string;
  diupdateAt: string;
}
```

### DataSuratBalasan
```typescript
export interface DataSuratBalasan {
  id: string;
  mahasiswaId: string;
  pengajuanId: string;
  urlFile?: string;
  status: StatusSuratBalasan;
  alasanPenolakan?: string;
  dibuatAt: string;
  diupdateAt: string;
}
```

---

## âœ… Validasi & Test

### Kompilasi TypeScript
```
Hasil: âœ… LULUS (0 errors)
Perintah: pnpm run typecheck
Detail: Semua 90 file yang dimodifikasi pass type checking
```

### Production Build
```
Hasil: âœ… LULUS
Perintah: pnpm run build
Detail: 2,454 modules transformed
Output: build/client/ artifacts generated
```

### Git Status
```
Hasil: âœ… BERSIH
Branch: Generate-Saat-Magang
Branches: origin/Generate-Saat-Magang
Tidak ada changes unstaged
Siap untuk push & PR
```

---

## ðŸš€ Langkah Berikutnya

### 1. Push ke Remote
```bash
git push origin Generate-Saat-Magang
```

### 2. Buat Pull Request
- Target: branch `develop` atau `main`
- Judul: `feat: add saat-magang phase with response-letter and profil modules`
- Deskripsi: Gunakan changelog ini sebagai deskripsi PR

### 3. Focus Area Code Review
- Response Letter workflow (35+ file baru)
- Overhaul modul Submission (20+ file berubah)
- Integrasi API untuk fase internship
- Implementasi e-signature
- Konsolidasi service layer

### 4. Testing Checklist
- [ ] Typecheck pass
- [ ] Build berhasil
- [ ] Semua imports resolve dengan benar
- [ ] API endpoints tested
- [ ] Workflow surat balasan tested
- [ ] Setup e-signature tested
- [ ] Profil page render dengan benar
- [ ] Halaman admin/dosen pengajuan berfungsi

---

## ðŸ“š Referensi Dokumentasi

### Dokumentasi Modul:
- [Integrasi API Saat Magang](./app/feature/during-intern/API_INTEGRATION.md)
- [Setup Surat Balasan](./app/feature/response-letter/README.md) *(jika ada)*
- [Modul Pengajuan](./app/feature/submission/) *(perlu dokumentasi)*

### Kode Convention:
- Lihat [CODE_CONVENTION.md](./CODE_CONVENTION.md)

### File Terkait:
- [Frontend API Docs](./FRONTEND_API_DOCS.md)
- [Frontend Docs](./FRONTEND_DOCS.md)

---

## ðŸ’¾ Detail Commit

| Field | Value |
|-------|-------|
| Hash Commit | `02246fd1a6bc10eb07a5c06d2b4b5a0e59e1149f` |
| Pesan | `fix(merge): resolve type/import conflicts and align service contracts` |
| Penulis | Mvb1n <mukarrobinujiantik@gmail.com> |
| Tanggal | Mar 31 23:56:45 2026 +0700 |
| Branch | Generate-Saat-Magang |
| File Berubah | 90 |
| Penambahan | 11,125 |
| Pengurangan | 1,982 |

---

**Status**: âœ… Siap Production | â³ Menunggu Push & PR


## PR_BODY_DESCRIPTION.md

# Pull Request: Fase Saat Magang & Integrasi Surat Balasan

## ðŸ“Œ Ringkasan
Merge fitur "Saat Magang" (During Internship) + "Surat Balasan" yang menambahkan:
- âœ… Fase magang lengkap dengan logbook & penilaian
- âœ… Modul surat balasan (pengajuan & verifikasi)
- âœ… Integrasi API backend untuk SEMUA data magang
- âœ… Dukungan e-signature untuk dokumen digital
- âœ… Refactoring profil & konsolidasi service layer

**Commit**: `02246fd` | **Files**: 90 | **+11,125 baris** | **-1,982 baris**

---

## ðŸ”§ Perubahan Utama

### 1. **Baru: API Saat Magang** â­
Endpoint `GET /api/mahasiswa/internship` yang mengembalikan **semua data context dalam satu call**:
```
mahasiswa + magang + pengajuan + tim + mentor + dosen
```
- âœ… Tidak perlu multiple API calls
- âœ… Data perusahaan/divisi dari pengajuan asli (konsistensi)
- âœ… Dukungan signature mentor untuk PDF

### 2. **Baru: Modul Surat Balasan**
- âœ… Mahasiswa dapat submit & track surat balasan
- âœ… Admin dapat verifikasi & approve
- âœ… Validasi upload file
- âœ… Timeline & workflow status

### 3. **Diperkuat: Modul Pengajuan**
- âœ… Dashboard admin untuk mengelola semua pengajuan
- âœ… Workflow approval dosen
- âœ… Klasifikasi tipe dokumen
- âœ… Tracking status & timeline

### 4. **Diperbaiki: Modul Sidang KP**
- âœ… Halaman verifikasi dosen (rewrite besar)
- âœ… Tracking status Berita Acara
- âœ… Integrasi e-signature
- âœ… Handling error lebih baik

### 5. **Refactored: Modul Profil**
- âœ… Konsolidasi: `dosen/pages/profil-page.tsx` â†’ `profil/pages/`
- âœ… Dukungan profil mahasiswa juga
- âœ… Integrasi e-signature setup
- âœ… Organisasi kode lebih baik

### 6. **Baru: Service Layer**
8 file service baru untuk centralized API management:
- `dosen-api.ts`, `mahasiswa-api.ts`, `submission-api.ts`
- `response-letter-api.ts`, `surat-*-api.ts`, dll.
- Standardisasi error handling & type safety

### 7. **Diperbaiki: Type & Import Issues**
- âœ… 43 TypeScript errors terselesaikan
- âœ… Koreksi path import (konsolidasi `types/dosen` â†’ `types/index`)
- âœ… Ekspansi union types (TemplateType, StatusConfig)
- âœ… Fixes barrel export collision

### 8. **Diperbarui: Dependency Baru**
- `@radix-ui/react-popover` - Date picker popover
- `date-fns` - Utilities tanggal
- `react-day-picker` - Komponen kalender

---

## âœ… Hasil Validasi

| Check | Status | Detail |
|-------|--------|--------|
| TypeScript | âœ… PASS | 0 errors di 90 file yang dimodifikasi |
| Build | âœ… PASS | 2,454 modules, build/client/ generated |
| Git Status | âœ… BERSIH | Tidak ada changes unstaged, siap push |

---

## ðŸ”„ Catatan Migrasi

### Dependency Backend:
- Memerlukan: endpoint `GET /api/mahasiswa/internship`
- Memerlukan: endpoints `/api/mahasiswa/logbook/*`
- Opsional: Field signature mentor (format Base64)

### Breaking Changes Frontend:
- Tidak ada - semua changes bersifat aditif atau refactoring internal
- Path import diupdate otomatis via konsolidasi

### Migrasi Database:
- Tidak ada DB changes - menggunakan submissions & internships yang sudah ada
- Review schema backend untuk field signature jika akan diimplementasi

---

## ðŸ“‹ Checklist Testing

- [ ] Typecheck pass: `pnpm run typecheck`
- [ ] Build berhasil: `pnpm run build`
- [ ] Workflow surat balasan tested
- [ ] Halaman admin/dosen pengajuan berfungsi
- [ ] Setup e-signature berfungsi
- [ ] Halaman profil render dengan benar
- [ ] API endpoints merespons dengan benar
- [ ] Tidak ada console errors di browser

---

## ðŸ“š Dokumentasi Terkait

- Lihat [CHANGELOG_MERGE_COMPLETE.md](./CHANGELOG_MERGE_COMPLETE.md) untuk detail lengkap
- Lihat [API_INTEGRATION.md](./app/feature/during-intern/API_INTEGRATION.md) untuk detail API Saat Magang
- Lihat [CODE_CONVENTION.md](./CODE_CONVENTION.md) untuk standar coding

---

## ðŸŽ¯ Langkah Selanjutnya

1. âœ… Code review
2. â³ Approve & merge ke `develop`
3. â³ Deploy ke staging untuk testing QA
4. â³ Merge ke `main` untuk rilis production

**Closes**: #[issue-number] *(jika ada)*

## Embedded Document Folder Contents

Semua file dari folder document disalin apa adanya ke bagian ini.

## document/API_INTEGRATION.md

```markdown
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

## 📞 Support

**Backend Team Contact:**
- Lihat [FRONTEND_TEAM_NOTES.md](../../../FRONTEND_TEAM_NOTES.md) untuk contact info

**Issues & Questions:**
- Create issue di repository
- Tag: `api-integration`, `during-intern`

---

## ✅ Checklist Integration Complete

- [x] Update `student-api.ts` dengan CompleteInternshipData
- [x] Update `logbook-api.ts` dengan endpoint backend yang benar
- [x] Update `logbook-page.tsx` untuk menggunakan API baru
- [x] Verify TypeScript no errors
- [x] Document integration di API_INTEGRATION.md
- [ ] Manual testing dengan backend running
- [ ] Deployment ke staging

---

**Last Updated:** February 11, 2026  
**Integration Status:** ✅ COMPLETE & READY
```

## document/E-SIGNATURE_FLOW.md

```markdown
# E-Signature Flow - SIKP

## Alur E-Signature untuk Berita Acara Sidang

### 1. Dosen Membuat E-Signature

**Lokasi**: [Verifikasi Sidang Dosen Page](app/feature/hearing/pages/verifikasi-sidang-dosen-page.tsx)

- Dosen harus membuat e-signature terlebih dahulu sebelum bisa menyetujui pengajuan
- Klik tombol "Setup E-Signature" di header
- Pilih salah satu metode:
  - **Draw**: Menggambar tanda tangan menggunakan canvas
  - **Upload**: Upload gambar tanda tangan (max 2MB, format: PNG, JPG, JPEG)
  - **Text**: Ketik nama yang akan di-style sebagai tanda tangan
- E-signature disimpan di `localStorage` dengan key `dosen-esignature`

### 2. Dosen Menyetujui Pengajuan

**Lokasi**: [Verifikasi Sidang Dosen Page](app/feature/hearing/pages/verifikasi-sidang-dosen-page.tsx)

- Jika dosen belum membuat e-signature, akan muncul warning dan dialog untuk membuat signature
- Ketika klik "Setujui Pengajuan":
  - System mengecek apakah e-signature ada
  - Jika ada, proses approval dengan menambahkan signature ke berita acara
  - Berita acara yang sudah di-sign disimpan dengan informasi:
    ```typescript
    {
      ...beritaAcara,
      status: "approved",
      dosenSignature: {
        nama: "Dr. Ahmad Santoso, M.Kom",
        nip: "198501012010121001",
        signatureImage: "data:image/png;base64,...",
        signedAt: "2025-11-24T10:30:00"
      },
      documentUrl: "/api/documents/PGJ-001/signed"
    }
    ```

### 3. Berita Acara Terkirim ke Mahasiswa

**Cara Kerja Saat Ini (Development)**:
- Berita acara yang sudah di-approve disimpan ke `localStorage` dengan key `berita-acara-draft`
- Mahasiswa akan load data ini saat membuka halaman pengujian sidang

**Cara Kerja di Production (Recommended)**:
- API endpoint: `POST /api/berita-acara/{id}/approve`
- Request body berisi signature dan data approval
- Backend generate PDF/DOCX dengan signature embedded
- Document disimpan di storage (S3/Cloud Storage)
- Notification dikirim ke mahasiswa (email/push notification)
- Mahasiswa akses melalui API: `GET /api/berita-acara/{id}`

### 4. Mahasiswa Melihat & Download Berita Acara

**Lokasi**: [Pengujian Sidang Page](app/feature/hearing/pages/pengujian-sidang-page.tsx)

- Jika `beritaAcara.status === "approved"`, tampilan berubah menjadi download view
- Komponen yang ditampilkan: [BeritaAcaraDownload](app/feature/hearing/components/berita-acara-download.tsx)
- Mahasiswa dapat:
  - Melihat detail berita acara
  - Melihat informasi dosen yang menandatangani
  - Melihat waktu penandatanganan digital
  - Download dokumen dalam format PDF atau DOCX

### File yang Dimodifikasi

1. **Types**:
   - `app/feature/hearing/types/index.d.ts` - Tambahan field `dosenSignature` dan `documentUrl`
   - `app/feature/hearing/types/esignature.ts` - Type definitions untuk e-signature

2. **Components**:
   - `app/feature/hearing/components/esignature-setup.tsx` - Setup e-signature component
   - `app/feature/hearing/components/berita-acara-download.tsx` - Download view component

3. **Pages**:
   - `app/feature/hearing/pages/verifikasi-sidang-dosen-page.tsx` - Approval dengan e-signature
   - `app/feature/hearing/pages/pengujian-sidang-page.tsx` - Conditional rendering (download vs form)

### Template Document (Belum Diimplementasi)

**User Notes**: "saya belum siapkan templatenya"

Untuk implementasi penuh, diperlukan:

1. **PDF Template**:
   - Format: PDF dengan form fields
   - Library: `pdf-lib` atau `pdfkit`
   - Template fields: judul, tempat, tanggal, waktu, mahasiswa info, area untuk signature

2. **DOCX Template**:
   - Format: DOCX dengan placeholders
   - Library: `docxtemplater` atau `docx`
   - Template variables: {{judulLaporan}}, {{tempatPelaksanaan}}, etc.

3. **Implementation Steps**:
   ```typescript
   // Backend function untuk generate document
   async function generateSignedDocument(
     beritaAcara: BeritaAcara,
     signature: DosenESignature
   ) {
     // Load template
     const template = await loadTemplate('berita-acara-template.pdf');
     
     // Fill data
     template.fill({
       judulLaporan: beritaAcara.judulLaporan,
       tempatPelaksanaan: beritaAcara.tempatPelaksanaan,
       // ... other fields
     });
     
     // Embed signature image
     template.embedImage(signature.signatureImage, {
       x: 450,
       y: 100,
       width: 100,
       height: 50
     });
     
     // Save to storage
     const documentUrl = await saveToStorage(template);
     
     return documentUrl;
   }
   ```

### Testing Flow

1. **Buka halaman Dosen** → `/verifikasi-sidang`
2. **Klik "Setup E-Signature"**
3. **Buat signature** (draw/upload/text)
4. **Pilih pengajuan mahasiswa**
5. **Klik "Setujui Pengajuan"**
6. **Cek localStorage**: `berita-acara-draft` seharusnya memiliki `dosenSignature`
7. **Buka halaman Mahasiswa** → `/pengujian-sidang`
8. **Lihat download view** dengan tombol "Unduh PDF" dan "Unduh DOCX"

### Security Considerations

1. **E-Signature Storage**:
   - Saat ini: localStorage (development only)
   - Production: Encrypted database storage
   - Tidak boleh di-expose ke client

2. **Document Verification**:
   - Tambahkan digital signature hash
   - Verifikasi integrity document
   - Timestamp dari trusted source

3. **Access Control**:
   - Hanya mahasiswa yang bersangkutan bisa download
   - Dosen bisa revoke approval jika diperlukan
   - Audit log untuk semua approval

### Next Steps

1. ✅ Setup e-signature component
2. ✅ Validation sebelum approval
3. ✅ Apply signature ke berita acara
4. ✅ Download view untuk mahasiswa
5. ⏳ Prepare document templates (PDF/DOCX)
6. ⏳ Implement document generation logic
7. ⏳ Backend API integration
8. ⏳ Real-time notification system
9. ⏳ Document verification & security

---

**Status**: Frontend implementation complete. Waiting for document templates and backend integration.
```

## document/Integrasi dari Backend 2\BACKEND_UPDATE_MENTOR_LECTURER.md

```markdown
# ✅ Backend Update: Mentor & Lecturer Data Implemented

**Tanggal:** 20 Februari 2026  
**Status:** ✅ COMPLETED & READY FOR TESTING  
**Requested by:** Frontend Team  
**Implemented by:** Backend Team  

---

## 🎉 Summary

Endpoint **GET /api/mahasiswa/internship** telah berhasil diupdate dengan data mentor dan lecturer lengkap sesuai requirement dari frontend team.

---

## 📊 What's Changed

### Endpoint: GET /api/mahasiswa/internship

**Before:**
```json
{
  "success": true,
  "data": {
    "student": {...},
    "submission": {...},
    "internship": {
      "id": 2,
      "status": "ACTIVE",
      "pembimbingLapanganId": "xxx",  // ❌ Hanya ID
      "pembimbingDosenId": "yyy"
    }
  }
}
```

**Now (After Update):**
```json
{
  "success": true,
  "message": "Internship data retrieved successfully",
  "data": {
    "student": {
      "id": "clx...",
      "nim": "2021110001",
      "name": "Budi Santoso",
      "email": "budi@student.ac.id",
      "prodi": "Teknik Informatika",
      "fakultas": "Fakultas Teknik",
      "angkatan": "2021",
      "semester": 6
    },
    "submission": {
      "id": "clx...",
      "teamId": "clx...",
      "company": "PT ABC Indonesia",
      "companyAddress": "Jl. Sudirman No. 123",
      "division": "IT Development",
      "startDate": "2026-03-01",
      "endDate": "2026-06-01",
      "status": "APPROVED",
      "submittedAt": "2026-02-15T10:30:00Z",
      "approvedAt": "2026-02-17T14:20:00Z"
    },
    "internship": {
      "id": "clx...",
      "status": "AKTIF",
      "studentId": "clx...",
      "submissionId": "clx...",
      "mentorId": "clx...",
      "supervisorId": "clx...",
      "startDate": "2026-03-01",
      "endDate": "2026-06-01",
      "createdAt": "2026-02-17T15:00:00Z",
      "updatedAt": "2026-02-17T15:00:00Z"
    },
    "mentor": {                          // ✅ NEW FIELD
      "id": "clx...",
      "name": "Ahmad Mentor",
      "email": "ahmad.mentor@company.com",
      "company": "PT ABC Indonesia",
      "position": "Senior Developer",
      "phone": "081234567890",
      "signature": "data:image/png;base64,iVBORw0KGgo..."  // ✅ CRITICAL untuk PDF
    },
    "lecturer": {                        // ✅ NEW FIELD
      "id": "clx...",
      "name": "Dr. Siti Pembimbing",
      "email": "siti@university.ac.id",
      "nip": "198501012010012001",
      "phone": "081234567891",
      "jabatan": "Lektor Kepala"
    }
  }
}
```

---

## 🔧 Backend Changes

### 1. Repository Layer (`mahasiswa.repository.ts`)

**Updated:** `getInternshipData()` method

**Changes:**
- ✅ Added LEFT JOIN to `pembimbing_lapangan` table
- ✅ Added LEFT JOIN to `dosen` table
- ✅ Added secondary queries to fetch user details for mentor and lecturer
- ✅ Returns combined data with `mentorUserData` and `lecturerUserData`

**SQL Flow:**
```sql
-- Main query
SELECT * FROM users
INNER JOIN mahasiswa ...
INNER JOIN submissions ...
LEFT JOIN internships ...
LEFT JOIN pembimbing_lapangan ...  -- ✅ NEW
LEFT JOIN dosen ...                -- ✅ NEW

-- Secondary query for mentor user details (if mentor exists)
SELECT id, nama, email, phone FROM users WHERE id = mentor_id

-- Secondary query for lecturer user details (if lecturer exists)
SELECT id, nama, email, phone FROM users WHERE id = lecturer_id
```

### 2. Service Layer (`mahasiswa.service.ts`)

**Updated:** `getInternshipData()` method

**Changes:**
- ✅ Added `mentor` object mapping
- ✅ Added `lecturer` object mapping
- ✅ Handles null cases properly (when mentor/lecturer not assigned)
- ✅ Returns signature field for PDF generation

**Mapping Logic:**
```typescript
mentor: data.pembimbingLapanganId && data.mentorUserData ? {
  id: data.pembimbingLapanganId,
  name: data.mentorUserData.nama || '',
  email: data.mentorUserData.email || '',
  company: data.mentorCompany || '',
  position: data.mentorPosition || '',
  phone: data.mentorUserData.phone || '',
  signature: data.mentorSignature || null,  // ✅ From pembimbing_lapangan.signature
} : null
```

### 3. Controller Layer

**No changes needed** - Controller automatically passes service response

---

## 📋 Response Field Specification

### `mentor` object (nullable)

| Field | Type | Nullable | Description | Source |
|-------|------|----------|-------------|--------|
| id | string | No | ID of mentor | internships.pembimbing_lapangan_id |
| name | string | No | Full name of mentor | users.nama (via pembimbing_lapangan.id) |
| email | string | No | Email address | users.email |
| company | string | No | Company name | pembimbing_lapangan.company_name |
| position | string | No | Job position | pembimbing_lapangan.position |
| phone | string | No | Phone number | users.phone |
| signature | string \| null | Yes | Base64 Data URI signature | pembimbing_lapangan.signature |

**Note:** `mentor` is `null` when:
- Mentor hasn't been assigned yet (`pembimbing_lapangan_id` is NULL)
- Mentor data not found in database

### `lecturer` object (nullable)

| Field | Type | Nullable | Description | Source |
|-------|------|----------|-------------|--------|
| id | string | No | ID of lecturer | internships.dosen_pembimbing_id |
| name | string | No | Full name of lecturer | users.nama (via dosen.id) |
| email | string | No | Email address | users.email |
| nip | string | No | NIP (employee ID) | dosen.nip |
| phone | string | No | Phone number | users.phone |
| jabatan | string | No | Academic position | dosen.jabatan |

**Note:** `lecturer` is `null` when:
- Lecturer hasn't been assigned yet (`dosen_pembimbing_id` is NULL)
- Lecturer data not found in database

---

## 🧪 Testing Scenarios

### Scenario 1: Mentor & Lecturer Assigned + Signature Exists ✅

**Request:**
```bash
GET /api/mahasiswa/internship
Authorization: Bearer <mahasiswa_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Internship data retrieved successfully",
  "data": {
    "student": {...},
    "submission": {...},
    "internship": {...},
    "mentor": {
      "id": "clx123",
      "name": "Ahmad Mentor",
      "email": "ahmad@company.com",
      "company": "PT ABC",
      "position": "Senior Dev",
      "phone": "081234567890",
      "signature": "data:image/png;base64,iVBORw0KGgo..."  // ✅ Ready untuk PDF
    },
    "lecturer": {
      "id": "clx456",
      "name": "Dr. Siti",
      "email": "siti@univ.ac.id",
      "nip": "198501012010012001",
      "phone": "081234567891",
      "jabatan": "Lektor Kepala"
    }
  }
}
```

**Frontend Action:** ✅ Generate PDF dengan signature mentor real

---

### Scenario 2: Mentor Assigned But No Signature ⚠️

**Response:**
```json
{
  "mentor": {
    "id": "clx123",
    "name": "Ahmad Mentor",
    "email": "ahmad@company.com",
    "company": "PT ABC",
    "position": "Senior Dev",
    "phone": "081234567890",
    "signature": null  // ⚠️ Belum setup signature
  }
}
```

**Frontend Action:** Show placeholder "Belum ada tanda tangan"

---

### Scenario 3: Mentor Not Assigned Yet 🔄

**Response:**
```json
{
  "student": {...},
  "submission": {...},
  "internship": {...},
  "mentor": null,  // 🔄 Belum di-assign
  "lecturer": null
}
```

**Frontend Action:** Show "Menunggu Pembimbing Lapangan"

---

## 🔒 Database Schema

### Table: `pembimbing_lapangan`

Field signature sudah ada di schema:

```sql
CREATE TABLE pembimbing_lapangan (
  id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255),
  position VARCHAR(100),
  company_address TEXT,
  signature TEXT,                    -- ✅ Base64 signature
  signature_set_at TIMESTAMP
);
```

**No migration needed** - field sudah exist di database.

---

## ⚡ Performance Notes

### Query Performance

**Before:**
- 1 main query (6 tables JOIN)
- 0 secondary queries
- Total: 1 database call

**After:**
- 1 main query (8 tables JOIN with LEFT JOIN mentor & lecturer)
- 0-2 secondary queries (only if mentor/lecturer exist)
- Total: 1-3 database calls

**Impact:** Minimal - secondary queries are simple SELECT by ID (indexed)

### Optimization Applied

- ✅ LEFT JOIN instead of INNER JOIN (no data loss if mentor not assigned)
- ✅ Secondary queries only executed if IDs exist
- ✅ LIMIT 1 on all queries
- ✅ Indexed lookups (users.id is PRIMARY KEY)

---

## 📝 Code Review Checklist

- ✅ Repository: LEFT JOIN pembimbing_lapangan & dosen
- ✅ Repository: Fetch user details for mentor & lecturer
- ✅ Service: Map mentor object with all required fields
- ✅ Service: Map lecturer object with all required fields
- ✅ Service: Handle null cases properly
- ✅ Service: Include signature field for PDF generation
- ✅ TypeScript: No compilation errors
- ✅ Response format: Matches frontend specification
- ✅ Backward compatible: Existing fields unchanged

---

## 🚀 Deployment

### Status: READY FOR DEPLOYMENT ✅

**Steps:**
1. ✅ Code changes completed
2. ✅ No TypeScript errors
3. ⏳ Testing in development environment
4. ⏳ Deploy to production
5. ⏳ Notify frontend team

### Environment Requirements

**No new environment variables needed**

**Database:**
- ✅ Table `pembimbing_lapangan` exists
- ✅ Field `signature` exists
- ✅ Table `dosen` exists
- ✅ Relations configured

---

## 🎯 Frontend Integration

### What Frontend Needs to Do

#### 1. Update TypeScript Types (Optional)

```typescript
// Add to existing InternshipData interface
interface InternshipData {
  student: StudentData;
  submission: SubmissionData;
  internship: InternshipInfo | null;
  mentor: MentorData | null;      // ✅ ADD THIS
  lecturer: LecturerData | null;  // ✅ ADD THIS
}

interface MentorData {
  id: string;
  name: string;
  email: string;
  company: string;
  position: string;
  phone: string;
  signature: string | null;  // Base64 Data URI
}

interface LecturerData {
  id: string;
  name: string;
  email: string;
  nip: string;
  phone: string;
  jabatan: string;
}
```

#### 2. Update PDF Generation

```typescript
// In your PDF generation service
function generateLogbookPDF(internshipData: InternshipData) {
  const { mentor } = internshipData;
  
  // Use mentor signature if available
  if (mentor?.signature) {
    // Add signature image to PDF
    pdfDoc.addImage(mentor.signature, 'PNG', x, y, width, height);
  } else {
    // Show placeholder
    pdfDoc.text('Belum ada tanda tangan', x, y);
  }
}
```

#### 3. No Code Changes Needed

Endpoint response is **backward compatible**:
- Existing fields unchanged
- New fields are additions only
- Frontend can start using mentor/lecturer data immediately

---

## 🐛 Error Handling

### Common Cases

| Case | Response | Action |
|------|----------|--------|
| Mentor not assigned | `mentor: null` | Show "Menunggu pembimbing" |
| Mentor assigned, no signature | `mentor.signature: null` | Show placeholder in PDF |
| Lecturer not assigned | `lecturer: null` | Show "Menunggu dosen pembimbing" |
| Data fetch error | 500 error | Show error message |
| No approved submission | 404 error | Show "Belum ada magang aktif" |

---

## 📊 Testing Results

### Manual Testing

**Environment:** Development (localhost:8787)

**Test 1: Valid mahasiswa with mentor**
```bash
GET /api/mahasiswa/internship
Authorization: Bearer <token>

✅ Response 200 OK
✅ mentor object present
✅ mentor.signature contains base64 string
✅ lecturer object present
```

**Test 2: Valid mahasiswa without mentor**
```bash
GET /api/mahasiswa/internship
Authorization: Bearer <token>

✅ Response 200 OK
✅ mentor: null
✅ lecturer: null
✅ Other fields intact
```

**Test 3: Invalid token**
```bash
GET /api/mahasiswa/internship
Authorization: Bearer invalid_token

✅ Response 401 Unauthorized
```

---

## 📞 Support

### For Frontend Team

**Questions?**
- Check this documentation first
- Test with Postman/Thunder Client
- Screenshot any errors

**Need Help?**
- Tag @backend-team in Slack/Discord
- Include: endpoint, request headers, error message

**Response Time:**
- Office hours: < 1 hour
- After hours: Best effort

---

## 🎉 Benefits

### For Frontend

- ✅ No need to fetch mentor data separately
- ✅ PDF generation dengan signature real
- ✅ Single API call untuk semua data
- ✅ Backward compatible (no breaking changes)

### For System

- ✅ Cleaner data flow
- ✅ Consistent response format
- ✅ Better user experience
- ✅ Production-ready PDF documents

---

## 📅 Timeline

| Time | Activity | Status |
|------|----------|--------|
| 20 Feb 09:00 | Received requirement from frontend | ✅ Done |
| 20 Feb 10:00 | Updated repository layer | ✅ Done |
| 20 Feb 10:30 | Updated service layer | ✅ Done |
| 20 Feb 11:00 | Testing & validation | ✅ Done |
| 20 Feb 11:30 | Documentation created | ✅ Done |
| 20 Feb 12:00 | **READY FOR FRONTEND TESTING** | ✅ Ready |

**Total Development Time:** ~2.5 hours ⚡

---

## ✅ Acceptance Criteria

All criteria **MET** ✅:

- ✅ GET /api/mahasiswa/internship returns `mentor` object
- ✅ `mentor.signature` contains base64 Data URI (if exists)
- ✅ `mentor` is `null` if not assigned
- ✅ `mentor.signature` is `null` if not set
- ✅ GET /api/mahasiswa/internship returns `lecturer` object
- ✅ `lecturer` is `null` if not assigned
- ✅ Response matches frontend specification
- ✅ No breaking changes to existing fields
- ✅ No TypeScript compilation errors
- ✅ Documentation complete

---

## 🚀 Next Steps

### For Backend Team

1. ✅ Code implementation complete
2. ⏳ Deploy to staging
3. ⏳ Notify frontend team
4. ⏳ Monitor for issues

### For Frontend Team

1. ⏳ Test endpoint with Postman
2. ⏳ Update TypeScript types (optional)
3. ⏳ Integrate mentor signature in PDF
4. ⏳ Test all scenarios
5. ⏳ Deploy to production

---

**Status:** ✅ COMPLETED & READY FOR INTEGRATION  
**Priority:** 🟡 MEDIUM (untuk PDF generation)  
**Blocking Issues:** None

---

**Backend Team**  
20 Februari 2026, 11:30 WIB
```

## document/Integrasi dari Backend 2\CHANGELOG_MAHASISWA_ENDPOINTS.md

```markdown
# 📝 CHANGELOG - Endpoint Mahasiswa

## [1.1.0] - 2026-02-20

### 🎉 Added - New Features

#### Response Fields
- **GET /api/mahasiswa/internship** - Added mentor and lecturer details
  - New field: `mentor` object with complete pembimbing lapangan data
    - id, name, email, company, position, phone
    - **signature** (Base64 Data URI) - CRITICAL untuk PDF generation
  - New field: `lecturer` object with complete dosen pembimbing data
    - id, name, email, nip, phone, jabatan
  - Both fields are nullable (null if not assigned yet)

#### Backend Changes
- **src/repositories/mahasiswa.repository.ts** (UPDATED)
  - Updated `getInternshipData()` method:
    - Added LEFT JOIN to `pembimbing_lapangan` table
    - Added LEFT JOIN to `dosen` table
    - Added secondary queries to fetch user details for mentor and lecturer
    - Returns combined data with `mentorUserData` and `lecturerUserData`
  - Query now fetches mentor signature from `pembimbing_lapangan.signature`
  - Handles null cases properly when mentor/lecturer not assigned

- **src/services/mahasiswa.service.ts** (UPDATED)
  - Updated `getInternshipData()` method:
    - Added `mentor` object mapping with all required fields
    - Added `lecturer` object mapping with all required fields
    - Returns signature field for PDF generation
    - Proper null handling when mentor/lecturer not assigned

#### Documentation Files
- **BACKEND_UPDATE_MENTOR_LECTURER.md** (NEW)
  - Complete documentation of the update
  - Before/after response examples
  - Testing scenarios
  - Frontend integration guide
  - TypeScript types reference

### 🔧 Changed - Updates

#### Database Queries
- `getInternshipData()` now performs:
  - 1 main query with 8-table JOIN (added pembimbing_lapangan & dosen)
  - 0-2 secondary queries for user details (only if mentor/lecturer exist)
  - Total: 1-3 database calls (minimal performance impact)

### 📊 Impact

**Benefits:**
- ✅ Frontend can now generate PDF with real mentor signature
- ✅ Single API call untuk semua data (no need separate fetch)
- ✅ Backward compatible (no breaking changes)
- ✅ Production-ready PDF documents

**Performance:**
- Minimal impact: Secondary queries are simple indexed lookups
- LEFT JOIN used to prevent data loss if mentor not assigned

### 🐛 Bug Fixes

None - This is a feature addition

### ⚠️ Breaking Changes

None - All changes are additive only

### 📋 Migration Notes

**Database:** No migration needed
- Table `pembimbing_lapangan` already exists
- Field `signature` already exists
- Table `dosen` already exists

**Frontend:** No code changes required
- New fields are automatically available
- Existing fields unchanged
- Response is backward compatible

### 🧪 Testing

**Scenarios Tested:**
- ✅ Mentor & lecturer assigned with signature
- ✅ Mentor assigned without signature
- ✅ Mentor not assigned yet
- ✅ Invalid token (401)
- ✅ No approved submission (404)

**Results:** All tests passed ✅

### 📅 Timeline

- **2026-02-20 09:00** - Received requirement from frontend
- **2026-02-20 10:00** - Repository layer updated
- **2026-02-20 10:30** - Service layer updated
- **2026-02-20 11:00** - Testing completed
- **2026-02-20 11:30** - Documentation completed
- **2026-02-20 12:00** - ✅ READY FOR FRONTEND INTEGRATION

**Development Time:** ~2.5 hours

---

## [1.0.0] - 2026-02-18

### 🎉 Added - New Features

#### Endpoints
- **GET /api/mahasiswa/profile** - Endpoint untuk mendapatkan profil mahasiswa yang sedang login
  - Returns: id, name, nim, email, prodi, fakultas, angkatan, semester, phone
  - Auth required: JWT Bearer token
  - Role required: MAHASISWA
  - Status codes: 200 (success), 401 (unauthorized), 404 (not found), 500 (server error)

- **GET /api/mahasiswa/internship** - Endpoint untuk mendapatkan data lengkap magang mahasiswa
  - Returns: student data, submission data (APPROVED), internship data
  - Auth required: JWT Bearer token
  - Role required: MAHASISWA
  - Status codes: 200 (success), 401 (unauthorized), 404 (not found), 500 (server error)
  - Note: internship object bisa null jika submission sudah approved tapi internship belum dibuat

#### Backend Files
- **src/repositories/mahasiswa.repository.ts** (NEW)
  - Class: `MahasiswaRepository`
  - Methods:
    - `getMahasiswaProfile(userId: number)` - Query JOIN users + mahasiswa
    - `getInternshipData(userId: number)` - Complex 6-table JOIN query
    - `hasActiveInternship(mahasiswaId: number)` - Check active internship status
  - Database operations: Menggunakan Drizzle ORM dengan proper type safety

- **src/services/mahasiswa.service.ts** (NEW)
  - Class: `MahasiswaService`
  - Methods:
    - `getMahasiswaProfile(userId: number)` - Business logic untuk profile
    - `getInternshipData(userId: number)` - Business logic untuk internship data
  - Error handling: Proper error messages untuk not found cases
  - Data transformation: Convert null values menjadi empty strings/appropriate defaults

- **src/controllers/mahasiswa.controller.ts** (NEW)
  - Class: `MahasiswaController`
  - Handlers:
    - `getProfile(c: Context)` - HTTP handler untuk GET /profile
    - `getInternship(c: Context)` - HTTP handler untuk GET /internship
  - Features:
    - Extract userId dari JWT token (c.get('userId'))
    - Proper HTTP status codes
    - Consistent response format using createResponse helper
    - Detailed error handling

#### Documentation Files
- **MAHASISWA_ENDPOINTS_DOCUMENTATION.md** (NEW)
  - Dokumentasi lengkap endpoint (25+ pages)
  - API specification
  - Request/response examples
  - Authentication flow
  - Testing guide
  - TypeScript interfaces
  - React/Vue code examples
  - Architecture diagrams
  - Deployment checklist

- **NOTIFIKASI_UNTUK_FRONTEND.md** (NEW)
  - Quick summary untuk frontend team
  - Action items & timeline
  - Testing guide
  - Integration checklist
  - Common errors & solutions

- **QUICK_INTEGRATION_GUIDE.md** (NEW)
  - Copy-paste ready code examples
  - TypeScript types/interfaces
  - API service functions (fetch & axios)
  - React hooks
  - Vue composables
  - Component examples
  - Redux Toolkit setup
  - Testing examples
  - React Native examples

- **DOKUMENTASI_FRONTEND_PACKAGE.md** (NEW)
  - Overview semua dokumentasi
  - Reading guide
  - Quick start tutorial
  - Integration checklist
  - Timeline & expectations

### 🔧 Changed - Updates

#### Modified Files
- **src/index.ts**
  - Added import: `MahasiswaRepository`, `MahasiswaService`, `MahasiswaController`
  - Added repository instantiation: `const mahasiswaRepo = new MahasiswaRepository(db)`
  - Added service instantiation: `const mahasiswaService = new MahasiswaService(mahasiswaRepo)`
  - Added service to context: `c.set('mahasiswaService', mahasiswaService)`
  - Added routes to `/api/mahasiswa`:
    - `GET /profile` with mahasiswaOnly middleware
    - `GET /internship` with mahasiswaOnly middleware
  - Route pattern: Consistent dengan existing routes (inline controller instantiation)

### 📊 Technical Details

#### Database Queries

**getMahasiswaProfile Query:**
```sql
SELECT 
  mahasiswa.id,
  mahasiswa.nim,
  mahasiswa.prodi,
  mahasiswa.fakultas,
  mahasiswa.angkatan,
  mahasiswa.semester,
  users.name,
  users.email,
  users.phone
FROM mahasiswa
INNER JOIN users ON mahasiswa.user_id = users.id
WHERE users.id = ?
LIMIT 1
```

**getInternshipData Query:**
```sql
SELECT 
  users.*,
  mahasiswa.*,
  team_members.*,
  teams.*,
  submissions.*,
  internships.*
FROM users
INNER JOIN mahasiswa ON mahasiswa.user_id = users.id
INNER JOIN team_members ON team_members.mahasiswa_id = mahasiswa.id
INNER JOIN teams ON teams.id = team_members.team_id
INNER JOIN submissions ON submissions.team_id = teams.id
  AND submissions.status = 'APPROVED'
LEFT JOIN internships ON internships.mahasiswa_id = mahasiswa.id
WHERE users.id = ?
LIMIT 1
```

#### Architecture Pattern

```
HTTP Request
    ↓
authMiddleware (validate JWT, extract userId)
    ↓
mahasiswaOnly (check role = MAHASISWA)
    ↓
MahasiswaController (HTTP layer)
    ↓
MahasiswaService (business logic)
    ↓
MahasiswaRepository (database queries)
    ↓
PostgreSQL Database
    ↓
Response (JSON format)
```

#### Response Format

All endpoints follow consistent format:
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

Error format:
```json
{
  "success": false,
  "message": "Error message"
}
```

### 🔒 Security

- ✅ JWT authentication required for all endpoints
- ✅ Role-based access control (mahasiswaOnly middleware)
- ✅ SQL injection prevention (Drizzle ORM parameterized queries)
- ✅ Proper authorization checks (userId from token, not from request body)
- ✅ Error messages don't leak sensitive information

### 🧪 Testing

#### Manual Testing Checklist
- ✅ GET /api/mahasiswa/profile with valid mahasiswa token → 200 OK
- ✅ GET /api/mahasiswa/profile without token → 401 Unauthorized
- ✅ GET /api/mahasiswa/profile with admin token → 401 Unauthorized
- ✅ GET /api/mahasiswa/profile with invalid userId → 404 Not Found
- ✅ GET /api/mahasiswa/internship with valid token → 200 OK
- ✅ GET /api/mahasiswa/internship without approved submission → 404 Not Found
- ✅ GET /api/mahasiswa/internship with internship null → 200 OK (internship: null)

#### Test Environment Setup
```bash
# Start dev server
npm run dev

# Test with curl
curl -H "Authorization: Bearer <token>" http://localhost:8787/api/mahasiswa/profile
curl -H "Authorization: Bearer <token>" http://localhost:8787/api/mahasiswa/internship
```

### 📈 Performance Considerations

- ✅ Single database query per endpoint (no N+1 problem)
- ✅ Proper JOIN operations (indexed columns)
- ✅ LIMIT 1 on queries (optimization)
- ✅ Minimal data transformation
- ✅ No unnecessary loops or operations

### 🐛 Known Issues

- None reported

### ⚠️ Breaking Changes

- None (new endpoints, no modifications to existing ones)

### 📦 Dependencies

No new dependencies added. Using existing packages:
- Hono (web framework)
- Drizzle ORM (database)
- PostgreSQL (database)

### 🚀 Deployment

#### Development
```bash
npm run dev
```

#### Production
```bash
npm run deploy
```

Environment variables required:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT token verification
- `R2_BUCKET` - Cloudflare R2 bucket (existing)
- `R2_DOMAIN` - R2 public domain (existing)
- `R2_BUCKET_NAME` - R2 bucket name (existing)

### 📋 Migration Notes

**Database Migrations:** None required (using existing tables)

**Tables Used:**
- `users` (existing)
- `mahasiswa` (existing)
- `teams` (existing)
- `team_members` (existing)
- `submissions` (existing)
- `internships` (existing)

**No schema changes needed** - all endpoints use existing database structure.

### 👥 Frontend Integration

**Status:** Ready for integration

**Required Actions by Frontend:**
1. ✅ Read NOTIFIKASI_UNTUK_FRONTEND.md
2. ⏳ Test endpoints with Postman
3. ⏳ Copy TypeScript types from QUICK_INTEGRATION_GUIDE.md
4. ⏳ Copy API functions from QUICK_INTEGRATION_GUIDE.md
5. ⏳ Copy React hooks from QUICK_INTEGRATION_GUIDE.md
6. ⏳ Remove localStorage hardcoded data
7. ⏳ Update UI components
8. ⏳ Integration testing
9. ⏳ Deployment

**Timeline Estimate:**
- Day 1: Documentation review + Postman testing
- Day 2: Code integration
- Day 3-4: Testing & bug fixes
- Week 2: Production deployment

### 🎯 Benefits

**For Mahasiswa Users:**
- ✅ Real-time profile data from database
- ✅ Accurate internship information
- ✅ No more localStorage workarounds
- ✅ Consistent data across sessions

**For Developers:**
- ✅ Type-safe API with TypeScript
- ✅ Comprehensive documentation
- ✅ Ready-to-use code examples
- ✅ Clear error handling
- ✅ Consistent patterns with existing code

**For System:**
- ✅ Single source of truth (database)
- ✅ Secure access control
- ✅ Scalable architecture
- ✅ Maintainable codebase

### 📞 Support

**Maintainer:** Backend Team  
**Contact:** [Your Contact Info]  
**Documentation:** See all DOCUMENTATION files in root folder  
**Issues:** Report to backend team with error details  

### 📅 Timeline

- **2026-02-18 09:00** - Development started
- **2026-02-18 11:00** - Repository layer completed
- **2026-02-18 12:00** - Service layer completed
- **2026-02-18 13:00** - Controller layer completed
- **2026-02-18 14:00** - Routes integrated
- **2026-02-18 15:00** - Documentation completed
- **2026-02-18 16:00** - ✅ READY FOR FRONTEND INTEGRATION

### 🎉 Acknowledgments

- Frontend team for detailed requirements (BACKEND_REQUIREMENTS.md)
- Frontend team for clear API specification (BACKEND_API_SPEC.md)
- QA team for testing scenarios

---

## Future Enhancements (Planned)

### v1.1.0 (Planned)
- [ ] Add endpoint: PATCH /api/mahasiswa/profile (update phone number)
- [ ] Add endpoint: GET /api/mahasiswa/documents (list mahasiswa documents)
- [ ] Add endpoint: GET /api/mahasiswa/notifications (get mahasiswa notifications)
- [ ] Add pagination to internship history (if mahasiswa has multiple internships)

### v1.2.0 (Planned)
- [ ] Add WebSocket support for real-time notifications
- [ ] Add caching layer (Redis) for profile data
- [ ] Add rate limiting for endpoints
- [ ] Add analytics tracking

---

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.1.0 | 2026-02-20 | Added mentor & lecturer details to internship endpoint | ✅ Released |
| 1.0.0 | 2026-02-18 | Initial release | ✅ Released |

---

**Last Updated:** 2026-02-20 11:30 WIB  
**Status:** PRODUCTION READY ✅
```

## document/Integrasi dari Backend 2\DEPLOYMENT_SUCCESS.md

```markdown
# 🎉 Deployment Berhasil!

**Tanggal:** 20 Februari 2026  
**Versi:** 1.1.0 (Mentor Signature Feature)

---

## ✅ Status Deployment

- **Production URL:** `https://backend-sikp.mukarrobinujiantik.workers.dev`
- **Version ID:** `e9ff458a-9de4-4899-b512-da8b395adcb5`
- **Deployment Time:** ~17 detik
- **Status:** LIVE ✅

---

## 🚀 Endpoint yang Tersedia

### **Root & Health**
```bash
# Root
GET https://backend-sikp.mukarrobinujiantik.workers.dev/

# Health Check
GET https://backend-sikp.mukarrobinujiantik.workers.dev/health
```

### **Mahasiswa Endpoints** (v1.1.0 - UPDATED)
```bash
# Get Profile
GET https://backend-sikp.mukarrobinujiantik.workers.dev/api/mahasiswa/profile
Authorization: Bearer <token>

# Get Internship Data (WITH MENTOR & LECTURER)
GET https://backend-sikp.mukarrobinujiantik.workers.dev/api/mahasiswa/internship
Authorization: Bearer <token>
```

**Response baru termasuk:**
```json
{
  "success": true,
  "data": {
    "student": {...},
    "submission": {...},
    "internship": {...},
    "mentor": {
      "id": "...",
      "name": "...",
      "email": "...",
      "company": "...",
      "position": "...",
      "phone": "...",
      "signature": "https://r2-url/signatures/..." // ⭐ BARU untuk PDF
    },
    "lecturer": {
      "id": "...",
      "name": "...",
      "email": "...",
      "nip": "...",
      "phone": "...",
      "jabatan": "..."
    }
  }
}
```

### **Mentor Endpoints** (⭐ BARU)
```bash
# Upload Signature
POST https://backend-sikp.mukarrobinujiantik.workers.dev/api/mentor/signature/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
Body: signature=<file.png>

# Get Profile
GET https://backend-sikp.mukarrobinujiantik.workers.dev/api/mentor/profile
Authorization: Bearer <token>
```

---

## 📦 Fitur Baru (v1.1.0)

### **1. Endpoint Mahasiswa - Mentor & Lecturer Data**
- ✅ Endpoint `/api/mahasiswa/internship` sekarang include data mentor & dosen
- ✅ Field `mentor.signature` tersedia untuk generate PDF
- ✅ Automatic null handling jika mentor/lecturer belum di-assign

### **2. Endpoint Mentor - Upload Signature**
- ✅ Upload tanda tangan (PNG/JPG, max 2MB)
- ✅ Tersimpan di R2 folder `signatures/`
- ✅ URL signature otomatis tersimpan di database
- ✅ Validasi role PEMBIMBING_LAPANGAN

---

## ⚙️ Konfigurasi R2

**Status:** Mock Mode (Sementara)
- R2 binding: Dinonaktifkan sementara
- Mock R2: Aktif (`USE_MOCK_R2=true`)
- Folder structure:
  - `signatures/` - Tanda tangan mentor
  - `submissions/` - Dokumen pengajuan
  - `templates/` - Template surat
  - `response-letters/` - Surat balasan

**Untuk Enable R2 Real:**
1. Aktifkan R2 di Cloudflare Dashboard
2. Edit `wrangler.jsonc`:
   ```jsonc
   "vars": {
     "USE_MOCK_R2": "false"
   },
   "r2_buckets": [
     {
       "binding": "R2_BUCKET",
       "bucket_name": "document-sikp-mi"
     }
   ]
   ```
3. Deploy ulang: `npm run deploy`

---

## 📋 Checklist untuk Frontend

- [ ] Update base URL ke `https://backend-sikp.mukarrobinujiantik.workers.dev`
- [ ] Test endpoint `/api/mahasiswa/internship` dengan token valid
- [ ] Verify field `mentor.signature` ada di response
- [ ] Verify field `lecturer` ada di response
- [ ] Test generate PDF dengan data mentor signature
- [ ] Update TypeScript types (lihat `UPDATE_NOTIFICATION_V1.1.0.md`)

---

## 🔧 Troubleshooting

### **404 Error pada endpoint mahasiswa**
✅ FIXED - Endpoint sudah deployed dan live

### **CORS Error**
✅ FIXED - CORS sudah enabled untuk semua origin

### **R2 Upload Error**
⚠️ Saat ini menggunakan mock R2. Untuk enable R2 real, ikuti langkah di bagian "Konfigurasi R2"

---

## 📞 Next Steps

1. **Notify Frontend Team:**
   ```
   ✅ Backend sudah deployed
   ✅ Endpoint /api/mahasiswa/internship sudah include mentor & lecturer
   ✅ Field signature tersedia untuk PDF generation
   ✅ Production URL: https://backend-sikp.mukarrobinujiantik.workers.dev
   ```

2. **Test dengan Token Real:**
   - Login sebagai mahasiswa
   - Get token dari response
   - Hit endpoint `/api/mahasiswa/internship`
   - Verify response structure

3. **Monitor Logs:**
   - Dashboard: https://dash.cloudflare.com/
   - Workers & Pages > backend-sikp > Logs

---

## 📊 Deployment Info

```
Upload Size: 1454.22 KiB
Gzip Size: 470.73 KiB
Worker Startup: 133ms
Deploy Time: 11.36 sec
Environment Variables:
  - JWT_SECRET: ✅
  - R2_DOMAIN: ✅
  - R2_BUCKET_NAME: ✅
  - USE_MOCK_R2: true
```

---

## 🎯 Summary

**Completed:**
- ✅ Implementasi mentor & lecturer data di endpoint mahasiswa
- ✅ Implementasi upload signature untuk mentor
- ✅ Deployment ke production Cloudflare Workers
- ✅ All endpoints tested dan working

**Production Ready:**
- API endpoint: ✅ LIVE
- CORS: ✅ Enabled
- Authentication: ✅ Working
- New features: ✅ Deployed

---

**🔗 Dokumentasi Lengkap:**
- Technical Update: `BACKEND_UPDATE_MENTOR_LECTURER.md`
- Frontend Notification: `UPDATE_NOTIFICATION_V1.1.0.md`
- Changelog: `CHANGELOG_MAHASISWA_ENDPOINTS.md`
- R2 Integration: `NEW_FEATURE_R2_INTEGRATION_GUIDE.md`

**Deployment by:** Wrangler 4.60.0  
**CloudFlare Account:** mukarrobinujiantik@gmail.com  
**Subdomain:** mukarrobinujiantik.workers.dev
```

## document/Integrasi dari Backend 2\KIRIM_KE_FRONTEND.md

```markdown
# 📦 Package untuk Frontend Team

**Tanggal:** 20 Februari 2026  
**Backend Version:** 1.1.0  
**Status:** ✅ Production Ready

---

## 🚀 **INFORMASI PENTING**

### **Production URL:**
```
https://backend-sikp.mukarrobinujiantik.workers.dev
```

### **Status Deployment:**
- ✅ **LIVE** dan sudah tested
- ✅ Endpoint mahasiswa/internship sudah include mentor & lecturer
- ✅ CORS enabled untuk semua origin
- ⚠️ R2 masih mode mock (upload file belum real, nanti diaktifkan)

---

## 📄 **File-File yang Dikirim:**

### **1. UPDATE_NOTIFICATION_V1.1.0.md** (PALING PENTING)
Berisi:
- ✅ Summary perubahan
- ✅ **TypeScript types lengkap** untuk response baru
- ✅ Contoh request/response
- ✅ Action items untuk frontend

### **2. BACKEND_UPDATE_MENTOR_LECTURER.md** (DOKUMENTASI LENGKAP)
Berisi:
- ✅ Penjelasan teknis lengkap
- ✅ Response structure before/after
- ✅ 3 testing scenarios
- ✅ Frontend integration guide
- ✅ Error handling

### **3. postman_collection.json** (TESTING)
Berisi:
- ✅ Collection untuk test semua endpoint
- ✅ Tinggal import ke Postman/Insomnia
- ✅ Environment variables sudah di-set

### **4. DEPLOYMENT_SUCCESS.md** (INFO DEPLOYMENT)
Berisi:
- ✅ Production URL
- ✅ List semua endpoint yang tersedia
- ✅ Status R2 dan konfigurasi

---

## 🎯 **Quick Start untuk Frontend**

### **1. Update Base URL**
```typescript
// .env atau config
const API_BASE_URL = 'https://backend-sikp.mukarrobinujiantik.workers.dev';
```

### **2. Test Endpoint**
```bash
# Health check
curl https://backend-sikp.mukarrobinujiantik.workers.dev/health

# Get internship (perlu token mahasiswa)
curl https://backend-sikp.mukarrobinujiantik.workers.dev/api/mahasiswa/internship \
  -H "Authorization: Bearer <TOKEN_MAHASISWA>"
```

### **3. Update TypeScript Types**
Copy types dari `UPDATE_NOTIFICATION_V1.1.0.md`:
```typescript
interface InternshipResponse {
  success: boolean;
  data: {
    student: {...};
    submission: {...};
    internship: {...};
    mentor: {              // ⭐ BARU
      id: string;
      name: string;
      email: string;
      company: string;
      position: string;
      phone: string;
      signature: string | null;  // URL untuk PDF
    } | null;
    lecturer: {            // ⭐ BARU
      id: string;
      name: string;
      email: string;
      nip: string;
      phone: string;
      jabatan: string;
    } | null;
  };
}
```

---

## 📝 **Response Structure Baru**

### **Endpoint: `GET /api/mahasiswa/internship`**

**Response dengan Mentor & Lecturer:**
```json
{
  "success": true,
  "message": "Data magang berhasil diambil",
  "data": {
    "student": {
      "id": "...",
      "nim": "...",
      "name": "...",
      "email": "...",
      "fakultas": "...",
      "prodi": "...",
      "semester": 5,
      "angkatan": "2021"
    },
    "submission": {
      "id": "...",
      "letterPurpose": "...",
      "companyName": "PT Example",
      "companyAddress": "...",
      "division": "IT",
      "startDate": "2026-03-01",
      "endDate": "2026-06-01",
      "status": "APPROVED"
    },
    "internship": {
      "companyName": "PT Example",
      "division": "IT",
      "startDate": "2026-03-01",
      "endDate": "2026-06-01",
      "mentorId": "mentor_123",
      "lecturerId": "dosen_456"
    },
    "mentor": {
      "id": "mentor_123",
      "name": "Budi Santoso",
      "email": "budi@example.com",
      "company": "PT Example",
      "position": "Senior Developer",
      "phone": "08123456789",
      "signature": "https://r2.../signatures/signature-mentor_123-abc123.png"
    },
    "lecturer": {
      "id": "dosen_456",
      "name": "Dr. Ahmad, M.Kom",
      "email": "ahmad@univ.ac.id",
      "nip": "197001011998031001",
      "phone": "08129876543",
      "jabatan": "Lektor"
    }
  }
}
```

**Response jika Mentor/Lecturer belum di-assign:**
```json
{
  "success": true,
  "data": {
    "student": {...},
    "submission": {...},
    "internship": {...},
    "mentor": null,      // ← null jika belum ada
    "lecturer": null     // ← null jika belum ada
  }
}
```

---

## 🎨 **Cara Pakai di Frontend**

### **1. Fetch Data**
```typescript
const getInternshipData = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    'https://backend-sikp.mukarrobinujiantik.workers.dev/api/mahasiswa/internship',
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const result = await response.json();
  return result.data;
};
```

### **2. Handle Mentor Signature di PDF**
```typescript
const generatePDF = async (data) => {
  // Cek apakah mentor sudah upload signature
  if (data.mentor && data.mentor.signature) {
    // Pakai signature URL untuk PDF
    pdf.addImage(data.mentor.signature, 'PNG', x, y, width, height);
  } else {
    // Placeholder atau text
    pdf.text('(Tanda Tangan Belum Tersedia)', x, y);
  }
};
```

### **3. Display Mentor Info**
```typescript
const MentorInfo = ({ mentor }) => {
  if (!mentor) {
    return <p>Pembimbing lapangan belum ditentukan</p>;
  }
  
  return (
    <div>
      <h3>{mentor.name}</h3>
      <p>Perusahaan: {mentor.company}</p>
      <p>Posisi: {mentor.position}</p>
      <p>Email: {mentor.email}</p>
      <p>Phone: {mentor.phone}</p>
      {mentor.signature && (
        <img src={mentor.signature} alt="Tanda tangan" />
      )}
    </div>
  );
};
```

---

## ⚠️ **Catatan Penting**

### **R2 Storage (Mock Mode)**
- Upload signature mentor saat ini di mode **mock**
- Field `signature` akan return URL, tapi file tidak benar-benar tersimpan
- Nanti setelah R2 real aktif, akan otomatis tersimpan di cloud
- Frontend **tidak perlu ubah code** apapun

### **Error Handling**
```typescript
try {
  const data = await getInternshipData();
  
  // Cek apakah mentor/lecturer null
  if (!data.mentor) {
    console.log('Mentor belum ditentukan');
  }
  if (!data.lecturer) {
    console.log('Dosen pembimbing belum ditentukan');
  }
  
} catch (error) {
  if (error.status === 401) {
    // Token expired, redirect ke login
  } else if (error.status === 404) {
    // Data tidak ditemukan
  }
}
```

---

## 🧪 **Testing Checklist**

Frontend team perlu test:

- [ ] Login sebagai mahasiswa
- [ ] Hit endpoint `/api/mahasiswa/internship` dengan token
- [ ] Verify response include `mentor` object
- [ ] Verify response include `lecturer` object
- [ ] Handle case ketika `mentor` null
- [ ] Handle case ketika `lecturer` null
- [ ] Generate PDF dengan mentor signature (jika ada)
- [ ] Test dengan berbagai status submission (DRAFT, PENDING, APPROVED)

---

## 📞 **Support**

**Jika ada masalah:**

1. **Cek endpoint health:**
   ```bash
   curl https://backend-sikp.mukarrobinujiantik.workers.dev/health
   ```

2. **Cek response format:**
   - Import `postman_collection.json` ke Postman
   - Test endpoint dengan token valid

3. **Error 404:**
   - Pastikan base URL benar
   - Pastikan endpoint path benar (lihat dokumentasi)

4. **Error 401:**
   - Token expired, login ulang
   - Token tidak valid

5. **CORS Error:**
   - Seharusnya tidak ada, CORS sudah enabled
   - Jika masih ada, hubungi backend team

---

## 📦 **File yang Perlu Didownload:**

### **Priority 1 (HARUS):**
1. ✅ **UPDATE_NOTIFICATION_V1.1.0.md** - TypeScript types
2. ✅ **postman_collection.json** - Testing collection

### **Priority 2 (Opsional, untuk referensi):**
3. ✅ **BACKEND_UPDATE_MENTOR_LECTURER.md** - Dokumentasi lengkap
4. ✅ **DEPLOYMENT_SUCCESS.md** - Info deployment
5. ✅ **CHANGELOG_MAHASISWA_ENDPOINTS.md** - History perubahan

---

## 🎯 **Action Items untuk Frontend:**

1. **Segera:**
   - [ ] Update base URL ke production
   - [ ] Copy TypeScript types dari UPDATE_NOTIFICATION_V1.1.0.md
   - [ ] Test endpoint dengan Postman collection

2. **Implementasi:**
   - [ ] Update fetch logic untuk endpoint internship
   - [ ] Handle mentor & lecturer data di UI
   - [ ] Update PDF generation dengan mentor signature
   - [ ] Handle null cases untuk mentor/lecturer

3. **Testing:**
   - [ ] Test dengan berbagai scenarios
   - [ ] Test error handling
   - [ ] Test PDF generation

---

## ✅ **Summary**

**Backend Status:** LIVE ✅  
**Production URL:** `https://backend-sikp.mukarrobinujiantik.workers.dev`  
**New Features:** Mentor & Lecturer data di endpoint mahasiswa  
**Breaking Changes:** None (backward compatible)  
**Action Required:** Update TypeScript types, test endpoint  

**Estimasi waktu integrasi:** 1-2 jam (update types + testing)

---

**Dibuat:** 20 Februari 2026  
**Backend Version:** 1.1.0  
**Deploy Status:** Production Ready ✅
```

## document/Integrasi dari Backend 2\postman_collection.json

```json
{
  "info": {
    "name": "Backend SIKP API",
    "description": "Collection untuk testing Backend Sistem Informasi Kerja Praktik",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8787",
      "type": "string"
    },
    {
      "key": "mahasiswaToken",
      "value": "",
      "type": "string"
    },
    {
      "key": "mahasiswa2Token",
      "value": "",
      "type": "string"
    },
    {
      "key": "adminToken",
      "value": "",
      "type": "string"
    },
    {
      "key": "teamId",
      "value": "",
      "type": "string"
    },
    {
      "key": "memberId",
      "value": "",
      "type": "string"
    },
    {
      "key": "submissionId",
      "value": "",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "Health Check",
      "item": [
        {
          "name": "Root Health Check",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/",
              "host": ["{{baseUrl}}"],
              "path": [""]
            }
          }
        },
        {
          "name": "Health Endpoint",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/health",
              "host": ["{{baseUrl}}"],
              "path": ["health"]
            }
          }
        }
      ]
    },
    {
      "name": "1. Authentication",
      "item": [
        {
          "name": "Register Mahasiswa 1 (Leader)",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 201) {",
                  "    var jsonData = pm.response.json();",
                  "    pm.collectionVariables.set('mahasiswaToken', jsonData.data.token);",
                  "    pm.environment.set('mahasiswaToken', jsonData.data.token);",
                  "}"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"nim\": \"2021001\",\n  \"name\": \"Budi Santoso\",\n  \"email\": \"budi.santoso@student.univ.ac.id\",\n  \"password\": \"password123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "register"]
            }
          }
        },
        {
          "name": "Register Mahasiswa 2 (Member)",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 201) {",
                  "    var jsonData = pm.response.json();",
                  "    pm.collectionVariables.set('mahasiswa2Token', jsonData.data.token);",
                  "    pm.environment.set('mahasiswa2Token', jsonData.data.token);",
                  "}"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"nim\": \"2021002\",\n  \"name\": \"Siti Nurhaliza\",\n  \"email\": \"siti.nurhaliza@student.univ.ac.id\",\n  \"password\": \"password123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "register"]
            }
          }
        },
        {
          "name": "Register Admin",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 201) {",
                  "    var jsonData = pm.response.json();",
                  "    pm.collectionVariables.set('adminToken', jsonData.data.token);",
                  "    pm.environment.set('adminToken', jsonData.data.token);",
                  "}"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"nim\": \"ADMIN001\",\n  \"name\": \"Dr. Andi Wijaya\",\n  \"email\": \"andi.wijaya@univ.ac.id\",\n  \"password\": \"admin123\",\n  \"role\": \"ADMIN\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "register"]
            }
          }
        },
        {
          "name": "Login Mahasiswa 1",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "    var jsonData = pm.response.json();",
                  "    pm.collectionVariables.set('mahasiswaToken', jsonData.data.token);",
                  "}"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"nim\": \"2021001\",\n  \"password\": \"password123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "login"]
            }
          }
        },
        {
          "name": "Get My Profile",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{mahasiswaToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/auth/me",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "me"]
            }
          }
        }
      ]
    },
    {
      "name": "2. Team Management",
      "item": [
        {
          "name": "Create Team (Leader)",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 201) {",
                  "    var jsonData = pm.response.json();",
                  "    pm.collectionVariables.set('teamId', jsonData.data.id);",
                  "}"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{mahasiswaToken}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Tim KP PT. Tech Indonesia 2024\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/teams",
              "host": ["{{baseUrl}}"],
              "path": ["api", "teams"]
            }
          }
        },
        {
          "name": "Get My Teams",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{mahasiswaToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/teams/my-teams",
              "host": ["{{baseUrl}}"],
              "path": ["api", "teams", "my-teams"]
            }
          }
        },
        {
          "name": "Invite Member",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 201) {",
                  "    var jsonData = pm.response.json();",
                  "    pm.collectionVariables.set('memberId', jsonData.data.id);",
                  "}"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{mahasiswaToken}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"memberNim\": \"2021002\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/teams/{{teamId}}/invite",
              "host": ["{{baseUrl}}"],
              "path": ["api", "teams", "{{teamId}}", "invite"]
            }
          }
        },
        {
          "name": "Get Team Members",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{mahasiswaToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/teams/{{teamId}}/members",
              "host": ["{{baseUrl}}"],
              "path": ["api", "teams", "{{teamId}}", "members"]
            }
          }
        },
        {
          "name": "Accept Invitation (Member)",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{mahasiswa2Token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"accept\": true\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/teams/invitations/{{memberId}}/respond",
              "host": ["{{baseUrl}}"],
              "path": ["api", "teams", "invitations", "{{memberId}}", "respond"]
            }
          }
        },
        {
          "name": "Check Team Status (should be FIXED)",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{mahasiswaToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/teams/{{teamId}}/members",
              "host": ["{{baseUrl}}"],
              "path": ["api", "teams", "{{teamId}}", "members"]
            }
          }
        }
      ]
    },
    {
      "name": "3. Submission Management",
      "item": [
        {
          "name": "Create Submission (DRAFT)",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 201) {",
                  "    var jsonData = pm.response.json();",
                  "    pm.collectionVariables.set('submissionId', jsonData.data.id);",
                  "}"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{mahasiswaToken}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"teamId\": \"{{teamId}}\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/submissions",
              "host": ["{{baseUrl}}"],
              "path": ["api", "submissions"]
            }
          }
        },
        {
          "name": "Update Submission Data",
          "request": {
            "method": "PATCH",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{mahasiswaToken}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"companyName\": \"PT. Technology Indonesia\",\n  \"companyAddress\": \"Jl. Sudirman No. 123, Jakarta Pusat, DKI Jakarta 10220\",\n  \"companyPhone\": \"021-12345678\",\n  \"companyEmail\": \"hr@techindonesia.com\",\n  \"companySupervisor\": \"Bapak Agus Setiawan\",\n  \"position\": \"Backend Developer Intern\",\n  \"startDate\": \"2024-03-01\",\n  \"endDate\": \"2024-06-01\",\n  \"description\": \"Kerja praktik di divisi pengembangan backend, fokus pada REST API development\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/submissions/{{submissionId}}",
              "host": ["{{baseUrl}}"],
              "path": ["api", "submissions", "{{submissionId}}"]
            }
          }
        },
        {
          "name": "Get Submission Detail",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{mahasiswaToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/submissions/{{submissionId}}",
              "host": ["{{baseUrl}}"],
              "path": ["api", "submissions", "{{submissionId}}"]
            }
          }
        },
        {
          "name": "Upload Document - KTP",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{mahasiswaToken}}"
              }
            ],
            "body": {
              "mode": "formdata",
              "formdata": [
                {
                  "key": "file",
                  "type": "file",
                  "src": ""
                },
                {
                  "key": "documentType",
                  "value": "KTP",
                  "type": "text"
                }
              ]
            },
            "url": {
              "raw": "{{baseUrl}}/api/submissions/{{submissionId}}/documents",
              "host": ["{{baseUrl}}"],
              "path": ["api", "submissions", "{{submissionId}}", "documents"]
            }
          }
        },
        {
          "name": "Upload Document - TRANSKRIP",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{mahasiswaToken}}"
              }
            ],
            "body": {
              "mode": "formdata",
              "formdata": [
                {
                  "key": "file",
                  "type": "file",
                  "src": ""
                },
                {
                  "key": "documentType",
                  "value": "TRANSKRIP",
                  "type": "text"
                }
              ]
            },
            "url": {
              "raw": "{{baseUrl}}/api/submissions/{{submissionId}}/documents",
              "host": ["{{baseUrl}}"],
              "path": ["api", "submissions", "{{submissionId}}", "documents"]
            }
          }
        },
        {
          "name": "Get Documents List",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{mahasiswaToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/submissions/{{submissionId}}/documents",
              "host": ["{{baseUrl}}"],
              "path": ["api", "submissions", "{{submissionId}}", "documents"]
            }
          }
        },
        {
          "name": "Submit for Review (MENUNGGU)",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{mahasiswaToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/submissions/{{submissionId}}/submit",
              "host": ["{{baseUrl}}"],
              "path": ["api", "submissions", "{{submissionId}}", "submit"]
            }
          }
        },
        {
          "name": "Get My Submissions",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{mahasiswaToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/submissions/my-submissions",
              "host": ["{{baseUrl}}"],
              "path": ["api", "submissions", "my-submissions"]
            }
          }
        }
      ]
    },
    {
      "name": "4. Admin - Review & Approval",
      "item": [
        {
          "name": "Get All Submissions",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/admin/submissions",
              "host": ["{{baseUrl}}"],
              "path": ["api", "admin", "submissions"]
            }
          }
        },
        {
          "name": "Get Pending Submissions",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/admin/submissions/status/MENUNGGU",
              "host": ["{{baseUrl}}"],
              "path": ["api", "admin", "submissions", "status", "MENUNGGU"]
            }
          }
        },
        {
          "name": "Get Submission Detail (Admin)",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/admin/submissions/{{submissionId}}",
              "host": ["{{baseUrl}}"],
              "path": ["api", "admin", "submissions", "{{submissionId}}"]
            }
          }
        },
        {
          "name": "Approve Submission (+ Auto Generate Letter)",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminToken}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"autoGenerateLetter\": true\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/admin/submissions/{{submissionId}}/approve",
              "host": ["{{baseUrl}}"],
              "path": ["api", "admin", "submissions", "{{submissionId}}", "approve"]
            }
          }
        },
        {
          "name": "Reject Submission",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminToken}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"reason\": \"Dokumen tidak lengkap. Mohon upload KRS dan Proposal.\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/admin/submissions/{{submissionId}}/reject",
              "host": ["{{baseUrl}}"],
              "path": ["api", "admin", "submissions", "{{submissionId}}", "reject"]
            }
          }
        },
        {
          "name": "Generate Letter Manually",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminToken}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"format\": \"pdf\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/admin/submissions/{{submissionId}}/generate-letter",
              "host": ["{{baseUrl}}"],
              "path": ["api", "admin", "submissions", "{{submissionId}}", "generate-letter"]
            }
          }
        },
        {
          "name": "Get Statistics",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/admin/statistics",
              "host": ["{{baseUrl}}"],
              "path": ["api", "admin", "statistics"]
            }
          }
        }
      ]
    }
  ]
}
```

## document/Integrasi dari Backend 2\UPDATE_NOTIFICATION_V1.1.0.md

```markdown
# 📧 Update Notification untuk Frontend Team

**Tanggal:** 20 Februari 2026  
**Dari:** Backend Team  
**Kepada:** Frontend Team  
**Subject:** ✅ Endpoint Mahasiswa Updated - Mentor & Lecturer Data Available

---

## 🎉 Good News!

Endpoint **GET /api/mahasiswa/internship** sudah diupdate sesuai request kalian di **BACKEND_MENTOR_REQUIREMENT.md**!

Sekarang endpoint ini sudah return **data mentor lengkap dengan signature** untuk PDF generation. 🚀

---

## 📊 What's New?

### Response Sekarang Include:

1. **`mentor` object** ✨
   - Complete pembimbing lapangan details
   - Termasuk **signature field** (Base64 Data URI) untuk PDF
   - Null jika belum di-assign

2. **`lecturer` object** ✨
   - Complete dosen pembimbing details
   - Data lengkap: nama, email, NIP, jabatan
   - Null jika belum di-assign

---

## 🔥 Quick Example

### Request
```bash
GET http://localhost:8787/api/mahasiswa/internship
Authorization: Bearer <your_mahasiswa_token>
```

### Response (NEW!)
```json
{
  "success": true,
  "message": "Internship data retrieved successfully",
  "data": {
    "student": { ... },
    "submission": { ... },
    "internship": { ... },
    
    "mentor": {                               // ✨ NEW!
      "id": "clx123abc",
      "name": "Ahmad Mentor",
      "email": "ahmad.mentor@company.com",
      "company": "PT ABC Indonesia",
      "position": "Senior Developer",
      "phone": "081234567890",
      "signature": "data:image/png;base64,iVBORw0KGgo..."  // 🎯 For PDF!
    },
    
    "lecturer": {                             // ✨ NEW!
      "id": "clx456def",
      "name": "Dr. Siti Pembimbing",
      "email": "siti@university.ac.id",
      "nip": "198501012010012001",
      "phone": "081234567891",
      "jabatan": "Lektor Kepala"
    }
  }
}
```

---

## ✅ What This Means for You

### 1. PDF Generation ✨

Sekarang kalian bisa:
```typescript
// Generate PDF dengan signature real
if (internshipData.mentor?.signature) {
  pdfDoc.addImage(
    internshipData.mentor.signature, 
    'PNG', 
    x, y, width, height
  );
}
```

### 2. No More Dummy Data 🎯

- ✅ Nama mentor real
- ✅ Email mentor real  
- ✅ Company info real
- ✅ **Signature real** untuk paraf di logbook PDF

### 3. Single API Call 🚀

Tidak perlu fetch mentor terpisah, semua data sudah include!

---

## 📋 TypeScript Types (Optional Update)

Kalau mau update types kalian:

```typescript
interface InternshipData {
  student: StudentData;
  submission: SubmissionData;
  internship: InternshipInfo | null;
  mentor: MentorData | null;      // ✨ ADD THIS
  lecturer: LecturerData | null;  // ✨ ADD THIS
}

interface MentorData {
  id: string;
  name: string;
  email: string;
  company: string;
  position: string;
  phone: string;
  signature: string | null;  // Base64 Data URI
}

interface LecturerData {
  id: string;
  name: string;
  email: string;
  nip: string;
  phone: string;
  jabatan: string;
}
```

---

## 🧪 Testing Scenarios

### Scenario 1: Mentor dengan Signature ✅
```json
{
  "mentor": {
    "signature": "data:image/png;base64,iVBORw0KGgo..."
  }
}
```
**Action:** Generate PDF dengan paraf real! 🎉

---

### Scenario 2: Mentor tanpa Signature ⚠️
```json
{
  "mentor": {
    "signature": null
  }
}
```
**Action:** Show placeholder "Belum ada tanda tangan"

---

### Scenario 3: Mentor Belum Assigned 🔄
```json
{
  "mentor": null,
  "lecturer": null
}
```
**Action:** Show "Menunggu Pembimbing Lapangan"

---

## 🔧 What You Need to Do

### Quick Checklist:

1. **Test Endpoint** (5 menit)
   - [ ] Hit `/api/mahasiswa/internship` dengan token mahasiswa
   - [ ] Check response ada field `mentor` dan `lecturer`
   - [ ] Verify `mentor.signature` format

2. **Update Frontend** (15-30 menit)
   - [ ] Update TypeScript types (optional)
   - [ ] Integrate `mentor.signature` di PDF generation
   - [ ] Handle 3 scenarios: with signature, without signature, not assigned

3. **Test PDF Generation** (10 menit)
   - [ ] Test PDF dengan mentor yang punya signature
   - [ ] Test PDF dengan mentor tanpa signature
   - [ ] Verify signature tampil dengan baik

**Total Time:** ~30-45 menit ⏱️

---

## 📖 Documentation Files

Semua detail ada di:

1. **BACKEND_UPDATE_MENTOR_LECTURER.md**
   - Complete technical documentation
   - Before/after examples
   - Testing scenarios
   - Frontend integration guide

2. **CHANGELOG_MAHASISWA_ENDPOINTS.md** (Updated)
   - Version 1.1.0 added
   - Complete changelog
   - Migration notes

---

## 🚀 Status

**Backend:**
- ✅ Code implementation complete
- ✅ Testing passed
- ✅ Documentation complete
- ✅ **READY FOR FRONTEND INTEGRATION**

**Frontend:**
- ⏳ Test endpoint
- ⏳ Update PDF generation
- ⏳ Deploy

---

## 🎯 Benefits

- ✅ Professional PDF documents dengan signature real
- ✅ No more localStorage workarounds
- ✅ Single source of truth (database)
- ✅ Backward compatible (no breaking changes)
- ✅ Ready for production

---

## 🐛 Need Help?

**Questions?**
- Read **BACKEND_UPDATE_MENTOR_LECTURER.md** first
- Test dengan Postman
- Screenshot any errors

**Support:**
- Tag @backend-team di Slack/Discord
- Include: endpoint URL, headers, error message
- Response time: < 1 hour (office hours)

---

## 📞 Contact

**Maintainer:** Backend Team  
**Response Time:** < 1 jam (office hours)  
**Urgent:** Tag di grup chat  

---

## 🎉 Summary

**What Changed:**
- ✅ Added `mentor` object to GET /api/mahasiswa/internship
- ✅ Added `lecturer` object to GET /api/mahasiswa/internship
- ✅ Both include complete user details
- ✅ **mentor.signature** ready untuk PDF generation

**Action Required:**
1. Test endpoint ✅
2. Update PDF generation ✅
3. Deploy ✅

**Timeline:**
- Backend: ✅ DONE
- Frontend: ⏳ YOUR TURN!

**Priority:** 🟡 MEDIUM (Nice to have, non-blocking)

---

**Happy Coding! 🚀**

Let us know kalau ada kendala!

---

**Backend Team**  
20 Februari 2026, 11:30 WIB
```

## document/Integrasi Dari Backend\API_CONTRACT.md

```markdown
# 🚀 API Contract - SIKP Backend

**Base URL**: `http://localhost:8787/api`

---

## Authentication

### POST /auth/login
```json
Request:  { "email": "...", "password": "..." }
Response: { "success": true, "data": { "token": "...", "user": {...} } }
```

### POST /auth/logout
```json
Response: { "success": true, "message": "Logged out" }
```

---

## Mahasiswa Endpoints

### GET /mahasiswa/internship ⭐
**Returns**: Data lengkap mahasiswa + submission + team + mentor + dosen
```json
{
  "student": { "nim", "nama", "prodi", "fakultas" },
  "submission": { "company", "division", "companyAddress" },
  "team": { "name", "members[]" },
  "mentor": { "nama", "position" },
  "lecturer": { "nama", "nip" }
}
```

### POST /mahasiswa/logbook
```json
Request:  { "date", "activity", "description" }
Response: { "success": true, "data": { "id", "status": "PENDING" } }
```

### GET /mahasiswa/logbook
```json
Response: {
  "logbooks": [{
    "id", "date", "activity", "status",
    "mentorSignature", "mentorSignedAt"
  }],
  "stats": { "total", "pending", "approved", "rejected" }
}
```

### POST /mahasiswa/report/upload
```
Content-Type: multipart/form-data
Fields: file, description
Response: { "success": true, "data": { "id", "fileUrl", "status": "DRAFT" } }
```

### GET /mahasiswa/assessment
```json
Response: {
  "id", "kehadiran", "kerjasama", "sikapEtika",
  "totalScore", "weightedScore", "pdfUrl"
}
```

### GET /mahasiswa/grades
```json
Response: {
  "fieldMentorScore", "academicSupervisorScore",
  "grade": "A", "status": "lulus", "pdfUrl"
}
```

---

## Mentor Endpoints

### PUT /mentor/signature
```json
Request:  { "signature": "data:image/png;base64,..." }
Response: { "success": true, "data": { "signature", "signatureSetAt" } }
```

### GET /mentor/signature
```json
Response: { "signature": "data:image/png;base64,...", "signatureSetAt" }
```

### GET /mentor/mentees
```json
Response: {
  "mentees": [{
    "nim", "nama", "prodi", "company", "division"
  }]
}
```

### POST /mentor/logbook/:logbookId/approve
```json
Request:  { "notes": "..." }
Response: {
  "id", "status": "APPROVED",
  "mentorSignature", "mentorSignedAt"
}
```

### POST /mentor/assessment
```json
Request: {
  "studentId", "kehadiran", "kerjasama",
  "sikapEtika", "prestasiKerja", "kreatifitas", "feedback"
}
Response: {
  "id", "totalScore", "weightedScore",
  "pdfGenerated": false
}
```

---

## Dosen Endpoints

### GET /dosen/students
```json
Response: {
  "students": [{ "nim", "nama", "company", "division" }]
}
```

### POST /dosen/assessment
```json
Request: {
  "studentId", "kesesuaianFormat", "penguasaanMateri",
  "analisisPerancangan", "sikapEtika", "feedback"
}
Response: {
  "id", "totalScore", "weightedScore",
  "combinedGradeGenerated": true,
  "grade": "A", "status": "lulus"
}
```

### GET /dosen/reports
```json
Response: {
  "reports": [{
    "id", "studentName", "fileName", "status", "submittedAt"
  }]
}
```

---

## Admin Endpoints

### GET /admin/submissions
```json
Query: ?status=PENDING_REVIEW
Response: {
  "submissions": [{
    "id", "teamName", "company", "status", "submittedAt"
  }]
}
```

### POST /admin/submissions/:id/approve ⭐
**Action**: Auto-create internships untuk semua anggota tim
```json
Response: {
  "success": true,
  "internshipsCreated": 3,
  "membersNotified": 3
}
```

### GET /admin/internships
```json
Query: ?status=AKTIF
Response: {
  "internships": [{
    "id", "studentName", "company", "status", "progress"
  }]
}
```

### POST /admin/internships/:id/assign-mentor
```json
Request:  { "mentorId": "..." }
Response: { "success": true, "message": "Mentor assigned" }
```

---

## Status Enums

### Internship Status
`PENDING` | `AKTIF` | `SELESAI` | `BATAL`

### Logbook Status
`PENDING` | `APPROVED` | `REJECTED`

### Report Status
`DRAFT` | `SUBMITTED` | `APPROVED` | `REVISION` | `REJECTED`

### Grade
`A` (≥85) | `B` (70-84) | `C` (60-69) | `D` (50-59) | `E` (<50)

### Approval Status
`PENDING_DOSEN` → `APPROVED_DOSEN` → `PENDING_KAPRODI` → `APPROVED_KAPRODI`

---

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `UNAUTHORIZED` | 401 | Token invalid/expired |
| `FORBIDDEN` | 403 | No access |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input |
| `SIGNATURE_REQUIRED` | 400 | Mentor signature missing |
| `ALREADY_EXISTS` | 409 | Duplicate resource |

---

## Headers Required

```http
Authorization: Bearer <token>
Content-Type: application/json
```

---

## Testing Endpoints

### Postman
Import collection: `postman_collection.json`

### cURL Example
```bash
curl -X GET http://localhost:8787/api/mahasiswa/internship \
  -H "Authorization: Bearer <token>"
```

---

**Version**: 1.0  
**Updated**: 11 Feb 2026
```

## document/Integrasi Dari Backend\DATABASE_SCHEMA_DRIZZLE.md

```markdown
# Database Schema - SIKP (Sistem Informasi Kerja Praktik)

## 📋 Ringkasan Fitur Frontend

### 1. **Manajemen Mahasiswa (Student Management)**
- Profile mahasiswa (NIM, nama, email, prodi, fakultas, angkatan)
- Data magang (perusahaan, posisi, periode, mentor, dosen pembimbing)
- Status progress magang

### 2. **Logbook Mahasiswa**
- Mahasiswa buat entri logbook harian (tanggal, aktivitas, deskripsi)
- Status: PENDING, APPROVED, REJECTED
- Mentor lapangan paraf/approve logbook
- Filter berdasarkan tanggal dan status
- Statistik logbook (total, pending, approved, rejected)

### 3. **Penilaian (Assessment)**
- **Penilaian Mentor Lapangan (30%)**:
  - 5 kriteria: Kehadiran (20%), Kerjasama (30%), Sikap/Etika (20%), Prestasi Kerja (20%), Kreatifitas (10%)
  - Total score weighted average (0-100)
  - Weighted score = totalScore × 0.3
  - Auto-generate PDF penilaian
  - Mahasiswa lihat penilaian dan download PDF

- **Penilaian Dosen Pembimbing (70%)**:
  - 4 kriteria: Kesesuaian Format (30%), Penguasaan Materi (30%), Analisis/Perancangan (30%), Sikap/Etika (10%)
  - Total score weighted average (0-100)
  - Weighted score = totalScore × 0.7
  - Auto-generate PDF penilaian
  - Mahasiswa lihat penilaian dan download PDF

- **Rekap Nilai Akhir (Combined Grade)**:
  - Total = Mentor (30%) + Dosen (70%)
  - Average = Total / 2
  - Grade: A (≥85), B (70-84), C (60-69), D (50-59), E (<50)
  - Status: LULUS (≥60), TIDAK LULUS (<60)
  - Auto-generate PDF rekap nilai
  - Mahasiswa lihat rekap dan download PDF dengan icon preview

### 4. **Laporan KP (Internship Report)**
- Upload file laporan (PDF)
- Status: DRAFT, SUBMITTED, APPROVED, REVISION, REJECTED
- Review dan scoring oleh dosen
- Metadata (fileName, fileUrl, fileSize)
- Review notes

### 5. **Pengajuan Judul**
- Mahasiswa ajukan judul laporan KP
- Data: judul Indonesia, judul Inggris, tempat magang, periode, deskripsi
- Teknologi dan metodologi
- Status: diajukan, disetujui, ditolak, revisi
- Dosen verifikasi dengan catatan
- History revisi

### 6. **Mentor Lapangan**
- Profile mentor (nama, email, perusahaan, posisi)
- Lihat daftar mahasiswa bimbingan (mentees)
- Approve logbook (single & bulk)
- Beri penilaian mahasiswa

### 7. **Tim KP (Team)**
- Mahasiswa bisa mengajukan magang dalam tim
- Tim hanya untuk tahap **pengajuan dan pasca magang**
- Saat magang: **setiap mahasiswa bekerja individual** (logbook, assessment, report masing-masing)
- Get data tim dan anggota untuk keperluan administrasi

### 8. **User Management**
- Multi-role: MAHASISWA, MENTOR_LAPANGAN, DOSEN
- Authentication & authorization

---

## 🗄️ Drizzle Schema

```typescript
import { pgTable, uuid, varchar, text, timestamp, integer, decimal, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ==================== ENUMS ====================

export const userRoleEnum = pgEnum('user_role', ['MAHASISWA', 'MENTOR_LAPANGAN', 'DOSEN', 'ADMIN']);

export const internshipStatusEnum = pgEnum('internship_status', ['PENDING', 'AKTIF', 'SELESAI', 'BATAL']);

export const logbookStatusEnum = pgEnum('logbook_status', ['PENDING', 'APPROVED', 'REJECTED']);

export const reportStatusEnum = pgEnum('report_status', ['DRAFT', 'SUBMITTED', 'APPROVED', 'REVISION', 'REJECTED']);

export const titleStatusEnum = pgEnum('title_status', ['DIAJUKAN', 'DISETUJUI', 'DITOLAK', 'REVISI']);

export const approvalStatusEnum = pgEnum('approval_status', [
  'PENDING_DOSEN',      // Menunggu approval dosen pembimbing
  'APPROVED_DOSEN',     // Sudah di-approve dosen
  'REJECTED_DOSEN',     // Ditolak dosen
  'PENDING_KAPRODI',    // Menunggu approval kaprodi
  'APPROVED_KAPRODI',   // Sudah di-approve kaprodi (FINAL)
  'REJECTED_KAPRODI'    // Ditolak kaprodi
]);

// ==================== TABLES ====================

// Users Table (Authentication)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Student Profiles
export const students = pgTable('students', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  nim: varchar('nim', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  prodi: varchar('prodi', { length: 100 }).notNull(),
  fakultas: varchar('fakultas', { length: 100 }),
  angkatan: varchar('angkatan', { length: 10 }).notNull(),
  semester: integer('semester').notNull(),
  ipk: decimal('ipk', { precision: 3, scale: 2 }),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Mentor Profiles (Pembimbing Lapangan)
export const mentors = pgTable('mentors', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  company: varchar('company', { length: 255 }).notNull(),
  position: varchar('position', { length: 100 }).notNull(),
  address: text('address'),
  signature: text('signature'), // Base64 signature - setup once in profile
  signatureSetAt: timestamp('signature_set_at'), // When signature was created/updated
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Dosen Profiles (Lecturer)
export const lecturers = pgTable('lecturers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  nip: varchar('nip', { length: 30 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  prodi: varchar('prodi', { length: 100 }),
  fakultas: varchar('fakultas', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Teams (Tim KP)
export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  leaderId: uuid('leader_id').references(() => students.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Team Members
export const teamMembers = pgTable('team_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').references(() => teams.id).notNull(),
  studentId: uuid('student_id').references(() => students.id).notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

// Internships (Data Magang)
export const internships = pgTable('internships', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').references(() => students.id).notNull().unique(),
  // Note: teamId TIDAK ada - saat magang mahasiswa individual
  company: varchar('company', { length: 255 }).notNull(),
  position: varchar('position', { length: 100 }).notNull(),
  mentorId: uuid('mentor_id').references(() => mentors.id),
  lecturerId: uuid('lecturer_id').references(() => lecturers.id),
  startDate: timestamp('start_date').notNull(), // Periode magang dari input mahasiswa
  endDate: timestamp('end_date').notNull(), // Periode magang dari input mahasiswa
  status: internshipStatusEnum('status').notNull().default('PENDING'),
  progress: integer('progress').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Logbook Entries
export const logbooks = pgTable('logbooks', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').references(() => students.id).notNull(),
  internshipId: uuid('internship_id').references(() => internships.id).notNull(),
  date: timestamp('date').notNull(),
  activity: varchar('activity', { length: 255 }).notNull(),
  description: text('description').notNull(),
  mentorSignature: text('mentor_signature'), // Base64 string (data:image/png;base64,...)
  mentorSignedAt: timestamp('mentor_signed_at'),
  status: logbookStatusEnum('status').notNull().default('PENDING'),
  rejectionNote: text('rejection_note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Assessments (Penilaian Mentor Lapangan - 30%)
export const assessments = pgTable('assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').references(() => students.id).notNull().unique(),
  internshipId: uuid('internship_id').references(() => internships.id).notNull(),
  mentorId: uuid('mentor_id').references(() => mentors.id).notNull(),
  kehadiran: integer('kehadiran').notNull(), // 0-100 (20%)
  kerjasama: integer('kerjasama').notNull(), // 0-100 (30%)
  sikapEtika: integer('sikap_etika').notNull(), // 0-100 (20%)
  prestasiKerja: integer('prestasi_kerja').notNull(), // 0-100 (20%)
  kreatifitas: integer('kreatifitas').notNull(), // 0-100 (10%)
  totalScore: decimal('total_score', { precision: 5, scale: 2 }).notNull(), // Total 0-100
  weightedScore: decimal('weighted_score', { precision: 5, scale: 2 }).notNull(), // totalScore * 0.3
  feedback: text('feedback'),
  // PDF Auto-generation fields
  pdfGenerated: boolean('pdf_generated').notNull().default(false), // Status PDF sudah di-generate atau belum
  pdfUrl: varchar('pdf_url', { length: 500 }), // URL/path PDF di storage
  pdfGeneratedAt: timestamp('pdf_generated_at'), // Kapan PDF di-generate
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Lecturer Assessments (Penilaian Dosen Pembimbing - 70%)
export const lecturerAssessments = pgTable('lecturer_assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').references(() => students.id).notNull().unique(),
  internshipId: uuid('internship_id').references(() => internships.id).notNull(),
  lecturerId: uuid('lecturer_id').references(() => lecturers.id).notNull(),
  kesesuaianFormat: integer('kesesuaian_format').notNull(), // 0-100 (30%)
  penguasaanMateri: integer('penguasaan_materi').notNull(), // 0-100 (30%)
  analisisPerancangan: integer('analisis_perancangan').notNull(), // 0-100 (30%)
  sikapEtika: integer('sikap_etika').notNull(), // 0-100 (10%)
  totalScore: decimal('total_score', { precision: 5, scale: 2 }).notNull(), // Total 0-100
  weightedScore: decimal('weighted_score', { precision: 5, scale: 2 }).notNull(), // totalScore * 0.7
  feedback: text('feedback'),
  // PDF Auto-generation fields
  pdfGenerated: boolean('pdf_generated').notNull().default(false),
  pdfUrl: varchar('pdf_url', { length: 500 }),
  pdfGeneratedAt: timestamp('pdf_generated_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Combined Grades (Rekap Nilai Akhir = 30% Mentor + 70% Dosen)
export const combinedGrades = pgTable('combined_grades', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').references(() => students.id).notNull().unique(),
  internshipId: uuid('internship_id').references(() => internships.id).notNull(),
  assessmentId: uuid('assessment_id').references(() => assessments.id).notNull(),
  lecturerAssessmentId: uuid('lecturer_assessment_id').references(() => lecturerAssessments.id).notNull(),
  fieldMentorScore: decimal('field_mentor_score', { precision: 5, scale: 2 }).notNull(), // 30%
  academicSupervisorScore: decimal('academic_supervisor_score', { precision: 5, scale: 2 }).notNull(), // 70%
  totalScore: decimal('total_score', { precision: 5, scale: 2 }).notNull(), // Sum of both
  averageScore: decimal('average_score', { precision: 5, scale: 2 }).notNull(), // totalScore / 2
  grade: varchar('grade', { length: 2 }).notNull(), // A, B, C, D, E
  status: varchar('status', { length: 20 }).notNull(), // lulus, tidak-lulus
  remarks: text('remarks'),
  // Approval Workflow & E-Signature
  approvalStatus: approvalStatusEnum('approval_status').notNull().default('PENDING_DOSEN'),
  dosenSignature: text('dosen_signature'), // Base64 e-signature dosen pembimbing
  dosenSignedAt: timestamp('dosen_signed_at'),
  dosenApprovedBy: uuid('dosen_approved_by').references(() => lecturers.id), // ID dosen yang approve
  dosenRejectionNote: text('dosen_rejection_note'),
  kaprodiSignature: text('kaprodi_signature'), // Base64 e-signature kaprodi
  kaprodiSignedAt: timestamp('kaprodi_signed_at'),
  kaprodiApprovedBy: uuid('kaprodi_approved_by').references(() => lecturers.id), // ID kaprodi yang approve
  kaprodiRejectionNote: text('kaprodi_rejection_note'),
  // PDF Auto-generation fields
  pdfGenerated: boolean('pdf_generated').notNull().default(false),
  pdfUrl: varchar('pdf_url', { length: 500 }),
  pdfGeneratedAt: timestamp('pdf_generated_at'),
  defaultPdfUsed: boolean('default_pdf_used').notNull().default(false), // True jika error, pakai default PDF
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// KP Reports (Laporan KP)
export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').references(() => students.id).notNull().unique(),
  internshipId: uuid('internship_id').references(() => internships.id).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileUrl: varchar('file_url', { length: 500 }).notNull(),
  fileSize: integer('file_size').notNull(), // in bytes
  description: text('description'),
  notes: text('notes'),
  status: reportStatusEnum('status').notNull().default('DRAFT'),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
  submittedAt: timestamp('submitted_at'),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: uuid('reviewed_by').references(() => lecturers.id),
  reviewNote: text('review_note'),
  score: decimal('score', { precision: 5, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Title Submissions (Pengajuan Judul)
export const titleSubmissions = pgTable('title_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').references(() => students.id).notNull(),
  teamId: uuid('team_id').references(() => teams.id),
  internshipId: uuid('internship_id').references(() => internships.id).notNull(),
  judulIndonesia: varchar('judul_indonesia', { length: 500 }).notNull(),
  judulInggris: varchar('judul_inggris', { length: 500 }),
  tempatMagang: varchar('tempat_magang', { length: 255 }).notNull(),
  periodeMulai: timestamp('periode_mulai').notNull(),
  periodeSelesai: timestamp('periode_selesai').notNull(),
  deskripsi: text('deskripsi').notNull(),
  metodologi: text('metodologi'),
  teknologi: text('teknologi'), // JSON array stored as text
  status: titleStatusEnum('status').notNull().default('DIAJUKAN'),
  tanggalPengajuan: timestamp('tanggal_pengajuan').defaultNow().notNull(),
  tanggalVerifikasi: timestamp('tanggal_verifikasi'),
  verifiedBy: uuid('verified_by').references(() => lecturers.id),
  catatanDosen: text('catatan_dosen'),
  revisionCount: integer('revision_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Title Revision History
export const titleRevisions = pgTable('title_revisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  titleSubmissionId: uuid('title_submission_id').references(() => titleSubmissions.id).notNull(),
  tanggal: timestamp('tanggal').defaultNow().notNull(),
  catatan: text('catatan').notNull(),
  createdBy: uuid('created_by').references(() => lecturers.id).notNull(),
});

// Notifications
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'INFO', 'WARNING', 'SUCCESS', 'ERROR'
  link: varchar('link', { length: 500 }),
  isRead: integer('is_read').notNull().default(0), // 0 = unread, 1 = read
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==================== RELATIONS ====================

export const usersRelations = relations(users, ({ one }) => ({
  student: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
  mentor: one(mentors, {
    fields: [users.id],
    references: [mentors.userId],
  }),
  lecturer: one(lecturers, {
    fields: [users.id],
    references: [lecturers.userId],
  }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  internship: one(internships),
  logbooks: many(logbooks),
  assessment: one(assessments),
  report: one(reports),
  titleSubmissions: many(titleSubmissions),
  teamMemberships: many(teamMembers),
  leadingTeams: many(teams),
}));

export const mentorsRelations = relations(mentors, ({ one, many }) => ({
  user: one(users, {
    fields: [mentors.userId],
    references: [users.id],
  }),
  internships: many(internships),
  assessments: many(assessments),
}));

export const lecturersRelations = relations(lecturers, ({ one, many }) => ({
  user: one(users, {
    fields: [lecturers.userId],
    references: [users.id],
  }),
  internships: many(internships),
  reviewedReports: many(reports),
  verifiedTitles: many(titleSubmissions),
  titleRevisions: many(titleRevisions),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  leader: one(students, {
    fields: [teams.leaderId],
    references: [students.id],
  }),
  members: many(teamMembers),
  internships: many(internships),
  titleSubmissions: many(titleSubmissions),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  student: one(students, {
    fields: [teamMembers.studentId],
    references: [students.id],
  }),
}));

export const internshipsRelations = relations(internships, ({ one, many }) => ({
  student: one(students, {
    fields: [internships.studentId],
    references: [students.id],
  }),
  // team: TIDAK ada - saat magang mahasiswa individual
  mentor: one(mentors, {
    fields: [internships.mentorId],
    references: [mentors.id],
  }),
  lecturer: one(lecturers, {
    fields: [internships.lecturerId],
    references: [lecturers.id],
  }),
  logbooks: many(logbooks),
  assessment: one(assessments),
  report: one(reports),
  titleSubmissions: many(titleSubmissions),
}));

export const logbooksRelations = relations(logbooks, ({ one }) => ({
  student: one(students, {
    fields: [logbooks.studentId],
    references: [students.id],
  }),
  internship: one(internships, {
    fields: [logbooks.internshipId],
    references: [internships.id],
  }),
}));

export const assessmentsRelations = relations(assessments, ({ one }) => ({
  student: one(students, {
    fields: [assessments.studentId],
    references: [students.id],
  }),
  internship: one(internships, {
    fields: [assessments.internshipId],
    references: [internships.id],
  }),
  mentor: one(mentors, {
    fields: [assessments.mentorId],
    references: [mentors.id],
  }),
  combinedGrade: one(combinedGrades),
}));

export const lecturerAssessmentsRelations = relations(lecturerAssessments, ({ one }) => ({
  student: one(students, {
    fields: [lecturerAssessments.studentId],
    references: [students.id],
  }),
  internship: one(internships, {
    fields: [lecturerAssessments.internshipId],
    references: [internships.id],
  }),
  lecturer: one(lecturers, {
    fields: [lecturerAssessments.lecturerId],
    references: [lecturers.id],
  }),
  combinedGrade: one(combinedGrades),
}));

export const combinedGradesRelations = relations(combinedGrades, ({ one }) => ({
  student: one(students, {
    fields: [combinedGrades.studentId],
    references: [students.id],
  }),
  internship: one(internships, {
    fields: [combinedGrades.internshipId],
    references: [internships.id],
  }),
  assessment: one(assessments, {
    fields: [combinedGrades.assessmentId],
    references: [assessments.id],
  }),
  lecturerAssessment: one(lecturerAssessments, {
    fields: [combinedGrades.lecturerAssessmentId],
    references: [lecturerAssessments.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  student: one(students, {
    fields: [reports.studentId],
    references: [students.id],
  }),
  internship: one(internships, {
    fields: [reports.internshipId],
    references: [internships.id],
  }),
  reviewer: one(lecturers, {
    fields: [reports.reviewedBy],
    references: [lecturers.id],
  }),
}));

export const titleSubmissionsRelations = relations(titleSubmissions, ({ one, many }) => ({
  student: one(students, {
    fields: [titleSubmissions.studentId],
    references: [students.id],
  }),
  team: one(teams, {
    fields: [titleSubmissions.teamId],
    references: [teams.id],
  }),
  internship: one(internships, {
    fields: [titleSubmissions.internshipId],
    references: [internships.id],
  }),
  verifier: one(lecturers, {
    fields: [titleSubmissions.verifiedBy],
    references: [lecturers.id],
  }),
  revisions: many(titleRevisions),
}));

export const titleRevisionsRelations = relations(titleRevisions, ({ one }) => ({
  titleSubmission: one(titleSubmissions, {
    fields: [titleRevisions.titleSubmissionId],
    references: [titleSubmissions.id],
  }),
  creator: one(lecturers, {
    fields: [titleRevisions.createdBy],
    references: [lecturers.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
```

---

## 📊 Database Diagram Overview

```
users (auth)
  ├── students (mahasiswa)
  │   ├── internships (data magang - INDIVIDUAL per student)
  │   │   ├── logbooks (catatan harian - INDIVIDUAL)
  │   │   ├── assessments (penilaian mentor - INDIVIDUAL, 30%)
  │   │   ├── lecturerAssessments (penilaian dosen - INDIVIDUAL, 70%)
  │   │   ├── combinedGrades (rekap nilai akhir - INDIVIDUAL)
  │   │   ├── reports (laporan KP - INDIVIDUAL)
  │   │   └── titleSubmissions (pengajuan judul - bisa tim atau individual)
  │   │       └── titleRevisions (history revisi)
  │   └── teams (tim KP - hanya untuk pengajuan & pasca magang)
  │       └── teamMembers
  ├── mentors (pembimbing lapangan)
  │   ├── internships (mahasiswa bimbingan - individual)
  │   └── assessments (penilaian yang diberikan - per student, 30%)
  └── lecturers (dosen pembimbing)
      ├── internships (mahasiswa bimbingan - individual)
      ├── lecturerAssessments (penilaian yang diberikan - per student, 70%)
      ├── reports (review laporan - individual)
      └── titleSubmissions (verifikasi judul - bisa tim atau individual)
```

---

## 🔑 Key Features

### 1. **Multi-Role System**
- MAHASISWA: Isi logbook, upload laporan, ajukan judul
- MENTOR_LAPANGAN: Approve logbook, beri penilaian
- DOSEN: Verifikasi judul, review laporan, assign score
- ADMIN: Manage all data

### 2. **One-to-One Relationships**
- Student ↔ Internship (unique constraint)
- Student ↔ Assessment (unique constraint)
- Student ↔ Report (unique constraint)

### 3. **One-to-Many Relationships**
- Student → Logbooks (many entries)
- Student → TitleSubmissions (bisa submit multiple times)
- Mentor → Internships (multiple students)
- Lecturer → Reviews

### 4. **Many-to-Many via Junction**
- Students ↔ Teams via teamMembers

### 5. **Enums for Data Consistency**
- Status fields dengan predefined values
- Role-based access control

### 6. **Timestamps**
- createdAt, updatedAt untuk audit trail
- Specific timestamps: uploadedAt, submittedAt, reviewedAt, etc.

### 7. **Soft References**
- Optional foreign keys (mentorId?, lecturerId?) untuk flexibility

---

## 🚀 Migration Example (Drizzle Kit)

```bash
# Generate migration
npx drizzle-kit generate:pg

# Run migration
npx drizzle-kit push:pg
```

---

## 📝 Notes

1. **UUID Primary Keys**: Lebih secure, global unique
2. **Enum Types**: PostgreSQL native enums untuk better performance
3. **Timestamps**: Semua table punya created_at dan updated_at
4. **Indexes**: Tambahkan indexes untuk foreign keys dan frequently queried columns
5. **Constraints**: 
   - Unique constraints: email, nim, nip
   - Check constraints: score 0-100, progress 0-100
6. **JSON Fields**: teknologi stored as text, parse/stringify di application layer
7. **File Storage**: fileUrl points to cloud storage (S3, GCS, dll)
8. **Signature**: Base64 encoded image stored as text

---

## 🔐 Security Considerations

1. Password hashing (bcrypt/argon2) di application layer
2. JWT tokens untuk authentication
3. Role-based permissions di API routes
4. File upload validation (type, size)
5. SQL injection protection via Drizzle ORM
6. Soft delete option (add deletedAt timestamp jika perlu)

---

## 📈 Indexing Recommendations

```sql
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_nim ON students(nim);
CREATE INDEX idx_internships_student_id ON internships(student_id);
CREATE INDEX idx_internships_mentor_id ON internships(mentor_id);
CREATE INDEX idx_logbooks_student_id ON logbooks(student_id);
CREATE INDEX idx_logbooks_date ON logbooks(date);
CREATE INDEX idx_logbooks_status ON logbooks(status);
CREATE INDEX idx_assessments_student_id ON assessments(student_id);
CREATE INDEX idx_reports_student_id ON reports(student_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_title_submissions_student_id ON title_submissions(student_id);
CREATE INDEX idx_title_submissions_status ON title_submissions(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
```

---

## 🔌 Backend API Endpoints

### Authentication
```
POST   /api/auth/register          - Register user baru (mahasiswa, mentor, dosen)
POST   /api/auth/login             - Login dengan email & password
POST   /api/auth/logout            - Logout user
GET    /api/auth/session           - Get current session
POST   /api/auth/forgot-password   - Request reset password
POST   /api/auth/reset-password    - Reset password dengan token
```

### Mahasiswa (Student) - Role: MAHASISWA
```
GET    /api/mahasiswa/profile                    - Get profile mahasiswa
PUT    /api/mahasiswa/profile                    - Update profile
GET    /api/mahasiswa/internship                 - Get data magang current user
PUT    /api/mahasiswa/internship/period          - Update periode magang (startDate, endDate)
POST   /api/mahasiswa/internship                 - Create internship data
```

### Logbook - Role: MAHASISWA
```
POST   /api/mahasiswa/logbook                    - Create logbook entry
GET    /api/mahasiswa/logbook                    - Get all logbook entries
GET    /api/mahasiswa/logbook/:id                - Get single logbook
PUT    /api/mahasiswa/logbook/:id                - Update logbook (hanya jika PENDING)
DELETE /api/mahasiswa/logbook/:id                - Delete logbook (hanya jika PENDING)
GET    /api/mahasiswa/logbook/stats              - Get logbook statistics
```

### Report - Role: MAHASISWA
```
POST   /api/mahasiswa/report/upload              - Upload laporan KP (file PDF)
GET    /api/mahasiswa/report                     - Get laporan mahasiswa
PUT    /api/mahasiswa/report/:id                 - Update metadata laporan
POST   /api/mahasiswa/report/:id/submit          - Submit laporan untuk review
GET    /api/mahasiswa/report/:id/download        - Download file laporan
```

### Title Submission - Role: MAHASISWA
```
POST   /api/mahasiswa/title                      - Submit judul KP
GET    /api/mahasiswa/title                      - Get title submissions
PUT    /api/mahasiswa/title/:id                  - Update title (jika PENDING)
GET    /api/mahasiswa/title/:id/revisions        - Get revision history
```

### Mentor Lapangan - Role: MENTOR_LAPANGAN
```
GET    /api/mentor/profile                       - Get mentor profile
PUT    /api/mentor/profile                       - Update mentor profile
PUT    /api/mentor/signature                     - Save/Update signature (Base64)
GET    /api/mentor/signature                     - Get mentor signature
DELETE /api/mentor/signature                     - Delete signature

GET    /api/mentor/mentees                       - Get daftar mahasiswa bimbingan
GET    /api/mentor/mentees/:studentId            - Get detail mentee
GET    /api/mentor/logbook/:studentId            - Get logbook entries mahasiswa
POST   /api/mentor/logbook/:logbookId/approve    - Approve logbook (auto signature)
POST   /api/mentor/logbook/:studentId/approve-all - Approve all pending logbooks

POST   /api/mentor/assessment                    - Submit assessment mahasiswa (auto-generate PDF)
GET    /api/mentor/assessment/:studentId         - Get assessment mahasiswa
PUT    /api/mentor/assessment/:id                - Update assessment
```

### Mahasiswa (Assessment & Grades) - Role: MAHASISWA
```
GET    /api/mahasiswa/assessment                 - Get own mentor assessment with PDF status
GET    /api/mahasiswa/assessment/download        - Download PDF penilaian mentor lapangan
GET    /api/mahasiswa/lecturer-assessment        - Get own lecturer assessment with PDF status
GET    /api/mahasiswa/lecturer-assessment/download - Download PDF penilaian dosen
GET    /api/mahasiswa/grades                     - Get combined grades (rekap nilai)
GET    /api/mahasiswa/grades/download            - Download PDF rekap nilai akhir
```

### Dosen Pembimbing - Role: DOSEN
```
GET    /api/dosen/profile                        - Get dosen profile
PUT    /api/dosen/profile                        - Update profile
GET    /api/dosen/students                       - Get daftar mahasiswa bimbingan
GET    /api/dosen/students/:studentId            - Get detail mahasiswa

GET    /api/dosen/reports                        - Get laporan pending review
GET    /api/dosen/reports/:reportId              - Get detail laporan
PUT    /api/dosen/reports/:reportId/review       - Review laporan (approve/revision/reject)
POST   /api/dosen/reports/:reportId/score        - Beri nilai laporan

GET    /api/dosen/titles                         - Get title submissions pending
GET    /api/dosen/titles/:titleId                - Get detail title submission
PUT    /api/dosen/titles/:titleId/verify         - Verify title (approve/revision/reject)
POST   /api/dosen/titles/:titleId/revision       - Add revision note

POST   /api/dosen/assessment                     - Submit lecturer assessment (auto-generate PDF)
GET    /api/dosen/assessment/:studentId          - Get lecturer assessment for student
PUT    /api/dosen/assessment/:id                 - Update lecturer assessment

GET    /api/dosen/grades/pending-approval        - Get combined grades pending dosen approval
POST   /api/dosen/grades/:gradeId/approve        - Approve combined grade (e-sign)
POST   /api/dosen/grades/:gradeId/reject         - Reject combined grade
```

### Kaprodi - Role: DOSEN (with Kaprodi privileges)
```
GET    /api/kaprodi/grades/pending-approval      - Get combined grades pending kaprodi approval
POST   /api/kaprodi/grades/:gradeId/approve      - Approve combined grade (e-sign & trigger PDF)
POST   /api/kaprodi/grades/:gradeId/reject       - Reject combined grade
GET    /api/kaprodi/grades/:gradeId/download     - Download final PDF nilai
```

### Admin - Role: ADMIN
```
GET    /api/admin/users                          - Get all users with filters
POST   /api/admin/users                          - Create user
PUT    /api/admin/users/:userId                  - Update user
DELETE /api/admin/users/:userId                  - Delete user
POST   /api/admin/users/:userId/reset-password   - Reset user password

GET    /api/admin/internships                    - Get all internships
PUT    /api/admin/internships/:id/status         - Update internship status
POST   /api/admin/internships/:id/assign-mentor  - Assign mentor lapangan
POST   /api/admin/internships/:id/assign-dosen   - Assign dosen pembimbing

GET    /api/admin/stats                          - Dashboard statistics
```

---

## 🔄 Database Migrations

### Migration 1: Initial Schema
```sql
-- Create ENUM types
CREATE TYPE user_role AS ENUM ('MAHASISWA', 'MENTOR_LAPANGAN', 'DOSEN', 'ADMIN');
CREATE TYPE internship_status AS ENUM ('PENDING', 'AKTIF', 'SELESAI', 'BATAL');
CREATE TYPE logbook_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE report_status AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REVISION', 'REJECTED');
CREATE TYPE title_status AS ENUM ('PENDING', 'APPROVED', 'REVISION', 'REJECTED');

-- Create tables (see schema above for full definitions)
CREATE TABLE users (...);
CREATE TABLE students (...);
CREATE TABLE mentors (...);
CREATE TABLE lecturers (...);
CREATE TABLE teams (...);
CREATE TABLE team_members (...);
CREATE TABLE internships (...);
CREATE TABLE logbooks (...);
CREATE TABLE assessments (...);
CREATE TABLE lecturer_assessments (...);
CREATE TABLE combined_grades (...);
CREATE TABLE reports (...);
CREATE TABLE title_submissions (...);
CREATE TABLE title_revisions (...);
CREATE TABLE notifications (...);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_students_nim ON students(nim);
CREATE INDEX idx_internships_student_id ON internships(student_id);
CREATE INDEX idx_logbooks_student_id ON logbooks(student_id);
CREATE INDEX idx_logbooks_date ON logbooks(date);
CREATE INDEX idx_logbooks_status ON logbooks(status);
CREATE INDEX idx_assessments_student_id ON assessments(student_id);
CREATE INDEX idx_lecturer_assessments_student_id ON lecturer_assessments(student_id);
CREATE INDEX idx_combined_grades_student_id ON combined_grades(student_id);
CREATE INDEX idx_reports_student_id ON reports(student_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_title_submissions_student_id ON title_submissions(student_id);
CREATE INDEX idx_title_submissions_status ON title_submissions(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
```

### Migration 2: Add Mentor Signature Support
```sql
-- Add signature fields to mentors table
ALTER TABLE mentors 
  ADD COLUMN signature TEXT,
  ADD COLUMN signature_set_at TIMESTAMP;

-- Add index for signature queries
CREATE INDEX idx_mentors_signature 
  ON mentors(signature_set_at) 
  WHERE signature IS NOT NULL;
  
-- Update logbooks to include signed timestamp index
CREATE INDEX idx_logbooks_mentor_signed 
  ON logbooks(mentor_signed_at)
  WHERE mentor_signature IS NOT NULL;
```

### Migration 3: Add Grading System Tables
```sql
-- Add lecturer assessments table
CREATE TABLE lecturer_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL UNIQUE REFERENCES students(id),
  internship_id UUID NOT NULL REFERENCES internships(id),
  lecturer_id UUID NOT NULL REFERENCES lecturers(id),
  kesesuaian_format INTEGER NOT NULL CHECK (kesesuaian_format >= 0 AND kesesuaian_format <= 100),
  penguasaan_materi INTEGER NOT NULL CHECK (penguasaan_materi >= 0 AND penguasaan_materi <= 100),
  analisis_perancangan INTEGER NOT NULL CHECK (analisis_perancangan >= 0 AND analisis_perancangan <= 100),
  sikap_etika INTEGER NOT NULL CHECK (sikap_etika >= 0 AND sikap_etika <= 100),
  total_score DECIMAL(5,2) NOT NULL,
  weighted_score DECIMAL(5,2) NOT NULL,
  feedback TEXT,
  pdf_generated BOOLEAN NOT NULL DEFAULT false,
  pdf_url VARCHAR(500),
  pdf_generated_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add combined grades table with approval workflow
CREATE TABLE combined_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL UNIQUE REFERENCES students(id),
  internship_id UUID NOT NULL REFERENCES internships(id),
  assessment_id UUID NOT NULL REFERENCES assessments(id),
  lecturer_assessment_id UUID NOT NULL REFERENCES lecturer_assessments(id),
  field_mentor_score DECIMAL(5,2) NOT NULL,
  academic_supervisor_score DECIMAL(5,2) NOT NULL,
  total_score DECIMAL(5,2) NOT NULL,
  average_score DECIMAL(5,2) NOT NULL,
  grade VARCHAR(2) NOT NULL CHECK (grade IN ('A', 'B', 'C', 'D', 'E')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('lulus', 'tidak-lulus')),
  remarks TEXT,
  -- Approval workflow & e-signature
  approval_status VARCHAR(20) NOT NULL DEFAULT 'PENDING_DOSEN' 
    CHECK (approval_status IN (
      'PENDING_DOSEN', 'APPROVED_DOSEN', 'REJECTED_DOSEN',
      'PENDING_KAPRODI', 'APPROVED_KAPRODI', 'REJECTED_KAPRODI'
    )),
  dosen_signature TEXT,
  dosen_signed_at TIMESTAMP,
  dosen_approved_by UUID REFERENCES lecturers(id),
  dosen_rejection_note TEXT,
  kaprodi_signature TEXT,
  kaprodi_signed_at TIMESTAMP,
  kaprodi_approved_by UUID REFERENCES lecturers(id),
  kaprodi_rejection_note TEXT,
  -- PDF generation
  pdf_generated BOOLEAN NOT NULL DEFAULT false,
  pdf_url VARCHAR(500),
  pdf_generated_at TIMESTAMP,
  default_pdf_used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add weighted_score column to assessments
ALTER TABLE assessments 
  ADD COLUMN weighted_score DECIMAL(5,2);

-- Update existing assessments to calculate weighted_score
UPDATE assessments 
SET weighted_score = total_score * 0.3
WHERE weighted_score IS NULL;

-- Make weighted_score NOT NULL after backfill
ALTER TABLE assessments 
  ALTER COLUMN weighted_score SET NOT NULL;

-- Add indexes
CREATE INDEX idx_lecturer_assessments_student_id ON lecturer_assessments(student_id);
CREATE INDEX idx_lecturer_assessments_lecturer_id ON lecturer_assessments(lecturer_id);
CREATE INDEX idx_combined_grades_student_id ON combined_grades(student_id);
CREATE INDEX idx_combined_grades_grade ON combined_grades(grade);
CREATE INDEX idx_combined_grades_status ON combined_grades(status);

-- Add comments
COMMENT ON TABLE lecturer_assessments IS 'Penilaian dosen pembimbing (70% dari nilai akhir)';
COMMENT ON TABLE combined_grades IS 'Rekap nilai akhir = 30% mentor + 70% dosen';
COMMENT ON COLUMN assessments.weighted_score IS 'totalScore * 0.3 (kontribusi 30% ke nilai akhir)';
COMMENT ON COLUMN lecturer_assessments.weighted_score IS 'totalScore * 0.7 (kontribusi 70% ke nilai akhir)';
```

### Migration 4: Add Periode Magang Comments
```sql
-- Add comments to startDate and endDate for clarity
COMMENT ON COLUMN internships.start_date IS 'Periode magang - diinput mahasiswa sekali, disimpan di localStorage & database';
COMMENT ON COLUMN internships.end_date IS 'Periode magang - diinput mahasiswa sekali, disimpan di localStorage & database';
COMMENT ON COLUMN logbooks.mentor_signature IS 'Base64 signature - copied from mentors.signature saat approve';
```

---

## 🎨 Frontend-Backend Integration

### 1. Periode Magang (Logbook Page)
**File**: `app/feature/during-intern/pages/logbook-page.tsx`

**Flow**:
```
1. Page Mount:
   - Check localStorage for saved periode
   - If exists: Load from localStorage
   - If not: Call GET /api/mahasiswa/internship
   
2. User Input Periode (first time):
   - Input: startDate, endDate, startDay, endDay
   - Save to localStorage (instant UX)
   - Call PUT /api/mahasiswa/internship/period
   - Generate dates array from periode
   
3. Sync Check:
   - On page load, compare localStorage vs database
   - If different, show sync warning
```

**API Integration**:
```typescript
// services/student-api.ts
import { updateInternshipPeriod, getMyInternship } from "~/feature/during-intern/services/student-api";

// Load periode saat mount
const { data: internship } = await getMyInternship();
// internship.startDate, internship.endDate

// Save periode saat submit
await updateInternshipPeriod({
  startDate: "2026-01-15",
  endDate: "2026-04-15"
});
```

**Backend**:
```typescript
// PUT /api/mahasiswa/internship/period
{
  startDate: "2026-01-15",  // ISO string or YYYY-MM-DD
  endDate: "2026-04-15"
}

Response:
{
  success: true,
  message: "Periode magang berhasil disimpan",
  data: {
    id: "...",
    startDate: "2026-01-15T00:00:00Z",
    endDate: "2026-04-15T00:00:00Z",
    // ... other internship fields
  }
}
```

---

### 2. Mentor Signature (Profile Page)
**File**: `app/feature/field-mentor/components/signature-setup.tsx`

**Flow**:
```
1. First Time Setup:
   - Mentor opens Profile page
   - Section "Tanda Tangan Digital"
   - Canvas untuk drawing signature
   - Click "Simpan" → Call PUT /api/mentor/signature
   
2. Display Signature:
   - GET /api/mentor/profile (include signature field)
   - Render: <img src={mentor.signature} />
   
3. Edit/Delete:
   - Button "Edit" → Open canvas dengan existing signature
   - Button "Hapus" → Confirmation → DELETE /api/mentor/signature
```

**API Integration**:
```typescript
// services/mentor-api.ts
import { saveMentorSignature, getMentorSignature, deleteMentorSignature } from "~/feature/field-mentor/services/mentor-api";

// Save signature
const base64 = sigCanvas.current.toDataURL("image/png");
await saveMentorSignature(base64);

// Get signature
const { data } = await getMentorSignature();
// data.signature: "data:image/png;base64,..."

// Delete signature
await deleteMentorSignature();
```

**Backend**:
```typescript
// PUT /api/mentor/signature
{
  signature: "data:image/png;base64,iVBORw0KGgoAAAA..."
}

// Validation:
- Check format starts with "data:image/"
- Max size: 100KB
- Allowed types: image/png, image/jpeg

// Save to database:
UPDATE mentors SET 
  signature = $1,
  signature_set_at = NOW(),
  updated_at = NOW()
WHERE user_id = $2;
```

---

### 3. Approve Logbook (Mentor Page)
**File**: `app/feature/field-mentor/components/approve-logbook-button.tsx`

**Flow**:
```
1. Mentor clicks "Paraf" button
2. (Optional) Dialog dengan notes input
3. Call POST /api/mentor/logbook/:logbookId/approve
4. Backend:
   - Get mentor.signature from profile
   - If no signature → Error: "Setup signature dulu"
   - Copy signature to logbooks.mentor_signature
   - Set logbooks.status = 'APPROVED'
   - Set logbooks.mentor_signed_at = NOW()
5. Frontend: Show success toast, refresh list
```

**API Integration**:
```typescript
// services/mentor-api.ts
import { approveLogbook } from "~/feature/field-mentor/services/mentor-api";

// Approve single logbook
await approveLogbook(logbookId, "Pekerjaan sudah baik");

// Approve multiple (bulk)
await approveAllLogbooks(studentId, "Semua sudah sesuai");
```

**Backend**:
```typescript
// POST /api/mentor/logbook/:logbookId/approve
{
  notes?: "Pekerjaan sudah sesuai"
}

// Backend logic:
1. Get mentor by auth user
2. Check mentor.signature exists:
   - If null → Error 400 "Setup signature required"
3. Check logbook belongs to mentor's mentee
4. Update logbook:
   UPDATE logbooks SET
     status = 'APPROVED',
     mentor_signature = (SELECT signature FROM mentors WHERE id = $1),
     mentor_signed_at = NOW(),
     rejection_note = $2  -- if notes provided
   WHERE id = $3;

Response:
{
  success: true,
  message: "Logbook berhasil disetujui",
  data: {
    id: "...",
    status: "APPROVED",
    mentorSignature: "data:image/png;base64,...",
    mentorSignedAt: "2026-01-22T10:30:00Z"
  }
}
```

---

### 4. Student Data Display
**Files**: 
- `app/feature/during-intern/pages/logbook-page.tsx`
- `app/feature/during-intern/pages/during-intern-page.tsx`
- `app/feature/field-mentor/pages/*`

**Flow**:
```
1. Page mount
2. Call GET /api/mahasiswa/profile
3. Call GET /api/mahasiswa/internship
4. Display data:
   - Nama, NIM, Prodi (default: "Manajemen Informatika")
   - Fakultas (default: "Ilmu Komputer")
   - Tempat KP, Bagian/Bidang
   - Periode KP (dari workPeriod localStorage atau internship.startDate/endDate)
```

**API Integration**:
```typescript
// services/student-api.ts
import { getMyProfile, getMyInternship } from "~/feature/during-intern/services/student-api";

const { data: profile } = await getMyProfile();
// profile.name, profile.nim, profile.prodi, profile.fakultas

const { data: internship } = await getMyInternship();
// internship.company, internship.position, internship.startDate, internship.endDate
```

---

### 5. Student Grading System (Penilaian KP)
**Files**: 
- `app/feature/student-grading/pages/student-grading-page.tsx`
- `app/feature/student-grading/components/field-mentor-grade-card.tsx`
- `app/feature/student-grading/components/academic-supervisor-grade-card.tsx`
- `app/feature/student-grading/components/combined-grade-card.tsx`

**System Overview**:
```
Nilai Akhir KP = (Mentor Lapangan × 30%) + (Dosen Pembimbing × 70%)

1. Penilaian Mentor Lapangan (30%):
   - Kehadiran (20%)
   - Kerjasama (30%)
   - Sikap, Etika & Tingkah Laku (20%)
   - Prestasi Kerja (20%)
   - Kreativitas (10%)
   Total: 0-100, weighted: totalScore × 0.3

2. Penilaian Dosen Pembimbing (70%):
   - Kesesuaian Laporan dengan Format (30%)
   - Penguasaan Materi KP (30%)
   - Analisis dan Perancangan (30%)
   - Sikap dan Etika (10%)
   Total: 0-100, weighted: totalScore × 0.7

3. Rekap Nilai Akhir:
   - Total Score = Mentor (30%) + Dosen (70%)
   - Average Score = Total / 2
   - Grade: A (≥85), B (70-84), C (60-69), D (50-59), E (<50)
   - Status: LULUS (≥60), TIDAK LULUS (<60)
```

**Flow**:
```
MENTOR LAPANGAN:
1. Fill assessment form dengan 5 kriteria
2. Click "Simpan Penilaian"
3. Backend:
   - Calculate totalScore (weighted average)
   - Calculate weightedScore (totalScore × 0.3)
   - Save to assessments table
   - Trigger PDF generation
   - Update pdfGenerated, pdfUrl, pdfGeneratedAt

DOSEN PEMBIMBING:
1. Fill assessment form dengan 4 kriteria
2. Click "Simpan Penilaian"
3. Backend:
   - Calculate totalScore (weighted average)
   - Calculate weightedScore (totalScore × 0.7)
   - Save to lecturer_assessments table
   - Trigger PDF generation
   - Update pdfGenerated, pdfUrl, pdfGeneratedAt
4. If both assessments exist:
   - Auto-generate combined grade
   - Calculate final scores and grade
   - Save to combined_grades table
   - Trigger PDF generation for rekap

MAHASISWA:
1. View in student-grading-page.tsx
2. See 3 cards:
   a) Mentor Lapangan Grade (30%) - blue card
      - Show scores breakdown
      - Preview PDF button (icon mata)
   b) Dosen Pembimbing Grade (70%) - green card
      - Show scores breakdown
      - Preview PDF button (icon mata)
   c) Rekap Nilai Akhir - purple card
      - Show grade badge (A/B/C/D/E)
      - Show status (LULUS/TIDAK LULUS)
      - Show combined scores
      - Preview PDF button (icon mata)
3. Click preview button → Open PDF in new tab
```

**API Integration**:
```typescript
// services/mentor-api.ts
import { submitAssessment } from "~/feature/field-mentor/services/mentor-api";

// Submit mentor assessment (auto-generates PDF)
await submitAssessment({
  studentId: "...",
  kehadiran: 90,
  kerjasama: 85,
  sikapEtika: 88,
  prestasiKerja: 87,
  kreatifitas: 82,
  feedback: "Mahasiswa menunjukkan kinerja yang baik..."
});

// services/lecturer-api.ts
import { submitLecturerAssessment } from "~/feature/dosen/services/lecturer-api";

// Submit lecturer assessment (auto-generates PDF)
await submitLecturerAssessment({
  studentId: "...",
  kesesuaianFormat: 90,
  penguasaanMateri: 87,
  analisisPerancangan: 83,
  sikapEtika: 90,
  feedback: "Laporan KP sudah baik..."
});

// services/student-api.ts
import { 
  getMyAssessment, 
  getLecturerAssessment,
  getCombinedGrades 
} from "~/feature/student-grading/services/student-api";

// Get mentor assessment with PDF status
const { data: mentorGrade } = await getMyAssessment();
// mentorGrade.pdfGenerated, mentorGrade.pdfUrl

// Get lecturer assessment with PDF status
const { data: lecturerGrade } = await getLecturerAssessment();
// lecturerGrade.pdfGenerated, lecturerGrade.pdfUrl

// Get combined grades (rekap nilai)
const { data: combinedGrade } = await getCombinedGrades();
// combinedGrade.grade, combinedGrade.status, combinedGrade.pdfUrl
```

**Backend**:
```typescript
// POST /api/mentor/assessment
{
  studentId: "uuid",
  kehadiran: 90,
  kerjasama: 85,
  sikapEtika: 88,
  prestasiKerja: 87,
  kreatifitas: 82,
  feedback: "..."
}

// Backend logic:
1. Validate scores (0-100)
2. Calculate totalScore: 
   (kehadiran×0.2 + kerjasama×0.3 + sikapEtika×0.2 + prestasiKerja×0.2 + kreatifitas×0.1)
3. Calculate weightedScore: totalScore × 0.3
4. Save to assessments table
5. Trigger PDF generation async
6. Update pdfGenerated=true, pdfUrl, pdfGeneratedAt

Response:
{
  success: true,
  message: "Penilaian berhasil disimpan",
  data: {
    id: "...",
    totalScore: 87.4,
    weightedScore: 26.22,
    pdfGenerated: false, // Will be updated via background job
    message: "PDF akan tersedia dalam beberapa saat"
  }
}

// POST /api/dosen/assessment
{
  studentId: "uuid",
  kesesuaianFormat: 90,
  penguasaanMateri: 87,
  analisisPerancangan: 83,
  sikapEtika: 90,
  feedback: "..."
}

// Backend logic:
1. Validate scores (0-100)
2. Calculate totalScore:
   (kesesuaianFormat×0.3 + penguasaanMateri×0.3 + analisisPerancangan×0.3 + sikapEtika×0.1)
3. Calculate weightedScore: totalScore × 0.7
4. Save to lecturer_assessments table
5. Trigger PDF generation async
6. Check if mentor assessment exists:
   - If yes: Generate combined grade
   - Calculate total = mentorWeighted + lecturerWeighted
   - Determine grade (A/B/C/D/E) and status (lulus/tidak-lulus)
   - Save to combined_grades table
   - Trigger combined PDF generation

Response:
{
  success: true,
  message: "Penilaian berhasil disimpan",
  data: {
    id: "...",
    totalScore: 87.5,
    weightedScore: 61.25,
    pdfGenerated: false,
    combinedGradeGenerated: true, // If mentor assessment exists
    grade: "A",
    status: "lulus"
  }
}

// GET /api/mahasiswa/grades (Combined Grades)
Response:
{
  success: true,
  data: {
    id: "...",
    fieldMentorScore: 26.22,
    academicSupervisorScore: 61.25,
    totalScore: 87.47,
    averageScore: 43.74,
    grade: "A",
    status: "lulus",
    remarks: "Selamat! Anda telah menyelesaikan program Kerja Praktik dengan nilai yang sangat baik.",
    pdfGenerated: true,
    pdfUrl: "https://storage.../combined-grade-123.pdf",
    pdfGeneratedAt: "2026-01-23T10:30:00Z"
  }
}
```

**Grade Calculation**:
```typescript
function calculateGrade(averageScore: number): { grade: string, status: string } {
  if (averageScore >= 85) return { grade: 'A', status: 'lulus' };
  if (averageScore >= 70) return { grade: 'B', status: 'lulus' };
  if (averageScore >= 60) return { grade: 'C', status: 'lulus' };
  if (averageScore >= 50) return { grade: 'D', status: 'tidak-lulus' };
  return { grade: 'E', status: 'tidak-lulus' };
}

// Example:
// Mentor: 87.4 × 0.3 = 26.22
// Dosen: 87.5 × 0.7 = 61.25
// Total: 87.47
// Average: 87.47 / 2 = 43.74
// Grade: A, Status: lulus
```

**UI Components**:
```typescript
// field-mentor-grade-card.tsx
<Card className="border-l-4 border-l-blue-500">
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Penilaian Mentor Lapangan</CardTitle>
      <div className="flex items-center gap-2">
        <Badge className="bg-blue-500">Sudah Dinilai</Badge>
        {grade.pdfUrl && (
          <Button onClick={() => window.open(grade.pdfUrl, '_blank')}>
            <Eye className="h-4 w-4" />
            Preview PDF
          </Button>
        )}
      </div>
    </div>
  </CardHeader>
  // ... scores display
</Card>

// academic-supervisor-grade-card.tsx
<Card className="border-l-4 border-l-green-500">
  // Similar structure with green theme
</Card>

// combined-grade-card.tsx
<Card className="border-l-4 border-l-purple-500 shadow-lg">
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>
        <Award className="h-6 w-6" />
        Rekap Nilai Akhir
      </CardTitle>
      <div className="flex items-center gap-2">
        {getStatusBadge(grade.status)} {/* LULUS/TIDAK LULUS */}
        {grade.pdfUrl && (
          <Button onClick={() => window.open(grade.pdfUrl, '_blank')}>
            <Eye className="h-4 w-4" />
            Preview PDF
          </Button>
        )}
      </div>
    </div>
  </CardHeader>
  // ... grade badge (A/B/C/D/E), score breakdown
</Card>
```

---

### 6. Assessment & PDF Generation (Auto-Generate)
**Files**: 
- `app/feature/during-intern/pages/assessment-page.tsx` (Mahasiswa)
- `app/feature/field-mentor/pages/*` (Mentor)

**Flow**:
```
MENTOR SIDE:
1. Mentor fills assessment form (kehadiran, kerjasama, sikap, prestasi, kreatifitas)
2. Mentor clicks "Simpan Penilaian"
3. Call POST /api/mentor/assessment
4. Backend:
   - Save assessment to database
   - Trigger async PDF generation job
   - Generate PDF from template
   - Save to storage (S3/GCS/local)
   - Update assessment:
     * pdfGenerated = true
     * pdfUrl = "https://storage.../assessment-123.pdf"
     * pdfGeneratedAt = NOW()
5. Frontend: Show success toast

MAHASISWA SIDE:
1. Page mount: Call GET /api/mahasiswa/assessment
2. If pdfGenerated === true:
   - Show green alert: "Penilaian telah disimpan oleh Mentor Lapangan"
   - Show download button with generatedAt timestamp
3. If pdfGenerated === false:
   - Show yellow alert: "Menunggu Penilaian dari Mentor Lapangan"
   - Hide download button
4. Click "Unduh PDF Penilaian":
   - Call GET /api/mahasiswa/assessment/download
   - Browser downloads PDF file
```

**API Integration**:
```typescript
// services/mentor-api.ts
import { submitAssessment } from "~/feature/field-mentor/services/mentor-api";

// Submit assessment (auto-generates PDF)
await submitAssessment({
  studentId: "...",
  kehadiran: 90,
  kerjasama: 85,
  sikapEtika: 88,
  prestasiKerja: 87,
  kreatifitas: 82,
  feedback: "Mahasiswa menunjukkan kinerja yang baik..."
});

// services/student-api.ts
import { getMyAssessment, downloadAssessmentPdf } from "~/feature/during-intern/services/student-api";

// Get assessment with PDF status
const { data } = await getMyAssessment();
// data.pdfGenerated, data.pdfUrl, data.pdfGeneratedAt

// Download PDF
await downloadAssessmentPdf(); // Triggers browser download
```

**Backend**:
```typescript
// POST /api/mentor/assessment
{
  studentId: "uuid",
  kehadiran: 90,
  kerjasama: 85,
  sikapEtika: 88,
  prestasiKerja: 87,
  kreatifitas: 82,
  feedback: "Mahasiswa menunjukkan kinerja yang baik..."
}

// Backend logic:
1. Validate assessment data
2. Calculate totalScore
3. Save to assessments table (pdfGenerated = false initially)
4. Trigger async PDF generation:
   - Use template engine (handlebars/ejs)
   - Generate PDF (puppeteer/pdfkit)
   - Upload to storage
   - Get storage URL
5. Update assessment:
   UPDATE assessments SET
     pdf_generated = true,
     pdf_url = 'https://storage.../assessment-123.pdf',
     pdf_generated_at = NOW()
   WHERE id = $1;

Response:
{
  success: true,
  message: "Penilaian berhasil disimpan dan sedang diproses",
  data: {
    id: "...",
    totalScore: 432,
    pdfGenerated: false, // Initially false, updated via background job
    message: "PDF akan tersedia dalam beberapa saat"
  }
}

// GET /api/mahasiswa/assessment
Response:
{
  success: true,
  data: {
    id: "...",
    kehadiran: 90,
    kerjasama: 85,
    sikapEtika: 88,
    prestasiKerja: 87,
    kreatifitas: 82,
    totalScore: 432,
    feedback: "...",
    pdfGenerated: true,  // ⭐ NEW
    pdfUrl: "https://storage.../assessment-123.pdf",  // ⭐ NEW
    pdfGeneratedAt: "2026-01-22T15:30:00Z",  // ⭐ NEW
    createdAt: "2026-01-22T14:00:00Z"
  }
}

// GET /api/mahasiswa/assessment/download
Response:
- Content-Type: application/pdf
- Content-Disposition: attachment; filename="Penilaian_Magang.pdf"
- Binary PDF stream
```

**PDF Generation Notes**:
```typescript
// Backend PDF generation (example with puppeteer)
import puppeteer from 'puppeteer';
import { uploadToStorage } from './storage-service';

async function generateAssessmentPdf(assessmentId: string) {
  // 1. Get assessment data with student info
  const assessment = await db.query.assessments.findFirst({
    where: eq(assessments.id, assessmentId),
    with: { 
      student: { with: { user: true } },
      mentor: { with: { user: true } }
    }
  });
  
  // 2. Generate HTML from template
  const html = renderTemplate('assessment-pdf', {
    studentName: assessment.student.user.name,
    nim: assessment.student.nim,
    mentorName: assessment.mentor.user.name,
    scores: {
      kehadiran: assessment.kehadiran,
      kerjasama: assessment.kerjasama,
      sikapEtika: assessment.sikapEtika,
      prestasiKerja: assessment.prestasiKerja,
      kreatifitas: assessment.kreatifitas,
      total: assessment.totalScore
    },
    feedback: assessment.feedback,
    generatedAt: new Date().toISOString()
  });
  
  // 3. Generate PDF
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  const pdfBuffer = await page.pdf({ format: 'A4' });
  await browser.close();
  
  // 4. Upload to storage
  const fileName = `assessment-${assessmentId}.pdf`;
  const pdfUrl = await uploadToStorage(fileName, pdfBuffer);
  
  // 5. Update database
  await db.update(assessments)
    .set({
      pdfGenerated: true,
      pdfUrl: pdfUrl,
      pdfGeneratedAt: new Date()
    })
    .where(eq(assessments.id, assessmentId));
    
  return pdfUrl;
}

// Async job queue (example with Bull)
import Queue from 'bull';
const pdfQueue = new Queue('pdf-generation');

pdfQueue.process(async (job) => {
  const { assessmentId } = job.data;
  await generateAssessmentPdf(assessmentId);
});

// In POST /api/mentor/assessment handler
await pdfQueue.add({ assessmentId: savedAssessment.id });
```

---

### 7. DOCX Generation Workflow with E-Signature Approval

**Overview**: Sistem approval nilai KP dengan 2 tahap (Dosen → Kaprodi) menggunakan tanda tangan digital yang sudah tersimpan di database (dari profil masing-masing). Setelah kaprodi approve, sistem auto-generate DOCX file nilai.

**Files**:
- `app/feature/student-grading/pages/dosen-approval-page.tsx`
- `app/feature/student-grading/pages/kaprodi-approval-page.tsx`
- `app/feature/student-grading/components/approval-dialog.tsx`  ← Updated (no canvas)
- `app/feature/student-grading/services/approval-api.ts`  ← Updated (no signature in body)
- `app/feature/student-grading/types/approval.d.ts`

#### APPROVAL WORKFLOW STATES
```
1. PENDING_DOSEN      - Menunggu approval dosen pembimbing
2. APPROVED_DOSEN     - Dosen approved, forward ke kaprodi
3. REJECTED_DOSEN     - Dosen reject
4. PENDING_KAPRODI    - Menunggu approval kaprodi (setelah dosen approve)
5. APPROVED_KAPRODI   - Kaprodi approved (FINAL) → Generate DOCX
6. REJECTED_KAPRODI   - Kaprodi reject

FLOW:
Combined Grade Created (30% + 70%)
  ↓
PENDING_DOSEN → Dosen Review → Click "Tanda Tangani & Approve"
  ↓                              ↓ (if reject)
APPROVED_DOSEN              REJECTED_DOSEN (end)
  ↓
PENDING_KAPRODI → Kaprodi Review → Click "Tanda Tangani & Approve"
  ↓                                  ↓ (if reject)
APPROVED_KAPRODI                REJECTED_KAPRODI (end)
  ↓
Trigger DOCX Generation (async job)
  ↓
DOCX Available for Download
```

#### COMPLETE IMPLEMENTATION FLOW

**PHASE 1: GRADE CALCULATION (Automatic)**
```typescript
// Triggered after both assessments submitted
async function createCombinedGrade(internshipId: string) {
  // 1. Get mentor assessment
  const mentorAssessment = await db.query.assessments.findFirst({
    where: eq(assessments.internshipId, internshipId)
  });
  
  // 2. Get lecturer assessment
  const lecturerAssessment = await db.query.lecturerAssessments.findFirst({
    where: eq(lecturerAssessments.internshipId, internshipId)
  });
  
  // 3. Calculate combined grade
  const fieldMentorScore = mentorAssessment.totalScore * 0.3;  // 30%
  const academicSupervisorScore = lecturerAssessment.totalScore * 0.7;  // 70%
  const totalScore = fieldMentorScore + academicSupervisorScore;
  const averageScore = totalScore / 2;
  
  // 4. Calculate grade (A/B/C/D/E)
  let grade = 'E';
  if (averageScore >= 85) grade = 'A';
  else if (averageScore >= 70) grade = 'B';
  else if (averageScore >= 60) grade = 'C';
  else if (averageScore >= 50) grade = 'D';
  
  // 5. Determine status
  const status = averageScore >= 60 ? 'lulus' : 'tidak-lulus';
  
  // 6. Create record with PENDING_DOSEN status
  await db.insert(combinedGrades).values({
    studentId,
    internshipId,
    assessmentId: mentorAssessment.id,
    lecturerAssessmentId: lecturerAssessment.id,
    fieldMentorScore,
    academicSupervisorScore,
    totalScore,
    averageScore,
    grade,
    status,
    approvalStatus: 'PENDING_DOSEN',  // ← Initial state
  });
}
```

**PHASE 2: DOSEN PEMBIMBING APPROVAL**

Frontend (approval-dialog.tsx):
```tsx
// User clicks "Tanda Tangani & Approve" button
// NO signature canvas - signature from database
const handleApprove = async () => {
  const response = await approveGradeByDosen({
    gradeId: grade.id,
    // NO signature field - backend will get from database
  });
  
  if (response.success) {
    toast.success(response.message);
    onSuccess();
  }
};
```

Backend API:
```typescript
// POST /api/dosen/grades/:gradeId/approve
app.post('/api/dosen/grades/:gradeId/approve', async (req, res) => {
  try {
    const { gradeId } = req.params;
    const { notes } = req.body;
    const dosenId = req.user.lecturerId;  // From auth
    
    // 1. Get dosen data with signature
    const dosen = await db.query.lecturers.findFirst({
      where: eq(lecturers.id, dosenId),
      columns: {
        id: true,
        signature: true,  // ← Get from database
      },
      with: { user: true }
    });
    
    // 2. Validate signature exists
    if (!dosen.signature) {
      return res.status(400).json({
        success: false,
        message: "Tanda tangan belum ada di profil. Silakan upload tanda tangan terlebih dahulu.",
        data: null
      });
    }
    
    // 3. Get grade
    const grade = await db.query.combinedGrades.findFirst({
      where: eq(combinedGrades.id, gradeId),
      with: { internship: true }
    });
    
    // 4. Validate status
    if (grade.approvalStatus !== 'PENDING_DOSEN') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve: current status is ${grade.approvalStatus}`,
        data: null
      });
    }
    
    // 5. Validate dosen is the supervisor
    if (grade.internship.lecturerId !== dosenId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Not the supervisor for this student",
        data: null
      });
    }
    
    // 6. Update with dosen approval
    await db.update(combinedGrades)
      .set({
        dosenSignature: dosen.signature,  // ← From database
        dosenSignedAt: new Date(),
        dosenApprovedBy: dosenId,
        approvalStatus: 'PENDING_KAPRODI',  // Forward to kaprodi
        updatedAt: new Date()
      })
      .where(eq(combinedGrades.id, gradeId));
    
    // 7. Get kaprodi for notification
    const kaprodi = await db.query.lecturers.findFirst({
      where: and(
        eq(lecturers.prodi, grade.student.prodi),
        eq(lecturers.isKaprodi, true)  // Assume you have this field
      ),
      with: { user: true }
    });
    
    if (kaprodi) {
      await db.insert(notifications).values({
        userId: kaprodi.userId,
        title: 'Nilai KP Menunggu Approval',
        message: `Nilai KP mahasiswa ${grade.student.user.name} (${grade.student.nim}) menunggu approval Kaprodi`,
        type: 'INFO',
        link: '/kaprodi/grades/pending-approval'
      });
    }
    
    return res.json({
      success: true,
      message: "Nilai berhasil di-approve dan diteruskan ke Kaprodi",
      data: {
        gradeId,
        approvalStatus: 'PENDING_KAPRODI',
        nextApprover: 'KAPRODI'
      }
    });
    
  } catch (error) {
    console.error('Approve grade by dosen error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to approve grade",
      data: null
    });
  }
});
```

**PHASE 3: KAPRODI APPROVAL (FINAL)**

Backend API:
```typescript
// POST /api/kaprodi/grades/:gradeId/approve
app.post('/api/kaprodi/grades/:gradeId/approve', async (req, res) => {
  try {
    const { gradeId } = req.params;
    const { notes } = req.body;
    const kaprodiId = req.user.lecturerId;
    
    // 1. Get kaprodi signature from database
    const kaprodi = await db.query.lecturers.findFirst({
      where: eq(lecturers.id, kaprodiId),
      columns: { id: true, signature: true },
      with: { user: true }
    });
    
    if (!kaprodi.signature) {
      return res.status(400).json({
        success: false,
        message: "Tanda tangan Kaprodi belum ada di profil",
        data: null
      });
    }
    
    // 2. Get grade
    const grade = await db.query.combinedGrades.findFirst({
      where: eq(combinedGrades.id, gradeId),
      with: { student: { with: { user: true } } }
    });
    
    // 3. Validate status
    if (grade.approvalStatus !== 'PENDING_KAPRODI') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve: current status is ${grade.approvalStatus}`,
        data: null
      });
    }
    
    // 4. Verify dosen already approved
    if (!grade.dosenSignature) {
      return res.status(400).json({
        success: false,
        message: "Grade must be approved by dosen first",
        data: null
      });
    }
    
    // 5. Update with kaprodi approval
    await db.update(combinedGrades)
      .set({
        kaprodiSignature: kaprodi.signature,  // ← From database
        kaprodiSignedAt: new Date(),
        kaprodiApprovedBy: kaprodiId,
        approvalStatus: 'APPROVED_KAPRODI',  // FINAL
        updatedAt: new Date()
      })
      .where(eq(combinedGrades.id, gradeId));
    
    // 6. 🚀 Trigger DOCX generation job (async)
    await docxGenerationQueue.add('generate-final-grade-docx', {
      gradeId: gradeId
    }, {
      priority: 1,  // High priority
      attempts: 3,  // Retry 3 times if fails
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });
    
    return res.json({
      success: true,
      message: "Nilai berhasil di-approve final. DOCX sedang dibuat...",
      data: {
        gradeId,
        approvalStatus: 'APPROVED_KAPRODI',
        docxGenerated: false,
        message: "DOCX akan tersedia dalam beberapa saat"
      }
    });
    
  } catch (error) {
    console.error('Approve grade by kaprodi error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to approve grade",
      data: null
    });
  }
});
```

**PHASE 4: DOCX GENERATION (ASYNC JOB)**

Setup Bull Queue:
```typescript
// services/queue.ts
import Queue from 'bull';

export const docxGenerationQueue = new Queue('docx-generation', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 200,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
});
```

DOCX Generation Worker:
```typescript
// workers/docx-generator.ts
import { Document, Packer, Paragraph, TextRun, ImageRun, Table, TableCell, TableRow, AlignmentType, WidthType } from 'docx';
import { docxGenerationQueue } from './queue';
import { uploadToS3 } from './storage';
import { db } from './db';
import { combinedGrades, notifications } from './schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';

interface GradeDocxJob {
  gradeId: string;
}

// Process DOCX generation jobs
docxGenerationQueue.process('generate-final-grade-docx', async (job) => {
  const { gradeId } = job.data as GradeDocxJob;
  
  console.log(`[DOCX Worker] Starting DOCX generation for grade ${gradeId}`);
  job.progress(10);
  
  try {
    // 1. Get complete grade data with all relations
    const grade = await db.query.combinedGrades.findFirst({
      where: eq(combinedGrades.id, gradeId),
      with: {
        student: { with: { user: true } },
        assessment: {
          with: { mentor: { with: { user: true } } }
        },
        lecturerAssessment: {
          with: { lecturer: { with: { user: true } } }
        },
        internship: true,
        dosenApprover: { with: { user: true } },
        kaprodiApprover: { with: { user: true } }
      }
    });
    
    if (!grade) {
      throw new Error(`Grade ${gradeId} not found`);
    }
    
    job.progress(20);
    
    // 2. Convert Base64 signatures to image buffers
    const dosenSignatureBuffer = Buffer.from(
      grade.dosenSignature.replace(/^data:image\/\w+;base64,/, ''),
      'base64'
    );
    const kaprodiSignatureBuffer = Buffer.from(
      grade.kaprodiSignature.replace(/^data:image\/\w+;base64,/, ''),
      'base64'
    );
    
    job.progress(30);
    
    // 3. Create DOCX document
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Header
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "FORM PENILAIAN KERJA PRAKTIK",
                bold: true,
                size: 28,
              }),
            ],
          }),
          new Paragraph({ text: "" }), // Empty line
          
          // Student Info
          new Paragraph({
            children: [
              new TextRun({ text: "Nama Mahasiswa: ", bold: true }),
              new TextRun({ text: grade.student.user.name }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "NIM: ", bold: true }),
              new TextRun({ text: grade.student.nim }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Program Studi: ", bold: true }),
              new TextRun({ text: grade.student.prodi }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Tempat Magang: ", bold: true }),
              new TextRun({ text: grade.internship.company }),
            ],
          }),
          new Paragraph({ text: "" }),
          
          // Section 1: Mentor Assessment (30%)
          new Paragraph({
            children: [
              new TextRun({
                text: "I. PENILAIAN MENTOR LAPANGAN (Bobot 30%)",
                bold: true,
                size: 24,
              }),
            ],
          }),
          
          // Mentor Assessment Table
          new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("No")] }),
                  new TableCell({ children: [new Paragraph("Kriteria Penilaian")] }),
                  new TableCell({ children: [new Paragraph("Bobot")] }),
                  new TableCell({ children: [new Paragraph("Nilai")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("1")] }),
                  new TableCell({ children: [new Paragraph("Kehadiran")] }),
                  new TableCell({ children: [new Paragraph("20%")] }),
                  new TableCell({ children: [new Paragraph(grade.assessment.kehadiran.toString())] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("2")] }),
                  new TableCell({ children: [new Paragraph("Kerjasama")] }),
                  new TableCell({ children: [new Paragraph("30%")] }),
                  new TableCell({ children: [new Paragraph(grade.assessment.kerjasama.toString())] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("3")] }),
                  new TableCell({ children: [new Paragraph("Sikap & Etika")] }),
                  new TableCell({ children: [new Paragraph("20%")] }),
                  new TableCell({ children: [new Paragraph(grade.assessment.sikapEtika.toString())] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("4")] }),
                  new TableCell({ children: [new Paragraph("Prestasi Kerja")] }),
                  new TableCell({ children: [new Paragraph("20%")] }),
                  new TableCell({ children: [new Paragraph(grade.assessment.prestasiKerja.toString())] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("5")] }),
                  new TableCell({ children: [new Paragraph("Kreatifitas")] }),
                  new TableCell({ children: [new Paragraph("10%")] }),
                  new TableCell({ children: [new Paragraph(grade.assessment.kreatifitas.toString())] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("")], columnSpan: 2 }),
                  new TableCell({ children: [new Paragraph({ text: "Total Nilai:", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: parseFloat(grade.assessment.totalScore).toFixed(2), bold: true })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("")], columnSpan: 2 }),
                  new TableCell({ children: [new Paragraph({ text: "Nilai Akhir (×30%):", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: parseFloat(grade.fieldMentorScore).toFixed(2), bold: true })] }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          
          // Section 2: Lecturer Assessment (70%)
          new Paragraph({
            children: [
              new TextRun({
                text: "II. PENILAIAN DOSEN PEMBIMBING (Bobot 70%)",
                bold: true,
                size: 24,
              }),
            ],
          }),
          
          // Lecturer Assessment Table
          new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("No")] }),
                  new TableCell({ children: [new Paragraph("Kriteria Penilaian")] }),
                  new TableCell({ children: [new Paragraph("Bobot")] }),
                  new TableCell({ children: [new Paragraph("Nilai")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("1")] }),
                  new TableCell({ children: [new Paragraph("Kesesuaian Format")] }),
                  new TableCell({ children: [new Paragraph("30%")] }),
                  new TableCell({ children: [new Paragraph(grade.lecturerAssessment.kesesuaianFormat.toString())] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("2")] }),
                  new TableCell({ children: [new Paragraph("Penguasaan Materi")] }),
                  new TableCell({ children: [new Paragraph("30%")] }),
                  new TableCell({ children: [new Paragraph(grade.lecturerAssessment.penguasaanMateri.toString())] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("3")] }),
                  new TableCell({ children: [new Paragraph("Analisis & Perancangan")] }),
                  new TableCell({ children: [new Paragraph("30%")] }),
                  new TableCell({ children: [new Paragraph(grade.lecturerAssessment.analisisPerancangan.toString())] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("4")] }),
                  new TableCell({ children: [new Paragraph("Sikap & Etika")] }),
                  new TableCell({ children: [new Paragraph("10%")] }),
                  new TableCell({ children: [new Paragraph(grade.lecturerAssessment.sikapEtika.toString())] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("")], columnSpan: 2 }),
                  new TableCell({ children: [new Paragraph({ text: "Total Nilai:", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: parseFloat(grade.lecturerAssessment.totalScore).toFixed(2), bold: true })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("")], columnSpan: 2 }),
                  new TableCell({ children: [new Paragraph({ text: "Nilai Akhir (×70%):", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: parseFloat(grade.academicSupervisorScore).toFixed(2), bold: true })] }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          
          // Section 3: Combined Grade
          new Paragraph({
            children: [
              new TextRun({
                text: "III. REKAP NILAI AKHIR",
                bold: true,
                size: 24,
              }),
            ],
          }),
          
          new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Nilai Mentor Lapangan (30%)")] }),
                  new TableCell({ children: [new Paragraph(parseFloat(grade.fieldMentorScore).toFixed(2))] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Nilai Dosen Pembimbing (70%)")] }),
                  new TableCell({ children: [new Paragraph(parseFloat(grade.academicSupervisorScore).toFixed(2))] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "TOTAL NILAI", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: parseFloat(grade.totalScore).toFixed(2), bold: true })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "NILAI RATA-RATA", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: parseFloat(grade.averageScore).toFixed(2), bold: true })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "GRADE", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: grade.grade, bold: true })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "STATUS", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ 
                    text: grade.status.toUpperCase(), 
                    bold: true,
                    color: grade.status === 'lulus' ? '00AA00' : 'FF0000'
                  })] }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),
          
          // Signatures Section
          new Paragraph({
            children: [
              new TextRun({
                text: "IV. PENGESAHAN",
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          
          // Dosen Signature
          new Paragraph({
            children: [
              new TextRun({ text: "Dosen Pembimbing,", }),
            ],
          }),
          new Paragraph({
            children: [
              new ImageRun({
                data: dosenSignatureBuffer,
                transformation: {
                  width: 150,
                  height: 60,
                },
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: grade.dosenApprover.user.name, bold: true }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ 
                text: `Ditandatangani pada: ${new Date(grade.dosenSignedAt).toLocaleDateString('id-ID')}`,
                italics: true,
                size: 20,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          
          // Kaprodi Signature
          new Paragraph({
            children: [
              new TextRun({ text: "Ketua Program Studi,", }),
            ],
          }),
          new Paragraph({
            children: [
              new ImageRun({
                data: kaprodiSignatureBuffer,
                transformation: {
                  width: 150,
                  height: 60,
                },
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: grade.kaprodiApprover.user.name, bold: true }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ 
                text: `Ditandatangani pada: ${new Date(grade.kaprodiSignedAt).toLocaleDateString('id-ID')}`,
                italics: true,
                size: 20,
              }),
            ],
          }),
        ],
      }],
    });
    
    job.progress(60);
    
    // 4. Generate DOCX buffer
    const docxBuffer = await Packer.toBuffer(doc);
    job.progress(75);
    
    // 5. Upload to storage
    const fileName = `nilai-kp-${grade.student.nim}-${Date.now()}.docx`;
    const docxUrl = await uploadToS3(fileName, docxBuffer);
    job.progress(90);
    
    // 6. Update database
    await db.update(combinedGrades)
      .set({
        pdfGenerated: true,  // Keep column name for compatibility
        pdfUrl: docxUrl,     // Store DOCX URL
        pdfGeneratedAt: new Date(),
        defaultPdfUsed: false,
        updatedAt: new Date()
      })
      .where(eq(combinedGrades.id, gradeId));
    
    // 7. Notify student
    await db.insert(notifications).values({
      userId: grade.student.userId,
      title: 'Nilai KP Tersedia',
      message: 'Nilai KP Anda sudah disetujui. File DOCX dapat didownload sekarang.',
      type: 'SUCCESS',
      link: '/mahasiswa/grades'
    });
    
    job.progress(100);
    console.log(`[DOCX Worker] ✅ DOCX generated successfully for grade ${gradeId}`);
    
    return {
      success: true,
      gradeId,
      docxUrl
    };
    
  } catch (error) {
    console.error(`[DOCX Worker] ❌ DOCX generation failed for grade ${gradeId}:`, error);
    
    // ERROR HANDLING: Use default DOCX template
    try {
      const grade = await db.query.combinedGrades.findFirst({
        where: eq(combinedGrades.id, gradeId),
        with: { student: true }
      });
      
      // Copy default DOCX from template
      const defaultDocxUrl = await copyDefaultDocx(
        `nilai-kp-${grade.student.nim}-default.docx`
      );
      
      // Update database with default
      await db.update(combinedGrades)
        .set({
          pdfGenerated: true,
          pdfUrl: defaultDocxUrl,
          pdfGeneratedAt: new Date(),
          defaultPdfUsed: true,  // ⚠️ Flag for admin review
          updatedAt: new Date()
        })
        .where(eq(combinedGrades.id, gradeId));
      
      // Notify admin
      const adminUser = await db.query.users.findFirst({
        where: eq(users.role, 'ADMIN')
      });
      
      if (adminUser) {
        await db.insert(notifications).values({
          userId: adminUser.id,
          title: 'DOCX Generation Failed',
          message: `Failed to generate custom DOCX for student ${grade.student.nim}. Default file used. Error: ${error.message}`,
          type: 'ERROR',
          link: `/admin/grades/${gradeId}`
        });
      }
      
      // Still notify student
      await db.insert(notifications).values({
        userId: grade.student.userId,
        title: 'Nilai KP Tersedia',
        message: 'Nilai KP Anda sudah disetujui. File DOCX dapat didownload sekarang.',
        type: 'SUCCESS',
        link: '/mahasiswa/grades'
      });
      
      console.log(`[DOCX Worker] ⚠️ Used default DOCX for grade ${gradeId}`);
      
      return {
        success: true,
        gradeId,
        docxUrl: defaultDocxUrl,
        defaultUsed: true
      };
      
    } catch (fallbackError) {
      console.error(`[DOCX Worker] ❌ Fallback also failed:`, fallbackError);
      throw fallbackError;  // Let Bull retry
    }
  }
});

// Handle job completion
docxGenerationQueue.on('completed', (job, result) => {
  console.log(`[DOCX Queue] Job ${job.id} completed:`, result);
});

// Handle job failure (after all retries)
docxGenerationQueue.on('failed', (job, err) => {
  console.error(`[DOCX Queue] Job ${job.id} failed after retries:`, err);
});
```

#### STORAGE SERVICE

```typescript
// services/storage.ts
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-southeast-1'
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'sikp-files';

export async function uploadToS3(
  fileName: string,
  fileBuffer: Buffer
): Promise<string> {
  const params = {
    Bucket: BUCKET_NAME,
    Key: `grades/${fileName}`,
    Body: fileBuffer,
    ContentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ACL: 'private'
  };
  
  await s3.upload(params).promise();
  
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/grades/${fileName}`;
}

export async function generateSignedUrl(
  fileName: string,
  expiresIn: number = 3600  // 1 hour
): Promise<string> {
  const params = {
    Bucket: BUCKET_NAME,
    Key: `grades/${fileName}`,
    Expires: expiresIn
  };
  
  return s3.getSignedUrl('getObject', params);
}

export async function copyDefaultDocx(
  newFileName: string
): Promise<string> {
  const copyParams = {
    Bucket: BUCKET_NAME,
    CopySource: `${BUCKET_NAME}/templates/default-nilai-kp.docx`,
    Key: `grades/${newFileName}`
  };
  
  await s3.copyObject(copyParams).promise();
  
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/grades/${newFileName}`;
}
```

#### REJECT ENDPOINTS

```typescript
// POST /api/dosen/grades/:gradeId/reject
app.post('/api/dosen/grades/:gradeId/reject', async (req, res) => {
  try {
    const { gradeId } = req.params;
    const { rejectionNote } = req.body;
    const dosenId = req.user.lecturerId;
    
    // Validate
    if (!rejectionNote || rejectionNote.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Rejection note is required",
        data: null
      });
    }
    
    // Get grade
    const grade = await db.query.combinedGrades.findFirst({
      where: eq(combinedGrades.id, gradeId),
      with: { internship: true, student: { with: { user: true } } }
    });
    
    // Validate
    if (grade.approvalStatus !== 'PENDING_DOSEN') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject: current status is ${grade.approvalStatus}`,
        data: null
      });
    }
    
    if (grade.internship.lecturerId !== dosenId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
        data: null
      });
    }
    
    // Update with rejection
    await db.update(combinedGrades)
      .set({
        dosenRejectionNote: rejectionNote.trim(),
        approvalStatus: 'REJECTED_DOSEN',
        updatedAt: new Date()
      })
      .where(eq(combinedGrades.id, gradeId));
    
    // Notify student
    await db.insert(notifications).values({
      userId: grade.student.userId,
      title: 'Nilai KP Ditolak',
      message: `Nilai KP Anda ditolak oleh dosen pembimbing. Alasan: ${rejectionNote}`,
      type: 'ERROR',
      link: '/mahasiswa/grades'
    });
    
    return res.json({
      success: true,
      message: "Nilai berhasil ditolak",
      data: null
    });
    
  } catch (error) {
    console.error('Reject grade by dosen error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject grade",
      data: null
    });
  }
});

// POST /api/kaprodi/grades/:gradeId/reject
app.post('/api/kaprodi/grades/:gradeId/reject', async (req, res) => {
  // Similar to dosen reject but check for 'PENDING_KAPRODI' status
  // Update approvalStatus to 'REJECTED_KAPRODI'
  // ... (implementation similar to above)
});
```

#### IMPLEMENTATION CHECKLIST

**Backend Setup:**
- [ ] Install dependencies: `npm install bull docx aws-sdk @types/bull`
- [ ] Setup Redis for Bull queue
- [ ] Setup AWS S3 credentials (or local storage)
- [ ] Add `signature` field to lecturers table (TEXT, nullable)
- [ ] Add `isKaprodi` flag to lecturers table (BOOLEAN, default false)
- [ ] Upload default DOCX template to S3 (`templates/default-nilai-kp.docx`)

**API Endpoints:**
- [ ] GET /api/dosen/grades/pending-approval
- [ ] POST /api/dosen/grades/:id/approve (get signature from database)
- [ ] POST /api/dosen/grades/:id/reject
- [ ] GET /api/kaprodi/grades/pending-approval
- [ ] POST /api/kaprodi/grades/:id/approve (trigger DOCX job)
- [ ] POST /api/kaprodi/grades/:id/reject
- [ ] GET /api/mahasiswa/grades/download/:gradeId (signed URL)

**DOCX Generation:**
- [ ] Implement DOCX worker with `docx` library
- [ ] Setup Bull queue processing
- [ ] Implement storage upload (S3/GCS/Local)
- [ ] Implement error handling with default DOCX fallback
- [ ] Setup notification system

**Profile Management (for signature upload):**
- [ ] Add signature upload field in dosen/kaprodi profile page
- [ ] Implement signature validation (max 100KB, image format)
- [ ] Display current signature in profile
- [ ] Allow signature update/delete

**Testing:**
- [ ] Test dosen approval flow (with signature from database)
- [ ] Test kaprodi approval flow
- [ ] Test rejection flow
- [ ] Test DOCX generation with real data
- [ ] Test error handling (fallback to default DOCX)
- [ ] Test concurrent approvals
- [ ] Load test DOCX queue

**Environment Variables:**
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sikp

# Redis (for Bull queue)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=sikp-files

# DOCX Generation
DOCX_GENERATION_TIMEOUT=30000  # 30 seconds
```

---

### 8. Logbook DOCX Generation with E-Signature from Database

**Overview**: Sistem generate DOCX logbook harian mahasiswa dengan tanda tangan pembimbing lapangan yang diambil dari database (bukan canvas).

**Files**:
- `app/feature/during-intern/components/generate-logbook-button.tsx` - Button component untuk trigger generate
- `app/feature/during-intern/services/logbook-generation-api.ts` - API services
- `app/feature/during-intern/types/logbook.d.ts` - Type definitions

#### FLOW DIAGRAM

```
Mahasiswa Isi Logbook Harian
  ↓
Mentor Lapangan Review Logbook
  ↓
Mentor Approve dengan Button (GET signature dari database)
  ↓
Status: PENDING → APPROVED (with mentor_signature)
  ↓
Mahasiswa Click "Generate Logbook DOCX"
  ↓
System Validates:
  - At least 1 approved entry ✓
  - Mentor signature exists in database ✓
  ↓
Generate DOCX with docx library
  ↓
DOCX Content:
  - Header: Logo, Student Info (from DB)
  - Table: Week | Date | Activity (max 200 chars) | Signature
  - Auto-group by week number
  - Mentor signature image (from DB)
  ↓
Upload to S3 Storage
  ↓
Return Download URL
  ↓
Mahasiswa Download DOCX
```

#### COMPLETE IMPLEMENTATION

**PHASE 1: Database Schema Updates**

```sql
-- Add week_number to logbooks table
ALTER TABLE logbooks ADD COLUMN week_number INTEGER;
ALTER TABLE logbooks ADD COLUMN activity VARCHAR(200);  -- Jenis kegiatan (limited)

-- Add constraint for activity max length
ALTER TABLE logbooks ADD CONSTRAINT check_activity_length 
  CHECK (LENGTH(activity) <= 200);

-- Add generated_docx columns for tracking
ALTER TABLE logbooks ADD COLUMN docx_generated BOOLEAN DEFAULT false;
ALTER TABLE logbooks ADD COLUMN docx_url TEXT;
ALTER TABLE logbooks ADD COLUMN docx_generated_at TIMESTAMP;

-- Index for week queries
CREATE INDEX idx_logbooks_week_number ON logbooks(student_id, week_number);
CREATE INDEX idx_logbooks_status_approved ON logbooks(student_id, status) 
  WHERE status = 'APPROVED';
```

**PHASE 2: Calculate Week Number (Backend Helper)**

```typescript
// utils/calculate-week-number.ts

/**
 * Calculate week number from internship start date
 * @param startDate - Internship start date
 * @param currentDate - Logbook entry date
 * @returns Week number (1-based)
 */
export function calculateWeekNumber(startDate: Date, currentDate: Date): number {
  const start = new Date(startDate);
  const current = new Date(currentDate);
  
  // Reset to start of day
  start.setHours(0, 0, 0, 0);
  current.setHours(0, 0, 0, 0);
  
  // Calculate difference in days
  const diffTime = current.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Calculate week number (1-based)
  const weekNumber = Math.ceil((diffDays + 1) / 7);
  
  return weekNumber;
}
```

**PHASE 3: API Endpoints**

**A. Create Logbook Entry (Auto-calculate Week)**

```typescript
// POST /api/logbook/create
app.post('/api/logbook/create', async (req, res) => {
  try {
    const { date, activity, description } = req.body;
    const studentId = req.user.studentId;
    
    // Validate activity length
    if (activity && activity.length > 200) {
      return res.status(400).json({
        success: false,
        message: "Jenis kegiatan maksimal 200 karakter",
        data: null
      });
    }
    
    // Get internship data to calculate week
    const internship = await db.query.internships.findFirst({
      where: eq(internships.studentId, studentId),
      columns: { id: true, startDate: true }
    });
    
    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Data magang tidak ditemukan",
        data: null
      });
    }
    
    // Calculate week number
    const weekNumber = calculateWeekNumber(
      new Date(internship.startDate),
      new Date(date)
    );
    
    // Create logbook entry
    const [logbook] = await db.insert(logbooks).values({
      studentId,
      internshipId: internship.id,
      date,
      weekNumber,  // Auto-calculated
      activity: activity || '',
      description,
      status: 'PENDING'
    }).returning();
    
    return res.json({
      success: true,
      message: "Logbook berhasil dibuat",
      data: logbook
    });
    
  } catch (error) {
    console.error('Create logbook error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to create logbook",
      data: null
    });
  }
});
```

**B. Approve Logbook (Get Signature from Database)**

```typescript
// POST /api/mentor/logbook/:logbookId/approve
app.post('/api/mentor/logbook/:logbookId/approve', async (req, res) => {
  try {
    const { logbookId } = req.params;
    const { notes } = req.body;
    const mentorId = req.user.mentorId;
    
    // 1. Get mentor signature from database
    const mentor = await db.query.mentors.findFirst({
      where: eq(mentors.id, mentorId),
      columns: {
        id: true,
        signature: true,  // ← From database
      },
      with: { user: true }
    });
    
    // 2. Validate signature exists
    if (!mentor.signature) {
      return res.status(400).json({
        success: false,
        message: "Tanda tangan belum ada di profil. Silakan upload tanda tangan terlebih dahulu.",
        data: null
      });
    }
    
    // 3. Get logbook
    const logbook = await db.query.logbooks.findFirst({
      where: eq(logbooks.id, logbookId),
      with: {
        student: { with: { user: true } },
        internship: true
      }
    });
    
    if (!logbook) {
      return res.status(404).json({
        success: false,
        message: "Logbook not found",
        data: null
      });
    }
    
    // 4. Validate mentor is the supervisor
    if (logbook.internship.mentorId !== mentorId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Not the supervisor for this student",
        data: null
      });
    }
    
    // 5. Validate status
    if (logbook.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve: current status is ${logbook.status}`,
        data: null
      });
    }
    
    // 6. Update logbook with approval
    await db.update(logbooks)
      .set({
        status: 'APPROVED',
        mentorSignature: mentor.signature,  // ← From database
        mentorSignedAt: new Date(),
        mentorNotes: notes || null,
        updatedAt: new Date()
      })
      .where(eq(logbooks.id, logbookId));
    
    // 7. Notify student
    await db.insert(notifications).values({
      userId: logbook.student.userId,
      title: 'Logbook Disetujui',
      message: `Logbook tanggal ${new Date(logbook.date).toLocaleDateString('id-ID')} telah disetujui oleh ${mentor.user.name}`,
      type: 'SUCCESS',
      link: '/mahasiswa/logbook'
    });
    
    return res.json({
      success: true,
      message: "Logbook berhasil disetujui dengan paraf Anda",
      data: {
        logbookId,
        status: 'APPROVED',
        mentorName: mentor.user.name,
        signedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Approve logbook error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to approve logbook",
      data: null
    });
  }
});
```

**C. Validate Logbook Generation**

```typescript
// GET /api/logbook/validate-generation
app.get('/api/logbook/validate-generation', async (req, res) => {
  try {
    const studentId = req.user.studentId;
    
    // Check if has approved logbooks
    const approvedCount = await db.select({ count: count() })
      .from(logbooks)
      .where(and(
        eq(logbooks.studentId, studentId),
        eq(logbooks.status, 'APPROVED')
      ));
    
    if (approvedCount[0].count === 0) {
      return res.json({
        success: true,
        message: "Validation complete",
        data: {
          canGenerate: false,
          reason: "Belum ada logbook yang disetujui pembimbing lapangan"
        }
      });
    }
    
    // Check if mentor has signature
    const internship = await db.query.internships.findFirst({
      where: eq(internships.studentId, studentId),
      with: {
        mentor: {
          columns: { signature: true }
        }
      }
    });
    
    if (!internship) {
      return res.json({
        success: true,
        message: "Validation complete",
        data: {
          canGenerate: false,
          reason: "Data magang tidak ditemukan"
        }
      });
    }
    
    if (!internship.mentor.signature) {
      return res.json({
        success: true,
        message: "Validation complete",
        data: {
          canGenerate: false,
          reason: "Pembimbing lapangan belum upload tanda tangan. Silakan hubungi pembimbing lapangan Anda."
        }
      });
    }
    
    return res.json({
      success: true,
      message: "Logbook ready to generate",
      data: {
        canGenerate: true
      }
    });
    
  } catch (error) {
    console.error('Validate logbook error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to validate logbook",
      data: null
    });
  }
});
```

**D. Get Logbook Preview**

```typescript
// GET /api/logbook/preview?weekNumber=1
app.get('/api/logbook/preview', async (req, res) => {
  try {
    const studentId = req.user.studentId;
    const { weekNumber } = req.query;
    
    // Build where clause
    const whereClause = weekNumber
      ? and(
          eq(logbooks.studentId, studentId),
          eq(logbooks.weekNumber, parseInt(weekNumber as string))
        )
      : eq(logbooks.studentId, studentId);
    
    // Get logbooks with relations
    const logbookEntries = await db.query.logbooks.findMany({
      where: whereClause,
      with: {
        student: {
          with: { user: true }
        },
        internship: {
          with: {
            mentor: {
              with: { user: true },
              columns: { signature: true }
            }
          }
        }
      },
      orderBy: [asc(logbooks.weekNumber), asc(logbooks.date)]
    });
    
    if (logbookEntries.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No logbook entries found",
        data: null
      });
    }
    
    // Group by week
    const weekGroups = new Map<number, typeof logbookEntries>();
    logbookEntries.forEach(entry => {
      if (!weekGroups.has(entry.weekNumber)) {
        weekGroups.set(entry.weekNumber, []);
      }
      weekGroups.get(entry.weekNumber)!.push(entry);
    });
    
    // Format response
    const weeks = Array.from(weekGroups.entries()).map(([weekNum, entries]) => ({
      weekNumber: weekNum,
      startDate: entries[0].date,
      endDate: entries[entries.length - 1].date,
      entries: entries.map(e => ({
        id: e.id,
        date: e.date,
        weekNumber: e.weekNumber,
        activity: e.activity,
        description: e.description,
        status: e.status,
        mentorSignature: e.mentorSignature,
        mentorSignedAt: e.mentorSignedAt,
        mentorNotes: e.mentorNotes
      }))
    }));
    
    const firstEntry = logbookEntries[0];
    
    const response = {
      studentName: firstEntry.student.user.name,
      nim: firstEntry.student.nim,
      prodi: firstEntry.student.prodi,
      company: firstEntry.internship.company,
      division: firstEntry.internship.division || firstEntry.internship.position,
      startDate: firstEntry.internship.startDate,
      endDate: firstEntry.internship.endDate,
      weeks,
      mentorName: firstEntry.internship.mentor.user.name,
      mentorSignature: firstEntry.internship.mentor.signature,
      mentorSignedAt: firstEntry.mentorSignedAt
    };
    
    return res.json({
      success: true,
      message: "Logbook preview retrieved successfully",
      data: response
    });
    
  } catch (error) {
    console.error('Get logbook preview error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to get logbook preview",
      data: null
    });
  }
});
```

**E. Generate DOCX (Main Endpoint)**

```typescript
// POST /api/logbook/generate-docx?weekNumber=1
import { Document, Packer, Paragraph, TextRun, ImageRun, Table, TableCell, TableRow, AlignmentType, WidthType, VerticalAlign, BorderStyle } from 'docx';
import { docxGenerationQueue } from './queue';

app.post('/api/logbook/generate-docx', async (req, res) => {
  try {
    const studentId = req.user.studentId;
    const { weekNumber } = req.query;
    
    // Validate first
    const validation = await validateLogbookGeneration(studentId);
    if (!validation.canGenerate) {
      return res.status(400).json({
        success: false,
        message: validation.reason,
        data: null
      });
    }
    
    // Trigger async job
    const jobId = `logbook-${studentId}-${Date.now()}`;
    await docxGenerationQueue.add('generate-logbook-docx', {
      studentId,
      weekNumber: weekNumber ? parseInt(weekNumber as string) : null,
      jobId
    }, {
      priority: 1,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });
    
    return res.json({
      success: true,
      message: "Logbook DOCX generation started",
      data: {
        jobId,
        message: "DOCX akan tersedia dalam beberapa saat"
      }
    });
    
  } catch (error) {
    console.error('Generate logbook DOCX error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to start DOCX generation",
      data: null
    });
  }
});
```

**PHASE 4: DOCX Generation Worker**

```typescript
// workers/logbook-docx-generator.ts
import { Document, Packer, Paragraph, TextRun, ImageRun, Table, TableCell, TableRow, AlignmentType, WidthType, VerticalAlign, BorderStyle } from 'docx';
import { docxGenerationQueue } from './queue';
import { uploadToS3 } from './storage';
import { db } from './db';
import { logbooks, notifications } from './schema';
import { eq, and } from 'drizzle-orm';

interface LogbookDocxJob {
  studentId: string;
  weekNumber: number | null;
  jobId: string;
}

docxGenerationQueue.process('generate-logbook-docx', async (job) => {
  const { studentId, weekNumber, jobId } = job.data as LogbookDocxJob;
  
  console.log(`[DOCX Worker] Starting logbook DOCX generation for student ${studentId}`);
  job.progress(10);
  
  try {
    // 1. Get logbook data with preview endpoint logic
    const previewData = await getLogbookPreviewData(studentId, weekNumber);
    job.progress(20);
    
    // 2. Convert mentor signature to buffer
    const mentorSignatureBuffer = Buffer.from(
      previewData.mentorSignature.replace(/^data:image\/\w+;base64,/, ''),
      'base64'
    );
    job.progress(30);
    
    // 3. Create DOCX document
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 720,    // 0.5 inch
              bottom: 720,
              left: 720,
              right: 720
            }
          }
        },
        children: [
          // === HEADER ===
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "LOGBOOK KERJA PRAKTIK",
                bold: true,
                size: 28,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          
          // === STUDENT INFO ===
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ text: "Nama", style: "normal" })],
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                  }),
                  new TableCell({
                    width: { size: 2, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ text: ":" })],
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                  }),
                  new TableCell({
                    width: { size: 68, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ text: previewData.studentName, bold: true })],
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "NIM" })],
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: ":" })],
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: previewData.nim })],
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "Program Studi" })],
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: ":" })],
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: previewData.prodi })],
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "Tempat KP" })],
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: ":" })],
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: previewData.company })],
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "Bagian/Bidang" })],
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: ":" })],
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: previewData.division })],
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          
          // === LOGBOOK TABLE ===
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              // Header row
              new TableRow({
                tableHeader: true,
                children: [
                  new TableCell({
                    width: { size: 10, type: WidthType.PERCENTAGE },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [
                      new Paragraph({
                        text: "Minggu Ke-",
                        bold: true,
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 15, type: WidthType.PERCENTAGE },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [
                      new Paragraph({
                        text: "Tanggal",
                        bold: true,
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [
                      new Paragraph({
                        text: "Jenis Kegiatan",
                        bold: true,
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [
                      new Paragraph({
                        text: "Paraf Pembimbing",
                        bold: true,
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                  }),
                ],
              }),
              
              // Data rows (grouped by week)
              ...previewData.weeks.flatMap((week) => 
                week.entries.map((entry, index) => 
                  new TableRow({
                    children: [
                      new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        children: [
                          new Paragraph({
                            text: index === 0 ? week.weekNumber.toString() : "",
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                      new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        children: [
                          new Paragraph({
                            text: new Date(entry.date).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            }),
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                      new TableCell({
                        verticalAlign: VerticalAlign.TOP,
                        children: [
                          new Paragraph({
                            text: entry.activity || entry.description.substring(0, 200),
                            alignment: AlignmentType.LEFT,
                          }),
                        ],
                      }),
                      new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        children: entry.status === 'APPROVED' && entry.mentorSignature ? [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new ImageRun({
                                data: mentorSignatureBuffer,
                                transformation: {
                                  width: 80,
                                  height: 40,
                                },
                              }),
                            ],
                          }),
                        ] : [
                          new Paragraph({
                            text: "-",
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                    ],
                  })
                )
              ),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),
          
          // === MENTOR SIGNATURE SECTION ===
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: `${previewData.company}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: "Pembimbing Lapangan,",
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new ImageRun({
                data: mentorSignatureBuffer,
                transformation: {
                  width: 150,
                  height: 60,
                },
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: previewData.mentorName,
                bold: true,
                underline: {},
              }),
            ],
          }),
        ],
      }],
    });
    
    job.progress(60);
    
    // 4. Generate DOCX buffer
    const docxBuffer = await Packer.toBuffer(doc);
    job.progress(75);
    
    // 5. Upload to storage
    const fileName = `logbook-${previewData.nim}${weekNumber ? `-minggu${weekNumber}` : ''}-${Date.now()}.docx`;
    const docxUrl = await uploadToS3(fileName, docxBuffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    job.progress(90);
    
    // 6. Update database
    await db.update(logbooks)
      .set({
        docxGenerated: true,
        docxUrl: docxUrl,
        docxGeneratedAt: new Date()
      })
      .where(
        weekNumber
          ? and(
              eq(logbooks.studentId, studentId),
              eq(logbooks.weekNumber, weekNumber)
            )
          : eq(logbooks.studentId, studentId)
      );
    
    // 7. Notify student
    await db.insert(notifications).values({
      userId: previewData.studentUserId,
      title: 'Logbook DOCX Tersedia',
      message: `Logbook${weekNumber ? ` minggu ke-${weekNumber}` : ''} Anda sudah tersedia untuk didownload.`,
      type: 'SUCCESS',
      link: '/mahasiswa/logbook'
    });
    
    job.progress(100);
    console.log(`[DOCX Worker] ✅ Logbook DOCX generated successfully for student ${studentId}`);
    
    return {
      success: true,
      studentId,
      docxUrl,
      fileName
    };
    
  } catch (error) {
    console.error(`[DOCX Worker] ❌ Logbook DOCX generation failed:`, error);
    throw error;  // Let Bull retry
  }
});

// Handle job completion
docxGenerationQueue.on('completed', (job, result) => {
  console.log(`[DOCX Queue] Job ${job.id} completed:`, result);
});

// Handle job failure
docxGenerationQueue.on('failed', (job, err) => {
  console.error(`[DOCX Queue] Job ${job.id} failed after retries:`, err);
});
```

#### IMPLEMENTATION CHECKLIST

**Frontend:**
- [x] Create logbook.d.ts types with weekNumber and activity
- [x] Create logbook-generation-api.ts service
- [x] Create generate-logbook-button.tsx component
- [ ] Add button to logbook-page.tsx
- [ ] Update logbook form to include activity field (max 200 chars)
- [ ] Add character counter for activity field

**Backend:**
- [ ] Add week_number and activity columns to logbooks table
- [ ] Implement calculateWeekNumber() helper function
- [ ] Update POST /api/logbook/create to auto-calculate week
- [ ] Update POST /api/mentor/logbook/:id/approve to use DB signature
- [ ] Implement GET /api/logbook/validate-generation
- [ ] Implement GET /api/logbook/preview
- [ ] Implement POST /api/logbook/generate-docx
- [ ] Create DOCX worker with docx library
- [ ] Setup Bull queue for async generation
- [ ] Add mentor signature upload in profile page

**Testing:**
- [ ] Test week number calculation (edge cases: start Monday vs Sunday)
- [ ] Test activity field character limit (200 chars)
- [ ] Test DOCX generation with single week
- [ ] Test DOCX generation with all weeks
- [ ] Test signature from database (not canvas)
- [ ] Test validation (no approved entries)
- [ ] Test validation (mentor no signature)
- [ ] Test DOCX table layout dengan ukuran sesuai
- [ ] Test signature image quality di DOCX

**Environment Variables:**
```bash
# Redis (for Bull queue)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=sikp-files
```

**Dependencies:**
```bash
npm install docx bull aws-sdk
npm install --save-dev @types/bull
```

---

### 9. Testing Examples
**Files**:
- `app/feature/student-grading/pages/dosen-approval-page.tsx`
- `app/feature/student-grading/pages/kaprodi-approval-page.tsx`
- `app/feature/student-grading/components/approval-dialog.tsx`
- `app/feature/student-grading/services/approval-api.ts`
- `app/feature/student-grading/types/approval.d.ts`

**System Overview**:
```
APPROVAL WORKFLOW STATES:
1. PENDING_DOSEN      - Menunggu approval dosen pembimbing
2. APPROVED_DOSEN     - Dosen approved, forward ke kaprodi
3. REJECTED_DOSEN     - Dosen reject, mahasiswa perlu revisi
4. PENDING_KAPRODI    - Menunggu approval kaprodi (setelah dosen approve)
5. APPROVED_KAPRODI   - Kaprodi approved (FINAL) → Generate PDF
6. REJECTED_KAPRODI   - Kaprodi reject, mahasiswa perlu revisi

FLOW:
Combined Grade Created (30% + 70%)
  ↓
PENDING_DOSEN → Dosen Review → E-Sign Approve
  ↓                              ↓ (if reject)
APPROVED_DOSEN              REJECTED_DOSEN (end)
  ↓
PENDING_KAPRODI → Kaprodi Review → E-Sign Approve
  ↓                                  ↓ (if reject)
APPROVED_KAPRODI                REJECTED_KAPRODI (end)
  ↓
Trigger PDF Generation (with both signatures)
  ↓
PDF Available for Download
```

**Complete Flow**:
```
PHASE 1: GRADE CALCULATION
1. Mentor Lapangan submits assessment (30%)
2. Dosen Pembimbing submits assessment (70%)
3. Backend auto-calculates combined grade:
   - fieldMentorScore = assessment.totalScore × 0.3
   - academicSupervisorScore = lecturerAssessment.totalScore × 0.7
   - totalScore = fieldMentorScore + academicSupervisorScore
   - averageScore = totalScore / 2
   - grade = calculateGrade(averageScore) // A/B/C/D/E
   - status = averageScore >= 60 ? 'lulus' : 'tidak-lulus'
4. Create combined_grades record with approval_status = 'PENDING_DOSEN'

PHASE 2: DOSEN PEMBIMBING APPROVAL
1. Dosen accesses /dosen/grades/pending-approval
2. Reviews grade breakdown and student info
3. Options:
   a) APPROVE:
      - Draw e-signature on canvas
      - Click "Approve & Tanda Tangan"
      - Backend:
        * Validate signature (not empty, valid base64)
        * Save dosen_signature (base64)
        * Set dosen_signed_at = NOW()
        * Set dosen_approved_by = dosen.id
        * Update approval_status = 'APPROVED_DOSEN'
        * Forward to kaprodi (set to 'PENDING_KAPRODI')
        * Send notification to kaprodi
   b) REJECT:
      - Enter rejection note
      - Backend:
        * Set dosen_rejection_note
        * Update approval_status = 'REJECTED_DOSEN'
        * Send notification to mahasiswa (need revision)

PHASE 3: KAPRODI APPROVAL (FINAL)
1. Kaprodi accesses /kaprodi/grades/pending-approval
2. Reviews grade + sees dosen has approved
3. Options:
   a) APPROVE (FINAL):
      - Draw e-signature on canvas
      - Click "Final Approve & Tanda Tangan"
      - Backend:
        * Validate signature
        * Save kaprodi_signature (base64)
        * Set kaprodi_signed_at = NOW()
        * Set kaprodi_approved_by = kaprodi.id
        * Update approval_status = 'APPROVED_KAPRODI'
        * 🚀 TRIGGER PDF GENERATION JOB
   b) REJECT:
      - Enter rejection note
      - Backend:
        * Set kaprodi_rejection_note
        * Update approval_status = 'REJECTED_KAPRODI'
        * Send notification to mahasiswa

PHASE 4: PDF GENERATION (ASYNC JOB)
Triggered when approval_status = 'APPROVED_KAPRODI'

1. Get complete grade data:
   - Student info (name, nim, prodi)
   - Mentor assessment scores
   - Lecturer assessment scores
   - Combined grade (total, average, grade, status)
   - Both signatures (dosen + kaprodi)
   - Approval timestamps

2. Generate HTML from template (based on MI - Form Nilai KP.pdf):
   - Header: Logo, Title, Student Info
   - Section 1: Penilaian Mentor Lapangan (30%)
     * Kehadiran, Kerjasama, Sikap, Prestasi, Kreatifitas
     * Total score and weighted (×0.3)
   - Section 2: Penilaian Dosen Pembimbing (70%)
     * Kesesuaian Format, Penguasaan Materi, Analisis, Sikap
     * Total score and weighted (×0.7)
   - Section 3: Rekap Nilai Akhir
     * Total Score, Average, Grade (A/B/C/D/E)
     * Status: LULUS / TIDAK LULUS
   - Signature Section:
     * Dosen Pembimbing signature + name + date
     * Kaprodi signature + name + date

3. Convert HTML to PDF (puppeteer):
   ```typescript
   const browser = await puppeteer.launch();
   const page = await browser.newPage();
   await page.setContent(html);
   const pdfBuffer = await page.pdf({
     format: 'A4',
     printBackground: true,
     margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }
   });
   await browser.close();
   ```

4. Upload to storage:
   - File name: `nilai-kp-${studentNim}-${timestamp}.pdf`
   - Upload to S3/GCS/Local
   - Get public/signed URL

5. Update database:
   ```sql
   UPDATE combined_grades SET
     pdf_generated = true,
     pdf_url = 'https://storage.../nilai-kp-xxx.pdf',
     pdf_generated_at = NOW(),
     default_pdf_used = false
   WHERE id = $1;
   ```

6. Send notification to mahasiswa:
   - "Nilai KP Anda sudah disetujui dan PDF tersedia untuk download"

ERROR HANDLING:
If PDF generation fails (puppeteer error, storage error, etc.):
1. Log error to monitoring system
2. Use default/template PDF (MI - Form Nilai KP.pdf):
   - Copy default PDF to student folder
   - Fill metadata only (no custom data)
3. Update database:
   ```sql
   UPDATE combined_grades SET
     pdf_generated = true,
     pdf_url = 'https://storage.../default-nilai-kp.pdf',
     pdf_generated_at = NOW(),
     default_pdf_used = true  -- ⚠️ Flag for admin review
   WHERE id = $1;
   ```
4. Send notification to admin:
   - "PDF generation failed for student ${nim}, using default PDF"
5. Mahasiswa still can download (default PDF)
```

**API Integration**:
```typescript
// services/approval-api.ts

// DOSEN: Get pending approvals
const { data: pendingGrades } = await getPendingDosenApprovals();
// Returns: CombinedGradeWithApproval[]

// DOSEN: Approve with e-signature
await approveGradeByDosen({
  gradeId: "...",
  signature: "data:image/png;base64,...",  // From canvas
  notes: "Nilai sudah sesuai"  // Optional
});

// DOSEN: Reject
await rejectGradeByDosen({
  gradeId: "...",
  rejectionNote: "Perlu perbaikan di bagian X"
});

// KAPRODI: Get pending approvals (already approved by dosen)
const { data: pendingForKaprodi } = await getPendingKaprodiApprovals();

// KAPRODI: Final approve (triggers PDF generation)
await approveGradeByKaprodi({
  gradeId: "...",
  signature: "data:image/png;base64,...",
  notes: "Disetujui untuk dicetak"  // Optional
});

// KAPRODI: Reject
await rejectGradeByKaprodi({
  gradeId: "...",
  rejectionNote: "Masih ada kesalahan di penilaian"
});

// MAHASISWA: Download final PDF
const pdfUrl = getGradePdfDownloadUrl(gradeId);
window.open(pdfUrl, '_blank'); // Download PDF
```

**Backend Implementation**:
```typescript
// POST /api/dosen/grades/:gradeId/approve
{
  signature: "data:image/png;base64,iVBORw0KGgo...",
  notes?: "Nilai sudah sesuai"
}

// Backend logic:
1. Validate request:
   - Check grade exists and belongs to dosen's students
   - Check current status = 'PENDING_DOSEN'
   - Validate signature (not empty, valid base64, max 100KB)

2. Update combined_grades:
   UPDATE combined_grades SET
     dosen_signature = $1,
     dosen_signed_at = NOW(),
     dosen_approved_by = $2,  -- Dosen ID from auth
     approval_status = 'PENDING_KAPRODI',  -- Forward to kaprodi
     updated_at = NOW()
   WHERE id = $3;

3. Create notification for kaprodi:
   INSERT INTO notifications (user_id, title, message, type, link)
   VALUES (
     (SELECT user_id FROM lecturers WHERE role = 'KAPRODI'),
     'Nilai KP Menunggu Approval',
     'Nilai KP mahasiswa ${studentName} menunggu approval Kaprodi',
     'INFO',
     '/kaprodi/grades/pending-approval'
   );

4. Response:
   {
     success: true,
     message: "Nilai berhasil di-approve dan diteruskan ke Kaprodi",
     data: {
       gradeId: "...",
       approvalStatus: "PENDING_KAPRODI",
       nextApprover: "KAPRODI"
     }
   }

// POST /api/kaprodi/grades/:gradeId/approve
{
  signature: "data:image/png;base64,iVBORw0KGgo...",
  notes?: "Disetujui"
}

// Backend logic:
1. Validate request:
   - Check grade exists
   - Check current status = 'PENDING_KAPRODI'
   - Check dosen already approved (dosen_signature exists)
   - Validate signature

2. Update combined_grades:
   UPDATE combined_grades SET
     kaprodi_signature = $1,
     kaprodi_signed_at = NOW(),
     kaprodi_approved_by = $2,  -- Kaprodi ID
     approval_status = 'APPROVED_KAPRODI',
     updated_at = NOW()
   WHERE id = $3;

3. 🚀 Trigger async PDF generation job:
   await pdfGenerationQueue.add('generate-final-grade-pdf', {
     gradeId: gradeId,
     priority: 'high'
   });

4. Response (don't wait for PDF):
   {
     success: true,
     message: "Nilai berhasil di-approve final. PDF sedang dibuat...",
     data: {
       gradeId: "...",
       approvalStatus: "APPROVED_KAPRODI",
       pdfGenerated: false,  // Will be true after job completes
       message: "PDF akan tersedia dalam beberapa saat"
     }
   }

// ASYNC JOB: Generate PDF
async function generateFinalGradePdf(gradeId: string) {
  try {
    // 1. Get complete data
    const grade = await db.query.combinedGrades.findFirst({
      where: eq(combinedGrades.id, gradeId),
      with: {
        student: { with: { user: true } },
        assessment: { with: { mentor: { with: { user: true } } } },
        lecturerAssessment: { with: { lecturer: { with: { user: true } } } },
        internship: true,
        dosenApprover: { with: { user: true } },  -- Dosen yang approve
        kaprodiApprover: { with: { user: true } }  -- Kaprodi yang approve
      }
    });

    // 2. Generate HTML from template
    const html = renderGradePdfTemplate({
      student: {
        name: grade.student.user.name,
        nim: grade.student.nim,
        prodi: grade.student.prodi,
        fakultas: grade.student.fakultas
      },
      internship: {
        company: grade.internship.company,
        position: grade.internship.position,
        startDate: grade.internship.startDate,
        endDate: grade.internship.endDate
      },
      mentorAssessment: {
        mentorName: grade.assessment.mentor.user.name,
        scores: {
          kehadiran: grade.assessment.kehadiran,
          kerjasama: grade.assessment.kerjasama,
          sikapEtika: grade.assessment.sikapEtika,
          prestasiKerja: grade.assessment.prestasiKerja,
          kreatifitas: grade.assessment.kreatifitas
        },
        totalScore: grade.assessment.totalScore,
        weightedScore: grade.assessment.weightedScore
      },
      lecturerAssessment: {
        lecturerName: grade.lecturerAssessment.lecturer.user.name,
        scores: {
          kesesuaianFormat: grade.lecturerAssessment.kesesuaianFormat,
          penguasaanMateri: grade.lecturerAssessment.penguasaanMateri,
          analisisPerancangan: grade.lecturerAssessment.analisisPerancangan,
          sikapEtika: grade.lecturerAssessment.sikapEtika
        },
        totalScore: grade.lecturerAssessment.totalScore,
        weightedScore: grade.lecturerAssessment.weightedScore
      },
      combinedGrade: {
        totalScore: grade.totalScore,
        averageScore: grade.averageScore,
        grade: grade.grade,
        status: grade.status,
        remarks: grade.remarks
      },
      signatures: {
        dosen: {
          name: grade.dosenApprover.user.name,
          signature: grade.dosenSignature,  // Base64 image
          signedAt: grade.dosenSignedAt
        },
        kaprodi: {
          name: grade.kaprodiApprover.user.name,
          signature: grade.kaprodiSignature,  // Base64 image
          signedAt: grade.kaprodiSignedAt
        }
      }
    });

    // 3. Generate PDF
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }
    });
    await browser.close();

    // 4. Upload to storage
    const fileName = `nilai-kp-${grade.student.nim}-${Date.now()}.pdf`;
    const pdfUrl = await uploadToStorage(fileName, pdfBuffer);

    // 5. Update database
    await db.update(combinedGrades)
      .set({
        pdfGenerated: true,
        pdfUrl: pdfUrl,
        pdfGeneratedAt: new Date(),
        defaultPdfUsed: false
      })
      .where(eq(combinedGrades.id, gradeId));

    // 6. Notify mahasiswa
    await createNotification({
      userId: grade.student.userId,
      title: 'Nilai KP Tersedia',
      message: 'Nilai KP Anda sudah disetujui. PDF dapat didownload sekarang.',
      type: 'SUCCESS',
      link: '/mahasiswa/grades'
    });

    return pdfUrl;

  } catch (error) {
    // ERROR HANDLING: Use default PDF
    console.error('PDF generation failed:', error);
    
    // Copy default PDF
    const defaultPdfUrl = await copyDefaultPdf(`nilai-kp-${grade.student.nim}-default.pdf`);
    
    // Update with default PDF
    await db.update(combinedGrades)
      .set({
        pdfGenerated: true,
        pdfUrl: defaultPdfUrl,
        pdfGeneratedAt: new Date(),
        defaultPdfUsed: true  // ⚠️ Flag for review
      })
      .where(eq(combinedGrades.id, gradeId));

    // Notify admin
    await createNotification({
      userId: adminUserId,
      title: 'PDF Generation Failed',
      message: `Failed to generate PDF for student ${grade.student.nim}. Using default PDF.`,
      type: 'ERROR',
      link: `/admin/grades/${gradeId}`
    });

    // Notify mahasiswa (still successful from their perspective)
    await createNotification({
      userId: grade.student.userId,
      title: 'Nilai KP Tersedia',
      message: 'Nilai KP Anda sudah disetujui. PDF dapat didownload sekarang.',
      type: 'SUCCESS',
      link: '/mahasiswa/grades'
    });

    return defaultPdfUrl;
  }
}
```

**HTML Template Structure** (based on MI - Form Nilai KP.pdf):
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Styling to match form layout */
    body { font-family: 'Times New Roman', serif; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { width: 80px; }
    .title { font-size: 18px; font-weight: bold; }
    .section { margin: 20px 0; }
    .table { width: 100%; border-collapse: collapse; }
    .table td { padding: 8px; border: 1px solid #000; }
    .signature-box { margin-top: 40px; display: inline-block; width: 45%; }
    .signature-img { max-width: 150px; max-height: 80px; }
  </style>
</head>
<body>
  <div class="header">
    <img src="${logoUrl}" class="logo" />
    <h1 class="title">FORM PENILAIAN KERJA PRAKTIK</h1>
    <p>PROGRAM STUDI ${prodi}</p>
  </div>

  <div class="section">
    <h3>Data Mahasiswa</h3>
    <table class="table">
      <tr><td>Nama</td><td>${studentName}</td></tr>
      <tr><td>NIM</td><td>${nim}</td></tr>
      <tr><td>Tempat KP</td><td>${company}</td></tr>
      <tr><td>Periode</td><td>${startDate} - ${endDate}</td></tr>
    </table>
  </div>

  <div class="section">
    <h3>Penilaian Pembimbing Lapangan (30%)</h3>
    <table class="table">
      <tr><td>Kehadiran (20%)</td><td>${kehadiran}</td></tr>
      <tr><td>Kerjasama (30%)</td><td>${kerjasama}</td></tr>
      <tr><td>Sikap & Etika (20%)</td><td>${sikapEtika}</td></tr>
      <tr><td>Prestasi Kerja (20%)</td><td>${prestasiKerja}</td></tr>
      <tr><td>Kreatifitas (10%)</td><td>${kreatifitas}</td></tr>
      <tr><td><strong>Total</strong></td><td><strong>${mentorTotal}</strong></td></tr>
      <tr><td><strong>Bobot 30%</strong></td><td><strong>${mentorWeighted}</strong></td></tr>
    </table>
  </div>

  <div class="section">
    <h3>Penilaian Dosen Pembimbing (70%)</h3>
    <table class="table">
      <tr><td>Kesesuaian Format (30%)</td><td>${kesesuaianFormat}</td></tr>
      <tr><td>Penguasaan Materi (30%)</td><td>${penguasaanMateri}</td></tr>
      <tr><td>Analisis & Perancangan (30%)</td><td>${analisisPerancangan}</td></tr>
      <tr><td>Sikap & Etika (10%)</td><td>${sikapEtika2}</td></tr>
      <tr><td><strong>Total</strong></td><td><strong>${dosenTotal}</strong></td></tr>
      <tr><td><strong>Bobot 70%</strong></td><td><strong>${dosenWeighted}</strong></td></tr>
    </table>
  </div>

  <div class="section">
    <h3>Rekap Nilai Akhir</h3>
    <table class="table">
      <tr><td>Total Nilai</td><td><strong>${totalScore}</strong></td></tr>
      <tr><td>Rata-rata</td><td><strong>${averageScore}</strong></td></tr>
      <tr><td>Grade</td><td><strong style="font-size:20px">${grade}</strong></td></tr>
      <tr><td>Status</td><td><strong class="${status === 'lulus' ? 'text-green' : 'text-red'}">${status.toUpperCase()}</strong></td></tr>
    </table>
  </div>

  <div class="section" style="margin-top:60px">
    <div class="signature-box">
      <p>Dosen Pembimbing KP,</p>
      <img src="${dosenSignature}" class="signature-img" />
      <p><strong>${dosenName}</strong></p>
      <p>${dosenSignedDate}</p>
    </div>

    <div class="signature-box" style="float:right">
      <p>Ketua Program Studi,</p>
      <img src="${kaprodiSignature}" class="signature-img" />
      <p><strong>${kaprodiName}</strong></p>
      <p>${kaprodiSignedDate}</p>
    </div>
  </div>
</body>
</html>
```

---

## 📝 Implementation Checklist

### Backend Setup
- [ ] Install Drizzle ORM: `npm install drizzle-orm`
- [ ] Install PostgreSQL driver: `npm install postgres`
- [ ] Install drizzle-kit: `npm install -D drizzle-kit`
- [ ] Create `drizzle.config.ts`
- [ ] Copy schema definitions from this file
- [ ] Create migration: `npx drizzle-kit generate:pg`
- [ ] Run migration: `npx drizzle-kit push:pg`
- [ ] Setup environment variables (DATABASE_URL)

### Authentication
- [ ] Implement JWT or session-based auth
- [ ] Password hashing (bcrypt/argon2)
- [ ] Role-based access control (RBAC)
- [ ] Auth middleware for protected routes
- [ ] Refresh token strategy

### API Endpoints (by Priority)
**HIGH Priority** (Core features):
- [ ] POST /api/auth/login
- [ ] POST /api/auth/register
- [ ] GET /api/mahasiswa/profile
- [ ] GET /api/mahasiswa/internship
- [ ] PUT /api/mahasiswa/internship/period ⭐ NEW
- [ ] POST /api/mahasiswa/logbook
- [ ] GET /api/mahasiswa/logbook
- [ ] GET /api/mentor/profile
- [ ] PUT /api/mentor/signature ⭐ NEW
- [ ] GET /api/mentor/signature ⭐ NEW
- [ ] POST /api/mentor/logbook/:id/approve ⭐ UPDATED (no signature param)
- [ ] GET /api/mentor/mentees

**MEDIUM Priority**:
- [ ] POST /api/mahasiswa/report/upload
- [ ] POST /api/mentor/assessment ⭐ AUTO-GENERATE PDF
- [ ] POST /api/dosen/assessment ⭐ AUTO-GENERATE PDF (70%)
- [ ] GET /api/mahasiswa/assessment ⭐ Returns mentor assessment + PDF status
- [ ] GET /api/mahasiswa/lecturer-assessment ⭐ Returns dosen assessment + PDF status
- [ ] GET /api/mahasiswa/grades ⭐ Returns combined grades + PDF status + approval workflow
- [ ] GET /api/mahasiswa/assessment/download ⭐ Download PDF penilaian mentor
- [ ] GET /api/mahasiswa/lecturer-assessment/download ⭐ Download PDF penilaian dosen
- [ ] GET /api/mahasiswa/grades/download ⭐ Download PDF rekap nilai FINAL
- [ ] GET /api/dosen/grades/pending-approval ⭐ Get grades pending dosen approval
- [ ] POST /api/dosen/grades/:id/approve ⭐ Approve grade with e-signature
- [ ] POST /api/dosen/grades/:id/reject ⭐ Reject grade with notes
- [ ] GET /api/kaprodi/grades/pending-approval ⭐ Get grades pending kaprodi approval
- [ ] POST /api/kaprodi/grades/:id/approve ⭐ Final approve & trigger PDF generation
- [ ] POST /api/kaprodi/grades/:id/reject ⭐ Reject grade with notes
- [ ] Setup PDF generation service (puppeteer/pdfkit)
- [ ] Setup async job queue (Bull/BullMQ)
- [ ] Create PDF templates (mentor assessment, lecturer assessment, combined grade FINAL)
- [ ] Implement grade calculation logic (A/B/C/D/E, lulus/tidak-lulus)
- [ ] Implement approval workflow state machine
- [ ] Implement e-signature validation
- [ ] Implement fallback to default PDF on error
- [ ] GET /api/dosen/reports
- [ ] PUT /api/dosen/reports/:id/review
- [ ] POST /api/mahasiswa/title
- [ ] GET /api/dosen/titles

**LOW Priority**:
- [ ] GET /api/admin/users
- [ ] GET /api/admin/stats
- [ ] Notifications endpoints

### File Storage
- [ ] Setup S3 / Google Cloud Storage / Local storage
- [ ] Upload handler for PDF files
- [ ] Generate signed URLs for download
- [ ] Set max file size (10MB for reports)
- [ ] Validate file types (PDF only for reports)

### Validation
- [ ] Input validation (Zod / Yup / Joi)
- [ ] Email format validation
- [ ] NIM format validation
- [ ] Date range validation (endDate > startDate)
- [ ] File size validation
- [ ] Base64 signature validation
- [ ] Sanitize HTML/XSS prevention

### Testing
- [ ] Unit tests for business logic
- [ ] Integration tests for API endpoints
- [ ] E2E tests for critical flows
- [ ] Load testing for bulk operations
- [ ] Security testing (SQL injection, XSS)

### Deployment
- [ ] Setup CI/CD pipeline
- [ ] Database backup strategy
- [ ] Environment configuration
- [ ] Logging and monitoring
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring

---

## 🔒 Security Considerations

### Authentication & Authorization
```typescript
// Middleware example
function requireRole(allowedRoles: UserRole[]) {
  return async (req, res, next) => {
    const user = req.user; // from auth middleware
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
    }
    next();
  };
}

// Usage
app.post('/api/mentor/logbook/:id/approve', 
  requireAuth, 
  requireRole(['MENTOR_LAPANGAN']),
  approveLogbookHandler
);
```

### Data Validation
```typescript
// Example with Zod
import { z } from 'zod';

const updatePeriodSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
}).refine(data => new Date(data.endDate) > new Date(data.startDate), {
  message: "endDate must be after startDate"
});

// In handler
const body = updatePeriodSchema.parse(req.body);
```

### SQL Injection Prevention
```typescript
// ✅ GOOD - Use parameterized queries
const result = await db.query.users.findFirst({
  where: eq(users.email, email)
});

// ❌ BAD - Never use string concatenation
const query = `SELECT * FROM users WHERE email = '${email}'`;
```

### File Upload Security
```typescript
// Validate file type
const allowedTypes = ['application/pdf'];
if (!allowedTypes.includes(file.mimetype)) {
  throw new Error('Only PDF files allowed');
}

// Validate file size (10MB)
if (file.size > 10 * 1024 * 1024) {
  throw new Error('File too large');
}

// Generate safe filename
const safeFilename = `${uuid()}.pdf`;
```

### Signature Validation
```typescript
function validateSignature(signature: string): boolean {
  // Check format
  if (!signature.startsWith('data:image/')) {
    return false;
  }
  
  // Check size (max 100KB)
  const sizeInBytes = (signature.length * 3) / 4;
  if (sizeInBytes > 100 * 1024) {
    return false;
  }
  
  // Check allowed types
  const validTypes = ['data:image/png', 'data:image/jpeg'];
  if (!validTypes.some(type => signature.startsWith(type))) {
    return false;
  }
  
  return true;
}
```

---

## 📊 Performance Optimization

### Database Indexes
```sql
-- Already included in migration above
-- Add more indexes based on query patterns

-- For mentor dashboard (filter by date range)
CREATE INDEX idx_logbooks_date_status 
  ON logbooks(date, status);

-- For student search
CREATE INDEX idx_students_search 
  ON students USING gin(to_tsvector('indonesian', name || ' ' || nim));

-- For report filtering
CREATE INDEX idx_reports_status_submitted 
  ON reports(status, submitted_at);
```

### Caching Strategy
```typescript
// Cache mentor signature (rarely changes)
const getCachedMentorSignature = async (mentorId: string) => {
  const cacheKey = `mentor:signature:${mentorId}`;
  let signature = await redis.get(cacheKey);
  
  if (!signature) {
    const mentor = await db.query.mentors.findFirst({
      where: eq(mentors.id, mentorId),
      columns: { signature: true }
    });
    signature = mentor.signature;
    await redis.set(cacheKey, signature, { ex: 3600 }); // 1 hour
  }
  
  return signature;
};
```

### Pagination
```typescript
// For list endpoints
app.get('/api/mahasiswa/logbook', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  
  const logbooks = await db.query.logbooks.findMany({
    where: eq(logbooks.studentId, req.user.studentId),
    limit,
    offset,
    orderBy: desc(logbooks.date)
  });
  
  const total = await db.select({ count: count() })
    .from(logbooks)
    .where(eq(logbooks.studentId, req.user.studentId));
  
  return res.json({
    success: true,
    data: logbooks,
    meta: {
      page,
      limit,
      totalItems: total[0].count,
      totalPages: Math.ceil(total[0].count / limit)
    }
  });
});
```

---

## 🧪 Testing Examples

### Unit Test - Signature Validation
```typescript
import { describe, it, expect } from 'vitest';
import { validateSignature } from './signature-validator';

describe('validateSignature', () => {
  it('should accept valid PNG signature', () => {
    const validSig = 'data:image/png;base64,iVBORw0KGgo...';
    expect(validateSignature(validSig)).toBe(true);
  });
  
  it('should reject signature without data:image prefix', () => {
    const invalidSig = 'iVBORw0KGgo...';
    expect(validateSignature(invalidSig)).toBe(false);
  });
  
  it('should reject signature larger than 100KB', () => {
    const largeSig = 'data:image/png;base64,' + 'A'.repeat(150000);
    expect(validateSignature(largeSig)).toBe(false);
  });
});
```

### Integration Test - Approve Logbook
```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { app } from '../app';
import supertest from 'supertest';

describe('POST /api/mentor/logbook/:id/approve', () => {
  let mentorToken: string;
  let logbookId: string;
  
  beforeAll(async () => {
    // Setup: Create mentor with signature
    const mentor = await createTestMentor();
    mentorToken = await getAuthToken(mentor);
    logbookId = await createTestLogbook();
  });
  
  it('should approve logbook with mentor signature', async () => {
    const response = await supertest(app)
      .post(`/api/mentor/logbook/${logbookId}/approve`)
      .set('Authorization', `Bearer ${mentorToken}`)
      .send({ notes: 'Good work' })
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('APPROVED');
    expect(response.body.data.mentorSignature).toBeDefined();
  });
  
  it('should return error if mentor has no signature', async () => {
    const mentorNoSig = await createTestMentor({ signature: null });
    const token = await getAuthToken(mentorNoSig);
    
    const response = await supertest(app)
      .post(`/api/mentor/logbook/${logbookId}/approve`)
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('signature');
  });
});
```

---

## 📦 Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sikp
DATABASE_SSL=false

# Authentication
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=30d

# File Storage
STORAGE_TYPE=s3 # or 'local' or 'gcs'
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=sikp-files
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Or for local storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760 # 10MB in bytes

# API
API_BASE_URL=https://api.sikp.ac.id
FRONTEND_URL=https://sikp.ac.id
API_PORT=8787

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@sikp.ac.id
SMTP_PASSWORD=your-password

# Redis (optional, for caching)
REDIS_URL=redis://localhost:6379

# Monitoring
SENTRY_DSN=https://...
LOG_LEVEL=info
```

---

**Schema Version**: 1.0.0  
**Last Updated**: January 22, 2026  
**Database**: PostgreSQL 14+  
**ORM**: Drizzle ORM
```

## document/Integrasi Dari Backend\DOCUMENTATION_INDEX.md

```markdown
# 📚 Documentation Index - SIKP Backend

Comprehensive documentation index untuk Backend SIKP project. Gunakan ini sebagai navigation guide untuk menemukan dokumentasi yang Anda butuhkan.

---

## 🎯 Start Here (Untuk Pemula)

Jika Anda baru join project, mulai dari sini:

| # | Document | Description | Time to Read |
|---|----------|-------------|--------------|
| 1️⃣ | **[README.md](README.md)** | Project overview & quick setup | 5 min |
| 2️⃣ | **[GETTING_STARTED.md](GETTING_STARTED.md)** | Hands-on setup guide untuk developer baru | 10-15 min |
| 3️⃣ | **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** | Deep dive: arsitektur, data flow, key concepts | 15-20 min |

**Total setup time: ~30-40 menit** ☕

---

## 🗄️ Database & Schema Documentation

Dokumentasi lengkap tentang database schema, migrations, dan data flow.

### Core Schema Documents

| Document | Description | When to Use |
|----------|-------------|-------------|
| **[DATABASE_SCHEMA_DRIZZLE.md](DATABASE_SCHEMA_DRIZZLE.md)** | Complete schema dengan semua tables & relations | Butuh referensi lengkap table structure |
| **[SCHEMA_COMPARISON_NOTES.md](SCHEMA_COMPARISON_NOTES.md)** | Perbandingan sebelum & sesudah update | Ingin tahu apa yang berubah |
| **[SCHEMA_INTEGRATION_SUMMARY.md](SCHEMA_INTEGRATION_SUMMARY.md)** | Data flow Pengajuan → Magang | Understand auto-create internship flow |

### Migration Guides

| Document | Description | When to Use |
|----------|-------------|-------------|
| **Database Migration Guide** | Panduan lengkap Drizzle migrations | Setup database dari scratch |
| **Migration Cheatsheet** | Quick reference commands | Need quick command lookup |

---

## 🎨 Frontend Integration Documentation

**Target Audience**: Frontend developers yang akan integrate dengan backend API.

### 📨 Start Here (Frontend Team)

| Document | Description | Type | Priority |
|----------|-------------|------|----------|
| **[EMAIL_TO_FRONTEND_TEAM.md](EMAIL_TO_FRONTEND_TEAM.md)** | Email template siap kirim | Email | ✉️ KIRIM INI! |
| **[FRONTEND_TEAM_NOTES.md](FRONTEND_TEAM_NOTES.md)** | Cover letter untuk frontend team | Notes | ⭐ START HERE |
| **[FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md)** | Complete guide (500+ lines) | Comprehensive | 🔥 MUST READ |
| **[QUICK_API_REFERENCE.md](QUICK_API_REFERENCE.md)** | Quick reference untuk daily use | Quick Ref | 💡 DAILY USE |
| **[API_CONTRACT.md](API_CONTRACT.md)** | API contract & specifications | Spec | 📋 REFERENCE |
| **[FRONTEND_DEPLOYMENT_CHECKLIST.md](FRONTEND_DEPLOYMENT_CHECKLIST.md)** | Deployment & testing checklist | Checklist | ✅ TRACKING |

### Content Breakdown

#### FRONTEND_TEAM_NOTES.md
- Implementation priorities
- Checklist untuk mulai
- Common issues
- Contact info

#### FRONTEND_INTEGRATION_GUIDE.md (500+ lines)
**Sections:**
1. Quick Start - API client setup
2. Authentication Flow - Login/register/token handling
3. Complete API Reference - All endpoints dengan examples
4. Data Flow - Pengajuan → Magang integration
5. Frontend Implementation Examples - 8+ React components
6. Error Handling - Standard error patterns
7. Type Definitions - Full TypeScript types

**Code Examples:**
- ✅ API client configuration (axios)
- ✅ Auth context & hooks
- ✅ Form submissions
- ✅ File uploads dengan progress
- ✅ Data fetching hooks
- ✅ Error handling components
- ✅ TypeScript type definitions

#### QUICK_API_REFERENCE.md
- Endpoint list dengan HTTP methods
- Sample request/response
- TODO checklist
- UI/UX recommendations
- Common issues & solutions

#### API_CONTRACT.md
- All endpoints organized by feature
- Request/Response format untuk setiap endpoint
- Status enums lengkap
- Error codes & messages
- cURL examples untuk testing

---

## 🧪 Testing & Development

Documentation untuk testing, debugging, dan development workflow.

| Document | Description | When to Use |
|----------|-------------|-------------|
| **API Testing Guide** | Testing dengan Postman | Setup testing environment |
| **Troubleshooting Guide** | Common errors & solutions | Facing issues/errors |
| **[postman_collection.json](postman_collection.json)** | Postman collection import | Quick API testing |

---

## 📊 Feature-Specific Guides

### By User Role

#### 👨‍🎓 Mahasiswa Features
**Relevant docs:**
- Team management → FRONTEND_INTEGRATION_GUIDE.md (Section: Teams API)
- Submission process → FRONTEND_INTEGRATION_GUIDE.md (Section: Submissions API)
- Internship/Magang → FRONTEND_INTEGRATION_GUIDE.md (Section: Internship API)
- Logbook → QUICK_API_REFERENCE.md

**Key endpoints:**
- `POST /api/teams` - Create team
- `POST /api/submissions` - Create submission
- `GET /api/mahasiswa/internship` - Get internship data
- `POST /api/mahasiswa/logbook` - Submit logbook

#### 👨‍💼 Admin Features
**Relevant docs:**
- Admin dashboard → FRONTEND_INTEGRATION_GUIDE.md (Section: Admin API)
- Approval flow → SCHEMA_INTEGRATION_SUMMARY.md

**Key endpoints:**
- `GET /api/admin/submissions` - List submissions
- `POST /api/admin/submissions/:id/approve` - Approve (auto-create internships!)
- `GET /api/admin/statistics` - Dashboard stats

#### 👨‍🏫 Dosen Features
**Relevant docs:**
- Assessment → FRONTEND_INTEGRATION_GUIDE.md
- Report review → API_CONTRACT.md

**Key endpoints:**
- `GET /api/dosen/students` - List assigned students
- `POST /api/dosen/assessment` - Submit assessment
- `POST /api/dosen/report/review` - Review report

#### 🏢 Pembimbing Lapangan Features
**Relevant docs:**
- Logbook approval → QUICK_API_REFERENCE.md
- Student assessment → API_CONTRACT.md

**Key endpoints:**
- `GET /api/pembimbing/students` - List supervised students
- `POST /api/pembimbing/logbook/approve` - Approve logbook
- `POST /api/pembimbing/assessment` - Submit assessment

---

## 🔄 Data Flow Documentation

Understanding how data flows through the system.

### Phase 1: Pengajuan (Submission)
**Read:**
- SCHEMA_INTEGRATION_SUMMARY.md (Section: Submission Phase)
- FRONTEND_INTEGRATION_GUIDE.md (Section: Submissions API)

**Flow:**
```
Mahasiswa → Create Team → Invite Members → Create Submission → Upload Docs → Submit
```

### Phase 2: Admin Review
**Read:**
- SCHEMA_INTEGRATION_SUMMARY.md (Section: Admin Approval)
- FRONTEND_INTEGRATION_GUIDE.md (Section: Admin API)

**Flow:**
```
Admin → Review Submission → Approve/Reject
    ↓ (if approved)
Auto-create Internships for all team members
```

### Phase 3: Magang (Internship)
**Read:**
- SCHEMA_INTEGRATION_SUMMARY.md (Section: Internship Phase)
- DATABASE_SCHEMA_DRIZZLE.md (Section: Data Flow)
- FRONTEND_INTEGRATION_GUIDE.md (Section: Internship API)

**Flow:**
```
Mahasiswa → Get Internship Data (includes submission data!)
         → Submit Logbook
         → Get Assessment from Pembimbing
         → Upload Report
         → Get Final Grade
```

**Key Feature**: Internship automatically includes submission data (company, division, etc.)

---

## 🔍 Quick Lookup

Need something specific? Use this quick lookup table:

| I need to... | Go to... |
|--------------|----------|
| Setup development environment | GETTING_STARTED.md |
| Understand project architecture | PROJECT_OVERVIEW.md |
| Find API endpoint | QUICK_API_REFERENCE.md or API_CONTRACT.md |
| Get code examples | FRONTEND_INTEGRATION_GUIDE.md |
| Understand database schema | DATABASE_SCHEMA_DRIZZLE.md |
| Learn data flow Pengajuan → Magang | SCHEMA_INTEGRATION_SUMMARY.md |
| Implement authentication | FRONTEND_INTEGRATION_GUIDE.md (Auth section) |
| Handle file uploads | FRONTEND_INTEGRATION_GUIDE.md (File Upload section) |
| Fix errors | Troubleshooting Guide |
| Test API | postman_collection.json + API Testing Guide |
| See what changed in schema | SCHEMA_COMPARISON_NOTES.md |
| Get TypeScript types | FRONTEND_INTEGRATION_GUIDE.md (Type Definitions) |

---

## 📖 Reading Paths

Different paths based on your role:

### Path 1: Backend Developer (New)
```
1. GETTING_STARTED.md (setup)
2. PROJECT_OVERVIEW.md (understand architecture)
3. DATABASE_SCHEMA_DRIZZLE.md (learn schema)
4. src/index.ts (read code)
5. Start implementing features!
```

### Path 2: Frontend Developer
```
1. PROJECT_OVERVIEW.md (understand system)
2. FRONTEND_TEAM_NOTES.md (priorities)
3. FRONTEND_INTEGRATION_GUIDE.md (detailed guide)
4. QUICK_API_REFERENCE.md (bookmark for daily use)
5. API_CONTRACT.md (reference when needed)
```

### Path 3: Database Administrator
```
1. DATABASE_SCHEMA_DRIZZLE.md (schema overview)
2. Database Migration Guide (migrations)
3. SCHEMA_COMPARISON_NOTES.md (what changed)
4. Migration Cheatsheet (commands)
5. Run migrations!
```

### Path 4: Project Manager / Tech Lead
```
1. README.md (quick overview)
2. PROJECT_OVERVIEW.md (full understanding)
3. SCHEMA_INTEGRATION_SUMMARY.md (key features)
4. Review all documentation completeness
```

### Path 5: QA / Tester
```
1. PROJECT_OVERVIEW.md (understand features)
2. API_CONTRACT.md (endpoints to test)
3. API Testing Guide (setup Postman)
4. postman_collection.json (import tests)
5. Start testing!
```

---

## 📝 Documentation Stats

- **Total Documents**: 15+ files
- **Total Lines**: 3000+ lines of documentation
- **Code Examples**: 50+ examples (React, TypeScript, cURL)
- **Tables**: 20+ tables for database schema
- **Endpoints Documented**: 30+ API endpoints
- **Type Definitions**: Complete TypeScript types provided

## 🔄 Document Maintenance

### Last Updated
- Core docs: January 2025
- Schema docs: January 2025
- Frontend guides: January 2025

### Contribution Guidelines
When updating documentation:
1. Update relevant doc file
2. Update this index if structure changes
3. Update "Last Updated" section
4. Keep examples working & tested
5. Maintain consistent formatting

---

## 💡 Tips untuk Navigasi

1. **Ctrl+F / Cmd+F** - Search dalam document
2. **Bookmark** QUICK_API_REFERENCE.md untuk daily use
3. **Print/PDF** API_CONTRACT.md sebagai cheat sheet
4. **VS Code** - Right click → "Open Preview" untuk Markdown files
5. **GitHub** - Markdown files render dengan links yang clickable

---

## 📞 Need Help?

Tidak menemukan apa yang Anda cari?

1. **Check this index** - Mungkin ada di section lain
2. **Search in all docs** - Gunakan VS Code global search (Ctrl+Shift+F)
3. **Ask team** - Post di chat dengan link ke document terkait
4. **Create issue** - Suggest documentation improvement

---

## ✅ Documentation Checklist

Untuk memastikan Anda sudah baca yang perlu:

### For Backend Developers
- [ ] GETTING_STARTED.md
- [ ] PROJECT_OVERVIEW.md
- [ ] DATABASE_SCHEMA_DRIZZLE.md
- [ ] Database Migration Guide

### For Frontend Developers
- [ ] PROJECT_OVERVIEW.md
- [ ] FRONTEND_TEAM_NOTES.md
- [ ] FRONTEND_INTEGRATION_GUIDE.md
- [ ] QUICK_API_REFERENCE.md
- [ ] API_CONTRACT.md

### For All Developers
- [ ] README.md
- [ ] Troubleshooting Guide (when needed)
- [ ] API Testing Guide (for testing)

---

**Happy coding! 🚀**

*This documentation index is maintained by the Backend Team.*  
*Last updated: January 2025*
```

## document/Integrasi Dari Backend\EMAIL_TO_FRONTEND_TEAM.md

```markdown
---
**Kepada**: Tim Frontend Developer  
**Dari**: Tim Backend Developer  
**Tanggal**: 11 Februari 2026  
**Subjek**: 🚀 Backend API SIKP Siap untuk Integrasi!

---

Halo Tim Frontend! 👋

Backend API untuk aplikasi **SIKP (Sistem Informasi Kerja Praktik)** sudah selesai dan siap untuk diintegrasikan! Saya sudah mempersiapkan dokumentasi lengkap untuk memudahkan kalian.

---

## 📦 Yang Kami Kirimkan

Kami sudah menyiapkan **8 dokumen lengkap** untuk memudahkan integrasi:

### 🎯 MULAI DARI SINI!

1. **[FRONTEND_TEAM_NOTES.md](FRONTEND_TEAM_NOTES.md)** ⭐ **BACA INI DULU!**
   - Implementation priorities
   - Quick start guide
   - Common issues & solutions
   - Checklist apa yang harus dikerjakan

### 📚 Dokumentasi Utama

2. **[FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md)** (500+ baris!)
   - Complete API documentation
   - 8+ React component examples (copy-paste ready!)
   - TypeScript type definitions
   - Error handling guide
   - Authentication flow
   - File upload examples

3. **[QUICK_API_REFERENCE.md](QUICK_API_REFERENCE.md)** 💡 **BOOKMARK INI!**
   - Quick reference untuk daily use
   - Sample code siap pakai
   - TODO checklist
   - UI/UX recommendations

4. **[API_CONTRACT.md](API_CONTRACT.md)**
   - All endpoints dengan request/response format
   - Status enums
   - Error codes
   - cURL examples

### 🏗️ Untuk Memahami Project

5. **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)**
   - Arsitektur sistem
   - Database schema overview
   - Key concepts
   - Data flow Pengajuan → Magang

6. **[GETTING_STARTED.md](GETTING_STARTED.md)**
   - Jika kalian ingin setup backend locally
   - Step-by-step setup (5-10 menit)

7. **[DATABASE_SCHEMA_DRIZZLE.md](DATABASE_SCHEMA_DRIZZLE.md)**
   - Complete database schema
   - Table relationships

8. **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)**
   - Index navigasi semua dokumentasi

---

## 🌐 API Information

### Base URL
```
Development: http://localhost:8787
Staging: https://staging-api.sikp.ac.id
Production: https://api.sikp.ac.id
```

### Authentication
Semua request (kecuali login/register) butuh JWT token:
```typescript
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

---

## ⚡ Quick Start (5 Menit)

### 1. Setup API Client
```typescript
// lib/api-client.ts
const API_BASE_URL = 'http://localhost:8787';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}
```

### 2. Login Example
```typescript
// Login
const response = await apiRequest('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({
    email: 'mahasiswa@example.com',
    password: 'password123'
  })
});

// Save token
localStorage.setItem('token', response.data.token);

// Redirect
navigate('/dashboard');
```

### 3. Get Data Example
```typescript
// Get internship data (includes submission data!)
const { data } = await apiRequest('/api/mahasiswa/internship');

console.log(data.student.nama);            // "John Doe"
console.log(data.submission.company);      // "PT Maju Jaya"
console.log(data.submission.division);     // "IT Development"
```

**PENTING**: Endpoint `/api/mahasiswa/internship` ini return SEMUA data yang kalian butuhkan di halaman magang! 🔥

---

## 🎯 Key Features & Endpoints

### 👨‍🎓 Mahasiswa (Student)
```
GET  /api/mahasiswa/internship     - Get complete internship data ⭐
POST /api/mahasiswa/logbook        - Create daily logbook
GET  /api/mahasiswa/logbook        - Get all logbooks
GET  /api/mahasiswa/assessment     - Get mentor assessment (30%)
GET  /api/mahasiswa/lecturer-assessment - Get lecturer assessment (70%)
GET  /api/mahasiswa/grades         - Get final combined grades
POST /api/mahasiswa/report/upload  - Upload final report
```

### 🏢 Pembimbing Lapangan (Field Supervisor)
```
PUT  /api/mentor/signature              - Save signature (base64)
POST /api/mentor/logbook/:id/approve    - Approve logbook with signature
POST /api/mentor/assessment             - Submit assessment (30%)
```

### 👨‍🏫 Dosen (Lecturer)
```
POST /api/dosen/assessment          - Submit assessment (70%)
POST /api/dosen/report/review       - Review student report
POST /api/dosen/titles/:id/verify   - Verify title submission
```

### 👨‍💼 Admin
```
GET  /api/admin/submissions              - List all submissions
POST /api/admin/submissions/:id/approve  - Approve → Auto-create internships! ⭐
GET  /api/admin/internships              - List all internships
```

---

## 🔄 PENTING: Data Flow Pengajuan → Magang!

Ini adalah **fitur utama** yang harus dipahami:

```
FASE 1: PENGAJUAN (Submissions)
├─ Mahasiswa submit pengajuan KP
├─ Data: company name, division, dates, documents
├─ Status: DRAFT → PENDING_REVIEW
└─ Admin review

        ↓ [Admin Approve] ⭐

FASE 2: AUTO-CREATE INTERNSHIPS
├─ Backend otomatis create internships untuk SETIAP anggota tim
├─ Data dari submission otomatis ter-copy (company, division, dates)
└─ Status internship: AKTIF

        ↓

FASE 3: MAGANG (Internships)
├─ Mahasiswa akses logbook, assessment, report
├─ Data submission SUDAH TERSEDIA (no need input ulang!)
└─ GET /api/mahasiswa/internship → return semua data lengkap
```

**Key Point**: Frontend TIDAK perlu input ulang data tempat KP! Semua data sudah ada dari submission. 🎉

---

## 📋 Priority Implementation Checklist

### High Priority (Minggu 1-2)
- [ ] Setup API client & authentication
- [ ] Login/Register page
- [ ] Mahasiswa: Internship dashboard (GET /api/mahasiswa/internship)
- [ ] Mahasiswa: Logbook page (create & list)
- [ ] Mentor: Signature setup (canvas)
- [ ] Admin: Submissions approval

### Medium Priority (Minggu 3-4)
- [ ] Mahasiswa: Assessment page (view grades)
- [ ] Mentor: Logbook approval page
- [ ] Mentor: Assessment form
- [ ] Dosen: Assessment form
- [ ] Admin: Dashboard statistics

### Lower Priority (Minggu 5+)
- [ ] Report upload & review
- [ ] Title submission
- [ ] Notifications
- [ ] PDF preview/download

---

## 🎨 UI Components yang Dibutuhkan

### 1. Status Badge
```tsx
<StatusBadge status="APPROVED" />   // Green
<StatusBadge status="PENDING" />    // Yellow
<StatusBadge status="REJECTED" />   // Red
```

### 2. Grade Badge
```tsx
<GradeBadge grade="A" />  // Green
<GradeBadge grade="B" />  // Blue
<GradeBadge grade="C" />  // Yellow
```

### 3. Signature Canvas (untuk Mentor)
```tsx
import SignatureCanvas from 'react-signature-canvas';

<SignatureCanvas 
  canvasProps={{ width: 500, height: 200 }}
  ref={signatureRef}
/>
```

### 4. Header Info Card (reusable untuk semua halaman magang)
```tsx
<InternshipHeader data={internshipData} />
// Display: Nama, NIM, Prodi, Tempat KP, Bidang, Periode
```

---

## 📦 NPM Packages yang Dibutuhkan

```bash
npm install react-signature-canvas  # Untuk signature mentor
npm install date-fns                # Format tanggal
npm install sonner                  # Toast notifications
```

---

## 🧪 Testing

### Test Accounts
```
Mahasiswa:
- Email: mahasiswa@test.com
- Password: password123

Mentor:
- Email: mentor@test.com
- Password: password123

Dosen:
- Email: dosen@test.com
- Password: password123

Admin:
- Email: admin@test.com
- Password: password123
```

### Postman Collection
File `postman_collection.json` sudah tersedia di root folder untuk testing API.

---

## ⚠️ Important Notes

### 1. Token Expired → Redirect ke Login
```typescript
if (error.code === 'UNAUTHORIZED') {
  localStorage.removeItem('token');
  navigate('/login');
}
```

### 2. Mentor WAJIB Setup Signature
Sebelum bisa approve logbook, mentor harus setup signature dulu. Jika belum:
```
Error: SIGNATURE_REQUIRED
Action: Redirect ke /mentor/profile/signature
```

### 3. File Upload Format
```typescript
const formData = new FormData();
formData.append('file', fileObject);

// JANGAN set Content-Type header (biar browser auto-set)
fetch('/api/mahasiswa/report/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    // NO Content-Type here!
  },
  body: formData
});
```

---

## 📞 Kontak & Support

### Backend Team
- **Lead**: [Nama Backend Lead]
- **Email**: backend@example.com
- **Slack**: `#backend-sikp`

### Meeting Schedule
- **Daily Standup**: Senin-Jumat, 09:00 WIB
- **Integration Sync**: Rabu & Jumat, 15:00 WIB
- **Weekly Review**: Jumat, 16:00 WIB

### Questions?
- 💬 Slack Channel: `#backend-frontend-integration`
- 📧 Email: backend@example.com
- 🐛 GitHub Issues: Tag `@backend-team`

---

## 🚀 Next Steps

### Hari Ini
1. ✅ Baca **FRONTEND_TEAM_NOTES.md** (15 menit)
2. ✅ Browse **QUICK_API_REFERENCE.md** (10 menit)
3. ✅ Setup project & install dependencies

### Besok
1. ✅ Baca **FRONTEND_INTEGRATION_GUIDE.md** (30 menit)
2. ✅ Implement API client
3. ✅ Test login endpoint
4. ✅ Setup authentication context

### Minggu Ini
1. ✅ Implement Priority 1 features
2. ✅ Integration testing
3. ✅ Daily sync dengan backend team

---

## 🎁 Bonus: Type Definitions

Untuk TypeScript users, semua type definitions sudah ada di **FRONTEND_INTEGRATION_GUIDE.md** section "Type Definitions". Copy-paste langsung!

```typescript
// Example
interface InternshipData {
  student: {
    nim: string;
    nama: string;
    prodi: string;
    fakultas: string;
  };
  submission: {
    company: string;
    division: string;
    startDate: string;
    endDate: string;
  };
  // ... dan banyak lagi
}
```

---

## 💯 Quality Assurance

Backend sudah di-test dengan:
- ✅ Unit tests
- ✅ Integration tests
- ✅ Postman collection tests
- ✅ Manual testing semua endpoints

**API Stability**: Production-ready! 🎉

---

## 🙏 Terima Kasih!

Terima kasih sudah membaca! Semoga dokumentasi ini membantu proses integrasi berjalan lancar.

Kalau ada yang kurang jelas atau butuh bantuan, **jangan ragu untuk contact backend team**! Kami siap membantu. 💪

**Happy Coding!** 🚀💻

---

**Backend Team**  
*Building awesome APIs, one endpoint at a time.*

---

### 📂 File Attachments
- ✅ FRONTEND_TEAM_NOTES.md
- ✅ FRONTEND_INTEGRATION_GUIDE.md (500+ baris)
- ✅ QUICK_API_REFERENCE.md
- ✅ API_CONTRACT.md
- ✅ PROJECT_OVERVIEW.md
- ✅ GETTING_STARTED.md
- ✅ DATABASE_SCHEMA_DRIZZLE.md
- ✅ DOCUMENTATION_INDEX.md
- ✅ postman_collection.json

**Total Dokumentasi**: 3000+ baris dengan 50+ code examples!
```

## document/Integrasi Dari Backend\FRONTEND_DEPLOYMENT_CHECKLIST.md

```markdown
# ✅ Frontend Deployment Checklist - SIKP

Checklist lengkap untuk tim frontend saat deployment & integration dengan backend API.

---

## 📋 Pre-Development Checklist

### Dokumentasi
- [ ] Baca **EMAIL_TO_FRONTEND_TEAM.md** (catatan dari backend team)
- [ ] Baca **FRONTEND_TEAM_NOTES.md** (priorities & quick start)
- [ ] Browse **QUICK_API_REFERENCE.md** (bookmark untuk daily use)
- [ ] Baca **FRONTEND_INTEGRATION_GUIDE.md** section yang relevan dengan task Anda

### Setup Environment
- [ ] Clone frontend repository
- [ ] Install dependencies (`npm install` / `yarn install`)
- [ ] Setup environment variables (.env.local)
  ```
  VITE_API_URL=http://localhost:8787
  VITE_APP_NAME=SIKP
  ```
- [ ] Verify environment variables loaded correctly

### Testing Backend API
- [ ] Verify backend running (`http://localhost:8787`)
- [ ] Import Postman collection (`postman_collection.json`)
- [ ] Test login endpoint di Postman
- [ ] Get JWT token dari login response
- [ ] Test authenticated endpoint dengan token

---

## 🔧 Development Phase Checklist

### Week 1: Foundation & Authentication

#### API Client Setup
- [ ] Create `lib/api-client.ts`
- [ ] Implement `apiRequest()` function
- [ ] Add token management (localStorage)
- [ ] Add error handling
- [ ] Test with sample endpoint

#### Authentication
- [ ] Create Auth Context (`contexts/AuthContext.tsx`)
- [ ] Implement login function
- [ ] Implement logout function
- [ ] Implement token refresh (jika ada)
- [ ] Create protected route wrapper
- [ ] Create login page UI
- [ ] Create register page UI
- [ ] Test login flow end-to-end
- [ ] Test token expiration handling
- [ ] Test redirect after login

#### Components Library
- [ ] Create StatusBadge component (APPROVED/PENDING/REJECTED)
- [ ] Create GradeBadge component (A/B/C/D/E)
- [ ] Create LoadingSpinner component
- [ ] Create ErrorAlert component
- [ ] Create SuccessToast component

---

### Week 2: Mahasiswa Features (High Priority)

#### Internship Dashboard
- [ ] Create `pages/mahasiswa/dashboard.tsx`
- [ ] Call `GET /api/mahasiswa/internship`
- [ ] Display student info (nama, nim, prodi, fakultas)
- [ ] Display company info (nama perusahaan, bidang)
- [ ] Display mentor info (if assigned)
- [ ] Display dosen info (if assigned)
- [ ] Display statistics (logbook count, assessment status)
- [ ] Add loading state
- [ ] Add error handling
- [ ] Test dengan different user accounts

#### Logbook Page
- [ ] Create `pages/mahasiswa/logbook.tsx`
- [ ] Create logbook form (date, activity, description)
- [ ] Implement form validation
- [ ] POST create logbook
- [ ] GET list of logbooks
- [ ] Display logbook cards dengan status
- [ ] Add filter by status (ALL/PENDING/APPROVED/REJECTED)
- [ ] Add filter by date range
- [ ] Show mentor signature jika APPROVED
- [ ] Add pagination/infinite scroll
- [ ] Test create logbook
- [ ] Test filter functionality

---

### Week 3: Mentor & Admin Features

#### Mentor: Signature Setup
- [ ] Install `react-signature-canvas`
- [ ] Create `pages/mentor/signature-setup.tsx`
- [ ] Implement signature canvas
- [ ] Add clear button
- [ ] Convert to base64
- [ ] PUT save signature
- [ ] GET display saved signature
- [ ] Add signature preview
- [ ] Test signature save & retrieve

#### Mentor: Logbook Approval
- [ ] Create `pages/mentor/logbook-approval.tsx`
- [ ] GET list mahasiswa bimbingan
- [ ] GET pending logbooks
- [ ] Create approval modal dengan notes field
- [ ] POST approve logbook (auto-add signature)
- [ ] POST reject logbook with reason
- [ ] Test approve flow
- [ ] Test reject flow
- [ ] Verify signature appears after approval

#### Admin: Submissions Approval
- [ ] Create `pages/admin/submissions.tsx`
- [ ] GET all submissions
- [ ] Add filter by status
- [ ] Display submission cards
- [ ] Create detail modal
- [ ] View uploaded documents
- [ ] POST approve submission
- [ ] Show success: "Internships created for X members"
- [ ] POST reject dengan reason field
- [ ] Test approval flow (verify internships created)
- [ ] Test rejection flow

---

### Week 4: Assessment & Grading

#### Mahasiswa: View Assessments
- [ ] Create `pages/mahasiswa/assessment.tsx`
- [ ] GET mentor assessment (30%)
- [ ] Display 5 kriteria (kehadiran, kerjasama, sikap, prestasi, kreatifitas)
- [ ] GET lecturer assessment (70%)
- [ ] Display 4 kriteria (format, materi, analisis, sikap)
- [ ] GET combined grades
- [ ] Display final score & letter grade
- [ ] Add PDF preview/download buttons
- [ ] Create grade breakdown chart
- [ ] Test dengan different grade scenarios

#### Mentor: Submit Assessment
- [ ] Create `pages/mentor/assessment-form.tsx`
- [ ] Create form 5 kriteria (sliders 0-100)
- [ ] Auto-calculate weighted score
- [ ] Add feedback textarea
- [ ] POST submit assessment
- [ ] Show loading during submission
- [ ] Show success message
- [ ] Redirect after success
- [ ] Test calculation accuracy

#### Dosen: Submit Assessment
- [ ] Create `pages/dosen/assessment-form.tsx`
- [ ] Create form 4 kriteria (sliders 0-100)
- [ ] Auto-calculate weighted score
- [ ] Add feedback textarea
- [ ] POST submit assessment
- [ ] Show loading & success states
- [ ] Test calculation accuracy

---

### Week 5: Reports & Additional Features

#### Mahasiswa: Report Upload
- [ ] Create `pages/mahasiswa/report.tsx`
- [ ] Create file upload component (drag & drop)
- [ ] Validate file type (PDF only)
- [ ] Validate file size (<10MB)
- [ ] Show upload progress bar
- [ ] POST upload report (multipart/form-data)
- [ ] POST submit for review
- [ ] GET report status
- [ ] Display review feedback from dosen
- [ ] Test upload with different file sizes

#### Dosen: Report Review
- [ ] Create `pages/dosen/reports.tsx`
- [ ] GET pending reports
- [ ] View/download report PDF
- [ ] Add review notes
- [ ] POST approve report
- [ ] POST request revision dengan notes
- [ ] Test review workflow

#### Title Submission
- [ ] Create title submission form
- [ ] POST submit title
- [ ] GET title status
- [ ] Display approval/rejection feedback
- [ ] Test submission & approval flow

---

## 🎨 UI/UX Checklist

### General
- [ ] Consistent color scheme
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Loading states pada semua async operations
- [ ] Error messages user-friendly
- [ ] Success feedback (toast/alert)
- [ ] Smooth transitions & animations
- [ ] Accessibility (ARIA labels, keyboard navigation)

### Components
- [ ] Status badges dengan appropriate colors
  - APPROVED: Green
  - PENDING: Yellow
  - REJECTED: Red
- [ ] Grade badges dengan color coding
  - A: Dark Green
  - B: Light Green
  - C: Yellow
  - D: Orange
  - E: Red
- [ ] Signature canvas dengan clear boundary
- [ ] File upload dengan drag & drop visual feedback
- [ ] Form validation messages inline

### Performance
- [ ] Lazy loading untuk heavy pages
- [ ] Image optimization
- [ ] Code splitting
- [ ] Minimize bundle size
- [ ] Cache API responses (jika applicable)

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] API client functions
- [ ] Utility functions (date formatting, calculations)
- [ ] Components (StatusBadge, GradeBadge, etc.)
- [ ] Form validation logic

### Integration Tests
- [ ] Login flow
- [ ] Logout flow
- [ ] Token refresh flow
- [ ] Protected route access
- [ ] API error handling

### E2E Tests (Optional tapi recommended)
- [ ] Complete user journey: Mahasiswa
- [ ] Complete user journey: Mentor
- [ ] Complete user journey: Dosen
- [ ] Complete user journey: Admin

### Manual Testing

#### As Mahasiswa
- [ ] Login
- [ ] View dashboard dengan data lengkap
- [ ] Create logbook entry
- [ ] View logbook list & status
- [ ] View assessments
- [ ] Upload report
- [ ] Logout

#### As Mentor
- [ ] Login
- [ ] Setup signature
- [ ] View mahasiswa bimbingan
- [ ] Approve logbook
- [ ] Reject logbook
- [ ] Submit assessment
- [ ] Logout

#### As Dosen
- [ ] Login
- [ ] View mahasiswa bimbingan
- [ ] Submit assessment
- [ ] Review report
- [ ] Approve/reject title
- [ ] Logout

#### As Admin
- [ ] Login
- [ ] View all submissions
- [ ] Approve submission (verify internships created)
- [ ] Reject submission
- [ ] View statistics
- [ ] Logout

### Cross-Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers (Chrome Mobile, Safari iOS)

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] No console errors
- [ ] No eslint warnings
- [ ] Code reviewed by team
- [ ] Update environment variables untuk production
  ```
  VITE_API_URL=https://api.sikp.ac.id
  ```
- [ ] Build successfully (`npm run build`)
- [ ] Test production build locally

### Staging Deployment
- [ ] Deploy ke staging server
- [ ] Verify staging URL accessible
- [ ] Test critical flows
- [ ] Test dengan staging backend API
- [ ] Load testing (optional)
- [ ] Security scan (optional)

### Production Deployment
- [ ] Backup current version
- [ ] Deploy to production
- [ ] Verify production URL accessible
- [ ] Smoke test critical features
- [ ] Monitor error logs
- [ ] Monitor performance metrics

### Post-Deployment
- [ ] Announcement ke users
- [ ] Monitor for issues (24-48 hours)
- [ ] Collect user feedback
- [ ] Document any issues found
- [ ] Plan hotfix if needed

---

## 📊 Monitoring & Maintenance

### Performance Monitoring
- [ ] Setup analytics (Google Analytics / Mixpanel)
- [ ] Track page load times
- [ ] Track API response times
- [ ] Monitor error rates
- [ ] Track user flows

### Error Tracking
- [ ] Setup Sentry / Bugsnag
- [ ] Monitor client-side errors
- [ ] Monitor API call failures
- [ ] Alert on critical errors

### User Feedback
- [ ] Setup feedback mechanism
- [ ] Monitor user complaints
- [ ] Track feature requests
- [ ] Regular user surveys

---

## 📝 Documentation Checklist

### Code Documentation
- [ ] README.md dengan setup instructions
- [ ] API client usage examples
- [ ] Component usage examples
- [ ] Deployment guide
- [ ] Troubleshooting guide

### User Documentation
- [ ] User manual untuk Mahasiswa
- [ ] User manual untuk Mentor
- [ ] User manual untuk Dosen
- [ ] User manual untuk Admin
- [ ] FAQ document

---

## ⚠️ Common Issues & Solutions

### Issue: "UNAUTHORIZED" Error
**Checklist:**
- [ ] Token exists in localStorage?
- [ ] Token format correct? (`Bearer <token>`)
- [ ] Token not expired?
- [ ] JWT_SECRET configured correctly?

**Solution:**
- Redirect to login
- Clear localStorage
- Get new token

### Issue: "SIGNATURE_REQUIRED" (Mentor)
**Checklist:**
- [ ] Mentor has setup signature?
- [ ] Signature not expired?

**Solution:**
- Redirect to `/mentor/signature-setup`
- Force signature setup before approval

### Issue: File Upload Failed
**Checklist:**
- [ ] File size <10MB?
- [ ] File type allowed (PDF/DOC/JPG/PNG)?
- [ ] Using FormData (not JSON)?
- [ ] NOT setting Content-Type header?

**Solution:**
- Validate client-side before upload
- Show clear error message
- Retry mechanism

### Issue: CORS Error
**Checklist:**
- [ ] Backend CORS configured?
- [ ] Correct API base URL?

**Solution:**
- Contact backend team
- Verify CORS headers

---

## 🎯 Success Metrics

### Development Phase
- [ ] 100% API endpoints implemented
- [ ] 90%+ test coverage
- [ ] 0 console errors
- [ ] Lighthouse score >90

### User Adoption
- [ ] 80%+ user adoption dalam 1 bulan
- [ ] <5% error rate
- [ ] Average page load <3 seconds
- [ ] Positive user feedback

---

## 📞 Support & Resources

### Backend Team Contact
- **Slack**: `#backend-sikp`
- **Email**: backend@example.com
- **Meeting**: Rabu & Jumat 15:00 WIB

### Resources
- 📚 [FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md)
- ⚡ [QUICK_API_REFERENCE.md](QUICK_API_REFERENCE.md)
- 📋 [API_CONTRACT.md](API_CONTRACT.md)
- 🏗️ [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)

---

**Last Updated**: 11 Februari 2026  
**Version**: 1.0  
**Maintained by**: Frontend Team Lead

---

✅ **SEMUA CHECKLIST SELESAI?** → CONGRATULATIONS! 🎉

You're ready for production! 🚀
```

## document/Integrasi Dari Backend\FRONTEND_INTEGRATION_GUIDE.md

```markdown
# 📱 Frontend Integration Guide - SIKP API

> **Untuk**: Tim Frontend Developer  
> **Backend API Base URL**: `http://localhost:8787` (development) / `https://api.sikp.ac.id` (production)  
> **Last Updated**: 11 Februari 2026

---

## 📚 Table of Contents

1. [Quick Start](#-quick-start)
2. [Authentication](#-authentication)
3. [API Endpoints Overview](#-api-endpoints-overview)
4. [Data Flow: Pengajuan → Magang](#-data-flow-pengajuan--magang)
5. [Complete API Reference](#-complete-api-reference)
6. [Frontend Implementation Examples](#-frontend-implementation-examples)
7. [Error Handling](#-error-handling)
8. [Type Definitions](#-type-definitions)

---

## 🚀 Quick Start

### Setup API Client

```typescript
// lib/api-client.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}
```

### Example Usage

```typescript
// Get current user internship data
const data = await apiRequest('/api/mahasiswa/internship');
console.log(data.data.student.nama); // "John Doe"
console.log(data.data.submission.company); // "PT Maju Jaya"
```

---

## 🔐 Authentication

### Login

**Endpoint**: `POST /api/auth/login`

**Request Body**:
```json
{
  "email": "mahasiswa@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-123",
      "email": "mahasiswa@example.com",
      "nama": "John Doe",
      "role": "MAHASISWA"
    }
  }
}
```

**Frontend Implementation**:
```typescript
// services/auth.ts
export async function login(email: string, password: string) {
  const response = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  // Save token
  localStorage.setItem('token', response.data.token);
  localStorage.setItem('user', JSON.stringify(response.data.user));
  
  return response.data;
}

// Usage in component
const handleLogin = async () => {
  try {
    const { user } = await login(email, password);
    // Redirect based on role
    if (user.role === 'MAHASISWA') {
      navigate('/dashboard');
    }
  } catch (error) {
    toast.error(error.message);
  }
};
```

### Logout

**Endpoint**: `POST /api/auth/logout`

```typescript
export async function logout() {
  await apiRequest('/api/auth/logout', { method: 'POST' });
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  navigate('/login');
}
```

---

## 🗺️ API Endpoints Overview

### **Role: MAHASISWA**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/mahasiswa/profile` | Get profile mahasiswa |
| `GET` | `/api/mahasiswa/internship` | ⭐ Get data magang LENGKAP |
| `POST` | `/api/mahasiswa/logbook` | Create logbook entry |
| `GET` | `/api/mahasiswa/logbook` | Get all logbook entries |
| `POST` | `/api/mahasiswa/report/upload` | Upload laporan KP |
| `GET` | `/api/mahasiswa/assessment` | Get penilaian mentor |
| `GET` | `/api/mahasiswa/lecturer-assessment` | Get penilaian dosen |
| `GET` | `/api/mahasiswa/grades` | Get rekap nilai akhir |

### **Role: PEMBIMBING_LAPANGAN** (Mentor)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/mentor/profile` | Get mentor profile |
| `PUT` | `/api/mentor/signature` | Save/Update signature |
| `GET` | `/api/mentor/mentees` | Get daftar mahasiswa bimbingan |
| `POST` | `/api/mentor/logbook/:id/approve` | Approve logbook with signature |
| `POST` | `/api/mentor/assessment` | Submit penilaian mahasiswa |

### **Role: DOSEN**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dosen/students` | Get mahasiswa bimbingan |
| `GET` | `/api/dosen/reports` | Get laporan pending review |
| `POST` | `/api/dosen/assessment` | Submit penilaian dosen |
| `POST` | `/api/dosen/titles/:id/verify` | Verify pengajuan judul |

### **Role: ADMIN**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/submissions` | Get all submissions |
| `POST` | `/api/admin/submissions/:id/approve` | ⭐ Approve & auto-create internships |
| `GET` | `/api/admin/internships` | Get all internships |
| `POST` | `/api/admin/internships/:id/assign-mentor` | Assign mentor |

---

## 🔄 Data Flow: Pengajuan → Magang

### **Konsep Penting** ⭐

Sistem memiliki 2 tahap utama yang saling terhubung:

```
┌─────────────────────┐
│  1. PENGAJUAN KP    │
│  (Submissions)      │
│                     │
│  - Submit dokumen   │
│  - Isi data tempat  │
│  - Tunggu approval  │
└──────────┬──────────┘
           │
           │ Admin Approve
           │ ↓
           │ AUTO-CREATE internships
           │ untuk setiap anggota tim
           │
           ↓
┌─────────────────────┐
│  2. MAGANG          │
│  (Internships)      │
│                     │
│  - Logbook          │
│  - Assessment       │
│  - Report           │
│  - Grades           │
└─────────────────────┘
```

### **Key Points**:

1. ✅ **Data dari submission otomatis tersedia saat magang**
2. ✅ **Tidak perlu input ulang data tempat KP**
3. ✅ **Satu API call untuk semua data context**

---

## 📡 Complete API Reference

### 1. Get Complete Internship Data ⭐ (PALING PENTING)

**Endpoint**: `GET /api/mahasiswa/internship`

**Use Case**: Digunakan di SEMUA halaman magang (logbook, assessment, report, dll) untuk mendapatkan data context lengkap.

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "intern-123",
    "status": "AKTIF",
    "progress": 45,
    "startDate": "2026-01-15",
    "endDate": "2026-04-15",
    
    "submission": {
      "id": "sub-456",
      "company": "PT Maju Jaya",
      "division": "IT Development",
      "letterPurpose": "Kerja Praktik",
      "companyAddress": "Jl. Sudirman No. 123, Jakarta"
    },
    
    "student": {
      "nim": "2101001",
      "nama": "John Doe",
      "email": "john@example.com",
      "prodi": "Manajemen Informatika",
      "fakultas": "Ilmu Komputer",
      "angkatan": "2021",
      "semester": 6
    },
    
    "team": {
      "id": "team-789",
      "name": "Tim Alpha",
      "code": "ALPHA2026",
      "members": [
        {
          "nim": "2101001",
          "nama": "John Doe",
          "role": "KETUA"
        },
        {
          "nim": "2101002",
          "nama": "Jane Smith",
          "role": "ANGGOTA"
        }
      ]
    },
    
    "mentor": {
      "id": "mentor-101",
      "nama": "Budi Santoso",
      "companyName": "PT Maju Jaya",
      "position": "Senior Developer"
    },
    
    "lecturer": {
      "id": "dosen-202",
      "nip": "198501012010121001",
      "nama": "Dr. Ahmad Yani, M.Kom",
      "prodi": "Manajemen Informatika"
    }
  }
}
```

---

### 2. Logbook Management

#### Create Logbook Entry

**Endpoint**: `POST /api/mahasiswa/logbook`

**Request Body**:
```json
{
  "date": "2026-02-11",
  "activity": "Membuat fitur login",
  "description": "Mengimplementasikan JWT authentication dengan refresh token"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Logbook berhasil dibuat",
  "data": {
    "id": "logbook-123",
    "date": "2026-02-11",
    "activity": "Membuat fitur login",
    "description": "Mengimplementasikan JWT authentication...",
    "status": "PENDING",
    "createdAt": "2026-02-11T10:30:00Z"
  }
}
```

#### Get All Logbooks

**Endpoint**: `GET /api/mahasiswa/logbook`

**Query Parameters**:
- `status` (optional): `PENDING` | `APPROVED` | `REJECTED`
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date

**Response**:
```json
{
  "success": true,
  "data": {
    "logbooks": [
      {
        "id": "logbook-123",
        "date": "2026-02-11",
        "activity": "Membuat fitur login",
        "description": "...",
        "status": "APPROVED",
        "mentorSignature": "data:image/png;base64,...",
        "mentorSignedAt": "2026-02-11T15:00:00Z"
      }
    ],
    "stats": {
      "total": 45,
      "pending": 5,
      "approved": 38,
      "rejected": 2
    }
  }
}
```

#### Approve Logbook (Mentor)

**Endpoint**: `POST /api/mentor/logbook/:logbookId/approve`

**Request Body**:
```json
{
  "notes": "Pekerjaan sudah sesuai target"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Logbook berhasil disetujui",
  "data": {
    "id": "logbook-123",
    "status": "APPROVED",
    "mentorSignature": "data:image/png;base64,...",
    "mentorSignedAt": "2026-02-11T15:00:00Z"
  }
}
```

---

### 3. Assessment (Penilaian)

#### Submit Mentor Assessment (30%)

**Endpoint**: `POST /api/mentor/assessment`

**Request Body**:
```json
{
  "studentId": "2101001",
  "kehadiran": 90,
  "kerjasama": 85,
  "sikapEtika": 88,
  "prestasiKerja": 87,
  "kreatifitas": 82,
  "feedback": "Mahasiswa menunjukkan kinerja yang sangat baik..."
}
```

**Calculation**:
```
totalScore = (kehadiran×0.2 + kerjasama×0.3 + sikapEtika×0.2 + prestasiKerja×0.2 + kreatifitas×0.1)
weightedScore = totalScore × 0.3
```

**Response**:
```json
{
  "success": true,
  "message": "Penilaian berhasil disimpan. PDF akan di-generate otomatis.",
  "data": {
    "id": "assessment-123",
    "totalScore": 87.4,
    "weightedScore": 26.22,
    "pdfGenerated": false,
    "pdfUrl": null
  }
}
```

#### Submit Lecturer Assessment (70%)

**Endpoint**: `POST /api/dosen/assessment`

**Request Body**:
```json
{
  "studentId": "2101001",
  "kesesuaianFormat": 90,
  "penguasaanMateri": 87,
  "analisisPerancangan": 83,
  "sikapEtika": 90,
  "feedback": "Laporan KP sangat lengkap dan terstruktur baik..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Penilaian berhasil disimpan",
  "data": {
    "id": "lecturer-assessment-123",
    "totalScore": 87.5,
    "weightedScore": 61.25,
    "combinedGradeGenerated": true,
    "grade": "A",
    "status": "lulus"
  }
}
```

#### Get Combined Grades (Mahasiswa)

**Endpoint**: `GET /api/mahasiswa/grades`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "grade-123",
    "fieldMentorScore": 26.22,
    "academicSupervisorScore": 61.25,
    "totalScore": 87.47,
    "averageScore": 43.74,
    "grade": "A",
    "status": "lulus",
    "remarks": "Selamat! Anda telah menyelesaikan program KP dengan nilai sangat baik.",
    "approvalStatus": "APPROVED_KAPRODI",
    "pdfGenerated": true,
    "pdfUrl": "https://storage.../combined-grade-123.pdf",
    "pdfGeneratedAt": "2026-02-11T16:00:00Z"
  }
}
```

---

### 4. Report Management

#### Upload Report

**Endpoint**: `POST /api/mahasiswa/report/upload`

**Request**: `multipart/form-data`

```typescript
const formData = new FormData();
formData.append('file', pdfFile);
formData.append('description', 'Laporan KP lengkap beserta lampiran');

const response = await fetch('/api/mahasiswa/report/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData,
});
```

**Response**:
```json
{
  "success": true,
  "message": "Laporan berhasil diupload",
  "data": {
    "id": "report-123",
    "fileName": "Laporan_KP_John_Doe.pdf",
    "fileUrl": "https://storage.../report-123.pdf",
    "fileSize": 2457600,
    "status": "DRAFT",
    "uploadedAt": "2026-02-11T14:00:00Z"
  }
}
```

#### Submit Report for Review

**Endpoint**: `POST /api/mahasiswa/report/:id/submit`

**Response**:
```json
{
  "success": true,
  "message": "Laporan berhasil disubmit untuk review",
  "data": {
    "id": "report-123",
    "status": "SUBMITTED",
    "submittedAt": "2026-02-11T14:30:00Z"
  }
}
```

---

### 5. Mentor Signature Management

#### Save/Update Signature

**Endpoint**: `PUT /api/mentor/signature`

**Request Body**:
```json
{
  "signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Signature berhasil disimpan",
  "data": {
    "signature": "data:image/png;base64,...",
    "signatureSetAt": "2026-02-11T10:00:00Z"
  }
}
```

#### Get Signature

**Endpoint**: `GET /api/mentor/signature`

**Response**:
```json
{
  "success": true,
  "data": {
    "signature": "data:image/png;base64,...",
    "signatureSetAt": "2026-02-11T10:00:00Z"
  }
}
```

---

### 6. Admin - Approve Submission ⭐

**Endpoint**: `POST /api/admin/submissions/:id/approve`

**What Happens**:
1. Update submission status → `APPROVED`
2. **AUTO-CREATE** internships untuk semua anggota tim
3. Copy data: company, division, startDate, endDate
4. Send notifications ke semua anggota

**Response**:
```json
{
  "success": true,
  "message": "Submission approved and internships auto-created",
  "data": {
    "submissionId": "sub-456",
    "internshipsCreated": 3,
    "membersNotified": 3
  }
}
```

---

## 💻 Frontend Implementation Examples

### 1. Logbook Page with Complete Data

```tsx
// app/feature/during-intern/pages/logbook-page.tsx
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface InternshipData {
  student: {
    nim: string;
    nama: string;
    prodi: string;
    fakultas: string;
  };
  submission: {
    company: string;
    division: string;
  };
  startDate: string;
  endDate: string;
  team?: {
    name: string;
    members: Array<{ nama: string; role: string }>;
  };
}

export default function LogbookPage() {
  const [internshipData, setInternshipData] = useState<InternshipData | null>(null);
  const [logbooks, setLogbooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // Get complete internship data
      const internshipRes = await fetch('/api/mahasiswa/internship', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const internship = await internshipRes.json();
      setInternshipData(internship.data);

      // Get logbooks
      const logbooksRes = await fetch('/api/mahasiswa/logbook', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const logbooksData = await logbooksRes.json();
      setLogbooks(logbooksData.data.logbooks);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (!internshipData) return <div>No data found</div>;

  return (
    <div className="container mx-auto p-6">
      {/* Header Card - Data dari Submission */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">Logbook Kerja Praktik</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm opacity-80">Nama</p>
              <p className="font-semibold">{internshipData.student.nama}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">NIM</p>
              <p className="font-semibold">{internshipData.student.nim}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Program Studi</p>
              <p className="font-semibold">{internshipData.student.prodi}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Fakultas</p>
              <p className="font-semibold">{internshipData.student.fakultas}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Tempat KP</p>
              <p className="font-semibold">{internshipData.submission.company}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Bidang/Bagian</p>
              <p className="font-semibold">{internshipData.submission.division}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Periode</p>
              <p className="font-semibold">
                {format(new Date(internshipData.startDate), 'dd MMM yyyy', { locale: id })}
                {' - '}
                {format(new Date(internshipData.endDate), 'dd MMM yyyy', { locale: id })}
              </p>
            </div>
            {internshipData.team && (
              <div>
                <p className="text-sm opacity-80">Tim</p>
                <p className="font-semibold">{internshipData.team.name}</p>
                <p className="text-xs opacity-70">{internshipData.team.members.length} anggota</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logbook List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Logbook</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logbooks.map((logbook: any) => (
              <div key={logbook.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">{logbook.activity}</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(logbook.date), 'dd MMMM yyyy', { locale: id })}
                    </p>
                  </div>
                  <Badge
                    variant={
                      logbook.status === 'APPROVED' ? 'success' :
                      logbook.status === 'REJECTED' ? 'destructive' :
                      'secondary'
                    }
                  >
                    {logbook.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-700">{logbook.description}</p>
                {logbook.mentorSignature && (
                  <div className="mt-3 flex items-center gap-2">
                    <img
                      src={logbook.mentorSignature}
                      alt="Signature"
                      className="h-12 border rounded"
                    />
                    <span className="text-xs text-gray-500">
                      Disetujui: {format(new Date(logbook.mentorSignedAt), 'dd MMM yyyy HH:mm', { locale: id })}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### 2. Create Logbook Form

```tsx
// app/feature/during-intern/components/create-logbook-form.tsx
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { toast } from 'sonner';

export default function CreateLogbookForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    date: '',
    activity: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/mahasiswa/logbook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create logbook');

      const result = await response.json();
      toast.success('Logbook berhasil dibuat!');
      onSuccess();
      
      // Reset form
      setFormData({ date: '', activity: '', description: '' });
    } catch (error) {
      toast.error('Gagal membuat logbook');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Tanggal</label>
        <Input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Aktivitas</label>
        <Input
          type="text"
          placeholder="e.g., Membuat fitur login"
          value={formData.activity}
          onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Deskripsi</label>
        <Textarea
          placeholder="Deskripsikan detail pekerjaan yang dilakukan..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={5}
          required
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Menyimpan...' : 'Simpan Logbook'}
      </Button>
    </form>
  );
}
```

---

### 3. Mentor Signature Setup

```tsx
// app/feature/field-mentor/components/signature-setup.tsx
import { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '~/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { toast } from 'sonner';

export default function SignatureSetup() {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [savedSignature, setSavedSignature] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSignature();
  }, []);

  async function loadSignature() {
    try {
      const response = await fetch('/api/mentor/signature', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const result = await response.json();
      if (result.data.signature) {
        setSavedSignature(result.data.signature);
      }
    } catch (error) {
      console.error('Failed to load signature:', error);
    }
  }

  async function handleSave() {
    if (signatureRef.current?.isEmpty()) {
      toast.error('Tanda tangan tidak boleh kosong');
      return;
    }

    setLoading(true);
    try {
      const signatureData = signatureRef.current?.toDataURL('image/png');
      
      const response = await fetch('/api/mentor/signature', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ signature: signatureData }),
      });

      if (!response.ok) throw new Error('Failed to save signature');

      const result = await response.json();
      setSavedSignature(result.data.signature);
      toast.success('Tanda tangan berhasil disimpan!');
    } catch (error) {
      toast.error('Gagal menyimpan tanda tangan');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    signatureRef.current?.clear();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tanda Tangan Digital</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {savedSignature ? (
          <div>
            <p className="text-sm text-gray-600 mb-2">Tanda tangan tersimpan:</p>
            <img src={savedSignature} alt="Signature" className="border rounded p-2 h-32" />
            <Button
              onClick={() => setSavedSignature(null)}
              variant="outline"
              className="mt-2"
            >
              Edit Tanda Tangan
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Gambar tanda tangan Anda di bawah:
            </p>
            <div className="border rounded">
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  width: 500,
                  height: 200,
                  className: 'signature-canvas',
                }}
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSave} disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan'}
              </Button>
              <Button onClick={handleClear} variant="outline">
                Hapus
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

### 4. Assessment Form (Mentor)

```tsx
// app/feature/field-mentor/components/assessment-form.tsx
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { toast } from 'sonner';

interface AssessmentFormProps {
  studentId: string;
  studentName: string;
  onSuccess: () => void;
}

export default function AssessmentForm({ studentId, studentName, onSuccess }: AssessmentFormProps) {
  const [formData, setFormData] = useState({
    kehadiran: 0,
    kerjasama: 0,
    sikapEtika: 0,
    prestasiKerja: 0,
    kreatifitas: 0,
    feedback: '',
  });
  const [loading, setLoading] = useState(false);

  function calculateTotalScore() {
    const { kehadiran, kerjasama, sikapEtika, prestasiKerja, kreatifitas } = formData;
    return (
      kehadiran * 0.2 +
      kerjasama * 0.3 +
      sikapEtika * 0.2 +
      prestasiKerja * 0.2 +
      kreatifitas * 0.1
    ).toFixed(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/mentor/assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...formData,
          studentId,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit assessment');

      const result = await response.json();
      toast.success('Penilaian berhasil disimpan! PDF akan di-generate otomatis.');
      onSuccess();
    } catch (error) {
      toast.error('Gagal menyimpan penilaian');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Penilaian - {studentName}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Kehadiran (20%) - 0-100
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.kehadiran}
              onChange={(e) => setFormData({ ...formData, kehadiran: Number(e.target.value) })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Kerjasama (30%) - 0-100
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.kerjasama}
              onChange={(e) => setFormData({ ...formData, kerjasama: Number(e.target.value) })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Sikap & Etika (20%) - 0-100
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.sikapEtika}
              onChange={(e) => setFormData({ ...formData, sikapEtika: Number(e.target.value) })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Prestasi Kerja (20%) - 0-100
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.prestasiKerja}
              onChange={(e) => setFormData({ ...formData, prestasiKerja: Number(e.target.value) })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Kreatifitas (10%) - 0-100
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.kreatifitas}
              onChange={(e) => setFormData({ ...formData, kreatifitas: Number(e.target.value) })}
              required
            />
          </div>

          <div className="bg-blue-50 p-4 rounded">
            <p className="font-semibold">Total Score (Weighted): {calculateTotalScore()}</p>
            <p className="text-sm text-gray-600">
              Kontribusi ke nilai akhir (30%): {(Number(calculateTotalScore()) * 0.3).toFixed(2)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Feedback / Catatan
            </label>
            <Textarea
              placeholder="Berikan feedback untuk mahasiswa..."
              value={formData.feedback}
              onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
              rows={4}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Menyimpan...' : 'Simpan Penilaian'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

---

## ⚠️ Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": "Error message here",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `UNAUTHORIZED` | Token invalid atau expired | 401 |
| `FORBIDDEN` | User tidak punya akses | 403 |
| `NOT_FOUND` | Resource tidak ditemukan | 404 |
| `VALIDATION_ERROR` | Input validation failed | 400 |
| `SIGNATURE_REQUIRED` | Mentor belum setup signature | 400 |
| `ALREADY_EXISTS` | Resource sudah ada | 409 |

### Error Handling Example

```typescript
// lib/api-client.ts
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific error codes
      switch (data.code) {
        case 'UNAUTHORIZED':
          // Redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 'SIGNATURE_REQUIRED':
          toast.error('Silakan setup tanda tangan terlebih dahulu');
          break;
        default:
          toast.error(data.error || 'Terjadi kesalahan');
      }
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

---

## 📝 Type Definitions

```typescript
// types/api.ts

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface InternshipData {
  id: string;
  status: 'PENDING' | 'AKTIF' | 'SELESAI' | 'BATAL';
  progress: number;
  startDate: string;
  endDate: string;
  submission: {
    id: string;
    company: string;
    division: string;
    letterPurpose: string;
    companyAddress: string;
  };
  student: {
    nim: string;
    nama: string;
    email: string;
    prodi: string;
    fakultas: string;
    angkatan: string;
    semester: number;
  };
  team?: {
    id: string;
    name: string;
    code: string;
    members: Array<{
      nim: string;
      nama: string;
      role: 'KETUA' | 'ANGGOTA';
    }>;
  };
  mentor?: {
    id: string;
    nama: string;
    companyName: string;
    position: string;
  };
  lecturer?: {
    id: string;
    nip: string;
    nama: string;
    prodi: string;
  };
}

export interface Logbook {
  id: string;
  date: string;
  activity: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  mentorSignature?: string;
  mentorSignedAt?: string;
  rejectionNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Assessment {
  id: string;
  kehadiran: number;
  kerjasama: number;
  sikapEtika: number;
  prestasiKerja: number;
  kreatifitas: number;
  totalScore: number;
  weightedScore: number;
  feedback?: string;
  pdfGenerated: boolean;
  pdfUrl?: string;
  pdfGeneratedAt?: string;
}

export interface CombinedGrade {
  id: string;
  fieldMentorScore: number;
  academicSupervisorScore: number;
  totalScore: number;
  averageScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  status: 'lulus' | 'tidak-lulus';
  remarks?: string;
  approvalStatus: 'PENDING_DOSEN' | 'APPROVED_DOSEN' | 'REJECTED_DOSEN' | 'PENDING_KAPRODI' | 'APPROVED_KAPRODI' | 'REJECTED_KAPRODI';
  pdfGenerated: boolean;
  pdfUrl?: string;
  pdfGeneratedAt?: string;
}
```

---

## 🎯 Quick Checklist untuk Frontend Developer

### Halaman Logbook
- [ ] Display header dengan data mahasiswa (nama, nim, prodi, fakultas)
- [ ] Display data tempat KP (dari submission.company, submission.division)
- [ ] Display periode magang
- [ ] Form create logbook (date, activity, description)
- [ ] List logbook dengan status badge
- [ ] Show mentor signature jika APPROVED

### Halaman Assessment (Mahasiswa)
- [ ] Card penilaian mentor (30%) dengan detail scores
- [ ] Card penilaian dosen (70%) dengan detail scores
- [ ] Card rekap nilai akhir dengan grade badge
- [ ] Button preview/download PDF untuk setiap penilaian

### Halaman Mentor
- [ ] Profile page dengan signature setup (canvas)
- [ ] List mahasiswa bimbingan
- [ ] Approve logbook dengan konfirmasi
- [ ] Form penilaian mahasiswa (5 kriteria)

### Halaman Admin
- [ ] List submissions dengan filter status
- [ ] Button approve submission (trigger auto-create internships)
- [ ] List internships dengan filter
- [ ] Assign mentor & dosen ke internship

---

## 📞 Contact & Support

**Backend Team Lead**: [Nama/Email]  
**API Documentation**: `http://localhost:8787/docs` (jika ada Swagger)  
**Postman Collection**: Available in repository

**Questions?**  
Silakan buat issue di repository atau hubungi backend team via Slack channel `#backend-sikp`

---

**Happy Coding! 🚀**
```

## document/Integrasi Dari Backend\FRONTEND_TEAM_NOTES.md

```markdown
# 📨 Catatan untuk Tim Frontend - SIKP Backend Integration

**From**: Backend Team  
**To**: Frontend Team  
**Date**: 11 Februari 2026  
**Subject**: API Integration Guide & Documentation

---

## 📄 Dokumen yang Perlu Dibaca

**Untuk Memahami Project:**
- **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** 🎓 - Overview lengkap tentang SIKP (baca ini dulu!)
- **[GETTING_STARTED.md](GETTING_STARTED.md)** 🚀 - Jika Anda ingin setup backend locally untuk testing

**Untuk API Integration:**

1. **[FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md)** 📚
   - Dokumentasi lengkap dengan contoh code
   - Step-by-step implementation
   - Type definitions TypeScript
   - Error handling guide

2. **[QUICK_API_REFERENCE.md](QUICK_API_REFERENCE.md)** ⚡
   - Quick reference endpoints
   - Sample code siap pakai
   - Checklist implementasi
   - UI/UX recommendations

3. **[API_CONTRACT.md](API_CONTRACT.md)** 📋
   - Cheat sheet endpoints
   - Request/Response format
   - Status enums
   - Error codes

---

## 🎯 Yang Paling Penting (MUST READ)

### 1. **Data Flow: Pengajuan → Magang** ⭐

Sistem kita punya 2 tahap yang saling terhubung:

```
TAHAP 1: PENGAJUAN
- Mahasiswa/Tim submit pengajuan KP
- Data: company, division, startDate, endDate
  
        ↓ Admin Approve
        
TAHAP 2: AUTO-CREATE INTERNSHIPS
- Backend otomatis create internships untuk setiap anggota
- Data dari submission otomatis ter-copy
  
        ↓
        
TAHAP 3: MAGANG
- Mahasiswa bisa akses logbook, assessment, dll
- SEMUA data dari submission sudah tersedia
```

**Key Point**: Frontend TIDAK perlu input ulang data tempat KP. Semua sudah ada dari submission!

---

### 2. **Endpoint Paling Penting** ⭐

```
GET /api/mahasiswa/internship
```

Endpoint ini return SEMUA data yang kalian butuhkan:
- ✅ Data mahasiswa (nama, nim, prodi, fakultas)
- ✅ Data tempat KP (dari submission: company, division, address)
- ✅ Data tim (jika ada)
- ✅ Data mentor (jika sudah assigned)
- ✅ Data dosen (jika sudah assigned)

**Gunakan endpoint ini di SEMUA halaman magang** untuk header/context info.

**Response Example**:
```json
{
  "student": {
    "nim": "2101001",
    "nama": "John Doe",
    "prodi": "Manajemen Informatika",
    "fakultas": "Ilmu Komputer"
  },
  "submission": {
    "company": "PT Maju Jaya",
    "division": "IT Development"
  },
  "team": {
    "name": "Tim Alpha",
    "members": [...]
  }
}
```

---

## 🔧 Quick Implementation Guide

### Step 1: Setup API Client

File: `lib/api-client.ts`

```typescript
const API_BASE_URL = 'http://localhost:8787';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}
```

### Step 2: Create Services

File: `services/student-api.ts`

```typescript
export async function getInternshipData() {
  return apiRequest('/api/mahasiswa/internship');
}

export async function createLogbook(data: any) {
  return apiRequest('/api/mahasiswa/logbook', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

### Step 3: Use in Components

```tsx
// Logbook Page
const { data } = await getInternshipData();

// Display di UI
<div>
  <h1>Logbook - {data.student.nama}</h1>
  <p>Tempat KP: {data.submission.company}</p>
  <p>Bidang: {data.submission.division}</p>
</div>
```

---

## 📋 Checklist Implementasi

### Priority 1 (High Priority)

**Mahasiswa - Logbook Page**
- [ ] Call `GET /api/mahasiswa/internship` untuk header info
- [ ] Form create logbook (`POST /api/mahasiswa/logbook`)
- [ ] List logbook dengan status (`GET /api/mahasiswa/logbook`)
- [ ] Display mentor signature jika APPROVED

**Mentor - Signature Setup**
- [ ] Canvas untuk draw signature (pakai `react-signature-canvas`)
- [ ] Save signature (`PUT /api/mentor/signature`)
- [ ] Display saved signature

**Admin - Approve Submission**
- [ ] Button approve (`POST /api/admin/submissions/:id/approve`)
- [ ] Show success message: "Internships created for X members"

### Priority 2 (Medium Priority)

**Mahasiswa - Assessment Page**
- [ ] Display penilaian mentor (30%)
- [ ] Display penilaian dosen (70%)
- [ ] Display rekap nilai dengan grade badge
- [ ] Button preview/download PDF

**Mentor - Assessment Page**
- [ ] Form 5 kriteria penilaian
- [ ] Auto-calculate total score
- [ ] Submit penilaian

### Priority 3 (Lower Priority)

**Mahasiswa - Report Page**
- [ ] Upload laporan (multipart/form-data)
- [ ] Submit untuk review
- [ ] View feedback dari dosen

**Dosen - Assessment Page**
- [ ] Form 4 kriteria penilaian
- [ ] Submit penilaian

---

## 🎨 UI Components yang Dibutuhkan

### 1. Header Info Component (Reusable)
```tsx
<InternshipHeader data={internshipData} />
```
Display: Nama, NIM, Prodi, Fakultas, Tempat KP, Bidang

### 2. Status Badge
```tsx
<StatusBadge status="APPROVED" />
<StatusBadge status="PENDING" />
<StatusBadge status="REJECTED" />
```

### 3. Grade Badge
```tsx
<GradeBadge grade="A" />  // Green
<GradeBadge grade="B" />  // Blue
<GradeBadge grade="C" />  // Yellow
<GradeBadge grade="D" />  // Orange
<GradeBadge grade="E" />  // Red
```

### 4. Signature Canvas (Mentor)
```tsx
<SignatureSetup onSave={(signature) => saveSignature(signature)} />
```

---

## 📦 NPM Packages Recommendation

```bash
npm install react-signature-canvas
npm install date-fns
npm install sonner  # untuk toast notifications
```

---

## ⚠️ Important Notes

### 1. Authentication
Setiap request WAJIB include token di header:
```typescript
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

### 2. Error Handling
Handle error code `UNAUTHORIZED` → redirect ke login:
```typescript
if (error.code === 'UNAUTHORIZED') {
  localStorage.removeItem('token');
  navigate('/login');
}
```

### 3. Mentor Signature
Mentor WAJIB setup signature dulu sebelum bisa approve logbook.
Jika belum setup, backend return error `SIGNATURE_REQUIRED`.

### 4. PDF Auto-Generation
Setelah submit assessment, PDF akan di-generate di background.
Field `pdfGenerated` akan jadi `true` dan `pdfUrl` tersedia setelah beberapa saat.

---

## 🧪 Testing

### 1. Postman Collection
File: `postman_collection.json` (di root project)

### 2. Test Accounts
```
Mahasiswa:
- Email: mahasiswa@test.com
- Password: password123

Mentor:
- Email: mentor@test.com
- Password: password123

Dosen:
- Email: dosen@test.com
- Password: password123

Admin:
- Email: admin@test.com
- Password: password123
```

### 3. Sample Data
Backend sudah ada seed data:
- 3 mahasiswa dalam 1 tim
- 1 submission APPROVED (internships sudah auto-created)
- Beberapa logbook entries
- Sample assessments

---

## 🚨 Common Issues & Solutions

### Issue 1: CORS Error
**Solution**: Sudah di-handle di backend. Pastikan pakai base URL yang benar.

### Issue 2: Token Expired
**Solution**: Implement refresh token atau redirect ke login.

### Issue 3: File Upload Failed
**Solution**: Gunakan `FormData`, jangan JSON untuk file upload:
```typescript
const formData = new FormData();
formData.append('file', file);
// JANGAN set Content-Type header, biar browser auto-set
```

### Issue 4: Signature Canvas Blank
**Solution**: Pastikan canvas punya fixed width/height:
```tsx
<SignatureCanvas
  canvasProps={{
    width: 500,
    height: 200,
  }}
/>
```

---

## 📞 Contact & Support

### Backend Team
- **Team Lead**: [Nama/Kontak]
- **Slack Channel**: `#backend-sikp`
- **Email**: backend@example.com

### Meeting Schedule
- **Daily Standup**: Senin-Jumat, 09:00 WIB
- **Integration Sync**: Rabu, 15:00 WIB

### Questions?
- Buat issue di repo: `issues/new`
- Tag `@backend-team` di Slack
- Atau DM langsung ke backend team lead

---

## 📚 Resources

1. **Full API Documentation**: [FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md)
2. **Quick Reference**: [QUICK_API_REFERENCE.md](QUICK_API_REFERENCE.md)
3. **API Contract**: [API_CONTRACT.md](API_CONTRACT.md)
4. **Database Schema**: [DATABASE_SCHEMA_DRIZZLE.md](DATABASE_SCHEMA_DRIZZLE.md)
5. **Integration Summary**: [SCHEMA_INTEGRATION_SUMMARY.md](SCHEMA_INTEGRATION_SUMMARY.md)

---

## 🎯 Next Steps

1. ✅ Baca dokumentasi (minimal Quick Reference)
2. ✅ Setup API client
3. ✅ Test endpoints pakai Postman
4. ✅ Implement Priority 1 features
5. ✅ Integration testing with backend
6. ✅ Deploy to staging

---

## 🙏 Thank You!

Terima kasih sudah membaca! Semoga dokumentasi ini membantu proses integrasi.

Kalau ada yang kurang jelas atau butuh bantuan, jangan ragu untuk contact backend team ya! 🚀

---

**Happy Coding! 💻**

*Backend Team*
```

## document/Integrasi Dari Backend\GETTING_STARTED.md

```markdown
# 🚀 Getting Started - SIKP Backend

Panduan praktis untuk developer baru yang ingin mulai development di project SIKP.

## 📋 Prerequisites

Pastikan sudah install:
- ✅ **Node.js** (v18 atau lebih tinggi) - [Download](https://nodejs.org/)
- ✅ **npm** atau **yarn** - Package manager
- ✅ **Git** - Version control - [Download](https://git-scm.com/)
- ✅ **PostgreSQL Database** (atau akses ke Neon DB)
- ✅ **VS Code** (recommended) - [Download](https://code.visualstudio.com/)

### Recommended VS Code Extensions
- Prettier - Code formatter
- ESLint - Linting
- Thunder Client - API testing
- Drizzle ORM - Schema autocomplete

## 🎯 Quick Setup (5-10 menit)

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd backend-SIKP
```

### Step 2: Install Dependencies

```bash
npm install
```

Ini akan install:
- Hono (web framework)
- Drizzle ORM (database ORM)
- Cloudflare Workers dependencies
- Dan lainnya...

### Step 3: Setup Environment Variables

Buat file `.dev.vars` di root folder:

```bash
# Copy dari template
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` dengan credentials Anda:

```bash
# Database Connection
DATABASE_URL=postgresql://username:password@host:5432/database_name?sslmode=require

# JWT Secret (gunakan random string yang kuat)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Cloudflare R2 (untuk file storage)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=sikp-files
```

#### 🔧 Cara Mendapatkan DATABASE_URL

**Option 1: Neon DB (Cloud PostgreSQL - Recommended)**
1. Buka [neon.tech](https://neon.tech/)
2. Sign up / Login
3. Create new project: "SIKP"
4. Copy connection string dari dashboard
5. Paste ke `.dev.vars`

**Option 2: Local PostgreSQL**
```bash
# Install PostgreSQL di Windows
# Download dari: https://www.postgresql.org/download/windows/

# Create database
psql -U postgres
CREATE DATABASE sikp_db;

# Connection string akan seperti:
DATABASE_URL=postgresql://postgres:password@localhost:5432/sikp_db
```

#### 🔐 Generate JWT Secret

```bash
# Option 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Online
# https://randomkeygen.com/ (pilih CodeIgniter Encryption Keys)
```

### Step 4: Setup Database Schema

```bash
# Push schema ke database (development)
npm run db:push
```

Ini akan:
- ✅ Create semua tables (users, teams, submissions, internships, dll)
- ✅ Setup relationships & foreign keys
- ✅ Create indexes untuk performance

**Verify dengan Drizzle Studio:**
```bash
npm run db:studio
```

Browser akan open di `https://local.drizzle.studio` - Anda bisa lihat tables & data.

### Step 5: Seed Initial Data (Optional)

```bash
npm run db:seed
```

Ini akan create:
- Admin user (NIM: admin, password: admin123)
- Sample mahasiswa (NIM: 12345678, password: test123)
- Sample dosen
- Sample teams

**Default Admin Credentials:**
- Username/NIM: `admin`
- Password: `admin123`
- Role: ADMIN

### Step 6: Run Development Server

```bash
npm run dev
```

Server akan berjalan di: **`http://localhost:8787`**

Anda akan lihat:
```
✓ Started local server at http://localhost:8787
✓ Ready to accept connections
```

### Step 7: Test API

Open Thunder Client (VS Code extension) atau Postman, test endpoint:

#### Test 1: Health Check
```
GET http://localhost:8787/
```

Response:
```json
{
  "message": "SIKP Backend API is running",
  "version": "1.0.0"
}
```

#### Test 2: Register User
```
POST http://localhost:8787/api/auth/register
Content-Type: application/json

{
  "nim": "87654321",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "role": "MAHASISWA",
  "phone": "081234567890",
  "faculty": "Teknik",
  "major": "Informatika",
  "semester": "6"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "nim": "87654321",
      "name": "Jane Doe",
      "role": "MAHASISWA"
    }
  }
}
```

#### Test 3: Login
```
POST http://localhost:8787/api/auth/login
Content-Type: application/json

{
  "nim": "87654321",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Test 4: Protected Endpoint
```
GET http://localhost:8787/api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "nim": "87654321",
      "name": "Jane Doe",
      "role": "MAHASISWA"
    }
  }
}
```

✅ **Jika semua test berhasil, setup Anda sudah SUKSES!**

## 📁 Project Structure Tour

Mari explore struktur project:

```
backend-SIKP/
├── src/
│   ├── index.ts              👈 Start here! Entry point aplikasi
│   ├── controllers/          👈 Request handlers (HTTP)
│   ├── services/             👈 Business logic
│   ├── repositories/         👈 Database queries
│   ├── routes/               👈 API route definitions
│   ├── middlewares/          👈 Auth & validation
│   ├── db/
│   │   └── schema.ts         👈 Database schema (PENTING!)
│   ├── types/                👈 TypeScript types
│   └── utils/                👈 Helper functions
├── drizzle/                  👈 Migration files (SQL)
├── .dev.vars                 👈 Environment variables
├── wrangler.jsonc            👈 Cloudflare config
└── drizzle.config.ts         👈 Drizzle config
```

### 🔍 Key Files untuk Dipahami

#### 1. `src/index.ts` - Entry Point
```typescript
// Ini adalah starting point aplikasi
import { Hono } from 'hono'

const app = new Hono()

// Register routes
app.route('/api/auth', authRoute)
app.route('/api/teams', teamRoute)
// ... dst

export default app
```

#### 2. `src/db/schema.ts` - Database Schema
```typescript
// Define semua tables & relations
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  nim: varchar('nim', { length: 20 }).notNull().unique(),
  // ... fields lainnya
})

export const teams = pgTable('teams', {
  // ... team fields
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  teams: many(teams)
}))
```

#### 3. `src/routes/auth.route.ts` - Route Definitions
```typescript
// Define endpoints
authRoute.post('/register', authController.register)
authRoute.post('/login', authController.login)
authRoute.get('/me', authMiddleware, authController.me)
```

#### 4. `src/controllers/auth.controller.ts` - Request Handlers
```typescript
// Handle HTTP requests
export const register = async (c: Context) => {
  const body = await c.req.json()
  const result = await authService.register(body)
  return c.json(result)
}
```

#### 5. `src/services/auth.service.ts` - Business Logic
```typescript
// Business logic layer
export const register = async (data: RegisterInput) => {
  // Validate input
  // Hash password
  // Save to database via repository
  // Return result
}
```

#### 6. `src/repositories/user.repository.ts` - Database Queries
```typescript
// Database operations dengan Drizzle
export const createUser = async (data: InsertUser) => {
  return await db.insert(users).values(data).returning()
}
```

## 🛠️ Development Workflow

### 1. Buat Feature Baru

Contoh: Tambah endpoint untuk get user profile

#### Step A: Update Schema (jika perlu)
File: `src/db/schema.ts`
```typescript
// Tambah field baru ke users table
export const users = pgTable('users', {
  // ... existing fields
  bio: text('bio'),           // ← field baru
  avatar: varchar('avatar')   // ← field baru
})
```

Push ke database:
```bash
npm run db:push
```

#### Step B: Buat Repository Function
File: `src/repositories/user.repository.ts`
```typescript
export const getUserProfile = async (userId: string) => {
  return await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      password: false  // exclude password
    }
  })
}
```

#### Step C: Buat Service Function
File: `src/services/user.service.ts`
```typescript
export const getProfile = async (userId: string) => {
  const user = await userRepository.getUserProfile(userId)
  if (!user) {
    throw new Error('User not found')
  }
  return { success: true, data: { user } }
}
```

#### Step D: Buat Controller
File: `src/controllers/user.controller.ts`
```typescript
export const getProfile = async (c: Context) => {
  const userId = c.get('userId')  // dari middleware
  const result = await userService.getProfile(userId)
  return c.json(result)
}
```

#### Step E: Register Route
File: `src/routes/user.route.ts`
```typescript
import { Hono } from 'hono'
import { authMiddleware } from '../middlewares/auth.middleware'
import * as userController from '../controllers/user.controller'

const userRoute = new Hono()

userRoute.get('/profile', authMiddleware, userController.getProfile)

export default userRoute
```

#### Step F: Register di index.ts
File: `src/index.ts`
```typescript
import userRoute from './routes/user.route'

app.route('/api/users', userRoute)
```

#### Step G: Test
```bash
# Make sure server is running
npm run dev

# Test dengan Thunder Client
GET http://localhost:8787/api/users/profile
Authorization: Bearer <your-token>
```

### 2. Debug Errors

#### Error: "Database connection failed"
Check:
1. DATABASE_URL di `.dev.vars` correct?
2. Database server running?
3. Network / firewall blocking connection?

```bash
# Test connection manually
psql -h <host> -U <user> -d <database>
```

#### Error: "JWT malformed" atau "Invalid token"
Check:
1. Token format: `Authorization: Bearer <token>`
2. Token tidak expired?
3. JWT_SECRET sama antara sign & verify?

Debug:
```typescript
// Log token di middleware
console.log('Token received:', token)
console.log('JWT_SECRET:', process.env.JWT_SECRET)
```

#### Error: "Relation does not exist"
Schema belum di-push ke database:
```bash
npm run db:push
```

#### Error: "Type error in schema"
Run type checking:
```bash
npm run typecheck
```

### 3. Database Migrations

#### Generate Migration
Jika ada perubahan schema:
```bash
npm run db:generate
```

Ini akan create file migration di `drizzle/` folder.

#### Apply Migration
```bash
npm run db:migrate
```

atau untuk development:
```bash
npm run db:push  # Quick push tanpa migrations
```

#### View Database
```bash
npm run db:studio  # GUI untuk explore database
```

## 📚 Next Steps

### 1. Baca Dokumentasi
- **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - High-level overview
- **[FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md)** - Jika Anda frontend dev
- **[DATABASE_SCHEMA_DRIZZLE.md](DATABASE_SCHEMA_DRIZZLE.md)** - Complete schema reference
- **[API_CONTRACT.md](API_CONTRACT.md)** - API specifications

### 2. Explore Codebase
- Baca semua files di `src/controllers/`
- Understand middleware di `src/middlewares/auth.middleware.ts`
- Study schema relations di `src/db/schema.ts`

### 3. Test API Endpoints
Import Postman collection (jika ada):
```bash
# File: postman_collection.json
Import di Postman → Collection → Import
```

Atau gunakan Thunder Client extension di VS Code.

### 4. Join Team Communication
- Ask questions di team chat
- Report issues dengan detail
- Share knowledge dengan team

### 5. Start Contributing
- Pick task dari project board
- Create feature branch: `git checkout -b feature/your-feature`
- Implement feature
- Test thoroughly
- Create pull request
- Code review

## 🎯 Development Tips

### 1. Use Drizzle Studio
```bash
npm run db:studio
```
GUI untuk explore & edit database data. Sangat helpful untuk debug!

### 2. Log Everything (During Development)
```typescript
console.log('Request body:', body)
console.log('User ID:', userId)
console.log('Query result:', result)
```
Remove logs sebelum production!

### 3. Use TypeScript Type Inference
```typescript
// Drizzle gives you autocomplete!
const user = await db.query.users.findFirst({
  //                        ^ autocomplete available
})
```

### 4. Test Edge Cases
- Empty request body
- Invalid data types
- Missing required fields
- Unauthorized access
- Database errors

### 5. Follow Code Style
```bash
# Format code
npm run format

# Lint code
npm run lint
```

### 6. Use Git Properly
```bash
# Commit dengan message yang jelas
git commit -m "feat: add user profile endpoint"
git commit -m "fix: handle null user in auth middleware"
git commit -m "docs: update API contract"

# Push ke branch
git push origin feature/your-feature
```

## 🐛 Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Port 8787 already in use | Kill process: `netstat -ano \| findstr :8787` then `taskkill /PID <pid> /F` |
| Module not found | `npm install` |
| Database error | Check .dev.vars, run `npm run db:push` |
| Type errors | `npm run typecheck` |
| Server won't start | Check syntax errors, check logs |
| JWT invalid | Regenerate token, check JWT_SECRET |

## 💡 Pro Tips

1. **Hot Reload**: Server auto-restarts saat file berubah (thanks to Wrangler)
2. **Drizzle Kit**: Use `npm run db:studio` untuk quick database exploration
3. **Thunder Client**: Better than Postman untuk quick testing di VS Code
4. **Git Stash**: `git stash` untuk temporary save changes
5. **VSCode Shortcuts**: Ctrl+P (quick file open), Ctrl+Shift+F (search in files)

## 📞 Need Help?

- 📖 Check documentation files
- 💬 Ask di team chat
- 🔍 Search di StackOverflow/GitHub Issues
- 📝 Create GitHub issue dengan detail:
  - Steps to reproduce
  - Error messages
  - Expected vs actual behavior
  - Screenshots (jika applicable)

## ✅ Checklist - Apakah Anda Ready?

- [ ] Node.js, npm, Git installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.dev.vars` configured dengan credentials
- [ ] Database schema pushed (`npm run db:push`)
- [ ] Development server running (`npm run dev`)
- [ ] API tested dengan Postman/Thunder Client
- [ ] Documentation dibaca (minimal README.md & PROJECT_OVERVIEW.md)
- [ ] VS Code extensions installed (optional tapi recommended)

**Jika semua checked, Anda ready untuk mulai development! 🚀**

---

**Happy Coding! 🎉**

Last Updated: January 2025
```

## document/Integrasi Dari Backend\PROJECT_OVERVIEW.md

```markdown
# 🎓 SIKP - Sistem Informasi Kerja Praktik

## 📌 Apa itu SIKP?

SIKP adalah sistem informasi untuk mengelola seluruh proses **Kerja Praktik (KP) / Magang Mahasiswa** dari awal hingga akhir:

```
Pembentukan Tim → Pengajuan KP → Admin Review → Magang → Logbook → Penilaian → Selesai
```

## 🎯 Tujuan Project

1. **Digitalisasi proses KP** - Dari manual menjadi online
2. **Monitoring real-time** - Admin bisa track progress mahasiswa
3. **Otomasi workflow** - Auto-create internship setelah approval
4. **Centralized data** - Semua data KP dalam satu sistem
5. **Multi-role access** - Mahasiswa, Dosen, Pembimbing Lapangan, Admin

## 🏗️ Arsitektur Sistem

### Tech Stack

```
Frontend (React/TypeScript)
        ↕ REST API (JSON)
Backend (Hono.js + Cloudflare Workers)
        ↕ Drizzle ORM
Database (PostgreSQL - Neon DB)
        
Storage: Cloudflare R2 (untuk file uploads)
```

### Project Structure

```
backend-SIKP/
├── src/
│   ├── index.ts                    # Entry point
│   ├── controllers/                # Handle HTTP requests
│   │   ├── auth.controller.ts      # Register, login, me
│   │   ├── team.controller.ts      # Create team, invite, respond
│   │   ├── submission.controller.ts # CRUD pengajuan, upload docs
│   │   └── admin.controller.ts     # Admin approve/reject
│   ├── services/                   # Business logic
│   │   ├── auth.service.ts
│   │   ├── team.service.ts
│   │   ├── submission.service.ts
│   │   ├── storage.service.ts      # R2 upload/download
│   │   └── letter.service.ts       # Generate surat
│   ├── repositories/               # Database queries (Drizzle)
│   │   ├── user.repository.ts
│   │   ├── team.repository.ts
│   │   └── submission.repository.ts
│   ├── routes/                     # Route definitions
│   │   ├── auth.route.ts
│   │   ├── team.route.ts
│   │   ├── submission.route.ts
│   │   └── admin.route.ts
│   ├── middlewares/                # Auth & authorization
│   │   └── auth.middleware.ts      # JWT verification
│   ├── db/
│   │   ├── schema.ts               # ⭐ Database schema (Drizzle)
│   │   └── index.ts                # DB connection
│   ├── types/                      # TypeScript types
│   └── utils/                      # Helpers
└── drizzle/                        # Migration files (SQL)
```

## 🗄️ Database Schema Overview

### 👤 User Management
- **users** - Semua user (mahasiswa, dosen, admin, dll)
- **mahasiswa** - Detail data mahasiswa
- **dosen** - Dosen pembimbing
- **pembimbingLapangan** - Supervisor di instansi

### 👥 Tim Mahasiswa
- **teams** - Tim KP
- **teamMembers** - Anggota tim + invitation status

### 📝 Fase Pengajuan
- **submissions** - Data pengajuan KP
- **submissionDocuments** - File yang diupload (KTP, transkrip, dll)
- **generatedLetters** - Surat pengantar yang digenerate

### 🎓 Fase Magang
- **internships** - Data magang (auto-created dari submission)
- **logbooks** - Logbook harian mahasiswa
- **assessments** - Penilaian dari pembimbing lapangan
- **lecturerAssessments** - Penilaian dari dosen
- **combinedGrades** - Nilai gabungan (lapangan + akademik)
- **reports** - Laporan akhir KP
- **titleSubmissions** - Pengajuan judul laporan
- **titleRevisions** - Revisi judul
- **notifications** - Notifikasi untuk user

## 🔄 Data Flow: Pengajuan → Magang

**Ini adalah fitur utama yang menghubungkan dua fase!**

### Before (❌ Masalah):
```
Mahasiswa submit pengajuan → Admin approve → ??? 
Mahasiswa harus input ulang data untuk magang
Data penngajuan hilang/tidak terhubung
```

### After (✅ Solusi):
```
1. Mahasiswa submit SUBMISSION
   - Company: PT ABC
   - Division: IT Department
   - Dates: 1 Jan - 30 Mar 2024
   
2. Admin APPROVE submission
   
3. ✨ Sistem AUTO-CREATE INTERNSHIPS
   - Copy data dari submission
   - Create untuk SETIAP anggota tim
   - Link dengan submissionId
   
4. Mahasiswa GET /api/mahasiswa/internship
   Response:
   {
     student: { nim, nama, prodi, fakultas },
     internship: {
       companyName: "PT ABC",        // ← dari submission
       division: "IT Department",     // ← dari submission
       startDate: "2024-01-01",
       endDate: "2024-03-30"
     },
     submission: { ... },              // ← original data
     mentor: { ... },
     lecturer: { ... }
   }
```

### Keuntungan:
1. ✅ **No duplicate data entry** - Mahasiswa tidak input ulang
2. ✅ **Data consistency** - Company name sama antara pengajuan & magang
3. ✅ **Traceability** - Bisa trace back ke submission original
4. ✅ **Auto-workflow** - Tidak perlu manual create internship

## 🚀 API Endpoints (Simplified)

### Authentication
```
POST /api/auth/register    # Register user baru
POST /api/auth/login       # Login, dapat JWT token
GET  /api/auth/me          # Get current user info
```

### Teams (Mahasiswa)
```
POST /api/teams                              # Buat tim baru
GET  /api/teams/my-teams                     # Get tim saya
POST /api/teams/:teamId/invite               # Undang anggota
POST /api/teams/invitations/:memberId/respond # Accept/reject
```

### Submissions (Mahasiswa)
```
POST   /api/submissions                        # Buat pengajuan
GET    /api/submissions/my-submissions         # Get pengajuan saya
PATCH  /api/submissions/:submissionId          # Update pengajuan
POST   /api/submissions/:submissionId/submit   # Submit ke admin
POST   /api/submissions/:submissionId/documents # Upload file
```

### Internship/Magang (Mahasiswa)
```
GET  /api/mahasiswa/internship      # ⭐ Get all internship data
POST /api/mahasiswa/logbook         # Submit logbook harian
GET  /api/mahasiswa/logbook         # Get all logbooks
POST /api/mahasiswa/report          # Upload laporan akhir
```

### Admin
```
GET  /api/admin/submissions                       # List all submissions
POST /api/admin/submissions/:id/approve           # ⭐ Approve (auto-create internships)
POST /api/admin/submissions/:id/reject            # Reject dengan reason
POST /api/admin/submissions/:id/generate-letter   # Generate surat
GET  /api/admin/statistics                        # Dashboard stats
```

## 🔐 Authentication & Authorization

### JWT Token Flow
```
1. User login → Backend validate → Generate JWT token
2. Frontend save token (localStorage/cookies)
3. Every request → Include header: Authorization: Bearer <token>
4. Middleware verify token → Extract user info → Allow access
```

### Role-Based Access Control (RBAC)
```typescript
enum UserRole {
  MAHASISWA           // Student - can create teams, submissions, logbook
  PEMBIMBING_LAPANGAN // Field supervisor - can assess students
  DOSEN               // Lecturer - can grade reports
  ADMIN               // Admin - can approve submissions
  KAPRODI             // Head of program - can view reports
}
```

Middleware checks role before allowing access to endpoint.

## 📁 File Upload Flow

```
Frontend (multipart/form-data)
    ↓
Hono Middleware (parse file)
    ↓
Storage Service (validate type & size)
    ↓
Cloudflare R2 (store file)
    ↓
Database (save metadata: filename, url, size)
    ↓
Response to Frontend (fileUrl)
```

Allowed file types:
- Documents: PDF, DOC, DOCX
- Images: JPG, PNG
- Max size: 10MB

## 📚 Dokumentasi Lengkap

### 🎯 MULAI DARI SINI (Untuk Developer Baru)
1. **[README.md](README.md)** - Overview project & setup instructions
2. **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** 👈 **Anda di sini!**
3. **[FRONTEND_TEAM_NOTES.md](FRONTEND_TEAM_NOTES.md)** - Untuk frontend developer

### 🗄️ Database & Schema
- **[DATABASE_SCHEMA_DRIZZLE.md](DATABASE_SCHEMA_DRIZZLE.md)** - Complete schema dengan relasi
- **[SCHEMA_COMPARISON_NOTES.md](SCHEMA_COMPARISON_NOTES.md)** - Sebelum vs sesudah update
- **[SCHEMA_INTEGRATION_SUMMARY.md](SCHEMA_INTEGRATION_SUMMARY.md)** - Pengajuan → Magang integration

### 🎨 Frontend Integration
- **[FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md)** - **500+ baris** panduan lengkap
  - API client setup
  - Complete endpoint reference
  - React/TypeScript examples
  - Error handling
  - Type definitions
- **[QUICK_API_REFERENCE.md](QUICK_API_REFERENCE.md)** - Quick reference untuk development
- **[API_CONTRACT.md](API_CONTRACT.md)** - API contract specification

### 🛠️ Development & Testing
- **Database Migration Guide** - Cara run migrations
- **Migration Cheatsheet** - Command reference
- **API Testing Guide** - Testing dengan Postman
- **Troubleshooting Guide** - Common issues & solutions

## 🛠️ Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
Edit `.dev.vars`:
```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=your-secret-key-here
```

### 3. Setup Database
```bash
npm run db:push        # Push schema ke database
npm run db:seed        # Seed initial data (optional)
npm run db:studio      # Open Drizzle Studio (GUI)
```

### 4. Run Development Server
```bash
npm run dev            # Server runs at http://localhost:8787
```

### 5. Test API
Gunakan Postman, Thunder Client, atau curl:
```bash
curl http://localhost:8787/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nim":"12345678","name":"John","email":"john@test.com","password":"test123","role":"MAHASISWA"}'
```

## 🎯 Status Enums (Penting!)

### Submission Status
```typescript
DRAFT       // Masih diedit mahasiswa
MENUNGGU    // Sudah disubmit, waiting review
DITOLAK     // Rejected oleh admin
DITERIMA    // Approved → auto-create internships
```

### Internship Status
```typescript
AKTIF       // Sedang magang
SELESAI     // Magang sudah selesai
DIBATALKAN  // Cancelled
```

### Logbook Status
```typescript
PENDING     // Waiting approval from mentor
APPROVED    // Approved
REJECTED    // Rejected dengan reason
```

### Report Status
```typescript
PENDING         // Waiting review from lecturer
APPROVED        // Approved, dapat nilai
NEEDS_REVISION  // Need revision
```

## 🚨 Common Issues & Solutions

### Issue: "Database connection failed"
**Solution**: Check DATABASE_URL in `.dev.vars`, ensure database is running

### Issue: "JWT token invalid"
**Solution**: Token expired or wrong secret, login ulang untuk dapat token baru

### Issue: "File upload failed"
**Solution**: Check file size (<10MB) and type (PDF/DOC/JPG/PNG only)

### Issue: "Role unauthorized"
**Solution**: User role tidak sesuai, e.g. mahasiswa trying to access admin endpoint

## 📊 Project Stats

- **13+ Migration files** - Database schema evolution
- **9 New tables added** - For complete internship flow
- **20+ API endpoints** - Covering all features
- **5 User roles** - Multi-role system
- **500+ lines** - Frontend integration guide

## 🤝 Team Collaboration

### Backend Developer
- Implement API endpoints sesuai schema
- Ensure data validation dengan Zod
- Test dengan Postman collection
- Document new endpoints di API_CONTRACT.md

### Frontend Developer
- Baca **FRONTEND_INTEGRATION_GUIDE.md** dulu
- Setup API client dengan axios/fetch
- Follow type definitions yang diberikan
- Handle errors sesuai response format

### Admin/Kaprodi
- Review submissions di dashboard
- Approve/reject dengan alasan jelas
- Monitor mahasiswa progress
- Generate letters untuk approved submissions

## 🎓 Key Concepts untuk Dipahami

### 1. **Two-Phase Workflow**
Pengajuan (submission) dan Magang (internship) adalah dua fase berbeda tapi terhubung.

### 2. **Auto-Create Pattern**
Admin approve submission → sistem otomatis create internships untuk semua team members.

### 3. **Data Linking via submissionId**
Internship table punya `submissionId` foreign key untuk link ke submission original.

### 4. **Team-Based System**
Kerja praktik dilakukan dalam tim, leader invite members.

### 5. **Role-Based Access**
Setiap role punya permissions berbeda, checked via middleware.

## 📞 Need Help?

- 📖 Read dokumentasi lengkap di folder ini
- 💬 Ask di team chat/Slack
- 🐛 Report bugs dengan detail (error message, steps to reproduce)
- 📝 Update dokumentasi jika ada perubahan

---

**Last Updated**: January 2025  
**Version**: 2.0 (dengan Pengajuan → Magang integration)  
**Maintained by**: Backend Team
```

## document/Integrasi Dari Backend\QUICK_API_REFERENCE.md

```markdown
# 📋 Quick Reference - API Endpoints untuk Frontend

> **Kirim file ini ke Tim Frontend**  
> **Dokumen Lengkap**: Lihat [FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md)

---

## ⚡ Quick Start

### Base URL
```
Development: http://localhost:8787
Production: https://api.sikp.ac.id
```

### Authentication
```typescript
// Setiap request butuh token di header
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

---

## 🎯 API Endpoints Utama

### 1. **Get Complete Internship Data** ⭐ (PALING PENTING)
```
GET /api/mahasiswa/internship
```
**Return**: Data mahasiswa + submission (company, division) + team + mentor + dosen

**Use Case**: Digunakan di SEMUA halaman magang untuk header info

---

### 2. **Logbook**
```
POST   /api/mahasiswa/logbook           - Create logbook
GET    /api/mahasiswa/logbook           - Get all logbooks
POST   /api/mentor/logbook/:id/approve  - Mentor approve (auto signature)
```

---

### 3. **Assessment**
```
POST   /api/mentor/assessment            - Mentor beri nilai (30%)
POST   /api/dosen/assessment             - Dosen beri nilai (70%)
GET    /api/mahasiswa/assessment         - Get penilaian mentor
GET    /api/mahasiswa/lecturer-assessment - Get penilaian dosen
GET    /api/mahasiswa/grades             - Get rekap nilai akhir
```

---

### 4. **Report**
```
POST   /api/mahasiswa/report/upload      - Upload laporan (multipart/form-data)
POST   /api/mahasiswa/report/:id/submit  - Submit untuk review
GET    /api/mahasiswa/report             - Get laporan
```

---

### 5. **Mentor Signature**
```
PUT    /api/mentor/signature              - Save signature (base64)
GET    /api/mentor/signature              - Get signature
```

---

### 6. **Admin**
```
POST   /api/admin/submissions/:id/approve - Approve submission → Auto-create internships
GET    /api/admin/internships             - Get all internships
POST   /api/admin/internships/:id/assign-mentor  - Assign mentor
```

---

## 📦 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

## 🔑 Key Data Structure

### Internship Data (dari GET /api/mahasiswa/internship)
```json
{
  "student": {
    "nim": "2101001",
    "nama": "John Doe",
    "prodi": "Manajemen Informatika",
    "fakultas": "Ilmu Komputer"
  },
  "submission": {
    "company": "PT Maju Jaya",
    "division": "IT Development",
    "companyAddress": "Jl. Sudirman No. 123"
  },
  "team": {
    "name": "Tim Alpha",
    "members": [...]
  },
  "mentor": { ... },
  "lecturer": { ... }
}
```

---

## ✅ TODO Checklist Frontend

### Mahasiswa - Logbook Page
- [ ] Call `GET /api/mahasiswa/internship` saat mount
- [ ] Display header: nama, nim, prodi, fakultas, tempat KP, bidang
- [ ] Form create logbook (date, activity, description)
- [ ] List logbook dengan status badge (PENDING/APPROVED/REJECTED)
- [ ] Show mentor signature jika APPROVED

### Mahasiswa - Assessment Page
- [ ] Card penilaian mentor (30%)
- [ ] Card penilaian dosen (70%)
- [ ] Card rekap nilai dengan grade badge (A/B/C/D/E)
- [ ] Button preview PDF

### Mentor - Profile Page
- [ ] Canvas untuk signature setup
- [ ] Save signature (base64) via PUT /api/mentor/signature

### Mentor - Assessment Page
- [ ] Form 5 kriteria (kehadiran, kerjasama, sikap, prestasi, kreatifitas)
- [ ] Auto-calculate weighted score (30%)
- [ ] Submit via POST /api/mentor/assessment

### Admin - Submissions Page
- [ ] List submissions dengan filter status
- [ ] Button "Approve" → POST /api/admin/submissions/:id/approve
- [ ] Show success: "Internships created for X members"

---

## 🔄 PENTING: Data Flow

```
PENGAJUAN (Submissions)
    ↓
Admin Approve
    ↓
AUTO-CREATE Internships untuk setiap anggota tim
    ↓
MAGANG (mahasiswa bisa akses logbook, assessment, dll)
```

**Key Point**: 
- Saat submission approved, backend otomatis create internships
- Data dari submission (company, division, startDate, endDate) otomatis tersedia
- Frontend TIDAK perlu input ulang data tempat KP

---

## 💻 Sample Code

### Get Internship Data
```typescript
const response = await fetch('/api/mahasiswa/internship', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
const { data } = await response.json();

console.log(data.student.nama);           // "John Doe"
console.log(data.submission.company);     // "PT Maju Jaya"
console.log(data.submission.division);    // "IT Development"
```

### Create Logbook
```typescript
await fetch('/api/mahasiswa/logbook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    date: '2026-02-11',
    activity: 'Membuat fitur login',
    description: 'Implementasi JWT authentication...',
  }),
});
```

### Save Signature (Mentor)
```typescript
const signatureBase64 = canvas.toDataURL('image/png');

await fetch('/api/mentor/signature', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({ signature: signatureBase64 }),
});
```

---

## 📦 npm Packages yang Dibutuhkan

```json
{
  "dependencies": {
    "react-signature-canvas": "^1.0.6",  // Untuk mentor signature
    "date-fns": "^3.0.0",                // Format tanggal
    "sonner": "^1.3.0"                   // Toast notifications
  }
}
```

---

## 🚨 Common Issues

### 1. Token Expired
**Error**: `UNAUTHORIZED`  
**Solution**: Redirect ke login, clear localStorage

### 2. Mentor Signature Required
**Error**: `SIGNATURE_REQUIRED`  
**Solution**: Redirect mentor ke profile page untuk setup signature

### 3. CORS Error
**Solution**: Pastikan backend sudah setup CORS headers

---

## 📞 Need Help?

- **Full Documentation**: [FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md)
- **Schema Documentation**: [DATABASE_SCHEMA_DRIZZLE.md](DATABASE_SCHEMA_DRIZZLE.md)
- **Backend Team**: [Contact Backend Team Lead]

---

## 🎨 UI/UX Recommendations

### Logbook Page
```
┌─────────────────────────────────────┐
│ Header Card (Blue gradient)        │
│ - Nama, NIM, Prodi, Fakultas      │
│ - Tempat KP, Bidang, Periode      │
│ - Tim (jika ada)                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Create Logbook Form                │
│ - Date, Activity, Description      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Logbook List                       │
│ ┌─────────────────────────────┐   │
│ │ [11 Feb] Membuat fitur X    │   │
│ │ Status: APPROVED ✓          │   │
│ │ [Signature]                 │   │
│ └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Assessment Page (Mahasiswa)
```
┌────────────────────────┐ ┌────────────────────────┐
│ Penilaian Mentor (30%) │ │ Penilaian Dosen (70%)  │
│ - Kehadiran: 90        │ │ - Format: 90           │
│ - Kerjasama: 85        │ │ - Materi: 87           │
│ - Total: 87.4          │ │ - Total: 87.5          │
│ [Preview PDF]          │ │ [Preview PDF]          │
└────────────────────────┘ └────────────────────────┘

┌─────────────────────────────────────┐
│ Rekap Nilai Akhir                  │
│ Grade: A ⭐                         │
│ Status: LULUS ✓                    │
│ Total: 87.47                       │
│ [Preview PDF]                      │
└─────────────────────────────────────┘
```

---

**Last Updated**: 11 Februari 2026  
**Version**: 1.0
```

## document/Integrasi Dari Backend\SUMMARY_FOR_FRONTEND.md

```markdown
# 📦 SUMMARY: Backend → Frontend Integration Package

**Tanggal**: 11 Februari 2026  
**Status**: ✅ COMPLETE & READY TO SEND

---

## 🎯 Yang Sudah Dibuat

Backend SIKP sudah **lengkap dan siap untuk diintegrasikan** dengan frontend! Semua dokumentasi dan catatan sudah disiapkan.

---

## 📧 File Utama untuk Dikirim ke Tim Frontend

### 1️⃣ **EMAIL_TO_FRONTEND_TEAM.md** ✉️ **KIRIM FILE INI!**
**Apa isinya:**
- Email template siap kirim ke tim frontend
- Quick start guide (5 menit)
- API information (base URL, authentication)
- Key endpoints & features
- Priority implementation checklist
- Test accounts
- Contact info backend team

**Cara pakai:**
- Copy isi file ini
- Kirim via email / Slack / WhatsApp ke tim frontend
- Atau share link file ini di repository

---

### 2️⃣ **FRONTEND_DEPLOYMENT_CHECKLIST.md** ✅
**Apa isinya:**
- Checklist lengkap dari pre-development sampai deployment
- Week-by-week task breakdown
- Testing checklist (unit, integration, E2E)
- UI/UX checklist
- Monitoring & maintenance checklist

**Cara pakai:**
- Tim frontend gunakan untuk tracking progress
- Check off items saat selesai
- Bisa jadi project management tool

---

## 📚 Dokumentasi Pendukung (Sudah Disediakan)

### Dokumentasi Lengkap (8 Files)

1. **[FRONTEND_TEAM_NOTES.md](FRONTEND_TEAM_NOTES.md)** (393 baris)
   - Implementation priorities
   - Quick setup guide
   - Common issues & solutions

2. **[FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md)** (500+ baris)
   - Complete API documentation
   - 8+ React component examples
   - TypeScript type definitions
   - Error handling guide
   - Authentication flow

3. **[QUICK_API_REFERENCE.md](QUICK_API_REFERENCE.md)**
   - Quick reference untuk daily development
   - Sample code siap pakai
   - TODO checklist

4. **[API_CONTRACT.md](API_CONTRACT.md)**
   - All endpoints dengan request/response format
   - Status enums
   - Error codes
   - cURL examples

5. **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** (395 baris)
   - Arsitektur sistem
   - Database schema overview
   - Data flow Pengajuan → Magang
   - Key concepts

6. **[GETTING_STARTED.md](GETTING_STARTED.md)** (628 baris)
   - Setup backend locally (untuk testing)
   - Step-by-step guide
   - Development workflow

7. **[DATABASE_SCHEMA_DRIZZLE.md](DATABASE_SCHEMA_DRIZZLE.md)**
   - Complete database schema
   - Table relationships
   - Data flow diagram

8. **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)**
   - Index navigasi semua dokumentasi
   - Reading paths untuk different roles

---

## 🗄️ Backend Code (Schema.ts Updated)

### ✅ Schema.ts Sudah Di-Update!

File: `src/db/schema.ts`

**Yang sudah ditambahkan:**

#### 5 New Enums
- ✅ `internshipStatusEnum` (PENDING, AKTIF, SELESAI, DIBATALKAN)
- ✅ `logbookStatusEnum` (PENDING, APPROVED, REJECTED)
- ✅ `reportStatusEnum` (DRAFT, SUBMITTED, APPROVED, NEEDS_REVISION, REJECTED)
- ✅ `titleStatusEnum` (PENDING, APPROVED, REJECTED)
- ✅ `approvalStatusEnum` (PENDING, APPROVED, REJECTED)

#### 9 New Tables (Fase Magang)
- ✅ `internships` - Data magang (auto-created dari submission)
- ✅ `logbooks` - Logbook harian mahasiswa
- ✅ `assessments` - Penilaian pembimbing lapangan (30%)
- ✅ `lecturerAssessments` - Penilaian dosen (70%)
- ✅ `combinedGrades` - Rekap nilai gabungan
- ✅ `reports` - Laporan akhir KP
- ✅ `titleSubmissions` - Pengajuan judul
- ✅ `titleRevisions` - History revisi judul
- ✅ `notifications` - Sistem notifikasi

#### Updated Existing Tables
- ✅ `pembimbingLapangan` - Added `signature` & `signatureSetAt`

#### 12+ New Relations
- ✅ All relations between new tables configured

**Next Step untuk Backend:**
```bash
# Push schema to database
npm run db:push

# Or generate migration
npm run db:generate
npm run db:migrate

# Verify
npm run db:studio
```

---

## 📊 Documentation Stats

- **Total Files Created**: 10 files
- **Total Lines**: 3500+ lines
- **Code Examples**: 60+ examples
- **Endpoints Documented**: 30+ endpoints
- **Time Invested**: ⏰ Worth it!

---

## 🚀 Cara Mengirim ke Tim Frontend

### Option 1: Via Email
```
To: frontend-team@company.com
Subject: 🚀 Backend SIKP Siap untuk Integrasi!
Attachment: EMAIL_TO_FRONTEND_TEAM.md

Hi Tim Frontend,

Backend API SIKP sudah selesai dan siap untuk diintegrasikan! 

Saya attach file EMAIL_TO_FRONTEND_TEAM.md yang berisi:
- Quick start guide
- API documentation links
- Priority tasks
- Test accounts

Semua dokumentasi lengkap ada di repository folder backend-SIKP.

Link repository: [INSERT_LINK]

Kalau ada pertanyaan, feel free to reach out!

Best regards,
Backend Team
```

### Option 2: Via Slack
```
📣 @frontend-team 

Backend SIKP sudah ready! 🎉

📧 Baca ini dulu: EMAIL_TO_FRONTEND_TEAM.md
✅ Checklist: FRONTEND_DEPLOYMENT_CHECKLIST.md
📚 Full docs: /docs folder di repo

Repository: [INSERT_LINK]

Test accounts:
- Mahasiswa: mahasiswa@test.com / password123
- Mentor: mentor@test.com / password123
- Dosen: dosen@test.com / password123
- Admin: admin@test.com / password123

Base URL: http://localhost:8787

Let's integrate! 💪
```

### Option 3: Via Meeting
```
Agenda Meeting:
1. Demo backend API (15 min)
2. Walk through dokumentasi (10 min)
3. Q&A (10 min)
4. Pembagian task (10 min)
5. Timeline & milestones (5 min)

Bawa laptop untuk live demo!
```

---

## 🎯 Key Points untuk Dijelaskan ke Frontend

### 1. Data Flow Pengajuan → Magang ⭐ (PALING PENTING!)
```
Submission (Pengajuan) 
    ↓ Admin Approve
Auto-create Internships
    ↓
Magang (data submission sudah tersedia!)
```

**Artinya**: Frontend TIDAK perlu input ulang data tempat KP!

### 2. Endpoint Paling Penting
```
GET /api/mahasiswa/internship
```
Return SEMUA data yang dibutuhkan di halaman magang!

### 3. Authentication
Semua request butuh JWT token di header:
```
Authorization: Bearer <token>
```

### 4. Mentor Signature
Mentor WAJIB setup signature sebelum bisa approve logbook.

### 5. Test Accounts
Semua role sudah ada test account. Password: `password123`

---

## ✅ Checklist Sebelum Kirim

Pastikan semua ini sudah di-check:

- [x] Schema.ts sudah update
- [x] Email template sudah dibuat
- [x] Deployment checklist sudah dibuat
- [x] Semua dokumentasi sudah lengkap
- [x] Test accounts sudah tersedia
- [x] Postman collection sudah ada
- [x] Backend API tested & working
- [ ] **KIRIM KE FRONTEND TEAM!** 📧

---

## 📞 Next Steps

### Untuk Backend Team
1. ✅ Review dokumentasi terakhir kali
2. ✅ Push schema changes ke database
3. ✅ Test all endpoints sekali lagi
4. ✅ **KIRIM EMAIL_TO_FRONTEND_TEAM.md ke tim frontend**
5. ⏳ Schedule kickoff meeting dengan frontend
6. ⏳ Be available untuk Q&A selama integrasi

### Untuk Frontend Team (akan dikerjakan mereka)
1. ⏳ Baca EMAIL_TO_FRONTEND_TEAM.md
2. ⏳ Baca FRONTEND_INTEGRATION_GUIDE.md
3. ⏳ Setup project & API client
4. ⏳ Implement according to checklist
5. ⏳ Daily sync dengan backend team
6. ⏳ Deploy & celebrate! 🎉

---

## 🎉 Congratulations!

Backend SIKP siap untuk diintegrasikan dengan frontend! 

Semua dokumentasi lengkap dan berkualitas tinggi. Tim frontend akan sangat terbantu dengan dokumentasi yang sudah disiapkan.

**Good job, Backend Team! 💪🚀**

---

**Dibuat oleh**: Backend Team  
**Tanggal**: 11 Februari 2026  
**Status**: ✅ PRODUCTION READY

---

### 📂 File Summary

```
backend-SIKP/
├── 📧 EMAIL_TO_FRONTEND_TEAM.md          ← KIRIM INI!
├── ✅ FRONTEND_DEPLOYMENT_CHECKLIST.md   ← Untuk tracking
├── 📚 FRONTEND_INTEGRATION_GUIDE.md      ← Complete guide
├── ⚡ QUICK_API_REFERENCE.md             ← Quick reference
├── 📋 API_CONTRACT.md                    ← API specs
├── 🎓 PROJECT_OVERVIEW.md                ← Architecture
├── 🚀 GETTING_STARTED.md                 ← Setup guide
├── 🗄️ DATABASE_SCHEMA_DRIZZLE.md        ← Database schema
├── 📖 DOCUMENTATION_INDEX.md             ← Navigation
└── 💾 src/db/schema.ts                   ← ✅ UPDATED!
```

**Total**: 10 files siap untuk frontend team! 🎁
```

## document/LOGBOOK_IMPROVEMENTS.md

```markdown
# Logbook Page Improvements

## 🎯 Perubahan yang Diterapkan

### 1. Manual Input Periode (Sekali Saja)
- Mahasiswa **HARUS mengisi periode manual** pertama kali
- Input: Tanggal mulai, tanggal selesai, hari kerja (Senin-Jumat default)
- Setelah isi sekali → **data tersimpan persistent**
- Buka lagi → tidak perlu isi ulang
- Bisa **edit periode** jika ada kesalahan

### 2. Periode KP Ditampilkan dari Input User
- Card "Data Mahasiswa" menampilkan periode yang **user input**
- Bukan dari API internship data
- Muncul setelah mahasiswa klik "Simpan Periode"
- Format: "15 Januari 2024 - 15 April 2024"

### 3. Auto-generate Logbook Dates
- Setelah mahasiswa input periode dan klik "Simpan Periode"
- Logbook dates otomatis di-generate berdasarkan:
  - Start Date yang diinput user
  - End Date yang diinput user
  - Hari kerja: Senin - Jumat (bisa disesuaikan)
- Tabel logbook langsung muncul

### 4. Persistent State dengan localStorage
- Status periode tersimpan di `localStorage`
- Saat refresh atau kembali ke halaman, data tidak hilang
- Items yang disimpan:
  - `logbook_period_saved`: Status apakah periode sudah disimpan
  - `logbook_work_period`: Periode yang user input (startDate, endDate, startDay, endDay)
  - `logbook_generated_dates`: Array tanggal-tanggal yang sudah di-generate
  - `logbook_entries`: Entri logbook yang sudah dibuat

### 5. User Flow yang Lebih Smooth
**Flow Lengkap:**
```
1. Buka halaman logbook pertama kali
2. Input tanggal mulai KP (manual)
3. Input tanggal selesai KP (manual)
4. Pilih hari kerja (default: Senin-Jumat)
5. Klik "Simpan Periode" (sekali saja)
6. Tabel logbook muncul dengan {X} hari kerja
7. Periode KP muncul di Data Mahasiswa
8. Mulai isi logbook harian
9. Refresh / Buka lagi → Data tetap ada (tidak perlu input ulang)
10. Bisa klik "Edit Periode" jika perlu ubah
```

**Keuntungan:**
- Input sekali ✅
- Persistent ✅
- Bisa edit ✅
- User-friendly ✅

## 🔧 Technical Implementation

### New Helper Function
```typescript
const generateDatesFromPeriod = (
  startDate: string,
  endDate: string,
  startDay: string,
  endDay: string
): string[] => {
  // Generate array of working dates based on period and working days
}
```

### useEffect Hooks
```typescript
// Hook 1: Fetch student data (tidak auto-populate periode)
useEffect(() => {
  fetchStudentData();
  // internshipData hanya untuk display di card (company, position, dll)
  // TIDAK digunakan untuk auto-fill workPeriod
}, []);

// Hook 2: Restore dari localStorage saja
useEffect(() => {
  // Check localStorage untuk saved state
  // If exists: restore workPeriod, dates, entries
  // If not: mahasiswa harus input manual
}, []);
```

**NOTE: Kode Auto-populate (Commented Out)**
```typescript
// Kode ini disimpan sebagai referensi tapi TIDAK dijalankan:
/*
const internship = internshipResponse.data;
if (internship.startDate && internship.endDate) {
  setWorkPeriod(prev => ({
    ...prev,
    startDate: internship.startDate,
    endDate: internship.endDate,
  }));
}
*/
// Alasan: Mahasiswa harus input periode manual sekali
```

### localStorage Management
```typescript
// Save
localStorage.setItem('logbook_period_saved', 'true');
localStorage.setItem('logbook_generated_dates', JSON.stringify(dates));
localStorage.setItem('logbook_entries', JSON.stringify(entries));

// Restore
const savedState = localStorage.getItem('logbook_period_saved');
const savedDates = JSON.parse(localStorage.getItem('logbook_generated_dates'));
const savedEntries = JSON.parse(localStorage.getItem('logbook_entries'));

// Clear
localStorage.removeItem('logbook_period_saved');
localStorage.removeItem('logbook_generated_dates');
localStorage.removeItem('logbook_entries');
```

## 📋 User Experience Improvements

### Visual Feedback
1. **Loading State**: "Memuat data mahasiswa..." saat fetch data
2. **Empty Periode**: Input form aktif, periode belum terisi
3. **Success Alert**: Green alert dengan jumlah hari kerja yang di-generate
4. **Edit Button**: Tersedia di header card periode untuk reset
5. **Periode Display**: Muncul di Data Mahasiswa setelah user input

### Data Flow
```
User Input Periode → Simpan Periode → Generate Dates → Save localStorage
                                    ↓
                            Update Periode KP Display
                                    ↓
                              Show Logbook Table
                                    ↓
                           User Fill Logbook Entries
```

### Edge Cases Handled
- ✅ First time user (input form kosong, harus isi manual)
- ✅ Refresh halaman (restore dari localStorage)
- ✅ Edit periode (clear state dan mulai ulang)
- ✅ Tanggal tidak valid (validasi sebelum generate)
- ✅ API error (toast error notification)
- ✅ Periode belum diisi (display "Belum diisi" di Data Mahasiswa)

## 🚀 Benefits

1. **Efisiensi**: Mahasiswa tidak perlu input periode manual setiap kali
2. **Konsistensi**: Data periode selalu sama dengan data magang di database
3. **Persistence**: Data tidak hilang saat refresh browser
4. **User-Friendly**: Hanya butuh 1 klik untuk konfirmasi periode
5. **Error Prevention**: Tidak mungkin salah input tanggal

## 🔄 Migration Notes

Untuk mahasiswa yang sudah pernah akses halaman ini sebelumnya:
- localStorage akan kosong, periode akan auto-generate dari API
- Klik "Simpan Periode" sekali untuk persist state
- Logbook entries lama tidak terpengaruh (ada di database)

## ⚠️ Important Notes

1. **localStorage Limitation**: 
   - Data tersimpan per browser
   - Clear browser data = hilang localStorage
   - Solusi: Selalu sync dengan backend API saat save logbook

2. **Backend Sync**:
   - localStorage hanya untuk UX improvement
   - Data permanen harus tetap save ke backend via API
   - Gunakan `createLogbookEntry()` API saat submit logbook

3. **Multiple Devices**:
   - localStorage tidak sync antar device
   - User perlu "Simpan Periode" di setiap device yang digunakan
   - Atau bisa fetch periode dari backend API

## 📝 Future Improvements

- [ ] Fetch periode status dari backend API (sudah pernah simpan atau belum)
- [ ] Sync logbook entries dengan backend secara realtime
- [ ] Add offline mode support dengan IndexedDB
- [ ] Export logbook ke PDF/Excel dengan periode yang sudah tersimpan
```

## document/LOGIKA REGISTER PEMBIMBING LAPANGAN.txt

```text
LOGIKA REGISTER PEMBIMBING LAPANGAN

LINK DISKUSI : https://chatgpt.com/share/6951bf08-5c78-8006-9845-ed84aed4874f

Diskusi Awal
Oke, posisi pemikiran kamu **masuk akal** dan jujur:
👉 *jangan nambah beban pembimbing*,
👉 *jangan bikin sistem ribet cuma demi “aman di atas kertas”*,
👉 tapi **celah kecurangan mahasiswa tetap harus ditutup rapat**.
Kita lurusin dulu:
> **Masalah utamanya bukan email palsu.
> Masalah utamanya: mahasiswa bisa mengontrol proses approval.**
Jadi solusinya **bukan memaksa email perusahaan / KTP**, tapi **memutus kontrol mahasiswa atas proses validasi**.
Di sini kita fokus ke *trust by system flow*, bukan trust by document.
---
## Prinsip desain yang harus dipegang
1. **Mahasiswa tidak boleh membuat identitas pembimbing**
2. **Mahasiswa tidak boleh menyetujui aktivitasnya sendiri**
3. **Setiap tanda tangan harus terjadi di akun pembimbing yang *sudah diverifikasi admin***
4. **Setelah ditandatangani → data terkunci (immutability)**
Kalau 4 ini terpenuhi, email pribadi pun **tidak jadi masalah besar**.
---
## Solusi yang *realistis & ringan* (tanpa email perusahaan, tanpa upload KTP)
### 🔑 Kunci utamanya: **Admin sebagai gatekeeper awal**
Bukan pembimbing, bukan mahasiswa.
---
## FLOW YANG DISARANKAN (final & praktis)
### 1️⃣ Mahasiswa **mengajukan data pembimbing** (BUKAN register)
Mahasiswa **tidak membuat akun pembimbing**, hanya *mengusulkan*:
Field minimal:
* Nama pembimbing
* Jabatan
* Perusahaan
* Email (bebas, gmail pun oke)
* Nomor HP
Status awal: `PENDING_ADMIN_REVIEW`
➡️ **Mahasiswa selesai di sini. Tidak dapat kode. Tidak dapat link.**
---
### 2️⃣ Admin **membuat akun pembimbing**
Ini langkah penting.
Admin:
* Cek kelogisan data (nama vs perusahaan vs jabatan)
* Klik **“Buat Akun Pembimbing”**
* Sistem generate:
  * akun pembimbing
  * email login sementara
  * password sementara
  * role = `PEMBIMBING_LAPANGAN`
  * status = `ACTIVE`
➡️ **Akun pembimbing TIDAK PERNAH dibuat oleh mahasiswa**
---
### 3️⃣ Sistem kirim **credential login** ke email pembimbing
Isi email:
* Username/email
* Password sementara
* Link login
* Wajib ganti password saat login pertama
> Kalau mahasiswa pakai email palsu → pembimbing asli tidak akan pernah login → **logbook tidak akan pernah disetujui**
Artinya:
❌ Mahasiswa tidak diuntungkan
❌ Sistem aman
❌ Tidak merepotkan pembimbing
---
### 4️⃣ In-Account-Signing (yang kamu pilih 👍)
Setelah login, pembimbing:
* Melihat daftar mahasiswa bimbingannya
* Melihat logbook harian
* Klik **Sign / Approve**
* Sistem mencatat:
  * user_id pembimbing
  * timestamp
  * IP
  * hash isi logbook
Setelah sign:
🔒 **Logbook LOCKED**
Mahasiswa hanya bisa lihat.
---
### 5️⃣ Digital Signature Provider (opsional, elegan)
Untuk final nilai / akhir magang:
* Gunakan provider e-sign (sekali saja, bukan harian)
* Generate PDF rekap logbook
* Tanda tangan digital resmi
Ini:
* tidak ribet
* punya kekuatan bukti
* tidak dipakai tiap hari
---
## Kenapa flow ini kuat walau email pribadi?
Karena:
* Mahasiswa **tidak pernah memegang akun pembimbing**
* Tidak ada OTP yang bisa diminta mahasiswa
* Tidak ada kode yang bisa disalahgunakan
* Akun pembimbing **dibuat dari backend/admin**
Email palsu = akun mati = mahasiswa rugi sendiri.
---
## Tambahan proteksi kecil (murah tapi efektif)
Tanpa ribet:
### ✅ 1. One-Role-Per-Account
* Satu akun = satu role
* Mahasiswa tidak bisa “upgrade” jadi pembimbing
### ✅ 2. Supervisor ↔ Student Binding
* Pembimbing hanya bisa sign mahasiswa yang **di-assign admin**
* Tidak bisa sign mahasiswa random
### ✅ 3. Change Request (bukan edit)
Kalau mahasiswa salah isi:
* Ajukan “request revisi”
* Pembimbing yang membuka kembali
---
## Kenapa solusi ini lebih baik dari OTP email?
| Aspek               | OTP Email | Admin-Create Account |
| ------------------- | --------- | -------------------- |
| Beban pembimbing    | Ada       | Hampir nol           |
| Potensi email palsu | Ada       | Tidak berpengaruh    |
| Kontrol mahasiswa   | Masih ada | **Nol**              |
| Implementasi        | Sedang    | **Sederhana**        |
| Skala kampus        | Ribet     | **Stabil**           |
---
## Kesimpulan jujur (tanpa gula)
> **Sistem aman bukan karena verifikasi ribet,
> tapi karena mahasiswa tidak punya kendali atas identitas pembimbing.**
Desain kamu sudah ke arah benar, cuma perlu **memindahkan “hak membuat akun” dari mahasiswa ke admin**.
Itu saja pergeseran kecil, dampaknya besar.

Inti Solusi
Nah, ini pertanyaan **kelas inti masalah** 👍
Dan jawaban jujurnya begini: **tidak ada sistem yang bisa 100% mencegah orang pakai 2 email**.
Yang bisa kita lakukan adalah **membuat kecurangan itu tidak berguna** dan **mudah terdeteksi**.
Sekarang kita bedah pelan tapi tajam.
---
## Fakta pahit dulu (biar lurus)
Kalau mahasiswa:
* punya 2 email
* admin membuat akun pembimbing ke email kedua
* mahasiswa login sebagai “pembimbing”
➡️ **secara teknis bisa**
TAPI… **itu belum tentu berarti sistem gagal**.
Karena keamanan sistem **bukan hanya di pendaftaran**, tapi di **alur otorisasi & pembuktian**.
---
## Tujuan desain yang realistis
Bukan “mustahil curang”, tapi:
1. **Curang = usaha tinggi**
2. **Curang = risiko ketahuan besar**
3. **Curang = tidak bisa massal**
4. **Curang = bisa ditelusuri**
Kalau keempat ini terpenuhi, sistem dianggap **aman secara akademik**.
---
## Solusi inti: **validasi relasi, bukan email**
Email hanya **media komunikasi**, **bukan bukti identitas**.
Yang harus kamu amankan:
> **Relasi MAHASISWA ↔ PEMBIMBING ↔ PERUSAHAAN**
---
## Mekanisme pengaman yang benar-benar bekerja
### 🔒 1. Admin melakukan *logical verification* (tanpa dokumen)
Saat mahasiswa mengajukan pembimbing, admin cek:
* Apakah nama pembimbing masuk akal?
* Apakah jabatan relevan?
* Apakah perusahaan sesuai tempat magang?
Ini **human check**, bukan dokumen.
Mahasiswa jarang nekat bikin pembimbing fiktif kalau tahu **admin melihat**.
---
### 🔒 2. Supervisor binding keras (ini penting)
Di database:
```text
supervisor_id hanya boleh sign student_id yang di-assign admin
```
Artinya:
* Akun pembimbing palsu **tidak bisa** sign mahasiswa lain
* Semua aktivitas tercatat satu arah
---
### 🔒 3. Signature audit trail (senjata utama)
Setiap tanda tangan simpan:
* supervisor_user_id
* waktu
* IP address
* device fingerprint (opsional)
* hash isi logbook
Kalau suatu hari dicek:
> “Kenapa pembimbing menandatangani jam 02.13 dini hari dari IP kos mahasiswa?”
Game over.
---
### 🔒 4. Rate & behavior detection (murah tapi cerdas)
Contoh flag otomatis:
* Pembimbing sign **puluhan hari sekaligus**
* Sign selalu dari IP sama dengan mahasiswa
* Tidak pernah login kecuali untuk sign
Flag → **admin review**.
Tidak perlu AI, cukup rule sederhana.
---
### 🔒 5. Dual confirmation ringan (tanpa ribet)
Bukan tiap hari, cukup **satu kali di awal atau akhir**:
> “Apakah Anda benar pembimbing mahasiswa X di perusahaan Y?”
Klik **YA**.
Kalau mahasiswa pakai email sendiri, dia tetap harus konsisten.
---
## Yang **TIDAK** perlu kamu lakukan
❌ Wajib email perusahaan
❌ Upload KTP
❌ SK penugasan
❌ OTP tiap hari
❌ Video selfie
Itu semua bikin pembimbing kabur.
---
## Kenapa solusi ini masih sah secara akademik?
Karena:
* Ada **admin oversight**
* Ada **audit trail**
* Ada **non-repudiation** (jejak tanda tangan)
* Ada **risk-based verification**
Ini **standar sistem akademik**, bukan sistem perbankan.
---
## Jawaban jujur untuk dosen penguji (penting)
Kalau ditanya:
> “Bagaimana jika mahasiswa punya dua email?”
Jawaban ideal:
> “Sistem tidak berfokus pada email sebagai identitas, melainkan pada relasi terverifikasi antara mahasiswa, pembimbing, dan institusi. Potensi penyalahgunaan diminimalkan melalui kontrol peran, validasi admin, audit trail, serta mekanisme deteksi anomali.”
Itu jawaban **dewasa secara desain**.
---
## Kesimpulan tegas
> **Mahasiswa bisa punya 100 email.
> Yang penting dia tidak bisa menghapus jejak, mengubah data setelah sign, atau lolos dari audit.**
```

## document/RECENTLY_UPDATED.md

```markdown
# Recently Updated Files - Mentor Module

> **Last Updated:** ${new Date().toLocaleDateString('id-ID')}  
> **Module:** Mentor (Field Mentor)  
> **Changes:** Detail mentee page creation, archive page improvement

## Files Modified

### 1. `app/feature/mentor/pages/mentee-detail-page.tsx`
**Status:** ✅ Created  
**Purpose:** Display comprehensive mentee information with tabs for Info, Activity, and Assessment

**CODE_CONVENTION Compliance:**
- ✅ Uses function declaration for main component
- ✅ Proper import order (external → UI → internal → types)
- ✅ UPPER_SNAKE_CASE for mock data constants
- ✅ camelCase for functions and variables
- ✅ PascalCase for component names
- ✅ Proper TypeScript interfaces
- ✅ Uses shadcn/ui components correctly
- ✅ Lucide React icons for consistency

**shadcn/ui Components Used:**
- `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription` from `~/components/ui/card`
- `Button` from `~/components/ui/button`
- `Badge` from `~/components/ui/badge`
- `Separator` from `~/components/ui/separator`
- `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger` from `~/components/ui/tabs`

**Key Features:**
- Three tabs: Information, Activity History, Assessment History
- Quick stats cards showing progress, average score, and total activities
- Dynamic routing with `useParams` to get menteeId
- Action buttons linking to logbook and assessment pages
- Responsive grid layout
- Progress bar for KP completion

**Code Structure:**
```tsx
// 1. Imports (external → UI → internal → types)
import { useState } from "react";
import { Link, useParams } from "react-router";
import { Button } from "~/components/ui/button";
// ...

// 2. Type definitions
import type { Mentee } from "../types";

// 3. Constants (UPPER_SNAKE_CASE)
const MOCK_MENTEE_DATA: Record<string, Mentee & {...}> = {...};
const MOCK_ACTIVITIES = [...];
const MOCK_ASSESSMENTS = [...];

// 4. Main component (function declaration)
function MenteeDetailPage() {
  // 4a. Hooks
  const { menteeId } = useParams();
  const [activeTab, setActiveTab] = useState("info");
  
  // 4b. Early returns
  if (!mentee) {
    return <div>...</div>;
  }
  
  // 4c. Main render
  return <div>...</div>;
}

// 5. Export
export default MenteeDetailPage;
```

---

### 2. `app/routes/_sidebar.mentor.mentee.$menteeId.tsx`
**Status:** ✅ Created  
**Purpose:** Route file for dynamic mentee detail page

**CODE_CONVENTION Compliance:**
- ✅ Follows React Router v7 file-based routing convention
- ✅ Uses `$` for dynamic parameter (menteeId)
- ✅ Proper meta function for SEO
- ✅ Clean default export

**Route Pattern:**
```
URL: /mentor/mentee/{menteeId}
Example: /mentor/mentee/1
```

**Code:**
```tsx
import { type Route } from "./+types/_sidebar.mentor.mentee.$menteeId";
import MenteeDetailPage from "~/feature/mentor/pages/mentee-detail-page";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Detail Mentee - SIKP" },
    { name: "description", content: "Detail informasi mentee" },
  ];
}

export default function MenteeDetail() {
  return <MenteeDetailPage />;
}
```

---

### 3. `app/feature/mentor/pages/archive-page.tsx`
**Status:** ✅ Updated  
**Purpose:** Display and manage archived documents (assessments, logbooks, reports)

**Changes Made:**
1. ❌ **Removed:** Custom components (PageHeader, StatsCard, BackButton, DocumentFilter, DocumentCard)
2. ✅ **Added:** Direct shadcn/ui components for better standardization
3. ✅ **Added:** Tabs for filtering by document type
4. ✅ **Added:** Info card explaining archive functionality
5. ✅ **Improved:** Search and filter functionality
6. ✅ **Added:** View and Download action buttons

**CODE_CONVENTION Compliance:**
- ✅ Uses function declaration for main component
- ✅ Proper import order (external → UI → internal → types)
- ✅ UPPER_SNAKE_CASE for mock data constants (MOCK_ARCHIVED_DOCUMENTS, MOCK_SEMESTERS)
- ✅ camelCase for functions (handleView, handleDownload, getDocumentIcon, getDocumentColor)
- ✅ Uses shadcn/ui components correctly
- ✅ Lucide React icons

**shadcn/ui Components Used:**
- `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription` from `~/components/ui/card`
- `Button` from `~/components/ui/button`
- `Badge` from `~/components/ui/badge`
- `Input` from `~/components/ui/input`
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` from `~/components/ui/select`
- `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger` from `~/components/ui/tabs`

**Key Features:**
- Four filter tabs: All, Assessment, Logbook, Report
- Search by title or mentee name
- Filter by document type and semester
- Statistics cards showing total counts
- View and Download buttons for each document
- Responsive grid layout
- Empty state with helpful message

**Archive Purpose (as documented in info card):**
> "Halaman ini menyimpan semua dokumen penilaian, logbook, dan laporan dari mentee yang telah menyelesaikan periode kerja praktik. Anda dapat mencari, melihat, dan mengunduh dokumen untuk referensi atau keperluan administrasi."

**Code Structure:**
```tsx
// 1. Imports (external → UI → internal → types)
import { useState } from "react";
import { Link } from "react-router";
import { Archive, FileText, Eye, Download, Calendar } from "lucide-react";
// ...

// 2. Type import
import type { ArchivedDocument } from "../types";

// 3. Constants (UPPER_SNAKE_CASE)
const MOCK_ARCHIVED_DOCUMENTS: ArchivedDocument[] = [...];
const MOCK_SEMESTERS = [...];

// 4. Main component (function declaration)
function ArchivePage() {
  // 4a. State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSemester, setFilterSemester] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");
  
  // 4b. Derived values
  const filteredDocuments = MOCK_ARCHIVED_DOCUMENTS.filter(...);
  
  // 4c. Helper functions
  function getDocumentIcon(type: string) {...}
  function getDocumentColor(type: string) {...}
  
  // 4d. Event handlers (handle prefix)
  function handleView(docId: string) {...}
  function handleDownload(docId: string) {...}
  
  // 4e. Main render
  return <div>...</div>;
}

// 5. Export
export default ArchivePage;
```

---

## Integration Points

### Mentee Detail Page Links
The detail page can be accessed from:
1. **Mentee Cards** → "Detail Mentee" button → `/mentor/mentee/{id}`
2. **Dashboard** → "Lihat Mentee" → Mentee list → Detail button

### Navigation Flow
```
Mentor Dashboard
├─> Mentee List (/mentor/mentee)
│   ├─> Mentee Detail (/mentor/mentee/{id})
│   │   ├─> Tab: Info (personal, academic, KP info)
│   │   ├─> Tab: Activity (logbook, reports history)
│   │   └─> Tab: Assessment (grading history)
│   ├─> Logbook Detail (/mentor/logbook-detail/{id})
│   └─> Give Assessment (/mentor/penilaian?mentee={id})
│
├─> Logbook (/mentor/logbook) 
│   └─> Student Logbook Detail (/mentor/logbook-detail/{studentId})
│
├─> Assessment (/mentor/penilaian)
│
├─> Archive (/mentor/arsip)
│   ├─> Filter by: All / Assessment / Logbook / Report
│   ├─> Search & Semester filter
│   └─> View/Download documents
│
└─> Profile, Settings, etc.
```

---

## shadcn/ui Best Practices Applied

### 1. Import Pattern
✅ **Correct:**
```tsx
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
```

❌ **Incorrect:**
```tsx
import Button from "~/components/ui/button";
import * as Card from "~/components/ui/card";
```

### 2. Component Usage with Props
✅ **Correct:**
```tsx
<Button variant="outline" size="sm" asChild>
  <Link to="/path">Click</Link>
</Button>
```

### 3. Card Structure
✅ **Correct:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### 4. Tabs Pattern
✅ **Correct:**
```tsx
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

---

## Testing Checklist

### Mentee Detail Page
- [ ] Page loads with menteeId parameter
- [ ] All three tabs work correctly
- [ ] Progress bar displays correctly
- [ ] Statistics calculated properly
- [ ] Links to logbook and assessment work
- [ ] Responsive on mobile devices
- [ ] Error state shows when mentee not found

### Archive Page
- [ ] All tabs filter documents correctly
- [ ] Search filters by title and mentee name
- [ ] Type and semester dropdowns work
- [ ] Statistics cards show correct counts
- [ ] View and Download buttons trigger handlers
- [ ] Empty state displays when no results
- [ ] Responsive layout on all screen sizes

---

## Future Improvements

### Mentee Detail Page
- [ ] Integrate real API for mentee data
- [ ] Add document upload functionality
- [ ] Implement real-time activity updates
- [ ] Add assessment form inline
- [ ] Export mentee report as PDF

### Archive Page
- [ ] Integrate real document storage API
- [ ] Implement actual file download
- [ ] Add document preview modal
- [ ] Implement pagination for large datasets
- [ ] Add bulk download functionality
- [ ] Add export to Excel/PDF

---

## Notes

1. **No Compilation Errors:** All files pass TypeScript strict mode checks
2. **Sidebar Integration:** Routes properly configured in `sidebar-data.ts`
3. **Mock Data:** Using UPPER_SNAKE_CASE constants for mock data (should be replaced with API calls)
4. **Responsive Design:** All pages use responsive Tailwind classes (grid, flex-wrap, etc.)
5. **Accessibility:** Proper semantic HTML and ARIA labels where needed

---

## Related Documentation

- [CODE_CONVENTION.md](../CODE_CONVENTION.md) - Main coding standards
- [React Router v7 Docs](https://reactrouter.com/dev) - Routing patterns
- [shadcn/ui Docs](https://ui.shadcn.com/) - Component library
- [Lucide Icons](https://lucide.dev/icons/) - Icon reference
```

## document/SAAT-MAGANG.md

```markdown
# Dokumentasi Branch Saat-Magang

Branch ini berisi implementasi fitur-fitur yang dibutuhkan mahasiswa selama masa kerja praktik (magang), serta fitur verifikasi untuk dosen pembimbing.

## 📋 Daftar Isi

- [Overview](#overview)
- [Alur Interaksi](#alur-interaksi)
- [Struktur Feature](#struktur-feature)
- [Fitur yang Diimplementasikan](#fitur-yang-diimplementasikan)
  - [1. Halaman Saat Magang (Hub)](#1-halaman-saat-magang-hub)
  - [2. Pendaftaran Mentor Lapangan](#2-pendaftaran-mentor-lapangan)
  - [3. Logbook Harian](#3-logbook-harian)
  - [4. Penilaian dari Mentor](#4-penilaian-dari-mentor)
  - [5. Pengajuan & Verifikasi Judul Laporan](#5-pengajuan--verifikasi-judul-laporan)
- [File yang Dibuat/Dimodifikasi](#file-yang-dibuatdimodifikasi)
- [Route dan Navigasi](#route-dan-navigasi)
- [Type Definitions](#type-definitions)
- [Cara Menggunakan](#cara-menggunakan)
- [Commit History](#commit-history)

---

## Overview

Branch **Saat-Magang** mengimplementasikan fitur-fitur yang diperlukan mahasiswa selama masa kerja praktik, termasuk:
1. Pendaftaran mentor lapangan
2. Pencatatan logbook harian
3. Melihat penilaian dari mentor lapangan
4. Pengajuan judul laporan KP dan verifikasi oleh dosen ⭐ NEW

---

## Alur Interaksi

```
MAHASISWA                                    DOSEN
    │                                           │
    ├─► 1. Daftar Mentor Lapangan              │
    │   (field-mentor-page)                     │
    │                                           │
    ├─► 2. Catat Logbook Harian                │
    │   (logbook-page)                          │
    │                                           │
    ├─► 3. Lihat Penilaian dari Mentor        │
    │   (assessment-page)                       │
    │                                           │
    ├─► 4. Ajukan Judul Laporan               │
    │   (title-submission-form)                 │
    │                                           │
    │                           ◄───────────────┤
    │                           5. Review Judul │
    │                           (verifikasi-    │
    │                            judul-page)    │
    │                                           │
    │   6. Terima Feedback      ◄───────────────┤
    │   (Disetujui/Revisi/      Kirim Catatan   │
    │    Ditolak)                               │
    │                                           │
    └─► 7. (Jika Revisi) Update & Submit Ulang │
```

---

## Struktur Feature

### 1. During Intern (`app/feature/during-intern/`)

```
during-intern/
├── components/
│   └── card.tsx                 # Reusable card component untuk menu
├── pages/
│   ├── during-intern-page.tsx   # Halaman utama saat magang (menu hub)
│   ├── logbook-page.tsx         # Halaman pencatatan logbook
│   └── assessment-page.tsx      # Halaman penilaian dari mentor
└── types/
    └── index.d.ts               # Type definitions untuk during-intern
```

### 2. Field Mentor (`app/feature/field-mentor/`)

```
field-mentor/
├── components/                   # (Empty - belum ada komponen khusus)
├── pages/
│   └── field-mentor-page.tsx    # Halaman pendaftaran mentor lapangan
└── types/
    └── index.d.ts               # Type definitions untuk mentor
```

### 3. KP Report (`app/feature/kp-report/`) ⭐ NEW

```
kp-report/
├── components/
│   ├── title-submission-form.tsx           # Form pengajuan judul mahasiswa
│   ├── pengajuan-judul-card.tsx           # Card untuk display pengajuan
│   └── verifikasi-judul-dialog.tsx        # Dialog verifikasi dosen
├── pages/
│   └── verifikasi-judul-dosen-page.tsx    # Halaman verifikasi dosen
└── types/
    └── judul.ts                           # Type definitions untuk judul
```

---

## Fitur yang Diimplementasikan

### 1. Halaman Saat Magang (Hub)

**File**: `app/feature/during-intern/pages/during-intern-page.tsx`

**Fungsi:**
- Hub menu untuk fitur-fitur saat magang
- Navigasi ke Logbook, Penilaian, dan Pengesahan (OLS)

**Fitur:**
- Card menu dengan icon Lucide
- Link internal (Logbook, Penilaian)
- Link eksternal ke OLS untuk pengesahan
- Navigasi ke halaman sebelumnya/berikutnya

**Komponen:**
- `Card` component (custom dari `during-intern/components/card.tsx`)
- Icons: `BookOpen`, `ClipboardCheck`, `FileCheck`, `ArrowLeft`, `ArrowRight`

---

### 2. Pendaftaran Mentor Lapangan

**File**: `app/feature/field-mentor/pages/field-mentor-page.tsx`

**Fungsi:**
- Mahasiswa mendaftarkan mentor lapangan
- Generate kode unik untuk mentor
- Tracking status mentor

**Fitur:**

#### Info Section
- Panduan pendaftaran mentor
- Instruksi penggunaan kode

#### Status Mentor
- Display mentor yang sudah terdaftar
- Status: pending, registered, approved, rejected
- Kode mentor dengan tombol copy

#### Form Pendaftaran
- Nama mentor (required)
- Email mentor (required)
- No. telepon mentor (required)
- Perusahaan/Instansi (required)
- Posisi/Jabatan (required)
- Alamat perusahaan (required)

#### Generate Kode
- Auto-generate kode format `MNT-XXXXXX`
- Copy to clipboard functionality
- Kode diberikan ke mentor untuk registrasi

**Flow:**
1. Mahasiswa mengisi form data mentor
2. Submit → Generate kode unik
3. Kode ditampilkan dan bisa dicopy
4. Mahasiswa memberikan kode ke mentor
5. Mentor registrasi menggunakan kode
6. Status berubah: pending → registered → approved

**UI Components:**
- Form dengan input fields
- Card untuk display status mentor
- Button copy kode
- Badge status berwarna
- Icons: `UserPlus`, `CheckCircle`, `Copy`, `User`

---

### 3. Logbook Harian

**File**: `app/feature/during-intern/pages/logbook-page.tsx`

**Fungsi:**
- Pencatatan aktivitas harian mahasiswa selama magang
- Generate tanggal kerja otomatis berdasarkan periode

**Fitur:**

#### Input Periode Kerja
- Tanggal mulai (required)
- Tanggal selesai (required)
- Pilih hari kerja:
  - Senin - Jumat
  - Senin - Sabtu
- Button "Generate Tanggal Kerja"
- Auto-generate list tanggal sesuai hari kerja

#### Pencatatan Logbook
- Pilih tanggal dari dropdown (tanggal yang sudah di-generate)
- Input deskripsi aktivitas (textarea)
- Button "Tambah Logbook"
- List logbook yang sudah dibuat (table)

#### Validasi
- Periode kerja harus diisi lengkap sebelum generate
- Tanggal dan deskripsi wajib diisi sebelum tambah entry
- Hanya tanggal yang di-generate yang bisa dipilih

**State Management:**
```typescript
interface WorkPeriod {
  startDate?: string;
  endDate?: string;
  startDay?: string;
  endDay?: string;
}

interface LogbookEntry {
  id: string;
  date: string;
  description: string;
}
```

**UI Components:**
- Input date dengan label
- Select untuk hari kerja dan pilih tanggal
- Textarea untuk deskripsi
- Table untuk display logbook entries
- Form validation messages

---

### 4. Penilaian dari Mentor

**File**: `app/feature/during-intern/pages/assessment-page.tsx`

**Fungsi:**
- Menampilkan penilaian dari mentor lapangan
- Melihat detail skor per kategori penilaian

**Fitur:**

#### Info Mentor
- Nama mentor
- Posisi dan perusahaan
- Status penilaian (Sudah Dinilai/Belum)

#### Kategori Penilaian
1. **Kedisiplinan**
   - Kehadiran dan ketepatan waktu
   - Progress bar visual
   - Skor/Max Score

2. **Kerjasama**
   - Kemampuan bekerja dalam tim
   - Progress bar visual
   - Skor/Max Score

3. **Inisiatif**
   - Proaktif dalam bekerja
   - Progress bar visual
   - Skor/Max Score

4. **Kualitas Kerja**
   - Hasil pekerjaan yang dihasilkan
   - Progress bar visual
   - Skor/Max Score

#### Total Skor
- Rata-rata skor keseluruhan
- Grade (A/B/C/D)
- Visual star rating

**Mock Data:**
```typescript
const assessments = [
  {
    id: 1,
    category: "Kedisiplinan",
    score: 85,
    maxScore: 100,
    description: "Kehadiran dan ketepatan waktu",
  },
  // ... kategori lainnya
];
```

**UI Components:**
- Card untuk info mentor
- Progress bars dengan warna gradasi (hijau-kuning-merah)
- Star icons untuk rating
- Responsive layout

---

### 5. Pengajuan & Verifikasi Judul Laporan

#### A. Pengajuan Judul (Mahasiswa)

**File**: `app/feature/kp-report/components/title-submission-form.tsx`

**Fungsi:**
- Form pengajuan judul laporan KP oleh mahasiswa
- Submit judul untuk mendapat persetujuan dosen

**Fitur:**

##### Input Judul
- **Judul Bahasa Indonesia** (required)
- **Judul Bahasa Inggris** (optional)

##### Deskripsi Proyek
- **Deskripsi lengkap** (required, minimal 100 karakter)
  - Character counter
  - Validasi real-time
- **Metodologi pengembangan** (optional)
  - Contoh: Waterfall, Agile, Scrum, dll

##### Teknologi
- Input multiple teknologi yang digunakan
- Add teknologi dengan:
  - Tekan Enter
  - Klik tombol +
- Remove teknologi dengan klik X pada badge
- Display sebagai badge berwarna

##### Status Tracking
1. **Draft** - Belum diajukan (gray)
2. **Diajukan** - Menunggu verifikasi dosen (blue)
3. **Disetujui** - Judul disetujui, form disabled (green)
4. **Revisi** - Perlu perbaikan, form enabled (yellow)
5. **Ditolak** - Harus ajukan judul baru, form enabled (red)

##### Catatan Dosen
- Display catatan dengan background berwarna:
  - Hijau (border-green) untuk disetujui
  - Biru (border-blue) untuk revisi
  - Merah (border-red) untuk ditolak
- Icon sesuai status
- Text catatan dari dosen

**Props Interface:**
```typescript
interface TitleSubmissionFormProps {
  onSubmit: (data: PengajuanJudulFormData) => void;
  isLoading?: boolean;
  initialData?: Partial<PengajuanJudulFormData>;
  status?: 'draft' | 'diajukan' | 'disetujui' | 'ditolak' | 'revisi';
  catatanDosen?: string;
}
```

**Validasi:**
- Judul Indonesia wajib diisi
- Deskripsi minimal 100 karakter
- Teknologi bisa kosong atau multiple
- Form disabled jika sudah disetujui

**UI Components:**
- Input text untuk judul
- Textarea untuk deskripsi
- Badge untuk teknologi (removable)
- Alert untuk catatan dosen dengan color-coding
- Button submit dengan text dinamis
- Icons: `FileText`, `Plus`, `X`, `CheckCircle`, `XCircle`, `Clock`, `AlertCircle`

---

#### B. Verifikasi Judul (Dosen)

**File**: `app/feature/kp-report/pages/verifikasi-judul-dosen-page.tsx`

**Fungsi:**
- Halaman dosen untuk verifikasi judul yang diajukan mahasiswa
- Approve, request revision, atau reject judul

**Fitur:**

##### Dashboard Statistik
- 4 Stats cards dengan counter dan icon:
  1. **Menunggu Verifikasi** (blue, Clock icon)
  2. **Disetujui** (green, CheckCircle icon)
  3. **Perlu Revisi** (yellow, FileEdit icon)
  4. **Ditolak** (red, XCircle icon)
- Hover effect pada cards
- Icon dalam circle dengan background warna

##### Search & Filter
- Search bar dengan icon
- Filter berdasarkan:
  - Nama mahasiswa
  - NIM
  - Judul laporan
  - Tempat magang
- Filter real-time saat mengetik

##### Tab Navigation
4 tabs dengan badge counter:
1. **Menunggu** (submitted)
2. **Disetujui** (approved)
3. **Perlu Revisi** (revision)
4. **Ditolak** (rejected)
- Badge menampilkan jumlah per kategori
- Responsive untuk mobile (scrollable tabs)

##### Pengajuan Card
Setiap card menampilkan:
- Info mahasiswa:
  - Foto (avatar)
  - Nama
  - NIM
  - Prodi
  - Tim
- Judul highlighted dengan background
- Detail (toggle view):
  - Tempat magang
  - Periode magang
  - Deskripsi
  - Teknologi (badges)
  - Metodologi
- Riwayat revisi (timeline)
- Catatan dosen dengan border berwarna
- Button "Verifikasi" atau "Lihat Detail"
- Border-left berwarna sesuai status

##### Verifikasi Dialog
Modal dengan:
- Preview mahasiswa dan judul
- 3 pilihan keputusan (radio button):
  - ✅ **Setujui** - Judul sesuai
  - 📝 **Revisi** - Perlu perbaikan
  - ❌ **Tolak** - Tidak sesuai
- Textarea catatan (required, minimal 10 karakter)
- Validation sebelum submit
- Visual indicator untuk setiap opsi (icon + color)
- Error handling

##### Notification System
- Toast notification setelah verifikasi
- Auto-hide setelah 4 detik
- Success message

##### Panduan Verifikasi
- Info card dengan guideline:
  - Cek kesesuaian judul dengan scope
  - Validasi metodologi
  - Review teknologi
  - Berikan feedback konstruktif
- Gradient background

**Mock Data:**
```typescript
// 6 contoh pengajuan dengan berbagai status:
// - 3 submitted (menunggu verifikasi)
// - 1 approved (disetujui)
// - 1 revision (perlu revisi)
// - 1 rejected (ditolak)
```

**UI Components:**
- Stats cards dengan gradient
- Tabs responsive (TabsList, TabsTrigger, TabsContent)
- Search input dengan icon
- Card dengan border dinamis
- Dialog modal untuk verifikasi
- Badge status berwarna
- Progress indicator (loading state)
- Empty state untuk setiap tab
- Icons: `FileText`, `CheckCircle`, `XCircle`, `Clock`, `FileEdit`, `Search`, `Info`, `Eye`

---

#### C. Supporting Components

##### 1. Pengajuan Judul Card

**File**: `app/feature/kp-report/components/pengajuan-judul-card.tsx`

**Props:**
```typescript
interface PengajuanJudulCardProps {
  pengajuan: PengajuanJudul;
  onVerifikasi: (pengajuan: PengajuanJudul) => void;
}
```

**Features:**
- Border-left dinamis berdasarkan status
- Highlighted title section dengan background
- Grid layout untuk tempat & periode magang
- Toggle detail view (deskripsi, metodologi, teknologi)
- Display riwayat revisi dengan timeline
- Display catatan dosen dengan border berwarna
- Action button untuk verifikasi

---

##### 2. Verifikasi Dialog

**File**: `app/feature/kp-report/components/verifikasi-judul-dialog.tsx`

**Props:**
```typescript
interface VerifikasiJudulDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pengajuan: PengajuanJudul;
  onSubmit: (data: VerifikasiJudulFormData) => void;
}
```

**Features:**
- Modal dialog dengan overlay
- Radio button group dengan 3 opsi
- Textarea dengan validation (min 10 char)
- Preview data mahasiswa dan judul
- Validation sebelum submit
- Visual indicator per opsi (icon + color)
- Error handling dan messages

---

#### D. Type Definitions

**File**: `app/feature/kp-report/types/judul.ts`

```typescript
export interface PengajuanJudul {
  id: string;
  mahasiswa: {
    nama: string;
    nim: string;
    jurusan: string;
    angkatan: string;
  };
  tim: {
    nama: string;
    tempatMagang: string;
    periode: string;
  };
  data: {
    judulLaporanIndo: string;
    judulLaporanEng?: string;
    deskripsi: string;
    metodologi?: string;
    teknologi: string[];
  };
  status: 'draft' | 'diajukan' | 'disetujui' | 'ditolak' | 'revisi';
  tanggalDiajukan: string;
  tanggalDiverifikasi?: string;
  catatanDosen?: string;
  revisi?: Array<{
    tanggal: string;
    catatan: string;
    status: 'revisi' | 'ditolak';
  }>;
}

export interface VerifikasiJudulFormData {
  status: 'disetujui' | 'revisi' | 'ditolak';
  catatan: string;
}
```

---

#### E. Integration

**Routes:**
- `/mahasiswa/kp/laporan` - Tab "Judul" menampilkan TitleSubmissionForm
- `/dosen/kp/verifikasi-judul` - VerifikasiJudulDosenPage

**Sidebar Menu:**
- **Mahasiswa**: Menu "Laporan KP" → Tab "Judul"
- **Dosen**: Menu "Verifikasi Judul" di section Kerja Praktik

---

## File yang Dibuat/Dimodifikasi

### File Baru

#### During Intern
1. `app/feature/during-intern/components/card.tsx`
2. `app/feature/during-intern/pages/during-intern-page.tsx`
3. `app/feature/during-intern/pages/logbook-page.tsx`
4. `app/feature/during-intern/pages/assessment-page.tsx`
5. `app/feature/during-intern/types/index.d.ts`

#### Field Mentor
6. `app/feature/field-mentor/pages/field-mentor-page.tsx`
7. `app/feature/field-mentor/types/index.d.ts`

#### KP Report ⭐ NEW
8. `app/feature/kp-report/components/title-submission-form.tsx`
9. `app/feature/kp-report/components/pengajuan-judul-card.tsx`
10. `app/feature/kp-report/components/verifikasi-judul-dialog.tsx`
11. `app/feature/kp-report/pages/verifikasi-judul-dosen-page.tsx`
12. `app/feature/kp-report/types/judul.ts`

#### Routes
13. `app/routes/_sidebar.mahasiswa.kp._timeline.saat-magang.tsx`
14. `app/routes/_sidebar.mahasiswa.kp._timeline.logbook.tsx`
15. `app/routes/_sidebar.mahasiswa.kp._timeline.penilaian.tsx`
16. `app/routes/_sidebar.mahasiswa.mentor-lapangan.tsx`
17. `app/routes/_sidebar.dosen.kp.verifikasi-judul.tsx` ⭐ NEW

### File Dimodifikasi

1. `app/feature/sidebar/data/sidebar-data.ts`
   - Menambahkan menu "Mentor Lapangan" di sidebar mahasiswa
   - Menambahkan menu "Verifikasi Judul" di sidebar dosen ⭐

2. `app/feature/timeline/context/timeline-context.tsx`
   - Menambahkan `SAAT_MAGANG` step ke timeline

3. `app/feature/timeline/components/timeline.tsx`
   - Menambahkan route mapping untuk `SAAT_MAGANG`

---

## Route dan Navigasi

### Routes yang Ditambahkan

| Route | Component | Deskripsi |
|-------|-----------|-----------|
| `/mahasiswa/kp/saat-magang` | `DuringInternPage` | Hub menu saat magang |
| `/mahasiswa/kp/logbook` | `LogbookPage` | Pencatatan logbook |
| `/mahasiswa/kp/penilaian` | `AssessmentPage` | Lihat penilaian |
| `/mahasiswa/mentor-lapangan` | `FieldMentorPage` | Pendaftaran mentor |
| `/mahasiswa/kp/laporan` | `KPReportPage` | Tab "Judul" untuk pengajuan ⭐ |
| `/dosen/kp/verifikasi-judul` | `VerifikasiJudulDosenPage` | Verifikasi judul laporan ⭐ |

### Sidebar Menu

**Mahasiswa:**
```typescript
{
  title: "Laporan KP",
  url: "/mahasiswa/kp/laporan",
  icon: BookMarked,
},
{
  title: "Mentor Lapangan",
  url: "/mahasiswa/mentor-lapangan",
  icon: UserCircle,
},
```

**Dosen:** ⭐
```typescript
{
  title: "Kerja Praktik",
  url: "#",
  icon: GraduationCap,
  items: [
    {
      title: "Verifikasi Judul",
      url: "/dosen/kp/verifikasi-judul",
    },
    {
      title: "Verifikasi Sidang",
      url: "/dosen/kp/verifikasi-sidang",
    },
  ],
},
```

---

## Type Definitions

### During Intern Types

**File**: `app/feature/during-intern/types/index.d.ts`

```typescript
import type { LucideIcon } from "lucide-react";

export interface CardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  to: string;
}
```

### Field Mentor Types

**File**: `app/feature/field-mentor/types/index.d.ts`

```typescript
export interface FieldMentor {
  id: string;
  code: string;
  name: string;
  email: string;
  company: string;
  position: string;
  phone: string;
  status: "pending" | "registered" | "approved" | "rejected";
  createdAt: string;
  registeredAt?: string;
  approvedAt?: string;
  photo?: string;
  nip: string;
}

export interface MentorRequest {
  mentorName: string;
  mentorEmail: string;
  mentorPhone: string;
  company: string;
  position: string;
  address: string;
}
```

### KP Report Types ⭐

**File**: `app/feature/kp-report/types/judul.ts`

```typescript
export interface PengajuanJudul {
  id: string;
  mahasiswa: {
    nama: string;
    nim: string;
    jurusan: string;
    angkatan: string;
  };
  tim: {
    nama: string;
    tempatMagang: string;
    periode: string;
  };
  data: {
    judulLaporanIndo: string;
    judulLaporanEng?: string;
    deskripsi: string;
    metodologi?: string;
    teknologi: string[];
  };
  status: 'draft' | 'diajukan' | 'disetujui' | 'ditolak' | 'revisi';
  tanggalDiajukan: string;
  tanggalDiverifikasi?: string;
  catatanDosen?: string;
  revisi?: Array<{
    tanggal: string;
    catatan: string;
    status: 'revisi' | 'ditolak';
  }>;
}

export interface VerifikasiJudulFormData {
  status: 'disetujui' | 'revisi' | 'ditolak';
  catatan: string;
}
```

---

## Cara Menggunakan

### Untuk Mahasiswa

#### 1. Mengakses Halaman Saat Magang
```
Dashboard Mahasiswa → Timeline KP → Saat Magang
atau: /mahasiswa/kp/saat-magang
```

#### 2. Mendaftar Mentor Lapangan
```
Dashboard Mahasiswa → Mentor Lapangan
atau: /mahasiswa/mentor-lapangan
```

**Langkah:**
1. Isi form data mentor dengan lengkap
2. Klik "Submit Pendaftaran"
3. Copy kode mentor yang di-generate
4. Berikan kode ke mentor untuk registrasi
5. Status akan berubah setelah mentor registrasi

#### 3. Mengisi Logbook
```
Dashboard Mahasiswa → Timeline KP → Saat Magang → Logbook
atau: /mahasiswa/kp/logbook
```

**Langkah:**
1. Isi periode kerja (tanggal mulai, selesai, hari kerja)
2. Klik "Generate Tanggal Kerja"
3. Pilih tanggal dari dropdown
4. Isi deskripsi aktivitas
5. Klik "Tambah Logbook"
6. Logbook tersimpan dan tampil di tabel

#### 4. Melihat Penilaian
```
Dashboard Mahasiswa → Timeline KP → Saat Magang → Penilaian
atau: /mahasiswa/kp/penilaian
```

**Langkah:**
1. Lihat detail penilaian per kategori
2. Lihat total skor dan grade
3. Lihat info mentor yang menilai

#### 5. Mengajukan Judul Laporan ⭐
```
Dashboard Mahasiswa → Laporan KP → Tab "Judul"
atau: /mahasiswa/kp/laporan
```

**Langkah:**
1. Buka halaman Laporan KP
2. Klik tab "Judul"
3. Isi form pengajuan judul:
   - Judul Bahasa Indonesia (wajib)
   - Judul Bahasa Inggris (opsional)
   - Deskripsi proyek (wajib, min 100 karakter)
   - Metodologi (opsional)
   - Teknologi yang digunakan (opsional, bisa multiple)
4. Klik "Ajukan Judul Laporan"
5. Tunggu verifikasi dari dosen pembimbing

**Status:**
- **Draft**: Belum diajukan
- **Diajukan**: Menunggu verifikasi dosen
- **Disetujui**: Judul disetujui, lanjut ke tahap berikutnya
- **Revisi**: Perbaiki sesuai catatan dosen, ajukan ulang
- **Ditolak**: Ajukan judul baru yang berbeda

---

### Untuk Dosen ⭐

#### Verifikasi Judul Laporan KP
```
Dashboard Dosen → Kerja Praktik → Verifikasi Judul
atau: /dosen/kp/verifikasi-judul
```

**Langkah:**

1. **Lihat Dashboard**
   - Stats cards menampilkan overview pengajuan
   - Menunggu: Pengajuan baru yang perlu di-review
   - Disetujui: Judul yang sudah diverifikasi
   - Revisi: Mahasiswa diminta perbaiki
   - Ditolak: Judul tidak sesuai

2. **Search & Filter**
   - Gunakan search untuk mencari mahasiswa/judul tertentu
   - Ketik nama, NIM, judul, atau tempat magang

3. **Pilih Tab**
   - Klik tab sesuai status yang ingin dilihat
   - Badge menampilkan jumlah per kategori

4. **Review Pengajuan**
   - Klik "Lihat Detail" untuk informasi lengkap:
     - Judul (Indonesia & Inggris)
     - Deskripsi proyek
     - Metodologi
     - Teknologi yang digunakan
     - Tempat dan periode magang
     - Riwayat revisi (jika ada)

5. **Verifikasi**
   - Untuk pengajuan yang menunggu, klik "Verifikasi Judul"
   - Pilih keputusan verifikasi:
     - ✅ **Setujui**: Judul sudah sesuai dan layak dilanjutkan
     - 📝 **Minta Revisi**: Judul perlu diperbaiki dengan catatan
     - ❌ **Tolak**: Judul tidak sesuai, mahasiswa harus ajukan judul baru

6. **Isi Catatan**
   - Wajib isi catatan (minimal 10 karakter)
   - Untuk disetujui: Berikan apresiasi dan saran
   - Untuk revisi: Jelaskan apa yang perlu diperbaiki
   - Untuk ditolak: Jelaskan alasan penolakan dan arahan

7. **Submit**
   - Klik "Simpan Verifikasi"
   - Notification muncul
   - Mahasiswa akan menerima notifikasi dan melihat catatan

**Tips Verifikasi:**
- Pastikan judul mencerminkan isi dan ruang lingkup pekerjaan
- Judul harus spesifik, tidak terlalu umum atau terlalu teknis
- Perhatikan penggunaan teknologi dan metodologi yang disebutkan
- Berikan feedback konstruktif untuk membantu mahasiswa berkembang

---

## Commit History

### Main Commits

```bash
# Commit terakhir di branch ⭐ NEW
0f3be70 (HEAD -> Saat-Magang, origin/Saat-Magang) 
  Tambahan Untuk Halaman Pengajuan Judul (Mahasiswa) dan 
  Membuat Halaman Verifikasi Judul (Dosen)
  - Created: title-submission-form.tsx (comprehensive update)
  - Created: verifikasi-judul-dosen-page.tsx
  - Created: pengajuan-judul-card.tsx
  - Created: verifikasi-judul-dialog.tsx
  - Created: kp-report/types/judul.ts
  - Created: route _sidebar.dosen.kp.verifikasi-judul.tsx
  - Modified: sidebar-data.ts (added Verifikasi Judul menu)

ba946bb Tampian Halaman Laporan KP

1b31d92 Merge remote-tracking branch 'origin/main' into Saat-Magang

b806c24 Membuat Halaman Logbook, Penilaian dan Halaman Mentor Lapangan
  - Created: during-intern pages (logbook, assessment, during-intern)
  - Created: field-mentor page
  - Created: route files
  - Modified: sidebar data
```

### Related Commits
```bash
059d787 (origin/Pembimbing-Lapangan) Membuat Halaman Lengkap Untuk Mentor

12fb617 menu penilaian to ols
```

---

## UI/UX Highlights

### Design Patterns
- **Card-based Navigation**: Menu menggunakan card dengan icon
- **Form Validation**: Input validation sebelum submit
- **Progress Indicators**: Visual feedback dengan progress bar
- **Status Badges**: Color-coded status untuk tracking
- **Responsive Layout**: Mobile-friendly design
- **Modal Dialogs**: Untuk actions penting (verifikasi)
- **Search & Filter**: Real-time filtering
- **Tab Navigation**: Organize content by status

### Colors & Styling
- **Primary**: Blue untuk CTA buttons dan info
- **Success**: Green untuk status approved/disetujui
- **Warning**: Yellow untuk status pending/revision
- **Danger**: Red untuk status rejected/ditolak
- **Neutral**: Gray untuk backgrounds dan borders

### Icons Used (Lucide React)
- `BookOpen` - Logbook
- `ClipboardCheck` - Penilaian
- `FileCheck` - Pengesahan
- `FileText` - Judul laporan
- `FileEdit` - Revisi
- `UserPlus` - Tambah mentor
- `User`, `Users`, `UserCircle` - User profiles
- `Building2` - Perusahaan
- `Copy` - Copy button
- `CheckCircle`, `CheckCircle2` - Success/Approved
- `XCircle` - Error/Reject/Ditolak
- `Clock` - Pending/Menunggu
- `ArrowLeft`, `ArrowRight` - Navigation
- `Plus`, `X` - Add/Remove
- `Eye` - View detail
- `AlertCircle` - Warning
- `Info` - Information
- `Search` - Search
- `Calendar` - Date
- `Star` - Rating
- `GraduationCap` - Kerja Praktik menu

---

## Testing Checklist

### Mentor Lapangan
- [ ] Form validation
- [ ] Generate kode mentor
- [ ] Copy to clipboard
- [ ] Display status mentor
- [ ] Status badge colors

### Logbook
- [ ] Generate tanggal berdasarkan periode
- [ ] Validasi periode kerja
- [ ] Tambah logbook entry
- [ ] Display daftar logbook
- [ ] Table responsive

### Penilaian
- [ ] Display penilaian per kategori
- [ ] Progress bar sesuai skor
- [ ] Perhitungan rata-rata
- [ ] Display grade
- [ ] Info mentor lengkap

### Pengajuan Judul (Mahasiswa) ⭐
- [ ] Form judul Indonesia (required)
- [ ] Form judul Inggris (optional)
- [ ] Textarea deskripsi (min 100 char)
- [ ] Character counter
- [ ] Input metodologi
- [ ] Add/remove teknologi
- [ ] Enter key untuk add teknologi
- [ ] Submit form validation
- [ ] Status badge display
- [ ] Catatan dosen display
- [ ] Form disabled saat disetujui
- [ ] Form enabled untuk revisi

### Verifikasi Judul (Dosen) ⭐
- [ ] Stats cards dengan counter
- [ ] Search functionality
- [ ] Real-time filter
- [ ] Tab navigation
- [ ] Badge counter per tab
- [ ] Pengajuan card display
- [ ] Toggle detail view
- [ ] Border color by status
- [ ] Verifikasi dialog open/close
- [ ] Radio button selection
- [ ] Catatan textarea validation (min 10 char)
- [ ] Preview mahasiswa data
- [ ] Submit verifikasi
- [ ] Notification display
- [ ] Auto-hide notification
- [ ] Status update
- [ ] Riwayat revisi display
- [ ] Empty state per tab
- [ ] Responsive layout

### Navigation
- [ ] Timeline integration
- [ ] Sidebar menu
- [ ] Breadcrumb
- [ ] Back/Forward buttons
- [ ] Tab switching

---

## Code Conventions

Sesuai `CODE_CONVENTION.md`:

- ✅ **Function Declaration**: Menggunakan `function` keyword, bukan arrow function
- ✅ **Export Default**: Di akhir file
- ✅ **File Naming**: kebab-case
- ✅ **TypeScript**: Strict typing dengan interfaces
- ✅ **Tailwind CSS**: Utility classes dengan `cn()` helper
- ✅ **Icons**: Lucide React icons

Contoh:
```typescript
function MyComponent(props: MyProps) {
  // ... component logic
  return <div>...</div>;
}

export default MyComponent;
```

---

**Branch**: `Saat-Magang`  
**Last Updated**: December 28, 2025  
**Author**: Development Team  
**Status**: ✅ Completed (Ready for Backend Integration)
```

## document/SAAT-MAGANG.md.backup

```
# Dokumentasi Branch Saat-Magang

Branch ini berisi implementasi fitur-fitur yang dibutuhkan mahasiswa selama masa kerja praktik (magang), serta fitur verifikasi untuk dosen pembimbing.

## 📋 Daftar Isi

- [Overview](#overview)
- [Struktur Feature](#struktur-feature)
- [Fitur yang Diimplementasikan](#fitur-yang-diimplementasikan)
  - [1. Logbook](#1-logbook)
  - [2. Penilaian](#2-penilaian)
  - [3. Mentor Lapangan](#3-mentor-lapangan)
  - [4. Pengajuan & Verifikasi Judul Laporan](#4-pengajuan--verifikasi-judul-laporan)
- [File yang Dibuat/Dimodifikasi](#file-yang-dibuatdimodifikasi)
- [Route dan Navigasi](#route-dan-navigasi)
- [Type Definitions](#type-definitions)
- [Cara Menggunakan](#cara-menggunakan)
- [Commit History](#commit-history)

---

## Overview

Branch **Saat-Magang** mengimplementasikan fitur-fitur yang diperlukan mahasiswa selama masa kerja praktik, termasuk:
1. Pencatatan logbook harian
2. Melihat penilaian dari mentor lapangan
3. Pengesahan dokumen (link ke OLS)
4. Pendaftaran mentor lapangan
5. **Pengajuan judul laporan KP dan verifikasi oleh dosen** ⭐ NEW

**Alur Interaksi:**
```
MAHASISWA                                    DOSEN
    │                                           │
    ├─► 1. Daftar Mentor Lapangan              │
    │   (field-mentor-page)                     │
    │                                           │
    ├─► 2. Catat Logbook Harian                │
    │   (logbook-page)                          │
    │                                           │
    ├─► 3. Lihat Penilaian dari Mentor        │
    │   (assessment-page)                       │
    │                                           │
    ├─► 4. Ajukan Judul Laporan               │
    │   (title-submission-form)                 │
    │                                           │
    │                           ◄───────────────┤
    │                           5. Review Judul │
    │                           (verifikasi-    │
    │                            judul-page)    │
    │                                           │
    │   6. Terima Feedback      ◄───────────────┤
    │   (Disetujui/Revisi/      Kirim Catatan   │
    │    Ditolak)                               │
    │                                           │
    └─► 7. (Jika Revisi) Update & Submit Ulang │
```

---

## Struktur Feature

### 1. During Intern (`app/feature/during-intern/`)

```
during-intern/
├── components/
│   └── card.tsx                 # Reusable card component untuk menu
├── pages/
│   ├── during-intern-page.tsx   # Halaman utama saat magang (menu hub)
│   ├── logbook-page.tsx         # Halaman pencatatan logbook
│   ├── assessment-page.tsx      # Halaman penilaian dari mentor
│   └── ols-page.tsx            # (Jika ada) Redirect ke OLS
└── types/
    └── index.d.ts              # Type definitions untuk during-intern
```

### 2. Field Mentor (`app/feature/field-mentor/`)

```
field-mentor/
├── components/                  # (Empty - belum ada komponen khusus)
├── pages/
│   └── field-mentor-page.tsx   # Halaman pendaftaran mentor lapangan
└── types/
    └── index.d.ts              # Type definitions untuk mentor
```

### 3. KP Report (`app/feature/kp-report/`)

```
kp-report/
├── components/
│   ├── title-submission-form.tsx           # Form pengajuan judul mahasiswa
│   ├── pengajuan-judul-card.tsx           # Card untuk display pengajuan
│   └── verifikasi-judul-dialog.tsx        # Dialog verifikasi dosen
├── pages/
│   └── verifikasi-judul-dosen-page.tsx    # Halaman verifikasi dosen
└── types/
    └── judul.ts                           # Type definitions untuk judul
```

---

## Fitur yang Diimplementasikan

### 1. Logbook (`logbook-page.tsx`)

**Fungsi:**
- Pencatatan aktivitas harian mahasiswa selama magang
- Tracking progress kerja praktik

**Fitur:**
- **Form Input Logbook:**
  - Tanggal kegiatan (date picker)
  - Deskripsi aktivitas
  - Dokumentasi/catatan
  
- **List Logbook:**
  - Tampilan list logbook yang sudah dibuat
  - Filter by date range
  - Edit dan delete entry

- **Export:**
  - Export ke PDF untuk laporan
  - Print logbook

**Mock Data:**
```typescript
const logbookEntries = [
  {
    id: 1,
    date: "2024-01-15",
    activity: "Meeting dengan tim untuk briefing project",
    description: "Diskusi requirement dan timeline",
  },
  // ...
];
```

**UI Components:**
- DatePicker untuk pilih tanggal
- Textarea untuk deskripsi
- Card untuk display logbook entries
- Button group (Add, Edit, Delete, Export)

---

### 2. Penilaian (`assessment-page.tsx`)

**Fungsi:**
- Form pengajuan judul laporan KP oleh mahasiswa
- Submit judul untuk mendapat persetujuan dosen

**Fitur:**
- **Input Judul:**
  - Judul Bahasa Indonesia (required)
  - Judul Bahasa Inggris (optional)
  
- **Deskripsi Proyek:**
  - Deskripsi lengkap minimal 100 karakter (required)
  - Metodologi pengembangan (optional)
  
- **Teknologi:**
  - Input multiple teknologi yang digunakan
  - Add/remove teknologi dengan badge
  - Support keyboard (Enter) untuk tambah

- **Status Tracking:**
  - Draft - Belum diajukan
  - Diajukan - Menunggu verifikasi
  - Disetujui - Sudah disetujui (form disabled)
  - Revisi - Perlu perbaikan (form enabled)
  - Ditolak - Harus ajukan judul baru (form enabled)

- **Catatan Dosen:**
  - Tampilan catatan dari dosen dengan background berwarna
  - Hijau untuk disetujui
  - Biru untuk revisi
  - Merah untuk ditolak

**State Management:**
```typescript
interface TitleSubmissionFormProps {
  currentTitle?: string;
  titleStatus?: "draft" | "diajukan" | "disetujui" | "ditolak" | "revision";
  onSubmit: (data: {
    judulLaporan: string;
    judulInggris: string;
    deskripsi: string;
    metodologi: string;
    teknologi: string[];
  }) => void;
  disabled?: boolean;
  catatanDosen?: string;
}
```

**Validasi:**
- Judul Indonesia wajib diisi
- Deskripsi minimal 100 karakter
- Teknologi bisa kosong atau multiple
- Form disabled jika sudah disetujui

**UI Components:**
- Textarea untuk judul dan deskripsi
- Badge untuk teknologi (removable)
- Alert dengan warna status
- Button submit dengan text dinamis

---

#### B. Verifikasi Judul Dosen (`verifikasi-judul-dosen-page.tsx`)

**Fungsi:**
- Halaman dosen untuk verifikasi judul yang diajukan mahasiswa
- Approve, reject, atau minta revisi judul

**Fitur:**
- **Dashboard Statistik:**
  - Card stats: Menunggu, Disetujui, Revisi, Ditolak
  - Icon rounded dengan warna berbeda
  - Hover effect pada cards

- **Search & Filter:**
  - Search berdasarkan nama, NIM, judul, atau tempat magang
  - Filter real-time saat mengetik

- **Tabs:**
  - Menunggu Verifikasi (submitted)
  - Disetujui (approved)
  - Perlu Revisi (revision)
  - Ditolak (rejected)
  - Badge counter per tab
  - Responsive untuk mobile

- **Pengajuan Card:**
  - Info mahasiswa (nama, NIM, prodi, tim)
  - Judul highlighted dengan background
  - Detail: tempat magang, periode, deskripsi
  - Teknologi yang digunakan (badges)
  - Metodologi (jika ada)
  - Riwayat revisi (jika ada)
  - Toggle detail view
  - Catatan dosen dengan border berwarna

- **Verifikasi Dialog:**
  - 3 pilihan keputusan:
    - ✅ Setujui - Judul sesuai
    - 📝 Revisi - Perlu perbaikan
    - ❌ Tolak - Tidak sesuai
  - Catatan wajib (minimal 10 karakter)
  - Preview info mahasiswa dan judul
  - Validasi sebelum submit

- **Notifikasi:**
  - Toast notification setelah verifikasi
  - Auto-hide setelah 4 detik

- **Panduan Verifikasi:**
  - Info card dengan guideline
  - Gradient background

**Type Definitions:**
```typescript
interface PengajuanJudul {
  id: string;
  mahasiswa: {
    id: string;
    nama: string;
    nim: string;
    prodi: string;
    email?: string;
  };
  tim?: {
    id: string;
    nama: string;
    anggota: string[];
  };
  data: {
    judulLaporan: string;
    judulInggris?: string;
    tempatMagang: string;
    periode: {
      mulai: string;
      selesai: string;
    };
    deskripsi: string;
    metodologi?: string;
    teknologi?: string[];
  };
  status: "submitted" | "approved" | "rejected" | "revision";
  tanggalPengajuan: string;
  tanggalVerifikasi?: string;
  catatanDosen?: string;
  revisi?: {
    count: number;
    history: Array<{
      tanggal: string;
      catatan: string;
    }>;
  };
}
```

**UI Components:**
- Stats cards dengan gradient
- Tabs responsive
- Search input dengan icon
- Card dengan border dinamis
- Dialog modal untuk verifikasi
- Badge status berwarna
- Progress indicator (loading state)
- Empty state untuk setiap tab

---

#### C. Komponen Pendukung

**1. Pengajuan Judul Card (`pengajuan-judul-card.tsx`)**
- Card component untuk menampilkan pengajuan
- Border kiri dinamis berdasarkan status
- Toggle detail view
- Catatan dosen dengan styling khusus
- Riwayat revisi dengan timeline

**2. Verifikasi Dialog (`verifikasi-judul-dialog.tsx`)**
- Modal untuk verifikasi
- Radio button untuk pilihan status
- Textarea catatan dengan validation
- Preview data mahasiswa dan judul
- Error handling

**3. Type Definitions (`kp-report/types/judul.ts`)**
- Interface untuk PengajuanJudul
- Interface untuk form data verifikasi

---

#### D. Routes & Integration

**Routes Mahasiswa:**
- `/mahasiswa/kp/laporan` - Tab "Judul" untuk pengajuan

**Routes Dosen:**
- `/dosen/kp/verifikasi-judul` - Halaman verifikasi

**Sidebar Menu:**
```typescript
// Dosen menu
{
  title: "Kerja Praktik",
  icon: GraduationCap,
  items: [
    {
      title: "Verifikasi Judul",
      url: "/dosen/kp/verifikasi-judul",
    },
    {
      title: "Verifikasi Sidang",
      url: "/dosen/kp/verifikasi-sidang",
    },
  ],
}
```

---

#### E. Mock Data

**Mahasiswa Mock:**
```typescript
// 6 contoh pengajuan dengan berbagai status
// - 3 submitted (menunggu)
// - 1 approved
// - 1 revision
// - 1 rejected
```

---

### 1. Halaman Saat Magang (`during-intern-page.tsx`)

**Fungsi:**
- Hub menu untuk fitur-fitur saat magang
- Navigasi ke Logbook, Penilaian, dan Pengesahan

**Fitur:**
- Card menu dengan icon Lucide
- Link internal dan eksternal (ke OLS)
- Navigasi ke halaman sebelumnya (Surat Balasan)
- Navigasi ke halaman berikutnya (placeholder)

**Komponen yang Digunakan:**
- `Card` (custom component dari `during-intern/components/card.tsx`)
- `Button` dari shadcn/ui
- Icons: `BookOpen`, `ClipboardCheck`, `FileCheck`, `ArrowLeft`, `ArrowRight`

---

### 2. Halaman Logbook (`logbook-page.tsx`)

**Fungsi:**
- Pencatatan aktivitas harian mahasiswa selama magang
- Generate tanggal otomatis berdasarkan periode kerja

**Fitur:**
- **Input Periode Kerja:**
  - Tanggal mulai dan selesai
  - Hari kerja (Senin-Jumat atau Senin-Sabtu)
  - Auto-generate tanggal sesuai hari kerja

- **Pencatatan Logbook:**
  - Pilih tanggal dari dropdown (tanggal yang sudah di-generate)
  - Input deskripsi aktivitas
  - Tambah entry logbook
  - Lihat daftar logbook yang sudah dibuat

- **Validasi:**
  - Periode kerja harus diisi lengkap
  - Tanggal dan deskripsi harus diisi sebelum submit
  - Hanya tanggal yang sudah di-generate yang bisa dipilih

**State Management:**
```typescript
interface WorkPeriod {
  startDate?: string;
  endDate?: string;
  startDay?: string;
  endDay?: string;
}

interface LogbookEntry {
  id: string;
  date: string;
  description: string;
}
```

**UI Components:**
- Form input dengan label dan validation
- Select dropdown untuk tanggal
- Textarea untuk deskripsi
- Table untuk menampilkan logbook entries
- Button untuk submit dan generate

---

### 3. Halaman Penilaian (`assessment-page.tsx`)

**Fungsi:**
- Menampilkan penilaian dari mentor lapangan
- Melihat detail skor per kategori penilaian

**Fitur:**
- **Info Mentor:**
  - Nama mentor
  - Posisi dan perusahaan
  - Status penilaian

- **Kategori Penilaian:**
  - Kedisiplinan
  - Kerjasama
  - Inisiatif
  - Kualitas Kerja

- **Progress Bar:**
  - Visual skor dengan progress bar
  - Skor dari max score
  - Deskripsi untuk setiap kategori

- **Total Skor:**
  - Rata-rata skor keseluruhan
  - Grade (A/B/C/D)
  - Visual star rating

**Mock Data:**
```typescript
const assessments = [
  {
    id: 1,
    category: "Kedisiplinan",
    score: 85,
    maxScore: 100,
    description: "Kehadiran dan ketepatan waktu",
  },
  // ...
];
```

**UI Components:**
- Card untuk info mentor
- Progress bars dengan warna gradasi
- Star icons untuk rating
- Responsive layout

---

### 4. Halaman Mentor Lapangan (`field-mentor-page.tsx`)

**Fungsi:**
- Pendaftaran mentor lapangan oleh mahasiswa
- Generate kode unik untuk mentor
- Tracking status mentor

**Fitur:**
- **Info Section:**
  - Panduan pendaftaran mentor
  - Instruksi penggunaan kode

- **Status Mentor:**
  - Tampilan mentor yang sudah terdaftar
  - Status: pending, registered, approved, rejected
  - Kode mentor yang bisa dicopy

- **Form Pendaftaran:**
  - Nama mentor
  - Email mentor
  - No. telepon mentor
  - Perusahaan/Instansi
  - Posisi/Jabatan
  - Alamat perusahaan

- **Generate Kode:**
  - Auto-generate kode unik format `MNT-XXXXXX`
  - Copy to clipboard functionality
  - Kode diberikan ke mentor untuk registrasi

**Flow:**
1. Mahasiswa mengisi form data mentor
2. Submit → Generate kode unik
3. Kode ditampilkan dan bisa dicopy
4. Mahasiswa memberikan kode ke mentor
5. Mentor registrasi menggunakan kode

**State Management:**
```typescript
interface FieldMentor {
  id: string;
  code: string;
  name: string;
  email: string;
  company: string;
  position: string;
  phone: string;
  status: "pending" | "registered" | "approved" | "rejected";
  createdAt: string;
  nip: string;
}

interface MentorRequest {
  mentorName: string;
  mentorEmail: string;
  mentorPhone: string;
  company: string;
  position: string;
  address: string;
}
```

**UI Components:**
- Form dengan input fields
- Card untuk status mentor
- Button copy kode
- Status badge dengan warna
- Icons: `UserPlus`, `CheckCircle`, `Copy`, `User`

---

### 5. Card Component (`card.tsx`)

**Fungsi:**
- Reusable card component untuk menu items
- Support icon dari Lucide React

**Props:**
```typescript
interface CardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  to: string;
}
```

**Features:**
- Hover effect (shadow + translate)
- Centered icon dengan background circle
- Link integration dengan React Router

---

## File yang Dibuat/Dimodifikasi

### File Baru

#### Feature Files
1. `app/feature/kp-report/components/title-submission-form.tsx` ⭐ NEW
2. `app/feature/kp-report/components/pengajuan-judul-card.tsx` ⭐ NEW
3. `app/feature/kp-report/components/verifikasi-judul-dialog.tsx` ⭐ NEW
4. `app/feature/kp-report/pages/verifikasi-judul-dosen-page.tsx` ⭐ NEW
5. `app/feature/kp-report/types/judul.ts` ⭐ NEW
6. `app/feature/during-intern/components/card.tsx`
7. `app/feature/during-intern/pages/during-intern-page.tsx`
8. `app/feature/during-intern/pages/logbook-page.tsx`
9. `app/feature/during-intern/pages/assessment-page.tsx`
10. `app/feature/during-intern/types/index.d.ts`
11. `app/feature/field-mentor/pages/field-mentor-page.tsx`
12. `app/feature/field-mentor/types/index.d.ts`

#### Route Files
8. `app/routes/_sidebar.dosen.kp.verifikasi-judul.tsx` ⭐ NEW
9. `app/routes/_sidebar.mahasiswa.kp._timeline.saat-magang.tsx`
10. `app/routes/_sidebar.mahasiswa.kp._timeline.logbook.tsx`
11. `app/routes/_sidebar.mahasiswa.kp._timeline.penilaian.tsx`
12. `app/routes/_sidebar.mahasiswa.mentor-lapangan.tsx`

### File Dimodifikasi

1. `app/feature/sidebar/data/sidebar-data.ts`
   - Menambahkan menu "Mentor Lapangan" di sidebar mahasiswa
   - Menambahkan menu "Verifikasi Judul" di sidebar dosen ⭐

2. `app/feature/timeline/context/timeline-context.tsx`
   - Menambahkan `SAAT_MAGANG` step ke timeline

3. `app/feature/timeline/components/timeline.tsx`
   - Menambahkan route mapping untuk `SAAT_MAGANG`

4. `app/feature/kp-report/components/title-submission-form.tsx` ⭐
   - Updated dari simple form menjadi comprehensive form
   - Tambah input judul Inggris, deskripsi, metodologi, teknologi
   - Status revisi dan catatan dosen

---

## Route dan Navigasi

### Routes yang Ditambahkan

| Route | Component | Deskripsi |
|-------|-----------|-----------|
| `/mahasiswa/kp/laporan` | `KPReportPage` | Tab "Judul" untuk pengajuan ⭐ |
| `/mahasiswa/kp/saat-magang` | `DuringInternPage` | Halaman hub saat magang |
| `/mahasiswa/kp/logbook` | `LogbookPage` | Pencatatan logbook |
| `/mahasiswa/kp/penilaian` | `AssessmentPage` | Lihat penilaian |
| `/mahasiswa/mentor-lapangan` | `FieldMentorPage` | Pendaftaran mentor |
| `/dosen/kp/verifikasi-judul` | `VerifikasiJudulDosenPage` | Verifikasi judul laporan ⭐ |

### Timeline Integration

```typescript
// timeline-context.tsx
enum TimelineStep {
  // ...
  SAAT_MAGANG: "saat-magang",
  // ...
}

// timeline.tsx
const stepUrls = {
  // ...
  [TimelineStep.SAAT_MAGANG]: "/mahasiswa/kp/saat-magang",
  // ...
};
```

### Sidebar Menu

**Mahasiswa:**
```typescript
{
  title: "Laporan KP",
  url: "/mahasiswa/kp/laporan",
  icon: BookMarked,
},
{
  title: "Mentor Lapangan",
  url: "/mahasiswa/mentor-lapangan",
  icon: UserCircle,
},
```

**Dosen:**
```typescript
{
  title: "Kerja Praktik",
  url: "#",
  icon: GraduationCap,
  items: [
    {
      title: "Verifikasi Judul", // ⭐ NEW
      url: "/dosen/kp/verifikasi-judul",
    },
    {
      title: "Verifikasi Sidang",
      url: "/dosen/kp/verifikasi-sidang",
    },
  ],
},
```

---

## Type Definitions

### KP Report Types (`kp-report/types/judul.ts`) ⭐ NEW

```typescript
export interface PengajuanJudul {
  id: string;
  mahasiswa: {
    id: string;
    nama: string;
    nim: string;
    prodi: string;
    email?: string;
  };
  tim?: {
    id: string;
    nama: string;
    anggota: string[];
  };
  data: {
    judulLaporan: string;
    judulInggris?: string;
    tempatMagang: string;
    periode: {
      mulai: string;
      selesai: string;
    };
    deskripsi: string;
    metodologi?: string;
    teknologi?: string[];
  };
  status: "submitted" | "approved" | "rejected" | "revision";
  tanggalPengajuan: string;
  tanggalVerifikasi?: string;
  catatanDosen?: string;
  revisi?: {
    count: number;
    history: Array<{
      tanggal: string;
      catatan: string;
    }>;
  };
}

export interface VerifikasiJudulFormData {
  status: "approved" | "rejected" | "revision";
  catatan: string;
}
```

### During Intern Types (`during-intern/types/index.d.ts`)

```typescript
import type { LucideIcon } from "lucide-react";

export interface CardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  to: string;
}
```

### Field Mentor Types (`field-mentor/types/index.d.ts`)

```typescript
export interface FieldMentor {
  id: string;
  code: string;
  name: string;
  email: string;
  company: string;
  position: string;
  phone: string;
  status: "pending" | "registered" | "approved" | "rejected";
  createdAt: string;
  registeredAt?: string;
  approvedAt?: string;
  photo?: string;
  nip: string;
}

export interface MentorRequest {
  mentorName: string;
  mentorEmail: string;
  mentorPhone: string;
  company: string;
  position: string;
  address: string;
}
```

---

## Cara Menggunakan

### Untuk Mahasiswa

#### 0. Mengajukan Judul Laporan KP ⭐
```
Dashboard Mahasiswa → Laporan KP → Tab "Judul"
atau langsung ke: /mahasiswa/kp/laporan
```

**Langkah:**
1. Buka halaman Laporan KP
2. Klik tab "Judul"
3. Isi form pengajuan judul:
   - Judul Bahasa Indonesia (wajib)
   - Judul Bahasa Inggris (opsional)
   - Deskripsi proyek (wajib, min 100 karakter)
   - Metodologi (opsional)
   - Teknologi yang digunakan (opsional, bisa multiple)
4. Klik "Ajukan Judul Laporan"
5. Tunggu verifikasi dari dosen pembimbing

**Status:**
- **Draft**: Belum diajukan
- **Diajukan**: Menunggu verifikasi dosen
- **Disetujui**: Judul disetujui, lanjut ke tahap berikutnya
- **Revisi**: Perbaiki sesuai catatan dosen, ajukan ulang
- **Ditolak**: Ajukan judul baru yang berbeda

#### 1. Mengakses Halaman Saat Magang
```
Dashboard Mahasiswa → Timeline KP → Saat Magang
atau langsung ke: /mahasiswa/kp/saat-magang
```

#### 2. Mengisi Logbook
1. Klik menu "Logbook" di halaman Saat Magang
2. Isi periode kerja (tanggal mulai, selesai, dan hari kerja)
3. Klik "Generate Tanggal Kerja"
4. Pilih tanggal dari dropdown
5. Isi deskripsi aktivitas
6. Klik "Tambah Logbook"
7. Logbook tersimpan dan tampil di tabel

#### 3. Melihat Penilaian
1. Klik menu "Penilaian" di halaman Saat Magang
2. Lihat detail penilaian per kategori
3. Lihat total skor dan grade
4. Kembali ke halaman sebelumnya jika perlu

#### 4. Mendaftar Mentor Lapangan
1. Klik menu "Mentor Lapangan" di sidebar
2. Isi form data mentor dengan lengkap
3. Klik "Submit Pendaftaran"
4. Copy kode mentor yang di-generate
5. Berikan kode ke mentor untuk registrasi

### Untuk Dosen ⭐

#### 1. Verifikasi Judul Laporan KP
```
Dashboard Dosen → Kerja Praktik → Verifikasi Judul
atau langsung ke: /dosen/kp/verifikasi-judul
```

**Langkah:**
1. Lihat statistik pengajuan di dashboard
   - Menunggu: Pengajuan baru
   - Disetujui: Sudah diverifikasi
   - Revisi: Mahasiswa diminta perbaiki
   - Ditolak: Judul tidak sesuai

2. Gunakan search untuk mencari mahasiswa/judul tertentu

3. Pilih tab sesuai status yang ingin dilihat

4. Klik "Lihat Detail" untuk melihat informasi lengkap:
   - Judul (Indonesia & Inggris)
   - Deskripsi proyek
   - Metodologi
   - Teknologi yang digunakan
   - Tempat dan periode magang
   - Riwayat revisi (jika ada)

5. Untuk pengajuan yang menunggu, klik "Verifikasi Judul"

6. Pilih keputusan verifikasi:
   - ✅ **Setujui**: Judul sudah sesuai dan layak dilanjutkan
   - 📝 **Minta Revisi**: Judul perlu diperbaiki dengan catatan
   - ❌ **Tolak**: Judul tidak sesuai, mahasiswa harus ajukan judul baru

7. Isi catatan verifikasi (minimal 10 karakter):
   - Untuk disetujui: Berikan apresiasi dan saran
   - Untuk revisi: Jelaskan apa yang perlu diperbaiki
   - Untuk ditolak: Jelaskan alasan penolakan dan arahan

8. Klik "Simpan Verifikasi"

9. Mahasiswa akan menerima notifikasi dan melihat catatan Anda

**Tips Verifikasi:**
- Pastikan judul mencerminkan isi dan ruang lingkup pekerjaan
- Judul harus spesifik, tidak terlalu umum atau terlalu teknis
- Perhatikan penggunaan teknologi dan metodologi yang disebutkan
- Berikan feedback konstruktif untuk membantu mahasiswa berkembang

---

## Commit History

### Main Commits

```bash
# Commit terakhir di branch ⭐ NEW
0f3be70 (HEAD -> Saat-Magang, origin/Saat-Magang) 
  Tambahan Untuk Halaman Pengajuan Judul (Mahasiswa) dan 
  Membuat Halaman Verifikasi Judul (Dosen)
  - Created: title-submission-form.tsx (comprehensive update)
  - Created: verifikasi-judul-dosen-page.tsx
  - Created: pengajuan-judul-card.tsx
  - Created: verifikasi-judul-dialog.tsx
  - Created: kp-report/types/judul.ts
  - Created: route _sidebar.dosen.kp.verifikasi-judul.tsx
  - Modified: sidebar-data.ts (added Verifikasi Judul menu)

ba946bb Tampian Halaman Laporan KP

1b31d92 Merge remote-tracking branch 'origin/main' into Saat-Magang

b806c24 Membuat Halaman Logbook, Penilaian dan Halaman Mentor Lapangan
  - Created: during-intern pages (logbook, assessment, during-intern)
  - Created: field-mentor page
  - Created: route files
  - Modified: sidebar data
```

### Related Commits
```bash
059d787 (origin/Pembimbing-Lapangan) Membuat Halaman Lengkap Untuk Mentor

12fb617 menu penilaian to ols
```

---

## UI/UX Highlights

### Design Patterns
- **Card-based Navigation**: Menu menggunakan card dengan icon
- **Form Validation**: Input validation sebelum submit
- **Progress Indicators**: Visual feedback dengan progress bar
- **Status Badges**: Color-coded status untuk mentor
- **Responsive Layout**: Mobile-friendly design

### Colors & Styling
- **Primary**: Blue untuk CTA buttons
- **Success**: Green untuk status approved
- **Warning**: Yellow untuk status pending
- **Danger**: Red untuk status rejected
- **Neutral**: Gray untuk backgrounds dan borders

### Icons Used (Lucide React)
- `BookOpen` - Logbook
- `ClipboardCheck` - Penilaian
- `FileCheck` - Pengesahan
- `UserPlus` - Tambah mentor
- `User`, `Users` - User profiles
- `Building2` - Perusahaan
- `Copy` - Copy button
- `CheckCircle`, `CheckCircle2` - Success indicator
- `XCircle` - Error/Reject
- `Clock` - Pending status
- `ArrowLeft`, `ArrowRight` - Navigation
- `FileText`, `FileEdit` - Document/Edit
- `Plus`, `X` - Add/Remove
- `Eye` - View detail
- `AlertCircle` - Warning/Info
- `Info` - Information
- `Search` - Search icon
- `Calendar` - Date picker
- `Star` - Rating

---

## Testing Checklist

### Pengajuan Judul (Mahasiswa) ⭐
- [ ] Form judul Indonesia (required)
- [ ] Form judul Inggris (optional)
- [ ] Textarea deskripsi (min 100 char)
- [ ] Input metodologi
- [ ] Add/remove teknologi
- [ ] Submit form validation
- [ ] Status badge display
- [ ] Catatan dosen display
- [ ] Form disabled saat disetujui
- [ ] Form enabled untuk revisi

### Verifikasi Judul (Dosen) ⭐
- [ ] Stats cards dengan counter
- [ ] Search functionality
- [ ] Filter by status (tabs)
- [ ] Pengajuan card display
- [ ] Toggle detail view
- [ ] Verifikasi dialog open/close
- [ ] Radio button selection
- [ ] Catatan textarea validation
- [ ] Submit verifikasi
- [ ] Notification display
- [ ] Status update
- [ ] Riwayat revisi display
- [ ] Empty state per tab
- [ ] Responsive layout

### Logbook Page
- [ ] Generate tanggal berdasarkan periode kerja
- [ ] Validasi periode kerja
- [ ] Tambah logbook entry
- [ ] Tampilkan daftar logbook
- [ ] Hapus logbook (jika ada)

### Assessment Page
- [ ] Tampilan penilaian per kategori
- [ ] Progress bar sesuai skor
- [ ] Perhitungan rata-rata
- [ ] Display grade
- [ ] Info mentor lengkap

### Field Mentor Page
- [ ] Form validation
- [ ] Generate kode mentor
- [ ] Copy to clipboard
- [ ] Tampilan status mentor
- [ ] Update status mentor

### Navigation
- [ ] Timeline integration
- [ ] Sidebar menu navigation
- [ ] Breadcrumb navigation
- [ ] Back/Forward buttons

---

## Known Issues & Future Improvements

### Current Limitations
1. **Mock Data**: Semua data masih menggunakan mock data, belum terintegrasi dengan backend
2. **No Persistence**: Data tidak tersimpan setelah refresh (perlu local storage atau API)
3. **No Authentication**: Belum ada validasi user authentication
4. **Limited Validation**: Form validation masih basic

### Future Enhancements
1. **Backend Integration**
   - API endpoints untuk CRUD logbook
   - API untuk penilaian dari mentor
   - API pendaftaran mentor
   
2. **Additional Features**
   - Edit/Delete logbook entries
   - Export logbook ke PDF
   - Notifikasi penilaian baru
   - Chat dengan mentor
   - Upload attachment di logbook
   
3. **UX Improvements**
   - Auto-save logbook entries
   - Drag & drop untuk reorder
   - Calendar view untuk logbook
   - Rich text editor untuk deskripsi
   
4. **Validation**
   - Email validation
   - Phone number format
   - Date range validation
   - Duplicate entry prevention

---

## Dependencies

### External Libraries
- React Router v7 - Routing
- Lucide React - Icons
- shadcn/ui - UI Components

### Internal Dependencies
- `~/components/ui/*` - shadcn/ui components
- `~/feature/timeline/context/timeline-context` - Timeline state
- `~/lib/utils` - Utility functions

---

## Notes

- Semua fitur menggunakan **Function Declaration** sesuai CODE_CONVENTION
- Export default di akhir file
- Menggunakan **Lucide React** untuk icons
- Tailwind CSS untuk styling
- TypeScript untuk type safety
- File naming menggunakan **kebab-case**

---

**Branch**: Saat-Magang  
**Last Updated**: December 28, 2025  
**Author**: Development Team  
**Status**: ✅ Completed (Ready for Backend Integration)
```

## document/STUDENT_DATA_INTEGRATION.md

```markdown
# Student Data Integration Guide

Dokumentasi untuk integrasi data mahasiswa di halaman frontend SIKP.

## 📊 Data Mahasiswa yang Ditampilkan

### Untuk Mahasiswa (Student View)

Halaman-halaman berikut menampilkan data lengkap mahasiswa:

#### 1. During Intern Page (`/mahasiswa/kp/saat-magang`)

**File**: `app/feature/during-intern/pages/during-intern-page.tsx`

**Data yang ditampilkan:**
- Nama
- NIM
- Program Studi
- Fakultas
- Tempat KP
- Waktu KP / Periode KP (startDate - endDate)
- Status (AKTIF/SELESAI/BATAL)

**API Used:**
```typescript
import { getMyProfile, getMyInternship } from "~/feature/during-intern/services";

// Fetch both profile and internship data
const [profileResponse, internshipResponse] = await Promise.all([
  getMyProfile(),
  getMyInternship()
]);
```

#### 2. Logbook Page (`/mahasiswa/kp/logbook`)

**File**: `app/feature/during-intern/pages/logbook-page.tsx`

**Data yang ditampilkan:**
- Nama
- NIM
- Program Studi
- Fakultas
- Tempat KP
- Bagian/Bidang (Position)
- Periode KP (startDate - endDate)
- Status

**API Used:**
```typescript
import { getMyProfile, getMyInternship } from "~/feature/during-intern/services";

useEffect(() => {
  async function fetchStudentData() {
    const [profileResponse, internshipResponse] = await Promise.all([
      getMyProfile(),
      getMyInternship()
    ]);
    // Process responses
  }
  fetchStudentData();
}, []);
```

---

### Untuk Mentor Lapangan (Mentor View)

#### 3. Student Logbook Detail Page (`/mentor/logbook-detail/:studentId`)

**File**: `app/feature/field-mentor/pages/student-logbook-detail-page.tsx`

**Data yang ditampilkan:**
- Nama Mahasiswa
- NIM
- Program Studi
- Tempat KP
- Bagian/Bidang
- Email

**API Used:**
```typescript
import { getStudentById } from "~/feature/during-intern/services";

const response = await getStudentById(studentId);
```

---

## 🔧 API Data Structure

### Student Profile

```typescript
interface StudentProfile {
  id: string;
  userId: string;
  nim: string;              // NIM mahasiswa
  name: string;             // Nama lengkap
  email: string;            // Email
  phone?: string;           // No. Telepon (optional)
  prodi: string;            // Program Studi (e.g., "Teknik Informatika")
  fakultas?: string;        // Fakultas (e.g., "Fakultas Sains dan Teknologi")
  angkatan: string;         // Angkatan (e.g., "2020")
  semester: number;         // Semester saat ini
  ipk?: number;             // IPK (optional)
  address?: string;         // Alamat (optional)
  createdAt: string;        // ISO timestamp
  updatedAt: string;        // ISO timestamp
}
```

### Internship Data

```typescript
interface InternshipData {
  id: string;
  studentId: string;
  company: string;                    // Tempat KP (e.g., "PT. Tech Innovate Indonesia")
  position: string;                   // Bagian/Bidang (e.g., "Frontend Developer")
  mentorId?: string;                  // ID Mentor Lapangan
  mentorName?: string;                // Nama Mentor Lapangan
  dosenPembimbingId?: string;         // ID Dosen Pembimbing
  dosenPembimbingName?: string;       // Nama Dosen Pembimbing
  startDate: string;                  // Tanggal mulai (ISO format)
  endDate: string;                    // Tanggal selesai (ISO format)
  status: "PENDING" | "AKTIF" | "SELESAI" | "BATAL";
  progress: number;                   // Progress 0-100
  createdAt: string;                  // ISO timestamp
  updatedAt: string;                  // ISO timestamp
}
```

---

## 📝 Backend API Requirements

### Endpoints untuk Student Profile

#### 1. Get Current Student Profile
```
GET /api/mahasiswa/profile
Authorization: Bearer {jwt_token}

Response:
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "nim": "12250111001",
    "name": "Ahmad Fauzi",
    "email": "ahmad.fauzi@student.ac.id",
    "phone": "081234567890",
    "prodi": "Teknik Informatika",
    "fakultas": "Fakultas Sains dan Teknologi",
    "angkatan": "2022",
    "semester": 5,
    "ipk": 3.75,
    "address": "Jl. Contoh No. 123, Jakarta",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 2. Get Current Student's Internship
```
GET /api/mahasiswa/internship
Authorization: Bearer {jwt_token}

Response:
{
  "success": true,
  "message": "Internship data retrieved successfully",
  "data": {
    "id": "uuid",
    "studentId": "uuid",
    "company": "PT. Tech Innovate Indonesia",
    "position": "Frontend Developer",
    "mentorId": "uuid",
    "mentorName": "Budi Santoso",
    "dosenPembimbingId": "uuid",
    "dosenPembimbingName": "Dr. Siti Aminah, M.Kom",
    "startDate": "2024-01-15",
    "endDate": "2024-04-15",
    "status": "AKTIF",
    "progress": 45,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-21T08:00:00.000Z"
  }
}
```

#### 3. Get Student by ID (for Mentor/Dosen)
```
GET /api/mahasiswa/:studentId
Authorization: Bearer {jwt_token}

Response:
{
  "success": true,
  "message": "Student data retrieved successfully",
  "data": {
    "student": {
      "id": "uuid",
      "userId": "uuid",
      "nim": "12250111001",
      "name": "Ahmad Fauzi",
      "email": "ahmad.fauzi@student.ac.id",
      "phone": "081234567890",
      "prodi": "Teknik Informatika",
      "fakultas": "Fakultas Sains dan Teknologi",
      "angkatan": "2022",
      "semester": 5,
      "ipk": 3.75,
      "address": "Jl. Contoh No. 123, Jakarta",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "internship": {
      "id": "uuid",
      "studentId": "uuid",
      "company": "PT. Tech Innovate Indonesia",
      "position": "Frontend Developer",
      "mentorId": "uuid",
      "mentorName": "Budi Santoso",
      "startDate": "2024-01-15",
      "endDate": "2024-04-15",
      "status": "AKTIF",
      "progress": 45,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-21T08:00:00.000Z"
    }
  }
}
```

---

## 🎨 UI Components Used

### Card dengan Student Info

```tsx
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <User className="h-5 w-5" />
      Data Mahasiswa
    </CardTitle>
  </CardHeader>
  <CardContent>
    {isLoadingProfile ? (
      <div className="text-center py-4 text-muted-foreground">
        Memuat data mahasiswa...
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label className="text-muted-foreground">Nama</Label>
            <p className="font-medium">{studentProfile?.name || "-"}</p>
          </div>
          {/* More fields... */}
        </div>
        <div className="space-y-4">
          {/* More fields... */}
        </div>
      </div>
    )}
  </CardContent>
</Card>
```

### Icons Used

- `User` - untuk icon Data Mahasiswa
- `Building` - untuk Tempat KP
- `Calendar` - untuk Periode KP
- `GraduationCap` - untuk Program Studi (optional)

---

## 🔄 Data Flow

### Student Pages (Mahasiswa View)

```
1. Component mounts
2. useEffect triggered
3. Call getMyProfile() and getMyInternship() in parallel
4. Show loading state while fetching
5. Update state with fetched data
6. Display data in UI cards
7. Handle errors with toast notifications
```

### Mentor Pages (Mentor View)

```
1. Get studentId from URL params (useParams)
2. Call getStudentById(studentId)
3. Show loading state
4. Update state with student + internship data
5. Display in logbook detail page
6. Mentor can view and approve logbooks
```

---

## ⚠️ Important Notes

1. **Loading State**: Selalu tampilkan loading state saat fetch data
2. **Error Handling**: Gunakan toast untuk notifikasi error
3. **Fallback Data**: Gunakan "-" atau default value jika data null/undefined
4. **Date Formatting**: Format tanggal ke Indonesia locale
5. **Status Badge**: Gunakan color coding untuk status (green=AKTIF, gray=PENDING)
6. **Fakultas Default**: Jika fakultas null, gunakan "Fakultas Sains dan Teknologi"
7. **API Parallel**: Fetch profile dan internship secara parallel untuk performa

---

## 🚀 Implementation Checklist

- [x] Add `fakultas` field to StudentProfile interface
- [x] Update API services (student-api.ts)
- [x] Implement data fetching in during-intern-page.tsx
- [x] Implement data fetching in logbook-page.tsx
- [x] Add student info display to mentor logbook pages
- [x] Update Student type in field-mentor/types
- [x] Add loading states and error handling
- [x] Format dates to Indonesian locale
- [x] Add status badges with proper colors
- [ ] Backend API implementation
- [ ] End-to-end testing

---

## 📞 Support

Jika ada pertanyaan tentang integrasi data mahasiswa, hubungi tim development.
```

## document/TEMPLATE_MANAGEMENT_GUIDE.md

```markdown
# Quick Start Guide - Template Management

## Untuk Admin

### 1. Akses Halaman Template Management
- Login sebagai admin
- Klik menu **Template** di sidebar
- Pilih **Kelola Template**

### 2. Membuat Template Baru

#### Cara 1: Upload File Template
1. Klik tombol **"Tambah Template"**
2. Isi nama template (contoh: "Berita Acara Sidang KP 2025")
3. Pilih jenis template dari dropdown (contoh: "Berita Acara")
4. Pilih format file (HTML/DOCX/TXT)
5. Isi deskripsi (opsional)
6. Klik tombol **upload file** dan pilih file template Anda
7. Preview akan muncul otomatis
8. Klik **"Simpan Template"**

#### Cara 2: Ketik Langsung
1. Klik tombol **"Tambah Template"**
2. Isi form seperti di atas
3. Ketik atau paste konten template langsung ke textarea "Konten Template"
4. Klik **"Simpan Template"**

### 3. Edit Template dengan Code Editor
1. Pada tabel template, klik icon **⋮** (titik tiga) di kolom Aksi
2. Pilih **"Edit"**
3. Dialog dengan code editor akan muncul
4. Edit konten template menggunakan editor:
   - **Ctrl+F**: Find/Search
   - **Ctrl+H**: Find & Replace
   - **Ctrl+Z**: Undo
   - **Ctrl+Y**: Redo
5. Ubah nama, jenis, atau deskripsi jika perlu
6. Klik **"Simpan Perubahan"**

### 4. Kelola Template
- **Aktifkan/Nonaktifkan**: Klik ⋮ → "Nonaktifkan" (template nonaktif tidak akan muncul di pilihan)
- **Download**: Klik ⋮ → "Download" (download template ke komputer)
- **Hapus**: Klik ⋮ → "Hapus" (hapus permanen template)

### 5. Filter dan Cari Template
- **Search**: Ketik nama template di search box
- **Filter**: Pilih jenis template dari dropdown filter

## Template Variables

Gunakan syntax `{{nama_variabel}}` untuk membuat placeholder yang akan diisi otomatis.

### Contoh Template HTML:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Berita Acara Sidang</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
        }
        h1 { 
            text-align: center; 
            text-transform: uppercase;
        }
        .info { 
            margin: 20px 0; 
            line-height: 1.8;
        }
        .signatures {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
        }
    </style>
</head>
<body>
    <h1>Berita Acara Sidang Kerja Praktek</h1>
    
    <div class="info">
        <p>Pada hari ini, <strong>{{tanggal}}</strong>, telah dilaksanakan sidang kerja praktek dengan hasil sebagai berikut:</p>
        
        <table>
            <tr>
                <td>Nama Mahasiswa</td>
                <td>: {{nama_mahasiswa}}</td>
            </tr>
            <tr>
                <td>NIM</td>
                <td>: {{nim}}</td>
            </tr>
            <tr>
                <td>Program Studi</td>
                <td>: {{prodi}}</td>
            </tr>
            <tr>
                <td>Judul KP</td>
                <td>: {{judul}}</td>
            </tr>
            <tr>
                <td>Pembimbing</td>
                <td>: {{nama_pembimbing}}</td>
            </tr>
            <tr>
                <td>Penguji</td>
                <td>: {{nama_penguji}}</td>
            </tr>
            <tr>
                <td>Nilai Akhir</td>
                <td>: {{nilai}} ({{predikat}})</td>
            </tr>
        </table>
    </div>
    
    <div class="signatures">
        <div>
            <p>Pembimbing,</p>
            <br><br><br>
            <p>{{nama_pembimbing}}</p>
        </div>
        <div>
            <p>Penguji,</p>
            <br><br><br>
            <p>{{nama_penguji}}</p>
        </div>
    </div>
</body>
</html>
```

### Variabel yang Umum Digunakan:
- `{{tanggal}}` - Tanggal (akan diisi otomatis)
- `{{nama_mahasiswa}}` - Nama lengkap mahasiswa
- `{{nim}}` - NIM mahasiswa
- `{{prodi}}` - Program studi
- `{{judul}}` - Judul KP
- `{{nama_pembimbing}}` - Nama dosen pembimbing
- `{{nama_penguji}}` - Nama dosen penguji
- `{{nama_mentor}}` - Nama mentor lapangan
- `{{perusahaan}}` - Nama perusahaan
- `{{nilai}}` - Nilai akhir
- `{{predikat}}` - Predikat nilai (A/B/C/D)

## Tips

### 1. Konsistensi Penamaan Variabel
Gunakan format yang konsisten untuk variabel:
- Huruf kecil semua
- Pisahkan dengan underscore (_)
- Contoh: `nama_mahasiswa`, `tanggal_sidang`, `nilai_akhir`

### 2. Testing Template
Setelah membuat template:
1. Download template
2. Buka di browser/text editor
3. Manual replace variabel dengan data dummy
4. Pastikan format dan layout sudah benar

### 3. Backup Template
Selalu download backup template sebelum melakukan edit besar.

### 4. Dokumentasi Template
Isi deskripsi template dengan informasi:
- Untuk apa template ini digunakan
- Kapan template ini digunakan
- Variabel apa saja yang diperlukan

## Troubleshooting

### Template tidak muncul di dropdown
- Pastikan template statusnya "Aktif"
- Cek filter jenis template

### Variabel tidak ter-replace
- Pastikan format variabel benar: `{{nama}}` bukan `{nama}` atau `[[nama]]`
- Pastikan tidak ada spasi: `{{nama}}` bukan `{{ nama }}`

### Editor lambat
- Tutup dialog editor dan buka kembali
- Hindari template yang terlalu besar (> 10000 baris)

## Contoh Use Case

### Use Case 1: Generate Berita Acara Sidang
1. Admin membuat template "Berita Acara Sidang"
2. Mahasiswa selesai sidang, nilai sudah keluar
3. Admin/Dosen membuka halaman penilaian
4. Klik "Generate Berita Acara"
5. Sistem otomatis:
   - Load template "Berita Acara"
   - Ambil data mahasiswa (nama, nim, judul, nilai)
   - Replace variabel dengan data aktual
   - Generate file HTML/PDF
   - Download otomatis

### Use Case 2: Form Nilai untuk Mentor Lapangan
1. Admin membuat template "Form Penilaian Mentor"
2. Mentor lapangan login
3. Akses form penilaian mahasiswa
4. Sistem generate form dari template
5. Mentor isi nilai
6. Submit dan simpan ke database
7. Download form yang sudah terisi

## Best Practices

1. **Buat Template Modular**: Pisahkan template berdasarkan fungsi (berita acara, form nilai, dll)
2. **Versioning**: Tambahkan tahun di nama template (contoh: "Berita Acara 2025")
3. **Regular Review**: Review template setiap semester untuk update format/aturan baru
4. **User Friendly**: Buat nama variabel yang jelas dan mudah dipahami
5. **Consistent Styling**: Gunakan CSS yang konsisten untuk semua template

---

**Butuh bantuan?** Hubungi tim IT support.
```

## document/TESTING_NILAI_KP.md

```markdown
# Testing Nilai KP - Generate PDF

## Langkah-langkah Testing:

### 1. Simulasi Input Nilai dari Dosen

Buka **Browser Console** dan jalankan kode berikut untuk mensimulasikan dosen memberikan nilai:

```javascript
// Simulasi data nilai dari dosen
const nilaiData = {
  // Data Mahasiswa
  namaMahasiswa: "Rizki Maulana",
  nim: "1234567892",
  programStudi: "Teknik Informatika",
  tempatKP: "PT. Teknologi Nusantara",
  judulLaporan: "Sistem Informasi Manajemen Berbasis Web",
  waktuPelaksanaan: "Juli 2025 s.d. September 2025",
  dosenPembimbing: "Dr. Ahmad Santoso, M.Kom",
  pembimbingLapangan: "Budi Hartono, S.Kom",
  
  // Nilai
  kesesuaianLaporan: 90,
  penguasaanMateri: 90,
  analisisPerancangan: 90,
  sikapEtika: 90,
  
  // Data Dosen
  dosenPenguji: "Dr. Ahmad Santoso, M.Kom",
  nipDosen: "198501122010121001",
  eSignatureUrl: "", // Kosongkan dulu atau isi dengan URL e-signature
  tanggalPenilaian: new Date().toISOString(),
  
  // Student ID untuk tracking
  studentId: "1234567892",
};

// Simpan ke localStorage
localStorage.setItem('nilai-kp-1234567892', JSON.stringify(nilaiData));
localStorage.setItem('nilai-kp', JSON.stringify(nilaiData));

console.log("✅ Nilai berhasil disimpan!");
console.log("Refresh halaman untuk melihat nilai");
```

### 2. Refresh Halaman

Setelah menjalankan script di atas, **refresh halaman** (F5 atau Ctrl+R).

### 3. Cek Console untuk Debugging

Saat klik tombol "Cetak Form Nilai KP (PDF)", perhatikan console log:

```
=== DEBUGGING PDF GENERATION ===
Current nilaiKP state: {...}
Current mockMahasiswa: {...}
=== FORM DATA TO BE PRINTED ===
Printing form with data: {...}
Data validation:
- namaMahasiswa: Rizki Maulana
- nim: 1234567892
- kesesuaianLaporan: 90
...
```

### 4. Periksa Data

Pastikan semua field terisi dengan benar:
- ✅ Nama mahasiswa ada
- ✅ NIM ada  
- ✅ Nilai ada (bukan 0 atau undefined)
- ✅ Nama dosen ada
- ✅ NIP ada

### 5. Testing E-Signature (Opsional)

Untuk menambahkan e-signature dosen, gunakan base64 image:

```javascript
// Contoh menambahkan e-signature
const currentNilai = JSON.parse(localStorage.getItem('nilai-kp'));
currentNilai.eSignatureUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
localStorage.setItem('nilai-kp', JSON.stringify(currentNilai));
localStorage.setItem('nilai-kp-1234567892', JSON.stringify(currentNilai));
console.log("✅ E-signature ditambahkan");
```

## Troubleshooting

### PDF Kosong?

1. **Cek Console Log** - Lihat apa yang dicetak saat klik tombol
2. **Cek localStorage** - Jalankan di console:
   ```javascript
   console.log(JSON.parse(localStorage.getItem('nilai-kp')));
   ```
3. **Pastikan library html2pdf loaded** - Cek di Network tab

### Nilai tidak muncul?

1. Pastikan sudah refresh halaman setelah input nilai
2. Cek apakah card biru "Nilai KP Sudah Diberikan" muncul
3. Lihat console untuk error

## Reset Data

Jika perlu reset semua:

```javascript
localStorage.removeItem('nilai-kp');
localStorage.removeItem('nilai-kp-1234567892');
localStorage.removeItem('laporan-kp');
console.log("✅ Data direset");
location.reload();
```
```

