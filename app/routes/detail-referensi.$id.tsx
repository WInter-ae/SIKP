import { useNavigate, useParams } from "react-router";
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Users, 
  Calendar,
  Building2,
  ExternalLink
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
  location: {
    lat: -2.9761,
    lng: 104.7754,
    address: "Jl. Jendral Sudirman No. 123, Palembang",
  },
  images: ["/images/company-1.jpg", "/images/company-2.jpg", "/images/company-3.jpg"],
};

// Components
interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  isDarkMode: boolean;
}

function InfoItem({ icon, label, value, isDarkMode }: InfoItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        "p-2 rounded-lg",
        isDarkMode ? "bg-gray-700" : "bg-primary/10"
      )}>
        {icon}
      </div>
      <div>
        <p className={cn(
          "text-xs",
          isDarkMode ? "text-gray-400" : "text-gray-500"
        )}>
          {label}
        </p>
        <p className={cn(
          "font-semibold",
          isDarkMode ? "text-white" : "text-gray-900"
        )}>
          {value}
        </p>
      </div>
    </div>
  );
}

function DetailReferensi() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isDarkMode } = useTheme();

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
          "py-20 min-h-[calc(100vh-300px)] transition-colors duration-300",
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        )}
      >
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={handleBack}
            className={cn(
              "mb-6 -ml-2",
              isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
            )}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Referensi
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Image Gallery */}
            <Card
              className={cn(
                "overflow-hidden border-0",
                isDarkMode ? "bg-gray-800" : "bg-white shadow-lg"
              )}
            >
              <CardContent className="p-0">
                <div className="relative aspect-[4/3]">
                  {/* Image Placeholder */}
                  <div
                    className={cn(
                      "absolute inset-0 flex items-center justify-center",
                      isDarkMode 
                        ? "bg-gradient-to-br from-gray-700 to-gray-600" 
                        : "bg-gradient-to-br from-primary to-secondary"
                    )}
                  >
                    <div className="text-center text-white">
                      <Building2 className="h-16 w-16 mx-auto mb-4 opacity-80" />
                      <p className="text-xl font-semibold">Gambar Instansi</p>
                    </div>
                  </div>

                  {/* Navigation Arrows */}
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white shadow-lg"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white shadow-lg"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>

                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {[1, 2, 3].map((_, index) => (
                      <div
                        key={index}
                        className={cn(
                          "h-2 rounded-full transition-all",
                          index === 0 ? "w-6 bg-white" : "w-2 bg-white/50"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Side - Details */}
            <div className="space-y-6">
              {/* Main Info Card */}
              <Card
                className={cn(
                  "border-0",
                  isDarkMode ? "bg-gray-800" : "bg-white shadow-lg"
                )}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="mb-3">{ORGANIZATION_DATA.category}</Badge>
                      <CardTitle
                        className={cn(
                          "text-2xl md:text-3xl",
                          isDarkMode ? "text-white" : ""
                        )}
                      >
                        {ORGANIZATION_DATA.name}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <CardDescription
                    className={cn(
                      "text-base leading-relaxed",
                      isDarkMode ? "text-gray-300" : ""
                    )}
                  >
                    {ORGANIZATION_DATA.description}
                  </CardDescription>

                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem
                      icon={<Users className="h-4 w-4 text-primary" />}
                      label="Total Mahasiswa KP"
                      value={`${ORGANIZATION_DATA.studentCount} Mahasiswa`}
                      isDarkMode={isDarkMode}
                    />
                    <InfoItem
                      icon={<Calendar className="h-4 w-4 text-primary" />}
                      label="Bekerja Sama Sejak"
                      value={ORGANIZATION_DATA.partnerSince}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Location Card */}
              <Card
                className={cn(
                  "border-0",
                  isDarkMode ? "bg-gray-800" : "bg-white shadow-lg"
                )}
              >
                <CardHeader>
                  <CardTitle className={isDarkMode ? "text-white" : ""}>
                    Lokasi
                  </CardTitle>
                  <CardDescription className={isDarkMode ? "text-gray-400" : ""}>
                    {ORGANIZATION_DATA.location.address}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    onClick={openInGoogleMaps}
                    className="w-full"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Lihat di Google Maps
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>

                  <div
                    className={cn(
                      "w-full aspect-video rounded-lg overflow-hidden relative",
                      isDarkMode ? "bg-gray-700" : "bg-gray-200"
                    )}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <MapPin
                        className={cn(
                          "h-12 w-12",
                          isDarkMode ? "text-gray-500" : "text-gray-400"
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        )}
                      >
                        Preview Peta
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default DetailReferensi;
