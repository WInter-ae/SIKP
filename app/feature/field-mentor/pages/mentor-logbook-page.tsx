import { useEffect, useMemo, useState } from "react";
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
  Search,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Input } from "~/components/ui/input";

import { useUser } from "~/contexts/user-context";
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
  const studentId = mentee.userId || (mentee as any).studentId;
  if (!studentId) return null;

  return {
    id: studentId,
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
    photo: (mentee as any).photoUrl,
  };
}


function getAcademicPeriod(startDateStr?: string | null): string {
  if (!startDateStr) return "Lainnya";
  try {
    const date = new Date(startDateStr);
    if (isNaN(date.getTime())) return "Lainnya";
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 1-indexed (1 to 12)
    
    if (month >= 7 && month <= 12) {
      return `${year}/${year + 1} - Ganjil`;
    } else {
      return `${year - 1}/${year} - Genap`;
    }
  } catch {
    return "Lainnya";
  }
}

function getInternshipPeriodStatus(student: Student): "ONGOING" | "COMPLETED" | "UPCOMING" {
  if (!student.startDate || !student.endDate) return "ONGOING";
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const start = new Date(student.startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(student.endDate);
  end.setHours(0, 0, 0, 0);
  
  if (now > end) {
    return "COMPLETED";
  } else if (now < start) {
    return "UPCOMING";
  } else {
    return "ONGOING";
  }
}

function getPeriodStatusBadge(student: Student) {
  const status = getInternshipPeriodStatus(student);
  if (status === "COMPLETED") {
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
        🏁 Selesai Magang
      </Badge>
    );
  }
  if (status === "UPCOMING") {
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 font-medium">
        🟡 Belum Mulai
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
      🟢 Sedang Magang
    </Badge>
  );
}


export default function MentorLogbookPage() {
  const { user } = useUser();
  const [students, setStudents] = useState<Student[]>([]);
  const [logbookEntries, setLogbookEntries] = useState<LogbookEntry[]>([]);
  const [mentorProfile, setMentorProfile] = useState<MentorProfile | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

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
          setErrorMessage(
            menteeResponse.message || "Gagal memuat mahasiswa mentor.",
          );
          return;
        }

        const backendStudents = menteeResponse.data
          .map(mapBackendStudent)
          .filter((student): student is Student => Boolean(student));

        setStudents(backendStudents);

        const backendEntries = await Promise.all(
          backendStudents.map(async (student) => {
            try {
              const menteeData = menteeResponse.data?.find(
                (m) => m.userId === student.id,
              );

              // Backend expects userId for GET /api/mentor/logbook/:studentId
              const studentUserId = menteeData?.userId || student.id;
              if (!studentUserId) {
                return [] as LogbookEntry[];
              }

              let response = await getStudentLogbook(studentUserId);

              if (
                !response.success ||
                !response.data?.entries ||
                response.data.entries.length === 0
              ) {
                // no-op: empty logbook is valid for some students
              }

              if (!response.success) {
                console.warn(
                  `❌ Logbook fetch failed for student ${student.id}:`,
                  response.message,
                  { menteeData },
                );
                return [] as LogbookEntry[];
              }

              // Backend might return { entries: [...] } or just [...]
              const rawData = response.data;
              const entries = Array.isArray(rawData) 
                ? rawData 
                : (rawData as any)?.entries || [];

              if (!entries || !Array.isArray(entries) || entries.length === 0) {
                return [] as LogbookEntry[];
              }

              return entries.map((entry: any) => ({
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
                        notes: entry.rejectionReason,
                      }
                    : entry.status === "REJECTED"
                      ? {
                          signedAt: entry.mentorSignedAt || entry.updatedAt,
                          signedBy: "backend",
                          mentorName: mentorProfile?.name || "Mentor",
                          mentorPosition: mentorProfile?.position || "",
                          status: "rejected",
                          notes: entry.rejectionReason,
                        }
                      : undefined,
              })) as LogbookEntry[];
            } catch (error) {
              console.error(
                `❌ Error loading logbook for student ${student.id}:`,
                error,
              );
              return [] as LogbookEntry[];
            }
          }),
        );

        setLogbookEntries(backendEntries.flat());
      } catch (error) {
        if (!isMounted) return;

        const message =
          error instanceof Error
            ? error.message
            : "Gagal memuat logbook mentor.";
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
    const studentEntries = logbookEntries.filter(
      (e) => e.studentId === studentId,
    );
    const total = studentEntries.length;
    const approved = studentEntries.filter(
      (e) => e.mentorSignature?.status === "approved",
    ).length;
    const pending = studentEntries.filter((e) => !e.mentorSignature).length;
    const revision = studentEntries.filter(
      (e) =>
        e.mentorSignature?.status === "revision" ||
        e.mentorSignature?.status === "rejected",
    ).length;

    return { total, approved, pending, revision };
  };

  const academicPeriods = useMemo(() => {
    const periods = new Set<string>();
    students.forEach((student) => {
      if (student.startDate) {
        periods.add(getAcademicPeriod(student.startDate));
      }
    });
    return Array.from(periods).sort((a, b) => b.localeCompare(a));
  }, [students]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPeriod, activeTab, query]);

  const filteredStudents = useMemo(() => {
    let result = students;

    // Apply Academic Period filter
    if (selectedPeriod !== "all") {
      result = result.filter((student) => getAcademicPeriod(student.startDate) === selectedPeriod);
    }

    // Apply Tab filter
    if (activeTab === "ongoing") {
      result = result.filter((student) => getInternshipPeriodStatus(student) === "ONGOING");
    } else if (activeTab === "completed") {
      result = result.filter((student) => getInternshipPeriodStatus(student) === "COMPLETED");
    }

    // Apply Keyword search
    const keyword = query.toLowerCase().trim();
    if (!keyword) return result;

    return result.filter((student) => {
      return (
        student.name.toLowerCase().includes(keyword) ||
        student.nim.toLowerCase().includes(keyword) ||
        student.major.toLowerCase().includes(keyword)
      );
    });
  }, [students, query, activeTab, selectedPeriod]);

  const totalItems = filteredStudents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStudents, currentPage, itemsPerPage]);

  const periodFilteredStudents = useMemo(() => {
    if (selectedPeriod === "all") return students;
    return students.filter((student) => getAcademicPeriod(student.startDate) === selectedPeriod);
  }, [students, selectedPeriod]);

  const totalStudentsCount = periodFilteredStudents.length;
  const ongoingStudentsCount = useMemo(() => periodFilteredStudents.filter((s) => getInternshipPeriodStatus(s) === "ONGOING").length, [periodFilteredStudents]);
  const completedStudentsCount = useMemo(() => periodFilteredStudents.filter((s) => getInternshipPeriodStatus(s) === "COMPLETED").length, [periodFilteredStudents]);

  const periodFilteredLogbookEntries = useMemo(() => {
    const studentIds = new Set(periodFilteredStudents.map(s => s.id));
    return logbookEntries.filter((entry) => studentIds.has(entry.studentId));
  }, [logbookEntries, periodFilteredStudents]);

  const pendingCount = periodFilteredLogbookEntries.filter(
    (entry) => !entry.mentorSignature,
  ).length;
  const approvedCount = periodFilteredLogbookEntries.filter(
    (entry) => entry.mentorSignature?.status === "approved",
  ).length;

  return (
    <>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Logbook Mahasiswa
              </h1>
              <p className="text-muted-foreground">
                Kelola dan berikan paraf pada logbook mahasiswa yang sedang magang
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Bar Input */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama atau NIM..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9 bg-white"
                />
              </div>

              {/* Academic Period Dropdown Filter */}
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-full sm:w-[220px] bg-white">
                  <SelectValue placeholder="Semua Periode Akademik" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Periode Akademik</SelectItem>
                  {academicPeriods.map((period) => (
                    <SelectItem key={period} value={period}>
                      {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Nama Mentor
                  </p>
                  <p className="font-medium">{mentorProfile?.name && mentorProfile.name !== "-" ? mentorProfile.name : (user?.nama || "-")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Email
                  </p>
                  <p className="font-medium truncate" title={mentorProfile?.email || user?.email}>
                    {mentorProfile?.email && mentorProfile.email !== "-" ? mentorProfile.email : (user?.email || "-")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    No. Telepon
                  </p>
                  <p className="font-medium">{mentorProfile?.phone && mentorProfile.phone !== "-" ? mentorProfile.phone : (user?.phone || "-")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Perusahaan
                  </p>
                  <p className="font-medium">{mentorProfile?.company && mentorProfile.company !== "-" ? mentorProfile.company : (user?.instansi || (user?.jabatan?.includes("at") ? user.jabatan.split("at")[1].trim() : "-"))}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Jabatan</p>
                  <p className="font-medium">
                    {mentorProfile?.position && mentorProfile.position !== "-" ? mentorProfile.position : (user?.jabatan || "-")}
                  </p>
                </div>
              </div>
              {mentorProfile?.address && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-1">Alamat Perusahaan</p>
                  <p className="font-medium text-sm leading-relaxed">
                    {mentorProfile.address}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Mahasiswa Magang
                    </p>
                    <p className="text-3xl font-bold">{totalStudentsCount}</p>
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

          {/* Filter Tabs & Students List with Logbook Table */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
            <TabsList className="flex flex-wrap gap-2 bg-transparent p-0 h-auto">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
              >
                Semua Aktivitas Magang ({totalStudentsCount})
              </TabsTrigger>
              <TabsTrigger 
                value="ongoing" 
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white border bg-white px-4 py-2 rounded-lg text-sm font-medium text-emerald-700 transition-all"
              >
                🟢 Sedang Magang ({ongoingStudentsCount})
              </TabsTrigger>
              <TabsTrigger 
                value="completed" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white border bg-white px-4 py-2 rounded-lg text-sm font-medium text-blue-700 transition-all"
              >
                🏁 Selesai Magang ({completedStudentsCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Tabel Mahasiswa & Logbook
                  </CardTitle>
                  <CardDescription>
                    Daftar mahasiswa dengan statistik logbook mereka untuk periode terpilih
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mahasiswa</TableHead>
                          <TableHead>NIM</TableHead>
                          <TableHead>Program Studi</TableHead>
                          <TableHead>Periode Magang</TableHead>
                          <TableHead className="text-center">
                            Total Logbook
                          </TableHead>
                          <TableHead className="text-center">Disetujui</TableHead>
                          <TableHead className="text-center">Menunggu</TableHead>
                          <TableHead className="text-center">
                            Revisi / Ditolak
                          </TableHead>
                          <TableHead className="text-center">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell
                              colSpan={9}
                              className="text-center py-8 text-muted-foreground"
                            >
                              Memuat data mahasiswa dan logbook dari backend...
                            </TableCell>
                          </TableRow>
                        ) : filteredStudents.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-8">
                              <User className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                              <p className="text-muted-foreground">
                                Data mahasiswa bimbingan tidak ditemukan
                              </p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedStudents.map((student) => {
                            const stats = getStudentStats(student.id);
                            return (
                              <TableRow key={student.id}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <Avatar>
                                      <AvatarImage src={student.photo || undefined} />
                                      <AvatarFallback>
                                        {student.name && student.name !== "-"
                                          ? student.name
                                              .split(" ")
                                              .filter(Boolean)
                                              .map((n) => n[0])
                                              .join("")
                                              .toUpperCase()
                                          : "M"}
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
                                <TableCell className="text-sm">
                                  {student.major}
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col gap-1">
                                    {getPeriodStatusBadge(student)}
                                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                                      <Calendar className="h-3 w-3" />
                                      <span>
                                        {student.startDate ? new Date(student.startDate).toLocaleDateString("id-ID", {
                                          day: "2-digit",
                                          month: "short",
                                        }) : "-"} s/d {student.endDate ? new Date(student.endDate).toLocaleDateString("id-ID", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                        }) : "-"}
                                      </span>
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
                                    <Link
                                      to={`/mentor/logbook-detail/${student.id}`}
                                    >
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

                  {/* Pagination Footer */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4 px-2 text-sm text-muted-foreground">
                      <div>
                        Menampilkan <span className="font-semibold text-foreground">{Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(totalItems, currentPage * itemsPerPage)}</span> dari <span className="font-semibold text-foreground">{totalItems}</span> mahasiswa
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="h-8 w-24 bg-white"
                        >
                          Sebelumnya
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="h-8 w-8 p-0 bg-white"
                              style={{
                                backgroundColor: currentPage === pageNum ? 'var(--primary)' : 'white',
                                color: currentPage === pageNum ? 'white' : 'inherit'
                              }}
                            >
                              {pageNum}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="h-8 w-24 bg-white"
                        >
                          Selanjutnya
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

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
