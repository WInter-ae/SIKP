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
  signedFileUrl?: string;
  onResubmit?: () => void;
}

export function StatusTimeline({
  statusHistory,
  currentStatus,
  rejectionReason,
  submittedAt,
  approvedAt,
  documents,
  signedFileUrl,
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
  const suratPengantarUrl = signedFileUrl || suratPengantar?.fileUrl;

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
                <div className="absolute left-5 top-12 w-0.5 h-6 bg-border"></div>
              )}

              {/* Timeline entry card */}
              <div
                className={cn(
                  "border-l-4 rounded-lg p-3 sm:p-8 mb-4",
                  statusInfo.bg,
                  statusInfo.border,
                )}
              >
                <div className="flex items-start">
                  {/* Icon circle */}
                  <div
                    className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-primary-foreground mr-3 sm:mr-4 flex-shrink-0 relative",
                      statusInfo.iconBg,
                    )}
                  >
                    {statusInfo.icon && (
                      <div className="[&>svg]:size-5 sm:[&>svg]:size-6">
                        {statusInfo.icon}
                      </div>
                    )}
                    {/* Badge untuk latest */}
                    {entry.isLatest && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                        ●
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-0.5">
                      <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">
                        {statusInfo.title}
                      </h3>
                      <span
                        className={cn(
                          "text-[10px] sm:text-xs font-medium shrink-0",
                          statusInfo.textColor,
                        )}
                      >
                        {entry.date}
                      </span>
                    </div>
                    <p className="text-2xs sm:text-sm text-muted-foreground mb-3 leading-relaxed">
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
                    {entry.status === "APPROVED" && suratPengantarUrl && (
                      <div className="bg-muted p-2 sm:p-3 rounded-lg border border-border hover:bg-muted/80 transition">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="bg-green-700 w-8 h-8 rounded flex items-center justify-center text-white flex-shrink-0">
                              <FileText className="size-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-foreground text-xs sm:text-sm truncate">
                                Surat Pengantar Kerja Praktik
                              </div>
                            </div>
                          </div>
                          <Button
                            asChild
                            size="sm"
                            className="w-full sm:w-auto h-8 px-3 text-xs bg-green-700 hover:bg-green-800 text-white flex-shrink-0"
                          >
                            <a
                              href={suratPengantarUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={
                                suratPengantar?.originalName ||
                                "surat-pengantar-kerja-praktik.pdf"
                              }
                            >
                              <Download className="h-3.5 w-3.5 mr-1.5" />
                              <span className="sm:hidden">Unduh</span>
                              <span className="hidden sm:inline">Unduh Surat Pengantar</span>
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
