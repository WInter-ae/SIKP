import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  FileText,
  Calendar,
  Building2,
  CheckCircle,
  Clock,
  FileEdit,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  User,
  ExternalLink
} from "lucide-react";
import type { PengajuanJudul } from "../types/title";

interface TitleSubmissionCardProps {
  pengajuan: PengajuanJudul;
  onVerifikasi?: (
    id: string,
    status: "disetujui" | "ditolak" | "revisi",
    catatan: string,
    revisedTitle?: string,
  ) => void;
}

function TitleSubmissionCard({
  pengajuan,
  onVerifikasi,
}: TitleSubmissionCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isVerifikasiOpen, setIsVerifikasiOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<
    "disetujui" | "ditolak" | "revisi" | null
  >(null);
  const [catatan, setCatatan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmitVerifikasi = async () => {
    if (!selectedStatus) {
      setError("Pilih status verifikasi terlebih dahulu");
      return;
    }
    if (!catatan.trim()) {
      setError("Catatan verifikasi harus diisi");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      onVerifikasi?.(
        pengajuan.id,
        selectedStatus,
        catatan,
        undefined,
      );

      // Reset form
      setSelectedStatus(null);
      setCatatan("");
      setIsVerifikasiOpen(false);
    } catch (err) {
      setError("Terjadi kesalahan saat menyimpan verifikasi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelVerifikasi = () => {
    setSelectedStatus(null);
    setCatatan("");
    setError("");
    setIsVerifikasiOpen(false);
  };

  const getStatusBadge = () => {
    switch (pengajuan.status) {
      case "diajukan":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-200 hover:bg-yellow-500/20 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider">
            <Clock className="w-3 h-3 mr-1.5" />
            Menunggu
          </Badge>
        );
      case "disetujui":
        return (
          <Badge className="bg-green-500/10 text-green-700 border-green-200 hover:bg-green-500/20 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider">
            <CheckCircle className="w-3 h-3 mr-1.5" />
            Disetujui
          </Badge>
        );
      case "revisi":
      case "ditolak":
        return (
          <Badge className="bg-blue-500/10 text-blue-700 border-blue-200 hover:bg-blue-500/20 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider">
            <FileEdit className="w-3 h-3 mr-1.5" />
            Revisi
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Card className="border-none shadow-sm bg-white hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden group">
      <div className={`h-1.5 w-full ${pengajuan.status === 'disetujui' ? 'bg-green-500' : pengajuan.status === 'diajukan' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
      
      <CardHeader className="p-6 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <User className="w-6 h-6 text-slate-400" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{pengajuan.mahasiswa.nama}</h3>
                {getStatusBadge()}
              </div>
              <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
                <span>{pengajuan.mahasiswa.nim}</span>
                <span className="text-slate-300">•</span>
                <span>{pengajuan.mahasiswa.prodi || "Manajemen Informatika"}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Diajukan Pada</p>
             <p className="text-sm font-bold text-slate-700">{formatDate(pengajuan.tanggalPengajuan)}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-4 space-y-6">
        {/* Main Title Highlight */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 group-hover:bg-primary/5 group-hover:border-primary/10 transition-colors duration-300">
           <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-primary uppercase tracking-widest">Judul Laporan</p>
                 <p className="text-lg font-bold leading-tight text-slate-900">{pengajuan.data.judulLaporan}</p>
                 {pengajuan.data.judulInggris && (
                   <p className="text-sm text-slate-500 italic font-medium leading-snug pt-1">"{pengajuan.data.judulInggris}"</p>
                 )}
              </div>
           </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-xl">
                 <Building2 className="w-4 h-4 text-slate-500" />
              </div>
              <div className="space-y-0.5">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tempat Magang</p>
                 <p className="text-sm font-bold text-slate-700">{pengajuan.data.tempatMagang}</p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-xl">
                 <Calendar className="w-4 h-4 text-slate-500" />
              </div>
              <div className="space-y-0.5">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Periode Magang</p>
                 <p className="text-sm font-bold text-slate-700">
                    {formatDate(pengajuan.data.periode.mulai)} - {formatDate(pengajuan.data.periode.selesai)}
                 </p>
              </div>
           </div>
        </div>

        {/* Abstract/Description Toggle */}
        {!isDetailOpen && (
          <div className="pt-2">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Deskripsi Singkat</p>
             <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed font-medium">{pengajuan.data.deskripsi}</p>
          </div>
        )}

        {isDetailOpen && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300 pt-2">
             <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2">Abstrak Laporan</p>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">{pengajuan.data.deskripsi}</p>
             </div>
             
             {pengajuan.data.metodologi && (
               <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2">Metodologi & Teknologi</p>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">{pengajuan.data.metodologi}</p>
               </div>
             )}
          </div>
        )}

        {/* Verification History - If any */}
        {pengajuan.catatanDosen && (
          <div className={`p-5 rounded-2xl border-2 border-dashed ${pengajuan.status === 'disetujui' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
             <div className="flex items-center gap-2 mb-2">
                <CheckCircle className={`w-4 h-4 ${pengajuan.status === 'disetujui' ? 'text-green-600' : 'text-blue-600'}`} />
                <span className="text-xs font-black uppercase tracking-widest text-slate-900">Catatan Verifikasi Terakhir</span>
             </div>
             <p className="text-sm font-semibold text-slate-700 italic">"{pengajuan.catatanDosen}"</p>
             {pengajuan.tanggalVerifikasi && (
               <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Diverifikasi: {formatDate(pengajuan.tanggalVerifikasi)}</p>
             )}
          </div>
        )}

        {/* INLINE VERIFICATION FORM - Stylized */}
        {isVerifikasiOpen && pengajuan.status === "diajukan" && (
          <div className="pt-6 border-t border-slate-100 space-y-6 animate-in zoom-in-95 duration-300">
             <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-primary rounded-full" />
                <h4 className="font-black text-slate-900 tracking-tight">Keputusan Dosen Pembimbing</h4>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedStatus("disetujui")}
                  className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all duration-300 ${
                    selectedStatus === "disetujui" 
                    ? "bg-green-50 border-green-500 shadow-lg shadow-green-100 scale-105" 
                    : "bg-white border-slate-100 hover:border-green-300 hover:bg-green-50/30"
                  }`}
                >
                   <CheckCircle className={`w-8 h-8 mb-3 ${selectedStatus === 'disetujui' ? 'text-green-600' : 'text-slate-300'}`} />
                   <p className={`font-black text-sm uppercase tracking-widest ${selectedStatus === 'disetujui' ? 'text-green-900' : 'text-slate-500'}`}>Setujui</p>
                </button>

                <button
                  onClick={() => setSelectedStatus("revisi")}
                  className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all duration-300 ${
                    selectedStatus === "revisi" 
                    ? "bg-blue-50 border-blue-500 shadow-lg shadow-blue-100 scale-105" 
                    : "bg-white border-slate-100 hover:border-blue-300 hover:bg-blue-50/30"
                  }`}
                >
                   <FileEdit className={`w-8 h-8 mb-3 ${selectedStatus === 'revisi' ? 'text-blue-600' : 'text-slate-300'}`} />
                   <p className={`font-black text-sm uppercase tracking-widest ${selectedStatus === 'revisi' ? 'text-blue-900' : 'text-slate-500'}`}>Revisi</p>
                </button>
             </div>

             <div className="space-y-3">
                <Label className="text-xs font-black text-slate-900 uppercase tracking-widest">Catatan Untuk Mahasiswa</Label>
                <Textarea
                  placeholder="Berikan saran, instruksi revisi, atau apresiasi..."
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="min-h-[120px] bg-slate-50 border-slate-200 rounded-2xl focus-visible:bg-white focus-visible:ring-primary font-medium"
                />
             </div>

             {error && (
               <Alert variant="destructive" className="rounded-2xl border-none bg-red-50 text-red-900 font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
               </Alert>
             )}

             <div className="flex justify-end gap-3">
                <Button variant="ghost" className="font-bold uppercase tracking-widest text-xs" onClick={handleCancelVerifikasi} disabled={isSubmitting}>Batal</Button>
                <Button className="px-8 rounded-xl font-bold shadow-lg shadow-primary/20" onClick={handleSubmitVerifikasi} disabled={!selectedStatus || !catatan.trim() || isSubmitting}>
                   {isSubmitting ? "Memproses..." : "Simpan Keputusan"}
                </Button>
             </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-6 pt-0 flex gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDetailOpen(!isDetailOpen)}
          className="flex-1 sm:flex-none border-slate-200 font-bold rounded-xl"
        >
          {isDetailOpen ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
          {isDetailOpen ? "Sembunyikan" : "Detail Lengkap"}
        </Button>

        {pengajuan.status === "diajukan" && (
          <Button
            size="sm"
            onClick={() => setIsVerifikasiOpen(!isVerifikasiOpen)}
            className="flex-1 sm:flex-none bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Buka Verifikasi
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default TitleSubmissionCard;
