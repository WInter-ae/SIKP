import { FileCheck, Clock, CheckCircle, XCircle, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import type { BeritaAcara, DosenPenguji } from "../types";

interface BeritaAcaraStatusProps {
  beritaAcara: BeritaAcara;
  dosenPenguji?: DosenPenguji[];
  onGenerateSurat?: () => void;
  onEdit?: () => void;
}

const statusConfig = {
  draft: {
    label: "Draft",
    icon: FileText,
    color: "bg-gray-500",
    badgeVariant: "secondary" as const,
  },
  submitted: {
    label: "Diajukan",
    icon: Clock,
    color: "bg-blue-500",
    badgeVariant: "default" as const,
  },
  approved: {
    label: "Disetujui",
    icon: CheckCircle,
    color: "bg-green-500",
    badgeVariant: "default" as const,
  },
  rejected: {
    label: "Ditolak",
    icon: XCircle,
    color: "bg-red-500",
    badgeVariant: "destructive" as const,
  },
};

export function BeritaAcaraStatus({
  beritaAcara,
  dosenPenguji,
  onGenerateSurat,
  onEdit,
}: BeritaAcaraStatusProps) {
  const status = statusConfig[beritaAcara.status];
  const StatusIcon = status.icon;

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

  return (
    <Card className="shadow-lg border-2">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <FileCheck className="h-6 w-6" />
              Status Berita Acara
            </CardTitle>
            <CardDescription className="text-base">
              Informasi pengajuan berita acara sidang Anda
            </CardDescription>
          </div>
          <Badge variant={status.badgeVariant} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold">
            <StatusIcon className="h-4 w-4" />
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Detail Sidang */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-primary"></div>
            Detail Sidang
          </h3>
          <div className="grid gap-4 bg-muted p-4 rounded-lg">
            <div className="flex flex-col space-y-1.5">
              <span className="text-sm font-semibold text-muted-foreground">
                Judul Laporan
              </span>
              <span className="font-medium text-base">{beritaAcara.judulLaporan}</span>
            </div>
            <div className="flex flex-col space-y-1.5">
              <span className="text-sm font-semibold text-muted-foreground">
                Tempat Pelaksanaan
              </span>
              <span className="font-medium text-base">{beritaAcara.tempatPelaksanaan}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col space-y-1.5">
                <span className="text-sm font-semibold text-muted-foreground">
                  Tanggal
                </span>
                <span className="font-medium text-base">
                  {formatDate(beritaAcara.tanggalSidang)}
                </span>
              </div>
              <div className="flex flex-col space-y-1.5">
                <span className="text-sm font-semibold text-muted-foreground">
                  Waktu Mulai
                </span>
                <span className="font-medium text-base">{formatTime(beritaAcara.waktuMulai)}</span>
              </div>
              <div className="flex flex-col space-y-1.5">
                <span className="text-sm font-semibold text-muted-foreground">
                  Waktu Selesai
                </span>
                <span className="font-medium text-base">{formatTime(beritaAcara.waktuSelesai)}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Dosen Penguji */}
        {dosenPenguji && dosenPenguji.length > 0 && (
          <>
            <div className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary"></div>
                Dosen Penguji
              </h3>
              <div className="space-y-3">
                {dosenPenguji.map((dosen) => (
                  <div
                    key={dosen.id}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg border hover:shadow-md transition-shadow"
                  >
                    <div>
                      <p className="font-semibold text-base">{dosen.nama}</p>
                      <p className="text-sm text-muted-foreground">NIP: {dosen.nip}</p>
                    </div>
                    <Badge variant="outline" className="capitalize font-semibold">
                      {dosen.jabatan}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Hasil Penilaian (jika disetujui) */}
        {beritaAcara.status === "approved" && beritaAcara.nilaiAkhir && (
          <>
            <div className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary"></div>
                Hasil Penilaian
              </h3>
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/30 rounded-lg p-5 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-primary">
                    Nilai Akhir:
                  </span>
                  <span className="text-3xl font-bold text-primary">
                    {beritaAcara.nilaiAkhir}
                  </span>
                </div>
                {beritaAcara.catatanDosen && (
                  <div className="mt-4 pt-4 border-t-2 border-primary/20">
                    <p className="text-sm font-semibold text-primary mb-2">
                      Catatan Dosen:
                    </p>
                    <p className="text-sm text-muted-foreground">{beritaAcara.catatanDosen}</p>
                  </div>
                )}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Catatan Penolakan */}
        {beritaAcara.status === "rejected" && beritaAcara.catatanDosen && (
          <>
            <div className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-destructive"></div>
                Alasan Penolakan
              </h3>
              <div className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-2 border-destructive/30 rounded-lg p-5 shadow-md">
                <p className="text-sm text-muted-foreground">{beritaAcara.catatanDosen}</p>
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {(beritaAcara.status === "draft" || beritaAcara.status === "rejected") && onEdit && (
            <Button variant="outline" onClick={onEdit} className="w-full sm:w-auto h-11 font-semibold">
              Edit Berita Acara
            </Button>
          )}
          {beritaAcara.status === "approved" && onGenerateSurat && (
            <Button
              onClick={onGenerateSurat}
              className="w-full sm:w-auto h-11 font-semibold shadow-md hover:shadow-lg transition-shadow"
            >
              <FileText className="h-5 w-5 mr-2" />
              Generate Surat Berita Acara
            </Button>
          )}
          {beritaAcara.status === "submitted" && (
            <div className="w-full sm:w-auto p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-2 border-blue-300 dark:border-blue-700 rounded-lg shadow-md">
              <p className="text-sm text-center font-semibold text-blue-700 dark:text-blue-300">
                ⏳ Menunggu persetujuan dari dosen pembimbing
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
