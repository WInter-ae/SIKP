import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  BookMarked,
  CalendarDays,
  Eye,
  Search,
  User,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  Clock,
  Building2,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  getDosenLogbookMonitorItems,
  getInactiveMentees,
  exportLogbookZip,
  syncMenteesProgress,
  type DosenLogbookMonitorItem,
} from "../services/logbook-monitor-api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { toast } from "sonner";

function getDetailLinkKey(item: DosenLogbookMonitorItem) {
  const key = item.detailRouteKey || item.studentId || item.nim || item.id;
  console.log(`[DosenLogbookMonitorPage] Detail link for ${item.studentName}:`, { key, item });
  return key;
}

function getStatusBadge(status: DosenLogbookMonitorItem["status"]) {
  if (status === "APPROVED") {
    return (
      <Badge className="bg-green-600 hover:bg-green-600">
        Disetujui Pembimbing
      </Badge>
    );
  }
  if (status === "REJECTED") {
    return <Badge variant="destructive">Ditolak Pembimbing</Badge>;
  }
  return <Badge variant="secondary">Menunggu Review Pembimbing</Badge>;
}

function getInternshipPeriodStatus(item: DosenLogbookMonitorItem) {
  if (!item.startDate || !item.endDate) return "UNKNOWN";
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const start = new Date(item.startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(item.endDate);
  end.setHours(0, 0, 0, 0);
  
  if (now < start) return "UPCOMING";
  if (now > end) return "COMPLETED";
  return "ONGOING";
}

function getPeriodStatusBadge(item: DosenLogbookMonitorItem) {
  const status = getInternshipPeriodStatus(item);
  switch (status) {
    case "ONGOING":
      return (
        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium border-0">
          🟢 Sedang Magang
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-medium border-0">
          🏁 Selesai Magang
        </Badge>
      );
    case "UPCOMING":
      return (
        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50/50 font-medium">
          🟡 Belum Mulai
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-muted-foreground bg-slate-50 font-medium">
          Tidak Diketahui
        </Badge>
      );
  }
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getAcademicPeriod(startDateStr: string | null | undefined): string {
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

export default function DosenLogbookMonitorPage() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logbooks, setLogbooks] = useState<DosenLogbookMonitorItem[]>([]);
  const [inactiveMentees, setInactiveMentees] = useState<DosenLogbookMonitorItem[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setErrorMessage(null);

    const [logbookRes, inactiveRes] = await Promise.all([
      getDosenLogbookMonitorItems(),
      getInactiveMentees(),
    ]);

    if (logbookRes.success && logbookRes.data) {
      setLogbooks(logbookRes.data);
    } else if (!silent) {
      setErrorMessage(logbookRes.message || "Gagal memuat data logbook.");
    }

    if (inactiveRes.success && inactiveRes.data) {
      setInactiveMentees(inactiveRes.data);
    }

    if (!silent) setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await syncMenteesProgress();
      if (res.success) {
        toast.success(`Sinkronisasi berhasil! ${res.data?.synced || 0} mahasiswa baru ditambahkan ke pantauan.`);
        await loadData(true);
      } else {
        toast.error(res.message || "Gagal sinkronisasi data PA.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat sinkronisasi.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportZip = async () => {
    setIsExporting(true);
    try {
      const response = await exportLogbookZip();
      if (!response.success || !response.data) {
        toast.error(response.message || "Gagal menyiapkan arsip logbook.");
        return;
      }

      const url = window.URL.createObjectURL(response.data.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = response.data.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Arsip logbook berhasil diunduh.");
    } catch (error) {
      toast.error("Terjadi kesalahan saat mengunduh logbook.");
    } finally {
      setIsExporting(false);
    }
  };

  const academicPeriods = useMemo(() => {
    const periods = new Set<string>();
    logbooks.forEach((item) => {
      if (item.startDate) {
        periods.add(getAcademicPeriod(item.startDate));
      }
    });
    return Array.from(periods).sort((a, b) => b.localeCompare(a));
  }, [logbooks]);

  const filteredLogbooks = useMemo(() => {
    let result = logbooks;

    // Apply Academic Period filter
    if (selectedPeriod !== "all") {
      result = result.filter((item) => getAcademicPeriod(item.startDate) === selectedPeriod);
    }

    // Apply Tab filter
    if (activeTab === "ongoing") {
      result = result.filter((item) => getInternshipPeriodStatus(item) === "ONGOING");
    } else if (activeTab === "completed") {
      result = result.filter((item) => getInternshipPeriodStatus(item) === "COMPLETED");
    }

    const keyword = query.toLowerCase().trim();
    if (!keyword) return result;

    return result.filter((item) => {
      return (
        item.studentName.toLowerCase().includes(keyword) ||
        item.nim.toLowerCase().includes(keyword) ||
        item.company.toLowerCase().includes(keyword) ||
        item.activity.toLowerCase().includes(keyword)
      );
    });
  }, [logbooks, query, activeTab, selectedPeriod]);

  // Global statistics filtered by selected academic period
  const periodFilteredLogbooks = useMemo(() => {
    if (selectedPeriod === "all") return logbooks;
    return logbooks.filter((item) => getAcademicPeriod(item.startDate) === selectedPeriod);
  }, [logbooks, selectedPeriod]);

  const filteredInactiveMentees = useMemo(() => {
    if (selectedPeriod === "all") return inactiveMentees;
    return inactiveMentees.filter((item) => getAcademicPeriod(item.startDate) === selectedPeriod);
  }, [inactiveMentees, selectedPeriod]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPeriod, activeTab, query]);

  const totalItems = filteredLogbooks.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedLogbooks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogbooks.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogbooks, currentPage, itemsPerPage]);

  const totalMentees = periodFilteredLogbooks.length;
  const globalPending = periodFilteredLogbooks.reduce((sum, item) => sum + (item.totalPending || 0), 0);
  const globalApproved = periodFilteredLogbooks.reduce((sum, item) => sum + (item.totalApproved || 0), 0);
  const totalOngoing = useMemo(() => periodFilteredLogbooks.filter((item) => getInternshipPeriodStatus(item) === "ONGOING").length, [periodFilteredLogbooks]);
  const totalCompleted = useMemo(() => periodFilteredLogbooks.filter((item) => getInternshipPeriodStatus(item) === "COMPLETED").length, [periodFilteredLogbooks]);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Memuat data logbook monitor...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Monitoring Logbook Mahasiswa
          </h1>
          <p className="text-sm text-muted-foreground">
            Halaman ini khusus pemantauan Dosen PA (read-only). Tidak ada aksi
            approve/reject.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleExportZip}
            disabled={isExporting}
            variant="default"
          >
            <BookMarked className="mr-2 h-4 w-4" />
            {isExporting ? "Menyiapkan ZIP..." : "Export Logbook ZIP"}
          </Button>
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            variant="outline"
            className="bg-white hover:bg-slate-50"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Mensinkronkan..." : "Sinkronisasi Mahasiswa PA"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Mahasiswa PA</p>
                <p className="text-3xl font-bold">{totalMentees}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalOngoing} Ongoing | {totalCompleted} Selesai
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Menunggu Paraf Mentor</p>
                <p className="text-3xl font-bold">{globalPending}</p>
                <p className="text-xs text-muted-foreground mt-1">Memerlukan verifikasi mentor</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Disetujui</p>
                <p className="text-3xl font-bold">{globalApproved}</p>
                <p className="text-xs text-muted-foreground mt-1">Entri logbook tervalidasi</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={filteredInactiveMentees.length > 0 ? "border-orange-200 bg-orange-50/30" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mahasiswa Inaktif</p>
                <p className="text-3xl font-bold text-orange-700">{filteredInactiveMentees.length}</p>
                <p className="text-xs text-muted-foreground mt-1">3 hari terakhir tanpa entri</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Daftar Mahasiswa</CardTitle>
              {errorMessage && (
                <p className="text-sm text-destructive mt-1">{errorMessage}</p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full md:max-w-2xl justify-end">
              {/* Dropdown Filter Periode Akademik */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">Periode:</span>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-[190px] h-9 bg-white shadow-xs">
                    <SelectValue placeholder="Pilih Periode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Periode</SelectItem>
                    {academicPeriods.map((period) => (
                      <SelectItem key={period} value={period}>
                        {period}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search Input */}
              <div className="relative w-full sm:w-[220px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari nama, NIM..."
                  className="pl-9 h-9 bg-white shadow-xs"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 flex flex-wrap gap-2 bg-transparent p-0 h-auto">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
              >
                Semua Aktivitas ({periodFilteredLogbooks.length})
              </TabsTrigger>
              <TabsTrigger 
                value="ongoing" 
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white border bg-white px-4 py-2 rounded-lg text-sm font-medium text-emerald-700 transition-all"
              >
                🟢 Sedang Magang ({totalOngoing})
              </TabsTrigger>
              <TabsTrigger 
                value="completed" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white border bg-white px-4 py-2 rounded-lg text-sm font-medium text-blue-700 transition-all"
              >
                🏁 Selesai Magang ({totalCompleted})
              </TabsTrigger>
              <TabsTrigger 
                value="inactive" 
                className="data-[state=active]:bg-orange-600 data-[state=active]:text-white border bg-white px-4 py-2 rounded-lg text-sm font-medium text-orange-700 transition-all"
              >
                ⚠️ Inaktif ({filteredInactiveMentees.length})
              </TabsTrigger>
            </TabsList>
            
            {activeTab !== "inactive" ? (
              <div className="space-y-4">
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mahasiswa</TableHead>
                        <TableHead>NIM</TableHead>
                        <TableHead>Perusahaan</TableHead>
                        <TableHead>Periode Magang</TableHead>
                        <TableHead className="text-center">Total Logbook</TableHead>
                        <TableHead className="text-center">Disetujui</TableHead>
                        <TableHead className="text-center">Menunggu Paraf</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogbooks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="h-20 text-center text-muted-foreground">
                            Data logbook tidak ditemukan.
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedLogbooks.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={item.photoUrl || undefined} />
                                  <AvatarFallback className="text-xs">
                                    {item.studentName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm">{item.studentName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.studentEmail || "No Email"}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm">{item.nim}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm">{item.company}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                {getPeriodStatusBadge(item)}
                                <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                                  <CalendarDays className="h-3 w-3" />
                                  <span>{item.startDate ? formatDate(item.startDate) : "-"} s/d {item.endDate ? formatDate(item.endDate) : "-"}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline">{(item.totalApproved || 0) + (item.totalPending || 0)}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-green-500 hover:bg-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {item.totalApproved || 0}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700">
                                <Clock className="w-3 h-3 mr-1" />
                                {item.totalPending || 0}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button asChild variant="outline" size="sm">
                                <Link to={`/dosen/kp/logbook-monitor/${getDetailLinkKey(item)}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Detail
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls */}
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
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mahasiswa</TableHead>
                      <TableHead>NIM</TableHead>
                      <TableHead>Perusahaan</TableHead>
                      <TableHead>Terakhir Update</TableHead>
                      <TableHead className="text-right">Detail</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInactiveMentees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                          Tidak ada mahasiswa inaktif. Bagus!
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInactiveMentees.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.studentName}</TableCell>
                          <TableCell>{item.nim}</TableCell>
                          <TableCell>{item.company}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-orange-700 bg-orange-50">
                              Belum ada entri baru
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button asChild variant="outline" size="sm">
                              <Link to={`/dosen/kp/logbook-monitor/${getDetailLinkKey(item)}`}>
                                Detail
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
