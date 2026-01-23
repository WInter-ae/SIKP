/**
 * Example Usage: Approve Logbook Button Components
 * 
 * Komponen baru yang lebih simple untuk approve logbook
 * - Signature otomatis dari profile mentor
 * - No signature canvas needed
 * - Just click button!
 */

import { ApproveLogbookButton, BulkApproveButton } from "./approve-logbook-button";

// ===== EXAMPLE 1: Simple Approve Button =====
export function LogbookListExample() {
  const logbooks = [
    {
      id: "log-1",
      studentName: "Budi Santoso",
      date: "2026-01-20",
      activity: "Membuat dokumentasi API",
      status: "PENDING",
    },
    {
      id: "log-2", 
      studentName: "Ani Wijaya",
      date: "2026-01-21",
      activity: "Testing fitur baru",
      status: "PENDING",
    },
  ];

  const handleRefresh = () => {
    console.log("Refresh logbook list");
    // Reload data dari API
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Logbook Pending</h2>
      
      {logbooks.map((logbook) => (
        <div key={logbook.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <p className="font-medium">{logbook.studentName}</p>
            <p className="text-sm text-muted-foreground">{logbook.activity}</p>
            <p className="text-xs text-muted-foreground">{logbook.date}</p>
          </div>
          
          {/* Simple button - tinggal klik! */}
          <ApproveLogbookButton
            logbookId={logbook.id}
            studentName={logbook.studentName}
            date={logbook.date}
            activity={logbook.activity}
            onSuccess={handleRefresh}
            variant="default"
            size="sm"
          />
        </div>
      ))}
    </div>
  );
}

// ===== EXAMPLE 2: Inline Button (Minimal) =====
export function LogbookTableExample() {
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th>Tanggal</th>
          <th>Mahasiswa</th>
          <th>Kegiatan</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>21 Jan 2026</td>
          <td>Budi Santoso</td>
          <td>Testing API</td>
          <td>
            {/* Minimal button without details */}
            <ApproveLogbookButton
              logbookId="log-123"
              onSuccess={() => console.log("Approved!")}
              variant="ghost"
              size="sm"
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
}

// ===== EXAMPLE 3: Bulk Approve =====
export function StudentDetailExample() {
  const student = {
    id: "student-1",
    name: "Budi Santoso",
    nim: "2021001",
  };

  const pendingLogbooks = 15; // Count dari API

  const handleBulkSuccess = () => {
    console.log("All logbooks approved!");
    // Reload data
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{student.name}</h2>
          <p className="text-sm text-muted-foreground">NIM: {student.nim}</p>
          <p className="text-sm text-yellow-600">{pendingLogbooks} logbook menunggu persetujuan</p>
        </div>

        {/* Bulk approve button */}
        <BulkApproveButton
          studentId={student.id}
          studentName={student.name}
          pendingCount={pendingLogbooks}
          onSuccess={handleBulkSuccess}
        />
      </div>

      {/* List of logbooks... */}
    </div>
  );
}

// ===== EXAMPLE 4: With Loading State =====
export function LogbookCardExample() {
  const logbook = {
    id: "log-456",
    studentName: "Ani Wijaya",
    date: "2026-01-22",
    activity: "Implementasi fitur baru",
    description: "Membuat halaman dashboard dengan React",
  };

  return (
    <div className="p-6 border rounded-lg space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold">{logbook.studentName}</h3>
          <p className="text-sm text-muted-foreground">
            {new Date(logbook.date).toLocaleDateString("id-ID")}
          </p>
        </div>
        <ApproveLogbookButton
          logbookId={logbook.id}
          studentName={logbook.studentName}
          date={logbook.date}
          activity={logbook.activity}
          onSuccess={() => console.log("Success!")}
        />
      </div>

      <div>
        <p className="text-sm font-medium">{logbook.activity}</p>
        <p className="text-sm text-muted-foreground mt-1">{logbook.description}</p>
      </div>
    </div>
  );
}

// ===== COMPARISON: OLD vs NEW =====

/* 
✅ NEW WAY (approve-logbook-button.tsx):
<ApproveLogbookButton
  logbookId="log-123"
  onSuccess={() => console.log("Done!")}
/>
- Self-contained
- Simple props
- Signature auto from profile
- Just click!

Benefits:
- ✅ Signature otomatis dari mentor profile
- ✅ Setup sekali di profil, use everywhere
- ✅ No complex state management
- ✅ Built-in error handling & loading states
- ✅ Support bulk approve
*/
