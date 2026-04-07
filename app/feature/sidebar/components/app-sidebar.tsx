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
import type { User, UserRole } from "../types";
import { useUser } from "~/contexts/user-context";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: User;
}

// Default user untuk development/testing
// Nanti bisa diganti dengan data user dari authentication context
const getDefaultUser = (pathname: string): User => {
  let role: UserRole = "mahasiswa";
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
        role: contextUser.role.toLowerCase() as UserRole,
      };
    }
    return userProp || defaultUser;
  }, [contextUser, userProp, defaultUser]);

  // Get menu items based on current URL path and user role/jabatan
  const navItems = React.useMemo(
    () =>
      getSidebarMenuByUrl(
        location.pathname,
        contextUser?.role,
        contextUser?.jabatan,
      ),
    [location.pathname, contextUser?.role, contextUser?.jabatan],
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
            <span className="truncate text-base font-bold tracking-tight">SIKP</span>
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
