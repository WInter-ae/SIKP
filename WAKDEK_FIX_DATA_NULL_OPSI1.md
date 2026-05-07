# 📋 Dokumentasi: Fix Data Null Wakil Dekan - Surat Pengantar (Opsi 1)

**Status**: In Progress  
**Target Date**: May 1, 2026  
**Assigned to**: Backend Dev + Frontend Dev

---

## 📌 Executive Summary

### Masalah
- ✅ Endpoint `/api/dosen/surat-pengantar/requests` berhasil (tidak ada 403)
- ❌ Data supervisor dan team members masih `null` di dialog preview
- ❌ Label "Dosen Pembimbing Kerja Praktik: -" menampilkan kosong

### Solusi Dipilih: **Opsi 1 - Backend Endpoint Baru dengan JOIN Team Data**
- Backend update endpoint untuk langsung include supervisor & team members
- Frontend update logic untuk extract data dari response item (bukan fetch detail submission lagi)
- Result: No more 403, data lengkap, performance lebih baik

### Timeline
- **Backend**: 30-45 menit
- **Frontend**: 20-30 menit  
- **Testing**: 15-20 menit
- **Total**: ~90 menit

---

## 🔍 Root Cause Analysis

### Current Flow (Problematic)

```
User (Wakdek) → GET /api/dosen/surat-pengantar/requests
                    ↓
                Response: [{ id, nim, namaMahasiswa, submissionId, ... }]
                    ↓
                [PATCH FIX 403] if (!isWakdek && items.length > 0)
                    ↓
                Wakdek: Skip fetch detail submission
                    ↓
                teamInfoBySubmissionId map stays EMPTY
                    ↓
                Dialog preview: supervisor = null, members = null ❌
```

### Why Data is Null

**File**: `app/feature/submission/pages/submission-dosen-page.tsx` (Line ~457-480)

```typescript
// Patch untuk fix 403:
if (!isWakdek && response.data && response.data.length > 0) {
  const detailResponses = await Promise.all(
    response.data.map(async (item) => ({
      submissionId: item.submissionId || item.id,
      detailResponse: await getSubmissionDetailForVerifier(
        item.submissionId || item.id,  // 403 FORBIDDEN untuk wakdek
      ),
    })),
  );

  detailResponses.forEach(({ submissionId, detailResponse }) => {
    if (!detailResponse.success || !detailResponse.data) {
      return;
    }
    const teamInfo = extractTeamInfoFromSubmission(detailResponse.data);
    if (teamInfo) {
      teamInfoBySubmissionId.set(submissionId, teamInfo); // ← TIDAK PERNAH DISET untuk wakdek
    }
  });
}

// Later saat render:
const teamInfo = teamInfoBySubmissionId.get(item.submissionId || item.id); // ← undefined untuk wakdek
```

---

## 🛠️ Implementation Guide

### Phase 1: Backend Update

#### 1.1 Identify Endpoint File

**Find**: File yang handle `GET /api/dosen/surat-pengantar/requests`

Biasanya:
- `src/controllers/surat-pengantar.controller.ts` atau
- `src/routes/surat-pengantar.route.ts` atau
- `src/services/surat-pengantar.service.ts`

#### 1.2 Update Query dengan JOIN Team Data

**Current Query** (assumed):
```sql
SELECT sp.* FROM surat_pengantar sp
WHERE sp.status = 'PENDING_REVIEW'
ORDER BY sp.created_at DESC;
```

**New Query** (dengan team detail):
```sql
SELECT 
  sp.*,
  s.academic_supervisor,
  COALESCE(
    json_agg(
      json_build_object(
        'id', u.id,
        'name', u.name,
        'nim', u.nim,
        'prodi', u.prodi,
        'role', tm.role
      ) ORDER BY CASE WHEN tm.role = 'KETUA' THEN 0 ELSE 1 END
    ) FILTER (WHERE u.id IS NOT NULL),
    '[]'::json
  ) as team_members
FROM surat_pengantar sp
JOIN submissions s ON sp.submission_id = s.id
LEFT JOIN teams t ON s.team_id = t.id
LEFT JOIN team_members tm ON t.id = tm.team_id AND tm.status = 'ACCEPTED'
LEFT JOIN users u ON tm.user_id = u.id
WHERE sp.status = 'PENDING_REVIEW'  -- atau status yang sesuai
GROUP BY sp.id, s.id
ORDER BY sp.created_at DESC;
```

**Key Points:**
- `academic_supervisor` dari submissions table
- `team_members` as JSON array dengan user details
- `COALESCE` untuk handle kosong jadi empty array (bukan null)
- `FILTER (WHERE u.id IS NOT NULL)` untuk exclude null entries
- `ORDER BY CASE` untuk urut Ketua di depan

#### 1.3 Update Response Type

**File**: `src/types/surat-pengantar.types.ts` (atau sejenis)

```typescript
// BEFORE
export interface DosenSuratPengantarRequest {
  id: string;
  submissionId: string;
  nim?: string;
  namaMahasiswa?: string;
  // ... other fields
}

// AFTER
export interface TeamMemberDetail {
  id: string;
  name: string;
  nim: string;
  prodi: string;
  role: 'KETUA' | 'ANGGOTA' | string;
}

export interface DosenSuratPengantarRequest {
  id: string;
  submissionId: string;
  nim?: string;
  namaMahasiswa?: string;
  academic_supervisor?: string;        // ← NEW
  team_members?: TeamMemberDetail[];     // ← NEW
  // ... other fields
}
```

#### 1.4 Update Controller

**File**: Controller yang handle endpoint

```typescript
// BEFORE
async getWakdekRequests(req, res) {
  const response = await db.query(`SELECT sp.* FROM surat_pengantar sp ...`);
  return res.json({ success: true, data: response.rows });
}

// AFTER
async getWakdekRequests(req, res) {
  // Query dengan JOIN (dari step 1.2)
  const response = await db.query(`
    SELECT sp.*, s.academic_supervisor, json_agg(...team_members...) as team_members
    FROM surat_pengantar sp
    JOIN submissions s ON sp.submission_id = s.id
    LEFT JOIN teams t ON s.team_id = t.id
    LEFT JOIN team_members tm ON t.id = tm.team_id
    LEFT JOIN users u ON tm.user_id = u.id
    WHERE sp.status = 'PENDING_REVIEW'
    GROUP BY sp.id, s.id
    ORDER BY sp.created_at DESC
  `);
  
  return res.json({ 
    success: true, 
    data: response.rows.map(row => ({
      ...row,
      team_members: row.team_members || [],
      // Sanitize jika perlu
    }))
  });
}
```

#### 1.5 Test Backend Endpoint

**Menggunakan Postman / curl:**

```bash
curl -X GET http://localhost:3000/api/dosen/surat-pengantar/requests \
  -H "Authorization: Bearer <wakdek_token>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "req-123",
      "submissionId": "sub-456",
      "nim": "09010182327064",
      "namaMahasiswa": "Mahasiswa 1",
      "academic_supervisor": "Dr. Ahmad Santoso, M.Kom",
      "team_members": [
        {
          "id": "user-1",
          "name": "Mahasiswa 1",
          "nim": "09010182327064",
          "prodi": "Teknik Informatika",
          "role": "KETUA"
        },
        {
          "id": "user-2",
          "name": "Mahasiswa 2",
          "nim": "09010182327065",
          "prodi": "Teknik Informatika",
          "role": "ANGGOTA"
        }
      ],
      "status": "PENDING_REVIEW",
      "createdAt": "2026-05-01T10:00:00Z"
    }
  ]
}
```

---

### Phase 2: Frontend Update

#### 2.1 Update Type Definition

**File**: `app/lib/services/surat-pengantar-dosen.service.ts`

```typescript
// BEFORE
export interface DosenSuratPengantarRequestItem {
  id: string;
  requestId: string;
  submissionId: string;
  nim?: string | null;
  namaMahasiswa?: string | null;
  // ... other fields
}

// AFTER
export interface TeamMemberFromRequest {
  id: string;
  name: string;
  nim: string;
  prodi: string;
  role: string;
}

export interface DosenSuratPengantarRequestItem {
  id: string;
  requestId: string;
  submissionId: string;
  nim?: string | null;
  namaMahasiswa?: string | null;
  academic_supervisor?: string;           // ← NEW
  team_members?: TeamMemberFromRequest[];  // ← NEW
  // ... other fields
}
```

#### 2.2 Remove 403 Patch Logic

**File**: `app/feature/submission/pages/submission-dosen-page.tsx`

**Locate**: Line ~457-480 (bagian `if (!isWakdek && response.data...)`)

**BEFORE:**
```typescript
if (!isWakdek && response.data && response.data.length > 0) {
  const detailResponses = await Promise.all(
    response.data.map(async (item) => ({
      submissionId: item.submissionId || item.id,
      detailResponse: await getSubmissionDetailForVerifier(
        item.submissionId || item.id,
      ),
    })),
  );

  detailResponses.forEach(({ submissionId, detailResponse }) => {
    if (!detailResponse.success || !detailResponse.data) {
      return;
    }

    const teamInfo = extractTeamInfoFromSubmission(detailResponse.data);
    if (teamInfo) {
      teamInfoBySubmissionId.set(submissionId, teamInfo);
    }

    const extracted = extractMahasiswaDetailFromSubmission(
      detailResponse.data,
    );
    if (!extracted) return;

    addMahasiswaDetailIndex(detailByNim, detailByName, extracted);
  });
}
```

**AFTER:**
```typescript
// NO LONGER NEEDED - Data sudah include di request item
// if (!isWakdek && response.data...) block dihapus
```

#### 2.3 Add New Helper Function

**File**: `app/feature/submission/pages/submission-dosen-page.tsx`

**Add ke dalam file**, sebelum function `SubmissionDosenPage`:

```typescript
function extractTeamInfoFromRequestItem(
  item: DosenSuratPengantarRequestItem,
): SubmissionTeamInfo | null {
  if (!item.team_members || item.team_members.length === 0) {
    return null;
  }

  const mappedMembers: TeamMemberCard[] = item.team_members
    .map((member) => ({
      id: member.id,
      name: member.name,
      nim: member.nim || undefined,
      prodi: member.prodi || undefined,
      role: member.role === "KETUA" ? "Ketua" : "Anggota",
    }))
    .sort((a, b) => {
      if (a.role === "Ketua") return -1;
      if (b.role === "Ketua") return 1;
      return 0;
    });

  const leader = item.team_members.find((m) => m.role === "KETUA") || 
                 item.team_members[0];

  return {
    members: mappedMembers,
    supervisor: item.academic_supervisor,
    leader: leader
      ? {
          nim: leader.nim || undefined,
          name: leader.name || undefined,
          prodi: leader.prodi || undefined,
          email: undefined, // Not available from request item
          angkatan: undefined,
          semester: undefined,
        }
      : undefined,
  };
}
```

#### 2.4 Update loadRequests Logic

**File**: `app/feature/submission/pages/submission-dosen-page.tsx`

**Locate**: Function `loadRequests`, bagian mapping entries

**BEFORE:**
```typescript
const teamInfo = teamInfoBySubmissionId.get(
  item.submissionId || item.id,
);
```

**AFTER:**
```typescript
// Try get from map dulu (untuk backward compat dosen biasa)
let teamInfo = teamInfoBySubmissionId.get(
  item.submissionId || item.id,
);

// Kalau tidak ada di map, extract dari request item (untuk wakdek)
if (!teamInfo && isWakdek) {
  teamInfo = extractTeamInfoFromRequestItem(item);
}
```

#### 2.5 Full loadRequests Context

```typescript
const loadRequests = async () => {
  try {
    setIsLoading(true);

    const [response, profileResponse] = await Promise.all([
      getDosenSuratPengantarRequests(),
      getMyProfile(),
    ]);

    if (!response.success) {
      console.warn("⚠️ Gagal memuat surat pengantar:", response.message);
      toast.error("Gagal memuat data verifikasi surat.");
      setEntries([]);
      return;
    }

    // ... existing code ...

    const isWakdek = profileResponse.success
      ? isWakilDekanJabatan(profileResponse.data?.jabatanStruktural)
      : false;

    // ← REMOVED: if (!isWakdek && response.data.length > 0) { ... fetch detail ... }

    const suratPengantarEntries =
      response.success && response.data
        ? response.data
            .filter((item) => isAdminApprovedForDosenQueue(item))
            .map((item) => {
              const detail = getMahasiswaDetail(
                detailByNim,
                detailByName,
                item,
              );

              // NEW: Extract team dari request item (atau map kalau ada)
              let teamInfo = teamInfoBySubmissionId.get(
                item.submissionId || item.id,
              );
              if (!teamInfo && isWakdek) {
                teamInfo = extractTeamInfoFromRequestItem(item);
              }

              return {
                id: item.id,
                tanggal: formatTanggalForTable(
                  item.tanggal || item.createdAt,
                ),
                nim: item.nim || "-",
                namaMahasiswa: item.namaMahasiswa || "-",
                programStudi: detail.programStudi || item.programStudi || "-",
                angkatan: detail.angkatan || undefined,
                semester: detail.semester || undefined,
                email: detail.email || undefined,
                jenisSurat: item.jenisSurat || "Surat Pengantar",
                status: normalizeStatus(item.status || "menunggu"),
                supervisor: teamInfo?.supervisor,
                teamMembers: teamInfo?.members,
                mahasiswaEsignatureUrl: resolveMahasiswaSignatureUrl(
                  item as unknown as Record<string, unknown>,
                ),
                signedFileUrl: resolveSuratPengantarSignedFileUrl(item),
                approvedAt: item.approvedAt || item.approved_at,
                namaPerusahaan: item.companyName,
                tujuanSurat: resolveSuratPengantarTujuan(item),
                alamatPerusahaan: item.companyAddress,
                teleponPerusahaan: undefined,
                jenisProdukUsaha: undefined,
                divisi: item.division,
                tanggalMulai: item.startDate,
                tanggalSelesai: item.endDate,
                jumlahSks: undefined,
                tahunAjaran: undefined,
                dosenNama: dosenNama || "-",
                dosenNip: dosenNip || "-",
                dosenJabatan: dosenJabatan || "Wakil Dekan Bidang Akademik",
                dosenEsignatureUrl,
                nomorSurat: item.nomorSurat || item.letterNumber,
              };
            })
        : [];

    setEntries(suratPengantarEntries);
  } catch (error) {
    console.error("❌ Error loading surat verification data:", error);
    toast.error("Terjadi kesalahan saat memuat data verifikasi surat.");
  } finally {
    setIsLoading(false);
  }
};
```

---

### Phase 3: Testing

#### 3.1 Unit Test Backend

**Test File**: `src/__tests__/surat-pengantar.test.ts`

```typescript
describe('GET /api/dosen/surat-pengantar/requests', () => {
  it('should return requests with team members for wakdek', async () => {
    const res = await request(app)
      .get('/api/dosen/surat-pengantar/requests')
      .set('Authorization', `Bearer ${wakdekToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data[0]).toHaveProperty('academic_supervisor');
    expect(res.body.data[0]).toHaveProperty('team_members');
    expect(Array.isArray(res.body.data[0].team_members)).toBe(true);
  });

  it('team_members should include id, name, nim, prodi, role', async () => {
    const res = await request(app)
      .get('/api/dosen/surat-pengantar/requests')
      .set('Authorization', `Bearer ${wakdekToken}`);

    const teamMember = res.body.data[0].team_members[0];
    expect(teamMember).toHaveProperty('id');
    expect(teamMember).toHaveProperty('name');
    expect(teamMember).toHaveProperty('nim');
    expect(teamMember).toHaveProperty('prodi');
    expect(teamMember).toHaveProperty('role');
  });
});
```

#### 3.2 Manual E2E Test

**Steps:**

1. **Backend Running**: Pastikan backend sudah updated & running
   ```bash
   npm run dev  # atau sesuai start script
   ```

2. **Frontend Rebuild**: Rebuild frontend dengan type definitions baru
   ```bash
   npm run build  # atau dev server
   ```

3. **Login sebagai Wakdek**:
   - Buka browser
   - Login ke SIKP dengan akun Wakdek

4. **Navigate ke `/dosen/kp/surat-pengantar`**

5. **Verify Tabel**:
   - ✅ Surat pengantar items tampil
   - ✅ Tidak ada 403 error di console
   - ✅ Tidak ada "Memuat data..." loading yang lama

6. **Klik "Review" pada satu item**:

7. **Verify Dialog Preview**:
   - ✅ Judul: "Verifikasi Surat"
   - ✅ Section "Informasi Tim Kerja Praktik"
   - ✅ "Dosen Pembimbing Kerja Praktik: [Nama Dosen]" (TIDAK `-`)
   - ✅ Team members card tampil dengan nama anggota
   - ✅ Ketua di depan, anggota di belakang
   - ✅ Tombol "Review" / "Setujui" / "Tolak" aktif

8. **Try Approve/Reject**:
   - ✅ Dialog menutup
   - ✅ Status berubah di tabel
   - ✅ Toast notification muncul

9. **Check DevTools Console**:
   - ✅ Tidak ada error atau warning baru
   - ✅ Network tab: request ke `/api/dosen/surat-pengantar/requests` return 200
   - ✅ Response include `academic_supervisor` dan `team_members`

#### 3.3 Edge Cases

| Case | Expected Result |
|------|-----------------|
| Request tanpa team_members | Dialog tampil tapi team section kosong (graceful) |
| Request dengan multiple team members | Semua anggota tampil, Ketua di depan |
| academic_supervisor null/empty | Display "-" di preview |
| Wakdek yang bukan WAKIL_DEKAN role | Fallback ke dosen biasa flow |

---

## 📊 Checklist Implementasi

### Backend
- [ ] Identify endpoint file location
- [ ] Update SQL query dengan JOIN team data
- [ ] Update type/interface definitions
- [ ] Update controller response
- [ ] Test dengan Postman/curl
- [ ] Verify response structure
- [ ] DB migration (jika diperlukan)
- [ ] Deploy ke testing environment

### Frontend
- [ ] Update `DosenSuratPengantarRequestItem` type
- [ ] Remove `if (!isWakdek &&...)` patch logic
- [ ] Add `extractTeamInfoFromRequestItem()` function
- [ ] Update `loadRequests` mapping logic
- [ ] Update type imports (jika perlu)
- [ ] Run build check (no TS errors)
- [ ] Test di browser
- [ ] Test approve/reject flow

### Testing
- [ ] Unit test backend endpoint
- [ ] E2E test manual sebagai Wakdek
- [ ] E2E test manual sebagai Dosen biasa (backward compat)
- [ ] Check DevTools console (no errors)
- [ ] Check Network tab (correct response)
- [ ] Test edge cases
- [ ] Performance check (load time)

---

## 🚨 Potential Issues & Troubleshooting

### Issue 1: Still Getting Null Data
**Symptoms**: Dialog masih menampilkan supervisor "-"

**Checklist**:
- [ ] Backend query sudah updated dan deployed?
- [ ] Frontend sudah di-rebuild setelah backend change?
- [ ] DevTools Network: Response include `academic_supervisor` dan `team_members`?
- [ ] Type `DosenSuratPengantarRequestItem` include field baru?

**Fix**:
```bash
# Hard refresh frontend
Ctrl+Shift+R (atau Cmd+Shift+R di Mac)

# atau rebuild
npm run build
npm run dev
```

### Issue 2: Type Error di Frontend
**Symptoms**: `Property 'academic_supervisor' does not exist on type...`

**Checklist**:
- [ ] Type definition di `surat-pengantar-dosen.service.ts` sudah updated?
- [ ] Re-import jika ada changes?

**Fix**:
```typescript
// Restart TS server: Ctrl+Shift+P → "TypeScript: Restart TS Server"
// atau refresh file: save ulang file
```

### Issue 3: Database Performance
**Symptoms**: Response lambat, timeout

**Checklist**:
- [ ] Ada index di `submissions(team_id)`, `team_members(team_id)`, `users(id)`?
- [ ] Query sudah di-optimize? (tidak ada N+1)

**Fix**:
```sql
-- Add indexes jika belum ada:
CREATE INDEX IF NOT EXISTS idx_submissions_team_id ON submissions(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
```

### Issue 4: Empty Team Members Array
**Symptoms**: Dialog tampil tapi team_members kosong `[]`

**Checklist**:
- [ ] Ada team yang di-assign ke submission?
- [ ] Team members statusnya ACCEPTED?

**Fix**: Cek data di database:
```sql
SELECT sp.id, s.team_id, t.id, tm.role, tm.status 
FROM surat_pengantar sp
JOIN submissions s ON sp.submission_id = s.id
LEFT JOIN teams t ON s.team_id = t.id
LEFT JOIN team_members tm ON t.id = tm.team_id
WHERE sp.id = 'req-123';
```

---

## 📚 Related Documentation

- [Surat Pengantar Flow](./submission-flow.md)
- [Wakil Dekan User Roles](./wakdek-user-roles.md)
- [Backend API Endpoints](./api-endpoints.md)

---

## ✅ Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| Backend Dev | [Name] | [Date] | ⬜ Pending |
| Frontend Dev | [Name] | [Date] | ⬜ Pending |
| QA / Tester | [Name] | [Date] | ⬜ Pending |

---

**Document Version**: 1.0  
**Last Updated**: May 1, 2026  
**Status**: Ready for Implementation
