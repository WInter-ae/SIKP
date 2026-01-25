/**
 * Example: Word & PDF Template Usage
 * 
 * Contoh penggunaan template Word dan generate PDF
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { FileText, FileDown, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  generateWordDocument,
  generatePDFFromHTML,
  generatePDFFromHTMLMultiPage,
  downloadBlob,
  wordFileToBase64,
  extractWordVariables,
  isValidWordTemplate,
  getReadableFileSize,
} from "../services/word-pdf.service";
import { renderTemplate } from "../services/template.service";
import type { Template } from "../types/template.types";

/**
 * Example 1: Upload Word Template
 */
export function UploadWordTemplateExample() {
  const [file, setFile] = useState<File | null>(null);
  const [variables, setVariables] = useState<string[]>([]);
  const [preview, setPreview] = useState<string>("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    // Validate
    if (!isValidWordTemplate(uploadedFile)) {
      toast.error("File harus format .docx");
      return;
    }

    setFile(uploadedFile);

    try {
      // Convert to base64 (untuk simpan di database)
      const base64 = await wordFileToBase64(uploadedFile);
      
      // Extract variables
      const vars = extractWordVariables(base64);
      setVariables(vars);
      
      setPreview(base64.substring(0, 200) + "..."); // Show preview
      
      toast.success(`File uploaded: ${uploadedFile.name} (${getReadableFileSize(uploadedFile.size)})`);
    } catch (error) {
      toast.error("Gagal membaca file Word");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Word Template</CardTitle>
        <CardDescription>
          Upload file .docx dengan placeholder {`{variable}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="word-file">File Word (.docx)</Label>
          <Input
            id="word-file"
            type="file"
            accept=".docx"
            onChange={handleFileUpload}
            className="cursor-pointer"
          />
        </div>

        {file && (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium">{file.name}</span>
                <Badge variant="secondary">{getReadableFileSize(file.size)}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Format: DOCX | Variables detected: {variables.length}
              </p>
            </div>

            {variables.length > 0 && (
              <div className="space-y-2">
                <Label>Variables Detected:</Label>
                <div className="flex flex-wrap gap-2">
                  {variables.map((variable) => (
                    <Badge key={variable} variant="outline">
                      {`{${variable}}`}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Configure field metadata untuk setiap variable ini di tab "Field Configuration"
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Example 2: Generate Word Document
 */
export function GenerateWordDocumentExample() {
  const [formData, setFormData] = useState({
    nama_mahasiswa: "",
    nim: "",
    tanggal: "",
    judul: "",
  });
  const [loading, setLoading] = useState(false);

  // Mock template (in real app, load from database)
  const mockTemplate: Template = {
    id: "1",
    name: "Berita Acara Word",
    type: "berita-acara",
    content: "base64_word_content_here", // In real app, this is base64 of .docx
    fileExtension: "docx",
    fields: [
      { variable: "nama_mahasiswa", label: "Nama", type: "text", required: true, order: 0 },
      { variable: "nim", label: "NIM", type: "text", required: true, order: 1 },
      { variable: "tanggal", label: "Tanggal", type: "date", required: true, order: 2 },
      { variable: "judul", label: "Judul", type: "textarea", required: true, order: 3 },
    ],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Generate Word document
      const wordBlob = await generateWordDocument(mockTemplate, formData);
      
      // Download
      downloadBlob(wordBlob, `Berita_Acara_${formData.nim}.docx`);
      
      toast.success("Dokumen Word berhasil digenerate!");
    } catch (error) {
      toast.error("Gagal generate dokumen Word");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Word Document</CardTitle>
        <CardDescription>
          Isi form untuk generate dokumen Word dari template
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nama Mahasiswa</Label>
            <Input
              value={formData.nama_mahasiswa}
              onChange={(e) => setFormData({ ...formData, nama_mahasiswa: e.target.value })}
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <Label>NIM</Label>
            <Input
              value={formData.nim}
              onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
              placeholder="12345678"
            />
          </div>
          <div className="space-y-2">
            <Label>Tanggal</Label>
            <Input
              type="date"
              value={formData.tanggal}
              onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Judul KP</Label>
            <Input
              value={formData.judul}
              onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
              placeholder="Judul Kerja Praktek"
            />
          </div>
        </div>

        <Button onClick={handleGenerate} disabled={loading} className="w-full">
          <FileDown className="h-4 w-4 mr-2" />
          {loading ? "Generating..." : "Generate Word Document"}
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Example 3: Generate PDF from HTML
 */
export function GeneratePDFExample() {
  const [htmlContent, setHtmlContent] = useState(`
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        h1 { text-align: center; color: #333; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        td { padding: 10px; border: 1px solid #ddd; }
    </style>
</head>
<body>
    <h1>BERITA ACARA SIDANG KERJA PRAKTEK</h1>
    <p>Pada hari ini telah dilaksanakan sidang KP:</p>
    <table>
        <tr>
            <td width="150">Nama</td>
            <td>John Doe</td>
        </tr>
        <tr>
            <td>NIM</td>
            <td>12345678</td>
        </tr>
        <tr>
            <td>Nilai</td>
            <td>A</td>
        </tr>
    </table>
</body>
</html>
  `);
  const [loading, setLoading] = useState(false);

  const handleGeneratePDF = async () => {
    setLoading(true);
    try {
      const pdfBlob = await generatePDFFromHTML(htmlContent);
      downloadBlob(pdfBlob, "Berita_Acara.pdf");
      toast.success("PDF berhasil digenerate!");
    } catch (error) {
      toast.error("Gagal generate PDF");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMultiPagePDF = async () => {
    setLoading(true);
    try {
      const pdfBlob = await generatePDFFromHTMLMultiPage(htmlContent);
      downloadBlob(pdfBlob, "Berita_Acara_MultiPage.pdf");
      toast.success("PDF multi-page berhasil digenerate!");
    } catch (error) {
      toast.error("Gagal generate PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate PDF from HTML</CardTitle>
        <CardDescription>
          Convert HTML template ke PDF
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>HTML Content</Label>
          <textarea
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            className="w-full h-64 p-3 border rounded-lg font-mono text-sm"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleGeneratePDF} disabled={loading} className="flex-1">
            <FileDown className="h-4 w-4 mr-2" />
            Generate PDF (Single Page)
          </Button>
          <Button onClick={handleGenerateMultiPagePDF} disabled={loading} variant="outline" className="flex-1">
            <FileDown className="h-4 w-4 mr-2" />
            Generate PDF (Multi Page)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Main Example Page - Combine all examples
 */
export function WordPDFExamplesPage() {
  const [activeTab, setActiveTab] = useState("upload");
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Word & PDF Templates</h1>
        <p className="text-muted-foreground">
          Contoh penggunaan Word template dan PDF generation
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload Word
          </TabsTrigger>
          <TabsTrigger value="word">
            <FileText className="h-4 w-4 mr-2" />
            Generate Word
          </TabsTrigger>
          <TabsTrigger value="pdf">
            <FileDown className="h-4 w-4 mr-2" />
            Generate PDF
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <UploadWordTemplateExample />
        </TabsContent>

        <TabsContent value="word">
          <GenerateWordDocumentExample />
        </TabsContent>

        <TabsContent value="pdf">
          <GeneratePDFExample />
        </TabsContent>
      </Tabs>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Cara Penggunaan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold mb-2">📄 Word Template Format:</h4>
            <p className="text-muted-foreground">
              Gunakan <code className="bg-muted px-1 py-0.5 rounded">{`{variable}`}</code> untuk placeholder.
              Contoh: <code className="bg-muted px-1 py-0.5 rounded">{`{nama_mahasiswa}`}</code>
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">📊 PDF Generation:</h4>
            <p className="text-muted-foreground">
              PDF digenerate dari HTML. Gunakan inline CSS untuk styling yang konsisten.
              Support single page dan multi-page.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">💡 Tips:</h4>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Word: File size max 5MB</li>
              <li>PDF: Gunakan inline CSS, bukan external stylesheet</li>
              <li>Styling: Test di browser dulu sebelum generate PDF</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
