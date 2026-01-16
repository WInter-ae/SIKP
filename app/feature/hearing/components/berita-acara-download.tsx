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
  User,
  FileSignature,
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
  dosenPenguji?: Array<{
    no: number;
    nama: string;
    status: string;
  }>;
}

export function BeritaAcaraDownload({ 
  beritaAcara, 
  mahasiswa = {
    nama: "Budi Santoso",
    nim: "12345001",
    programStudi: "Teknik Informatika"
  },
  dosenPenguji = [
    { no: 1, nama: "Dr. Ahmad Santoso, M.Kom", status: "Dosen Pembimbing KP" },
    { no: 2, nama: "Dr. Budi Pratama, M.T", status: "Penguji I" },
    { no: 3, nama: "Dr. Citra Dewi, M.Kom", status: "Penguji II" }
  ]
}: BeritaAcaraDownloadProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDownload = async (format: "pdf" | "docx") => {
    if (format === "pdf") {
      // Download sebagai PDF menggunakan print
      downloadBeritaAcaraHTML(beritaAcara, mahasiswa, dosenPenguji);
    } else if (format === "docx") {
      // Generate DOCX - dynamic import untuk menghindari SSR issues
      try {
        const { generateBeritaAcaraDOCX } = await import("../utils/generate-berita-acara");
        await generateBeritaAcaraDOCX(beritaAcara, mahasiswa, dosenPenguji);
      } catch (error) {
        console.error("Error generating DOCX:", error);
        alert("Gagal mengunduh DOCX. Silakan coba lagi.");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Alert */}
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <AlertDescription className="text-green-800">
          <div>
            <p className="font-semibold">Berita Acara Telah Disetujui</p>
            <p className="text-sm">
              Berita acara sidang Anda telah ditandatangani oleh dosen pembimbing dan siap diunduh.
            </p>
          </div>
        </AlertDescription>
      </Alert>

      {/* Document Preview Card */}
      <Card className="shadow-lg border-2 border-green-200">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Berita Acara Sidang</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Dokumen Resmi Pelaksanaan Sidang Kerja Praktik
                </p>
              </div>
            </div>
            <Badge className="bg-green-600 gap-2">
              <FileSignature className="h-3 w-3" />
              Ditandatangani
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Document Details */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground mb-1 block">
                <FileText className="h-4 w-4 inline mr-1" />
                Judul Laporan
              </Label>
              <p className="font-semibold text-lg">{beritaAcara.judulLaporan}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground mb-1 block">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Tempat Pelaksanaan
                </Label>
                <p className="font-medium">{beritaAcara.tempatPelaksanaan}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-1 block">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Tanggal Sidang
                </Label>
                <p className="font-medium">{formatDate(beritaAcara.tanggalSidang)}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-1 block">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Waktu Pelaksanaan
                </Label>
                <p className="font-medium">
                  {beritaAcara.waktuMulai} - {beritaAcara.waktuSelesai}
                </p>
              </div>

              {beritaAcara.dosenSignature && (
                <div>
                  <Label className="text-sm text-muted-foreground mb-1 block">
                    <User className="h-4 w-4 inline mr-1" />
                    Ditandatangani Oleh
                  </Label>
                  <p className="font-medium">{beritaAcara.dosenSignature.nama}</p>
                  <p className="text-sm text-muted-foreground">NIP: {beritaAcara.dosenSignature.nip}</p>
                </div>
              )}
            </div>

            {beritaAcara.dosenSignature && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <FileSignature className="h-5 w-5" />
                  <div>
                    <p className="font-semibold">Ditandatangani Secara Digital</p>
                    <p className="text-sm">
                      Pada: {formatDate(beritaAcara.dosenSignature.signedAt)} pukul {new Date(beritaAcara.dosenSignature.signedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Download Buttons */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold text-base">Unduh Dokumen</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <Button
                onClick={() => handleDownload("pdf")}
                className="h-12 gap-2 text-base font-semibold"
                variant="default"
              >
                <Printer className="h-5 w-5" />
                Print / Unduh PDF
              </Button>
              <Button
                onClick={() => handleDownload("docx")}
                className="h-12 gap-2 text-base font-semibold"
                variant="outline"
              >
                <Download className="h-5 w-5" />
                Unduh DOCX
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Dokumen ini telah ditandatangani secara digital dan memiliki kekuatan hukum yang sah
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Catatan Penting:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Simpan dokumen ini sebagai bukti pelaksanaan sidang</li>
                <li>Dokumen dapat diunduh kapan saja melalui menu Arsip</li>
                <li>Jika ada pertanyaan, hubungi dosen pembimbing Anda</li>
                <li>Dokumen ini diperlukan untuk proses wisuda</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
