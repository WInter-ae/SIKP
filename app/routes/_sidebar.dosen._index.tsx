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
import { getDosenSuratPengantarRequests } from "~/lib/services/surat-pengantar-dosen.service";

function isAdminApproved(item: {
  isAdminApproved?: unknown;
  adminVerificationStatus?: unknown;
  admin_status?: unknown;
  adminStatus?: unknown;
  submissionStatus?: unknown;
  submission_status?: unknown;
  status?: unknown;
}): boolean {
  if (typeof item.isAdminApproved === "boolean") return item.isAdminApproved;
  const candidates = [
    item.adminVerificationStatus,
    item.admin_status,
    item.adminStatus,
    item.submissionStatus,
    item.submission_status,
  ]
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim().toUpperCase());

  if (candidates.some((v) => v === "APPROVED" || v === "DISETUJUI"))
    return true;
  // backward compat: if backend didn't send admin status fields, show the item
  if (candidates.length === 0) return true;
  return false;
}

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
            profileResponse.data.jabatanStruktural.some((j) => {
              const normalized = j.toLowerCase().replace(/_/g, " ");
              return (
                normalized.includes("wakil") && normalized.includes("dekan")
              );
            }),
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
        setIsWakdek(wakdekByJabatan);

        if (wakdekByJabatan) {
          // ✅ Reuse the same endpoint as submission-dosen page — guaranteed to work
          const requestsResponse = await getDosenSuratPengantarRequests();
          if (!active) return;

          const allItems = requestsResponse.success
            ? (requestsResponse.data ?? [])
            : [];

          const adminApprovedItems = allItems.filter(isAdminApproved);

          const menunggu = adminApprovedItems.filter((item) => {
            const s = (item.status ?? "").toLowerCase();
            return s === "menunggu" || s === "" || s === "pending";
          }).length;

          const disetujui = adminApprovedItems.filter((item) => {
            const s = (item.status ?? "").toLowerCase();
            return (
              s === "disetujui" || s === "approved" || s === "completed"
            );
          }).length;

          const ditolak = adminApprovedItems.filter((item) => {
            const s = (item.status ?? "").toLowerCase();
            return s === "ditolak" || s === "rejected";
          }).length;

          setWakdekDashboardData({
            totalAjuanSuratPengantarMasuk: adminApprovedItems.length,
            menungguVerifikasi: menunggu,
            disetujui,
            ditolak,
            activities: [],
          });
        } else {
          const response = await getDosenDashboard();
          if (!active) return;
          if (response.success && response.data) {
            setDashboardData(response.data as DashboardDosenData);
          }
        }
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
