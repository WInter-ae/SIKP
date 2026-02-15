import type { ResponseLetterStatusHistoryEntry } from "~/feature/response-letter/types";

/**
 * Build timeline untuk response letter status
 *
 * Timeline menampilkan:
 * 1. PENDING - Ketika mahasiswa submit (selalu muncul pertama)
 * 2. APPROVED/REJECTED - Muncul hanya setelah admin verify
 *
 * Logic:
 * - Saat submit: hanya PENDING yang muncul (walaupun letterStatus sudah pilih approved/rejected)
 * - Setelah admin verify (verified=true): PENDING + status sesuai letterStatus
 *
 * @param data Response letter data
 * @returns Array of timeline entries
 */
export function buildResponseLetterTimeline(data: {
  letterStatus: "approved" | "rejected";
  submittedAt: string;
  verified: boolean;
  verifiedAt: string | null;
}): ResponseLetterStatusHistoryEntry[] {
  const timeline: ResponseLetterStatusHistoryEntry[] = [];

  // Step 1: PENDING status - always show first (saat submit)
  timeline.push({
    status: "PENDING",
    date: new Date(data.submittedAt).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    isLatest: !data.verified, // Latest jika belum verified
  });

  // Step 2: APPROVED/REJECTED - only show after admin verified
  if (data.verified && data.verifiedAt) {
    const finalStatus =
      data.letterStatus === "approved" ? "APPROVED" : "REJECTED";

    timeline.push({
      status: finalStatus,
      date: new Date(data.verifiedAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      isLatest: true, // Latest setelah verified
    });
  }

  return timeline;
}
