import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Avatar } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import { CheckIcon } from "~/components/icons/check";
import { TimeCircleIcon } from "~/components/icons/time-circle";
import { Clock, Calendar, MapPin, FileText, User } from "lucide-react";
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

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const handleApprove = () => {
    setDialogType("approved");
    setShowDialog(true);
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
              Menunggu Verifikasi
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={handleApprove}
              className="flex-1 h-11 font-semibold gap-2"
            >
              <CheckIcon className="h-5 w-5" />
              Setujui Pengajuan
            </Button>
            <Button
              onClick={handleReject}
              variant="destructive"
              className="flex-1 h-11 font-semibold gap-2"
            >
              <TimeCircleIcon className="h-5 w-5" />
              Tolak Pengajuan
            </Button>
          </div>
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
