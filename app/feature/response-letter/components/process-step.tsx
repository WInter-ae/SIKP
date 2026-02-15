import { Alert, AlertDescription } from "~/components/ui/alert";
import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";

import type { ProcessStepsProps } from "../types";
import { Send, XCircle, CheckCircle, Info } from "lucide-react";

function ProcessSteps({ steps }: ProcessStepsProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "submitted":
        return {
          bg: "bg-muted",
          border: "border-l-muted-foreground",
          icon: "bg-muted-foreground",
          IconComponent: Send,
        };
      case "rejected":
        return {
          bg: "bg-destructive/10",
          border: "border-l-destructive",
          icon: "bg-destructive",
          IconComponent: XCircle,
        };
      case "approved":
        return {
          bg: "bg-primary/10",
          border: "border-l-primary",
          icon: "bg-primary",
          IconComponent: CheckCircle,
        };
      default:
        return {
          bg: "bg-muted",
          border: "border-l-muted-foreground",
          icon: "bg-muted-foreground",
          IconComponent: Send,
        };
    }
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        {steps.map(
          (step) =>
            step.visible && (
              <div
                key={step.id}
                className={cn(
                  "border-l-4 rounded-lg p-5 mb-4",
                  getStatusStyles(step.status).bg,
                  getStatusStyles(step.status).border,
                )}
              >
                <div className="flex items-start">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-primary-foreground mr-4 flex-shrink-0",
                      getStatusStyles(step.status).icon,
                    )}
                  >
                    {(() => {
                      const IconComponent = getStatusStyles(
                        step.status,
                      ).IconComponent;
                      return <IconComponent className="h-5 w-5" />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </div>
            ),
        )}

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Status persetujuan atau penolakan akan ditentukan oleh admin.
            Silakan pantau status pengajuan Anda secara berkala.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

export default ProcessSteps;
