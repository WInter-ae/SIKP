import { apiClient, INTERNSHIP_API_BASE_URL } from "~/lib/api-client";
import type { ApiResponse } from "~/lib/api-client";

export type LogbookStatusFilter = "PENDING" | "APPROVED" | "REJECTED";

export interface LogbookResetResult {
  deletedCount: number;
  statusFilter?: string | null;
}

/**
 * Reset logbook records globally (admin only).
 * DELETE /api/admin/logbook/reset?status=PENDING|APPROVED|REJECTED
 */
export async function resetGlobalLogbook(
  status?: LogbookStatusFilter
): Promise<ApiResponse<LogbookResetResult>> {
  const query = status ? `?${new URLSearchParams({ status }).toString()}` : "";

  return apiClient<LogbookResetResult>(`/api/admin/logbook/reset${query}`, {
    method: "DELETE",
    _baseUrl: INTERNSHIP_API_BASE_URL,
  } as RequestInit & { _baseUrl: string });
}
