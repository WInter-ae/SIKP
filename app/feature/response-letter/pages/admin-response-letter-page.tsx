import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "~/components/ui/avatar";
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
            app?.members?.find((m: any) => m.role === "Ketua") ??
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
    <div className="bg-background min-h-screen px-[3%]">
      <div className="mb-8 mt-[10vh]">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Surat Balasan
        </h1>
        <p className="text-muted-foreground">
          Kelola dan review surat balasan dari perusahaan untuk kerja praktik
          mahasiswa
        </p>
      </div>

      <Card className="py-0">
        <CardHeader className="py-4 px-6">
          <CardTitle className="text-lg font-semibold text-foreground">
            Daftar Surat Balasan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[15%] pl-6">Tanggal</TableHead>
                <TableHead className="w-[15%]">NIM</TableHead>
                <TableHead className="w-[30%]">Mahasiswa</TableHead>
                <TableHead className="w-[20%]">Perusahaan</TableHead>
                <TableHead className="w-[10%]">Status</TableHead>
                <TableHead className="w-[10%] pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id} className="hover:bg-muted/50">
                  <TableCell className="w-[15%] pl-6 text-foreground">
                    {student.tanggal}
                  </TableCell>
                  <TableCell className="w-[15%] text-foreground">
                    {student.nim}
                  </TableCell>
                  <TableCell className="w-[30%]">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10">
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                          {student.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-foreground">
                          {student.name}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {student.memberCount > 1
                            ? `+ ${student.memberCount - 1} Anggota`
                            : "Individu"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="w-[20%] text-foreground">
                    {student.company}
                  </TableCell>
                  <TableCell className="w-[10%]">
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
                  <TableCell className="w-[10%] pr-6">
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

      <DetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        student={selectedStudent}
        onApprove={handleApprove}
      />

      <ApproveDialog
        open={showApproveDialog}
        onOpenChange={setShowApproveDialog}
        student={selectedStudent}
        onConfirm={handleSubmitAction}
      />
    </div>
  );
}

export default AdminResponseLetterPage;
