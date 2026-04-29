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

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  FileCheck,
  UserCircle,
  FileText,
  User,
  Building,
  Calendar,
} from "lucide-react";

// API Services
import { getCompleteInternshipData } from "~/feature/during-intern/services";
import type { CompleteInternshipData } from "~/feature/during-intern/services/student-api";

function DuringInternPage() {
  const [completeData, setCompleteData] =
    useState<CompleteInternshipData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Fetch complete internship data (⭐ ONE API CALL FOR ALL DATA)
  useEffect(() => {
    async function fetchStudentData() {
      console.log("🔄 Fetching complete internship data...");
      try {
        const response = await getCompleteInternshipData();
        console.log("📥 API Response:", response);

        if (response.success && response.data) {
          console.log("✅ Data received:", response.data);
          setCompleteData(response.data);
          toast.success("Data berhasil dimuat!");
        } else {
          console.error("❌ API returned unsuccessful:", response);

          // Check if it's an authentication error
          if (
            response.message?.toLowerCase().includes("unauthorized") ||
            response.message?.toLowerCase().includes("token")
          ) {
            toast.error(
              "Session expired. Anda akan diarahkan ke halaman login...",
              {
                duration: 3000,
              },
            );
            setTimeout(() => {
              if (window.location.pathname !== "/login") {
                window.location.href = "/login?reason=unauthorized";
              }
            }, 3000);
          } else {
            toast.error(response.message || "Gagal memuat data magang");
          }
        }
      } catch (error) {
        console.error("❌ Error fetching student data:", error);
        console.error("Error details:", {
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        });
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
                  <p className="font-medium">
                    {completeData?.student?.name ||
                      completeData?.student?.email?.split("@")[0] ||
                      "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">NIM</Label>
                  <p className="font-medium">
                    {completeData?.student?.nim || "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Program Studi</Label>
                  <p className="font-medium">
                    {completeData?.student?.prodi || "Manajemen Informatika"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fakultas</Label>
                  <p className="font-medium">
                    {completeData?.student?.fakultas || "Ilmu Komputer"}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Tempat KP</Label>
                  <p className="font-medium flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {completeData?.submission?.company || "Belum tersedia"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Bagian/Bidang</Label>
                  <p className="font-medium">
                    {completeData?.submission?.division || "Belum tersedia"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    Waktu KP / Periode KP
                  </Label>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {completeData?.submission?.startDate &&
                    completeData?.submission?.endDate
                      ? `${new Date(
                          completeData.submission.startDate,
                        ).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })} - ${new Date(
                          completeData.submission.endDate,
                        ).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}`
                      : "Belum tersedia"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        completeData?.internship?.status === "AKTIF"
                          ? "default"
                          : "secondary"
                      }
                      className={
                        completeData?.internship?.status === "AKTIF"
                          ? "bg-green-500"
                          : ""
                      }
                    >
                      {completeData?.internship?.status || "PENDING"}
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
