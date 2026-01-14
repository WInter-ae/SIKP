import MenteeDetailPage from "~/feature/mentor/pages/mentee-detail-page";

export function meta() {
  return [
    { title: "Detail Mahasiswa Magang - SIKP" },
    { name: "description", content: "Detail informasi mahasiswa magang" },
  ];
}

export default function MentorMenteeDetailRoute() {
  return <MenteeDetailPage />;
}
