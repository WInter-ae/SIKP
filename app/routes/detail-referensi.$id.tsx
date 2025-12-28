import { useNavigate, useParams } from "react-router";
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Users, 
  Calendar,
  Building2,
  ExternalLink,
  Sparkles,
  Star,
  Award,
  Clock,
  CheckCircle2
} from "lucide-react";

import { cn } from "~/lib/utils";
import { useTheme } from "~/contexts/theme-context";
import Header from "~/components/header";
import Footer from "~/components/footer";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

// Types
interface OrganizationDetail {
  id: string;
  name: string;
  description: string;
  category: string;
  studentCount: number;
  partnerSince: number;
  rating: number;
  highlights: string[];
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  images: string[];
}

// Mock data - in real app this would come from API
const ORGANIZATION_DATA: OrganizationDetail = {
  id: "1",
  name: "PT. Cinta Sejati",
  description: "PT. Cinta Sejati adalah perusahaan teknologi yang bergerak di bidang pengembangan perangkat lunak dan solusi digital. Dengan pengalaman lebih dari 10 tahun, kami telah membantu berbagai perusahaan dalam transformasi digital mereka. Kami menyediakan lingkungan kerja yang kondusif bagi mahasiswa untuk belajar dan berkembang.",
  category: "Teknologi",
  studentCount: 10,
  partnerSince: 2023,
  rating: 4.8,
  highlights: [
    "Lingkungan kerja profesional",
    "Mentor berpengalaman",
    "Proyek nyata",
    "Sertifikat resmi"
  ],
  location: {
    lat: -2.9761,
    lng: 104.7754,
    address: "Jl. Jendral Sudirman No. 123, Palembang",
  },
  images: ["/images/company-1.jpg", "/images/company-2.jpg", "/images/company-3.jpg"],
};

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
  "Teknologi": "from-blue-500 to-cyan-500",
  "Pemerintahan": "from-emerald-500 to-teal-500",
  "Telekomunikasi": "from-purple-500 to-pink-500",
  "Perbankan": "from-amber-500 to-orange-500",
};

// Components
interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  isDarkMode: boolean;
  gradient?: string;
}

function InfoItem({ icon, label, value, isDarkMode, gradient = "from-primary to-secondary" }: InfoItemProps) {
  return (
    <div className="group flex items-center gap-4">
      <div className="relative">
        <div className={cn(
          "absolute inset-0 rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500",
          `bg-gradient-to-br ${gradient}`
        )} />
        <div className={cn(
          "relative p-3 rounded-xl transition-all duration-300 group-hover:scale-110",
          `bg-gradient-to-br ${gradient}`
        )}>
          {icon}
        </div>
      </div>
      <div>
        <p className={cn(
          "text-xs font-medium uppercase tracking-wider",
          isDarkMode ? "text-gray-400" : "text-gray-500"
        )}>
          {label}
        </p>
        <p className={cn(
          "font-bold text-lg",
          isDarkMode ? "text-white" : "text-gray-900"
        )}>
          {value}
        </p>
      </div>
    </div>
  );
}

interface StatBadgeProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  gradient: string;
  isDarkMode: boolean;
}

function StatBadge({ icon, value, label, gradient, isDarkMode }: StatBadgeProps) {
  return (
    <div className="group relative">
      <div className={cn(
        "absolute -inset-1 rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-500",
        `bg-gradient-to-br ${gradient}`
      )} />
      <div className={cn(
        "relative flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300 group-hover:scale-105",
        isDarkMode 
          ? "bg-gray-700/80 backdrop-blur-xl" 
          : "bg-white/80 backdrop-blur-xl shadow-lg"
      )}>
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          `bg-gradient-to-br ${gradient}`
        )}>
          {icon}
        </div>
        <div>
          <p className={cn(
            "font-bold text-lg",
            isDarkMode ? "text-white" : "text-gray-900"
          )}>
            {value}
          </p>
          <p className={cn(
            "text-xs font-medium",
            isDarkMode ? "text-gray-400" : "text-gray-500"
          )}>
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailReferensi() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isDarkMode } = useTheme();
  
  const gradientColor = CATEGORY_COLORS[ORGANIZATION_DATA.category] || "from-gray-500 to-gray-600";

  const handleBack = () => {
    navigate("/referensi");
  };

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${ORGANIZATION_DATA.location.lat},${ORGANIZATION_DATA.location.lng}`;
    window.open(url, "_blank");
  };

  return (
    <>
      <Header />

      <section
        className={cn(
          "py-24 min-h-[calc(100vh-300px)] transition-colors duration-300 relative overflow-hidden",
          isDarkMode ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 via-white to-gray-50"
        )}
      >
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={cn(
            "absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl",
            isDarkMode ? "bg-primary/5" : "bg-primary/10"
          )} />
          <div className={cn(
            "absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl",
            isDarkMode ? "bg-secondary/5" : "bg-secondary/10"
          )} />
          
          {/* Floating elements */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float opacity-10"
              style={{
                left: `${10 + i * 15}%`,
                top: `${10 + (i % 3) * 30}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${4 + i * 0.5}s`
              }}
            >
              <Sparkles className={cn(
                "h-6 w-6",
                isDarkMode ? "text-primary" : "text-primary"
              )} />
            </div>
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={handleBack}
            className={cn(
              "mb-8 -ml-2 group",
              isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
            )}
          >
            <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Kembali ke Referensi
          </Button>

          {/* Stats Bar */}
          <div className="flex flex-wrap gap-4 mb-10">
            <StatBadge
              icon={<Users className="h-5 w-5 text-white" />}
              value={`${ORGANIZATION_DATA.studentCount}+`}
              label="Mahasiswa KP"
              gradient="from-blue-500 to-cyan-600"
              isDarkMode={isDarkMode}
            />
            <StatBadge
              icon={<Star className="h-5 w-5 text-white" />}
              value={ORGANIZATION_DATA.rating}
              label="Rating"
              gradient="from-amber-500 to-orange-600"
              isDarkMode={isDarkMode}
            />
            <StatBadge
              icon={<Clock className="h-5 w-5 text-white" />}
              value={`Sejak ${ORGANIZATION_DATA.partnerSince}`}
              label="Partner"
              gradient="from-emerald-500 to-teal-600"
              isDarkMode={isDarkMode}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left Side - Image Gallery */}
            <div className="group relative">
              <div className={cn(
                "absolute -inset-2 rounded-[2rem] blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500",
                `bg-gradient-to-r ${gradientColor}`
              )} />
              
              <Card
                className={cn(
                  "relative overflow-hidden border-0 rounded-[2rem]",
                  isDarkMode 
                    ? "bg-gray-800/80 backdrop-blur-xl" 
                    : "bg-white/80 backdrop-blur-xl shadow-2xl"
                )}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-[4/3]">
                    {/* Image Placeholder */}
                    <div
                      className={cn(
                        "absolute inset-0 flex items-center justify-center",
                        `bg-gradient-to-br ${gradientColor}`
                      )}
                    >
                      <div className="text-center text-white">
                        <div className="relative">
                          <div className="absolute inset-0 animate-ping">
                            <Building2 className="h-20 w-20 mx-auto opacity-30" />
                          </div>
                          <Building2 className="h-20 w-20 mx-auto mb-4 relative" />
                        </div>
                        <p className="text-2xl font-bold">Gambar Instansi</p>
                        <p className="text-white/70 mt-2">Preview tidak tersedia</p>
                      </div>
                    </div>

                    {/* Navigation Arrows with glassmorphism */}
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 backdrop-blur-xl hover:bg-white/40 border-0 shadow-2xl transition-all duration-300 hover:scale-110"
                    >
                      <ChevronLeft className="h-5 w-5 text-white" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 backdrop-blur-xl hover:bg-white/40 border-0 shadow-2xl transition-all duration-300 hover:scale-110"
                    >
                      <ChevronRight className="h-5 w-5 text-white" />
                    </Button>

                    {/* Image Indicators */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-black/30 backdrop-blur-xl px-4 py-2 rounded-full">
                      {[1, 2, 3].map((_, index) => (
                        <div
                          key={index}
                          className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            index === 0 ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/70 cursor-pointer"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Details */}
            <div className="space-y-8">
              {/* Main Info Card */}
              <div className="group relative">
                <div className={cn(
                  "absolute -inset-1 rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500",
                  `bg-gradient-to-r ${gradientColor}`
                )} />
                
                <Card
                  className={cn(
                    "relative border-0 rounded-3xl overflow-hidden",
                    isDarkMode 
                      ? "bg-gray-800/80 backdrop-blur-xl" 
                      : "bg-white/80 backdrop-blur-xl shadow-xl"
                  )}
                >
                  {/* Gradient accent */}
                  <div className={cn(
                    "absolute top-0 left-0 right-0 h-1.5",
                    `bg-gradient-to-r ${gradientColor}`
                  )} />
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge className={cn(
                          "mb-4 font-semibold border-0",
                          `bg-gradient-to-r ${gradientColor} text-white`
                        )}>
                          {ORGANIZATION_DATA.category}
                        </Badge>
                        <CardTitle
                          className={cn(
                            "text-3xl md:text-4xl font-black",
                            isDarkMode ? "text-white" : ""
                          )}
                        >
                          {ORGANIZATION_DATA.name}
                        </CardTitle>
                      </div>
                      
                      {/* Award badge */}
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center",
                        `bg-gradient-to-br ${gradientColor}`
                      )}>
                        <Award className="h-7 w-7 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <CardDescription
                      className={cn(
                        "text-base leading-relaxed",
                        isDarkMode ? "text-gray-300" : ""
                      )}
                    >
                      {ORGANIZATION_DATA.description}
                    </CardDescription>

                    {/* Highlights */}
                    <div className={cn(
                      "p-5 rounded-2xl",
                      isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
                    )}>
                      <h4 className={cn(
                        "font-bold mb-4 flex items-center gap-2",
                        isDarkMode ? "text-white" : "text-gray-900"
                      )}>
                        <Sparkles className="h-5 w-5 text-primary" />
                        Keunggulan
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {ORGANIZATION_DATA.highlights.map((highlight, index) => (
                          <div 
                            key={index}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                            <span className={cn(
                              "text-sm font-medium",
                              isDarkMode ? "text-gray-300" : "text-gray-600"
                            )}>
                              {highlight}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <InfoItem
                        icon={<Users className="h-5 w-5 text-white" />}
                        label="Total Mahasiswa KP"
                        value={`${ORGANIZATION_DATA.studentCount} Mahasiswa`}
                        isDarkMode={isDarkMode}
                        gradient="from-blue-500 to-cyan-600"
                      />
                      <InfoItem
                        icon={<Calendar className="h-5 w-5 text-white" />}
                        label="Bekerja Sama Sejak"
                        value={ORGANIZATION_DATA.partnerSince}
                        isDarkMode={isDarkMode}
                        gradient="from-purple-500 to-pink-600"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Location Card */}
              <div className="group relative">
                <div className={cn(
                  "absolute -inset-1 rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500",
                  "bg-gradient-to-r from-emerald-500 to-teal-500"
                )} />
                
                <Card
                  className={cn(
                    "relative border-0 rounded-3xl overflow-hidden",
                    isDarkMode 
                      ? "bg-gray-800/80 backdrop-blur-xl" 
                      : "bg-white/80 backdrop-blur-xl shadow-xl"
                  )}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className={cn(
                          "text-xl",
                          isDarkMode ? "text-white" : ""
                        )}>
                          Lokasi
                        </CardTitle>
                        <CardDescription className={isDarkMode ? "text-gray-400" : ""}>
                          {ORGANIZATION_DATA.location.address}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div
                      className={cn(
                        "w-full aspect-video rounded-2xl overflow-hidden relative",
                        isDarkMode ? "bg-gray-700" : "bg-gray-100"
                      )}
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                        <div className="relative">
                          <div className="absolute inset-0 animate-ping">
                            <MapPin className="h-12 w-12 text-emerald-500/30" />
                          </div>
                          <MapPin className="h-12 w-12 text-emerald-500 relative" />
                        </div>
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          )}
                        >
                          Preview Peta
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={openInGoogleMaps}
                      className={cn(
                        "w-full h-14 text-base font-semibold rounded-2xl border-0 transition-all duration-300 hover:scale-[1.02]",
                        "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl"
                      )}
                    >
                      <MapPin className="h-5 w-5 mr-2" />
                      Lihat di Google Maps
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default DetailReferensi;
