# 🎯 Cara Edit Input Form Mahasiswa dari Admin

## Konsep: Dynamic Form Configuration

**Form mahasiswa akan OTOMATIS UPDATE** ketika admin mengubah konfigurasi field di template!

Tidak perlu deploy ulang, tidak perlu edit kode. Semua perubahan instant.

---

## 📋 Step-by-Step: Edit Field Configuration

### Step 1: Buka Halaman Template Admin

1. Login sebagai **Admin**
2. Buka menu **"Template Management"** (`/admin/template`)
3. Cari template yang ingin diedit (contoh: "Berita Acara Sidang KP")

### Step 2: Edit Template

1. Klik tombol **"Edit"** pada template yang dipilih
2. Dialog edit akan muncul dengan **2 TAB**:
   - **Template Editor** - Edit konten HTML/DOCX
   - **Field Configuration** ⭐ - **INI YANG PENTING**

### Step 3: Konfigurasi Field (Tab "Field Configuration")

Klik tab **"Field Configuration"** untuk mengatur input form mahasiswa:

#### A. Auto-Generate Fields (Jika Belum Ada)

Jika template baru atau ada variable baru:

```
1. Klik button "Auto-Generate Fields"
2. System akan otomatis detect semua {{variable}} dari template
3. Field akan dibuat otomatis dengan default setting
```

#### B. Edit Field Configuration

Untuk setiap field, admin bisa atur:

| Setting | Keterangan | Contoh |
|---------|-----------|--------|
| **Label** | Text yang ditampilkan ke mahasiswa | "Nama Lengkap Mahasiswa" |
| **Type** | Jenis input | text, textarea, number, date, time, email, select |
| **Required** | Wajib diisi atau tidak | Toggle ON/OFF |
| **Placeholder** | Hint untuk mahasiswa | "Contoh: John Doe" |
| **Validation** | Aturan validasi | Min/max length, pattern regex |
| **Order** | Urutan tampilan | Drag & drop untuk reorder |

#### C. Field Types & Usage

**1. Text (Single Line)**
```typescript
{
  variable: "nama_mahasiswa",
  label: "Nama Mahasiswa",
  type: "text",
  required: true,
  placeholder: "Masukkan nama lengkap",
  validation: {
    min: 3,
    max: 100,
  }
}
```

**2. Textarea (Multi Line)**
```typescript
{
  variable: "judul_laporan",
  label: "Judul Laporan KP",
  type: "textarea",
  required: true,
  validation: {
    min: 10,
    max: 200,
  }
}
```

**3. Number**
```typescript
{
  variable: "nilai",
  label: "Nilai Akhir",
  type: "number",
  required: true,
  validation: {
    min: 0,
    max: 100,
  }
}
```

**4. Date**
```typescript
{
  variable: "tanggal_sidang",
  label: "Tanggal Sidang",
  type: "date",
  required: true,
}
```

**5. Time**
```typescript
{
  variable: "waktu_mulai",
  label: "Waktu Mulai",
  type: "time",
  required: true,
}
```

**6. Email**
```typescript
{
  variable: "email_mahasiswa",
  label: "Email",
  type: "email",
  required: true,
  validation: {
    pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
    message: "Format email tidak valid"
  }
}
```

**7. Select (Dropdown)**
```typescript
{
  variable: "status",
  label: "Status Kelulusan",
  type: "select",
  required: true,
  options: ["Lulus", "Tidak Lulus", "Revisi"],
}
```

### Step 4: Validasi Custom

Admin bisa set validation rules:

#### Pattern Validation (Regex)

**Contoh: NIM harus 10 digit angka**
```typescript
{
  variable: "nim",
  validation: {
    pattern: "^[0-9]{10}$",
    message: "NIM harus 10 digit angka"
  }
}
```

**Contoh: No. HP format Indonesia**
```typescript
{
  variable: "no_hp",
  validation: {
    pattern: "^(08|\\+628)[0-9]{8,11}$",
    message: "Format: 08xxxxxxxxx atau +628xxxxxxxxx"
  }
}
```

#### Min/Max Length

```typescript
{
  variable: "deskripsi",
  validation: {
    min: 50,    // Minimal 50 karakter
    max: 500,   // Maksimal 500 karakter
    message: "Deskripsi harus 50-500 karakter"
  }
}
```

### Step 5: Reorder Fields (Drag & Drop)

Atur urutan field yang tampil ke mahasiswa:

1. Klik dan hold icon **"⋮⋮"** (grip icon)
2. Drag field ke posisi yang diinginkan
3. Drop
4. Urutan otomatis update

### Step 6: Save Changes

1. Klik button **"Simpan Perubahan"**
2. Template dan field configuration tersimpan
3. **Form mahasiswa langsung update!** ✨

---

## 🔄 Flow: Admin Edit → Mahasiswa Lihat

```
┌─────────────────┐
│  Admin Edit     │
│  Field Config   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Save Template  │
│  + Fields       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Mahasiswa      │
│  Open Form      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Dynamic Form   │
│  Auto-Generate  │
│  from Fields    │
└─────────────────┘
```

**Hasil:**
- Mahasiswa langsung lihat form baru
- Input fields sesuai konfigurasi admin
- Validation otomatis apply
- Tidak perlu refresh/logout

---

## 📝 Contoh Real Case: Edit Berita Acara Sidang

### Before (Form Hardcoded)

```tsx
// File: berita-acara-form.tsx
<Input name="judulLaporan" ... />
<Input name="tempatPelaksanaan" ... />
<Input name="tanggalSidang" type="date" ... />
```

**Problem:**
- ❌ Kalo admin mau tambah field → HARUS EDIT KODE
- ❌ Butuh developer untuk perubahan kecil
- ❌ Deploy ulang aplikasi

### After (Dynamic Form)

```tsx
// File: berita-acara-form-dynamic.tsx
<DynamicFormFromTemplate 
  fields={template.fields} 
  onSubmit={handleSubmit}
/>
```

**Benefit:**
- ✅ Admin tambah field di web → LANGSUNG MUNCUL
- ✅ Tidak butuh developer
- ✅ Tidak perlu deploy
- ✅ Real-time update

---

## 🎨 Contoh Implementasi untuk Developer

### 1. Fetch Template dari API/Database

```typescript
// Di component mahasiswa
const [template, setTemplate] = useState<Template | null>(null);

useEffect(() => {
  // Fetch template berdasarkan tipe
  fetch(`/api/templates?type=berita-acara`)
    .then(res => res.json())
    .then(data => setTemplate(data));
}, []);
```

### 2. Render Dynamic Form

```tsx
import { DynamicFormFromTemplate } from "~/feature/template/components/dynamic-form-from-template";

export function BeritaAcaraPage() {
  const [template, setTemplate] = useState<Template | null>(null);
  
  const handleSubmit = (formData: Record<string, string>) => {
    // formData = { nama_mahasiswa: "...", nim: "...", ... }
    
    // Render template HTML dengan data
    const html = renderTemplate(template.content, formData);
    
    // Save atau download
    saveBeritaAcara(html);
  };
  
  if (!template) return <div>Loading...</div>;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Berita Acara Sidang</CardTitle>
      </CardHeader>
      <CardContent>
        <DynamicFormFromTemplate
          fields={template.fields}
          onSubmit={handleSubmit}
          submitButtonText="Ajukan ke Dosen"
        />
      </CardContent>
    </Card>
  );
}
```

### 3. Render Template dengan Data

```typescript
function renderTemplate(
  templateContent: string, 
  data: Record<string, string>
): string {
  let result = templateContent;
  
  // Replace semua {{variable}} dengan data
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    result = result.replace(regex, value);
  });
  
  return result;
}
```

---

## 🚀 Quick Reference: Admin Tasks

| Task | Location | Action |
|------|----------|--------|
| **Tambah Field Baru** | Edit Template → Field Config | Auto-Generate atau Add Manual |
| **Ubah Label** | Field Configuration → Edit Field | Change "Label" value |
| **Ubah Type Input** | Field Configuration → Edit Field | Select dropdown (text/textarea/etc) |
| **Set Required** | Field Configuration → Toggle | ON = wajib, OFF = opsional |
| **Reorder Fields** | Field Configuration | Drag & drop |
| **Set Validation** | Field Configuration → Validation | Min/Max/Pattern |
| **Preview Form** | - | Lihat di halaman mahasiswa |

---

## 🎯 Kesimpulan

**Admin punya FULL CONTROL atas form mahasiswa tanpa coding!**

- ✅ Tambah/edit/hapus field dari web
- ✅ Atur validasi dari web
- ✅ Ubah urutan dari web
- ✅ Real-time update
- ✅ Zero deployment

**Mahasiswa otomatis dapat form yang up-to-date!**

- ✅ Form selalu sync dengan template admin
- ✅ Validation otomatis
- ✅ UX konsisten
- ✅ Error handling built-in

---

## 📚 File References

- **Dynamic Form Component**: `app/feature/template/components/dynamic-form-from-template.tsx`
- **Field Configurator**: `app/feature/template/components/template-field-configurator.tsx`
- **Edit Dialog**: `app/feature/template/components/edit-template-dialog.tsx`
- **Example Implementation**: `app/feature/template/examples/mahasiswa-dynamic-form-example.tsx`
- **Template Management**: `app/feature/template/pages/template-management-page.tsx`

---

**Need Help?** Check:
- [SOLUTION_DYNAMIC_TEMPLATE.md](./SOLUTION_DYNAMIC_TEMPLATE.md) - Technical details
- [QUICK_START.md](./QUICK_START.md) - Getting started
- [ADMIN_GUIDE_WORD_PDF.md](./ADMIN_GUIDE_WORD_PDF.md) - Word/PDF support