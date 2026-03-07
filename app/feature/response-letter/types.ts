/**
 * Response Letter Types
 * Type definitions untuk surat balasan (response letter)
 */

/**
 * Status history entry untuk response letter
 */
export interface ResponseLetterStatusHistoryEntry {
  status: "PENDING" | "APPROVED" | "REJECTED";
  date: string;
  reason?: string;
  isLatest?: boolean;
}

/**
 * Response Letter data structure
 * Sesuai dengan schema backend
 */
export interface ResponseLetter {
  id: string;
  submissionId: string;
  originalName: string | null;
  fileName: string | null;
  fileType: string | null;
  fileSize: number | null;
  fileUrl: string | null;
  memberUserId: string | null;
  letterStatus: "approved" | "rejected";
  submittedAt: string;
  verified: boolean;
  verifiedAt: string | null;
  verifiedByAdminId: string | null;
  isLeader?: boolean; // Flag to indicate if current user is team leader
}

/**
 * Student type untuk admin view
 */
export interface Student {
  id: string | number;
  name: string;
  nim: string;
  npm?: string;
  tanggal: string;
  company: string;
  status: "Disetujui" | "Ditolak";
  adminApproved: boolean;
  role?: string;
  memberCount: number;
  supervisor?: string;
  members?: Array<{
    id: number;
    name: string;
    nim?: string;
    prodi?: string;
    role: "Ketua" | "Anggota";
  }>;
  responseFileUrl?: string;
  submittedAt?: string;
  verified?: boolean;
  verifiedAt?: string | null;
  fileUrl?: string;
  originalName?: string;
}
