/**
 * Type definitions untuk API responses
 * Berdasarkan dokumentasi API backend
 */

// ============ User & Auth Types ============

export interface User {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
  nim?: string;
  nip?: string;
  fakultas?: string;
  prodi?: string;
  semester?: number;
  angkatan?: string;
  phone?: string;
}

export type UserRole =
  | "MAHASISWA"
  | "ADMIN"
  | "DOSEN"
  | "KAPRODI"
  | "WAKIL_DEKAN"
  | "PEMBIMBING_LAPANGAN";

export interface LoginResponse {
  user: User;
  token: string;
}

export type RegisterResponse = LoginResponse;

// ============ Team Types ============

export type TeamStatus = "PENDING" | "FIXED";
export type InvitationStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface Team {
  id: string;
  code: string;
  name?: string;
  leaderId: string;
  isLeader?: boolean;
  status: TeamStatus;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: "KETUA" | "ANGGOTA";
  invitationStatus: InvitationStatus;
  invitedAt: string;
  respondedAt?: string;
}

// ============ Submission Types ============

export type SubmissionStatus = "DRAFT" | "MENUNGGU" | "DITOLAK" | "DITERIMA";
export type DocumentType = "KTP" | "TRANSKRIP" | "KRS" | "PROPOSAL" | "OTHER";

export interface Submission {
  id: string;
  teamId: string;
  companyName: string;
  companyAddress: string;
  companyPhone?: string;
  companyEmail?: string;
  companySupervisor?: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  status: SubmissionStatus;
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionDocument {
  id: string;
  submissionId: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  documentType: DocumentType;
  uploadedBy: string;
  createdAt: string;
}

export interface GeneratedLetter {
  id: string;
  submissionId: string;
  letterNumber: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  generatedBy: string;
  generatedAt: string;
}

// ============ Admin Types ============

export interface SubmissionStatistics {
  total: number;
  draft: number;
  pending: number;
  approved: number;
  rejected: number;
}

// ============ Generic Response Types ============

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  data: {
    errors?: Array<{
      path: string[];
      message: string;
    }>;
  } | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}
