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

export default function DosenDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardDosenData | null>(
    null,
  );
  const [wakdekDashboardData, setWakdekDashboardData] =
    useState<DashboardWakdekData | null>(null);
  const [isWakdek, setIsWakdek] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const profileResponse = await getMyProfile();

        const wakdekByJabatan = Boolean(
          profileResponse.success &&
            profileResponse.data?.jabatan
              ?.toLowerCase()
              .includes("wakil dekan"),
        );

        if (active) {
          setIsWakdek(wakdekByJabatan);
        }

        const response = wakdekByJabatan
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

  if (isWakdek) {
    return <DashboardWakdekPage data={wakdekDashboardData} />;
  }

  return <DashboardDosenPage data={dashboardData} />;
}
