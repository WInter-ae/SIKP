import { Link } from "react-router";

import { Button } from "~/components/ui/button";

import Card from "~/feature/during-intern/components/card";

import { ArrowLeft, ArrowRight, BookOpen, ClipboardCheck, FileCheck } from "lucide-react";

function DuringInternPage() {
  const menuItems = [
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
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {menuItems.map((item) => {
          if (item.external) {
            return (
              <a
                key={item.title}
                href={item.to}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Card
                  title={item.title}
                  description={item.description}
                  icon={item.icon}
                  to={item.to}
                />
              </a>
            );
          }
          return (
            <Card
              key={item.title}
              title={item.title}
              description={item.description}
              icon={item.icon}
              to={item.to}
            />
          );
        })}
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