# Troubleshooting - During Internship Module

## 🔒 Error: "Unauthorized: Invalid token"

### Penyebab
- Token JWT expired (masa berlaku habis)
- Token tidak valid
- Session timeout
- User logout dari device lain

### Solusi

#### 1. **Logout dan Login Ulang** ✅ (RECOMMENDED)
Cara paling mudah dan pasti berhasil:

1. Klik nama Anda di sidebar → **Logout**
2. Login kembali dengan email & password
3. Token baru akan di-generate
4. Coba buka halaman logbook lagi

#### 2. **Manual Clear Cache**
Jika auto-redirect tidak bekerja:

1. Buka **Developer Tools** (F12)
2. Tab **Console**
3. Ketik:
   ```javascript
   localStorage.clear()
   ```
4. Refresh halaman (Ctrl + R)
5. Login kembali

#### 3. **Hard Refresh**
Clear cache browser:
- **Chrome/Edge**: `Ctrl + Shift + R`
- **Firefox**: `Ctrl + F5`
- Lalu login ulang

---

## 📡 Error: "Gagal memuat data magang"

### Checklist

#### Backend
- [ ] Backend sudah running?
  - **Local**: `http://localhost:8787`
  - **Production**: `https://backend-sikp.backend-sikp.workers.dev`
- [ ] Test backend health: Buka `[BACKEND_URL]/health` di browser
- [ ] Check CORS settings di backend

#### Authentication
- [ ] Sudah login?
- [ ] Token tersedia? Check di Console:
  ```javascript
  console.log(localStorage.getItem('auth_token'))
  ```
- [ ] Token tidak expired?

#### Data Mahasiswa
- [ ] Submission sudah di-approve admin?
- [ ] Backend sudah auto-create internship record?
- [ ] Check di Network tab: status code 200 atau error?

---

## 🌐 Network Error / Timeout

### Penyebab
- Backend tidak running
- URL backend salah
- Network issue
- CORS issue

### Solusi

#### 1. **Check Environment Variable**
File: `.env` atau `.env.local`

```env
# Untuk development (local backend)
VITE_API_URL=http://localhost:8787

# Untuk production (Workers)
VITE_API_URL=https://backend-sikp.backend-sikp.workers.dev
```

#### 2. **Test Backend Connectivity**
Buka browser, coba akses:
```
http://localhost:8787/health
```

Harusnya return JSON:
```json
{
  "status": "ok",
  "message": "SIKP Backend API is running"
}
```

#### 3. **Check CORS**
Jika ada CORS error di Console:
- Pastikan backend sudah set CORS headers dengan benar
- Allow origin dari frontend URL

---

## 📊 Data Mahasiswa Kosong (Nama: -, NIM: -)

### Penyebab
- API return success tapi data null
- Internship record belum dibuat
- Submission belum approved

### Solusi

#### 1. **Check Response di Network Tab**
1. Buka **DevTools** (F12)
2. Tab **Network**
3. Filter: **Fetch/XHR**
4. Refresh halaman
5. Klik request `/api/mahasiswa/internship`
6. Tab **Response** - lihat isi response

**Response yang benar:**
```json
{
  "success": true,
  "data": {
    "student": {
      "name": "Robin",
      "nim": "12345",
      ...
    },
    "submission": {
      "company": "PT ABC",
      "division": "IT",
      ...
    }
  }
}
```

#### 2. **Check Status Pengajuan**
- Buka halaman **Pengajuan**
- Pastikan status: **APPROVED** (hijau)
- Jika masih PENDING/REJECTED, tunggu approval admin

#### 3. **Check Backend Data**
Akses backend endpoint langsung (buka di browser):
```
http://localhost:8787/api/mahasiswa/internship
```

**Catatan:** Harus sudah login agar token tersedia.

---

## 🔄 Auto-Populate Periode Tidak Bekerja

### Penyebab
- Submission tidak punya `startDate` dan `endDate`
- Data submission null
- Approval belum lengkap

### Solusi

1. **Check Console Log**
   ```
   ✅ AUTO-GENERATE SUCCESS: {...}
   ```
   
2. **Check Submission Data**
   Di Console, setelah halaman load:
   ```javascript
   // Lihat data submission
   console.log(completeData?.submission)
   ```

3. **Manual Input Periode**
   Jika auto-populate gagal:
   - Scroll ke **Step 1: Setup Periode**
   - Input manual tanggal mulai & selesai
   - Pilih hari kerja
   - Klik **Simpan Periode**

---

## 🚨 Quick Fixes

### "Cannot read property of null"
**Fix:** Logout dan login ulang

### "Network error"
**Fix:** Check backend running di port 8787

### "CORS error"
**Fix:** Tambahkan CORS headers di backend

### "Token expired"
**Fix:** Auto-redirect ke login (sudah di-handle otomatis)

### Data tidak update
**Fix:** Hard refresh (Ctrl + Shift + R)

---

## 📞 Masih Bermasalah?

### Langkah Debugging:

1. **Buka DevTools** (F12)
2. **Console Tab** - Copy semua error
3. **Network Tab** - Screenshot request yang failed
4. **Application Tab** → Storage → Local Storage
   - Copy: `auth_token` dan `user_data`

5. **Report ke Developer** dengan info:
   - Screenshot error
   - Console logs
   - Network request/response
   - Browser & version
   - Environment (local/production)

---

## ✅ Checklist Sebelum Report Bug

- [ ] Sudah logout dan login ulang?
- [ ] Backend sudah running?
- [ ] Environment variable sudah benar?
- [ ] Token masih valid? (cek di localStorage)
- [ ] Submission sudah approved?
- [ ] Hard refresh sudah dicoba?
- [ ] Clear cache sudah dicoba?

---

**Last Updated:** February 18, 2026  
**Module:** During Internship - Logbook
