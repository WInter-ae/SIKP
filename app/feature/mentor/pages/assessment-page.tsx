// External dependencies
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Save, Award, Clock, Users, CheckCircle2, Lightbulb } from "lucide-react";
import { useSearchParams } from "react-router";

// Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Alert, AlertDescription } from "~/components/ui/alert";
import PageHeader from "../components/page-header";
import BackButton from "../components/back-button";

// API Services
import {
  submitAssessment,
  updateAssessment,
  getMentees,
  getStudentAssessment,
  type MenteeData,
} from "~/feature/field-mentor/services";
import { getAssessmentCriteria, DEFAULT_CRITERIA } from "~/lib/assessment-criteria-api";
import { getAssessmentScoreBarClass, getAssessmentScoreTextClass } from "~/lib/assessment-score-style";

// Types
import type { AssessmentCriteria, MenteeOption } from "../types";

type CriterionKey = "kehadiran" | "kerjasama" | "sikapEtika" | "prestasiKerja" | "kreatifitas";

const CATEGORY_ICONS: Record<CriterionKey, React.ElementType> = {
  kehadiran: Clock,
  kerjasama: Users,
  sikapEtika: Users,
  prestasiKerja: CheckCircle2,
  kreatifitas: Lightbulb,
};

function mapBackendMentee(mentee: MenteeData): MenteeOption | null {
  if (!mentee.userId) return null;

  return {
    id: mentee.userId,
    name: mentee.nama || mentee.name || "-",
    nim: mentee.nim,
  };
}

function resolvePreselectedStudentId(preselected: string, mentees: MenteeData[]): string | null {
  const exactUser = mentees.find((mentee) => mentee.userId === preselected);
  if (exactUser?.userId) return exactUser.userId;

  const byInternshipId = mentees.find((mentee) => mentee.internshipId === preselected);
  if (byInternshipId?.userId) return byInternshipId.userId;

  const byLegacyId = mentees.find((mentee) => mentee.id === preselected);
  if (byLegacyId?.userId) return byLegacyId.userId;

  const byNim = mentees.find((mentee) => mentee.nim === preselected);
  if (byNim?.userId) return byNim.userId;

  return null;
}

function isSikapEtikaCategory(category: string): boolean {
  const normalized = category.toLowerCase().replace(/[^a-z]/g, "");
  return (
    normalized === "sikapetikadantingkahlaku" ||
    normalized === "sikapdanetika" ||
    normalized === "sikapetika"
  );
}

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getCategoryKey(criterion: Pick<AssessmentCriteria, "id" | "category">): CriterionKey | null {
  const normalizedId = String(criterion.id || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const normalized = criterion.category.toLowerCase().replace(/[^a-z]/g, "");

  if (normalizedId === "1" || normalizedId.includes("kehadiran") || normalizedId.includes("attendance")) return "kehadiran";
  if (normalizedId === "2" || normalizedId.includes("kerjasama") || normalizedId.includes("cooperation")) return "kerjasama";
  if (normalizedId === "3" || normalizedId.includes("sikap") || normalizedId.includes("etika") || normalizedId.includes("attitude")) return "sikapEtika";
  if (normalizedId === "4" || normalizedId.includes("prestasi") || normalizedId.includes("workachievement") || normalizedId.includes("kinerja")) return "prestasiKerja";
  if (normalizedId === "5" || normalizedId.includes("kreatif") || normalizedId.includes("creativ")) return "kreatifitas";

  if (normalized.includes("kehadiran") || normalized.includes("attendance")) return "kehadiran";
  if (normalized.includes("kerjasama") || normalized.includes("cooperation")) return "kerjasama";
  if (normalized.includes("sikap") || normalized.includes("etika") || normalized.includes("attitude")) return "sikapEtika";
  if (normalized.includes("prestasi") || normalized.includes("workachievement")) return "prestasiKerja";
  if (normalized.includes("kreatif") || normalized.includes("kreativ") || normalized.includes("creativ")) return "kreatifitas";

  return null;
}

function getCategoryIcon(category: string): React.ElementType {
  const normalized = normalizeKey(category);

  if (normalized.includes("kehadiran") || normalized.includes("attendance")) return CATEGORY_ICONS.kehadiran;
  if (normalized.includes("kerjasama") || normalized.includes("cooperation") || normalized.includes("teamwork")) return CATEGORY_ICONS.kerjasama;
  if (normalized.includes("sikap") || normalized.includes("etika") || normalized.includes("attitude") || normalized.includes("ethics")) return CATEGORY_ICONS.sikapEtika;
  if (normalized.includes("prestasi") || normalized.includes("workachievement") || normalized.includes("kinerja")) return CATEGORY_ICONS.prestasiKerja;
  if (normalized.includes("kreatif") || normalized.includes("kreativ") || normalized.includes("creativ") || normalized.includes("inovasi")) return CATEGORY_ICONS.kreatifitas;

  return Award;
}

function AssessmentPage() {
  const [searchParams] = useSearchParams();
  const [selectedMentee, setSelectedMentee] = useState("");
  const [feedback, setFeedback] = useState("");
  const [assessments, setAssessments] = useState<AssessmentCriteria[]>(
    DEFAULT_CRITERIA.map((c) => ({ ...c, score: 0 }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [criteriaLoading, setCriteriaLoading] = useState(true);
  const [mentees, setMentees] = useState<MenteeOption[]>([]);
  const [menteesLoading, setMenteesLoading] = useState(true);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [existingAssessmentId, setExistingAssessmentId] = useState<string | null>(null);
  const [criteriaLoadedAt, setCriteriaLoadedAt] = useState<string | null>(null);

  // Load bobot kriteria dari database saat komponen mount
  useEffect(() => {
    getAssessmentCriteria().then((criteria) => {
      setAssessments(criteria.map((c) => ({ ...c, score: 0 })));
      setCriteriaLoadedAt(new Date().toISOString());
      setCriteriaLoading(false);
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadMentees() {
      setMenteesLoading(true);

      try {
        const response = await getMentees();

        if (!isMounted) return;

        if (response.success && response.data) {
          const options = response.data
            .map(mapBackendMentee)
            .filter((option): option is MenteeOption => Boolean(option));
          setMentees(options);

          const preselected = searchParams.get("mentee");
          if (preselected) {
            const resolvedStudentUserId = resolvePreselectedStudentId(preselected, response.data);
            if (resolvedStudentUserId && options.some((option) => option.id === resolvedStudentUserId)) {
              setSelectedMentee(resolvedStudentUserId);
            }
          }
        } else {
          setMentees([]);
          toast.error(response.message || "Gagal memuat daftar mahasiswa.");
        }
      } catch (error) {
        if (!isMounted) return;
        setMentees([]);
        toast.error(error instanceof Error ? error.message : "Gagal memuat daftar mahasiswa.");
      } finally {
        if (isMounted) {
          setMenteesLoading(false);
        }
      }
    }

    loadMentees();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;

    async function loadExistingAssessment() {
      if (!selectedMentee) {
        setExistingAssessmentId(null);
        setFeedback("");
        setAssessments((prev) => prev.map((assessment) => ({ ...assessment, score: 0 })));
        return;
      }

      setAssessmentLoading(true);

      try {
        const response = await getStudentAssessment(selectedMentee);

        if (!isMounted) return;

        if (response.success && response.data) {
          const data = response.data;
          setExistingAssessmentId(data.id || null);

          const componentScores = new Map<string, number>();
          if (Array.isArray(data.components)) {
            data.components.forEach((component) => {
              const categoryRef =
                normalizeKey(String(component.categoryId || "")) ||
                normalizeKey(String(component.categoryKey || "")) ||
                normalizeKey(String(component.label || ""));
              if (!categoryRef) return;
              componentScores.set(categoryRef, Number(component.score || 0));
            });
          }

          setAssessments((prev) =>
            prev.map((assessment) => {
              const byId = componentScores.get(normalizeKey(String(assessment.id || "")));
              if (typeof byId === "number") {
                return { ...assessment, score: byId };
              }

              const key = getCategoryKey(assessment);
              if (key === "kehadiran") return { ...assessment, score: data.kehadiran ?? 0 };
              if (key === "kerjasama") return { ...assessment, score: data.kerjasama ?? 0 };
              if (key === "sikapEtika") return { ...assessment, score: data.sikapEtika ?? 0 };
              if (key === "prestasiKerja") return { ...assessment, score: data.prestasiKerja ?? 0 };
              if (key === "kreatifitas") return { ...assessment, score: data.kreatifitas ?? 0 };
              return assessment;
            })
          );
          setFeedback(data.feedback || "");
        } else {
          setExistingAssessmentId(null);
          setFeedback("");
          setAssessments((prev) => prev.map((assessment) => ({ ...assessment, score: 0 })));
        }
      } catch {
        if (!isMounted) return;
        setExistingAssessmentId(null);
        setFeedback("");
        setAssessments((prev) => prev.map((assessment) => ({ ...assessment, score: 0 })));
      } finally {
        if (isMounted) {
          setAssessmentLoading(false);
        }
      }
    }

    loadExistingAssessment();

    return () => {
      isMounted = false;
    };
  }, [selectedMentee]);

  function handleScoreChange(id: string, value: string) {
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.max(0, Math.min(100, numValue));

    setAssessments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, score: clampedValue } : a))
    );
  }

  // Memoize totalScore calculation dengan weighted average
  const totalScore = useMemo(() => {
    if (assessments.length === 0) return 0;
    // Hitung weighted average: (score * weight) / 100
    return assessments.reduce((sum, a) => sum + (a.score * a.weight) / 100, 0);
  }, [assessments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedMentee) {
      toast.error("Mohon pilih mahasiswa terlebih dahulu");
      return;
    }

    if (assessmentLoading) {
      toast.info("Menunggu data penilaian mahasiswa dimuat...");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare assessment data
      const scoreByKey = (key: CriterionKey) =>
        assessments.find((a) => getCategoryKey(a) === key)?.score || 0;

      const sikapEtikaScore = assessments.find((a) => isSikapEtikaCategory(a.category))?.score || scoreByKey("sikapEtika");
      const assessmentData = {
        studentUserId: selectedMentee,
        components: assessments.map((assessment) => ({
          categoryId: String(assessment.id),
          score: Number(assessment.score || 0),
        })),
        kehadiran: scoreByKey("kehadiran"),
        kerjasama: scoreByKey("kerjasama"),
        sikapEtika: sikapEtikaScore,
        prestasiKerja: scoreByKey("prestasiKerja"),
        kreatifitas: scoreByKey("kreatifitas"),
        feedback: feedback.trim() || undefined,
      };

      const updatePayload = {
        components: assessmentData.components,
        kehadiran: assessmentData.kehadiran,
        kerjasama: assessmentData.kerjasama,
        sikapEtika: assessmentData.sikapEtika,
        prestasiKerja: assessmentData.prestasiKerja,
        kreatifitas: assessmentData.kreatifitas,
        feedback: assessmentData.feedback,
      };

      // Upsert: update existing assessment if exists, otherwise create new
      let response = existingAssessmentId
        ? await updateAssessment(existingAssessmentId, {
            ...updatePayload,
          })
        : await submitAssessment(assessmentData);

      // Backend may return conflict when data already exists; fetch existing and update.
      if (!response.success) {
        const conflictMessage = (response.message || "").toLowerCase();
        if (
          !existingAssessmentId &&
          (conflictMessage.includes("already exists") || conflictMessage.includes("sudah ada"))
        ) {
          const existingRes = await getStudentAssessment(selectedMentee);
          const fetchedId = existingRes.success && existingRes.data?.id ? existingRes.data.id : null;

          if (fetchedId) {
            setExistingAssessmentId(fetchedId);
            response = await updateAssessment(fetchedId, { ...updatePayload });
          }
        }
      }

      if (response.success) {
        if (response.data?.id) {
          setExistingAssessmentId(response.data.id);
        }

        const menteeName = mentees.find((m) => m.id === selectedMentee)?.name;
        toast.success(
          `${existingAssessmentId ? "Penilaian berhasil diperbarui" : "Penilaian berhasil disimpan"}!\nMahasiswa: ${menteeName}\nNilai Rata-rata: ${totalScore.toFixed(1)}`
        );
      } else {
        toast.error(response.message || "Gagal menyimpan penilaian");
      }
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast.error("Terjadi kesalahan saat menyimpan penilaian");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (criteriaLoading) {
    return (
      <div className="p-6">
        <PageHeader
          title="Penilaian Mahasiswa Magang"
          description="Berikan penilaian untuk mahasiswa yang magang di perusahaan Anda"
        />
        <p className="text-muted-foreground text-sm">Memuat kriteria penilaian...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Penilaian Mahasiswa Magang"
        description="Berikan penilaian untuk mahasiswa yang magang di perusahaan Anda"
      />

      <Alert className="mb-6 border-blue-500/40 bg-blue-50 dark:bg-blue-950/20">
        <AlertDescription className="text-blue-800 dark:text-blue-300 text-sm">
          Bobot dan nama kategori di halaman ini mengikuti konfigurasi admin terbaru saat data dimuat.
          Jika admin mengubah bobot, refresh halaman agar bobot baru terlihat.
          Penilaian lama akan memakai bobot baru setelah mentor membuka data mahasiswa dan menyimpan ulang penilaian.
          {criteriaLoadedAt ? ` (Dimuat: ${new Date(criteriaLoadedAt).toLocaleString("id-ID")})` : ""}
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Pilih Mahasiswa</CardTitle>
            <CardDescription>Pilih mahasiswa yang akan dinilai</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="mentee">Mahasiswa</Label>
              <Select
                value={selectedMentee}
                onValueChange={setSelectedMentee}
                disabled={menteesLoading}
              >
                <SelectTrigger id="mentee">
                  <SelectValue placeholder={menteesLoading ? "Memuat mahasiswa..." : "Pilih mahasiswa"} />
                </SelectTrigger>
                <SelectContent>
                  {mentees.map((mentee) => (
                    <SelectItem key={mentee.id} value={mentee.id}>
                      {mentee.name} - {mentee.nim}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {menteesLoading && (
                <p className="text-xs text-muted-foreground">Memuat daftar mahasiswa dari backend...</p>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedMentee && (
          <>
            <Card className="mb-6 bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">
                    Nilai Rata-rata Sementara
                  </p>
                  <p className="text-5xl font-bold text-primary">
                    {totalScore.toFixed(1)}
                  </p>
                  <p className="text-muted-foreground mt-2">dari 100</p>
                  {assessmentLoading && (
                    <p className="text-xs text-muted-foreground mt-2">Memuat penilaian yang sudah ada...</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {assessments.map((assessment) => {
                const Icon = getCategoryIcon(assessment.category);

                return (
                  <Card key={assessment.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {assessment.category}
                            </CardTitle>
                            <CardDescription>{assessment.description}</CardDescription>
                          </div>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {assessment.weight}%
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`score-${assessment.id}`}>
                            Nilai
                          </Label>
                          <span className={`text-sm font-semibold ${getAssessmentScoreTextClass(assessment.score)}`}>
                            {assessment.score} / {assessment.maxScore}
                          </span>
                        </div>
                        <Input
                          id={`score-${assessment.id}`}
                          type="number"
                          min="0"
                          max={assessment.maxScore}
                          value={assessment.score || ""}
                          onChange={(e) =>
                            handleScoreChange(assessment.id, e.target.value)
                          }
                          placeholder="0"
                        />
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${getAssessmentScoreBarClass(assessment.score)}`}
                            style={{
                              width: `${(assessment.score / assessment.maxScore) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Catatan & Feedback</CardTitle>
                <CardDescription>
                  Berikan catatan atau saran untuk mentee (opsional)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Tulis catatan atau feedback untuk mentee..."
                  rows={5}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </CardContent>
            </Card>

            <div className="flex justify-center mb-6">
              <Button 
                type="submit" 
                size="lg" 
                className="px-8"
                disabled={isSubmitting || assessmentLoading}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Menyimpan..." : assessmentLoading ? "Memuat..." : "Simpan Penilaian"}
              </Button>
            </div>
          </>
        )}

        <BackButton />
      </form>
    </div>
  );
}

export default AssessmentPage;
