import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  Building,
  Check,
  ClipboardCheck,
  Eye,
  FileText,
  FolderOpen,
  Users,
  X,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

import type { Application, DocumentFile } from "../types";

interface ReviewModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (docReviews: Record<string, "approved" | "rejected">) => void;
  onReject: (
    comment: string,
    docReviews: Record<string, "approved" | "rejected">,
  ) => void;
}

function ReviewModal({
  application,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: ReviewModalProps) {
  const [comment, setComment] = useState("");
  const [docReviews, setDocReviews] = useState<
    Record<string, "approved" | "rejected">
  >({});

  // Initialize docReviews from saved reviews if application is already reviewed
  useEffect(() => {
    if (application?.documentReviews) {
      setDocReviews(application.documentReviews);
    } else {
      setDocReviews({});
    }

    // ✅ FIX: Jika status PENDING_REVIEW tapi ada REJECTED sebelumnya (re-submission),
    // clear old document reviews agar admin bisa review ulang dari awal
    if (application?.status === "pending" && application?.statusHistory && application.statusHistory.length > 0) {
      const hasRejection = application.statusHistory.some((entry) => entry.status === "REJECTED");
      if (hasRejection) {
        console.log("🔄 Clearing old document reviews for re-submission after rejection");
        setDocReviews({});
      }
    }

    // Debug: log documents received by modal - VERY DETAILED
    console.log("📋 ReviewModal received application:", {
      applicationId: application?.id,
      documentsCount: application?.documents?.length || 0,
      documents: application?.documents?.map((d) => ({
        id: d.id,
        title: d.title,
        uploadedBy: d.uploadedBy,
        uploadDate: d.uploadDate,
        url: d.url,
        status: d.status,
        fullObject: d,
      })),
      rawApplication: application,
    });
  }, [
    application?.id,
    application?.documentReviews,
    application?.documents,
    application,
  ]);

  // Group documents by title
  const groupedDocuments = useMemo<Record<string, DocumentFile[]>>(() => {
    if (!application) {
      console.log("📂 groupedDocuments: No application yet");
      return {};
    }

    console.log("📂 Starting to group documents:", {
      applicationId: application.id,
      documentsArray: application.documents,
      documentsCount: application.documents.length,
    });

    const groups: Record<string, DocumentFile[]> = {};
    application.documents.forEach((doc, index) => {
      console.log(`📂 Processing document ${index}:`, {
        docId: doc.id,
        title: doc.title,
        titleType: typeof doc.title,
        titleUndefined: doc.title === "undefined",
        titleEmpty: !doc.title,
      });

      if (!groups[doc.title]) {
        groups[doc.title] = [];
      }
      groups[doc.title].push(doc);
    });

    console.log("📂 Final grouped documents:", {
      applicationId: application.id,
      documentCount: application.documents.length,
      groupCount: Object.keys(groups).length,
      groups: Object.keys(groups),
      groupDetails: Object.entries(groups).map(([title, docs]) => ({
        title,
        count: docs.length,
        docs: docs.map((d) => ({ id: d.id, uploadedBy: d.uploadedBy })),
      })),
    });

    return groups;
  }, [application]);

  // Gabungkan dokumen standar dengan dokumen yang sudah diupload
  // agar section dokumen tetap muncul walaupun belum ada yang upload
  const allDocumentTitles = useMemo(() => {
    if (!application) return [];
    const standardDocs = [
      "Surat Proposal",
      "Surat Kesediaan",
      "Form Permohonan",
      "KRS Semester 4",
      "Daftar Kumpulan Nilai",
      "Bukti Pembayaran UKT",
    ];
    const uploadedTitles = Object.keys(groupedDocuments).filter(
      (title) => title && title !== "undefined",
    );
    
    // ✅ EXCLUDE SURAT_PENGANTAR from upload review section
    // It's only created by backend on approval, not uploaded by students
    const filteredUploadedTitles = uploadedTitles.filter(
      (title) => title !== "Surat Pengantar Kerja Praktik"
    );
    
    const allTitles = Array.from(new Set([...standardDocs, ...filteredUploadedTitles]));

    console.log("📋 All document titles in modal:", {
      applicationId: application.id,
      standardDocsCount: standardDocs.length,
      uploadedTitlesCount: filteredUploadedTitles.length,
      uploadedTitles: filteredUploadedTitles,
      allTitlesCount: allTitles.length,
      allTitles,
    });

    return allTitles;
  }, [application, groupedDocuments]);

  // Cek apakah ada dokumen yang belum dikumpulkan (missing)
  const hasMissingDocs = useMemo(() => {
    if (!application) return false;

    return allDocumentTitles.some((title) => {
      const docs = groupedDocuments[title] || [];

      if (title === "Surat Proposal") {
        return docs.length === 0;
      } else {
        return application.members.some(
          (member) => !docs.find((d) => d.uploadedBy === member.name),
        );
      }
    });
  }, [allDocumentTitles, groupedDocuments, application]);

  // Cek apakah semua dokumen yang diupload sudah direview
  const allDocsReviewed = useMemo(() => {
    if (!application) return false;
    return application.documents.every((doc) => docReviews[doc.id]);
  }, [application, docReviews]);

  const handleDocAction = (docId: string, action: "approved" | "rejected") => {
    setDocReviews((prev) => ({
      ...prev,
      [docId]: action,
    }));
  };

  const hasRejectedDocs = Object.values(docReviews).some(
    (status) => status === "rejected",
  );

  const handleRejectApplication = () => {
    if (hasRejectedDocs && !comment.trim()) {
      toast.warning(
        "Karena ada dokumen yang ditolak, Anda wajib memberikan catatan review.",
      );
      return;
    }
    if (!comment.trim()) {
      if (!comment.trim()) {
        toast(
          "Apakah Anda yakin ingin menolak tanpa catatan? (Disarankan memberikan alasan)",
          {
            action: {
              label: "Tolak tanpa catatan",
              onClick: () => {
                onReject("", docReviews);
                resetState();
              },
            },
          },
        );
        return;
      }
    }
    onReject(comment, docReviews);
    resetState();
  };

  const handleApproveApplication = () => {
    if (hasRejectedDocs) {
      toast.warning(
        "Tidak dapat menyetujui pengajuan karena terdapat dokumen yang ditolak. Silakan tolak pengajuan untuk meminta revisi.",
      );
      return;
    }
    if (hasMissingDocs) {
      toast.warning(
        "Tidak dapat menyetujui pengajuan karena dokumen belum lengkap.",
      );
      return;
    }
    if (!allDocsReviewed) {
      toast.warning(
        "Harap review semua dokumen yang diupload terlebih dahulu.",
      );
      return;
    }
    onApprove(docReviews);
    resetState();
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const resetState = () => {
    setComment("");
    setDocReviews({});
  };

  // Helper function to render document item
  const renderDocItem = (doc: DocumentFile) => {
    const status = docReviews[doc.id];
    const isEditable = application && application.status === "pending";
    return (
      <div
        key={doc.id}
        className={`flex items-center justify-between p-3 bg-card rounded border ${
          status === "rejected"
            ? "border-destructive/50 bg-destructive/10"
            : status === "approved"
              ? "border-green-500/50 bg-green-500/10"
              : "border-border"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 text-green-600 rounded flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {doc.uploadedBy}
            </p>
            <p className="text-xs text-muted-foreground">{doc.uploadDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
            title="Lihat Dokumen"
            onClick={() => window.open(doc.url || "#", "_blank")}
          >
            <Eye className="w-4 h-4" />
          </Button>

          {isEditable && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDocAction(doc.id, "approved")}
                className={`h-8 w-8 ${
                  status === "approved"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "text-muted-foreground hover:text-green-600 hover:bg-green-500/10"
                }`}
                title="Setujui Dokumen"
              >
                <Check className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDocAction(doc.id, "rejected")}
                className={`h-8 w-8 ${
                  status === "rejected"
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                }`}
                title="Tolak Dokumen"
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          )}

          {!isEditable && status && (
            <>
              {status === "approved" && (
                <Button
                  variant="ghost"
                  size="icon"
                  disabled
                  className="h-8 w-8 bg-green-600 text-white"
                  title="Dokumen Disetujui"
                >
                  <Check className="w-4 h-4" />
                </Button>
              )}
              {status === "rejected" && (
                <Button
                  variant="ghost"
                  size="icon"
                  disabled
                  className="h-8 w-8 bg-destructive text-destructive-foreground"
                  title="Dokumen Ditolak"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  // Helper function to render missing document item
  const renderMissingDocItem = (memberName: string, key: string) => (
    <div
      key={key}
      className="flex items-center justify-between p-3 bg-muted rounded border border-dashed border-border"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-muted-foreground/20 text-muted-foreground rounded flex items-center justify-center">
          <X className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{memberName}</p>
          <p className="text-xs text-destructive font-medium italic">
            Belum diupload
          </p>
        </div>
      </div>
    </div>
  );

  if (!application) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="min-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
        aria-label="Review Pengajuan Surat Pengantar"
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl">
            Review Pengajuan Surat Pengantar
          </DialogTitle>
          <DialogDescription>
            Modal untuk admin meninjau dan menyetujui atau menolak pengajuan
            surat pengantar dari mahasiswa dengan dokumen lengkap.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-4 flex-1 overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* 1. Informasi Mahasiswa (Tim) */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary" />
                Informasi Mahasiswa (Tim Kerja Praktik)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Dosen Pembimbing Akademik (Ketua):
                </p>
                <p className="font-semibold text-primary text-lg">
                  {application.supervisor}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {application.members.map((member) => (
                  <div
                    key={member.id}
                    className={`p-4 rounded-lg border ${
                      member.role === "Ketua"
                        ? "border-primary/30 bg-primary/5"
                        : "border-border bg-muted/50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <Badge
                        variant={
                          member.role === "Ketua" ? "default" : "secondary"
                        }
                      >
                        {member.role}
                      </Badge>
                    </div>
                    <p className="font-bold text-foreground">{member.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.nim}
                    </p>
                    <p className="text-sm text-muted-foreground/80">
                      {member.prodi}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 2. Informasi Kerja Praktik */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Building className="w-5 h-5 mr-2 text-primary" />
                Informasi Kerja Praktik
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label>Tujuan Surat</Label>
                  <Input
                    value={application.internship.tujuanSurat}
                    readOnly
                    className="bg-muted cursor-not-allowed"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Nama Tempat/Perusahaan</Label>
                  <Input
                    value={application.internship.namaTempat}
                    readOnly
                    className="bg-muted cursor-not-allowed"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Alamat Tempat</Label>
                  <Textarea
                    value={application.internship.alamatTempat}
                    readOnly
                    rows={3}
                    className="bg-muted cursor-not-allowed resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tanggal Mulai</Label>
                  <Input
                    value={application.internship.tanggalMulai}
                    readOnly
                    className="bg-muted cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tanggal Selesai</Label>
                  <Input
                    value={application.internship.tanggalSelesai}
                    readOnly
                    className="bg-muted cursor-not-allowed"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Nama Unit/Divisi</Label>
                  <Input
                    value={application.internship.divisi}
                    readOnly
                    className="bg-muted cursor-not-allowed"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Dokumen yang Diupload */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary" />
                Dokumen yang Diupload
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="space-y-4">
                {allDocumentTitles.map((title) => {
                  const docs = groupedDocuments[title] || [];
                  console.log(`📄 Rendering accordion for "${title}":`, {
                    title,
                    docsCount: docs.length,
                    docs: docs.map((d) => ({
                      id: d.id,
                      uploadedBy: d.uploadedBy,
                    })),
                  });

                  return (
                    <AccordionItem
                      key={title}
                      value={title}
                      className="bg-muted/50 rounded-lg border border-border px-4"
                    >
                      <AccordionTrigger className="hover:no-underline py-3">
                        <h4 className="font-semibold text-foreground flex items-center">
                          <FolderOpen className="w-4 h-4 mr-2 text-yellow-500" />
                          {title}
                        </h4>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pb-2">
                          {title === "Surat Proposal"
                            ? docs.length > 0
                              ? docs.map((doc) => renderDocItem(doc))
                              : renderMissingDocItem(
                                  "Ketua Tim",
                                  "missing-proposal",
                                )
                            : application.members.map((member) => {
                                const doc = docs.find(
                                  (d) => d.uploadedBy === member.name,
                                );
                                if (doc) {
                                  return renderDocItem(doc);
                                } else {
                                  return renderMissingDocItem(
                                    member.name,
                                    `missing-${member.id}-${title}`,
                                  );
                                }
                              })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>

          {/* 4. Review Pengajuan */}
          {application.status === "pending" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <ClipboardCheck className="w-5 h-5 mr-2 text-primary" />
                  Review Pengajuan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasRejectedDocs && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Terdapat dokumen yang ditolak. Anda <strong>wajib</strong>{" "}
                      memberikan catatan review untuk menjelaskan alasan
                      penolakan kepada mahasiswa.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label>
                    Catatan Review{" "}
                    {hasRejectedDocs && (
                      <span className="text-destructive">*</span>
                    )}
                  </Label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className={
                      hasRejectedDocs && !comment
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }
                    rows={4}
                    placeholder={
                      hasRejectedDocs
                        ? "Jelaskan alasan penolakan dokumen..."
                        : "Tambahkan catatan untuk mahasiswa (opsional)..."
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* 5. Surat Pengantar (hanya tampil jika status approved) */}
          {application.status === "approved" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-green-600" />
                  Surat Pengantar Kerja Praktik
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-600 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                        Surat Pengantar Telah Disetujui
                      </p>
                      <p className="text-sm text-green-800 dark:text-green-200 mb-4">
                        Surat pengantar kerja praktik telah berhasil dibuat dan
                        dapat diunduh oleh mahasiswa.
                      </p>
                      <Button
                        variant="outline"
                        className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Lihat Surat Pengantar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 6. Komentar Penolakan (hanya tampil jika status rejected) */}
          {application.status === "rejected" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <X className="w-5 h-5 mr-2 text-destructive" />
                  Komentar Penolakan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/30">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-destructive text-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-destructive mb-2">
                        Pengajuan Ditolak
                      </p>
                      <p className="text-sm text-destructive/90 whitespace-pre-wrap">
                        {application.rejectionComment || "Tidak ada komentar"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex-shrink-0 border-t border-border pt-4">
          <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
            <Button variant="outline" onClick={handleClose}>
              {application.status === "approved" ||
              application.status === "rejected"
                ? "Tutup"
                : "Batal"}
            </Button>
            {application.status === "pending" && (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="destructive"
                  onClick={handleRejectApplication}
                  disabled={!allDocsReviewed}
                >
                  <X className="w-4 h-4 mr-2" />
                  Tolak Pengajuan
                </Button>
                <Button
                  onClick={handleApproveApplication}
                  disabled={
                    hasRejectedDocs || hasMissingDocs || !allDocsReviewed
                  }
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Setujui & Generate Surat
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ReviewModal;
