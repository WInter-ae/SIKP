import { useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Archive } from "lucide-react";

import type { ArchivedDocument } from "../types";
import PageHeader from "../components/page-header";
import StatsCard from "../components/stats-card";
import BackButton from "../components/back-button";
import DocumentFilter from "../components/document-filter";
import DocumentCard from "../components/document-card";

// Mock data - should be fetched from API in real implementation
const ARCHIVED_DOCUMENTS: ArchivedDocument[] = [
  {
    id: "1",
    type: "penilaian",
    title: "Penilaian Akhir - Ahmad Fauzi",
    mentee: "Ahmad Fauzi",
    date: "2024-12-01",
    semester: "Ganjil 2024/2025",
    status: "completed",
  },
  {
    id: "2",
    type: "logbook",
    title: "Logbook Lengkap - Siti Aminah",
    mentee: "Siti Aminah",
    date: "2024-11-28",
    semester: "Ganjil 2024/2025",
    status: "completed",
  },
  {
    id: "3",
    type: "laporan",
    title: "Laporan KP - Budi Santoso",
    mentee: "Budi Santoso",
    date: "2024-11-25",
    semester: "Ganjil 2024/2025",
    status: "archived",
  },
  {
    id: "4",
    type: "penilaian",
    title: "Penilaian Akhir - Dewi Kartika",
    mentee: "Dewi Kartika",
    date: "2024-06-15",
    semester: "Genap 2023/2024",
    status: "completed",
  },
  {
    id: "5",
    type: "logbook",
    title: "Logbook Lengkap - Eko Prasetyo",
    mentee: "Eko Prasetyo",
    date: "2024-06-10",
    semester: "Genap 2023/2024",
    status: "completed",
  },
];

const SEMESTERS = ["Ganjil 2024/2025", "Genap 2023/2024", "Ganjil 2023/2024"];

function ArchivePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSemester, setFilterSemester] = useState<string>("all");

  const filteredDocuments = ARCHIVED_DOCUMENTS.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.mentee.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || doc.type === filterType;
    const matchesSemester =
      filterSemester === "all" || doc.semester === filterSemester;

    return matchesSearch && matchesType && matchesSemester;
  });

  function handleDownload(doc: ArchivedDocument) {
    alert(`Download: ${doc.title}`);
  }

  function handleView(doc: ArchivedDocument) {
    alert(`View: ${doc.title}`);
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <PageHeader
        title="Arsip"
        description="Dokumen dan data mentee yang telah selesai"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Arsip" value={ARCHIVED_DOCUMENTS.length} />
        <StatsCard
          title="Penilaian"
          value={ARCHIVED_DOCUMENTS.filter((d) => d.type === "penilaian").length}
        />
        <StatsCard
          title="Logbook"
          value={ARCHIVED_DOCUMENTS.filter((d) => d.type === "logbook").length}
        />
        <StatsCard
          title="Laporan"
          value={ARCHIVED_DOCUMENTS.filter((d) => d.type === "laporan").length}
        />
      </div>

      {/* Filters */}
      <DocumentFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        filterSemester={filterSemester}
        onFilterSemesterChange={setFilterSemester}
        semesters={SEMESTERS}
      />

      {/* Documents List */}
      <div className="space-y-4 mb-8">
        {filteredDocuments.length > 0 ? (
          filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onView={handleView}
              onDownload={handleDownload}
            />
          ))
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  Tidak ada dokumen ditemukan
                </p>
                <p className="text-muted-foreground">
                  Coba ubah filter atau kata kunci pencarian
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Back Button */}
      <BackButton />
    </div>
  );
}

export default ArchivePage;
