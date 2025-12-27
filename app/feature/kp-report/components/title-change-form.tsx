import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { CheckCircle2, Clock, XCircle, AlertTriangle } from "lucide-react";

interface TitleChangeFormProps {
  currentTitle: string;
  onSubmit: (judulBaru: string, alasan: string) => void;
  changeStatus?: "none" | "diajukan" | "disetujui" | "ditolak";
  disabled?: boolean;
}

export default function TitleChangeForm({
  currentTitle,
  onSubmit,
  changeStatus = "none",
  disabled = false,
}: TitleChangeFormProps) {
  const [judulBaru, setJudulBaru] = useState("");
  const [alasan, setAlasan] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (judulBaru.trim() && alasan.trim()) {
      onSubmit(judulBaru, alasan);
      setJudulBaru("");
      setAlasan("");
    }
  };

  const getStatusBadge = () => {
    switch (changeStatus) {
      case "diajukan":
        return (
          <Alert className="mb-4 border-l-4 border-yellow-500 bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Perubahan judul sedang menunggu persetujuan
            </AlertDescription>
          </Alert>
        );
      case "disetujui":
        return (
          <Alert className="mb-4 border-l-4 border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Perubahan judul telah disetujui
            </AlertDescription>
          </Alert>
        );
      case "ditolak":
        return (
          <Alert className="mb-4 border-l-4 border-red-500 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Perubahan judul ditolak. Silakan ajukan kembali dengan alasan yang lebih jelas
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengajuan Perubahan Judul</CardTitle>
      </CardHeader>
      <CardContent>
        {getStatusBadge()}
        
        <Alert className="mb-4 border-l-4 border-orange-500 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Perubahan judul memerlukan persetujuan dosen pembimbing
          </AlertDescription>
        </Alert>

        <div className="mb-4 p-4 bg-muted rounded-lg">
          <Label className="text-sm font-medium text-muted-foreground">Judul Saat Ini:</Label>
          <p className="mt-1 text-foreground">{currentTitle || "Belum ada judul"}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="judulBaru">Judul Baru</Label>
            <Textarea
              id="judulBaru"
              value={judulBaru}
              onChange={(e) => setJudulBaru(e.target.value)}
              placeholder="Masukkan judul baru..."
              className="min-h-[80px]"
              disabled={disabled || changeStatus === "diajukan"}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alasan">Alasan Perubahan</Label>
            <Textarea
              id="alasan"
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="Jelaskan alasan mengapa judul perlu diubah..."
              className="min-h-[100px]"
              disabled={disabled || changeStatus === "diajukan"}
              required
            />
            <p className="text-sm text-muted-foreground">
              Berikan alasan yang jelas dan valid untuk perubahan judul
            </p>
          </div>

          <Button
            type="submit"
            disabled={disabled || changeStatus === "diajukan" || !judulBaru.trim() || !alasan.trim()}
            className="w-full"
          >
            Ajukan Perubahan Judul
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
