/**
 * Admin Service
 * Wrapper untuk Admin API endpoints
 */

import { sikpClient } from "~/lib/api-client";
import type { SubmissionStatistics } from "~/lib/types";

/** Get submission statistics. */
export async function getStatistics() {
  return sikpClient.get<SubmissionStatistics>("/api/admin/statistics");
}
