import type { Route } from "./+types/_sidebar.dosen.kp.logbook-monitor.$studentId";
import DosenLogbookMonitorDetailPage from "~/feature/dosen-grading/pages/dosen-logbook-monitor-detail-page";

export function meta() {
  return [
    { title: "Detail Monitoring Logbook - SIKP" },
    {
      name: "description",
      content: "Detail logbook mahasiswa untuk monitoring Dosen PA",
    },
  ];
}

export default function DosenLogbookMonitorDetailRoute() {
  return <DosenLogbookMonitorDetailPage />;
}
