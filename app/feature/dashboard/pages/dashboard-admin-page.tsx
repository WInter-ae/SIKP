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
  Archive,
  Award,
  Settings,
  ShieldAlert,
} from "lucide-react";
import { Link } from "react-router";

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
  onRepairKaprodi?: () => void;
  repairLoading?: boolean;
  repairResult?: { updated: number; synced: number; skipped: number } | null;
  repairError?: string | null;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center text-sm text-slate-500">
      <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3">
        <Inbox className="h-6 w-6 text-slate-400" />
      </div>
      <span className="font-medium">{message}</span>
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
  onRepairKaprodi,
  repairLoading,
  repairResult,
  repairError,
}: DashboardAdminPageProps) {
  const statistikPengajuan = data?.statistikPengajuan ?? [];
  const activities = data?.activities ?? [];

  const statCards = [
    {
      title: "Total Mahasiswa KP",
      value: data?.totalMahasiswaKp,
      description: "Berdasarkan surat balasan dengan letter_status APPROVED.",
      icon: GraduationCap,
      color: "blue"
    },
    {
      title: "Jumlah Tim KP",
      value: data?.jumlahTimKp,
      description: "Berdasarkan tim dengan status FIXED.",
      icon: Users,
      color: "amber"
    },
    {
      title: "Mahasiswa Aktif Smt 4",
      value: data?.mahasiswaAktifSemester4,
      description: "Jumlah mahasiswa dengan semester = 4.",
      icon: Clock,
      color: "rose"
    },
    {
      title: "Pengajuan Pengantar",
      value: data?.totalPengajuanSuratPengantar,
      description: "Konsisten dengan data halaman submission admin.",
      icon: ListOrdered,
      color: "indigo"
    },
    {
      title: "Total Surat Balasan",
      value: data?.totalSuratBalasan,
      description: "Total seluruh surat balasan yang masuk.",
      icon: CheckCircle,
      color: "emerald"
    },
    {
      title: "Total Dosen KP",
      value: data?.totalDosenPembimbingKp,
      description: "Jumlah dosen unik yang jadi pembimbing tim KP.",
      icon: UserCheck,
      color: "purple"
    },
    {
      title: "Template Dokumen",
      value: data?.totalTemplateDokumen,
      description: "Jumlah data template pada tabel templates.",
      icon: FileText,
      color: "slate"
    },
  ];

  const HeroSection = () => (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-indigo-950 to-blue-900 p-8 sm:p-10 text-white shadow-2xl mb-8 border border-white/10">
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/4 opacity-10 pointer-events-none">
        <TrendingUp className="w-[400px] h-[400px] text-indigo-300" strokeWidth={0.5} />
      </div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-40 mix-blend-screen pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-blue-500 rounded-full blur-[60px] opacity-30 mix-blend-screen pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-indigo-100 backdrop-blur-md border border-white/20 shadow-xs">
            <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-400 mr-2.5 animate-pulse"></span>
            Sistem Informasi Kerja Praktik
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-r from-white to-indigo-200 drop-shadow-xs">
            Dashboard Admin Prodi
          </h1>
          <p className="text-indigo-100/90 text-base sm:text-lg font-medium leading-relaxed max-w-xl">
            Ringkasan metrik utama pengelolaan kerja praktik, pemantauan pengajuan dokumen, dan utilitas sistem.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col p-4 sm:p-6 lg:p-8 bg-slate-50/30 dark:bg-slate-950 min-h-[calc(100svh-3.5rem)]">
      <HeroSection />

      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((card) => {
          const colorStyles: Record<string, { border: string; bg: string; iconBg: string; text: string }> = {
            blue: { border: "from-blue-400 to-blue-600", bg: "bg-blue-50/50 dark:bg-blue-900/10", iconBg: "bg-blue-100 dark:bg-blue-900/50", text: "text-blue-600 dark:text-blue-400" },
            amber: { border: "from-amber-400 to-amber-600", bg: "bg-amber-50/50 dark:bg-amber-900/10", iconBg: "bg-amber-100 dark:bg-amber-900/50", text: "text-amber-600 dark:text-amber-400" },
            rose: { border: "from-rose-400 to-rose-600", bg: "bg-rose-50/50 dark:bg-rose-900/10", iconBg: "bg-rose-100 dark:bg-rose-900/50", text: "text-rose-600 dark:text-rose-400" },
            indigo: { border: "from-indigo-400 to-indigo-600", bg: "bg-indigo-50/50 dark:bg-indigo-900/10", iconBg: "bg-indigo-100 dark:bg-indigo-900/50", text: "text-indigo-600 dark:text-indigo-400" },
            emerald: { border: "from-emerald-400 to-emerald-600", bg: "bg-emerald-50/50 dark:bg-emerald-900/10", iconBg: "bg-emerald-100 dark:bg-emerald-900/50", text: "text-emerald-600 dark:text-emerald-400" },
            purple: { border: "from-purple-400 to-purple-600", bg: "bg-purple-50/50 dark:bg-purple-900/10", iconBg: "bg-purple-100 dark:bg-purple-900/50", text: "text-purple-600 dark:text-purple-400" },
            slate: { border: "from-slate-400 to-slate-600", bg: "bg-slate-50/50 dark:bg-slate-900/10", iconBg: "bg-slate-200 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400" },
          };
          const style = colorStyles[card.color];
          
          return (
            <Card key={card.title} className={`relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-lg group`}>
              <div className={`absolute top-0 left-0 w-1.5 h-full bg-linear-to-b ${style.border}`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-5">
                <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-tight">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-xl ${style.iconBg} ${style.text} group-hover:scale-110 transition-transform duration-300 shrink-0 ml-2`}>
                  <card.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="px-5">
                <div className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100 mb-1">
                  {formatValue(card.value)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Statistik Pengajuan Card */}
        <div className="lg:col-span-2">
          <Card className="h-full rounded-2xl border-0 shadow-md bg-white dark:bg-slate-900 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-blue-500 to-indigo-500" />
            <CardHeader className="pt-6 pb-2 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Statistik Pengajuan (4 Bulan Terakhir)
              </CardTitle>
              <CardDescription>
                Tinjauan performa pengajuan dan tingkat persetujuan bulanan
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {statistikPengajuan.length > 0 ? (
                <div className="space-y-6">
                  {statistikPengajuan.map((stat) => (
                    <div key={stat.month} className="group relative">
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-3 gap-3">
                        <div className="space-y-1">
                          <span className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider inline-block w-24">
                            {stat.month}
                          </span>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pengajuan</span>
                              <span className="text-lg font-black text-slate-700 dark:text-slate-300">{stat.submissions}</span>
                            </div>
                            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Disetujui</span>
                              <span className="text-lg font-black text-blue-600 dark:text-blue-400">{stat.approved}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-left sm:text-right bg-slate-50 dark:bg-slate-800/50 p-2 sm:p-0 sm:bg-transparent sm:dark:bg-transparent rounded-lg">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Tingkat Persetujuan</span>
                          <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 leading-none">{stat.approvalRate}%</span>
                        </div>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-linear-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                          style={{ width: `${stat.approvalRate}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 w-full h-full -skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="Belum ada statistik pengajuan." />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Manajemen Pelaksanaan Magang */}
        <div className="lg:col-span-1">
          <Card className="h-full rounded-2xl border-0 shadow-md bg-white dark:bg-slate-900 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-emerald-400 to-teal-500" />
            <CardHeader className="pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <Archive className="h-5 w-5 text-emerald-500" />
                Pelaksanaan Magang
              </CardTitle>
              <CardDescription>Pusat kontrol masa magang</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <Button asChild variant="outline" className="w-full justify-start h-auto py-3 px-4 border-slate-200 dark:border-slate-800 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:hover:bg-emerald-900/20 dark:hover:border-emerald-800 transition-all group">
                <Link to="/admin/arsip">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-800 text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 mr-3 transition-colors">
                    <Archive className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">Arsip Pelaksanaan</span>
                    <span className="text-xs text-slate-500">Data mahasiswa magang aktif/selesai</span>
                  </div>
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start h-auto py-3 px-4 border-slate-200 dark:border-slate-800 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:hover:bg-emerald-900/20 dark:hover:border-emerald-800 transition-all group">
                <Link to="/admin/penilaian-kriteria">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-800 text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 mr-3 transition-colors">
                    <Award className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">Kriteria Penilaian</span>
                    <span className="text-xs text-slate-500">Konfigurasi bobot nilai akhir</span>
                  </div>
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start h-auto py-3 px-4 border-slate-200 dark:border-slate-800 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:hover:bg-emerald-900/20 dark:hover:border-emerald-800 transition-all group">
                <Link to="/admin/logbook-reset">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-800 text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 mr-3 transition-colors">
                    <Settings className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">Sistem Logbook</span>
                    <span className="text-xs text-slate-500">Kontrol sistem logbook global</span>
                  </div>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Log Aktivitas Terbaru */}
        <Card className="rounded-2xl border-0 shadow-md bg-white dark:bg-slate-900 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-amber-400 to-orange-500" />
          <CardHeader className="pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <ListOrdered className="h-5 w-5 text-amber-500" />
              Log Aktivitas Terbaru
            </CardTitle>
            <CardDescription>
              Riwayat aktivitas administrasi
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {activities.length > 0 ? (
              <div className="relative space-y-6 before:absolute before:inset-0 before:ml-2.5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
                {activities.map((activity, index) => (
                  <div key={`${activity.action}-${activity.time}-${index}`} className="relative flex items-start gap-4 group">
                    <div className={`mt-1 flex items-center justify-center w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 shadow shrink-0 z-10 ${
                      activity.status === "success" ? "bg-emerald-500" : "bg-blue-500"
                    }`} />
                    <div className="flex flex-col flex-1 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shadow-xs hover:shadow-md transition-shadow">
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 leading-tight">{activity.action}</span>
                      <span className="text-xs text-slate-500 mt-1.5 font-medium">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="Belum ada aktivitas terbaru." />
            )}
          </CardContent>
        </Card>

        {/* ── Utilitas Sistem ─────────────────────────────────────────── */}
        <Card className="rounded-2xl border-0 shadow-md bg-white dark:bg-slate-900 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-rose-500 to-red-600" />
          <CardHeader className="pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <Wrench className="h-5 w-5 text-rose-500" />
              Utilitas Sistem
            </CardTitle>
            <CardDescription className="text-rose-600/80 dark:text-rose-400/80 font-medium">
              Area khusus Administrator. Berisiko tinggi.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/20">
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  Repair Data Dosen Pembimbing
                </p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Mengisi kolom <code className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono">dosenPembimbingId</code> pada internship yang masih kosong berdasarkan data persetujuan judul.
                </p>
              </div>
              <Button
                id="btn-backfill-dosen"
                variant="default"
                disabled={backfillLoading}
                onClick={onBackfillDosen}
                className="shrink-0 bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
              >
                {backfillLoading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Memproses...</>
                ) : (
                  <><Wrench className="h-4 w-4 mr-2" /> Jalankan Repair</>
                )}
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/20">
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  Repair Data Kaprodi & Prodi
                </p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Sinkronisasi Nama/NIP Kaprodi dari SSO dan perbaiki pemetaan <code className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono">program_studies</code>.
                </p>
              </div>
              <Button
                id="btn-repair-kaprodi"
                variant="default"
                disabled={repairLoading}
                onClick={onRepairKaprodi}
                className="shrink-0 bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
              >
                {repairLoading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Memproses...</>
                ) : (
                  <><Wrench className="h-4 w-4 mr-2" /> Jalankan Repair</>
                )}
              </Button>
            </div>

            {/* Kaprodi Result */}
            {repairResult && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <div className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-800 shrink-0 mt-0.5">
                  <CheckIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">Repair Kaprodi Selesai</p>
                  <p className="text-emerald-600 dark:text-emerald-400 text-xs mt-1 font-medium">
                    {repairResult.updated} profil disinkronkan &bull; {repairResult.synced} prodi dipetakan
                  </p>
                </div>
              </div>
            )}

            {repairError && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="p-1.5 rounded-full bg-red-100 dark:bg-red-800 shrink-0 mt-0.5">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="font-bold text-red-800 dark:text-red-300 text-sm">Gagal Repair Kaprodi</p>
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1 font-medium">{repairError}</p>
                </div>
              </div>
            )}

            {/* Result */}
            {backfillResult && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <div className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-800 shrink-0 mt-0.5">
                  <CheckIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">Repair Dosen Selesai</p>
                  <p className="text-emerald-600 dark:text-emerald-400 text-xs mt-1 font-medium">
                    {backfillResult.updated} internship diperbarui &bull; {backfillResult.skipped} dilewati
                  </p>
                </div>
              </div>
            )}

            {backfillError && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="p-1.5 rounded-full bg-red-100 dark:bg-red-800 shrink-0 mt-0.5">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="font-bold text-red-800 dark:text-red-300 text-sm">Gagal Repair Dosen</p>
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1 font-medium">{backfillError}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
