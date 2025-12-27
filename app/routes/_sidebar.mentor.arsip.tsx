import { useState } from "react";
import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  ArrowLeft,
  Archive,
  Download,
  Eye,
  FileText,
  Calendar,
  User,
  Search,
  Filter,
} from "lucide-react";

interface ArchivedDocument {
  id: string;
  type: "penilaian" | "logbook" | "laporan";
  title: string;
  mentee: string;
  date: string;
  semester: string;
  status: "completed" | "archived";
}

export default function ArsipPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSemester, setFilterSemester] = useState<string>("all");

  const archivedDocuments: ArchivedDocument[] = [
    {
      id: "1",
      type: "penilaian",
      title: "Penilaian Akhir - Ahmad Fauzi",
      mentee: "Ahmad Fauzi",
      date: "2024-12-01",
      semester: "Ganjil 2024/2025",
      status: "completed",
    },
    {
      id: "2",
      type: "logbook",
      title: "Logbook Lengkap - Siti Aminah",
      mentee: "Siti Aminah",
      date: "2024-11-28",
      semester: "Ganjil 2024/2025",
      status: "completed",
    },
    {
      id: "3",
      type: "laporan",
      title: "Laporan KP - Budi Santoso",
      mentee: "Budi Santoso",
      date: "2024-11-25",
      semester: "Ganjil 2024/2025",
      status: "archived",
    },
    {
      id: "4",
      type: "penilaian",
      title: "Penilaian Akhir - Dewi Kartika",
      mentee: "Dewi Kartika",
      date: "2024-06-15",
      semester: "Genap 2023/2024",
      status: "completed",
    },
    {
      id: "5",
      type: "logbook",
      title: "Logbook Lengkap - Eko Prasetyo",
      mentee: "Eko Prasetyo",
      date: "2024-06-10",
      semester: "Genap 2023/2024",
      status: "completed",
    },
  ];

  const filteredDocuments = archivedDocuments.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.mentee.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || doc.type === filterType;
    const matchesSemester =
      filterSemester === "all" || doc.semester === filterSemester;

    return matchesSearch && matchesType && matchesSemester;
  });

  function getTypeLabel(type: string) {
    switch (type) {
      case "penilaian":
        return "Penilaian";
      case "logbook":
        return "Logbook";
      case "laporan":
        return "Laporan";
      default:
        return type;
    }
  }

  function getTypeBadgeColor(type: string) {
    switch (type) {
      case "penilaian":
        return "bg-blue-100 text-blue-800";
      case "logbook":
        return "bg-green-100 text-green-800";
      case "laporan":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  function handleDownload(doc: ArchivedDocument) {
    alert(`Download: ${doc.title}`);
  }

  function handleView(doc: ArchivedDocument) {
    alert(`View: ${doc.title}`);
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Arsip</h1>
        <p className="text-muted-foreground">
          Dokumen dan data mentee yang telah selesai
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Arsip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{archivedDocuments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Penilaian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {archivedDocuments.filter((d) => d.type === "penilaian").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Logbook
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {archivedDocuments.filter((d) => d.type === "logbook").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Laporan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {archivedDocuments.filter((d) => d.type === "laporan").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Search className="h-4 w-4" />
                Cari
              </label>
              <Input
                placeholder="Cari berdasarkan judul atau nama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Tipe Dokumen
              </label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua tipe" />
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
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Semester
              </label>
              <Select value={filterSemester} onValueChange={setFilterSemester}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Semester</SelectItem>
                  <SelectItem value="Ganjil 2024/2025">Ganjil 2024/2025</SelectItem>
                  <SelectItem value="Genap 2023/2024">Genap 2023/2024</SelectItem>
                  <SelectItem value="Ganjil 2023/2024">Ganjil 2023/2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="space-y-4 mb-8">
        {filteredDocuments.length > 0 ? (
          filteredDocuments.map((doc) => (
            <Card key={doc.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-lg">{doc.title}</CardTitle>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getTypeBadgeColor(doc.type)}`}
                      >
                        {getTypeLabel(doc.type)}
                      </span>
                    </div>
                    <CardDescription>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          <span>{doc.mentee}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(doc.date).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                          <span className="mx-2">•</span>
                          <span>{doc.semester}</span>
                        </div>
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(doc)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Lihat
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
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
      </div>

      {/* Back Button */}
      <div className="flex justify-start">
        <Button variant="secondary" asChild>
          <Link to="/mentor">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
