import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Info,
  Search,
  Clock,
  CheckCircle,
  FileX,
  FileText,
  Eye,
  LayoutDashboard,
  Sparkles,
  GraduationCap
} from "lucide-react";
import { toast } from "sonner";
import { getReportsForLecturer, verifyReport, type LaporanMahasiswa } from "../services/report-verification-api";

export default function LecturerReportVerificationPage() {
  const [reports, setReports] = useState<LaporanMahasiswa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("SUBMITTED");
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    const response = await getReportsForLecturer();
    if (response.success && response.data) {
      setReports(response.data);
    } else {
      toast.error(response.message || "Gagal memuat data laporan");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (id: string, action: "APPROVE" | "REJECT", reason?: string) => {
    const response = await verifyReport(id, { action, reason });
    if (response.success) {
      toast.success(action === "APPROVE" ? "Laporan disetujui" : "Laporan ditolak");
      loadData();
    } else {
      toast.error(response.message || "Gagal memproses verifikasi");
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesTab = r.status === activeTab;
    const matchesSearch = 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.studentNim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-1">
            <LayoutDashboard className="w-4 h-4" />
            <span>Dosen Pembimbing Dashboard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Verifikasi Laporan Akhir
          </h1>
          <p className="text-slate-500 font-medium">
            Tinjau dan verifikasi dokumen laporan akhir mahasiswa bimbingan Anda.
          </p>
        </div>
        <div className="flex items-center bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
          <div className="px-4 py-2 bg-primary/10 rounded-xl flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary uppercase">Sesi Aktif</span>
          </div>
          <span className="px-4 py-2 text-sm font-bold text-slate-700">2023/2024 Genap</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-8">
        <div className="relative group max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Cari Mahasiswa atau Perusahaan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 bg-slate-50 border-slate-200 rounded-2xl focus-visible:ring-primary focus-visible:bg-white transition-all text-base font-medium"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-slate-100/80 p-1.5 rounded-2xl">
            <TabsTrigger value="SUBMITTED" className="px-6 py-2.5 rounded-xl font-bold text-sm">Menunggu</TabsTrigger>
            <TabsTrigger value="APPROVED" className="px-6 py-2.5 rounded-xl font-bold text-sm">Disetujui</TabsTrigger>
            <TabsTrigger value="REJECTED" className="px-6 py-2.5 rounded-xl font-bold text-sm">Ditolak</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="grid grid-cols-1 gap-6">
            {filteredReports.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-500 font-medium">Tidak ada laporan untuk ditampilkan.</p>
              </div>
            ) : (
              filteredReports.map(report => (
                <Card key={report.id} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="space-y-4 flex-1">
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg">{report.studentName}</h3>
                          <p className="text-sm text-slate-500 font-medium">{report.studentNim}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-bold text-primary">{report.title}</p>
                          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-sm text-slate-600 italic line-clamp-2">{report.abstract || "Tidak ada abstrak."}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                           <div className="flex items-center gap-1.5">
                             <Clock className="w-3.5 h-3.5" />
                             <span>Upload: {new Date(report.submittedAt).toLocaleDateString('id-ID')}</span>
                           </div>
                           <div className="flex items-center gap-1.5">
                             <Info className="w-3.5 h-3.5" />
                             <span>Size: {(report.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                           </div>
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col gap-3 justify-end md:w-48">
                        <Button 
                          variant="outline" 
                          className="flex-1 md:flex-none h-11 rounded-xl font-bold gap-2"
                          onClick={() => window.open(report.fileUrl, '_blank')}
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </Button>
                        {report.status === "SUBMITTED" && (
                          <>
                            <Button 
                              className="flex-1 md:flex-none h-11 rounded-xl font-bold bg-green-600 hover:bg-green-700"
                              onClick={() => handleAction(report.id, "APPROVE")}
                            >
                              Approve
                            </Button>
                            <Button 
                              variant="destructive"
                              className="flex-1 md:flex-none h-11 rounded-xl font-bold"
                              onClick={() => {
                                const reason = prompt("Masukkan alasan penolakan/revisi:");
                                if (reason) handleAction(report.id, "REJECT", reason);
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-8 bg-slate-900 rounded-3xl text-white shadow-xl shadow-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <span className="text-sm font-bold tracking-wide uppercase">Sistem Informasi Kerja Praktik</span>
        </div>
        <div className="text-xs font-medium text-slate-400">© 2024 • Tim Pengembang SIKP</div>
      </div>
    </div>
  );
}
