import { useEffect, useState } from "react";
import { 
  Archive, 
  Search, 
  Calendar, 
  Building2, 
  User, 
  Download, 
  ChevronRight,
  Filter,
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "~/components/ui/table";
import { 
  getStudentArchive, 
  type ArchiveInternship 
} from "../services/archive-api";
import { toast } from "sonner";

export default function ArchivePage() {
  const [archives, setArchives] = useState<ArchiveInternship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadArchives() {
      setIsLoading(true);
      const res = await getStudentArchive();
      if (res.success && res.data) {
        setArchives(res.data);
      } else {
        toast.error(res.message || "Gagal memuat arsip.");
      }
      setIsLoading(false);
    }
    loadArchives();
  }, []);

  const filteredArchives = archives.filter(item => 
    item.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.nim?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Arsip Magang</h1>
          <p className="text-muted-foreground">
            Riwayat kerja praktik yang telah diselesaikan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-blue-50/50 border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Arsip</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{archives.length}</div>
            <p className="text-xs text-blue-600 mt-1">Data tersimpan di sistem</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50/50 border-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Lulus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {archives.filter(a => (a.finalGrade || "").startsWith("A") || (a.finalGrade || "").startsWith("B")).length}
            </div>
            <p className="text-xs text-green-600 mt-1">Mahasiswa dengan nilai memuaskan</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50/50 border-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Periode Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">2023/2024</div>
            <p className="text-xs text-purple-600 mt-1">Tahun akademik aktif</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg">Daftar Riwayat</CardTitle>
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Cari perusahaan, nama, atau NIM..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Perusahaan</TableHead>
                  <TableHead>Mahasiswa</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead>Pembimbing</TableHead>
                  <TableHead className="text-center">Nilai</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span className="text-sm text-muted-foreground">Memuat data arsip...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredArchives.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Archive className="h-8 w-8 opacity-20" />
                        <span>Belum ada data arsip yang tersedia.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredArchives.map((archive) => (
                    <TableRow key={archive.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded text-blue-600 group-hover:bg-blue-100 transition-colors">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{archive.companyName}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {archive.position || "Kerja Praktik"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{archive.studentName || "N/A"}</p>
                          <p className="text-xs text-muted-foreground">{archive.nim || "N/A"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>{new Date(archive.startDate).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</span>
                          </div>
                          <ChevronRight className="h-3 w-3 mx-auto text-muted-foreground rotate-90" />
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>{new Date(archive.endDate).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{archive.academicSupervisor || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {archive.finalGrade ? (
                          <Badge 
                            className={
                              archive.finalGrade.startsWith('A') 
                                ? "bg-green-600" 
                                : archive.finalGrade.startsWith('B') 
                                  ? "bg-blue-600" 
                                  : "bg-orange-600"
                            }
                          >
                            {archive.finalGrade}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Pending</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" title="Lihat Laporan">
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Unduh Sertifikat">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
