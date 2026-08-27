import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import {
  CheckCircle,
  Clock,
  Filter,
  ListOrdered,
  Search,
  XCircle,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import StatCard from "../components/stat-card";
import ReviewModal from "../components/review-modal";

import type { Application } from "../types";
import {
  getAllSubmissionsForAdmin,
  updateSubmissionStatus,
} from "~/lib/services/submission-api.service";
import {
  mapSubmissionsToApplications,
  type SubmissionWithTeam,
} from "../utils/submission-mapper";

function SubmissionAdminPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch submissions from backend
  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        setIsLoading(true);
        console.log("🔄 Fetching admin submissions...");
        const response = await getAllSubmissionsForAdmin();

        console.log("📊 API Response:", {
          success: response.success,
          message: response.message,
          dataCount: response.data?.length || 0,
        });

        if (response.success && response.data && response.data.length > 0) {
          console.log("✅ Loaded submissions from backend:", response.data);

          // Debug: Log raw documents from backend
          console.log("📦 Backend documents structure:", {
            firstSubmission: response.data[0]?.id,
            documentsCount: response.data[0]?.documents?.length || 0,
            firstDocument: response.data[0]?.documents?.[0]
              ? {
                id: response.data[0].documents[0].id,
                documentType: response.data[0].documents[0].documentType,
                hasUploadedByUser:
                  !!response.data[0].documents[0].uploadedByUser,
                uploadedByUser: response.data[0].documents[0].uploadedByUser,
              }
              : null,
          });

          const submissions = response.data as SubmissionWithTeam[];
          const missingTeamCount = submissions.filter(
            (submission) => !submission.team,
          ).length;
          if (missingTeamCount > 0) {
            console.warn(
              `⚠️ ${missingTeamCount} submissions missing team data from backend response.`,
            );
          }

          const mappedApplications = mapSubmissionsToApplications(submissions);
          console.log("🎯 Mapped applications:", {
            count: mappedApplications.length,
            applications: mappedApplications.map((app) => ({
              id: app.id,
              membersCount: app.members.length,
              documentsCount: app.documents.length,
              documents: app.documents.map((d) => ({
                id: d.id,
                title: d.title,
                uploadedBy: d.uploadedBy,
                url: d.url,
              })),
            })),
          });
          setApplications(mappedApplications);

          if (mappedApplications.length === 0) {
            console.warn(
              "⚠️ No applications after mapping. Check if backend returns valid team data.",
            );
          }
        } else if (response.success && response.data?.length === 0) {
          console.log("📭 No submissions in database");
          setApplications([]);
        } else {
          console.error("❌ API Error:", response.message);
          toast.error(response.message || "Gagal memuat data pengajuan");
        }
      } catch (error) {
        console.error("❌ Error loading submissions:", error);
        const errorMsg =
          error instanceof Error ? error.message : "Terjadi kesalahan";
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    void loadSubmissions();
  }, []);

  // Calculate statistics with LucideIcon
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
        icon: Clock,
        iconBgColor: "bg-amber-500",
      },
      {
        title: "Disetujui",
        value: approved,
        icon: CheckCircle,
        iconBgColor: "bg-green-600",
      },
      {
        title: "Ditolak",
        value: rejected,
        icon: XCircle,
        iconBgColor: "bg-destructive",
      },
      {
        title: "Total Pengajuan",
        value: total,
        icon: ListOrdered,
        iconBgColor: "bg-primary",
      },
    ];
  }, [applications]);

  // Filter applications
  const filteredApplications = useMemo(() => {
    console.log("🔍 Filtering applications:", {
      totalApplications: applications.length,
      searchTerm,
      statusFilter,
      applications: applications.map((app) => ({
        id: app.id,
        membersCount: app.members?.length || 0,
        members: app.members,
        status: app.status,
      })),
    });

    const filtered = applications.filter((app) => {
      // Defensive: check if members exist
      if (!app.members || app.members.length === 0) {
        console.warn("⚠️ Application has no members:", app.id);
        return false;
      }

      const leader =
        app.members.find((m) => m.role === "Ketua") || app.members[0];

      if (!leader) {
        console.warn("⚠️ No leader found for application:", app.id);
        return false;
      }

      const leaderName = leader.name || "";
      const leaderNim = leader.nim || "";
      const normalizedSearch = searchTerm.toLowerCase();
      const matchesSearch =
        leaderName.toLowerCase().includes(normalizedSearch) ||
        leaderNim.toLowerCase().includes(normalizedSearch);
      const matchesStatus =
        statusFilter === "all" || app.status === statusFilter;

      const passes = matchesSearch && matchesStatus;
      if (!passes) {
        console.log("❌ App filtered out:", {
          id: app.id,
          leaderName: leader.name,
          matchesSearch,
          matchesStatus,
        });
      }

      return passes;
    });

    console.log("✅ Filtered applications count:", filtered.length);
    return filtered;
  }, [applications, searchTerm, statusFilter]);

  const handleReview = (application: Application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
  };

  const handleApprove = async (
    docReviews: Record<string, "approved" | "rejected">,
    letterNumber: string,
  ) => {
    if (!selectedApplication) return;

    try {
      // ✅ CRITICAL FIX: Use submissionId instead of id.toString()
      const response = await updateSubmissionStatus(
        selectedApplication.submissionId,
        "APPROVED",
        undefined,
        docReviews,
        letterNumber,
      );

      if (response.success) {
        // ✅ Refresh full submission from backend to get updated statusHistory
        const submissionsResponse = await getAllSubmissionsForAdmin();
        if (submissionsResponse.success && submissionsResponse.data) {
          const submissions = submissionsResponse.data as SubmissionWithTeam[];
          const mappedApplications = mapSubmissionsToApplications(submissions);
          setApplications(mappedApplications);
        } else {
          // Fallback: update local state if refresh fails
          setApplications((prev) =>
            prev.map((app) =>
              app.id === selectedApplication.id
                ? {
                  ...app,
                  status: "approved" as const,
                  letterNumber,
                  documentReviews: docReviews,
                }
                : app,
            ),
          );
        }
        toast.success(
          "Pengajuan telah disetujui dan surat pengantar berhasil dibuat dan dikirimkan!",
        );
        handleCloseModal();
      } else {
        // ✅ Backend validation errors
        console.error("❌ Backend validation error:", response.message);
        toast.error(
          response.message ||
          "Gagal menyetujui pengajuan. Periksa validasi dokumen.",
        );
      }
    } catch (error) {
      console.error("❌ Error approving submission:", error);
      toast.error("Terjadi kesalahan saat menyetujui pengajuan");
    }
  };

  const handleReject = async (
    comment: string,
    docReviews: Record<string, "approved" | "rejected">,
  ) => {
    if (!selectedApplication) return;

    try {
      // ✅ CRITICAL FIX: Use submissionId instead of id.toString()
      const response = await updateSubmissionStatus(
        selectedApplication.submissionId,
        "REJECTED",
        comment,
        docReviews,
      );

      if (response.success) {
        // ✅ Refresh full submission from backend to get updated statusHistory
        const submissionsResponse = await getAllSubmissionsForAdmin();
        if (submissionsResponse.success && submissionsResponse.data) {
          const submissions = submissionsResponse.data as SubmissionWithTeam[];
          const mappedApplications = mapSubmissionsToApplications(submissions);
          setApplications(mappedApplications);
        } else {
          // Fallback: update local state if refresh fails
          setApplications((prev) =>
            prev.map((app) =>
              app.id === selectedApplication.id
                ? {
                  ...app,
                  status: "rejected" as const,
                  rejectionComment: comment,
                  documentReviews: docReviews,
                }
                : app,
            ),
          );
        }
        toast.error(
          comment ? `Pengajuan ditolak: ${comment}` : "Pengajuan telah ditolak",
        );
        handleCloseModal();
      } else {
        // ✅ Backend validation errors
        console.error("❌ Backend validation error:", response.message);
        toast.error(
          response.message ||
          "Gagal menolak pengajuan. Pastikan validasi terpenuhi.",
        );
      }
    } catch (error) {
      console.error("❌ Error rejecting submission:", error);
      toast.error("Terjadi kesalahan saat menolak pengajuan");
    }
  };

  const getStatusBadge = (
    status: string,
    pendingLabel:
      | "Menunggu Review"
      | "Menunggu TTD Wakil Dekan" = "Menunggu Review",
  ) => {
    const isApproved = status === "approved";
    const isRejected = status === "rejected";
    const isPending = status === "pending";

    return (
      <Badge
        variant="outline"
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium whitespace-nowrap ${
          isApproved
            ? "bg-green-50 text-green-700 border-green-200"
            : isRejected
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
        }`}
      >
        <span
          className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
            isApproved ? "bg-green-500" : isRejected ? "bg-red-500" : "bg-amber-500"
          }`}
        />
        {status === "approved"
          ? "Disetujui"
          : status === "rejected"
            ? "Ditolak"
            : pendingLabel}
      </Badge>
    );
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div className="relative pb-2">
            <h1 className="text-xl sm:text-3xl font-bold text-foreground">
              Penerimaan Pengajuan Surat Pengantar
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Kelola dan review pengajuan surat pengantar dari mahasiswa
            </p>
            <div className="absolute bottom-0 left-0 h-1 w-20 bg-linear-to-r from-blue-600 via-yellow-300 to-red-500 rounded-full" />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <StatCard
            title={stats[0].title}
            value={stats[0].value}
            icon={stats[0].icon}
            iconBgColor="bg-blue-50"
            className="border-l-4 border-l-blue-600 shadow-sm"
          />
          <StatCard
            title={stats[1].title}
            value={stats[1].value}
            icon={stats[1].icon}
            iconBgColor="bg-yellow-50"
            className="border-l-4 border-l-yellow-300 shadow-sm"
          />
          <StatCard
            title={stats[2].title}
            value={stats[2].value}
            icon={stats[2].icon}
            iconBgColor="bg-red-50"
            className="border-l-4 border-l-red-500 shadow-sm"
          />
          <StatCard
            title={stats[3].title}
            value={stats[3].value}
            icon={stats[3].icon}
            iconBgColor="bg-blue-50"
            className="border-l-4 border-l-blue-600 shadow-sm"
          />
        </div>

        {/* Filter and Search */}
        <Card className="">
          <CardContent className="p-4 flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
            <div className="flex-1 min-w-62.5 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari nama mahasiswa atau nim..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-45 font-semibold">
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Menunggu Review</SelectItem>
                <SelectItem value="approved">Disetujui</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-foreground">
              Daftar Pengajuan Surat Pengantar
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">
                  Memuat data pengajuan...
                </p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all"
                    ? "Tidak ada pengajuan yang sesuai dengan filter"
                    : "Belum ada pengajuan surat pengantar"}
                </p>
              </div>
            ) : (
              <>
                {/* Scrollable Table View (Mobile & Desktop) */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="pl-6 whitespace-nowrap">
                          Tanggal
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Nama Mahasiswa
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Perusahaan
                        </TableHead>
                        <TableHead className="whitespace-nowrap">Status</TableHead>
                        <TableHead className="pr-6 whitespace-nowrap">
                          Aksi
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((app) => {
                        const leader =
                          app.members.find((m) => m.role === "Ketua") ||
                          app.members[0];
                        return (
                          <TableRow key={app.id} className="hover:bg-muted/50">
                            <TableCell className="text-foreground pl-6">
                              {app.date}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-foreground">
                                {leader?.name || "Unknown"}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {app.members.length > 1
                                  ? `+ ${app.members.length - 1} Anggota`
                                  : "Individu"}
                              </span>
                            </TableCell>
                            <TableCell className="text-foreground">
                              {app.internship.namaTempat}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(app.status, app.pendingLabel)}
                            </TableCell>
                            <TableCell className="pr-6">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-primary border-primary/50 hover:bg-primary/5"
                                onClick={() => handleReview(app)}
                              >
                                {app.status === "pending" ? "Review" : "Lihat"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

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
}

export default SubmissionAdminPage;
