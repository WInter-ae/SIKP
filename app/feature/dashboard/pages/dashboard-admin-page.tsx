import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  GraduationCap,
  Users,
  Clock,
  ListOrdered,
  CheckCircle,
  FileText,
  UserCheck,
  Inbox,
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
  totalSuratBalasanDisetujuiTerverifikasi?: number;
  totalDosenPembimbingKp?: number;
  totalTemplateDokumen?: number;
  statistikPengajuan?: AdminMonthlyStat[];
  activities?: AdminActivityItem[];
}

interface DashboardAdminPageProps {
  data?: DashboardAdminData | null;
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

export default function DashboardAdminPage({ data }: DashboardAdminPageProps) {
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
      title: "Surat Balasan Disetujui & Terverifikasi",
      value: data?.totalSuratBalasanDisetujuiTerverifikasi,
      description: "letter_status APPROVED dan verified = true.",
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
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard Admin Prodi
        </h1>
        <p className="text-muted-foreground">
          Ringkasan metrik utama pengelolaan kerja praktik.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatValue(card.value)}
              </div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Statistik Pengajuan 4 Bulan Terakhir</CardTitle>
          <CardDescription>
            Menampilkan total pengajuan, total approved, dan approval rate per
            bulan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {statistikPengajuan.length > 0 ? (
            <div className="space-y-4">
              {statistikPengajuan.map((stat) => (
                <div key={stat.month} className="flex items-center gap-4">
                  <div className="w-12 text-sm font-medium">{stat.month}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Pengajuan: {stat.submissions}
                      </span>
                      <span className="text-muted-foreground">
                        Approved: {stat.approved}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary">
                      <div
                        className="h-2 rounded-full bg-primary transition-all"
                        style={{ width: `${stat.approvalRate}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Approval rate: {stat.approvalRate}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="Belum ada statistik pengajuan." />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Log Aktivitas Terbaru</CardTitle>
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
