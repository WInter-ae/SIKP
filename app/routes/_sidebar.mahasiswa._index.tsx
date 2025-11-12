import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import {
  GraduationCap,
  FileText,
  CheckCircle,
  Clock,
  Calendar,
  Users
} from "lucide-react"

export default function MahasiswaDashboard() {
  const stats = [
    {
      title: "Status Magang",
      value: "Saat Magang",
      icon: GraduationCap,
      description: "Periode: Jan - Mar 2025"
    },
    {
      title: "Laporan Pending",
      value: "3",
      icon: FileText,
      description: "Laporan harus dikumpulkan"
    },
    {
      title: "Tugas Selesai",
      value: "12/15",
      icon: CheckCircle,
      description: "80% progress"
    },
    {
      title: "Hari Tersisa",
      value: "45",
      icon: Clock,
      description: "Dari total 90 hari"
    }
  ]

  const upcomingTasks = [
    { title: "Laporan Mingguan #5", deadline: "20 Jan 2025", status: "pending" },
    { title: "Evaluasi Mentor", deadline: "25 Jan 2025", status: "pending" },
    { title: "Dokumentasi Project", deadline: "30 Jan 2025", status: "in-progress" }
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Mahasiswa</h1>
        <p className="text-muted-foreground">
          Selamat datang di Sistem Informasi Kerja Praktik
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Upcoming Tasks */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Tugas & Deadline</CardTitle>
            <CardDescription>
              Daftar tugas yang harus diselesaikan segera
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTasks.map((task, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                      <Calendar className="mr-1 inline h-3 w-3" />
                      Deadline: {task.deadline}
                    </p>
                  </div>
                  <div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      task.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {task.status === 'pending' ? 'Pending' : 'In Progress'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Info */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Informasi Tim</CardTitle>
            <CardDescription>
              Detail tim magang Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Tim: Frontend Development</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Anggota Tim:</p>
                <ul className="space-y-1 text-sm">
                  <li>• Budi Santoso (Ketua)</li>
                  <li>• Ani Wijaya</li>
                  <li>• Citra Dewi</li>
                </ul>
              </div>
              <div className="space-y-2 pt-4 border-t">
                <p className="text-sm text-muted-foreground">Mentor Lapangan:</p>
                <p className="text-sm font-medium">Pak Ahmad Dahlan</p>
                <p className="text-xs text-muted-foreground">ahmad.dahlan@company.com</p>
              </div>
              <div className="space-y-2 pt-4 border-t">
                <p className="text-sm text-muted-foreground">Dosen Pembimbing:</p>
                <p className="text-sm font-medium">Dr. Siti Nurhaliza, M.Kom</p>
                <p className="text-xs text-muted-foreground">Teknik Informatika</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
          <CardDescription>
            Riwayat aktivitas magang Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: "Mengirim Laporan Mingguan #4", time: "2 jam yang lalu", status: "success" },
              { action: "Mengupdate Logbook Harian", time: "5 jam yang lalu", status: "success" },
              { action: "Surat Balasan Diterima", time: "1 hari yang lalu", status: "info" },
              { action: "Pengajuan Magang Disetujui", time: "3 hari yang lalu", status: "success" }
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4 text-sm">
                <div className={`h-2 w-2 rounded-full ${
                  activity.status === 'success' ? 'bg-green-500' : 'bg-blue-500'
                }`} />
                <span className="flex-1">{activity.action}</span>
                <span className="text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
