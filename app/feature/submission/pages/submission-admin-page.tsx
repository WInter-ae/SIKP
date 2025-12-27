import React, { useState, useMemo } from "react";
import StatCard from "../components/stat-card";
import ReviewModal from "../components/review-modal";
import type { Application } from "../types";

const SubmissionAdminPage = () => {
  // Mock data for applications
  const [applications, setApplications] = useState<Application[]>([
    {
      id: 1,
      date: "15/06/2023",
      status: "pending",
      supervisor: "Dr. Budi Santoso, M.Kom",
      members: [
        {
          id: 1,
          name: "Adam Rizki",
          nim: "2021001234",
          prodi: "Teknik Informatika",
          role: "Ketua",
        },
        {
          id: 2,
          name: "Robin",
          nim: "2021001235",
          prodi: "Teknik Informatika",
          role: "Anggota",
        },
        {
          id: 3,
          name: "Raihan",
          nim: "2021001236",
          prodi: "Teknik Informatika",
          role: "Anggota",
        },
      ],
      internship: {
        tujuanSurat: "HRD PT. Teknologi Indonesia",
        namaTempat: "PT. Teknologi Indonesia",
        alamatTempat: "Jl. Teknologi No. 123, Jakarta",
        tanggalMulai: "01 Juli 2023",
        tanggalSelesai: "30 September 2023",
        pembimbingLapangan: "Bapak Joko",
      },
      documents: [
        {
          id: "doc-1",
          title: "Surat Proposal",
          uploadedBy: "Adam (Ketua Tim)",
          uploadDate: "15/06/2023",
          status: "uploaded",
          // Tambahkan dummy PDF Base64 agar bisa dipreview
          url: "data:application/pdf;base64,JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXwKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSCisgICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCgo1IDAgb2JqCjw8IC9MZW5ndGggNDQgPj4Kc3RyZWFtCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNjAgMDAwMDAgbiAKMDAwMDAwMDE1NyAwMDAwMCBuIAowMDAwMDAwMjU1IDAwMDAwIG4gCjAwMDAwMDAzNTMgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDQ5CiUlRU9GCg==",
        },
        {
          id: "doc-2",
          title: "Surat Kesediaan",
          uploadedBy: "Adam Rizki",
          uploadDate: "15/06/2023",
          status: "uploaded",
          url: "data:application/pdf;base64,JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXwKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSCisgICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCgo1IDAgb2JqCjw8IC9MZW5ndGggNDQgPj4Kc3RyZWFtCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNjAgMDAwMDAgbiAKMDAwMDAwMDE1NyAwMDAwMCBuIAowMDAwMDAwMjU1IDAwMDAwIG4gCjAwMDAwMDAzNTMgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDQ5CiUlRU9GCg==",
        },
        {
          id: "doc-3",
          title: "Surat Kesediaan",
          uploadedBy: "Robin",
          uploadDate: "15/06/2023",
          status: "uploaded",
          url: "data:application/pdf;base64,JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXwKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSCisgICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCgo1IDAgb2JqCjw8IC9MZW5ndGggNDQgPj4Kc3RyZWFtCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNjAgMDAwMDAgbiAKMDAwMDAwMDE1NyAwMDAwMCBuIAowMDAwMDAwMjU1IDAwMDAwIG4gCjAwMDAwMDAzNTMgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDQ5CiUlRU9GCg==",
        },
        {
          id: "doc-4",
          title: "KRS Semester 4",
          uploadedBy: "Adam Rizki",
          uploadDate: "15/06/2023",
          status: "uploaded",
          url: "data:application/pdf;base64,JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXwKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSCisgICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCgo1IDAgb2JqCjw8IC9MZW5ndGggNDQgPj4Kc3RyZWFtCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNjAgMDAwMDAgbiAKMDAwMDAwMDE1NyAwMDAwMCBuIAowMDAwMDAwMjU1IDAwMDAwIG4gCjAwMDAwMDAzNTMgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDQ5CiUlRU9GCg==",
        },
        // ... more documents
      ],
    },
    {
      id: 2,
      date: "14/06/2023",
      status: "approved",
      supervisor: "Ibu Siti Aminah, M.T",
      members: [
        {
          id: 4,
          name: "Siti Nurhaliza",
          nim: "2021001235",
          prodi: "Sistem Informasi",
          role: "Ketua",
        },
      ],
      internship: {
        tujuanSurat: "HRD CV. Digital Creative",
        namaTempat: "CV. Digital Creative",
        alamatTempat: "Jl. Creative No. 45, Bandung",
        tanggalMulai: "05 Juli 2023",
        tanggalSelesai: "30 September 2023",
        pembimbingLapangan: "Ibu Ratna",
      },
      documents: [],
    },
    {
      id: 3,
      date: "13/06/2023",
      status: "rejected",
      supervisor: "Bapak Ahmad, M.Kom",
      members: [
        {
          id: 5,
          name: "Budi Santoso",
          nim: "2021001236",
          prodi: "Teknik Informatika",
          role: "Ketua",
        },
      ],
      internship: {
        tujuanSurat: "HRD PT. Finansial Teknologi",
        namaTempat: "PT. Finansial Teknologi",
        alamatTempat: "Jl. Finansial No. 10, Jakarta",
        tanggalMulai: "10 Juli 2023",
        tanggalSelesai: "30 September 2023",
        pembimbingLapangan: "Bapak Tono",
      },
      documents: [],
    },
    {
      id: 4,
      date: "12/06/2023",
      status: "pending",
      supervisor: "Ibu Rina, M.Kom",
      members: [
        {
          id: 6,
          name: "Dewi Lestari",
          nim: "2021001237",
          prodi: "Sistem Informasi",
          role: "Ketua",
        },
      ],
      internship: {
        tujuanSurat: "HRD PT. Media Kreatif",
        namaTempat: "PT. Media Kreatif",
        alamatTempat: "Jl. Media No. 22, Surabaya",
        tanggalMulai: "15 Juli 2023",
        tanggalSelesai: "30 September 2023",
        pembimbingLapangan: "Bapak Dedi",
      },
      documents: [],
    },
  ]);

  // Load data from LocalStorage on mount
  React.useEffect(() => {
    const storedData = localStorage.getItem("kp_submissions");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (Array.isArray(parsedData)) {
          setApplications((prev) => {
            // Gabungkan data localStorage dengan data mock
            // Pastikan tidak ada duplikasi berdasarkan ID
            const newIds = new Set(parsedData.map((d: Application) => d.id));
            const filteredPrev = prev.filter((p) => !newIds.has(p.id));

            // Data baru (dari localStorage) ditaruh di paling atas
            // Urutkan berdasarkan tanggal terbaru (opsional, asumsi ID timestamp lebih besar = lebih baru)
            const combined = [...parsedData, ...filteredPrev];
            return combined.sort((a, b) => b.id - a.id);
          });
        }
      } catch (error) {
        console.error("Gagal memuat data pengajuan:", error);
      }
    }
  }, []);

  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Calculate statistics
  const stats = useMemo(() => {
    const pending = applications.filter(
      (app) => app.status === "pending",
    ).length;
    const approved = applications.filter(
      (app) => app.status === "approved",
    ).length;
    const rejected = applications.filter(
      (app) => app.status === "rejected",
    ).length;
    const total = applications.length;

    return [
      {
        title: "Menunggu Review",
        value: pending,
        icon: "fa-clock",
        iconBgColor: "bg-yellow-500",
      },
      {
        title: "Disetujui",
        value: approved,
        icon: "fa-check-circle",
        iconBgColor: "bg-green-500",
      },
      {
        title: "Ditolak",
        value: rejected,
        icon: "fa-times-circle",
        iconBgColor: "bg-red-500",
      },
      {
        title: "Total Pengajuan",
        value: total,
        icon: "fa-list",
        iconBgColor: "bg-blue-500",
      },
    ];
  }, [applications]);

  // Filter applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const leader =
        app.members.find((m) => m.role === "Ketua") || app.members[0];

      if (!leader) return false;

      const matchesSearch =
        leader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (leader.nim?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesStatus =
        statusFilter === "all" || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  const handleReview = (application: Application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
  };

  const handleApprove = () => {
    alert("Pengajuan telah disetujui dan surat pengantar akan dibuat!");
    // In a real app, you would update the application status in the backend
  };

  const handleReject = (comment: string) => {
    alert(`Pengajuan telah ditolak dengan komentar: ${comment}`);
    // In a real app, you would update the application status in the backend
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return styles[status as keyof typeof styles] || "";
  };

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Penerimaan Pengajuan Surat Pengantar
          </h1>
          <button className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition">
            <i className="fas fa-download mr-2"></i>
            Export Data
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              iconBgColor={stat.iconBgColor}
            />
          ))}
        </div>

        {/* Filter and Search */}
        <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[250px] relative">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Cari nama mahasiswa atau nim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu Review</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
          </select>
          <button className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition">
            <i className="fas fa-filter mr-2"></i>
            Filter
          </button>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b font-semibold text-gray-700">
            Daftar Pengajuan Surat Pengantar
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NIM
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Mahasiswa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Perusahaan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((app) => {
                  const leader =
                    app.members.find((m) => m.role === "Ketua") ||
                    app.members[0];
                  return (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {app.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {leader?.nim || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-medium">
                          {leader?.name || "Unknown"}
                        </div>
                        <span className="text-xs text-gray-500">
                          {app.members.length > 1
                            ? `+ ${app.members.length - 1} Anggota`
                            : "Individu"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {app.internship.namaTempat}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(app.status)}`}
                        >
                          {app.status === "pending" && "Menunggu Review"}
                          {app.status === "approved" && "Disetujui"}
                          {app.status === "rejected" && "Ditolak"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleReview(app)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {app.status === "pending" ? "Review" : "Lihat"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Review Modal */}
        <ReviewModal
          application={selectedApplication}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </div>
  );
};

export default SubmissionAdminPage;
