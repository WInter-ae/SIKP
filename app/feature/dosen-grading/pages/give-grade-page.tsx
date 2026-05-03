import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, User, CheckCircle, Lock, FileText, Printer } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { GradingForm } from "../components/grading-form";
import { RevisionReviewSection } from "../components/revision-review-section";
import type { GradingFormData } from "../types";
import { getMyProfile } from "~/lib/services/dosen.service";
import { getActiveProfileSignature } from "~/lib/services/signature.service";
import { 
  getDosenLogbookMonitorItems 
} from "../services/logbook-monitor-api";
import { 
  getReportStatus,
  getTitleStatus
} from "~/feature/kp-report/services/reporting-api";
import { 
  submitFinalScore,
  getAssessmentPdfUrl 
} from "~/feature/evaluation/services/evaluation-api";
import { toast } from "sonner";

export default function GiveGradePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("revisi");
  const [allRevisionsApproved, setAllRevisionsApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [menteeData, setMenteeData] = useState<any>(null); // DosenLogbookMonitorItem
  const [reportInfo, setReportInfo] = useState<any>(null); // ReportSubmission
  const [internshipId, setInternshipId] = useState<string | null>(null);

  // Load mentee data and report status
  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setIsLoading(true);
      try {
        // 1. Get student from mentees list
        const menteesRes = await getDosenLogbookMonitorItems();
        if (menteesRes.success && menteesRes.data) {
          // id can be UUID (studentId), NIM, or internshipId
          const found = menteesRes.data.find(m => m.studentId === id || m.nim === id || m.id === id);
          if (found) {
            setMenteeData(found);
            const iid = found.id;
            setInternshipId(iid);
            
            // 2. Get title status using internshipId
            const titleRes = await getTitleStatus(iid); 
            if (titleRes.success && titleRes.data) {
              // 3. Get report status using internshipId
              const reportRes = await getReportStatus(iid);
              if (reportRes.success && reportRes.data) {
                setReportInfo(reportRes.data);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error loading mentee data:", error);
        toast.error("Gagal memuat data mahasiswa");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Memuat data penilaian...</p>
        </div>
      </div>
    );
  }

  if (!menteeData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Data Tidak Ditemukan
            </h2>
            <p className="text-gray-600 mb-4">
              Data mahasiswa yang Anda cari tidak tersedia.
            </p>
            <Button onClick={() => navigate("/dosen/penilaian")}>
              Kembali ke Daftar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (data: GradingFormData) => {
    if (!internshipId) {
      toast.error("ID Magang tidak ditemukan");
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate weighted score (Standard Flow: 30% + 30% + 30% + 10%)
      const finalAcademicScore = 
        data.reportFormat * 0.3 + 
        data.materialMastery * 0.3 + 
        data.analysisDesign * 0.3 + 
        data.attitudeEthics * 0.1;

      const response = await submitFinalScore({
        studentId: menteeData.studentId || id!,
        score: finalAcademicScore,
        feedback: data.notes
      });

      if (response.success) {
        toast.success("Penilaian berhasil disimpan!");
        navigate("/dosen/penilaian");
      } else {
        toast.error(response.message || "Gagal menyimpan penilaian");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem saat menyimpan nilai");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/dosen/penilaian");
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Left Pane: PDF Viewer (Split-Screen) */}
      <div className="hidden lg:block w-1/2 h-full bg-gray-800 border-r border-gray-700 relative">
        {reportInfo?.fileUrl ? (
          <div className="h-full flex flex-col">
            <div className="bg-gray-900 p-3 flex items-center justify-between">
              <span className="text-white text-sm font-medium truncate">
                Laporan: {reportInfo.fileName}
              </span>
              <Badge variant="secondary" className="bg-blue-600 text-white">PDF Viewer</Badge>
            </div>
            <iframe
              src={`${reportInfo.fileUrl}#toolbar=0`}
              className="w-full h-full border-none"
              title="Laporan PDF"
            />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center space-y-4">
            <div className="p-6 bg-gray-700/50 rounded-full">
              <FileText className="h-16 w-16 opacity-20" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-200">Laporan Belum Tersedia</h3>
              <p className="text-sm max-w-xs mt-2">
                Mahasiswa belum mengupload file laporan atau file tidak dapat dimuat.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right Pane: Grading Form */}
      <div className="w-full lg:w-1/2 h-full overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 sticky top-0 bg-gray-100 py-2 z-10">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dosen/penilaian")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold truncate">Penilaian Mahasiswa</h1>
            </div>
            {internshipId && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-shrink-0"
                onClick={() => window.open(getAssessmentPdfUrl(internshipId), "_blank")}
              >
                <Printer className="h-4 w-4 mr-2" />
                Cetak Form
              </Button>
            )}
          </div>

          {/* Student Info Slim */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-4 bg-white">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border">
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                    {menteeData.studentName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">
                    {menteeData.studentName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span className="font-medium">{menteeData.nim}</span>
                    <span>•</span>
                    <span className="truncate">{menteeData.company}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Revisi and Penilaian */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="revisi">Review Revisi</TabsTrigger>
              <TabsTrigger value="penilaian">Form Penilaian</TabsTrigger>
            </TabsList>

            <TabsContent value="revisi">
              <RevisionReviewSection
                studentId={id!}
                onAllRevisionsApproved={setAllRevisionsApproved}
                reportInfo={reportInfo}
              />
            </TabsContent>

            <TabsContent value="penilaian">
              {allRevisionsApproved ? (
                <div className="space-y-6">
                  <Alert className="bg-blue-50 border-blue-200">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-xs">
                      Beri penilaian berdasarkan laporan yang tampil di sebelah kiri (khusus desktop).
                    </AlertDescription>
                  </Alert>
                  <GradingForm
                    initialData={undefined}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isSubmitting={isSubmitting}
                  />
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center space-y-4">
                    <Lock className="h-12 w-12 text-gray-300 mx-auto" />
                    <div className="space-y-1">
                      <h3 className="font-semibold">Penilaian Terkunci</h3>
                      <p className="text-sm text-muted-foreground">
                        Selesaikan review revisi terlebih dahulu.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
