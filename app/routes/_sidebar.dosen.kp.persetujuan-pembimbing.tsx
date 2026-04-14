import RegisterApprovalPage from "~/feature/register/pages/register-approval-page";

export function meta() {
  return [
    { title: "Persetujuan Pembimbing - SIKP" },
    {
      name: "description",
      content: "Persetujuan pembimbing lapangan oleh Dosen PA",
    },
  ];
}

export default function DosenPersetujuanPembimbingPage() {
  return <RegisterApprovalPage />;
}
