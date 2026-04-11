# RINGKASAN FRONTEND SIKP (KONDISI AKTUAL)

Dokumen ini merangkum implementasi frontend saat ini berdasarkan kode di folder `app`, dengan fokus pada mode SSO cutover dan integrasi ke backend KP terbaru.

## 1. Stack dan Fondasi

- React Router v7 (file-based routing melalui `flatRoutes`).
- React 19 + TypeScript.
- Vite.
- Tailwind CSS + komponen UI berbasis shadcn/Radix.
- Context global utama: `UserProvider` (auth/session) dan `ThemeProvider`.

## 2. Arsitektur Auth Frontend (SSO-First)

Frontend sudah berpindah ke flow SSO penuh:

1. Halaman login memanggil `initiateSsoLogin()`.
2. Frontend generate PKCE (`code_verifier`, `code_challenge`) lalu `POST /api/auth/prepare`.
3. Browser diarahkan ke SSO authorize URL.
4. Callback ditangani di route `/callback`.
5. Frontend kirim `code + state + codeVerifier` ke `POST /api/auth/callback`.
6. Session di-hydrate melalui `GET /api/auth/me`.
7. Jika multi identity, user diarahkan ke `/identity-chooser` lalu pilih identity aktif.

## 2.1 Penyimpanan Session

- Session utama disimpan di `sessionStorage` (`sikp_auth_session`).
- Cookie httpOnly dari backend tetap dipakai sebagai sumber autentikasi browser.
- Key legacy (`auth_token`, `user_data`) masih dipertahankan untuk kompatibilitas compile/migrasi, tetapi dibersihkan dari `localStorage`.

## 2.2 Guard Akses

- `ProtectedRoute` dan layout `_sidebar` mengecek:
  - status authenticated,
  - identity aktif (jika akun multi identity),
  - role/permission sesuai halaman.
- Jika gagal:
  - redirect ke `/login`, `/identity-chooser`, atau `/unauthorized`.

## 3. Kontrak API Frontend

## 3.1 Resolusi API Base URL

Prioritas konfigurasi base URL di client:

1. `VITE_SIKP_API_BASE_URL`
2. `VITE_API_URL`
3. `VITE_APP_AUTH_URL`
4. `VITE_API_BASE_URL`
5. fallback code:
   - dev: `http://localhost:3000`
   - prod: `https://backend-sikp.backend-sikp.workers.dev`

## 3.2 Perilaku API Client

- Semua request browser dikirim dengan `credentials: include`.
- Header `Authorization` hanya disisipkan untuk konteks non-browser (SSR/utility) saat token tersedia.
- Handling status:
  - `401`: clear session + redirect login.
  - `410`: treat sebagai cutover legacy route, clear session + redirect login.

## 3.3 Kontrak Response

Mayoritas service mengasumsikan envelope:
- `success: boolean`
- `message: string`
- `data: T | null`

## 4. Peta Route UI

## 4.1 Public

- `/`
- `/login`
- `/callback`
- `/identity-chooser`
- `/unauthorized`
- `/register` (informasi bahwa registrasi lokal dinonaktifkan)
- `/pembimbing-lapangan` (informasi bahwa registrasi lokal dinonaktifkan)
- `/tentang`, `/kontak`, `/referensi`, `/detail-referensi/:id`

## 4.2 Protected Shell

Semua route internal memakai layout `_sidebar` dan redirect `/dashboard` ke dashboard role efektif:

- Mahasiswa: prefix `/mahasiswa/*`
- Admin: prefix `/admin/*`
- Dosen/Kaprodi/Wakil Dekan: prefix `/dosen/*`
- Mentor: prefix `/mentor/*`

## 5. Integrasi Fitur yang Sudah Selaras SSO

- Halaman login, callback, dan identity chooser.
- User context berbasis session SSO (`effectiveRoles`, `effectivePermissions`, `activeIdentity`).
- Signature management diarahkan ke SSO:
  - ambil URL kelola signature via `GET /api/profile/signature/manage-url`.
  - operasi write signature di SIKP dinonaktifkan, UI diarahkan ke SSO.
- Profil mahasiswa/dosen ditampilkan sebagai read-only dari perspektif SIKP dengan CTA ke URL profil SSO.

## 6. Gap Integrasi yang Masih Ada

Masih ada service/frontend module yang memanggil prefix legacy backend:

- `/api/mahasiswa/*`
- `/api/dosen/*`
- `/api/admin/*`
- `/api/mentor/*`

Di backend mode cutover, prefix `/api/mahasiswa/*`, `/api/dosen/*`, `/api/admin/*` sekarang hard-fail `410`.
Untuk `/api/mentor/*`, route tersebut saat ini belum di-mount pada entrypoint backend utama sehingga berpotensi `404`.

Dampaknya:
- sebagian fitur lama yang belum dipindah endpoint bisa gagal saat runtime,
- beberapa service sudah punya fallback endpoint baru (contoh surat kesediaan/permohonan), tetapi belum merata di seluruh modul.

## 7. Modul Besar di Frontend

Modul utama yang tetap ada di struktur `app/feature`:

- dashboard per role
- create teams
- submission
- surat pengantar / response letter
- hearing / verifikasi dosen
- during intern / logbook
- evaluation / penilaian
- template
- profil
- mentor portal
- repository

Catatan penting: keberadaan modul UI tidak selalu berarti endpoint backend finalnya sudah 100 persen selaras pasca-cutover.

## 8. Konfigurasi Environment Frontend

Variabel yang penting untuk mode SSO dan integrasi backend:

- `VITE_SIKP_API_BASE_URL`
- `VITE_SSO_REDIRECT_URI`
- `VITE_SSO_PROFILE_URL`
- `VITE_SSO_PROFILE_SIGNATURE_URL`
- kompatibilitas lama: `VITE_API_URL`, `VITE_APP_AUTH_URL`, `VITE_API_BASE_URL`

## 9. Ringkasan Singkat

Frontend sudah mengadopsi alur SSO modern (prepare/callback/identity selection) dan guard berbasis role efektif, tetapi migrasi endpoint domain lama ke route backend pasca-cutover masih berjalan. Fokus berikutnya adalah merapikan semua service yang masih mengarah ke prefix legacy agar alur end-to-end seluruh modul konsisten.
