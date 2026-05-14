import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  GraduationCap,
  Users,
  Clock,
  ListOrdered,
  CheckCircle,
  FileText,
  UserCheck,
  Inbox,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Wrench,
  AlertCircle,
  CheckCircle2 as CheckIcon,
  Loader2,
} from "lucide-react";

export type AdminActivityItem = {
  action: string;
  time: string;
  status: "success" | "info";
};

export type AdminMonthlyStat = {
  month: string;
  submissions: number;
  approved: number;
  approvalRate: number;
};

export interface DashboardAdminData {
  totalMahasiswaKp?: number;
  jumlahTimKp?: number;
  mahasiswaAktifSemester4?: number;
  totalPengajuanSuratPengantar?: number;
  totalSuratBalasan?: number;
  totalDosenPembimbingKp?: number;
  totalTemplateDokumen?: number;
  statistikPengajuan?: AdminMonthlyStat[];
  activities?: AdminActivityItem[];
}

interface DashboardAdminPageProps {
  data?: DashboardAdminData | null;
  backfillLoading?: boolean;
  backfillResult?: { updated: number; skipped: number } | null;
  backfillError?: string | null;
  onBackfillDosen?: () => void;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center text-sm text-muted-foreground">
      <Inbox className="h-5 w-5" />
      <span>{message}</span>
    </div>
  );
}

function formatValue(value?: number) {
  return typeof value === "number" ? value.toString() : "-";
}

export default function DashboardAdminPage({
  data,
  backfillLoading,
  backfillResult,
  backfillError,
  onBackfillDosen,
}: DashboardAdminPageProps) {
  const statistikPengajuan = data?.statistikPengajuan ?? [];
  const activities = data?.activities ?? [];

  const statCards = [
    {
      title: "Total Mahasiswa KP",
      value: data?.totalMahasiswaKp,
      description: "Berdasarkan surat balasan dengan letter_status APPROVED.",
      icon: GraduationCap,
    },
    {
      title: "Jumlah Tim KP",
      value: data?.jumlahTimKp,
      description: "Berdasarkan tim dengan status FIXED.",
      icon: Users,
    },
    {
      title: "Mahasiswa Aktif Semester 4",
      value: data?.mahasiswaAktifSemester4,
      description: "Jumlah mahasiswa dengan semester = 4.",
      icon: Clock,
    },
    {
      title: "Total Pengajuan Surat Pengantar",
      value: data?.totalPengajuanSuratPengantar,
      description: "Konsisten dengan data halaman submission admin.",
      icon: ListOrdered,
    },
    {
      title: "Total Surat Balasan",
      value: data?.totalSuratBalasan,
      description: "Total seluruh surat balasan yang masuk.",
      icon: CheckCircle,
    },
    {
      title: "Total Dosen Pembimbing KP",
      value: data?.totalDosenPembimbingKp,
      description: "Jumlah dosen unik yang jadi pembimbing tim KP.",
      icon: UserCheck,
    },
    {
      title: "Template Dokumen",
      value: data?.totalTemplateDokumen,
      description: "Jumlah data template pada tabel templates.",
      icon: FileText,
    },
  ];

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
      <div className="relative pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Dashboard Admin Prodi
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Ringkasan metrik utama pengelolaan kerja praktik.
        </p>
        <div className="absolute bottom-0 left-0 h-1 w-20 bg-linear-to-r from-blue-600 via-yellow-300 to-red-500 rounded-full" />
      </div>

      <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => {
          const borderColors = [
            "border-l-blue-600",
            "border-l-yellow-300",
            "border-l-red-500",
            "border-l-blue-600",
            "border-l-yellow-300",
            "border-l-red-500",
            "border-l-blue-600"
          ];
          const bgColors = [
            "bg-blue-50/30 dark:bg-blue-900/10",
            "bg-yellow-50/30 dark:bg-yellow-900/10",
            "bg-red-50/30 dark:bg-red-900/10",
            "bg-blue-50/30 dark:bg-blue-900/10",
            "bg-yellow-50/30 dark:bg-yellow-900/10",
            "bg-red-50/30 dark:bg-red-900/10",
            "bg-blue-50/30 dark:bg-blue-900/10"
          ];
          const iconColors = [
            "text-blue-600 dark:text-blue-400",
            "text-yellow-600 dark:text-yellow-300",
            "text-red-600 dark:text-red-400",
            "text-blue-600 dark:text-blue-400",
            "text-yellow-600 dark:text-yellow-400",
            "text-red-600 dark:text-red-400",
            "text-blue-600 dark:text-blue-400"
          ];
          
          return (
            <Card key={card.title} className={`py-3 border-l-4 ${borderColors[index % borderColors.length]} ${bgColors[index % bgColors.length]} shadow-sm hover:shadow-md transition-shadow duration-200`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4">
                <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {card.title}
                </CardTitle>
                <div className={`p-1.5 rounded-full bg-background border border-border shadow-xs ${iconColors[index % iconColors.length]}`}>
                  <card.icon className="h-3.5 w-3.5" />
                </div>
              </CardHeader>
              <CardContent className="px-4">
                <div className="text-2xl font-extrabold tracking-tight">
                  {formatValue(card.value)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="shadow-lg border-none bg-linear-to-b from-background to-blue-50/20 dark:to-blue-900/5 overflow-hidden">
        <div className="h-1.5 w-full" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Statistik Pengajuan 4 Bulan Terakhir
          </CardTitle>
          <CardDescription>
            Menampilkan total pengajuan, total approved, dan approval rate per
            bulan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {statistikPengajuan.length > 0 ? (
            <div className="space-y-8 py-2">
              {statistikPengajuan.map((stat) => (
                <div key={stat.month} className="group">
                  <div className="flex items-end justify-between mb-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground w-[45px] uppercase tracking-tight">
                          {stat.month}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">
                            Total Pengajuan
                          </span>
                          <span className="text-sm font-black leading-none">
                            {stat.submissions}
                          </span>
                        </div>
                        <div className="h-6 w-px bg-border" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">
                            Disetujui
                          </span>
                          <span className="text-sm font-black text-blue-600 dark:text-blue-400 leading-none">
                            {stat.approved}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">
                        Approval Rate
                      </span>
                      <span className="text-2xl font-black text-blue-600 dark:text-blue-400 leading-none">
                        {stat.approvalRate}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-blue-600 to-blue-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(37,99,235,0.2)]"
                      style={{ width: `${stat.approvalRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="Belum ada statistik pengajuan." />
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg border-l-0 border-t-yellow-300 border-t-4 border-r-0 border-b-0 bg-linear-to-b from-background to-yellow-50/20 dark:to-yellow-900/5 overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListOrdered className="h-5 w-5 text-yellow-600" />
            Log Aktivitas Terbaru
          </CardTitle>
          <CardDescription>
            Riwayat aktivitas administrasi terbaru
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <div
                  key={`${activity.action}-${activity.time}-${index}`}
                  className="flex items-start gap-3 text-sm"
                >
                  <div
                    className={`h-2 w-2 rounded-full shrink-0 mt-1.5 ${
                      activity.status === "success"
                        ? "bg-green-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <span className="flex-1 min-w-0 break-words">{activity.action}</span>
                  <span className="text-muted-foreground shrink-0 text-xs whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="Belum ada aktivitas terbaru." />
          )}
        </CardContent>
      </Card>
      {/* ── Utilitas Sistem ─────────────────────────────────────────── */}
      <Card className="shadow-lg border-l-4 border-l-orange-500 bg-orange-50/20 dark:bg-orange-900/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wrench className="h-4 w-4 text-orange-600" />
            Utilitas Sistem
          </CardTitle>
          <CardDescription>
            Alat perbaikan data internal. Jalankan hanya jika diperlukan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-orange-200 dark:border-orange-800 bg-background">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Repair Data Dosen Pembimbing</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Mengisi kolom <code className="bg-muted px-1 rounded text-[11px]">dosenPembimbingId</code> pada internship
                yang masih kosong berdasarkan data persetujuan judul.
              </p>
            </div>
            <Button
              id="btn-backfill-dosen"
              variant="outline"
              size="sm"
              disabled={backfillLoading}
              onClick={onBackfillDosen}
              className="shrink-0 border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
            >
              {backfillLoading ? (
                <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Memproses...</>
              ) : (
                <><Wrench className="h-3.5 w-3.5 mr-1.5" /> Jalankan Repair</>
              )}
            </Button>
          </div>

          {/* Result */}
          {backfillResult && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm">
              <CheckIcon className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-800 dark:text-green-300">Repair selesai</p>
                <p className="text-green-700 dark:text-green-400">
                  {backfillResult.updated} internship diperbarui &bull; {backfillResult.skipped} dilewati
                </p>
              </div>
            </div>
          )}

          {backfillError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800 dark:text-red-300">Gagal</p>
                <p className="text-red-700 dark:text-red-400">{backfillError}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
