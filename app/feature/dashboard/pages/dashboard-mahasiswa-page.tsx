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
    <div className="flex min-h-30 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center text-sm text-muted-foreground">
      <Inbox className="h-5 w-5" />
      <span>{message}</span>
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

  if (!hasTeam) {
    return (
      <div className="flex min-h-[calc(100svh-3.5rem)] flex-col gap-4 p-4 sm:gap-6 sm:p-6">
        <div className="relative pb-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Dashboard Mahasiswa
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Selamat datang di Sistem Informasi Kerja Praktik
          </p>
          <div className="absolute bottom-0 left-0 h-1 w-20 bg-linear-to-r from-blue-600 via-yellow-300 to-red-500 rounded-full" />
        </div>

        <div className="flex flex-1 items-center">
          <Card className="mx-auto w-full max-w-2xl shadow-xl border-t-4 border-t-blue-600">
            <CardHeader>
              <CardTitle>Informasi Pelaksanaan Kerja Praktik</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex min-h-55 flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Tim belum dibentuk. Silakan bentuk tim terlebih dahulu.
                </p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link to="/mahasiswa/kp/buat-tim">
                    <Plus className="mr-2 h-4 w-4" />
                    Bentuk Tim
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
    <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
      <div className="relative pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Dashboard Mahasiswa
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Selamat datang di Sistem Informasi Kerja Praktik
        </p>
        <div className="absolute bottom-0 left-0 h-1 w-20 bg-linear-to-r from-blue-600 via-yellow-300 to-red-500 rounded-full" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:auto-rows-min">
        <Card className="md:col-start-1 md:row-start-1 border-l-4 border-l-blue-600 bg-blue-50/30 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Status Kerja Praktik
            </CardTitle>
            <div className="p-2 rounded-full bg-background border border-border shadow-xs text-blue-600">
              <GraduationCap className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight">
              {kerjaPraktik?.label || "-"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {kerjaPraktik?.description ||
                "Status proses KP akan tampil setelah data dikirim backend."}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-start-2 md:row-start-1 border-l-4 border-l-yellow-300 bg-yellow-50/30 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Hari Tersisa</CardTitle>
            <div className="p-2 rounded-full bg-background border border-border shadow-xs text-yellow-600">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight">
              {hariTersisa === null || hariTersisa === undefined
                ? "-"
                : `${hariTersisa} hari`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Mengacu pada tanggal mulai dan tanggal selesai KP.
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-start-1 md:row-start-2 border-l-4 border-l-red-500 bg-red-50/30 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Tahap KP Berikutnya
            </CardTitle>
            <div className="p-2 rounded-full bg-background border border-border shadow-xs text-red-600">
              <ListChecks className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {tahapBerikutnya?.title || "Belum ada tahap berikutnya"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {tahapBerikutnya?.description ||
                "Tahap lanjutan akan muncul berdasarkan progres KP Anda."}
            </p>
            {tahapBerikutnya?.actionUrl ? (
              <div className="mt-3">
                <Button asChild variant="outline" size="sm" className="border-red-200 hover:bg-red-50 text-red-600">
                  <Link to={tahapBerikutnya.actionUrl}>
                    {tahapBerikutnya.actionLabel || "Lanjutkan Tahap"}
                  </Link>
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="md:col-start-2 md:row-start-2 md:row-span-2 shadow-lg border-none bg-linear-to-b from-background to-blue-50/20">
          <div className="h-1.5 w-full bg-linear-to-r from-blue-600 to-transparent" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Informasi Tim
            </CardTitle>
            <CardDescription>Detail tim kerja praktik Anda</CardDescription>
          </CardHeader>
          <CardContent>
            {hasTeam ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">
                    Tim: {teamInfo?.teamName || "-"}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Anggota Tim:</p>
                  {teamInfo?.members && teamInfo.members.length > 0 ? (
                    <ul className="space-y-1 text-sm">
                      {teamInfo.members.map((member) => (
                        <li key={`${member.name}-${member.role || "anggota"}`} className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                          <span className="text-foreground">{member.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {member.role ? ` (${member.role})` : ""}
                            {member.nim ? ` - ${member.nim}` : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Belum ada data anggota tim.
                    </p>
                  )}
                </div>
                <div className="space-y-2 border-t border-border pt-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Dosen Pembimbing KP:
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {teamInfo?.dosenName || "-"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    NIP {teamInfo?.dosenNip || "-"}
                  </p>
                </div>
                <div className="space-y-2 border-t border-border pt-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Mentor Lapangan:
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {teamInfo?.mentorName || "-"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {teamInfo?.mentorEmail || "-"}
                  </p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="md:col-start-1 md:row-start-3 border-l-4 border-l-blue-600 bg-blue-50/30 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Status Pengajuan
            </CardTitle>
            <div className="p-2 rounded-full bg-background border border-border shadow-xs text-blue-600">
              <Send className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {hasPengajuan ? (
              <>
                <div className="text-lg font-bold">
                  {statusPengajuan?.label || "Pengajuan diproses"}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {statusPengajuan?.description ||
                    "Ringkasan status pengajuan terbaru Anda."}
                </p>
                {statusPengajuan?.code === "approved" ? (
                  <div className="mt-3">
                    <Button asChild variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50 text-blue-600">
                      <Link to="/mahasiswa/kp/surat-pengantar">
                        Lihat Sekarang
                      </Link>
                    </Button>
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <div className="text-lg font-bold">
                  {statusPengajuan?.label || "Segera lakukan pengajuan"}
                </div>
                {statusPengajuan?.description ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {statusPengajuan.description}
                  </p>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 md:row-start-4 shadow-lg border-none bg-linear-to-b from-background to-yellow-50/20 overflow-hidden">
          <div className="h-1.5 w-full bg-linear-to-r from-yellow-300 to-transparent" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-yellow-600" />
              Aktivitas Terbaru
            </CardTitle>
            <CardDescription>Riwayat aktivitas magang Anda</CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div
                    key={`${activity.action}-${index}`}
                    className="flex items-start gap-3 text-sm group"
                  >
                    <div
                      className={`h-2.5 w-2.5 rounded-full shrink-0 mt-1.5 shadow-xs ${activity.status === "success"
                          ? "bg-green-500 shadow-green-200"
                          : "bg-blue-500 shadow-blue-200"
                        }`}
                    />
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="font-medium text-foreground group-hover:text-blue-600 transition-colors">{activity.action}</span>
                      <span className="text-muted-foreground text-xs">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="Belum ada aktivitas dari backend" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
