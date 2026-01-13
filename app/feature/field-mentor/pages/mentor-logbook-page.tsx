import { useState } from "react";
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
  Pencil,
} from "lucide-react";
import { toast } from "sonner";

import SignLogbookDialog from "../components/sign-logbook-dialog";
import type { LogbookEntry, Student } from "../types/logbook";

export default function MentorLogbookPage() {
  const [selectedLogbook, setSelectedLogbook] = useState<LogbookEntry | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Mock data - mahasiswa yang sedang magang di PT ini
  const students: Student[] = [
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
  const [logbookEntries, setLogbookEntries] = useState<LogbookEntry[]>([
    {
      id: "1",
      studentId: "1",
      studentName: "Adam Ramadhan",
      date: "2024-01-15",
      description: "Minggu Pertama",
      activities:
        "Mempelajari struktur database sistem inventory\nMelakukan analisis kebutuhan sistem\nDiskusi dengan tim developer",
      createdAt: "2024-01-15T10:00:00",
    },
    {
      id: "2",
      studentId: "1",
      studentName: "Adam Ramadhan",
      date: "2024-01-22",
      description: "Minggu Kedua",
      activities:
        "Implementasi fitur login dan autentikasi\nPembuatan UI dashboard admin\nTesting fitur yang sudah dibuat",
      createdAt: "2024-01-22T10:00:00",
      mentorSignature: {
        signedAt: "2024-01-23T14:30:00",
        signedBy: "mentor1",
        mentorName: "Budi Santoso",
        mentorPosition: "Senior Developer",
        status: "approved",
        notes: "Pekerjaan bagus, lanjutkan!",
      },
    },
    {
      id: "3",
      studentId: "2",
      studentName: "Robin Setiawan",
      date: "2024-01-15",
      description: "Minggu Pertama",
      activities:
        "Orientasi kantor dan pengenalan tim\nSetup development environment\nMempelajari tech stack yang digunakan",
      createdAt: "2024-01-15T09:00:00",
    },
    {
      id: "4",
      studentId: "1",
      studentName: "Adam Ramadhan",
      date: "2024-01-29",
      description: "Minggu Ketiga",
      activities:
        "Integrasi API payment gateway\nBug fixing fitur checkout\nCode review dengan senior developer",
      createdAt: "2024-01-29T10:00:00",
      mentorSignature: {
        signedAt: "2024-01-30T09:15:00",
        signedBy: "mentor1",
        mentorName: "Budi Santoso",
        mentorPosition: "Senior Developer",
        status: "revision",
        notes: "Perlu perbaikan pada error handling di API integration",
      },
    },
  ]);

  const handleSignLogbook = (
    logbookId: string,
    status: "approved" | "revision" | "rejected",
    notes: string
  ) => {
    const signature = {
      signedAt: new Date().toISOString(),
      signedBy: "mentor1",
      mentorName: "Budi Santoso",
      mentorPosition: "Senior Developer",
      status,
      notes: notes || undefined,
    };

    setLogbookEntries((prev) =>
      prev.map((entry) =>
        entry.id === logbookId
          ? { ...entry, mentorSignature: signature }
          : entry
      )
    );

    const statusText =
      status === "approved"
        ? "disetujui"
        : status === "revision"
          ? "diminta revisi"
          : "ditolak";
    toast.success(`Logbook berhasil ${statusText}!`);
  };

  const handleOpenDialog = (logbook: LogbookEntry) => {
    setSelectedLogbook(logbook);
    setIsDialogOpen(true);
  };

  const getStatusBadge = (entry: LogbookEntry) => {
    if (!entry.mentorSignature) {
      return (
        <Badge variant="outline" className="bg-gray-50">
          <Clock className="w-3 h-3 mr-1" />
          Menunggu Paraf
        </Badge>
      );
    }

    switch (entry.mentorSignature.status) {
      case "approved":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Disetujui
          </Badge>
        );
      case "revision":
        return (
          <Badge className="bg-yellow-500">
            <AlertCircle className="w-3 h-3 mr-1" />
            Perlu Revisi
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Ditolak
          </Badge>
        );
    }
  };

  const pendingCount = logbookEntries.filter(
    (entry) => !entry.mentorSignature
  ).length;
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
                    <p className="text-3xl font-bold">{students.length}</p>
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

          {/* Students List */}
          <Card>
            <CardHeader>
              <CardTitle>Mahasiswa Aktif</CardTitle>
              <CardDescription>
                Daftar mahasiswa yang sedang magang di perusahaan ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <Avatar>
                      <AvatarImage src={student.photo} />
                      <AvatarFallback>
                        {student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {student.nim} • {student.major}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Periode Magang
                      </p>
                      <p className="text-sm font-medium">
                        {new Date(student.startDate).toLocaleDateString("id-ID")}{" "}
                        - {new Date(student.endDate).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))}
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

          {/* Logbook Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Daftar Logbook
              </CardTitle>
              <CardDescription>
                Berikan paraf dan catatan untuk setiap logbook mahasiswa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Mahasiswa</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logbookEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">
                          Belum ada logbook yang disubmit
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    logbookEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(entry.date).toLocaleDateString("id-ID")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{entry.studentName}</p>
                            <p className="text-sm text-muted-foreground">
                              {entry.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm line-clamp-2 max-w-xs">
                            {entry.activities}
                          </p>
                        </TableCell>
                        <TableCell>{getStatusBadge(entry)}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant={
                              entry.mentorSignature ? "outline" : "default"
                            }
                            onClick={() => handleOpenDialog(entry)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            {entry.mentorSignature ? "Edit Paraf" : "Beri Paraf"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Aktivitas Terkini</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {logbookEntries
                  .filter((entry) => entry.mentorSignature)
                  .slice(0, 5)
                  .map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 text-sm"
                    >
                      <div
                        className={`mt-0.5 ${
                          entry.mentorSignature?.status === "approved"
                            ? "text-green-500"
                            : entry.mentorSignature?.status === "revision"
                              ? "text-yellow-500"
                              : "text-red-500"
                        }`}
                      >
                        {entry.mentorSignature?.status === "approved" ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : entry.mentorSignature?.status === "revision" ? (
                          <AlertCircle className="h-5 w-5" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          Logbook {entry.studentName} -{" "}
                          {new Date(entry.date).toLocaleDateString("id-ID")}
                        </p>
                        <p className="text-muted-foreground">
                          {entry.mentorSignature?.status === "approved"
                            ? "Disetujui"
                            : entry.mentorSignature?.status === "revision"
                              ? "Diminta revisi"
                              : "Ditolak"}
                          {entry.mentorSignature?.notes &&
                            ` - ${entry.mentorSignature.notes}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.mentorSignature &&
                            new Date(
                              entry.mentorSignature.signedAt
                            ).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  ))}
                {logbookEntries.filter((entry) => entry.mentorSignature)
                  .length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Belum ada aktivitas
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sign Dialog */}
      <SignLogbookDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        logbook={selectedLogbook}
        onSign={handleSignLogbook}
      />
    </>
  );
}
