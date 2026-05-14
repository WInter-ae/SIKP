"use client";

import * as React from "react";
import { GraduationCap } from "lucide-react";
import { useLocation } from "react-router";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
  SidebarRail,
} from "~/components/ui/sidebar";
import { getSidebarMenuByUrl } from "../data/sidebar-data";
import type { User } from "../types";
import { useUser } from "~/contexts/user-context";
import { useIdentity } from "~/contexts/identity-context";
import type { EffectiveRole } from "~/lib/sso-types";
import { get } from "~/lib/api-client";
import type { DashboardMahasiswaData } from "../../dashboard/pages/dashboard-mahasiswa-page";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: User;
}

const getDefaultUser = (pathname: string): User => {
  let role: EffectiveRole = "MAHASISWA";
  if (pathname.startsWith("/admin")) {
    role = "ADMIN";
  } else if (pathname.startsWith("/dosen")) {
    role = "DOSEN";
  } else if (pathname.startsWith("/mentor")) {
    role = "MENTOR";
  }

  return {
    name: role === "DOSEN" ? "Dr. Ahmad Santoso, M.Kom" : "John Doe",
    email:
      role === "DOSEN"
        ? "ahmad.santoso@university.ac.id"
        : "john.doe@example.com",
    avatar: "/avatars/default.jpg",
    role,
  };
};

export function AppSidebar({ user: userProp, ...props }: AppSidebarProps) {
  const location = useLocation();
  const { user: contextUser } = useUser();
  const { effectiveRoles, activeIdentity } = useIdentity();
  const [submissionStatus, setSubmissionStatus] = React.useState<{
    submitted: boolean;
    approved: boolean;
  }>({ submitted: false, approved: false });


  const defaultUser = React.useMemo(
    () => getDefaultUser(location.pathname),
    [location.pathname],
  );

  const userJabatanStruktural = React.useMemo(() => {
    const jabatanStruktural =
      contextUser?.jabatanStruktural ||
      activeIdentity?.profile.jabatanStruktural;

    return Array.isArray(jabatanStruktural)
      ? jabatanStruktural.join(", ")
      : undefined;
  }, [
    activeIdentity?.profile.jabatanStruktural,
    contextUser?.jabatanStruktural,
  ]);

  const contextRole = React.useMemo<EffectiveRole>(() => {
    const hasRole = (role: string) => effectiveRoles.some(r => r.toUpperCase() === role.toUpperCase());
    const jabatanLower = userJabatanStruktural?.toLowerCase() || "";
    const isWakdek = jabatanLower.includes("wakil") && jabatanLower.includes("dekan");
    const isKaprodi = (jabatanLower.includes("ketua") && (jabatanLower.includes("prodi") || jabatanLower.includes("program studi"))) || 
                      jabatanLower.includes("kaprodi") || 
                      jabatanLower.includes("koordinator");
    
    if (hasRole("ADMIN")) return "ADMIN";
    if (hasRole("MENTOR")) return "MENTOR";
    if (hasRole("WAKIL_DEKAN") || isWakdek) return "WAKIL_DEKAN";
    if (hasRole("KAPRODI") || isKaprodi) return "KAPRODI";
    if (hasRole("DOSEN")) return "DOSEN";
    if (hasRole("MAHASISWA")) return "MAHASISWA";

    return defaultUser.role;
  }, [defaultUser.role, effectiveRoles, userJabatanStruktural]);

  const primaryRole = React.useMemo(() => {
    if (effectiveRoles.length === 0) return undefined;

    const has = (r: string) => effectiveRoles.some(role => role.toUpperCase() === r.toUpperCase());
    const jabatanLower = userJabatanStruktural?.toLowerCase() || "";
    const isWakdek = jabatanLower.includes("wakil") && jabatanLower.includes("dekan");
    const isKaprodi = (jabatanLower.includes("ketua") && (jabatanLower.includes("prodi") || jabatanLower.includes("program studi"))) || 
                      jabatanLower.includes("kaprodi") || 
                      jabatanLower.includes("koordinator");

    if (has("ADMIN")) return "ADMIN";
    if (has("MENTOR")) return "MENTOR";
    if (has("WAKIL_DEKAN") || isWakdek) return "WAKIL_DEKAN";
    if (has("KAPRODI") || isKaprodi) return "KAPRODI";
    if (has("DOSEN")) return "DOSEN";
    if (has("MAHASISWA")) return "MAHASISWA";

    return effectiveRoles[0];
  }, [effectiveRoles, userJabatanStruktural]);

  React.useEffect(() => {
    if (contextRole !== "MAHASISWA") return;

    const fetchStatus = async () => {
      try {
        const response = await get<DashboardMahasiswaData>(
          "/api/mahasiswa/dashboard",
        );
        if (response.success && response.data?.statusPengajuan) {
          setSubmissionStatus({
            submitted: !!response.data.statusPengajuan.submitted,
            approved: response.data.statusPengajuan.code === "approved",
          });
        }
      } catch (error) {
        console.error("Failed to fetch submission status for sidebar:", error);
      }
    };

    void fetchStatus();
  }, [contextRole, location.pathname]);

  const user = React.useMemo(() => {
    if (contextUser) {
      return {
        name: contextUser.nama,
        email: contextUser.email,
        avatar: "/avatars/default.jpg",
        role: contextRole,
        activeIdentityLabel: activeIdentity?.label,
      };
    }

    return userProp || defaultUser;
  }, [activeIdentity?.label, contextRole, contextUser, defaultUser, userProp]);

  const navItems = React.useMemo(
    () =>
      getSidebarMenuByUrl(
        location.pathname,
        primaryRole,
        userJabatanStruktural ||
          contextUser?.jabatan ||
          activeIdentity?.profile.jabatan,
        submissionStatus,
      ),
    [
      activeIdentity?.profile.jabatan,
      contextUser?.jabatan,
      location.pathname,
      primaryRole,
      submissionStatus,
      userJabatanStruktural,
    ],
  );

  return (
    <Sidebar
      collapsible="icon"
      className="relative overflow-hidden border-r border-sidebar-border/70 bg-linear-to-b from-sidebar via-sidebar to-sidebar/95 shadow-sm"
      {...props}
    >
      {/* Animated subtle gradient overlay for elegance */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 animate-gradient"
        style={{
          backgroundImage:
            "linear-gradient(120deg, var(--sidebar), var(--sidebar-accent))",
          backgroundSize: "200% 200%",
          opacity: 0.03,
        }}
      />
      <SidebarHeader className="px-3 pt-4 pb-3 bg-yellow-300">
        <div className="flex items-center gap-3 rounded-2xl border border-sidebar-border/60 bg-sidebar-accent/90 backdrop-blur-sm px-3 py-3 shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg">
          <div className="bg-yellow-300 text-black ring-white/90 flex aspect-square size-10 items-center justify-center rounded-xl bg-linear-to-br shadow-lg ring-4">
            <GraduationCap className="size-6" />
          </div>
          <div className="grid flex-1 text-left leading-tight">
            <span className="truncate text-base font-bold tracking-tight">
              SIKP MI UNSRI
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarSeparator className="mx-3" />
      <SidebarContent className="overflow-hidden px-1 py-2">
        <ScrollArea
          className="h-full pr-1"
          scrollbarClassName="w-2 opacity-20 transition-opacity duration-300 hover:opacity-100 data-[state=visible]:opacity-100"
          thumbClassName="bg-sidebar-border/50 hover:bg-sidebar-border/90"
        >
          <NavMain items={navItems} />
        </ScrollArea>
      </SidebarContent>
      <SidebarSeparator className="mx-3" />
      <SidebarFooter className="px-2 pt-2 pb-3">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail className="after:bg-sidebar-border/70" />
    </Sidebar>
  );
}
