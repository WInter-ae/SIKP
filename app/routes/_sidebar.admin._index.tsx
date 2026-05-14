import { useEffect, useState } from "react";

import { get } from "~/lib/api-client";
import { internshipClient } from "~/lib/api-client";

import DashboardAdminPage, {
  type DashboardAdminData,
} from "~/feature/dashboard/pages/dashboard-admin-page";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardAdminData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [backfillLoading, setBackfillLoading] = useState(false);
  const [backfillResult, setBackfillResult] = useState<{ updated: number; skipped: number } | null>(null);
  const [backfillError, setBackfillError] = useState<string | null>(null);

  const handleBackfillDosen = async () => {
    setBackfillLoading(true);
    setBackfillResult(null);
    setBackfillError(null);
    try {
      const res = await internshipClient.post<{ updated: number; skipped: number }>(
        "/api/reporting/admin/backfill-dosen",
        {}
      );
      if (res.success && res.data) {
        setBackfillResult(res.data);
      } else {
        setBackfillError(res.message || "Backfill gagal.");
      }
    } catch (e: any) {
      setBackfillError(e?.message || "Terjadi kesalahan.");
    } finally {
      setBackfillLoading(false);
    }
  };

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

  return (
    <DashboardAdminPage
      data={dashboardData}
      backfillLoading={backfillLoading}
      backfillResult={backfillResult}
      backfillError={backfillError}
      onBackfillDosen={handleBackfillDosen}
    />
  );
}
