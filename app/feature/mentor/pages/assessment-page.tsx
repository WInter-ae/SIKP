// External dependencies
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import {
  Save,
  Award,
  Clock,
  Users,
  CheckCircle2,
  Lightbulb,
  Search,
  ChevronLeft,
} from "lucide-react";
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
import { MenteeAssessmentCard, type MenteeGradingInfo } from "../components/mentee-assessment-card";

// API Services
import {
  submitAssessment,
  updateAssessment,
  unlockAssessment,
  getMentees,
  getStudentAssessment,
  getMentorProfile,
  type MenteeData,
} from "~/feature/field-mentor/services";
import {
  getAssessmentCriteria,
  DEFAULT_CRITERIA,
} from "~/lib/assessment-criteria-api";
import {
  getAssessmentScoreBarClass,
  getAssessmentScoreTextClass,
} from "~/lib/assessment-score-style";

// Types
import type { AssessmentCriteria, MenteeOption } from "../types";

type CriterionKey =
  | "kehadiran"
  | "kerjasama"
  | "sikapEtika"
  | "prestasiKerja"
  | "kreatifitas";

const CATEGORY_ICONS: Record<CriterionKey, React.ElementType> = {
  kehadiran: Clock,
  kerjasama: Users,
  sikapEtika: Users,
  prestasiKerja: CheckCircle2,
  kreatifitas: Lightbulb,
};

function mapBackendMentee(mentee: any): MenteeOption | null {
  if (!mentee.userId) return null;

  return {
    id: mentee.userId,
    name: mentee.nama || mentee.name || "-",
    nim: mentee.nim,
  };
}

function resolvePreselectedStudentId(
  preselected: string,
  mentees: MenteeData[],
): string | null {
  const exactUser = mentees.find((mentee) => mentee.userId === preselected);
  if (exactUser?.userId) return exactUser.userId;

  const byInternshipId = mentees.find(
    (mentee) => mentee.internshipId === preselected,
  );
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

function getCategoryKey(
  criterion: Pick<AssessmentCriteria, "id" | "category">,
): CriterionKey | null {
  const normalizedId = String(criterion.id || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const normalized = criterion.category.toLowerCase().replace(/[^a-z]/g, "");

  if (
    normalizedId === "1" ||
    normalizedId.includes("kehadiran") ||
    normalizedId.includes("attendance")
  )
    return "kehadiran";
  if (
    normalizedId === "2" ||
    normalizedId.includes("kerjasama") ||
    normalizedId.includes("cooperation")
  )
    return "kerjasama";
  if (
    normalizedId === "3" ||
    normalizedId.includes("sikap") ||
    normalizedId.includes("etika") ||
    normalizedId.includes("attitude")
  )
    return "sikapEtika";
  if (
    normalizedId === "4" ||
    normalizedId.includes("prestasi") ||
    normalizedId.includes("workachievement") ||
    normalizedId.includes("kinerja")
  )
    return "prestasiKerja";
  if (
    normalizedId === "5" ||
    normalizedId.includes("kreatif") ||
    normalizedId.includes("creativ")
  )
    return "kreatifitas";

  if (normalized.includes("kehadiran") || normalized.includes("attendance"))
    return "kehadiran";
  if (normalized.includes("kerjasama") || normalized.includes("cooperation"))
    return "kerjasama";
  if (
    normalized.includes("sikap") ||
    normalized.includes("etika") ||
    normalized.includes("attitude")
  )
    return "sikapEtika";
  if (normalized.includes("prestasi") || normalized.includes("workachievement"))
    return "prestasiKerja";
  if (
    normalized.includes("kreatif") ||
    normalized.includes("kreativ") ||
    normalized.includes("creativ")
  )
    return "kreatifitas";

  return null;
}

function getCategoryIcon(category: string): React.ElementType {
  const normalized = normalizeKey(category);

  if (normalized.includes("kehadiran") || normalized.includes("attendance"))
    return CATEGORY_ICONS.kehadiran;
  if (
    normalized.includes("kerjasama") ||
    normalized.includes("cooperation") ||
    normalized.includes("teamwork")
  )
    return CATEGORY_ICONS.kerjasama;
  if (
    normalized.includes("sikap") ||
    normalized.includes("etika") ||
    normalized.includes("attitude") ||
    normalized.includes("ethics")
  )
    return CATEGORY_ICONS.sikapEtika;
  if (
    normalized.includes("prestasi") ||
    normalized.includes("workachievement") ||
    normalized.includes("kinerja")
  )
    return CATEGORY_ICONS.prestasiKerja;
  if (
    normalized.includes("kreatif") ||
    normalized.includes("kreativ") ||
    normalized.includes("creativ") ||
    normalized.includes("inovasi")
  )
    return CATEGORY_ICONS.kreatifitas;

  return Award;
}

function AssessmentPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMentee, setSelectedMentee] = useState("");
  const [feedback, setFeedback] = useState("");
  const [assessments, setAssessments] = useState<AssessmentCriteria[]>(
    DEFAULT_CRITERIA.map((c) => ({ ...c, score: 0 })),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [criteriaLoading, setCriteriaLoading] = useState(true);
  const [mentees, setMentees] = useState<any[]>([]);
  const [menteesLoading, setMenteesLoading] = useState(true);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [existingAssessmentId, setExistingAssessmentId] = useState<
    string | null
  >(null);
  const [criteriaLoadedAt, setCriteriaLoadedAt] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [mentorName, setMentorName] = useState("");

  // Load bobot kriteria dari database saat komponen mount
  useEffect(() => {
    getAssessmentCriteria().then((criteria) => {
      setAssessments(criteria.map((c) => ({ ...c, score: 0 })));
      setCriteriaLoadedAt(new Date().toISOString());
      setCriteriaLoading(false);
    });
  }, []);

  // Fetch mentor profile
  useEffect(() => {
    getMentorProfile().then(response => {
      if (response.success && response.data) setMentorName(response.data.name);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadMentees() {
      setMenteesLoading(true);

      try {
        const response = await getMentees();

        if (!isMounted) return;

        if (response.success && response.data) {
          // Fetch existing assessment status for each mentee
          const enriched = await Promise.all(response.data.map(async (m: any) => {
            try {
              const assessmentRes = await getStudentAssessment(m.userId);
              return {
                ...m,
                hasAssessment: assessmentRes.success && assessmentRes.data?.id,
                gradingStatus: (assessmentRes.success && assessmentRes.data?.id) ? "graded" : "not-graded"
              };
            } catch {
              return { ...m, hasAssessment: false, gradingStatus: "not-graded" };
            }
          }));
          
          setMentees(enriched);

          const preselected = searchParams.get("mentee");
          if (preselected) {
            const resolvedStudentUserId = resolvePreselectedStudentId(
              preselected,
              response.data,
            );
            if (
              resolvedStudentUserId &&
              response.data.some((m: any) => m.userId === resolvedStudentUserId)
            ) {
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
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal memuat daftar mahasiswa.",
        );
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
        setAssessments((prev) =>
          prev.map((assessment) => ({ ...assessment, score: 0 })),
        );
        return;
      }

      setAssessmentLoading(true);

      try {
        const response = await getStudentAssessment(selectedMentee);

        if (!isMounted) return;

        if (response.success && response.data) {
          const data = response.data;
          setExistingAssessmentId(data.id || null);
          setIsEditing(!data.id || !data.isLocked); // Unlock if not locked in backend

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
              const byId = componentScores.get(
                normalizeKey(String(assessment.id || "")),
              );
              if (typeof byId === "number") {
                return { ...assessment, score: byId };
              }

              const key = getCategoryKey(assessment);
              if (key === "kehadiran")
                return { ...assessment, score: data.kehadiran ?? 0 };
              if (key === "kerjasama")
                return { ...assessment, score: data.kerjasama ?? 0 };
              if (key === "sikapEtika")
                return { ...assessment, score: data.sikapEtika ?? 0 };
              if (key === "prestasiKerja")
                return { ...assessment, score: data.prestasiKerja ?? 0 };
              if (key === "kreatifitas")
                return { ...assessment, score: data.kreatifitas ?? 0 };
              return assessment;
            }),
          );
          setFeedback(data.feedback || "");
        } else {
          setExistingAssessmentId(null);
          setIsEditing(true); // Izinkan input jika belum ada penilaian
          setFeedback("");
          setAssessments((prev) =>
            prev.map((assessment) => ({ ...assessment, score: 0 })),
          );
        }
      } catch {
        if (!isMounted) return;
        setExistingAssessmentId(null);
        setIsEditing(true);
        setFeedback("");
        setAssessments((prev) =>
          prev.map((assessment) => ({ ...assessment, score: 0 })),
        );
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
      prev.map((a) => (a.id === id ? { ...a, score: clampedValue } : a)),
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

    // Guard: Hanya izinkan simpan jika sedang dalam mode edit atau data baru
    if (existingAssessmentId && !isEditing) return;

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

      const sikapEtikaScore =
        assessments.find((a) => isSikapEtikaCategory(a.category))?.score ||
        scoreByKey("sikapEtika");
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
          (conflictMessage.includes("already exists") ||
            conflictMessage.includes("sudah ada"))
        ) {
          const existingRes = await getStudentAssessment(selectedMentee);
          const fetchedId =
            existingRes.success && existingRes.data?.id
              ? existingRes.data.id
              : null;

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

        setIsEditing(false); // Kunci kembali setelah berhasil simpan
        const menteeName = mentees.find((m) => m.userId === selectedMentee)?.nama;
        toast.success(
          `${existingAssessmentId ? "Penilaian berhasil diperbarui" : "Penilaian berhasil disimpan"}!\nMahasiswa: ${menteeName}\nNilai Rata-rata: ${totalScore.toFixed(1)}`,
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

  const filteredMentees = useMemo(() => {
    return mentees.filter(m => {
      const matchesSearch = 
        (m.nama || m.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.nim || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || m.gradingStatus === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [mentees, searchQuery, statusFilter]);

  const averageScore = useMemo(() => {
    const graded = mentees.filter(m => m.gradingStatus === "graded");
    if (graded.length === 0) return 0;
    // This is just a placeholder average since we don't have all scores fetched in the list
    return 0; 
  }, [mentees]);

  const stats = useMemo(() => {
    return {
      total: mentees.length,
      graded: mentees.filter(m => m.gradingStatus === "graded").length,
      notGraded: mentees.filter(m => m.gradingStatus === "not-graded").length,
    };
  }, [mentees]);

  if (criteriaLoading) {
    return (
      <div className="p-6">
        <PageHeader
          title="Penilaian Mahasiswa Magang"
          description="Berikan penilaian untuk mahasiswa yang magang di perusahaan Anda"
        />
        <p className="text-muted-foreground text-sm">
          Memuat kriteria penilaian...
        </p>
      </div>
    );
  }

  // --- LIST VIEW ---
  if (!selectedMentee) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Penilaian Mahasiswa Magang
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Kelola penilaian mahasiswa bimbingan di perusahaan Anda
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Mahasiswa
                </CardTitle>
                <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.total}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Mahasiswa bimbingan
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Sudah Dinilai
                </CardTitle>
                <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.graded}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stats.total > 0 ? ((stats.graded / stats.total) * 100).toFixed(0) : 0}% dari total
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Belum Dinilai
                </CardTitle>
                <Clock className="h-5 w-5 text-orange-500 dark:text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.notGraded}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Menunggu penilaian
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Cari nama atau NIM mahasiswa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[200px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                    <SelectValue placeholder="Status Penilaian" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="graded">Sudah Dinilai</SelectItem>
                    <SelectItem value="not-graded">Belum Dinilai</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Menampilkan {filteredMentees.length} dari {mentees.length} mahasiswa
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menteesLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse h-64 bg-gray-200 dark:bg-gray-800" />
              ))
            ) : filteredMentees.length > 0 ? (
              filteredMentees.map((m) => (
                <MenteeAssessmentCard
                  key={m.userId}
                  mentee={{
                    id: m.userId,
                    name: m.nama || m.name || "-",
                    nim: m.nim,
                    photoUrl: m.photoUrl,
                    division: m.division || m.unit || "-",
                    prodi: m.prodi || "-",
                    internshipStartDate: m.internshipStartDate,
                    internshipEndDate: m.internshipEndDate,
                    gradingStatus: m.gradingStatus,
                  }}
                  onGiveGrade={(id) => setSelectedMentee(id)}
                  onViewDetail={(id) => setSelectedMentee(id)}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                Tidak ada mahasiswa yang ditemukan.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- FORM VIEW ---
  const currentMentee = mentees.find(m => m.userId === selectedMentee);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedMentee("")}
            className="text-gray-600 dark:text-gray-400"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Kembali ke Daftar
          </Button>
        </div>

        <PageHeader
          title={`Penilaian: ${currentMentee?.nama || currentMentee?.name || "Mahasiswa"}`}
          description={`Berikan nilai untuk ${currentMentee?.nama} (${currentMentee?.nim})`}
        />

        <Alert className="mb-6 border-blue-500/40 bg-blue-50 dark:bg-blue-950/20">
          <AlertDescription className="text-blue-800 dark:text-blue-300 text-sm">
            Bobot kriteria penilaian sesuai konfigurasi terbaru. 
            {criteriaLoadedAt && ` (Dimuat: ${new Date(criteriaLoadedAt).toLocaleString("id-ID")})`}
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6 bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Nilai Rata-rata Sementara</p>
                <p className="text-5xl font-bold text-primary">{totalScore.toFixed(1)}</p>
                <p className="text-muted-foreground mt-2">dari 100</p>
                {existingAssessmentId && !isEditing && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-full text-xs font-medium border border-amber-200 dark:border-amber-900/50">
                    <Clock className="h-3.5 w-3.5" />
                    Penilaian Terkunci (Read-only)
                  </div>
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
                          <CardTitle className="text-base">{assessment.category}</CardTitle>
                          <CardDescription className="text-xs">{assessment.description}</CardDescription>
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
                        <Label htmlFor={`score-${assessment.id}`}>Nilai</Label>
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
                        onChange={(e) => handleScoreChange(assessment.id, e.target.value)}
                        disabled={!isEditing}
                      />
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${getAssessmentScoreBarClass(assessment.score)}`}
                          style={{ width: `${(assessment.score / assessment.maxScore) * 100}%` }}
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
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Tulis catatan atau feedback untuk mahasiswa..."
                rows={5}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={!isEditing}
              />
            </CardContent>
          </Card>

          <div className="flex justify-center gap-4 mb-6">
            {existingAssessmentId && !isEditing ? (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    const res = await unlockAssessment(existingAssessmentId);
                    if (res.success) {
                      setIsEditing(true);
                      toast.success("Penilaian dibuka untuk diedit.");
                    }
                  } catch {
                    toast.error("Gagal membuka penilaian.");
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                Edit Penilaian
              </Button>
            ) : (
              <Button type="submit" size="lg" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Menyimpan..." : "Simpan Penilaian"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssessmentPage;
