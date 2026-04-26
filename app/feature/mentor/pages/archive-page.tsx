import { useEffect, useMemo, useState } from "react";
import { Archive, FileText, Eye, Download, Calendar } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import {
  getMentees,
  getStudentAssessment,
  getStudentLogbook,
  type MenteeData,
} from "~/feature/field-mentor/services";

import type { ArchivedDocument } from "../types";

function semesterFromDate(dateString?: string) {
  if (!dateString) return "-";

  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return "-";

  const month = parsed.getMonth() + 1;
  const year = parsed.getFullYear();
  if (month >= 8 || month <= 1) {
    return `Ganjil ${year}/${year + 1}`;
  }

  return `Genap ${year - 1}/${year}`;
}

function buildArchiveItems(
  mentees: MenteeData[],
  logbookCounts: Record<string, number>,
  hasAssessment: Record<string, boolean>,
): ArchivedDocument[] {
  const rows: ArchivedDocument[] = [];

  mentees.forEach((mentee) => {
    if (!mentee.userId) return;

    const studentName = mentee.nama || mentee.name || "Mahasiswa";
    const semester = semesterFromDate(
      mentee.internshipEndDate || mentee.internshipStartDate,
    );
    const archiveDate =
      mentee.internshipEndDate ||
      mentee.internshipStartDate ||
      new Date().toISOString();

    if (hasAssessment[mentee.userId]) {
      rows.push({
        id: `assessment-${mentee.userId}`,
        type: "penilaian",
        title: `Penilaian - ${studentName}`,
        mentee: studentName,
        date: archiveDate,
        semester,
        status: "completed",
      });
    }

    if ((logbookCounts[mentee.userId] || 0) > 0) {
      rows.push({
        id: `logbook-${mentee.userId}`,
        type: "logbook",
        title: `Logbook Lengkap - ${studentName}`,
        mentee: studentName,
        date: archiveDate,
        semester,
        status: "completed",
      });
    }

    rows.push({
      id: `laporan-${mentee.userId}`,
      type: "laporan",
      title: `Ringkasan Magang - ${studentName}`,
      mentee: studentName,
      date: archiveDate,
      semester,
      status: "archived",
    });
  });

  return rows.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

function ArchivePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSemester, setFilterSemester] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");
  const [documents, setDocuments] = useState<ArchivedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadArchive() {
      setIsLoading(true);

      try {
        const menteesRes = await getMentees();

        if (!isMounted) return;

        if (!menteesRes.success || !menteesRes.data) {
          setDocuments([]);
          toast.error(menteesRes.message || "Gagal memuat arsip mentor.");
          return;
        }

        const validMentees = menteesRes.data.filter((mentee) =>
          Boolean(mentee.userId),
        );

        const tuples = await Promise.all(
          validMentees.map(async (mentee) => {
            try {
              const [logbookRes, assessmentRes] = await Promise.all([
                getStudentLogbook(mentee.userId),
                getStudentAssessment(mentee.userId),
              ]);

              const logbookCount =
                logbookRes.success && logbookRes.data?.entries
                  ? logbookRes.data.entries.length
                  : 0;
              const assessmentExists = Boolean(
                assessmentRes.success && assessmentRes.data,
              );

              return [mentee.userId, logbookCount, assessmentExists] as const;
            } catch {
              return [mentee.userId, 0, false] as const;
            }
          }),
        );

        if (!isMounted) return;

        const logbookCounts: Record<string, number> = {};
        const hasAssessment: Record<string, boolean> = {};

        tuples.forEach(([studentId, count, assessment]) => {
          logbookCounts[studentId] = count;
          hasAssessment[studentId] = assessment;
        });

        setDocuments(
          buildArchiveItems(validMentees, logbookCounts, hasAssessment),
        );
      } catch (error) {
        if (!isMounted) return;
        setDocuments([]);
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat arsip mentor.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadArchive();

    return () => {
      isMounted = false;
    };
  }, []);

  const semesters = useMemo(
    () =>
      Array.from(new Set(documents.map((doc) => doc.semester))).filter(
        (semester) => semester !== "-",
      ),
    [documents],
  );

  const filteredDocuments = useMemo(
    () =>
      documents.filter((doc) => {
        const matchesSearch =
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.mentee.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === "all" || doc.type === filterType;
        const matchesSemester =
          filterSemester === "all" || doc.semester === filterSemester;
        const matchesTab = activeTab === "all" || doc.type === activeTab;

        return matchesSearch && matchesType && matchesSemester && matchesTab;
      }),
    [activeTab, documents, filterSemester, filterType, searchQuery],
  );

  function getDocumentColor(type: string) {
    switch (type) {
      case "penilaian":
        return "bg-blue-500/10 text-blue-500";
      case "logbook":
        return "bg-green-500/10 text-green-500";
      case "laporan":
        return "bg-orange-500/10 text-orange-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  }

  function handleView(doc: ArchivedDocument) {
    if (doc.type === "penilaian") {
      window.location.href = "/mentor/penilaian";
      return;
    }

    if (doc.type === "logbook") {
      window.location.href = "/mentor/logbook";
      return;
    }

    toast.info(
      "Dokumen ringkasan dapat diakses dari halaman detail mahasiswa.",
    );
  }

  function handleDownload(doc: ArchivedDocument) {
    toast.info(
      `Unduh dokumen ${doc.title} akan diaktifkan setelah endpoint export tersedia.`,
    );
  }

  const totalPenilaian = documents.filter((d) => d.type === "penilaian").length;
  const totalLogbook = documents.filter((d) => d.type === "logbook").length;
  const totalLaporan = documents.filter((d) => d.type === "laporan").length;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Arsip Dokumen</h1>
        <p className="text-muted-foreground">
          Kelola dan akses dokumen mahasiswa magang yang telah selesai
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Arsip</CardDescription>
            <CardTitle className="text-3xl">
              {isLoading ? "..." : documents.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Penilaian</CardDescription>
            <CardTitle className="text-3xl">
              {isLoading ? "..." : totalPenilaian}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Logbook</CardDescription>
            <CardTitle className="text-3xl">
              {isLoading ? "..." : totalLogbook}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Laporan</CardDescription>
            <CardTitle className="text-3xl">
              {isLoading ? "..." : totalLaporan}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cari Dokumen</label>
              <Input
                type="search"
                placeholder="Cari berdasarkan judul atau nama mentee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipe Dokumen</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  <SelectItem value="penilaian">Penilaian</SelectItem>
                  <SelectItem value="logbook">Logbook</SelectItem>
                  <SelectItem value="laporan">Laporan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Semester</label>
              <Select value={filterSemester} onValueChange={setFilterSemester}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Semester</SelectItem>
                  {semesters.map((semester) => (
                    <SelectItem key={semester} value={semester}>
                      {semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="penilaian">Penilaian</TabsTrigger>
          <TabsTrigger value="logbook">Logbook</TabsTrigger>
          <TabsTrigger value="laporan">Laporan</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <Card>
              <CardContent className="py-8 text-muted-foreground">
                Memuat arsip dari backend...
              </CardContent>
            </Card>
          ) : filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredDocuments.map((doc) => (
                <Card
                  key={doc.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-lg ${getDocumentColor(doc.type)}`}
                        >
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold mb-1 truncate">
                            {doc.title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {doc.mentee}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(doc.date).toLocaleDateString("id-ID")}
                            </span>
                          </div>
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              {doc.semester}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleView(doc)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Lihat
                        </Button>
                        <Button size="sm" onClick={() => handleDownload(doc)}>
                          <Download className="h-4 w-4 mr-2" />
                          Unduh
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  Tidak ada dokumen ditemukan
                </p>
                <p className="text-muted-foreground">
                  Coba ubah filter atau kata kunci pencarian
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ArchivePage;
