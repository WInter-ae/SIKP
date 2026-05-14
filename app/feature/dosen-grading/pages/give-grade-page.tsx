import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, User, FileText, Lock, Unlock, AlertCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { GradingForm } from "../components/grading-form";
import type { GradingFormData } from "../types";
import { 
  getDosenLogbookMonitorItems 
} from "../services/logbook-monitor-api";
import { 
  submitFinalScore,
  getAssessmentRecap
} from "~/feature/evaluation/services/evaluation-api";
import { getAssessmentCriteria } from "~/lib/assessment-criteria-api";
import { toast } from "sonner";

export default function GiveGradePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [menteeData, setMenteeData] = useState<any>(null);
  const [internshipId, setInternshipId] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [initialData, setInitialData] = useState<GradingFormData | undefined>(undefined);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setIsLoading(true);
      try {
        const menteesRes = await getDosenLogbookMonitorItems();
        if (menteesRes.success && menteesRes.data) {
          const found = menteesRes.data.find(m => m.studentId === id || m.nim === id || m.id === id);
          if (found) {
            setMenteeData(found);
            const iid = found.id;
            setInternshipId(iid);
 
            // Check for existing assessment
            const recapRes = await getAssessmentRecap(iid);
            const recapData = recapRes.data;
            if (recapRes.success && recapData && recapData.summary && recapData.summary.academicSupervisorTotal > 0) {
              const recap = recapData;
              const academicGrades = recap.academicSupervisorGrades?.[0]?.components || [];
              
              const existingData: GradingFormData = {
                reportFormat: academicGrades.find(g => 
                  g.name.toLowerCase().includes("format") || 
                  g.name.toLowerCase().includes("kesesuaian")
                )?.score || 0,
                materialMastery: academicGrades.find(g => 
                  g.name.toLowerCase().includes("materi") || 
                  g.name.toLowerCase().includes("penguasaan")
                )?.score || 0,
                analysisDesign: academicGrades.find(g => 
                  g.name.toLowerCase().includes("analisis") || 
                  g.name.toLowerCase().includes("perancangan") ||
                  g.name.toLowerCase().includes("analis")
                )?.score || 0,
                attitudeEthics: academicGrades.find(g => 
                  g.name.toLowerCase().includes("sikap") || 
                  g.name.toLowerCase().includes("etika")
                )?.score || 0,
                components: academicGrades.map(g => ({
                  categoryId: (g as any).categoryId || g.name,
                  category: g.name,
                  score: g.score,
                  weight: g.weight
                })),
                notes: recap.notes || (recap.academicSupervisorGrades[0] as any)?.feedback || ""
              };
              
              setInitialData(existingData);
              setIsLocked(true);
            }
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
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
          <p className="text-muted-foreground font-medium">Memuat data penilaian...</p>
        </div>
      </div>
    );
  }

  if (!menteeData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-none shadow-lg">
          <CardContent className="p-8 text-center">
            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Tidak Ditemukan</h2>
            <p className="text-gray-500 mb-6">Mahasiswa yang Anda cari tidak tersedia dalam daftar bimbingan.</p>
            <Button onClick={() => navigate("/dosen/penilaian")} className="w-full">
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
      const response = await submitFinalScore({
        internshipId: internshipId,
        scores: {
          formatKesesuaian: data.reportFormat,
          penguasaanMateri: data.materialMastery,
          analisisPerancangan: data.analysisDesign,
          sikapEtika: data.attitudeEthics,
          components: data.components,
          feedback: data.notes
        }
      } as any);

      if (response.success) {
        toast.success("Penilaian berhasil disimpan!");
        
        // Re-fetch data to update initialData and ensure 100% sync
        const recapRes = await getAssessmentRecap(internshipId);
        const recapData = recapRes.data;
        if (recapRes.success && recapData && recapData.summary && recapData.summary.academicSupervisorTotal > 0) {
          const academicGrades = recapData.academicSupervisorGrades?.[0]?.components || [];
          const existingData: GradingFormData = {
            reportFormat: academicGrades.find(g => 
              g.name.toLowerCase().includes("format") || 
              g.name.toLowerCase().includes("kesesuaian")
            )?.score || 0,
            materialMastery: academicGrades.find(g => 
              g.name.toLowerCase().includes("materi") || 
              g.name.toLowerCase().includes("penguasaan")
            )?.score || 0,
            analysisDesign: academicGrades.find(g => 
              g.name.toLowerCase().includes("analisis") || 
              g.name.toLowerCase().includes("perancangan") ||
              g.name.toLowerCase().includes("analis")
            )?.score || 0,
            attitudeEthics: academicGrades.find(g => 
              g.name.toLowerCase().includes("sikap") || 
              g.name.toLowerCase().includes("etika")
            )?.score || 0,
            components: academicGrades.map(g => ({
              categoryId: (g as any).categoryId || g.name,
              category: g.name,
              score: g.score,
              weight: g.weight
            })),
            notes: recapData.notes || (recapData.academicSupervisorGrades?.[0] as any)?.feedback || ""
          };
          setInitialData(existingData);
        }
        
        setIsLocked(true);
      } else {
        toast.error(response.message || "Gagal menyimpan penilaian");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col gap-4 py-8">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dosen/penilaian")}
              className="-ml-2 h-8 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            {isLocked && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsLocked(false)}
                className="text-amber-600 border-amber-200 hover:bg-amber-50"
              >
                <Unlock className="h-4 w-4 mr-2" />
                Buka Kunci Nilai
              </Button>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Penilaian Laporan & Sidang</h1>
            <p className="text-muted-foreground">Berikan evaluasi akademik akhir untuk mahasiswa bimbingan Anda</p>
          </div>
        </div>

        {/* Student Card */}
        <Card className="border-none shadow-sm overflow-hidden bg-white ring-1 ring-gray-200 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <Avatar className="h-20 w-20 border-4 border-gray-50 shadow-sm">
                <AvatarFallback className="bg-blue-600 text-white font-bold text-2xl">
                  {menteeData.studentName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 space-y-2">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {menteeData.studentName}
                  </h3>
                  <p className="text-blue-600 font-mono font-semibold tracking-wider">
                    {menteeData.nim}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-gray-700">{menteeData.company}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <User className="h-3.5 w-3.5" />
                    <span>Mentor: {menteeData.mentorName || "-"}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLocked ? (
          <div className="space-y-6">
            <Alert className="bg-amber-50 border-amber-200 text-amber-800">
              <Lock className="h-4 w-4" />
              <AlertTitle className="font-bold">Penilaian Terkunci</AlertTitle>
              <AlertDescription className="text-sm">
                Mahasiswa ini sudah dinilai. Klik tombol "Buka Kunci Nilai" di bagian atas jika ingin mengubah penilaian.
              </AlertDescription>
            </Alert>
            <div className="opacity-60 pointer-events-none">
              <GradingForm
                initialData={initialData}
                onSubmit={() => {}}
                isSubmitting={false}
              />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6 sm:p-8">
            <GradingForm
              initialData={initialData}
              onSubmit={handleSubmit}
              onCancel={() => initialData ? setIsLocked(true) : navigate("/dosen/penilaian")}
              isSubmitting={isSubmitting}
            />
          </div>
        )}
      </div>
    </div>
  );
}
