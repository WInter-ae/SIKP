# RINGKASAN FRONTEND SIKP

## 1. Tujuan Dokumen
Dokumen ini adalah ringkasan teknis lengkap frontend SIKP (Sistem Informasi Kerja Praktik) Manajemen Informatika UNSRI berdasarkan kode yang ada di repository frontend saat ini.

Fokus dokumen:
- Menjelaskan arsitektur frontend dan pola implementasi utama.
- Menyajikan daftar fitur lengkap berdasarkan modul di app/feature.
- Menjelaskan alur proses bisnis KP dari sisi aplikasi frontend.
- Memberi status implementasi per fitur (Implemented, Partial, Mock/TODO).

Batasan:
- Ringkasan ini membahas frontend codebase.
- Detail backend hanya disebut jika berpengaruh langsung pada perilaku frontend.

---

## 2. Ringkasan Eksekutif
Frontend SIKP dibangun dengan React Router v7 (file based routing), React 19, TypeScript, Tailwind CSS v4, dan komponen UI berbasis Radix/shadcn.

Aplikasi memakai pola modular feature-first di folder app/feature, dengan route berbasis role:
- Mahasiswa
- Admin
- Dosen
- Pembimbing Lapangan (Mentor)

Alur utama mahasiswa mengikuti timeline KP 6 tahap:
1. Pembuatan Tim
2. Pengajuan
3. Surat Pengantar
4. Surat Balasan
5. Saat Magang
6. Pasca Magang

Fitur besar sudah tersedia di sisi frontend, tetapi beberapa area masih membutuhkan penguatan integrasi production backend (terutama template management, e-signature end-to-end, dan beberapa workflow yang masih mock/dev oriented).

---

## 3. Teknologi dan Fondasi Teknis

### 3.1 Stack Utama
- Framework routing: React Router v7 (flat routes dari file system).
- UI runtime: React 19.
- Bahasa: TypeScript.
- Styling: Tailwind CSS v4.
- Form dan validasi: React Hook Form + Zod.
- UI kit: Radix UI + komponen reusable di app/components/ui.
- Build tool: Vite.
- Notification: Sonner.

### 3.2 Script Project
Script utama:
- dev: react-router dev
- build: react-router build
- start: react-router-serve ./build/server/index.js
- typecheck: react-router typegen && tsc

### 3.3 Konfigurasi Runtime Frontend
- Dev proxy API: /api diarahkan ke http://127.0.0.1:8787.
- Base URL API fallback mengarah ke backend workers bila env tidak diisi.
- Aplikasi menggunakan shell global di root.tsx dengan provider tema dan provider user.

---

## 4. Arsitektur Aplikasi

### 4.1 Struktur Direktori Inti
- app/routes: route files berdasarkan konvensi React Router v7.
- app/feature: modul fitur domain.
- app/components: komponen global/reusable.
- app/contexts: state global (tema, user/auth).
- app/lib: utilitas, auth client, API client, service layer, dan types.

### 4.2 App Shell dan Provider
Aplikasi dibungkus provider global:
- ThemeProvider
- UserProvider

Layout route terproteksi menggunakan _sidebar.tsx:
- SidebarProvider
- AppSidebar
- SidebarInset
- Outlet

Artinya mayoritas halaman internal mengikuti shell sidebar yang sama, dengan konten halaman berubah sesuai route.

### 4.3 Pola Routing
Routing memakai flatRoutes dengan naming convention file:
- Prefix _ untuk layout/group segment.
- Dot (.) untuk nested segment.
- $ untuk dynamic parameter.

Contoh pola:
- _sidebar.mahasiswa.kp._timeline.pengajuan.tsx
- _sidebar.dosen.penilaian.beri-nilai.$id.tsx
- _sidebar.mentor.logbook-detail.$studentId.tsx

---

## 5. Auth, Otorisasi, dan Akses Role

### 5.1 Autentikasi Frontend
Frontend saat ini memakai penyimpanan token berbasis localStorage:
- auth_token
- user_data

Auth client menyediakan fungsi login/register/logout/get token/get current user.

### 5.2 User Context
UserProvider menyimpan:
- user
- token
- isLoading
- isAuthenticated
- logout

Saat mount, context mengambil user dan token dari localStorage.

### 5.3 Protected Route
ProtectedRoute mengecek:
- apakah user sudah autentikasi
- apakah role termasuk requiredRoles (jika diberikan)

Perilaku redirect:
- belum login -> /login
- role tidak sesuai -> /unauthorized

Catatan:
- role di model user meliputi MAHASISWA, ADMIN, DOSEN, KAPRODI, WAKIL_DEKAN, PEMBIMBING_LAPANGAN.
- sidebar juga punya diferensiasi jalur dosen vs wakil dekan berdasarkan field jabatan.

---

## 6. Pola API Frontend dan Service Layer

### 6.1 API Client
Ada wrapper api client terpusat dengan fitur:
- Generic typed response.
- Inject Authorization Bearer token otomatis.
- Dukungan JSON dan FormData upload.
- Helper method: get, post, put, patch, del, uploadFile.

### 6.2 Format Response
Pola respons standar frontend:
- success
- message
- data

Juga ada struktur paginated response dan error response terdefinisi di types.

### 6.3 Service Layer Domain
Service dipisah per domain, contoh:
- submission.service.ts
- team.service.ts
- mahasiswa-api.ts
- dosen-api.ts
- response-letter-api.ts
- template-api.ts
- surat-kesediaan-api.ts
- surat-permohonan-api.ts
- letter-request-status-api.ts

Pola ini memudahkan komponen halaman tetap fokus pada UI/UX, sedangkan detail request ada di service.

---

## 7. Peta Route Berdasarkan Role

### 7.1 Public Route
- /
- /login
- /register
- /pembimbing-lapangan
- /tentang
- /kontak
- /referensi
- /detail-referensi/:id

### 7.2 Mahasiswa
Route utama:
- /mahasiswa
- /mahasiswa/kp/buat-tim
- /mahasiswa/kp/pengajuan
- /mahasiswa/kp/surat-pengantar
- /mahasiswa/kp/surat-balasan
- /mahasiswa/kp/saat-magang
- /mahasiswa/kp/pengujian-sidang
- /mahasiswa/kp/pasca-magang
- /mahasiswa/kp/penilaian
- /mahasiswa/kp/laporan
- /mahasiswa/kp/template
- /mahasiswa/repositori
- /mahasiswa/repositori/:id
- /mahasiswa/mentor-lapangan
- /mahasiswa/profil

### 7.3 Admin
Route utama:
- /admin
- /admin/pengajuan-surat-pengantar
- /admin/surat-balasan
- /admin/persetujuan-pembimbing
- /admin/template
- /admin/penilaian
- /admin/penilaian/:id

### 7.4 Dosen
Route utama:
- /dosen
- /dosen/kp/surat-pengantar
- /dosen/kp/verifikasi-judul
- /dosen/kp/verifikasi-sidang
- /dosen/kp/verifikasi-surat
- /dosen/penilaian
- /dosen/penilaian/detail/:id
- /dosen/penilaian/beri-nilai/:id
- /dosen/profil

### 7.5 Mentor
Route utama:
- /mentor
- /mentor/mentee
- /mentor/mentee/:menteeId
- /mentor/logbook
- /mentor/logbook-detail/:studentId
- /mentor/penilaian
- /mentor/notifikasi
- /mentor/arsip
- /mentor/profil
- /mentor/pengaturan

---

## 8. Inventaris Fitur Lengkap (Berdasarkan app/feature)

Legenda status:
- Implemented: UI/flow frontend sudah tersedia dan dipakai route aktif.
- Partial: fitur ada, tetapi ada bagian penting yang masih terbatas atau belum production-ready penuh.
- Mock/TODO: dominan berbasis mock/local state/dev control atau integrasi backend belum final.

### 8.1 Surat Pengantar (cover-letter)
- Fungsi: Menampilkan status dan proses surat pengantar dalam alur KP mahasiswa.
- Aktor: Mahasiswa.
- Route terkait: tahap timeline surat pengantar mahasiswa.
- Alur ringkas: lihat status proses surat pengantar -> lanjut ke tahap berikut.
- Status: Implemented.

### 8.2 Pembuatan Tim (create-teams)
- Fungsi: Pembuatan tim KP, join tim, dan pengelolaan anggota.
- Aktor: Mahasiswa.
- Route terkait: /mahasiswa/kp/buat-tim.
- Alur ringkas: buat/bergabung tim -> validasi status tim -> lanjut pengajuan.
- Status: Implemented.

### 8.3 Dasbor (dashboard)
- Fungsi: Dashboard ringkasan per role.
- Aktor: Mahasiswa, Admin, Dosen, Mentor.
- Route terkait: /mahasiswa, /admin, /dosen, /mentor, dan route dashboard role redirect.
- Alur ringkas: login -> masuk dashboard sesuai role.
- Status: Implemented.

### 8.4 Penilaian Dosen (dosen-grading)
- Fungsi: Penilaian mahasiswa oleh dosen, termasuk workflow revisi dokumen.
- Aktor: Dosen.
- Route terkait: /dosen/penilaian, detail, beri-nilai.
- Alur ringkas: review revisi -> approve/reject revisi -> isi penilaian komponen -> simpan nilai.
- Status: Partial.
- Catatan status: dokumen modul menyebut masih ada keterbatasan seperti mock data dan beberapa enhancement lanjutan.

### 8.5 Saat Magang (during-intern)
- Fungsi: Aktivitas saat magang (logbook, assessment, monitoring tahap berjalan).
- Aktor: Mahasiswa (utama), juga menjadi data input bagi pihak penilai.
- Route terkait: /mahasiswa/kp/saat-magang, /mahasiswa/kp/logbook, /mahasiswa/kp/penilaian (timeline context).
- Alur ringkas: isi aktivitas/logbook -> submit data kegiatan -> dipakai untuk evaluasi/penilaian lanjutan.
- Status: Implemented.

### 8.6 Tanda Tangan Elektronik (esignature)
- Fungsi: Setup dan penggunaan tanda tangan elektronik pada alur dokumen sidang.
- Aktor: Dosen (utama), Mahasiswa (menerima hasil dokumen signed).
- Route terkait: terintegrasi pada verifikasi sidang dosen dan tampilan download mahasiswa.
- Alur ringkas: dosen setup signature -> approve dokumen sidang -> mahasiswa unduh dokumen signed.
- Status: Partial.
- Catatan status: flow frontend tersedia, tetapi integrasi production backend dan template dokumen final masih perlu penyempurnaan.

### 8.7 Evaluasi (evaluation)
- Fungsi: Evaluasi pasca magang dan ringkasan penilaian.
- Aktor: Admin dan Mahasiswa (pasca magang).
- Route terkait: /admin/penilaian, /admin/penilaian/:id, /mahasiswa/kp/pasca-magang.
- Alur ringkas: akumulasi hasil penilaian -> tampilkan detail evaluasi -> pemantauan hasil akhir.
- Status: Implemented.

### 8.8 Pembimbing Lapangan (field-mentor)
- Fungsi: Halaman mentor lapangan untuk monitoring logbook dan detail mahasiswa.
- Aktor: Pembimbing Lapangan dan Mahasiswa (akses halaman mentor lapangan mahasiswa).
- Route terkait: /mentor/logbook, /mentor/logbook-detail/:studentId, /mahasiswa/mentor-lapangan.
- Alur ringkas: mentor melihat logbook mahasiswa -> cek detail aktivitas -> masukan untuk penilaian.
- Status: Implemented.

### 8.9 Pengujian Sidang (hearing)
- Fungsi: Pengajuan dan status berita acara sidang mahasiswa.
- Aktor: Mahasiswa (pengajuan), Dosen (verifikasi melalui halaman terkait), Mahasiswa (download hasil).
- Route terkait: /mahasiswa/kp/pengujian-sidang.
- Alur ringkas: isi berita acara -> submit -> tunggu approve/reject -> jika approved dapat unduh dokumen.
- Status: Partial.
- Catatan status: dokumen fitur menyebut kebutuhan integrasi backend lanjutan dan generation dokumen production-ready.

### 8.10 Verifikasi Dosen (hearing-dosen)
- Fungsi: Verifikasi surat/ajuan oleh dosen pada jalur khusus verifikasi.
- Aktor: Dosen.
- Route terkait: /dosen/kp/verifikasi-surat.
- Alur ringkas: dosen review surat ajuan mahasiswa -> verifikasi status.
- Status: Implemented.

### 8.11 Laporan KP (kp-report)
- Fungsi: Pengelolaan laporan KP mahasiswa dan verifikasi judul oleh dosen.
- Aktor: Mahasiswa, Dosen.
- Route terkait: /mahasiswa/kp/laporan, /dosen/kp/verifikasi-judul.
- Alur ringkas: mahasiswa kelola laporan/judul -> dosen verifikasi judul -> lanjut tahap sidang/penilaian.
- Status: Implemented.

### 8.12 Masuk (login)
- Fungsi: Form login pengguna.
- Aktor: Semua role.
- Route terkait: /login.
- Alur ringkas: input kredensial -> simpan token/user -> masuk dashboard berdasarkan role.
- Status: Implemented.

### 8.13 Portal Mentor (mentor)
- Fungsi: Portal mentor untuk mentee, notifikasi, penilaian, arsip, profil, pengaturan.
- Aktor: Pembimbing Lapangan.
- Route terkait: seluruh route prefiks /mentor.
- Alur ringkas: mentor buka daftar mentee/logbook -> lakukan review/penilaian -> kelola profil dan pengaturan.
- Status: Implemented.

### 8.14 Profil Pengguna (profil)
- Fungsi: Halaman profil per role (minimal mahasiswa dan dosen).
- Aktor: Mahasiswa, Dosen.
- Route terkait: /mahasiswa/profil, /dosen/profil.
- Alur ringkas: lihat dan ubah data profil pengguna.
- Status: Implemented.

### 8.15 Registrasi (register)
- Fungsi: Registrasi akun baru, termasuk alur persetujuan pembimbing lapangan.
- Aktor: Mahasiswa (register), Admin (approval), calon pembimbing lapangan.
- Route terkait: /register, /pembimbing-lapangan, /admin/persetujuan-pembimbing.
- Alur ringkas: user daftar -> data dikirim ke backend/approval -> status registrasi diproses.
- Status: Partial.
- Catatan status: endpoint registrasi pembimbing lapangan di auth client ditandai belum tersedia pada backend sehingga ada keterbatasan flow end-to-end.

### 8.16 Repositori (repository)
- Fungsi: Repositori/arsip laporan dan detail dokumen.
- Aktor: Mahasiswa.
- Route terkait: /mahasiswa/repositori, /mahasiswa/repositori/:id.
- Alur ringkas: telusuri arsip laporan -> buka detail laporan.
- Status: Implemented.

### 8.17 Surat Balasan (response-letter)
- Fungsi: Pengelolaan surat balasan (mahasiswa dan admin).
- Aktor: Mahasiswa, Admin.
- Route terkait: /mahasiswa/kp/surat-balasan, /admin/surat-balasan.
- Alur ringkas: mahasiswa memantau/unggah status surat balasan -> admin memproses dan memvalidasi.
- Status: Implemented.

### 8.18 Navigasi Samping (sidebar)
- Fungsi: Navigasi aplikasi berbasis role + konteks URL.
- Aktor: Semua role internal.
- Route terkait: shell _sidebar dan seluruh route terproteksi.
- Alur ringkas: deteksi role/pathname -> bangun menu -> render menu sesuai hak akses.
- Status: Implemented.

### 8.19 Pengajuan (submission)
- Fungsi: Pengajuan utama KP termasuk unggah dokumen dan approval flow.
- Aktor: Mahasiswa, Admin, Dosen.
- Route terkait:
  - Mahasiswa: /mahasiswa/kp/pengajuan
  - Admin: /admin/pengajuan-surat-pengantar
  - Dosen: /dosen/kp/surat-pengantar
- Alur ringkas: mahasiswa isi data perusahaan + unggah dokumen -> submit -> admin/dosen review -> approve/reject -> update status.
- Status: Implemented.

### 8.20 Template Dokumen (template)
- Fungsi: Manajemen template dokumen (CRUD + editor + kategori template).
- Aktor: Admin (utama), mahasiswa pada penggunaan template tertentu.
- Route terkait: /admin/template, /mahasiswa/kp/template.
- Alur ringkas: admin buat/edit template -> simpan template -> dipakai pada alur dokumen lain.
- Status: Partial.
- Catatan status: dokumentasi fitur menyebut penyimpanan masih lokal/state dan integrasi backend penuh menjadi pekerjaan lanjutan.

### 8.21 Linimasa KP (timeline)
- Fungsi: Pengatur dan visualisasi langkah proses KP mahasiswa.
- Aktor: Mahasiswa.
- Route terkait: seluruh jalur /mahasiswa/kp/* berbasis _timeline.
- Alur ringkas: aktifkan step sesuai halaman -> tampilkan progres -> arahkan ke tahap berikut.
- Status: Implemented.

---

## 9. Alur Proses Utama KP (End-to-End)

### 9.1 Alur Mahasiswa
1. Login ke sistem.
2. Membuat tim atau bergabung tim KP.
3. Mengisi pengajuan KP dan mengunggah dokumen persyaratan.
4. Menunggu review admin/dosen untuk surat pengantar.
5. Memproses surat balasan dari instansi/perusahaan.
6. Menjalankan fase saat magang (aktivitas/logbook).
7. Mengikuti proses pengujian sidang (berita acara).
8. Masuk fase pasca magang dan melihat evaluasi/penilaian akhir.
9. Menyimpan/akses arsip di repositori.

### 9.2 Alur Admin
1. Memantau dashboard admin.
2. Mereview pengajuan surat pengantar mahasiswa.
3. Mengelola surat balasan.
4. Menangani persetujuan pembimbing (register approval).
5. Mengelola template dokumen.
6. Melihat hasil evaluasi/penilaian mahasiswa.

### 9.3 Alur Dosen
1. Memantau dashboard dosen.
2. Verifikasi judul laporan KP mahasiswa.
3. Verifikasi sidang dan dokumen terkait.
4. Menjalankan workflow penilaian mahasiswa.
5. Mengisi/menyimpan hasil grading.

### 9.4 Alur Mentor Lapangan
1. Login ke portal mentor.
2. Melihat daftar mentee.
3. Review logbook dan detail aktivitas mahasiswa.
4. Memberi penilaian/assessment.
5. Kelola profil, notifikasi, arsip, dan pengaturan.

---

## 10. Entitas Data dan Status Domain Penting

### 10.1 Role User
Role utama yang dipakai frontend:
- MAHASISWA
- ADMIN
- DOSEN
- KAPRODI
- WAKIL_DEKAN
- PEMBIMBING_LAPANGAN

### 10.2 Tim KP
- Team status: PENDING, FIXED.
- Invitation status: PENDING, ACCEPTED, REJECTED.

### 10.3 Pengajuan
Status submission:
- DRAFT
- MENUNGGU
- DITOLAK
- DITERIMA

Jenis dokumen pengajuan (termasuk auto generated):
- PROPOSAL_KETUA
- SURAT_KESEDIAAN
- FORM_PERMOHONAN
- KRS_SEMESTER_4
- DAFTAR_KUMPULAN_NILAI
- BUKTI_PEMBAYARAN_UKT
- SURAT_PENGANTAR (auto generated saat approval tertentu)

---

## 11. Integrasi Antar Fitur (Cross-Feature Dependencies)

### 11.1 Timeline sebagai tulang punggung alur mahasiswa
Fitur berikut saling terkait melalui alur timeline:
- create-teams
- submission
- cover-letter
- response-letter
- during-intern
- hearing
- evaluation (pasca magang)

### 11.2 Sidebar dan akses role
Sidebar menentukan pengalaman navigasi per role dan memisahkan area mahasiswa/admin/dosen/mentor.

### 11.3 Service layer bersama
Modul halaman memanggil service domain untuk API sehingga pola request/response konsisten.

### 11.4 Dokumen dan e-signature
Fitur hearing, template, dan esignature saling terkait dalam jalur pembuatan dokumen sidang dan approval digital.

---

## 12. Matriks Status Implementasi

| Fitur | Status | Catatan Singkat |
|---|---|---|
| Surat Pengantar (cover-letter) | Implemented | Monitoring status surat pengantar pada timeline mahasiswa. |
| Pembuatan Tim (create-teams) | Implemented | Pembentukan dan manajemen tim KP tersedia di frontend. |
| Dasbor (dashboard) | Implemented | Dashboard terpisah per role. |
| Penilaian Dosen (dosen-grading) | Partial | Workflow kuat, namun masih ada bagian mock dan enhancement lanjutan. |
| Saat Magang (during-intern) | Implemented | Halaman logbook/aktivitas/assessment tersedia. |
| Tanda Tangan Elektronik (esignature) | Partial | Frontend setup tersedia, integrasi production penuh masih bertahap. |
| Evaluasi (evaluation) | Implemented | Evaluasi admin dan pasca magang mahasiswa tersedia. |
| Pembimbing Lapangan (field-mentor) | Implemented | Monitoring logbook mahasiswa oleh mentor lapangan. |
| Pengujian Sidang (hearing) | Partial | Alur pengajuan ada, beberapa bagian backend/doc generation masih perlu finalisasi. |
| Verifikasi Dosen (hearing-dosen) | Implemented | Verifikasi surat oleh dosen pada halaman khusus tersedia. |
| Laporan KP (kp-report) | Implemented | Laporan KP mahasiswa dan verifikasi judul dosen tersedia. |
| Masuk (login) | Implemented | Form login dan penyimpanan token berjalan. |
| Portal Mentor (mentor) | Implemented | Portal mentor lengkap (mentee, logbook, penilaian, dll). |
| Profil Pengguna (profil) | Implemented | Profil mahasiswa dan dosen tersedia. |
| Registrasi (register) | Partial | Alur registrasi ada, endpoint pembimbing lapangan belum siap penuh. |
| Repositori (repository) | Implemented | Halaman repositori dan detail laporan tersedia. |
| Surat Balasan (response-letter) | Implemented | Mahasiswa/admin bisa menangani surat balasan. |
| Navigasi Samping (sidebar) | Implemented | Navigasi role-based aktif. |
| Pengajuan (submission) | Implemented | Pengajuan dokumen dan jalur review utama tersedia. |
| Template Dokumen (template) | Partial | CRUD template ada, persist/integrasi backend penuh masih penguatan. |
| Linimasa KP (timeline) | Implemented | Konteks dan visual tahap KP sudah terpakai lintas route. |

---

## 13. Keterbatasan dan Risiko Saat Ini
1. Ada ketergantungan localStorage untuk beberapa alur auth/state dan development flow dokumen.
2. Sebagian alur dokumen (template/e-signature/hearing) masih membutuhkan hardening integrasi backend production.
3. Beberapa modul menyebut penggunaan mock data atau dev controls sehingga perlu validasi saat go-live.
4. Konsistensi kontrol akses antara role formal dan jabatan (contoh wakil dekan) perlu dijaga agar tidak terjadi gap otorisasi.

---

## 14. Prioritas Teknis yang Disarankan
1. Finalisasi integrasi backend untuk area Partial (template, hearing, esignature, register pembimbing lapangan).
2. Kurangi ketergantungan localStorage untuk data sensitif dan migrasi ke pola yang lebih aman bila diperlukan.
3. Konsolidasikan status source of truth per fitur agar tidak tercampur antara mock state dan API state.
4. Tambahkan pengujian end-to-end untuk alur KP lintas role agar regresi bisnis flow cepat terdeteksi.

---

## 15. Kesimpulan
Frontend SIKP sudah memiliki fondasi arsitektur yang rapi dan modular, dengan cakupan fitur KP yang luas dan route tersegmentasi jelas per role. Untuk mencapai tingkat production maturity yang lebih tinggi, fokus utama ada pada finalisasi integrasi backend pada modul yang masih Partial, serta penguatan konsistensi state dan kontrol akses lintas alur.
