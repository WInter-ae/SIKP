import type { LucideIcon } from "lucide-react";
import type { EffectiveRole } from "~/lib/sso-types";

export interface User {
  name: string;
  email: string;
  avatar: string;
  role: EffectiveRole;
  activeIdentityLabel?: string;
}

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: NavItem[];
}

export interface SidebarData {
  user: User;
  navMain: NavItem[];
}
