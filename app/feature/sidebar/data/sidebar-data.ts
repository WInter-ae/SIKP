import {
  Archive,
  Bell,
  ClipboardCheck,
  FileText,
  FolderKanban,
  GraduationCap,
  Home,
  Settings,
  UserCircle,
  Users,
  FileCheck,
  ClipboardList,
  BookMarked,
  Award,
} from "lucide-react"
import type { NavItem, UserRole } from "../types"

// Menu untuk Mahasiswa
const mahasiswaMenu: NavItem[] = [
  {
    title: "Dashboard",
    url: "/mahasiswa",
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
        url: "/mahasiswa/kp/buat-tim",
      },
      {
        title: "Pengajuan",
        url: "/mahasiswa/kp/pengajuan",
      },
      {
        title: "Surat Pengantar",
        url: "/mahasiswa/kp/surat-pengantar",
      },
      {
        title: "Surat Balasan",
        url: "/mahasiswa/kp/surat-balasan",
      },
      {
        title: "Saat Magang",
        url: "/mahasiswa/kp/saat-magang",
      },
      {
        title: "Pengujian Sidang",
        url: "/mahasiswa/kp/pengujian-sidang",
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
    url: "/mahasiswa/repositori",
    icon: FolderKanban,
  },
  {
    title: "Tim",
    url: "#",
    icon: Users,
  },
  {
    title: "Mentor Lapangan",
    url: "/mahasiswa/mentor-lapangan",
    icon: UserCircle,
  },
  {
    title: "Laporan KP",
    url: "/mahasiswa/kp/laporan",
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
    url: "/admin",
    icon: Home,
  },
  {
    title: "Pengajuan",
    url: "#",
    icon: ClipboardList,
    items: [
      {
        title: "Surat Pengantar",
        url: "/admin/pengajuan-surat-pengantar",
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
        url: "/admin/surat-balasan",
      },
      {
        title: "Persetujuan Pembimbing",
        url: "/admin/persetujuan-pembimbing",
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
    title: "Penilaian",
    url: "/admin/penilaian",
    icon: Award,
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
    url: "/dosen",
    icon: Home,
  },
  {
    title: "Kerja Praktik",
    url: "#",
    icon: GraduationCap,
    isActive: true,
    items: [
      {
        title: "Verifikasi Judul",
        url: "/dosen/kp/verifikasi-judul",
      },
      {
        title: "Verifikasi Sidang",
        url: "/dosen/kp/verifikasi-sidang",
      },
    ],
  },
  {
    title: "Penilaian KP",
    url: "/dosen/penilaian",
    icon: Award,
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

// Menu untuk Pembimbing Lapangan (Mentor)
const mentorMenu: NavItem[] = [
  {
    title: "Dashboard",
    url: "/mentor",
    icon: Home,
  },
  {
    title: "Mahasiswa Magang",
    url: "/mentor/mentee",
    icon: Users,
  },
  {
    title: "Logbook",
    url: "/mentor/logbook",
    icon: BookMarked,
  },
  {
    title: "Penilaian",
    url: "/mentor/penilaian",
    icon: ClipboardCheck,
  },
  {
    title: "Notifikasi",
    url: "/mentor/notifikasi",
    icon: Bell,
  },
  {
    title: "Arsip",
    url: "/mentor/arsip",
    icon: Archive,
  },
  {
    title: "Profil",
    url: "/mentor/profil",
    icon: UserCircle,
  },
  {
    title: "Pengaturan",
    url: "/mentor/pengaturan",
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
    case "mentor":
      return mentorMenu
    default:
      return mahasiswaMenu
  }
}

export function getSidebarMenuByUrl(pathname: string): NavItem[] {
  if (pathname.startsWith("/admin")) {
    return adminMenu
  }
  if (pathname.startsWith("/dosen")) {
    return dosenMenu
  }
  if (pathname.startsWith("/mentor")) {
    return mentorMenu
  }
  if (pathname.startsWith("/mahasiswa")) {
    return mahasiswaMenu
  }
  // Default ke mahasiswa jika tidak ada yang cocok
  return mahasiswaMenu
}
