import { useMemo, useState } from "react";
import { BookMarked, CalendarDays, Eye, Search, User } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

interface DosenLogbookItem {
  id: string;
  studentName: string;
  nim: string;
  company: string;
  date: string;
  activity: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  mentorName?: string;
}

const MOCK_LOGBOOKS: DosenLogbookItem[] = [
  {
    id: "lb-1",
    studentName: "Budi Santoso",
    nim: "2021110001",
    company: "PT. Teknologi Nusantara",
    date: "2026-03-11",
    activity: "Implementasi modul autentikasi",
    status: "APPROVED",
    mentorName: "Ahmad Fauzi",
  },
  {
    id: "lb-2",
    studentName: "Dewi Lestari",
    nim: "2021110002",
    company: "CV. Digital Kreatif",
    date: "2026-03-12",
    activity: "Perancangan API dashboard monitoring",
    status: "PENDING",
    mentorName: "Siti Nurhaliza",
  },
  {
    id: "lb-3",
    studentName: "Andi Wijaya",
    nim: "2021110003",
    company: "Startup Indonesia Tech",
    date: "2026-03-12",
    activity: "Revisi dokumentasi dan deployment",
    status: "REJECTED",
    mentorName: "Budi Hartono",
  },
];

function getStatusBadge(status: DosenLogbookItem["status"]) {
  if (status === "APPROVED") {
    return <Badge className="bg-green-600 hover:bg-green-600">Disetujui Mentor</Badge>;
  }
  if (status === "REJECTED") {
    return <Badge variant="destructive">Ditolak Mentor</Badge>;
  }
  return <Badge variant="secondary">Menunggu Review Mentor</Badge>;
}

export default function DosenLogbookMonitorPage() {
  const [query, setQuery] = useState("");

  const filteredLogbooks = useMemo(() => {
    const keyword = query.toLowerCase().trim();
    if (!keyword) return MOCK_LOGBOOKS;

    return MOCK_LOGBOOKS.filter((item) => {
      return (
        item.studentName.toLowerCase().includes(keyword) ||
        item.nim.toLowerCase().includes(keyword) ||
        item.company.toLowerCase().includes(keyword) ||
        item.activity.toLowerCase().includes(keyword)
      );
    });
  }, [query]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Monitoring Logbook Mahasiswa</h1>
        <p className="text-sm text-muted-foreground">
          Halaman ini khusus pemantauan Dosen PA (read-only). Tidak ada aksi approve/reject.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Entri</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-3xl font-bold">{MOCK_LOGBOOKS.length}</p>
            <BookMarked className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mahasiswa Terpantau</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-3xl font-bold">
              {new Set(MOCK_LOGBOOKS.map((i) => i.nim)).size}
            </p>
            <User className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status Read-Only</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <Badge variant="outline">Monitoring Saja</Badge>
            <Eye className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Logbook</CardTitle>
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari mahasiswa, NIM, perusahaan, aktivitas..."
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mahasiswa</TableHead>
                  <TableHead>NIM</TableHead>
                  <TableHead>Perusahaan</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Aktivitas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Mentor</TableHead>
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
                      <TableCell className="max-w-[320px] truncate">{item.activity}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>{item.mentorName || "-"}</TableCell>
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
