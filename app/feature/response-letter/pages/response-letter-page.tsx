import { useState } from "react";
import FileUpload from "../components/file-upload";
import StatusDropdown from "../components/status-dropdown";
import ProcessSteps from "../components/process-step";
import { Link, useNavigate } from "react-router";
import { AnnouncementDialog } from "../components/announcement-dialog";
import { Button } from "~/components/ui/button";

function ResponseLetterPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [showProcessSteps, setShowProcessSteps] = useState<boolean>(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [steps, setSteps] = useState([
    {
      id: 1,
      title: "Mengirimkan Surat Balasan",
      description:
        "Surat balasan telah diterima dan sedang dalam proses review oleh admin",
      icon: "fa-paper-plane",
      status: "submitted" as const,
      visible: false,
    },
    {
      id: 2,
      title: "Pemberian Izin Pengajuan Ulang",
      description:
        "Surat balasan ditolak. Anda diberikan izin untuk mengajukan ulang.",
      icon: "fa-times-circle",
      status: "rejected" as const,
      visible: false,
    },
    {
      id: 3,
      title: "Persetujuan Kerja Praktik",
      description:
        "Surat balasan disetujui. Kerja praktik Anda telah disetujui.",
      icon: "fa-check-circle",
      status: "approved" as const,
      visible: false,
    },
  ]);

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
  };

  const handleStatusChange = (selectedStatus: string) => {
    setStatus(selectedStatus);
  };

  const handleSubmit = () => {
    if (!file) {
      alert("Silakan upload surat balasan terlebih dahulu");
      return;
    }

    if (!status) {
      alert("Silakan pilih status surat balasan terlebih dahulu");
      return;
    }

    // Show only the first step
    const updatedSteps = steps.map((step, index) => ({
      ...step,
      visible: index === 0,
    }));

    setSteps(updatedSteps);
    setShowProcessSteps(true);

    // Scroll to the process steps
    setTimeout(() => {
      document
        .getElementById("process-steps-container")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleNextPage = () => {
    setShowAnnouncement(false);
    navigate("/mahasiswa/kp/saat-magang");
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Halaman Surat Balasan
        </h1>
        <p className="text-gray-600">
          Upload surat balasan dan pantau status persetujuan kerja praktik
        </p>
      </div>

      <div className="bg-green-50 border-l-4 border-green-700 p-4 mb-8 rounded-r">
        <p className="text-green-800 flex items-center">
          <i className="fas fa-info-circle mr-2"></i>
          Pastikan surat balasan telah diupload dengan benar sebelum mengirimkan
          ke admin
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
          Upload Surat Balasan
        </h2>
        <FileUpload
          label="Surat Balasan dari Perusahaan"
          onFileChange={handleFileChange}
        />

        <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
          Status Surat Balasan
        </h2>
        <StatusDropdown value={status} onChange={handleStatusChange} />

        <div className="text-center">
          <button
            onClick={handleSubmit}
            className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            Kirim
          </button>
        </div>
      </div>

      {showProcessSteps && (
        <div id="process-steps-container">
          <ProcessSteps steps={steps} />
        </div>
      )}

      <div className="flex justify-between mt-8">
        <Link
          to="/mahasiswa/kp/surat-pengantar"
          className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Sebelumnya
        </Link>
        <Button
          onClick={() => setShowAnnouncement(true)}
          className="flex items-center bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          Selanjutnya
          <i className="fas fa-arrow-right ml-2"></i>
        </Button>
      </div>

      <AnnouncementDialog
        open={showAnnouncement}
        onOpenChange={setShowAnnouncement}
        title=""
        description={
          <>
            Selamat Melaksanakan Kerja Praktik.
            <br />
            <span>Semangat!</span>
          </>
        }
        onConfirm={handleNextPage}
        confirmText="Lanjutkan"
      />
    </>
  );
}

export default ResponseLetterPage;
