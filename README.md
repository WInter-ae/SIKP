# SIKP Frontend

Frontend untuk Sistem Informasi Kerja Praktik (SIKP) Manajemen Informatika UNSRI.
Frontend for the Internship Information System (SIKP) of Informatics Management UNSRI.

## Tentang Project | About

Project ini menangani alur kerja praktik untuk beberapa role:

- Mahasiswa
- Admin
- Dosen
- Pembimbing Lapangan (Mentor)

This project supports internship workflows for multiple roles:

- Student
- Admin
- Lecturer
- Field Mentor

Alur utama mencakup pembuatan tim, pengajuan dokumen KP, verifikasi surat, logbook saat magang, pengujian sidang, dan penilaian.
Main flows include team creation, internship document submission, letter verification, internship logbook, hearing process, and grading.

## Tech Stack

- React 19
- React Router v7 (file-based routing)
- TypeScript
- Vite
- Tailwind CSS v4
- React Hook Form + Zod
- Radix UI / shadcn style components

## Struktur Singkat | Project Structure

```text
app/
  routes/        # Route per role dan halaman
  feature/       # Modul fitur (submission, hearing, evaluation, dll)
  components/    # Komponen reusable global
  contexts/      # User context, theme context
  lib/           # API client, auth client, services, types
```

## Prasyarat | Requirements

- Node.js LTS
- pnpm

## Instalasi | Installation

```bash
pnpm install
```

## Menjalankan Project | Running Locally

```bash
pnpm run dev
```

Default local URL:

- http://localhost:5174

## Script Penting | Useful Scripts

```bash
pnpm run dev        # Menjalankan mode development
pnpm run build      # Build production
pnpm run start      # Menjalankan hasil build production
pnpm run typecheck  # Generate route types + cek TypeScript
```

## Konfigurasi Environment | Environment Variables

Beberapa environment variable yang digunakan frontend:

- VITE_SIKP_API_BASE_URL
- VITE_API_URL
- VITE_APP_AUTH_URL
- VITE_API_BASE_URL
- VITE_SSO_REDIRECT_URI

Jika tidak diisi, frontend menggunakan default endpoint backend yang sudah didefinisikan di kode.
If not provided, the frontend falls back to the default backend endpoint defined in code.

## Dokumentasi Tambahan | Additional Docs

- Ringkasan frontend lengkap: [RINGKASAN_FRONTEND_SIKP.md](RINGKASAN_FRONTEND_SIKP.md)
- Konvensi kode: [CODE_CONVENTION.md](CODE_CONVENTION.md)

## Catatan | Notes

Untuk konteks alur bisnis dan status implementasi fitur yang lebih detail, gunakan dokumen ringkasan lengkap di atas.
For detailed business flow context and feature implementation status, refer to the full frontend summary document above.
