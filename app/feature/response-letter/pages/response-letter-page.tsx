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
import ProcessSteps from "../components/process-step";
import { AnnouncementDialog } from "../components/announcement-dialog";
import { submitResponseLetter } from "~/lib/services/response-letter-api";
import { getMyTeams } from "~/feature/create-teams/services/team-api";
import { getSubmissionByTeamId } from "~/lib/services/submission-api";

import { ArrowLeft, ArrowRight, Eye, Info } from "lucide-react";

function ResponseLetterPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [showProcessSteps, setShowProcessSteps] = useState<boolean>(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [submissionId, setSubmissionId] = useState<string>("");
  const [teamId, setTeamId] = useState<string>("");
  const [steps, setSteps] = useState([
    {
      id: 1,
      title: "Mengirimkan Surat Balasan",
      description:
        "Surat balasan telah diterima dan sedang dalam proses review oleh admin",
      status: "submitted" as const,
      visible: false,
    },
    {
      id: 2,
      title: "Pemberian Izin Pengajuan Ulang",
      description:
        "Surat balasan ditolak. Anda diberikan izin untuk mengajukan ulang.",
      status: "rejected" as const,
      visible: false,
    },
    {
      id: 3,
      title: "Persetujuan Kerja Praktik",
      description:
        "Surat balasan disetujui. Kerja praktik Anda telah disetujui.",
      status: "approved" as const,
      visible: false,
    },
  ]);

  useEffect(() => {
    const loadSubmissionData = async () => {
      try {
        setIsLoadingData(true);

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

        const team = teamsResponse.data[0]; // Get first active team
        setTeamId(team.id);
        console.log("✅ Loaded team:", team);

        // 2. Get submission for this team
        const submissionResponse = await getSubmissionByTeamId(team.id);

        if (submissionResponse.success && submissionResponse.data) {
          setSubmissionId(submissionResponse.data.id);
          console.log("✅ Loaded submission status:", submissionResponse.data);
        } else {
          toast.error("Data pengajuan tidak ditemukan. Silakan buat pengajuan terlebih dahulu.");
        }
      } catch (error) {
        console.error("❌ Error loading submission data:", error);
        toast.error("Gagal memuat data pengajuan");
      } finally {
        setIsLoadingData(false);
      }
    };

    void loadSubmissionData();
  }, []);

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

    if (!submissionId || !teamId) {
      toast.error("Data pengajuan tidak ditemukan. Silakan kembali dan coba lagi.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Call API to submit response letter
      const response = await submitResponseLetter({
        submissionId,
        teamId,
        file,
        letterStatus: (status === "Disetujui" ? "approved" : "rejected") as "approved" | "rejected",
      });

      if (response.success) {
        // Show only the first step
        const updatedSteps = steps.map((step, index) => ({
          ...step,
          visible: index === 0,
        }));

        setSteps(updatedSteps);
        setShowProcessSteps(true);

        toast.success("Surat balasan berhasil dikirim");

        // Scroll to the process steps
        setTimeout(() => {
          document
            .getElementById("process-steps-container")
            ?.scrollIntoView({ behavior: "smooth" });
        }, 100);
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
      {isLoadingData ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
            <p className="text-muted-foreground">Memuat data pengajuan...</p>
          </div>
        </div>
      ) : (
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

      <Card className="mb-8">
        <CardContent className="p-6">
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
        </CardContent>
      </Card>

      {showProcessSteps && (
        <div id="process-steps-container">
          <ProcessSteps steps={steps} />
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          variant="secondary"
          asChild
          className="px-6 py-3 font-medium"
        >
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
      )}
    </>
  );
}

export default ResponseLetterPage;
