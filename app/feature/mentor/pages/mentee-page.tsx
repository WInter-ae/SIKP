import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// Components
import PageHeader from "../components/page-header";
import StatsCard from "../components/stats-card";
import BackButton from "../components/back-button";
import MenteeCard from "../components/mentee-card";

import { getMentees, type MenteeData } from "~/feature/field-mentor/services";

// Types
import type { Mentee } from "../types";

function mapBackendMentee(mentee: MenteeData): Mentee | null {
  const status = (mentee.internshipStatus || mentee.status || "-").toUpperCase();

  if (!mentee.userId) return null;

  return {
    id: mentee.userId,
    name: mentee.nama || mentee.name || "-",
    nim: mentee.nim,
    email: mentee.email,
    phone: mentee.phone || "-",
    company: mentee.companyName || mentee.company || "-",
    progress:
      typeof mentee.progress === "number"
        ? mentee.progress
        : status === "AKTIF"
          ? 100
          : status === "PENDING"
            ? 25
            : 0,
    status:
      status === "AKTIF"
        ? "Aktif"
        : status === "SELESAI"
          ? "Selesai"
          : status === "PENDING"
            ? "Menunggu"
            : mentee.internshipStatus || mentee.status || "-",
  };
}

function MenteePage() {
  const [menteeList, setMenteeList] = useState<Mentee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMentees() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await getMentees();

        if (!isMounted) return;

        if (!response.success || !response.data) {
          setMenteeList([]);
          setErrorMessage(response.message || "Gagal memuat data mahasiswa magang.");
          return;
        }

        const mapped = response.data
          .map(mapBackendMentee)
          .filter((mentee): mentee is Mentee => Boolean(mentee));

        setMenteeList(mapped);
      } catch (error) {
        if (!isMounted) return;

        const message = error instanceof Error ? error.message : "Gagal memuat data mahasiswa magang.";
        setErrorMessage(message);
        setMenteeList([]);
        toast.error(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadMentees();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalProgress = useMemo(
    () => menteeList.reduce((sum, mentee) => sum + (mentee.progress ?? 0), 0),
    [menteeList]
  );
  const averageProgress =
    menteeList.length > 0 ? totalProgress / menteeList.length : 0;
  const activeCount = menteeList.filter((m) => m.status === "Aktif").length;

  return (
    <div className="p-6">
      <PageHeader
        title="Mahasiswa Magang"
        description="Daftar mahasiswa yang magang di perusahaan Anda"
      />

      {errorMessage && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatsCard title="Total Mahasiswa" value={isLoading ? "..." : menteeList.length} />
        <StatsCard
          title="Rata-rata Progress"
          value={isLoading ? "..." : `${averageProgress.toFixed(1)}%`}
        />
        <StatsCard title="Status Aktif" value={isLoading ? "..." : activeCount} />
      </div>

      <div className="grid grid-cols-1 gap-4 mb-8">
        {isLoading ? (
          <div className="rounded-xl border bg-card p-6 text-muted-foreground">
            Memuat data mahasiswa magang dari backend...
          </div>
        ) : menteeList.length > 0 ? (
          menteeList.map((mentee) => <MenteeCard key={mentee.id} mentee={mentee} />)
        ) : (
          <div className="rounded-xl border bg-card p-6 text-muted-foreground">
            Belum ada mahasiswa magang yang terhubung ke akun mentor ini.
          </div>
        )}
      </div>

      <BackButton />
    </div>
  );
}

export default MenteePage;
