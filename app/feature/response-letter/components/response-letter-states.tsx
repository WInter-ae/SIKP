import { Button } from "~/components/ui/button";
import { AlertCircle, FileQuestion, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

/**
 * Loading state component for response letter status
 */
export function ResponseLetterLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-muted-foreground">Memuat status surat balasan...</p>
    </div>
  );
}

/**
 * Error state component for response letter status
 */
interface ResponseLetterErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export function ResponseLetterErrorState({
  error,
  onRetry,
}: ResponseLetterErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Terjadi Kesalahan</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Coba Lagi
        </Button>
      )}
    </div>
  );
}

/**
 * Empty state component when no response letter exists yet
 */
export function ResponseLetterEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <FileQuestion className="h-16 w-16 text-muted-foreground" />
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Belum Ada Surat Balasan</h3>
        <p className="text-muted-foreground">
          Silakan upload surat balasan dari perusahaan terlebih dahulu
        </p>
      </div>
    </div>
  );
}
