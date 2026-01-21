# 🎯 SOLUSI: Dynamic Template System dengan Auto-Generated Forms

## 📝 Problem Statement

**Masalah yang dihadapi:**
- Admin upload template dokumen (Berita Acara, Form Nilai, dll)
- Template memiliki variables seperti `{{nama_mahasiswa}}`, `{{nim}}`, dll
- Mahasiswa perlu mengisi form untuk generate dokumen
- **PROBLEM**: Ketika admin mengubah template (tambah/hapus field), form input mahasiswa harus ikut berubah
- Solusi manual = edit code form setiap kali template berubah ❌

## ✅ Solusi yang Diimplementasikan

### 1. **Dynamic Field Configuration System**

Admin tidak hanya upload template content, tapi juga **konfigurasi metadata field**:

```typescript
interface TemplateField {
  variable: string;        // {{nama_mahasiswa}}
  label: string;           // "Nama Mahasiswa"
  type: FieldType;         // text, textarea, number, date, email, select
  required: boolean;       // wajib diisi?
  placeholder?: string;    // placeholder text
  options?: string[];      // untuk dropdown
  validation?: {...};      // rules validasi
  order: number;           // urutan tampil
}
```

**Cara kerja:**
1. Admin edit template di Monaco Editor
2. System detect variables dari template (`{{nama_mahasiswa}}`, `{{nim}}`, dll)
3. Admin konfigurasi setiap variable dengan metadata
4. Save template + field configuration

### 2. **Auto-Generated Forms**

Component `DynamicFormFromTemplate` yang **otomatis generate form** berdasarkan field configuration:

```tsx
<DynamicFormFromTemplate
  fields={template.fields}  // Ambil dari database
  onSubmit={handleSubmit}
  submitButtonText="Generate Dokumen"
/>
```

**Form otomatis:**
- ✅ Render input sesuai type (text, textarea, date, select, dll)
- ✅ Apply validation rules
- ✅ Show placeholder & help text
- ✅ Required fields dengan tanda *
- ✅ Error messages
- ✅ Responsive layout

### 3. **Template Field Configurator**

Component untuk admin konfigurasi fields dengan UI yang user-friendly:

**Features:**
- 🔍 Auto-detect variables dari template
- ⚠️ Warning untuk variables yang belum dikonfigurasi
- 🤖 Auto-generate fields dengan smart type detection
- 📝 Configure label, type, placeholder, validation
- ↕️ Reorder fields (drag & drop)
- ➕ Add/remove fields manual
- 📋 Options untuk dropdown

### 4. **Template Versioning**

Support versioning untuk handle perubahan template:

```typescript
interface Template {
  version: number;              // Track version
  previousVersionId?: string;   // Link ke version sebelumnya
}
```

**Use case:**
- Dokumen lama tetap bisa di-regenerate dengan template lama
- History perubahan template
- Migration tool untuk update data lama ke format baru

## 🔄 Workflow

### Admin Workflow:

1. **Create/Upload Template**
   ```
   Admin → Upload HTML template → System detect variables
   → Auto-generate field configuration → Admin review & customize
   → Save template
   ```

2. **Edit Template (Significant Changes)**
   ```
   Admin → Edit template di Monaco Editor (tambah {{email}})
   → Switch ke tab "Field Configuration"
   → System warning: "Variable 'email' belum dikonfigurasi"
   → Click "Auto Generate" atau add manual
   → Configure field metadata (label, type, required, dll)
   → Save → Version otomatis increment
   ```

### Mahasiswa Workflow:

1. **Access Form Page**
   ```
   Mahasiswa → Pilih halaman (Generate Berita Acara)
   → System load template aktif dari database
   → Form auto-generate berdasarkan template.fields
   ```

2. **Fill & Submit**
   ```
   Mahasiswa → Isi form (form menyesuaikan template terbaru)
   → Client-side validation
   → Submit → Template di-render dengan data
   → Preview/Download dokumen
   ```

## 🎨 UI Components

### 1. Template Management Page (Admin)
```
📁 /admin/template

├── Header (stats cards)
├── Create Template Dialog
│   ├── Upload file or paste content
│   ├── Basic info (name, type, description)
│   └── Auto-generate fields button
├── Template List Table
│   ├── Search & filter
│   ├── Actions (Edit, Download, Delete, Toggle Active)
│   └── Status badges
└── Edit Template Dialog
    ├── Tab 1: Template Editor (Monaco Editor)
    └── Tab 2: Field Configuration
        ├── Auto-generate button
        ├── Unmapped variables warning
        └── Field list with drag & drop
```

### 2. Dynamic Form (Mahasiswa)
```
📁 /mahasiswa/kp/berita-acara

├── Form Card (auto-generated)
│   ├── Fields (menyesuaikan template.fields)
│   ├── Validation
│   └── Submit button
├── Preview Card
│   ├── Rendered document
│   └── Download button
└── Template Info Card
    └── Version, last updated, etc
```

## 💻 Code Example

### Admin - Create Template with Fields

```typescript
// Template content
const content = `
<h1>BERITA ACARA</h1>
<p>Nama: {{nama_mahasiswa}}</p>
<p>NIM: {{nim}}</p>
<p>Tanggal: {{tanggal}}</p>
<p>Nilai: {{nilai}}</p>
`;

// Auto-generated fields
const fields = [
  {
    variable: "nama_mahasiswa",
    label: "Nama Mahasiswa",
    type: "text",
    required: true,
    order: 0
  },
  {
    variable: "nim",
    label: "NIM",
    type: "text",
    required: true,
    order: 1
  },
  {
    variable: "tanggal",
    label: "Tanggal Sidang",
    type: "date",
    required: true,
    order: 2
  },
  {
    variable: "nilai",
    label: "Nilai",
    type: "select",
    required: true,
    options: ["A", "B", "C", "D", "E"],
    order: 3
  }
];

// Save template
await createTemplate({ name, content, fields, ... });
```

### Mahasiswa - Use Dynamic Form

```typescript
function BeritaAcaraPage() {
  const [template, setTemplate] = useState<Template | null>(null);

  useEffect(() => {
    // Load template dari API/database
    const loadTemplate = async () => {
      const templates = await getTemplates();
      const beritaAcara = templates.find(t => 
        t.type === "berita-acara" && t.isActive
      );
      setTemplate(beritaAcara);
    };
    loadTemplate();
  }, []);

  const handleSubmit = (formData: Record<string, string>) => {
    // Render template dengan data
    const document = renderTemplate(template, formData);
    // Preview/download
  };

  return (
    <DynamicFormFromTemplate
      fields={template.fields}  // 👈 Otomatis menyesuaikan perubahan
      onSubmit={handleSubmit}
    />
  );
}
```

## 🎯 Benefits

### ✅ For Admin:
- ✏️ Edit template kapan saja tanpa touching code
- 🔧 Configure form fields dengan UI yang mudah
- 🔍 Auto-detect variables dari template
- ⚠️ Warning untuk variables yang belum dikonfigurasi
- 📦 Versioning untuk tracking perubahan

### ✅ For Developer:
- 🚀 No deployment needed untuk perubahan template
- ♻️ Reusable component untuk semua jenis dokumen
- 🧹 Clean code, no hardcoded forms
- 🔒 Type-safe dengan TypeScript
- 📝 Well-documented

### ✅ For Mahasiswa:
- 🎨 Form selalu up-to-date dengan template terbaru
- ✓ Validasi otomatis
- 💡 Help text & placeholder
- 📱 Responsive design
- ⚡ Fast & smooth UX

### ✅ For System:
- 🔄 Scalable untuk multiple templates
- 📊 Consistent data structure
- 🗃️ Easy to migrate/backup
- 🔗 Integrable dengan backend API
- 📈 Extensible untuk fitur baru

## 📂 File Structure

```
app/feature/template/
├── types/
│   └── template.types.ts              # Type definitions + TemplateField
├── services/
│   └── template.service.ts            # CRUD + helper functions
├── components/
│   ├── create-template-dialog.tsx     # Upload template
│   ├── edit-template-dialog.tsx       # Edit dengan tabs (Editor + Fields)
│   ├── template-field-configurator.tsx # Configure field metadata
│   ├── dynamic-form-from-template.tsx # Auto-generated form
│   └── template-usage-example.tsx     # Example usage
├── pages/
│   └── template-management-page.tsx   # Main admin page
├── examples/
│   └── mahasiswa-berita-acara-example.tsx # Implementation example
└── README.md                           # Documentation
```

## 🚀 Usage Guide

### For Admin: Membuat Template Baru

1. Buka `/admin/template`
2. Click "Tambah Template"
3. Isi info dasar (nama, jenis, deskripsi)
4. Upload file template atau paste content
5. System akan auto-detect variables ({{nama}}, {{nim}}, dll)
6. Click "Simpan Template"
7. Click "Edit" pada template yang baru dibuat
8. Switch ke tab "Field Configuration"
9. Click "Auto Generate" untuk generate field configuration
10. Review dan customize field metadata (label, type, placeholder, validation)
11. Click "Simpan Perubahan"
12. Template siap digunakan! ✅

### For Admin: Mengubah Template

1. Edit template content di tab "Template Editor"
2. Tambah/ubah/hapus variables sesuai kebutuhan
3. Switch ke tab "Field Configuration"
4. Jika ada warning, click "Auto Generate" atau configure manual
5. Save perubahan
6. Form mahasiswa otomatis update! 🎉

### For Developer: Implementasi di Halaman Mahasiswa

```typescript
import { DynamicFormFromTemplate } from "~/feature/template";
import { getTemplates, renderTemplate } from "~/feature/template";

// 1. Load template
const template = await getTemplates().then(t => 
  t.find(x => x.type === "berita-acara" && x.isActive)
);

// 2. Render form (otomatis menyesuaikan template.fields)
<DynamicFormFromTemplate
  fields={template.fields}
  onSubmit={(data) => {
    const document = renderTemplate(template, data);
    // Handle document (preview/download/save)
  }}
/>

// Done! Form akan otomatis update ketika admin ubah template
```

## 🔮 Future Enhancements

- [ ] Rich text editor untuk non-technical admins
- [ ] Template preview dengan sample data
- [ ] Field conditional logic (show field B if field A = X)
- [ ] Template marketplace/library
- [ ] Bulk import templates
- [ ] Template analytics (usage stats)
- [ ] Multi-language support
- [ ] Template approval workflow
- [ ] Integration dengan e-signature
- [ ] PDF generation dari HTML template

## 📚 Related Files

- Main implementation: [template-management-page.tsx](./pages/template-management-page.tsx)
- Dynamic form: [dynamic-form-from-template.tsx](./components/dynamic-form-from-template.tsx)
- Field configurator: [template-field-configurator.tsx](./components/template-field-configurator.tsx)
- Example usage: [mahasiswa-berita-acara-example.tsx](./examples/mahasiswa-berita-acara-example.tsx)
- Service functions: [template.service.ts](./services/template.service.ts)

## 💡 Key Takeaway

**Dengan sistem ini, perubahan template = 0 code changes!**

Admin tinggal edit template dan configure fields via UI, form mahasiswa otomatis menyesuaikan tanpa perlu deploy ulang atau edit code. 🎉
