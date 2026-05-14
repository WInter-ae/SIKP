import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle,
  Clock,
  Filter,
  ListOrdered,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import StatCard from "../../submission/components/stat-card";
import { 
  getKaprodiPendingVerifications, 
  verifyGradeByKaprodi,
  type KaprodiPendingVerification 
} from "../services/assessment-api";

export default function AssessmentKaprodiPage() {
  const [entries, setEntries] = useState<KaprodiPendingVerification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const response = await getKaprodiPendingVerifications();

      if (response.success && response.data) {
        setEntries(response.data);
      } else {
        toast.error(response.message || "Gagal memuat data verifikasi nilai.");
      }
    } catch (error) {
      console.error("Error loading verification data:", error);
      toast.error("Terjadi kesalahan saat memuat data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, []);

  const stats = useMemo(() => {
    const pending = entries.filter((e) => !e.isVerified).length;
    const verified = entries.filter((e) => e.isVerified).length;
    return [
      {
        title: "Menunggu Verifikasi",
        value: pending,
        icon: Clock,
        iconBgColor: "bg-amber-500",
      },
      {
        title: "Sudah Diverifikasi",
        value: verified,
        icon: CheckCircle,
        iconBgColor: "bg-green-600",
      },
      {
        title: "Total Mahasiswa",
        value: entries.length,
        icon: ListOrdered,
        iconBgColor: "bg-blue-600",
      },
    ];
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch =
        entry.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.nim.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || 
        (statusFilter === "pending" && !entry.isVerified) ||
        (statusFilter === "verified" && entry.isVerified);

      return matchesSearch && matchesStatus;
    });
  }, [entries, searchTerm, statusFilter]);

  const handleVerify = async (gradeId: string) => {
    try {
      const response = await verifyGradeByKaprodi(gradeId);
      if (response.success) {
        toast.success("Nilai berhasil diverifikasi.");
        await loadRequests();
      } else {
        toast.error(response.message || "Gagal memverifikasi nilai.");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem.");
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div className="relative pb-2">
            <h1 className="text-xl sm:text-3xl font-bold text-foreground">
              Verifikasi Nilai Mahasiswa (Kaprodi)
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Validasi hasil penilaian dari Dosen Pembimbing untuk laporan akhir
            </p>
            <div className="absolute bottom-0 left-0 h-1 w-20 bg-linear-to-r from-blue-600 via-yellow-300 to-red-500 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {stats.map((stat, i) => (
            <StatCard
              key={i}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              iconBgColor={stat.iconBgColor}
              className="shadow-sm border-none"
            />
          ))}
        </div>

        <Card className="shadow-sm border-none bg-muted/20">
          <CardContent className="p-4 flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
            <div className="flex-1 min-w-[250px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari nama mahasiswa atau NIM..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
                size="sm"
              >
                Semua
              </Button>
              <Button
                variant={statusFilter === "pending" ? "default" : "outline"}
                onClick={() => setStatusFilter("pending")}
                size="sm"
              >
                Menunggu
              </Button>
              <Button
                variant={statusFilter === "verified" ? "default" : "outline"}
                onClick={() => setStatusFilter("verified")}
                size="sm"
              >
                Selesai
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-none overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[100px]">NIM</TableHead>
                <TableHead>Nama Mahasiswa</TableHead>
                <TableHead>Instansi</TableHead>
                <TableHead className="text-center">Nilai Sidang</TableHead>
                <TableHead className="text-center">Nilai Gabungan</TableHead>
                <TableHead className="text-center">Grade</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Clock className="h-6 w-6 animate-spin" />
                      Memuat data...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8 opacity-20" />
                      Tidak ada data verifikasi yang ditemukan.
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs">{entry.nim}</TableCell>
                    <TableCell className="font-medium">{entry.studentName}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{entry.companyName}</TableCell>
                    <TableCell className="text-center font-semibold text-amber-700">{entry.academicScore}</TableCell>
                    <TableCell className="text-center font-bold text-blue-800">{entry.finalScore}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-bold border-blue-200 text-blue-700 bg-blue-50">
                        {entry.letterGrade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {entry.isVerified ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Terverifikasi
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-none">
                          <Clock className="h-3 w-3 mr-1" /> Menunggu
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!entry.isVerified && (
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                            onClick={() => handleVerify(entry.id)}
                          >
                            Verifikasi
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="text-muted-foreground" asChild>
                           <a href={`/assessment/recap/${entry.internshipId}`} target="_blank" rel="noreferrer">
                             <FileText className="h-4 w-4" />
                           </a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
