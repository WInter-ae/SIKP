import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

import { RefreshCw, Download, FileText } from "lucide-react";
import type {
  StatusHistoryEntry,
  SubmissionDocument,
} from "~/feature/submission/types";
import { buildSubmissionTimeline } from "~/feature/submission/utils/timeline-builder";
import { getStatusConfig } from "~/feature/submission/constants/status-config";

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
  // Build timeline from submission data
  const timeline = buildSubmissionTimeline({
    statusHistory,
    currentStatus,
    rejectionReason,
    submittedAt,
    approvedAt,
  });

  // Find SURAT_PENGANTAR document
  const suratPengantar = documents?.find(
    (doc): doc is SubmissionDocument => doc.documentType === "SURAT_PENGANTAR",
  );

  return (
    <div className="space-y-4">
      {/* Timeline */}
      <div className="relative">
        {timeline.map((entry, index) => {
          const statusInfo = getStatusConfig(entry.status);
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
