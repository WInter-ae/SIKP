import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  History,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";

interface TitleSubmissionFormProps {
  currentTitle?: string;
  currentDescription?: string;
  titleStatus?: "draft" | "diajukan" | "disetujui" | "ditolak" | "revisi";
  onSubmit: (data: { judulLaporan: string; deskripsi: string }) => void;
  disabled?: boolean;
  catatanDosen?: string;
  noCard?: boolean;
}

function TitleSubmissionForm({
  currentTitle = "",
  currentDescription = "",
  titleStatus = "draft",
  onSubmit,
  disabled = false,
  catatanDosen,
  noCard = false,
}: TitleSubmissionFormProps) {
  const [judulLaporan, setJudulLaporan] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [showComparison, setShowComparison] = useState(true);

  // Initial state for revision: input fields are empty or currentTitle?
  // User wants to compare, so we should probably start with empty or the current one.
  // Let's start with current but allow changes.
  useEffect(() => {
    if (titleStatus === "revisi" || titleStatus === "ditolak") {
      setJudulLaporan(currentTitle);
      setDeskripsi(currentDescription);
    } else {
      setJudulLaporan(currentTitle);
      setDeskripsi(currentDescription);
    }
  }, [currentTitle, currentDescription, titleStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (judulLaporan.trim() && deskripsi.trim()) {
      onSubmit({
        judulLaporan,
        deskripsi,
      });
    }
  };

  const getStatusBadge = () => {
    switch (titleStatus) {
      case "diajukan":
        return (
          <Alert className="mb-6 border-l-4 border-yellow-500 bg-yellow-50 shadow-sm">
            <Clock className="h-5 w-5 text-yellow-600" />
            <AlertDescription className="text-yellow-800 ml-2">
              <strong className="text-base">Menunggu Verifikasi</strong>
              <p className="text-sm opacity-90 mt-0.5">Judul sedang menunggu persetujuan dosen pembimbing.</p>
            </AlertDescription>
          </Alert>
        );
      case "disetujui":
        return (
          <Alert className="mb-6 border-l-4 border-green-600 bg-green-50 shadow-sm">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800 ml-2">
              <strong className="text-base">Judul Disetujui</strong>
              <p className="text-sm opacity-90 mt-0.5">Lanjutkan ke tahap pengesahan dan upload laporan.</p>
              {catatanDosen && (
                <div className="mt-3 p-3 bg-white/50 rounded-lg border border-green-200">
                  <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">Catatan Dosen</p>
                  <p className="text-sm italic">"{catatanDosen}"</p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        );
      case "revisi":
      case "ditolak":
        return (
          <Alert className="mb-6 border-l-4 border-orange-500 bg-yellow-100 shadow-md animate-pulse-slow">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            <AlertDescription className="text-yellow-950 ml-2">
              <strong className="text-lg">Perlu Revisi Judul</strong>
              <p className="font-medium mt-1">Dosen pembimbing meminta Anda memperbaiki judul laporan.</p>
              {catatanDosen && (
                <div className="mt-3 p-4 bg-white/80 rounded-xl border-2 border-orange-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2 text-orange-700">
                    <History className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Catatan Revisi Dosen</span>
                  </div>
                  <p className="text-base font-semibold leading-relaxed">"{catatanDosen}"</p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  const isFormDisabled = disabled || titleStatus === "disetujui" || titleStatus === "diajukan";
  const isRevision = titleStatus === "revisi" || titleStatus === "ditolak";

  const formContent = (
    <div className="space-y-8">
      {getStatusBadge()}

      {/* COMPARISON PANEL FOR REVISION */}
      {isRevision && showComparison && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Data Sebelum Revisi</Label>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[10px] uppercase font-bold h-7 hover:bg-orange-100 hover:text-orange-700"
              onClick={() => setShowComparison(false)}
            >
              <EyeOff className="w-3.5 h-3.5 mr-1.5" />
              Sembunyikan Pembanding
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-xl border border-dashed border-muted-foreground/30 relative">
              <Badge className="absolute -top-2.5 right-4 bg-muted-foreground/20 text-muted-foreground text-[10px] hover:bg-muted-foreground/20">JUDUL LAMA</Badge>
              <p className="text-sm font-medium leading-relaxed italic text-muted-foreground">
                {currentTitle}
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-xl border border-dashed border-muted-foreground/30 relative">
              <Badge className="absolute -top-2.5 right-4 bg-muted-foreground/20 text-muted-foreground text-[10px] hover:bg-muted-foreground/20">DESKRIPSI LAMA</Badge>
              <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3 italic">
                {currentDescription}
              </p>
            </div>
          </div>
        </div>
      )}

      {isRevision && !showComparison && (
        <div className="flex justify-center animate-in fade-in zoom-in-95 duration-300">
           <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowComparison(true)}
            className="rounded-full bg-orange-50 border-orange-200 text-orange-700 font-bold text-[10px] uppercase tracking-widest hover:bg-orange-100 shadow-sm"
           >
             <Eye className="w-3.5 h-3.5 mr-2" />
             Lihat Perbandingan Judul Lama
           </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="judulLaporan" className="text-base font-bold flex items-center gap-2">
            Judul Laporan (Bahasa Indonesia)
            <span className="text-red-500">*</span>
            {isRevision && <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">REVISI BARU</Badge>}
          </Label>
          <Textarea
            id="judulLaporan"
            value={judulLaporan}
            onChange={(e) => setJudulLaporan(e.target.value)}
            placeholder="Masukkan judul laporan Anda..."
            className="min-h-[100px] text-base focus-visible:ring-primary shadow-sm border-muted-foreground/20 rounded-xl"
            disabled={isFormDisabled}
            required
          />
          <p className="text-xs text-muted-foreground">
            Gunakan bahasa Indonesia yang baku dan deskriptif.
          </p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="deskripsi" className="text-base font-bold">
            Deskripsi Laporan <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="deskripsi"
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Jelaskan latar belakang, tujuan, dan output..."
            className="min-h-[150px] text-base focus-visible:ring-primary shadow-sm border-muted-foreground/20 rounded-xl"
            disabled={isFormDisabled}
            required
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Minimal 100 karakter untuk penjelasan yang komprehensif.
            </p>
            <span className={`text-[10px] font-bold ${deskripsi.length >= 100 ? 'text-green-600' : 'text-orange-500'}`}>
              {deskripsi.length} / 100 Karakter
            </span>
          </div>
        </div>

        {!isFormDisabled && (
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              size="lg"
              className="px-8 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
              disabled={judulLaporan.trim() === "" || deskripsi.trim().length < 100}
            >
              {isRevision ? (
                <>
                  Simpan & Ajukan Revisi
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              ) : (
                "Ajukan Judul"
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  );

  if (noCard) {
    return formContent;
  }

  return (
    <Card className="border-none shadow-2xl overflow-hidden bg-background">
      <div className="h-2 bg-primary" />
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          {isRevision ? "Revisi Judul Laporan" : "Detail Judul Laporan"}
        </CardTitle>
        <CardDescription className="text-base">
          {isRevision 
            ? "Bandingkan dan perbaiki judul Anda sesuai arahan dosen pembimbing."
            : "Lengkapi detail judul dan deskripsi laporan kerja praktik Anda."}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  );
}

export default TitleSubmissionForm;
