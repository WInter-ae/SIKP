import { useState } from "react";
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
  ResponseLetterEmptyState,
} from "../components/response-letter-states";
import { ResponseLetterTimeline } from "../components/response-letter-timeline";

import { ArrowLeft, ArrowRight, Eye, Info } from "lucide-react";

function ResponseLetterPage() {
  const navigate = useNavigate();
  const { responseLetter, isLoading, error, refetch } =
    useResponseLetterStatus();

  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState<string>("");
  const [teamId, setTeamId] = useState<string>("");

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
  };

  const handleStatusChange = (selectedStatus: string) => {
    setStatus(selectedStatus);
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
        letterStatus: (status === "Disetujui" ? "approved" : "rejected") as
          | "approved"
          | "rejected",
      });

      if (response.success) {
        toast.success("Surat balasan berhasil dikirim");

        // Reload data to show timeline
        await refetch();

        // Reset form
        setFile(null);
        setStatus("");
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
    if (file) {
      try {
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, "_blank");
        // Melepas URL objek setelah tab baru dibuka untuk menghindari memory leak
        setTimeout(() => URL.revokeObjectURL(fileURL), 100);
      } catch (error) {
        console.error("Gagal membuat pratinjau file:", error);
        toast.error("Tidak dapat menampilkan pratinjau file.");
      }
    }
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
          Pastikan surat balasan telah diupload dengan benar sebelum mengirimkan
          ke admin
        </AlertDescription>
      </Alert>

      {/* Status Timeline Card - Show if response letter exists */}
      {!isLoading && responseLetter && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">
              Status Surat Balasan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponseLetterTimeline
              letterStatus={responseLetter.letterStatus}
              submittedAt={responseLetter.submittedAt}
              verified={responseLetter.verified}
              verifiedAt={responseLetter.verifiedAt}
              fileUrl={responseLetter.fileUrl}
              originalName={responseLetter.originalName}
            />
          </CardContent>
        </Card>
      )}

      {/* Upload Form Card - Only show if no response letter yet OR if loading/error */}
      {(isLoading || error || !responseLetter) && (
        <Card className="mb-8">
          <CardContent className="p-6">
            {/* Render loading state */}
            {isLoading && <ResponseLetterLoadingState />}

            {/* Render error state */}
            {!isLoading && error && (
              <ResponseLetterErrorState error={error} onRetry={refetch} />
            )}

            {/* Render empty state with upload form */}
            {!isLoading && !error && !responseLetter && (
              <>
                {/* Upload Surat Balasan Section */}
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl font-semibold text-foreground">
                    Upload Surat Balasan
                  </CardTitle>
                </CardHeader>
                <Separator className="mb-4" />
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-grow">
                    <FileUpload
                      label="Surat Balasan dari Perusahaan"
                      onFileChange={handleFileChange}
                    />
                  </div>
                  {file && (
                    <div className="pt-8">
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
                    </div>
                  )}
                </div>

                {/* Status Surat Balasan Section */}
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl font-semibold text-foreground">
                    Status Surat Balasan
                  </CardTitle>
                </CardHeader>
                <Separator className="mb-4" />
                <StatusDropdown value={status} onChange={handleStatusChange} />

                {/* Submit Button */}
                <div className="text-center mt-6">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-3 font-medium"
                  >
                    {isSubmitting ? "Mengirim..." : "Kirim"}
                  </Button>
                </div>
              </>
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
    </>
  );
}

export default ResponseLetterPage;
