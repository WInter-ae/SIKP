# Update: Simplified Revision Workflow - Single Document (Laporan KP PDF Only)

## 📋 Overview

Workflow revisi telah disederhanakan fokus hanya pada **Laporan KP (PDF)**. Dosen sekarang memiliki pilihan yang lebih jelas di awal: apakah dokumen perlu revisi atau tidak.

## 🎯 Perubahan Utama

### Sebelumnya (v1.0)
- Multiple documents (Laporan KP + Slide Presentasi)
- Toggle "Tidak Ada Revisi Diperlukan"
- Tab system: Menunggu / Disetujui / Ditolak
- Approve/Reject per dokumen

### Sekarang (v2.0) ⭐
- **Single document**: Hanya Laporan KP (PDF)
- **Decision-based workflow**: Pilih di awal "Perlu Revisi" atau "Tidak Perlu Revisi"
- **Direct messaging**: Dosen bisa kirim pesan revisi langsung
- **History tracking**: Lihat riwayat revisi sebelumnya
- **Simpler UI**: Lebih fokus dan tidak membingungkan

## 🔄 New Workflow

### Stage 1: Undecided (Pilih Keputusan)
```
┌─────────────────────────────────────────┐
│  📄 Laporan KP Mahasiswa                │
│  - File: Laporan_KP_RizkiMaulana.pdf   │
│  - Size: 2.5 MB                        │
│  - Version: 3                          │
│  - Uploaded: 10 Jan 2026 14:30        │
│                                         │
│  [👁 Lihat]  [⬇ Unduh]                │
│                                         │
│  📜 Riwayat Revisi (jika ada)          │
│                                         │
│  ┌─────────────┐   ┌─────────────┐    │
│  │ ❌ Perlu   │   │ ✅ Tidak   │    │
│  │  Revisi    │   │  Perlu      │    │
│  └─────────────┘   │  Revisi     │    │
│                     └─────────────┘    │
└─────────────────────────────────────────┘
```

### Stage 2A: Needs Revision (Perlu Revisi)
```
┌─────────────────────────────────────────┐
│  ⚠️ Dokumen Memerlukan Revisi           │
│                                         │
│  📄 Laporan KP                         │
│  [👁 Lihat]  [⬇ Unduh]                │
│                                         │
│  ✏️ Pesan Revisi *                     │
│  ┌─────────────────────────────────┐  │
│  │ Jelaskan detail bagian yang     │  │
│  │ perlu diperbaiki...              │  │
│  │                                  │  │
│  └─────────────────────────────────┘  │
│                                         │
│  [📤 Kirim Pesan Revisi]               │
│                                         │
│  📜 Riwayat Revisi Sebelumnya          │
│  - Versi 1: "Format penulisan..."     │
│  - Versi 2: "Daftar pustaka..."       │
└─────────────────────────────────────────┘
```

### Stage 2B: No Revision (Tidak Perlu Revisi)
```
┌─────────────────────────────────────────┐
│  ✅ Dokumen Disetujui                   │
│                                         │
│  📄 Laporan KP [✅ Disetujui]          │
│  [👁 Lihat]  [⬇ Unduh]                │
│                                         │
│  [Ubah Keputusan]                      │
│                                         │
│  → Tab Penilaian otomatis terbuka      │
└─────────────────────────────────────────┘
```

## 💻 Code Changes

### 1. RevisionReviewSection Component

#### Props Interface (Simplified)
```typescript
interface RevisionReviewSectionProps {
  studentId: string;
  onAllRevisionsApproved: (approved: boolean) => void;
  // Removed: noRevisionNeeded, onNoRevisionChange
}
```

#### New State
```typescript
type RevisionDecision = "undecided" | "needs-revision" | "no-revision";

interface LaporanRevision {
  fileName: string;
  fileSize: string;
  submittedAt: string;
  version: number;
  revisionMessage?: string;
  revisionHistory: Array<{
    version: number;
    message: string;
    submittedAt: string;
    status: "pending" | "revised";
  }>;
}

const [decision, setDecision] = useState<RevisionDecision>("undecided");
const [revisionMessage, setRevisionMessage] = useState("");
const [laporan, setLaporan] = useState<LaporanRevision>({...});
```

#### New Handlers
```typescript
const handleDecideNeedsRevision = () => {
  setDecision("needs-revision");
};

const handleDecideNoRevision = () => {
  if (confirm("Apakah Anda yakin dokumen sudah sempurna?")) {
    setDecision("no-revision");
  }
};

const handleSendRevisionMessage = async () => {
  if (!revisionMessage.trim()) {
    alert("Mohon tulis pesan revisi");
    return;
  }
  
  // Add to history
  setLaporan(prev => ({
    ...prev,
    revisionHistory: [...prev.revisionHistory, {
      version: prev.version,
      message: revisionMessage,
      submittedAt: new Date().toISOString(),
      status: "pending",
    }]
  }));
  
  alert("Pesan revisi berhasil dikirim");
  setRevisionMessage("");
};

const handleResetDecision = () => {
  setDecision("undecided");
  setRevisionMessage("");
};
```

### 2. GiveGradePage Updates

#### Removed State
```typescript
// ❌ Removed
const [noRevisionNeeded, setNoRevisionNeeded] = useState(false);
const handleNoRevisionChange = (noRevision: boolean) => {...};
```

#### Simplified Alert
```typescript
// Before: 2 different alerts
{allRevisionsApproved && !noRevisionNeeded && <Alert>...}
{noRevisionNeeded && <Alert>...}

// After: 1 unified alert
{allRevisionsApproved && (
  <Alert>Dokumen disetujui. Anda dapat memberikan penilaian.</Alert>
)}
```

## 🎨 UI Components

### Decision Buttons (Stage 1)
```tsx
<div className="grid grid-cols-2 gap-4">
  {/* Perlu Revisi Button */}
  <Button
    onClick={handleDecideNeedsRevision}
    className="border-2 hover:border-orange-500"
  >
    <XCircle className="text-orange-600" />
    <span>Perlu Revisi</span>
    <span className="text-xs">Dokumen perlu diperbaiki</span>
  </Button>

  {/* Tidak Perlu Revisi Button */}
  <Button
    onClick={handleDecideNoRevision}
    className="border-2 hover:border-green-500"
  >
    <CheckCircle className="text-green-600" />
    <span>Tidak Perlu Revisi</span>
    <span className="text-xs">Dokumen sudah sempurna</span>
  </Button>
</div>
```

### Revision Message Form (Stage 2A)
```tsx
<div className="space-y-3">
  <Label>
    Pesan Revisi <span className="text-red-500">*</span>
  </Label>
  <Textarea
    value={revisionMessage}
    onChange={(e) => setRevisionMessage(e.target.value)}
    placeholder="Jelaskan secara detail bagian mana yang perlu diperbaiki..."
    className="min-h-[150px]"
  />
  <Button onClick={handleSendRevisionMessage}>
    <Send className="h-4 w-4" />
    Kirim Pesan Revisi
  </Button>
</div>
```

### Revision History Display
```tsx
<Card className="bg-gray-50">
  <CardHeader>
    <h4>Riwayat Revisi</h4>
  </CardHeader>
  <CardContent>
    {laporan.revisionHistory.map((history, index) => (
      <div key={index} className="bg-white rounded-lg p-3">
        <Badge>Versi {history.version}</Badge>
        <span>{formatDate(history.submittedAt)}</span>
        <p>{history.message}</p>
      </div>
    ))}
  </CardContent>
</Card>
```

## 📊 Data Structure

### Before (Multiple Documents)
```typescript
interface Revision {
  id: string;
  type: "Laporan KP" | "Slide Presentasi";
  fileName: string;
  status: "pending" | "approved" | "rejected";
  rejectReason?: string;
}

const revisions: Revision[] = [
  { id: "rev-1", type: "Laporan KP", ... },
  { id: "rev-2", type: "Slide Presentasi", ... }
];
```

### After (Single Document with History)
```typescript
interface LaporanRevision {
  fileName: string;
  fileSize: string;
  submittedAt: string;
  version: number;
  revisionMessage?: string;
  revisionHistory: Array<{
    version: number;
    message: string;
    submittedAt: string;
    status: "pending" | "revised";
  }>;
}

const laporan: LaporanRevision = {
  fileName: "Laporan_KP_RizkiMaulana_Final.pdf",
  version: 3,
  revisionHistory: [
    { version: 1, message: "Format penulisan...", status: "revised" },
    { version: 2, message: "Daftar pustaka...", status: "revised" }
  ]
};
```

## 🔌 API Integration

### Required Endpoints

```typescript
// Get laporan revision info
GET /api/students/:id/laporan-revision
Response: LaporanRevision

// Decide: No revision needed
POST /api/students/:id/revision/approve
Response: { success: boolean }

// Decide: Needs revision (send message)
POST /api/students/:id/revision/request
Body: { message: string }
Response: { success: boolean }

// Student uploads revised document (mahasiswa side)
POST /api/students/:id/laporan/upload
Body: FormData (file)
Response: { version: number, uploadedAt: string }
```

### Implementation Example

```typescript
// Send revision request
const handleSendRevisionMessage = async () => {
  try {
    const response = await fetch(`/api/students/${studentId}/revision/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: revisionMessage })
    });
    
    if (response.ok) {
      const data = await response.json();
      setLaporan(prev => ({
        ...prev,
        revisionHistory: [...prev.revisionHistory, data.revision]
      }));
      toast.success('Pesan revisi berhasil dikirim ke mahasiswa');
      setRevisionMessage("");
    }
  } catch (error) {
    toast.error('Gagal mengirim pesan revisi');
  }
};

// Approve without revision
const handleDecideNoRevision = async () => {
  if (!confirm("Yakin dokumen sudah sempurna?")) return;
  
  try {
    const response = await fetch(`/api/students/${studentId}/revision/approve`, {
      method: 'POST'
    });
    
    if (response.ok) {
      setDecision("no-revision");
      toast.success('Dokumen disetujui');
    }
  } catch (error) {
    toast.error('Gagal menyetujui dokumen');
  }
};
```

## ✅ Benefits

### For Dosen
- ✅ **Clearer decision making**: Pilih di awal, tidak bingung
- ✅ **Single focus**: Hanya review 1 dokumen (Laporan KP)
- ✅ **Direct communication**: Kirim pesan revisi langsung
- ✅ **View history**: Lihat semua revisi sebelumnya
- ✅ **Less clicks**: Workflow lebih cepat

### For Mahasiswa
- ✅ **Clear feedback**: Tahu persis apa yang harus diperbaiki
- ✅ **History tracking**: Bisa lihat progress revisi
- ✅ **Focused**: Hanya fokus perbaiki Laporan KP
- ✅ **Transparent**: Status jelas di setiap tahap

### For System
- ✅ **Simpler logic**: Tidak perlu handle multiple documents
- ✅ **Better UX**: Less complex, more intuitive
- ✅ **Easier to maintain**: Single document flow
- ✅ **Scalable**: Easy to extend with new features

## 🎯 User Journey

### Scenario 1: Document Perfect (No Revision)
```
1. Dosen opens grading page
2. Sees laporan info + decision buttons
3. Clicks "Tidak Perlu Revisi" ✅
4. Confirms decision
5. Tab Penilaian auto-opens
6. Fills grading form
7. Submits grade ✅
```

### Scenario 2: Document Needs Revision
```
1. Dosen opens grading page
2. Sees laporan info + decision buttons
3. Can view/download PDF first
4. Clicks "Perlu Revisi" ❌
5. Writes detailed revision message
6. Clicks "Kirim Pesan Revisi"
7. Message sent to student
--- Student revises and re-uploads ---
8. Dosen reviews again
9. If OK → Clicks "Tidak Perlu Revisi" ✅
10. Tab Penilaian opens
11. Submits grade ✅
```

## 📝 Testing Checklist

- [x] Stage 1: Undecided shows decision buttons
- [x] Stage 2A: Needs revision shows message form
- [x] Stage 2B: No revision unlocks grading tab
- [x] Can view/download PDF at any stage
- [x] Revision history displays correctly
- [x] "Ubah Keputusan" button resets to undecided
- [x] Validation for empty revision message
- [x] Parent callback triggered correctly
- [x] Tab auto-switches when no revision

## 🔄 Migration Notes

If upgrading from v1.0:

1. **Database**: Update schema to single document model
2. **API**: Implement new endpoints
3. **Frontend**: Components already updated
4. **Data Migration**: Convert multi-doc revisions to single doc with history

## 📚 Related Files

- [revision-review-section.tsx](c:\laragon\www\SIKP\app\feature\dosen-grading\components\revision-review-section.tsx) - Main component ⭐ UPDATED
- [give-grade-page.tsx](c:\laragon\www\SIKP\app\feature\dosen-grading\pages\give-grade-page.tsx) - Parent page ⭐ UPDATED
- [README.md](c:\laragon\www\SIKP\app\feature\dosen-grading\README.md) - Main documentation

---

**Last Updated**: January 17, 2026
**Version**: 2.0 - Simplified Single Document Workflow
