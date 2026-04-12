import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { CheckCircle2, XCircle, Clock, AlertCircle, FileText } from "lucide-react";

interface TitleSubmissionFormProps {
  currentTitle?: string;
  titleStatus?: "draft" | "diajukan" | "disetujui" | "ditolak" | "revisi";
  onSubmit: (data: {
    judulLaporan: string;
    deskripsi: string;
  }) => void;
  disabled?: boolean;
  catatanDosen?: string;
}

function TitleSubmissionForm({
  currentTitle = "",
  titleStatus = "draft",
  onSubmit,
  disabled = false,
  catatanDosen,
}: TitleSubmissionFormProps) {
  const [judulLaporan, setJudulLaporan] = useState(currentTitle);
  const [deskripsi, setDeskripsi] = useState("");

  useEffect(() => {
    setJudulLaporan(currentTitle);
  }, [currentTitle]);

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
          <Alert className="mb-4 border-l-4 border-yellow-500 bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Menunggu Verifikasi</strong>
              <br />
              Judul sedang menunggu persetujuan dosen pembimbing
            </AlertDescription>
          </Alert>
        );
      case "disetujui":
        return (
          <Alert className="mb-4 border-l-4 border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Judul Disetujui</strong>
              <br />
              Judul telah disetujui dosen pembimbing. Anda dapat melanjutkan ke tahap berikutnya.
              {catatanDosen && (
                <div className="mt-2 p-2 bg-green-100 rounded">
                  <p className="text-sm font-medium">Catatan Dosen:</p>
                  <p className="text-sm">{catatanDosen}</p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        );
      case "revisi":
        return (
          <Alert className="mb-4 border-l-4 border-blue-500 bg-blue-50">
            <FileText className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Perlu Revisi</strong>
              <br />
              Dosen pembimbing meminta Anda melakukan revisi pada judul.
              {catatanDosen && (
                <div className="mt-2 p-2 bg-blue-100 rounded">
                  <p className="text-sm font-medium">Catatan Dosen:</p>
                  <p className="text-sm">{catatanDosen}</p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        );
      case "ditolak":
        return (
          <Alert className="mb-4 border-l-4 border-red-500 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Judul Ditolak</strong>
              <br />
              Silakan ajukan judul baru yang lebih sesuai.
              {catatanDosen && (
                <div className="mt-2 p-2 bg-red-100 rounded">
                  <p className="text-sm font-medium">Catatan Dosen:</p>
                  <p className="text-sm">{catatanDosen}</p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        );
      default:
        return (
          <Alert className="mb-4 border-l-4 border-blue-500 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Pengajuan Judul</strong>
              <br />
              Lengkapi formulir di bawah untuk mengajukan judul laporan KP Anda.
            </AlertDescription>
          </Alert>
        );
    }
  };

  const isFormDisabled = disabled || titleStatus === "disetujui";
  const canSubmit =
    titleStatus === "draft" || titleStatus === "ditolak" || titleStatus === "revisi";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Pengajuan Judul Laporan KP
        </CardTitle>
        <CardDescription>
          Lengkapi formulir pengajuan judul laporan dengan detail yang jelas dan spesifik
        </CardDescription>
      </CardHeader>
      <CardContent>
        {getStatusBadge()}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="judulLaporan" className="text-base font-semibold">
              Judul Laporan (Bahasa Indonesia) <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="judulLaporan"
              value={judulLaporan}
              onChange={(e) => setJudulLaporan(e.target.value)}
              placeholder="Contoh: Sistem Informasi Manajemen Perpustakaan Berbasis Web dengan Teknologi React dan Node.js"
              className="min-h-[100px]"
              disabled={isFormDisabled}
              required
            />
            <p className="text-sm text-muted-foreground">
              Judul harus jelas, spesifik, dan menggambarkan kegiatan KP yang dilakukan
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi" className="text-base font-semibold">
              Deskripsi Laporan <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="deskripsi"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Jelaskan secara singkat tentang proyek yang dikerjakan, tujuan, dan hasil yang diharapkan..."
              className="min-h-[120px]"
              disabled={isFormDisabled}
              required
            />
            <p className="text-sm text-muted-foreground">
              Minimal 100 karakter. Jelaskan latar belakang, tujuan, dan output dari pekerjaan KP
            </p>
          </div>

          {canSubmit && (
            <div className="flex justify-end">
              <Button type="submit" disabled={isFormDisabled || !judulLaporan.trim() || !deskripsi.trim()}>
                Ajukan Judul
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

export default TitleSubmissionForm;
