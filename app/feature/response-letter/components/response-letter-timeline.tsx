import { cn } from "~/lib/utils";
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
