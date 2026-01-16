import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  Eye
} from "lucide-react";

interface RevisionReviewSectionProps {
  studentId: string;
  onAllRevisionsApproved: (approved: boolean) => void;
}

interface Revision {
  id: string;
  type: string;
  fileName: string;
  fileSize: string;
  submittedAt: string;
  version: number;
  status: "pending" | "approved" | "rejected";
  rejectReason?: string;
}

export function RevisionReviewSection({
  studentId,
  onAllRevisionsApproved,
}: RevisionReviewSectionProps) {
  const [activeTab, setActiveTab] = useState("menunggu");
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRevisionId, setSelectedRevisionId] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // Mock data - replace with real API data
  const [revisions, setRevisions] = useState<Revision[]>([
    {
      id: "rev-1",
      type: "Laporan KP",
      fileName: "Laporan_KP_RizkiMaulana_Final.pdf",
      fileSize: "2.5 MB",
      submittedAt: "2026-01-10T14:30:00",
      version: 3,
      status: "pending",
    },
    {
      id: "rev-2",
      type: "Slide Presentasi",
      fileName: "Presentasi_KP_RizkiMaulana.pptx",
      fileSize: "1.8 MB",
      submittedAt: "2026-01-10T14:35:00",
      version: 2,
      status: "pending",
    },
  ]);

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

  // Check if all revisions are approved whenever revisions change
  useEffect(() => {
    const allApproved = revisions.every((rev) => rev.status === "approved");
    const hasRejected = revisions.some((rev) => rev.status === "rejected");
    
    // Only trigger callback if all are approved, or if any is rejected (unlock becomes false)
    onAllRevisionsApproved(allApproved && !hasRejected);
  }, [revisions, onAllRevisionsApproved]);

  const handleApproveRevision = (revisionId: string) => {
    if (confirm("Apakah Anda yakin ingin menyetujui revisi ini?")) {
      setRevisions((prev) =>
        prev.map((rev) =>
          rev.id === revisionId ? { ...rev, status: "approved" as const } : rev
        )
      );
    }
  };

  const handleRejectRevision = (revisionId: string) => {
    setSelectedRevisionId(revisionId);
    setShowRejectDialog(true);
  };

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) {
      alert("Mohon berikan alasan penolakan");
      return;
    }
    
    if (selectedRevisionId) {
      setRevisions((prev) =>
        prev.map((rev) =>
          rev.id === selectedRevisionId
            ? { ...rev, status: "rejected" as const, rejectReason: rejectReason }
            : rev
        )
      );
    }
    
    setShowRejectDialog(false);
    setRejectReason("");
    setSelectedRevisionId(null);
  };

  const pendingRevisions = revisions.filter((r) => r.status === "pending");
  const approvedRevisions = revisions.filter((r) => r.status === "approved");
  const rejectedRevisions = revisions.filter((r) => r.status === "rejected");

  const allApproved = revisions.every((rev) => rev.status === "approved");
  const hasRejected = revisions.some((rev) => rev.status === "rejected");

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Status Revisi</CardTitle>
            {pendingRevisions.length > 0 && !hasRejected && (
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                Menunggu Review
              </Badge>
            )}
            {allApproved && (
              <Badge className="gap-1 bg-green-600">
                <CheckCircle className="h-3 w-3" />
                Semua Disetujui
              </Badge>
            )}
            {hasRejected && (
              <Badge variant="destructive" className="gap-1">
                <XCircle className="h-3 w-3" />
                Ada yang Ditolak
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              {pendingRevisions.length > 0 && !hasRejected && 
                "Review dan setujui semua dokumen revisi mahasiswa untuk melanjutkan ke tahap penilaian."}
              {allApproved && 
                "Semua revisi telah disetujui. Anda dapat melanjutkan ke tab Penilaian untuk memberikan nilai."}
              {hasRejected && 
                "Ada revisi yang ditolak. Mahasiswa perlu melakukan perbaikan sesuai catatan Anda."}
            </p>
            {/* Progress indicator */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${allApproved ? 'bg-green-600' : hasRejected ? 'bg-red-600' : 'bg-blue-600'}`}
                  style={{ width: `${(approvedRevisions.length / revisions.length) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-600">
                {approvedRevisions.length}/{revisions.length} Disetujui
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="menunggu" className="gap-2">
            Menunggu
            {pendingRevisions.length > 0 && (
              <Badge variant="destructive" className="rounded-full px-2 py-0 text-xs">
                {pendingRevisions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="disetujui">
            Disetujui
          </TabsTrigger>
          <TabsTrigger value="ditolak">
            Ditolak
          </TabsTrigger>
        </TabsList>

        {/* Menunggu Tab */}
        <TabsContent value="menunggu" className="mt-6 space-y-4">
          {pendingRevisions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Tidak ada revisi yang menunggu review</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {pendingRevisions.map((revision) => (
                <Card key={revision.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">{revision.type}</Badge>
                              <Badge variant="secondary">Versi {revision.version}</Badge>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {revision.fileName}
                            </h4>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <span>{revision.fileSize}</span>
                              <span>•</span>
                              <span>Diunggah: {formatDate(revision.submittedAt)}</span>
                            </div>
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
                      
                      {/* Action Buttons per Document */}
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          onClick={() => handleApproveRevision(revision.id)}
                          className="flex-1 gap-2"
                          size="sm"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Setujui Revisi
                        </Button>
                        <Button
                          onClick={() => handleRejectRevision(revision.id)}
                          variant="destructive"
                          className="flex-1 gap-2"
                          size="sm"
                        >
                          <XCircle className="h-4 w-4" />
                          Tolak Revisi
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </TabsContent>

        {/* Disetujui Tab */}
        <TabsContent value="disetujui" className="mt-6">
          {approvedRevisions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <p className="text-gray-600">Belum ada revisi yang disetujui</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {approvedRevisions.map((revision) => (
                <Card key={revision.id} className="border-green-200 bg-green-50/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <FileText className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="border-green-600 text-green-700">
                              {revision.type}
                            </Badge>
                            <Badge className="bg-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Disetujui
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {revision.fileName}
                          </h4>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span>{revision.fileSize}</span>
                            <span>•</span>
                            <span>Diunggah: {formatDate(revision.submittedAt)}</span>
                          </div>
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
              ))}
            </div>
          )}
        </TabsContent>

        {/* Ditolak Tab */}
        <TabsContent value="ditolak" className="mt-6">
          {rejectedRevisions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <XCircle className="h-12 w-12 text-red-600 mx-auto mb-3" />
                <p className="text-gray-600">Belum ada revisi yang ditolak</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {rejectedRevisions.map((revision) => (
                <Card key={revision.id} className="border-red-200 bg-red-50/50">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-3 bg-red-100 rounded-lg">
                            <FileText className="h-6 w-6 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="border-red-600 text-red-700">
                                {revision.type}
                              </Badge>
                              <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1" />
                                Ditolak
                              </Badge>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {revision.fileName}
                            </h4>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <span>{revision.fileSize}</span>
                              <span>•</span>
                              <span>Diunggah: {formatDate(revision.submittedAt)}</span>
                            </div>
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
                      {revision.rejectReason && (
                        <div className="bg-white rounded-lg p-3 border border-red-200">
                          <p className="text-sm font-semibold text-red-800 mb-1">Alasan Penolakan:</p>
                          <p className="text-sm text-gray-700">{revision.rejectReason}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Revisi</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan untuk dokumen ini. Mahasiswa akan menerima catatan Anda.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="reject-reason" className="text-base font-semibold">
                Alasan Penolakan <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Jelaskan apa yang perlu diperbaiki mahasiswa..."
                className="mt-2 min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason("");
                setSelectedRevisionId(null);
              }}
            >
              Batal
            </Button>
            <Button variant="destructive" onClick={handleRejectSubmit}>
              Tolak Revisi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
