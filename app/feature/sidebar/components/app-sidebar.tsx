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
import type { EffectiveRole } from "~/lib/sso-types";

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
  const { user: contextUser, effectiveRoles, activeIdentity } = useUser();

  const defaultUser = React.useMemo(
    () => getDefaultUser(location.pathname),
    [location.pathname],
  );

  const contextRole = React.useMemo<EffectiveRole>(() => {
    const hasRole = (role: EffectiveRole) => effectiveRoles.includes(role);

    if (hasRole("ADMIN")) return "ADMIN";
    if (hasRole("MENTOR")) return "MENTOR";
    if (hasRole("DOSEN") || hasRole("KAPRODI") || hasRole("WAKIL_DEKAN")) {
      return "DOSEN";
    }
    if (hasRole("MAHASISWA")) return "MAHASISWA";

    return defaultUser.role;
  }, [defaultUser.role, effectiveRoles]);

  const primaryRole = React.useMemo(() => {
    if (effectiveRoles.length === 0) return undefined;

    return (
      effectiveRoles.find((role) => role === "ADMIN") ||
      effectiveRoles.find((role) => role === "MENTOR") ||
      effectiveRoles.find(
        (role) =>
          role === "DOSEN" || role === "KAPRODI" || role === "WAKIL_DEKAN",
      ) ||
      effectiveRoles[0]
    );
  }, [effectiveRoles]);

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
        contextUser?.jabatan || activeIdentity?.profile.jabatan,
      ),
    [
      activeIdentity?.profile.jabatan,
      contextUser?.jabatan,
      location.pathname,
      primaryRole,
    ],
  );

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border/70 bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95"
      {...props}
    >
      <SidebarHeader className="px-3 pt-4 pb-3">
        <div className="flex items-center gap-3 rounded-xl border border-sidebar-border/70 bg-sidebar-accent/40 px-3 py-3 shadow-sm">
          <div className="from-primary to-primary/80 text-primary-foreground ring-primary/20 flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-md ring-4">
            <GraduationCap className="size-6" />
          </div>
          <div className="grid flex-1 text-left leading-tight">
            <span className="truncate text-base font-bold tracking-tight">
              SIKP
            </span>
            <span className="truncate text-xs font-medium text-muted-foreground">
              Sistem Informasi Kerja Praktik
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
