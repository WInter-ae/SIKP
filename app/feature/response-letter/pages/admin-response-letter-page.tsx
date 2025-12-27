import { useState } from "react";

import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
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

import ApproveDialog from "../components/approve-dialog";
import DetailDialog from "../components/detail-dialog";

import type { Student } from "../types";

function AdminResponseLetterPage() {
  const [students] = useState<Student[]>([
    {
      id: 1,
      name: "A",
      role: "Tim",
      tanggal: "20/07/2025",
      status: "Disetujui",
    },
    {
      id: 2,
      name: "B",
      role: "Individu",
      tanggal: "20/07/2025",
      status: "Ditolak",
    },
    {
      id: 3,
      name: "C",
      role: "Tim",
      tanggal: "20/07/2025",
      status: "Ditolak",
    },
    {
      id: 4,
      name: "D",
      role: "Individu",
      tanggal: "20/07/2025",
      status: "Disetujui",
    },
  ]);

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
    alert(`Surat balasan ${selectedStudent?.name} berhasil disetujui!`);
    setShowApproveDialog(false);
    setSelectedStudent(null);
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
                <TableHead className="w-[30%] pl-6">Profil</TableHead>
                <TableHead className="w-[25%]">Tanggal</TableHead>
                <TableHead className="w-[20%]">Status</TableHead>
                <TableHead className="w-[25%] pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id} className="hover:bg-muted/50">
                  <TableCell className="w-[30%] pl-6">
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
                          {student.role}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="w-[25%] text-foreground">
                    {student.tanggal}
                  </TableCell>
                  <TableCell className="w-[20%]">
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
                  </TableCell>
                  <TableCell className="w-[25%] pr-6">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="link"
                        className="p-0 h-auto text-primary hover:text-primary/80"
                        onClick={() => handleViewDetail(student)}
                      >
                        Lihat
                      </Button>
                      <span className="text-muted-foreground">|</span>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-primary hover:text-primary/80"
                        onClick={() => handleApprove(student)}
                      >
                        Setujui
                      </Button>
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
