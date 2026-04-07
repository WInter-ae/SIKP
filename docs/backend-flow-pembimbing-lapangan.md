# Dokumentasi Backend: Flow Pembimbing Lapangan, Dosen PA, dan Login Email

## Tujuan
Dokumen ini menjelaskan alur yang diperlukan agar pembimbing lapangan bisa memakai aplikasi tanpa dibuatkan email baru, dengan approval oleh Dosen PA.

## Prinsip Utama
- Email pembimbing lapangan memakai email kerja yang sudah ada.
- Aplikasi tidak membuat inbox email baru.
- Saat disetujui, sistem membuat akun aplikasi dan mengirim aktivasi ke email mentor.
- Email mentor tidak diedit langsung dari profil, tetapi lewat pengajuan perubahan email.
- Dosen PA dapat melihat logbook mahasiswa secara read-only.

## Klarifikasi Email Otomatis
Yang dimaksud "otomatis" di sini bukan membuat alamat email baru seperti `nama@domain.com` dari nol. Yang dibuat otomatis adalah:
- akun aplikasi pembimbing lapangan di sistem,
- status akun mentor (active/verified),
- token aktivasi atau magic link,
- email notifikasi/invitation ke alamat email yang sudah dimiliki mentor.

Jadi, backend hanya perlu mengelola akun aplikasi dan pengiriman email undangan/aktivasi. Pembuatan inbox email baru tidak termasuk scope aplikasi ini.

## Ringkasan Flow
```text
Mahasiswa mengajukan mentor
  ↓
Pengajuan masuk status pending
  ↓
Dosen PA review
  ↓
Jika approve → buat akun aplikasi mentor + kirim aktivasi ke email mentor
Jika reject  → tandai rejected + kirim notifikasi penolakan
```

## Alur Registrasi Pembimbing Lapangan
1. Mahasiswa mengisi data pembimbing lapangan.
2. Data masuk ke status pending.
3. Dosen PA meninjau pengajuan.
4. Jika disetujui, backend:
   - Membuat akun mentor jika belum ada.
   - Menandai mentor sebagai verified/active.
   - Mengirim email aktivasi atau magic link.
5. Jika ditolak, status menjadi rejected dan mahasiswa diberi notifikasi.

## Alur Login Mentor
- Mentor login menggunakan email kerja yang terdaftar.
- Rekomendasi implementasi: magic link atau invitation link.
- Jika memakai password, mentor set password pertama kali setelah aktivasi.

## Perubahan Email Mentor
- Field email di profil mentor read-only.
- Mentor dapat mengajukan perubahan email beserta alasan.
- Dosen PA/Admin meninjau pengajuan.
- Jika disetujui, email akun diperbarui dan token/aktivasi baru dikirim.
- Jika ditolak, email tetap tidak berubah.

## Monitoring Logbook oleh Dosen PA
- Dosen PA hanya melihat logbook mahasiswa.
- Tidak ada aksi approve/reject pada logbook.
- Data yang ditampilkan minimal: mahasiswa, NIM, perusahaan, mentor, tanggal, aktivitas, dan status.

## Endpoint yang Diperlukan

### Format response umum yang disarankan
Semua endpoint sebaiknya mengembalikan format berikut agar konsisten dengan frontend:
```json
{
  "success": true,
  "message": "string",
  "data": {},
  "errors": []
}
```

### Persetujuan Pembimbing Lapangan
| Method | Endpoint | Fungsi | Catatan |
| --- | --- | --- | --- |
| GET | `/api/dosen/pembimbing-lapangan/requests` | Ambil daftar pengajuan mentor | Hanya untuk role Dosen PA/Admin |
| POST | `/api/dosen/pembimbing-lapangan/:id/approve` | Setujui pengajuan mentor | Membuat/aktivasi akun mentor |
| POST | `/api/dosen/pembimbing-lapangan/:id/reject` | Tolak pengajuan mentor | Status menjadi rejected |

### Pengajuan Perubahan Email Mentor
| Method | Endpoint | Fungsi | Catatan |
| --- | --- | --- | --- |
| POST | `/api/mentor/email-change-requests` | Buat pengajuan perubahan email | Diisi mentor dari profil |
| GET | `/api/dosen/mentor-email-change-requests` | Ambil daftar pengajuan email | Untuk Dosen PA/Admin |
| POST | `/api/dosen/mentor-email-change-requests/:id/approve` | Setujui perubahan email | Update email akun mentor |
| POST | `/api/dosen/mentor-email-change-requests/:id/reject` | Tolak perubahan email | Email lama tetap aktif |

### Aktivasi Akun Mentor
| Method | Endpoint | Fungsi | Catatan |
| --- | --- | --- | --- |
| POST | `/api/auth/mentor/invite` | Kirim email aktivasi / magic link | Dipanggil saat approve |
| POST | `/api/auth/mentor/activate` | Verifikasi token aktivasi | Token one-time use |
| POST | `/api/auth/mentor/set-password` | Set password awal | Jika flow memakai password |

### Monitoring Logbook Dosen PA
| Method | Endpoint | Fungsi | Catatan |
| --- | --- | --- | --- |
| GET | `/api/dosen/logbook-monitor` | Ambil daftar logbook mahasiswa | Read-only |
| GET | `/api/dosen/logbook-monitor/:studentId` | Ambil detail logbook mahasiswa | Optional |

## Format Data yang Disarankan

### Pengajuan Pembimbing Lapangan
```json
{
  "id": "req_123",
  "mentorName": "Ahmad Fauzi",
  "email": "ahmad.fauzi@company.com",
  "nip": "198501012010011001",
  "company": "PT Teknologi Nusantara",
  "position": "Senior Software Engineer",
  "phone": "081234567890",
  "student": {
    "id": "mhs_001",
    "name": "Budi Santoso",
    "nim": "2021110001",
    "email": "budi.santoso@student.ac.id"
  },
  "status": "pending",
  "createdAt": "2026-04-03T10:00:00Z"
}
```

### Pengajuan Perubahan Email
```json
{
  "id": "emailchg_123",
  "mentorId": "mnt_001",
  "mentorName": "Ahmad Fauzi",
  "currentEmail": "ahmad.fauzi@company.com",
  "requestedEmail": "a.fauzi@company.com",
  "reason": "Email kerja resmi yang aktif",
  "status": "pending",
  "requestedAt": "2026-04-03T10:00:00Z"
}
```

### Logbook Monitoring
```json
{
  "id": "lb_001",
  "studentId": "mhs_001",
  "studentName": "Budi Santoso",
  "nim": "2021110001",
  "company": "PT Teknologi Nusantara",
  "mentorName": "Ahmad Fauzi",
  "activity": "Implementasi dashboard",
  "date": "2026-04-02",
  "status": "PENDING"
}
```

## Aturan Bisnis
- Email harus unik.
- Token aktivasi harus one-time use dan expired.
- Semua aksi approve/reject wajib masuk audit log.
- Alur mentor harus minim friksi untuk pihak eksternal.
- Jika backend belum siap, frontend bisa memakai mock sementara.

## Acceptance Criteria
- Mentor dapat login dengan email aktif yang disetujui.
- Mentor tidak perlu membuat inbox email baru.
- Email tidak bisa diubah langsung dari profil.
- Pengajuan perubahan email dapat dibuat dari frontend.
- Dosen PA dapat approve/reject pengajuan email.
- Dosen PA dapat melihat logbook mahasiswa secara read-only.

## Checklist Implementasi Backend
- [ ] Siapkan endpoint approval pembimbing lapangan.
- [ ] Siapkan endpoint pengajuan perubahan email mentor.
- [ ] Siapkan endpoint kirim aktivasi / magic link mentor.
- [ ] Pastikan email unik dan tervalidasi sebelum approve.
- [ ] Tambahkan audit log untuk approve/reject.
- [ ] Tambahkan notifikasi email ke mentor saat approval atau perubahan email disetujui.
- [ ] Pastikan logbook monitoring hanya bisa diakses read-only.
