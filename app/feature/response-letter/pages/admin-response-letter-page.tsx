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
} from "~/lib/services/response-letter-api";

import type { Student } from "../types";

function AdminResponseLetterPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadResponseLetters = async () => {
      try {
        setIsLoading(true);
        console.log("🔄 Fetching response letters for admin...");

        const response = await getAllResponseLettersForAdmin();

        if (response.success && response.data && response.data.length > 0) {
          console.log(
            "✅ Loaded response letters from backend:",
            response.data,
          );
          setStudents(response.data as Student[]);
        } else if (
          response.success &&
          (!response.data || response.data.length === 0)
        ) {
          console.log("ℹ️ No response letters found");
          setStudents([]);
        } else {
          console.error(
            "❌ Failed to load response letters:",
            response.message,
          );
          toast.error(response.message || "Gagal memuat daftar surat balasan");
          setStudents([]);
        }
      } catch (error) {
        console.error("❌ Error loading response letters:", error);
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
      (s) => s.status === "Disetujui" && !s.adminApproved,
    ).length;
    const rejectedNotVerified = students.filter(
      (s) => s.status === "Ditolak" && !s.adminApproved,
    ).length;
    const approvedVerified = students.filter(
      (s) => s.status === "Disetujui" && s.adminApproved,
    ).length;
    const rejectedVerified = students.filter(
      (s) => s.status === "Ditolak" && s.adminApproved,
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
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.nim.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "approved" && student.status === "Disetujui") ||
        (statusFilter === "rejected" && student.status === "Ditolak");

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
    <div className="p-6 md:p-8 bg-background min-h-screen">
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
              <h1 className="text-3xl font-bold text-foreground">
                Surat Balasan
              </h1>
              <p className="text-muted-foreground mt-1">
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
            <CardContent className="p-4 flex flex-wrap gap-4 items-center">
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
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="pl-6">Tanggal</TableHead>
                    <TableHead>Nama Mahasiswa</TableHead>
                    <TableHead>Perusahaan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-6">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id} className="hover:bg-muted/50">
                      <TableCell className="pl-6 text-foreground">
                        {student.tanggal}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground">
                          {student.name}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {student.memberCount > 1
                            ? `+ ${student.memberCount - 1} Anggota`
                            : "Individu"}
                        </span>
                      </TableCell>
                      <TableCell className="text-foreground">
                        {student.company}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant="outline"
                            className={
                              student.status === "Disetujui"
                                ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30"
                                : "bg-destructive/10 text-destructive border-destructive/30"
                            }
                          >
                            {student.status}
                          </Badge>
                          {student.adminApproved && (
                            <Badge
                              variant="outline"
                              className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 text-xs"
                            >
                              Terverifikasi
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="pr-6">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="link"
                            className="p-0 h-auto text-primary hover:text-primary/80"
                            onClick={() => handleViewDetail(student)}
                          >
                            Lihat
                          </Button>
                          {!student.adminApproved && (
                            <>
                              <span className="text-muted-foreground">|</span>
                              <Button
                                variant="link"
                                className="p-0 h-auto text-primary hover:text-primary/80"
                                onClick={() => handleApprove(student)}
                              >
                                Verifikasi
                              </Button>
                            </>
                          )}
                        </div>
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
