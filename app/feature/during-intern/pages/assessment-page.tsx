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
} from "lucide-react";

import { getAssessmentCriteria } from "~/lib/assessment-criteria-api";
import { getAssessmentScoreBarClass, getAssessmentScoreTextClass } from "~/lib/assessment-score-style";
import { getCompleteInternshipData, type CompleteInternshipData } from "~/feature/during-intern/services/student-api";
import { getMyAssessment, type StudentAssessmentData } from "~/feature/during-intern/services/assessment-api";
import { generateAssessmentForm, normalizeSignatureForDocument, printAssessmentForm } from "~/feature/during-intern/utils/generate-assessment-form";
import type { AssessmentCriterion } from "~/lib/assessment-criteria-api";

const CATEGORY_ICONS: Record<"kehadiran" | "kerjasama" | "sikapEtika" | "prestasiKerja" | "kreatifitas", React.ElementType> = {
  kehadiran: Clock,
  kerjasama: Users,
  sikapEtika: Users,
  prestasiKerja: CheckCircle2,
  kreatifitas: Lightbulb,
};

type CriterionKey = keyof typeof CATEGORY_ICONS;

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isSikapEtikaCategory(category: string): boolean {
  const normalized = category.toLowerCase().replace(/[^a-z]/g, "");
  return (
    normalized === "sikapetikadantingkahlaku" ||
    normalized === "sikapdanetika" ||
    normalized === "sikapetika"
  );
}

function getCriterionKey(criterion: Pick<AssessmentCriterion, "id" | "category">): CriterionKey | null {
  const normalizedId = String(criterion.id || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const normalized = criterion.category.toLowerCase().replace(/[^a-z]/g, "");

  if (normalizedId === "1" || normalizedId.includes("kehadiran") || normalizedId.includes("attendance")) return "kehadiran";
  if (normalizedId === "2" || normalizedId.includes("kerjasama") || normalizedId.includes("cooperation")) return "kerjasama";
  if (normalizedId === "3" || normalizedId.includes("sikap") || normalizedId.includes("etika") || normalizedId.includes("attitude")) return "sikapEtika";
  if (normalizedId === "4" || normalizedId.includes("prestasi") || normalizedId.includes("workachievement") || normalizedId.includes("kinerja")) return "prestasiKerja";
  if (normalizedId === "5" || normalizedId.includes("kreatif") || normalizedId.includes("creativ")) return "kreatifitas";

  if (normalized.includes("kehadiran") || normalized.includes("attendance")) return "kehadiran";
  if (normalized.includes("kerjasama") || normalized.includes("cooperation")) return "kerjasama";
  if (isSikapEtikaCategory(criterion.category)) return "sikapEtika";
  if (normalized.includes("prestasi") || normalized.includes("workachievement") || normalized.includes("kinerja")) return "prestasiKerja";
  if (normalized.includes("kreatif") || normalized.includes("kreativ") || normalized.includes("creativ") || normalized.includes("inovasi")) return "kreatifitas";

  return null;
}

function getScoreByCriterionKey(key: CriterionKey | null, data: StudentAssessmentData | null): number {
  if (!key || !data) return 0;
  if (key === "kehadiran") return data.kehadiran ?? 0;
  if (key === "kerjasama") return data.kerjasama ?? 0;
  if (key === "sikapEtika") return data.sikapEtika ?? 0;
  if (key === "prestasiKerja") return data.prestasiKerja ?? 0;
  return data.kreatifitas ?? 0;
}

type ViewAssessment = {
  id: string;
  category: string;
  score: number;
  maxScore: number;
  weight: number;
  description: string;
  icon: React.ElementType;
};

function getCategoryIcon(category: string): React.ElementType {
  const normalized = normalizeKey(category);

  if (normalized.includes("kehadiran") || normalized.includes("attendance")) return CATEGORY_ICONS.kehadiran;
  if (normalized.includes("kerjasama") || normalized.includes("cooperation") || normalized.includes("teamwork")) return CATEGORY_ICONS.kerjasama;
  if (normalized.includes("sikap") || normalized.includes("etika") || normalized.includes("attitude") || normalized.includes("ethics")) return CATEGORY_ICONS.sikapEtika;
  if (normalized.includes("prestasi") || normalized.includes("workachievement") || normalized.includes("kinerja")) return CATEGORY_ICONS.prestasiKerja;
  if (normalized.includes("kreatif") || normalized.includes("kreativ") || normalized.includes("creativ") || normalized.includes("inovasi")) return CATEGORY_ICONS.kreatifitas;

  return Award;
}

function getScoreFromComponents(
  criterion: Pick<AssessmentCriterion, "id" | "category">,
  data: StudentAssessmentData | null
): number | null {
  const components = data?.components;
  if (!components || components.length === 0) return null;

  const criterionId = normalizeKey(String(criterion.id || ""));
  const categoryLabel = normalizeKey(criterion.category || "");

  const matched = components.find((component) => {
    const byId = normalizeKey(String(component.categoryId || ""));
    const byKey = normalizeKey(String(component.categoryKey || ""));
    const byLabel = normalizeKey(String(component.label || ""));

    if (criterionId && (byId === criterionId || byKey === criterionId || byId.includes(criterionId) || byKey.includes(criterionId))) {
      return true;
    }

    if (categoryLabel && (byLabel === categoryLabel || byLabel.includes(categoryLabel) || categoryLabel.includes(byLabel))) {
      return true;
    }

    return false;
  });

  if (!matched) return null;
  const score = Number(matched.score ?? 0);
  return Number.isFinite(score) ? score : null;
}

function AssessmentPage() {
  const [assessments, setAssessments] = useState<ViewAssessment[]>([]);
  const [criteriaLoading, setCriteriaLoading] = useState(true);
  const [assessmentLoading, setAssessmentLoading] = useState(true);
  const [backendAssessment, setBackendAssessment] = useState<StudentAssessmentData | null>(null);
  const [internshipContext, setInternshipContext] = useState<CompleteInternshipData | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [supervisorInfo, setSupervisorInfo] = useState({
    name: "-",
    position: "-",
    company: "-",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [criteria, internshipRes] = await Promise.all([
          getAssessmentCriteria(),
          getCompleteInternshipData(),
        ]);

        if (!isMounted) return;

        const assessmentRes = await getMyAssessment();

        if (!isMounted) return;

        if (internshipRes.success && internshipRes.data?.mentor) {
          setInternshipContext(internshipRes.data);
          setSupervisorInfo({
            name: internshipRes.data.mentor.name || "-",
            position: internshipRes.data.mentor.position || "-",
            company: internshipRes.data.mentor.company || internshipRes.data.submission?.company || "-",
          });
        } else if (internshipRes.success && internshipRes.data?.submission) {
          setInternshipContext(internshipRes.data);
          setSupervisorInfo((prev) => ({
            ...prev,
            company: internshipRes.data?.submission?.company || prev.company,
          }));
        }

        const mappedAssessment = assessmentRes.success ? assessmentRes.data : null;
        setBackendAssessment(mappedAssessment || null);

        setAssessments(
          criteria.map((c) => {
            const criterionKey = getCriterionKey(c);
            const componentScore = getScoreFromComponents(c, mappedAssessment || null);
            const score = componentScore ?? getScoreByCriterionKey(criterionKey, mappedAssessment || null);

            return {
              ...c,
              score,
              icon: getCategoryIcon(c.category),
            };
          })
        );
      } finally {
        if (isMounted) {
          setCriteriaLoading(false);
          setAssessmentLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalScore = useMemo(
    () => assessments.reduce((sum, a) => sum + (a.score * a.weight) / 100, 0),
    [assessments]
  );

  const getGrade = (score: number) => {
    if (score >= 85) return { grade: "A", label: "Sangat Baik" };
    if (score >= 75) return { grade: "B", label: "Baik" };
    if (score >= 65) return { grade: "C", label: "Cukup" };
    if (score >= 55) return { grade: "D", label: "Kurang" };
    return { grade: "E", label: "Sangat Kurang" };
  };

  const gradeInfo = getGrade(totalScore);
  const hasAssessment = Boolean(backendAssessment);

  const formatDateId = (value: string) =>
    new Date(value).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const handleDownloadAssessment = async () => {
    if (!backendAssessment) {
      toast.error("Penilaian belum tersedia untuk diunduh.");
      return;
    }

    if (!internshipContext) {
      toast.error("Data pengajuan/saat magang belum lengkap.");
      return;
    }

    const startDate = internshipContext.submission?.startDate;
    const endDate = internshipContext.submission?.endDate;
    const periodText =
      startDate && endDate
        ? `${formatDateId(startDate)} - ${formatDateId(endDate)}`
        : "-";

    const rows = assessments.map((item) => {
      const weightedScore = (Number(item.score || 0) * Number(item.weight || 0)) / 100;
      return {
        category: item.category,
        weight: Number(item.weight || 0),
        score: Number(item.score || 0),
        weightedScore,
      };
    });

    const totalWeightedScore = rows.reduce((sum, row) => sum + row.weightedScore, 0);

    setIsGeneratingPdf(true);
    try {
      const normalizedSignature = await normalizeSignatureForDocument(
        internshipContext.mentor?.signature
      );

      const formData = {
        studentName: internshipContext.student?.name || "-",
        nim: internshipContext.student?.nim || "-",
        programStudi: internshipContext.student?.prodi || "-",
        fakultas: internshipContext.student?.fakultas || "-",
        companyName: internshipContext.submission?.company || supervisorInfo.company || "-",
        assessmentPeriod: periodText,
        assessmentDate: backendAssessment.updatedAt ? formatDateId(backendAssessment.updatedAt) : formatDateId(new Date().toISOString()),
        mentorName: internshipContext.mentor?.name || supervisorInfo.name || "-",
        mentorPosition: internshipContext.mentor?.position || supervisorInfo.position || "-",
        mentorSignature: normalizedSignature,
        rows,
        totalWeightedScore,
      };

      try {
        printAssessmentForm(formData);
      } catch {
        await generateAssessmentForm(formData);
      }

      toast.success("Dokumen penilaian berhasil digenerate.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal generate dokumen penilaian.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (criteriaLoading || assessmentLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <p className="text-muted-foreground text-sm">Memuat data penilaian...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Penilaian Kerja Praktik</h1>
        <p className="text-muted-foreground">
          Hasil penilaian dari pembimbing lapangan selama masa kerja praktik
        </p>
      </div>

      <Button variant="secondary" asChild>
        <Link to="/mahasiswa/kp/saat-magang">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Saat Magang
        </Link>
      </Button>

      <Alert className="border-l-4 border-primary bg-primary/5">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Penilaian ini diberikan oleh pembimbing lapangan berdasarkan kinerja Anda selama masa kerja praktik.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Pembimbing Lapangan
          </CardTitle>
          <CardDescription>
            Informasi pembimbing yang memberikan penilaian
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {supervisorInfo.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="font-semibold text-lg">{supervisorInfo.name}</p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                <span className="text-sm">{supervisorInfo.position}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span className="text-sm">{supervisorInfo.company}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Nilai Keseluruhan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-8 border-primary/20 flex items-center justify-center">
                    <div className="text-center">
                      <p className={`text-4xl font-bold ${getAssessmentScoreTextClass(totalScore)}`}>
                        {hasAssessment ? totalScore.toFixed(1) : "-"}
                      </p>
                      <p className="text-sm text-muted-foreground">dari 100</p>
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Badge className="text-lg px-3 py-1 bg-primary">
                      {hasAssessment ? gradeInfo.grade : "-"}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`h-5 w-5 ${getAssessmentScoreTextClass(totalScore)}`} />
                    <span className={`font-semibold ${getAssessmentScoreTextClass(totalScore)}`}>
                      {hasAssessment ? gradeInfo.label : "Belum Dinilai"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    {backendAssessment
                      ? `Berdasarkan rata-rata dari ${assessments.length} kategori penilaian`
                      : "Penilaian dari pembimbing lapangan belum tersedia"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-background rounded-lg border">
                  <p className="text-2xl font-bold text-green-600">
                    {hasAssessment ? assessments.filter((a) => a.score >= 85).length : "-"}
                  </p>
                  <p className="text-xs text-muted-foreground">Sangat Baik</p>
                </div>
                <div className="p-4 bg-background rounded-lg border">
                  <p className="text-2xl font-bold text-yellow-600">
                    {hasAssessment ? assessments.filter((a) => a.score >= 70 && a.score < 85).length : "-"}
                  </p>
                  <p className="text-xs text-muted-foreground">Baik</p>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Detail Penilaian</h2>

        {!backendAssessment && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Penilaian belum diinput oleh pembimbing lapangan. Silakan cek kembali nanti.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assessments.map((assessment) => {
            const Icon = assessment.icon;
            const percentage = (assessment.score / assessment.maxScore) * 100;

            return (
              <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{assessment.category}</CardTitle>
                          <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {assessment.weight}%
                          </span>
                        </div>
                        <CardDescription className="text-sm">
                          {assessment.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Nilai</span>
                      <span className={`font-semibold ${hasAssessment ? getAssessmentScoreTextClass(assessment.score) : "text-muted-foreground"}`}>
                        {hasAssessment ? `${assessment.score} / ${assessment.maxScore}` : `- / ${assessment.maxScore}`}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${getAssessmentScoreBarClass(assessment.score)}`}
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

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Penilaian terakhir diperbarui pada{" "}
              <span className="font-medium">
                {backendAssessment?.updatedAt
                  ? new Date(backendAssessment.updatedAt).toLocaleDateString("id-ID")
                  : "-"}
              </span>
            </p>
            <Button disabled={!backendAssessment || isGeneratingPdf} onClick={handleDownloadAssessment}>
              <Download className="mr-2 h-4 w-4" />
              {isGeneratingPdf ? "Generating..." : "Unduh Penilaian"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AssessmentPage;
