import SubmissionDosenPage from "~/feature/submission/pages/submission-dosen-page";

export function meta() {
  return [
    { title: "Surat Pengantar - SIKP" },
    {
      name: "description",
      content: "Verifikasi surat pengantar mahasiswa oleh dosen",
    },
  ];
}

export default function SuratPengantarDosen() {
  return <SubmissionDosenPage />;
}
