import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Users, ListOrdered, Inbox, Clock } from "lucide-react";

export type ActivityItem = {
  action: string;
  time: string;
  status: "success" | "info";
};

export interface DashboardDosenData {
  totalMahasiswaBimbingan?: number;
  totalSuratAjuanMasuk?: number;
  activities?: ActivityItem[];
}

interface DashboardDosenPageProps {
  data?: DashboardDosenData | null;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center text-sm text-muted-foreground">
      <Inbox className="h-5 w-5" />
      <span>{message}</span>
    </div>
  );
}

export default function DashboardDosenPage({ data }: DashboardDosenPageProps) {
  const totalMahasiswaBimbingan = data?.totalMahasiswaBimbingan;
  const totalSuratAjuanMasuk = data?.totalSuratAjuanMasuk;
  const activities = data?.activities ?? [];

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
      <div className="relative pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Dashboard Dosen
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Ringkasan bimbingan KP dan verifikasi surat mahasiswa
        </p>
        <div className="absolute bottom-0 left-0 h-1 w-20 bg-linear-to-r from-blue-600 via-yellow-300 to-red-500 rounded-full" />
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Card className="border-l-4 border-l-blue-600 bg-blue-50/30 dark:bg-blue-900/10 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Total Mahasiswa Bimbingan
            </CardTitle>
            <div className="p-2 rounded-full bg-background border border-border shadow-xs text-blue-600 dark:text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight">
              {typeof totalMahasiswaBimbingan === "number"
                ? totalMahasiswaBimbingan
                : "-"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Berdasarkan jumlah mahasiswa pada tim KP dengan dosen pembimbing
              Anda.
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-300 bg-yellow-50/30 dark:bg-yellow-900/10 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Total Surat Ajuan Mahasiswa
            </CardTitle>
            <div className="p-2 rounded-full bg-background border border-border shadow-xs text-yellow-600 dark:text-yellow-300">
              <ListOrdered className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight">
              {typeof totalSuratAjuanMasuk === "number"
                ? totalSuratAjuanMasuk
                : "-"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Akumulasi surat kesediaan dan surat permohonan yang masuk.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-none bg-linear-to-b from-background to-blue-50/20 dark:to-blue-900/5 overflow-hidden">
        <div className="h-1.5 w-full bg-linear-to-r from-blue-600 to-transparent" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Log Aktivitas Terbaru
          </CardTitle>
          <CardDescription>
            Riwayat aktivitas bimbingan dan verifikasi
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div
                  key={`${activity.action}-${activity.time}-${index}`}
                  className="flex items-start gap-4 text-sm group"
                >
                  <div
                    className={`h-2.5 w-2.5 rounded-full shrink-0 mt-1.5 shadow-xs ${
                      activity.status === "success"
                        ? "bg-green-500 shadow-green-200"
                        : "bg-blue-500 shadow-blue-200"
                    }`}
                  />
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="font-medium text-foreground group-hover:text-blue-600 transition-colors">{activity.action}</span>
                    <span className="text-muted-foreground text-xs">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="Belum ada aktivitas terbaru." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
