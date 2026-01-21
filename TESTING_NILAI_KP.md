# Testing Nilai KP - Generate PDF

## Langkah-langkah Testing:

### 1. Simulasi Input Nilai dari Dosen

Buka **Browser Console** dan jalankan kode berikut untuk mensimulasikan dosen memberikan nilai:

```javascript
// Simulasi data nilai dari dosen
const nilaiData = {
  // Data Mahasiswa
  namaMahasiswa: "Rizki Maulana",
  nim: "1234567892",
  programStudi: "Teknik Informatika",
  tempatKP: "PT. Teknologi Nusantara",
  judulLaporan: "Sistem Informasi Manajemen Berbasis Web",
  waktuPelaksanaan: "Juli 2025 s.d. September 2025",
  dosenPembimbing: "Dr. Ahmad Santoso, M.Kom",
  pembimbingLapangan: "Budi Hartono, S.Kom",
  
  // Nilai
  kesesuaianLaporan: 90,
  penguasaanMateri: 90,
  analisisPerancangan: 90,
  sikapEtika: 90,
  
  // Data Dosen
  dosenPenguji: "Dr. Ahmad Santoso, M.Kom",
  nipDosen: "198501122010121001",
  eSignatureUrl: "", // Kosongkan dulu atau isi dengan URL e-signature
  tanggalPenilaian: new Date().toISOString(),
  
  // Student ID untuk tracking
  studentId: "1234567892",
};

// Simpan ke localStorage
localStorage.setItem('nilai-kp-1234567892', JSON.stringify(nilaiData));
localStorage.setItem('nilai-kp', JSON.stringify(nilaiData));

console.log("✅ Nilai berhasil disimpan!");
console.log("Refresh halaman untuk melihat nilai");
```

### 2. Refresh Halaman

Setelah menjalankan script di atas, **refresh halaman** (F5 atau Ctrl+R).

### 3. Cek Console untuk Debugging

Saat klik tombol "Cetak Form Nilai KP (PDF)", perhatikan console log:

```
=== DEBUGGING PDF GENERATION ===
Current nilaiKP state: {...}
Current mockMahasiswa: {...}
=== FORM DATA TO BE PRINTED ===
Printing form with data: {...}
Data validation:
- namaMahasiswa: Rizki Maulana
- nim: 1234567892
- kesesuaianLaporan: 90
...
```

### 4. Periksa Data

Pastikan semua field terisi dengan benar:
- ✅ Nama mahasiswa ada
- ✅ NIM ada  
- ✅ Nilai ada (bukan 0 atau undefined)
- ✅ Nama dosen ada
- ✅ NIP ada

### 5. Testing E-Signature (Opsional)

Untuk menambahkan e-signature dosen, gunakan base64 image:

```javascript
// Contoh menambahkan e-signature
const currentNilai = JSON.parse(localStorage.getItem('nilai-kp'));
currentNilai.eSignatureUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
localStorage.setItem('nilai-kp', JSON.stringify(currentNilai));
localStorage.setItem('nilai-kp-1234567892', JSON.stringify(currentNilai));
console.log("✅ E-signature ditambahkan");
```

## Troubleshooting

### PDF Kosong?

1. **Cek Console Log** - Lihat apa yang dicetak saat klik tombol
2. **Cek localStorage** - Jalankan di console:
   ```javascript
   console.log(JSON.parse(localStorage.getItem('nilai-kp')));
   ```
3. **Pastikan library html2pdf loaded** - Cek di Network tab

### Nilai tidak muncul?

1. Pastikan sudah refresh halaman setelah input nilai
2. Cek apakah card biru "Nilai KP Sudah Diberikan" muncul
3. Lihat console untuk error

## Reset Data

Jika perlu reset semua:

```javascript
localStorage.removeItem('nilai-kp');
localStorage.removeItem('nilai-kp-1234567892');
localStorage.removeItem('laporan-kp');
console.log("✅ Data direset");
location.reload();
```
