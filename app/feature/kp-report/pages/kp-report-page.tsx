import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Separator } from "~/components/ui/separator";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Info, FileText, User as UserIcon, Upload, Building, Calendar, UserCheck, Briefcase, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";

import ApprovalForm from "../components/approval-form";
import ReportUploadForm from "../components/report-upload-form";
import { TitleSubmissionForm } from "../index";

import { getCompleteInternshipData } from "~/feature/during-intern/services";
import type { CompleteInternshipData } from "~/feature/during-intern/services/student-api";
import type { DosenPembimbing, LaporanKPData } from "../types";
import { 
  submitInternshipTitle, 
  getTitleStatus, 
  submitInternshipReport, 
  getReportStatus 
} from "../services/reporting-api";

interface InfoItemProps {
  label: string;
  value: string;
  icon: React.ElementType;
  className?: string;
  labelExtra?: React.ReactNode;
}

function InfoItem({ label, value, icon: Icon, className = "", labelExtra }: InfoItemProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`p-5 flex items-center gap-4 hover:bg-primary/5 transition-colors cursor-help ${className}`}>
            <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-0.5 overflow-hidden">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-primary uppercase tracking-widest">{label}</p>
                {labelExtra}
              </div>
              <p className="text-sm font-bold tracking-tight truncate">
                {value || "Belum tersedia"}
              </p>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[300px] font-semibold shadow-md">
          <p>{value || "Belum tersedia"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function KPReportPage() {
  const [activeTab, setActiveTab] = useState("judul");
  const [isLoading, setIsLoading] = useState(true);
  const [completeData, setCompleteData] =
    useState<CompleteInternshipData | null>(null);

  const [reportData, setReportData] = useState<LaporanKPData>({
    judul: "",
    statusJudul: "draft",
    dosenPembimbing: undefined,
  });

  const [currentReport, setCurrentReport] = useState<
    | {
        namaFile: string;
        tanggalUpload: string;
        ukuranFile: string;
        status: "draft" | "disubmit" | "revisi" | "disetujui";
        fileUrl?: string;
      }
    | undefined
  >(undefined);

  const currentLecturer: DosenPembimbing | undefined = completeData?.lecturer
    ? {
        id: completeData.lecturer.id,
        nama: completeData.lecturer.name,
        nip: completeData.lecturer.nip,
        email: completeData.lecturer.email,
      }
    : undefined;

  useEffect(() => {
    async function loadReportContext() {
      setIsLoading(true);
      try {
        const response = await getCompleteInternshipData();
 
        if (response.success && response.data) {
          setCompleteData(response.data);
          const internshipId = response.data.internship?.id;
          
          if (internshipId) {
            // Fetch real title status
            const titleRes = await getTitleStatus(internshipId);
            if (titleRes.success && titleRes.data) {
              const backendStatus = titleRes.data.status;
              let frontendStatus: any = "draft";
              
              if (backendStatus === "SUBMITTED") frontendStatus = "diajukan";
              else if (backendStatus === "APPROVED") frontendStatus = "disetujui";
              else if (backendStatus === "REJECTED") frontendStatus = "revisi";

              setReportData({
                judul: titleRes.data.title,
                deskripsi: titleRes.data.description,
                statusJudul: frontendStatus,
                dosenPembimbing: response.data.lecturer?.id,
                tanggalPengajuan: titleRes.data.submittedAt,
                keterangan: titleRes.data.rejectionReason,
              });

              // 🔄 Fallback: jika lecturer dari internship kosong,
              // coba ambil dari data reviewer di title response
              if (!response.data.lecturer) {
                const td = titleRes.data as any;
                const lecturerFromTitle = 
                  td.lecturer || 
                  td.supervisor || 
                  (td.reviewerName ? { id: td.reviewerId || "", name: td.reviewerName, nip: td.reviewerNip || "", email: td.reviewerEmail || "" } : null) ||
                  (td.approvedByName ? { id: td.approvedBy || "", name: td.approvedByName, nip: "", email: "" } : null) ||
                  (td.verifiedByName ? { id: td.verifiedBy || "", name: td.verifiedByName, nip: "", email: "" } : null);

                if (lecturerFromTitle) {
                  console.log("✅ [DEBUG] Lecturer found from title response:", lecturerFromTitle);
                  setCompleteData(prev => prev ? { ...prev, lecturer: lecturerFromTitle } : prev);
                } else {
                  console.warn("⚠️ [DEBUG] No lecturer found in title response either. Raw titleRes.data:", td);
                }
              }
            }

            // Fetch real report status
            const reportRes = await getReportStatus(internshipId);
            if (reportRes.success && reportRes.data) {
              const backendStatus = reportRes.data.status;
              let frontendStatus: any = "draft";

              if (backendStatus === "SUBMITTED") frontendStatus = "disubmit";
              else if (backendStatus === "APPROVED") frontendStatus = "disetujui";
              else if (backendStatus === "REJECTED") frontendStatus = "revisi";

              setCurrentReport({
                namaFile: reportRes.data.fileName,
                tanggalUpload: new Date(reportRes.data.uploadedAt).toLocaleDateString("id-ID"),
                ukuranFile: `${(reportRes.data.fileSize / (1024 * 1024)).toFixed(2)} MB`,
                status: frontendStatus,
                fileUrl: reportRes.data.fileUrl,
              });
            }
          }
        } else {
          toast.error(response.message || "Gagal memuat data laporan KP");
        }
      } catch (error) {
        console.error("Failed to load KP report context:", error);
      } finally {
        setIsLoading(false);
      }
    }
 
    loadReportContext();
  }, []);

  const handleTitleSubmit = async (data: {
    judulLaporan: string;
    deskripsi: string;
  }) => {
    setIsLoading(true);
    try {
      const internshipId = completeData?.internship?.id;
      if (!internshipId) {
        toast.error("Data internship tidak ditemukan. Mohon refresh halaman.");
        return;
      }

      const response = await submitInternshipTitle({
        internshipId,
        title: data.judulLaporan,
        description: data.deskripsi,
      });

      if (response.success) {
        setReportData((previous) => ({
          ...previous,
          judul: data.judulLaporan,
          deskripsi: data.deskripsi,
          statusJudul: "diajukan",
          tanggalPengajuan: new Date().toISOString(),
        }));
        toast.success("Judul berhasil diajukan!");
      } else {
        toast.error(response.message || "Gagal mengajukan judul");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem saat mengajukan judul");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const internshipId = completeData?.internship?.id;
      if (!internshipId) {
        toast.error("Data internship tidak ditemukan. Mohon refresh halaman.");
        return;
      }

      const response = await submitInternshipReport({ 
        internshipId,
        file 
      });

      if (response.success) {
        setCurrentReport({
          namaFile: file.name,
          tanggalUpload: new Date().toLocaleDateString("id-ID"),
          ukuranFile: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          status: "disubmit",
          fileUrl: response.data?.fileUrl || undefined,
        });
        toast.success("Laporan berhasil diupload!");
      } else {
        toast.error(response.message || "Gagal mengupload laporan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem saat mengupload laporan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportRemove = () => {
    setCurrentReport(undefined);
    toast.success("Laporan berhasil dihapus!");
  };

  const handleGenerateApprovalLetter = () => {
    window.open("https://ols.ilkom.unsri.ac.id/login", "_blank");
  };

  const isTitleApproved = reportData.statusJudul === "disetujui";

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Memuat data laporan KP...
          </CardContent>
        </Card>
      </div>
    );
  }

  const periodeText = completeData?.submission?.startDate && completeData?.submission?.endDate
    ? `${new Date(completeData.submission.startDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })} - ${new Date(completeData.submission.endDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}`
    : "Belum tersedia";

  const internshipStatus = completeData?.internship?.status || "PENDING";

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* Header with improved styling */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Laporan Kerja Praktik
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground">
            Kelola judul, pengesahan, dan unggah laporan akhir Anda.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-background shadow-sm border-primary/20 text-primary">
            Sesi 2023/2024
          </Badge>
        </div>
      </div>

      {/* SYMMETRICAL INFO CARD */}
      <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <CardContent className="p-0">
          {/* Row 1: Student Identity (3 Items) */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-primary/10 border-b border-primary/10">
            <InfoItem 
              label="Nama Mahasiswa" 
              value={completeData?.student?.name || ""} 
              icon={UserCheck} 
            />
            <InfoItem 
              label="NIM" 
              value={completeData?.student?.nim || ""} 
              icon={() => <Badge variant="outline" className="h-6 w-6 p-0 border-primary text-primary flex items-center justify-center font-bold">#</Badge>} 
            />
            <InfoItem 
              label="Dosen Pembimbing" 
              value={currentLecturer?.nama || "Belum ditetapkan"} 
              icon={UserIcon} 
            />
          </div>

          {/* Row 2: Internship Location & Period (3 Items) */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-primary/10">
            <InfoItem 
              label="Tempat KP" 
              value={completeData?.submission?.company || ""} 
              icon={Building} 
            />
            <InfoItem 
              label="Unit / Divisi" 
              value={completeData?.submission?.division || ""} 
              icon={Briefcase} 
            />
            <InfoItem 
              label="Periode" 
              value={periodeText} 
              icon={Calendar} 
              labelExtra={
                <Badge 
                  variant="secondary" 
                  className={`text-[11px] h-5 px-2 font-black uppercase tracking-tighter border-none leading-none ${
                    internshipStatus === 'AKTIF' 
                      ? 'bg-green-500/20 text-green-700' 
                      : internshipStatus === 'SELESAI' 
                        ? 'bg-blue-500/20 text-blue-700' 
                        : 'bg-yellow-500/20 text-yellow-700'
                  }`}
                >
                  {internshipStatus}
                </Badge>
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* UNIFIED WORKFLOW CARD */}
      <Card className="border-none shadow-2xl overflow-hidden bg-background">
        <div className="h-1.5 bg-primary/20" />
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col"
        >
          <div className="px-6 pt-6 pb-2 border-b bg-muted/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight">Alur Pelaporan</h2>
                <p className="text-sm text-muted-foreground">Selesaikan tahapan pelaporan secara berurutan.</p>
              </div>
              <TabsList className="grid grid-cols-3 h-auto p-1 bg-muted/80 rounded-xl w-full md:w-[500px]">
                <TabsTrigger
                  value="judul"
                  className="flex items-center justify-center gap-2 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span className="font-bold text-xs">Judul</span>
                </TabsTrigger>
                <TabsTrigger
                  value="dosen"
                  className="flex items-center justify-center gap-2 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                >
                  <UserIcon className="h-3.5 w-3.5" />
                  <span className="font-bold text-xs">Pengesahan</span>
                </TabsTrigger>
                <TabsTrigger
                  value="upload"
                  className="flex items-center justify-center gap-2 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span className="font-bold text-xs">Upload</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <div className="p-6">
            <TabsContent value="judul" className="mt-0 outline-none">
              <TitleSubmissionForm
                currentTitle={reportData.judul}
                currentDescription={reportData.deskripsi}
                titleStatus={reportData.statusJudul}
                onSubmit={handleTitleSubmit}
                catatanDosen={reportData.keterangan}
                noCard
              />
            </TabsContent>

            <TabsContent value="dosen" className="mt-0 outline-none">
              <ApprovalForm
                reportTitle={reportData.judul}
                titleStatus={reportData.statusJudul}
                approvedDate={reportData.tanggalDisetujui}
                lecturerName={currentLecturer?.nama || "Belum ditetapkan"}
                onGenerateLetter={handleGenerateApprovalLetter}
                noCard
              />
            </TabsContent>

            <TabsContent value="upload" className="mt-0 outline-none space-y-6">
              <ReportUploadForm
                currentReport={currentReport}
                onUpload={handleReportUpload}
                onRemove={handleReportRemove}
                titleApproved={isTitleApproved}
                noCard
              />

              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                <div className="flex items-center gap-2 mb-3">
                   <div className="p-1.5 bg-primary/10 rounded-md">
                     <Info className="h-4 w-4 text-primary" />
                   </div>
                   <h4 className="font-bold text-sm text-primary">Panduan Upload Laporan</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[13px]">
                   <div className="flex gap-2">
                     <span className="font-black text-primary/40 italic">01.</span>
                     <p className="text-muted-foreground">Judul harus disetujui dosen pembimbing.</p>
                   </div>
                   <div className="flex gap-2">
                     <span className="font-black text-primary/40 italic">02.</span>
                     <p className="text-muted-foreground">Format laporan sesuai template resmi.</p>
                   </div>
                   <div className="flex gap-2">
                     <span className="font-black text-primary/40 italic">03.</span>
                     <p className="text-muted-foreground">File PDF maksimal berukuran 10MB.</p>
                   </div>
                </div>
                <Separator className="my-4 opacity-50" />
                <div className="flex items-center justify-between">
                   <p className="text-xs font-medium text-muted-foreground italic">Sudah punya template terbaru?</p>
                   <a href="#" className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5">
                     <FileText className="h-3 w-3" />
                     Download Template Laporan.docx
                   </a>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
