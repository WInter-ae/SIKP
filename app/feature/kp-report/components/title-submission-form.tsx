import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { CheckCircle2, XCircle, Clock, AlertCircle, FileText, Plus, X } from "lucide-react";

interface TitleSubmissionFormProps {
  currentTitle?: string;
  titleStatus?: "draft" | "diajukan" | "disetujui" | "ditolak" | "revision";
  onSubmit: (data: {
    judulLaporan: string;
    judulInggris: string;
    deskripsi: string;
    metodologi: string;
    teknologi: string[];
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
  const [judulInggris, setJudulInggris] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [metodologi, setMetodologi] = useState("");
  const [teknologi, setTeknologi] = useState<string[]>([]);
  const [newTech, setNewTech] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (judulLaporan.trim() && deskripsi.trim()) {
      onSubmit({
        judulLaporan,
        judulInggris,
        deskripsi,
        metodologi,
        teknologi,
      });
    }
  };

  const addTechnology = () => {
    if (newTech.trim() && !teknologi.includes(newTech.trim())) {
      setTeknologi([...teknologi, newTech.trim()]);
      setNewTech("");
    }
  };

  const removeTechnology = (tech: string) => {
    setTeknologi(teknologi.filter((t) => t !== tech));
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
      case "revision":
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
  const canSubmit = titleStatus === "draft" || titleStatus === "ditolak" || titleStatus === "revision";

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
          {/* Judul Bahasa Indonesia */}
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

          {/* Judul Bahasa Inggris */}
          <div className="space-y-2">
            <Label htmlFor="judulInggris" className="text-base font-semibold">
              Judul Laporan (Bahasa Inggris)
            </Label>
            <Textarea
              id="judulInggris"
              value={judulInggris}
              onChange={(e) => setJudulInggris(e.target.value)}
              placeholder="Example: Web-Based Library Management Information System Using React and Node.js Technology"
              className="min-h-[100px]"
              disabled={isFormDisabled}
            />
            <p className="text-sm text-muted-foreground">
              Opsional, tetapi direkomendasikan untuk laporan yang baik
            </p>
          </div>

          {/* Deskripsi */}
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

          {/* Metodologi */}
          <div className="space-y-2">
            <Label htmlFor="metodologi" className="text-base font-semibold">
              Metodologi Pengembangan
            </Label>
            <Textarea
              id="metodologi"
              value={metodologi}
              onChange={(e) => setMetodologi(e.target.value)}
              placeholder="Contoh: Pengembangan menggunakan metode Agile dengan sprint 2 minggu, meliputi tahap analisis, desain, implementasi, dan testing..."
              className="min-h-[100px]"
              disabled={isFormDisabled}
            />
            <p className="text-sm text-muted-foreground">
              Jelaskan metode atau pendekatan yang digunakan dalam pengerjaan proyek
            </p>
          </div>

          {/* Teknologi */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">
              Teknologi yang Digunakan
            </Label>
            <div className="flex gap-2">
              <Input
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                placeholder="Contoh: React, Node.js, PostgreSQL"
                disabled={isFormDisabled}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTechnology();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addTechnology}
                disabled={isFormDisabled || !newTech.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {teknologi.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {teknologi.map((tech, idx) => (
                  <Badge key={idx} variant="secondary" className="text-sm">
                    {tech}
                    {!isFormDisabled && (
                      <button
                        type="button"
                        onClick={() => removeTechnology(tech)}
                        className="ml-2 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Tekan Enter atau klik tombol + untuk menambahkan teknologi
            </p>
          </div>

          {/* Submit Button */}
          {canSubmit && (
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isFormDisabled || !judulLaporan.trim() || !deskripsi.trim()}
                className="w-full"
                size="lg"
              >
                {titleStatus === "revision" 
                  ? "Ajukan Revisi Judul"
                  : titleStatus === "ditolak"
                  ? "Ajukan Judul Baru"
                  : "Ajukan Judul Laporan"}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

export default TitleSubmissionForm;
