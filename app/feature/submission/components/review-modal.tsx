import React, { useState, useMemo } from "react";
import type { Application, DocumentFile } from "../types";
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

interface ReviewModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: (comment: string) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  application,
  isOpen,
  onClose,
  onApprove,
  onReject,
}) => {
  const [comment, setComment] = useState("");
  const [docReviews, setDocReviews] = useState<
    Record<string, "approved" | "rejected">
  >({});

  // Group documents by title
  const groupedDocuments = useMemo<Record<string, DocumentFile[]>>(() => {
    if (!application) return {};
    const groups: Record<string, DocumentFile[]> = {};
    application.documents.forEach((doc) => {
      if (!groups[doc.title]) {
        groups[doc.title] = [];
      }
      groups[doc.title].push(doc);
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
    const uploadedTitles = Object.keys(groupedDocuments);
    return Array.from(new Set([...standardDocs, ...uploadedTitles]));
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

  if (!isOpen || !application) return null;

  const handleRejectApplication = () => {
    if (hasRejectedDocs && !comment.trim()) {
      alert(
        "Karena ada dokumen yang ditolak, Anda wajib memberikan catatan review.",
      );
      return;
    }
    if (!comment.trim()) {
      if (
        !confirm(
          "Apakah Anda yakin ingin menolak tanpa catatan? (Disarankan memberikan alasan)",
        )
      ) {
        return;
      }
    }
    onReject(comment);
    resetState();
  };

  const handleApproveApplication = () => {
    if (hasRejectedDocs) {
      alert(
        "Tidak dapat menyetujui pengajuan karena terdapat dokumen yang ditolak. Silakan tolak pengajuan untuk meminta revisi.",
      );
      return;
    }
    if (hasMissingDocs) {
      alert("Tidak dapat menyetujui pengajuan karena dokumen belum lengkap.");
      return;
    }
    if (!allDocsReviewed) {
      alert("Harap review semua dokumen yang diupload terlebih dahulu.");
      return;
    }
    onApprove();
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold">
            Review Pengajuan Surat Pengantar
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-8">
          {/* 1. Informasi Mahasiswa (Tim) */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Informasi Mahasiswa (Tim Kerja Praktik)
            </h3>

            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600">
                Dosen Pembimbing Akademik (Ketua):
              </p>
              <p className="font-semibold text-blue-900 text-lg">
                {application.supervisor}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {application.members.map((member) => (
                <div
                  key={member.id}
                  className={`p-4 rounded-lg border ${
                    member.role === "Ketua"
                      ? "border-blue-200 bg-blue-50/50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        member.role === "Ketua"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {member.role}
                    </span>
                  </div>
                  <p className="font-bold text-gray-800">{member.name}</p>
                  <p className="text-sm text-gray-600">{member.nim}</p>
                  <p className="text-sm text-gray-500">{member.prodi}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Informasi Kerja Praktik */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b flex items-center">
              <Building className="w-5 h-5 mr-2 text-blue-600" />
              Informasi Kerja Praktik
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tujuan Surat
                </label>
                <input
                  type="text"
                  value={application.internship.tujuanSurat}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 focus:outline-none cursor-not-allowed"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Tempat/Perusahaan
                </label>
                <input
                  type="text"
                  value={application.internship.namaTempat}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 focus:outline-none cursor-not-allowed"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat Tempat
                </label>
                <textarea
                  value={application.internship.alamatTempat}
                  readOnly
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 focus:outline-none cursor-not-allowed resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Mulai
                </label>
                <input
                  type="text"
                  value={application.internship.tanggalMulai}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 focus:outline-none cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Selesai
                </label>
                <input
                  type="text"
                  value={application.internship.tanggalSelesai}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 focus:outline-none cursor-not-allowed"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Unit/Divisi
                </label>
                <input
                  type="text"
                  value={application.internship.pembimbingLapangan}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* 3. Dokumen yang Diupload */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Dokumen yang Diupload
            </h3>
            <div className="space-y-6">
              {allDocumentTitles.map((title) => {
                const docs = groupedDocuments[title] || [];
                return (
                <div
                  key={title}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                    <FolderOpen className="w-4 h-4 mr-2 text-yellow-500" />
                    {title}
                  </h4>
                  <div className="space-y-3">
                    {title === "Surat Proposal"
                      ? docs.length > 0
                        ? docs.map((doc) =>
                            renderDocItem(doc, docReviews, handleDocAction),
                          )
                        : (
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200 border-dashed">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded flex items-center justify-center">
                                  <X className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    Ketua Tim
                                  </p>
                                  <p className="text-xs text-red-500 font-medium italic">
                                    Belum diupload
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                      : application.members.map((member) => {
                          const doc = docs.find(
                            (d) => d.uploadedBy === member.name,
                          );
                          if (doc) {
                            return renderDocItem(
                              doc,
                              docReviews,
                              handleDocAction,
                            );
                          } else {
                            return (
                              <div
                                key={`missing-${member.id}-${title}`}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200 border-dashed"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded flex items-center justify-center">
                                    <X className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {member.name}
                                    </p>
                                    <p className="text-xs text-red-500 font-medium italic">
                                      Tidak mengumpulkan
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        })}
                  </div>
                </div>
                );
              })}
            </div>
          </div>

          {/* 4. Review Pengajuan */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <ClipboardCheck className="w-5 h-5 mr-2 text-blue-600" />
              Review Pengajuan
            </h3>

            {hasRejectedDocs && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 mt-0.5" />
                <span>
                  Terdapat dokumen yang ditolak. Anda <strong>wajib</strong>{" "}
                  memberikan catatan review untuk menjelaskan alasan penolakan
                  kepada mahasiswa.
                </span>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan Review{" "}
                {hasRejectedDocs && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  hasRejectedDocs && !comment
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-green-500"
                }`}
                rows={4}
                placeholder={
                  hasRejectedDocs
                    ? "Jelaskan alasan penolakan dokumen..."
                    : "Tambahkan catatan untuk mahasiswa (opsional)..."
                }
              ></textarea>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 sticky bottom-0">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
          >
            Batal
          </button>
          <button
            onClick={handleRejectApplication}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition shadow-sm"
          >
            <X className="w-4 h-4 mr-2 inline" />
            Tolak Pengajuan
          </button>
          <button
            onClick={handleApproveApplication}
            disabled={hasRejectedDocs || hasMissingDocs || !allDocsReviewed}
            className={`px-4 py-2 text-white rounded-md transition shadow-sm ${
              hasRejectedDocs || hasMissingDocs || !allDocsReviewed
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            <Check className="w-4 h-4 mr-2 inline" />
            Setujui & Generate Surat
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to render document item
const renderDocItem = (
  doc: DocumentFile,
  docReviews: Record<string, "approved" | "rejected">,
  handleDocAction: (docId: string, action: "approved" | "rejected") => void,
) => {
  const status = docReviews[doc.id];
  return (
    <div
      key={doc.id}
      className={`flex items-center justify-between p-3 bg-white rounded border ${
        status === "rejected"
          ? "border-red-300 bg-red-50"
          : status === "approved"
            ? "border-green-300 bg-green-50"
            : "border-gray-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-red-100 text-red-600 rounded flex items-center justify-center">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{doc.uploadedBy}</p>
          <p className="text-xs text-gray-500">{doc.uploadDate}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition"
          title="Lihat Dokumen"
          onClick={() => window.open(doc.url || "#", "_blank")}
        >
          <Eye className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleDocAction(doc.id, "approved")}
          className={`p-2 rounded transition ${
            status === "approved"
              ? "bg-green-600 text-white"
              : "text-gray-400 hover:text-green-600 hover:bg-green-50"
          }`}
          title="Setujui Dokumen"
        >
          <Check className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleDocAction(doc.id, "rejected")}
          className={`p-2 rounded transition ${
            status === "rejected"
              ? "bg-red-600 text-white"
              : "text-gray-400 hover:text-red-600 hover:bg-red-50"
          }`}
          title="Tolak Dokumen"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ReviewModal;
