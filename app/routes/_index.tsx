import { useState, useEffect } from "react";
import { 
  GraduationCap, 
  CreditCard, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  ArrowRight,
  Sparkles,
  Star
} from "lucide-react";

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
  index: number;
}

function RequirementCard({ icon, title, description, index }: RequirementCardProps) {
  const { isDarkMode } = useTheme();
  
  return (
    <div 
      className="group relative"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-2xl blur-lg opacity-0 group-hover:opacity-60 transition-all duration-500 group-hover:duration-200" />
      
      <Card className={cn(
        "relative border-0 overflow-hidden transition-all duration-500",
        "bg-gradient-to-br from-primary/90 via-primary to-secondary",
        "hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/25",
        isDarkMode ? "shadow-lg shadow-primary/10" : "shadow-xl"
      )}>
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-4 w-24 h-24 bg-white rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse delay-700" />
        </div>
        
        <CardContent className="relative p-8 text-center text-white">
          {/* Icon container with animation */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="relative p-4 bg-white/20 backdrop-blur-sm rounded-2xl group-hover:bg-white/30 group-hover:scale-110 transition-all duration-500">
                {icon}
              </div>
            </div>
          </div>
          
          <h3 className="text-2xl font-bold mb-3 tracking-tight">{title}</h3>
          <p className="text-base leading-relaxed text-white/90">{description}</p>
          
          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-white/50 group-hover:w-1/2 transition-all duration-500 rounded-full" />
        </CardContent>
      </Card>
    </div>
  );
}

// Floating decoration component
function FloatingDecoration({ className }: { className?: string }) {
  return (
    <div className={cn(
      "absolute pointer-events-none opacity-20",
      className
    )}>
      <Sparkles className="h-8 w-8 text-primary animate-pulse" />
    </div>
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
              "absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105",
              index === currentImageIndex 
                ? "opacity-100 scale-100" 
                : "opacity-0 scale-110"
            )}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}

        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-10" />
        
        {/* Animated mesh gradient */}
        <div className="absolute inset-0 z-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/30 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 z-10 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i * 0.5}s`
              }}
            >
              <Star className="h-3 w-3 text-white/30" />
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 h-14 w-14 rounded-full bg-white/5 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-all duration-300 hover:scale-110"
          onClick={handlePrevSlide}
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-7 w-7" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 h-14 w-14 rounded-full bg-white/5 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-all duration-300 hover:scale-110"
          onClick={handleNextSlide}
          aria-label="Next slide"
        >
          <ChevronRight className="h-7 w-7" />
        </Button>

        {/* Content */}
        <div className="relative z-20 text-center text-white px-6 py-8 max-w-5xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full mb-10 border border-white/20 animate-fade-in">
            <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
            <span className="text-lg font-semibold tracking-widest bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              SIKP
            </span>
            <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
          </div>
          
          {/* Main heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-8 leading-tight tracking-tight">
            <span className="block text-white/90 drop-shadow-2xl">
              Selamat Datang di
            </span>
            <span className="block mt-2 bg-gradient-to-r from-blue-200 via-white to-blue-200 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              Sistem Informasi
            </span>
            <span className="block mt-2 bg-gradient-to-r from-yellow-200 via-orange-200 to-yellow-200 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] delay-500">
              Kerja Praktik
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-12 leading-relaxed text-white/80 max-w-3xl mx-auto font-light">
            Portal Kerja Praktik Program Studi Manajemen Informatika yang dirancang
            untuk mempermudah mahasiswa dalam mencari, mendaftar, dan
            melaksanakan program kerja praktik.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="group relative bg-white text-primary hover:bg-white font-bold px-10 py-7 text-lg rounded-full shadow-2xl shadow-white/25 hover:shadow-white/40 transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                Mulai Sekarang
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="bg-white/5 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/10 font-semibold px-10 py-7 text-lg rounded-full transition-all duration-300 hover:scale-105 hover:border-white/50"
            >
              Pelajari Lebih Lanjut
            </Button>
          </div>

          {/* Slide Indicators */}
          <div className="flex gap-3 justify-center mt-16">
            {BACKGROUND_IMAGES.map((_, index) => (
              <button
                key={`indicator-${index}`}
                onClick={() => handleSlideSelect(index)}
                className={cn(
                  "h-3 rounded-full transition-all duration-500 backdrop-blur-sm",
                  index === currentImageIndex
                    ? "bg-white w-12 shadow-lg shadow-white/50"
                    : "bg-white/30 hover:bg-white/50 w-3"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <div className="w-8 h-12 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-2 h-3 bg-white/60 rounded-full animate-scroll" />
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section
        className={cn(
          "py-24 transition-colors duration-300 relative overflow-hidden",
          isDarkMode ? "bg-gray-900" : "bg-gradient-to-b from-white to-gray-50"
        )}
      >
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={cn(
            "absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl",
            isDarkMode ? "bg-primary/5" : "bg-primary/10"
          )} />
          <div className={cn(
            "absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl",
            isDarkMode ? "bg-secondary/5" : "bg-secondary/10"
          )} />
        </div>
        
        <FloatingDecoration className="top-20 left-20" />
        <FloatingDecoration className="top-40 right-32" />
        <FloatingDecoration className="bottom-20 left-1/3" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            {/* Section badge */}
            <div className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6",
              isDarkMode ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"
            )}>
              <Star className="h-4 w-4" />
              <span className="text-sm font-semibold tracking-wide">Persyaratan</span>
            </div>
            
            <h2
              className={cn(
                "text-4xl md:text-5xl font-black mb-6 tracking-tight",
                isDarkMode ? "text-white" : "text-gray-900"
              )}
            >
              Syarat & <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Ketentuan</span>
            </h2>
            <p
              className={cn(
                "text-xl max-w-2xl mx-auto leading-relaxed",
                isDarkMode ? "text-gray-400" : "text-gray-600"
              )}
            >
              Pastikan kamu memenuhi semua persyaratan sebelum mendaftar Kerja Praktik
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <RequirementCard
              icon={<GraduationCap className="h-10 w-10" />}
              title="Semester"
              description="Mahasiswa minimal berada di semester 5 saat mendaftar"
              index={0}
            />
            <RequirementCard
              icon={<CreditCard className="h-10 w-10" />}
              title="UKT"
              description="Mahasiswa tidak memiliki tunggakan pembayaran UKT"
              index={1}
            />
            <RequirementCard
              icon={<BookOpen className="h-10 w-10" />}
              title="SKS"
              description="Mahasiswa telah lulus minimal 90 SKS"
              index={2}
            />
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section
        className={cn(
          "py-24 transition-colors duration-300 relative overflow-hidden",
          isDarkMode ? "bg-gray-800" : "bg-gray-50"
        )}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className={cn(
            "absolute top-1/2 left-0 w-1/2 h-px",
            isDarkMode ? "bg-gradient-to-r from-transparent via-gray-700 to-transparent" : "bg-gradient-to-r from-transparent via-gray-300 to-transparent"
          )} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6",
              isDarkMode ? "bg-secondary/20 text-secondary" : "bg-secondary/10 text-secondary"
            )}>
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold tracking-wide">Panduan</span>
            </div>
            
            <h2
              className={cn(
                "text-4xl md:text-5xl font-black mb-6 tracking-tight",
                isDarkMode ? "text-white" : "text-gray-900"
              )}
            >
              Alur <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Kerja Praktik</span>
            </h2>
            <p
              className={cn(
                "text-xl max-w-2xl mx-auto leading-relaxed",
                isDarkMode ? "text-gray-400" : "text-gray-600"
              )}
            >
              Ikuti langkah-langkah berikut untuk menyelesaikan program Kerja Praktik
            </p>
          </div>

          <div className="w-full max-w-6xl mx-auto">
            <div className={cn(
              "relative rounded-3xl overflow-hidden shadow-2xl",
              isDarkMode ? "shadow-primary/10" : "shadow-gray-300/50"
            )}>
              {/* Decorative border */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary p-[2px] rounded-3xl">
                <div className={cn(
                  "w-full h-full rounded-3xl",
                  isDarkMode ? "bg-gray-800" : "bg-white"
                )} />
              </div>
              
              <img
                src="/images/Road.png"
                alt="Alur Kerja Praktik"
                className="relative w-full h-auto rounded-3xl"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Beranda;
