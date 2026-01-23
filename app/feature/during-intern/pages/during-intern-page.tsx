import { useState, useEffect } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  Card as UICard,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";

import Card from "~/feature/during-intern/components/card";

import { ArrowLeft, ArrowRight, BookOpen, ClipboardCheck, FileCheck, UserCircle, FileText, User, Building, Calendar } from "lucide-react";

// API Services
import { getMyProfile, getMyInternship } from "~/feature/during-intern/services";
import type { StudentProfile, InternshipData } from "~/feature/during-intern/services/student-api";

function DuringInternPage() {
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [internshipData, setInternshipData] = useState<InternshipData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Fetch student profile and internship data
  useEffect(() => {
    async function fetchStudentData() {
      try {
        const [profileResponse, internshipResponse] = await Promise.all([
          getMyProfile(),
          getMyInternship()
        ]);

        if (profileResponse.success && profileResponse.data) {
          setStudentProfile(profileResponse.data);
        } else {
          toast.error("Gagal memuat profil mahasiswa");
        }

        if (internshipResponse.success && internshipResponse.data) {
          setInternshipData(internshipResponse.data);
        } else {
          toast.error("Gagal memuat data magang");
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
        toast.error("Terjadi kesalahan saat memuat data");
      } finally {
        setIsLoadingProfile(false);
      }
    }

    fetchStudentData();
  }, []);

  const menuItems = [
    {
      title: "Mentor Lapangan",
      description: "Kelola informasi pembimbing lapangan dari perusahaan",
      icon: UserCircle,
      to: "/mahasiswa/mentor-lapangan",
    },
    {
      title: "Logbook",
      description: "Catat aktivitas harian selama masa kerja praktik",
      icon: BookOpen,
      to: "/mahasiswa/kp/logbook",
    },
    {
      title: "Penilaian",
      description: "Lihat hasil penilaian dari pembimbing lapangan",
      icon: ClipboardCheck,
      to: "/mahasiswa/kp/penilaian",
    },
    {
      title: "Laporan KP",
      description: "Kelola judul dan upload laporan kerja praktik",
      icon: FileText,
      to: "/mahasiswa/kp/laporan",
    },
  ];

  return (
    <>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Halaman Kebutuhan Saat Magang
        </h1>
        <p className="text-muted-foreground">
          Kelola kebutuhan Anda selama masa kerja praktik
        </p>
      </div>

      {/* Student Profile Card */}
      <UICard className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Data Mahasiswa
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingProfile ? (
            <div className="text-center py-4 text-muted-foreground">
              Memuat data mahasiswa...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Nama</Label>
                  <p className="font-medium">{studentProfile?.name || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">NIM</Label>
                  <p className="font-medium">{studentProfile?.nim || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Program Studi</Label>
                  <p className="font-medium">{studentProfile?.prodi || "Manajemen Informatika"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fakultas</Label>
                  <p className="font-medium">
                    {studentProfile?.fakultas || "Ilmu Komputer"}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Tempat KP</Label>
                  <p className="font-medium flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {internshipData?.company || "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Waktu KP / Periode KP</Label>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {internshipData?.startDate && internshipData?.endDate
                      ? `${new Date(internshipData.startDate).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })} - ${new Date(internshipData.endDate).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}`
                      : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge
                      variant={internshipData?.status === "AKTIF" ? "default" : "secondary"}
                      className={internshipData?.status === "AKTIF" ? "bg-green-500" : ""}
                    >
                      {internshipData?.status || "PENDING"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </UICard>

      {/* Menu Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {menuItems.map((item) => (
          <Card
            key={item.title}
            title={item.title}
            description={item.description}
            icon={item.icon}
            to={item.to}
          />
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button variant="secondary" asChild className="px-6 py-3 font-medium">
          <Link to="/mahasiswa/kp/surat-balasan">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Sebelumnya
          </Link>
        </Button>
        <Button asChild className="px-6 py-3 font-medium">
          <Link to="#">
            Selanjutnya
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </>
  );
}

export default DuringInternPage;