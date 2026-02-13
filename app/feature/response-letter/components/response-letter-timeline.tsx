import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

import { Download, FileText } from "lucide-react";
import type { ResponseLetterStatusHistoryEntry } from "~/feature/response-letter/types";
import { buildResponseLetterTimeline } from "~/feature/response-letter/utils/timeline-builder";
import { getResponseLetterStatusConfig } from "~/feature/response-letter/constants/status-config";

interface ResponseLetterTimelineProps {
  letterStatus: "approved" | "rejected";
  submittedAt: string;
  verified: boolean;
  verifiedAt: string | null;
  fileUrl?: string | null;
  originalName?: string | null;
  rejectionReason?: string;
}

export function ResponseLetterTimeline({
  letterStatus,
  submittedAt,
  verified,
  verifiedAt,
  fileUrl,
  originalName,
  rejectionReason,
}: ResponseLetterTimelineProps) {
  // Build timeline from response letter data
  const timeline = buildResponseLetterTimeline({
    letterStatus,
    submittedAt,
    verified,
    verifiedAt,
  });

  return (
    <div className="space-y-4">
      {/* Timeline */}
      <div className="relative">
        {timeline.map(
          (entry: ResponseLetterStatusHistoryEntry, index: number) => {
            const statusInfo = getResponseLetterStatusConfig(entry.status);
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
                      {entry.status === "REJECTED" && rejectionReason && (
                        <Alert variant="destructive" className="mb-3">
                          <AlertDescription>
                            <div className="font-medium mb-1">
                              Alasan Penolakan:
                            </div>
                            <div>{rejectionReason}</div>
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Document preview for any status (if file exists) */}
                      {fileUrl && originalName && (
                        <div className="bg-muted p-4 rounded-lg border border-border hover:bg-muted/80 transition">
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0",
                                entry.status === "APPROVED"
                                  ? "bg-emerald-600"
                                  : entry.status === "REJECTED"
                                    ? "bg-red-600"
                                    : "bg-yellow-600",
                              )}
                            >
                              <FileText className="size-5" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-foreground">
                                Surat Balasan dari Perusahaan
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {originalName}
                              </div>
                            </div>
                            <Button
                              asChild
                              size="sm"
                              className={cn(
                                "text-white flex-shrink-0",
                                entry.status === "APPROVED"
                                  ? "bg-emerald-600 hover:bg-emerald-700"
                                  : entry.status === "REJECTED"
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-yellow-600 hover:bg-yellow-700",
                              )}
                            >
                              <a
                                href={fileUrl}
                                download={originalName}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Unduh
                              </a>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}
