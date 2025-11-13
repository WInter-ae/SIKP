import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  GraduationCap,
  Building2,
  FileCheck
} from "lucide-react"

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Mahasiswa Magang",
      value: "156",
      icon: GraduationCap,
      description: "Periode aktif 2024/2025",
      trend: "+12%"
    },
    {
      title: "Pengajuan Pending",
      value: "8",
      icon: Clock,
      description: "Menunggu verifikasi",
      trend: "-5%"
    },
    {
      title: "Perusahaan Mitra",
      value: "42",
      icon: Building2,
      description: "Aktif bekerja sama",
      trend: "+8"
    },
    {
      title: "Dokumen Terverifikasi",
      value: "234",
      icon: CheckCircle,
      description: "Bulan ini",
      trend: "+15%"
    }
  ]

  const pendingSubmissions = [
    {
      student: "Tim Frontend Development",
      type: "Surat Pengantar",
      submitted: "18 Jan 2025",
      status: "pending"
    },
    {
      student: "Tim Backend Development",
      type: "Pengajuan Magang",
      submitted: "17 Jan 2025",
      status: "pending"
    },
    {
      student: "Tim Mobile Development",
      type: "Surat Pengantar",
      submitted: "16 Jan 2025",
      status: "pending"
    },
    {
      student: "Tim Data Science",
      type: "Pengajuan Magang",
      submitted: "15 Jan 2025",
      status: "review"
    }
  ]

  const recentVerifications = [
    {
      type: "Surat Balasan",
      student: "Tim UI/UX Design",
      company: "PT. Kreatif Digital",
      status: "approved",
      verifiedBy: "Admin"
    },
    {
      type: "Surat Balasan",
      student: "Tim Cloud Computing",
      company: "PT. Teknologi Cloud",
      status: "approved",
      verifiedBy: "Admin"
    },
    {
      type: "Surat Balasan",
      student: "Tim Cyber Security",
      company: "PT. Keamanan Siber",
      status: "approved",
      verifiedBy: "Admin"
    }
  ]

  const monthlyStats = [
    { month: "Jan", submissions: 45, approved: 42 },
    { month: "Feb", submissions: 52, approved: 48 },
    { month: "Mar", submissions: 38, approved: 35 },
    { month: "Apr", submissions: 48, approved: 46 }
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin Prodi</h1>
        <p className="text-muted-foreground">
          Sistem manajemen dan monitoring kerja praktik mahasiswa
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
              <div className="mt-1 flex items-center text-xs">
                <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                <span className="text-green-600 font-medium">{stat.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Pending Submissions */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Pengajuan Pending</CardTitle>
            <CardDescription>
              Pengajuan yang menunggu verifikasi admin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingSubmissions.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg border">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                    <FileText className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{item.student}</p>
                    <p className="text-sm text-muted-foreground">{item.type}</p>
                    <p className="text-xs text-muted-foreground">
                      Dikirim: {item.submitted}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3">
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Verifications */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Verifikasi Terbaru</CardTitle>
            <CardDescription>
              Dokumen yang baru diverifikasi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentVerifications.map((item, index) => (
                <div key={index} className="space-y-2 pb-3 border-b last:border-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-green-600" />
                      <p className="text-sm font-medium">{item.type}</p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                      Approved
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.student}</p>
                  <p className="text-xs text-muted-foreground">{item.company}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Statistik Pengajuan</CardTitle>
          <CardDescription>
            Overview pengajuan dan approval 4 bulan terakhir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyStats.map((stat, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-12 text-sm font-medium">{stat.month}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Pengajuan: {stat.submissions}</span>
                    <span className="text-muted-foreground">Disetujui: {stat.approved}</span>
                  </div>
                  <div className="relative h-2 w-full rounded-full bg-secondary">
                    <div
                      className="absolute h-2 rounded-full bg-primary"
                      style={{ width: `${(stat.approved / stat.submissions) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Approval rate: {Math.round((stat.approved / stat.submissions) * 100)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions & Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Mahasiswa Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sedang dalam proses magang
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Template Dokumen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">
              Template tersedia
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Dosen Pembimbing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground mt-1">
              Aktif membimbing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Sistem</CardTitle>
          <CardDescription>
            Log aktivitas terbaru di sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                action: "Menyetujui Surat Balasan - Tim Frontend Development",
                time: "30 menit yang lalu",
                status: "success"
              },
              {
                action: "Mengupdate Template Surat Pengantar",
                time: "2 jam yang lalu",
                status: "info"
              },
              {
                action: "Menambahkan Perusahaan Mitra Baru - PT. Digital Innovation",
                time: "5 jam yang lalu",
                status: "success"
              },
              {
                action: "Memverifikasi Pengajuan Magang - Tim Backend Development",
                time: "1 hari yang lalu",
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
    </div>
  )
}
