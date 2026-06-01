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
              <div className="space-y-6">
                {filteredLogbooks.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border rounded-lg bg-white">
                    Data logbook tidak ditemukan.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedLogbooks.map((item) => {
                      const periodStatus = getInternshipPeriodStatus(item);
                      const totalEntries = (item.totalApproved || 0) + (item.totalPending || 0);
                      
                      return (
                        <Card key={item.id} className="overflow-hidden hover:shadow-md transition-all duration-300 border-slate-200/80 bg-white group flex flex-col justify-between">
                          <div>
                            {/* Card Header Background and Avatar */}
                            <div className="relative h-20 bg-slate-50 border-b border-slate-100 flex items-end px-5 pb-3">
                              <div className="absolute right-4 top-4">
                                {getPeriodStatusBadge(item)}
                              </div>
                              <Avatar className="h-14 w-14 border-4 border-white shadow-xs -mb-6 bg-white z-10">
                                <AvatarImage src={item.photoUrl || item.photo_url || undefined} />
                                <AvatarFallback className="text-sm font-semibold bg-slate-100 text-slate-700">
                                  {item.studentName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            
                            {/* Student Profile Info */}
                            <div className="pt-8 px-5 pb-4 space-y-3">
                              <div>
                                <h3 className="font-bold text-slate-800 text-base leading-snug group-hover:text-primary transition-colors">
                                  {item.studentName}
                                </h3>
                                <p className="text-xs font-mono text-slate-500 mt-0.5">NIM: {item.nim}</p>
                                <p className="text-xs text-slate-400 truncate mt-0.5">{item.studentEmail || "No Email"}</p>
                              </div>
                              
                              <div className="pt-2 border-t border-slate-100/80 space-y-2.5">
                                {/* Company info */}
                                <div className="flex items-start gap-2.5 text-xs text-slate-600">
                                  <Building2 className="h-4 w-4 text-slate-450 shrink-0 mt-0.5" />
                                  <div className="truncate">
                                    <span className="font-medium text-slate-700 block">Tempat Magang:</span>
                                    <span className="text-slate-500">{item.company || "-"}</span>
                                  </div>
                                </div>
                                
                                {/* Period info */}
                                <div className="flex items-start gap-2.5 text-xs text-slate-600">
                                  <CalendarDays className="h-4 w-4 text-slate-450 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-medium text-slate-700 block">Waktu Magang:</span>
                                    <span className="font-mono text-[11px] text-slate-500">
                                      {item.startDate ? formatDate(item.startDate) : "-"} s/d {item.endDate ? formatDate(item.endDate) : "-"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Logbook Statistics & Action Footer */}
                          <div className="bg-slate-50/50 px-5 py-4 border-t border-slate-100 flex flex-col gap-3">
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div className="bg-white border border-slate-200/60 rounded-md py-1.5 px-1 shadow-2xs">
                                <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">Total</span>
                                <span className="text-sm font-bold text-slate-700">{totalEntries}</span>
                              </div>
                              <div className="bg-green-50/60 border border-green-200/50 rounded-md py-1.5 px-1 shadow-2xs">
                                <span className="text-[10px] text-green-500 block uppercase tracking-wider font-semibold">Disetujui</span>
                                <span className="text-sm font-bold text-green-600">{item.totalApproved || 0}</span>
                              </div>
                              <div className="bg-yellow-50/60 border border-yellow-200/50 rounded-md py-1.5 px-1 shadow-2xs">
                                <span className="text-[10px] text-yellow-600 block uppercase tracking-wider font-semibold">Pending</span>
                                <span className="text-sm font-bold text-yellow-750">{item.totalPending || 0}</span>
                              </div>
                            </div>
                            
                            <Button asChild className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-2xs mt-1 transition-all" size="sm" variant="outline">
                              <Link to={`/dosen/kp/logbook-monitor/${getDetailLinkKey(item)}`}>
                                <Eye className="h-4 w-4 mr-2 text-slate-550" />
                                Lihat Detail Logbook
                                <ArrowRight className="h-3.5 w-3.5 ml-auto text-slate-400 group-hover:translate-x-1 transition-transform" />
                              </Link>
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}

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
              <div>
                {filteredInactiveMentees.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border rounded-lg bg-white">
                    Tidak ada mahasiswa bimbingan yang inaktif. Bagus!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInactiveMentees.map((item) => (
                      <Card key={item.id} className="overflow-hidden border-orange-200 bg-orange-50/10 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                        <div className="p-5 space-y-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-11 w-11 bg-white border border-orange-200 shadow-2xs">
                              <AvatarImage src={item.photoUrl || item.photo_url || undefined} />
                              <AvatarFallback className="text-sm font-semibold bg-orange-50 text-orange-700">
                                {item.studentName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-bold text-slate-800 text-sm leading-snug">{item.studentName}</h3>
                              <p className="text-xs font-mono text-slate-500">NIM: {item.nim}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-3.5 w-3.5 text-slate-400" />
                              <span className="truncate">{item.company || "-"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-3.5 w-3.5 text-orange-500" />
                              <span className="text-orange-700 font-medium">Belum mengisi logbook dalam 3 hari terakhir</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-orange-50/30 px-5 py-3 border-t border-orange-100/60">
                          <Button asChild className="w-full bg-white hover:bg-orange-50/50 text-orange-850 border border-orange-200 shadow-2xs" size="sm" variant="outline">
                            <Link to={`/dosen/kp/logbook-monitor/${getDetailLinkKey(item)}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Lihat Detail
                            </Link>
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
