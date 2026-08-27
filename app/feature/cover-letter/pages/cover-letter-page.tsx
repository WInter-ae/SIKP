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
import { useSidebar } from "~/components/ui/sidebar";
import { resetSubmissionToDraft } from "~/lib/services/submission-api.service";

/**
 * Cover Letter Page - Display submission status timeline
 *
 * This page shows the status of cover letter submission with visual timeline,
 * allowing students to track their submission progress and download approved documents.
 */
function CoverLetterPage() {
  const navigate = useNavigate();
  const { state, isMobile } = useSidebar();
  const leftOffset = isMobile ? "0" : state === "expanded" ? "16rem" : "3rem";

  const { submission, isLoading, error, refetch } = useSubmissionStatus();

  const signedFileUrl = (() => {
    if (!submission) return undefined;

    const submissionWithSigned = submission as typeof submission & {
      signedFileUrl?: string;
      signed_file_url?: string;
      finalSignedFileUrl?: string;
      final_signed_file_url?: string;
    };

    return (
      submissionWithSigned.finalSignedFileUrl ||
      submissionWithSigned.final_signed_file_url ||
      submissionWithSigned.signedFileUrl ||
      submissionWithSigned.signed_file_url
    );
  })();

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

    toast.success("Silakan lakukan perbaikan dan ajukan kembali.");
    navigate("/mahasiswa/kp/pengajuan");
  };

  /**
   * Navigate to submission page
   */
  const navigateToSubmission = () => {
    navigate("/mahasiswa/kp/pengajuan");
  };

  const navigateToCreateTeam = () => {
    navigate("/mahasiswa/kp/buat-tim");
  };

  /**
   * Check if next button should be enabled
   */
  const isDraftSubmission = submission?.status === "DRAFT";

  const isNextButtonEnabled =
    submission?.status === "APPROVED" || submission?.status === "COMPLETED";

  return (
    <div className="pb-24">
      {/* Header Section */}
      <div className="mb-6 relative pb-2">
        <h1 className="text-xl sm:text-3xl font-bold text-foreground mb-1">
          Halaman Status Pengajuan Kerja Praktik
        </h1>
        <p className="text-sm text-muted-foreground">
          Pantau surat pengantar kerja praktik
        </p>
        <div className="absolute bottom-0 left-0 h-1 w-20 bg-linear-to-r from-blue-600 via-yellow-300 to-red-500 rounded-full" />
      </div>

      <Card className="mb-8 shadow-sm">
        <CardContent className="p-4 sm:p-6">
          {/* Render loading state */}
          {isLoading && <SubmissionLoadingState />}

          {/* Render error state */}
          {!isLoading && error && !submission && (
            <SubmissionErrorState
              error={error}
              onRetry={refetch}
              onNavigateToSubmission={navigateToCreateTeam}
            />
          )}

          {/* Render empty state */}
          {!isLoading && !error && (!submission || isDraftSubmission) && (
            <SubmissionEmptyState
              onNavigateToSubmission={navigateToSubmission}
            />
          )}

          {/* Render timeline */}
          {!isLoading && submission && !isDraftSubmission && (
            <StatusTimeline
              statusHistory={submission.statusHistory}
              currentStatus={submission.status}
              rejectionReason={submission.rejectionReason}
              submittedAt={submission.submittedAt}
              approvedAt={submission.approvedAt}
              documents={submission.documents}
              signedFileUrl={signedFileUrl}
              onResubmit={handleResubmit}
            />
          )}
        </CardContent>
      </Card>

      {/* Sticky Navigation Buttons */}
      {submission && !isLoading && !isDraftSubmission && (
        <div
          className="fixed bottom-0 right-0 z-40 transition-all duration-300 pointer-events-none"
          style={{ left: leftOffset }}
        >
          <div className="max-w-5xl mx-auto flex justify-between items-center gap-4 p-6 pointer-events-auto">
            <Button
              variant="destructive"
              onClick={() => navigate("/mahasiswa/kp/pengajuan")}
              className="flex-none px-4 sm:px-8 py-2 font-semibold bg-[#FF4D4D] hover:bg-red-600 text-white border-none shadow-lg"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <a className="hidden md:inline">Sebelumnya</a>
            </Button>

            <Button
              disabled={!isNextButtonEnabled}
              onClick={() => navigate("/mahasiswa/kp/surat-balasan")}
              className="flex-none px-4 sm:px-8 py-2 font-semibold bg-[#0066FF] hover:bg-blue-700 text-white border-none shadow-lg disabled:opacity-50"
            >
              <a className="hidden md:inline">Selanjutnya</a>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CoverLetterPage;
