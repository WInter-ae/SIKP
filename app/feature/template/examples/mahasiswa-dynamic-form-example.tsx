/**
 * Contoh Implementasi Dynamic Form untuk Mahasiswa
 * 
 * Form ini akan otomatis update ketika admin mengubah template
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { DynamicFormFromTemplate } from "../components/dynamic-form-from-template";
import type { Template } from "../types/template.types";
import { toast } from "sonner";
import { FileDown } from "lucide-react";

export function MahasiswaDynamicFormExample() {
  // Contoh template dari database (biasanya fetch dari API)
  const [template] = useState<Template>({
    id: "1",
    name: "Berita Acara Sidang KP 2025",
    type: "berita-acara",
    description: "Template berita acara untuk sidang kerja praktek",
    content: `<!DOCTYPE html>
<html>
<head><title>Berita Acara</title></head>
<body>
    <h1>BERITA ACARA SIDANG KERJA PRAKTEK</h1>
    <p>Nama: {{nama_mahasiswa}}</p>
    <p>NIM: {{nim}}</p>
    <p>Judul: {{judul_laporan}}</p>
    <p>Tempat: {{tempat_pelaksanaan}}</p>
    <p>Tanggal: {{tanggal_sidang}}</p>
    <p>Waktu: {{waktu_mulai}} - {{waktu_selesai}}</p>
</body>
</html>`,
    fileExtension: "html",
    fields: [
      {
        variable: "nama_mahasiswa",
        label: "Nama Mahasiswa",
        type: "text",
        required: true,
        placeholder: "Masukkan nama lengkap",
        order: 0,
      },
      {
        variable: "nim",
        label: "NIM",
        type: "text",
        required: true,
        placeholder: "Contoh: 2001110001",
        validation: {
          pattern: "^[0-9]{10}$",
          message: "NIM harus 10 digit angka",
        },
        order: 1,
      },
      {
        variable: "judul_laporan",
        label: "Judul Laporan KP",
        type: "textarea",
        required: true,
        placeholder: "Masukkan judul laporan kerja praktek",
        validation: {
          min: 10,
          max: 200,
        },
        order: 2,
      },
      {
        variable: "tempat_pelaksanaan",
        label: "Tempat Pelaksanaan Sidang",
        type: "text",
        required: true,
        placeholder: "Contoh: Ruang R3B",
        order: 3,
      },
      {
        variable: "tanggal_sidang",
        label: "Tanggal Sidang",
        type: "date",
        required: true,
        order: 4,
      },
      {
        variable: "waktu_mulai",
        label: "Waktu Mulai",
        type: "time",
        required: true,
        order: 5,
      },
      {
        variable: "waktu_selesai",
        label: "Waktu Selesai",
        type: "time",
        required: true,
        order: 6,
      },
    ],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  });

  const handleSubmit = (formData: Record<string, string>) => {
    console.log("Form Data:", formData);
    
    // Render template dengan data
    const renderedHTML = renderTemplateWithData(template.content, formData);
    
    // Download or send to backend
    toast.success("Form berhasil disubmit!");
    console.log("Rendered HTML:", renderedHTML);
    
    // Download HTML
    const blob = new Blob([renderedHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Berita_Acara_Sidang.html";
    a.click();
  };

  const renderTemplateWithData = (template: string, data: Record<string, string>): string => {
    let result = template;
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      result = result.replace(regex, value);
    });
    return result;
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Form Berita Acara Sidang</span>
            <Button variant="outline" size="sm">
              <FileDown className="h-4 w-4 mr-2" />
              Preview Template
            </Button>
          </CardTitle>
          <CardDescription>
            Lengkapi data berita acara untuk pengujian sidang Kerja Praktik.
            Form ini akan otomatis update jika admin mengubah template.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DynamicFormFromTemplate
            fields={template.fields}
            onSubmit={handleSubmit}
            submitButtonText="Ajukan ke Dosen"
          />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Info Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">Nama Template:</span>
            <span>{template.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Versi:</span>
            <span>v{template.version}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Total Fields:</span>
            <span>{template.fields.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Status:</span>
            <span className="text-green-600 font-medium">Aktif</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
