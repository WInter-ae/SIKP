/**
 * Admin Service
 * Wrapper untuk Admin API endpoints
 */

import { get } from '~/lib/api-client';
import type { SubmissionStatistics } from '~/lib/types';

/**
 * Get submission statistics
 */
export async function getStatistics() {
  return get<SubmissionStatistics>('/api/admin/statistics');
}
