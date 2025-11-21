import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import {
  Users,
  FileCheck,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText
} from "lucide-react"

export default function DosenDashboard() {
  const stats = [
    {
      title: "Total Mahasiswa Bimbingan",
      value: "12",
      icon: Users,
      description: "3 tim magang aktif"
    },
    {
      title: "Menunggu Verifikasi",
      value: "5",
      icon: Clock,
      description: "Surat & laporan pending"
    },
    {
      title: "Terverifikasi",
      value: "28",
      icon: CheckCircle,
      description: "Bulan ini"
    },
    {
      title: "Perlu Perhatian",
      value: "2",
      icon: AlertCircle,
      description: "Mahasiswa butuh bimbingan"
    }
  ]

  const pendingVerifications = [
    {
      student: "Budi Santoso",
      type: "Laporan Mingguan #5",
      submitted: "18 Jan 2025",
      team: "Frontend Dev"
    },
    {
      student: "Ani Wijaya",
      type: "Surat Pengantar",
      submitted: "17 Jan 2025",
      team: "Backend Dev"
    },
    {
      student: "Citra Dewi",
      type: "Laporan Akhir",
      submitted: "16 Jan 2025",
      team: "Frontend Dev"
    },
    {
      student: "Dedi Kurniawan",
      type: "Logbook Harian",
      submitted: "15 Jan 2025",
      team: "Mobile Dev"
    }
  ]

  const teams = [
    { name: "Frontend Development", members: 3, progress: 80, mentor: "PT. Maju Jaya" },
    { name: "Backend Development", members: 4, progress: 65, mentor: "PT. Digital Solusi" },
    { name: "Mobile Development", members: 3, progress: 90, mentor: "PT. Teknologi Masa Depan" }
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Dosen</h1>
        <p className="text-muted-foreground">
          Sistem monitoring dan verifikasi kerja praktik mahasiswa
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
        {/* Pending Verifications */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Menunggu Verifikasi</CardTitle>
            <CardDescription>
              Dokumen dan laporan yang perlu diverifikasi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingVerifications.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg border">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                    <FileCheck className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{item.student}</p>
                    <p className="text-sm text-muted-foreground">{item.type}</p>
                    <p className="text-xs text-muted-foreground">
                      Tim: {item.team} • Dikirim: {item.submitted}
                    </p>
                  </div>
                  <div>
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4">
                      Verifikasi
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Teams Overview */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Tim Bimbingan</CardTitle>
            <CardDescription>
              Overview tim yang Anda bimbing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teams.map((team, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{team.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {team.members} anggota • {team.mentor}
                      </p>
                    </div>
                    <span className="text-xs font-medium">{team.progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${team.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
          <CardDescription>
            Riwayat verifikasi dan bimbingan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                action: "Memverifikasi Laporan Mingguan - Eko Prasetyo",
                time: "1 jam yang lalu",
                status: "success"
              },
              {
                action: "Memberikan feedback pada Surat Pengantar - Fitri Handayani",
                time: "3 jam yang lalu",
                status: "info"
              },
              {
                action: "Sesi bimbingan dengan Tim Frontend Dev",
                time: "1 hari yang lalu",
                status: "success"
              },
              {
                action: "Menyetujui Pengajuan Magang - Tim Backend Dev",
                time: "2 hari yang lalu",
                status: "success"
              }
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

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Rata-rata Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Dari semua tim bimbingan
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Verifikasi Bulan Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground mt-1">
              +12% dari bulan lalu
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Sesi Bimbingan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sesi bimbingan bulan ini
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
