import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle, Clock, Filter, ListOrdered, Search } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import ApproveDialog from "../components/approve-dialog";
import DetailDialog from "../components/detail-dialog";
import {
  getAllResponseLettersForAdmin,
  verifyResponseLetter,
} from "~/lib/services/response-letter.service";

import type { Student } from "../types";

type ResponseLetterAdminApiItem = Partial<Student> & {
  npm?: string | null;
  programStudi?: string | null;
  academicSupervisor?: string | null;
  academic_supervisor?: string | null;
  supervisorName?: string | null;
  supervisor_name?: string | null;
  teamMembers?: Array<{
    id?: number | string;
    name?: string | null;
    nim?: string | null;
    npm?: string | null;
    prodi?: string | null;
    programStudi?: string | null;
    role?: string | null;
    user?: {
      name?: string | null;
      nim?: string | null;
      npm?: string | null;
      prodi?: string | null;
      programStudi?: string | null;
    } | null;
  }>;
};

const getFirstNonEmptyText = (...values: Array<string | null | undefined>) =>
  values.find((value) => typeof value === "string" && value.trim())?.trim();

const normalizeResponseLetterStudent = (
  student: ResponseLetterAdminApiItem,
): Student => {
  const members =
    student.members ??
    student.teamMembers?.map((member, index) => {
      const resolvedName = getFirstNonEmptyText(member.name, member.user?.name);
      const resolvedNim = getFirstNonEmptyText(
        member.nim,
        member.npm,
        member.user?.nim,
        member.user?.npm,
      );
      const resolvedProdi = getFirstNonEmptyText(
        member.prodi,
        member.programStudi,
        member.user?.prodi,
        member.user?.programStudi,
      );

      return {
        id: Number(member.id ?? index + 1),
        name: resolvedName || "Unknown",
        nim: resolvedNim,
        prodi: resolvedProdi,
        role: member.role === "Anggota" ? "Anggota" : "Ketua",
      };
    });

  const leaderMember = members?.find((member) => member.role === "Ketua");
  const fallbackMember = members?.[0];
  const resolvedProdi = getFirstNonEmptyText(
    student.prodi,
    student.programStudi,
    leaderMember?.prodi,
    fallbackMember?.prodi,
  );
  const resolvedSupervisor = getFirstNonEmptyText(
    student.supervisor,
    student.academicSupervisor,
    student.academic_supervisor,
    student.supervisorName,
    student.supervisor_name,
  );

  return {
    id: student.id ?? "-",
    name: student.name || "Unknown",
    nim: getFirstNonEmptyText(student.nim, student.npm) || "Unknown",
    prodi: resolvedProdi || "Unknown",
    tanggal: student.tanggal || "Unknown",
    company: student.company || "Unknown",
    status: student.status || "Ditolak",
    adminApproved: student.adminApproved ?? false,
    role: student.role,
    memberCount: student.memberCount ?? members?.length ?? 1,
    supervisor: resolvedSupervisor,
    members,
    responseFileUrl: student.responseFileUrl,
    submittedAt: student.submittedAt,
    verified: student.verified,
    verifiedAt: student.verifiedAt,
    fileUrl: student.fileUrl,
    originalName: student.originalName,
  };
};

function AdminResponseLetterPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getSafeText = (value?: string) =>
    value && value.trim() ? value : "Unknown";
  const getStudentNim = (student: Student) =>
    getSafeText(student.nim || student.npm);
  const isApprovedStatus = (status?: string) =>
    status === "Disetujui" || status?.toLowerCase() === "approved";
  const isRejectedStatus = (status?: string) =>
    status === "Ditolak" || status?.toLowerCase() === "rejected";
  const getDisplayStatus = (status?: string) => {
    if (isApprovedStatus(status)) return "Disetujui";
    if (isRejectedStatus(status)) return "Ditolak";
    return "Unknown";
  };
  const getStatusBadgeClass = (status?: string) =>
    isApprovedStatus(status)
      ? "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400"
      : "border-destructive/30 bg-destructive/10 text-destructive";

  useEffect(() => {
    const loadResponseLetters = async () => {
      try {
        setIsLoading(true);
        console.log("ðŸ”„ Fetching response letters for admin...");

        const response = await getAllResponseLettersForAdmin();

        if (response.success && response.data && response.data.length > 0) {
          console.log(
            "âœ… Loaded response letters from backend:",
            response.data,
          );
          setStudents(
            response.data.map((item) =>
              normalizeResponseLetterStudent(
                item as ResponseLetterAdminApiItem,
              ),
            ),
          );
        } else if (
          response.success &&
          (!response.data || response.data.length === 0)
        ) {
          console.log("â„¹ï¸ No response letters found");
          setStudents([]);
        } else {
          console.error(
            "âŒ Failed to load response letters:",
            response.message,
          );
          toast.error(response.message || "Gagal memuat daftar surat balasan");
          setStudents([]);
        }
      } catch (error) {
        console.error("âŒ Error loading response letters:", error);
        toast.error("Terjadi kesalahan saat memuat surat balasan");
        setStudents([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadResponseLetters();
  }, []);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");

  // Calculate statistics
  const stats = useMemo(() => {
    const approvedNotVerified = students.filter(
      (s) => isApprovedStatus(s.status) && !s.adminApproved,
    ).length;
    const rejectedNotVerified = students.filter(
      (s) => isRejectedStatus(s.status) && !s.adminApproved,
    ).length;
    const approvedVerified = students.filter(
      (s) => isApprovedStatus(s.status) && s.adminApproved,
    ).length;
    const rejectedVerified = students.filter(
      (s) => isRejectedStatus(s.status) && s.adminApproved,
    ).length;
    const total = students.length;

    return [
      {
        title: "Belum Diverifikasi",
        value: approvedNotVerified + rejectedNotVerified,
        icon: Clock,
        iconBgColor: "bg-amber-500",
        breakdown: [
          { label: "Disetujui", count: approvedNotVerified },
          { label: "Ditolak", count: rejectedNotVerified },
        ],
      },
      {
        title: "Telah Diverifikasi",
        value: approvedVerified + rejectedVerified,
        icon: CheckCircle,
        iconBgColor: "bg-green-600",
        breakdown: [
          { label: "Disetujui", count: approvedVerified },
          { label: "Ditolak", count: rejectedVerified },
        ],
      },
      {
        title: "Total Pengajuan",
        value: total,
        icon: ListOrdered,
        iconBgColor: "bg-primary",
      },
    ];
  }, [students]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        getSafeText(student.name)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        getStudentNim(student).toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "approved" && isApprovedStatus(student.status)) ||
        (statusFilter === "rejected" && isRejectedStatus(student.status));

      const matchesVerification =
        verificationFilter === "all" ||
        (verificationFilter === "verified" && student.adminApproved) ||
        (verificationFilter === "not-verified" && !student.adminApproved);

      return matchesSearch && matchesStatus && matchesVerification;
    });
  }, [students, searchTerm, statusFilter, verificationFilter]);

  const handleViewDetail = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailDialog(true);
  };

  const handleApprove = (student: Student) => {
    setSelectedStudent(student);
    setShowApproveDialog(true);
  };

  const handleSubmitAction = async () => {
    if (!selectedStudent) return;

    try {
      const letterStatus =
        selectedStudent.status === "Disetujui" ? "approved" : "rejected";

      // Call API to verify response letter
      const response = await verifyResponseLetter(
        selectedStudent.id.toString(),
        letterStatus,
      );

      if (response.success) {
        // Update admin approval status locally
        setStudents((prevStudents) =>
          prevStudents.map((s) =>
            s.id === selectedStudent.id ? { ...s, adminApproved: true } : s,
          ),
        );
        toast.success(
          `Surat balasan ${selectedStudent.name} berhasil diverifikasi!`,
        );
      } else {
        toast.error(response.message || "Gagal memverifikasi surat balasan");
      }
    } catch (error) {
      console.error("Error verifying response letter:", error);
      toast.error("Terjadi kesalahan saat memverifikasi surat balasan");
    } finally {
      setShowApproveDialog(false);
      setSelectedStudent(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-background min-h-screen">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
            <p className="text-muted-foreground">Memuat surat balasan...</p>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-foreground">
                Surat Balasan
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Kelola dan review surat balasan dari perusahaan untuk kerja
                praktik mahasiswa
              </p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6 flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-white flex-shrink-0 ${stat.iconBgColor}`}
                  >
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </h3>
                    <p className="text-muted-foreground text-md">
                      {stat.title}
                    </p>
                    {stat.breakdown && (
                      <div className="space-y-1 mt-1">
                        {stat.breakdown.map((item, idx) => (
                          <div key={idx} className="text-xs font-medium">
                            <span
                              className={
                                item.label === "Disetujui"
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-destructive"
                              }
                            >
                              {item.label}
                            </span>
                            <span className="text-muted-foreground">
                              {" "}
                              : {item.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Filter and Search */}
          <Card>
            <CardContent className="p-4 flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
              <div className="flex-1 min-w-[250px] relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Cari nama mahasiswa atau nim..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="approved">Disetujui</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={verificationFilter}
                onValueChange={setVerificationFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Verifikasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="verified">Terverifikasi</SelectItem>
                  <SelectItem value="not-verified">
                    Belum Diverifikasi
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </CardContent>
          </Card>

          {/* Applications Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-foreground">
                Daftar Surat Balasan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="pl-6 whitespace-nowrap">Tanggal</TableHead>
                    <TableHead className="whitespace-nowrap">Nama Mahasiswa</TableHead>
                    <TableHead className="whitespace-nowrap">Perusahaan</TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className="pr-6 whitespace-nowrap">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id} className="hover:bg-muted/50">
                      <TableCell className="pl-6 text-foreground">
                        {getSafeText(student.tanggal)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground">
                          {getSafeText(student.name)}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {(student.memberCount || 0) > 1
                            ? `+ ${student.memberCount - 1} Anggota`
                            : "Individu"}
                        </span>
                      </TableCell>
                      <TableCell className="text-foreground">
                        {getSafeText(student.company)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 ${getStatusBadgeClass(student.status)}`}
                          >
                            <span
                              className={`mr-1.5 h-1.5 w-1.5 rounded-full ${isApprovedStatus(student.status) ? "bg-green-500" : "bg-destructive"}`}
                            />
                            {getDisplayStatus(student.status)}
                          </Badge>
                          {student.adminApproved && (
                            <Badge
                              variant="outline"
                              className="rounded-full border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs px-2.5 py-0.5"
                            >
                              Terverifikasi
                            </Badge>
                          )}
                          {!student.adminApproved && (
                            <span className="text-xs text-muted-foreground">
                              Belum diverifikasi
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="pr-6">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-primary border-primary/50 hover:bg-primary/5"
                          onClick={() => handleViewDetail(student)}
                        >
                          Lihat
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Detail Dialog */}
          <DetailDialog
            open={showDetailDialog}
            onOpenChange={setShowDetailDialog}
            student={selectedStudent}
            onApprove={handleApprove}
          />

          {/* Approve Dialog */}
          <ApproveDialog
            open={showApproveDialog}
            onOpenChange={setShowApproveDialog}
            student={selectedStudent}
            onConfirm={handleSubmitAction}
          />
        </div>
      )}
    </div>
  );
}

export default AdminResponseLetterPage;
