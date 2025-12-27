import React, { useState } from "react";
import type { Document, Member } from "../types";
import { Eye, ChevronUp, ChevronDown } from "lucide-react";
import { FileUploadDialog } from "./file-upload-dialog";
import { ConfirmDialog } from "./confirm-dialog";

interface DocumentDropdownProps {
  document: Document;
  members: Member[];
  onUpload?: (documentId: number, memberId: number, file: File) => void;
}

function DocumentDropdown({ document, members, onUpload }: DocumentDropdownProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<Record<number, File>>({});
  const [uploadingMember, setUploadingMember] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [reuploadingMember, setReuploadingMember] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleFileUpload = (file: File) => {
    if (uploadingMember) {
      setUploadedFiles((prev) => ({ ...prev, [uploadingMember.id]: file }));
      if (onUpload) {
        onUpload(document.id, uploadingMember.id, file);
      }
      console.log(
        `File ${file.name} diupload untuk anggota ${uploadingMember.name}`,
      );
    }
  };

  const handlePreview = (e: React.MouseEvent, memberId: number) => {
    e.stopPropagation(); // Mencegah dropdown tertutup jika ada
    const file = uploadedFiles[memberId];
    if (file) {
      try {
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, "_blank");
        // Melepas URL objek setelah tab baru dibuka untuk menghindari memory leak
        setTimeout(() => URL.revokeObjectURL(fileURL), 100);
      } catch (error) {
        console.error("Gagal membuat pratinjau file:", error);
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
    <div className="border border-border rounded-lg overflow-hidden mb-4">
      <div
        className="bg-muted p-4 font-medium text-foreground flex justify-between items-center cursor-pointer"
        onClick={toggleDropdown}
      >
        <span>{document.title}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      {isOpen && (
        <div className="p-4 bg-card">
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
                  <button
                    onClick={() =>
                      setReuploadingMember({ id: member.id, name: member.name })
                    }
                    className="px-3 py-1 rounded text-sm font-medium transition bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Terupload
                  </button>
                  <span
                    onClick={(e) => handlePreview(e, member.id)}
                    role="button"
                    className="cursor-pointer text-muted-foreground hover:text-foreground"
                  >
                    <Eye className="h-5 w-5" />
                  </span>
                </div>
              ) : (
                <button
                  onClick={() =>
                    setUploadingMember({ id: member.id, name: member.name })
                  }
                  className="px-3 py-1 rounded text-sm font-medium transition bg-secondary text-secondary-foreground hover:bg-secondary/80"
                >
                  Upload
                </button>
              )}
            </div>
          ))}
        </div>
      )}

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
    </div>
  );
}

export default DocumentDropdown;
