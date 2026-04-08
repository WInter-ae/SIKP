export type EffectiveRole =
  | "MAHASISWA"
  | "ADMIN"
  | "DOSEN"
  | "KAPRODI"
  | "WAKIL_DEKAN"
  | "MENTOR";

export type AuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated";

export interface SSOIdentityProfile {
  id?: string;
  nama?: string;
  email?: string;
  nim?: string;
  nip?: string;
  fakultas?: string;
  prodi?: string;
  semester?: number;
  angkatan?: string;
  phone?: string;
  jabatan?: string;
}

export interface SSOIdentity {
  identityType: EffectiveRole;
  profile: SSOIdentityProfile;
  label: string;
}

export interface SessionUser {
  id: string;
  nama: string;
  email: string;
  role: EffectiveRole;
  nim?: string;
  nip?: string;
  fakultas?: string;
  prodi?: string;
  semester?: number;
  angkatan?: string;
  phone?: string;
  jabatan?: string;
}

export interface AuthSessionSnapshot {
  user: SessionUser | null;
  token: string | null;
  availableIdentities: SSOIdentity[];
  activeIdentity: SSOIdentity | null;
  effectiveRoles: EffectiveRole[];
  sessionEstablished: boolean;
  requiresIdentitySelection: boolean;
}

export interface CallbackResponseData {
  sessionEstablished: boolean;
  requiresIdentitySelection: boolean;
  identities?: unknown[];
  activeIdentity?: unknown;
  effectiveRoles?: string[];
  user?: unknown;
  token?: string;
  accessToken?: string;
  sessionToken?: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const ROLE_PRIORITY: EffectiveRole[] = [
  "ADMIN",
  "WAKIL_DEKAN",
  "KAPRODI",
  "DOSEN",
  "MENTOR",
  "MAHASISWA",
];

export function normalizeRole(raw: unknown): EffectiveRole | null {
  if (typeof raw !== "string") return null;

  const normalized = raw.trim().toUpperCase().replace(/[-\s]/g, "_");

  if (normalized === "WAKILDEKAN") {
    return "WAKIL_DEKAN";
  }

  if (
    normalized === "MAHASISWA" ||
    normalized === "ADMIN" ||
    normalized === "DOSEN" ||
    normalized === "KAPRODI" ||
    normalized === "WAKIL_DEKAN" ||
    normalized === "MENTOR"
  ) {
    return normalized;
  }

  return null;
}

function pickString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function pickNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return undefined;
}

function parseIdentityProfile(
  raw: Record<string, unknown>,
): SSOIdentityProfile {
  return {
    id: pickString(raw.id),
    nama: pickString(raw.nama),
    email: pickString(raw.email),
    nim: pickString(raw.nim),
    nip: pickString(raw.nip),
    fakultas: pickString(raw.fakultas),
    prodi: pickString(raw.prodi),
    semester: pickNumber(raw.semester),
    angkatan: pickString(raw.angkatan),
    phone: pickString(raw.phone),
    jabatan: pickString(raw.jabatan),
  };
}

function extractIdentityType(
  raw: Record<string, unknown>,
): EffectiveRole | null {
  return (
    normalizeRole(raw.identityType) ||
    normalizeRole(raw.type) ||
    normalizeRole(raw.role) ||
    normalizeRole(raw.identity)
  );
}

export function normalizeIdentity(rawIdentity: unknown): SSOIdentity | null {
  if (!rawIdentity || typeof rawIdentity !== "object") return null;

  const record = rawIdentity as Record<string, unknown>;
  const identityType = extractIdentityType(record);
  if (!identityType) return null;

  const profileRaw =
    record.profile && typeof record.profile === "object"
      ? (record.profile as Record<string, unknown>)
      : record;

  const profile = parseIdentityProfile(profileRaw);

  return {
    identityType,
    profile,
    label: identityType.replace(/_/g, " "),
  };
}

export function normalizeRoles(rawRoles: unknown[]): EffectiveRole[] {
  const unique = new Set<EffectiveRole>();

  for (const role of rawRoles) {
    const normalized = normalizeRole(role);
    if (normalized) {
      unique.add(normalized);
    }
  }

  return [...unique];
}

export function pickPrimaryRole(
  roles: EffectiveRole[],
  activeIdentity?: SSOIdentity | null,
): EffectiveRole | null {
  const uniqueRoles = normalizeRoles(roles);

  if (
    activeIdentity?.identityType &&
    uniqueRoles.includes(activeIdentity.identityType)
  ) {
    return activeIdentity.identityType;
  }

  for (const candidate of ROLE_PRIORITY) {
    if (uniqueRoles.includes(candidate)) {
      return candidate;
    }
  }

  return null;
}

export function getDashboardPathByRole(role: EffectiveRole | null): string {
  if (!role) return "/login";

  if (role === "ADMIN") return "/admin";
  if (role === "MENTOR") return "/mentor";
  if (role === "DOSEN" || role === "KAPRODI" || role === "WAKIL_DEKAN") {
    return "/dosen";
  }
  if (role === "MAHASISWA") return "/mahasiswa";

  return "/login";
}

export function getDashboardPath(
  roles: EffectiveRole[],
  activeIdentity?: SSOIdentity | null,
): string {
  return getDashboardPathByRole(pickPrimaryRole(roles, activeIdentity));
}

export function toSessionUser(
  rawUser: unknown,
  activeIdentity: SSOIdentity | null,
  roles: EffectiveRole[],
): SessionUser | null {
  if (!rawUser || typeof rawUser !== "object") return null;

  const record = rawUser as Record<string, unknown>;
  const primaryRole = pickPrimaryRole(roles, activeIdentity);
  if (!primaryRole) return null;

  const id = pickString(record.id) || activeIdentity?.profile.id;
  const email =
    pickString(record.email) ||
    activeIdentity?.profile.email ||
    "unknown@example.com";
  const nama =
    pickString(record.nama) || activeIdentity?.profile.nama || "User SSO";

  if (!id) return null;

  return {
    id,
    nama,
    email,
    role: primaryRole,
    nim: pickString(record.nim) || activeIdentity?.profile.nim,
    nip: pickString(record.nip) || activeIdentity?.profile.nip,
    fakultas: pickString(record.fakultas) || activeIdentity?.profile.fakultas,
    prodi: pickString(record.prodi) || activeIdentity?.profile.prodi,
    semester: pickNumber(record.semester) || activeIdentity?.profile.semester,
    angkatan: pickString(record.angkatan) || activeIdentity?.profile.angkatan,
    phone: pickString(record.phone) || activeIdentity?.profile.phone,
    jabatan: pickString(record.jabatan) || activeIdentity?.profile.jabatan,
  };
}
