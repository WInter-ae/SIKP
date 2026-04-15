import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, BookMarked, CalendarDays } from "lucide-react";

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
import {
  getDosenLogbookMonitorByStudent,
  getDosenLogbookMonitorItems,
  type DosenLogbookMonitorByStudentItem,
  type DosenLogbookMonitorItem,
} from "../services/logbook-monitor-api";

function getStatusBadge(status: DosenLogbookMonitorItem["status"]) {
  if (status === "APPROVED") {
    return <Badge className="bg-green-600 hover:bg-green-600">Disetujui Mentor</Badge>;
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
      item.id === studentAlias
  );
  if (exactMatch?.studentId) return exactMatch.studentId;

  const byNim = response.data.find((item) => item.nim === studentAlias);
  if (byNim?.studentId) return byNim.studentId;

  const byRouteKey = response.data.find((item) => item.detailRouteKey === studentAlias);
  if (byRouteKey?.studentId) return byRouteKey.studentId;

  const byLegacyId = response.data.find((item) => item.id === studentAlias);
  if (byLegacyId?.studentId) return byLegacyId.studentId;

  return studentAlias;
}

export default function DosenLogbookMonitorDetailPage() {
  const { studentId } = useParams();

  const [detail, setDetail] = useState<DosenLogbookMonitorByStudentItem | null>(null);
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
        const response = await getDosenLogbookMonitorByStudent(resolvedStudentId);

        if (!isMounted) return;

        if (response.success && response.data) {
          setDetail(response.data);
          return;
        }

        setDetail(null);
        setErrorMessage(response.message || "Detail logbook mahasiswa tidak tersedia.");
      } catch (error) {
        if (!isMounted) return;

        const message = error instanceof Error ? error.message : "Gagal memuat detail logbook.";
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
          <h1 className="text-3xl font-bold tracking-tight">Detail Monitoring Logbook</h1>
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
          <CardTitle>Informasi Mahasiswa</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Nama</p>
            <p className="font-medium">{detail?.studentName || "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">NIM</p>
            <p className="font-medium">{detail?.nim || "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Perusahaan</p>
            <p className="font-medium">{detail?.company || "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
            <p className="font-medium">{detail?.email || "-"}</p>
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Aktivitas</TableHead>
                  <TableHead>Jam</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Catatan Revisi</TableHead>
                  <TableHead>Mentor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(detail?.logbooks || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-20 text-center text-muted-foreground">
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
                      <TableCell className="max-w-[380px] truncate">{item.activity}</TableCell>
                      <TableCell>{item.hours ?? "-"}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="max-w-[320px] truncate">{item.rejectionReason || "-"}</TableCell>
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