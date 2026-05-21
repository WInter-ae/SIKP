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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";

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
  Sparkles,
  Briefcase,
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
      description: "Kelola data verifikasi pembimbing lapangan dari instansi magang",
      icon: UserCircle,
      to: "/mahasiswa/mentor-lapangan",
      color: "from-emerald-400 to-teal-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Logbook Harian",
      description: "Tulis dan laporkan rutinitas aktivitas harian Kerja Praktik Anda",
      icon: BookOpen,
      to: "/mahasiswa/kp/logbook",
      color: "from-orange-400 to-amber-500",
      bgColor: "bg-orange-50 dark:bg-orange-500/10",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "Nilai",
      description: "Tinjau rekap hasil penilaian akhir dari pihak pembimbing lapangan",
      icon: ClipboardCheck,
      to: "/mahasiswa/kp/penilaian",
      color: "from-blue-400 to-indigo-600",
      bgColor: "bg-blue-50 dark:bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Laporan Magang",
      description: "Susun judul laporan resmi dan upload berkas final PDF hasil Kerja Praktik",
      icon: FileText,
      to: "/mahasiswa/kp/laporan",
      color: "from-purple-400 to-fuchsia-600",
      bgColor: "bg-purple-50 dark:bg-purple-500/10",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
  ];

  const HeroSection = () => (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-950 via-indigo-900 to-slate-900 p-8 sm:p-10 text-white shadow-2xl mb-8 border border-white/10">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 -translate-y-8 translate-x-1/4 opacity-10 pointer-events-none">
        <Sparkles className="w-[400px] h-[400px] text-blue-300" strokeWidth={0.5} />
      </div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-40 mix-blend-screen pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-blue-500 rounded-full blur-[60px] opacity-30 mix-blend-screen pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-blue-100 backdrop-blur-md border border-white/20 shadow-xs">
            <span className="flex h-2.5 w-2.5 rounded-full bg-blue-400 mr-2.5 animate-pulse"></span>
            Tahap Pelaksanaan Kerja Praktik
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-r from-white to-blue-200 drop-shadow-xs">
            Pelaksanaan Magang
          </h1>
          <p className="text-blue-100/90 text-base sm:text-lg font-medium leading-relaxed max-w-xl">
            Kelola aktivitas Kerja Praktik Anda secara terpusat. Tulis logbook harian, koordinasi dengan pembimbing industri, dan pantau proses kelulusan.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col p-1 sm:p-2 bg-slate-50/10 dark:bg-slate-950/10 min-h-[calc(100svh-3.5rem)]">
      <HeroSection />

      {/* Student Profile Card */}
      <UICard className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/85 dark:bg-slate-900/85 shadow-md backdrop-blur-xl mb-8">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-linear-to-b from-blue-400 to-indigo-600" />
        <CardContent className="p-6 sm:p-8">
          {isLoadingProfile ? (
            <div className="flex min-h-[160px] items-center justify-center text-sm text-slate-500 font-medium animate-pulse">
              Memuat data profil magang...
            </div>
          ) : (
            <TooltipProvider delayDuration={200}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Block 1: Nama Mahasiswa */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-850 p-4 bg-slate-50/50 dark:bg-slate-950/40 transition-all hover:bg-slate-50 dark:hover:bg-slate-950/60 shadow-xs cursor-help">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <Label className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Nama Mahasiswa</Label>
                        <p className="font-extrabold text-slate-800 dark:text-slate-100 text-sm sm:text-base mt-0.5 leading-tight truncate">
                          {completeData?.student?.name || "-"}
                        </p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="font-semibold shadow-md">
                    <p>{completeData?.student?.name || "-"}</p>
                  </TooltipContent>
                </Tooltip>

                {/* Block 2: NIM */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-850 p-4 bg-slate-50/50 dark:bg-slate-950/40 transition-all hover:bg-slate-50 dark:hover:bg-slate-950/60 shadow-xs cursor-help">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs">
                        <span className="font-black text-sm font-mono">#</span>
                      </div>
                      <div className="min-w-0">
                        <Label className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">NIM</Label>
                        <p className="font-extrabold text-slate-800 dark:text-slate-100 text-sm sm:text-base mt-0.5 leading-tight truncate">
                          {completeData?.student?.nim || "-"}
                        </p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="font-semibold shadow-md">
                    <p>{completeData?.student?.nim || "-"}</p>
                  </TooltipContent>
                </Tooltip>

                {/* Block 3: Dosen Pembimbing */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-850 p-4 bg-slate-50/50 dark:bg-slate-950/40 transition-all hover:bg-slate-50 dark:hover:bg-slate-950/60 shadow-xs cursor-help">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs">
                        <UserCircle className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <Label className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Dosen Pembimbing</Label>
                        <p className="font-extrabold text-slate-800 dark:text-slate-100 text-sm sm:text-base mt-0.5 leading-tight truncate">
                          {completeData?.lecturer?.name || "-"}
                        </p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="font-semibold shadow-md">
                    <p>{completeData?.lecturer?.name || "-"}</p>
                  </TooltipContent>
                </Tooltip>

                {/* Block 4: Tempat KP */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-850 p-4 bg-slate-50/50 dark:bg-slate-950/40 transition-all hover:bg-slate-50 dark:hover:bg-slate-950/60 shadow-xs cursor-help">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs">
                        <Building className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Label className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tempat KP</Label>
                        <p className="font-extrabold text-slate-800 dark:text-slate-100 text-sm sm:text-base mt-0.5 leading-tight truncate" title={completeData?.submission?.company}>
                          {completeData?.submission?.company || "Belum tersedia"}
                        </p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="font-semibold shadow-md max-w-[320px]">
                    <p>{completeData?.submission?.company || "Belum tersedia"}</p>
                  </TooltipContent>
                </Tooltip>

                {/* Block 5: Unit / Divisi */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-850 p-4 bg-slate-50/50 dark:bg-slate-950/40 transition-all hover:bg-slate-50 dark:hover:bg-slate-950/60 shadow-xs cursor-help">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <Label className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Unit / Divisi</Label>
                        <p className="font-extrabold text-slate-800 dark:text-slate-100 text-sm sm:text-base mt-0.5 leading-tight truncate">
                          {completeData?.submission?.division || "Belum tersedia"}
                        </p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="font-semibold shadow-md max-w-[300px]">
                    <p>{completeData?.submission?.division || "Belum tersedia"}</p>
                  </TooltipContent>
                </Tooltip>

                {/* Block 6: Periode */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-850 p-4 bg-slate-50/50 dark:bg-slate-950/40 transition-all hover:bg-slate-50 dark:hover:bg-slate-950/60 shadow-xs cursor-help">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 w-full">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Label className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-sans">Periode</Label>
                          <Badge
                            variant={
                              completeData?.internship?.status === "AKTIF"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              completeData?.internship?.status === "AKTIF"
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-md shadow-xs px-2 py-0.5 text-[9px] sm:text-[10px]"
                                : "font-semibold rounded-md text-[9px] sm:text-[10px]"
                            }
                          >
                            {completeData?.internship?.status || "PENDING"}
                          </Badge>
                        </div>
                        <p className="font-extrabold text-slate-800 dark:text-slate-100 text-xs sm:text-sm mt-0.5 leading-tight truncate">
                          {completeData?.submission?.startDate &&
                            completeData?.submission?.endDate
                            ? `${new Date(
                              completeData.submission.startDate,
                            ).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                            })} - ${new Date(
                              completeData.submission.endDate,
                            ).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}`
                            : "Belum tersedia"}
                        </p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="font-semibold shadow-md">
                    <p>
                      {completeData?.submission?.startDate &&
                        completeData?.submission?.endDate
                        ? `${new Date(
                          completeData.submission.startDate,
                        ).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })} s/d ${new Date(
                          completeData.submission.endDate,
                        ).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}`
                        : "Belum tersedia"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          )}
        </CardContent>
      </UICard>

      {/* Menu Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {menuItems.map((item) => (
          <UICard key={item.title} className="relative overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-sm transition-all duration-350 hover:-translate-y-1 hover:shadow-lg group">
            <div className={`absolute top-0 left-0 w-full h-1.5 bg-linear-to-r ${item.color}`} />
            <Link to={item.to} className="block h-full p-6">
              <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-2xl ${item.bgColor} ${item.iconColor} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-xs`}>
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-black text-slate-850 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed font-semibold">
                  {item.description}
                </p>
              </div>
            </Link>
          </UICard>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-2">
        <Button variant="secondary" asChild className="px-6 py-5 rounded-2xl font-bold border border-slate-200 hover:bg-slate-100 transition-all">
          <Link to="/mahasiswa/kp/surat-balasan">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Sebelumnya
          </Link>
        </Button>
        <Button asChild className="px-6 py-5 rounded-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:brightness-105 transition-all text-white">
          <Link to="#">
            Selanjutnya
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default DuringInternPage;
