import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Card, CardContent } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { 
  GraduationCap, 
  Award, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Upload as UploadIcon,
  Eye,
  XCircle,
  ArrowLeft,
  ArrowRight,
  History as HistoryIcon
} from "lucide-react";
import type { NilaiKP, RevisiKP, HistoryRevisi } from "../types";
import { RevisiUploadForm } from "../components/revisi-upload-form";
import { ProcessStepPascaMagang } from "../components/process-step-pasca-magang";
import { RevisiHistory } from "../components/revisi-history";

// Mock data mahasiswa - akan diganti dengan data dari session/auth
const mockMahasiswa = {
  id: "MHS-001",
  nama: "Budi Santoso",
  nim: "12345001",
};

// Mock data nilai - Status: belum ada nilai sampai revisi disetujui
const mockNilaiKP: NilaiKP | null = null; // Tidak ada nilai karena revisi belum disetujui

// Mock data nilai ketika semua revisi disetujui - uncomment untuk testing
// const mockNilaiKP: NilaiKP = {
//   id: "NILAI-001",
//   mahasiswaId: "MHS-001",
//   dosenPembimbingId: "DOSEN-001",
//   nilaiPembimbingLapangan: 85,
//   nilaiLaporanKP: 82,
//   nilaiPresentasi: 88,
//   nilaiSidang: 86,
//   nilaiAkhir: 85.25,
//   nilaiHuruf: "A",
//   status: "selesai",
//   catatanUmum: "Secara keseluruhan, laporan dan presentasi sudah baik. Selamat!",
//   tanggalPenilaian: "2026-01-10T10:00:00.000Z",
//   dosenPenguji: [
//     { nama: "Dr. Ahmad Santoso, M.Kom", nip: "198501012010121001" },
//     { nama: "Dr. Siti Rahmawati, M.T", nip: "198703152010122002" },
//   ],
// };

// Mock data revisi
const mockRevisi: RevisiKP[] = [
  {
    id: "REV-001",
    nilaiKPId: "NILAI-001",
    mahasiswaId: "MHS-001",
    jenisRevisi: "laporan",
    deskripsiRevisi: "Perbaikan metodologi penelitian dan analisis hasil",
    prioritas: "tinggi",
    status: "menunggu_upload",
    catatanDosen: "Perbaiki bagian metodologi dan tambahkan analisis lebih mendalam",
    createdAt: "2026-01-10T10:00:00.000Z",
    updatedAt: "2026-01-10T10:00:00.000Z",
  },
  {
    id: "REV-002",
    nilaiKPId: "NILAI-001",
    mahasiswaId: "MHS-001",
    jenisRevisi: "dokumentasi",
    deskripsiRevisi: "Perbaikan format daftar pustaka",
    prioritas: "sedang",
    status: "menunggu_upload",
    catatanDosen: "Sesuaikan format daftar pustaka dengan template IEEE",
    createdAt: "2026-01-10T10:00:00.000Z",
    updatedAt: "2026-01-10T10:00:00.000Z",
  },
];

// Mock revisi untuk testing status "disetujui" - uncomment untuk melihat nilai
// const mockRevisi: RevisiKP[] = [
//   {
//     id: "REV-001",
//     nilaiKPId: "NILAI-001",
//     mahasiswaId: "MHS-001",
//     jenisRevisi: "laporan",
//     deskripsiRevisi: "Perbaikan metodologi penelitian dan analisis hasil",
//     prioritas: "tinggi",
//     status: "disetujui",
//     catatanDosen: "Perbaikan sudah sesuai, approved!",
//     fileName: "Laporan_Revisi_Final.pdf",
//     fileSize: 2048000,
//     uploadedAt: "2026-01-12T10:00:00.000Z",
//     reviewedAt: "2026-01-13T14:00:00.000Z",
//     createdAt: "2026-01-10T10:00:00.000Z",
//     updatedAt: "2026-01-13T14:00:00.000Z",
//   },
//   {
//     id: "REV-002",
//     nilaiKPId: "NILAI-001",
//     mahasiswaId: "MHS-001",
//     jenisRevisi: "dokumentasi",
//     deskripsiRevisi: "Perbaikan format daftar pustaka",
//     prioritas: "sedang",
//     status: "disetujui",
//     catatanDosen: "Format sudah benar",
//     fileName: "Daftar_Pustaka_Fixed.pdf",
//     fileSize: 512000,
//     uploadedAt: "2026-01-12T11:00:00.000Z",
//     reviewedAt: "2026-01-13T14:30:00.000Z",
//     createdAt: "2026-01-10T10:00:00.000Z",
//     updatedAt: "2026-01-13T14:30:00.000Z",
//   },
// ];

// Mock history
const mockHistory: HistoryRevisi[] = [
  {
    id: "HIST-001",
    revisiId: "REV-001",
    action: "dibuat",
    deskripsi: "Revisi dibuat oleh dosen pembimbing",
    actor: {
      id: "DOSEN-001",
      nama: "Dr. Ahmad Santoso, M.Kom",
      role: "dosen",
    },
    timestamp: "2026-01-10T10:00:00.000Z",
    details: {
      jenis: "laporan",
      prioritas: "tinggi",
    },
  },
  {
    id: "HIST-002",
    revisiId: "REV-002",
    action: "dibuat",
    deskripsi: "Revisi dokumentasi dibuat",
    actor: {
      id: "DOSEN-001",
      nama: "Dr. Ahmad Santoso, M.Kom",
      role: "dosen",
    },
    timestamp: "2026-01-10T10:05:00.000Z",
    details: {
      jenis: "dokumentasi",
      prioritas: "sedang",
    },
  },
];

export default function PascaMagangPage() {
  const [nilaiKP, setNilaiKP] = useState<NilaiKP | null>(null);
  const [revisiList, setRevisiList] = useState<RevisiKP[]>([]);
  const [history, setHistory] = useState<HistoryRevisi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRevisi, setActiveRevisi] = useState<RevisiKP | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [notification, setNotification] = useState<{
    title: string;
    description: string;
    variant?: "default" | "destructive";
  } | null>(null);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simulasi API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Load dari localStorage atau API
      if (typeof window !== "undefined") {
        const savedNilai = localStorage.getItem("nilai-kp");
        const savedRevisi = localStorage.getItem("revisi-kp-list");
        const savedHistory = localStorage.getItem("revisi-history");
        
        if (savedNilai) {
          setNilaiKP(JSON.parse(savedNilai));
        } else {
          setNilaiKP(mockNilaiKP);
          localStorage.setItem("nilai-kp", JSON.stringify(mockNilaiKP));
        }
        
        if (savedRevisi) {
          setRevisiList(JSON.parse(savedRevisi));
        } else {
          setRevisiList(mockRevisi);
          localStorage.setItem("revisi-kp-list", JSON.stringify(mockRevisi));
        }
        
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
        } else {
          setHistory(mockHistory);
          localStorage.setItem("revisi-history", JSON.stringify(mockHistory));
        }
      }
      
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleUploadRevisi = async (revisiId: string, file: File, catatan: string) => {
    // Simulasi upload file
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Update status revisi
    const updatedRevisi = revisiList.map((rev) =>
      rev.id === revisiId
        ? {
            ...rev,
            status: "menunggu_review" as const,
            fileUrl: URL.createObjectURL(file),
            fileName: file.name,
            fileSize: file.size,
            uploadedAt: new Date().toISOString(),
            catatanMahasiswa: catatan,
            updatedAt: new Date().toISOString(),
          }
        : rev
    );
    
    setRevisiList(updatedRevisi);
    localStorage.setItem("revisi-kp-list", JSON.stringify(updatedRevisi));
    
    // Tambah ke history
    const newHistory: HistoryRevisi = {
      id: `HIST-${Date.now()}`,
      revisiId: revisiId,
      action: "diupload",
      deskripsi: `File revisi ${file.name} berhasil diupload`,
      actor: {
        id: mockMahasiswa.id,
        nama: mockMahasiswa.nama,
        role: "mahasiswa",
      },
      timestamp: new Date().toISOString(),
      details: {
        filename: file.name,
        filesize: `${(file.size / 1024).toFixed(2)} KB`,
        catatan: catatan || "-",
      },
    };
    
    const updatedHistory = [newHistory, ...history];
    setHistory(updatedHistory);
    localStorage.setItem("revisi-history", JSON.stringify(updatedHistory));
    
    setActiveRevisi(null);
    setNotification({
      title: "✅ File berhasil diupload",
      description: "Revisi Anda telah disubmit dan menunggu review dari dosen.",
    });
    setTimeout(() => setNotification(null), 5000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    );
  }

  // Hitung status keseluruhan
  const allRevisiApproved = revisiList.every(r => r.status === "disetujui");
  const hasRevisiPending = revisiList.some(r => r.status === "menunggu_upload");
  const hasRevisiUploaded = revisiList.some(r => r.status === "menunggu_review");
  const revisiPendingCount = revisiList.filter(r => r.status === "menunggu_upload").length;

  return (
    <>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Halaman Pasca Magang
        </h1>
        <p className="text-muted-foreground">
          Nilai dan revisi kerja praktik Anda
        </p>
      </div>

      {/* Notification */}
      {notification && (
        <Alert variant={notification.variant} className="mb-6">
          <AlertDescription>
            <p className="font-semibold">{notification.title}</p>
            <p className="text-sm mt-1">{notification.description}</p>
          </AlertDescription>
        </Alert>
      )}

      <Card className="mb-8">
        <CardContent className="p-6">
          {/* Step 1: Menunggu Penilaian (jika nilai belum ada) */}
          {!nilaiKP && (
            <ProcessStepPascaMagang
              title="Menunggu Penilaian dari Dosen"
              description="Penilaian kerja praktik sedang dilakukan oleh dosen pembimbing dan penguji"
              status="waiting"
            />
          )}

          {/* Step 2: Revisi Diminta (jika ada nilai tapi perlu revisi) */}
          {nilaiKP && !allRevisiApproved && hasRevisiPending && (
            <>
              {activeRevisi ? (
                <div className="mb-4">
                  <RevisiUploadForm
                    revisi={activeRevisi}
                    onUpload={handleUploadRevisi}
                    onCancel={() => setActiveRevisi(null)}
                  />
                </div>
              ) : (
                <ProcessStepPascaMagang
                  title="Revisi Diminta"
                  description="Dosen meminta Anda melakukan revisi pada laporan atau dokumen kerja praktik"
                  status="revisi_pending"
                  revisiCount={revisiPendingCount}
                  comment={revisiList.find(r => r.status === "menunggu_upload")?.catatanDosen}
                  onAction={() => {
                    const firstPending = revisiList.find(r => r.status === "menunggu_upload");
                    if (firstPending) setActiveRevisi(firstPending);
                  }}
                  actionText="Upload Revisi"
                />
              )}

              {/* Daftar Revisi */}
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Daftar Revisi yang Diminta
                </h4>
                <div className="space-y-2">
                  {revisiList.map((revisi) => (
                    <div key={revisi.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm capitalize">
                          {revisi.jenisRevisi.replace(/_/g, " ")}
                        </p>
                        <p className="text-xs text-muted-foreground">{revisi.deskripsiRevisi}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={
                            revisi.status === "menunggu_upload" 
                              ? "border-red-300 text-red-700 bg-red-50" 
                              : revisi.status === "menunggu_review"
                              ? "border-blue-300 text-blue-700 bg-blue-50"
                              : revisi.status === "disetujui"
                              ? "border-green-300 text-green-700 bg-green-50"
                              : "border-gray-300 text-gray-700 bg-gray-50"
                          }
                        >
                          {revisi.status === "menunggu_upload" && "Belum Upload"}
                          {revisi.status === "menunggu_review" && "Menunggu Review"}
                          {revisi.status === "disetujui" && "Disetujui"}
                          {revisi.status === "ditolak" && "Ditolak"}
                        </Badge>
                        {revisi.status === "menunggu_upload" && (
                          <Button
                            size="sm"
                            onClick={() => setActiveRevisi(revisi)}
                          >
                            <UploadIcon className="h-3 w-3 mr-1" />
                            Upload
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 3: Revisi Telah Diupload */}
          {hasRevisiUploaded && !hasRevisiPending && (
            <ProcessStepPascaMagang
              title="Revisi Telah Diupload"
              description="Revisi Anda telah diupload dan sedang menunggu review dari dosen"
              status="revisi_uploaded"
            />
          )}

          {/* Step 4: Penilaian Selesai - Nilai Muncul */}
          {nilaiKP && allRevisiApproved && (
            <ProcessStepPascaMagang
              title="Penilaian Selesai"
              description="Selamat! Penilaian kerja praktik Anda telah selesai dan nilai telah keluar"
              status="completed"
              showNilai={true}
              nilaiData={{
                nilaiAkhir: nilaiKP.nilaiAkhir,
                nilaiHuruf: nilaiKP.nilaiHuruf,
                nilaiPembimbingLapangan: nilaiKP.nilaiPembimbingLapangan,
                nilaiLaporanKP: nilaiKP.nilaiLaporanKP,
                nilaiPresentasi: nilaiKP.nilaiPresentasi,
                nilaiSidang: nilaiKP.nilaiSidang,
                dosenPenguji: nilaiKP.dosenPenguji,
                tanggalPenilaian: nilaiKP.tanggalPenilaian,
              }}
            />
          )}

          {/* Button untuk lihat history */}
          {history.length > 0 && (
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() => setShowHistory(!showHistory)}
                className="w-full"
              >
                <HistoryIcon className="h-4 w-4 mr-2" />
                {showHistory ? "Sembunyikan" : "Lihat"} Riwayat Revisi
              </Button>

              {showHistory && (
                <div className="mt-4">
                  <RevisiHistory history={history} />
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="secondary"
              asChild
              className="px-6 py-3 font-medium"
            >
              <Link to="/mahasiswa/kp/saat-magang">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Sebelumnya
              </Link>
            </Button>
            <Button
              asChild
              className="px-6 py-3 font-medium"
              disabled={!nilaiKP || !allRevisiApproved}
            >
              <Link to="/mahasiswa/kp/pengujian-sidang">
                Selanjutnya
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
