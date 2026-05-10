import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, BookMarked, CalendarDays, Camera, User } from "lucide-react";

import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  getDosenLogbookMonitorByStudent,
  getDosenLogbookMonitorItems,
  type DosenLogbookMonitorByStudentItem,
  type DosenLogbookMonitorItem,
} from "../services/logbook-monitor-api";

function getStatusBadge(status: DosenLogbookMonitorItem["status"]) {
  if (status === "APPROVED") {
    return (
      <Badge className="bg-green-600 hover:bg-green-600">
        Disetujui Mentor
      </Badge>
    );
  }

  if (status === "REJECTED") {
    return <Badge variant="destructive">Ditolak Mentor</Badge>;
  }

  return <Badge variant="secondary">Menunggu Review Mentor</Badge>;
}

function formatDate(value?: string) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

async function resolveStudentId(studentAlias: string): Promise<string> {
  const response = await getDosenLogbookMonitorItems();
  if (!response.success || !response.data) {
    return studentAlias;
  }

  const exactMatch = response.data.find(
    (item) =>
      item.studentId === studentAlias ||
      item.detailRouteKey === studentAlias ||
      item.nim === studentAlias ||
      item.id === studentAlias,
  );
  if (exactMatch?.studentId) return exactMatch.studentId;

  const byNim = response.data.find((item) => item.nim === studentAlias);
  if (byNim?.studentId) return byNim.studentId;

  const byRouteKey = response.data.find(
    (item) => item.detailRouteKey === studentAlias,
  );
  if (byRouteKey?.studentId) return byRouteKey.studentId;

  const byLegacyId = response.data.find((item) => item.id === studentAlias);
  if (byLegacyId?.studentId) return byLegacyId.studentId;

  return studentAlias;
}

export default function DosenLogbookMonitorDetailPage() {
  const { studentId } = useParams();

  const [detail, setDetail] = useState<DosenLogbookMonitorByStudentItem | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDetail() {
      if (!studentId) {
        setErrorMessage("Parameter mahasiswa tidak valid.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const resolvedStudentId = await resolveStudentId(studentId);
        const response =
          await getDosenLogbookMonitorByStudent(resolvedStudentId);

        if (!isMounted) return;

        if (response.success && response.data) {
          setDetail(response.data);
          return;
        }

        setDetail(null);
        setErrorMessage(
          response.message || "Detail logbook mahasiswa tidak tersedia.",
        );
      } catch (error) {
        if (!isMounted) return;

        const message =
          error instanceof Error
            ? error.message
            : "Gagal memuat detail logbook.";
        setDetail(null);
        setErrorMessage(message);
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
  }, [studentId]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const stats = useMemo(() => {
    const logbooks = detail?.logbooks || [];
    return {
      total: logbooks.length,
      approved: logbooks.filter((item) => item.status === "APPROVED").length,
      pending: logbooks.filter((item) => item.status === "PENDING").length,
      rejected: logbooks.filter((item) => item.status === "REJECTED").length,
    };
  }, [detail]);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Memuat detail logbook mahasiswa...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Detail Monitoring Logbook
          </h1>
          <p className="text-sm text-muted-foreground">
            Tampilan read-only untuk meninjau riwayat logbook mahasiswa.
          </p>
        </div>

        <Button asChild variant="outline">
          <Link to="/dosen/kp/logbook-monitor">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Link>
        </Button>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

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
                <AvatarFallback className="rounded-lg text-2xl font-bold bg-muted">
                  {getInitials(detail?.studentName)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Grid Information */}
            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Nama Mahasiswa</p>
                <p className="font-medium text-lg">
                  {detail?.studentName || "-"}
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">NIM</p>
                <p className="font-medium">{detail?.nim || "-"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Perusahaan</p>
                <p className="font-medium">{detail?.company || "-"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Program Studi</p>
                <p className="font-medium">{detail?.programStudi || "-"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Periode Magang</p>
                <p className="font-medium">
                  {detail?.startDate ? `${formatDate(detail.startDate)} - ${formatDate(detail.endDate)}` : "-"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Bidang</p>
                <p className="font-medium">{detail?.division || "-"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium break-all">{detail?.email || "-"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Entri</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-3xl font-bold">{stats.total}</p>
            <BookMarked className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Disetujui</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-3xl font-bold">{stats.approved}</p>
            <Badge className="bg-green-600 hover:bg-green-600">OK</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-3xl font-bold">{stats.pending}</p>
            <Badge variant="secondary">Pending</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-3xl font-bold">{stats.rejected}</p>
            <Badge variant="destructive">Reject</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Logbook</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Aktivitas</TableHead>
                  <TableHead className="w-28">Jam Input</TableHead>
                  <TableHead className="w-28 text-center">Jam Disetujui</TableHead>
                  <TableHead className="w-32 text-center">Foto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Catatan Revisi</TableHead>
                  <TableHead>Mentor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(detail?.logbooks || []).length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-20 text-center text-muted-foreground"
                    >
                      Tidak ada data logbook untuk mahasiswa ini.
                    </TableCell>
                  </TableRow>
                ) : (
                  detail!.logbooks.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                          {formatDate(item.date)}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[380px] truncate">
                        {item.activity}
                      </TableCell>
                      <TableCell>{item.time || "-"}</TableCell>
                      <TableCell className="text-center font-medium">
                        {item.approvedTime || "-"}
                      </TableCell>
                      {/* Foto Kegiatan — Read Only */}
                      <TableCell className="text-center">
                        {item.photoUrl || item.photo_url ? (
                          <a
                            href={item.photoUrl || item.photo_url!}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Lihat foto kegiatan"
                          >
                            <img
                              src={item.photoUrl || item.photo_url!}
                              alt="Foto kegiatan"
                              className="h-12 w-12 object-cover rounded-md border mx-auto hover:scale-110 transition-transform"
                            />
                          </a>
                        ) : (
                          <Camera className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="max-w-[320px] truncate">
                        {item.rejectionReason || "-"}
                      </TableCell>
                      <TableCell>{item.mentorName || "-"}</TableCell>
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
