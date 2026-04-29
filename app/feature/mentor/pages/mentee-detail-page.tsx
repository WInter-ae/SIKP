import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
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
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  MapPin,
  BookOpen,
  Award,
  FileText,
  Clock,
  CheckCircle,
} from "lucide-react";

import {
  getMenteeDetail,
  getMentees,
  getStudentAssessment,
  getStudentLogbook,
  type AssessmentData,
  type LogbookEntry,
  type MenteeData,
} from "~/feature/field-mentor/services";

type ActivityItem = {
  id: string;
  type: "logbook";
  title: string;
  date: string;
  status: "approved" | "pending";
};

function formatDate(dateValue?: string) {
  if (!dateValue) return "-";
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("id-ID");
}

function normalizeStatus(status?: string) {
  const normalized = (status || "").toUpperCase();
  if (normalized === "AKTIF") return "Aktif";
  if (normalized === "SELESAI") return "Selesai";
  if (normalized === "PENDING") return "Menunggu";
  return status || "-";
}

async function resolveStudentUserId(studentAlias: string): Promise<string> {
  const menteesRes = await getMentees();

  if (!menteesRes.success || !menteesRes.data) {
    return studentAlias;
  }

  const exactUser = menteesRes.data.find(
    (mentee) => mentee.userId === studentAlias,
  );
  if (exactUser?.userId) return exactUser.userId;

  const byInternshipId = menteesRes.data.find(
    (mentee) => mentee.internshipId === studentAlias,
  );
  if (byInternshipId?.userId) return byInternshipId.userId;

  const byLegacyId = menteesRes.data.find(
    (mentee) => mentee.id === studentAlias,
  );
  if (byLegacyId?.userId) return byLegacyId.userId;

  const byNim = menteesRes.data.find((mentee) => mentee.nim === studentAlias);
  if (byNim?.userId) return byNim.userId;

  return studentAlias;
}

function MenteeDetailPage() {
  const { menteeId } = useParams();
  const [activeTab, setActiveTab] = useState("info");
  const [mentee, setMentee] = useState<MenteeData | null>(null);
  const [logbookEntries, setLogbookEntries] = useState<LogbookEntry[]>([]);
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDetail() {
      if (!menteeId) {
        setErrorMessage("Parameter mahasiswa tidak valid.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const resolvedStudentId = await resolveStudentUserId(menteeId);

        const menteeRes = await getMenteeDetail(resolvedStudentId);

        if (!isMounted) return;

        if (!menteeRes.success || !menteeRes.data) {
          setErrorMessage(
            menteeRes.message || "Data mahasiswa tidak ditemukan.",
          );
          setMentee(null);
          setLogbookEntries([]);
          setAssessment(null);
          return;
        }

        const studentUserId = menteeRes.data.userId || resolvedStudentId;
        let logbookRes = await getStudentLogbook(studentUserId);
        const assessmentRes = await getStudentAssessment(studentUserId);

        setMentee(menteeRes.data);

        let logbookEntries =
          logbookRes.success && logbookRes.data?.entries
            ? logbookRes.data.entries
            : [];

        if (!logbookEntries || logbookEntries.length === 0) {
          console.log(`⚠️ No logbook for userId ${studentUserId}`);
        }

        setLogbookEntries(logbookEntries);
        setAssessment(
          assessmentRes.success && assessmentRes.data
            ? assessmentRes.data
            : null,
        );
      } catch (error) {
        if (!isMounted) return;
        const message =
          error instanceof Error
            ? error.message
            : "Gagal memuat detail mahasiswa.";
        setErrorMessage(message);
        setMentee(null);
        setLogbookEntries([]);
        setAssessment(null);
        toast.error(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDetail();

    return () => {
      isMounted = false;
    };
  }, [menteeId]);

  const activities = useMemo<ActivityItem[]>(() => {
    return logbookEntries
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
      .map((entry) => ({
        id: entry.id,
        type: "logbook",
        title: entry.description || entry.activity || "Logbook",
        date: entry.date,
        status: entry.status === "APPROVED" ? "approved" : "pending",
      }));
  }, [logbookEntries]);

  const averageScore = useMemo(() => {
    if (!assessment) return 0;
    return assessment.totalScore || 0;
  }, [assessment]);

  const progressValue = useMemo(() => {
    if (!logbookEntries.length) return 0;
    const approved = logbookEntries.filter(
      (entry) => entry.status === "APPROVED",
    ).length;
    return Math.round((approved / logbookEntries.length) * 100);
  }, [logbookEntries]);

  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6 text-muted-foreground">
            Memuat detail mahasiswa dari backend...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!mentee) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {errorMessage || "Data mahasiswa tidak ditemukan"}
            </p>
          </CardContent>
        </Card>
        <Button asChild className="mt-4">
          <Link to="/mentor/mentee">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Mahasiswa
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/mentor/mentee">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Mahasiswa
          </Link>
        </Button>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {mentee.nama || mentee.name || "-"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Mahasiswa Magang - NIM: {mentee.nim}
            </p>
          </div>
          <Badge
            variant={
              normalizeStatus(mentee.internshipStatus) === "Aktif"
                ? "default"
                : "secondary"
            }
            className="text-sm"
          >
            {normalizeStatus(mentee.internshipStatus)}
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Progress Magang</CardDescription>
            <CardTitle className="text-3xl">{progressValue}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Rata-rata Nilai</CardDescription>
            <CardTitle className="text-3xl">
              {averageScore.toFixed(1)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Aktivitas</CardDescription>
            <CardTitle className="text-3xl">{activities.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info">Informasi</TabsTrigger>
          <TabsTrigger value="activity">Aktivitas</TabsTrigger>
          <TabsTrigger value="assessment">Penilaian</TabsTrigger>
        </TabsList>

        {/* Tab: Informasi */}
        <TabsContent value="info" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Pribadi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Nama Lengkap</p>
                  <p className="font-medium">
                    {mentee.nama || mentee.name || "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">NIM</p>
                  <p className="font-medium">{mentee.nim}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{mentee.email}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Telepon</p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{mentee.phone || "-"}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Alamat</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">-</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informasi Akademik
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Universitas</p>
                  <p className="font-medium">-</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Program Studi</p>
                  <p className="font-medium">{mentee.prodi || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Semester</p>
                  <p className="font-medium">{mentee.semester ?? "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">IPK</p>
                  <p className="font-medium">-</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Informasi Magang
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Perusahaan</p>
                  <p className="font-medium">
                    {mentee.companyName || mentee.company || "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Pembimbing Lapangan
                  </p>
                  <p className="font-medium">-</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Tanggal Mulai</p>
                  <p className="font-medium">
                    {formatDate(mentee.internshipStartDate)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Tanggal Selesai
                  </p>
                  <p className="font-medium">
                    {formatDate(mentee.internshipEndDate)}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress Magang</span>
                  <span className="font-medium">{progressValue}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${progressValue}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button asChild>
              <Link to={`/mentor/logbook-detail/${menteeId}`}>
                <BookOpen className="mr-2 h-4 w-4" />
                Lihat Logbook
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/mentor/penilaian?mentee=${menteeId}`}>
                <Award className="mr-2 h-4 w-4" />
                Beri Penilaian
              </Link>
            </Button>
          </div>
        </TabsContent>

        {/* Tab: Aktivitas */}
        <TabsContent value="activity" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Aktivitas</CardTitle>
              <CardDescription>
                Aktivitas terbaru dari {mentee.nama || mentee.name || "-"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Belum ada aktivitas logbook.
                  </p>
                ) : (
                  activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 border rounded-lg"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        {activity.type === "logbook" ? (
                          <BookOpen className="h-5 w-5 text-primary" />
                        ) : (
                          <FileText className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(activity.date).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                      <Badge
                        variant={
                          activity.status === "approved"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {activity.status === "approved" ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Disetujui
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </>
                        )}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Penilaian */}
        <TabsContent value="assessment" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Penilaian</CardTitle>
              <CardDescription>
                Penilaian yang telah diberikan kepada{" "}
                {mentee.nama || mentee.name || "-"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assessment ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Penilaian Mentor</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(
                          assessment.updatedAt || assessment.createdAt,
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {assessment.totalScore.toFixed(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">dari 100</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Belum ada penilaian tersimpan.
                </p>
              )}

              <Separator className="my-6" />

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <p className="font-medium">Rata-rata Nilai</p>
                <p className="text-2xl font-bold">{averageScore.toFixed(1)}</p>
              </div>
            </CardContent>
          </Card>

          <Button asChild className="w-full">
            <Link to={`/mentor/penilaian?mentee=${menteeId}`}>
              <Award className="mr-2 h-4 w-4" />
              Tambah Penilaian Baru
            </Link>
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MenteeDetailPage;
