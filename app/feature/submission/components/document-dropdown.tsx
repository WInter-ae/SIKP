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

import type { Document, Member } from "../types";

interface DocumentDropdownProps {
  document: Document;
  members: Member[];
  onUpload?: (documentId: number, memberId: number, file: File) => void;
}

function DocumentDropdown({
  document,
  members,
  onUpload,
}: DocumentDropdownProps) {
  const [uploadedFiles, setUploadedFiles] = useState<Record<number, File>>({});
  const [uploadingMember, setUploadingMember] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [reuploadingMember, setReuploadingMember] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const handleFileUpload = (file: File) => {
    if (uploadingMember) {
      setUploadedFiles((prev) => ({ ...prev, [uploadingMember.id]: file }));
      if (onUpload) {
        onUpload(document.id, uploadingMember.id, file);
      }
    }
  };

  const handlePreview = (memberId: number) => {
    const file = uploadedFiles[memberId];
    if (file) {
      try {
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, "_blank");
        // Melepas URL objek setelah tab baru dibuka untuk menghindari memory leak
        setTimeout(() => URL.revokeObjectURL(fileURL), 100);
      } catch {
        alert("Tidak dapat menampilkan pratinjau file.");
      }
    }
  };

  const handleConfirmReupload = () => {
    if (reuploadingMember) {
      setUploadingMember(reuploadingMember); // Buka dialog upload file
      setReuploadingMember(null); // Tutup dialog konfirmasi
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
            <span className="font-medium text-foreground">{document.title}</span>
          </AccordionTrigger>
          <AccordionContent className="bg-card px-4 pb-0">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex justify-between items-center py-3 border-b border-border last:border-b-0"
              >
                <div className="font-medium text-foreground">
                  {member.name} {member.role}
                </div>
                {uploadedFiles[member.id] ? (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        setReuploadingMember({
                          id: member.id,
                          name: member.name,
                        })
                      }
                    >
                      Terupload
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handlePreview(member.id)}
                    >
                      <Eye className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setUploadingMember({ id: member.id, name: member.name })
                    }
                  >
                    Upload
                  </Button>
                )}
              </div>
            ))}
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
