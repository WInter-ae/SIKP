import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  Clock,
  Eye,
  Filter,
  ListOrdered,
  Search,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

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
import type { LucideIcon } from "lucide-react";
import MainVerificationDosenDialog from "../components/main-verification-dosen-dialog";
import type { MailEntry } from "../../hearing-dosen/types/dosen";
import {
  approveBulkDosenSuratKesediaanRequests,
  approveDosenSuratKesediaanRequest,
  getDosenSuratKesediaanRequests,
} from "~/lib/services/surat-kesediaan-api";
import { getMyProfile } from "~/lib/services/dosen-api";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  iconBgColor: string;
}

function StatCard({ title, value, icon: Icon, iconBgColor }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white mr-4 ${iconBgColor}`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-foreground">{value}</h3>
          <p className="text-muted-foreground text-md">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function normalizeStatus(status: string): MailEntry["status"] {
  const value = status.toLowerCase();
  if (value === "approved" || value === "disetujui") return "disetujui";
  if (value === "rejected" || value === "ditolak") return "ditolak";
  return "menunggu";
}

function resolveAssetUrl(url?: string): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;

  const apiBase =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_APP_AUTH_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "";

  if (!apiBase) return url;
  const base = apiBase.replace(/\/+$/, "");
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${base}${path}`;
}

function MailVerificationDosenPage() {
  const [entries, setEntries] = useState<MailEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<MailEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const [response, profileResponse] = await Promise.all([
        getDosenSuratKesediaanRequests(),
        getMyProfile(),
      ]);
      if (!response.success || !response.data) {
        toast.error(response.message || "Gagal memuat data verifikasi surat.");
        setEntries([]);
        return;
      }

      const dosenEsignatureUrl = profileResponse.success
        ? profileResponse.data?.esignature?.url
        : undefined;

      setEntries(
        response.data.map((item) => ({
          id: item.id,
          tanggal: item.tanggal,
          nim: item.nim,
          namaMahasiswa: item.namaMahasiswa,
          programStudi: item.programStudi,
          angkatan: item.angkatan,
          semester: item.semester,
          email: item.email,
          noHp: item.noHp,
          jenisSurat: item.jenisSurat || "Surat Kesediaan",
          status: normalizeStatus(item.status),
          dosenNama: item.dosenNama,
          dosenNip: item.dosenNip,
          dosenJabatan: item.dosenJabatan || "-",
          dosenEsignatureUrl:
            item.dosenEsignatureUrl ||
            item.dosen_esignature_url ||
            dosenEsignatureUrl,
          signedFileUrl: resolveAssetUrl(
            item.signedFileUrl || item.signed_file_url,
          ),
          approvedAt: item.approvedAt || item.approved_at,
        })),
      );
    } catch (error) {
      console.error("❌ Error loading surat verification data:", error);
      toast.error("Terjadi kesalahan saat memuat data verifikasi surat.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, []);

  const stats = useMemo(() => {
    const menunggu = entries.filter((e) => e.status === "menunggu").length;
    const disetujui = entries.filter((e) => e.status === "disetujui").length;
    const ditolak = entries.filter((e) => e.status === "ditolak").length;
    const total = entries.length;
    return [
      {
        title: "Menunggu Verifikasi",
        value: menunggu,
        icon: Clock,
        iconBgColor: "bg-amber-500",
      },
      {
        title: "Disetujui",
        value: disetujui,
        icon: CheckCircle,
        iconBgColor: "bg-green-600",
      },
      {
        title: "Ditolak",
        value: ditolak,
        icon: XCircle,
        iconBgColor: "bg-destructive",
      },
      {
        title: "Total Surat",
        value: total,
        icon: ListOrdered,
        iconBgColor: "bg-primary",
      },
    ];
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch =
        entry.namaMahasiswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.nim.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || entry.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [entries, searchTerm, statusFilter]);

  const handleView = (entry: MailEntry) => {
    setSelectedEntry(entry);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedEntry(null);
  };

  const handleApprove = async (id: string) => {
    const response = await approveDosenSuratKesediaanRequest(id);
    if (!response.success) {
      toast.error(response.message || "Gagal menyetujui pengajuan.");
      return;
    }

    setEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status: "disetujui" as const,
              approvedAt:
                response.data?.approvedAt ||
                response.data?.approved_at ||
                e.approvedAt,
              signedFileUrl:
                resolveAssetUrl(
                  response.data?.signedFileUrl ||
                    response.data?.signed_file_url,
                ) || e.signedFileUrl,
            }
          : e,
      ),
    );
    toast.success("Pengajuan surat berhasil disetujui.");

    // Refresh data to keep frontend in sync with backend source of truth.
    await loadRequests();
  };

  const handleApproveInline = async (id: string) => {
    await handleApprove(id);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredEntries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEntries.map((e) => e.id)));
    }
  };

  const handleApproveSelected = async () => {
    const pendingSelected = entries
      .filter((e) => selectedIds.has(e.id) && e.status === "menunggu")
      .map((e) => e.id);

    if (pendingSelected.length === 0) return;

    const response =
      await approveBulkDosenSuratKesediaanRequests(pendingSelected);
    if (!response.success) {
      toast.error(response.message || "Gagal menyetujui pengajuan terpilih.");
      return;
    }

    setEntries((prev) =>
      prev.map((e) =>
        pendingSelected.includes(e.id)
          ? { ...e, status: "disetujui" as const }
          : e,
      ),
    );
    setSelectedIds(new Set());
    const approvedCount =
      response.data?.approvedCount || pendingSelected.length;
    toast.success(`${approvedCount} pengajuan berhasil disetujui.`);

    // Refresh data to capture signed file URLs from backend.
    await loadRequests();
  };

  const selectedPendingCount = [...selectedIds].filter(
    (id) => entries.find((e) => e.id === id)?.status === "menunggu",
  ).length;

  const getStatusBadge = (status: MailEntry["status"]) => {
    switch (status) {
      case "menunggu":
        return (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
          >
            Menunggu Verifikasi
          </Badge>
        );
      case "disetujui":
        return (
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30"
          >
            Disetujui
          </Badge>
        );
      case "ditolak":
        return (
          <Badge
            variant="outline"
            className="bg-destructive/10 text-destructive border-destructive/30"
          >
            Ditolak
          </Badge>
        );
    }
  };

  return (
    <div className="p-6 md:p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Verifikasi Surat Mahasiswa
            </h1>
            <p className="text-muted-foreground mt-1">
              Kelola dan verifikasi pengajuan surat dari mahasiswa
            </p>
          </div>
        </div>

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

        <Card>
          <CardContent className="p-4 flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[250px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari nama mahasiswa atau NIM..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="menunggu">Menunggu Verifikasi</SelectItem>
                <SelectItem value="disetujui">Disetujui</SelectItem>
                <SelectItem value="ditolak">Ditolak</SelectItem>
              </SelectContent>
            </Select>
            <Button type="button">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-foreground">
                Daftar Pengajuan Surat
              </CardTitle>
              {selectedPendingCount > 0 && (
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => void handleApproveSelected()}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve {selectedPendingCount} Terpilih
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Memuat data surat...</p>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all"
                    ? "Tidak ada surat yang sesuai dengan filter"
                    : "Belum ada pengajuan surat"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="pl-4 w-10">
                      <input
                        type="checkbox"
                        checked={
                          filteredEntries.length > 0 &&
                          selectedIds.size === filteredEntries.length
                        }
                        onChange={toggleSelectAll}
                        aria-label="Pilih semua"
                        className="cursor-pointer accent-primary"
                      />
                    </TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>NIM</TableHead>
                    <TableHead>Nama Mahasiswa</TableHead>
                    <TableHead>Jenis Surat</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-6">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id} className="hover:bg-muted/50">
                      <TableCell className="pl-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(entry.id)}
                          onChange={() => toggleSelect(entry.id)}
                          aria-label={`Pilih ${entry.namaMahasiswa}`}
                          className="cursor-pointer accent-primary"
                        />
                      </TableCell>
                      <TableCell className="text-foreground">
                        {entry.tanggal}
                      </TableCell>
                      <TableCell className="text-primary font-medium">
                        {entry.nim}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {entry.namaMahasiswa}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {entry.jenisSurat || "Surat Kesediaan"}
                      </TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                      <TableCell className="pr-6">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-primary border-primary/50 hover:bg-primary/10"
                            onClick={() => handleView(entry)}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1.5" />
                            Lihat
                          </Button>
                          {entry.status === "menunggu" && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => void handleApproveInline(entry.id)}
                            >
                              <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                              Approve
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <MainVerificationDosenDialog
        entry={selectedEntry}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onApprove={(id) => void handleApprove(id)}
      />
    </div>
  );
}

export default MailVerificationDosenPage;
