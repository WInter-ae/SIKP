/**
 * Contoh Implementasi: Mahasiswa Dashboard
 *
 * File ini menunjukkan cara mengintegrasikan backend API
 * dengan React components menggunakan hooks dan services yang sudah dibuat.
 *
 * Copy dan adapt pattern ini untuk pages lain.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useUser } from "~/contexts/user-context";
import { ProtectedRoute } from "~/components/protected-route";
import {
  getMyTeams,
  getMySubmissions,
} from "~/lib/services";
import type { Team, Submission } from "~/lib/types";

/**
 * Example Dashboard Component
 */
export function MahasiswaDashboardExample() {
  const navigate = useNavigate();
  const { user, isLoading } = useUser();
  const [teams, setTeams] = useState<Team[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data saat component mount
  useEffect(() => {
    if (!isLoading && user) {
      loadData();
    }
  }, [isLoading, user]);

  const loadData = async () => {
    try {
      setIsLoadingData(true);
      setError(null);

      // Load teams
      const teamsResponse = await getMyTeams();
      if (teamsResponse.success && teamsResponse.data) {
        setTeams(teamsResponse.data);
      }

      // Load submissions
      const submissionsResponse = await getMySubmissions();
      if (submissionsResponse.success && submissionsResponse.data) {
        setSubmissions(submissionsResponse.data);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat data"
      );
    } finally {
      setIsLoadingData(false);
    }
  };

  // Show loading state saat user context masih loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
          <p className="text-gray-500">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRoles={["MAHASISWA"]}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Selamat Datang, {user?.nama}!
          </h1>
          <p className="text-gray-600">
            NIM: {user?.nim} | Program Studi: {user?.prodi}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-semibold">Tim Anda</h3>
            <p className="text-3xl font-bold mt-2">{teams.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-semibold">Pengajuan</h3>
            <p className="text-3xl font-bold mt-2">{submissions.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-semibold">Disetujui</h3>
            <p className="text-3xl font-bold mt-2">
              {submissions.filter((s) => s.status === "DITERIMA").length}
            </p>
          </div>
        </div>

        {/* Teams Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Tim Anda</h2>
            <button
              onClick={() => navigate("/mahasiswa/kp/buat-tim")}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Buat Tim Baru
            </button>
          </div>

          {isLoadingData ? (
            <p className="text-gray-500">Memuat tim...</p>
          ) : teams.length === 0 ? (
            <p className="text-gray-500">Belum ada tim. Buat tim baru untuk memulai!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition"
                >
                  <h3 className="font-semibold text-lg">{team.code}</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Status: <span className="font-medium">{team.status}</span>
                  </p>
                  <button
                    onClick={() => navigate(`/mahasiswa/kp/tim/${team.id}`)}
                    className="mt-4 px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  >
                    Lihat Detail
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submissions Section */}
        <div>
          <h2 className="text-xl font-bold mb-4">Pengajuan Magang</h2>

          {isLoadingData ? (
            <p className="text-gray-500">Memuat pengajuan...</p>
          ) : submissions.length === 0 ? (
            <p className="text-gray-500">
              Belum ada pengajuan. Ajukan pengajuan magang untuk memulai!
            </p>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">
                        {submission.companyName || "Draft Pengajuan"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {submission.position}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Dibuat: {new Date(submission.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        submission.status === "DITERIMA"
                          ? "bg-green-100 text-green-700"
                          : submission.status === "DITOLAK"
                          ? "bg-red-100 text-red-700"
                          : submission.status === "MENUNGGU"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {submission.status}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      navigate(`/mahasiswa/kp/pengajuan/${submission.id}`)
                    }
                    className="mt-4 px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  >
                    Lihat Detail
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

/**
 * TIPS untuk mengimplementasikan pages lain:
 * 
 * 1. Import yang perlu:
 *    - useUser dari contexts
 *    - ProtectedRoute component
 *    - Services yang sesuai (team, submission, admin)
 *    - Types dari lib/types
 * 
 * 2. Setup state:
 *    - useState untuk data dari API
 *    - useState untuk loading state
 *    - useState untuk error state
 * 
 * 3. Load data di useEffect:
 *    - Check useUser() sudah siap
 *    - Call service functions
 *    - Handle success/error responses
 * 
 * 4. Wrap dengan ProtectedRoute:
 *    - Specify requiredRoles jika perlu
 *    - Component hanya render jika authorized
 * 
 * 5. Handle loading states:
 *    - Show spinner saat data loading
 *    - Disable buttons saat proses API
 * 
 * 6. Handle errors:
 *    - Show error message ke user
 *    - Provide retry option
 * 
 * 7. Use useNavigate untuk routing:
 *    - Redirect ke detail pages
 *    - Navigate back setelah submit
 */
