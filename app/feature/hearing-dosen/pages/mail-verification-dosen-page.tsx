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
import MainVerificationDosenDialog from "../components/mail-verification-dialog";
import type { MailEntry } from "../../hearing-dosen/types/dosen";
import {
  approveBulkDosenSuratKesediaanRequests,
  approveDosenSuratKesediaanRequest,
  getDosenSuratKesediaanRequests,
  rejectDosenSuratKesediaanRequest,
} from "~/lib/services/surat-kesediaan-api";
import {
  approveBulkDosenSuratPermohonanRequests,
  approveDosenSuratPermohonanRequest,
  getDosenSuratPermohonanRequests,
  rejectDosenSuratPermohonanRequest,
} from "~/lib/services/surat-permohonan-api";
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

function pickFirstNonEmptyString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) return value;
  }
  return undefined;
}

function resolveMahasiswaSignatureUrl(
  item: Record<string, unknown>,
): string | undefined {
  const nestedEsignature =
    item.mahasiswaEsignature && typeof item.mahasiswaEsignature === "object"
      ? (item.mahasiswaEsignature as Record<string, unknown>)
      : undefined;

  const candidate = pickFirstNonEmptyString(
    item.mahasiswaEsignatureUrl,
    item.mahasiswa_esignature_url,
    item.mahasiswaSignatureUrl,
    item.mahasiswa_signature_url,
    item.mahasiswaESignatureUrl,
    nestedEsignature?.url,
  );

  return resolveAssetUrl(candidate);
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
      const [kesediaanResponse, permohonanResponse, profileResponse] =
        await Promise.all([
          getDosenSuratKesediaanRequests(),
          getDosenSuratPermohonanRequests(),
          getMyProfile(),
        ]);

      const dosenEsignatureUrl = profileResponse.success
        ? profileResponse.data?.esignature?.url
        : undefined;

      if (!kesediaanResponse.success) {
        console.warn(
          "⚠️ Gagal memuat surat kesediaan:",
          kesediaanResponse.message,
        );
      }
      if (!permohonanResponse.success) {
        console.warn(
          "⚠️ Gagal memuat surat permohonan:",
          permohonanResponse.message,
        );
      }

      if (!kesediaanResponse.success && !permohonanResponse.success) {
        toast.error("Gagal memuat data verifikasi surat.");
        setEntries([]);
        return;
      }

      const kesediaanEntries =
        kesediaanResponse.success && kesediaanResponse.data
          ? kesediaanResponse.data.map((item) => ({
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
              mahasiswaEsignatureUrl: resolveMahasiswaSignatureUrl(
                item as unknown as Record<string, unknown>,
              ),
              signedFileUrl: resolveAssetUrl(
                item.signedFileUrl || item.signed_file_url,
              ),
              approvedAt: item.approvedAt || item.approved_at,
            }))
          : [];

      const permohonanEntries =
        permohonanResponse.success && permohonanResponse.data
          ? permohonanResponse.data.map((item) => ({
              id: item.id,
              tanggal: item.tanggal,
              nim: item.nim,
              namaMahasiswa: item.namaMahasiswa,
              programStudi: item.programStudi,
              angkatan: item.angkatan,
              semester: item.semester,
              email: item.email,
              noHp: item.noHp,
              jenisSurat: "Surat Permohonan",
              status: normalizeStatus(item.status),
              dosenNama: item.dosenNama,
              dosenNip: item.dosenNip,
              dosenJabatan: item.dosenJabatan || "-",
              dosenEsignatureUrl:
                item.dosenEsignatureUrl ||
                item.dosen_esignature_url ||
                dosenEsignatureUrl,
              mahasiswaEsignatureUrl: resolveMahasiswaSignatureUrl(
                item as unknown as Record<string, unknown>,
              ),
              signedFileUrl: resolveAssetUrl(
                item.signedFileUrl || item.signed_file_url,
              ),
              approvedAt: item.approvedAt || item.approved_at,
              // Fields permohonan
              namaPerusahaan: item.namaPerusahaan,
              alamatPerusahaan: item.alamatPerusahaan,
              teleponPerusahaan: item.teleponPerusahaan,
              jenisProdukUsaha: item.jenisProdukUsaha,
              divisi: item.divisi,
              tanggalMulai: item.tanggalMulai,
              tanggalSelesai: item.tanggalSelesai,
              jumlahSks: item.jumlahSks,
              tahunAjaran: item.tahunAjaran,
            }))
          : [];

      setEntries([...kesediaanEntries, ...permohonanEntries]);
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

  const handleApprove = async (entryOrId: MailEntry | string) => {
    const targetEntry =
      typeof entryOrId === "string"
        ? entries.find((e) => e.id === entryOrId)
        : entryOrId;

    if (!targetEntry) {
      toast.error("Data pengajuan tidak ditemukan.");
      return;
    }

    const id = targetEntry.id;
    const isPermohonan = targetEntry?.jenisSurat === "Surat Permohonan";

    const response = isPermohonan
      ? await approveDosenSuratPermohonanRequest(id, {
          mahasiswaEsignatureUrl: targetEntry.mahasiswaEsignatureUrl,
        })
      : await approveDosenSuratKesediaanRequest(id);

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

  const handleApproveInline = async (entry: MailEntry) => {
    await handleApprove(entry);
  };

  const handleReject = async (id: string, reason: string) => {
    const targetEntry = entries.find((e) => e.id === id);
    if (!targetEntry) {
      toast.error("Data pengajuan tidak ditemukan.");
      return;
    }

    const isPermohonan = targetEntry.jenisSurat === "Surat Permohonan";

    const response = isPermohonan
      ? await rejectDosenSuratPermohonanRequest(id, reason)
      : await rejectDosenSuratKesediaanRequest(id, reason);

    if (!response.success) {
      toast.error(response.message || "Gagal menolak pengajuan.");
      return;
    }

    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: "ditolak" as const } : e)),
    );

    toast.success("Pengajuan surat berhasil ditolak.");

    await loadRequests();
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

    const kesediaanIds = pendingSelected.filter(
      (id) =>
        entries.find((e) => e.id === id)?.jenisSurat !== "Surat Permohonan",
    );
    const permohonanIds = pendingSelected.filter(
      (id) =>
        entries.find((e) => e.id === id)?.jenisSurat === "Surat Permohonan",
    );

    const [kesediaanResult, permohonanResult] = await Promise.all([
      kesediaanIds.length > 0
        ? approveBulkDosenSuratKesediaanRequests(kesediaanIds)
        : Promise.resolve({
            success: true,
            message: "",
            data: { approvedCount: 0 },
          }),
      permohonanIds.length > 0
        ? approveBulkDosenSuratPermohonanRequests(permohonanIds, {
            signatures: entries
              .filter(
                (e) =>
                  permohonanIds.includes(e.id) &&
                  typeof e.mahasiswaEsignatureUrl === "string" &&
                  e.mahasiswaEsignatureUrl.trim().length > 0,
              )
              .map((e) => ({
                requestId: e.id,
                mahasiswaEsignatureUrl: e.mahasiswaEsignatureUrl!,
              })),
          })
        : Promise.resolve({
            success: true,
            message: "",
            data: { approvedCount: 0 },
          }),
    ]);

    if (!kesediaanResult.success && kesediaanIds.length > 0) {
      toast.error(
        kesediaanResult.message || "Gagal menyetujui surat kesediaan terpilih.",
      );
    }
    if (!permohonanResult.success && permohonanIds.length > 0) {
      toast.error(
        permohonanResult.message ||
          "Gagal menyetujui surat permohonan terpilih.",
      );
    }

    setEntries((prev) =>
      prev.map((e) =>
        pendingSelected.includes(e.id)
          ? { ...e, status: "disetujui" as const }
          : e,
      ),
    );
    setSelectedIds(new Set());

    const totalApproved =
      (kesediaanResult.data?.approvedCount ?? 0) +
      ((permohonanResult.data?.approvedCount ?? 0) || pendingSelected.length);
    toast.success(`${totalApproved} pengajuan berhasil disetujui.`);

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
                        {entry.jenisSurat}
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
                              onClick={() => void handleApproveInline(entry)}
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
        onApprove={(entry) => void handleApprove(entry)}
        onReject={(id, reason) => void handleReject(id, reason)}
      />
    </div>
  );
}

export default MailVerificationDosenPage;
