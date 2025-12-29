import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Separator } from "~/components/ui/separator";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Info, FileText, User, Edit, Upload } from "lucide-react";
import { toast } from "sonner";

import TitleSubmissionForm from "../components/title-submission-form";
import TitleChangeForm from "../components/title-change-form";
import LecturerSelectionForm from "../components/lecturer-selection-form";
import ReportUploadForm from "../components/report-upload-form";

import type { DosenPembimbing, LaporanKPData } from "../types";

export default function KPReportPage() {
  // Mock data - in real app, this would come from API/database
  const [activeTab, setActiveTab] = useState("judul");
  
  const [reportData, setReportData] = useState<LaporanKPData>({
    judul: "",
    statusJudul: "draft",
    dosenPembimbing: undefined,
  });

  const [titleChangeStatus, setTitleChangeStatus] = useState<
    "none" | "diajukan" | "disetujui" | "ditolak"
  >("none");

  const [currentReport, setCurrentReport] = useState<{
    namaFile: string;
    tanggalUpload: string;
    ukuranFile: string;
    status: "draft" | "disubmit" | "revisi" | "disetujui";
  } | undefined>(undefined);

  // Mock lecturer data from team
  const currentLecturer: DosenPembimbing = {
    id: "1",
    nama: "Dr. Ir. Ahmad Suhendra, M.Kom",
    nip: "197801012005011001",
    email: "ahmad.suhendra@university.ac.id",
  };

  // Mock available lecturers
  const availableLecturers: DosenPembimbing[] = [
    {
      id: "1",
      nama: "Dr. Ir. Ahmad Suhendra, M.Kom",
      nip: "197801012005011001",
      email: "ahmad.suhendra@university.ac.id",
    },
    {
      id: "2",
      nama: "Dr. Budi Santoso, S.Kom, M.T",
      nip: "198205152008121002",
      email: "budi.santoso@university.ac.id",
    },
    {
      id: "3",
      nama: "Dr. Citra Dewi, S.Si, M.Kom",
      nip: "198509202010122001",
      email: "citra.dewi@university.ac.id",
    },
    {
      id: "4",
      nama: "Prof. Dr. Dedi Prasetyo, M.Sc",
      nip: "196803081995031001",
      email: "dedi.prasetyo@university.ac.id",
    },
  ];

  const handleTitleSubmit = (data: {
    judulLaporan: string;
    judulInggris: string;
    deskripsi: string;
    metodologi: string;
    teknologi: string[];
  }) => {
    console.log("Submitting title:", data);
    setReportData({
      ...reportData,
      judul: data.judulLaporan,
      statusJudul: "diajukan",
      tanggalPengajuan: new Date().toLocaleDateString("id-ID"),
    });
    toast.success("Judul berhasil diajukan!");
  };

  const handleTitleChange = (judulBaru: string, alasan: string) => {
    console.log("Submitting title change:", { judulBaru, alasan });
    setReportData({
      ...reportData,
      judulBaru,
      alasanPerubahan: alasan,
    });
    setTitleChangeStatus("diajukan");
    toast.success("Perubahan judul berhasil diajukan!");
  };

  const handleLecturerSelect = (lecturerId: string) => {
    const lecturer = availableLecturers.find((l) => l.id === lecturerId);
    if (lecturer) {
      console.log("Selecting lecturer:", lecturer);
      setReportData({
        ...reportData,
        dosenPembimbing: lecturer.id,
      });
      toast.success(`Dosen pembimbing ${lecturer.nama} berhasil dipilih!`);
    }
  };

  const handleReportUpload = (file: File) => {
    console.log("Uploading report:", file);
    setCurrentReport({
      namaFile: file.name,
      tanggalUpload: new Date().toLocaleDateString("id-ID"),
      ukuranFile: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      status: "disubmit",
    });
    toast.success("Laporan berhasil diupload!");
  };

  const handleReportRemove = () => {
    console.log("Removing report");
    setCurrentReport(undefined);
    toast.success("Laporan berhasil dihapus!");
  };

  // Check if title is approved
  const isTitleApproved = reportData.statusJudul === "disetujui";

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Laporan Kerja Praktik
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Kelola judul, dosen pembimbing, dan upload laporan Kerja Praktik Anda
        </p>
      </div>

      {/* Info Alert */}
      <Alert className="border-l-4 border-primary bg-primary/5">
        <Info className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        <AlertDescription className="text-sm sm:text-base text-foreground">
          Lengkapi semua tahapan secara berurutan: Pengajuan Judul → Dosen Pembimbing →
          Upload Laporan
        </AlertDescription>
      </Alert>

      {/* Team Info Card */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <User className="h-4 w-4 sm:h-5 sm:w-5" />
            Informasi Tim KP
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Nama Tim</p>
              <p className="text-sm sm:text-base font-medium">Tim KP Informatika 2024</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Tempat KP</p>
              <p className="text-sm sm:text-base font-medium">PT. Teknologi Digital Indonesia</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Anggota Tim</p>
              <p className="text-sm sm:text-base font-medium">Adam Ramadhan (Ketua), Robin Setiawan, Raihan Pratama</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Periode</p>
              <p className="text-sm sm:text-base font-medium">1 Januari 2024 - 31 Maret 2024</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1">
          <TabsTrigger value="judul" className="flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 sm:py-2.5 text-xs sm:text-sm">
            <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline sm:inline">Judul</span>
          </TabsTrigger>
          <TabsTrigger value="perubahan" className="flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 sm:py-2.5 text-xs sm:text-sm">
            <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Ubah Judul</span>
          </TabsTrigger>
          <TabsTrigger value="dosen" className="flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 sm:py-2.5 text-xs sm:text-sm">
            <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline sm:inline">Dosen</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 sm:py-2.5 text-xs sm:text-sm">
            <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline sm:inline">Upload</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="judul" className="space-y-6">
          <TitleSubmissionForm
            currentTitle={reportData.judul}
            titleStatus={reportData.statusJudul}
            onSubmit={handleTitleSubmit}
          />
        </TabsContent>

        <TabsContent value="perubahan" className="space-y-6">
          {reportData.judul && reportData.statusJudul === "disetujui" ? (
            <TitleChangeForm
              currentTitle={reportData.judul}
              onSubmit={handleTitleChange}
              changeStatus={titleChangeStatus}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <Alert className="border-l-4 border-yellow-500 bg-yellow-50">
                  <Info className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    Anda hanya dapat mengajukan perubahan judul setelah judul awal disetujui
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="dosen" className="space-y-6">
          <LecturerSelectionForm
            currentLecturer={currentLecturer}
            availableLecturers={availableLecturers}
            onSubmit={handleLecturerSelect}
            isFromTeam={true}
          />
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <ReportUploadForm
            currentReport={currentReport}
            onUpload={handleReportUpload}
            onRemove={handleReportRemove}
            titleApproved={isTitleApproved}
          />

          {/* Upload Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Panduan Upload Laporan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <span className="font-medium min-w-[30px]">1.</span>
                  <p>Pastikan judul laporan sudah disetujui oleh dosen pembimbing</p>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium min-w-[30px]">2.</span>
                  <p>
                    Format laporan harus sesuai dengan template yang telah ditentukan
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium min-w-[30px]">3.</span>
                  <p>File harus dalam format PDF dengan ukuran maksimal 10MB</p>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium min-w-[30px]">4.</span>
                  <p>
                    Pastikan semua komponen laporan lengkap (cover, abstrak, bab 1-5,
                    daftar pustaka, lampiran)
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium min-w-[30px]">5.</span>
                  <p>
                    Laporan yang sudah diupload akan direview oleh dosen pembimbing
                  </p>
                </div>
                <Separator className="my-3" />
                <Alert className="border-l-4 border-blue-500 bg-blue-50">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Download Template:</strong>{" "}
                    <a
                      href="#"
                      className="underline hover:text-blue-900"
                      onClick={(e) => {
                        e.preventDefault();
                        alert("Download template (implementasi backend diperlukan)");
                      }}
                    >
                      Template Laporan KP.docx
                    </a>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Card */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Ringkasan Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
              <span className="text-xs sm:text-sm text-muted-foreground">Status Judul:</span>
              <span className="text-sm sm:text-base font-medium capitalize">
                {reportData.statusJudul === "draft" && "Belum Diajukan"}
                {reportData.statusJudul === "diajukan" && "Menunggu Persetujuan"}
                {reportData.statusJudul === "disetujui" && "Disetujui"}
                {reportData.statusJudul === "ditolak" && "Ditolak"}
              </span>
            </div>
            <Separator />
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
              <span className="text-xs sm:text-sm text-muted-foreground">Dosen Pembimbing:</span>
              <span className="text-sm sm:text-base font-medium">
                {currentLecturer.nama}
              </span>
            </div>
            <Separator />
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
              <span className="text-xs sm:text-sm text-muted-foreground">Status Laporan:</span>
              <span className="text-sm sm:text-base font-medium capitalize">
                {currentReport ? currentReport.status : "Belum Upload"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
