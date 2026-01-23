import type { Route } from "./+types/_sidebar.mentor.logbook-detail.$studentId";
import StudentLogbookDetailPage from "~/feature/field-mentor/pages/student-logbook-detail-page";

export function meta() {
  return [
    { title: "Detail Logbook Mahasiswa - SIKP" },
    { name: "description", content: "Detail logbook mahasiswa untuk pembimbing lapangan" },
  ];
}

export default function MentorLogbookDetailRoute() {
  return <StudentLogbookDetailPage />;
}
