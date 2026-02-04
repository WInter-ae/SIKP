// Types for approval workflow and e-signature

export type ApprovalStatus =
  | "PENDING_DOSEN"      // Menunggu approval dosen pembimbing
  | "APPROVED_DOSEN"     // Sudah di-approve dosen
  | "REJECTED_DOSEN"     // Ditolak dosen
  | "PENDING_KAPRODI"    // Menunggu approval kaprodi
  | "APPROVED_KAPRODI"   // Sudah di-approve kaprodi (FINAL)
  | "REJECTED_KAPRODI";  // Ditolak kaprodi

export interface ApprovalWorkflow {
  approvalStatus: ApprovalStatus;
  dosenSignature?: string;          // Base64 e-signature
  dosenSignedAt?: string;
  dosenApprovedBy?: string;         // Lecturer ID
  dosenRejectionNote?: string;
  kaprodiSignature?: string;        // Base64 e-signature
  kaprodiSignedAt?: string;
  kaprodiApprovedBy?: string;       // Kaprodi ID
  kaprodiRejectionNote?: string;
}

export interface CombinedGradeWithApproval {
  id: string;
  studentId: string;
  studentName: string;
  nim: string;
  fieldMentorScore: number;
  academicSupervisorScore: number;
  totalScore: number;
  averageScore: number;
  grade: "A" | "B" | "C" | "D" | "E";
  status: "lulus" | "tidak-lulus";
  remarks?: string;
  
  // Approval workflow
  approvalStatus: ApprovalStatus;
  dosenSignature?: string;
  dosenSignedAt?: string;
  dosenApprovedBy?: string;
  dosenRejectionNote?: string;
  kaprodiSignature?: string;
  kaprodiSignedAt?: string;
  kaprodiApprovedBy?: string;
  kaprodiRejectionNote?: string;
  
  // PDF
  pdfGenerated: boolean;
  pdfUrl?: string;
  pdfGeneratedAt?: string;
  defaultPdfUsed: boolean;
  
  createdAt: string;
  updatedAt: string;
}

/**
 * Request interface for approving a grade
 * Signature will be fetched from user profile in database
 */
export interface ApprovalRequest {
  gradeId: string;
  notes?: string;
}

export interface ApprovalResponse {
  success: boolean;
  message: string;
  data: {
    gradeId: string;
    approvalStatus: ApprovalStatus;
    nextApprover?: "KAPRODI" | null;
    pdfGenerated?: boolean;
    pdfUrl?: string;
  };
}

export interface RejectRequest {
  gradeId: string;
  rejectionNote: string;
}
