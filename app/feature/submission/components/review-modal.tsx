import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  Building,
  Check,
  ClipboardCheck,
  Download,
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
import { StatusBadge } from "./status-badge";
import { useUser } from "~/contexts/user-context";

import type { Application, DocumentFile } from "../types";
import type { MailEntry } from "~/feature/hearing-dosen/types/dosen";
import { generateSuratPengantarPdf } from "~/feature/hearing-dosen/lib/generate-surat-pengantar-pdf";
import {
  STANDARD_DOCUMENT_TITLES,
  isSuratPengantarDocument,
} from "../constants/document-types";

interface ReviewModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (
    docReviews: Record<string, "approved" | "rejected">,
    letterNumber: string,
  ) => void;
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
  const { user } = useUser();
  const [comment, setComment] = useState("");
  const [letterNumber, setLetterNumber] = useState("");
  const [isLetterNumberDialogOpen, setIsLetterNumberDialogOpen] =
    useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [docReviews, setDocReviews] = useState<
    Record<string, "approved" | "rejected">
  >({});

  // Initialize docReviews from persisted document status and saved reviews
  useEffect(() => {
    const statusSeed: Record<string, "approved" | "rejected"> = {};
    (application?.documents || []).forEach((doc) => {
      if (doc.documentStatus === "APPROVED") {
        statusSeed[doc.id] = "approved";
      }
      if (doc.documentStatus === "REJECTED") {
        statusSeed[doc.id] = "rejected";
      }
    });

    const mergedReviews = {
      ...statusSeed,
      ...(application?.documentReviews || {}),
    };

    setDocReviews(mergedReviews);

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

    // ✅ Gunakan constants daripada hardcoded array
    const standardDocs = [...STANDARD_DOCUMENT_TITLES];

    const uploadedTitles = Object.keys(groupedDocuments).filter(
      (title) => title && title !== "undefined",
    );

    // ✅ CRITICAL: Exclude SURAT_PENGANTAR menggunakan helper function
    // SURAT_PENGANTAR tidak boleh muncul di accordion upload
    const filteredUploadedTitles = uploadedTitles.filter(
      (title) => !isSuratPengantarDocument(title),
    );

    const allTitles = Array.from(
      new Set([...standardDocs, ...filteredUploadedTitles]),
    );

    console.log("📋 All document titles in modal:", {
      applicationId: application.id,
      standardDocsCount: standardDocs.length,
      uploadedTitlesRaw: uploadedTitles,
      uploadedTitlesFiltered: filteredUploadedTitles,
      uploadedTitlesCount: filteredUploadedTitles.length,
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

  const buildMailEntryFromApplication = (
    currentApplication: Application,
    customLetterNumber?: string,
  ): MailEntry => {
    const mappedSignature = currentApplication.wakilDekanSignature;
    const wakilDekanName =
      mappedSignature?.name ||
      (user?.role === "WAKIL_DEKAN"
        ? user?.nama || "Wakil Dekan Bidang Akademik"
        : "Wakil Dekan Bidang Akademik");
    const wakilDekanNip =
      mappedSignature?.nip ||
      (user?.role === "WAKIL_DEKAN" ? user.nip || "-" : "-");
    const wakilDekanJabatan =
      mappedSignature?.position || "Wakil Dekan Bidang Akademik";

    const leader =
      currentApplication.members.find((member) => member.role === "Ketua") ||
      currentApplication.members[0];

    const suratPengantarDoc = currentApplication.documents.find((doc) =>
      isSuratPengantarDocument(doc.title),
    );

    const normalizedStatus: MailEntry["status"] =
      currentApplication.status === "approved"
        ? "disetujui"
        : currentApplication.status === "rejected"
          ? "ditolak"
          : "menunggu";

    return {
      id: currentApplication.submissionId || String(currentApplication.id),
      tanggal: currentApplication.date,
      nim: leader?.nim || "-",
      namaMahasiswa: leader?.name || "-",
      programStudi: leader?.prodi || "-",
      status: normalizedStatus,
      supervisor: currentApplication.supervisor || "-",
      teamMembers: currentApplication.members.map((member) => ({
        id: member.id,
        name: member.name,
        nim: member.nim || "-",
        prodi: member.prodi || "-",
        role: member.role,
      })),
      namaPerusahaan: currentApplication.internship.namaTempat,
      tujuanSurat: currentApplication.internship.tujuanSurat,
      alamatPerusahaan: currentApplication.internship.alamatTempat,
      teleponPerusahaan: currentApplication.internship.teleponPerusahaan,
      jenisProdukUsaha: currentApplication.internship.jenisProdukUsaha,
      divisi: currentApplication.internship.divisi,
      tanggalMulai: currentApplication.internship.tanggalMulai,
      tanggalSelesai: currentApplication.internship.tanggalSelesai,
      dosenNama: wakilDekanName,
      dosenNip: wakilDekanNip,
      dosenJabatan: wakilDekanJabatan,
      nomorSurat: customLetterNumber || currentApplication.letterNumber,
      dosenEsignatureUrl: mappedSignature?.esignatureUrl,
      signedFileUrl: suratPengantarDoc?.url,
      approvedAt: currentApplication.date,
    };
  };

  const handlePreviewLetter = async () => {
    if (!application) return;

    try {
      setIsGeneratingPdf(true);
      const mailEntry = buildMailEntryFromApplication(application);

      if (mailEntry.status === "disetujui" && mailEntry.signedFileUrl) {
        window.open(mailEntry.signedFileUrl, "_blank", "noopener,noreferrer");
        toast.success("Membuka surat signed dari server.");
        return;
      }

      if (mailEntry.status === "disetujui") {
        toast.error(
          "Surat sudah disetujui, tetapi file signed dari backend belum tersedia.",
        );
        return;
      }

      await generateSuratPengantarPdf(mailEntry);
      toast.success("PDF berhasil diunduh.");
    } catch (error) {
      console.error("Gagal generate PDF surat:", error);
      toast.error("Gagal membuat PDF. Silakan coba lagi.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleRejectApplication = () => {
    // ✅ Backend validation: Must have at least 1 rejected doc
    if (!hasRejectedDocs) {
      toast.error(
        "Harus ada minimal 1 dokumen yang ditolak untuk menolak submission.",
      );
      return;
    }

    // ✅ Backend validation: Rejection reason is REQUIRED
    if (!comment.trim()) {
      toast.error("Alasan penolakan wajib diisi saat menolak submission.");
      return;
    }

    // ✅ Check if all docs reviewed
    if (!allDocsReviewed) {
      toast.warning(
        "Harap review semua dokumen yang diupload terlebih dahulu.",
      );
      return;
    }

    onReject(comment, docReviews);
    resetState();
  };

  const handleApproveApplication = () => {
    // ✅ Backend validation: Cannot approve if ANY doc is rejected
    if (hasRejectedDocs) {
      toast.error(
        "Tidak dapat approve submission jika ada dokumen yang di-reject. Harap review dokumentasi atau tolak submission.",
      );
      return;
    }

    // ✅ Check missing documents
    if (hasMissingDocs) {
      toast.error(
        "Tidak dapat menyetujui pengajuan karena dokumen belum lengkap.",
      );
      return;
    }

    // ✅ Backend validation: All docs must be reviewed (no pending)
    if (!allDocsReviewed) {
      toast.error(
        "Harap review semua dokumen yang diupload terlebih dahulu. Semua dokumen harus berstatus 'approved'.",
      );
      return;
    }

    setIsLetterNumberDialogOpen(true);
  };

  const handleConfirmApprove = () => {
    const trimmedLetterNumber = letterNumber.trim();
    if (!trimmedLetterNumber) {
      toast.error("Nomor surat wajib diisi sebelum menyetujui pengajuan.");
      return;
    }

    onApprove(docReviews, trimmedLetterNumber);
    resetState();
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const resetState = () => {
    setComment("");
    setLetterNumber("");
    setIsLetterNumberDialogOpen(false);
    setDocReviews({});
  };

  const getDisplayStatus = (doc: DocumentFile) => {
    const manualStatus = docReviews[doc.id];
    if (manualStatus === "approved") return "APPROVED";
    if (manualStatus === "rejected") return "REJECTED";
    if (doc.documentStatus === "APPROVED") return "APPROVED";
    if (doc.documentStatus === "REJECTED") return "REJECTED";
    if (doc.documentStatus === "PENDING") return "PENDING";
    return undefined;
  };

  // Helper function to render document item
  const renderDocItem = (doc: DocumentFile) => {
    const status = docReviews[doc.id];
    const displayStatus = getDisplayStatus(doc);
    const isEditable = application && application.status === "pending";
    return (
      <div
        key={doc.id}
        className={`flex items-center justify-between p-3 bg-card rounded border ${
          displayStatus === "REJECTED"
            ? "border-destructive/50 bg-destructive/10"
            : displayStatus === "APPROVED"
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
            {displayStatus && (
              <div className="mt-2">
                <StatusBadge status={displayStatus} size="sm" />
              </div>
            )}
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
                  <Label>Telepon Perusahaan</Label>
                  <Input
                    value={application.internship.teleponPerusahaan}
                    readOnly
                    className="bg-muted cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Jenis Produk/Usaha</Label>
                  <Input
                    value={application.internship.jenisProdukUsaha}
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

                <div className="rounded-lg border border-border p-4 flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    Surat tidak ditampilkan otomatis. Klik tombol untuk langsung
                    mengunduh PDF surat.
                  </p>
                  <Button
                    type="button"
                    onClick={handlePreviewLetter}
                    disabled={isGeneratingPdf}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isGeneratingPdf ? "Membuat PDF..." : "Preview Surat"}
                  </Button>
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
                        onClick={handlePreviewLetter}
                        disabled={isGeneratingPdf}
                        className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {isGeneratingPdf
                          ? "Membuka Surat..."
                          : "Lihat Surat Pengantar"}
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

      <Dialog
        open={isLetterNumberDialogOpen}
        onOpenChange={setIsLetterNumberDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Masukkan Nomor Surat</DialogTitle>
            <DialogDescription>
              Nomor surat wajib diisi sebelum pengajuan dapat disetujui.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="letter-number-input">Nomor Surat</Label>
            <Input
              id="letter-number-input"
              value={letterNumber}
              onChange={(e) => setLetterNumber(e.target.value)}
              placeholder="Contoh: 1234/UN9.FASILKOM/TU/2026"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsLetterNumberDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleConfirmApprove}
            >
              Simpan & Setujui
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

export default ReviewModal;
