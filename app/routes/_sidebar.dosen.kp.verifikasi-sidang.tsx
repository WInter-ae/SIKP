import type { Route } from "./+types/_sidebar.dosen.kp.verifikasi-sidang";
import VerifikasiSidangDosenPage from "~/feature/hearing/pages/verifikasi-sidang-dosen-page";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Verifikasi Sidang - SIKP" },
    { name: "description", content: "Verifikasi pengajuan sidang mahasiswa" },
  ];
}

export default function VerifikasiSidangDosen() {
  return <VerifikasiSidangDosenPage />;
}
