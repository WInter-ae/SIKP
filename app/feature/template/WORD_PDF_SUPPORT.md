# 📄 Support Word & PDF Templates

## ✅ Word (.docx) - SUDAH SUPPORT

Aplikasi Anda sudah memiliki library `docxtemplater` yang bisa handle Word templates!

### Cara Kerja Word Template:

1. **Admin membuat template di Microsoft Word**
2. **Gunakan placeholder** dengan format `{nama_mahasiswa}`, `{nim}`, dll
3. **Upload file .docx** ke sistem
4. **Configure fields** seperti biasa
5. **Mahasiswa isi form** → Generate .docx baru

### Contoh Word Template:

```
BERITA ACARA SIDANG KERJA PRAKTEK

Pada hari ini, {tanggal}, telah dilaksanakan sidang KP dengan data:

Nama Mahasiswa : {nama_mahasiswa}
NIM            : {nim}
Judul KP       : {judul}
Penguji        : {nama_penguji}
Nilai          : {nilai}

Demikian berita acara ini dibuat.
```

### Perbedaan Format Variable:

| Format | Usage |
|--------|-------|
| `{{variable}}` | HTML template (double curly) |
| `{variable}` | Word template (single curly) |

### Code Example - Generate Word Document:

```typescript
import { generateWordDocument, downloadBlob } from "~/feature/template/services/word-pdf.service";

// Template dengan content base64 dari file .docx
const template: Template = {
  id: "1",
  name: "Berita Acara Word",
  content: "base64_of_docx_file",
  fileExtension: "docx",
  fields: [...],
  // ...
};

// Data dari form mahasiswa
const data = {
  nama_mahasiswa: "John Doe",
  nim: "12345678",
  tanggal: "20 Januari 2026",
  judul: "Sistem Informasi",
  nama_penguji: "Dr. Jane",
  nilai: "A",
};

// Generate Word document
const wordBlob = await generateWordDocument(template, data);

// Download
downloadBlob(wordBlob, "Berita_Acara.docx");
```

## 📊 PDF - BISA DITAMBAHKAN

Ada 2 opsi untuk PDF:

### **Opsi 1: Generate PDF dari HTML Template** (Recommended) ✅

**Keuntungan:**
- ✅ Lebih fleksibel untuk styling
- ✅ Support custom layout
- ✅ Bisa preview di browser sebelum download
- ✅ Styling dengan CSS
- ✅ Multi-page support

**Cara Kerja:**
1. Admin buat template HTML
2. Mahasiswa isi form
3. System render HTML dengan data
4. Convert HTML → Canvas → PDF
5. Download PDF

**Code Example:**

```typescript
import { 
  generatePDFFromHTML, 
  generatePDFFromHTMLMultiPage 
} from "~/feature/template/services/word-pdf.service";

// HTML template yang sudah di-render dengan data
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            padding: 40px; 
        }
        h1 { text-align: center; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 10px; border: 1px solid #000; }
    </style>
</head>
<body>
    <h1>BERITA ACARA</h1>
    <table>
        <tr><td>Nama</td><td>John Doe</td></tr>
        <tr><td>NIM</td><td>12345678</td></tr>
    </table>
</body>
</html>
`;

// Generate PDF (single page)
const pdfBlob = await generatePDFFromHTML(htmlContent);
downloadBlob(pdfBlob, "Berita_Acara.pdf");

// Atau untuk dokumen panjang (multi page)
const pdfBlob = await generatePDFFromHTMLMultiPage(htmlContent);
```

### **Opsi 2: Fill PDF Form** (Advanced)

Untuk kasus khusus dimana format PDF sudah fix (form yang sudah jadi).

**Requirements:**
- Install `pdf-lib` library
- PDF harus punya fillable fields
- Less flexible tapi lebih professional untuk form

## 🚀 Implementation Guide

### 1. Update Template Types untuk Support PDF

Sudah included dalam types yang ada:

```typescript
fileExtension: "html" | "docx" | "txt"  // PDF di-generate dari HTML
```

### 2. Admin Workflow - Upload Word Template

```typescript
import { wordFileToBase64, extractWordVariables } from "~/feature/template/services/word-pdf.service";

// Handle file upload
const handleWordUpload = async (file: File) => {
  // Validate
  if (!file.name.endsWith(".docx")) {
    toast.error("File harus format .docx");
    return;
  }

  // Convert to base64 (untuk simpan di database)
  const base64Content = await wordFileToBase64(file);

  // Extract variables
  const variables = extractWordVariables(base64Content);

  // Auto-generate fields
  const fields = autoGenerateFields(variables);

  // Save template
  const template = {
    name: "Berita Acara Word",
    type: "berita-acara",
    content: base64Content,
    fileExtension: "docx",
    fields,
  };

  await createTemplate(template);
};
```

### 3. Mahasiswa Workflow - Generate Document

```typescript
// Load template (Word atau HTML)
const template = await getTemplateById(templateId);

// Form data dari dynamic form
const formData = {
  nama_mahasiswa: "John Doe",
  nim: "12345678",
  // ...
};

// Generate berdasarkan type
if (template.fileExtension === "docx") {
  // Generate Word
  const wordBlob = await generateWordDocument(template, formData);
  downloadBlob(wordBlob, "document.docx");
} else if (template.fileExtension === "html") {
  // Render HTML
  const htmlContent = renderTemplate(template, formData);
  
  // Option 1: Download HTML
  // downloadBlob(new Blob([htmlContent], { type: "text/html" }), "document.html");
  
  // Option 2: Convert to PDF
  const pdfBlob = await generatePDFFromHTML(htmlContent);
  downloadBlob(pdfBlob, "document.pdf");
}
```

## 📋 Features Support Matrix

| Feature | HTML | Word (.docx) | PDF |
|---------|------|--------------|-----|
| Variable replacement | ✅ `{{var}}` | ✅ `{var}` | ✅ (via HTML) |
| Custom styling | ✅ CSS | ⚠️ Limited | ✅ CSS |
| Tables | ✅ | ✅ | ✅ |
| Images | ✅ | ✅ | ✅ |
| Multi-page | ✅ | ✅ | ✅ |
| Editable output | ❌ | ✅ | ❌ |
| Professional format | ⚠️ | ✅ | ✅ |
| File size | Small | Medium | Medium-Large |
| Browser preview | ✅ | ❌ | ⚠️ Plugin |

## 💡 Best Practices

### Word Templates:

1. **Use simple formatting** - Complex formatting bisa bermasalah
2. **Test variables** - Pastikan semua `{variable}` ter-replace
3. **Keep it small** - Max 5MB untuk performa
4. **Use tables** - Lebih reliable daripada tab spacing

### PDF Generation:

1. **Use inline CSS** - External stylesheet tidak support
2. **Test in browser first** - Preview HTML sebelum convert PDF
3. **Optimize images** - Compress images untuk file size lebih kecil
4. **Set page size** - Gunakan CSS `@page` untuk custom size
5. **Multi-page handling** - Test dengan content panjang

### HTML Templates (for PDF):

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        @page {
            size: A4;
            margin: 20mm;
        }
        
        body {
            font-family: Arial, sans-serif;
            font-size: 12pt;
            line-height: 1.5;
        }
        
        h1 {
            text-align: center;
            font-size: 18pt;
            margin-bottom: 20px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        td {
            padding: 10px;
            border: 1px solid #000;
        }
        
        .signature {
            margin-top: 40px;
            text-align: right;
        }
    </style>
</head>
<body>
    <!-- Content here -->
</body>
</html>
```

## 🐛 Troubleshooting

### Word Template Issues:

**Problem:** Variable tidak ter-replace
- ✅ Pastikan format `{variable}` bukan `{{variable}}`
- ✅ Check typo di variable name (case sensitive)
- ✅ Jangan gunakan special characters di variable name

**Problem:** Error saat generate
- ✅ File Word corrupt? Try re-save
- ✅ File terlalu besar? Compress
- ✅ Format docx bukan doc?

### PDF Generation Issues:

**Problem:** Styling hilang
- ✅ Gunakan inline CSS atau `<style>` tag
- ✅ Jangan gunakan external CSS file
- ✅ Test di browser dulu

**Problem:** Image tidak muncul
- ✅ Use base64 encoded images
- ✅ atau full URL (dengan CORS enabled)
- ✅ Compress image untuk performa

**Problem:** Multi-page tidak pecah dengan baik
- ✅ Gunakan `generatePDFFromHTMLMultiPage`
- ✅ Set proper page breaks dengan CSS

## 📦 Dependencies

Library yang digunakan:

```json
{
  "dependencies": {
    "docxtemplater": "^3.67.6",  // Word template
    "pizzip": "^3.2.0",           // ZIP handling for docx
    "jspdf": "^4.0.0",            // PDF generation
    "html2canvas": "^1.4.1"       // HTML to Canvas
  }
}
```

## 📚 References

- [docxtemplater Documentation](https://docxtemplater.com/)
- [jsPDF Documentation](https://github.com/parallax/jsPDF)
- [html2canvas Documentation](https://html2canvas.hertzen.com/)

## 🎯 Kesimpulan

**Word (.docx):**
- ✅ **Sudah support** dengan docxtemplater
- ✅ Professional format
- ✅ Editable hasil
- ⚠️ Limited styling control

**PDF:**
- ✅ **Bisa di-generate dari HTML**
- ✅ Full styling control dengan CSS
- ✅ Multi-page support
- ⚠️ Output tidak editable
- ⚠️ File size bisa besar

**Rekomendasi:**
- Gunakan **Word** untuk dokumen yang perlu diedit lagi
- Gunakan **PDF** untuk dokumen final/official
- Gunakan **HTML** template yang bisa di-convert ke both Word & PDF!
