import type { Route } from "./+types/_sidebar.dosen.kp.verifikasi-judul";
import LecturerTitleVerificationPage from "~/feature/kp-report/pages/lecturer-title-verification-page";

export function meta() {
  return [
    { title: "Verifikasi Judul Laporan - SIKP" },
    { name: "description", content: "Verifikasi judul laporan KP mahasiswa" },
  ];
}

export default function VerifikasiJudulDosen() {
  return <LecturerTitleVerificationPage />;
}
