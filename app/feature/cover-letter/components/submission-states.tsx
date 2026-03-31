import { Button } from "~/components/ui/button";
import { AlertCircle, FileQuestion, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

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
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Terjadi Kesalahan</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
      <div className="flex gap-2">
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            Coba Lagi
          </Button>
        )}
        {onNavigateToSubmission && (
          <Button onClick={onNavigateToSubmission}>
            Kembali ke Pengajuan
          </Button>
        )}
      </div>
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
