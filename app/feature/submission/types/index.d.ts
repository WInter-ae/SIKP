export interface AdditionalInfoData {
  tujuanSurat: string;
  namaTempat: string;
  alamatTempat: string;
  teleponPerusahaan: string;
  jenisProdukUsaha: string;
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
  type?: string;
}

export interface FileUploadProps {
  label: string;
  onFileChange?: (file: File) => void;
}

export interface DocumentFile {
  id: string;
  title: string;
  uploadedBy: string;
  uploadDate: string;
  status: "uploaded" | "missing";
  url?: string;
  // ✅ NEW: Database status setelah admin review
  documentStatus?: "PENDING" | "APPROVED" | "REJECTED";
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
    nim?: string;
    prodi?: string;
  };
  // ✅ NEW: Review status dari admin (disimpan di database)
  status?: "PENDING" | "APPROVED" | "REJECTED";
  statusUpdatedAt?: string;
}

// ✅ Status timeline entry untuk track history perubahan status
export interface StatusHistoryEntry {
  status:
    | "PENDING_REVIEW"
    | "APPROVED"
    | "REJECTED"
    | "DRAFT"
    | "PENDING_ADMIN_REVIEW"
    | "PENDING_DOSEN_VERIFICATION"
    | "COMPLETED"
    | "REJECTED_ADMIN"
    | "REJECTED_DOSEN";
  workflowStage?:
    | "DRAFT"
    | "PENDING_ADMIN_REVIEW"
    | "PENDING_DOSEN_VERIFICATION"
    | "COMPLETED"
    | "REJECTED_ADMIN"
    | "REJECTED_DOSEN";
  actor?: "ADMIN" | "DOSEN" | "MAHASISWA";
  date: string;
  reason?: string; // Rejection reason jika ada
  letterNumber?: string;
}

export interface Submission {
  id: string;
  teamId: string;
  letterPurpose: string;
  companyName: string;
  companyAddress: string;
  companyPhone?: string;
  companyBusinessType?: string;
  division: string;
  startDate: string;
  endDate: string;
  status:
    | "DRAFT"
    | "PENDING_REVIEW"
    | "APPROVED"
    | "REJECTED"
    | "PENDING_ADMIN_REVIEW"
    | "PENDING_DOSEN_VERIFICATION"
    | "COMPLETED"
    | "REJECTED_ADMIN"
    | "REJECTED_DOSEN";
  workflowStage?:
    | "DRAFT"
    | "PENDING_ADMIN_REVIEW"
    | "PENDING_DOSEN_VERIFICATION"
    | "COMPLETED"
    | "REJECTED_ADMIN"
    | "REJECTED_DOSEN";
  rejectionReason?: string;
  letterNumber?: string;
  approvedAt?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
  documents?: SubmissionDocument[];
  statusHistory?: StatusHistoryEntry[]; // ✅ Timeline semua perubahan status
  documentReviews?: Record<string, "approved" | "rejected">;
}

export interface Application {
  id: number;
  submissionId: string; // ✅ Original submission ID from database
  date: string;
  status: "pending" | "approved" | "rejected";
  workflowStage?:
    | "DRAFT"
    | "PENDING_ADMIN_REVIEW"
    | "PENDING_DOSEN_VERIFICATION"
    | "COMPLETED"
    | "REJECTED_ADMIN"
    | "REJECTED_DOSEN";
  pendingLabel?: "Menunggu Review" | "Menunggu TTD Wakil Dekan";
  rejectionComment?: string;
  letterNumber?: string;
  signedFileUrl?: string;
  documentReviews?: Record<string, "approved" | "rejected">;
  statusHistory?: StatusHistoryEntry[]; // ✅ Timeline untuk detect re-submission

  // Team Info
  members: Member[];
  supervisor: string;
  internship: AdditionalInfoData;
  documents: DocumentFile[];
  wakilDekanSignature?: WakilDekanSignature;
}

export interface WakilDekanSignature {
  id: string;
  name: string;
  nip: string;
  position: string;
  fakultas?: string;
  prodi?: string;
  esignatureUrl?: string;
  esignatureKey?: string;
  esignatureUploadedAt?: string;
}

// Backward compatibility for old naming.
export type wakildekanSignature = WakilDekanSignature;
