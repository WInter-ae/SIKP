import type { LucideIcon } from "lucide-react"

export type SidebarRole = "mahasiswa" | "dosen" | "admin" | "mentor"

export interface User {
  name: string
  email: string
  avatar: string
  role: SidebarRole
}

export interface NavItem {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  items?: {
    title: string
    url: string
  }[]
}

export interface SidebarData {
  user: User
  navMain: NavItem[]
}
