import { useEffect, useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  CheckCircle,
  Clock,
  ArrowLeft,
  User,
  Calendar,
} from "lucide-react";

import {
  approveAllLogbooks,
  approveLogbook,
  getMenteeDetail,
  getMentees,
  getStudentLogbook,
  type LogbookEntry,
  type MenteeData,
} from "../services";
import { RejectLogbookButton } from "../components/reject-logbook-button";

type ViewLogbookEntry = {
  id: string;
  date: string;
  description: string;
  activity: string;
  photoUrl?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

function coerceText(value: unknown, fallback = "-") {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function formatDate(dateString?: string, mounted = true) {
  if (!dateString || !mounted) return dateString || "-";
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
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

function StudentLogbookDetailPage() {
  const { studentId } = useParams();

  const [student, setStudent] = useState<MenteeData | null>(null);
  const [entries, setEntries] = useState<ViewLogbookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApprovingAll, setIsApprovingAll] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!studentId) {
        setErrorMessage("Parameter mahasiswa tidak valid.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const resolvedStudentId = await resolveStudentUserId(studentId);

        let studentRes = await getMenteeDetail(resolvedStudentId);

        if (!isMounted) return;

        if (!studentRes.success || !studentRes.data) {
          setStudent(null);
          setEntries([]);
          setErrorMessage(studentRes.message || "Mahasiswa tidak ditemukan.");
          return;
        }

        setStudent(studentRes.data);

        // Backend expects userId for GET /api/mentor/logbook/:studentId
        const studentUserId = studentRes.data?.userId || resolvedStudentId;
        let logbookRes = await getStudentLogbook(studentUserId);

        let backendEntries: LogbookEntry[] = [];
        if (logbookRes.success && logbookRes.data) {
          if (Array.isArray(logbookRes.data)) {
            backendEntries = logbookRes.data;
          } else if ((logbookRes.data as any).entries) {
            backendEntries = (logbookRes.data as any).entries;
          }
        }

        const mentorVisibleEntries = backendEntries.filter(
          (
            entry,
          ): entry is LogbookEntry & {
            status: "PENDING" | "APPROVED" | "REJECTED";
          } => entry.status !== "DRAFT",
        );

        const mapped = mentorVisibleEntries
          .map((entry) => ({
            id: coerceText(
              entry.id,
              `${entry.date || "logbook"}-${entry.activity || entry.description || "entry"}`,
            ),
            date: coerceText(entry.date, ""),
            description: coerceText(entry.description || entry.activity, "-"),
            activity: coerceText(entry.activity || entry.description, "-"),
            photoUrl: entry.photoUrl || entry.photo_url || null,
            status: entry.status,
          }))
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          );

        setEntries(mapped);
      } catch (error) {
        if (!isMounted) return;
        const message =
          error instanceof Error
            ? error.message
            : "Gagal memuat logbook mahasiswa.";
        setStudent(null);
        setEntries([]);
        setErrorMessage(message);
        toast.error(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [studentId]);

  const totalEntries = entries.length;
  const approvedEntries = entries.filter(
    (entry) => entry.status === "APPROVED",
  ).length;
  const pendingEntries = entries.filter(
    (entry) => entry.status === "PENDING",
  ).length;

  async function handleSignLogbook(logbookId: string) {
    try {
      const response = await approveLogbook(logbookId);
      if (!response.success) {
        toast.error(response.message || "Gagal menyetujui logbook.");
        return;
      }

      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === logbookId ? { ...entry, status: "APPROVED" } : entry,
        ),
      );
      toast.success("Logbook berhasil disetujui.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menyetujui logbook.",
      );
    }
  }

  function handleRejectLogbook(logbookId: string) {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === logbookId ? { ...entry, status: "REJECTED" } : entry,
      ),
    );
  }

  async function handleSignAllLogbooks() {
    const effectiveStudentId = student?.userId || studentId;
    if (!effectiveStudentId) return;
    if (pendingEntries === 0) {
      toast.info("Tidak ada logbook yang perlu diparaf.");
      return;
    }

    setIsApprovingAll(true);
    try {
      const response = await approveAllLogbooks(effectiveStudentId);
      if (!response.success) {
        toast.error(response.message || "Gagal paraf semua logbook.");
        return;
      }

      setEntries((prev) =>
        prev.map((entry) =>
          entry.status === "PENDING" ? { ...entry, status: "APPROVED" } : entry,
        ),
      );
      toast.success("Semua logbook pending berhasil disetujui.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal paraf semua logbook.",
      );
    } finally {
      setIsApprovingAll(false);
    }
  }



  function getStatusBadge(status: ViewLogbookEntry["status"]) {
    if (status === "APPROVED") {
      return (
        <Badge className="bg-green-500">
          <CheckCircle className="w-3 h-3 mr-1" />
          Disetujui
        </Badge>
      );
    }

    if (status === "REJECTED") {
      return <Badge variant="destructive">Ditolak</Badge>;
    }

    return (
      <Badge variant="outline" className="bg-yellow-50">
        <Clock className="w-3 h-3 mr-1" />
        Menunggu Paraf
      </Badge>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6 text-muted-foreground">
            Memuat detail logbook mahasiswa...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            {errorMessage || "Mahasiswa tidak ditemukan"}
          </AlertDescription>
        </Alert>
        <Button asChild className="mt-4">
          <Link to="/mentor/logbook">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link to="/mentor/logbook">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Mahasiswa
          </Link>
        </Button>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Detail Logbook Mahasiswa
            </h1>
            <p className="text-muted-foreground mt-1">
              Menampilkan aktivitas logbook mahasiswa secara real-time dari
              backend
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSignAllLogbooks}
              disabled={pendingEntries === 0 || isApprovingAll}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {isApprovingAll ? "Memproses..." : "Paraf Semua"}
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informasi Mahasiswa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <Avatar className="h-24 w-24 rounded-lg border-2 border-muted">
                <AvatarImage src={(student as any).photoUrl || (student as any).photo} alt={student.nama || student.name} />
                <AvatarFallback className="rounded-lg text-2xl font-bold bg-muted">
                  {(student.nama || student.name || "M").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Nama Mahasiswa</p>
                <p className="font-medium text-lg">
                  {student.nama || student.name || "-"}
                </p>
              </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">NIM</p>
              <p className="font-medium">{student.nim}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Program Studi</p>
              <p className="font-medium">{student.prodi || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Periode Magang</p>
              <p className="font-medium">
                {formatDate(student.internshipStartDate || student.startDate, mounted)} - {formatDate(student.internshipEndDate || student.endDate, mounted)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Bidang</p>
              <p className="font-medium">{student.division || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{student.email || "-"}</p>
            </div>
          </div>
        </div>
      </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Logbook</CardDescription>
            <CardTitle className="text-3xl">{totalEntries}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Disetujui</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {approvedEntries}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Menunggu Paraf</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {pendingEntries}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {pendingEntries > 0 && (
        <Alert className="border-l-4 border-yellow-500 bg-yellow-50">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Ada {pendingEntries} logbook yang menunggu paraf Anda.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daftar Logbook
          </CardTitle>
          <CardDescription>
            Semua entri logbook mahasiswa dari endpoint backend
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table className="table-fixed w-full">
              <colgroup>
                <col className="w-28" />
                <col />
                <col className="w-24" />
                <col className="w-36" />
                <col className="w-40" />
              </colgroup>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28 text-left align-middle text-sm font-semibold">
                    Tanggal
                  </TableHead>
                  <TableHead className="text-left align-middle text-sm font-semibold">
                    Deskripsi Kegiatan
                  </TableHead>
                  <TableHead className="w-24 text-center text-sm font-semibold">
                    Foto
                  </TableHead>
                  <TableHead className="w-36 text-sm font-semibold">
                    Status Paraf
                  </TableHead>
                  <TableHead className="w-40 text-sm font-semibold">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Belum ada logbook yang diajukan mahasiswa ini.
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((entry) => (
                    <TableRow key={entry.id} className="align-top">
                      <TableCell className="align-middle text-left text-xs sm:text-sm border-r py-4 pr-3 whitespace-nowrap">
                        {formatDate(entry.date, mounted)}
                      </TableCell>
                      <TableCell className="align-middle text-left py-4 min-w-0">
                        <div className="min-h-16 min-w-0 break-words flex flex-col justify-center gap-2">
                          <p className="font-medium text-sm leading-5 whitespace-normal break-words min-w-0">
                            {entry.description}
                          </p>
                          {entry.activity &&
                            entry.activity.trim() !==
                              entry.description.trim() && (
                              <p className="text-sm leading-5 text-muted-foreground whitespace-pre-line break-words min-w-0">
                                {entry.activity}
                              </p>
                            )}
                        </div>
                      </TableCell>
                      {/* Foto Kegiatan — Read Only */}
                      <TableCell className="align-middle text-center py-4">
                        {entry.photoUrl ? (
                          <a
                            href={entry.photoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Lihat foto kegiatan"
                          >
                            <img
                              src={entry.photoUrl}
                              alt="Foto kegiatan"
                              className="h-14 w-14 object-cover rounded-md border mx-auto hover:scale-110 transition-transform"
                            />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="align-middle py-4">
                        {getStatusBadge(entry.status)}
                      </TableCell>
                      <TableCell className="align-middle py-4">
                        {entry.status === "PENDING" ? (
                          <div className="flex flex-wrap items-center gap-2 min-w-0">
                            <Button
                              size="sm"
                              onClick={() => handleSignLogbook(entry.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Paraf
                            </Button>
                            <RejectLogbookButton
                              logbookId={entry.id}
                              studentName={student.nama || student.name || "-"}
                              date={entry.date}
                              activity={entry.activity}
                              onSuccess={() => handleRejectLogbook(entry.id)}
                              size="sm"
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Selesai
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default StudentLogbookDetailPage;
