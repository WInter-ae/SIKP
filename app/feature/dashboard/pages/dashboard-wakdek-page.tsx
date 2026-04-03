import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ListOrdered, Inbox } from "lucide-react";

export type WakdekActivityItem = {
  action: string;
  time: string;
  status: "success" | "info";
};

export interface DashboardWakdekData {
  totalAjuanSuratPengantarMasuk?: number;
  activities?: WakdekActivityItem[];
}

interface DashboardWakdekPageProps {
  data?: DashboardWakdekData | null;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center text-sm text-muted-foreground">
      <Inbox className="h-5 w-5" />
      <span>{message}</span>
    </div>
  );
}

export default function DashboardWakdekPage({
  data,
}: DashboardWakdekPageProps) {
  const totalAjuanSuratPengantarMasuk = data?.totalAjuanSuratPengantarMasuk;
  const activities = data?.activities ?? [];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard Wakil Dekan
        </h1>
        <p className="text-muted-foreground">
          Ringkasan verifikasi surat pengantar mahasiswa
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Ajuan Surat Pengantar yang Masuk
          </CardTitle>
          <ListOrdered className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {typeof totalAjuanSuratPengantarMasuk === "number"
              ? totalAjuanSuratPengantarMasuk
              : "-"}
          </div>
          <p className="text-xs text-muted-foreground">
            Diambil dari daftar verifikasi surat pengantar untuk wakil dekan.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Log Aktivitas Terbaru</CardTitle>
          <CardDescription>
            Riwayat aktivitas bimbingan dan verifikasi
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <div
                  key={`${activity.action}-${activity.time}-${index}`}
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
                  <span className="text-muted-foreground">{activity.time}</span>
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
