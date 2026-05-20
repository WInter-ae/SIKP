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
  Clock,
  Users,
  Inbox,
  Plus,
  ListChecks,
  Send,
  BookOpen,
  UserCheck,
  Award,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router";

type KerjaPraktikStatus = {
  label?: string | null;
  description?: string | null;
};

type TeamMember = {
  name: string;
  nim?: string | null;
  role?: string;
};

type TeamInfo = {
  teamId?: string | null;
  teamName?: string | null;
  members?: TeamMember[];
  mentorName?: string | null;
  mentorEmail?: string | null;
  dosenName?: string | null;
  dosenNip?: string | null;
};

type TahapBerikutnya = {
  title?: string | null;
  description?: string | null;
  actionLabel?: string | null;
  actionUrl?: string | null;
};

type StatusPengajuan = {
  code?: "draft" | "pending_review" | "approved" | "rejected";
  submitted?: boolean | null;
  label?: string | null;
  description?: string | null;
};

type ActivityItem = {
  action: string;
  time: string;
  status: string;
};

export interface DashboardMahasiswaData {
  kerjaPraktik?: KerjaPraktikStatus | null;
  hariTersisa?: number | null;
  tahapBerikutnya?: TahapBerikutnya | null;
  statusPengajuan?: StatusPengajuan | null;
  teamInfo?: TeamInfo;
  activities?: ActivityItem[];
}

interface DashboardMahasiswaPageProps {
  data?: DashboardMahasiswaData | null;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center text-sm text-slate-500">
      <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3">
        <Inbox className="h-6 w-6 text-slate-400" />
      </div>
      <span className="font-medium">{message}</span>
    </div>
  );
}

export default function DashboardMahasiswaPage({
  data,
}: DashboardMahasiswaPageProps) {
  const kerjaPraktik = data?.kerjaPraktik;
  const hariTersisa = data?.hariTersisa;
  const tahapBerikutnya = data?.tahapBerikutnya;
  const statusPengajuan = data?.statusPengajuan;
  const teamInfo = data?.teamInfo;
  const activities = data?.activities ?? [];
  const hasTeam = Boolean(
    teamInfo?.teamId || teamInfo?.teamName || teamInfo?.members?.length,
  );
  const hasPengajuan = Boolean(statusPengajuan?.submitted);

  const HeroSection = () => (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-900 via-blue-900 to-slate-900 p-8 sm:p-10 text-white shadow-2xl mb-8 border border-white/10">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 opacity-20 pointer-events-none">
        <GraduationCap className="w-96 h-96 text-blue-300" strokeWidth={1} />
      </div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500 rounded-full blur-[80px] opacity-40 mix-blend-screen pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-indigo-500 rounded-full blur-[60px] opacity-30 mix-blend-screen pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-blue-100 backdrop-blur-md border border-white/20 shadow-xs">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 mr-2.5 animate-pulse"></span>
            Sistem Informasi Kerja Praktik
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-r from-white to-blue-200 drop-shadow-xs">
            Selamat Datang, Mahasiswa! 👋
          </h1>
          <p className="text-blue-100/90 text-base sm:text-lg font-medium leading-relaxed max-w-xl">
            Kelola tim Anda, pantau logbook harian, dan selesaikan seluruh administrasi magang dalam satu dasbor terpadu.
          </p>
        </div>
        
        {hasTeam && hariTersisa !== undefined && hariTersisa !== null && (
          <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] shrink-0 group hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:-translate-y-1">
            <span className="text-blue-200 text-xs font-bold uppercase tracking-[0.2em] mb-2 group-hover:text-blue-100 transition-colors">Sisa Waktu</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-6xl font-black text-white tracking-tighter drop-shadow-md group-hover:drop-shadow-xl transition-all">{hariTersisa}</span>
              <span className="text-blue-200 font-semibold text-xl">Hari</span>
            </div>
            <div className="mt-3 w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full w-3/4 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (!hasTeam) {
    return (
      <div className="flex min-h-[calc(100svh-3.5rem)] flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-8 bg-slate-50/50 dark:bg-slate-950">
        <HeroSection />

        <div className="flex flex-1 items-start justify-center pt-8">
          <Card className="w-full max-w-2xl relative overflow-hidden rounded-3xl border-0 bg-white dark:bg-slate-900 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]">
            <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-blue-500 to-indigo-600" />
            <CardHeader className="text-center pt-10 pb-4">
              <div className="mx-auto bg-blue-50 dark:bg-blue-900/20 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                <Users className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl font-bold">Tim Belum Terbentuk</CardTitle>
            </CardHeader>
            <CardContent className="pb-10 px-8">
              <p className="text-center text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                Langkah pertama Anda adalah membuat tim kerja praktik. Anda bisa membuat tim sendiri atau mengundang teman Anda.
              </p>
              <div className="flex justify-center">
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-6 font-semibold shadow-lg shadow-blue-600/30 transition-all hover:scale-105 hover:shadow-blue-600/50">
                  <Link to="/mahasiswa/kp/buat-tim">
                    <Plus className="mr-2 h-5 w-5" />
                    Buat Tim Sekarang
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 sm:p-6 lg:p-8 bg-slate-50/30 dark:bg-slate-950 min-h-[calc(100svh-3.5rem)]">
      <HeroSection />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 md:auto-rows-min">
        {/* Status KP Card */}
        <Card className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-lg group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-linear-to-b from-blue-400 to-blue-600" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Status KP
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
              <GraduationCap className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100">
              {kerjaPraktik?.label || "-"}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              {kerjaPraktik?.description || "Proses terupdate sesuai backend."}
            </p>
          </CardContent>
        </Card>

        {/* Status Pengajuan Card */}
        <Card className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-lg group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-linear-to-b from-indigo-400 to-indigo-600" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Status Pengajuan
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
              <Send className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            {hasPengajuan ? (
              <>
                <div className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100">
                  {statusPengajuan?.label || "Diproses"}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                  {statusPengajuan?.description || "Status surat pengantar Anda."}
                </p>
                {statusPengajuan?.code === "approved" && (
                  <div className="mt-4">
                    <Button asChild variant="outline" size="sm" className="w-full rounded-lg border-indigo-200 hover:bg-indigo-50 text-indigo-600 font-semibold transition-colors">
                      <Link to="/mahasiswa/kp/surat-pengantar">
                        Lihat Surat
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100">
                  {statusPengajuan?.label || "Belum Diajukan"}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                  {statusPengajuan?.description || "Segera ajukan dokumen administrasi."}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Tahap Berikutnya Card */}
        <Card className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-lg group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-linear-to-b from-rose-400 to-rose-600" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Tugas Mendatang
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform duration-300">
              <ListChecks className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100 leading-tight">
              {tahapBerikutnya?.title || "Belum ada tahap berikutnya"}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium line-clamp-2">
              {tahapBerikutnya?.description || "Menunggu update selanjutnya."}
            </p>
            {tahapBerikutnya?.actionUrl && (
              <div className="mt-4">
                <Button asChild size="sm" className="w-full rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-all hover:shadow-md">
                  <Link to={tahapBerikutnya.actionUrl}>
                    {tahapBerikutnya.actionLabel || "Lanjutkan"}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manajemen Pelaksanaan Magang Section (FULL WIDTH) */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 mt-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <BookOpen className="h-5 w-5" />
            </div>
            Tahap Pelaksanaan Magang
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="group cursor-pointer overflow-hidden rounded-2xl border-0 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <Link to="/mahasiswa/kp/logbook" className="block h-full relative">
                <div className="absolute inset-0 bg-linear-to-br from-emerald-50 to-teal-50/20 dark:from-emerald-900/20 dark:to-teal-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="p-6 relative z-10 flex flex-col items-center text-center">
                  <div className="p-4 rounded-full bg-emerald-100 dark:bg-emerald-800/30 text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-xs">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Isi Logbook</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Catat dan laporkan aktivitas harian magang secara rutin.</p>
                </CardContent>
              </Link>
            </Card>

            <Card className="group cursor-pointer overflow-hidden rounded-2xl border-0 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <Link to="/mahasiswa/kp/mentor" className="block h-full relative">
                <div className="absolute inset-0 bg-linear-to-br from-blue-50 to-indigo-50/20 dark:from-blue-900/20 dark:to-indigo-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="p-6 relative z-10 flex flex-col items-center text-center">
                  <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-800/30 text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-xs">
                    <UserCheck className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Data Mentor</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Kelola dan lihat profil pembimbing lapangan industri.</p>
                </CardContent>
              </Link>
            </Card>

            <Card className="group cursor-pointer overflow-hidden rounded-2xl border-0 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <Link to="/mahasiswa/kp/penilaian" className="block h-full relative">
                <div className="absolute inset-0 bg-linear-to-br from-amber-50 to-orange-50/20 dark:from-amber-900/20 dark:to-orange-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="p-6 relative z-10 flex flex-col items-center text-center">
                  <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-800/30 text-amber-600 dark:text-amber-400 mb-4 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-xs">
                    <Award className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Penilaian</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Pantau rekapitulasi nilai akhir dari mentor dan dosen.</p>
                </CardContent>
              </Link>
            </Card>
          </div>
        </div>

        {/* Informasi Tim */}
        <Card className="col-span-1 sm:col-span-2 lg:col-span-2 mt-4 rounded-2xl border-0 shadow-md bg-white dark:bg-slate-900 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500" />
          <CardHeader className="pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <Users className="h-5 w-5 text-indigo-500" />
              Detail Tim Magang
            </CardTitle>
            <CardDescription>Informasi anggota, dosen pembimbing, dan mentor.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
              <div className="p-6 space-y-5">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Anggota Tim</div>
                  <div className="inline-flex items-center rounded-lg bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 text-sm font-bold text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 mb-4 shadow-xs">
                    {teamInfo?.teamName || "Tanpa Nama Tim"}
                  </div>
                  {teamInfo?.members && teamInfo.members.length > 0 ? (
                    <div className="space-y-3">
                      {teamInfo.members.map((member) => (
                        <div key={`${member.name}-${member.role}`} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                          <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700 shrink-0">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{member.name}</span>
                            <span className="text-xs text-slate-500">
                              {member.nim ? `${member.nim}` : ""} {member.role ? `• ${member.role}` : ""}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState message="Data anggota tidak tersedia" />
                  )}
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Dosen Pembimbing</div>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <UserCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{teamInfo?.dosenName || "Belum Ditugaskan"}</p>
                      <p className="text-sm text-slate-500">{teamInfo?.dosenNip ? `NIP. ${teamInfo.dosenNip}` : "-"}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Mentor Industri</div>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{teamInfo?.mentorName || "Belum Terdaftar"}</p>
                      <p className="text-sm text-slate-500">{teamInfo?.mentorEmail || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aktivitas Terbaru */}
        <Card className="col-span-1 lg:col-span-1 mt-4 rounded-2xl border-0 shadow-md bg-white dark:bg-slate-900 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-amber-400 to-orange-500" />
          <CardHeader className="pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <Clock className="h-5 w-5 text-amber-500" />
              Aktivitas Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {activities.length > 0 ? (
              <div className="relative space-y-6 before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
                {activities.map((activity, index) => (
                  <div key={`${activity.action}-${index}`} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className={`flex items-center justify-center w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${
                      activity.status === "success" ? "bg-emerald-500" : "bg-blue-500"
                    }`}>
                    </div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shadow-xs hover:shadow-md transition-shadow">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{activity.action}</span>
                        <span className="text-xs text-slate-500 mt-1 font-medium">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="Belum ada catatan aktivitas" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
