import React, { useState } from "react";
import FileUpload from "../components/file-upload";
import DocumentDropdown from "../components/document-dropdown";
import AdditionalInfoForm from "../components/add-info-form";
import type { AdditionalInfoData } from "../types";
import { useNavigate } from "react-router";
import { ConfirmDialog } from "../components/confirm-dialog";
import { EyeIcon } from "~/components/icons/eyeicon";

function SubmissionPage() {
  const navigate = useNavigate();

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfoData>({
    tujuanSurat: "",
    namaTempat: "",
    alamatTempat: "",
    tanggalMulai: "",
    tanggalSelesai: "",
    pembimbingLapangan: "",
  });

  const [proposalFile, setProposalFile] = useState<File | null>(null);

  const teamMembers = [
    { id: 1, name: "Adam", role: "(Ketua)" },
    { id: 2, name: "Robin", role: "" },
    { id: 3, name: "Raihan", role: "" },
  ];

  const documents = [
    { id: 1, title: "Surat Kesediaan" },
    { id: 2, title: "Form Permohonan" },
    { id: 3, title: "KRS Semester 4" },
    { id: 4, title: "Daftar Kumpulan Nilai" },
    { id: 5, title: "Bukti Pembayaran UKT" },
  ];

  const handleProposalUpload = (file: File) => {
    console.log("Proposal uploaded:", file);
    setProposalFile(file);
  };

  const handleAdditionalInfoChange = (data: AdditionalInfoData) => {
    console.log("Additional info changed:", data);
    setAdditionalInfo(data);
  };

  const handleSubmit = () => {
    console.log("Form submitted with data:", { additionalInfo, proposalFile });
    navigate("/mahasiswa/kp/surat-pengantar");
    setIsConfirmDialogOpen(false);
  };

  const handlePreviewProposal = () => {
    if (proposalFile) {
      try {
        const fileURL = URL.createObjectURL(proposalFile);
        window.open(fileURL, "_blank");
        setTimeout(() => URL.revokeObjectURL(fileURL), 100);
      } catch (error) {
        console.error("Gagal membuat pratinjau file:", error);
        alert("Tidak dapat menampilkan pratinjau file.");
      }
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Halaman Pengajuan Syarat Kerja Praktik
        </h1>
        <p className="text-gray-600">
          Upload dokumen-dokumen yang diperlukan untuk melaksanakan Kerja
          Praktik
        </p>
      </div>

      <div className="bg-green-50 border-l-4 border-green-700 p-4 mb-8 rounded-r">
        <p className="text-green-800 flex items-center">
          <i className="fas fa-info-circle mr-2"></i>
          Pastikan semua dokumen telah diupload sebelum melakukan pengajuan
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {/* Surat Proposal Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
            Surat Proposal
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex-grow">
              <FileUpload
                label="Upload Surat Proposal (Ketua Tim)"
                onFileChange={handleProposalUpload}
              />
            </div>
            {proposalFile && (
              <div className="pt-8">
                <span
                  onClick={handlePreviewProposal}
                  role="button"
                  className="cursor-pointer text-gray-600 hover:text-gray-800"
                >
                  <EyeIcon className="size-6" />
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Lampiran Berkas Pribadi Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
            Lampiran Berkas Pribadi
          </h2>
          {documents.map((document) => (
            <DocumentDropdown
              key={document.id}
              document={document}
              members={teamMembers}
            />
          ))}
        </div>

        {/* Keterangan Lain Section */}
        <AdditionalInfoForm onDataChange={handleAdditionalInfoChange} />

        {/* Submit Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => setIsConfirmDialogOpen(true)}
            className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-lg font-medium text-lg transition"
          >
            Ajukan Surat Pengantar
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        title="Konfirmasi Pengajuan"
        description={
          <>
            Apakah Anda yakin ingin mengajukan surat pengantar? Pastikan semua
            data dan dokumen yang Anda masukkan sudah benar.
            <br />
            <br />
            <span className="block">
              <span className="font-semibold text-red-700">Peringatan:</span>{" "}
              <span className="font-semibold inline-block">
                Anda tidak akan dapat mengubah data pengajuan hingga proses
                review selesai.
              </span>
            </span>
          </>
        }
        onConfirm={handleSubmit}
        confirmText="Ya, Ajukan"
        cancelText="Batal"
        variant="default"
      />
    </>
  );
}

export default SubmissionPage;
