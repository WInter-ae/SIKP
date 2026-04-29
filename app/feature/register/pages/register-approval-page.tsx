// 1. External dependencies
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Mail,
  Calendar,
  Filter,
  Building2,
  Phone,
} from "lucide-react";

// 2. Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Textarea } from "~/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import {
  approveMentorEmailChangeRequest,
  approveMentorRegistrationRequest,
  getMentorEmailChangeRequests,
  getMentorRegistrationRequests,
  rejectMentorEmailChangeRequest,
  rejectMentorRegistrationRequest,
} from "../services/register-approval-api";

// Tipe data untuk pendaftaran dosen
import type {
  PendingEmailChangeRequest,
  PendingRegistration,
} from "../services/register-approval-api";

export default function RegisterApprovalPage() {
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedRegistration, setSelectedRegistration] =
    useState<PendingRegistration | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<"approve" | "reject">(
    "approve",
  );
  const [rejectReason, setRejectReason] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [emailChangeRequests, setEmailChangeRequests] = useState<
    PendingEmailChangeRequest[]
  >([]);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);

      const [registrationResponse, emailChangeResponse] = await Promise.all([
        getMentorRegistrationRequests(),
        getMentorEmailChangeRequests(),
      ]);

      if (registrationResponse.success && registrationResponse.data) {
        setRegistrations(registrationResponse.data);
      } else {
        setRegistrations([]);
        toast.info(
          registrationResponse.message ||
            "Endpoint pengajuan pembimbing belum tersedia.",
        );
      }

      if (emailChangeResponse.success && emailChangeResponse.data) {
        setEmailChangeRequests(emailChangeResponse.data);
      } else {
        setEmailChangeRequests([]);
      }

      setIsLoading(false);
    };

    loadInitialData();
  }, []);

  // Handler untuk membuka dialog konfirmasi
  const handleOpenDialog = (
    registration: PendingRegistration,
    action: "approve" | "reject",
  ) => {
    setSelectedRegistration(registration);
    setDialogAction(action);
    setRejectReason("");
    setDialogOpen(true);
  };

  // Handler untuk approve pendaftaran
  const handleApprove = async () => {
    if (!selectedRegistration) return;

    try {
      const response = await approveMentorRegistrationRequest(
        selectedRegistration.id,
      );
      if (!response.success) {
        toast.error(response.message || "Gagal menyetujui pendaftaran");
        return;
      }

      // Update state
      setRegistrations(
        registrations.map((reg) =>
          reg.id === selectedRegistration.id
            ? { ...reg, status: "approved" }
            : reg,
        ),
      );

      setDialogOpen(false);
      setSelectedRegistration(null);
      toast.success("Pendaftaran pembimbing disetujui");
    } catch (error) {
      console.error("Error approving registration:", error);
      toast.error("Terjadi kesalahan saat menyetujui pendaftaran");
    }
  };

  // Handler untuk reject pendaftaran
  const handleReject = async () => {
    if (!selectedRegistration) return;

    const reason = rejectReason.trim();
    if (!reason) {
      toast.error("Alasan penolakan harus diisi");
      return;
    }

    try {
      const response = await rejectMentorRegistrationRequest(
        selectedRegistration.id,
        reason,
      );
      if (!response.success) {
        toast.error(response.message || "Gagal menolak pendaftaran");
        return;
      }

      // Update state
      setRegistrations(
        registrations.map((reg) =>
          reg.id === selectedRegistration.id
            ? { ...reg, status: "rejected" }
            : reg,
        ),
      );

      setDialogOpen(false);
      setSelectedRegistration(null);
      setRejectReason("");
      toast.success("Pendaftaran pembimbing ditolak");
    } catch (error) {
      console.error("Error rejecting registration:", error);
      toast.error("Terjadi kesalahan saat menolak pendaftaran");
    }
  };

  // Format tanggal
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter registrations berdasarkan status dan search query
  const filteredRegistrations = registrations.filter((reg) => {
    const matchesStatus = filterStatus === "all" || reg.status === filterStatus;
    const matchesSearch =
      searchQuery === "" ||
      reg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.nip?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.studentName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Hitung statistik
  const stats = {
    pending: registrations.filter((r) => r.status === "pending").length,
    approved: registrations.filter((r) => r.status === "approved").length,
    rejected: registrations.filter((r) => r.status === "rejected").length,
    total: registrations.length,
  };

  const emailRequestStats = {
    pending: emailChangeRequests.filter((r) => r.status === "pending").length,
    approved: emailChangeRequests.filter((r) => r.status === "approved").length,
    rejected: emailChangeRequests.filter((r) => r.status === "rejected").length,
    total: emailChangeRequests.length,
  };

  const processEmailChangeRequest = (
    requestId: string,
    action: "approve" | "reject",
  ) => {
    const run = async () => {
      if (action === "reject") {
        const reason = window.prompt(
          "Masukkan alasan penolakan perubahan email",
        );
        if (!reason || !reason.trim()) {
          toast.error("Alasan penolakan harus diisi");
          return;
        }

        const response = await rejectMentorEmailChangeRequest(
          requestId,
          reason.trim(),
        );

        if (!response.success) {
          toast.error(
            response.message || "Gagal memproses pengajuan perubahan email",
          );
          return;
        }

        setEmailChangeRequests((prev) =>
          prev.map((item) =>
            item.id === requestId
              ? {
                  ...item,
                  status: "rejected",
                }
              : item,
          ),
        );

        toast.success("Pengajuan perubahan email ditolak.");
        return;
      }

      const response = await approveMentorEmailChangeRequest(requestId);

      if (!response.success) {
        toast.error(
          response.message || "Gagal memproses pengajuan perubahan email",
        );
        return;
      }

      setEmailChangeRequests((prev) =>
        prev.map((item) =>
          item.id === requestId
            ? {
                ...item,
                status: action === "approve" ? "approved" : "rejected",
              }
            : item,
        ),
      );

      toast.success(
        action === "approve"
          ? "Pengajuan perubahan email disetujui."
          : "Pengajuan perubahan email ditolak.",
      );
    };

    run();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Memuat data persetujuan pembimbing...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Persetujuan Pembimbing Lapangan (Dosen PA)
        </h1>
        <p className="text-muted-foreground">
          Tinjau pengajuan pembimbing lapangan yang diajukan mahasiswa
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pendaftar
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Seluruh pendaftaran</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Perlu ditinjau</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disetujui</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Sudah disetujui</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">Tidak disetujui</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pendaftaran</CardTitle>
          <CardDescription>
            Tinjau dan proses pendaftaran pembimbing lapangan yang di-request
            mahasiswa
          </CardDescription>

          {/* Filters */}
          <div className="flex flex-col gap-4 pt-4 sm:flex-row">
            <div className="flex-1">
              <Input
                placeholder="Cari nama mentor, mahasiswa, atau perusahaan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="approved">Disetujui</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredRegistrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UserCheck className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Tidak ada pendaftaran
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || filterStatus !== "all"
                  ? "Tidak ada pendaftaran yang sesuai dengan filter"
                  : "Belum ada pendaftaran pembimbing lapangan yang perlu ditinjau"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pembimbing Lapangan</TableHead>
                    <TableHead>Perusahaan</TableHead>
                    <TableHead>Posisi</TableHead>
                    <TableHead>Mahasiswa Pemohon</TableHead>
                    <TableHead>Tanggal Daftar</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {registration.name}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {registration.email}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {registration.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {registration.company}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{registration.position}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {registration.studentName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {registration.studentNim}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {registration.studentEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatDate(registration.registeredAt)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {registration.status === "pending" && (
                          <Badge variant="secondary">
                            <Clock className="mr-1 h-3 w-3" />
                            Menunggu
                          </Badge>
                        )}
                        {registration.status === "approved" && (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Disetujui
                          </Badge>
                        )}
                        {registration.status === "rejected" && (
                          <Badge variant="destructive">
                            <XCircle className="mr-1 h-3 w-3" />
                            Ditolak
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {registration.status === "pending" && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-green-500 hover:bg-green-600"
                              onClick={() =>
                                handleOpenDialog(registration, "approve")
                              }
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Setujui
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleOpenDialog(registration, "reject")
                              }
                            >
                              <XCircle className="mr-1 h-4 w-4" />
                              Tolak
                            </Button>
                          </div>
                        )}
                        {registration.status !== "pending" && (
                          <span className="text-sm text-muted-foreground">
                            Sudah diproses
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pengajuan Perubahan Email Mentor</CardTitle>
          <CardDescription>
            Setujui atau tolak pengajuan perubahan email dari pembimbing
            lapangan.
          </CardDescription>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-1">
            <span>Total: {emailRequestStats.total}</span>
            <span>Menunggu: {emailRequestStats.pending}</span>
            <span>Disetujui: {emailRequestStats.approved}</span>
            <span>Ditolak: {emailRequestStats.rejected}</span>
          </div>
        </CardHeader>
        <CardContent>
          {emailChangeRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada pengajuan perubahan email.
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mentor</TableHead>
                    <TableHead>Email Saat Ini</TableHead>
                    <TableHead>Email Diajukan</TableHead>
                    <TableHead>Alasan</TableHead>
                    <TableHead>Mahasiswa Terkait</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emailChangeRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.mentorName}
                      </TableCell>
                      <TableCell>{request.currentEmail}</TableCell>
                      <TableCell>{request.requestedEmail}</TableCell>
                      <TableCell>{request.reason}</TableCell>
                      <TableCell>{request.studentName}</TableCell>
                      <TableCell>{formatDate(request.requestedAt)}</TableCell>
                      <TableCell>
                        {request.status === "pending" && (
                          <Badge variant="secondary">
                            <Clock className="mr-1 h-3 w-3" />
                            Menunggu
                          </Badge>
                        )}
                        {request.status === "approved" && (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Disetujui
                          </Badge>
                        )}
                        {request.status === "rejected" && (
                          <Badge variant="destructive">
                            <XCircle className="mr-1 h-3 w-3" />
                            Ditolak
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {request.status === "pending" ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600"
                              onClick={() =>
                                processEmailChangeRequest(request.id, "approve")
                              }
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Setujui
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                processEmailChangeRequest(request.id, "reject")
                              }
                            >
                              <XCircle className="mr-1 h-4 w-4" />
                              Tolak
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Sudah diproses
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogAction === "approve"
                ? "Setujui Pendaftaran?"
                : "Tolak Pendaftaran?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogAction === "approve" ? (
                <>
                  Anda akan menyetujui pendaftaran{" "}
                  <strong>{selectedRegistration?.name}</strong>. Pembimbing
                  lapangan ini akan terkait ke mahasiswa pemohon setelah proses
                  persetujuan selesai.
                </>
              ) : (
                <>
                  Anda akan menolak pendaftaran{" "}
                  <strong>{selectedRegistration?.name}</strong>. Pendaftar akan
                  menerima notifikasi penolakan.
                </>
              )}
            </AlertDialogDescription>
            {dialogAction === "reject" && (
              <div className="space-y-2 pt-4">
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Masukkan alasan penolakan"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Alasan penolakan akan dikirim ke backend.
                </p>
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={
                dialogAction === "approve" ? handleApprove : handleReject
              }
              className={
                dialogAction === "reject"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              {dialogAction === "approve" ? "Setujui" : "Tolak"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
