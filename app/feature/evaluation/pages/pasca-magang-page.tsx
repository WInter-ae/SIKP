import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Card, CardContent } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Upload as UploadIcon,
  Eye,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Info,
  Download,
  History as HistoryIcon,
  Printer
} from "lucide-react";
import { printFormNilai, type NilaiKPData } from "../utils/generate-form-nilai";

// Status types
type LaporanStatus = 
  | "belum_upload" 
  | "menunggu_review" 
  | "perlu_revisi" 
  | "disetujui";

interface LaporanKP {
  id?: string;
  fileName?: string;
  fileSize?: number;
  uploadedAt?: string;
  status: LaporanStatus;
  revisionMessage?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

interface RevisionHistory {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  status: "menunggu_review" | "perlu_revisi" | "disetujui";
  revisionMessage?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  version: number;
}

// Get logged in mahasiswa data - safe for SSR
const getLoggedInMahasiswa = () => {
  // TODO: Get from actual auth context
  const defaultData = {
    id: "MHS-001",
    nama: "Rizki Maulana",
    nim: "1234567892",
    programStudi: "Teknik Informatika",
    tempatKP: "PT. Teknologi Nusantara",
    judulLaporan: "Sistem Informasi Manajemen Berbasis Web",
    waktuPelaksanaan: "Juli 2025 s.d. September 2025",
    dosenPembimbing: "Dr. Ahmad Santoso, M.Kom",
    pembimbingLapangan: "Budi Hartono, S.Kom",
  };
  
  // Only access localStorage in browser
  if (typeof window === "undefined") {
    return defaultData;
  }
  
  // Try to get from localStorage profile
  const savedProfile = localStorage.getItem("mahasiswa-profile");
  if (savedProfile) {
    try {
      const profile = JSON.parse(savedProfile);
      return {
        ...defaultData,
        ...profile
      };
    } catch (e) {
      console.error("Error loading mahasiswa profile:", e);
    }
  }
  
  return defaultData;
};

// Mock data mahasiswa - will be updated in client
const mockMahasiswa = getLoggedInMahasiswa();

// Mock nilai - dari dosen pembimbing
const mockNilai = {
  // Data Mahasiswa (akan di-override dari dosen)
  namaMahasiswa: "",
  nim: "",
  programStudi: "",
  tempatKP: "",
  judulLaporan: "",
  waktuPelaksanaan: "",
  dosenPembimbing: "",
  pembimbingLapangan: "",
  
  // Nilai
  kesesuaianLaporan: 85,
  penguasaanMateri: 88,
  analisisPerancangan: 82,
  sikapEtika: 90,
  
  // Data Dosen
  dosenPenguji: "Dr. Ahmad Santoso, M.Kom",
  nipDosen: "198501122010121001",
  eSignatureUrl: "", // Will be loaded from localStorage
  tanggalPenilaian: "",
};


// Mock data laporan - uncomment untuk testing different states
const mockLaporan: LaporanKP = {
  status: "belum_upload",
};

// Uncomment untuk test status "menunggu review"
// const mockLaporan: LaporanKP = {
//   id: "LAP-001",
//   fileName: "Laporan_KP_RizkiMaulana.pdf",
//   fileSize: 2621440, // 2.5 MB
//   uploadedAt: "2026-01-15T10:30:00.000Z",
//   status: "menunggu_review",
// };

// Uncomment untuk test status "perlu revisi"
// const mockLaporan: LaporanKP = {
//   id: "LAP-002",
//   fileName: "Laporan_KP_RizkiMaulana_v2.pdf",
//   fileSize: 2621440,
//   uploadedAt: "2026-01-15T10:30:00.000Z",
//   status: "perlu_revisi",
//   revisionMessage: "Format penulisan belum sesuai. Mohon perbaiki BAB III dan daftar pustaka.",
//   reviewedAt: "2026-01-16T14:00:00.000Z",
//   reviewedBy: "Dr. Ahmad Santoso, M.Kom",
// };

// Uncomment untuk test status "disetujui"
// const mockLaporan: LaporanKP = {
//   id: "LAP-003",
//   fileName: "Laporan_KP_RizkiMaulana_Final.pdf",
//   fileSize: 2621440,
//   uploadedAt: "2026-01-17T09:00:00.000Z",
//   status: "disetujui",
//   reviewedAt: "2026-01-17T15:00:00.000Z",
//   reviewedBy: "Dr. Ahmad Santoso, M.Kom",
// };

export default function PascaMagangPage() {
  const [laporan, setLaporan] = useState<LaporanKP>(mockLaporan);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [revisionStatus, setRevisionStatus] = useState<"revisi" | "tidak-revisi" | "">("");
  const [notification, setNotification] = useState<{
    title: string;
    description: string;
    variant?: "default" | "destructive";
  } | null>(null);
  const [nilaiKP, setNilaiKP] = useState(mockNilai);  const [hasGradeFromDosen, setHasGradeFromDosen] = useState(false);
  const [revisionHistory, setRevisionHistory] = useState<RevisionHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  // Load data
  useEffect(() => {
    const loadData = () => {
      // Load dari localStorage atau API
      if (typeof window !== "undefined") {
        const savedLaporan = localStorage.getItem("laporan-kp");
        
        if (savedLaporan) {
          const parsedLaporan = JSON.parse(savedLaporan);
          setLaporan(parsedLaporan);
          console.log("Loaded laporan:", parsedLaporan);
        } else {
          localStorage.setItem("laporan-kp", JSON.stringify(mockLaporan));
        }

        // Load nilai from localStorage - try student-specific first, then generic
        const studentNim = mockMahasiswa.nim;
        let savedNilai = localStorage.getItem(`nilai-kp-${studentNim}`);
        
        // Fallback to generic key
        if (!savedNilai) {
          savedNilai = localStorage.getItem("nilai-kp");
        }
        
        if (savedNilai) {
          const parsedNilai = JSON.parse(savedNilai);
          
          // HANYA set nilai dan hasGradeFromDosen jika tanggalPenilaian ada
          // Artinya dosen sudah benar-benar memberikan nilai, bukan hanya merevisi
          if (parsedNilai.tanggalPenilaian) {
            setNilaiKP(parsedNilai);
            
            // Check if this is newly graded
            if (!hasGradeFromDosen) {
              setHasGradeFromDosen(true);
              
              // Show notification for new grade only once
              if (!sessionStorage.getItem('grade-notification-shown')) {
                setNotification({
                  title: "✅ Nilai KP Sudah Tersedia!",
                  description: `Dosen ${parsedNilai.dosenPenguji || 'pembimbing'} telah memberikan nilai. Anda dapat mencetak Form Nilai KP.`,
                });
                
                sessionStorage.setItem('grade-notification-shown', 'true');
                
                // Auto-dismiss after 8 seconds
                setTimeout(() => setNotification(null), 8000);
              }
            }
            
            console.log("Loaded nilai for student (with tanggalPenilaian):", parsedNilai);
          } else {
            // Jika tidak ada tanggalPenilaian, reset state
            setHasGradeFromDosen(false);
            console.log("Nilai data exists but no tanggalPenilaian - dosen masih merevisi");
          }
        } else {
          // Tidak ada data nilai sama sekali
          setHasGradeFromDosen(false);
        }

        // Load revision history
        const savedHistory = localStorage.getItem("revision-history-kp");
        if (savedHistory) {
          const parsedHistory = JSON.parse(savedHistory);
          setRevisionHistory(parsedHistory);
          console.log("Loaded revision history:", parsedHistory);
        }
      }
    };

    loadData();
    
    // Check for changes periodically (every 500ms for faster updates)
    const intervalId = setInterval(() => {
      loadData();
    }, 500);
    
    // Also reload when window gets focus
    const handleFocus = () => {
      loadData();
    };
    
    window.addEventListener("focus", handleFocus);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      alert("Hanya file PDF yang diperbolehkan");
    }
  };

  const handleUploadLaporan = async () => {
    if (!selectedFile) {
      alert("Mohon pilih file terlebih dahulu");
      return;
    }
    
    if (!revisionStatus) {
      alert("Mohon pilih status revisi");
      return;
    }

    setIsLoading(true);
    
    // Simulasi upload file
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const updatedLaporan: LaporanKP = {
      ...laporan,
      id: `LAP-${Date.now()}`,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      uploadedAt: new Date().toISOString(),
      status: "menunggu_review",
    };
    
    // Save to history
    const newHistoryItem: RevisionHistory = {
      id: updatedLaporan.id!,
      fileName: updatedLaporan.fileName!,
      fileSize: updatedLaporan.fileSize!,
      uploadedAt: updatedLaporan.uploadedAt!,
      status: "menunggu_review",
      version: revisionHistory.length + 1,
    };
    
    const updatedHistory = [...revisionHistory, newHistoryItem];
    setRevisionHistory(updatedHistory);
    localStorage.setItem("revision-history-kp", JSON.stringify(updatedHistory));
    
    setLaporan(updatedLaporan);
    localStorage.setItem("laporan-kp", JSON.stringify(updatedLaporan));
    
    setSelectedFile(null);
    setRevisionStatus("");
    setIsLoading(false);
    
    setNotification({
      title: "✅ Laporan berhasil diupload",
      description: "Laporan KP Anda telah disubmit dan menunggu review dari dosen.",
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePrintFormNilai = () => {
    console.log("=== DEBUGGING PDF GENERATION ===");
    console.log("Current nilaiKP state:", nilaiKP);
    console.log("Current mockMahasiswa:", mockMahasiswa);
    
    // Use data from nilaiKP which was saved by dosen
    const formData: NilaiKPData = {
      // Data from saved nilai (includes student data saved by dosen)
      namaMahasiswa: nilaiKP.namaMahasiswa || mockMahasiswa.nama,
      nim: nilaiKP.nim || mockMahasiswa.nim,
      programStudi: nilaiKP.programStudi || mockMahasiswa.programStudi,
      tempatKP: nilaiKP.tempatKP || mockMahasiswa.tempatKP,
      judulLaporan: nilaiKP.judulLaporan || mockMahasiswa.judulLaporan,
      waktuPelaksanaan: nilaiKP.waktuPelaksanaan || mockMahasiswa.waktuPelaksanaan,
      dosenPembimbing: nilaiKP.dosenPembimbing || mockMahasiswa.dosenPembimbing,
      pembimbingLapangan: nilaiKP.pembimbingLapangan || mockMahasiswa.pembimbingLapangan,
      
      // Nilai from dosen
      kesesuaianLaporan: nilaiKP.kesesuaianLaporan || 0,
      penguasaanMateri: nilaiKP.penguasaanMateri || 0,
      analisisPerancangan: nilaiKP.analisisPerancangan || 0,
      sikapEtika: nilaiKP.sikapEtika || 0,
      
      // Dosen data with e-signature
      tanggalPenilaian: nilaiKP.tanggalPenilaian 
        ? new Date(nilaiKP.tanggalPenilaian).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
      dosenPenguji: nilaiKP.dosenPenguji || "Dr. Ahmad Santoso, M.Kom",
      nipDosen: nilaiKP.nipDosen || "198501122010121001",
      eSignatureUrl: nilaiKP.eSignatureUrl || "",
    };

    console.log("=== FORM DATA TO BE PRINTED ===");
    console.log("Printing form with data:", formData);
    console.log("Data validation:");
    console.log("- namaMahasiswa:", formData.namaMahasiswa);
    console.log("- nim:", formData.nim);
    console.log("- kesesuaianLaporan:", formData.kesesuaianLaporan);
    console.log("- penguasaanMateri:", formData.penguasaanMateri);
    console.log("- analisisPerancangan:", formData.analisisPerancangan);
    console.log("- sikapEtika:", formData.sikapEtika);
    console.log("- dosenPenguji:", formData.dosenPenguji);
    console.log("- eSignatureUrl:", formData.eSignatureUrl);
    console.log("================================");
    
    printFormNilai(formData);
  };

  const handleReset = () => {
    if (confirm("Apakah Anda yakin ingin mereset semua data? Ini akan menghapus laporan dan status yang sudah diupload.")) {
      // Clear localStorage
      localStorage.removeItem("laporan-kp");
      localStorage.removeItem("nilai-kp");
      localStorage.removeItem("revision-decision-MHS-001");
      localStorage.removeItem("revision-message-MHS-001");
      localStorage.removeItem("revision-history-kp");
      localStorage.removeItem("grade-notification-shown");
      sessionStorage.removeItem("grade-notification-shown");
      
      // Reset state to initial mock data
      const resetLaporan = { status: "belum_upload" as LaporanStatus };
      const resetNilai = {
        namaMahasiswa: "",
        nim: "",
        programStudi: "",
        tempatKP: "",
        judulLaporan: "",
        waktuPelaksanaan: "",
        dosenPembimbing: "",
        pembimbingLapangan: "",
        kesesuaianLaporan: 85,
        penguasaanMateri: 88,
        analisisPerancangan: 82,
        sikapEtika: 90,
        dosenPenguji: "Dr. Ahmad Santoso, M.Kom",
        nipDosen: "198501122010121001",
        eSignatureUrl: "",
        tanggalPenilaian: "",
      };
      
      setLaporan(resetLaporan);
      setNilaiKP(resetNilai);
      setSelectedFile(null);
      setRevisionStatus("");
      setRevisionHistory([]);
      setShowHistory(false);
      setHasGradeFromDosen(false);
      
      // Save reset state to localStorage
      localStorage.setItem("laporan-kp", JSON.stringify(resetLaporan));
      
      setNotification({
        title: "Data berhasil direset",
        description: "Semua data telah dihapus. Anda dapat memulai dari awal.",
      });
      setTimeout(() => setNotification(null), 3000);
      
      // Reload page to ensure clean state
      window.location.reload();
    }
  };

  const getStatusBadge = (status: LaporanStatus) => {
    switch (status) {
      case "belum_upload":
        return <Badge variant="outline" className="bg-gray-50"><Clock className="h-3 w-3 mr-1" />Belum Upload</Badge>;
      case "menunggu_review":
        return <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700"><Clock className="h-3 w-3 mr-1" />Menunggu Review</Badge>;
      case "perlu_revisi":
        return <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700"><XCircle className="h-3 w-3 mr-1" />Perlu Revisi</Badge>;
      case "disetujui":
        return <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700"><CheckCircle2 className="h-3 w-3 mr-1" />Disetujui</Badge>;
    }
  };

  return (
    <>
      {/* Header Section */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Halaman Pasca Magang
          </h1>
          <p className="text-muted-foreground">
            Upload dan pantau status laporan kerja praktik Anda
          </p>
        </div>
        <Button
          onClick={handleReset}
          variant="outline"
          className="border-orange-500 text-orange-600 hover:bg-orange-50"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Reset Data
        </Button>
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
          {/* Upload Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Upload Laporan Kerja Praktik</h2>
            
            {/* Status Current */}
            {laporan.fileName && (
              <Card className="mb-4 bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50 rounded">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{laporan.fileName}</p>
                        <p className="text-sm text-muted-foreground">
                          {laporan.fileSize && formatFileSize(laporan.fileSize)} • 
                          Diupload: {laporan.uploadedAt && formatDate(laporan.uploadedAt)}
                        </p>
                        {laporan.revisionMessage && (
                          <Alert className="mt-2 bg-orange-50 border-orange-200">
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                            <AlertDescription className="text-orange-800 text-sm">
                              <strong>Pesan Revisi:</strong>
                              <p className="mt-1">{laporan.revisionMessage}</p>
                              <p className="text-xs mt-2">Direview oleh: {laporan.reviewedBy}</p>
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                    <div>
                      {getStatusBadge(laporan.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* History Revisi */}
            {revisionHistory.length > 0 && (
              <Card className="mb-4 border-gray-200">
                <CardContent className="p-4">
                  <button 
                    onClick={() => setShowHistory(!showHistory)}
                    className="w-full flex items-center justify-between text-left hover:bg-gray-50 p-2 rounded transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <HistoryIcon className="h-5 w-5 text-gray-600" />
                      <span className="font-semibold text-gray-900">
                        History Revisi
                      </span>
                      <Badge variant="secondary" className="ml-2">
                        {revisionHistory.length} versi
                      </Badge>
                    </div>
                    <div className={`transition-transform ${showHistory ? 'rotate-180' : ''}`}>
                      <ArrowRight className="h-5 w-5 text-gray-600 rotate-90" />
                    </div>
                  </button>
                  
                  {showHistory && (
                    <div className="mt-4 space-y-3">
                      {revisionHistory
                        .slice()
                        .reverse()
                        .map((item, index) => {
                          const actualVersion = revisionHistory.length - index;
                          const isLatest = index === 0;
                          
                          return (
                            <div 
                              key={item.id}
                              className={`border rounded-lg p-4 ${
                                isLatest 
                                  ? 'border-blue-300 bg-blue-50' 
                                  : 'border-gray-200 bg-white'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant={isLatest ? "default" : "secondary"}
                                    className={isLatest ? "bg-blue-600" : ""}
                                  >
                                    Versi {actualVersion}
                                  </Badge>
                                  {isLatest && (
                                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                                      Terbaru
                                    </Badge>
                                  )}
                                </div>
                                {item.status === "perlu_revisi" && (
                                  <Badge variant="destructive" className="bg-orange-100 text-orange-700 border-orange-300">
                                    Perlu Revisi
                                  </Badge>
                                )}
                                {item.status === "disetujui" && (
                                  <Badge className="bg-green-100 text-green-700 border-green-300">
                                    Disetujui
                                  </Badge>
                                )}
                                {item.status === "menunggu_review" && (
                                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                                    Menunggu Review
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center gap-2 text-gray-700">
                                  <FileText className="h-4 w-4" />
                                  <span className="font-medium">{item.fileName}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Clock className="h-4 w-4" />
                                  <span>
                                    Diupload: {formatDate(item.uploadedAt)}
                                  </span>
                                </div>
                                <div className="text-gray-600">
                                  <span>Ukuran: {formatFileSize(item.fileSize)}</span>
                                </div>
                              </div>
                              
                              {item.revisionMessage && (
                                <Alert className="mt-3 bg-orange-50 border-orange-200">
                                  <AlertCircle className="h-4 w-4 text-orange-600" />
                                  <AlertDescription className="text-orange-800 text-xs">
                                    <strong>Pesan Revisi:</strong>
                                    <p className="mt-1">{item.revisionMessage}</p>
                                    {item.reviewedBy && (
                                      <p className="text-xs mt-2">
                                        Direview oleh: {item.reviewedBy} pada {formatDate(item.reviewedAt!)}
                                      </p>
                                    )}
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Preview Nilai dari Dosen - Show if nilai available */}
            {hasGradeFromDosen && nilaiKP.tanggalPenilaian && (
              <Card className="mb-4 bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <CheckCircle2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-blue-900 mb-2">
                        Nilai KP Sudah Diberikan
                      </h3>
                      <p className="text-blue-800 text-sm mb-4">
                        Dosen {nilaiKP.dosenPenguji} telah memberikan penilaian untuk Kerja Praktik Anda.
                      </p>
                      
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <h4 className="font-semibold text-gray-900 mb-3">Rincian Nilai:</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Kesesuaian Laporan dengan Format (30%):</span>
                            <span className="font-semibold">{nilaiKP.kesesuaianLaporan}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Penguasaan Materi KP (30%):</span>
                            <span className="font-semibold">{nilaiKP.penguasaanMateri}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Analisis dan Perancangan (30%):</span>
                            <span className="font-semibold">{nilaiKP.analisisPerancangan}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Sikap dan Etika (10%):</span>
                            <span className="font-semibold">{nilaiKP.sikapEtika}</span>
                          </div>
                          <div className="border-t border-gray-200 pt-2 mt-2">
                            <div className="flex justify-between text-base">
                              <span className="font-semibold text-gray-900">Rata-rata:</span>
                              <span className="font-bold text-blue-600">
                                {(
                                  (nilaiKP.kesesuaianLaporan * 0.3) +
                                  (nilaiKP.penguasaanMateri * 0.3) +
                                  (nilaiKP.analisisPerancangan * 0.3) +
                                  (nilaiKP.sikapEtika * 0.1)
                                ).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-blue-200 text-xs text-blue-700">
                          <p>Dinilai oleh: {nilaiKP.dosenPenguji} (NIP: {nilaiKP.nipDosen})</p>
                          <p>Tanggal: {nilaiKP.tanggalPenilaian && new Date(nilaiKP.tanggalPenilaian).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long', 
                            year: 'numeric'
                          })}</p>
                        </div>
                      </div>
                      
                      {/* Tombol Cetak PDF - langsung tersedia */}
                      <div className="mt-4">
                        <Button 
                          onClick={handlePrintFormNilai}
                          size="lg"
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          <Printer className="h-5 w-5 mr-2" />
                          Cetak Form Nilai KP (PDF)
                        </Button>
                        
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs text-blue-800 font-medium mb-1">
                            📝 Cara menyimpan sebagai PDF:
                          </p>
                          <ol className="text-xs text-blue-700 space-y-1 ml-4 list-decimal">
                            <li>Klik tombol di atas</li>
                            <li>Pilih "Save as PDF" atau "Microsoft Print to PDF"</li>
                            <li>Di "More settings", hilangkan centang "Headers and footers"</li>
                            <li>Klik Save</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upload Form */}
            {(laporan.status === "belum_upload" || laporan.status === "perlu_revisi") && (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* File Upload */}
                    <div>
                      <Label htmlFor="file-upload" className="text-base font-semibold">
                        Laporan Kerja Praktik (PDF) <span className="text-red-500">*</span>
                      </Label>
                      <div className="mt-2 border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                        <input
                          id="file-upload"
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <UploadIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm font-medium">
                            {selectedFile ? selectedFile.name : "Klik untuk upload atau drag and drop file"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PDF (max. 10MB)
                          </p>
                        </label>
                      </div>
                    </div>

                    {/* Revision Status */}
                    <div>
                      <Label htmlFor="revision-status" className="text-base font-semibold">
                        Status Revisi <span className="text-red-500">*</span>
                      </Label>
                      <Select value={revisionStatus} onValueChange={(value: any) => setRevisionStatus(value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="-- Pilih Status --" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tidak-revisi">Tidak Ada Revisi</SelectItem>
                          <SelectItem value="revisi">Ada Revisi</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Pilih "Tidak Ada Revisi" jika dokumen sudah final, atau "Ada Revisi" jika masih akan direvisi
                      </p>
                    </div>

                    {/* Submit Button */}
                    <Button
                      onClick={handleUploadLaporan}
                      disabled={!selectedFile || !revisionStatus || isLoading}
                      className="w-full"
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Mengupload...
                        </>
                      ) : (
                        <>
                          <UploadIcon className="h-4 w-4 mr-2" />
                          Kirim Laporan
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

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
              disabled={laporan.status !== "disetujui"}
            >
              <Link to="/mahasiswa/kp/penilaian">
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
