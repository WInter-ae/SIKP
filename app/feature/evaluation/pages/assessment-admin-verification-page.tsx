import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle,
  Clock,
  Search,
  Users,
  Award,
  TrendingUp,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { getAdminPendingVerifications, verifyGradeByAdmin } from "../../during-intern/services/assessment-api";

export default function AssessmentAdminVerificationPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    try {
      setIsLoading(true);
      const response = await getAdminPendingVerifications();
      if (response.success && response.data) {
        setEntries(response.data);
      } else {
        toast.error(response.message || "Gagal memuat data verifikasi.");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat memuat data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) =>
      entry.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.nim.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [entries, searchTerm]);

  const handleVerify = async (gradeId: string) => {
    try {
      const response = await verifyGradeByAdmin(gradeId);
      if (response.success) {
        toast.success("Nilai berhasil diverifikasi.");
        setEntries((prev) => prev.filter((e) => e.id !== gradeId));
      } else {
        toast.error(response.message || "Gagal memverifikasi nilai.");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat verifikasi.");
    }
  };

  const stats = useMemo(() => {
    return [
      {
        title: "Menunggu Verifikasi",
        value: entries.length,
        icon: Clock,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
      },
      {
        title: "Total Mahasiswa",
        value: entries.length, // Only pending shown here
        icon: Users,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
    ];
  }, [entries]);

  return (
    <div className="p-6 space-y-8 bg-gray-50/50 min-h-screen">
      <div className="relative pb-4">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Verifikasi Nilai Gabungan
        </h1>
        <p className="text-muted-foreground mt-1 font-medium">
          Tinjau dan setujui rekapitulasi nilai akhir (Mentor + Dosen PA) mahasiswa
        </p>
        <div className="absolute bottom-0 left-0 h-1.5 w-24 bg-linear-to-r from-blue-600 to-indigo-400 rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} className="border-none shadow-sm ring-1 ring-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-black text-gray-900">
                    {isLoading ? "..." : stat.value}
                  </p>
                </div>
                <div className={`p-4 rounded-2xl ${stat.bgColor}`}>
                  <stat.icon className={`h-7 w-7 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-xl ring-1 ring-gray-200 overflow-hidden bg-white">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600" />
              Daftar Nilai Menunggu Persetujuan
            </CardTitle>
            <div className="w-full md:w-80 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari mahasiswa atau NIM..."
                className="pl-10 bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="hover:bg-transparent border-gray-100">
                <TableHead className="font-bold text-gray-700 py-4">Mahasiswa</TableHead>
                <TableHead className="font-bold text-gray-700">Program Studi</TableHead>
                <TableHead className="font-bold text-gray-700 text-center">Skor Akhir</TableHead>
                <TableHead className="font-bold text-gray-700 text-center">Grade</TableHead>
                <TableHead className="font-bold text-gray-700">Status Kaprodi</TableHead>
                <TableHead className="font-bold text-gray-700 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground font-medium">
                    <div className="flex flex-col items-center gap-2">
                      <Clock className="h-8 w-8 animate-spin text-blue-500" />
                      Memuat data...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground font-medium">
                    Tidak ada data penilaian yang menunggu verifikasi.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-blue-50/30 transition-colors border-gray-100">
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{entry.studentName}</span>
                        <span className="text-xs text-muted-foreground font-medium">{entry.nim}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 font-medium">{entry.prodi}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-black text-blue-700">{entry.finalScore}</span>
                        <div className="w-12 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                           <div className="h-full bg-blue-500" style={{ width: `${entry.finalScore}%` }} />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none font-black text-sm px-3">
                        {entry.letterGrade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {entry.isVerifiedByKaprodi ? (
                        <Badge className="bg-green-100 text-green-700 border-none font-bold">
                          Terverifikasi Kaprodi
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700 border-none font-bold">
                          Menunggu Kaprodi
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => handleVerify(entry.id)}
                        className="bg-blue-600 hover:bg-blue-700 font-bold shadow-md shadow-blue-200 rounded-xl"
                        size="sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verifikasi
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
