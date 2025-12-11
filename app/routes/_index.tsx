import { useState, useEffect } from "react";
import { GraduationCap, CreditCard, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

import { useTheme } from "~/contexts/theme-context";
import { cn } from "~/lib/utils";
import Header from "~/components/header";
import Footer from "~/components/footer";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

// Constants
const BACKGROUND_IMAGES = [
  "/images/gedung-1.jpg",
  "/images/gedung-2.jpg",
  "/images/gedung-3.jpg",
  "/images/gedung-4.jpg",
];

const SLIDE_INTERVAL = 5000;

interface RequirementCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function RequirementCard({ icon, title, description }: RequirementCardProps) {
  return (
    <Card className="bg-gradient-to-br from-primary to-secondary border-0 text-white overflow-hidden group hover:scale-105 transition-transform duration-300">
      <CardContent className="p-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="p-3 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
            {icon}
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-sm leading-relaxed text-white/90">{description}</p>
      </CardContent>
    </Card>
  );
}

function Beranda() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isDarkMode } = useTheme();

  // Auto slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % BACKGROUND_IMAGES.length);
    }, SLIDE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Navigation handlers
  const handlePrevSlide = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? BACKGROUND_IMAGES.length - 1 : prev - 1
    );
  };

  const handleNextSlide = () => {
    setCurrentImageIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
  };

  const handleSlideSelect = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="relative h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden">
        {/* Background Images with transition */}
        {BACKGROUND_IMAGES.map((image, index) => (
          <div
            key={image}
            className={cn(
              "absolute inset-0 bg-cover bg-center transition-opacity duration-1000",
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            )}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50 z-10" />

        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
          onClick={handlePrevSlide}
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
          onClick={handleNextSlide}
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>

        {/* Content */}
        <div className="relative z-20 text-center text-white px-6 py-8 max-w-4xl">
          <div className="inline-block px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-8">
            <span className="text-xl font-bold tracking-wider">SIKP</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight drop-shadow-lg">
            Selamat Datang di
            <br />
            <span className="bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">
              Sistem Informasi Kerja Praktik
            </span>
          </h1>
          
          <p className="text-lg md:text-xl mb-10 leading-relaxed text-white/90 max-w-2xl mx-auto drop-shadow-md">
            Portal Kerja Praktik Program Studi Manajemen Informatika yang dirancang
            untuk mempermudah mahasiswa dalam mencari, mendaftar, dan
            melaksanakan program kerja praktik.
          </p>

          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-white/90 font-semibold px-8"
          >
            Mulai Sekarang
          </Button>

          {/* Slide Indicators */}
          <div className="flex gap-3 justify-center mt-12">
            {BACKGROUND_IMAGES.map((_, index) => (
              <button
                key={`indicator-${index}`}
                onClick={() => handleSlideSelect(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === currentImageIndex
                    ? "bg-white w-8"
                    : "bg-white/50 hover:bg-white/70 w-2"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section
        className={cn(
          "py-20 transition-colors duration-300",
          isDarkMode ? "bg-gray-900" : "bg-white"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2
              className={cn(
                "text-3xl md:text-4xl font-bold mb-4 transition-colors duration-300",
                isDarkMode ? "text-white" : "text-gray-900"
              )}
            >
              Syarat & Ketentuan
            </h2>
            <p
              className={cn(
                "text-lg max-w-2xl mx-auto",
                isDarkMode ? "text-gray-400" : "text-gray-600"
              )}
            >
              Pastikan kamu memenuhi semua persyaratan sebelum mendaftar Kerja Praktik
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <RequirementCard
              icon={<GraduationCap className="h-8 w-8" />}
              title="Semester"
              description="Mahasiswa minimal berada di semester 5 saat mendaftar"
            />
            <RequirementCard
              icon={<CreditCard className="h-8 w-8" />}
              title="UKT"
              description="Mahasiswa tidak memiliki tunggakan pembayaran UKT"
            />
            <RequirementCard
              icon={<BookOpen className="h-8 w-8" />}
              title="SKS"
              description="Mahasiswa telah lulus minimal 90 SKS"
            />
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section
        className={cn(
          "py-20 transition-colors duration-300",
          isDarkMode ? "bg-gray-800" : "bg-gray-50"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2
              className={cn(
                "text-3xl md:text-4xl font-bold mb-4 transition-colors duration-300",
                isDarkMode ? "text-white" : "text-gray-900"
              )}
            >
              Alur Kerja Praktik
            </h2>
            <p
              className={cn(
                "text-lg max-w-2xl mx-auto",
                isDarkMode ? "text-gray-400" : "text-gray-600"
              )}
            >
              Ikuti langkah-langkah berikut untuk menyelesaikan program Kerja Praktik
            </p>
          </div>

          <div className="w-full max-w-6xl mx-auto">
            <img
              src="/images/Road.png"
              alt="Alur Kerja Praktik"
              className="w-full h-auto rounded-xl shadow-lg"
            />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Beranda;
