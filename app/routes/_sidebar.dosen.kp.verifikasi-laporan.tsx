import LecturerReportVerificationPage from "~/feature/kp-report/pages/lecturer-report-verification-page";

export function meta() {
  return [
    { title: "Verifikasi Laporan Akhir - SIKP" },
    { name: "description", content: "Verifikasi file laporan akhir KP mahasiswa" },
  ];
}

export default function VerifikasiLaporanDosen() {
  return <LecturerReportVerificationPage />;
}
