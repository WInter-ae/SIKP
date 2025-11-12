import {
  Archive,
  BookOpen,
  Building2,
  FileText,
  FolderKanban,
  GraduationCap,
  Home,
  Settings,
  UserCircle,
  Users,
  FileCheck,
  Mail,
  ClipboardList,
  BookMarked,
  type LucideIcon,
} from "lucide-react"
import type { NavItem, UserRole } from "../types"

// Menu untuk Mahasiswa
const mahasiswaMenu: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Magang",
    url: "#",
    icon: GraduationCap,
    isActive: true,
    items: [
      {
        title: "Buat Tim",
        url: "/mahasiswa/buat-tim",
      },
      {
        title: "Pengajuan",
        url: "/mahasiswa/pengajuan",
      },
      {
        title: "Surat Pengantar",
        url: "/mahasiswa/surat-pengantar",
      },
      {
        title: "Surat Balasan",
        url: "/mahasiswa/surat-balasan",
      },
      {
        title: "Saat Magang",
        url: "/mahasiswa/saat-magang",
      },
      {
        title: "Pasca Magang",
        url: "#",
      },
    ],
  },
  {
    title: "Arsip",
    url: "#",
    icon: Archive,
  },
  {
    title: "Template",
    url: "#",
    icon: FileText,
  },
  {
    title: "Repositori",
    url: "#",
    icon: FolderKanban,
  },
  {
    title: "Tim",
    url: "#",
    icon: Users,
  },
  {
    title: "Mentor Lapangan",
    url: "#",
    icon: UserCircle,
  },
  {
    title: "Laporan KP",
    url: "#",
    icon: BookMarked,
  },
  {
    title: "Profil",
    url: "#",
    icon: UserCircle,
  },
  {
    title: "Pengaturan",
    url: "#",
    icon: Settings,
  },
]

// Menu untuk Admin Prodi
const adminMenu: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Pengajuan",
    url: "#",
    icon: ClipboardList,
    items: [
      {
        title: "Surat Pengantar",
        url: "#",
      },
    ],
  },
  {
    title: "Verifikasi",
    url: "#",
    icon: FileCheck,
    items: [
      {
        title: "Surat Balasan",
        url: "#",
      },
    ],
  },
  {
    title: "Arsip",
    url: "#",
    icon: Archive,
    items: [
      {
        title: "Mahasiswa",
        url: "#",
      },
      {
        title: "Dosen",
        url: "#",
      },
    ],
  },
  {
    title: "Template",
    url: "#",
    icon: FileText,
    items: [
      {
        title: "Kelola Template",
        url: "#",
      },
    ],
  },
  {
    title: "Profil",
    url: "#",
    icon: UserCircle,
  },
  {
    title: "Pengaturan",
    url: "#",
    icon: Settings,
  },
]

// Menu untuk Dosen
const dosenMenu: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Verifikasi",
    url: "#",
    icon: FileCheck,
    items: [
      {
        title: "Surat Mahasiswa",
        url: "#",
      },
    ],
  },
  {
    title: "Profil",
    url: "#",
    icon: UserCircle,
  },
  {
    title: "Pengaturan",
    url: "#",
    icon: Settings,
  },
]

export function getSidebarMenuByRole(role: UserRole): NavItem[] {
  switch (role) {
    case "mahasiswa":
      return mahasiswaMenu
    case "admin":
      return adminMenu
    case "dosen":
      return dosenMenu
    default:
      return mahasiswaMenu
  }
}
