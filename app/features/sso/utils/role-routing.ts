import type { LoginMode } from "~/features/sso/types/role.types";

export function normalizeRoles(roles: string[] | undefined): string[] {
  return (roles ?? []).map((role) => String(role).toLowerCase());
}

export function hasAdminRole(roles: string[] | undefined): boolean {
  const normalized = normalizeRoles(roles);
  return normalized.includes("admin") || normalized.includes("superadmin");
}

export function getAvailableLoginModes(roles: string[]): LoginMode[] {
  const hasMahasiswaRole =
    roles.includes("mahasiswa") || roles.includes("alumni");

  const hasDosenRole =
    roles.includes("dosen") ||
    roles.includes("lektor") ||
    roles.includes("kaprodi") ||
    roles.includes("wakil_dekan");

  const modes: LoginMode[] = [];
  if (hasMahasiswaRole) modes.push("mahasiswa");
  if (hasDosenRole) modes.push("dosen");
  return modes;
}

export function getRedirectPathFromRoles(roles: string[] | undefined): string {
  const normalized = normalizeRoles(roles);

  if (hasAdminRole(normalized)) return "/admin";
  if (normalized.includes("wakil_dekan")) return "/wakil-dekan";
  if (normalized.includes("kaprodi")) return "/kaprodi";
  if (normalized.includes("dosen") || normalized.includes("lektor")) {
    return "/dosen";
  }
  if (normalized.includes("pembimbing_lapangan")) return "/mentor";
  if (normalized.includes("mahasiswa") || normalized.includes("alumni")) {
    return "/mahasiswa";
  }

  return "/";
}
