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
  GraduationCap,
  Printer,
  AlertCircle
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
  generateDosenAssessmentForm,
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
  const [evaluationRecap, setEvaluationRecap] = useState<any | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isPrintingFinal, setIsPrintingFinal] = useState(false);

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
            setEvaluationRecap(evaluation);
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

  const handlePrintFormNilai = () => {
    if (!internshipContext?.internship?.id) return;
    const url = `${import.meta.env.VITE_API_URL || "https://sikp-backend.p-it-unsri.workers.dev"}/api/admin/penilaian/print/${internshipContext.internship.id}`;
    window.open(url, "_blank");
  };

  const handlePrintMentorAssessment = async () => {
    if (!mentorData || !internshipContext) {
      toast.error("Data penilaian mentor belum lengkap.");
      return;
    }

    try {
      const student = internshipContext.student;
      const mentor = internshipContext.mentor;
      const submission = internshipContext.submission;

      // Map rows from mentorAssessments state which contains both legacy and dynamic criteria
      const rows = mentorAssessments.map(a => ({
        category: a.category,
        weight: a.weight,
        score: a.score,
        weightedScore: (a.score * a.weight) / 100
      }));

      const period = submission?.startDate && submission?.endDate
        ? `${new Date(submission.startDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })} – ${new Date(submission.endDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}`
        : "-";

      const signature = await normalizeSignatureForDocument(mentor?.signature);

      await generateAssessmentForm({
        studentName: student?.name || "-",
        nim: student?.nim || "-",
        programStudi: student?.prodi || "-",
        fakultas: student?.fakultas || "Ilmu Komputer",
        companyName: submission?.company || "-",
        assessmentPeriod: period,
        assessmentDate: mentorData.assessedAt ? new Date(mentorData.assessedAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }),
        mentorName: mentor?.name || "-",
        mentorPosition: mentor?.position || "-",
        mentorSignature: signature,
        rows,
        totalWeightedScore: totalMentor,
        title: "Formulir Penilaian Pembimbing Lapangan",
        signerLabel: "Pembimbing Lapangan"
      });
    } catch (error) {
      console.error("Gagal generate PDF:", error);
      toast.error("Terjadi kesalahan saat membuat dokumen PDF.");
    }
  };

  const handlePrintDosenAssessment = async () => {
    if (!dosenData || !internshipContext) {
      toast.error("Data penilaian dosen belum lengkap.");
      return;
    }

    try {
      const student = internshipContext.student;
      const lecturer = internshipContext.lecturer;
      const submission = internshipContext.submission;

      const rows = dosenAssessments.map(a => ({
        category: a.category,
        weight: a.weight,
        score: a.score,
        weightedScore: (a.score * a.weight) / 100
      }));

      const period = submission?.startDate && submission?.endDate
        ? `${new Date(submission.startDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })} – ${new Date(submission.endDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}`
        : "-";

      // Extract signatures and coordinator data from context
      const signature = await normalizeSignatureForDocument(lecturer?.signature);
      const coordinator = (internshipContext as any).coordinator;
      
      // ONLY use coordinator signature if verified by Kaprodi
      const isVerified = evaluationRecap?.summary?.isVerifiedByKaprodi;
      const coordinatorSignature = isVerified 
        ? await normalizeSignatureForDocument(coordinator?.signature)
        : undefined;

      // Extract report title if available in context or evaluations
      const reportTitle = (internshipContext as any).submission?.title || (internshipContext as any).report?.title || "-";
      const mentorName = internshipContext.mentor?.name || "-";

      await generateDosenAssessmentForm({
        studentName: student?.name || "-",
        nim: student?.nim || "-",
        programStudi: student?.prodi || "-",
        fakultas: student?.fakultas || "Ilmu Komputer",
        companyName: submission?.company || "-",
        assessmentPeriod: period,
        assessmentDate: new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }),
        mentorName: lecturer?.name || "-",
        mentorPosition: lecturer?.nip || "-", // Use NIP as position for lecturer signer
        mentorSignature: signature,
        rows,
        totalWeightedScore: totalDosen,
        title: "FORM PENILAIAN KERJA PRAKTEK (KP)",
        signerLabel: mentorName, // This is used for "Pembimbing Lapangan" field in the metadata
        reportTitle: reportTitle,
        coordinatorName: coordinator?.name || "Dr. Abdiansah, S.Kom., M.Cs.",
        coordinatorNip: coordinator?.nip || "198410012009121005",
        coordinatorSignature: coordinatorSignature
      });
    } catch (error) {
      console.error("Gagal generate PDF:", error);
      toast.error("Terjadi kesalahan saat membuat dokumen PDF.");
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
          <TabsList className="grid w-full grid-cols-3 max-w-2xl bg-gray-100 p-1">
            <TabsTrigger value="mentor" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <User className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Pembimbing Lapangan</span>
              <span className="sm:hidden">Mentor</span>
            </TabsTrigger>
            <TabsTrigger value="dosen" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <GraduationCap className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Dosen Pembimbing</span>
              <span className="sm:hidden">Dosen</span>
            </TabsTrigger>
            <TabsTrigger value="recap" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Award className="h-4 w-4 mr-2" />
              Nilai Gabungan
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="mentor" className="mt-0 space-y-8">
              <AssessmentContent 
                type="mentor"
                assessments={mentorAssessments}
                total={totalMentor}
                context={internshipContext}
                evaluation={evaluationRecap}
                showPrintButton={true}
                onPrint={handlePrintMentorAssessment}
              />
            </TabsContent>

            <TabsContent value="dosen" className="mt-0 space-y-8">
              <AssessmentContent 
                type="dosen"
                assessments={dosenAssessments}
                total={totalDosen}
                context={internshipContext}
                evaluation={evaluationRecap}
                showPrintButton={true}
                onPrint={handlePrintDosenAssessment}
              />
            </TabsContent>

            <TabsContent value="recap" className="mt-0 space-y-8">
              <CombinedGradeContent evaluation={evaluationRecap} onPrint={handlePrintFormNilai} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

// --- Sub-components for better organization ---

function AssessmentContent({ type, assessments, total, context, evaluation, showPrintButton, onPrint }: any) {
  const hasAssessment = total > 0;
  const gradeInfo = (score: number) => {
    if (score >= 85) return { grade: "A", label: "Sangat Baik" };
    if (score >= 75) return { grade: "B", label: "Baik" };
    if (score >= 65) return { grade: "C", label: "Cukup" };
    if (score >= 55) return { grade: "D", label: "Kurang" };
    return { grade: "E", label: "Sangat Kurang" };
  };
  const info = gradeInfo(total);

  const formatDateId = (value: string) =>
    new Date(value).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="space-y-8">
      <Alert className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-300">
          {type === "mentor" 
            ? "Penilaian ini diberikan oleh pembimbing lapangan berdasarkan kinerja Anda selama di perusahaan."
            : "Penilaian ini diberikan oleh dosen pembimbing berdasarkan laporan dan hasil sidang Anda."}
        </AlertDescription>
      </Alert>

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            {type === "mentor" ? <User className="h-5 w-5 text-primary" /> : <GraduationCap className="h-5 w-5 text-primary" />}
            {type === "mentor" ? "Pembimbing Lapangan" : "Dosen Pembimbing Akademik"}
          </CardTitle>
          <CardDescription>
            Informasi pembimbing yang memberikan penilaian
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-5">
            <Avatar className="h-14 w-14 border-2 border-white shadow-sm ring-1 ring-gray-100">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                {type === "mentor" 
                  ? context?.mentor?.name?.[0] || "M"
                  : context?.lecturer?.name?.[0] || "D"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="font-bold text-xl text-gray-900">
                {type === "mentor" 
                  ? context?.mentor?.name || "Belum Ditentukan"
                  : context?.lecturer?.name || "Belum Ditentukan"}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>{type === "mentor" ? (context?.mentor?.position || "Mentor") : "Dosen Pembimbing"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>{type === "mentor" ? (context?.submission?.company || "-") : "Universitas Sriwijaya"}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                      <p className={`text-5xl font-black ${getAssessmentScoreTextClass(total)}`}>
                        {hasAssessment ? total.toFixed(1) : "-"}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">dari 100</p>
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <Badge className="text-xl font-black h-12 w-12 rounded-full flex items-center justify-center bg-primary border-4 border-white shadow-lg">
                      {hasAssessment ? info.grade : "-"}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`h-6 w-6 ${getAssessmentScoreTextClass(total)}`} />
                    <span className={`text-2xl font-black tracking-tight ${getAssessmentScoreTextClass(total)}`}>
                      {hasAssessment ? info.label : "Belum Dinilai"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                    {hasAssessment 
                      ? `Berdasarkan rata-rata dari ${assessments.length} kategori penilaian yang telah diinput.`
                      : "Hasil penilaian dari pembimbing terkait belum tersedia saat ini."}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      <div className="space-y-6">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Detail Penilaian</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {assessments.map((assessment: any) => {
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
                          <CardTitle className="text-lg font-bold">{assessment.category}</CardTitle>
                          <Badge variant="secondary" className="bg-primary/5 text-primary text-[10px] font-bold border-none px-2 py-0">{assessment.weight}%</Badge>
                        </div>
                        <CardDescription className="text-xs line-clamp-1 mt-0.5">{assessment.description}</CardDescription>
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

      {showPrintButton && hasAssessment && (
        <Card className="border-none shadow-sm ring-1 ring-gray-200 bg-blue-50/50">
          <CardContent className="py-8 flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Printer className="h-6 w-6 text-blue-600" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-blue-900">Cetak Hasil Penilaian</h3>
              <p className="text-sm text-blue-700 max-w-sm">
                {type === "mentor" 
                  ? "Cetak lembar penilaian resmi dari pembimbing lapangan Anda."
                  : type === "dosen"
                  ? "Cetak lembar penilaian resmi dari dosen pembimbing akademik Anda."
                  : "Anda dapat mengunduh rekapitulasi nilai resmi dalam format PDF."}
              </p>
            </div>
            <Button 
              onClick={onPrint} 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 font-bold px-10"
              disabled={type === "dosen" && !evaluation?.summary.isVerifiedByKaprodi}
            >
              <Printer className="mr-2 h-5 w-5" />
              {type === "dosen" && !evaluation?.summary.isVerifiedByKaprodi ? "Menunggu Verifikasi Kaprodi" : "Cetak Form Nilai KP (PDF)"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CombinedGradeContent({ evaluation, onPrint }: any) {
  if (!evaluation || evaluation.summary.finalScore === 0) {
    return (
      <Card className="border-dashed py-12">
        <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 bg-muted rounded-full">
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-xl">Nilai Gabungan Belum Tersedia</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">Nilai gabungan akan otomatis muncul setelah Pembimbing Lapangan dan Dosen Pembimbing memberikan penilaian.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card className="border-none shadow-lg ring-1 ring-gray-200 overflow-hidden">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-4 text-center md:text-left">
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-none px-4 py-1">
                Rekapitulasi Nilai Akhir
              </Badge>
              <h2 className="text-4xl font-black tracking-tight">Nilai Gabungan KP</h2>
              <p className="text-blue-100 max-w-md">Perhitungan otomatis berdasarkan bobot 30% dari Pembimbing Lapangan dan 70% dari Dosen Pembimbing Akademik.</p>
            </div>
            <div className="relative">
              <div className="w-48 h-48 rounded-full bg-white/10 backdrop-blur-md border-4 border-white/20 flex flex-col items-center justify-center shadow-2xl">
                <span className="text-6xl font-black leading-none">{evaluation.summary.finalScore.toFixed(1)}</span>
                <span className="text-sm font-bold uppercase tracking-widest mt-2 opacity-80">Final Score</span>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 font-black text-2xl h-14 w-14 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                {evaluation.summary.grade}
              </div>
            </div>
          </div>
        </div>
        <CardContent className="p-8 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pembimbing Lapangan (30%)</p>
                  <p className="text-2xl font-black text-gray-900">{evaluation.summary.fieldSupervisorTotal.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Dosen Pembimbing (70%)</p>
                  <p className="text-2xl font-black text-gray-900">{evaluation.summary.academicSupervisorTotal.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center bg-gray-50 rounded-2xl p-6 border border-gray-100">
               <div className="flex items-center gap-2 mb-4 text-gray-900">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-bold text-lg">Status Kelulusan</span>
               </div>
               <div className="space-y-2">
                 <p className="text-sm text-gray-600">Berdasarkan hasil penilaian gabungan, Anda dinyatakan:</p>
                 <Badge className="text-lg px-6 py-1 bg-green-600 hover:bg-green-700">LULUS (KOMPETEN)</Badge>
               </div>
            </div>
          </div>
          
          <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col items-center space-y-6">
             <div className="text-center space-y-2">
                <h3 className="font-bold text-xl">Dokumen Nilai Akhir</h3>
                <p className="text-muted-foreground text-sm">Klik tombol di bawah untuk mencetak lembar penilaian resmi KP.</p>
             </div>
             {!evaluation.summary.isVerifiedByKaprodi ? (
               <div className="flex flex-col items-center p-6 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800">
                 <AlertCircle className="h-8 w-8 mb-2" />
                 <p className="font-bold">Menunggu Verifikasi Kaprodi</p>
                 <p className="text-sm text-center">Dokumen nilai akhir hanya dapat diunduh setelah diverifikasi oleh Ketua Program Studi.</p>
               </div>
             ) : (
               <Button onClick={onPrint} size="lg" className="w-full max-w-sm h-14 text-lg font-bold shadow-xl hover:scale-105 transition-transform">
                 <Printer className="mr-3 h-6 w-6" />
                 Cetak Form Nilai Akhir
               </Button>
             )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AssessmentPage;

