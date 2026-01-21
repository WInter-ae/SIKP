import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  Eye,
  Send
} from "lucide-react";

interface RevisionReviewSectionProps {
  studentId: string;
  onAllRevisionsApproved: (approved: boolean) => void;
}

type RevisionDecision = "undecided" | "needs-revision" | "no-revision";

interface LaporanRevision {
  fileName: string;
  fileSize: string;
  submittedAt: string;
  version: number;
  revisionMessage?: string;
  revisionHistory: Array<{
    version: number;
    message: string;
    submittedAt: string;
    status: "pending" | "revised";
  }>;
}

export function RevisionReviewSection({
  studentId,
  onAllRevisionsApproved,
}: RevisionReviewSectionProps) {
  const [decision, setDecision] = useState<RevisionDecision>("undecided");
  const [revisionMessage, setRevisionMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasLaporan, setHasLaporan] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load laporan from localStorage (uploaded by mahasiswa)
  const [laporan, setLaporan] = useState<LaporanRevision>({
    fileName: "",
    fileSize: "0 MB",
    submittedAt: "",
    version: 1,
    revisionHistory: [],
  });

  // Load data when component mounts
  useEffect(() => {
    if (typeof window !== "undefined" && !isInitialized) {
      const savedLaporan = localStorage.getItem("laporan-kp");
      
      if (savedLaporan) {
        const laporanData = JSON.parse(savedLaporan);
        
        // Check if mahasiswa has uploaded a file
        if (laporanData.fileName && laporanData.status !== "belum_upload") {
          setHasLaporan(true);
          
          // Convert to revision format
          const fileSize = laporanData.fileSize 
            ? `${(laporanData.fileSize / (1024 * 1024)).toFixed(2)} MB`
            : "0 MB";
          
          setLaporan({
            fileName: laporanData.fileName || "Laporan_KP.pdf",
            fileSize: fileSize,
            submittedAt: laporanData.uploadedAt || new Date().toISOString(),
            version: 1,
            revisionHistory: [],
          });
          
          // Check if dosen already made decision
          const savedDecision = localStorage.getItem(`revision-decision-${studentId}`);
          if (savedDecision) {
            setDecision(savedDecision as RevisionDecision);
            
            // If decision is no-revision, immediately notify parent
            if (savedDecision === "no-revision") {
              onAllRevisionsApproved(true);
            }
          }
          
          // Load revision message if exists
          const savedRevisionMsg = localStorage.getItem(`revision-message-${studentId}`);
          if (savedRevisionMsg) {
            setRevisionMessage(savedRevisionMsg);
          }
        } else {
          // No laporan uploaded yet
          setHasLaporan(false);
        }
      } else {
        // No laporan data at all
        setHasLaporan(false);
      }
      
      setIsInitialized(true);
    }
  }, [studentId, onAllRevisionsApproved, isInitialized]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Update parent when decision changes (only after initialization)
  useEffect(() => {
    if (isInitialized) {
      if (decision === "no-revision") {
        onAllRevisionsApproved(true);
      } else {
        onAllRevisionsApproved(false);
      }
    }
  }, [decision, onAllRevisionsApproved, isInitialized]);

  const handleDecideNeedsRevision = () => {
    setDecision("needs-revision");
  };

  const handleDecideNoRevision = () => {
    if (confirm("Apakah Anda yakin dokumen sudah sempurna dan tidak memerlukan revisi?")) {
      setDecision("no-revision");
      
      // Save decision to localStorage
      localStorage.setItem(`revision-decision-${studentId}`, "no-revision");
      
      // Update laporan status in mahasiswa's data
      const savedLaporan = localStorage.getItem("laporan-kp");
      if (savedLaporan) {
        const laporanData = JSON.parse(savedLaporan);
        laporanData.status = "disetujui";
        laporanData.reviewedAt = new Date().toISOString();
        laporanData.reviewedBy = "Dosen Pembimbing";
        localStorage.setItem("laporan-kp", JSON.stringify(laporanData));
        
        // Update revision history - mark latest as approved
        const savedHistory = localStorage.getItem("revision-history-kp");
        if (savedHistory) {
          const historyData = JSON.parse(savedHistory);
          if (historyData.length > 0) {
            // Update latest item in history
            const latestIndex = historyData.length - 1;
            historyData[latestIndex] = {
              ...historyData[latestIndex],
              status: "disetujui",
              reviewedAt: new Date().toISOString(),
              reviewedBy: "Dosen Pembimbing"
            };
            localStorage.setItem("revision-history-kp", JSON.stringify(historyData));
          }
        }
      }
    }
  };

  const handleSendRevisionMessage = async () => {
    if (!revisionMessage.trim()) {
      alert("Mohon tulis pesan revisi untuk mahasiswa");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Add to history and reset
    setLaporan(prev => ({
      ...prev,
      revisionHistory: [
        ...prev.revisionHistory,
        {
          version: prev.version,
          message: revisionMessage,
          submittedAt: new Date().toISOString(),
          status: "pending",
        }
      ],
      revisionMessage: revisionMessage,
    }));
    
    // Save decision and message to localStorage
    localStorage.setItem(`revision-decision-${studentId}`, "needs-revision");
    localStorage.setItem(`revision-message-${studentId}`, revisionMessage);
    
    // Update laporan status in mahasiswa's data
    const savedLaporan = localStorage.getItem("laporan-kp");
    if (savedLaporan) {
      const laporanData = JSON.parse(savedLaporan);
      laporanData.status = "perlu_revisi";
      laporanData.revisionMessage = revisionMessage;
      laporanData.reviewedAt = new Date().toISOString();
      laporanData.reviewedBy = "Dosen Pembimbing";
      localStorage.setItem("laporan-kp", JSON.stringify(laporanData));
      
      // Update revision history - add revision info to latest version
      const savedHistory = localStorage.getItem("revision-history-kp");
      if (savedHistory) {
        const historyData = JSON.parse(savedHistory);
        if (historyData.length > 0) {
          // Update latest item in history with revision info
          const latestIndex = historyData.length - 1;
          historyData[latestIndex] = {
            ...historyData[latestIndex],
            status: "perlu_revisi",
            revisionMessage: revisionMessage,
            reviewedAt: new Date().toISOString(),
            reviewedBy: "Dosen Pembimbing"
          };
          localStorage.setItem("revision-history-kp", JSON.stringify(historyData));
        }
      }
    }
    
    alert("Pesan revisi berhasil dikirim ke mahasiswa");
    setRevisionMessage("");
    setIsSubmitting(false);
  };

  const handleResetDecision = () => {
    if (confirm("Apakah Anda yakin ingin mereset keputusan revisi? Mahasiswa perlu upload ulang.")) {
      setDecision("undecided");
      setRevisionMessage("");
      
      // Clear localStorage
      localStorage.removeItem(`revision-decision-${studentId}`);
      localStorage.removeItem(`revision-message-${studentId}`);
      
      // Reset laporan status in mahasiswa's data
      const savedLaporan = localStorage.getItem("laporan-kp");
      if (savedLaporan) {
        const laporanData = JSON.parse(savedLaporan);
        laporanData.status = "belum_upload";
        delete laporanData.revisionMessage;
        delete laporanData.reviewedAt;
        delete laporanData.reviewedBy;
        localStorage.setItem("laporan-kp", JSON.stringify(laporanData));
      }
      
      // Clear revision history
      localStorage.removeItem("revision-history-kp");
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert if no laporan uploaded yet */}
      {!hasLaporan && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Belum Ada Laporan</strong>
            <p className="mt-1">
              Mahasiswa belum mengupload Laporan Kerja Praktik. Halaman revisi akan aktif setelah mahasiswa mengupload laporan.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Decision Stage: Undecided */}
      {hasLaporan && decision === "undecided" && (
        <>
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Tidak Ada Revisi Diperlukan</strong>
              <p className="mt-1">
                Jika dokumen mahasiswa sudah sempurna dan tidak memerlukan revisi, 
                aktifkan opsi ini untuk langsung memberikan penilaian.
              </p>
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Pilih Keputusan Revisi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Mahasiswa telah mengirimkan laporan Kerja Praktik. Silakan tentukan apakah dokumen memerlukan revisi atau tidak.
              </p>

              {/* Laporan Info */}
              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">Laporan KP</Badge>
                        <Badge variant="secondary">Versi {laporan.version}</Badge>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {laporan.fileName}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span>{laporan.fileSize}</span>
                        <span>•</span>
                        <span>Diunggah: {formatDate(laporan.submittedAt)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        Lihat
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Unduh
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Revision History */}
              {laporan.revisionHistory.length > 0 && (
                <Card className="bg-gray-50">
                  <CardHeader className="pb-3">
                    <h4 className="font-medium text-sm text-gray-700">Riwayat Revisi</h4>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {laporan.revisionHistory.map((history, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            Versi {history.version}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(history.submittedAt)}
                          </span>
                        </div>
                        <p className="text-gray-700">{history.message}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Decision Buttons */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <Button
                  onClick={handleDecideNeedsRevision}
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 border-2 hover:border-orange-500 hover:bg-orange-50"
                >
                  <XCircle className="h-6 w-6 text-orange-600" />
                  <span className="font-semibold">Perlu Revisi</span>
                  <span className="text-xs text-gray-600 font-normal">
                    Dokumen perlu diperbaiki
                  </span>
                </Button>
                <Button
                  onClick={handleDecideNoRevision}
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 border-2 hover:border-green-500 hover:bg-green-50"
                >
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="font-semibold">Tidak Perlu Revisi</span>
                  <span className="text-xs text-gray-600 font-normal">
                    Dokumen sudah sempurna
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Decision Stage: Needs Revision */}
      {hasLaporan && decision === "needs-revision" && (
        <>
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Dokumen Memerlukan Revisi</strong>
              <p className="mt-1">
                Review dokumen dan berikan pesan revisi yang jelas kepada mahasiswa. 
                Mahasiswa akan memperbaiki dan mengirim ulang dokumen.
              </p>
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Review Laporan KP</CardTitle>
                <Button variant="ghost" size="sm" onClick={handleResetDecision}>
                  Ubah Keputusan
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Document Preview */}
              <Card className="border-2 border-orange-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <FileText className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="border-orange-600 text-orange-700">
                          Laporan KP
                        </Badge>
                        <Badge variant="secondary">Versi {laporan.version}</Badge>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {laporan.fileName}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span>{laporan.fileSize}</span>
                        <span>•</span>
                        <span>Diunggah: {formatDate(laporan.submittedAt)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        Lihat
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Unduh
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Revision Message Form */}
              <div className="space-y-3">
                <Label htmlFor="revision-message" className="text-base font-semibold">
                  Pesan Revisi <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="revision-message"
                  value={revisionMessage}
                  onChange={(e) => setRevisionMessage(e.target.value)}
                  placeholder="Jelaskan secara detail bagian mana yang perlu diperbaiki mahasiswa..."
                  className="min-h-[150px]"
                />
                <p className="text-sm text-gray-600">
                  💡 Berikan instruksi yang jelas dan spesifik agar mahasiswa dapat memperbaiki dengan tepat.
                </p>
              </div>

              {/* Send Revision Button */}
              <Button
                onClick={handleSendRevisionMessage}
                disabled={isSubmitting || !revisionMessage.trim()}
                className="w-full gap-2"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Mengirim..." : "Kirim Pesan Revisi"}
              </Button>

              {/* Revision History */}
              {laporan.revisionHistory.length > 0 && (
                <Card className="bg-gray-50 mt-4">
                  <CardHeader className="pb-3">
                    <h4 className="font-medium text-sm text-gray-700">Riwayat Revisi Sebelumnya</h4>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {laporan.revisionHistory.map((history, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            Versi {history.version}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(history.submittedAt)}
                          </span>
                        </div>
                        <p className="text-gray-700">{history.message}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Decision Stage: No Revision Needed */}
      {hasLaporan && decision === "no-revision" && (
        <>
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Dokumen Disetujui</strong>
              <p className="mt-1">
                Dokumen tidak memerlukan revisi. Anda dapat melanjutkan ke tab Penilaian untuk memberikan nilai.
              </p>
            </AlertDescription>
          </Alert>

          <Card className="border-2 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Disetujui
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {laporan.fileName}
                  </h4>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>{laporan.fileSize}</span>
                    <span>•</span>
                    <span>Diunggah: {formatDate(laporan.submittedAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Eye className="h-4 w-4" />
                    Lihat
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Unduh
                  </Button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button variant="ghost" size="sm" onClick={handleResetDecision}>
                  Ubah Keputusan
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
