import { useState } from "react";
import { useNavigate } from "react-router";
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
import DocumentDropdown from "../components/document-dropdown";
import AdditionalInfoForm from "../components/add-info-form";
import { ConfirmDialog } from "../components/confirm-dialog";

import type { AdditionalInfoData, Application, Member } from "../types";
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

  const [collectedFiles, setCollectedFiles] = useState<
    { docId: number; memberId: number; file: File }[]
  >([]);
  const [proposalFile, setProposalFile] = useState<File | null>(null);

  const teamMembers: Member[] = [
    {
      id: 1,
      name: "Adam",
      role: "Ketua",
      nim: "2021001234",
      prodi: "Teknik Informatika",
    },
    {
      id: 2,
      name: "Robin",
      role: "Anggota",
      nim: "2021001235",
      prodi: "Teknik Informatika",
    },
    {
      id: 3,
      name: "Raihan",
      role: "Anggota",
      nim: "2021001236",
      prodi: "Teknik Informatika",
    },
  ];

  const documents = [
    { id: 1, title: "Surat Kesediaan" },
    { id: 2, title: "Form Permohonan" },
    { id: 3, title: "KRS Semester 4" },
    { id: 4, title: "Daftar Kumpulan Nilai" },
    { id: 5, title: "Bukti Pembayaran UKT" },
  ];

  const handleProposalUpload = (file: File) => {
    setProposalFile(file);
  };

  const handleDocumentUpload = (
    docId: number,
    memberId: number,
    file: File,
  ) => {
    const dId = Number(docId);
    const mId = Number(memberId);
    setCollectedFiles((prev) => {
      // Hapus file lama jika ada untuk kombinasi docId dan memberId yang sama
      const filtered = prev.filter(
        (item) => !(item.docId === dId && item.memberId === mId),
      );
      return [...filtered, { docId: dId, memberId: mId, file }];
    });
  };

  const handleAdditionalInfoChange = (data: AdditionalInfoData) => {
    setAdditionalInfo(data);
  };

  // Helper untuk mengubah file menjadi Base64 string agar bisa disimpan di localStorage
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async () => {
    try {
      // 1. Konstruksi Objek Application
      // Note: ID menggunakan Date.now() agar unik dan tidak bentrok dengan mock data admin
      const newApplication: Application = {
        id: Date.now(), // Generate ID unik berdasarkan timestamp
        date: new Date().toLocaleDateString("id-ID"),
        status: "pending",
        supervisor: "Dr. Budi Santoso, M.Kom", // Simulasi data dosen pembimbing (biasanya dari database)
        members: teamMembers,
        internship: additionalInfo,
        documents: [],
      };

      // 2. Masukkan File Proposal
      if (proposalFile) {
        // Konversi ke Base64 jika ukuran < 2MB (batas aman localStorage)
        // Jika lebih, gunakan dummy URL
        const fileUrl =
          proposalFile.size < 2 * 1024 * 1024
            ? await fileToBase64(proposalFile)
            : "#";

        newApplication.documents.push({
          id: `prop-${Date.now()}`,
          title: "Surat Proposal",
          uploadedBy: "Adam (Ketua)",
          uploadDate: new Date().toLocaleDateString("id-ID"),
          status: "uploaded",
          url: fileUrl,
        });
      }

      // 3. Masukkan File Lampiran Anggota
      for (const item of collectedFiles) {
        const docInfo = documents.find((d) => d.id === Number(item.docId));
        const memberInfo = teamMembers.find(
          (m) => m.id === Number(item.memberId),
        );

        if (docInfo && memberInfo) {
          // Proses konversi file satu per satu
          const fileUrl =
            item.file.size < 2 * 1024 * 1024
              ? await fileToBase64(item.file)
              : "#";

          newApplication.documents.push({
            id: `doc-${item.docId}-${item.memberId}-${Date.now()}`,
            title: docInfo.title,
            uploadedBy: memberInfo.name,
            uploadDate: new Date().toLocaleDateString("id-ID"),
            status: "uploaded",
            url: fileUrl,
          });
        }
      }

      // 4. Simpan ke LocalStorage
      const existingData = localStorage.getItem("kp_submissions");
      const submissions = existingData ? JSON.parse(existingData) : [];

      try {
        localStorage.setItem(
          "kp_submissions",
          JSON.stringify([newApplication, ...submissions]),
        );
      } catch (e) {
        if (e instanceof DOMException && e.name === "QuotaExceededError") {
          toast.error(
            "Gagal menyimpan: Ukuran file terlalu besar. Coba kurangi ukuran file.",
          );
          return;
        }
        throw e;
      }

      navigate("/mahasiswa/kp/surat-pengantar");
      setIsConfirmDialogOpen(false);
    } catch {
      toast.error("Terjadi kesalahan saat memproses pengajuan.");
    }
  };

  const handlePreviewProposal = () => {
    if (proposalFile) {
      try {
        const fileURL = URL.createObjectURL(proposalFile);
        window.open(fileURL, "_blank");
        setTimeout(() => URL.revokeObjectURL(fileURL), 100);
      } catch {
        toast.error("Tidak dapat menampilkan pratinjau file.");
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
                onUpload={handleDocumentUpload}
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
