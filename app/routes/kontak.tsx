import { useState } from "react";
import { 
  MapPin, 
  ExternalLink, 
  Send, 
  MessageSquare, 
  Mail, 
  Phone,
  Sparkles,
  ArrowRight,
  CheckCircle
} from "lucide-react";

import { cn } from "~/lib/utils";
import { useTheme } from "~/contexts/theme-context";
import Header from "~/components/header";
import Footer from "~/components/footer";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Label } from "~/components/ui/label";

// Types
interface FormData {
  jenisFeedback: string;
  detailPesan: string;
  informasiKontak: string;
}

interface ContactInfoProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  index: number;
}

// Constants
const ORGANIZATION_LOCATION = {
  lat: -2.9761,
  lng: 104.7754,
  name: "Kampus Bukit Palembang",
};

const INITIAL_FORM_DATA: FormData = {
  jenisFeedback: "",
  detailPesan: "",
  informasiKontak: "",
};

// Components
function ContactInfo({ icon, title, value, index }: ContactInfoProps) {
  const { isDarkMode } = useTheme();
  
  return (
    <div 
      className="group flex items-start gap-4 p-4 rounded-xl transition-all duration-300 hover:scale-[1.02]"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Icon with glow */}
      <div className="relative">
        <div className={cn(
          "absolute inset-0 rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300",
          isDarkMode ? "bg-primary/50" : "bg-primary/30"
        )} />
        <div className={cn(
          "relative p-4 rounded-xl transition-all duration-300 group-hover:scale-110",
          isDarkMode 
            ? "bg-gradient-to-br from-gray-700 to-gray-600" 
            : "bg-gradient-to-br from-primary/20 to-secondary/20"
        )}>
          {icon}
        </div>
      </div>
      
      <div className="flex-1">
        <p className={cn(
          "font-semibold text-lg transition-colors duration-300",
          isDarkMode ? "text-white" : "text-gray-900"
        )}>
          {title}
        </p>
        <p className={cn(
          "text-sm mt-1",
          isDarkMode ? "text-gray-400" : "text-gray-600"
        )}>
          {value}
        </p>
      </div>
      
      <ArrowRight className={cn(
        "h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300",
        isDarkMode ? "text-primary" : "text-primary"
      )} />
    </div>
  );
}

function Kontak() {
  const { isDarkMode } = useTheme();
  const [showMap, setShowMap] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${ORGANIZATION_LOCATION.lat},${ORGANIZATION_LOCATION.lng}`;
    window.open(url, "_blank");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    console.log("Form submitted:", formData);
    
    // Reset form after submission
    setTimeout(() => {
      setFormData(INITIAL_FORM_DATA);
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    }, 1000);
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
            "absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl",
            isDarkMode ? "bg-primary/5" : "bg-primary/10"
          )} />
          <div className={cn(
            "absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl",
            isDarkMode ? "bg-secondary/5" : "bg-secondary/10"
          )} />
          <div className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-30",
            isDarkMode ? "bg-gradient-to-r from-primary/10 to-secondary/10" : "bg-gradient-to-r from-primary/5 to-secondary/5"
          )} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Page Header */}
          <div className="text-center mb-16">
            {/* Badge */}
            <div className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6",
              isDarkMode ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"
            )}>
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm font-semibold tracking-wide">Hubungi Kami</span>
            </div>
            
            <h1
              className={cn(
                "text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight",
                isDarkMode ? "text-white" : "text-gray-900"
              )}
            >
              Kami Siap <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Membantu</span>
            </h1>
            <p
              className={cn(
                "text-xl max-w-2xl mx-auto leading-relaxed",
                isDarkMode ? "text-gray-400" : "text-gray-600"
              )}
            >
              Punya pertanyaan atau feedback? Kami senang mendengar dari kamu!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Map Card */}
              <div className="group relative">
                <div className={cn(
                  "absolute -inset-1 rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500",
                  "bg-gradient-to-r from-primary via-secondary to-primary"
                )} />
                
                <Card className={cn(
                  "relative overflow-hidden border-0 rounded-2xl",
                  isDarkMode 
                    ? "bg-gray-800/80 backdrop-blur-xl" 
                    : "bg-white/80 backdrop-blur-xl shadow-xl"
                )}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-3 rounded-xl",
                        isDarkMode 
                          ? "bg-gradient-to-br from-primary/30 to-secondary/30" 
                          : "bg-gradient-to-br from-primary/20 to-secondary/20"
                      )}>
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className={cn(
                          "text-xl",
                          isDarkMode ? "text-white" : ""
                        )}>
                          Lokasi Kami
                        </CardTitle>
                        <CardDescription className={isDarkMode ? "text-gray-400" : ""}>
                          {ORGANIZATION_LOCATION.name}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-3">
                      <Button
                        variant={showMap ? "default" : "outline"}
                        onClick={() => setShowMap(!showMap)}
                        className={cn(
                          "flex-1 rounded-xl transition-all duration-300",
                          showMap && "shadow-lg shadow-primary/25"
                        )}
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        {showMap ? "Sembunyikan" : "Tampilkan Peta"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={openInGoogleMaps}
                        className="flex-1 rounded-xl group/btn"
                      >
                        <ExternalLink className="h-4 w-4 mr-2 group-hover/btn:rotate-12 transition-transform" />
                        Google Maps
                      </Button>
                    </div>

                    <div
                      className={cn(
                        "w-full h-64 rounded-xl overflow-hidden relative transition-all duration-500",
                        isDarkMode ? "bg-gray-700/50" : "bg-gray-100",
                        showMap && "ring-2 ring-primary/50"
                      )}
                    >
                      {!showMap ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                          <div className="relative">
                            <div className="absolute inset-0 animate-ping">
                              <MapPin className="h-12 w-12 text-primary/30" />
                            </div>
                            <MapPin className={cn(
                              "h-12 w-12 relative",
                              isDarkMode ? "text-gray-500" : "text-primary/50"
                            )} />
                          </div>
                          <span className={cn(
                            "text-sm font-medium",
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          )}>
                            Klik tombol untuk melihat peta
                          </span>
                        </div>
                      ) : (
                        <iframe
                          src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.5!2d${ORGANIZATION_LOCATION.lng}!3d${ORGANIZATION_LOCATION.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMsKwNTgnMzUuOCJTIDEwNMKwNDYnMzIuNiJF!5e0!3m2!1sen!2sid!4v1234567890`}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Organization Location Map"
                          className="rounded-xl"
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Info Card */}
              <div className="group relative">
                <div className={cn(
                  "absolute -inset-1 rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500",
                  "bg-gradient-to-r from-secondary via-primary to-secondary"
                )} />
                
                <Card className={cn(
                  "relative border-0 rounded-2xl overflow-hidden",
                  isDarkMode 
                    ? "bg-gray-800/80 backdrop-blur-xl" 
                    : "bg-white/80 backdrop-blur-xl shadow-xl"
                )}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-3 rounded-xl",
                        isDarkMode 
                          ? "bg-gradient-to-br from-secondary/30 to-primary/30" 
                          : "bg-gradient-to-br from-secondary/20 to-primary/20"
                      )}>
                        <Sparkles className="h-6 w-6 text-secondary" />
                      </div>
                      <CardTitle className={cn(
                        "text-xl",
                        isDarkMode ? "text-white" : ""
                      )}>
                        Informasi Kontak
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-4">
                    <ContactInfo
                      icon={<Mail className="h-5 w-5 text-primary" />}
                      title="Email"
                      value="info@sikp.ac.id"
                      index={0}
                    />
                    <ContactInfo
                      icon={<Phone className="h-5 w-5 text-primary" />}
                      title="Telepon"
                      value="+62 711 123456"
                      index={1}
                    />
                    <ContactInfo
                      icon={<MapPin className="h-5 w-5 text-primary" />}
                      title="Alamat"
                      value="Jl. Srijaya Negara, Bukit Besar, Palembang"
                      index={2}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Form */}
            <div className="group relative">
              <div className={cn(
                "absolute -inset-1 rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500",
                "bg-gradient-to-r from-primary via-secondary to-primary"
              )} />
              
              <Card className={cn(
                "relative border-0 rounded-2xl h-full",
                isDarkMode 
                  ? "bg-gray-800/80 backdrop-blur-xl" 
                  : "bg-white/80 backdrop-blur-xl shadow-xl"
              )}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-4 rounded-2xl",
                      isDarkMode 
                        ? "bg-gradient-to-br from-primary/30 to-secondary/30" 
                        : "bg-gradient-to-br from-primary/20 to-secondary/20"
                    )}>
                      <MessageSquare className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <CardTitle className={cn(
                        "text-2xl",
                        isDarkMode ? "text-white" : ""
                      )}>
                        Kirim Pesan
                      </CardTitle>
                      <CardDescription className={cn(
                        "text-base mt-1",
                        isDarkMode ? "text-gray-400" : ""
                      )}>
                        Isi form di bawah untuk mengirim feedback
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label 
                        htmlFor="jenisFeedback"
                        className={cn(
                          "text-sm font-semibold",
                          isDarkMode ? "text-white" : ""
                        )}
                      >
                        Jenis Feedback
                      </Label>
                      <Input
                        id="jenisFeedback"
                        name="jenisFeedback"
                        value={formData.jenisFeedback}
                        onChange={handleChange}
                        placeholder="Contoh: Saran, Keluhan, Pertanyaan"
                        className={cn(
                          "h-12 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-primary/50",
                          isDarkMode 
                            ? "bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400" 
                            : "bg-gray-50/50 border-gray-200"
                        )}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label 
                        htmlFor="detailPesan"
                        className={cn(
                          "text-sm font-semibold",
                          isDarkMode ? "text-white" : ""
                        )}
                      >
                        Detail Pesan
                      </Label>
                      <Textarea
                        id="detailPesan"
                        name="detailPesan"
                        value={formData.detailPesan}
                        onChange={handleChange}
                        placeholder="Tuliskan pesan atau feedback kamu di sini..."
                        rows={5}
                        className={cn(
                          "rounded-xl transition-all duration-300 focus:ring-2 focus:ring-primary/50 resize-none",
                          isDarkMode 
                            ? "bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400" 
                            : "bg-gray-50/50 border-gray-200"
                        )}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label 
                        htmlFor="informasiKontak"
                        className={cn(
                          "text-sm font-semibold",
                          isDarkMode ? "text-white" : ""
                        )}
                      >
                        Informasi Kontak
                      </Label>
                      <Input
                        id="informasiKontak"
                        name="informasiKontak"
                        value={formData.informasiKontak}
                        onChange={handleChange}
                        placeholder="Email atau nomor telepon"
                        className={cn(
                          "h-12 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-primary/50",
                          isDarkMode 
                            ? "bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400" 
                            : "bg-gray-50/50 border-gray-200"
                        )}
                        required
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className={cn(
                        "w-full h-14 rounded-xl font-semibold text-lg transition-all duration-300",
                        "bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02]",
                        isSuccess && "bg-gradient-to-r from-green-500 to-emerald-500"
                      )}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Mengirim...
                        </div>
                      ) : isSuccess ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          Terkirim!
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Send className="h-5 w-5" />
                          Kirim Feedback
                        </div>
                      )}
                    </Button>
                  </form>
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

export default Kontak;
