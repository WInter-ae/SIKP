import { useState } from "react";
import { MapPin, ExternalLink, Send, MessageSquare, Mail, Phone } from "lucide-react";

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
function ContactInfo({ icon, title, value }: ContactInfoProps) {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="flex items-start gap-4">
      <div className={cn(
        "p-3 rounded-lg",
        isDarkMode ? "bg-gray-700" : "bg-primary/10"
      )}>
        {icon}
      </div>
      <div>
        <p className={cn(
          "font-medium",
          isDarkMode ? "text-white" : "text-gray-900"
        )}>
          {title}
        </p>
        <p className={cn(
          "text-sm",
          isDarkMode ? "text-gray-400" : "text-gray-600"
        )}>
          {value}
        </p>
      </div>
    </div>
  );
}

function Kontak() {
  const { isDarkMode } = useTheme();
  const [showMap, setShowMap] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    }, 1000);
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
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1
              className={cn(
                "text-4xl md:text-5xl font-bold mb-4 transition-colors duration-300",
                isDarkMode ? "text-white" : "text-gray-900"
              )}
            >
              Hubungi Kami
            </h1>
            <p
              className={cn(
                "text-lg max-w-2xl mx-auto",
                isDarkMode ? "text-gray-400" : "text-gray-600"
              )}
            >
              Punya pertanyaan atau feedback? Kami senang mendengar dari kamu!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Map Section */}
            <div className="space-y-6">
              <Card className={cn(
                "overflow-hidden",
                isDarkMode ? "bg-gray-800 border-gray-700" : ""
              )}>
                <CardHeader>
                  <CardTitle className={isDarkMode ? "text-white" : ""}>
                    Lokasi Kami
                  </CardTitle>
                  <CardDescription className={isDarkMode ? "text-gray-400" : ""}>
                    {ORGANIZATION_LOCATION.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <Button
                      variant={showMap ? "default" : "outline"}
                      onClick={() => setShowMap(!showMap)}
                      className="flex-1"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      {showMap ? "Sembunyikan Peta" : "Tampilkan Peta"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={openInGoogleMaps}
                      className="flex-1"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Google Maps
                    </Button>
                  </div>

                  <div
                    className={cn(
                      "w-full h-64 rounded-lg overflow-hidden relative transition-all duration-300",
                      isDarkMode ? "bg-gray-700" : "bg-gray-200"
                    )}
                  >
                    {!showMap ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <MapPin className={cn(
                          "h-12 w-12",
                          isDarkMode ? "text-gray-500" : "text-gray-400"
                        )} />
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
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info Cards */}
              <Card className={cn(
                isDarkMode ? "bg-gray-800 border-gray-700" : ""
              )}>
                <CardHeader>
                  <CardTitle className={isDarkMode ? "text-white" : ""}>
                    Informasi Kontak
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ContactInfo
                    icon={<Mail className={cn("h-5 w-5", isDarkMode ? "text-primary" : "text-primary")} />}
                    title="Email"
                    value="info@sikp.ac.id"
                  />
                  <ContactInfo
                    icon={<Phone className={cn("h-5 w-5", isDarkMode ? "text-primary" : "text-primary")} />}
                    title="Telepon"
                    value="+62 711 123456"
                  />
                  <ContactInfo
                    icon={<MapPin className={cn("h-5 w-5", isDarkMode ? "text-primary" : "text-primary")} />}
                    title="Alamat"
                    value="Jl. Srijaya Negara, Bukit Besar, Palembang"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <Card className={cn(
              isDarkMode ? "bg-gray-800 border-gray-700" : ""
            )}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    isDarkMode ? "bg-gray-700" : "bg-primary/10"
                  )}>
                    <MessageSquare className={cn(
                      "h-6 w-6",
                      isDarkMode ? "text-primary" : "text-primary"
                    )} />
                  </div>
                  <div>
                    <CardTitle className={isDarkMode ? "text-white" : ""}>
                      Form Feedback
                    </CardTitle>
                    <CardDescription className={isDarkMode ? "text-gray-400" : ""}>
                      Kirimkan pesan atau feedback kepada kami
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label 
                      htmlFor="jenisFeedback"
                      className={isDarkMode ? "text-white" : ""}
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
                        isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder:text-gray-400" : ""
                      )}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label 
                      htmlFor="detailPesan"
                      className={isDarkMode ? "text-white" : ""}
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
                        isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder:text-gray-400" : ""
                      )}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label 
                      htmlFor="informasiKontak"
                      className={isDarkMode ? "text-white" : ""}
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
                        isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder:text-gray-400" : ""
                      )}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>Mengirim...</>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Kirim Feedback
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Kontak;
