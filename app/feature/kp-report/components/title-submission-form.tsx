import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

interface TitleSubmissionFormProps {
  currentTitle?: string;
  titleStatus?: "draft" | "diajukan" | "disetujui" | "ditolak";
  onSubmit: (judul: string) => void;
  disabled?: boolean;
}

export default function TitleSubmissionForm({
  currentTitle = "",
  titleStatus = "draft",
  onSubmit,
  disabled = false,
}: TitleSubmissionFormProps) {
  const [judul, setJudul] = useState(currentTitle);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (judul.trim()) {
      onSubmit(judul);
    }
  };

  const getStatusBadge = () => {
    switch (titleStatus) {
      case "diajukan":
        return (
          <Alert className="mb-4 border-l-4 border-yellow-500 bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Judul sedang menunggu persetujuan dosen pembimbing
            </AlertDescription>
          </Alert>
        );
      case "disetujui":
        return (
          <Alert className="mb-4 border-l-4 border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Judul telah disetujui dosen pembimbing
            </AlertDescription>
          </Alert>
        );
      case "ditolak":
        return (
          <Alert className="mb-4 border-l-4 border-red-500 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Judul ditolak. Silakan ajukan judul baru atau perbaiki judul yang ada
            </AlertDescription>
          </Alert>
        );
      default:
        return (
          <Alert className="mb-4 border-l-4 border-blue-500 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Ajukan judul laporan KP untuk mendapatkan persetujuan dosen pembimbing
            </AlertDescription>
          </Alert>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengajuan Judul Laporan KP</CardTitle>
      </CardHeader>
      <CardContent>
        {getStatusBadge()}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="judul">Judul Laporan KP</Label>
            <Textarea
              id="judul"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Masukkan judul laporan Kerja Praktik..."
              className="min-h-[100px]"
              disabled={disabled || titleStatus === "disetujui"}
              required
            />
            <p className="text-sm text-muted-foreground">
              Judul harus jelas, spesifik, dan menggambarkan kegiatan KP yang dilakukan
            </p>
          </div>
          <Button
            type="submit"
            disabled={disabled || titleStatus === "disetujui" || !judul.trim()}
            className="w-full"
          >
            {titleStatus === "diajukan" ? "Ajukan Ulang Judul" : "Ajukan Judul"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
