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
} from "lucide-react";

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
  type DosenLogbookMonitorItem,
} from "../services/logbook-monitor-api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

function getDetailLinkKey(item: DosenLogbookMonitorItem) {
  return item.detailRouteKey || item.studentId || item.nim || item.id;
}

function getStatusBadge(status: DosenLogbookMonitorItem["status"]) {
  if (status === "APPROVED") {
    return (
      <Badge className="bg-green-600 hover:bg-green-600">
        Disetujui Mentor
      </Badge>
    );
  }
  if (status === "REJECTED") {
    return <Badge variant="destructive">Ditolak Mentor</Badge>;
  }
  return <Badge variant="secondary">Menunggu Review Mentor</Badge>;
}

export default function DosenLogbookMonitorPage() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logbooks, setLogbooks] = useState<DosenLogbookMonitorItem[]>([]);
  const [inactiveMentees, setInactiveMentees] = useState<DosenLogbookMonitorItem[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      const [logbookRes, inactiveRes] = await Promise.all([
        getDosenLogbookMonitorItems(),
        getInactiveMentees(),
      ]);

      if (logbookRes.success && logbookRes.data) {
        setLogbooks(logbookRes.data);
      } else {
        setErrorMessage(logbookRes.message || "Gagal memuat data logbook.");
      }

      if (inactiveRes.success && inactiveRes.data) {
        setInactiveMentees(inactiveRes.data);
      }

      setIsLoading(false);
    };

    loadData();
  }, []);

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Monitoring Logbook Mahasiswa
        </h1>
        <p className="text-sm text-muted-foreground">
          Halaman ini khusus pemantauan Dosen PA (read-only). Tidak ada aksi
          approve/reject.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Entri</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-3xl font-bold">{logbooks.length}</p>
            <BookMarked className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Mahasiswa Terpantau
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-3xl font-bold">
              {new Set(logbooks.map((i) => i.nim)).size}
            </p>
            <User className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">
              Mahasiswa Inaktif
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-3xl font-bold text-orange-700">
              {inactiveMentees.length}
            </p>
            <AlertCircle className="h-5 w-5 text-orange-600" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Status Read-Only
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <Badge variant="outline">Monitoring Saja</Badge>
            <Eye className="h-5 w-5 text-muted-foreground" />
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
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Aktivitas</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Detail</TableHead>
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
                          <TableCell className="font-medium">{item.studentName}</TableCell>
                          <TableCell>{item.nim}</TableCell>
                          <TableCell>{item.company}</TableCell>
                          <TableCell>
                            <div className="inline-flex items-center gap-1">
                              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                              {item.date}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">{item.activity}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
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
