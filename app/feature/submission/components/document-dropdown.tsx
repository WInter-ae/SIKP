import { useState } from "react";
import { Eye } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";

import { FileUploadDialog } from "./file-upload-dialog";
import { ConfirmDialog } from "./confirm-dialog";
import { StatusBadge } from "./status-badge";

import type { Document, Member, SubmissionDocument } from "../types";

interface DocumentDropdownProps {
  document: Document;
  members: Member[];
  documents: SubmissionDocument[];
  currentUserId?: string;
  onUpload?: (documentId: number, memberId: string, file: File) => void;
  onSubmitRequest?: (memberId: string) => Promise<void>;
  disabled?: boolean;
}

function DocumentDropdown({
  document,
  members,
  documents,
  currentUserId,
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
  const [submittingMemberId, setSubmittingMemberId] = useState<string | null>(
    null,
  );

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

  const handleSubmitRequest = async (memberId: string) => {
    if (!onSubmitRequest) return;
    try {
      setSubmittingMemberId(memberId);
      await onSubmitRequest(memberId);
    } finally {
      setSubmittingMemberId(null);
    }
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
                      {isCurrentUser && isSuratKesediaan && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            disabled || submittingMemberId === member.id
                          }
                          onClick={() => void handleSubmitRequest(member.id)}
                        >
                          {submittingMemberId === member.id
                            ? "Mengajukan..."
                            : "Ajukan"}
                        </Button>
                      )}
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
    </>
  );
}

export default DocumentDropdown;
