import Card from "~/feature/during-intern/components/card";
import { Link } from "react-router";

function DuringInternPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Halaman Kebutuhan Saat Magang
        </h1>
        <p className="text-gray-600">
          Kelola kebutuhan Anda selama masa kerja praktik
        </p>
      </div>

        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <Card
            title="Logbook"
            description="Catat aktivitas harian selama masa kerja praktik"
            icon=""
            to="/logbook"
          />

          <Card
            title="Penilaian"
            description="Lihat hasil penilaian dari pembimbing lapangan"
            icon=""
            to="/penilaian"
          />

          <Card
            title="Pengesahan"
            description="Dapatkan pengesahan dokumen kerja praktik"
            icon=""
            to="/ols"
          />
        </div>

        <div className="flex justify-between">
          <Link
            to="/mahasiswa/surat-balasan"
            className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Sebelumnya
          </Link>
          <Link
            to="#"
            className="flex items-center bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            Selanjutnya
            <i className="fas fa-arrow-right ml-2"></i>
          </Link>
        </div>
    </>
  );
}

export default DuringInternPage;
