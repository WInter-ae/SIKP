import { useState, useEffect, useRef } from "react";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import * as mammoth from "mammoth";
import "quill/dist/quill.snow.css"; 
import * as FileSaver from "file-saver";
import { Textarea } from "~/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { useQuill } from "react-quilljs";
import { Button } from "~/components/ui/button";

interface Submission {
  id: number;
  teamName: string;
  members: string[];
  submissionDate: string;
  status: "Menunggu" | "Disetujui" | "Ditolak";
  // Data dari form "Keterangan Lain"
  tujuanSurat: string;
  namaTempat: string;
  alamatTempat: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  pembimbingLapangan: string;
  // Dokumen yang diupload
  documents: { title: string; fileName: string; uploader: string }[];
  proposalFile: string;
}

function AdminSubmissionPage() {
  const [submissions] = useState<Submission[]>([
    {
      id: 1,
      teamName: "Tim Adam",
      members: ["Adam (Ketua)", "Robin", "Raihan"],
      submissionDate: "20/07/2025",
      status: "Menunggu",
      tujuanSurat: "Kepala Divisi HRD",
      namaTempat: "PT. Teknologi Maju",
      alamatTempat: "Jl. Inovasi No. 123, Jakarta",
      tanggalMulai: "01/08/2025",
      tanggalSelesai: "01/11/2025",
      pembimbingLapangan: "Bpk. Budi Santoso",
      documents: [
        {
          title: "Surat Kesediaan",
          fileName: "surat_kesediaan_adam.pdf",
          uploader: "Adam",
        },
        {
          title: "KRS Semester 4",
          fileName: "krs_robin.pdf",
          uploader: "Robin",
        },
        {
          title: "Daftar Kumpulan Nilai",
          fileName: "dkn_raihan.pdf",
          uploader: "Raihan",
        },
      ],
      proposalFile: "proposal_tim_adam.pdf",
    },
    {
      id: 2,
      teamName: "Individu B",
      members: ["B (Individu)"],
      submissionDate: "21/07/2025",
      status: "Disetujui",
      tujuanSurat: "Manager of Engineering",
      namaTempat: "Startup Cepat Berkembang",
      alamatTempat: "Jl. Digital Raya No. 45, Bandung",
      tanggalMulai: "15/08/2025",
      tanggalSelesai: "15/11/2025",
      pembimbingLapangan: "Ibu. Citra Lestari",
      documents: [
        {
          title: "Surat Kesediaan",
          fileName: "surat_kesediaan_b.pdf",
          uploader: "B",
        },
      ],
      proposalFile: "proposal_individu_b.pdf",
    },
  ]);

  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null,
  );
  const [comment, setComment] = useState("");
  const [coverLetterTemplate, setCoverLetterTemplate] = useState<File | null>(
    null,
  );
  // State untuk editor
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editorHtml, setEditorHtml] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleViewDetail = (submission: Submission) => {
    setSelectedSubmission(submission);
    setShowDetailDialog(true);
  };

  const handleApprove = (submission: Submission) => {
    setSelectedSubmission(submission);
    setActionType("approve");
    setShowActionDialog(true);
  };

  const handleReject = (submission: Submission) => {
    setSelectedSubmission(submission);
    setActionType("reject");
    setShowActionDialog(true);
  };

  const handleSubmitAction = () => {
    if (actionType === "reject" && !comment.trim()) {
      alert("Komentar wajib diisi untuk penolakan.");
      return;
    }

    const action = actionType === "approve" ? "disetujui" : "ditolak";
    alert(
      `Pengajuan dari ${selectedSubmission?.teamName} berhasil ${action}!\n${comment ? `Komentar: ${comment}` : ""}`,
    );

    // Logika untuk generate surat pengantar bisa tarok di sini
    if (actionType === "approve") {
      console.log(
        "Generating cover letter from template:",
        coverLetterTemplate,
      );
      console.log("Using data:", selectedSubmission);
    }

    setShowActionDialog(false);
    setComment("");
    setActionType(null);
    setSelectedSubmission(null);
  };

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverLetterTemplate(e.target.files[0]);
      alert(`Template "${e.target.files[0].name}" berhasil diupload.`);
    }
  };

  const handleReviewAndEdit = async () => {
    if (!coverLetterTemplate) {
      alert("Silakan unggah file template .docx terlebih dahulu.");
      return;
    }
    setIsEditing(true);

    try {
      const arrayBuffer = await coverLetterTemplate.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setEditorHtml(result.value); // result.value berisi HTML yang dikonversi
      setShowEditDialog(true);
    } catch (error) {
      console.error("Gagal mengonversi .docx ke HTML", error);
      alert("Gagal memuat pratinjau. Pastikan file adalah .docx yang valid.");
    } finally {
      setIsEditing(false);
    }
  };

  const handleSaveEditedDocument = async (editorHtml: string) => {
    if (!editorHtml) {
      alert("Tidak ada konten untuk disimpan.");
      return;
    }

    try {
      // Attempt to dynamically import the html-to-docx module
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let htmlToDocx: any;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        htmlToDocx = (await import("html-to-docx" as any)).default;
      } catch (importError) {
        console.error("Gagal memuat modul html-to-docx:", importError);
        alert(
          "Gagal memuat modul yang diperlukan untuk mengonversi dokumen. Silakan coba lagi atau hubungi administrator.",
        );
        return;
      }

      // Attempt to convert HTML to DOCX
      const fileBuffer = await htmlToDocx(editorHtml, undefined, {
        table: { row: { cantSplit: true } },
        footer: true,
        pageNumber: true,
      });

      FileSaver.saveAs(
        fileBuffer as Blob,
        `EDITED_${coverLetterTemplate?.name || "template"}.docx`,
      );
      setShowEditDialog(false);
      alert("Dokumen yang diedit berhasil disimpan!");
    } catch (error) {
      console.error("Gagal menyimpan dokumen yang diedit:", error);
      alert("Terjadi kesalahan saat menyimpan dokumen.");
    }
  };

  const resetActionState = () => {
    setShowActionDialog(false);
    setComment("");
    setActionType(null);
  };
  const handleGenerateLetter = () => {
    if (!coverLetterTemplate || !selectedSubmission) {
      alert("Silakan unggah template dan pilih pengajuan terlebih dahulu.");
      return;
    }

    const reader = new FileReader();
    reader.readAsArrayBuffer(coverLetterTemplate);
    reader.onload = (e) => {
      const content = e.target?.result;
      if (!content) {
        alert("Gagal membaca file template.");
        return;
      }

      try {
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
          nullGetter: (part) => {
            console.warn(
              `Placeholder {${part.value}} tidak ditemukan dalam data.`,
            );
            return "";
          },
        });

        // Set data untuk mengisi template
        doc.setData({
          teamName: selectedSubmission.teamName,
          members: selectedSubmission.members.join(", "),
          tujuanSurat: selectedSubmission.tujuanSurat,
          namaTempat: selectedSubmission.namaTempat,
          alamatTempat: selectedSubmission.alamatTempat,
          tanggalMulai: selectedSubmission.tanggalMulai,
          tanggalSelesai: selectedSubmission.tanggalSelesai,
        });

        doc.render(); // Lakukan penggantian placeholder
        const out = doc.getZip().generate({
          type: "blob",
          mimeType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        FileSaver.saveAs(
          out,
          `Surat_Pengantar_${selectedSubmission.teamName}.docx`,
        );
        handleSubmitAction(); // Tandai selesai setelah generate berhasil
      } catch (error) {
        // Log full error details for debugging
        if (error instanceof Error) {
          console.error("Error generating document:", error, error.stack);
        } else {
          console.error("Error generating document:", error);
        }

        // Provide more specific user-facing error messages
        let userMessage = "Terjadi kesalahan saat membuat dokumen.";
        if (error instanceof Error) {
          if (
            error.message.includes("File mungkin korup") ||
            error.message.includes("corrupt") ||
            error.message.includes("zip") ||
            error.message.includes("not a valid")
          ) {
            userMessage =
              "Template .docx tidak valid atau korup. Silakan unggah file template yang benar.";
          } else if (
            error.message.includes("Placeholder") ||
            error.message.includes("not found") ||
            error.message.includes("undefined")
          ) {
            userMessage =
              "Beberapa placeholder pada template tidak ditemukan dalam data. Periksa kembali template dan data yang diisi.";
          } else if (
            error.message.includes("Cannot read property") ||
            error.message.includes("undefined")
          ) {
            userMessage =
              "Terjadi kesalahan pada data yang dimasukkan. Pastikan semua field telah diisi dengan benar.";
          } else if (
            error.message.includes("docxtemplater") ||
            error.message.includes("Docxtemplater")
          ) {
            userMessage =
              "Terjadi kesalahan saat memproses template. Pastikan template sesuai format yang didukung.";
          } else {
            // Optionally, append the error message for advanced users
            userMessage += " " + error.message;
          }
        }
        alert(userMessage);
      }
    };
  };

  return (
    <div className="bg-white min-h-screen px-[3%]">
      <div className="mb-8 mt-[10vh]">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Pengajuan Kerja Praktik
        </h1>
        <p className="text-gray-600">
          Kelola dan review pengajuan syarat kerja praktik dari mahasiswa.
        </p>
      </div>

      {/* Template Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
          Template Surat Pengantar
        </h2>
        <Label htmlFor="template-upload" className="text-gray-700">
          Upload template surat pengantar (.docx) untuk digenerate otomatis.
        </Label>
        <div className="flex items-center gap-4 mt-2">
          <Input
            id="template-upload"
            type="file"
            accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="flex-grow"
            onChange={handleTemplateUpload}
          />
          <Button
            variant="outline"
            onClick={handleReviewAndEdit}
            disabled={!coverLetterTemplate || isEditing}
          >
            {isEditing ? "Memuat Editor..." : "Review & Edit Template"}
          </Button>
        </div>
        {coverLetterTemplate && (
          <p className="text-sm text-green-700 mt-2">
            Template aktif: <strong>{coverLetterTemplate.name}</strong>
          </p>
        )}
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                Tim / Mahasiswa
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-800">
                Tanggal Pengajuan
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-800">
                Status
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-800">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {submissions.map((submission) => (
              <tr key={submission.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">
                    {submission.teamName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {submission.members.join(", ")}
                  </div>
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-700">
                  {submission.submissionDate}
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                      submission.status === "Disetujui"
                        ? "bg-green-500 text-white"
                        : submission.status === "Ditolak"
                          ? "bg-red-500 text-white"
                          : "bg-yellow-500 text-white"
                    }`}
                  >
                    {submission.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleViewDetail(submission)}
                      className="p-2 hover:bg-gray-100 rounded-full transition"
                      title="Lihat Detail"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleApprove(submission)}
                      className="p-2 hover:bg-green-50 rounded-full transition"
                      title="Setujui"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-green-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleReject(submission)}
                      className="p-2 hover:bg-red-50 rounded-full transition"
                      title="Tolak"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-red-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Detail Pengajuan KP</DialogTitle>
            <DialogDescription>
              Detail lengkap pengajuan dari {selectedSubmission?.teamName}.
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              {/* Kolom Kiri: Info Pengajuan */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">
                  Informasi Tim
                </h3>
                <div>
                  <Label>Nama Tim/Mahasiswa</Label>
                  <p>{selectedSubmission.teamName}</p>
                </div>
                <div>
                  <Label>Anggota</Label>
                  <p>{selectedSubmission.members.join(", ")}</p>
                </div>
                <div>
                  <Label>Tanggal Pengajuan</Label>
                  <p>{selectedSubmission.submissionDate}</p>
                </div>

                <h3 className="font-semibold text-lg border-b pb-2 mt-4">
                  Keterangan Lain
                </h3>
                <div>
                  <Label>Tujuan Surat</Label>
                  <p>{selectedSubmission.tujuanSurat}</p>
                </div>
                <div>
                  <Label>Nama Tempat KP</Label>
                  <p>{selectedSubmission.namaTempat}</p>
                </div>
                <div>
                  <Label>Alamat Tempat KP</Label>
                  <p>{selectedSubmission.alamatTempat}</p>
                </div>
                <div>
                  <Label>Tanggal Mulai</Label>
                  <p>{selectedSubmission.tanggalMulai}</p>
                </div>
                <div>
                  <Label>Tanggal Selesai</Label>
                  <p>{selectedSubmission.tanggalSelesai}</p>
                </div>
                <div>
                  <Label>Pembimbing Lapangan</Label>
                  <p>{selectedSubmission.pembimbingLapangan}</p>
                </div>
              </div>

              {/* Kolom Kanan: Dokumen */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">
                  Dokumen Terlampir
                </h3>
                <div className="border rounded-lg p-3 bg-gray-50">
                  <p className="font-medium">Proposal KP</p>
                  <Button size="sm" className="mt-2 w-full">
                    Download {selectedSubmission.proposalFile}
                  </Button>
                </div>
                {selectedSubmission.documents.map((doc, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-gray-50">
                    <p className="font-medium">
                      {doc.title} ({doc.uploader})
                    </p>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="mt-2 w-full"
                    >
                      Download {doc.fileName}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDetailDialog(false)}
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve/Reject Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve"
                ? "Setujui Pengajuan"
                : "Tolak Pengajuan"}
            </DialogTitle>
            <DialogDescription>
              {selectedSubmission &&
                (actionType === "approve"
                  ? `Anda akan menyetujui pengajuan dari ${selectedSubmission.teamName}. Surat pengantar akan digenerate berdasarkan template.`
                  : `Apakah Anda yakin ingin menolak pengajuan dari ${selectedSubmission.teamName}?`)}
            </DialogDescription>
          </DialogHeader>

          {actionType === "approve" && selectedSubmission && (
            <div className="my-4 p-4 border rounded-lg bg-gray-50 space-y-3">
              <h4 className="font-semibold text-gray-800">
                Generate Surat Pengantar
              </h4>
              <p className="text-sm text-gray-600">
                Surat akan digenerate menggunakan template{" "}
                <strong>
                  {coverLetterTemplate?.name || "[Belum Diupload]"}
                </strong>{" "}
                dengan data berikut:
              </p>
              <ul className="text-sm list-disc list-inside bg-white p-3 rounded">
                <li>
                  <strong>Nama Tim:</strong> {selectedSubmission.teamName}
                </li>
                <li>
                  <strong>Anggota:</strong>{" "}
                  {selectedSubmission.members.join(", ")}
                </li>
                <li>
                  <strong>Tujuan:</strong> {selectedSubmission.tujuanSurat},{" "}
                  {selectedSubmission.namaTempat}
                </li>
                <li>
                  <strong>Alamat:</strong> {selectedSubmission.alamatTempat}
                </li>
              </ul>
              <Button className="w-full mt-2" onClick={handleGenerateLetter}>
                Generate Surat Pengantar
              </Button>
            </div>
          )}

          {actionType === "reject" && (
            <div className="my-4">
              <Label htmlFor="comment" className="text-gray-900">
                Komentar Penolakan *
              </Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Masukkan alasan penolakan..."
                className="mt-2"
                rows={4}
              />
            </div>
          )}

          <DialogFooter className="gap-3 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                resetActionState();
              }}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmitAction}
              className={`flex-1 ${actionType === "approve" ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"}`}
            >
              {actionType === "approve"
                ? "Tandai Selesai (Tanpa Generate)"
                : "Tolak Pengajuan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      {showEditDialog && (
        <EditorDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          initialHtml={editorHtml}
          onSave={handleSaveEditedDocument}
        />
      )}
    </div>
  );
}

function EditorDialog({
  open,
  onOpenChange,
  initialHtml,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialHtml: string;
  onSave: (html: string) => void;
}) {
  const { quill, quillRef } = useQuill();
  const contentRef = useRef(initialHtml);
  const contentInitializedRef = useRef(false);

  useEffect(() => {
    contentInitializedRef.current = false;
  }, [initialHtml]);

  useEffect(() => {
    if (quill) {
      if (!contentInitializedRef.current) {
        quill.clipboard.dangerouslyPasteHTML(initialHtml);
        contentInitializedRef.current = true;
      }

      const handleChange = () => {
        contentRef.current = quill.root.innerHTML;
      };

      quill.on("text-change", handleChange);

      return () => {
        quill.off("text-change", handleChange);
      };
    }
  }, [quill, initialHtml]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Review & Edit Template Surat</DialogTitle>
          <DialogDescription>
            Lakukan perubahan pada konten template. Perubahan akan disimpan
            sebagai file .docx baru.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow h-full overflow-y-auto bg-white border rounded-md">
          <div ref={quillRef} className="h-full" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={() => onSave(contentRef.current)}>
            Simpan Perubahan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AdminSubmissionPage;
