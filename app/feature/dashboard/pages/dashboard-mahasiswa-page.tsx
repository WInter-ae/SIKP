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
    <div className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center text-sm text-muted-foreground">
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
  const hasTeam = Boolean(teamInfo?.teamId || teamInfo?.teamName);
  const hasPengajuan = Boolean(statusPengajuan?.submitted);

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Dashboard Mahasiswa
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Selamat datang di Sistem Informasi Kerja Praktik
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:auto-rows-min">
        <Card className="md:col-start-1 md:row-start-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Status Kerja Praktik
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kerjaPraktik?.label || "-"}
            </div>
            <p className="text-xs text-muted-foreground">
              {kerjaPraktik?.description ||
                "Status proses KP akan tampil setelah data dikirim backend."}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-start-2 md:row-start-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hari Tersisa</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hariTersisa === null || hariTersisa === undefined
                ? "-"
                : `${hariTersisa} hari`}
            </div>
            <p className="text-xs text-muted-foreground">
              Mengacu pada tanggal mulai dan tanggal selesai KP.
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-start-1 md:row-start-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tahap KP Berikutnya
            </CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {tahapBerikutnya?.title || "Belum ada tahap berikutnya"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {tahapBerikutnya?.description ||
                "Tahap lanjutan akan muncul berdasarkan progres KP Anda."}
            </p>
            {tahapBerikutnya?.actionUrl ? (
              <div className="mt-3">
                <Button asChild variant="outline" size="sm">
                  <Link to={tahapBerikutnya.actionUrl}>
                    {tahapBerikutnya.actionLabel || "Lanjutkan Tahap"}
                  </Link>
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="md:col-start-2 md:row-start-2 md:row-span-2">
          <CardHeader>
            <CardTitle>Informasi Tim</CardTitle>
            <CardDescription>Detail tim kerja praktik Anda</CardDescription>
          </CardHeader>
          <CardContent>
            {hasTeam ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    Tim: {teamInfo?.teamName || "-"}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Anggota Tim:</p>
                  {teamInfo?.members && teamInfo.members.length > 0 ? (
                    <ul className="space-y-1 text-sm">
                      {teamInfo.members.map((member) => (
                        <li key={`${member.name}-${member.role || "anggota"}`}>
                          • {member.name}
                          {member.role ? ` (${member.role})` : ""}
                          {member.nim ? ` - NIM ${member.nim}` : ""}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Belum ada data anggota tim.
                    </p>
                  )}
                </div>
                <div className="space-y-2 border-t pt-4">
                  <p className="text-sm text-muted-foreground">
                    Dosen Pembimbing KP:
                  </p>
                  <p className="text-sm font-medium">
                    {teamInfo?.dosenName || "-"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    NIP {teamInfo?.dosenNip || "-"}
                  </p>
                </div>
                <div className="space-y-2 border-t pt-4">
                  <p className="text-sm text-muted-foreground">
                    Mentor Lapangan:
                  </p>
                  <p className="text-sm font-medium">
                    {teamInfo?.mentorName || "-"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {teamInfo?.mentorEmail || "-"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[140px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-center">
                <p className="text-sm text-muted-foreground">
                  Tim belum dibentuk. Silakan buat tim terlebih dahulu.
                </p>
                <Button asChild>
                  <Link to="/mahasiswa/kp/buat-tim">
                    <Plus className="mr-2 h-4 w-4" />
                    Buat Tim
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-start-1 md:row-start-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Status Pengajuan
            </CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {hasPengajuan ? (
              <>
                <div className="text-lg font-semibold">
                  {statusPengajuan?.label || "Pengajuan diproses"}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {statusPengajuan?.description ||
                    "Ringkasan status pengajuan terbaru Anda."}
                </p>
                {statusPengajuan?.code === "approved" ? (
                  <div className="mt-3">
                    <Button asChild variant="outline" size="sm">
                      <Link to="/mahasiswa/kp/surat-pengantar">
                        Lihat Sekarang
                      </Link>
                    </Button>
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <div className="text-lg font-semibold">
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

        <Card className="md:col-span-2 md:row-start-4">
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <CardDescription>Riwayat aktivitas magang Anda</CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity, index) => (
                  <div
                    key={`${activity.action}-${index}`}
                    className="flex items-center gap-4 text-sm"
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${
                        activity.status === "success"
                          ? "bg-green-500"
                          : "bg-blue-500"
                      }`}
                    />
                    <span className="flex-1">{activity.action}</span>
                    <span className="text-muted-foreground">
                      {activity.time}
                    </span>
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
