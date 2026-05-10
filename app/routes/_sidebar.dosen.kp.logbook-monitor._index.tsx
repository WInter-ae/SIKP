import DosenLogbookMonitorPage from "~/feature/dosen-grading/pages/dosen-logbook-monitor-page";

export function meta() {
  return [
    { title: "Monitoring Logbook - SIKP" },
    {
      name: "description",
      content: "Monitoring logbook mahasiswa oleh Dosen PA (read-only)",
    },
  ];
}

export default function DosenLogbookMonitorRoute() {
  return <DosenLogbookMonitorPage />;
}
