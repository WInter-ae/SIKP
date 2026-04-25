# RINGKASAN FRONTEND SIKP (KONDISI AKTUAL)

Dokumen ini merangkum implementasi frontend saat ini berdasarkan kode di folder `app`, dengan fokus pada alur SSO yang sudah aktif, kontrak session auth terbaru, serta gap endpoint domain yang masih tersisa pasca cutover.

## 1. Stack dan Fondasi

- React Router v7 (file-based routing).
- React 19 + TypeScript.
- Vite.
- Tailwind CSS + komponen UI berbasis shadcn/Radix.
- Context global utama:
  - `UserProvider` untuk auth/session/identity,
  - `ThemeProvider` untuk tema.

## 2. Status Umum Frontend

Frontend sudah berada pada mode **SSO-first** untuk login dan session browser:

- login/register lokal tidak lagi menjadi jalur auth utama,
- alur auth aktif memakai SSO UNSRI,
- session browser memakai kombinasi:
  - cookie httpOnly dari backend,
  - cache session di `sessionStorage`,
- flow multi-identity sudah aktif dan tervalidasi,
- akun dengan role SSO yang hanya `user` atau `superadmin` ditolak mengakses SIKP.

Checklist validasi auth inti dan identity chooser sudah dinyatakan lolos pada dokumen checklist SSO.

## 3. Arsitektur Auth Frontend (SSO-First)

Frontend memakai flow SSO penuh:

1. Halaman login memanggil `initiateSsoLogin()`.
2. Frontend generate PKCE (`code_verifier`, `code_challenge`).
3. Frontend memanggil `POST /api/auth/prepare`.
4. Browser diarahkan ke SSO authorize URL.
5. Callback ditangani di route `/callback`.
6. Frontend mengirim `code + state + codeVerifier` ke `POST /api/auth/callback`.
7. Session di-hydrate melalui `GET /api/auth/me`.
8. Jika akun punya lebih dari satu identity, user diarahkan ke `/identity-chooser`.
9. Setelah identity dipilih, frontend memanggil `POST /api/auth/select-identity` lalu refresh context lewat `GET /api/auth/me`.

## 3.1 Penyimpanan Session

- Session utama disimpan di `sessionStorage` dengan key `sikp_auth_session`.
- Cookie httpOnly dari backend tetap menjadi sumber autentikasi utama untuk browser request.
- Key kompatibilitas lama:
  - `auth_token`
  - `user_data`
    masih dikelola untuk kompatibilitas transisi, tetapi bukan sumber auth utama.

## 3.2 User Context dan Session Snapshot

`UserProvider` memelihara state auth berikut:

- `user`
- `token`
- `authStatus`
- `isLoading`
- `availableIdentities`
- `activeIdentity`
- `effectiveRoles`
- `effectivePermissions`
- `callbackError`

Session snapshot frontend sekarang sudah mampu membawa data user/identity yang lebih kaya hasil normalisasi dari backend SSO, termasuk field seperti:

- `nim`
- `nip`
- `nidn`
- `prodi`
- `fakultas`
- `semester`
- `semesterAktif`
- `angkatan`
- `jumlahSksLulus`
- `phone`
- `jabatan`
- `jabatanFungsional`
- `jabatanStruktural`

Untuk identity profile, frontend juga sudah menormalisasi detail nested tambahan seperti:

- `prodiDetail`
- `fakultasDetail`
- `dosenPA`
- `instansi`
- `status`
- `bidang`
- `bidangKeahlian`

Dengan ini, komponen yang bergantung pada metadata identity tidak lagi hanya menerima nama/email minimum.

## 3.3 Guard Akses

Akses route dijaga oleh `ProtectedRoute` dan layout `_sidebar` dengan pemeriksaan:

- status authenticated,
- ada/tidaknya identity aktif untuk akun multi-identity,
- role efektif,
- permission efektif jika diperlukan.

Perilaku redirect:

- belum login -> `/login`
- akun multi-identity tanpa identity aktif -> `/identity-chooser`
- role tidak sesuai -> `/unauthorized`

## 4. Aturan Role dan Identity di Frontend

Frontend mengikuti kontrak role efektif dari backend:

- `MAHASISWA`
- `ADMIN`
- `DOSEN`
- `KAPRODI`
- `WAKIL_DEKAN`
- `MENTOR`

Aturan penting yang sudah diterapkan:

- bucket identity internal tetap konsisten ke `MAHASISWA`, `ADMIN`, `DOSEN`, `MENTOR`,
- role dosen turunan seperti `KAPRODI` dan `WAKIL_DEKAN` tetap masuk shell dosen,
- akun dengan role SSO yang hanya `USER` atau hanya `SUPERADMIN` tidak boleh masuk SIKP,
- jika user punya role valid lain selain `USER`/`SUPERADMIN`, login tetap diperbolehkan.

## 5. Kontrak API Frontend

## 5.1 Resolusi API Base URL

Prioritas konfigurasi base URL di client:

1. `VITE_SIKP_API_BASE_URL`
2. `VITE_API_URL`
3. `VITE_APP_AUTH_URL`
4. `VITE_API_BASE_URL`
5. fallback code:
   - dev: `http://localhost:3000`
   - prod: `https://backend-sikp.backend-sikp.workers.dev`

## 5.2 Perilaku API Client

- Semua request browser dikirim dengan `credentials: include`.
- Header `Authorization` hanya disisipkan untuk konteks non-browser (SSR/utility) saat token tersedia.
- Handling status:
  - `401`: session dibersihkan lalu diarahkan ke login.
  - `410`: diperlakukan sebagai sinyal legacy cutover, **tanpa forced logout**, untuk menghindari loop login/logout saat modul lama masih memanggil endpoint lama.

Catatan penting:

- perilaku `410` ini sengaja dibuat lebih lunak dibanding `401`,
- tujuannya agar session SSO yang valid tidak ikut dianggap rusak hanya karena ada modul frontend yang belum selesai migrasi endpoint.

## 5.3 Kontrak Response Auth yang Dipakai Frontend

Frontend mengonsumsi flow auth berikut:

- `POST /api/auth/prepare`
- `POST /api/auth/callback`
- `GET /api/auth/me`
- `GET /api/auth/identities`
- `POST /api/auth/select-identity`
- `POST /api/auth/logout`

Response auth yang dipakai frontend berfokus pada data berikut:

- `sessionEstablished`
- `requiresIdentitySelection`
- `activeIdentity`
- `availableIdentities` / `identities`
- `effectiveRoles`
- `effectivePermissions`
- `user`
- `authzSource`

Khusus `GET /api/auth/me`, frontend sekarang mengharapkan user/identity payload yang lebih kaya, sehingga data identity detail bisa dipakai ulang di banyak fitur.

## 6. Peta Route UI

## 6.1 Public

- `/`
- `/login`
- `/callback`
- `/identity-chooser`
- `/unauthorized`
- `/register`
- `/pembimbing-lapangan`
- `/tentang`
- `/kontak`
- `/referensi`
- `/detail-referensi/:id`

Catatan:

- `/register` dan `/pembimbing-lapangan` kini lebih berperan sebagai halaman informasi/compatibility, bukan jalur registrasi lokal aktif.

## 6.2 Protected Shell

Semua route internal memakai layout `_sidebar`.

Kelompok route utama:

- Mahasiswa: `/mahasiswa/*`
- Admin: `/admin/*`
- Dosen/Kaprodi/Wakil Dekan: `/dosen/*`
- Mentor: `/mentor/*`

Redirect `/dashboard` ditentukan berdasarkan role efektif dan/atau identity aktif.

## 7. Fitur yang Sudah Selaras dengan SSO

Bagian frontend yang sudah selaras dengan fondasi SSO terbaru:

- halaman login,
- callback SSO,
- identity chooser,
- user context berbasis session SSO,
- guard route berbasis `effectiveRoles` dan `effectivePermissions`,
- profile/signature management yang diarahkan ke SSO,
- penolakan akun blocked-only role (`USER` / `SUPERADMIN`),
- pemuatan metadata identity yang lebih kaya dari response backend terbaru.

Identity chooser juga sudah sesuai ekspektasi validasi:

- akun ditampilkan sekali pada header chooser,
- identity card fokus pada jenis identity,
- metadata seperti NIM/NIP dapat ditampilkan bila tersedia,
- submit identity mengarahkan ke dashboard yang benar.

## 8. Integrasi Profil dan Signature

Frontend memperlakukan profil dan tanda tangan sebagai domain yang dikelola oleh SSO:

- profil akun dibaca dari session/me dan sumber SSO,
- pengelolaan profil diarahkan ke URL SSO,
- pengelolaan signature diarahkan ke URL SSO,
- operasi write signature di sisi SIKP tidak lagi menjadi jalur utama.

## 9. Gap Integrasi yang Masih Ada

Walaupun alur auth SSO inti sudah selesai, masih ada gap pada beberapa modul domain lama.

Masih ditemukan service/frontend module yang memanggil prefix legacy backend seperti:

- `/api/mahasiswa/*`
- `/api/dosen/*`
- `/api/admin/*`
- `/api/mentor/*`

Dampak aktualnya:

- `/api/mahasiswa/*`, `/api/dosen/*`, `/api/admin/*` akan terkena `410` dari backend,
- `/api/mentor/*` masih berpotensi `404` karena belum menjadi mount aktif pada entrypoint backend,
- sebagian fitur domain lama dapat gagal walaupun user sudah login dan session SSO valid.

Artinya:

- **fondasi auth sudah selesai dan stabil**,
- tetapi **harmonisasi endpoint domain belum sepenuhnya selesai**.

## 10. Modul Besar di Frontend

Modul besar yang masih ada di struktur `app/feature` antara lain:

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

Catatan penting:

- keberadaan modul UI tidak otomatis berarti seluruh service API-nya sudah sepenuhnya selaras dengan backend pasca cutover,
- sebagian modul sudah berjalan baik di jalur SSO baru,
- sebagian lain masih butuh migrasi endpoint domain.

## 11. Konfigurasi Environment Frontend

Variabel penting untuk mode SSO dan integrasi backend:

- `VITE_SIKP_API_BASE_URL`
- `VITE_SSO_REDIRECT_URI`
- `VITE_SSO_PROFILE_URL`
- `VITE_SSO_PROFILE_SIGNATURE_URL`

Kompatibilitas lama yang masih didukung:

- `VITE_API_URL`
- `VITE_APP_AUTH_URL`
- `VITE_API_BASE_URL`

## 12. Ringkasan Singkat

Frontend SIKP saat ini sudah berhasil menyelesaikan fondasi auth SSO:

- login/callback/PKCE aktif,
- session cookie + hydration berjalan,
- multi-identity chooser berjalan,
- blocked-only role (`USER` / `SUPERADMIN`) ditolak,
- payload user/identity sudah lebih kaya dan siap dipakai fitur.

Pekerjaan yang masih tersisa terutama berada pada sisi **migrasi service domain** yang masih memanggil endpoint legacy backend, bukan lagi pada fondasi auth SSO inti.
