import AssessmentKaprodiPage from "~/feature/during-intern/pages/assessment-kaprodi-page";

export function meta() {
  return [
    { title: "Verifikasi Nilai - SIKP" },
    { name: "description", content: "Verifikasi nilai KP mahasiswa oleh Kaprodi" },
  ];
}

export default function VerifikasiNilaiKaprodi() {
  return <AssessmentKaprodiPage />;
}
