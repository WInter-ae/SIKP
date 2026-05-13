import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import {
  ArrowLeft,
  Briefcase,
  Building2,
  User,
  Award,
  TrendingUp,
  Clock,
  Users,
  Lightbulb,
  CheckCircle2,
  Download,
  Info,
  FileText,
  BookOpen,
  PenTool,
  ShieldCheck,
  GraduationCap
} from "lucide-react";

import { getAssessmentCriteria } from "~/lib/assessment-criteria-api";
import {
  getAssessmentScoreBarClass,
  getAssessmentScoreTextClass,
} from "~/lib/assessment-score-style";
import {
  getCompleteInternshipData,
  type CompleteInternshipData,
} from "~/feature/during-intern/services/student-api";
import {
  getMyAssessment,
  type StudentAssessmentData,
} from "~/feature/during-intern/services/assessment-api";
import {
  generateAssessmentForm,
  normalizeSignatureForDocument,
  printAssessmentForm,
} from "~/feature/during-intern/utils/generate-assessment-form";
import { getAssessmentRecap } from "~/feature/evaluation/services/evaluation-api";
import type { AssessmentCriterion } from "~/lib/assessment-criteria-api";

const MENTOR_ICONS: Record<string, React.ElementType> = {
  kehadiran: Clock,
  kerjasama: Users,
  sikapEtika: Users,
  prestasiKerja: CheckCircle2,
  kreatifitas: Lightbulb,
};

const DOSEN_ICONS: Record<string, React.ElementType> = {
  "pa-1": FileText,
  "pa-2": BookOpen,
  "pa-3": PenTool,
  "pa-4": ShieldCheck,
  "formatKesesuaian": FileText,
  "penguasaanMateri": BookOpen,
  "analisisPerancangan": PenTool,
  "sikapEtika": ShieldCheck,
};

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function AssessmentPage() {
  const [activeTab, setActiveTab] = useState("mentor");
  const [mentorAssessments, setMentorAssessments] = useState<any[]>([]);
  const [dosenAssessments, setDosenAssessments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mentorData, setMentorData] = useState<any | null>(null);
  const [dosenData, setDosenData] = useState<any | null>(null);
  const [internshipContext, setInternshipContext] = useState<CompleteInternshipData | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [mentorCriteria, dosenCriteria, internshipRes, assessmentRes] = await Promise.all([
          getAssessmentCriteria("MENTOR"),
          getAssessmentCriteria("DOSEN_PA"),
          getCompleteInternshipData(),
          getMyAssessment(),
        ]);

        if (internshipRes.success) {
          setInternshipContext(internshipRes.data);
        }

        const backendData = assessmentRes.success ? assessmentRes.data : null;
        
        let mentorSource: any = backendData;
        let dosenSource: any = null;

        // If we have an internshipId, try to fetch the full recap which has both
        if (internshipRes.success && internshipRes.data?.internship?.id) {
          const recapRes = await getAssessmentRecap(internshipRes.data.internship.id);
          if (recapRes.success && recapRes.data) {
            const evaluation = recapRes.data;
            // Use the first grade group for each role
            mentorSource = evaluation.fieldSupervisorGrades?.[0] || backendData;
            dosenSource = evaluation.academicSupervisorGrades?.[0] || null;

            // Fallback to flat mentor payload when recap lacks components
            const hasMentorComponents =
              Array.isArray(mentorSource?.components) && mentorSource.components.length > 0;
            if (!hasMentorComponents && backendData) {
              mentorSource = backendData;
            }
          }
        }

        setMentorData(mentorSource);
        setDosenData(dosenSource);

        const getScore = (c: any, role: string, source: any) => {
          if (!source) return 0;
          
          // 1. Try components array (standard for AcademicSupervisorGrade/FieldSupervisorGrade)
          const fromComponent = source.components?.find((comp: any) => {
            const compName = normalizeKey(comp.name || "");
            const critId = normalizeKey(c.id || "");
            const critLabel = normalizeKey(c.category || "");
            
            return compName === critId || 
                   compName === critLabel ||
                   compName.includes(critId) ||
                   critId.includes(compName) ||
                   compName.includes(critLabel) ||
                   critLabel.includes(compName);
          })?.score;
          
          if (fromComponent !== undefined) return fromComponent;

          // 2. Try flat fields for Mentor
          if (role === "MENTOR") {
            const key = normalizeKey(c.id);
            const cat = normalizeKey(c.category);
            if (key.includes("kehadiran") || cat.includes("kehadiran")) return source.kehadiran || 0;
            if (key.includes("kerjasama") || cat.includes("kerjasama")) return source.kerjasama || 0;
            if (key.includes("sikap") || cat.includes("sikap")) return source.sikapEtika || 0;
            if (key.includes("prestasi") || cat.includes("prestasi")) return source.prestasiKerja || 0;
            if (key.includes("kreatif") || cat.includes("kreatif")) return source.kreatifitas || 0;
          }

          // 3. Try flat fields for Dosen PA
          if (role === "DOSEN_PA") {
            const key = normalizeKey(c.id);
            const cat = normalizeKey(c.category);
            const raw = source as any;
            if (key.includes("format") || cat.includes("format")) return raw.formatKesesuaian || raw.format_kesesuaian || raw.reportFormat || 0;
            if (key.includes("materi") || cat.includes("materi")) return raw.penguasaanMateri || raw.penguasaan_materi || raw.materialMastery || 0;
            if (key.includes("analisis") || cat.includes("analisis")) return raw.analisisPerancangan || raw.analisis_perancangan || raw.analysisDesign || 0;
            if (key.includes("sikap") || cat.includes("sikap")) return raw.sikapEtika || raw.sikap_etika || raw.attitudeEthics || 0;
          }

          return 0;
        };

        // Map Mentor assessments
        setMentorAssessments(
          mentorCriteria.map((c) => ({
            ...c,
            score: getScore(c, "MENTOR", mentorSource),
            icon: MENTOR_ICONS[normalizeKey(c.id)] || MENTOR_ICONS[normalizeKey(c.category)] || Award,
          }))
        );

        // Map Dosen assessments
        setDosenAssessments(
          dosenCriteria.map((c) => ({
            ...c,
            score: getScore(c, "DOSEN_PA", dosenSource),
            icon: DOSEN_ICONS[normalizeKey(c.id)] || DOSEN_ICONS[normalizeKey(c.category)] || Award,
          }))
        );
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const calculateTotal = (list: any[]) => 
    list.reduce((sum, a) => sum + (a.score * a.weight) / 100, 0);

  const totalMentor = useMemo(() => calculateTotal(mentorAssessments), [mentorAssessments]);
  const totalDosen = useMemo(() => calculateTotal(dosenAssessments), [dosenAssessments]);

  const getGrade = (score: number) => {
    if (score >= 85) return { grade: "A", label: "Sangat Baik" };
    if (score >= 75) return { grade: "B", label: "Baik" };
    if (score >= 65) return { grade: "C", label: "Cukup" };
    if (score >= 55) return { grade: "D", label: "Kurang" };
    return { grade: "E", label: "Sangat Kurang" };
  };

  const currentAssessments = activeTab === "mentor" ? mentorAssessments : dosenAssessments;
  const currentTotal = activeTab === "mentor" ? totalMentor : totalDosen;
  const gradeInfo = getGrade(currentTotal);
  const hasAssessment = currentTotal > 0;

  const formatDateId = (value: string) =>
    new Date(value).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const handleDownloadAssessment = async () => {
    // Legacy download for mentor assessment
    if (!mentorData || !internshipContext) return;
    setIsGeneratingPdf(true);
    try {
      const normalizedSignature = await normalizeSignatureForDocument(internshipContext.mentor?.signature);
      const rows = mentorAssessments.map(item => ({
        category: item.category,
        weight: item.weight,
        score: item.score,
        weightedScore: (item.score * item.weight) / 100,
      }));

      const periodStart = internshipContext.submission?.startDate;
      const periodEnd = internshipContext.submission?.endDate;
      const assessmentPeriod = periodStart && periodEnd
        ? `${formatDateId(periodStart)} - ${formatDateId(periodEnd)}`
        : "-";

      const formData = {
        studentName: internshipContext.student?.name || "-",
        nim: internshipContext.student?.nim || "-",
        programStudi: internshipContext.student?.prodi || "-",
        fakultas: internshipContext.student?.fakultas || "-",
        companyName: internshipContext.submission?.company || "-",
        assessmentPeriod,
        assessmentDate: formatDateId(new Date().toISOString()),
        mentorName: internshipContext.mentor?.name || "-",
        mentorPosition: internshipContext.mentor?.position || "-",
        mentorSignature: normalizedSignature,
        rows,
        totalWeightedScore: totalMentor,
      };
      await generateAssessmentForm(formData);
      toast.success("Dokumen penilaian berhasil diunduh.");
    } catch (error) {
      toast.error("Gagal mengunduh penilaian.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 flex flex-col items-center justify-center min-h-[400px]">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground text-sm font-medium">Memuat data penilaian...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 pb-12">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              Penilaian Kerja Praktik
            </h1>
            <p className="text-muted-foreground">
              Hasil penilaian dari pembimbing selama masa kerja praktik
            </p>
          </div>
          <Button variant="outline" size="sm" asChild className="hidden sm:flex">
            <Link to="/mahasiswa/kp/saat-magang">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Link>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md bg-gray-100 p-1">
            <TabsTrigger value="mentor" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <User className="h-4 w-4 mr-2" />
              Pembimbing Lapangan
            </TabsTrigger>
            <TabsTrigger value="dosen" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <GraduationCap className="h-4 w-4 mr-2" />
              Dosen Pembimbing
            </TabsTrigger>
          </TabsList>

          <div className="mt-8 space-y-8">
            <Alert className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-300">
                {activeTab === "mentor" 
                  ? "Penilaian ini diberikan oleh pembimbing lapangan berdasarkan kinerja Anda selama di perusahaan."
                  : "Penilaian ini diberikan oleh dosen pembimbing berdasarkan laporan dan hasil sidang Anda."}
              </AlertDescription>
            </Alert>

            {/* Supervisor Card */}
            <Card className="border-none shadow-sm ring-1 ring-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {activeTab === "mentor" ? <User className="h-5 w-5 text-primary" /> : <GraduationCap className="h-5 w-5 text-primary" />}
                  {activeTab === "mentor" ? "Pembimbing Lapangan" : "Dosen Pembimbing Akademik"}
                </CardTitle>
                <CardDescription>
                  Informasi pembimbing yang memberikan penilaian
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-5">
                  <Avatar className="h-14 w-14 border-2 border-white shadow-sm ring-1 ring-gray-100">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                      {activeTab === "mentor" 
                        ? internshipContext?.mentor?.name?.[0] || "M"
                        : internshipContext?.lecturer?.name?.[0] || "D"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="font-bold text-xl text-gray-900">
                      {activeTab === "mentor" 
                        ? internshipContext?.mentor?.name || "Belum Ditentukan"
                        : internshipContext?.lecturer?.name || "Belum Ditentukan"}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5" />
                        <span>{activeTab === "mentor" ? (internshipContext?.mentor?.position || "Mentor") : "Dosen Pembimbing"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5" />
                        <span>{activeTab === "mentor" ? (internshipContext?.submission?.company || "-") : "Universitas Sriwijaya"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overall Score Card */}
            <Card className="overflow-hidden border-none shadow-sm ring-1 ring-gray-200">
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent pt-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Award className="h-5 w-5 text-primary" />
                    Nilai Keseluruhan
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-8">
                      <div className="relative">
                        <div className="w-36 h-36 rounded-full border-8 border-white bg-white shadow-xl flex items-center justify-center">
                          <div className="text-center">
                            <p className={`text-5xl font-black ${getAssessmentScoreTextClass(currentTotal)}`}>
                              {hasAssessment ? currentTotal.toFixed(1) : "-"}
                            </p>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">dari 100</p>
                          </div>
                        </div>
                        <div className="absolute -top-1 -right-1">
                          <Badge className="text-xl font-black h-12 w-12 rounded-full flex items-center justify-center bg-primary border-4 border-white shadow-lg">
                            {hasAssessment ? gradeInfo.grade : "-"}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className={`h-6 w-6 ${getAssessmentScoreTextClass(currentTotal)}`} />
                          <span className={`text-2xl font-black tracking-tight ${getAssessmentScoreTextClass(currentTotal)}`}>
                            {hasAssessment ? gradeInfo.label : "Belum Dinilai"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                          {hasAssessment 
                            ? `Berdasarkan rata-rata dari ${currentAssessments.length} kategori penilaian yang telah diinput.`
                            : "Hasil penilaian dari pembimbing terkait belum tersedia saat ini."}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                      <div className="p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white shadow-sm text-center min-w-[120px]">
                        <p className="text-3xl font-black text-green-600">
                          {hasAssessment ? currentAssessments.filter((a) => a.score >= 85).length : "-"}
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Sangat Baik</p>
                      </div>
                      <div className="p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white shadow-sm text-center min-w-[120px]">
                        <p className="text-3xl font-black text-yellow-600">
                          {hasAssessment ? currentAssessments.filter((a) => a.score >= 70 && a.score < 85).length : "-"}
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Baik</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>

            {/* Detailed Criteria */}
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Detail Penilaian</h2>

              {!hasAssessment && (
                <Alert className="border-dashed">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Rincian penilaian belum tersedia. Silakan hubungi pembimbing terkait jika ini adalah kesalahan.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {currentAssessments.map((assessment) => {
                  const Icon = assessment.icon || Award;
                  const percentage = (assessment.score / (assessment.maxScore || 100)) * 100;

                  return (
                    <Card key={assessment.id} className="hover:shadow-lg transition-all duration-300 border-none ring-1 ring-gray-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                              <Icon className="h-6 w-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <CardTitle className="text-lg font-bold">
                                  {assessment.category}
                                </CardTitle>
                                <Badge variant="secondary" className="bg-primary/5 text-primary text-[10px] font-bold border-none px-2 py-0">
                                  {assessment.weight}%
                                </Badge>
                              </div>
                              <CardDescription className="text-xs line-clamp-1 mt-0.5">
                                {assessment.description}
                              </CardDescription>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-end">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pencapaian Nilai</span>
                            <span className={`text-lg font-black ${hasAssessment ? getAssessmentScoreTextClass(assessment.score) : "text-muted-foreground"}`}>
                              {hasAssessment ? `${assessment.score} / ${assessment.maxScore || 100}` : `- / 100`}
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ease-out ${getAssessmentScoreBarClass(assessment.score)}`}
                              style={{ width: `${hasAssessment ? percentage : 0}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Footer / Download */}
            <Card className="border-none shadow-sm ring-1 ring-gray-200 bg-gray-50/50">
              <CardContent className="py-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Terakhir diperbarui pada <span className="font-bold text-gray-700">
                        {mentorData?.updatedAt ? formatDateId(mentorData.updatedAt) : "-"}
                      </span>
                    </p>
                  </div>
                  {activeTab === "mentor" && (
                    <Button
                      disabled={!hasAssessment || isGeneratingPdf}
                      onClick={handleDownloadAssessment}
                      className="w-full sm:w-auto font-bold px-8 shadow-sm"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {isGeneratingPdf ? "Menyiapkan..." : "Unduh Penilaian"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

export default AssessmentPage;
