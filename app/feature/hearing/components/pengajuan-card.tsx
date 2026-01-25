import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Avatar } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import { Check, XCircle, Clock, Calendar, MapPin, FileText, User } from "lucide-react";
import type { PengajuanSidang } from "../types/dosen";
import { VerifikasiDialog } from "./verifikasi-dialog";

interface PengajuanCardProps {
  pengajuan: PengajuanSidang;
  onVerifikasi: (id: string, status: "approved" | "rejected", catatan: string, nilai?: number) => void;
}

export function PengajuanCard({ pengajuan, onVerifikasi }: PengajuanCardProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<"approved" | "rejected">("approved");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const handleApprove = () => {
    // Langsung setujui tanpa dialog
    onVerifikasi(pengajuan.id, "approved", "Pengajuan disetujui", undefined);
  };

  const handleReject = () => {
    setDialogType("rejected");
    setShowDialog(true);
  };

  const handleSubmitVerifikasi = (catatan: string, nilai?: number) => {
    onVerifikasi(pengajuan.id, dialogType, catatan, nilai);
    setShowDialog(false);
  };

  const getInitials = (nama: string) => {
    return nama
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <Card className="shadow-md hover:shadow-lg transition-shadow border-2">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Avatar className="h-12 w-12 bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                {getInitials(pengajuan.mahasiswa.nama)}
              </Avatar>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg mb-1">
                  {pengajuan.mahasiswa.nama}
                </CardTitle>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {pengajuan.mahasiswa.nim}
                  </span>
                  <span>•</span>
                  <span>{pengajuan.mahasiswa.prodi}</span>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="font-semibold">
              {pengajuan.status === "submitted" && "Menunggu Verifikasi"}
              {pengajuan.status === "approved" && (
                <span className="text-green-700 dark:text-green-400">✓ Disetujui</span>
              )}
              {pengajuan.status === "rejected" && (
                <span className="text-red-700 dark:text-red-400">✗ Ditolak</span>
              )}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          {/* Tampilkan info verifikasi jika sudah disetujui/ditolak */}
          {(pengajuan.status === "approved" || pengajuan.status === "rejected") && pengajuan.tanggalVerifikasi && (
            <>
              <div className={`p-4 rounded-lg border-2 ${
                pengajuan.status === "approved" 
                  ? "bg-green-50 border-green-200 dark:bg-green-950/20" 
                  : "bg-red-50 border-red-200 dark:bg-red-950/20"
              }`}>
                <div className="flex items-start gap-3">
                  {pengajuan.status === "approved" ? (
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 space-y-2">
                    <p className={`font-semibold ${
                      pengajuan.status === "approved" ? "text-green-900 dark:text-green-100" : "text-red-900 dark:text-red-100"
                    }`}>
                      {pengajuan.status === "approved" ? "Pengajuan Disetujui" : "Pengajuan Ditolak"}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {formatDateTime(pengajuan.tanggalVerifikasi)}
                      </span>
                    </div>
                    {pengajuan.catatanDosen && (
                      <div className="pt-2 border-t border-current opacity-30">
                        <p className="text-sm font-medium mb-1">Catatan:</p>
                        <p className="text-sm">{pengajuan.catatanDosen}</p>
                      </div>
                    )}
                    {pengajuan.nilaiAkhir && (
                      <div className="pt-2">
                        <span className="text-sm font-medium">Nilai: </span>
                        <span className="text-base font-bold">{pengajuan.nilaiAkhir}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Judul Laporan */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <FileText className="h-4 w-4" />
              Judul Laporan
            </div>
            <p className="text-base font-medium pl-6">{pengajuan.data.judulLaporan}</p>
          </div>

          <Separator />

          {/* Detail Sidang */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground">
              Detail Pelaksanaan Sidang
            </h4>
            <div className="grid gap-3 bg-muted p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Tempat</p>
                  <p className="font-medium">{pengajuan.data.tempatPelaksanaan}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Tanggal</p>
                  <p className="font-medium">{formatDate(pengajuan.data.tanggalSidang)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Waktu</p>
                  <p className="font-medium">
                    {formatTime(pengajuan.data.waktuMulai)} - {formatTime(pengajuan.data.waktuSelesai)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tanggal Pengajuan */}
          <div className="text-sm text-muted-foreground">
            Diajukan pada: {formatDate(pengajuan.tanggalPengajuan)}
          </div>

          <Separator />

          {/* Action Buttons - Hanya tampilkan jika masih submitted */}
          {pengajuan.status === "submitted" && (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={handleApprove}
                className="flex-1 h-11 font-semibold gap-2"
              >
                <Check className="h-5 w-5" />
                Setujui Pengajuan
              </Button>
              <Button
                onClick={handleReject}
                variant="destructive"
                className="flex-1 h-11 font-semibold gap-2"
              >
                <XCircle className="h-5 w-5" />
                Tolak Pengajuan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <VerifikasiDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        type={dialogType}
        mahasiswa={pengajuan.mahasiswa}
        onSubmit={handleSubmitVerifikasi}
      />
    </>
  );
}
