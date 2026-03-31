import { useState } from "react";
import { Download, Eye, MessageCircle } from "lucide-react";
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

  return (
    <>
      <Accordion type="single" collapsible className="mb-4">
        <AccordionItem
          value={`doc-${document.id}`}
          className="border border-border rounded-lg overflow-hidden"
        >
          <AccordionTrigger className="bg-muted px-4 hover:no-underline">
            <span className="font-medium text-foreground">
              {document.title}
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
                      {member.name} {member.role}
                    </div>
                    {/* ✅ NEW: Display document status badge if available */}
                    {memberDocument?.status &&
                      memberDocument.status !== "PENDING" && (
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
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handlePreview(memberDocument.fileUrl)}
                        >
                          <Eye className="h-5 w-5" />
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
    </>
  );
}

export default DocumentDropdown;
