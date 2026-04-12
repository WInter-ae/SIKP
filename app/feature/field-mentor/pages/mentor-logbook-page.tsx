import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
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
  Clock,
  FileText,
  User,
  Building2,
  Calendar,
  Eye,
  AlertCircle,
} from "lucide-react";

import type { LogbookEntry, Student } from "../types/logbook";
import {
  getMentorProfile,
  getMentees,
  getStudentLogbook,
  type LogbookEntry as MentorLogbookEntry,
  type MenteeData,
  type MentorProfile,
} from "../services";

function mapBackendStudent(mentee: MenteeData): Student | null {
  if (!mentee.userId) return null;

  return {
    id: mentee.userId,
    name: mentee.nama || mentee.name || "-",
    nim: mentee.nim,
    email: mentee.email,
    university: mentee.fakultas || "-",
    major: mentee.prodi || "-",
    fakultas: mentee.fakultas,
    company: mentee.companyName || mentee.company || "-",
    position: mentee.division || "-",
    startDate: mentee.internshipStartDate || "",
    endDate: mentee.internshipEndDate || "",
    photo: undefined,
  };
}

export default function MentorLogbookPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [logbookEntries, setLogbookEntries] = useState<LogbookEntry[]>([]);
  const [mentorProfile, setMentorProfile] = useState<MentorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [profileResponse, menteeResponse] = await Promise.all([
          getMentorProfile(),
          getMentees(),
        ]);

        if (!isMounted) return;

        if (profileResponse.success && profileResponse.data) {
          setMentorProfile(profileResponse.data);
        }

        if (!menteeResponse.success || !menteeResponse.data) {
          setStudents([]);
          setLogbookEntries([]);
          setErrorMessage(menteeResponse.message || "Gagal memuat mahasiswa mentor.");
          return;
        }

        const backendStudents = menteeResponse.data
          .map(mapBackendStudent)
          .filter((student): student is Student => Boolean(student));

        setStudents(backendStudents);

        const backendEntries = await Promise.all(
          backendStudents.map(async (student) => {
            try {
              const menteeData = menteeResponse.data?.find((m) => m.userId === student.id);
              
                // Backend expects userId for GET /api/mentor/logbook/:studentId
                const studentUserId = menteeData?.userId || student.id;
                if (!studentUserId) {
                  return [] as LogbookEntry[];
                }
              
                let response = await getStudentLogbook(studentUserId);
              
              if (!response.success || !response.data?.entries || response.data.entries.length === 0) {
                // no-op: empty logbook is valid for some students
              }

              if (!response.success) {
                console.warn(
                  `❌ Logbook fetch failed for student ${student.id}:`,
                  response.message,
                  {menteeData}
                );
                return [] as LogbookEntry[];
              }

              const entries = response.data?.entries || [];
              
              if (!entries || entries.length === 0) {
                return [] as LogbookEntry[];
              }

              return entries.map((entry) => ({
                id: entry.id,
                studentId: student.id,
                studentName: student.name,
                date: entry.date,
                description: entry.description || entry.activity,
                activities: entry.activity || entry.description || "",
                createdAt: entry.createdAt,
                mentorSignature:
                  entry.status === "APPROVED"
                    ? {
                        signedAt: entry.mentorSignedAt || entry.updatedAt,
                        signedBy: "backend",
                        mentorName: mentorProfile?.name || "Mentor",
                        mentorPosition: mentorProfile?.position || "",
                        status: "approved",
                        notes: entry.rejectionNote,
                      }
                    : entry.status === "REJECTED"
                      ? {
                          signedAt: entry.mentorSignedAt || entry.updatedAt,
                          signedBy: "backend",
                          mentorName: mentorProfile?.name || "Mentor",
                          mentorPosition: mentorProfile?.position || "",
                          status: "rejected",
                          notes: entry.rejectionNote,
                        }
                      : undefined,
              })) as LogbookEntry[];
            } catch (error) {
              console.error(`❌ Error loading logbook for student ${student.id}:`, error);
              return [] as LogbookEntry[];
            }
          })
        );

        setLogbookEntries(backendEntries.flat());
      } catch (error) {
        if (!isMounted) return;

        const message = error instanceof Error ? error.message : "Gagal memuat logbook mentor.";
        setErrorMessage(message);
        setStudents([]);
        setLogbookEntries([]);
        toast.error(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate statistics per student
  const getStudentStats = (studentId: string) => {
    const studentEntries = logbookEntries.filter((e) => e.studentId === studentId);
    const total = studentEntries.length;
    const approved = studentEntries.filter((e) => e.mentorSignature?.status === "approved").length;
    const pending = studentEntries.filter((e) => !e.mentorSignature).length;
    const revision = studentEntries.filter(
      (e) => e.mentorSignature?.status === "revision" || e.mentorSignature?.status === "rejected"
    ).length;

    return { total, approved, pending, revision };
  };

  // Calculate global statistics
  const pendingCount = logbookEntries.filter((entry) => !entry.mentorSignature).length;
  const approvedCount = logbookEntries.filter(
    (entry) => entry.mentorSignature?.status === "approved"
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

          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informasi Pembimbing Lapangan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Nama Mentor
                  </p>
                  <p className="font-medium">{mentorProfile?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Perusahaan
                  </p>
                  <p className="font-medium">{mentorProfile?.company || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Jabatan</p>
                  <p className="font-medium">{mentorProfile?.position || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Clock className="h-8 w-8 text-yellow-500" />
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
                      <TableHead className="text-center">Revisi / Ditolak</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          Memuat data mahasiswa dan logbook dari backend...
                        </TableCell>
                      </TableRow>
                    ) : students.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <User className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">
                            Belum ada mahasiswa yang terdaftar
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      students.map((student) => {
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
                              <Badge variant="destructive">
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
