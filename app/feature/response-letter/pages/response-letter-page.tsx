import { useState } from "react";
import { Link, useNavigate } from "react-router";

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

import { ArrowLeft, ArrowRight, Eye, Info } from "lucide-react";

function ResponseLetterPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [showProcessSteps, setShowProcessSteps] = useState<boolean>(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [steps, setSteps] = useState([
    {
      id: 1,
      title: "Mengirimkan Surat Balasan",
      description:
        "Surat balasan telah diterima dan sedang dalam proses review oleh admin",
      icon: "fa-paper-plane",
      status: "submitted" as const,
      visible: false,
    },
    {
      id: 2,
      title: "Pemberian Izin Pengajuan Ulang",
      description:
        "Surat balasan ditolak. Anda diberikan izin untuk mengajukan ulang.",
      icon: "fa-times-circle",
      status: "rejected" as const,
      visible: false,
    },
    {
      id: 3,
      title: "Persetujuan Kerja Praktik",
      description:
        "Surat balasan disetujui. Kerja praktik Anda telah disetujui.",
      icon: "fa-check-circle",
      status: "approved" as const,
      visible: false,
    },
  ]);

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
  };

  const handleStatusChange = (selectedStatus: string) => {
    setStatus(selectedStatus);
  };

  const handleSubmit = () => {
    if (!file) {
      alert("Silakan upload surat balasan terlebih dahulu");
      return;
    }

    if (!status) {
      alert("Silakan pilih status surat balasan terlebih dahulu");
      return;
    }

    // Show only the first step
    const updatedSteps = steps.map((step, index) => ({
      ...step,
      visible: index === 0,
    }));

    setSteps(updatedSteps);
    setShowProcessSteps(true);

    // Scroll to the process steps
    setTimeout(() => {
      document
        .getElementById("process-steps-container")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
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
        alert("Tidak dapat menampilkan pratinjau file.");
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
              className="px-6 py-3 font-medium"
            >
              Kirim
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
  );
}

export default ResponseLetterPage;
