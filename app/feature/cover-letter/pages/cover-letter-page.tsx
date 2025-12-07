import { Link, useNavigate } from "react-router";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

import ProcessStep from "~/feature/cover-letter/components/process-step";

import { ArrowLeft, ArrowRight } from "lucide-react";

function CoverLetterPage() {
  const navigate = useNavigate();

  const handleResubmit = () => {
    // Arahkan ke halaman pengajuan saat tombol "Ajukan Ulang" diklik
    navigate("/mahasiswa/kp/pengajuan");
  };

  return (
    <>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Halaman Status Pengajuan Surat Pengantar
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor status pengajuan surat pengantar kerja praktik Anda
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
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

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="secondary"
              asChild
              className="px-6 py-3 font-medium"
            >
              <Link to="/mahasiswa/kp/pengajuan">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Sebelumnya
              </Link>
            </Button>
            <Button
              asChild
              className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 font-medium"
            >
              <Link to="/mahasiswa/kp/surat-balasan">
                Selanjutnya
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default CoverLetterPage;
