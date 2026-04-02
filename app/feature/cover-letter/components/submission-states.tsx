import { Button } from "~/components/ui/button";
import { AlertCircle, FileQuestion, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";

/**
 * Loading state component for submission status
 */
export function SubmissionLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-muted-foreground">Memuat status pengajuan...</p>
    </div>
  );
}

/**
 * Error state component for submission status
 */
interface SubmissionErrorStateProps {
  error: string;
  onRetry?: () => void;
  onNavigateToSubmission?: () => void;
}

export function SubmissionErrorState({
  error,
  onRetry,
  onNavigateToSubmission,
}: SubmissionErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-3">
      <Alert
        variant="destructive"
        className="w-full max-w-md items-start border-l-4 border-destructive bg-destructive/5 px-3 py-2.5"
      >
        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
        <AlertDescription className="text-sm text-destructive">
          {error}
        </AlertDescription>
      </Alert>
      {onNavigateToSubmission && (
        <Button onClick={onNavigateToSubmission}>Kembali ke Buat Tim</Button>
      )}
    </div>
  );
}

/**
 * Empty state component when no submission exists
 */
interface SubmissionEmptyStateProps {
  onNavigateToSubmission: () => void;
}

export function SubmissionEmptyState({
  onNavigateToSubmission,
}: SubmissionEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <FileQuestion className="h-16 w-16 text-muted-foreground" />
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Belum Ada Pengajuan</h3>
        <p className="text-muted-foreground">
          Silakan ajukan surat pengantar terlebih dahulu
        </p>
      </div>
      <Button onClick={onNavigateToSubmission} className="mt-4">
        Ajukan Sekarang
      </Button>
    </div>
  );
}
