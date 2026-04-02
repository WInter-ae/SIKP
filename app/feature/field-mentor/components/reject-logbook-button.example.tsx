/**
 * Example Usage: Reject Logbook Button
 * 
 * File ini menunjukkan cara menggunakan RejectLogbookButton component
 * di halaman mentor untuk menolak logbook mahasiswa dengan catatan revisi.
 */

import { RejectLogbookButton } from "./reject-logbook-button";
import { ApproveLogbookButton } from "./approve-logbook-button";

export default function LogbookActionsExample() {
  const handleSuccess = () => {
    console.log("Logbook updated! Refresh the list.");
    // Refresh logbook list or refetch data
  };

  return (
    <div className="space-y-4">
      {/* Example 1: Basic Usage - Reject with student info */}
      <div className="flex gap-2">
        <ApproveLogbookButton
          logbookId="logbook-123"
          studentName="Robin"
          date="2026-02-12"
          activity="Implementasi Fitur Login"
          onSuccess={handleSuccess}
        />
        
        <RejectLogbookButton
          logbookId="logbook-123"
          studentName="Robin"
          date="2026-02-12"
          activity="Implementasi Fitur Login"
          onSuccess={handleSuccess}
        />
      </div>

      {/* Example 2: Minimal Usage - Just logbook ID */}
      <div className="flex gap-2">
        <ApproveLogbookButton
          logbookId="logbook-456"
          onSuccess={handleSuccess}
        />
        
        <RejectLogbookButton
          logbookId="logbook-456"
          onSuccess={handleSuccess}
        />
      </div>

      {/* Example 3: Custom Styling */}
      <div className="flex gap-2">
        <ApproveLogbookButton
          logbookId="logbook-789"
          variant="outline"
          size="lg"
          onSuccess={handleSuccess}
        />
        
        <RejectLogbookButton
          logbookId="logbook-789"
          variant="outline"  // or "destructive" for red button (default)
          size="lg"
          onSuccess={handleSuccess}
        />
      </div>

      {/* Example 4: In Table Row */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Implementasi REST API</p>
            <p className="text-sm text-muted-foreground">12 Feb 2026 - Robin (12345)</p>
          </div>
          <div className="flex gap-2">
            <ApproveLogbookButton
              logbookId="logbook-999"
              studentName="Robin"
              date="2026-02-12"
              activity="Implementasi REST API"
              variant="default"
              size="sm"
              onSuccess={handleSuccess}
            />
            
            <RejectLogbookButton
              logbookId="logbook-999"
              studentName="Robin"
              date="2026-02-12"
              activity="Implementasi REST API"
              variant="destructive"
              size="sm"
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Integration with Backend API
 * 
 * RejectLogbookButton akan memanggil:
 * POST /api/mentor/logbook/:logbookId/reject
 * 
 * Request body:
 * {
 *   "rejectionNote": "Deskripsi kurang detail. Mohon tambahkan teknologi yang digunakan."
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "logbook-123",
 *     "status": "REJECTED",
 *     "rejectionNote": "Deskripsi kurang detail...",
 *     ...
 *   }
 * }
 */

/**
 * Student View (Mahasiswa)
 * 
 * Ketika mentor reject logbook:
 * 1. Status logbook berubah jadi "REJECTED"
 * 2. Mahasiswa akan lihat badge merah "Ditolak"
 * 3. Rejectionote dari mentor ditampilkan di bawah badge
 * 4. Mahasiswa bisa edit dan submit ulang logbook
 * 
 * UI di halaman mahasiswa:
 * ┌─────────────────────────────────────┐
 * │  ❌ Ditolak                          │
 * │                                     │
 * │  📝 Catatan Revisi:                 │
 * │  Deskripsi kurang detail. Mohon     │
 * │  tambahkan teknologi yang digunakan │
 * │  dan hasil yang dicapai.            │
 * │                                     │
 * │  Silakan perbaiki dan submit ulang  │
 * └─────────────────────────────────────┘
 */
