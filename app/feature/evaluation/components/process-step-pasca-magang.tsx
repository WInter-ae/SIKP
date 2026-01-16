import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { 
  Eye, 
  FileText, 
  XCircle, 
  CheckCircle2, 
  Clock,
  AlertCircle,
  Upload as UploadIcon,
  Award
} from "lucide-react";

interface ProcessStepPascaMagangProps {
  title: string;
  description: string;
  status: "waiting" | "revisi_pending" | "revisi_uploaded" | "completed";
  revisiCount?: number;
  comment?: string;
  onAction?: () => void;
  actionText?: string;
  showNilai?: boolean;
  nilaiData?: {
    nilaiAkhir?: number;
    nilaiHuruf?: string;
    nilaiPembimbingLapangan?: number;
    nilaiLaporanKP?: number;
    nilaiPresentasi?: number;
    nilaiSidang?: number;
    dosenPenguji?: Array<{ nama: string; nip: string }>;
    tanggalPenilaian?: string;
  };
}

export function ProcessStepPascaMagang({
  title,
  description,
  status,
  revisiCount = 0,
  comment,
  onAction,
  actionText,
  showNilai,
  nilaiData,
}: ProcessStepPascaMagangProps) {
  const getStatusStyles = () => {
    switch (status) {
      case "waiting":
        return {
          bg: "bg-muted",
          border: "border-l-muted-foreground",
          iconBg: "bg-muted-foreground",
          iconComponent: <Clock className="h-6 w-6" />,
        };
      case "revisi_pending":
        return {
          bg: "bg-destructive/10",
          border: "border-l-destructive",
          iconBg: "bg-destructive",
          iconComponent: <AlertCircle className="h-7 w-7" />,
        };
      case "revisi_uploaded":
        return {
          bg: "bg-blue-50",
          border: "border-l-blue-500",
          iconBg: "bg-blue-500",
          iconComponent: <FileText className="h-7 w-7" />,
        };
      case "completed":
        return {
          bg: "bg-primary/10",
          border: "border-l-primary",
          iconBg: "bg-primary",
          iconComponent: <CheckCircle2 className="h-7 w-7" />,
        };
      default:
        return {
          bg: "bg-muted",
          border: "border-l-border",
          iconBg: "bg-muted-foreground",
          iconComponent: <Clock className="h-6 w-6" />,
        };
    }
  };

  const statusStyles = getStatusStyles();

  const getNilaiColor = (nilai?: number) => {
    if (!nilai) return "text-gray-600";
    if (nilai >= 85) return "text-green-600";
    if (nilai >= 70) return "text-blue-600";
    if (nilai >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  return (
    <div
      className={cn(
        "border-l-4 rounded-lg p-5 mb-4",
        statusStyles.bg,
        statusStyles.border
      )}
    >
      <div className="flex items-start">
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center text-primary-foreground mr-4 flex-shrink-0",
            statusStyles.iconBg
          )}
        >
          {statusStyles.iconComponent}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {revisiCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {revisiCount} Revisi
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mb-3">{description}</p>

          {comment && (
            <Alert variant="destructive" className="mb-3">
              <AlertDescription>
                <div className="font-medium mb-1">Catatan Revisi:</div>
                <div className="whitespace-pre-line">{comment}</div>
              </AlertDescription>
            </Alert>
          )}

          {showNilai && nilaiData && (
            <div className="bg-background p-4 rounded-lg border mb-3">
              <div className="flex items-center gap-2 mb-4">
                <Award className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Rincian Nilai Kerja Praktik</h4>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm">Pembimbing Lapangan</span>
                    <span className={`font-bold text-lg ${getNilaiColor(nilaiData.nilaiPembimbingLapangan)}`}>
                      {nilaiData.nilaiPembimbingLapangan || "-"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm">Laporan KP</span>
                    <span className={`font-bold text-lg ${getNilaiColor(nilaiData.nilaiLaporanKP)}`}>
                      {nilaiData.nilaiLaporanKP || "-"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm">Presentasi</span>
                    <span className={`font-bold text-lg ${getNilaiColor(nilaiData.nilaiPresentasi)}`}>
                      {nilaiData.nilaiPresentasi || "-"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm">Sidang</span>
                    <span className={`font-bold text-lg ${getNilaiColor(nilaiData.nilaiSidang)}`}>
                      {nilaiData.nilaiSidang || "-"}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
                    <span className="font-semibold">Nilai Akhir</span>
                    <div className="text-right">
                      <span className={`font-bold text-2xl ${getNilaiColor(nilaiData.nilaiAkhir)}`}>
                        {nilaiData.nilaiAkhir?.toFixed(2) || "-"}
                      </span>
                      {nilaiData.nilaiHuruf && (
                        <span className="ml-2 text-lg font-bold text-primary">
                          ({nilaiData.nilaiHuruf})
                        </span>
                      )}
                    </div>
                  </div>

                  {nilaiData.tanggalPenilaian && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Tanggal Penilaian</p>
                      <p className="font-medium">{formatDateTime(nilaiData.tanggalPenilaian)}</p>
                    </div>
                  )}

                  {nilaiData.dosenPenguji && nilaiData.dosenPenguji.length > 0 && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Dosen Penguji</p>
                      <div className="space-y-2">
                        {nilaiData.dosenPenguji.map((dosen, index) => (
                          <div key={index} className="text-sm">
                            <p className="font-medium">{dosen.nama}</p>
                            <p className="text-xs text-muted-foreground">NIP: {dosen.nip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {onAction && actionText && (
            <Button
              onClick={onAction}
              size="sm"
              className="mt-3"
            >
              {actionText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
