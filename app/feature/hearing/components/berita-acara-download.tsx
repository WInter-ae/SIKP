import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { 
  Download, 
  FileText, 
  CheckCircle, 
  Calendar,
  Clock,
  MapPin,
  XCircle,
  Printer
} from "lucide-react";
import type { BeritaAcara } from "../types";
import { downloadBeritaAcaraHTML } from "../utils/berita-acara-template";

interface BeritaAcaraDownloadProps {
  beritaAcara: BeritaAcara;
  mahasiswa?: {
    nama: string;
    nim: string;
    programStudi: string;
  };
  isPreview?: boolean;
}

export function BeritaAcaraDownload({ 
  beritaAcara, 
  mahasiswa = {
    nama: "Budi Santoso",
    nim: "12345001",
    programStudi: "Teknik Informatika"
  },
  isPreview = false
}: BeritaAcaraDownloadProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleDownload = async (format: "pdf" | "docx") => {
    if (format === "pdf") {
      downloadBeritaAcaraHTML(beritaAcara, mahasiswa);
    } else if (format === "docx") {
      try {
        const { generateBeritaAcaraDOCX } = await import("../utils/generate-berita-acara");
        await generateBeritaAcaraDOCX(beritaAcara, mahasiswa);
      } catch (error) {
        console.error("Error generating DOCX:", error);
        alert("Gagal mengunduh DOCX. Silakan coba lagi.");
      }
    }
  };

  const isApproved = beritaAcara.status === "approved";
  const isPreviewApproved = beritaAcara.status === "jadwal_approved";
  const isRejected = beritaAcara.status === "rejected";

  return (
    <div className="space-y-6">
      {/* Alert Status */}
      {isApproved && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <AlertDescription className="text-green-800">
            <p className="font-semibold">Berita Acara Telah Disetujui</p>
            <p className="text-sm mt-1">
              Berita acara sidang Anda telah ditandatangani oleh dosen pembimbing dan siap diunduh.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {isRejected && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800">
            <p className="font-semibold">Pengajuan Sidang Ditolak</p>
            <p className="text-sm mt-1">
              Pengajuan sidang Anda ditolak oleh dosen pembimbing. Silakan perbaiki dan ajukan kembali.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Single Document Card */}
      <Card className={`shadow-lg border-2 ${(isApproved || isPreviewApproved) ? 'border-green-200' : isRejected ? 'border-red-200' : 'border-gray-200'}`}>
        <CardHeader className={`${(isApproved || isPreviewApproved) ? 'bg-green-50' : isRejected ? 'bg-red-50' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Berita Acara Sidang
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Dokumen Resmi Pelaksanaan Sidang Kerja Praktik
              </p>
            </div>
            {isApproved && (
              <Badge className="bg-green-600">
                Ditandatangani
              </Badge>
            )}
            {isRejected && (
              <Badge variant="destructive">
                Ditolak
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          {/* Document Details */}
          <div>
            <div className="flex items-start gap-2 mb-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-1" />
              <span className="text-sm text-muted-foreground">Judul Laporan</span>
            </div>
            <p className="font-semibold">{beritaAcara.judulLaporan}</p>
          </div>

          <div>
            <div className="flex items-start gap-2 mb-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
              <span className="text-sm text-muted-foreground">Tempat Pelaksanaan</span>
            </div>
            <p className="font-medium">{beritaAcara.tempatPelaksanaan}</p>
          </div>

          <div>
            <div className="flex items-start gap-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
              <span className="text-sm text-muted-foreground">Tanggal Sidang</span>
            </div>
            <p className="font-medium">{formatDate(beritaAcara.tanggalSidang)}</p>
          </div>

          <div>
            <div className="flex items-start gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground mt-1" />
              <span className="text-sm text-muted-foreground">Waktu Pelaksanaan</span>
            </div>
            <p className="font-medium">
              {beritaAcara.waktuMulai} - {beritaAcara.waktuSelesai}
            </p>
          </div>

          {/* Catatan Penolakan - Only show if rejected */}
          {isRejected && beritaAcara.catatanDosen && (
            <div className="pt-4 border-t">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex gap-2 mb-2">
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="font-semibold text-red-900">Alasan Penolakan:</p>
                </div>
                <p className="text-sm text-red-800 ml-7">{beritaAcara.catatanDosen}</p>
              </div>
            </div>
          )}

          {/* Download Section - Only show if approved */}
          {(isApproved || isPreviewApproved) && (
            <>
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3">Unduh Dokumen</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleDownload("pdf")}
                    className="h-12 gap-2 font-semibold"
                  >
                    <Printer className="h-5 w-5" />
                    Print / Unduh PDF
                  </Button>
                  <Button
                    onClick={() => handleDownload("docx")}
                    className="h-12 gap-2 font-semibold"
                    variant="outline"
                  >
                    <Download className="h-5 w-5" />
                    Unduh DOCX
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Dokumen ini telah ditandatangani secara digital dan memiliki kekuatan hukum yang sah
                </p>
              </div>

              {/* Catatan Penting - Inside the same card */}
              <div className="pt-4 border-t">
                <div className="flex gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold">Catatan Penting:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Simpan dokumen ini sebagai bukti pelaksanaan sidang</li>
                      <li>Dokumen dapat diunduh kapan saja melalui menu Arsip</li>
                      <li>Jika ada pertanyaan, hubungi dosen pembimbing Anda</li>
                      <li>Dokumen ini diperlukan untuk proses wisuda</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Catatan Penting untuk Rejected */}
          {isRejected && (
            <div className="pt-4 border-t">
              <div className="flex gap-3">
                <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">Yang Harus Dilakukan:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Baca dan pahami catatan penolakan dari dosen pembimbing</li>
                    <li>Perbaiki data pengajuan sesuai dengan feedback yang diberikan</li>
                    <li>Pastikan semua informasi sudah benar dan lengkap</li>
                    <li>Ajukan kembali setelah melakukan perbaikan</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
