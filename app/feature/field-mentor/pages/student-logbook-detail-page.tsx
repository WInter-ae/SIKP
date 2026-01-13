import { useState } from "react";
import { Link, useParams } from "react-router";
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
import {
  CheckCircle,
  Clock,
  ArrowLeft,
  User,
  Calendar,
  Download,
} from "lucide-react";
import { toast } from "sonner";

import type { LogbookEntry, Student } from "../types/logbook";

// Mock data - in real app, this would come from API based on studentId
const mockStudents: Student[] = [
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

const mockLogbookEntries: LogbookEntry[] = [
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

const mockWorkPeriod = {
  startDate: "2024-01-01",
  endDate: "2024-03-31",
  startDay: "senin",
  endDay: "jumat",
};

function StudentLogbookDetailPage() {
  const { studentId } = useParams();
  const [logbookEntries, setLogbookEntries] = useState<LogbookEntry[]>(mockLogbookEntries);

  // Get student data
  const student = mockStudents.find((s) => s.id === studentId);

  // Generate all dates for the period
  const generateAllDates = (): string[] => {
    const dates: string[] = [];
    const start = new Date(mockWorkPeriod.startDate);
    const end = new Date(mockWorkPeriod.endDate);

    const dayMap: { [key: string]: number } = {
      minggu: 0,
      senin: 1,
      selasa: 2,
      rabu: 3,
      kamis: 4,
      jumat: 5,
      sabtu: 6,
    };

    const startDayNum = dayMap[mockWorkPeriod.startDay?.toLowerCase()] || 1;
    const endDayNum = dayMap[mockWorkPeriod.endDay?.toLowerCase()] || 5;

    const MS_PER_DAY = 24 * 60 * 60 * 1000;

    for (let d = new Date(start); d <= end; d = new Date(d.getTime() + MS_PER_DAY)) {
      const currentDay = d.getDay();

      if (startDayNum <= endDayNum) {
        if (currentDay >= startDayNum && currentDay <= endDayNum) {
          dates.push(d.toISOString().split("T")[0]);
        }
      } else {
        if (currentDay >= startDayNum || currentDay <= endDayNum) {
          dates.push(d.toISOString().split("T")[0]);
        }
      }
    }

    return dates;
  };

  const allDates = generateAllDates();

  const getLogbookForDate = (date: string): LogbookEntry | undefined => {
    return logbookEntries.find(
      (entry) => entry.studentId === studentId && entry.date === date
    );
  };

  const getDayName = (dateString: string) => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return days[new Date(dateString).getDay()];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getWeekNumber = (dateString: string) => {
    const dateIndex = allDates.indexOf(dateString);
    if (dateIndex === -1) return 0;

    let weekNumber = 1;

    for (let i = 0; i < dateIndex; i++) {
      const currentDate = new Date(allDates[i]);
      const currentDay = currentDate.getDay();
      const nextDate = i < allDates.length - 1 ? new Date(allDates[i + 1]) : null;

      if (nextDate) {
        const nextDay = nextDate.getDay();
        if (currentDay === 5 || currentDay === 6 || currentDay === 0 || nextDay === 1) {
          weekNumber++;
        }
      }
    }

    return weekNumber;
  };

  const getWeekRowSpan = (currentIndex: number) => {
    const currentWeek = getWeekNumber(allDates[currentIndex]);
    let count = 1;

    for (let i = currentIndex + 1; i < allDates.length; i++) {
      if (getWeekNumber(allDates[i]) === currentWeek) {
        count++;
      } else {
        break;
      }
    }

    return count;
  };

  const getMentorSignatureBadge = (entry: LogbookEntry | undefined) => {
    if (!entry) {
      return (
        <Badge variant="outline" className="bg-gray-50">
          <span className="text-muted-foreground">Belum diisi</span>
        </Badge>
      );
    }

    if (!entry.mentorSignature) {
      return (
        <Badge variant="outline" className="bg-yellow-50">
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
      default:
        return (
          <Badge variant="outline" className="bg-gray-50">
            <span className="text-muted-foreground">Belum diisi</span>
          </Badge>
        );
    }
  };

  const handleSignLogbook = (logbookId: string) => {
    const signature = {
      signedAt: new Date().toISOString(),
      signedBy: "mentor1",
      mentorName: "Budi Santoso",
      mentorPosition: "Senior Developer",
      status: "approved" as const,
    };

    setLogbookEntries((prev) =>
      prev.map((entry) =>
        entry.id === logbookId ? { ...entry, mentorSignature: signature } : entry
      )
    );

    toast.success("Logbook berhasil disetujui!");
  };

  const handleSignAllLogbooks = () => {
    const signature = {
      signedAt: new Date().toISOString(),
      signedBy: "mentor1",
      mentorName: "Budi Santoso",
      mentorPosition: "Senior Developer",
      status: "approved" as const,
    };

    const pendingLogbooks = logbookEntries.filter(
      (e) => e.studentId === studentId && !e.mentorSignature
    );

    if (pendingLogbooks.length === 0) {
      toast.info("Tidak ada logbook yang perlu diparaf");
      return;
    }

    setLogbookEntries((prev) =>
      prev.map((entry) =>
        entry.studentId === studentId && !entry.mentorSignature
          ? { ...entry, mentorSignature: signature }
          : entry
      )
    );

    toast.success(`${pendingLogbooks.length} logbook berhasil diparaf!`);
  };

  const handleExportLogbook = () => {
    toast.info("Fitur export logbook sedang dalam pengembangan");
  };

  // Calculate statistics
  const totalEntries = logbookEntries.filter((e) => e.studentId === studentId).length;
  const approvedEntries = logbookEntries.filter(
    (e) => e.studentId === studentId && e.mentorSignature?.status === "approved"
  ).length;
  const pendingEntries = logbookEntries.filter(
    (e) => e.studentId === studentId && !e.mentorSignature
  ).length;

  if (!student) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>Mahasiswa tidak ditemukan</AlertDescription>
        </Alert>
        <Button asChild className="mt-4">
          <Link to="/mentor/logbook">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link to="/mentor/logbook">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Mahasiswa
          </Link>
        </Button>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Detail Logbook Mahasiswa</h1>
            <p className="text-muted-foreground mt-1">
              Periode logbook lengkap dari{" "}
              {new Date(mockWorkPeriod.startDate).toLocaleDateString("id-ID")} hingga{" "}
              {new Date(mockWorkPeriod.endDate).toLocaleDateString("id-ID")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSignAllLogbooks} disabled={pendingEntries === 0}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Paraf Semua
            </Button>
            <Button onClick={handleExportLogbook} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Logbook
            </Button>
          </div>
        </div>
      </div>

      {/* Student Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informasi Mahasiswa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Nama Mahasiswa</p>
              <p className="font-medium">{student.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">NIM</p>
              <p className="font-medium">{student.nim}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Program Studi</p>
              <p className="font-medium">{student.major}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Universitas</p>
              <p className="font-medium">{student.university}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{student.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Periode Magang</p>
              <p className="font-medium">
                {new Date(student.startDate).toLocaleDateString("id-ID")} -{" "}
                {new Date(student.endDate).toLocaleDateString("id-ID")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Logbook Diisi</CardDescription>
            <CardTitle className="text-3xl">{totalEntries}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Disetujui</CardDescription>
            <CardTitle className="text-3xl text-green-600">{approvedEntries}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Menunggu Paraf</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{pendingEntries}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Alert */}
      {pendingEntries > 0 && (
        <Alert className="border-l-4 border-yellow-500 bg-yellow-50">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Ada {pendingEntries} logbook yang menunggu paraf Anda
          </AlertDescription>
        </Alert>
      )}

      {/* Logbook Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Tabel Logbook Periode Lengkap
          </CardTitle>
          <CardDescription>
            Semua tanggal kerja dalam periode magang (termasuk yang belum diisi)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Minggu</TableHead>
                  <TableHead className="w-[100px]">Hari</TableHead>
                  <TableHead className="w-[150px]">Tanggal</TableHead>
                  <TableHead>Deskripsi Kegiatan</TableHead>
                  <TableHead className="w-[150px]">Status Paraf</TableHead>
                  <TableHead className="w-[120px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allDates.map((date, index) => {
                  const entry = getLogbookForDate(date);
                  const weekNumber = getWeekNumber(date);
                  const showWeekCell =
                    index === 0 || getWeekNumber(allDates[index - 1]) !== weekNumber;
                  const rowSpan = showWeekCell ? getWeekRowSpan(index) : 0;

                  return (
                    <TableRow key={date}>
                      {showWeekCell && (
                        <TableCell
                          rowSpan={rowSpan}
                          className="font-medium text-center bg-muted/50"
                        >
                          {weekNumber}
                        </TableCell>
                      )}
                      <TableCell className="font-medium">{getDayName(date)}</TableCell>
                      <TableCell className="text-sm">{formatDate(date)}</TableCell>
                      <TableCell>
                        {entry ? (
                          <div className="space-y-1">
                            <p className="font-medium text-sm">{entry.description}</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-3">
                              {entry.activities}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm italic">
                            Belum mengisi logbook
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{getMentorSignatureBadge(entry)}</TableCell>
                      <TableCell>
                        {entry && !entry.mentorSignature && (
                          <Button
                            size="sm"
                            onClick={() => handleSignLogbook(entry.id)}
                            className="w-full"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Paraf
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default StudentLogbookDetailPage;
