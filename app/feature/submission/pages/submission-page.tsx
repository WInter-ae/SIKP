import { useState } from "react";
import { useNavigate } from "react-router";

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
import DocumentDropdown from "../components/document-dropdown";
import AdditionalInfoForm from "../components/add-info-form";
import { ConfirmDialog } from "../components/confirm-dialog";
import { EyeIcon } from "~/components/icons/eyeicon";

import type { AdditionalInfoData } from "../types";
import { Eye, Info } from "lucide-react";

function SubmissionPage() {
  const navigate = useNavigate();

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfoData>({
    tujuanSurat: "",
    namaTempat: "",
    alamatTempat: "",
    tanggalMulai: "",
    tanggalSelesai: "",
    pembimbingLapangan: "",
  });

  const [proposalFile, setProposalFile] = useState<File | null>(null);

  const teamMembers = [
    { id: 1, name: "Adam", role: "(Ketua)" },
    { id: 2, name: "Robin", role: "" },
    { id: 3, name: "Raihan", role: "" },
  ];

  const documents = [
    { id: 1, title: "Surat Kesediaan" },
    { id: 2, title: "Form Permohonan" },
    { id: 3, title: "KRS Semester 4" },
    { id: 4, title: "Daftar Kumpulan Nilai" },
    { id: 5, title: "Bukti Pembayaran UKT" },
  ];

  const handleProposalUpload = (file: File) => {
    console.log("Proposal uploaded:", file);
    setProposalFile(file);
  };

  const handleAdditionalInfoChange = (data: AdditionalInfoData) => {
    console.log("Additional info changed:", data);
    setAdditionalInfo(data);
  };

  const handleSubmit = () => {
    console.log("Form submitted with data:", { additionalInfo, proposalFile });
    navigate("/mahasiswa/kp/surat-pengantar");
    setIsConfirmDialogOpen(false);
  };

  const handlePreviewProposal = () => {
    if (proposalFile) {
      try {
        const fileURL = URL.createObjectURL(proposalFile);
        window.open(fileURL, "_blank");
        setTimeout(() => URL.revokeObjectURL(fileURL), 100);
      } catch (error) {
        console.error("Gagal membuat pratinjau file:", error);
        alert("Tidak dapat menampilkan pratinjau file.");
      }
    }
  };

  return (
    <>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Halaman Pengajuan Syarat Kerja Praktik
        </h1>
        <p className="text-muted-foreground">
          Upload dokumen-dokumen yang diperlukan untuk melaksanakan Kerja
          Praktik
        </p>
      </div>

      {/* Info Alert */}
      <Alert className="mb-8 border-l-4 border-primary bg-primary/5">
        <Info className="h-5 w-5 text-primary" />
        <AlertDescription className="text-foreground">
          Pastikan semua dokumen telah diupload sebelum melakukan pengajuan
        </AlertDescription>
      </Alert>

      <Card className="mb-8">
        <CardContent className="p-6">
          {/* Surat Proposal Section */}
          <div className="mb-8">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl font-semibold text-foreground">
                Surat Proposal
              </CardTitle>
            </CardHeader>
            <Separator className="mb-4" />
            <div className="flex items-center gap-4">
              <div className="flex-grow">
                <FileUpload
                  label="Upload Surat Proposal (Ketua Tim)"
                  onFileChange={handleProposalUpload}
                />
              </div>
              {proposalFile && (
                <div className="pt-8">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handlePreviewProposal}
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
          </div>

          {/* Lampiran Berkas Pribadi Section */}
          <div className="mb-8">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl font-semibold text-foreground">
                Lampiran Berkas Pribadi
              </CardTitle>
            </CardHeader>
            <Separator className="mb-4" />
            {documents.map((document) => (
              <DocumentDropdown
                key={document.id}
                document={document}
                members={teamMembers}
              />
            ))}
          </div>

          {/* Keterangan Lain Section */}
          <AdditionalInfoForm onDataChange={handleAdditionalInfoChange} />

          {/* Submit Button */}
          <div className="text-center mt-8">
            <Button
              onClick={() => setIsConfirmDialogOpen(true)}
              size="lg"
              className="px-8 py-3 font-medium text-lg"
            >
              Ajukan Surat Pengantar
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        title="Konfirmasi Pengajuan"
        description={
          <>
            Apakah Anda yakin ingin mengajukan surat pengantar? Pastikan semua
            data dan dokumen yang Anda masukkan sudah benar.
            <br />
            <br />
            <span className="block">
              <span className="font-semibold text-red-700">Peringatan:</span>{" "}
              <span className="font-semibold inline-block">
                Anda tidak akan dapat mengubah data pengajuan hingga proses
                review selesai.
              </span>
            </span>
          </>
        }
        onConfirm={handleSubmit}
        confirmText="Ya, Ajukan"
        cancelText="Batal"
        variant="default"
      />
    </>
  );
}

export default SubmissionPage;
