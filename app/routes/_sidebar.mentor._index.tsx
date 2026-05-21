import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  AlertCircle,
  Bell,
  CheckCircle,
  ClipboardCheck,
  Clock,
  TrendingUp,
  Users,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import {
  getMentees,
  getStudentAssessment,
  getStudentLogbook,
  getMentorSignature,
  type AssessmentData,
  type LogbookEntry,
  type MenteeData,
} from "~/feature/field-mentor/services";

type DashboardMentee = {
  id: string;
  name: string;
  nim: string;
  progress: number;
  status: "active" | "warning" | "done";
  lastActivityDate: string; // Store raw date string
};

type PendingAction = {
  id: string;
  title: string;
  mentee: string;
  deadlineDate: string; // Store raw date string
  type: "logbook" | "assessment";
  studentId: string;
};

function formatDateLabel(dateString?: string) {
  if (!dateString) return "Baru saja";

  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return "Baru saja";

  const diffMs = Date.now() - parsed.getTime();
  const diffHours = Math.floor(Math.max(0, diffMs) / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Baru saja";
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 30) return `${diffDays} hari lalu`;

  return parsed.toLocaleDateString("id-ID");
}

function getLatestActivity(entries: LogbookEntry[]) {
  return entries
    .map((entry) => entry.updatedAt || entry.createdAt || entry.date)
    .filter(Boolean)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
}

function deriveProgress(
  mentee: MenteeData,
  logbookEntries: LogbookEntry[],
  assessment?: AssessmentData | null,
) {
  const status = String(
    mentee.internshipStatus || mentee.status || "",
  ).toUpperCase();

  if (typeof mentee.progress === "number") {
    return Math.max(0, Math.min(100, mentee.progress));
  }

  if (status === "AKTIF" && mentee.internshipStartDate && mentee.internshipEndDate) {
    const start = new Date(mentee.internshipStartDate).getTime();
    const end = new Date(mentee.internshipEndDate).getTime();
    const now = new Date().getTime();

    if (now < start) {
      return 0;
    } else if (now > end) {
      return 100;
    } else {
      const totalDuration = end - start;
      const elapsed = now - start;
      return Math.round((elapsed / totalDuration) * 105) >= 100 
        ? 100 
        : Math.round((elapsed / totalDuration) * 100);
    }
  }

  if (status === "SELESAI") {
    return 100;
  }

  if (status === "PENDING") {
    return 0;
  }

  return 0;
}

function mapStatus(
  progress: number,
  logbookEntries: LogbookEntry[],
  assessment?: AssessmentData | null,
): "done" | "active" | "warning" {
  const hasPendingLogbooks = logbookEntries.some(
    (entry) => entry.status === "PENDING",
  );

  if (progress >= 90 && assessment) return "done";
  if (hasPendingLogbooks || !assessment || progress < 70) return "warning";

  return "active";
}

export default function MentorDashboard() {
  const [menteeList, setMenteeList] = useState<DashboardMentee[]>([]);
  const [pendingAssessments, setPendingAssessments] = useState<PendingAction[]>(
    [],
  );
  const [totalMentees, setTotalMentees] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        // Check for signature
        const sigRes = await getMentorSignature();
        if (sigRes.success && (!sigRes.data || !sigRes.data.signature)) {
          setShowSignatureDialog(true);
        }

        const menteesRes = await getMentees();

        if (!isMounted) return;

        if (!menteesRes.success || !menteesRes.data) {
          setMenteeList([]);
          setPendingAssessments([]);
          setTotalMentees(0);
          setPendingCount(0);
          setNotificationCount(0);
          setAverageScore(0);
          setErrorMessage(
            menteesRes.message || "Gagal memuat dashboard mentor.",
          );
          return;
        }

        const validMentees = menteesRes.data.map(m => ({
          ...m,
          userId: m.userId || (m as any).studentId
        })).filter((m) => m.userId);

        const rows = await Promise.all(
          validMentees.map(async (mentee) => {
            try {
              const [logbookRes, assessmentRes] = await Promise.all([
                getStudentLogbook(mentee.userId),
                getStudentAssessment(mentee.userId),
              ]);

              let logbookEntries: LogbookEntry[] = [];
              if (logbookRes.success && logbookRes.data) {
                if (Array.isArray(logbookRes.data)) {
                  logbookEntries = logbookRes.data;
                } else if ((logbookRes.data as any).entries) {
                  logbookEntries = (logbookRes.data as any).entries;
                }
              }
              const assessment = assessmentRes.success
                ? assessmentRes.data
                : null;

              return {
                mentee,
                logbookEntries,
                assessment,
              };
            } catch {
              return {
                mentee,
                logbookEntries: [] as LogbookEntry[],
                assessment: null as AssessmentData | null,
              };
            }
          }),
        );

        if (!isMounted) return;

        const dashboardMentees: DashboardMentee[] = rows
          .map((row) => {
            const { mentee, logbookEntries, assessment } = row;
            const progress = deriveProgress(mentee, logbookEntries, assessment);
            const latestActivityDate = (
              getLatestActivity(logbookEntries) ||
              mentee.internshipEndDate ||
              mentee.internshipStartDate ||
              ""
            );

            return {
              id: mentee.userId,
              name: mentee.nama || mentee.name || "Mahasiswa",
              nim: mentee.nim || "-",
              progress,
              status: mapStatus(progress, logbookEntries, assessment),
              lastActivityDate: latestActivityDate,
            };
          })
          .sort((a, b) => b.progress - a.progress);

        const pendingItems: PendingAction[] = [];
        const scoreList: number[] = [];
        let unreadNotifications = 0;

        rows.forEach((row) => {
          const { mentee, logbookEntries, assessment } = row;
          const studentName = mentee.nama || mentee.name || "Mahasiswa";
          const pendingLogbooks = logbookEntries.filter(
            (entry) => entry.status === "PENDING",
          );

          unreadNotifications += pendingLogbooks.length + (assessment ? 0 : 1);

          if (assessment && Number.isFinite(assessment.totalScore)) {
            scoreList.push(assessment.totalScore);
          }

          if (pendingLogbooks.length > 0) {
            pendingItems.push({
              id: `logbook-${mentee.userId}`,
              title: `${pendingLogbooks.length} logbook menunggu paraf`,
              mentee: studentName,
              deadlineDate: getLatestActivity(pendingLogbooks) || "",
              type: "logbook",
              studentId: mentee.userId,
            });
          }

          if (!assessment) {
            pendingItems.push({
              id: `assessment-${mentee.userId}`,
              title: "Penilaian belum diisi",
              mentee: studentName,
              deadlineDate: mentee.internshipEndDate || "",
              type: "assessment",
              studentId: mentee.userId,
            });
          }
        });

        setMenteeList(dashboardMentees.slice(0, 4));
        setPendingAssessments(pendingItems.slice(0, 3));
        setTotalMentees(validMentees.length);
        setPendingCount(pendingItems.length);
        setNotificationCount(unreadNotifications);
        setAverageScore(
          scoreList.length > 0
            ? scoreList.reduce((sum, score) => sum + score, 0) /
                scoreList.length
            : 0,
        );
      } catch (error) {
        if (!isMounted) return;

        const message =
          error instanceof Error
            ? error.message
            : "Gagal memuat dashboard mentor.";
        setErrorMessage(message);
        setMenteeList([]);
        setPendingAssessments([]);
        setTotalMentees(0);
        setPendingCount(0);
        setNotificationCount(0);
        setAverageScore(0);
        toast.error(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(
    () => [
      {
        title: "Mahasiswa Magang",
        value: isLoading ? "..." : totalMentees,
        icon: Users,
        description: "Total mahasiswa yang dibimbing",
        color: "from-emerald-400 to-teal-600",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
      },
      {
        title: "Tindakan Pending",
        value: isLoading ? "..." : pendingCount,
        icon: ClipboardCheck,
        description: "Logbook dan penilaian menunggu",
        color: "from-orange-400 to-amber-500",
        iconColor: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-50 dark:bg-orange-500/10",
      },
      {
        title: "Notifikasi Baru",
        value: isLoading ? "..." : notificationCount,
        icon: Bell,
        description: "Item yang perlu ditinjau",
        color: "from-blue-400 to-indigo-600",
        iconColor: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-50 dark:bg-blue-500/10",
      },
      {
        title: "Rata-rata Nilai",
        value: isLoading
          ? "..."
          : averageScore
            ? averageScore.toFixed(1)
            : "0.0",
        icon: TrendingUp,
        description: "Dari penilaian yang diisi",
        color: "from-purple-400 to-fuchsia-600",
        iconColor: "text-purple-600 dark:text-purple-400",
        bgColor: "bg-purple-50 dark:bg-purple-500/10",
      },
    ],
    [averageScore, isLoading, notificationCount, pendingCount, totalMentees],
  );

  const HeroSection = () => (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-950 via-teal-900 to-slate-900 p-8 sm:p-10 text-white shadow-2xl mb-8 border border-white/10">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 -translate-y-8 translate-x-1/4 opacity-10 pointer-events-none">
        <Sparkles className="w-[400px] h-[400px] text-teal-300" strokeWidth={0.5} />
      </div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500 rounded-full blur-[80px] opacity-40 mix-blend-screen pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-emerald-500 rounded-full blur-[60px] opacity-30 mix-blend-screen pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-teal-100 backdrop-blur-md border border-white/20 shadow-xs">
            <span className="flex h-2.5 w-2.5 rounded-full bg-teal-400 mr-2.5 animate-pulse"></span>
            Pembimbing Lapangan Kerja Praktik
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-r from-white to-teal-250 drop-shadow-xs">
            Dashboard Pembimbing
          </h1>
          <p className="text-teal-100/90 text-base sm:text-lg font-medium leading-relaxed max-w-xl">
            Kelola perkembangan mahasiswa magang secara komprehensif, lakukan paraf logbook harian, serta selesaikan form penilaian akhir KP secara instan.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col p-4 sm:p-6 lg:p-8 bg-slate-50/30 dark:bg-slate-950 min-h-[calc(100svh-3.5rem)] gap-6">
      <HeroSection />

      {errorMessage && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive font-semibold">
          {errorMessage}
        </div>
      )}

      {/* Statistics Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 shadow-sm backdrop-blur-xl transition-all duration-350 hover:-translate-y-1 hover:shadow-lg group">
            <div className={`absolute top-0 left-0 w-1.5 h-full bg-linear-to-b ${stat.color}`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                {stat.title}
              </CardTitle>
              <div className={`p-2.5 rounded-xl ${stat.bgColor} ${stat.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tight text-slate-850 dark:text-slate-100">{stat.value}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Mentees Progress */}
        <Card className="col-span-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 overflow-hidden relative shadow-xs">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-emerald-450 to-teal-500" />
          <CardHeader className="pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-xl font-bold flex items-center gap-2.5">
              <Users className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              Mahasiswa Magang
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Perkembangan penyelesaian logbook dan status bimbingan mahasiswa aktif
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex min-h-[160px] items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm text-slate-500 font-medium">
                  Memuat data mahasiswa magang dari backend...
                </div>
              ) : menteeList.length > 0 ? (
                menteeList.map((mentee) => (
                  <div
                    key={mentee.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-slate-850 p-4 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                        <Users className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100 leading-tight">{mentee.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          NIM: {mentee.nim}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-sm font-black text-slate-800 dark:text-slate-100">{mentee.progress}%</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Progress</span>
                        </div>
                        {/* Custom Progress Bar */}
                        <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                          <div 
                            className="h-full bg-linear-to-r from-emerald-450 to-teal-500 rounded-full transition-all duration-500"
                            style={{ width: `${mentee.progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/mentor/mentee/${mentee.id}`}
                          className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 transition-all duration-200 shadow-xs"
                        >
                          {mentee.status === "done" ? (
                            <CheckCircle className="h-4 w-4 text-emerald-500 group-hover:text-white transition-colors" />
                          ) : mentee.status === "warning" ? (
                            <AlertCircle className="h-4 w-4 text-amber-500 group-hover:text-white transition-colors" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-emerald-500 group-hover:text-white transition-colors" />
                          )}
                          Detail
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center text-sm text-slate-500">
                  <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3">
                    <Users className="h-6 w-6 text-slate-400" />
                  </div>
                  <span className="font-medium">Belum ada mahasiswa magang yang terhubung.</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Actions */}
        <Card className="col-span-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 overflow-hidden relative shadow-xs">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-orange-400 to-amber-500" />
          <CardHeader className="pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-xl font-bold flex items-center gap-2.5">
              <ClipboardCheck className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              Tindakan Pending
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Logbook atau evaluasi akhir mahasiswa yang membutuhkan paraf Anda segera
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex min-h-[160px] items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm text-slate-500 font-medium">
                  Memuat tindakan menunggu...
                </div>
              ) : pendingAssessments.length > 0 ? (
                pendingAssessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-slate-850 p-4 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${
                        assessment.type === "logbook" 
                          ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400" 
                          : "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      }`}>
                        {assessment.type === "logbook" ? (
                          <Clock className="h-5 w-5" />
                        ) : (
                          <ClipboardCheck className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100 leading-tight">{assessment.title}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Siswa: {assessment.mentee}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                        {assessment.type === "assessment" && assessment.deadlineDate 
                          ? `Batas: ${mounted ? new Date(assessment.deadlineDate).toLocaleDateString("id-ID") : "..."}`
                          : mounted ? formatDateLabel(assessment.deadlineDate) : "..."}
                      </span>
                      <Link
                        to={
                          assessment.type === "logbook"
                            ? `/mentor/logbook-detail/${assessment.studentId}`
                            : "/mentor/penilaian"
                        }
                        className={`rounded-full px-3 py-1 text-xs font-bold transition-all hover:shadow-xs ${
                          assessment.type === "logbook"
                            ? "bg-orange-100/80 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 hover:bg-orange-200"
                            : "bg-blue-100/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200"
                        }`}
                      >
                        {assessment.type === "logbook" ? "Paraf" : "Nilai"}
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center text-sm text-slate-500">
                  <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3">
                    <ClipboardCheck className="h-6 w-6 text-slate-400" />
                  </div>
                  <span className="font-medium">Tidak ada tindakan pending saat ini.</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/60 overflow-hidden relative shadow-xs">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500 to-indigo-500" />
        <CardHeader className="pt-6 pb-4">
          <CardTitle className="text-lg font-bold">Aksi Cepat</CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Pintasan jalan pintas untuk kebutuhan administrasi sehari-hari
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          <div className="grid gap-4 md:grid-cols-4">
            <Link
              to="/mentor/penilaian"
              className="flex flex-col items-start gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 bg-white dark:bg-slate-900 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-teal-500/30"
            >
              <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-100 block text-sm">Beri Penilaian</span>
                <span className="text-xs text-slate-500 block mt-1">Input nilai akhir Kerja Praktik mahasiswa</span>
              </div>
            </Link>

            <Link
              to="/mentor/mentee"
              className="flex flex-col items-start gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 bg-white dark:bg-slate-900 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-500/30"
            >
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-100 block text-sm">Daftar Mahasiswa</span>
                <span className="text-xs text-slate-500 block mt-1">Pantau seluruh mahasiswa KP aktif</span>
              </div>
            </Link>

            <Link
              to="/mentor/notifikasi"
              className="flex flex-col items-start gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 bg-white dark:bg-slate-900 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-blue-500/30"
            >
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-100 block text-sm">Notifikasi Baru</span>
                <span className="text-xs text-slate-500 block mt-1">Tinjau aktivitas & informasi terbaru</span>
              </div>
            </Link>

            <Link
              to="/mentor/logbook"
              className="flex flex-col items-start gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 bg-white dark:bg-slate-900 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-purple-500/30"
            >
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-100 block text-sm">Lihat Logbook</span>
                <span className="text-xs text-slate-500 block mt-1">Tinjau semua rekap logbook</span>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Signature Setup Dialog */}
      <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
          <DialogHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-500/10 mb-4 animate-pulse">
              <Sparkles className="h-8 w-8 text-teal-600 dark:text-teal-400" />
            </div>
            <DialogTitle className="text-center text-2xl font-black tracking-tight text-slate-850 dark:text-white">Siapkan E-Signature Anda</DialogTitle>
            <DialogDescription className="text-center pt-2 text-sm text-slate-500 leading-relaxed">
              Kami mendeteksi Anda belum mengunggah spesimen tanda tangan digital (E-Signature) pada sistem SSO SIKP Anda.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-2xl border border-teal-500/20 p-5 bg-teal-50/50 dark:bg-teal-950/20 space-y-3">
              <h4 className="font-bold flex items-center gap-2 text-teal-700 dark:text-teal-400 text-sm">
                <ClipboardCheck className="h-4.5 w-4.5" />
                Mengapa E-Signature Dibutuhkan?
              </h4>
              <ul className="text-xs space-y-3 text-slate-700 dark:text-slate-300 font-semibold list-none pl-1">
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-teal-500 shrink-0" />
                  Menyetujui (Paraf) Logbook Harian mahasiswa bimbingan secara cepat.
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-teal-500 shrink-0" />
                  Menandatangani Formulir Evaluasi & Lembar Nilai Akhir Kerja Praktik secara aman.
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-teal-500 shrink-0" />
                  Memvalidasi orisinalitas laporan Kerja Praktik mahasiswa secara resmi.
                </li>
              </ul>
            </div>
            <p className="text-xs text-center text-slate-500 px-4 leading-relaxed font-semibold">
              Tanda tangan ini cukup dikonfigurasi satu kali melalui halaman SSO utama, dan akan otomatis disinkronisasikan ke seluruh berkas SIKP Anda.
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button 
              variant="ghost" 
              className="w-full sm:w-auto rounded-xl font-bold border border-slate-200 hover:bg-slate-100"
              onClick={() => setShowSignatureDialog(false)}
            >
              Nanti Saja
            </Button>
            <Button 
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold rounded-xl hover:shadow-lg hover:brightness-105 transition-all"
              onClick={() => window.location.href = "https://sso-unsri.vercel.app/profile"}
            >
              Siapkan Sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
