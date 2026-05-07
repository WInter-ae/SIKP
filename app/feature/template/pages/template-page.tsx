import { FileText, Download, Search, Eye, FileDown } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { toast } from "sonner";
import {
  getActiveTemplates,
  downloadTemplate,
  type TemplateResponse,
} from "~/lib/services/template.service";
import { useNavigate } from "react-router";
import { useUser } from "~/contexts/user-context";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

export default function TemplatePage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [templates, setTemplates] = useState<TemplateResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Check if user is logged in and fetch templates
  useEffect(() => {
    if (!user) {
      toast.error("Anda harus login terlebih dahulu");
      navigate("/login");
      return;
    }

    fetchTemplates();
  }, [user, navigate]);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await getActiveTemplates();
      if (response.success && response.data) {
        setTemplates(response.data);
      } else {
        toast.error(response.message || "Gagal memuat templates");
      }
    } catch (error: unknown) {
      console.error("Error fetching templates:", error);

      if ((error as Error).message?.includes("Unauthorized")) {
        toast.error("Sesi Anda telah berakhir");
        navigate("/login");
        return;
      }

      toast.error("Terjadi kesalahan saat memuat templates");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (template: TemplateResponse) => {
    try {
      await downloadTemplate(template.id, template.originalName);
      toast.success(`Template "${template.name}" berhasil diunduh.`);
    } catch (error: any) {
      toast.error(error.message || "Gagal mengunduh template");
    }
  };

  const handlePreview = async (template: TemplateResponse) => {
    try {
      await downloadTemplate(template.id, template.originalName, true);
    } catch (error: any) {
      toast.error(error.message || "Gagal memuat pratinjau");
    }
  };

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Define alternating border colors
  const borderColors = [
    "border-l-blue-600",
    "border-l-yellow-300",
    "border-l-red-500",
  ];

  if (!user) return null;

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="relative pb-2">
            <h1 className="text-xl sm:text-3xl font-bold text-foreground">
              Template Surat Kerja Praktik
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Unduh format dokumen resmi yang diperlukan untuk kegiatan Kerja Praktik
            </p>
            <div className="absolute bottom-0 left-0 h-1 w-20 bg-linear-to-r from-blue-600 via-yellow-300 to-red-500 rounded-full" />
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari dokumen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="h-48 animate-pulse bg-muted" />
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <Card className="p-12 flex flex-col items-center justify-center text-center space-y-4 shadow-sm border-dashed">
            <div className="p-4 bg-muted rounded-full">
              <FileDown className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold">Tidak ditemukan template</p>
              <p className="text-sm text-muted-foreground italic">
                {searchQuery ? "Coba gunakan kata kunci pencarian lain" : "Belum ada dokumen yang tersedia saat ini"}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTemplates.map((template, index) => (
              <Card 
                key={template.id} 
                className={`flex flex-col h-full shadow-sm hover:shadow-md transition-all border-l-4 ${borderColors[index % borderColors.length]}`}
              >
                <CardHeader className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-muted rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold leading-tight line-clamp-1">
                      {template.name}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-3 min-h-[3rem]">
                      {template.description || "Gunakan format dokumen ini sesuai dengan ketentuan yang berlaku."}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="flex-grow" />

                <CardFooter className="pt-0">
                  <Button
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 rounded-xl"
                    onClick={() => handleDownload(template)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Unduh Template
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
