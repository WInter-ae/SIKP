import Timeline from "~/feature/during-intern/components/timeline";
import Card from "~/feature/during-intern/components/card";
import { Link } from "react-router";

const DuringInternPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Halaman Kebutuhan Saat Magang
          </h1>
          <p className="text-gray-600">
            Kelola kebutuhan Anda selama masa kerja praktik
          </p>
        </div>

        <Timeline />

        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <Card
            title="Logbook"
            description="Catat aktivitas harian selama masa kerja praktik"
            icon="fa-book"
            to="/logbook"
          />

          <Card
            title="Penilaian"
            description="Lihat hasil penilaian dari pembimbing lapangan"
            icon="fa-star"
            to="/penilaian"
          />

          <Card
            title="Pengesahan"
            description="Dapatkan pengesahan dokumen kerja praktik"
            icon="fa-check-circle"
            to="/pengesahan"
          />
        </div>

        <div className="flex justify-between">
          <Link
            to="/surat-pengantar"
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
      </main>
    </div>
  );
};

export default DuringInternPage;
