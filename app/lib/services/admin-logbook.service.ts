/**
 * Admin Logbook Service
 * Menangani operasi logbook dari sisi admin — menggunakan internshipClient
 * karena endpoint ini ada di backend internship (INTERNSHIP_API_BASE_URL).
 */

import { internshipClient } from "~/lib/api-client";
import type { ApiResponse } from "~/lib/api-client";

export type LogbookStatusFilter = "PENDING" | "APPROVED" | "REJECTED";

export interface LogbookResetResult {
  deletedCount: number;
  statusFilter?: string | null;
}

/**
 * Reset logbook records globally (admin only).
 * DELETE /api/admin/logbook/reset?status=PENDING|APPROVED|REJECTED
 *
 * Menggunakan internshipClient karena endpoint ini ada di INTERNSHIP_API_BASE_URL.
 */
export async function resetGlobalLogbook(
  status?: LogbookStatusFilter,
): Promise<ApiResponse<LogbookResetResult>> {
  const query = status ? `?${new URLSearchParams({ status }).toString()}` : "";
  return internshipClient.del<LogbookResetResult>(
    `/api/admin/logbook/reset${query}`,
  );
}
