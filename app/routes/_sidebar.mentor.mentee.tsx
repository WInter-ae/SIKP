import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Users, Mail, Phone, Building2, ArrowLeft, Award } from "lucide-react";

export default function MenteePage() {
  const menteeList = [
    {
      id: "1",
      name: "Ahmad Fauzi",
      nim: "12250111001",
      email: "ahmad.fauzi@student.unri.ac.id",
      phone: "081234567890",
      company: "PT. Teknologi Indonesia",
      progress: 75,
      status: "Aktif",
    },
    {
      id: "2",
      name: "Siti Aminah",
      nim: "12250111002",
      email: "siti.aminah@student.unri.ac.id",
      phone: "081234567891",
      company: "PT. Digital Solutions",
      progress: 60,
      status: "Aktif",
    },
    {
      id: "3",
      name: "Budi Santoso",
      nim: "12250111003",
      email: "budi.santoso@student.unri.ac.id",
      phone: "081234567892",
      company: "CV. Mitra Sejahtera",
      progress: 85,
      status: "Aktif",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Daftar Mentee</h1>
        <p className="text-muted-foreground">
          Mahasiswa yang berada dalam bimbingan Anda
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Mentee
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{menteeList.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rata-rata Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                menteeList.reduce((sum, m) => sum + m.progress, 0) /
                menteeList.length
              ).toFixed(1)}
              %
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {menteeList.filter((m) => m.status === "Aktif").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-8">
        {menteeList.map((mentee) => (
          <Card key={mentee.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{mentee.name}</CardTitle>
                  <CardDescription>NIM: {mentee.nim}</CardDescription>
                </div>
                <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">
                  {mentee.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{mentee.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{mentee.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm md:col-span-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{mentee.company}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress KP</span>
                  <span className="font-medium">{mentee.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${mentee.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/mentor/penilaian?mentee=${mentee.id}`}>
                    <Award className="h-4 w-4 mr-2" />
                    Beri Penilaian
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-start">
        <Button variant="secondary" asChild>
          <Link to="/mentor">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
