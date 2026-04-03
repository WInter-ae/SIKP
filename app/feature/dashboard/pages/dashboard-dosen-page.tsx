import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Users, ListOrdered, Inbox } from "lucide-react";

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
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Dosen</h1>
        <p className="text-muted-foreground">
          Ringkasan bimbingan KP dan verifikasi surat mahasiswa
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Mahasiswa Bimbingan
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {typeof totalMahasiswaBimbingan === "number"
                ? totalMahasiswaBimbingan
                : "-"}
            </div>
            <p className="text-xs text-muted-foreground">
              Berdasarkan jumlah mahasiswa pada tim KP dengan dosen pembimbing
              Anda.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Surat Ajuan Mahasiswa
            </CardTitle>
            <ListOrdered className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {typeof totalSuratAjuanMasuk === "number"
                ? totalSuratAjuanMasuk
                : "-"}
            </div>
            <p className="text-xs text-muted-foreground">
              Akumulasi surat kesediaan dan surat permohonan yang masuk.
            </p>
          </CardContent>
        </Card>
      </div>

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
