import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Input } from "~/components/ui/input";
import {
  Info,
  Search,
  Clock,
  CheckCircle,
  FileEdit,
  GraduationCap,
  Sparkles,
  LayoutDashboard
} from "lucide-react";
import type { PengajuanJudul } from "../types/title";
import TitleSubmissionCard from "../components/title-submission-card";
import {
  getTitleSubmissionsForLecturer,
  verifyTitleSubmission,
} from "../services/title-verification-api";

function LecturerTitleVerificationPage() {
  const [pengajuanList, setPengajuanList] = useState<PengajuanJudul[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("menunggu");
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState<{
    title: string;
    description: string;
    variant?: "default" | "destructive";
  } | null>(null);

  // Load data pengajuan
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      const response = await getTitleSubmissionsForLecturer();
      if (response.success && response.data) {
        setPengajuanList(response.data);
      } else {
        setPengajuanList([]);
        setNotification({
          title: "Informasi",
          description:
            response.message ||
            "Endpoint verifikasi judul belum tersedia di backend.",
        });
      }

      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleVerifikasi = (
    id: string,
    status: "disetujui" | "ditolak" | "revisi",
    catatan: string,
    revisedTitle?: string,
  ) => {
    const action =
      status === "disetujui"
        ? "APPROVE"
        : status === "ditolak"
          ? "REJECT"
          : "REVISE";

    verifyTitleSubmission(id, {
      action,
      notes: catatan,
      revisedTitle,
    }).then((response) => {
      if (!response.success) {
        setNotification({
          title: "Gagal Verifikasi",
          description:
            response.message || "Gagal mengirim verifikasi judul ke backend.",
          variant: "destructive",
        });
        setTimeout(() => setNotification(null), 4000);
        return;
      }

      setPengajuanList((prev) =>
        prev.map((p) => {
          if (p.id === id) {
            const newRevisi =
              status === "revisi"
                ? {
                    count: (p.revisi?.count || 0) + 1,
                    history: [
                      ...(p.revisi?.history || []),
                      {
                        tanggal: new Date().toISOString(),
                        catatan,
                      },
                    ],
                  }
                : p.revisi;

            return {
              ...p,
              status,
              tanggalVerifikasi: new Date().toISOString(),
              catatanDosen: catatan,
              data:
                status === "revisi" && revisedTitle
                  ? { ...p.data, judulLaporan: revisedTitle }
                  : p.data,
              revisi: newRevisi,
            };
          }
          return p;
        }),
      );

      const notificationMap = {
        disetujui: {
          title: "✅ Judul Disetujui",
          description:
            "Judul laporan telah disetujui. Mahasiswa akan menerima notifikasi.",
        },
        ditolak: {
          title: "❌ Judul Ditolak",
          description:
            "Judul laporan ditolak. Mahasiswa diminta untuk mengajukan judul baru.",
        },
        revisi: {
          title: "📝 Revisi Diperlukan",
          description:
            "Mahasiswa diminta untuk merevisi judul sesuai catatan yang diberikan.",
        },
      };

      setNotification(notificationMap[status]);
      setTimeout(() => setNotification(null), 4000);
    });
  };

  // Filter pengajuan berdasarkan status
  const pengajuanMenunggu = pengajuanList.filter(
    (p) => p.status === "diajukan",
  );
  const pengajuanDisetujui = pengajuanList.filter(
    (p) => p.status === "disetujui",
  );
  const pengajuanRevisi = pengajuanList.filter((p) => p.status === "revisi");

  // Filter berdasarkan search query
  const filterBySearch = (list: PengajuanJudul[]) => {
    if (!searchQuery.trim()) return list;

    const query = searchQuery.toLowerCase();
    return list.filter(
      (p) =>
        p.mahasiswa.nama.toLowerCase().includes(query) ||
        p.mahasiswa.nim.toLowerCase().includes(query) ||
        p.data.judulLaporan.toLowerCase().includes(query) ||
        p.data.tempatMagang.toLowerCase().includes(query),
    );
  };

  const filteredMenunggu = filterBySearch(pengajuanMenunggu);
  const filteredDisetujui = filterBySearch(pengajuanDisetujui);
  const filteredRevisi = filterBySearch(pengajuanRevisi);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-7xl mx-auto p-4 sm:p-6">
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground font-medium">
                Sinkronisasi data pengajuan...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="container max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-1">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dosen Pembimbing Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Verifikasi Judul Laporan
            </h1>
            <p className="text-slate-500 font-medium">
              Kelola dan arahkan kualitas laporan kerja praktik mahasiswa bimbingan Anda.
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

        {/* Notification */}
        {notification && (
          <Alert
            variant={notification.variant || "default"}
            className="border-none shadow-lg bg-white animate-in slide-in-from-top-4 duration-300 rounded-2xl"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${notification.variant === 'destructive' ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'}`}>
                <Info className="h-5 w-5" />
              </div>
              <AlertDescription className="font-medium text-slate-700">
                <strong className="block text-slate-900">{notification.title}</strong>
                {notification.description}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Stats Grid - Premium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-sm bg-white hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
            <div className="h-1.5 bg-yellow-500 w-full" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Menunggu</p>
                  <p className="text-4xl font-black text-slate-900 tracking-tight">{pengajuanMenunggu.length}</p>
                </div>
                <div className="p-4 rounded-2xl bg-yellow-50 group-hover:bg-yellow-500 group-hover:rotate-6 transition-all duration-300">
                  <Clock className="w-8 h-8 text-yellow-600 group-hover:text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
            <div className="h-1.5 bg-green-500 w-full" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Disetujui</p>
                  <p className="text-4xl font-black text-slate-900 tracking-tight">{pengajuanDisetujui.length}</p>
                </div>
                <div className="p-4 rounded-2xl bg-green-50 group-hover:bg-green-500 group-hover:rotate-6 transition-all duration-300">
                  <CheckCircle className="w-8 h-8 text-green-600 group-hover:text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
            <div className="h-1.5 bg-blue-500 w-full" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Revisi</p>
                  <p className="text-4xl font-black text-slate-900 tracking-tight">{pengajuanRevisi.length}</p>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50 group-hover:bg-blue-500 group-hover:rotate-6 transition-all duration-300">
                  <FileEdit className="w-8 h-8 text-blue-600 group-hover:text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-8">
          {/* Search Bar - Stylized */}
          <div className="relative group max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Cari Mahasiswa, NIM, atau Judul..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 bg-slate-50 border-slate-200 rounded-2xl focus-visible:ring-primary focus-visible:bg-white transition-all text-base font-medium"
            />
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-8"
          >
            <TabsList className="flex w-full sm:w-auto bg-slate-100/80 p-1.5 rounded-2xl">
              <TabsTrigger
                value="menunggu"
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all font-bold text-sm"
              >
                Menunggu
                {pengajuanMenunggu.length > 0 && (
                  <Badge className="ml-2 bg-primary text-white border-none text-[10px] h-5 min-w-[20px]">
                    {pengajuanMenunggu.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="disetujui" className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all font-bold text-sm">
                Disetujui
              </TabsTrigger>
              <TabsTrigger value="revisi" className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all font-bold text-sm">
                Revisi
              </TabsTrigger>
            </TabsList>

            {/* Menunggu Verifikasi */}
            <TabsContent value="menunggu" className="space-y-6 animate-in fade-in duration-500">
              {filteredMenunggu.length === 0 ? (
                <div className="text-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    {searchQuery ? "Pencarian Tidak Ditemukan" : "Antrian Bersih!"}
                  </h3>
                  <p className="text-slate-500 max-w-xs mx-auto">
                    {searchQuery ? "Coba gunakan kata kunci yang lebih spesifik." : "Semua pengajuan judul mahasiswa sudah Anda periksa."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {filteredMenunggu.map((pengajuan) => (
                    <TitleSubmissionCard
                      key={pengajuan.id}
                      pengajuan={pengajuan}
                      onVerifikasi={handleVerifikasi}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Other Tabs handled similarly by TitleSubmissionCard mapping... */}
            <TabsContent value="disetujui" className="space-y-6 animate-in fade-in duration-500">
               {filteredDisetujui.length === 0 ? (
                 <div className="text-center py-20 text-slate-400 font-medium">Belum ada pengajuan yang disetujui.</div>
               ) : (
                <div className="grid grid-cols-1 gap-6">
                  {filteredDisetujui.map((pengajuan) => (
                    <TitleSubmissionCard key={pengajuan.id} pengajuan={pengajuan} />
                  ))}
                </div>
               )}
            </TabsContent>

            <TabsContent value="revisi" className="space-y-6 animate-in fade-in duration-500">
               {filteredRevisi.length === 0 ? (
                 <div className="text-center py-20 text-slate-400 font-medium">Belum ada pengajuan yang memerlukan revisi.</div>
               ) : (
                <div className="grid grid-cols-1 gap-6">
                  {filteredRevisi.map((pengajuan) => (
                    <TitleSubmissionCard key={pengajuan.id} pengajuan={pengajuan} />
                  ))}
                </div>
               )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-8 bg-slate-900 rounded-3xl text-white shadow-xl shadow-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-bold tracking-wide uppercase">Sistem Informasi Kerja Praktik</span>
          </div>
          <div className="text-xs font-medium text-slate-400">
            © 2024 • Tim Pengembang SIKP
          </div>
        </div>
      </div>
    </div>
  );
}

export default LecturerTitleVerificationPage;
