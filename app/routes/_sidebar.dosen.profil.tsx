import type { Route } from "./+types/_sidebar.dosen.profil";
import { DosenProfilPage } from "~/feature/dosen/pages/profil-page";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Profil Dosen - SIKP" },
    { name: "description", content: "Kelola profil dan e-signature dosen" },
  ];
}

export default function DosenProfil() {
  return <DosenProfilPage />;
}
