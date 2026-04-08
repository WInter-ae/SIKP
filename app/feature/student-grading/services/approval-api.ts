// Services for approval workflow API calls
import { apiClient } from "~/lib/api-client";
import type {
  CombinedGradeWithApproval,
  ApprovalRequest,
  ApprovalResponse,
  RejectRequest,
  ApprovalStatus,
} from "../types/approval.d";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

// ==================== DOSEN PEMBIMBING APIs ====================

/**
 * Get combined grades pending dosen approval
 */
export async function getPendingDosenApprovals(): Promise<
  ApiResponse<CombinedGradeWithApproval[]>
> {
  try {
    const response = await apiClient<CombinedGradeWithApproval[]>(
      "/api/dosen/grades/pending-approval",
      { method: "GET" }
    );
    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch pending approvals",
      data: null,
    };
  }
}

/**
 * Approve combined grade by dosen
 * Signature will be fetched from dosen's profile in database
 * @param request - Approval request
 */
export async function approveGradeByDosen(
  request: ApprovalRequest
): Promise<ApiResponse<{ gradeId: string; approvalStatus: ApprovalStatus; nextApprover?: "KAPRODI" | null }>> {
  try {
    const response = await apiClient<{ gradeId: string; approvalStatus: ApprovalStatus; nextApprover?: "KAPRODI" | null }>(
      `/api/dosen/grades/${request.gradeId}/approve`,
      {
        method: "POST",
        body: JSON.stringify({
          notes: request.notes,
        }),
      }
    );
    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to approve grade",
      data: null,
    };
  }
}

/**
 * Reject combined grade by dosen
 * @param request - Reject request with rejection note
 */
export async function rejectGradeByDosen(
  request: RejectRequest
): Promise<ApiResponse<null>> {
  try {
    const response = await apiClient<null>(
      `/api/dosen/grades/${request.gradeId}/reject`,
      {
        method: "POST",
        body: JSON.stringify({
          rejectionNote: request.rejectionNote,
        }),
      }
    );
    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to reject grade",
      data: null,
    };
  }
}

// ==================== KAPRODI APIs ====================

/**
 * Get combined grades pending kaprodi approval
 */
export async function getPendingKaprodiApprovals(): Promise<
  ApiResponse<CombinedGradeWithApproval[]>
> {
  try {
    const response = await apiClient<CombinedGradeWithApproval[]>(
      "/api/kaprodi/grades/pending-approval",
      { method: "GET" }
    );
    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch pending approvals",
      data: null,
    };
  }
}

/**
 * Approve combined grade by kaprodi (trigger DOCX generation)
 * Signature will be fetched from kaprodi's profile in database
 * @param request - Approval request
 */
export async function approveGradeByKaprodi(
  request: ApprovalRequest
): Promise<ApiResponse<{ gradeId: string; approvalStatus: ApprovalStatus; pdfGenerated?: boolean; pdfUrl?: string }>> {
  try {
    const response = await apiClient<{ gradeId: string; approvalStatus: ApprovalStatus; pdfGenerated?: boolean; pdfUrl?: string }>(
      `/api/kaprodi/grades/${request.gradeId}/approve`,
      {
        method: "POST",
        body: JSON.stringify({
          notes: request.notes,
        }),
      }
    );
    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to approve grade",
      data: null,
    };
  }
}

/**
 * Reject combined grade by kaprodi
 * @param request - Reject request with rejection note
 */
export async function rejectGradeByKaprodi(
  request: RejectRequest
): Promise<ApiResponse<null>> {
  try {
    const response = await apiClient<null>(
      `/api/kaprodi/grades/${request.gradeId}/reject`,
      {
        method: "POST",
        body: JSON.stringify({
          rejectionNote: request.rejectionNote,
        }),
      }
    );
    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to reject grade",
      data: null,
    };
  }
}

/**
 * Download final PDF nilai KP
 * @param gradeId - Combined grade ID
 * @returns Download URL
 */
export function getGradePdfDownloadUrl(gradeId: string): string {
  return `/api/kaprodi/grades/${gradeId}/download`;
}
