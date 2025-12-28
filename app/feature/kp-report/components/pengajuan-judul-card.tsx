import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  FileText,
  Calendar,
  Building2,
  Users,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
} from "lucide-react";
import type { PengajuanJudul } from "../types/judul";
import VerifikasiJudulDialog from "./verifikasi-judul-dialog";

interface PengajuanJudulCardProps {
  pengajuan: PengajuanJudul;
  onVerifikasi?: (
    id: string,
    status: "disetujui" | "ditolak" | "revisi",
    catatan: string
  ) => void;
}

function PengajuanJudulCard({
  pengajuan,
  onVerifikasi,
}: PengajuanJudulCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleVerifikasi = (
    status: "disetujui" | "ditolak" | "revisi",
    catatan: string
  ) => {
    onVerifikasi?.(pengajuan.id, status, catatan);
    setIsDialogOpen(false);
  };

  const getStatusBadge = () => {
    switch (pengajuan.status) {
      case "diajukan":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" />
            Menunggu Verifikasi
          </Badge>
        );
      case "disetujui":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Disetujui
          </Badge>
        );
      case "ditolak":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            Ditolak
          </Badge>
        );
      case "revisi":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100">
            <FileText className="w-3 h-3 mr-1" />
            Perlu Revisi
          </Badge>
        );
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
    <>
      <Card className="hover:shadow-lg transition-all border-l-4 border-l-transparent hover:border-l-primary">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <CardTitle className="text-lg">{pengajuan.mahasiswa.nama}</CardTitle>
                {getStatusBadge()}
              </div>
              <CardDescription className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{pengajuan.mahasiswa.nim}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="text-xs sm:text-sm">{pengajuan.mahasiswa.prodi}</span>
                </div>
                {pengajuan.tim && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-3 h-3" />
                    <span>Tim: {pengajuan.tim.nama}</span>
                  </div>
                )}
              </CardDescription>
            </div>
            <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
              <p>Diajukan:</p>
              <p className="font-medium">{formatDate(pengajuan.tanggalPengajuan)}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Judul Laporan - Highlighted */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2 border">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Judul Laporan
                </p>
                <p className="font-semibold text-base leading-tight">
                  {pengajuan.data.judulLaporan}
                </p>
                {pengajuan.data.judulInggris && (
                  <p className="text-sm text-muted-foreground italic mt-2 leading-tight">
                    "{pengajuan.data.judulInggris}"
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Tempat Magang */}
            <div className="flex items-start gap-2">
              <Building2 className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  Tempat Magang
                </p>
                <p className="text-sm font-medium">{pengajuan.data.tempatMagang}</p>
              </div>
            </div>

            {/* Periode */}
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  Periode Magang
                </p>
                <p className="text-sm font-medium">
                  {formatDate(pengajuan.data.periode.mulai)} - {formatDate(pengajuan.data.periode.selesai)}
                </p>
              </div>
            </div>
          </div>

          {/* Deskripsi (preview) */}
          {!isDetailOpen && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Deskripsi
              </p>
              <p className="text-sm line-clamp-3 text-muted-foreground leading-relaxed">
                {pengajuan.data.deskripsi}
              </p>
            </div>
          )}

          {/* Detail lengkap */}
          {isDetailOpen && (
            <div className="space-y-4 pt-2 border-t">
              <div className="bg-background p-3 rounded-md border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Deskripsi Lengkap
                </p>
                <p className="text-sm leading-relaxed">{pengajuan.data.deskripsi}</p>
              </div>

              {pengajuan.data.metodologi && (
                <div className="bg-background p-3 rounded-md border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Metodologi
                  </p>
                  <p className="text-sm leading-relaxed">{pengajuan.data.metodologi}</p>
                </div>
              )}

              {pengajuan.data.teknologi && pengajuan.data.teknologi.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Teknologi yang Digunakan
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {pengajuan.data.teknologi.map((tech, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs font-medium">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {pengajuan.revisi && pengajuan.revisi.count > 0 && (
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 uppercase tracking-wide mb-3">
                    Riwayat Revisi ({pengajuan.revisi.count}x)
                  </p>
                  <div className="space-y-2">
                    {pengajuan.revisi.history.map((rev, idx) => (
                      <div
                        key={idx}
                        className="text-xs bg-white dark:bg-blue-900 p-3 rounded border border-blue-100 dark:border-blue-800 space-y-1"
                      >
                        <p className="text-muted-foreground font-medium">
                          {formatDate(rev.tanggal)}
                        </p>
                        <p className="text-sm">{rev.catatan}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Catatan Verifikasi */}
          {pengajuan.catatanDosen && (
            <div className={`p-4 rounded-lg border-l-4 space-y-2 ${
              pengajuan.status === 'disetujui' 
                ? 'bg-green-50 border-green-500 dark:bg-green-950' 
                : pengajuan.status === 'revisi'
                ? 'bg-blue-50 border-blue-500 dark:bg-blue-950'
                : 'bg-red-50 border-red-500 dark:bg-red-950'
            }`}>
              <p className="text-sm font-semibold flex items-center gap-2">
                {pengajuan.status === 'disetujui' ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : pengajuan.status === 'revisi' ? (
                  <FileText className="w-4 h-4 text-blue-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                Catatan Dosen
              </p>
              <p className="text-sm leading-relaxed pl-6">
                {pengajuan.catatanDosen}
              </p>
              {pengajuan.tanggalVerifikasi && (
                <p className="text-xs text-muted-foreground pl-6">
                  Diverifikasi: {formatDate(pengajuan.tanggalVerifikasi)}
                </p>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-wrap gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDetailOpen(!isDetailOpen)}
            className="flex-1 sm:flex-none"
          >
            <Eye className="w-4 h-4 mr-2" />
            {isDetailOpen ? "Sembunyikan" : "Lihat Detail"}
          </Button>

          {pengajuan.status === "diajukan" && (
            <Button 
              size="sm" 
              onClick={() => setIsDialogOpen(true)}
              className="flex-1 sm:flex-none"
            >
              Verifikasi Judul
            </Button>
          )}
        </CardFooter>
      </Card>

      <VerifikasiJudulDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        pengajuan={pengajuan}
        onSubmit={handleVerifikasi}
      />
    </>
  );
}

export default PengajuanJudulCard;
