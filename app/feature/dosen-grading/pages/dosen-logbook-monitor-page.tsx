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
  getDosenLogbookMonitorItems,
  getInactiveMentees,
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

export default function DosenLogbookMonitorPage() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logbooks, setLogbooks] = useState<DosenLogbookMonitorItem[]>([]);
  const [inactiveMentees, setInactiveMentees] = useState<DosenLogbookMonitorItem[]>([]);
  const [activeTab, setActiveTab] = useState("all");

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

  const filteredLogbooks = useMemo(() => {
    const keyword = query.toLowerCase().trim();
    if (!keyword) return logbooks;

    return logbooks.filter((item) => {
      return (
        item.studentName.toLowerCase().includes(keyword) ||
        item.nim.toLowerCase().includes(keyword) ||
        item.company.toLowerCase().includes(keyword) ||
        item.activity.toLowerCase().includes(keyword)
      );
    });
  }, [logbooks, query]);

  // Global statistics
  const totalMentees = logbooks.length;
  const globalPending = logbooks.reduce((sum, item) => sum + (item.totalPending || 0), 0);
  const globalApproved = logbooks.reduce((sum, item) => sum + (item.totalApproved || 0), 0);

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

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Mahasiswa PA</p>
                <p className="text-3xl font-bold">{totalMentees}</p>
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
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={inactiveMentees.length > 0 ? "border-orange-200 bg-orange-50/30" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mahasiswa Inaktif</p>
                <p className="text-3xl font-bold text-orange-700">{inactiveMentees.length}</p>
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
            <div className="relative max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari mahasiswa, NIM, perusahaan..."
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Semua Aktivitas</TabsTrigger>
              <TabsTrigger value="inactive" className="text-orange-700">
                Inaktif ({inactiveMentees.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mahasiswa</TableHead>
                      <TableHead>NIM</TableHead>
                      <TableHead>Perusahaan</TableHead>
                      <TableHead className="text-center">Total Logbook</TableHead>
                      <TableHead className="text-center">Disetujui</TableHead>
                      <TableHead className="text-center">Menunggu Paraf</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogbooks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-20 text-center text-muted-foreground">
                          Data logbook tidak ditemukan.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogbooks.map((item) => (
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
            </TabsContent>
            
            <TabsContent value="inactive">
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
                    {inactiveMentees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                          Tidak ada mahasiswa inaktif. Bagus!
                        </TableCell>
                      </TableRow>
                    ) : (
                      inactiveMentees.map((item) => (
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
