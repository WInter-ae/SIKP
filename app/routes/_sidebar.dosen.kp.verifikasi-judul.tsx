import type { Route } from "./+types/_sidebar.dosen.kp.verifikasi-judul";
import VerifikasiJudulDosenPage from "~/feature/kp-report/pages/verifikasi-judul-dosen-page";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Verifikasi Judul Laporan - SIKP" },
    { name: "description", content: "Verifikasi judul laporan KP mahasiswa" },
  ];
}

export default function VerifikasiJudulDosen() {
  return <VerifikasiJudulDosenPage />;
}
