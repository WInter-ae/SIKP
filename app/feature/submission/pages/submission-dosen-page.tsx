import { useEffect, useMemo, useState } from "react";
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
import CoverLetterVerificationDialog from "~/feature/hearing-dosen/components/cover-letter-verification-dialog";
import type { MailEntry } from "~/feature/hearing-dosen/types/dosen";
import {
  approveDosenSuratPengantarRequest,
  type DosenSuratPengantarRequestItem,
  getSubmissionDetailForVerifier,
  type SubmissionDetailForVerifier,
  getDosenSuratPengantarRequests,
  rejectDosenSuratPengantarRequest,
} from "~/lib/services/surat-pengantar-dosen-api";
import { getMyProfile } from "~/lib/services/dosen-api";

type AdminGateCandidate = {
  isAdminApproved?: unknown;
  adminVerificationStatus?: unknown;
  admin_status?: unknown;
  adminStatus?: unknown;
  submissionStatus?: unknown;
  submission_status?: unknown;
};

type MahasiswaDetail = {
  programStudi?: string;
  angkatan?: string;
  semester?: string;
  email?: string;
  noHp?: string;
};

type TeamMemberCard = {
  id: string;
  name: string;
  nim?: string;
  prodi?: string;
  role: string;
};

type SubmissionTeamInfo = {
  members: TeamMemberCard[];
  supervisor?: string;
  leader?: {
    nim?: string;
    name?: string;
    prodi?: string;
    email?: string;
    angkatan?: string;
    semester?: string;
    noHp?: string;
  };
};

function resolveSubmissionSupervisor(
  submission: SubmissionDetailForVerifier,
): string | undefined {
  const team = submission.team;
  const candidates = [
    team?.academicSupervisor,
    team?.academic_supervisor,
    team?.supervisorName,
    team?.supervisor_name,
    team?.supervisor?.name,
    team?.supervisor?.fullName,
    submission.academicSupervisor,
    submission.academic_supervisor,
    submission.supervisorName,
    submission.supervisor_name,
    submission.supervisor?.name,
    submission.supervisor?.fullName,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate;
    }
  }

  return undefined;
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
    import.meta.env.VITE_SIKP_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_APP_AUTH_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? "http://localhost:3000" : "");

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

function resolveSuratPengantarTujuan(item: DosenSuratPengantarRequestItem): string {
  return (
    pickFirstNonEmptyString(
      item.tujuanSurat,
      item.recipientName,
      item.destination,
      item.targetName,
      item.companyName,
    ) || "-"
  );
}

function resolveSuratPengantarSignedFileUrl(
  item: Pick<
    DosenSuratPengantarRequestItem,
    | "signedFileUrl"
    | "signed_file_url"
    | "finalSignedFileUrl"
    | "final_signed_file_url"
  >,
): string | undefined {
  const candidate = pickFirstNonEmptyString(
    item.signedFileUrl,
    item.signed_file_url,
    item.finalSignedFileUrl,
    item.final_signed_file_url,
  );

  return resolveAssetUrl(candidate);
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

function formatTanggalForTable(value?: string | null): string {
  if (!value) return "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function normalizeStatusToken(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.trim().toUpperCase();
}

function isAdminApprovedForDosenQueue(item: AdminGateCandidate): boolean {
  const explicitBoolean = item.isAdminApproved;
  if (typeof explicitBoolean === "boolean") return explicitBoolean;

  const statusCandidates = [
    item.adminVerificationStatus,
    item.admin_status,
    item.adminStatus,
    item.submissionStatus,
    item.submission_status,
  ]
    .map(normalizeStatusToken)
    .filter((value): value is string => Boolean(value));

  const approvedTokens = new Set(["APPROVED", "DISETUJUI"]);
  const rejectedTokens = new Set(["REJECTED", "DITOLAK"]);
  const pendingTokens = new Set([
    "PENDING",
    "PENDING_REVIEW",
    "DRAFT",
    "PENDING_ADMIN_REVIEW",
  ]);

  if (statusCandidates.some((token) => approvedTokens.has(token))) return true;
  if (statusCandidates.some((token) => rejectedTokens.has(token))) return false;
  if (statusCandidates.some((token) => pendingTokens.has(token))) return false;

  // Backward compatibility: if backend belum kirim field admin status,
  // tetap tampilkan agar behavior lama tidak putus.
  return true;
}

function normalizeLookupKey(value?: string | null): string {
  return (value || "").trim().toLowerCase();
}

function mergeMahasiswaDetail(
  current: MahasiswaDetail | undefined,
  next: MahasiswaDetail,
): MahasiswaDetail {
  return {
    programStudi: current?.programStudi || next.programStudi,
    angkatan: current?.angkatan || next.angkatan,
    semester: current?.semester || next.semester,
    email: current?.email || next.email,
    noHp: current?.noHp || next.noHp,
  };
}

function addMahasiswaDetailIndex(
  detailByNim: Map<string, MahasiswaDetail>,
  detailByName: Map<string, MahasiswaDetail>,
  item: {
    nim?: string | null;
    namaMahasiswa?: string | null;
    programStudi?: string;
    email?: string;
    angkatan?: string;
    semester?: string;
    noHp?: string;
  },
) {
  const detail: MahasiswaDetail = {
    programStudi: item.programStudi,
    angkatan: item.angkatan,
    semester: item.semester,
    email: item.email,
    noHp: item.noHp,
  };

  const nimKey = normalizeLookupKey(item.nim);
  if (nimKey) {
    detailByNim.set(
      nimKey,
      mergeMahasiswaDetail(detailByNim.get(nimKey), detail),
    );
  }

  const nameKey = normalizeLookupKey(item.namaMahasiswa);
  if (nameKey) {
    detailByName.set(
      nameKey,
      mergeMahasiswaDetail(detailByName.get(nameKey), detail),
    );
  }
}

function extractMahasiswaDetailFromSubmission(
  submission: SubmissionDetailForVerifier | null,
): {
  nim?: string | null;
  namaMahasiswa?: string | null;
  programStudi?: string;
  email?: string;
  angkatan?: string;
  semester?: string;
  noHp?: string;
} | null {
  if (!submission?.team?.members || submission.team.members.length === 0) {
    return null;
  }

  const acceptedMembers = submission.team.members.filter(
    (member) => member.status === "ACCEPTED" || !member.status,
  );
  if (acceptedMembers.length === 0) return null;

  const leader =
    acceptedMembers.find((member) => member.role === "KETUA") ||
    acceptedMembers[0];
  if (!leader?.user) return null;

  return {
    nim: leader.user.nim,
    namaMahasiswa: leader.user.name,
    programStudi: leader.user.prodi || undefined,
    email: leader.user.email || undefined,
    angkatan: leader.user.angkatan || undefined,
    semester: leader.user.semester || undefined,
    noHp:
      leader.user.noHp || leader.user.no_hp || leader.user.phone || undefined,
  };
}

function extractTeamInfoFromSubmission(
  submission: SubmissionDetailForVerifier | null,
): SubmissionTeamInfo | null {
  if (!submission?.team?.members || submission.team.members.length === 0) {
    return null;
  }

  const acceptedMembers = submission.team.members.filter(
    (member) => member.status === "ACCEPTED" || !member.status,
  );

  if (acceptedMembers.length === 0) {
    return null;
  }

  const mappedMembers: TeamMemberCard[] = acceptedMembers
    .map((member, index) => ({
      id: member.user?.id || member.userId || `${index}`,
      name: member.user?.name || member.name || "Unknown",
      nim: member.user?.nim || member.nim || undefined,
      prodi: member.user?.prodi || member.prodi || undefined,
      role: member.role === "KETUA" ? "Ketua" : "Anggota",
    }))
    .sort((a, b) => {
      if (a.role === "Ketua") return -1;
      if (b.role === "Ketua") return 1;
      return 0;
    });

  const leaderRaw =
    acceptedMembers.find((member) => member.role === "KETUA") ||
    acceptedMembers[0];

  return {
    members: mappedMembers,
    supervisor: resolveSubmissionSupervisor(submission),
    leader: leaderRaw?.user
      ? {
          nim: leaderRaw.user.nim || undefined,
          name: leaderRaw.user.name || undefined,
          prodi: leaderRaw.user.prodi || undefined,
          email: leaderRaw.user.email || undefined,
          angkatan: leaderRaw.user.angkatan || undefined,
          semester: leaderRaw.user.semester || undefined,
          noHp:
            leaderRaw.user.noHp ||
            leaderRaw.user.no_hp ||
            leaderRaw.user.phone ||
            undefined,
        }
      : undefined,
  };
}

function getMahasiswaDetail(
  detailByNim: Map<string, MahasiswaDetail>,
  detailByName: Map<string, MahasiswaDetail>,
  item: DosenSuratPengantarRequestItem,
): MahasiswaDetail {
  const nimKey = normalizeLookupKey(item.nim);
  if (nimKey && detailByNim.has(nimKey)) {
    return detailByNim.get(nimKey) || {};
  }

  const nameKey = normalizeLookupKey(item.namaMahasiswa);
  if (nameKey && detailByName.has(nameKey)) {
    return detailByName.get(nameKey) || {};
  }

  return {};
}

function SubmissionDosenPage() {
  const [entries, setEntries] = useState<MailEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<MailEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadRequests = async () => {
    try {
      setIsLoading(true);

      const [response, profileResponse] = await Promise.all([
        getDosenSuratPengantarRequests(),
        getMyProfile(),
      ]);

      if (!response.success) {
        console.warn("⚠️ Gagal memuat surat pengantar:", response.message);
        toast.error("Gagal memuat data verifikasi surat.");
        setEntries([]);
        return;
      }

      const dosenNama = profileResponse.success ? profileResponse.data?.nama : undefined;
      const dosenNip = profileResponse.success ? profileResponse.data?.nip : undefined;
      const dosenJabatan = profileResponse.success
        ? profileResponse.data?.jabatan
        : undefined;
      const dosenEsignatureUrl = profileResponse.success
        ? resolveAssetUrl(profileResponse.data?.esignature?.url)
        : undefined;

      const detailByNim = new Map<string, MahasiswaDetail>();
      const detailByName = new Map<string, MahasiswaDetail>();
      const teamInfoBySubmissionId = new Map<string, SubmissionTeamInfo>();

      if (response.data && response.data.length > 0) {
        response.data.forEach((item) => {
          addMahasiswaDetailIndex(detailByNim, detailByName, {
            nim: item.nim,
            namaMahasiswa: item.namaMahasiswa,
            programStudi: item.programStudi,
            email: item.email,
            angkatan: item.angkatan,
            semester: item.semester,
            noHp: item.noHp,
          });
        });
      }

      if (response.data && response.data.length > 0) {
        const detailResponses = await Promise.all(
          response.data.map(async (item) => ({
            submissionId: item.submissionId || item.id,
            detailResponse: await getSubmissionDetailForVerifier(
              item.submissionId || item.id,
            ),
          })),
        );

        detailResponses.forEach(({ submissionId, detailResponse }) => {
          if (!detailResponse.success || !detailResponse.data) {
            return;
          }

          const teamInfo = extractTeamInfoFromSubmission(detailResponse.data);
          if (teamInfo) {
            teamInfoBySubmissionId.set(submissionId, teamInfo);
          }

          const extracted = extractMahasiswaDetailFromSubmission(
            detailResponse.data,
          );
          if (!extracted) return;

          addMahasiswaDetailIndex(detailByNim, detailByName, extracted);
        });
      }

      const suratPengantarEntries =
        response.success && response.data
          ? response.data
              .filter((item) => isAdminApprovedForDosenQueue(item))
              .map((item) => {
                const detail = getMahasiswaDetail(
                  detailByNim,
                  detailByName,
                  item,
                );
                const teamInfo = teamInfoBySubmissionId.get(
                  item.submissionId || item.id,
                );

                return {
                  id: item.id,
                  tanggal: formatTanggalForTable(
                    item.tanggal || item.createdAt,
                  ),
                  nim: item.nim || "-",
                  namaMahasiswa: item.namaMahasiswa || "-",
                  programStudi: detail.programStudi || item.programStudi || "-",
                  angkatan: detail.angkatan || undefined,
                  semester: detail.semester || undefined,
                  email: detail.email || undefined,
                  noHp: detail.noHp || undefined,
                  jenisSurat: item.jenisSurat || "Surat Pengantar",
                  status: normalizeStatus(item.status || "menunggu"),
                  supervisor: teamInfo?.supervisor,
                  teamMembers: teamInfo?.members,
                  mahasiswaEsignatureUrl: resolveMahasiswaSignatureUrl(
                    item as unknown as Record<string, unknown>,
                  ),
                  signedFileUrl: resolveSuratPengantarSignedFileUrl(item),
                  approvedAt: item.approvedAt || item.approved_at,
                  namaPerusahaan: item.companyName,
                  tujuanSurat: resolveSuratPengantarTujuan(item),
                  alamatPerusahaan: item.companyAddress,
                  teleponPerusahaan: undefined,
                  jenisProdukUsaha: undefined,
                  divisi: item.division,
                  tanggalMulai: item.startDate,
                  tanggalSelesai: item.endDate,
                  jumlahSks: undefined,
                  tahunAjaran: undefined,
                  dosenNama: dosenNama || "-",
                  dosenNip: dosenNip || "-",
                  dosenJabatan: dosenJabatan || "Wakil Dekan Bidang Akademik",
                  dosenEsignatureUrl,
                  nomorSurat: item.nomorSurat || item.letterNumber,
                };
              })
          : [];

      setEntries(suratPengantarEntries);
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
    const menunggu = entries.filter(
      (entry) => entry.status === "menunggu",
    ).length;
    const disetujui = entries.filter(
      (entry) => entry.status === "disetujui",
    ).length;
    const ditolak = entries.filter(
      (entry) => entry.status === "ditolak",
    ).length;
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
        title: "Total Pengajuan",
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

  const handleReview = (entry: MailEntry) => {
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
        ? entries.find((entry) => entry.id === entryOrId)
        : entryOrId;

    if (!targetEntry) {
      toast.error("Data pengajuan tidak ditemukan.");
      return;
    }

    const response = await approveDosenSuratPengantarRequest(targetEntry.id);

    if (!response.success) {
      toast.error(response.message || "Gagal menyetujui pengajuan.");
      return;
    }

    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === targetEntry.id
          ? {
              ...entry,
              status: "disetujui" as const,
              approvedAt:
                response.data?.approvedAt ||
                response.data?.approved_at ||
                entry.approvedAt,
              signedFileUrl:
                resolveAssetUrl(
                  pickFirstNonEmptyString(
                    response.data?.signedFileUrl,
                    response.data?.signed_file_url,
                    response.data?.finalSignedFileUrl,
                    response.data?.final_signed_file_url,
                  ),
                ) || entry.signedFileUrl,
            }
          : entry,
      ),
    );

    toast.success("Pengajuan surat berhasil disetujui.");
    await loadRequests();
  };

  const handleReject = async (id: string, reason: string) => {
    const targetEntry = entries.find((entry) => entry.id === id);
    if (!targetEntry) {
      toast.error("Data pengajuan tidak ditemukan.");
      return;
    }

    const response = await rejectDosenSuratPengantarRequest(id, reason);

    if (!response.success) {
      toast.error(response.message || "Gagal menolak pengajuan.");
      return;
    }

    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, status: "ditolak" as const } : entry,
      ),
    );

    toast.success("Pengajuan surat berhasil ditolak.");
    await loadRequests();
  };

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
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="p-6 md:p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Verifikasi Pengajuan Surat Pengantar
            </h1>
            <p className="text-muted-foreground mt-1">
              Kelola dan verifikasi surat mahasiswa sebagai tahap tanda tangan
              dosen
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
                onChange={(event) => setSearchTerm(event.target.value)}
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
            <CardTitle className="text-lg font-semibold text-foreground">
              Daftar Pengajuan Surat untuk Verifikasi Dosen
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">
                  Memuat data pengajuan...
                </p>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all"
                    ? "Tidak ada pengajuan yang sesuai dengan filter"
                    : "Belum ada pengajuan dari admin untuk diverifikasi dosen"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="pl-6">Tanggal</TableHead>
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
                      <TableCell className="text-foreground pl-6">
                        {entry.tanggal}
                      </TableCell>
                      <TableCell className="text-primary font-medium">
                        {entry.nim}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground">
                          {entry.namaMahasiswa}
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">
                        {entry.jenisSurat || "Surat"}
                      </TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                      <TableCell className="pr-6">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-primary border-primary/50 hover:bg-primary/5"
                          onClick={() => handleReview(entry)}
                        >
                          {entry.status === "menunggu" ? "Review" : "Lihat"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <CoverLetterVerificationDialog
          entry={selectedEntry}
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          onApprove={(entry) => void handleApprove(entry)}
          onReject={(id, reason) => void handleReject(id, reason)}
        />
      </div>
    </div>
  );
}

export default SubmissionDosenPage;
