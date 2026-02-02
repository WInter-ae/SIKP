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
  id: string;
  submissionId: string;
  documentType:
    | "PROPOSAL_KETUA"
    | "SURAT_KESEDIAAN"
    | "FORM_PERMOHONAN"
    | "KRS_SEMESTER_4"
    | "DAFTAR_KUMPULAN_NILAI"
    | "BUKTI_PEMBAYARAN_UKT";
  memberUserId: string;
  uploadedByUserId: string;
  originalName: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  createdAt: string;
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
}

export interface Application {
  id: number;
  date: string;
  status: "pending" | "approved" | "rejected";
  rejectionComment?: string;
  documentReviews?: Record<string, "approved" | "rejected">;

  // Team Info
  members: Member[];
  supervisor: string;
  internship: AdditionalInfoData;
  documents: DocumentFile[];
}
