"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useUser } from "~/contexts/user-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { FileText, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { GenerateTemplateDialog } from "../components/generate-template-dialog";
import {
  getActiveTemplates,
  downloadTemplate,
  type TemplateResponse,
} from "~/lib/services/template-api";

export default function TemplatePage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [templates, setTemplates] = useState<TemplateResponse[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateResponse | null>(null);
  const [isGenerateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleDownloadTemplate = async (template: TemplateResponse) => {
    try {
      await downloadTemplate(template.id, template.originalName);
      toast.success(`Template "${template.name}" berhasil didownload.`);
    } catch (error: unknown) {
      console.error("Error downloading template:", error);
      
      if (
        (error as Error).message?.includes("Forbidden") ||
        (error as Error).message?.includes("Unauthorized")
      ) {
        toast.error("Anda tidak memiliki akses untuk mendownload template");
        return;
      }
      
      toast.error("Gagal mendownload template");
    }
  };

  const handleGenerateClick = (template: TemplateResponse) => {
    setSelectedTemplate(template);
    setGenerateDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Template Surat Kerja Praktik
          </h1>
          <p className="text-muted-foreground">Memuat templates...</p>
        </div>
      </div>
    );
  }

  // Show message if user is not logged in
  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Template Surat Kerja Praktik
        </h1>
        <p className="text-muted-foreground">
          Unduh atau generate template surat yang diperlukan untuk kerja praktik
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {templates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Belum ada template yang tersedia
            </p>
          </div>
        ) : (
          templates.map((template) => (
            <Card key={template.id} className="flex flex-col">
              <CardHeader className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-emerald-700" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {template.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-grow" />
              <CardFooter className="flex flex-col space-y-2">
                {template.type === "Generate & Template" && (
                  <Button
                    onClick={() => handleGenerateClick(template)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Otomatis
                  </Button>
                )}
                <Button
                  variant="secondary"
                  className="bg-gray-200 text-black w-full hover:bg-gray-300"
                  onClick={() => handleDownloadTemplate(template)}
                >
                  <Download className=" h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      <GenerateTemplateDialog
        template={selectedTemplate}
        open={isGenerateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
      />
    </div>
  );
}
