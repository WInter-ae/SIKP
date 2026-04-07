import { useState } from "react";
import { AlertTriangle, Download, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { FileUploadDialog } from "./file-upload-dialog";
import { ConfirmDialog } from "./confirm-dialog";
import { StatusBadge } from "./status-badge";
import type { Document, Member, SubmissionDocument } from "../types";

interface DocumentDropdownProps {
  document: Document;
  members: Member[];
  documents: SubmissionDocument[];
  currentUserId?: string;
  submittedRequestKeys?: Set<string>;
  submittedRequestStatusByKey?: Record<
    string,
    "MENUNGGU" | "DISETUJUI" | "DITOLAK"
  >;
  dosenNameByKey?: Record<string, string>;
  signedUrlByKey?: Record<string, string>;
  rejectionReasonByKey?: Record<string, string>;
  onUpload?: (documentId: number, memberId: string, file: File) => void;
  onSubmitRequest?: (
    memberId: string,
    documentType: string,
  ) => Promise<boolean>;
  disabled?: boolean;
}

function DocumentDropdown({
  document,
  members,
  documents,
  currentUserId,
  submittedRequestKeys,
  submittedRequestStatusByKey,
  dosenNameByKey,
  signedUrlByKey,
  rejectionReasonByKey,
  onUpload,
  onSubmitRequest,
  disabled,
}: DocumentDropdownProps) {
  const [uploadingMember, setUploadingMember] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [reuploadingMember, setReuploadingMember] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [reapplyingMember, setReapplyingMember] = useState<{
    id: string;
    name: string;
    documentType: string;
  } | null>(null);
  const [submittingMemberId, setSubmittingMemberId] = useState<string | null>(
    null,
  );

  const getRequestKey = (memberId: string, documentType: string) =>
    `${memberId}:${documentType}`;

  const getDocumentForMember = (memberId: string) => {
    return documents.find(
      (doc) =>
        doc.documentType === document.type && doc.memberUserId === memberId,
    );
  };

  const isRejectedStatus = (status?: string) => {
    if (!status) return false;
    const normalizedStatus = status.toUpperCase();
    return normalizedStatus === "REJECTED" || normalizedStatus === "DITOLAK";
  };

  const handleFileUpload = (file: File) => {
    if (uploadingMember && onUpload) {
      onUpload(document.id, uploadingMember.id, file);
      setUploadingMember(null);
    }
  };

  const handlePreview = (documentUrl: string) => {
    if (documentUrl) {
      try {
        window.open(documentUrl, "_blank");
      } catch {
        alert("Tidak dapat menampilkan pratinjau file.");
      }
    }
  };

  const handleConfirmReupload = () => {
    if (reuploadingMember) {
      setUploadingMember(reuploadingMember);
      setReuploadingMember(null);
    }
  };

  const handleConfirmReapply = () => {
    if (!reapplyingMember) return;
    void handleSubmitRequest(
      reapplyingMember.id,
      reapplyingMember.documentType,
    );
    setReapplyingMember(null);
  };

  const handleSubmitRequest = async (
    memberId: string,
    documentType: string,
  ) => {
    if (!onSubmitRequest) return;
    try {
      setSubmittingMemberId(memberId);
      await onSubmitRequest(memberId, documentType);
    } finally {
      setSubmittingMemberId(null);
    }
  };

  const getSubmittedButtonLabel = (
    requestStatus: "MENUNGGU" | "DISETUJUI" | "DITOLAK" | undefined,
  ) => {
    if (requestStatus === "DISETUJUI") return "Disetujui";
    if (requestStatus === "DITOLAK") return "Ditolak";
    return "Telah diajukan";
  };

  const getSubmittedButtonClassName = (
    requestStatus: "MENUNGGU" | "DISETUJUI" | "DITOLAK" | undefined,
  ) => {
    if (requestStatus === "DISETUJUI")
      return "border-green-500 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800";
    if (requestStatus === "DITOLAK")
      return "border-red-500 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800";
    return "";
  };

  // Tooltip content per document type
  const documentTooltips: Record<
    string,
    { title: string; description: string; note?: string }
  > = {
    PROPOSAL_KETUA: {
      title: "Surat Proposal",
      description: "Dokumen ini hanya dapat diunggah oleh Ketua Tim.",
      note: "Pastikan isi proposal final sebelum upload.",
    },
    SURAT_KESEDIAAN: {
      title: "Surat Kesediaan",
      description:
        "Gunakan tombol 'Ajukan' untuk meminta surat kesediaan ke dosen pembimbing KP.",
    },
    FORM_PERMOHONAN: {
      title: "Form Permohonan",
      description:
        "Gunakan tombol 'Ajukan' untuk mengirim permohonan ke dosen pembimbing KP.",
      note: "Lengkapi tanda tangan pada halaman profil sebelum mengajukan.",
    },
    KRS_SEMESTER_4: {
      title: "KRS Semester 4",
      description: "Unggah Kartu Rencana Studi (KRS) semester 4.",
    },
    DAFTAR_KUMPULAN_NILAI: {
      title: "Daftar Kumpulan Nilai",
      description:
        "Unggah KHS dari semester awal hingga terbaru, atau dokumen DKN dari PPA.",
      note: "Pastikan seluruh halaman nilai terbaca jelas.",
    },
    BUKTI_PEMBAYARAN_UKT: {
      title: "Bukti Pembayaran UKT",
      description: "Unggah bukti pembayaran UKT terakhir.",
      note: "Mahasiswa KIP-K: unggah SK KIP-K dan tandai nama Anda.",
    },
    SURAT_PENGANTAR: {
      title: "Surat Pengantar",
      description: "Dokumen ini dibuat otomatis oleh sistem setelah approval.",
    },
  };

  const activeTooltip = documentTooltips[String(document.type)] || {
    title: "Informasi Dokumen",
    description: "Dokumen pendukung pengajuan.",
  };

  const hasRejectedDocument = members.some((member) => {
    const memberDocument = getDocumentForMember(member.id);
    return isRejectedStatus(memberDocument?.status);
  });

  return (
    <TooltipProvider>
      <Accordion type="single" collapsible className="mb-4">
        <AccordionItem
          value={`doc-${document.id}`}
          className="border border-border rounded-lg overflow-hidden"
        >
          <AccordionTrigger className="bg-muted px-4 hover:no-underline">
            <span className="font-medium text-foreground flex items-center gap-2">
              {document.title}
              {hasRejectedDocument && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center justify-center text-red-500">
                      <AlertTriangle className="h-4 w-4" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="text-xs leading-relaxed">
                      {"Ada dokumen yang ditolak oleh admin pada dropdown ini."}
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="ml-1 cursor-pointer text-muted-foreground">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                      />
                      <text
                        x="12"
                        y="16"
                        textAnchor="middle"
                        fontSize="12"
                        fill="currentColor"
                      >
                        i
                      </text>
                    </svg>
                  </span>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="w-[22rem] max-w-[90vw] p-3"
                >
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">
                      {activeTooltip.title}
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {activeTooltip.description}
                    </p>
                    {activeTooltip.note && (
                      <div className="rounded-md border border-primary/20 bg-primary/5 px-2.5 py-2">
                        <p className="text-xs leading-relaxed text-primary">
                          {activeTooltip.note}
                        </p>
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </span>
          </AccordionTrigger>
          <AccordionContent className="bg-card px-4 pb-0">
            {members.map((member) => {
              const isCurrentUser = currentUserId === member.id;
              const memberDocument = getDocumentForMember(member.id);
              const isUploaded = !!memberDocument;
              const isSuratKesediaan = document.type === "SURAT_KESEDIAAN";
              const isFormPermohonan = document.type === "FORM_PERMOHONAN";
              const canAjukan =
                isCurrentUser && (isSuratKesediaan || isFormPermohonan);
              const requestKey = getRequestKey(member.id, document.type ?? "");
              const isRequestSubmitted =
                !!submittedRequestKeys?.has(requestKey);
              const requestStatus = submittedRequestStatusByKey?.[requestKey];

              return (
                <div
                  key={member.id}
                  className="flex justify-between items-center py-3 border-b border-border last:border-b-0"
                >
                  <div className="flex flex-col gap-1">
                    <div className="font-medium text-foreground">
                      {member.name} ({member.role})
                    </div>
                    {/* ✅ Selalu tampilkan badge status jika ada status dokumen */}
                    {memberDocument?.status && (
                      <StatusBadge status={memberDocument.status} size="sm" />
                    )}
                  </div>
                  {isUploaded ? (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        disabled={!isCurrentUser || disabled}
                        onClick={() =>
                          setReuploadingMember({
                            id: member.id,
                            name: member.name,
                          })
                        }
                      >
                        Terupload
                      </Button>
                      {memberDocument && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(memberDocument.fileUrl)}
                        >
                          Lihat
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {canAjukan && requestStatus === "DISETUJUI" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-500 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 gap-1.5 h-8 px-3"
                          onClick={() => {
                            const url = signedUrlByKey?.[requestKey];
                            if (url) {
                              window.open(url, "_blank", "noopener,noreferrer");
                            } else {
                              toast.warning(
                                "File surat belum tersedia. Hubungi dosen Anda.",
                              );
                            }
                          }}
                        >
                          <span className="font-semibold text-xs">
                            Disetujui
                          </span>
                          <span className="w-px h-3.5 bg-green-400" />
                          <span className="text-xs">Klik untuk download</span>
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      ) : canAjukan && requestStatus === "DITOLAK" ? (
                        <div className="relative inline-flex">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={
                              disabled || submittingMemberId === member.id
                            }
                            className="border-red-500 bg-red-50 text-red-700 hover:bg-red-100"
                            onClick={() =>
                              setReapplyingMember({
                                id: member.id,
                                name: member.name,
                                documentType: document.type ?? "",
                              })
                            }
                          >
                            {submittingMemberId === member.id
                              ? "Mengajukan ulang..."
                              : "Ditolak"}
                          </Button>
                          {rejectionReasonByKey?.[requestKey] && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white border border-red-400 flex items-center justify-center text-red-600 hover:bg-red-50 z-10 cursor-pointer shadow-sm"
                                  >
                                    <MessageCircle className="w-3 h-3" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  className="w-[22rem] max-w-[90vw]"
                                >
                                  <p className="font-bold text-sm mb-1 text-red-500">
                                    Alasan Penolakan :
                                  </p>
                                  <div className="text-sm flex items-start gap-1.5 leading-6">
                                    <span className="font-bold shrink-0 whitespace-nowrap">
                                      {(dosenNameByKey?.[requestKey] ||
                                        "Dosen") + " :"}
                                    </span>
                                    <span className="font-medium whitespace-normal break-words">
                                      {rejectionReasonByKey[requestKey]}
                                    </span>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      ) : canAjukan ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            disabled ||
                            submittingMemberId === member.id ||
                            isRequestSubmitted
                          }
                          className={
                            isRequestSubmitted
                              ? getSubmittedButtonClassName(requestStatus)
                              : ""
                          }
                          onClick={() =>
                            void handleSubmitRequest(
                              member.id,
                              document.type ?? "",
                            )
                          }
                        >
                          {submittingMemberId === member.id
                            ? "Mengajukan..."
                            : isRequestSubmitted
                              ? getSubmittedButtonLabel(requestStatus)
                              : "Ajukan"}
                        </Button>
                      ) : null}
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={!isCurrentUser || disabled}
                        onClick={() =>
                          setUploadingMember({
                            id: member.id,
                            name: member.name,
                          })
                        }
                      >
                        Upload
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Dialog untuk upload file */}
      {uploadingMember && (
        <FileUploadDialog
          open={!!uploadingMember}
          onOpenChange={() => setUploadingMember(null)}
          onFileUpload={handleFileUpload}
          memberName={uploadingMember.name}
          documentTitle={document.title}
        />
      )}

      {/* Dialog untuk konfirmasi upload ulang */}
      {reuploadingMember && (
        <ConfirmDialog
          open={!!reuploadingMember}
          onOpenChange={() => setReuploadingMember(null)}
          title="Upload Ulang File?"
          description={`Apakah Anda yakin ingin mengupload ulang file untuk ${reuploadingMember.name}? File yang lama akan diganti.`}
          onConfirm={handleConfirmReupload}
          confirmText="Ya, Upload Ulang"
          cancelText="Batal"
        />
      )}

      {reapplyingMember && (
        <ConfirmDialog
          open={!!reapplyingMember}
          onOpenChange={() => setReapplyingMember(null)}
          title="Ajukan Ulang Surat?"
          description={`Apakah Anda yakin untuk mengajukan ulang ${document.title} untuk ${reapplyingMember.name}?`}
          onConfirm={handleConfirmReapply}
          confirmText="Ya, Ajukan Ulang"
          cancelText="Batal"
        />
      )}
    </TooltipProvider>
  );
}

export default DocumentDropdown;
