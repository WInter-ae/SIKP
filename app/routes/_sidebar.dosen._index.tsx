import { useEffect, useState } from "react";

import DashboardDosenPage, {
  type DashboardDosenData,
} from "../feature/dashboard/pages/dashboard-dosen-page";
import DashboardWakdekPage, {
  type DashboardWakdekData,
} from "../feature/dashboard/pages/dashboard-wakdek-page";
import {
  getDosenDashboard,
  getMyProfile,
  getWakdekDashboard,
} from "~/lib/services/dosen.service";
import { useIdentity } from "~/contexts/identity-context";

export default function DosenDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardDosenData | null>(
    null,
  );
  const [wakdekDashboardData, setWakdekDashboardData] =
    useState<DashboardWakdekData | null>(null);
  const [isWakdek, setIsWakdek] = useState(false);
  const [isKaprodi, setIsKaprodi] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { effectiveRoles } = useIdentity();

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const profileResponse = await getMyProfile();

        // Check if user is wakil dekan or kaprodi
        const wakdekByRole = effectiveRoles.includes("WAKIL_DEKAN");
        const kaprodiByRole = effectiveRoles.includes("KAPRODI");

        const wakdekByJabatan = wakdekByRole || Boolean(
          profileResponse.success &&
            Array.isArray(profileResponse.data?.jabatanStruktural) &&
            profileResponse.data.jabatanStruktural.some(
              (j) => j.toLowerCase().includes("wakil") && j.toLowerCase().includes("dekan")
            ),
        );
        const kaprodiByJabatan = kaprodiByRole || Boolean(
          profileResponse.success &&
            Array.isArray(profileResponse.data?.jabatanStruktural) &&
            profileResponse.data.jabatanStruktural.some(
              (j) => j.toLowerCase().includes("ketua") && (j.toLowerCase().includes("prodi") || j.toLowerCase().includes("program studi"))
            ),
        );

        if (active) {
          setIsWakdek(wakdekByJabatan);
          setIsKaprodi(kaprodiByJabatan);
        }

        const response = (wakdekByJabatan || kaprodiByJabatan)
          ? await getWakdekDashboard()
          : await getDosenDashboard();

        if (!active) return;

        if (response.success && response.data) {
          if (wakdekByJabatan) {
            setWakdekDashboardData(response.data as DashboardWakdekData);
          } else {
            setDashboardData(response.data as DashboardDosenData);
          }
          return;
        }

        console.warn("[DosenDashboard] Failed to load dashboard:", {
          message: response.message,
        });
      } catch (error) {
        if (!active) return;
        console.error("[DosenDashboard] Unexpected dashboard error:", error);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Memuat data dashboard...
      </div>
    );
  }

  if (isWakdek || isKaprodi) {
    return (
      <DashboardWakdekPage 
        data={wakdekDashboardData} 
        title={isKaprodi ? "Dashboard Kaprodi" : "Dashboard Wakil Dekan"} 
      />
    );
  }

  return <DashboardDosenPage data={dashboardData} />;
}
