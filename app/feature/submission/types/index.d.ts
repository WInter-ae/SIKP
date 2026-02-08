export interface AdditionalInfoData {
  tujuanSurat: string;
  namaTempat: string;
  alamatTempat: string;
  divisi: string;
  tanggalMulai: string;
  tanggalSelesai: string;
}

export interface Member {
  id: string; // use string to align with backend user/member id
  name: string;
  role: string;
  nim?: string;
  prodi?: string;
}

export interface Document {
  id: number;
  title: string;
}

export interface DocumentFile {
  id: string;
  title: string;
  uploadedBy: string;
  uploadDate: string;
  status: "uploaded" | "missing";
  url?: string;
}

export interface SubmissionDocument {
  userId: string;
  id: string;
  submissionId: string;
  documentType:
    | "PROPOSAL_KETUA"
    | "SURAT_KESEDIAAN"
    | "FORM_PERMOHONAN"
    | "KRS_SEMESTER_4"
    | "DAFTAR_KUMPULAN_NILAI"
    | "BUKTI_PEMBAYARAN_UKT"
    | "SURAT_PENGANTAR"; // ✅ Auto-generated when admin approves
  memberUserId: string;
  uploadedByUserId: string;
  originalName: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  createdAt: string;
  uploadedByUser?: {
    id: string;
    name: string;
    email: string;
  };
}

// ✅ Status timeline entry untuk track history perubahan status
export interface StatusHistoryEntry {
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "DRAFT";
  date: string;
  reason?: string; // Rejection reason jika ada
}

export interface Submission {
  id: string;
  teamId: string;
  letterPurpose: string;
  companyName: string;
  companyAddress: string;
  division: string;
  startDate: string;
  endDate: string;
  status: "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  approvedAt?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
  documents?: SubmissionDocument[];
  statusHistory?: StatusHistoryEntry[]; // ✅ Timeline semua perubahan status
}

export interface Application {
  id: number;
  submissionId: string; // ✅ Original submission ID from database
  date: string;
  status: "pending" | "approved" | "rejected";
  rejectionComment?: string;
  documentReviews?: Record<string, "approved" | "rejected">;
  statusHistory?: StatusHistoryEntry[]; // ✅ Timeline untuk detect re-submission

  // Team Info
  members: Member[];
  supervisor: string;
  internship: AdditionalInfoData;
  documents: DocumentFile[];
}
