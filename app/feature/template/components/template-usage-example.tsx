/**
 * Example: Template Usage Component
 * 
 * Contoh komponen yang menunjukkan bagaimana menggunakan template
 * untuk generate dokumen dengan data mahasiswa
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { toast } from "sonner";
import { Download, FileText } from "lucide-react";
import { 
  getTemplates, 
  renderTemplate, 
  extractTemplateVariables,
  downloadTemplate 
} from "../services/template.service";
import type { Template, TemplateType } from "../types/template.types";

/**
 * Example Usage: Generate Berita Acara dari Template
 */
export function TemplateUsageExample() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateVariables, setTemplateVariables] = useState<string[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generatedContent, setGeneratedContent] = useState<string>("");

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await getTemplates();
      setTemplates(data.filter(t => t.isActive));
    } catch (error) {
      toast.error("Gagal memuat template");
    }
  };

  // When template selected, extract variables
  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    setSelectedTemplate(template);
    
    // Extract variables from template
    const variables = extractTemplateVariables(template.content);
    setTemplateVariables(variables);
    
    // Initialize form data with empty strings
    const initialData: Record<string, string> = {};
    variables.forEach(v => initialData[v] = "");
    setFormData(initialData);
    setGeneratedContent("");
  };

  // Update form data
  const handleInputChange = (variable: string, value: string) => {
    setFormData(prev => ({ ...prev, [variable]: value }));
  };

  // Generate document from template
  const handleGenerate = () => {
    if (!selectedTemplate) {
      toast.error("Pilih template terlebih dahulu");
      return;
    }

    // Check if all required fields are filled
    const emptyFields = templateVariables.filter(v => !formData[v]?.trim());
    if (emptyFields.length > 0) {
      toast.error(`Mohon isi semua field: ${emptyFields.join(", ")}`);
      return;
    }

    // Render template with data
    const content = renderTemplate(selectedTemplate, formData);
    setGeneratedContent(content);
    toast.success("Dokumen berhasil digenerate!");
  };

  // Download generated document
  const handleDownload = () => {
    if (!selectedTemplate || !generatedContent) return;

    const blob = new Blob([generatedContent], { 
      type: selectedTemplate.fileExtension === "html" ? "text/html" : "text/plain" 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedTemplate.name}_generated.${selectedTemplate.fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Dokumen berhasil didownload");
  };

  // Format variable name for display
  const formatVariableName = (variable: string): string => {
    return variable
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Dokumen dari Template</CardTitle>
          <CardDescription>
            Pilih template dan isi data untuk generate dokumen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Selection */}
          <div className="space-y-2">
            <Label htmlFor="template">Pilih Template</Label>
            <Select onValueChange={handleTemplateSelect}>
              <SelectTrigger id="template">
                <SelectValue placeholder="Pilih template..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {template.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dynamic Form based on template variables */}
          {selectedTemplate && templateVariables.length > 0 && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold">Isi Data Dokumen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templateVariables.map((variable) => (
                  <div key={variable} className="space-y-2">
                    <Label htmlFor={variable}>
                      {formatVariableName(variable)}
                    </Label>
                    <Input
                      id={variable}
                      placeholder={`Masukkan ${formatVariableName(variable).toLowerCase()}...`}
                      value={formData[variable] || ""}
                      onChange={(e) => handleInputChange(variable, e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <Button onClick={handleGenerate} className="w-full">
                Generate Dokumen
              </Button>
            </div>
          )}

          {/* Preview Generated Content */}
          {generatedContent && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Preview Dokumen</h3>
                <Button onClick={handleDownload} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              <div className="border rounded-lg p-4 bg-white max-h-96 overflow-auto">
                {selectedTemplate?.fileExtension === "html" ? (
                  <div dangerouslySetInnerHTML={{ __html: generatedContent }} />
                ) : (
                  <pre className="text-sm whitespace-pre-wrap">{generatedContent}</pre>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Example: Usage di dalam halaman lain (misalnya untuk generate berita acara sidang)
 */
export function GenerateBeritaAcara({ mahasiswaData }: { mahasiswaData: any }) {
  const handleGenerate = async () => {
    try {
      // 1. Load template berita acara
      const templates = await getTemplates();
      const beritaAcaraTemplate = templates.find(t => t.type === "berita-acara" && t.isActive);
      
      if (!beritaAcaraTemplate) {
        toast.error("Template Berita Acara tidak ditemukan");
        return;
      }

      // 2. Prepare data
      const data = {
        tanggal: new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric"
        }),
        nama_mahasiswa: mahasiswaData.nama,
        nim: mahasiswaData.nim,
        judul: mahasiswaData.judulKP,
        nama_penguji: mahasiswaData.penguji,
        nilai: mahasiswaData.nilai,
      };

      // 3. Render template
      const content = renderTemplate(beritaAcaraTemplate, data);

      // 4. Download or save
      const blob = new Blob([content], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Berita_Acara_${mahasiswaData.nim}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Berita Acara berhasil digenerate!");
    } catch (error) {
      toast.error("Gagal generate Berita Acara");
    }
  };

  return (
    <Button onClick={handleGenerate}>
      <FileText className="h-4 w-4 mr-2" />
      Generate Berita Acara
    </Button>
  );
}
