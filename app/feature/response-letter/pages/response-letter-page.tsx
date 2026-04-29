import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

import FileUpload from "../components/file-upload";
import StatusDropdown from "../components/status-dropdown";
import { AnnouncementDialog } from "../components/announcement-dialog";
import { submitResponseLetter } from "~/lib/services/response-letter.service";
import { getMyTeams } from "~/feature/create-teams/services/team-api";
import { getSubmissionByTeamId } from "~/lib/services/submission-api.service";
import { useResponseLetterStatus } from "../hooks/use-response-letter-status";
import { get, post } from "~/lib/api-client";
import {
  ResponseLetterLoadingState,
  ResponseLetterErrorState,
} from "../components/response-letter-states";
import { ResponseLetterTimeline } from "../components/response-letter-timeline";
import { ConfirmDialog } from "../components/confirm-dialog";
import { FileUploadDialog } from "../components/file-upload-dialog";

import { AlertCircle, ArrowLeft, ArrowRight, Info } from "lucide-react";

function ResponseLetterPage() {
  const navigate = useNavigate();
  const {
    responseLetter,
    isLoading,
    error,
    refetch,
    isLeader,
    hasTeam,
    canManageResponseLetter,
    blockedReason,
  } = useResponseLetterStatus();

  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReuploadDialogOpen, setIsReuploadDialogOpen] =
    useState<boolean>(false);
  const [isFileUploadDialogOpen, setIsFileUploadDialogOpen] =
    useState<boolean>(false);
  const [isResettingTeam, setIsResettingTeam] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<{
    verified: boolean;
    letterStatus: "approved" | "rejected" | null;
  }>({
    verified: false,
    letterStatus: null,
  });

  // Set initial status value from responseLetter when data loads
  useEffect(() => {
    if (responseLetter?.letterStatus) {
      const dropdownValue =
        responseLetter.letterStatus === "approved" ? "disetujui" : "ditolak";
      setStatus(dropdownValue);

      // Set verification status
      setVerificationStatus({
        verified: responseLetter.verified || false,
        letterStatus: responseLetter.letterStatus,
      });
    }
  }, [responseLetter]);

  // Auto-poll verification status every 3 seconds
  useEffect(() => {
    if (!responseLetter?.id) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await get<{
          verified: boolean;
          letterStatus: "approved" | "rejected" | null;
          teamWasReset: boolean;
          verifiedAt: string | null;
        }>(`/api/response-letters/${responseLetter.id}/status`);

        if (response.success && response.data) {
          setVerificationStatus({
            verified: response.data.verified,
            letterStatus: response.data.letterStatus,
          });

          // If team was reset due to rejection
          if (response.data.teamWasReset) {
            clearInterval(pollInterval);
            toast.error(
              "Tim Anda telah direset. Silakan mulai dari awal dengan membuat/menetapkan tim baru.",
            );
            setTimeout(() => {
              navigate("/mahasiswa/kp/buat-tim");
            }, 2000);
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [responseLetter?.id, navigate]);

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
  };

  const handleStatusChange = (selectedStatus: string) => {
    setStatus(selectedStatus);
  };

  const handleReuploadConfirm = () => {
    // If no responseLetter (before submit), open file upload dialog
    if (!responseLetter) {
      setIsReuploadDialogOpen(false);
      setIsFileUploadDialogOpen(true);
    } else {
      // If responseLetter exists, just close the dialog
      // Upload is locked after submit
      setIsReuploadDialogOpen(false);
    }
  };

  const handleFileUploadFromDialog = (newFile: File) => {
    setFile(newFile);
    setIsFileUploadDialogOpen(false);
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Silakan upload surat balasan terlebih dahulu");
      return;
    }

    if (!status) {
      toast.error("Silakan pilih status surat balasan terlebih dahulu");
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Get user's team
      const teamsResponse = await getMyTeams();

      if (
        !teamsResponse.success ||
        !teamsResponse.data ||
        teamsResponse.data.length === 0
      ) {
        toast.error("Anda belum bergabung dengan tim manapun");
        return;
      }

      const fixedTeam = teamsResponse.data.find(
        (team) => team.status?.toUpperCase() === "FIXED",
      );

      if (!fixedTeam) {
        toast.error(
          "Tim tidak ditemukan. Silakan tetapkan tim terlebih dahulu.",
        );
        return;
      }

      const teamIdValue = fixedTeam.id;

      // 2. Get submission for this team
      const submissionResponse = await getSubmissionByTeamId(teamIdValue);

      if (!submissionResponse.success || !submissionResponse.data) {
        toast.error(
          "Data pengajuan tidak ditemukan. Silakan buat pengajuan terlebih dahulu.",
        );
        return;
      }

      const submission =
        submissionResponse.data as typeof submissionResponse.data & {
          workflowStage?: string;
        };
      const submissionStatus = submission.status?.toUpperCase();
      const submissionStage = submission.workflowStage?.toUpperCase();
      const isSubmissionApproved =
        submissionStatus === "APPROVED" ||
        submissionStatus === "COMPLETED" ||
        submissionStage === "COMPLETED";

      if (!isSubmissionApproved) {
        const isDraftSubmission = submissionStatus === "DRAFT";
        toast.error(
          isDraftSubmission
            ? "Pengajuan belum diajukan. Silakan ajukan pengajuan terlebih dahulu."
            : "Surat pengantar belum disetujui. Anda belum dapat mengisi surat balasan.",
        );
        return;
      }

      const submissionIdValue = submissionResponse.data.id;

      // 3. Call API to submit response letter
      const response = await submitResponseLetter({
        submissionId: submissionIdValue,
        teamId: teamIdValue,
        file,
        letterStatus: (status === "disetujui" ? "approved" : "rejected") as
          | "approved"
          | "rejected",
      });

      if (response.success) {
        toast.success("Surat balasan berhasil dikirim");

        // Restore status value immediately from response (response.data contains letterStatus)
        if (response.data?.letterStatus) {
          const dropdownValue =
            response.data.letterStatus === "approved" ? "disetujui" : "ditolak";
          setStatus(dropdownValue);
        }

        // Reload data to show timeline
        await refetch();

        // Reset file but keep status
        setFile(null);
      } else {
        toast.error(response.message || "Gagal mengirim surat balasan");
      }
    } catch (error) {
      console.error("Error submitting response letter:", error);
      toast.error("Terjadi kesalahan saat mengirim surat balasan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    // Priority 1: Use R2 fileUrl if available (from saved responseLetter)
    if (responseLetter?.fileUrl) {
      window.open(responseLetter.fileUrl, "_blank", "noopener,noreferrer");
      return;
    }

    // Priority 2: Use local blob URL if file is newly selected
    if (file) {
      try {
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(fileURL), 100);
        return;
      } catch {
        toast.error("Tidak dapat menampilkan pratinjau file.");
        return;
      }
    }

    toast.error("File surat balasan belum tersedia untuk dipreview.");
  };

  const handleNextPage = () => {
    setShowAnnouncement(false);
    navigate("/mahasiswa/kp/saat-magang");
  };

  const handleResetTeam = async () => {
    setShowResetConfirm(true);
  };

  const confirmResetTeam = async () => {
    try {
      setIsResettingTeam(true);
      setShowResetConfirm(false);

      // Call reset endpoint
      const teamsResponse = await post<{ success: boolean }>(
        "/api/teams/reset",
      );

      if (teamsResponse.success) {
        toast.success("Tim berhasil direset. Silakan mulai proses dari awal.");
        setTimeout(() => {
          navigate("/mahasiswa/kp/buat-tim");
        }, 1500);
      } else {
        toast.error(
          teamsResponse.message || "Gagal mereset tim. Silakan coba lagi.",
        );
      }
    } catch (error) {
      console.error("Reset error:", error);
      toast.error("Terjadi kesalahan saat mereset tim");
    } finally {
      setIsResettingTeam(false);
    }
  };

  return (
    <>
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-3xl font-bold text-foreground mb-1">
          Halaman Surat Balasan
        </h1>
        <p className="text-sm text-muted-foreground">
          Upload surat balasan dan pantau status persetujuan kerja praktik
        </p>
      </div>

      {/* Info Alert */}
      {hasTeam && canManageResponseLetter && (
        <Alert className="mb-8 border-l-4 border-primary bg-primary/5">
          <Info className="h-5 w-5 text-primary" />
          <AlertDescription className="text-foreground">
            {verificationStatus.verified &&
            verificationStatus.letterStatus === "approved"
              ? "Surat balasan telah diverifikasi. Anda dapat melanjutkan ke tahap berikutnya."
              : isLeader
                ? "Pastikan surat balasan telah diupload dengan benar sebelum mengirimkan ke admin"
                : "Anda dapat melihat informasi surat balasan. Hanya ketua tim yang dapat melakukan perubahan."}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Form Card */}
      {isLoading ? (
        <Card className="mb-8">
          <CardContent className="p-6">
            <ResponseLetterLoadingState />
          </CardContent>
        </Card>
      ) : !hasTeam ? (
        <Card className="mb-8">
          <CardContent className="flex min-h-[220px] items-center justify-center p-6">
            <div className="flex flex-col items-center gap-4">
              <Alert
                variant="destructive"
                className="w-full max-w-md items-start border-l-4 border-destructive bg-destructive/5 px-4 py-3"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
                <AlertDescription className="text-sm text-destructive">
                  Tim tidak ditemukan. Silakan tetapkan tim terlebih dahulu.
                </AlertDescription>
              </Alert>
              <Button onClick={() => navigate("/mahasiswa/kp/buat-tim")}>
                Kembali ke Buat Tim
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : !canManageResponseLetter ? (
        <Card className="mb-8">
          <CardContent className="flex min-h-[220px] items-center justify-center p-6">
            <div className="flex flex-col items-center gap-4">
              <Alert
                variant="destructive"
                className="w-full max-w-md items-start border-l-4 border-destructive bg-destructive/5 px-4 py-3"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
                <AlertDescription className="text-sm text-destructive">
                  {blockedReason ||
                    "Akses surat balasan belum tersedia. Silakan ajukan pengajuan terlebih dahulu."}
                </AlertDescription>
              </Alert>
              <Button onClick={() => navigate("/mahasiswa/kp/pengajuan")}>
                Kembali ke Pengajuan
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : error && !responseLetter ? (
        <Card className="mb-8">
          <CardContent className="p-6">
            <ResponseLetterErrorState error={error} onRetry={refetch} />
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8">
          <CardContent>
            {/* Upload Surat Balasan Section */}
            <CardHeader className="px-0 pt-0 mb-2">
              <CardTitle className="text-xl font-semibold text-foreground">
                Upload Surat Balasan
              </CardTitle>
            </CardHeader>
            <Separator className="mb-4" />

            {/* Upload Area - Conditional based on file selection and responseLetter */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-grow">
                {file || responseLetter ? (
                  // After file selection OR after submission: Show "Terupload" button or "Belum Diupload"
                  <div className="mb-2">
                    <p className="block font-medium mb-2">
                      Surat Balasan dari Perusahaan
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {isLeader ? (
                        // Leader: Show "Terupload" button
                        <Button
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => setIsReuploadDialogOpen(true)}
                          disabled={!!responseLetter} // Disabled after submit
                        >
                          Terupload
                        </Button>
                      ) : (
                        // Non-leader: Show "Belum Diupload" or "Terupload" (disabled)
                        <Button
                          size="sm"
                          className="w-full sm:w-auto"
                          disabled
                          variant={responseLetter ? "default" : "destructive"}
                        >
                          {responseLetter ? "Terupload" : "Belum Diupload"}
                        </Button>
                      )}
                      {(file || responseLetter?.fileUrl) && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handlePreview}
                                className="border border-border hover:bg-muted"
                              >
                                Lihat
                              </Button>
                            </TooltipTrigger>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {responseLetter
                        ? "Upload sudah dikunci setelah pengiriman."
                        : !isLeader
                          ? "Hanya ketua tim yang dapat upload surat balasan."
                          : "Klik untuk upload ulang surat balasan."}
                    </p>
                  </div>
                ) : isLeader ? (
                  // Before file selection for leader: Show FileUpload component
                  <FileUpload
                    label="Surat Balasan dari Perusahaan"
                    onFileChange={handleFileChange}
                  />
                ) : (
                  // Before file selection for non-leader: Show "Belum Diupload"
                  <div className="mb-2">
                    <p className="block font-medium mb-2">
                      Surat Balasan dari Perusahaan
                    </p>
                    <Button
                      size="sm"
                      className="w-full sm:w-auto"
                      disabled
                      variant="destructive"
                    >
                      Belum Diupload
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Hanya ketua tim yang dapat upload surat balasan.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Status Surat Balasan Section */}
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl font-semibold text-foreground">
                Status Surat Balasan
              </CardTitle>
            </CardHeader>
            <Separator className="mb-4" />
            <StatusDropdown
              value={status}
              onChange={handleStatusChange}
              disabled={!!responseLetter || !isLeader} // Disabled after submit or for non-leader
            />
            {!isLeader && (
              <p className="text-xs text-muted-foreground mt-2">
                Hanya ketua tim yang dapat menentukan status surat balasan.
              </p>
            )}

            {/* Submit Button - Only show before submission and for team leader */}
            {!responseLetter && isLeader && (
              <div className="text-center mt-6">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-3 font-medium"
                >
                  {isSubmitting ? "Mengirim..." : "Kirim"}
                </Button>
              </div>
            )}

            {/* Status Timeline - Show after submission */}
            {responseLetter && (
              <div className="mt-8 pt-6 border-t border-border">
                <ResponseLetterTimeline
                  letterStatus={responseLetter.letterStatus}
                  submittedAt={responseLetter.submittedAt}
                  verified={responseLetter.verified}
                  verifiedAt={responseLetter.verifiedAt}
                  fileUrl={responseLetter.fileUrl}
                  originalName={responseLetter.originalName}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      {hasTeam && canManageResponseLetter && (
        <div className="flex justify-between items-center gap-2 mt-6">
          <Button variant="secondary" asChild className="px-6 py-3 font-medium">
            <Link to="/mahasiswa/kp/surat-pengantar">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Sebelumnya
            </Link>
          </Button>
          {/* Next Button - Different behavior based on verification status */}
          {verificationStatus.verified &&
          verificationStatus.letterStatus === "approved" ? (
            <Button
              onClick={() => setShowAnnouncement(true)}
              className="px-6 py-3 font-medium"
            >
              Selanjutnya
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : verificationStatus.verified &&
            verificationStatus.letterStatus === "rejected" ? (
            <Button
              onClick={handleResetTeam}
              disabled={isResettingTeam}
              className="px-6 py-3 font-medium bg-amber-600 hover:bg-amber-700"
            >
              {isResettingTeam ? "Mereset..." : "Mulai Ulang"}
            </Button>
          ) : (
            <Button disabled className="px-6 py-3 font-medium opacity-50">
              Selanjutnya
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      <AnnouncementDialog
        open={showAnnouncement}
        onOpenChange={setShowAnnouncement}
        title=""
        description={
          <>
            Selamat Melaksanakan Kerja Praktik.
            <br />
            <span>Semangat!</span>
          </>
        }
        onConfirm={handleNextPage}
        confirmText="Lanjutkan"
      />

      <ConfirmDialog
        open={isReuploadDialogOpen}
        onOpenChange={setIsReuploadDialogOpen}
        title="Upload Ulang Surat Balasan"
        description="Apakah Anda ingin upload ulang surat balasan?"
        onConfirm={handleReuploadConfirm}
        confirmText="Lanjutkan"
        cancelText="Batal"
      />

      <FileUploadDialog
        open={isFileUploadDialogOpen}
        onOpenChange={setIsFileUploadDialogOpen}
        onFileUpload={handleFileUploadFromDialog}
      />

      {/* Reset Team Confirmation Dialog */}
      <ConfirmDialog
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        title="Mulai Ulang Proses KP"
        description="Surat balasan Anda telah ditolak oleh admin. Apakah Anda yakin ingin memulai ulang proses dari awal? Semua data tim akan direset dan data submission sebelumnya akan terhapus."
        onConfirm={confirmResetTeam}
        confirmText="Ya, Mulai Ulang"
        cancelText="Batal"
        variant="destructive"
      />
    </>
  );
}

export default ResponseLetterPage;
