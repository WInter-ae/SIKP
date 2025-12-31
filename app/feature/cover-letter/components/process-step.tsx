import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

import { Eye, FileText, XCircle, RefreshCw, Check } from "lucide-react";

import type { ProcessStepProps } from "../types";

function ProcessStep({
  title,
  description,
  status,
  comment,
  onAction,
  actionText,
  showDocumentPreview = false,
}: ProcessStepProps) {
  const getStatusStyles = () => {
    switch (status) {
      case "submitted":
        return {
          bg: "bg-muted",
          border: "border-l-muted-foreground",
          iconBg: "bg-muted-foreground",
          iconComponent: <FileText className="h-6 w-6" />,
        };
      case "rejected":
        return {
          bg: "bg-destructive/10",
          border: "border-l-destructive",
          iconBg: "bg-destructive",
          iconComponent: <XCircle className="h-7 w-7" />,
        };
      case "resubmitted":
        return {
          bg: "bg-muted",
          border: "border-l-muted-foreground",
          iconBg: "bg-muted-foreground",
          iconComponent: <RefreshCw className="h-7 w-7" />,
        };
      case "approved":
        return {
          bg: "bg-primary/10",
          border: "border-l-primary",
          iconBg: "bg-primary",
          iconComponent: <Check className="h-7 w-7" />,
        };
      default:
        return {
          bg: "bg-muted",
          border: "border-l-border",
          iconBg: "bg-muted-foreground",
          iconComponent: null,
        };
    }
  };

  const statusStyles = getStatusStyles();

  return (
    <div
      className={cn(
        "border-l-4 rounded-lg p-5 mb-4",
        statusStyles.bg,
        statusStyles.border
      )}
    >
      <div className="flex items-start">
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center text-primary-foreground mr-4 flex-shrink-0",
            statusStyles.iconBg
          )}
        >
          {statusStyles.iconComponent}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-muted-foreground mb-3">{description}</p>

          {comment && (
            <Alert variant="destructive" className="mb-3">
              <AlertDescription>
                <div className="font-medium mb-1">Komentar:</div>
                <div>{comment}</div>
              </AlertDescription>
            </Alert>
          )}

          {showDocumentPreview && (
            <div className="bg-muted p-3 rounded flex items-center cursor-pointer hover:bg-muted/80 transition">
              <div className="bg-primary w-10 h-10 rounded flex items-center justify-center text-primary-foreground mr-3">
                <Eye className="size-5" />
              </div>
              <div>
                <div className="font-medium text-foreground">Surat Pengantar Kerja Praktik</div>
                <div className="text-sm text-muted-foreground">
                  Dibuat pada: 15 Juni 2023
                </div>
              </div>
            </div>
          )}

          {onAction && actionText && (
            <Button
              onClick={onAction}
              size="sm"
              className="mt-3"
            >
              {actionText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProcessStep;
