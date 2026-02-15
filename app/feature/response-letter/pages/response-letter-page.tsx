import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

import FileUpload from "../components/file-upload";
import StatusDropdown from "../components/status-dropdown";
import { AnnouncementDialog } from "../components/announcement-dialog";
import { submitResponseLetter } from "~/lib/services/response-letter-api";
import { getMyTeams } from "~/feature/create-teams/services/team-api";
import { getSubmissionByTeamId } from "~/lib/services/submission-api";
import { useResponseLetterStatus } from "../hooks/use-response-letter-status";
import {
  ResponseLetterLoadingState,
  ResponseLetterErrorState,
} from "../components/response-letter-states";
import { ResponseLetterTimeline } from "../components/response-letter-timeline";
import { ConfirmDialog } from "../components/confirm-dialog";
import { FileUploadDialog } from "../components/file-upload-dialog";

import { ArrowLeft, ArrowRight, Eye, Info } from "lucide-react";

function ResponseLetterPage() {
  const navigate = useNavigate();
  const { responseLetter, isLoading, error, refetch, isLeader } =
    useResponseLetterStatus();

  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReuploadDialogOpen, setIsReuploadDialogOpen] =
    useState<boolean>(false);
  const [isFileUploadDialogOpen, setIsFileUploadDialogOpen] =
    useState<boolean>(false);

  // Set initial status value from responseLetter when data loads
  useEffect(() => {
    if (responseLetter?.letterStatus) {
      const dropdownValue =
        responseLetter.letterStatus === "approved" ? "disetujui" : "ditolak";
      setStatus(dropdownValue);
    }
  }, [responseLetter]);

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

      const team = teamsResponse.data[0];
      const teamIdValue = team.id;

      // 2. Get submission for this team
      const submissionResponse = await getSubmissionByTeamId(teamIdValue);

      if (!submissionResponse.success || !submissionResponse.data) {
        toast.error(
          "Data pengajuan tidak ditemukan. Silakan buat pengajuan terlebih dahulu.",
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
            response.data.letterStatus === "approved"
              ? "disetujui"
              : "ditolak";
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

  return (
    <>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Halaman Surat Balasan
        </h1>
        <p className="text-muted-foreground">
          Upload surat balasan dan pantau status persetujuan kerja praktik
        </p>
      </div>

      {/* Info Alert */}
      <Alert className="mb-8 border-l-4 border-primary bg-primary/5">
        <Info className="h-5 w-5 text-primary" />
        <AlertDescription className="text-foreground">
          {isLeader
            ? "Pastikan surat balasan telah diupload dengan benar sebelum mengirimkan ke admin"
            : "Anda dapat melihat informasi surat balasan. Hanya ketua tim yang dapat melakukan perubahan."}
        </AlertDescription>
      </Alert>

      {/* Main Form Card */}
      {isLoading ? (
        <Card className="mb-8">
          <CardContent className="p-6">
            <ResponseLetterLoadingState />
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
          <CardContent className="p-6">
            {/* Upload Surat Balasan Section */}
            <CardHeader className="px-0 pt-0">
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
                                size="icon"
                                onClick={handlePreview}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <Eye className="size-5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Preview File</p>
                            </TooltipContent>
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
      <div className="flex justify-between mt-8">
        <Button variant="secondary" asChild className="px-6 py-3 font-medium">
          <Link to="/mahasiswa/kp/surat-pengantar">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Sebelumnya
          </Link>
        </Button>
        <Button
          onClick={() => setShowAnnouncement(true)}
          className="px-6 py-3 font-medium"
        >
          Selanjutnya
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

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
    </>
  );
}

export default ResponseLetterPage;
