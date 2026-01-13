import { useState } from "react";
import { Link } from "react-router";
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
  XCircle,
  Clock,
  FileText,
  User,
  Building2,
  Calendar,
  AlertCircle,
  Eye,
} from "lucide-react";

import type { LogbookEntry, Student } from "../types/logbook";

// Mock data - mahasiswa yang sedang magang di PT ini
const MOCK_STUDENTS: Student[] = [
    {
      id: "1",
      name: "Adam Ramadhan",
      nim: "1234567890",
      email: "adam@student.ac.id",
      university: "Universitas Indonesia",
      major: "Teknik Informatika",
      startDate: "2024-01-01",
      endDate: "2024-03-31",
    },
    {
      id: "2",
      name: "Robin Setiawan",
      nim: "1234567891",
      email: "robin@student.ac.id",
      university: "Universitas Indonesia",
      major: "Teknik Informatika",
      startDate: "2024-01-01",
      endDate: "2024-03-31",
    },
  ];

// Mock data - logbook entries yang perlu diparaf
const MOCK_LOGBOOK_ENTRIES: LogbookEntry[] = [
    {
      id: "1",
      studentId: "1",
      studentName: "Adam Ramadhan",
      date: "2024-01-02",
      description: "Hari Pertama - Orientasi",
      activities:
        "Orientasi kantor dan pengenalan tim\nSetup workstation dan akun email\nMempelajari struktur organisasi perusahaan",
      createdAt: "2024-01-02T10:00:00",
      mentorSignature: {
        signedAt: "2024-01-03T14:30:00",
        signedBy: "mentor1",
        mentorName: "Budi Santoso",
        mentorPosition: "Senior Developer",
        status: "approved",
        notes: "Orientasi berjalan baik",
      },
    },
    {
      id: "2",
      studentId: "1",
      studentName: "Adam Ramadhan",
      date: "2024-01-03",
      description: "Setup Development Environment",
      activities:
        "Install tools development (VS Code, Git, Node.js)\nSetup database lokal\nClone repository project",
      createdAt: "2024-01-03T10:00:00",
      mentorSignature: {
        signedAt: "2024-01-04T09:00:00",
        signedBy: "mentor1",
        mentorName: "Budi Santoso",
        mentorPosition: "Senior Developer",
        status: "approved",
        notes: "Setup berhasil dilakukan",
      },
    },
    {
      id: "3",
      studentId: "1",
      studentName: "Adam Ramadhan",
      date: "2024-01-04",
      description: "Mempelajari Codebase",
      activities:
        "Membaca dokumentasi project\nMempelajari struktur folder dan arsitektur\nMemahami flow aplikasi",
      createdAt: "2024-01-04T10:00:00",
    },
    {
      id: "4",
      studentId: "1",
      studentName: "Adam Ramadhan",
      date: "2024-01-08",
      description: "Implementasi Fitur Login",
      activities:
        "Membuat form login UI\nImplementasi validasi form\nIntegrasi dengan API backend",
      createdAt: "2024-01-08T10:00:00",
      mentorSignature: {
        signedAt: "2024-01-09T11:00:00",
        signedBy: "mentor1",
        mentorName: "Budi Santoso",
        mentorPosition: "Senior Developer",
        status: "revision",
        notes: "Perlu perbaikan pada error handling",
      },
    },
    {
      id: "5",
      studentId: "1",
      studentName: "Adam Ramadhan",
      date: "2024-01-09",
      description: "Revisi Fitur Login",
      activities:
        "Memperbaiki error handling sesuai feedback\nMenambahkan loading state\nTesting berbagai skenario error",
      createdAt: "2024-01-09T10:00:00",
      mentorSignature: {
        signedAt: "2024-01-10T14:00:00",
        signedBy: "mentor1",
        mentorName: "Budi Santoso",
        mentorPosition: "Senior Developer",
        status: "approved",
        notes: "Sudah bagus, approved!",
      },
    },
    {
      id: "6",
      studentId: "2",
      studentName: "Robin Setiawan",
      date: "2024-01-02",
      description: "Orientasi Perusahaan",
      activities:
        "Tour kantor\nPengenalan dengan tim\nPenjelasan budaya kerja perusahaan",
      createdAt: "2024-01-02T09:00:00",
      mentorSignature: {
        signedAt: "2024-01-03T10:00:00",
        signedBy: "mentor1",
        mentorName: "Budi Santoso",
        mentorPosition: "Senior Developer",
        status: "approved",
      },
    },
    {
      id: "7",
      studentId: "2",
      studentName: "Robin Setiawan",
      date: "2024-01-03",
      description: "Setup & Training",
      activities:
        "Setup development tools\nTraining penggunaan version control\nMempelajari workflow tim",
      createdAt: "2024-01-03T09:00:00",
    },
    {
      id: "8",
      studentId: "1",
      studentName: "Adam Ramadhan",
      date: "2024-01-15",
      description: "Dashboard UI Development",
      activities:
        "Membuat layout dashboard\nImplementasi navigation sidebar\nMenambahkan chart components",
      createdAt: "2024-01-15T10:00:00",
    },
  ];

export default function MentorLogbookPage() {
  const [logbookEntries, setLogbookEntries] = useState<LogbookEntry[]>(MOCK_LOGBOOK_ENTRIES);

  // Calculate statistics per student
  const getStudentStats = (studentId: string) => {
    const studentEntries = logbookEntries.filter((e) => e.studentId === studentId);
    const total = studentEntries.length;
    const approved = studentEntries.filter((e) => e.mentorSignature?.status === "approved").length;
    const pending = studentEntries.filter((e) => !e.mentorSignature).length;
    const revision = studentEntries.filter((e) => e.mentorSignature?.status === "revision").length;

    return { total, approved, pending, revision };
  };

  // Calculate global statistics
  const pendingCount = logbookEntries.filter((entry) => !entry.mentorSignature).length;
  const approvedCount = logbookEntries.filter(
    (entry) => entry.mentorSignature?.status === "approved"
  ).length;
  const revisionCount = logbookEntries.filter(
    (entry) => entry.mentorSignature?.status === "revision"
  ).length;

  return (
    <>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Logbook Mahasiswa
            </h1>
            <p className="text-muted-foreground">
              Kelola dan berikan paraf pada logbook mahasiswa yang sedang magang
            </p>
          </div>

          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informasi Perusahaan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Nama Perusahaan
                  </p>
                  <p className="font-medium">PT. Teknologi Digital Indonesia</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Pembimbing Lapangan
                  </p>
                  <p className="font-medium">Budi Santoso</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Jabatan</p>
                  <p className="font-medium">Senior Developer</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Mahasiswa
                    </p>
                    <p className="text-3xl font-bold">{MOCK_STUDENTS.length}</p>
                  </div>
                  <User className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Menunggu Paraf
                    </p>
                    <p className="text-3xl font-bold">{pendingCount}</p>
                  </div>
                  <Clock className="h-8 w-8 text-gray-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Disetujui</p>
                    <p className="text-3xl font-bold">{approvedCount}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Perlu Revisi</p>
                    <p className="text-3xl font-bold">{revisionCount}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Students List with Logbook Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Tabel Mahasiswa & Logbook
              </CardTitle>
              <CardDescription>
                Daftar mahasiswa dengan statistik logbook mereka
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mahasiswa</TableHead>
                      <TableHead>NIM</TableHead>
                      <TableHead>Program Studi</TableHead>
                      <TableHead>Periode Magang</TableHead>
                      <TableHead className="text-center">Total Logbook</TableHead>
                      <TableHead className="text-center">Disetujui</TableHead>
                      <TableHead className="text-center">Menunggu</TableHead>
                      <TableHead className="text-center">Revisi</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_STUDENTS.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <User className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">
                            Belum ada mahasiswa yang terdaftar
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      MOCK_STUDENTS.map((student) => {
                        const stats = getStudentStats(student.id);
                        return (
                          <TableRow key={student.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={student.photo} />
                                  <AvatarFallback>
                                    {student.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{student.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {student.university}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {student.nim}
                            </TableCell>
                            <TableCell className="text-sm">{student.major}</TableCell>
                            <TableCell className="text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p>{new Date(student.startDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}</p>
                                  <p className="text-xs text-muted-foreground">
                                    s/d {new Date(student.endDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline">{stats.total}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-green-500">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {stats.approved}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="bg-yellow-50">
                                <Clock className="w-3 h-3 mr-1" />
                                {stats.pending}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-yellow-500">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {stats.revision}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button variant="outline" size="sm" asChild>
                                <Link to={`/mentor/logbook-detail/${student.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Detail
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Alert for pending */}
          {pendingCount > 0 && (
            <Alert className="border-l-4 border-yellow-500 bg-yellow-50">
              <Clock className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Ada {pendingCount} logbook yang menunggu paraf Anda
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </>
  );
}
