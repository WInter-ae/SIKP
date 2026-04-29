import { useEffect, useState } from "react";

import { get } from "~/lib/api-client";

import DashboardAdminPage, {
  type DashboardAdminData,
} from "~/feature/dashboard/pages/dashboard-admin-page";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardAdminData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const response = await get<DashboardAdminData>("/api/admin/dashboard");

        if (!active) return;

        if (response.success && response.data) {
          setDashboardData(response.data);
          return;
        }

        console.warn("[AdminDashboard] Failed to load dashboard:", {
          message: response.message,
        });
      } catch (error) {
        if (!active) return;
        console.error("[AdminDashboard] Unexpected dashboard error:", error);
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

  return <DashboardAdminPage data={dashboardData} />;
}
