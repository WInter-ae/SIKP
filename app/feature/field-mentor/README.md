# Field Mentor (Pembimbing Lapangan) - Components & Services

## 📁 Struktur Folder

```
field-mentor/
├── components/
│   ├── approve-logbook-button.tsx       ✅ Button approve logbook
│   ├── approve-logbook-button.example.tsx
│   ├── reject-logbook-button.tsx        ✅ NEW! Button reject logbook
│   ├── reject-logbook-button.example.tsx
│   └── signature-setup.tsx              ✅ Setup paraf digital
├── pages/
│   ├── field-mentor-page.tsx            ✅ Dashboard mentor
│   ├── mentor-logbook-page.tsx          ✅ List all logbooks
│   └── student-logbook-detail-page.tsx  ✅ Detail logbook per mahasiswa
├── services/
│   ├── mentor-api.ts                    ✅ API functions
│   └── index.ts
├── types/
│   ├── index.d.ts
│   └── logbook.d.ts
└── index.ts                             ✅ Exports
```

---

## 🎯 Fitur Utama

### 1. **Approve Logbook** ✅
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

### 2. **Reject Logbook** ✅ NEW!
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

## 💡 Cara Pakai

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
            <Badge className="bg-green-500">✅ Disetujui</Badge>
          )}
          
          {log.status === "REJECTED" && (
            <div>
              <Badge variant="destructive">❌ Ditolak</Badge>
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

## 🔗 Relasi dengan Mahasiswa

### Foreign Key Relationship

```
┌──────────────┐       mentorId        ┌──────────┐
│  Internships │─────────────────────>│ Mentors  │
└──────────────┘                       └──────────┘
       │
       │ studentId
       ▼
┌──────────────┐
│  Students    │
└──────────────┘
       │
       │ id
       ▼
┌──────────────┐
│  Logbooks    │
└──────────────┘
```

**Dari API:**
- Mentor → Mahasiswa: `GET /api/mentor/mentees`
- Mahasiswa → Mentor: `GET /api/mahasiswa/internship` (includes mentor data)
- Logbook: `GET /api/mentor/logbook/:studentId`

---

## 📊 Status Logbook

| Status    | Deskripsi | Actions Available |
|-----------|-----------|-------------------|
| `PENDING` | Menunggu approval | Approve, Reject |
| `APPROVED` | Disetujui mentor | View only |
| `REJECTED` | Ditolak dengan catatan | Mahasiswa harus edit & resubmit |

---

## 🎨 UI Components

### ApproveLogbookButton
- ✅ Dialog konfirmasi dengan info logbook
- ✅ Optional notes untuk mahasiswa
- ✅ Auto-signature dari mentor profile
- ✅ Toast notification
- ✅ Callback onSuccess

### RejectLogbookButton ⭐ NEW
- ✅ Dialog konfirmasi dengan warning
- ✅ **Required** rejection note (textarea)
- ✅ Character counter (max 500)
- ✅ Alert untuk inform mahasiswa
- ✅ Toast notification
- ✅ Callback onSuccess

---

## 🚀 Next Steps

1. **Testing**: Test dengan backend running
2. **Integration**: Gunakan di halaman mentor
3. **UI/UX**: Customize styling sesuai kebutuhan
4. **Notification**: Tambahkan email/notif untuk mahasiswa (future)

---

**Last Updated:** February 12, 2026
**Status:** ✅ Ready to Use
