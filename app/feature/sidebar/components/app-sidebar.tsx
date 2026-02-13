"use client";

import * as React from "react";
import { GraduationCap } from "lucide-react";
import { useLocation } from "react-router";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "~/components/ui/sidebar";
import { getSidebarMenuByUrl } from "../data/sidebar-data";
import type { SidebarRole, User } from "../types";
import { useUser } from "~/contexts/user-context";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: User;
}

const sidebarRoleFromSsoRoles = (roles: string[] | undefined): SidebarRole => {
  const normalized = (roles ?? []).map((r) => String(r).toLowerCase());
  if (normalized.includes("admin") || normalized.includes("superadmin")) {
    return "admin";
  }
  if (
    normalized.includes("dosen") ||
    normalized.includes("lektor") ||
    normalized.includes("kaprodi") ||
    normalized.includes("wakil_dekan")
  ) {
    return "dosen";
  }
  if (normalized.includes("pembimbing_lapangan")) return "mentor";
  return "mahasiswa";
};

// Default user untuk development/testing
// Nanti bisa diganti dengan data user dari authentication context
const getDefaultUser = (pathname: string): User => {
  let role: SidebarRole = "mahasiswa";
  if (pathname.startsWith("/admin")) {
    role = "admin";
  } else if (pathname.startsWith("/dosen")) {
    role = "dosen";
  } else if (pathname.startsWith("/mentor")) {
    role = "mentor";
  }

  return {
    name: role === "dosen" ? "Dr. Ahmad Santoso, M.Kom" : "John Doe",
    email:
      role === "dosen"
        ? "ahmad.santoso@university.ac.id"
        : "john.doe@example.com",
    avatar: "/avatars/default.jpg",
    role,
  };
};

export function AppSidebar({ user: userProp, ...props }: AppSidebarProps) {
  const location = useLocation();
  const { user: contextUser } = useUser();
  const defaultUser = getDefaultUser(location.pathname);

  // Prioritize user from context, fall back to prop, then default
  const user = React.useMemo(() => {
    if (contextUser) {
      return {
        name: contextUser.nama,
        email: contextUser.email,
        avatar: "/avatars/default.jpg",
        role: sidebarRoleFromSsoRoles(contextUser.roles),
      };
    }
    return userProp || defaultUser;
  }, [contextUser, userProp, defaultUser]);

  // Get menu items based on current URL path
  const navItems = React.useMemo(
    () => getSidebarMenuByUrl(location.pathname),
    [location.pathname],
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="bg-primary text-primary-foreground flex aspect-square size-10 items-center justify-center rounded-lg">
            <GraduationCap className="size-6" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">SIKP</span>
            <span className="truncate text-xs text-muted-foreground">
              Sistem Informasi Kerja Praktik
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
