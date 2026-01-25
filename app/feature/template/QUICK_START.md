# 🚀 Quick Start Guide - Dynamic Template System

## Untuk Admin

### 1. Membuat Template Baru
1. Buka halaman `/admin/template`
2. Klik **"Tambah Template"**
3. Isi form:
   - Nama Template: "Berita Acara Sidang KP 2025"
   - Jenis: Pilih "Berita Acara"
   - Format: Pilih "HTML"
   - Upload file template atau paste content
4. Klik **"Simpan Template"**
5. Template akan otomatis men-detect variables dan generate field configuration

### 2. Mengkonfigurasi Fields
1. Klik tombol **"Edit"** pada template yang baru dibuat
2. Switch ke tab **"Field Configuration"**
3. Lihat daftar variables yang terdeteksi dari template
4. Klik **"Auto Generate"** untuk generate field configuration otomatis
5. Customize setiap field:
   - **Label**: Nama field yang ditampilkan ke user
   - **Tipe Input**: text, textarea, number, date, email, select
   - **Required**: Centang jika wajib diisi
   - **Placeholder**: Text hint untuk user
   - **Options**: Untuk dropdown (pisahkan dengan koma)
6. Atur urutan field dengan tombol ↑ ↓
7. Klik **"Simpan Perubahan"**

### 3. Mengubah Template (Update)
1. Klik **"Edit"** pada template
2. Di tab **"Template Editor"**, edit content template (tambah/ubah/hapus variables)
3. Switch ke tab **"Field Configuration"**
4. Jika ada warning **"Variable belum dikonfigurasi"**, klik **"Auto Generate"**
5. Review dan customize field baru
6. Klik **"Simpan Perubahan"**
7. ✨ Form mahasiswa otomatis update!

## Untuk Developer

### Implementasi di Halaman Mahasiswa

#### Step 1: Import Components
```typescript
import { DynamicFormFromTemplate } from "~/feature/template";
import { getTemplates, renderTemplate } from "~/feature/template";
import type { Template } from "~/feature/template";
```

#### Step 2: Load Template
```typescript
const [template, setTemplate] = useState<Template | null>(null);

useEffect(() => {
  const loadTemplate = async () => {
    const templates = await getTemplates();
    const activeTemplate = templates.find(
      t => t.type === "berita-acara" && t.isActive
    );
    setTemplate(activeTemplate);
  };
  loadTemplate();
}, []);
```

#### Step 3: Render Dynamic Form
```typescript
<DynamicFormFromTemplate
  fields={template.fields}
  onSubmit={(formData) => {
    // formData = { nama_mahasiswa: "...", nim: "...", ... }
    const document = renderTemplate(template, formData);
    // Download atau simpan dokumen
  }}
  submitButtonText="Generate Dokumen"
/>
```

#### Complete Example:
```typescript
"use client";

import { useState, useEffect } from "react";
import { DynamicFormFromTemplate, getTemplates, renderTemplate } from "~/feature/template";
import type { Template } from "~/feature/template";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

export function BeritaAcaraPage() {
  const [template, setTemplate] = useState<Template | null>(null);
  const [document, setDocument] = useState<string | null>(null);

  useEffect(() => {
    getTemplates().then(templates => {
      const beritaAcara = templates.find(
        t => t.type === "berita-acara" && t.isActive
      );
      setTemplate(beritaAcara || null);
    });
  }, []);

  const handleSubmit = (formData: Record<string, string>) => {
    if (!template) return;
    const generated = renderTemplate(template, formData);
    setDocument(generated);
  };

  const handleDownload = () => {
    if (!document || !template) return;
    const blob = new Blob([document], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Berita_Acara.${template.fileExtension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!template) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Berita Acara</CardTitle>
        </CardHeader>
        <CardContent>
          <DynamicFormFromTemplate
            fields={template.fields}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>

      {document && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <Button onClick={handleDownload}>Download</Button>
          </CardHeader>
          <CardContent>
            <div dangerouslySetInnerHTML={{ __html: document }} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

## Template Syntax

### Variables
Gunakan double curly braces untuk variables:
```html
<p>Nama: {{nama_mahasiswa}}</p>
<p>NIM: {{nim}}</p>
<p>Tanggal: {{tanggal}}</p>
```

### Example Template (Berita Acara)
```html
<!DOCTYPE html>
<html>
<head>
    <title>Berita Acara Sidang</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { text-align: center; }
    </style>
</head>
<body>
    <h1>BERITA ACARA SIDANG KERJA PRAKTEK</h1>
    
    <p>Pada hari ini, {{tanggal}}, telah dilaksanakan sidang kerja praktek dengan data sebagai berikut:</p>
    
    <table>
        <tr>
            <td width="150">Nama Mahasiswa</td>
            <td>: {{nama_mahasiswa}}</td>
        </tr>
        <tr>
            <td>NIM</td>
            <td>: {{nim}}</td>
        </tr>
        <tr>
            <td>Judul KP</td>
            <td>: {{judul}}</td>
        </tr>
        <tr>
            <td>Penguji</td>
            <td>: {{nama_penguji}}</td>
        </tr>
        <tr>
            <td>Nilai</td>
            <td>: {{nilai}}</td>
        </tr>
    </table>
    
    <p>Demikian berita acara ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</p>
</body>
</html>
```

### Field Configuration untuk Template Di Atas
```typescript
fields: [
  {
    variable: "tanggal",
    label: "Tanggal Sidang",
    type: "date",
    required: true,
    order: 0
  },
  {
    variable: "nama_mahasiswa",
    label: "Nama Mahasiswa",
    type: "text",
    required: true,
    placeholder: "Masukkan nama lengkap mahasiswa",
    order: 1
  },
  {
    variable: "nim",
    label: "NIM",
    type: "text",
    required: true,
    placeholder: "Contoh: 12345678",
    validation: {
      pattern: "^[0-9]{8}$",
      message: "NIM harus 8 digit angka"
    },
    order: 2
  },
  {
    variable: "judul",
    label: "Judul Kerja Praktek",
    type: "textarea",
    required: true,
    placeholder: "Masukkan judul KP",
    order: 3
  },
  {
    variable: "nama_penguji",
    label: "Nama Penguji",
    type: "text",
    required: true,
    order: 4
  },
  {
    variable: "nilai",
    label: "Nilai",
    type: "select",
    required: true,
    options: ["A", "A-", "B+", "B", "B-", "C+", "C", "D", "E"],
    order: 5
  }
]
```

## FAQ

**Q: Apa yang terjadi jika admin mengubah template?**
A: Form mahasiswa akan otomatis menyesuaikan tanpa perlu deploy ulang atau edit code.

**Q: Bagaimana dengan dokumen yang sudah di-generate dengan template lama?**
A: Gunakan template versioning. Dokumen lama bisa di-regenerate dengan template version yang sesuai.

**Q: Bisa tambah field conditional (show field B jika field A = X)?**
A: Untuk saat ini belum support, tapi sudah masuk dalam future enhancement.

**Q: Bisa import template dari file Excel/Word?**
A: Saat ini hanya support HTML, DOCX (text), dan TXT. Untuk Word yang complex, perlu library docxtemplater.

**Q: Bagaimana validasi custom?**
A: Gunakan property `validation` pada field configuration dengan pattern (regex) dan message.

## Troubleshooting

**Problem: Form tidak muncul**
- Pastikan template sudah active (isActive = true)
- Check console browser untuk error
- Pastikan template.fields tidak kosong

**Problem: Variable tidak ter-replace**
- Pastikan format variable benar: `{{nama_variable}}`
- Pastikan variable name di template match dengan field.variable
- Case sensitive!

**Problem: Validation tidak jalan**
- Check field.required dan field.validation
- Pastikan onSubmit tidak di-call manual tanpa validasi

## Support

Lihat dokumentasi lengkap: [SOLUTION_DYNAMIC_TEMPLATE.md](./SOLUTION_DYNAMIC_TEMPLATE.md)
Contoh implementasi: [mahasiswa-berita-acara-example.tsx](./examples/mahasiswa-berita-acara-example.tsx)
