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
} from "~/lib/services/submission-api";
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
          data: response.data,
        });

        if (response.success && response.data && response.data.length > 0) {
          console.log("✅ Loaded submissions from backend:", response.data);
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
            applications: mappedApplications,
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

  const handleApprove = async (
    docReviews: Record<string, "approved" | "rejected">,
  ) => {
    if (!selectedApplication) return;

    try {
      const response = await updateSubmissionStatus(
        selectedApplication.id.toString(),
        "APPROVED",
        undefined,
        docReviews,
      );

      if (response.success) {
        setApplications((prev) =>
          prev.map((app) =>
            app.id === selectedApplication.id
              ? {
                  ...app,
                  status: "approved" as const,
                  documentReviews: docReviews,
                }
              : app,
          ),
        );
        toast.success(
          "Pengajuan telah disetujui dan surat pengantar berhasil dibuat dan dikirimkan!",
        );
        handleCloseModal();
      } else {
        toast.error(response.message || "Gagal menyetujui pengajuan");
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
      const response = await updateSubmissionStatus(
        selectedApplication.id.toString(),
        "REJECTED",
        comment,
        docReviews,
      );

      if (response.success) {
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
        toast.error(
          comment ? `Pengajuan ditolak: ${comment}` : "Pengajuan telah ditolak",
        );
        handleCloseModal();
      } else {
        toast.error(response.message || "Gagal menolak pengajuan");
      }
    } catch (error) {
      console.error("❌ Error rejecting submission:", error);
      toast.error("Terjadi kesalahan saat menolak pengajuan");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
          >
            Menunggu Review
          </Badge>
        );
      case "approved":
        return (
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30"
          >
            Disetujui
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-destructive/10 text-destructive border-destructive/30"
          >
            Ditolak
          </Badge>
        );
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="p-6 md:p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Penerimaan Pengajuan Surat Pengantar
            </h1>
            <p className="text-muted-foreground mt-1">
              Kelola dan review pengajuan surat pengantar dari mahasiswa
            </p>
          </div>
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
        <Card>
          <CardContent className="p-4 flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[250px] relative">
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
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Menunggu Review</SelectItem>
                <SelectItem value="approved">Disetujui</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
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
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="pl-6">Tanggal</TableHead>
                    <TableHead>Nama Mahasiswa</TableHead>
                    <TableHead>Perusahaan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-6">Aksi</TableHead>
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
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell className="pr-6">
                        <Button
                          variant="link"
                          className="p-0 h-auto text-primary hover:text-primary/80"
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
