import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { 
  FileCheck, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  User,
  FileText,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

interface ApprovalFormProps {
  reportTitle?: string;
  titleStatus?: "draft" | "diajukan" | "disetujui" | "ditolak";
  approvedDate?: string;
  lecturerName?: string;
  onGenerateLetter: () => void;
}

export default function ApprovalForm({
  reportTitle,
  titleStatus = "draft",
  approvedDate,
  lecturerName = "Dr. Ir. Ahmad Suhendra, M.Kom",
  onGenerateLetter,
}: ApprovalFormProps) {
  const isTitleApproved = titleStatus === "disetujui";

  const handleGenerate = () => {
    if (!isTitleApproved) {
      toast.error("Judul laporan harus disetujui terlebih dahulu!");
      return;
    }
    onGenerateLetter();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5" />
          Pengesahan Laporan KP
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Alert */}
        {!isTitleApproved && (
          <Alert className="border-l-4 border-yellow-500 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Judul laporan KP harus disetujui oleh dosen pembimbing sebelum dapat mengajukan pengesahan
            </AlertDescription>
          </Alert>
        )}

        {isTitleApproved && (
          <Alert className="border-l-4 border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Judul laporan KP telah disetujui. Anda dapat mengajukan surat pengesahan.
            </AlertDescription>
          </Alert>
        )}

        {/* Report Information */}
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Judul Laporan KP:
                  </span>
                </div>
                {reportTitle ? (
                  <p className="font-medium text-foreground">{reportTitle}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Belum ada judul yang diajukan
                  </p>
                )}
              </div>
              <div>
                {titleStatus === "disetujui" && (
                  <Badge className="bg-green-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Disetujui
                  </Badge>
                )}
                {titleStatus === "diajukan" && (
                  <Badge variant="outline" className="bg-yellow-50">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Menunggu
                  </Badge>
                )}
                {titleStatus === "ditolak" && (
                  <Badge variant="destructive">
                    Ditolak
                  </Badge>
                )}
              </div>
            </div>

            {isTitleApproved && (
              <>
                <div className="pt-3 border-t">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Dosen Pembimbing:
                    </span>
                  </div>
                  <p className="font-medium text-foreground">{lecturerName}</p>
                </div>

                {approvedDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Disetujui pada:{" "}
                      {new Date(approvedDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Information Box */}
        <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">
            Tentang Surat Pengesahan
          </h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>
                Surat pengesahan diperlukan untuk melanjutkan ke tahap sidang KP
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>
                Pastikan judul laporan sudah final dan disetujui oleh dosen pembimbing
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>
                Klik tombol di bawah untuk membuka sistem pengesahan eksternal
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>
                Login dengan akun Anda dan ikuti proses pengesahan di sistem OLS
              </span>
            </li>
          </ul>
        </div>

        {/* Generate Button */}
        <div className="pt-4">
          <Button
            onClick={handleGenerate}
            disabled={!isTitleApproved}
            size="lg"
            className="w-full"
          >
            <ExternalLink className="mr-2 h-5 w-5" />
            Buka Sistem Pengesahan
          </Button>
          {!isTitleApproved && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              Button akan aktif setelah judul laporan disetujui
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
