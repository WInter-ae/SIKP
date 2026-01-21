# 📖 Panduan Admin: Upload Template Word & Generate PDF

## 🎯 Ringkasan

Sistem template sekarang **support 3 format**:

| Format | Untuk Apa | Variable Format | Output |
|--------|-----------|-----------------|--------|
| **HTML** | Template web, bisa jadi PDF | `{{nama}}` | HTML atau PDF |
| **Word (.docx)** | Dokumen professional | `{nama}` | Word (.docx) |
| **Text (.txt)** | Template sederhana | `{{nama}}` | Text (.txt) |

---

## 📝 Cara 1: Upload Template Word (.docx)

### Step 1: Buat Template di Microsoft Word

1. Buka Microsoft Word
2. Buat dokumen seperti biasa
3. **Gunakan `{nama_variable}` untuk placeholder** (single curly braces!)

**Contoh Template Word:**

```
UNIVERSITAS NEGERI PADANG
FAKULTAS TEKNIK

BERITA ACARA SIDANG KERJA PRAKTEK

Pada hari ini, {hari}, tanggal {tanggal}, bulan {bulan}, tahun {tahun}, 
telah dilaksanakan Sidang Kerja Praktek dengan data sebagai berikut:

Nama Mahasiswa  : {nama_mahasiswa}
NIM             : {nim}
Jurusan         : {jurusan}
Judul KP        : {judul_kp}

Tim Penguji:
1. Ketua Penguji : {nama_ketua_penguji}
2. Anggota       : {nama_anggota_penguji}

Nilai Akhir: {nilai}

Dengan ini dinyatakan bahwa mahasiswa tersebut dinyatakan {status}.

Padang, {tanggal_ttd}

                                             Ketua Penguji,



                                             {nama_ketua_penguji}
                                             NIP. {nip_ketua_penguji}
```

### Step 2: Upload ke Sistem

1. Buka halaman **/admin/template**
2. Klik tombol **"Tambah Template"**
3. Isi form:
   - **Nama Template**: "Berita Acara Sidang KP"
   - **Tipe Template**: Pilih "Berita Acara"
   - **File Extension**: Pilih **"DOCX"**
4. Klik **"Browse"** dan pilih file .docx Anda
5. Klik **"Upload"**

### Step 3: System Auto-Detect Variables

System akan otomatis mendeteksi semua `{variable}` dalam file Word Anda!

**Contoh hasil deteksi:**
- `{nama_mahasiswa}` → Field "Nama Mahasiswa" (type: text)
- `{nim}` → Field "NIM" (type: text)
- `{nilai}` → Field "Nilai" (type: number)
- `{tanggal}` → Field "Tanggal" (type: date)

### Step 4: Configure Fields (Optional)

Klik **"Edit"** pada template untuk customize fields:

- **Label**: Ganti label yang user-friendly
- **Type**: text, textarea, number, date, email, select
- **Required**: Wajib diisi atau tidak
- **Validation**: Min/max length, pattern, dll
- **Order**: Drag & drop untuk urutan form

### Step 5: Done! ✅

Sekarang mahasiswa bisa:
1. Buka halaman yang menggunakan template ini
2. Isi form yang auto-generated
3. Klik **"Generate Document"**
4. Download file Word (.docx) yang sudah terisi!

---

## 🖨️ Cara 2: Template HTML → Export PDF

### Step 1: Buat Template HTML

Gunakan HTML dengan styling yang bagus:

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
            line-height: 1.6;
            padding: 40px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .header h1 {
            font-size: 16pt;
            margin: 5px 0;
        }
        
        .content {
            margin: 20px 0;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        table td {
            padding: 8px;
            border: 1px solid #000;
        }
        
        table td:first-child {
            width: 40%;
            font-weight: bold;
        }
        
        .signature {
            margin-top: 50px;
            float: right;
            text-align: center;
            width: 200px;
        }
        
        .signature-space {
            height: 60px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>UNIVERSITAS NEGERI PADANG</h1>
        <h1>FAKULTAS TEKNIK</h1>
        <p>Jl. Prof. Dr. Hamka - Air Tawar, Padang</p>
    </div>
    
    <h2 style="text-align: center;">FORM PENILAIAN KERJA PRAKTEK</h2>
    
    <table>
        <tr>
            <td>Nama Mahasiswa</td>
            <td>{{nama_mahasiswa}}</td>
        </tr>
        <tr>
            <td>NIM</td>
            <td>{{nim}}</td>
        </tr>
        <tr>
            <td>Jurusan</td>
            <td>{{jurusan}}</td>
        </tr>
        <tr>
            <td>Judul KP</td>
            <td>{{judul_kp}}</td>
        </tr>
        <tr>
            <td>Tempat KP</td>
            <td>{{tempat_kp}}</td>
        </tr>
    </table>
    
    <h3>Penilaian:</h3>
    <table>
        <tr>
            <td>Sikap dan Kedisiplinan</td>
            <td>{{nilai_sikap}}</td>
        </tr>
        <tr>
            <td>Kemampuan Teknis</td>
            <td>{{nilai_teknis}}</td>
        </tr>
        <tr>
            <td>Laporan</td>
            <td>{{nilai_laporan}}</td>
        </tr>
        <tr>
            <td><strong>NILAI AKHIR</strong></td>
            <td><strong>{{nilai_akhir}}</strong></td>
        </tr>
    </table>
    
    <div class="signature">
        <p>Padang, {{tanggal}}</p>
        <p>Dosen Pembimbing,</p>
        <div class="signature-space"></div>
        <p><strong>{{nama_dosen}}</strong></p>
        <p>NIP. {{nip_dosen}}</p>
    </div>
</body>
</html>
```

### Step 2: Upload Template HTML

1. Buka **/admin/template**
2. Klik **"Tambah Template"**
3. Isi form:
   - **Nama**: "Form Penilaian KP"
   - **Tipe**: "Form Nilai"
   - **File Extension**: **"HTML"**
4. Paste HTML di atas atau upload file .html
5. **"Upload"**

### Step 3: Mahasiswa Isi Form

Sama seperti Word template, form auto-generate berdasarkan `{{variables}}`.

### Step 4: Download Options

Mahasiswa bisa pilih 2 opsi download:

1. **Download HTML** → File .html (bisa dibuka di browser)
2. **Download PDF** → File .pdf (convert dari HTML) ✨

**Cara generate PDF:**

```typescript
// Di component mahasiswa
import { generatePDFFromHTMLMultiPage, downloadBlob } from "~/feature/template/services/word-pdf.service";

const handleDownloadPDF = async () => {
  // Render HTML dengan data form
  const htmlContent = renderHTMLTemplate(template, formData);
  
  // Generate PDF
  const pdfBlob = await generatePDFFromHTMLMultiPage(htmlContent);
  
  // Download
  downloadBlob(pdfBlob, "Form_Penilaian_KP.pdf");
  
  toast.success("PDF berhasil di-generate!");
};
```

---

## 🎨 Tips & Best Practices

### Untuk Template Word:

✅ **DO:**
- Gunakan `{variable}` (single curly)
- Gunakan table untuk layout rapih
- Test di Word dulu sebelum upload
- File max 5MB
- Format: .docx (bukan .doc lama)

❌ **DON'T:**
- Jangan `{{variable}}` (double curly) ❌
- Jangan terlalu banyak formatting complex
- Jangan include image terlalu besar
- Jangan pakai special characters di variable name

### Untuk Template HTML (untuk PDF):

✅ **DO:**
- Gunakan `{{variable}}` (double curly)
- **Inline CSS** atau `<style>` tag
- Test di browser dulu
- Set `@page` size (A4, Letter, dll)
- Compress images (base64 atau URL)
- Gunakan font standard (Arial, Times, dll)

❌ **DON'T:**
- Jangan external CSS file ❌
- Jangan JavaScript (tidak akan jalan)
- Jangan relative URLs untuk images
- Jangan formatting terlalu complex

---

## 🔧 Troubleshooting

### Problem: Variable tidak ter-replace di Word

**Solusi:**
1. ✅ Check format: `{nama}` bukan `{{nama}}`
2. ✅ Check typo (case-sensitive!)
3. ✅ Re-save Word file (kadang corrupt)
4. ✅ Pastikan variable ada di field configuration

### Problem: PDF styling hilang

**Solusi:**
1. ✅ Gunakan inline CSS: `<p style="color: red">`
2. ✅ Atau `<style>` tag di `<head>`
3. ✅ Jangan external stylesheet
4. ✅ Test HTML di browser dulu

### Problem: PDF multi-page tidak pecah dengan baik

**Solusi:**
1. ✅ Gunakan `generatePDFFromHTMLMultiPage` bukan `generatePDFFromHTML`
2. ✅ Set CSS page break:
   ```css
   .page-break {
       page-break-after: always;
   }
   ```

### Problem: Image tidak muncul di PDF

**Solusi:**
1. ✅ Gunakan base64 encoded image:
   ```html
   <img src="data:image/png;base64,iVBORw0KGgoAAAANS..." />
   ```
2. ✅ Atau full URL dengan CORS enabled
3. ✅ Compress image untuk performa

---

## 📊 Comparison: Word vs PDF

| Aspek | Word (.docx) | PDF |
|-------|-------------|-----|
| **Professional Look** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Editable** | ✅ Yes | ❌ No |
| **Styling Control** | ⚠️ Limited | ✅ Full (CSS) |
| **File Size** | Small-Medium | Medium-Large |
| **Print Ready** | ✅ | ✅ |
| **Universal Support** | ⚠️ Need Office | ✅ All devices |
| **Template Creation** | Easy (MS Word) | Medium (HTML) |

**Rekomendasi:**
- **Word**: Untuk dokumen yang perlu diedit lagi (draft, internal)
- **PDF**: Untuk dokumen final/official (cetak, arsip, submit)

---

## 🚀 Example: Complete Workflow

### Scenario: Admin Upload Berita Acara

1. Admin buat template di Word dengan variable `{nama_mahasiswa}`, `{nim}`, dll
2. Upload file .docx ke sistem
3. System auto-detect 15 variables
4. Admin configure fields:
   - Label yang jelas
   - Set validation (required, min length, dll)
   - Reorder dengan drag-drop
5. Save template ✅

### Mahasiswa Flow:

1. Buka halaman "Pasca Magang"
2. Klik "Generate Berita Acara"
3. Form muncul otomatis dengan 15 fields
4. Isi semua data (validation otomatis)
5. Klik "Generate Document"
6. Pilih format:
   - **Word** → Editable, bisa diedit lagi
   - **PDF** → Final, ready to print
7. Download! 🎉

### Admin Update Template:

1. Admin tambah variable baru: `{email_mahasiswa}`
2. Edit field configuration → Add "Email" field
3. Save changes

**Magic:** ✨
- Form mahasiswa **otomatis update** dengan field email baru!
- Zero deployment needed
- Mahasiswa langsung lihat perubahan

---

## 📚 Resources

- [SOLUTION_DYNAMIC_TEMPLATE.md](./SOLUTION_DYNAMIC_TEMPLATE.md) - Complete technical docs
- [WORD_PDF_SUPPORT.md](./WORD_PDF_SUPPORT.md) - Word & PDF implementation details
- [word-pdf-examples.tsx](./examples/word-pdf-examples.tsx) - Code examples

---

**🎉 Selamat! Sistem template Anda sekarang support Word & PDF!**

Need help? Check documentation atau contact dev team.