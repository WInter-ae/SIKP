import { formatDateTimeIndonesia, subtractMilliseconds } from "~/lib/date-utils";
import type { StatusHistoryEntry } from "~/feature/submission/types";

/**
 * Timeline entry interface
 */
export interface TimelineEntry {
  status: string;
  date: string;
  reason?: string;
  isLatest: boolean;
}

/**
 * Parameters for building timeline from status history
 */
interface BuildTimelineParams {
  statusHistory?: StatusHistoryEntry[];
  currentStatus: string;
  rejectionReason?: string;
  submittedAt?: string;
  approvedAt?: string;
}

/**
 * Create a timeline entry
 */
function createTimelineEntry(
  status: string,
  date: Date,
  isLatest: boolean,
  reason?: string
): TimelineEntry {
  return {
    status,
    date: formatDateTimeIndonesia(date),
    reason,
    isLatest,
  };
}

/**
 * Check if we need to insert PENDING_REVIEW before action status
 */
function shouldInsertPendingReview(
  status: string,
  lastEntry: TimelineEntry | null,
  isFirstEntry: boolean
): boolean {
  const isActionStatus = status === "REJECTED" || status === "APPROVED";
  const lastWasPendingReview = lastEntry?.status === "PENDING_REVIEW";
  
  return isActionStatus && (!lastWasPendingReview || isFirstEntry);
}

/**
 * Get estimated pending review date
 */
function getEstimatedPendingDate(
  isFirstEntry: boolean,
  currentDate: Date,
  submittedAt?: string
): Date {
  if (isFirstEntry && submittedAt) {
    return new Date(submittedAt);
  }
  
  if (!isFirstEntry) {
    // Estimate ~45 seconds before current action
    return subtractMilliseconds(currentDate, 45000);
  }
  
  return currentDate;
}

/**
 * Build timeline from status history
 */
function buildTimelineFromHistory(
  statusHistory: StatusHistoryEntry[],
  submittedAt?: string
): TimelineEntry[] {
  const timeline: TimelineEntry[] = [];
  
  // Filter out DRAFT status
  const filtered = statusHistory.filter((entry) => entry.status !== "DRAFT");

  filtered.forEach((entry, index, filteredArray) => {
    const isActionStatus = entry.status === "REJECTED" || entry.status === "APPROVED";
    const lastTimelineEntry = timeline.length > 0 ? timeline[timeline.length - 1] : null;
    const isFirstEntry = index === 0;

    // Add missing PENDING_REVIEW before action status
    if (shouldInsertPendingReview(entry.status, lastTimelineEntry, isFirstEntry)) {
      const currentDate = new Date(entry.date);
      const pendingDate = getEstimatedPendingDate(isFirstEntry, currentDate, submittedAt);
      
      timeline.push(createTimelineEntry("PENDING_REVIEW", pendingDate, false));
    }

    // Add current entry
    const isLatest = index === filteredArray.length - 1;
    timeline.push(createTimelineEntry(
      entry.status,
      new Date(entry.date),
      isLatest,
      entry.reason
    ));
  });

  return timeline;
}

/**
 * Build timeline from current status (fallback)
 */
function buildTimelineFromCurrentStatus(
  currentStatus: string,
  rejectionReason?: string,
  submittedAt?: string,
  approvedAt?: string
): TimelineEntry[] {
  const timeline: TimelineEntry[] = [];

  if (currentStatus === "PENDING_REVIEW" && submittedAt) {
    timeline.push(createTimelineEntry(
      "PENDING_REVIEW",
      new Date(submittedAt),
      true
    ));
  } else if (currentStatus === "REJECTED") {
    // Add PENDING_REVIEW first
    if (submittedAt) {
      timeline.push(createTimelineEntry(
        "PENDING_REVIEW",
        new Date(submittedAt),
        false
      ));
    }
    
    // Add REJECTED
    timeline.push(createTimelineEntry(
      "REJECTED",
      new Date(),
      true,
      rejectionReason
    ));
  } else if (currentStatus === "APPROVED") {
    if (submittedAt) {
      timeline.push(createTimelineEntry(
        "PENDING_REVIEW",
        new Date(submittedAt),
        false
      ));
    }
    
    if (approvedAt) {
      timeline.push(createTimelineEntry(
        "APPROVED",
        new Date(approvedAt),
        true
      ));
    }
  }

  return timeline;
}

/**
 * Ensure current status is in timeline
 */
function ensureCurrentStatusInTimeline(
  timeline: TimelineEntry[],
  currentStatus: string,
  submittedAt?: string
): TimelineEntry[] {
  if (currentStatus !== "PENDING_REVIEW") {
    return timeline;
  }

  const lastEntry = timeline.length > 0 ? timeline[timeline.length - 1] : null;

  if (!lastEntry || lastEntry.status !== "PENDING_REVIEW") {
    if (lastEntry) {
      lastEntry.isLatest = false;
    }

    const pendingDate = submittedAt ? new Date(submittedAt) : new Date();
    const newTimeline = [...timeline];
    newTimeline.push(createTimelineEntry("PENDING_REVIEW", pendingDate, true));
    
    return newTimeline;
  }

  return timeline;
}

/**
 * Build complete timeline from submission data
 * 
 * This function constructs a timeline of status changes, either from
 * status history or from current status as a fallback.
 */
export function buildSubmissionTimeline(params: BuildTimelineParams): TimelineEntry[] {
  const {
    statusHistory,
    currentStatus,
    rejectionReason,
    submittedAt,
    approvedAt,
  } = params;

  let timeline: TimelineEntry[];

  // Build timeline from history if available
  if (statusHistory && statusHistory.length > 0) {
    timeline = buildTimelineFromHistory(statusHistory, submittedAt);
  } else {
    // Fallback: build from current status
    timeline = buildTimelineFromCurrentStatus(
      currentStatus,
      rejectionReason,
      submittedAt,
      approvedAt
    );
  }

  // Ensure current status is represented
  timeline = ensureCurrentStatusInTimeline(timeline, currentStatus, submittedAt);

  return timeline;
}
