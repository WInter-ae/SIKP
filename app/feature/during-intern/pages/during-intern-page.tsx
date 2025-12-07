import { Link } from "react-router";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";

import { ArrowLeft, ArrowRight, BookOpen, ClipboardCheck, FileCheck } from "lucide-react";

function DuringInternPage() {
  const menuItems = [
    {
      title: "Logbook",
      description: "Catat aktivitas harian selama masa kerja praktik",
      icon: BookOpen,
      to: "/logbook",
    },
    {
      title: "Penilaian",
      description: "Lihat hasil penilaian dari pembimbing lapangan",
      icon: ClipboardCheck,
      to: "/penilaian",
    },
    {
      title: "Pengesahan",
      description: "Dapatkan pengesahan dokumen kerja praktik",
      icon: FileCheck,
      to: "https://ols.ilkom.unsri.ac.id/login",
      external: true,
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

      {/* Menu Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isExternal = item.external;

          return (
            <Card
              key={item.title}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
            >
              {isExternal ? (
                <a
                  href={item.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full"
                >
                  <CardHeader className="text-center pb-2">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription>{item.description}</CardDescription>
                  </CardContent>
                </a>
              ) : (
                <Link to={item.to} className="block h-full">
                  <CardHeader className="text-center pb-2">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription>{item.description}</CardDescription>
                  </CardContent>
                </Link>
              )}
            </Card>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="secondary"
          asChild
          className="px-6 py-3 font-medium"
        >
          <Link to="/mahasiswa/kp/surat-balasan">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Sebelumnya
          </Link>
        </Button>
        <Button
          asChild
          className="px-6 py-3 font-medium"
        >
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
