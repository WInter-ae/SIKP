// External dependencies
import { useState } from "react";
import { Link } from "react-router";
import { Archive, FileText, Eye, Download, Calendar } from "lucide-react";

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

// Types
import type { ArchivedDocument } from "../types";

// Mock data - should be fetched from API in real implementation
const MOCK_ARCHIVED_DOCUMENTS: ArchivedDocument[] = [
  {
    id: "1",
    type: "penilaian",
    title: "Penilaian - Ahmad Fauzi",
    mentee: "Ahmad Fauzi",
    date: "2024-12-01",
    semester: "Ganjil 2024/2025",
    status: "completed",
  },
  {
    id: "2",
    type: "logbook",
    title: "Logbook Lengkap - Siti Aminah (12 Minggu)",
    mentee: "Siti Aminah",
    date: "2024-11-28",
    semester: "Ganjil 2024/2025",
    status: "completed",
  },
  {
    id: "3",
    type: "laporan",
    title: "Laporan Magang - Budi Santoso",
    mentee: "Budi Santoso",
    date: "2024-11-25",
    semester: "Ganjil 2024/2025",
    status: "archived",
  },
  {
    id: "4",
    type: "penilaian",
    title: "Penilaian - Dewi Kartika",
    mentee: "Dewi Kartika",
    date: "2024-06-15",
    semester: "Genap 2023/2024",
    status: "completed",
  },
  {
    id: "5",
    type: "logbook",
    title: "Logbook Lengkap - Eko Prasetyo (12 Minggu)",
    mentee: "Eko Prasetyo",
    date: "2024-06-10",
    semester: "Genap 2023/2024",
    status: "completed",
  },
  {
    id: "6",
    type: "laporan",
    title: "Laporan Magang - Rina Wulandari",
    mentee: "Rina Wulandari",
    date: "2024-06-05",
    semester: "Genap 2023/2024",
    status: "archived",
  },
];

const MOCK_SEMESTERS = ["Ganjil 2024/2025", "Genap 2023/2024", "Ganjil 2023/2024"];

function ArchivePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSemester, setFilterSemester] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");

  const filteredDocuments = MOCK_ARCHIVED_DOCUMENTS.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.mentee.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || doc.type === filterType;
    const matchesSemester =
      filterSemester === "all" || doc.semester === filterSemester;
    const matchesTab = activeTab === "all" || doc.type === activeTab;

    return matchesSearch && matchesType && matchesSemester && matchesTab;
  });

  function getDocumentIcon(type: string) {
    return <FileText className="h-5 w-5" />;
  }

  function getDocumentColor(type: string) {
    switch (type) {
      case "penilaian":
        return "bg-blue-500/10 text-blue-500";
      case "logbook":
        return "bg-green-500/10 text-green-500";
      case "laporan":
        return "bg-purple-500/10 text-purple-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  }

  function handleView(docId: string) {
    // Implement document view logic
    console.log("View document:", docId);
  }

  function handleDownload(docId: string) {
    // Implement download logic
    console.log("Download document:", docId);
  }

  const totalPenilaian = MOCK_ARCHIVED_DOCUMENTS.filter((d) => d.type === "penilaian").length;
  const totalLogbook = MOCK_ARCHIVED_DOCUMENTS.filter((d) => d.type === "logbook").length;
  const totalLaporan = MOCK_ARCHIVED_DOCUMENTS.filter((d) => d.type === "laporan").length;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Arsip Dokumen</h1>
        <p className="text-muted-foreground">
          Kelola dan akses dokumen mahasiswa magang yang telah selesai
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Arsip</CardDescription>
            <CardTitle className="text-3xl">{MOCK_ARCHIVED_DOCUMENTS.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Penilaian</CardDescription>
            <CardTitle className="text-3xl">{totalPenilaian}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Logbook</CardDescription>
            <CardTitle className="text-3xl">{totalLogbook}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Laporan</CardDescription>
            <CardTitle className="text-3xl">{totalLaporan}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
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
                  {MOCK_SEMESTERS.map((semester) => (
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

      {/* Documents with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="penilaian">Penilaian</TabsTrigger>
          <TabsTrigger value="logbook">Logbook</TabsTrigger>
          <TabsTrigger value="laporan">Laporan</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredDocuments.map((doc) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${getDocumentColor(doc.type)}`}>
                          {getDocumentIcon(doc.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold mb-1 truncate">{doc.title}</h3>
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
                          onClick={() => handleView(doc.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Lihat
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleDownload(doc.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">
                    Tidak ada dokumen ditemukan
                  </p>
                  <p className="text-muted-foreground">
                    Coba ubah filter atau kata kunci pencarian
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Archive className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium mb-1">Tentang Arsip</p>
              <p className="text-sm text-muted-foreground">
                Halaman ini menyimpan semua dokumen penilaian, logbook, dan laporan dari mahasiswa 
                yang telah menyelesaikan periode magang di perusahaan Anda. Anda dapat mencari, melihat, dan 
                mengunduh dokumen untuk referensi atau keperluan administrasi.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ArchivePage;
