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
  BookMarked,
  Award,
} from "lucide-react";
import type { EffectiveRole } from "~/lib/sso-types";
import type { NavItem } from "../types";

// Menu untuk Mahasiswa
const mahasiswaMenu: NavItem[] = [
  {
    title: "Dashboard",
    url: "/mahasiswa",
    icon: Home,
  },
  {
    title: "Kerja Praktik",
    url: "#",
    icon: GraduationCap,
    isActive: true,
    items: [
      {
        title: "Bentuk tim",
        url: "/mahasiswa/kp/buat-tim",
      },
      {
        title: "Pengajuan KP",
        url: "/mahasiswa/kp/pengajuan",
      },
      {
        title: "Status Pengajuan",
        url: "/mahasiswa/kp/surat-pengantar",
      },
      {
        title: "Surat Balasan",
        url: "/mahasiswa/kp/surat-balasan",
      },
      {
        title: "Pelaksanaan",
        url: "/mahasiswa/kp/saat-magang",
      },
      {
        title: "Pengujian Sidang",
        url: "/mahasiswa/kp/pengujian-sidang",
      },
      {
        title: "Pasca KP",
        url: "#",
      },
    ],
  },
  {
    title: "Arsip KP",
    url: "/mahasiswa/kp/arsip",
    icon: Archive,
  },
  {
    title: "Template",
    url: "/mahasiswa/kp/template",
    icon: FileText,
  },
  {
    title: "Repositori",
    url: "/mahasiswa/repositori",
    icon: FolderKanban,
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
];

// Menu untuk Admin Prodi
const adminMenu: NavItem[] = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: Home,
  },
  {
    title: "Verifikasi",
    url: "#",
    icon: FileCheck,
    items: [
      {
        title: "Pengajuan Surat Pengantar",
        url: "/admin/pengajuan-surat-pengantar",
      },
      {
        title: "Surat Balasan",
        url: "/admin/surat-balasan",
      },
    ],
  },
  {
    title: "Arsip Magang",
    url: "/admin/arsip",
    icon: Archive,
  },
  {
    title: "Template",
    url: "#",
    icon: FileText,
    items: [
      {
        title: "Kelola Template",
        url: "/admin/template",
      },
    ],
  },
  {
    title: "Penilaian",
    url: "#",
    icon: Award,
    items: [
      {
        title: "Kriteria & Bobot",
        url: "/admin/penilaian-kriteria",
      },
    ],
  },
  {
    title: "Pengaturan",
    url: "#",
    icon: Settings,
    items: [
      {
        title: "Reset Logbook Global",
        url: "/admin/logbook-reset",
      },
    ],
  },
];

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
    title: "Verifikasi",
    url: "#",
    icon: FileCheck,
    items: [
      {
        title: "Surat Ajuan Mahasiswa",
        url: "/dosen/kp/verifikasi-surat",
      },
      {
        title: "Verifikasi Mentor",
        url: "/dosen/kp/persetujuan-pembimbing",
      },
      {
        title: "Monitoring Logbook",
        url: "/dosen/kp/logbook-monitor",
      },
    ],
  },
  {
    title: "Penilaian KP",
    url: "/dosen/penilaian",
    icon: Award,
  },
];

// Menu untuk Wakil Dekan Bidang Akademik
const wakilDekanMenu: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dosen",
    icon: Home,
  },
  {
    title: "Verifikasi",
    url: "#",
    icon: FileCheck,
    items: [
      {
        title: "Pengajuan Surat Pengantar",
        url: "/dosen/kp/surat-pengantar",
      },
    ],
  },
];

// Menu untuk Pembimbing Lapangan (Mentor)
const mentorMenu: NavItem[] = [
  {
    title: "Dashboard",
    url: "/mentor",
    icon: Home,
  },
  {
    title: "Mahasiswa Bimbingan",
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
    url: "https://sso-unsri.vercel.app/profile",
    icon: UserCircle,
  },
  {
    title: "Pengaturan",
    url: "/mentor/pengaturan",
    icon: Settings,
  },
];

export function getSidebarMenuByRole(role: EffectiveRole): NavItem[] {
  switch (role) {
    case "MAHASISWA":
      return mahasiswaMenu;
    case "ADMIN":
      return adminMenu;
    case "DOSEN":
    case "KAPRODI":
    case "WAKIL_DEKAN":
      return dosenMenu;
    case "MENTOR":
      return mentorMenu;
    default:
      return mahasiswaMenu;
  }
}

export function getSidebarMenuByUrl(
  pathname: string,
  userRole?: string,
  userJabatanStruktural?: string,
  submissionStatus?: { submitted: boolean; approved: boolean },
): NavItem[] {
  // Clone the menu to avoid mutating the original
  const getMahasiswaMenu = () => {
    return mahasiswaMenu.map((item) => {
      if (item.title === "Kerja Praktik" && item.items) {
        return {
          ...item,
          items: item.items.map((subItem) => {
            if (subItem.title === "Status Pengajuan") {
              return { ...subItem, disabled: !submissionStatus?.submitted };
            }
            if (subItem.title === "Surat Balasan") {
              return { ...subItem, disabled: !submissionStatus?.approved };
            }
            return subItem;
          }),
        };
      }
      return item;
    });
  };

  const currentMahasiswaMenu = submissionStatus ? getMahasiswaMenu() : mahasiswaMenu;

  if (pathname.startsWith("/admin")) {
    return adminMenu;
  }
  if (pathname.startsWith("/dosen")) {
    // Check if user is Wakil Dekan by checking jabatan (can contain "WAKIL_DEKAN", "wakil dekan", etc)
    if (userJabatanStruktural) {
      const jabatanLower = userJabatanStruktural.toLowerCase();
      const isWakdek =
        jabatanLower.includes("wakil") && jabatanLower.includes("dekan");
      if (isWakdek) {
        return wakilDekanMenu;
      }
    }
    return dosenMenu;
  }
  if (pathname.startsWith("/mentor")) {
    return mentorMenu;
  }
  if (pathname.startsWith("/mahasiswa")) {
    return currentMahasiswaMenu;
  }

  const normalizedRole = userRole?.toUpperCase();

  if (normalizedRole === "ADMIN") return adminMenu;
  if (normalizedRole === "MENTOR") return mentorMenu;
  if (
    normalizedRole === "DOSEN" ||
    normalizedRole === "KAPRODI" ||
    normalizedRole === "WAKIL_DEKAN"
  ) {
    if (userJabatanStruktural) {
      const jabatanLower = userJabatanStruktural.toLowerCase();
      const isWakdek =
        jabatanLower.includes("wakil") && jabatanLower.includes("dekan");
      if (isWakdek) {
        return wakilDekanMenu;
      }
    }
    return dosenMenu;
  }

  if (normalizedRole === "MAHASISWA") return currentMahasiswaMenu;

  // Default ke mahasiswa jika tidak ada yang cocok
  return currentMahasiswaMenu;
}
