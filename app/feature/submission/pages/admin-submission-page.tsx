import { useState, useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import * as mammoth from "mammoth";
import "quill/dist/quill.snow.css";
import * as FileSaver from "file-saver";
import { toast } from "sonner";
import {
  Eye,
  CheckCircle,
  XCircle,
  Download,
  FileText,
  Upload,
  Users,
  Calendar,
  MapPin,
  Building,
  User,
  FileCheck,
} from "lucide-react";
import type { HtmlToDocxFunction } from "~/../../html-to-docx";
import { Textarea } from "~/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { useQuill } from "~/hooks/use-quill";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface Submission {
  id: number;
  teamName: string;
  members: string[];
  submissionDate: string;
  status: "Menunggu" | "Disetujui" | "Ditolak";
  // Data dari form "Keterangan Lain"
  tujuanSurat: string;
  namaTempat: string;
  alamatTempat: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  pembimbingLapangan: string;
  // Dokumen yang diupload
  documents: { title: string; fileName: string; uploader: string }[];
  proposalFile: string;
}

function AdminSubmissionPage() {
  const [submissions] = useState<Submission[]>([
    {
      id: 1,
      teamName: "Tim Adam",
      members: ["Adam (Ketua)", "Robin", "Raihan"],
      submissionDate: "20/07/2025",
      status: "Menunggu",
      tujuanSurat: "Kepala Divisi HRD",
      namaTempat: "PT. Teknologi Maju",
      alamatTempat: "Jl. Inovasi No. 123, Jakarta",
      tanggalMulai: "01/08/2025",
      tanggalSelesai: "01/11/2025",
      pembimbingLapangan: "Bpk. Budi Santoso",
      documents: [
        {
          title: "Surat Kesediaan",
          fileName: "surat_kesediaan_adam.pdf",
          uploader: "Adam",
        },
        {
          title: "KRS Semester 4",
          fileName: "krs_robin.pdf",
          uploader: "Robin",
        },
        {
          title: "Daftar Kumpulan Nilai",
          fileName: "dkn_raihan.pdf",
          uploader: "Raihan",
        },
      ],
      proposalFile: "proposal_tim_adam.pdf",
    },
    {
      id: 2,
      teamName: "Individu B",
      members: ["B (Individu)"],
      submissionDate: "21/07/2025",
      status: "Disetujui",
      tujuanSurat: "Manager of Engineering",
      namaTempat: "Startup Cepat Berkembang",
      alamatTempat: "Jl. Digital Raya No. 45, Bandung",
      tanggalMulai: "15/08/2025",
      tanggalSelesai: "15/11/2025",
      pembimbingLapangan: "Ibu. Citra Lestari",
      documents: [
        {
          title: "Surat Kesediaan",
          fileName: "surat_kesediaan_b.pdf",
          uploader: "B",
        },
      ],
      proposalFile: "proposal_individu_b.pdf",
    },
  ]);

  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null,
  );
  const [comment, setComment] = useState("");
  const [coverLetterTemplate, setCoverLetterTemplate] = useState<File | null>(
    null,
  );
  // State untuk editor
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editorHtml, setEditorHtml] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleViewDetail = (submission: Submission) => {
    setSelectedSubmission(submission);
    setShowDetailDialog(true);
  };

  const handleApprove = (submission: Submission) => {
    setSelectedSubmission(submission);
    setActionType("approve");
    setShowActionDialog(true);
  };

  const handleReject = (submission: Submission) => {
    setSelectedSubmission(submission);
    setActionType("reject");
    setShowActionDialog(true);
  };

  const handleSubmitAction = () => {
    if (actionType === "reject" && !comment.trim()) {
      toast.error("Komentar wajib diisi untuk penolakan.");
      return;
    }

    const action = actionType === "approve" ? "disetujui" : "ditolak";
    const message = comment
      ? `Pengajuan dari ${selectedSubmission?.teamName} berhasil ${action}! Komentar: ${comment}`
      : `Pengajuan dari ${selectedSubmission?.teamName} berhasil ${action}!`;
    toast.success(message);

    // Logika untuk generate surat pengantar bisa tarok di sini
    if (actionType === "approve") {
      console.log(
        "Generating cover letter from template:",
        coverLetterTemplate,
      );
      console.log("Using data:", selectedSubmission);
    }

    setShowActionDialog(false);
    setComment("");
    setActionType(null);
    setSelectedSubmission(null);
  };

  const handleTemplateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) {
      return;
    }

    const file = e.target.files[0];
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB

    // Validate file size
    if (file.size > maxSizeInBytes) {
      alert("Ukuran file melebihi batas maksimum 10MB. Silakan pilih file yang lebih kecil.");
      e.target.value = ""; // Reset input
      return;
    }

    // Validate file type by checking magic bytes and internal structure
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Check for ZIP signature (0x504B0304) which is used by .docx files
      const hasZipSignature = bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04;
      
      if (!hasZipSignature) {
        alert("File yang dipilih bukan format Word Document (.docx) yang valid. Silakan pilih file .docx yang benar.");
        e.target.value = ""; // Reset input
        return;
      }

      // Verify it's actually a .docx file by checking for expected internal structure
      const zip = new PizZip(arrayBuffer);
      const hasContentTypes = zip.files["[Content_Types].xml"] !== undefined;
      const hasWordDocument = zip.files["word/document.xml"] !== undefined;
      
      if (!hasContentTypes || !hasWordDocument) {
        alert("File yang dipilih bukan format Word Document (.docx) yang valid. Silakan pilih file .docx yang benar.");
        e.target.value = ""; // Reset input
        return;
      }

      // All validations passed
      setCoverLetterTemplate(file);
      alert(`Template "${file.name}" berhasil diupload.`);
    } catch (error) {
      console.error("Error validating file:", error);
      alert("Terjadi kesalahan saat memvalidasi file. Silakan coba lagi.");
      e.target.value = ""; // Reset input
    }
  };

  const handleReviewAndEdit = async () => {
    if (!coverLetterTemplate) {
      toast.error("Silakan unggah file template .docx terlebih dahulu.");
      return;
    }
    setIsEditing(true);

    try {
      const arrayBuffer = await coverLetterTemplate.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setEditorHtml(result.value); // result.value berisi HTML yang dikonversi
      setShowEditDialog(true);
    } catch (error) {
      console.error("Gagal mengonversi .docx ke HTML", error);
      toast.error("Gagal memuat pratinjau. Pastikan file adalah .docx yang valid.");
    } finally {
      setIsEditing(false);
    }
  };

  const handleSaveEditedDocument = async (editorHtml: string) => {
    if (!editorHtml) {
      toast.error("Tidak ada konten untuk disimpan.");
      return;
    }

    try {
      // Attempt to dynamically import the html-to-docx module
      let htmlToDocx: HtmlToDocxFunction;
      try {
        htmlToDocx = (await import("html-to-docx")).default;
      } catch (importError) {
        console.error("Gagal memuat modul html-to-docx:", importError);
        alert(
          "Gagal memuat modul yang diperlukan untuk mengonversi dokumen. Silakan coba lagi atau hubungi administrator.",
        );
        return;
      }

      // Attempt to convert HTML to DOCX
      const fileBuffer = await htmlToDocx(editorHtml, undefined, {
        table: { row: { cantSplit: true } },
        footer: true,
        pageNumber: true,
      });

      FileSaver.saveAs(
        fileBuffer as Blob,
        `EDITED_${coverLetterTemplate?.name || "template"}.docx`,
      );
      setShowEditDialog(false);
      toast.success("Dokumen yang diedit berhasil disimpan!");
    } catch (error) {
      console.error("Gagal menyimpan dokumen yang diedit:", error);
      toast.error("Terjadi kesalahan saat menyimpan dokumen.");
    }
  };

  const resetActionState = () => {
    setShowActionDialog(false);
    setComment("");
    setActionType(null);
  };
  const handleGenerateLetter = () => {
    if (!coverLetterTemplate || !selectedSubmission) {
      toast.error("Silakan unggah template dan pilih pengajuan terlebih dahulu.");
      return;
    }

    const reader = new FileReader();
    reader.readAsArrayBuffer(coverLetterTemplate);
    reader.onload = (e) => {
      const content = e.target?.result;
      if (!content) {
        toast.error("Gagal membaca file template.");
        return;
      }

      try {
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
          nullGetter: (part) => {
            console.warn(
              `Placeholder {${part.value}} tidak ditemukan dalam data.`,
            );
            return "";
          },
        });

        // Set data untuk mengisi template
        doc.setData({
          teamName: selectedSubmission.teamName,
          members: selectedSubmission.members.join(", "),
          tujuanSurat: selectedSubmission.tujuanSurat,
          namaTempat: selectedSubmission.namaTempat,
          alamatTempat: selectedSubmission.alamatTempat,
          tanggalMulai: selectedSubmission.tanggalMulai,
          tanggalSelesai: selectedSubmission.tanggalSelesai,
        });

        doc.render(); // Lakukan penggantian placeholder
        const out = doc.getZip().generate({
          type: "blob",
          mimeType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        FileSaver.saveAs(
          out,
          `Surat_Pengantar_${selectedSubmission.teamName}.docx`,
        );
        handleSubmitAction(); // Tandai selesai setelah generate berhasil
      } catch (error) {
        // Log full error details for debugging
        if (error instanceof Error) {
          console.error("Error generating document:", error, error.stack);
        } else {
          console.error("Error generating document:", error);
        }

        // Provide more specific user-facing error messages
        let userMessage = "Terjadi kesalahan saat membuat dokumen.";
        if (error instanceof Error) {
          if (
            error.message.includes("File mungkin korup") ||
            error.message.includes("corrupt") ||
            error.message.includes("zip") ||
            error.message.includes("not a valid")
          ) {
            userMessage =
              "Template .docx tidak valid atau korup. Silakan unggah file template yang benar.";
          } else if (
            error.message.includes("Placeholder") ||
            error.message.includes("not found") ||
            error.message.includes("undefined")
          ) {
            userMessage =
              "Beberapa placeholder pada template tidak ditemukan dalam data. Periksa kembali template dan data yang diisi.";
          } else if (
            error.message.includes("Cannot read property") ||
            error.message.includes("undefined")
          ) {
            userMessage =
              "Terjadi kesalahan pada data yang dimasukkan. Pastikan semua field telah diisi dengan benar.";
          } else if (
            error.message.includes("docxtemplater") ||
            error.message.includes("Docxtemplater")
          ) {
            userMessage =
              "Terjadi kesalahan saat memproses template. Pastikan template sesuai format yang didukung.";
          } else {
            // Optionally, append the error message for advanced users
            userMessage += " " + error.message;
          }
        }
        toast.error(userMessage);
      }
    };
  };

  const getStatusBadge = (status: Submission["status"]) => {
    switch (status) {
      case "Disetujui":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Disetujui
          </Badge>
        );
      case "Ditolak":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Ditolak
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">
            <Calendar className="w-3 h-3 mr-1" />
            Menunggu
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Pengajuan Kerja Praktik
          </h1>
          <p className="text-muted-foreground mt-2">
            Kelola dan review pengajuan syarat kerja praktik dari mahasiswa.
          </p>
        </div>

        {/* Template Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Template Surat Pengantar
            </CardTitle>
            <CardDescription>
              Upload template surat pengantar (.docx) untuk digenerate otomatis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1 w-full">
                <Input
                  id="template-upload"
                  type="file"
                  accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleTemplateUpload}
                  className="cursor-pointer"
                />
              </div>
              <Button
                variant="outline"
                onClick={handleReviewAndEdit}
                disabled={!coverLetterTemplate || isEditing}
                className="w-full sm:w-auto"
              >
                <Eye className="w-4 h-4 mr-2" />
                {isEditing ? "Memuat..." : "Review & Edit"}
              </Button>
            </div>
            {coverLetterTemplate && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <FileCheck className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-300">
                  Template aktif:{" "}
                  <span className="font-medium">{coverLetterTemplate.name}</span>
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submissions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Daftar Pengajuan
            </CardTitle>
            <CardDescription>
              {submissions.length} pengajuan terdaftar
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Tim / Mahasiswa
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                      Tanggal Pengajuan
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {submissions.map((submission) => (
                    <tr
                      key={submission.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {submission.teamName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {submission.members.join(", ")}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-muted-foreground">
                          {submission.submissionDate}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(submission.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleViewDetail(submission)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Lihat Detail</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleApprove(submission)}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Setujui</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleReject(submission)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Tolak</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="min-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Detail Pengajuan KP
              </DialogTitle>
              <DialogDescription>
                Detail lengkap pengajuan dari {selectedSubmission?.teamName}.
              </DialogDescription>
            </DialogHeader>

            {selectedSubmission && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Team Information */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Informasi Tim
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                          Nama Tim/Mahasiswa
                        </Label>
                        <p className="text-sm font-medium">
                          {selectedSubmission.teamName}
                        </p>
                      </div>
                      <Separator />
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                          Anggota
                        </Label>
                        <p className="text-sm">
                          {selectedSubmission.members.join(", ")}
                        </p>
                      </div>
                      <Separator />
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                          Tanggal Pengajuan
                        </Label>
                        <p className="text-sm">
                          {selectedSubmission.submissionDate}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Other Details */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Keterangan Lain
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                          Tujuan Surat
                        </Label>
                        <p className="text-sm">
                          {selectedSubmission.tujuanSurat}
                        </p>
                      </div>
                      <Separator />
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                          Nama Tempat KP
                        </Label>
                        <p className="text-sm">
                          {selectedSubmission.namaTempat}
                        </p>
                      </div>
                      <Separator />
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                          Alamat Tempat KP
                        </Label>
                        <p className="text-sm flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                          {selectedSubmission.alamatTempat}
                        </p>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                            Tanggal Mulai
                          </Label>
                          <p className="text-sm flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {selectedSubmission.tanggalMulai}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                            Tanggal Selesai
                          </Label>
                          <p className="text-sm flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {selectedSubmission.tanggalSelesai}
                          </p>
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                          Pembimbing Lapangan
                        </Label>
                        <p className="text-sm flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          {selectedSubmission.pembimbingLapangan}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Documents */}
                <div>
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Dokumen Terlampir
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Proposal KP */}
                      <div className="flex items-center justify-between p-3 rounded-lg border bg-primary/5 hover:bg-primary/10 transition-colors">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              Proposal KP
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {selectedSubmission.proposalFile}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>

                      {/* Other Documents */}
                      {selectedSubmission.documents.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">
                                {doc.title}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {doc.fileName} • {doc.uploader}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            <DialogFooter className="border-t pt-4">
              <Button
                variant="outline"
                onClick={() => setShowDetailDialog(false)}
              >
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Approve/Reject Dialog */}
        <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {actionType === "approve" ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Setujui Pengajuan
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    Tolak Pengajuan
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {selectedSubmission &&
                  (actionType === "approve"
                    ? `Anda akan menyetujui pengajuan dari ${selectedSubmission.teamName}. Surat pengantar akan digenerate berdasarkan template.`
                    : `Apakah Anda yakin ingin menolak pengajuan dari ${selectedSubmission.teamName}?`)}
              </DialogDescription>
            </DialogHeader>

            {actionType === "approve" && selectedSubmission && (
              <Card className="bg-muted/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Generate Surat Pengantar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Surat akan digenerate menggunakan template{" "}
                    <span className="font-medium text-foreground">
                      {coverLetterTemplate?.name || "[Belum Diupload]"}
                    </span>
                  </p>
                  <div className="space-y-2 p-3 bg-background rounded-lg border">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Tim:</span>
                      <span>{selectedSubmission.teamName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Tujuan:</span>
                      <span>
                        {selectedSubmission.tujuanSurat},{" "}
                        {selectedSubmission.namaTempat}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Alamat:</span>
                      <span>{selectedSubmission.alamatTempat}</span>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleGenerateLetter}
                    disabled={!coverLetterTemplate}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Surat Pengantar
                  </Button>
                </CardContent>
              </Card>
            )}

            {actionType === "reject" && (
              <div className="space-y-3">
                <Label htmlFor="comment">
                  Komentar Penolakan <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Masukkan alasan penolakan..."
                  rows={4}
                />
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={resetActionState}>
                Batal
              </Button>
              <Button
                onClick={handleSubmitAction}
                variant={actionType === "approve" ? "default" : "destructive"}
              >
                {actionType === "approve"
                  ? "Tandai Selesai (Tanpa Generate)"
                  : "Tolak Pengajuan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Template Dialog */}
        {showEditDialog && (
          <EditorDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            initialHtml={editorHtml}
            onSave={handleSaveEditedDocument}
          />
        )}
      </div>
    </div>
  );
}

function EditorDialog({
  open,
  onOpenChange,
  initialHtml,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialHtml: string;
  onSave: (html: string) => void;
}) {
  const { quill, quillRef } = useQuill();
  const contentRef = useRef(initialHtml);
  const contentInitializedRef = useRef(false);

  useEffect(() => {
    contentInitializedRef.current = false;
  }, [initialHtml]);

  useEffect(() => {
    if (quill) {
      if (!contentInitializedRef.current) {
        // Sanitize HTML before pasting to prevent XSS vulnerabilities
        const sanitizedHtml = DOMPurify.sanitize(initialHtml);
        quill.clipboard.dangerouslyPasteHTML(sanitizedHtml);
        contentInitializedRef.current = true;
      }

      const handleChange = () => {
        contentRef.current = quill.root.innerHTML;
      };

      quill.on("text-change", handleChange);

      return () => {
        quill.off("text-change", handleChange);
      };
    }
  }, [quill, initialHtml]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Review & Edit Template Surat
          </DialogTitle>
          <DialogDescription>
            Lakukan perubahan pada konten template. Perubahan akan disimpan
            sebagai file .docx baru.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow h-full overflow-y-auto bg-background border rounded-lg">
          <div ref={quillRef} className="h-full" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={() => onSave(contentRef.current)}>
            <Download className="w-4 h-4 mr-2" />
            Simpan Perubahan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AdminSubmissionPage;
