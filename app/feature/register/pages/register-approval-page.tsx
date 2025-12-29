// 1. External dependencies
import { useState } from "react"
import {
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Mail,
  Calendar,
  Filter,
  Building2,
  Phone,
} from "lucide-react"

// 2. Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { Badge } from "~/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Input } from "~/components/ui/input"

// Tipe data untuk pendaftaran dosen
interface PendingRegistration {
  id: string
  registrationCode: string
  name: string
  email: string
  nip?: string
  company: string
  position: string
  phone: string
  registeredAt: string
  status: "pending" | "approved" | "rejected"
  // Data mahasiswa yang request
  studentName: string
  studentNim: string
  studentEmail: string
}

export default function RegisterApprovalPage() {
  // Data dummy - nanti akan diganti dengan API call
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([
    {
      id: "1",
      registrationCode: "MNT-123456-0001",
      name: "Ahmad Fauzi",
      email: "ahmad.fauzi@company.com",
      nip: "198501012010011001",
      company: "PT. Teknologi Nusantara",
      position: "Senior Software Engineer",
      phone: "081234567890",
      registeredAt: "2025-01-15T10:30:00",
      status: "pending",
      studentName: "Budi Santoso",
      studentNim: "2021110001",
      studentEmail: "budi.santoso@student.ac.id",
    },
    {
      id: "2",
      registrationCode: "MNT-234567-0002",
      name: "Siti Nurhaliza",
      email: "siti.nurhaliza@enterprise.co.id",
      nip: "198703202011012002",
      company: "CV. Digital Kreatif",
      position: "Project Manager",
      phone: "082345678901",
      registeredAt: "2025-01-16T14:20:00",
      status: "pending",
      studentName: "Dewi Lestari",
      studentNim: "2021110002",
      studentEmail: "dewi.lestari@student.ac.id",
    },
    {
      id: "3",
      registrationCode: "MNT-345678-0003",
      name: "Budi Hartono",
      email: "budi.hartono@startup.id",
      nip: "197912152008011003",
      company: "Startup Indonesia Tech",
      position: "Lead Developer",
      phone: "083456789012",
      registeredAt: "2025-01-18T09:15:00",
      status: "pending",
      studentName: "Andi Wijaya",
      studentNim: "2021110003",
      studentEmail: "andi.wijaya@student.ac.id",
    },
  ])

  const [selectedRegistration, setSelectedRegistration] =
    useState<PendingRegistration | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogAction, setDialogAction] = useState<"approve" | "reject">(
    "approve"
  )
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Handler untuk membuka dialog konfirmasi
  const handleOpenDialog = (
    registration: PendingRegistration,
    action: "approve" | "reject"
  ) => {
    setSelectedRegistration(registration)
    setDialogAction(action)
    setDialogOpen(true)
  }

  // Handler untuk approve pendaftaran
  const handleApprove = async () => {
    if (!selectedRegistration) return

    try {
      // TODO: Implement API call untuk approve
      // const response = await fetch(`/api/admin/approve-registration/${selectedRegistration.id}`, {
      //   method: 'POST',
      // })

      // Update state
      setRegistrations(
        registrations.map((reg) =>
          reg.id === selectedRegistration.id
            ? { ...reg, status: "approved" }
            : reg
        )
      )

      setDialogOpen(false)
      setSelectedRegistration(null)
    } catch (error) {
      console.error("Error approving registration:", error)
    }
  }

  // Handler untuk reject pendaftaran
  const handleReject = async () => {
    if (!selectedRegistration) return

    try {
      // TODO: Implement API call untuk reject
      // const response = await fetch(`/api/admin/reject-registration/${selectedRegistration.id}`, {
      //   method: 'POST',
      // })

      // Update state
      setRegistrations(
        registrations.map((reg) =>
          reg.id === selectedRegistration.id
            ? { ...reg, status: "rejected" }
            : reg
        )
      )

      setDialogOpen(false)
      setSelectedRegistration(null)
    } catch (error) {
      console.error("Error rejecting registration:", error)
    }
  }

  // Format tanggal
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Filter registrations berdasarkan status dan search query
  const filteredRegistrations = registrations.filter((reg) => {
    const matchesStatus =
      filterStatus === "all" || reg.status === filterStatus
    const matchesSearch =
      searchQuery === "" ||
      reg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.nip?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.registrationCode.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStatus && matchesSearch
  })

  // Hitung statistik
  const stats = {
    pending: registrations.filter((r) => r.status === "pending").length,
    approved: registrations.filter((r) => r.status === "approved").length,
    rejected: registrations.filter((r) => r.status === "rejected").length,
    total: registrations.length,
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Persetujuan Pembimbing Lapangan
        </h1>
        <p className="text-muted-foreground">
          Kelola dan setujui pendaftaran pembimbing lapangan dari mahasiswa
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pendaftar
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Seluruh pendaftaran</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Perlu ditinjau</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disetujui</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Sudah disetujui</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">Tidak disetujui</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pendaftaran</CardTitle>
          <CardDescription>
            Tinjau dan proses pendaftaran pembimbing lapangan yang di-request mahasiswa
          </CardDescription>

          {/* Filters */}
          <div className="flex flex-col gap-4 pt-4 sm:flex-row">
            <div className="flex-1">
              <Input
                placeholder="Cari nama mentor, mahasiswa, perusahaan, kode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="approved">Disetujui</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredRegistrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UserCheck className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Tidak ada pendaftaran
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || filterStatus !== "all"
                  ? "Tidak ada pendaftaran yang sesuai dengan filter"
                  : "Belum ada pendaftaran pembimbing lapangan yang perlu ditinjau"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Pembimbing Lapangan</TableHead>
                    <TableHead>Perusahaan</TableHead>
                    <TableHead>Posisi</TableHead>
                    <TableHead>Mahasiswa Pemohon</TableHead>
                    <TableHead>Tanggal Daftar</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {registration.registrationCode}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{registration.name}</span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {registration.email}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {registration.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{registration.company}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{registration.position}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {registration.studentName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {registration.studentNim}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {registration.studentEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatDate(registration.registeredAt)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {registration.status === "pending" && (
                          <Badge variant="secondary">
                            <Clock className="mr-1 h-3 w-3" />
                            Menunggu
                          </Badge>
                        )}
                        {registration.status === "approved" && (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Disetujui
                          </Badge>
                        )}
                        {registration.status === "rejected" && (
                          <Badge variant="destructive">
                            <XCircle className="mr-1 h-3 w-3" />
                            Ditolak
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {registration.status === "pending" && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-green-500 hover:bg-green-600"
                              onClick={() =>
                                handleOpenDialog(registration, "approve")
                              }
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Setujui
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleOpenDialog(registration, "reject")
                              }
                            >
                              <XCircle className="mr-1 h-4 w-4" />
                              Tolak
                            </Button>
                          </div>
                        )}
                        {registration.status !== "pending" && (
                          <span className="text-sm text-muted-foreground">
                            Sudah diproses
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogAction === "approve"
                ? "Setujui Pendaftaran?"
                : "Tolak Pendaftaran?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogAction === "approve" ? (
                <>
                  Anda akan menyetujui pendaftaran{" "}
                  <strong>{selectedRegistration?.name}</strong>. Dosen ini akan
                  mendapatkan akses ke sistem sebagai dosen pembimbing.
                </>
              ) : (
                <>
                  Anda akan menolak pendaftaran{" "}
                  <strong>{selectedRegistration?.name}</strong>. Pendaftar akan
                  menerima notifikasi penolakan.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={
                dialogAction === "approve" ? handleApprove : handleReject
              }
              className={
                dialogAction === "reject"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              {dialogAction === "approve" ? "Setujui" : "Tolak"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
