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
} from "lucide-react";
import { toast } from "sonner";

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
  lastActivity: string;
};

type PendingAction = {
  id: string;
  title: string;
  mentee: string;
  deadline: string;
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
  if (typeof mentee.progress === "number") {
    return Math.max(0, Math.min(100, mentee.progress));
  }

  if (assessment) {
    return Math.max(0, Math.min(100, Math.round(assessment.totalScore || 0)));
  }

  if (logbookEntries.length > 0) {
    const approvedCount = logbookEntries.filter(
      (entry) => entry.status === "APPROVED",
    ).length;
    return Math.min(
      95,
      Math.round((approvedCount / logbookEntries.length) * 100),
    );
  }

  const status = String(
    mentee.internshipStatus || mentee.status || "",
  ).toUpperCase();
  if (status === "AKTIF") return 100;
  if (status === "PENDING") return 25;

  return 0;
}

function mapStatus(
  progress: number,
  logbookEntries: LogbookEntry[],
  assessment?: AssessmentData | null,
) {
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

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
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

        const validMentees = menteesRes.data.filter((mentee) =>
          Boolean(mentee.userId),
        );

        const rows = await Promise.all(
          validMentees.map(async (mentee) => {
            try {
              const [logbookRes, assessmentRes] = await Promise.all([
                getStudentLogbook(mentee.userId),
                getStudentAssessment(mentee.userId),
              ]);

              const logbookEntries =
                logbookRes.success && logbookRes.data?.entries
                  ? logbookRes.data.entries
                  : [];
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

        const dashboardMentees = rows
          .map(({ mentee, logbookEntries, assessment }) => {
            const progress = deriveProgress(mentee, logbookEntries, assessment);
            const latestActivity =
              getLatestActivity(logbookEntries) ||
              mentee.internshipEndDate ||
              mentee.internshipStartDate;

            return {
              id: mentee.userId,
              name: mentee.nama || mentee.name || "Mahasiswa",
              nim: mentee.nim || "-",
              progress,
              status: mapStatus(progress, logbookEntries, assessment),
              lastActivity: formatDateLabel(latestActivity),
            } satisfies DashboardMentee;
          })
          .sort((a, b) => b.progress - a.progress);

        const pendingItems: PendingAction[] = [];
        const scoreList: number[] = [];
        let unreadNotifications = 0;

        rows.forEach(({ mentee, logbookEntries, assessment }) => {
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
              deadline: formatDateLabel(getLatestActivity(pendingLogbooks)),
              type: "logbook",
              studentId: mentee.userId,
            });
          }

          if (!assessment) {
            pendingItems.push({
              id: `assessment-${mentee.userId}`,
              title: "Penilaian belum diisi",
              mentee: studentName,
              deadline: mentee.internshipEndDate
                ? `Batas magang ${new Date(mentee.internshipEndDate).toLocaleDateString("id-ID")}`
                : "Segera ditindaklanjuti",
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
      },
      {
        title: "Tindakan Pending",
        value: isLoading ? "..." : pendingCount,
        icon: ClipboardCheck,
        description: "Logbook dan penilaian yang menunggu",
      },
      {
        title: "Notifikasi Baru",
        value: isLoading ? "..." : notificationCount,
        icon: Bell,
        description: "Item yang perlu ditinjau",
      },
      {
        title: "Rata-rata Nilai",
        value: isLoading
          ? "..."
          : averageScore
            ? averageScore.toFixed(1)
            : "0.0",
        icon: TrendingUp,
        description: "Dari penilaian yang tersedia",
      },
    ],
    [averageScore, isLoading, notificationCount, pendingCount, totalMentees],
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard Pembimbing Lapangan
        </h1>
        <p className="text-muted-foreground">
          Kelola dan pantau perkembangan mentee Anda
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Mahasiswa Magang</CardTitle>
            <CardDescription>
              Progress dan aktivitas mahasiswa magang terbaru dari backend
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                  Memuat data mahasiswa magang dari backend...
                </div>
              ) : menteeList.length > 0 ? (
                menteeList.map((mentee) => (
                  <div
                    key={mentee.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{mentee.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {mentee.nim}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {mentee.progress}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {mentee.lastActivity}
                        </p>
                      </div>
                      <Link
                        to={`/mentor/mentee/${mentee.id}`}
                        className="flex items-center gap-2 text-xs font-medium text-primary hover:underline"
                      >
                        {mentee.status === "done" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : mentee.status === "warning" ? (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        Lihat detail
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                  Belum ada mahasiswa magang yang terhubung ke akun mentor ini.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Tindakan Pending</CardTitle>
            <CardDescription>
              Logbook dan penilaian yang perlu segera ditindaklanjuti
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                  Memuat tindakan yang menunggu dari backend...
                </div>
              ) : pendingAssessments.length > 0 ? (
                pendingAssessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="flex items-start justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                        <Clock className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">{assessment.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {assessment.mentee}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {assessment.deadline}
                      </p>
                      <Link
                        to={
                          assessment.type === "logbook"
                            ? `/mentor/logbook-detail/${assessment.studentId}`
                            : "/mentor/penilaian"
                        }
                        className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 hover:bg-blue-200"
                      >
                        {assessment.type === "logbook"
                          ? "Logbook"
                          : "Penilaian"}
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                  Tidak ada tindakan pending saat ini.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
          <CardDescription>
            Pintasan untuk tugas yang sering dilakukan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Link
              to="/mentor/penilaian"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
            >
              <ClipboardCheck className="h-5 w-5 text-primary" />
              <span className="font-medium">Beri Penilaian</span>
            </Link>
            <Link
              to="/mentor/mentee"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
            >
              <Users className="h-5 w-5 text-primary" />
              <span className="font-medium">Lihat Mahasiswa</span>
            </Link>
            <Link
              to="/mentor/notifikasi"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
            >
              <Bell className="h-5 w-5 text-primary" />
              <span className="font-medium">Notifikasi</span>
            </Link>
            <Link
              to="/mentor/logbook"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
            >
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-medium">Lihat Logbook</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
