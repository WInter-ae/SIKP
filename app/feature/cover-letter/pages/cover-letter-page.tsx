import ProcessStep from "~/feature/cover-letter/components/process-step";
import Timeline from "~/feature/cover-letter/components/timeline";

function CoverLetterPage() {
  const handleResubmit = () => {
    console.log("Resubmit application");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Halaman Status Pengajuan Surat Pengantar
          </h1>
          <p className="text-gray-600">
            Monitor status pengajuan surat pengantar kerja praktik Anda
          </p>
        </div>

        <Timeline />
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <ProcessStep
            title="Mengajukan Surat Pengantar"
            description="Pengajuan surat pengantar telah diterima dan sedang dalam proses review"
            status="submitted"
          />

          <ProcessStep
            title="Pengajuan Ditolak"
            description="Pengajuan Anda ditolak. Silakan perbaiki dan ajukan kembali."
            status="rejected"
            comment="ASAHSKJASK.JASJASJAH.SANSJANSJASNK.JASNAJK.SASKABAKBSKJA BSJABSABSHABSABSKBASKBASKBJASK.BASASJKABS\n\nMikirr Kidzz"
            onAction={handleResubmit}
            actionText="Ajukan Ulang"
          />

          <ProcessStep
            title="Mengajukan Ulang Surat Pengantar"
            description="Pengajuan ulang surat pengantar telah diterima dan sedang dalam proses review"
            status="resubmitted"
          />

          <ProcessStep
            title="Surat Pengantar Telah Dibuat"
            description="Surat pengantar kerja praktik Anda telah disetujui dan dapat diunduh"
            status="approved"
            showDocumentPreview={true}
          />

          <div className="flex justify-between mt-8">
            <button className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded font-medium transition">
              <i className="fa fa-arrow-left mr-2"></i>
              Sebelumnya
            </button>
            <button className="flex items-center bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded font-medium transition">
              Selanjutnya
              <i className="fa fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CoverLetterPage;
