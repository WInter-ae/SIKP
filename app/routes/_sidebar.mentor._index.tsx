import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Users,
  ClipboardCheck,
  Bell,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export default function MentorDashboard() {
  const stats = [
    {
      title: "Mahasiswa Magang",
      value: "8",
      icon: Users,
      description: "Total mahasiswa yang dibimbing",
    },
    {
      title: "Penilaian Pending",
      value: "5",
      icon: ClipboardCheck,
      description: "Perlu segera dinilai",
    },
    {
      title: "Notifikasi Baru",
      value: "3",
      icon: Bell,
      description: "Belum dibaca",
    },
    {
      title: "Rata-rata Nilai",
      value: "85.5",
      icon: TrendingUp,
      description: "Dari semua mahasiswa magang",
    },
  ];

  const menteeList = [
    {
      name: "Ahmad Fauzi",
      nim: "12250111001",
      progress: 75,
      status: "active",
      lastActivity: "2 jam lalu",
    },
    {
      name: "Budi Santoso",
      nim: "12250111002",
      progress: 60,
      status: "active",
      lastActivity: "5 jam lalu",
    },
    {
      name: "Citra Dewi",
      nim: "12250111003",
      progress: 90,
      status: "active",
      lastActivity: "1 hari lalu",
    },
    {
      name: "Dina Putri",
      nim: "12250111004",
      progress: 45,
      status: "warning",
      lastActivity: "3 hari lalu",
    },
  ];

  const pendingAssessments = [
    {
      title: "Laporan Mingguan #5",
      mentee: "Ahmad Fauzi",
      deadline: "20 Jan 2025",
      type: "weekly",
    },
    {
      title: "Evaluasi Tengah Magang",
      mentee: "Budi Santoso",
      deadline: "25 Jan 2025",
      type: "evaluation",
    },
    {
      title: "Penilaian Akhir",
      mentee: "Citra Dewi",
      deadline: "30 Jan 2025",
      type: "final",
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard Pembimbing Lapangan
        </h1>
        <p className="text-muted-foreground">
          Kelola dan pantau perkembangan mentee Anda
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Mentee Overview */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Mahasiswa Magang</CardTitle>
            <CardDescription>
              Progress dan aktivitas mahasiswa magang terbaru
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {menteeList.map((mentee, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{mentee.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {mentee.nim}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{mentee.progress}%</p>
                      <p className="text-xs text-muted-foreground">
                        {mentee.lastActivity}
                      </p>
                    </div>
                    {mentee.status === "warning" ? (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Assessments */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Penilaian Pending</CardTitle>
            <CardDescription>
              Penilaian yang perlu segera diselesaikan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingAssessments.map((assessment, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between rounded-lg border p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                      <Clock className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">{assessment.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {assessment.mentee}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {assessment.deadline}
                    </p>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        assessment.type === "final"
                          ? "bg-red-100 text-red-700"
                          : assessment.type === "evaluation"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {assessment.type === "final"
                        ? "Akhir"
                        : assessment.type === "evaluation"
                          ? "Evaluasi"
                          : "Mingguan"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
          <CardDescription>
            Pintasan untuk tugas yang sering dilakukan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Link to="/mentor/penilaian" className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              <span className="font-medium">Beri Penilaian</span>
            </Link>
            <Link to="/mentor/mentee" className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-medium">Lihat Mahasiswa</span>
            </Link>
            <Link to="/mentor/notifikasi" className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted">
              <Bell className="h-5 w-5 text-primary" />
              <span className="font-medium">Notifikasi</span>
            </Link>
            <Link to="/mentor/logbook" className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-medium">Lihat Logbook</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
