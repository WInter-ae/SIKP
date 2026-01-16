# E-Signature Flow - SIKP

## Alur E-Signature untuk Berita Acara Sidang

### 1. Dosen Membuat E-Signature

**Lokasi**: [Verifikasi Sidang Dosen Page](app/feature/hearing/pages/verifikasi-sidang-dosen-page.tsx)

- Dosen harus membuat e-signature terlebih dahulu sebelum bisa menyetujui pengajuan
- Klik tombol "Setup E-Signature" di header
- Pilih salah satu metode:
  - **Draw**: Menggambar tanda tangan menggunakan canvas
  - **Upload**: Upload gambar tanda tangan (max 2MB, format: PNG, JPG, JPEG)
  - **Text**: Ketik nama yang akan di-style sebagai tanda tangan
- E-signature disimpan di `localStorage` dengan key `dosen-esignature`

### 2. Dosen Menyetujui Pengajuan

**Lokasi**: [Verifikasi Sidang Dosen Page](app/feature/hearing/pages/verifikasi-sidang-dosen-page.tsx)

- Jika dosen belum membuat e-signature, akan muncul warning dan dialog untuk membuat signature
- Ketika klik "Setujui Pengajuan":
  - System mengecek apakah e-signature ada
  - Jika ada, proses approval dengan menambahkan signature ke berita acara
  - Berita acara yang sudah di-sign disimpan dengan informasi:
    ```typescript
    {
      ...beritaAcara,
      status: "approved",
      dosenSignature: {
        nama: "Dr. Ahmad Santoso, M.Kom",
        nip: "198501012010121001",
        signatureImage: "data:image/png;base64,...",
        signedAt: "2025-11-24T10:30:00"
      },
      documentUrl: "/api/documents/PGJ-001/signed"
    }
    ```

### 3. Berita Acara Terkirim ke Mahasiswa

**Cara Kerja Saat Ini (Development)**:
- Berita acara yang sudah di-approve disimpan ke `localStorage` dengan key `berita-acara-draft`
- Mahasiswa akan load data ini saat membuka halaman pengujian sidang

**Cara Kerja di Production (Recommended)**:
- API endpoint: `POST /api/berita-acara/{id}/approve`
- Request body berisi signature dan data approval
- Backend generate PDF/DOCX dengan signature embedded
- Document disimpan di storage (S3/Cloud Storage)
- Notification dikirim ke mahasiswa (email/push notification)
- Mahasiswa akses melalui API: `GET /api/berita-acara/{id}`

### 4. Mahasiswa Melihat & Download Berita Acara

**Lokasi**: [Pengujian Sidang Page](app/feature/hearing/pages/pengujian-sidang-page.tsx)

- Jika `beritaAcara.status === "approved"`, tampilan berubah menjadi download view
- Komponen yang ditampilkan: [BeritaAcaraDownload](app/feature/hearing/components/berita-acara-download.tsx)
- Mahasiswa dapat:
  - Melihat detail berita acara
  - Melihat informasi dosen yang menandatangani
  - Melihat waktu penandatanganan digital
  - Download dokumen dalam format PDF atau DOCX

### File yang Dimodifikasi

1. **Types**:
   - `app/feature/hearing/types/index.d.ts` - Tambahan field `dosenSignature` dan `documentUrl`
   - `app/feature/hearing/types/esignature.ts` - Type definitions untuk e-signature

2. **Components**:
   - `app/feature/hearing/components/esignature-setup.tsx` - Setup e-signature component
   - `app/feature/hearing/components/berita-acara-download.tsx` - Download view component

3. **Pages**:
   - `app/feature/hearing/pages/verifikasi-sidang-dosen-page.tsx` - Approval dengan e-signature
   - `app/feature/hearing/pages/pengujian-sidang-page.tsx` - Conditional rendering (download vs form)

### Template Document (Belum Diimplementasi)

**User Notes**: "saya belum siapkan templatenya"

Untuk implementasi penuh, diperlukan:

1. **PDF Template**:
   - Format: PDF dengan form fields
   - Library: `pdf-lib` atau `pdfkit`
   - Template fields: judul, tempat, tanggal, waktu, mahasiswa info, area untuk signature

2. **DOCX Template**:
   - Format: DOCX dengan placeholders
   - Library: `docxtemplater` atau `docx`
   - Template variables: {{judulLaporan}}, {{tempatPelaksanaan}}, etc.

3. **Implementation Steps**:
   ```typescript
   // Backend function untuk generate document
   async function generateSignedDocument(
     beritaAcara: BeritaAcara,
     signature: DosenESignature
   ) {
     // Load template
     const template = await loadTemplate('berita-acara-template.pdf');
     
     // Fill data
     template.fill({
       judulLaporan: beritaAcara.judulLaporan,
       tempatPelaksanaan: beritaAcara.tempatPelaksanaan,
       // ... other fields
     });
     
     // Embed signature image
     template.embedImage(signature.signatureImage, {
       x: 450,
       y: 100,
       width: 100,
       height: 50
     });
     
     // Save to storage
     const documentUrl = await saveToStorage(template);
     
     return documentUrl;
   }
   ```

### Testing Flow

1. **Buka halaman Dosen** → `/verifikasi-sidang`
2. **Klik "Setup E-Signature"**
3. **Buat signature** (draw/upload/text)
4. **Pilih pengajuan mahasiswa**
5. **Klik "Setujui Pengajuan"**
6. **Cek localStorage**: `berita-acara-draft` seharusnya memiliki `dosenSignature`
7. **Buka halaman Mahasiswa** → `/pengujian-sidang`
8. **Lihat download view** dengan tombol "Unduh PDF" dan "Unduh DOCX"

### Security Considerations

1. **E-Signature Storage**:
   - Saat ini: localStorage (development only)
   - Production: Encrypted database storage
   - Tidak boleh di-expose ke client

2. **Document Verification**:
   - Tambahkan digital signature hash
   - Verifikasi integrity document
   - Timestamp dari trusted source

3. **Access Control**:
   - Hanya mahasiswa yang bersangkutan bisa download
   - Dosen bisa revoke approval jika diperlukan
   - Audit log untuk semua approval

### Next Steps

1. ✅ Setup e-signature component
2. ✅ Validation sebelum approval
3. ✅ Apply signature ke berita acara
4. ✅ Download view untuk mahasiswa
5. ⏳ Prepare document templates (PDF/DOCX)
6. ⏳ Implement document generation logic
7. ⏳ Backend API integration
8. ⏳ Real-time notification system
9. ⏳ Document verification & security

---

**Status**: Frontend implementation complete. Waiting for document templates and backend integration.
