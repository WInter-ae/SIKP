import { useState } from "react";
import { Link, useParams } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  MapPin,
  BookOpen,
  Award,
  FileText,
  Clock,
  CheckCircle,
} from "lucide-react";

import type { Mentee } from "../types";

// Mock data - should be fetched from API
const MOCK_MENTEE_DATA: Record<string, Mentee & {
  address: string;
  startDate: string;
  endDate: string;
  supervisor: string;
  university: string;
  major: string;
  semester: string;
  ipk: string;
}> = {
  "1": {
    id: "1",
    name: "Ahmad Fauzi",
    nim: "12250111001",
    email: "ahmad.fauzi@student.unri.ac.id",
    phone: "081234567890",
    company: "PT. Teknologi Indonesia",
    progress: 75,
    status: "Aktif",
    address: "Jl. Raya No. 123, Pekanbaru",
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    supervisor: "Budi Santoso",
    university: "Universitas Riau",
    major: "Teknik Informatika",
    semester: "6",
    ipk: "3.75",
  },
  "2": {
    id: "2",
    name: "Siti Aminah",
    nim: "12250111002",
    email: "siti.aminah@student.unri.ac.id",
    phone: "081234567891",
    company: "PT. Digital Solutions",
    progress: 60,
    status: "Aktif",
    address: "Jl. Sudirman No. 456, Pekanbaru",
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    supervisor: "Citra Dewi",
    university: "Universitas Riau",
    major: "Sistem Informasi",
    semester: "6",
    ipk: "3.60",
  },
  "3": {
    id: "3",
    name: "Budi Santoso",
    nim: "12250111003",
    email: "budi.santoso@student.unri.ac.id",
    phone: "081234567892",
    company: "CV. Mitra Sejahtera",
    progress: 85,
    status: "Aktif",
    address: "Jl. Ahmad Yani No. 789, Pekanbaru",
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    supervisor: "Ahmad Hidayat",
    university: "Universitas Riau",
    major: "Teknik Informatika",
    semester: "6",
    ipk: "3.85",
  },
};

const MOCK_ACTIVITIES = [
  {
    id: "1",
    type: "logbook",
    title: "Logbook Minggu ke-8",
    date: "2024-01-20",
    status: "approved",
  },
  {
    id: "2",
    type: "report",
    title: "Laporan Tengah KP",
    date: "2024-01-18",
    status: "pending",
  },
  {
    id: "3",
    type: "logbook",
    title: "Logbook Minggu ke-7",
    date: "2024-01-13",
    status: "approved",
  },
];

const MOCK_ASSESSMENTS = [
  {
    id: "1",
    title: "Penilaian Kedisiplinan",
    score: 85,
    date: "2024-01-15",
  },
  {
    id: "2",
    title: "Penilaian Keterampilan Teknis",
    score: 90,
    date: "2024-01-10",
  },
  {
    id: "3",
    title: "Penilaian Kerjasama Tim",
    score: 88,
    date: "2024-01-05",
  },
];

function MenteeDetailPage() {
  const { menteeId } = useParams();
  const [activeTab, setActiveTab] = useState("info");

  const mentee = menteeId ? MOCK_MENTEE_DATA[menteeId] : null;

  if (!mentee) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Data mahasiswa tidak ditemukan
            </p>
          </CardContent>
        </Card>
        <Button asChild className="mt-4">
          <Link to="/mentor/mentee">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Mahasiswa
          </Link>
        </Button>
      </div>
    );
  }

  const averageScore =
    MOCK_ASSESSMENTS.reduce((sum, a) => sum + a.score, 0) /
    MOCK_ASSESSMENTS.length;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/mentor/mentee">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Mahasiswa
          </Link>
        </Button>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{mentee.name}</h1>
            <p className="text-muted-foreground mt-1">Mahasiswa Magang - NIM: {mentee.nim}</p>
          </div>
          <Badge
            variant={mentee.status === "Aktif" ? "default" : "secondary"}
            className="text-sm"
          >
            {mentee.status}
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Progress Magang</CardDescription>
            <CardTitle className="text-3xl">{mentee.progress}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Rata-rata Nilai</CardDescription>
            <CardTitle className="text-3xl">{averageScore.toFixed(1)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Aktivitas</CardDescription>
            <CardTitle className="text-3xl">{MOCK_ACTIVITIES.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info">Informasi</TabsTrigger>
          <TabsTrigger value="activity">Aktivitas</TabsTrigger>
          <TabsTrigger value="assessment">Penilaian</TabsTrigger>
        </TabsList>

        {/* Tab: Informasi */}
        <TabsContent value="info" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Pribadi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Nama Lengkap</p>
                  <p className="font-medium">{mentee.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">NIM</p>
                  <p className="font-medium">{mentee.nim}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{mentee.email}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Telepon</p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{mentee.phone}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Alamat</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{mentee.address}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informasi Akademik
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Universitas</p>
                  <p className="font-medium">{mentee.university}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Program Studi</p>
                  <p className="font-medium">{mentee.major}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Semester</p>
                  <p className="font-medium">{mentee.semester}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">IPK</p>
                  <p className="font-medium">{mentee.ipk}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Informasi Magang
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Perusahaan</p>
                  <p className="font-medium">{mentee.company}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Pembimbing Lapangan
                  </p>
                  <p className="font-medium">{mentee.supervisor}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Tanggal Mulai</p>
                  <p className="font-medium">
                    {new Date(mentee.startDate).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Tanggal Selesai
                  </p>
                  <p className="font-medium">
                    {new Date(mentee.endDate).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress Magang</span>
                  <span className="font-medium">{mentee.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${mentee.progress}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button asChild>
              <Link to={`/mentor/logbook-detail/${mentee.id}`}>
                <BookOpen className="mr-2 h-4 w-4" />
                Lihat Logbook
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/mentor/penilaian?mentee=${mentee.id}`}>
                <Award className="mr-2 h-4 w-4" />
                Beri Penilaian
              </Link>
            </Button>
          </div>
        </TabsContent>

        {/* Tab: Aktivitas */}
        <TabsContent value="activity" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Aktivitas</CardTitle>
              <CardDescription>
                Aktivitas terbaru dari {mentee.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_ACTIVITIES.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 border rounded-lg"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      {activity.type === "logbook" ? (
                        <BookOpen className="h-5 w-5 text-primary" />
                      ) : (
                        <FileText className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <Badge
                      variant={
                        activity.status === "approved" ? "default" : "secondary"
                      }
                    >
                      {activity.status === "approved" ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Disetujui
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </>
                      )}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Penilaian */}
        <TabsContent value="assessment" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Penilaian</CardTitle>
              <CardDescription>
                Penilaian yang telah diberikan kepada {mentee.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_ASSESSMENTS.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{assessment.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(assessment.date).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {assessment.score}
                      </p>
                      <p className="text-xs text-muted-foreground">dari 100</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <p className="font-medium">Rata-rata Nilai</p>
                <p className="text-2xl font-bold">{averageScore.toFixed(1)}</p>
              </div>
            </CardContent>
          </Card>

          <Button asChild className="w-full">
            <Link to={`/mentor/penilaian?mentee=${mentee.id}`}>
              <Award className="mr-2 h-4 w-4" />
              Tambah Penilaian Baru
            </Link>
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MenteeDetailPage;
