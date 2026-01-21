# Quick Start Guide - Template Management

## Untuk Admin

### 1. Akses Halaman Template Management
- Login sebagai admin
- Klik menu **Template** di sidebar
- Pilih **Kelola Template**

### 2. Membuat Template Baru

#### Cara 1: Upload File Template
1. Klik tombol **"Tambah Template"**
2. Isi nama template (contoh: "Berita Acara Sidang KP 2025")
3. Pilih jenis template dari dropdown (contoh: "Berita Acara")
4. Pilih format file (HTML/DOCX/TXT)
5. Isi deskripsi (opsional)
6. Klik tombol **upload file** dan pilih file template Anda
7. Preview akan muncul otomatis
8. Klik **"Simpan Template"**

#### Cara 2: Ketik Langsung
1. Klik tombol **"Tambah Template"**
2. Isi form seperti di atas
3. Ketik atau paste konten template langsung ke textarea "Konten Template"
4. Klik **"Simpan Template"**

### 3. Edit Template dengan Code Editor
1. Pada tabel template, klik icon **⋮** (titik tiga) di kolom Aksi
2. Pilih **"Edit"**
3. Dialog dengan code editor akan muncul
4. Edit konten template menggunakan editor:
   - **Ctrl+F**: Find/Search
   - **Ctrl+H**: Find & Replace
   - **Ctrl+Z**: Undo
   - **Ctrl+Y**: Redo
5. Ubah nama, jenis, atau deskripsi jika perlu
6. Klik **"Simpan Perubahan"**

### 4. Kelola Template
- **Aktifkan/Nonaktifkan**: Klik ⋮ → "Nonaktifkan" (template nonaktif tidak akan muncul di pilihan)
- **Download**: Klik ⋮ → "Download" (download template ke komputer)
- **Hapus**: Klik ⋮ → "Hapus" (hapus permanen template)

### 5. Filter dan Cari Template
- **Search**: Ketik nama template di search box
- **Filter**: Pilih jenis template dari dropdown filter

## Template Variables

Gunakan syntax `{{nama_variabel}}` untuk membuat placeholder yang akan diisi otomatis.

### Contoh Template HTML:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Berita Acara Sidang</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
        }
        h1 { 
            text-align: center; 
            text-transform: uppercase;
        }
        .info { 
            margin: 20px 0; 
            line-height: 1.8;
        }
        .signatures {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
        }
    </style>
</head>
<body>
    <h1>Berita Acara Sidang Kerja Praktek</h1>
    
    <div class="info">
        <p>Pada hari ini, <strong>{{tanggal}}</strong>, telah dilaksanakan sidang kerja praktek dengan hasil sebagai berikut:</p>
        
        <table>
            <tr>
                <td>Nama Mahasiswa</td>
                <td>: {{nama_mahasiswa}}</td>
            </tr>
            <tr>
                <td>NIM</td>
                <td>: {{nim}}</td>
            </tr>
            <tr>
                <td>Program Studi</td>
                <td>: {{prodi}}</td>
            </tr>
            <tr>
                <td>Judul KP</td>
                <td>: {{judul}}</td>
            </tr>
            <tr>
                <td>Pembimbing</td>
                <td>: {{nama_pembimbing}}</td>
            </tr>
            <tr>
                <td>Penguji</td>
                <td>: {{nama_penguji}}</td>
            </tr>
            <tr>
                <td>Nilai Akhir</td>
                <td>: {{nilai}} ({{predikat}})</td>
            </tr>
        </table>
    </div>
    
    <div class="signatures">
        <div>
            <p>Pembimbing,</p>
            <br><br><br>
            <p>{{nama_pembimbing}}</p>
        </div>
        <div>
            <p>Penguji,</p>
            <br><br><br>
            <p>{{nama_penguji}}</p>
        </div>
    </div>
</body>
</html>
```

### Variabel yang Umum Digunakan:
- `{{tanggal}}` - Tanggal (akan diisi otomatis)
- `{{nama_mahasiswa}}` - Nama lengkap mahasiswa
- `{{nim}}` - NIM mahasiswa
- `{{prodi}}` - Program studi
- `{{judul}}` - Judul KP
- `{{nama_pembimbing}}` - Nama dosen pembimbing
- `{{nama_penguji}}` - Nama dosen penguji
- `{{nama_mentor}}` - Nama mentor lapangan
- `{{perusahaan}}` - Nama perusahaan
- `{{nilai}}` - Nilai akhir
- `{{predikat}}` - Predikat nilai (A/B/C/D)

## Tips

### 1. Konsistensi Penamaan Variabel
Gunakan format yang konsisten untuk variabel:
- Huruf kecil semua
- Pisahkan dengan underscore (_)
- Contoh: `nama_mahasiswa`, `tanggal_sidang`, `nilai_akhir`

### 2. Testing Template
Setelah membuat template:
1. Download template
2. Buka di browser/text editor
3. Manual replace variabel dengan data dummy
4. Pastikan format dan layout sudah benar

### 3. Backup Template
Selalu download backup template sebelum melakukan edit besar.

### 4. Dokumentasi Template
Isi deskripsi template dengan informasi:
- Untuk apa template ini digunakan
- Kapan template ini digunakan
- Variabel apa saja yang diperlukan

## Troubleshooting

### Template tidak muncul di dropdown
- Pastikan template statusnya "Aktif"
- Cek filter jenis template

### Variabel tidak ter-replace
- Pastikan format variabel benar: `{{nama}}` bukan `{nama}` atau `[[nama]]`
- Pastikan tidak ada spasi: `{{nama}}` bukan `{{ nama }}`

### Editor lambat
- Tutup dialog editor dan buka kembali
- Hindari template yang terlalu besar (> 10000 baris)

## Contoh Use Case

### Use Case 1: Generate Berita Acara Sidang
1. Admin membuat template "Berita Acara Sidang"
2. Mahasiswa selesai sidang, nilai sudah keluar
3. Admin/Dosen membuka halaman penilaian
4. Klik "Generate Berita Acara"
5. Sistem otomatis:
   - Load template "Berita Acara"
   - Ambil data mahasiswa (nama, nim, judul, nilai)
   - Replace variabel dengan data aktual
   - Generate file HTML/PDF
   - Download otomatis

### Use Case 2: Form Nilai untuk Mentor Lapangan
1. Admin membuat template "Form Penilaian Mentor"
2. Mentor lapangan login
3. Akses form penilaian mahasiswa
4. Sistem generate form dari template
5. Mentor isi nilai
6. Submit dan simpan ke database
7. Download form yang sudah terisi

## Best Practices

1. **Buat Template Modular**: Pisahkan template berdasarkan fungsi (berita acara, form nilai, dll)
2. **Versioning**: Tambahkan tahun di nama template (contoh: "Berita Acara 2025")
3. **Regular Review**: Review template setiap semester untuk update format/aturan baru
4. **User Friendly**: Buat nama variabel yang jelas dan mudah dipahami
5. **Consistent Styling**: Gunakan CSS yang konsisten untuk semua template

---

**Butuh bantuan?** Hubungi tim IT support.
