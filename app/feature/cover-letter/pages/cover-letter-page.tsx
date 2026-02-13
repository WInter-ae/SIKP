import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

import StatusTimeline from "~/feature/cover-letter/components/status-timeline";
import {
  SubmissionLoadingState,
  SubmissionErrorState,
  SubmissionEmptyState,
} from "~/feature/cover-letter/components/submission-states";
import { useSubmissionStatus } from "~/feature/cover-letter/hooks/use-submission-status";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { resetSubmissionToDraft } from "~/lib/services/submission-api";

/**
 * Cover Letter Page - Display submission status timeline
 * 
 * This page shows the status of cover letter submission with visual timeline,
 * allowing students to track their submission progress and download approved documents.
 */
function CoverLetterPage() {
  const navigate = useNavigate();
  const { submission, isLoading, error, refetch } = useSubmissionStatus();

  /**
   * Handle resubmit action after rejection
   */
  const handleResubmit = async () => {
    if (!submission) {
      navigate("/mahasiswa/kp/pengajuan");
      return;
    }

    const response = await resetSubmissionToDraft(submission.id);
    
    if (!response.success) {
      toast.error(response.message || "Gagal mengembalikan status ke draft");
      return;
    }

    toast.success("Status berhasil dikembalikan ke draft");
    navigate("/mahasiswa/kp/pengajuan");
  };

  /**
   * Navigate to submission page
   */
  const navigateToSubmission = () => {
    navigate("/mahasiswa/kp/pengajuan");
  };

  /**
   * Check if next button should be enabled
   */
  const isNextButtonEnabled = submission?.status === "APPROVED";

  return (
    <>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Halaman Status Pengajuan Surat Pengantar
        </h1>
        <p className="text-muted-foreground">
          Monitor status pengajuan surat pengantar kerja praktik Anda
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          {/* Render loading state */}
          {isLoading && <SubmissionLoadingState />}

          {/* Render error state */}
          {!isLoading && error && !submission && (
            <SubmissionErrorState
              error={error}
              onRetry={refetch}
              onNavigateToSubmission={navigateToSubmission}
            />
          )}

          {/* Render empty state */}
          {!isLoading && !error && !submission && (
            <SubmissionEmptyState onNavigateToSubmission={navigateToSubmission} />
          )}

          {/* Render timeline */}
          {!isLoading && submission && (
            <StatusTimeline
              statusHistory={submission.statusHistory}
              currentStatus={submission.status}
              rejectionReason={submission.rejectionReason}
              submittedAt={submission.submittedAt}
              approvedAt={submission.approvedAt}
              documents={submission.documents}
              onResubmit={handleResubmit}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons - Only show if there's a submission */}
      {submission && !isLoading && (
        <div className="flex justify-between mt-8">
          <Button
            variant="secondary"
            onClick={() => navigate("/mahasiswa/kp/pengajuan")}
            className="px-6 py-3 font-medium"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Sebelumnya
          </Button>

          <Button
            disabled={!isNextButtonEnabled}
            onClick={() => navigate("/mahasiswa/kp/surat-balasan")}
            className="px-6 py-3 font-medium"
          >
            Selanjutnya
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  );
}

export default CoverLetterPage;
