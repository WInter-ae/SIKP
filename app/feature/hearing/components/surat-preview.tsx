import { FileText, Download, Printer } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import type { SuratBeritaAcara } from "../types";

interface SuratPreviewProps {
  surat: SuratBeritaAcara;
  onDownload?: () => void;
  onPrint?: () => void;
}

export function SuratPreview({ surat, onDownload, onPrint }: SuratPreviewProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Surat Berita Acara
            </CardTitle>
            <CardDescription>
              Preview surat berita acara sidang Kerja Praktik
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {onPrint && (
              <Button variant="outline" size="sm" onClick={onPrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            )}
            {onDownload && (
              <Button size="sm" onClick={onDownload} className="bg-green-700 hover:bg-green-800">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Preview Surat */}
        <div className="bg-white p-8 shadow-lg rounded-lg" id="surat-preview">
          {/* Kop Surat */}
          <div className="text-center mb-8 border-b-2 border-black pb-4">
            <h2 className="text-xl font-bold">UNIVERSITAS NEGERI PADANG</h2>
            <h3 className="text-lg font-semibold">FAKULTAS MATEMATIKA DAN ILMU PENGETAHUAN ALAM</h3>
            <p className="text-sm">Jl. Prof. Dr. Hamka Air Tawar Padang</p>
            <p className="text-sm">Telp. (0751) 44375 | Email: fmipa@unp.ac.id</p>
          </div>

          {/* Nomor dan Tanggal Surat */}
          <div className="mb-6">
            <p className="text-sm">
              Nomor: <span className="font-medium">{surat.nomorSurat}</span>
            </p>
            <p className="text-sm">
              Tanggal: <span className="font-medium">{formatDate(surat.tanggalDibuat)}</span>
            </p>
          </div>

          <Separator className="my-4" />

          {/* Judul */}
          <h3 className="text-center text-lg font-bold mb-6 uppercase">
            Berita Acara Sidang Kerja Praktik
          </h3>

          {/* Isi Berita Acara */}
          <div className="space-y-4 text-sm">
            <p>Pada hari ini telah dilaksanakan sidang Kerja Praktik dengan detail sebagai berikut:</p>

            <div className="ml-4 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <span className="font-medium">Judul Laporan</span>
                <span className="col-span-2">: {surat.beritaAcara.judulLaporan}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-medium">Tempat</span>
                <span className="col-span-2">: {surat.beritaAcara.tempatPelaksanaan}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-medium">Tanggal</span>
                <span className="col-span-2">: {formatDate(surat.beritaAcara.tanggalSidang)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-medium">Waktu</span>
                <span className="col-span-2">
                  : {surat.beritaAcara.waktuMulai} - {surat.beritaAcara.waktuSelesai} WIB
                </span>
              </div>
              {surat.beritaAcara.nilaiAkhir && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-medium">Nilai Akhir</span>
                  <span className="col-span-2">: {surat.beritaAcara.nilaiAkhir}</span>
                </div>
              )}
            </div>

            <p className="mt-4">
              Sidang telah dilaksanakan dengan baik dan dinyatakan{" "}
              <span className="font-bold">LULUS</span>.
            </p>

            {surat.beritaAcara.catatanDosen && (
              <div className="mt-4">
                <p className="font-medium">Catatan:</p>
                <p className="ml-4 italic">{surat.beritaAcara.catatanDosen}</p>
              </div>
            )}
          </div>

          {/* Tanda Tangan */}
          <div className="mt-12 grid grid-cols-2 gap-8">
            {surat.ttdDosen.map((dosen, index) => (
              <div key={index} className="text-center">
                <p className="text-sm mb-16">
                  {dosen.jabatan === "pembimbing" ? "Dosen Pembimbing" : "Dosen Penguji"}
                </p>
                <div className="border-t border-black pt-2">
                  <p className="text-sm font-medium">{dosen.nama}</p>
                  <p className="text-xs">NIP. {dosen.nip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Informasi Tambahan */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            💡 <strong>Catatan:</strong> Surat ini dapat didownload dalam format PDF dan dicetak untuk
            keperluan administrasi.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
