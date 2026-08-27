import MailVerificationDosenPage from "~/feature/hearing/pages/mail-verification-dosen-page";

export function meta() {
  return [
    { title: "Verifikasi Surat - SIKP" },
    { name: "description", content: "Verifikasi surat KP mahasiswa" },
  ];
}

export default function VerifikasiSuratDosen() {
  return <MailVerificationDosenPage />;
}
