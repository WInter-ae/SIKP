import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

import { FileText, XCircle, RefreshCw, Check, Download } from "lucide-react";
import type {
  StatusHistoryEntry,
  SubmissionDocument,
} from "~/feature/submission/types";

interface StatusTimelineProps {
  statusHistory?: StatusHistoryEntry[];
  currentStatus: string;
  rejectionReason?: string;
  submittedAt?: string;
  approvedAt?: string;
  documents?: SubmissionDocument[];
  onResubmit?: () => void;
}

export function StatusTimeline({
  statusHistory,
  currentStatus,
  rejectionReason,
  submittedAt,
  approvedAt,
  documents,
  onResubmit,
}: StatusTimelineProps) {
  // ✅ Jika tidak ada statusHistory, construct dari current status (fallback)
  const timeline: Array<{
    status: string;
    date: string;
    reason?: string;
    isLatest: boolean;
  }> = [];

  if (statusHistory && statusHistory.length > 0) {
    // Gunakan statusHistory dari backend, tapi filter DRAFT karena itu transisi internal
    const filtered = statusHistory.filter((entry) => entry.status !== "DRAFT");

    // ✅ SMART RECONSTRUCT: Add missing PENDING_REVIEW before REJECTED/APPROVED
    filtered.forEach((entry, index, filteredArray) => {
      const isActionStatus =
        entry.status === "REJECTED" || entry.status === "APPROVED";
      // Check timeline yang sudah kita build, bukan filteredArray!
      const lastTimelineEntry =
        timeline.length > 0 ? timeline[timeline.length - 1] : null;
      const prevWasPendingReview =
        lastTimelineEntry && lastTimelineEntry.status === "PENDING_REVIEW";
      const isFirstEntry = index === 0;

      // Jika ini action status tapi tidak ada PENDING_REVIEW sebelumnya
      if (isActionStatus && (!prevWasPendingReview || isFirstEntry)) {
        // Add missing PENDING_REVIEW
        let pendingDateStr: string;

        if (isFirstEntry && submittedAt) {
          // First submission - use submittedAt
          pendingDateStr = new Date(submittedAt).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        } else if (!isFirstEntry) {
          // Re-submission - estimate ~45 seconds before current action
          const currDate = new Date(entry.date);
          const estimatedDate = new Date(currDate.getTime() - 45000);
          pendingDateStr = estimatedDate.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        } else {
          // Fallback: use current entry date
          pendingDateStr = new Date(entry.date).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        }

        timeline.push({
          status: "PENDING_REVIEW",
          date: pendingDateStr,
          reason: undefined,
          isLatest: false,
        });
      }

      // Add current entry
      timeline.push({
        status: entry.status,
        date: new Date(entry.date).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        reason: entry.reason,
        isLatest: index === filteredArray.length - 1,
      });
    });
  } else {
    // Fallback: construct dari current status
    if (currentStatus === "PENDING_REVIEW" && submittedAt) {
      timeline.push({
        status: "PENDING_REVIEW",
        date: new Date(submittedAt).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        isLatest: true,
      });
    } else if (currentStatus === "REJECTED") {
      // ✅ CRITICAL FIX: Push PENDING_REVIEW dulu sebelum REJECTED
      if (submittedAt) {
        timeline.push({
          status: "PENDING_REVIEW",
          date: new Date(submittedAt).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          isLatest: false,
        });
      }
      // Baru push REJECTED
      timeline.push({
        status: "REJECTED",
        date: new Date().toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        reason: rejectionReason,
        isLatest: true,
      });
    } else if (currentStatus === "APPROVED") {
      if (submittedAt) {
        timeline.push({
          status: "PENDING_REVIEW",
          date: new Date(submittedAt).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          isLatest: false,
        });
      }
      if (approvedAt) {
        timeline.push({
          status: "APPROVED",
          date: new Date(approvedAt).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          isLatest: true,
        });
      }
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "PENDING_REVIEW":
        return {
          title: "Mengajukan Surat Pengantar",
          description:
            "Pengajuan surat pengantar telah diterima dan sedang dalam proses review",
          icon: <FileText className="h-6 w-6" />,
          bg: "bg-muted",
          border: "border-l-muted-foreground",
          iconBg: "bg-muted-foreground",
          textColor: "text-muted-foreground",
        };
      case "DRAFT":
        return {
          title: "Mengajukan Surat Pengantar",
          description:
            "Pengajuan surat pengantar telah diterima dan sedang dalam proses review",
          icon: <FileText className="h-6 w-6" />,
          bg: "bg-muted",
          border: "border-l-muted-foreground",
          iconBg: "bg-muted-foreground",
          textColor: "text-muted-foreground",
        };
      case "REJECTED":
        return {
          title: "Pengajuan Ditolak",
          description:
            "Pengajuan Anda ditolak. Silakan perbaiki dan ajukan kembali.",
          icon: <XCircle className="h-7 w-7" />,
          bg: "bg-destructive/10",
          border: "border-l-destructive",
          iconBg: "bg-destructive",
          textColor: "text-destructive",
        };
      case "APPROVED":
        return {
          title: "Surat Pengantar Telah Dibuat",
          description:
            "Surat pengantar kerja praktik Anda telah disetujui dan dapat diunduh",
          icon: <Check className="h-7 w-7" />,
          bg: "bg-green-600/10",
          border: "border-l-green-600",
          iconBg: "bg-green-600",
          textColor: "text-green-600",
        };
      default:
        return {
          title: "Status",
          description: "",
          icon: null,
          bg: "bg-muted",
          border: "border-l-border",
          iconBg: "bg-muted-foreground",
          textColor: "text-muted-foreground",
        };
    }
  };

  // Find SURAT_PENGANTAR document
  const suratPengantar = documents?.find(
    (doc): doc is SubmissionDocument => doc.documentType === "SURAT_PENGANTAR",
  );

  return (
    <div className="space-y-4">
      {/* Timeline */}
      <div className="relative">
        {timeline.map((entry, index) => {
          const statusInfo = getStatusInfo(entry.status);
          const isLast = index === timeline.length - 1;

          return (
            <div key={`${entry.status}-${entry.date}-${index}`}>
              {/* Vertical line connecting steps */}
              {!isLast && (
                <div className="absolute left-6 top-16 w-1 h-8 bg-border"></div>
              )}

              {/* Timeline entry card */}
              <div
                className={cn(
                  "border-l-4 rounded-lg p-5 mb-4",
                  statusInfo.bg,
                  statusInfo.border,
                )}
              >
                <div className="flex items-start">
                  {/* Icon circle */}
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-primary-foreground mr-4 flex-shrink-0 relative",
                      statusInfo.iconBg,
                    )}
                  >
                    {statusInfo.icon}
                    {/* Badge untuk latest */}
                    {entry.isLatest && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                        ●
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        {statusInfo.title}
                      </h3>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          statusInfo.textColor,
                        )}
                      >
                        {entry.date}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-3">
                      {statusInfo.description}
                    </p>

                    {/* Rejection reason if available */}
                    {entry.reason && entry.status === "REJECTED" && (
                      <Alert variant="destructive" className="mb-3">
                        <AlertDescription>
                          <div className="font-medium mb-1">Komentar:</div>
                          <div>{entry.reason}</div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Document preview for APPROVED status */}
                    {entry.status === "APPROVED" && suratPengantar && (
                      <div className="bg-muted p-4 rounded-lg border border-border hover:bg-muted/80 transition">
                        <div className="flex items-start gap-3">
                          <div className="bg-emerald-600 w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                            <FileText className="size-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-foreground">
                              Surat Pengantar Kerja Praktik
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {suratPengantar.originalName}
                            </div>
                          </div>
                          <Button
                            asChild
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white flex-shrink-0"
                          >
                            <a
                              href={suratPengantar.fileUrl}
                              download={suratPengantar.originalName}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Unduh
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Resubmit button for rejected status */}
                    {entry.status === "REJECTED" &&
                      entry.isLatest &&
                      onResubmit && (
                        <Button onClick={onResubmit} className="mt-3">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Ajukan Ulang
                        </Button>
                      )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StatusTimeline;
