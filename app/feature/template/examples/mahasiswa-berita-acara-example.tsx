/**
 * EXAMPLE: Implementasi Dynamic Form di Halaman Mahasiswa
 * 
 * Contoh bagaimana mahasiswa mengisi form yang otomatis menyesuaikan
 * dengan perubahan template yang dilakukan admin
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { DynamicFormFromTemplate } from "~/feature/template/components/dynamic-form-from-template";
import { getTemplates, renderTemplate } from "~/feature/template/services/template.service";
import type { Template } from "~/feature/template/types/template.types";
import { toast } from "sonner";
import { FileText, Download } from "lucide-react";

/**
 * Halaman Mahasiswa untuk Generate Berita Acara
 * Form otomatis menyesuaikan dengan template yang dikonfigurasi admin
 */
export function MahasiswaBeritaAcaraPage() {
  const [template, setTemplate] = useState<Template | null>(null);
  const [generatedDocument, setGeneratedDocument] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplate();
  }, []);

  const loadTemplate = async () => {
    try {
      const templates = await getTemplates();
      // Get active Berita Acara template
      const beritaAcaraTemplate = templates.find(
        t => t.type === "berita-acara" && t.isActive
      );
      
      if (!beritaAcaraTemplate) {
        toast.error("Template Berita Acara belum tersedia");
        return;
      }
      
      setTemplate(beritaAcaraTemplate);
    } catch (error) {
      toast.error("Gagal memuat template");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (formData: Record<string, string>) => {
    if (!template) return;

    // Render template dengan data dari form
    const document = renderTemplate(template, formData);
    setGeneratedDocument(document);
    
    toast.success("Berita Acara berhasil digenerate!");
  };

  const handleDownload = () => {
    if (!generatedDocument || !template) return;

    const blob = new Blob([generatedDocument], { 
      type: template.fileExtension === "html" ? "text/html" : "text/plain" 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Berita_Acara_${new Date().toISOString().split('T')[0]}.${template.fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Dokumen berhasil didownload");
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Memuat template...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">Template Berita Acara belum tersedia</p>
            <p className="text-sm text-muted-foreground">Hubungi admin untuk mengaktifkan template</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generate Berita Acara</h1>
        <p className="text-muted-foreground">
          Isi form di bawah untuk generate Berita Acara sidang KP
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Isi Data</CardTitle>
            <CardDescription>
              Form ini otomatis menyesuaikan dengan template yang dikonfigurasi admin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DynamicFormFromTemplate
              fields={template.fields}
              onSubmit={handleSubmit}
              submitButtonText="Generate Berita Acara"
            />
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Preview Dokumen</CardTitle>
                <CardDescription>
                  {generatedDocument ? "Dokumen siap didownload" : "Isi form untuk melihat preview"}
                </CardDescription>
              </div>
              {generatedDocument && (
                <Button onClick={handleDownload} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {generatedDocument ? (
              <div className="border rounded-lg p-4 bg-white max-h-[600px] overflow-auto">
                {template.fileExtension === "html" ? (
                  <div dangerouslySetInnerHTML={{ __html: generatedDocument }} />
                ) : (
                  <pre className="text-sm whitespace-pre-wrap">{generatedDocument}</pre>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center border rounded-lg p-12 bg-muted/50">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Preview akan muncul setelah form diisi
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Template Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Informasi Template</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Nama Template</dt>
              <dd className="font-medium">{template.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Versi</dt>
              <dd className="font-medium">v{template.version}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Format</dt>
              <dd className="font-medium uppercase">{template.fileExtension}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Terakhir Diupdate</dt>
              <dd className="font-medium">
                {new Date(template.updatedAt).toLocaleDateString("id-ID")}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * KEUNTUNGAN SISTEM INI:
 * 
 * 1. ADMIN mengubah template dan field configuration
 *    - Edit template content di Monaco Editor
 *    - Tambah/ubah/hapus variable (misalnya tambah {{email}})
 *    - Konfigurasi field metadata (label, type, required, dll)
 *    - Save template
 * 
 * 2. FORM MAHASISWA OTOMATIS UPDATE
 *    - Tidak perlu deploy ulang
 *    - Tidak perlu edit code
 *    - Form langsung muncul field baru
 *    - Validasi otomatis sesuai configuration
 * 
 * 3. KONSISTEN DI SEMUA HALAMAN
 *    - Berita Acara
 *    - Form Nilai
 *    - Surat Pengantar
 *    - dll
 * 
 * 4. VERSIONING SUPPORT
 *    - Dokumen lama tetap bisa di-regenerate dengan template lama
 *    - History perubahan template
 *    - Migration tool untuk data lama
 */
