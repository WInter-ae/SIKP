import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle, Clock, Filter, ListOrdered, Search } from "lucide-react";

import { Avatar, AvatarFallback } from "~/components/ui/avatar";
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

import type { Student } from "../types";

function AdminResponseLetterPage() {
  const fallbackStudents: Student[] = useMemo(
    () => [
      {
        id: 1,
        name: "Ahmad Rizki",
        role: "Tim",
        tanggal: "20/07/2025",
        nim: "2021000001",
        company: "PT. Teknologi Indonesia",
        memberCount: 3,
        status: "Disetujui",
        adminApproved: true,
      },
      {
        id: 2,
        name: "Budi Santoso",
        role: "Individu",
        tanggal: "20/07/2025",
        nim: "2021000002",
        company: "CV. Digital Creative",
        memberCount: 1,
        status: "Ditolak",
        adminApproved: false,
      },
      {
        id: 3,
        name: "Citra Dewi",
        role: "Tim",
        tanggal: "20/07/2025",
        nim: "2021000003",
        company: "PT. Finansial Teknologi",
        memberCount: 2,
        status: "Ditolak",
        adminApproved: true,
      },
      {
        id: 4,
        name: "Dewi Lestari",
        role: "Individu",
        tanggal: "20/07/2025",
        nim: "2021000004",
        company: "PT. Media Kreatif",
        memberCount: 1,
        status: "Disetujui",
        adminApproved: false,
      },
    ],
    [],
  );

  const [students, setStudents] = useState<Student[]>(fallbackStudents);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("kp_submissions");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;

      const mapped: Student[] = parsed
        .map((app) => {
          const leader =
            app?.members?.find((m: { role: string }) => m.role === "Ketua") ??
            app?.members?.[0];
          if (!leader) return null;
          return {
            id: app.id ?? leader.nim ?? Math.random(),
            name: leader.name ?? "-",
            role: app.members?.length > 1 ? "Tim" : "Individu",
            tanggal: app.date ?? "-",
            nim: leader.nim ?? "-",
            company: app.internship?.namaTempat ?? "-",
            memberCount: app.members?.length ?? 1,
            status:
              app.responseStatus === "approved"
                ? "Disetujui"
                : app.responseStatus === "rejected"
                  ? "Ditolak"
                  : app.status === "approved"
                    ? "Disetujui"
                    : "Ditolak",
            adminApproved: false,
            supervisor: app.supervisor,
            members: app.members,
            responseFileUrl: app.responseFileUrl,
          } satisfies Student;
        })
        .filter(Boolean) as Student[];

      if (mapped.length) {
        setStudents(mapped);
      }
    } catch {
      // jika parsing gagal, biarkan fallback
    }
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

  const handleSubmitAction = () => {
    if (selectedStudent) {
      // Update admin approval status
      setStudents((prevStudents) =>
        prevStudents.map((s) =>
          s.id === selectedStudent.id ? { ...s, adminApproved: true } : s,
        ),
      );
      toast.success(
        `Surat balasan ${selectedStudent.name} berhasil diverifikasi!`,
      );
      setShowApproveDialog(false);
      setSelectedStudent(null);
    }
  };

  return (
    <div className="p-6 md:p-8 bg-background min-h-screen">
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
                  <p className="text-muted-foreground text-md">{stat.title}</p>
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
                <SelectItem value="not-verified">Belum Diverifikasi</SelectItem>
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
                  <TableHead>NIM</TableHead>
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
                    <TableCell className="text-foreground">
                      {student.nim}
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
    </div>
  );
}

export default AdminResponseLetterPage;
