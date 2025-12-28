// Components
import PageHeader from "../components/page-header";
import StatsCard from "../components/stats-card";
import BackButton from "../components/back-button";
import MenteeCard from "../components/mentee-card";

// Types
import type { Mentee } from "../types";

// Mock data - should be fetched from API in real implementation
const MENTEE_LIST: Mentee[] = [
  {
    id: "1",
    name: "Ahmad Fauzi",
    nim: "12250111001",
    email: "ahmad.fauzi@student.unri.ac.id",
    phone: "081234567890",
    company: "PT. Teknologi Indonesia",
    progress: 75,
    status: "Aktif",
  },
  {
    id: "2",
    name: "Siti Aminah",
    nim: "12250111002",
    email: "siti.aminah@student.unri.ac.id",
    phone: "081234567891",
    company: "PT. Digital Solutions",
    progress: 60,
    status: "Aktif",
  },
  {
    id: "3",
    name: "Budi Santoso",
    nim: "12250111003",
    email: "budi.santoso@student.unri.ac.id",
    phone: "081234567892",
    company: "CV. Mitra Sejahtera",
    progress: 85,
    status: "Aktif",
  },
];

function MenteePage() {
  const totalProgress = MENTEE_LIST.reduce((sum, m) => sum + m.progress, 0);
  const averageProgress =
    MENTEE_LIST.length > 0 ? totalProgress / MENTEE_LIST.length : 0;
  const activeCount = MENTEE_LIST.filter((m) => m.status === "Aktif").length;

  return (
    <div className="p-6">
      <PageHeader
        title="Daftar Mentee"
        description="Mahasiswa yang berada dalam bimbingan Anda"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatsCard title="Total Mentee" value={MENTEE_LIST.length} />
        <StatsCard
          title="Rata-rata Progress"
          value={`${averageProgress.toFixed(1)}%`}
        />
        <StatsCard title="Status Aktif" value={activeCount} />
      </div>

      <div className="grid grid-cols-1 gap-4 mb-8">
        {MENTEE_LIST.map((mentee) => (
          <MenteeCard key={mentee.id} mentee={mentee} />
        ))}
      </div>

      <BackButton />
    </div>
  );
}

export default MenteePage;
