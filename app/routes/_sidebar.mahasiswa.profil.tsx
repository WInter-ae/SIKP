import { MahasiswaProfilPage } from "~/feature/profil/pages/profil-mahasiswa-page";

export function meta() {
  return [
    { title: "Profil Mahasiswa - SIKP" },
    { name: "description", content: "Kelola profil dan e-signature mahasiswa" },
  ];
}

export default function MahasiswaProfilRoute() {
  return <MahasiswaProfilPage />;
}
