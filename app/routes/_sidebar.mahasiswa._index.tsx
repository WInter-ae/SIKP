import { useEffect, useState } from "react";

import { get } from "~/lib/api-client";

import DashboardMahasiswaPage, {
  type DashboardMahasiswaData,
} from "../feature/dashboard/pages/dashboard-mahasiswa-page";

export default function MahasiswaDashboard() {
  const [dashboardData, setDashboardData] =
    useState<DashboardMahasiswaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const response = await get<DashboardMahasiswaData>(
          "/api/mahasiswa/dashboard",
        );

        if (!active) return;

        if (response.success && response.data) {
          setDashboardData(response.data);
          return;
        }

        console.warn("[MahasiswaDashboard] Failed to load dashboard:", {
          message: response.message,
        });
      } catch (error) {
        if (!active) return;
        console.error(
          "[MahasiswaDashboard] Unexpected dashboard error:",
          error,
        );
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

  return <DashboardMahasiswaPage data={dashboardData} />;
}
