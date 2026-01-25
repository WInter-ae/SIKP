# Template Management Feature

## Overview
Fitur Template Management memungkinkan admin untuk mengelola template dokumen yang digunakan dalam berbagai proses mahasiswa seperti Berita Acara, Form Nilai, Surat Pengantar, dan dokumen lainnya.

## Features

### 1. **CRUD Operations**
- **Create**: Upload atau buat template baru dengan berbagai format (HTML, DOCX, TXT)
- **Read**: Lihat daftar semua template dengan filter dan pencarian
- **Update**: Edit template langsung di halaman menggunakan Monaco Code Editor
- **Delete**: Hapus template yang tidak diperlukan dengan konfirmasi

### 2. **Template Categories**
Template dapat dikategorikan berdasarkan jenis:
- Berita Acara
- Form Nilai
- Surat Pengantar
- Surat Balasan
- Lembar Persetujuan
- Cover Laporan
- Form Evaluasi
- Sertifikat
- Lainnya

### 3. **Code Editor Integration**
- Menggunakan Monaco Editor (VS Code editor) untuk editing template
- Syntax highlighting berdasarkan format file (HTML, XML, Plain Text)
- Features: Find & Replace (Ctrl+F / Ctrl+H), Line numbers, Minimap
- Dark theme untuk pengalaman editing yang nyaman

### 4. **File Upload**
- Upload template dari file lokal (.html, .txt, .docx)
- Otomatis detect file extension
- Preview konten setelah upload

### 5. **Template Management**
- Toggle active/inactive status
- Download template ke file lokal
- Search dan filter berdasarkan nama, deskripsi, atau jenis
- Statistik template (Total, Aktif, per Kategori)

## File Structure

```
app/
  feature/
    template/
      components/
        create-template-dialog.tsx    # Dialog untuk membuat template baru
        edit-template-dialog.tsx      # Dialog dengan code editor untuk edit template
      pages/
        template-management-page.tsx  # Halaman utama template management
      types/
        template.types.ts             # Type definitions untuk template
  routes/
    _sidebar.admin.template._index.tsx  # Route untuk halaman template
```

## Usage

### Accessing the Page
Admin dapat mengakses halaman ini melalui:
- Sidebar → Template → Kelola Template
- URL: `/admin/template`

### Creating a Template
1. Klik tombol "Tambah Template"
2. Isi form:
   - Nama Template
   - Jenis Template (dropdown)
   - Format File (HTML/DOCX/TXT)
   - Deskripsi (optional)
3. Upload file template ATAU ketik konten langsung
4. Klik "Simpan Template"

### Editing a Template
1. Klik icon menu (⋮) pada row template
2. Pilih "Edit"
3. Edit konten menggunakan Monaco Code Editor
4. Gunakan Ctrl+F untuk find, Ctrl+H untuk replace
5. Klik "Simpan Perubahan"

### Using Templates in Other Pages
Anda dapat menggunakan template yang sudah dibuat di halaman lain:

```tsx
import { getTemplates, renderTemplate } from "~/feature/template";

// Example: Generate Berita Acara
const generateBeritaAcara = async (mahasiswaData) => {
  // 1. Load template
  const templates = await getTemplates();
  const template = templates.find(t => t.type === "berita-acara" && t.isActive);
  
  // 2. Prepare data
  const data = {
    tanggal: new Date().toLocaleDateString("id-ID"),
    nama_mahasiswa: mahasiswaData.nama,
    nim: mahasiswaData.nim,
    judul: mahasiswaData.judulKP,
    nilai: mahasiswaData.nilai,
  };
  
  // 3. Render template with data
  const content = renderTemplate(template, data);
  
  // 4. Use the content (download, display, etc)
  return content;
};
```

Lihat [template-usage-example.tsx](./components/template-usage-example.tsx) untuk contoh lengkap.

### Using Template Variables
Template dapat menggunakan placeholder variables dengan format:
```html
{{nama_variabel}}
```

Contoh:
```html
<p>Nama Mahasiswa: {{nama_mahasiswa}}</p>
<p>NIM: {{nim}}</p>
<p>Tanggal: {{tanggal}}</p>
```

Variables ini akan diganti dengan data aktual saat template digunakan.

## Dependencies
- `@monaco-editor/react`: React wrapper untuk Monaco Editor
- `monaco-editor`: Code editor dari VS Code
- `sonner`: Toast notifications
- `lucide-react`: Icons

## Future Enhancements
- [ ] Backend API integration untuk persist data ke database
- [ ] Template preview dengan sample data
- [ ] Template versioning
- [ ] Template duplication
- [ ] Bulk operations
- [ ] Template export/import
- [ ] Rich text editor untuk non-technical users
- [ ] Template validation
- [ ] Variable autocomplete dalam editor

## Notes
- Saat ini template disimpan dalam state lokal (localStorage atau state management)
- Untuk production, perlu implementasi backend API
- Format DOCX memerlukan library tambahan untuk parsing (sudah ada: docxtemplater)
