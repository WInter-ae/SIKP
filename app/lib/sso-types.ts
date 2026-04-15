export type EffectiveRole =
  | "MAHASISWA"
  | "ADMIN"
  | "DOSEN"
  | "KAPRODI"
  | "WAKIL_DEKAN"
  | "MENTOR";

export type EffectivePermission = string;

export type AuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated";

export interface SSOReferenceEntity {
  id?: string;
  kode?: string;
  nama?: string;
  fakultasId?: string;
}

export interface SSODosenPAProfile {
  id?: string;
  fullName?: string;
  email?: string;
}

export interface SSODosenPA {
  id?: string;
  profileId?: string;
  nidn?: string;
  profile?: SSODosenPAProfile;
}

export interface SSOIdentityProfile {
  id?: string;
  profileId?: string;
  authUserId?: string;
  nama?: string;
  email?: string;
  nim?: string;
  nip?: string;
  nidn?: string;
  instansi?: string;
  phone?: string;
  jabatan?: string;
  jabatanFungsional?: string;
  jabatanStruktural?: string[];
  bidang?: string;
  bidangKeahlian?: string;
  status?: string;
  angkatan?: number;
  semester?: number;
  semesterAktif?: number;
  jumlahSksLulus?: number;
  prodiId?: string;
  fakultasId?: string;
  dosenPAProfileId?: string;
  prodi?: string;
  fakultas?: string;
  prodiDetail?: SSOReferenceEntity;
  fakultasDetail?: SSOReferenceEntity;
  dosenPA?: SSODosenPA;
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
  nidn?: string;
  fakultas?: string;
  prodi?: string;
  semester?: number;
  semesterAktif?: number;
  angkatan?: number;
  jumlahSksLulus?: number;
  phone?: string;
  jabatan?: string;
  jabatanFungsional?: string;
  jabatanStruktural?: string[];
}

export interface AuthSessionSnapshot {
  user: SessionUser | null;
  token: string | null;
  availableIdentities: SSOIdentity[];
  activeIdentity: SSOIdentity | null;
  effectiveRoles: EffectiveRole[];
  effectivePermissions: EffectivePermission[];
  authzSource: "ACCESS_TOKEN_CLAIMS" | null;
  sessionEstablished: boolean;
  requiresIdentitySelection: boolean;
}

export interface CallbackResponseData {
  sessionEstablished: boolean;
  requiresIdentitySelection: boolean;
  identities?: unknown[];
  activeIdentity?: unknown;
  effectiveRoles?: string[];
  effectivePermissions?: string[];
  authzSource?: string;
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

function pickFirstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    const parsed = pickString(value);
    if (parsed) {
      return parsed;
    }
  }

  return undefined;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function pickEmail(...values: unknown[]): string | undefined {
  for (const value of values) {
    const parsed = pickString(value);
    if (parsed && parsed.includes("@")) {
      return parsed;
    }
  }

  return undefined;
}

function pickNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function pickStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const normalized = value
    .map((item) => pickString(item))
    .filter((item): item is string => Boolean(item));

  return normalized.length > 0 ? normalized : undefined;
}

function parseReferenceEntity(value: unknown): SSOReferenceEntity | undefined {
  const record = asRecord(value);
  if (!record) return undefined;

  const entity: SSOReferenceEntity = {
    id: pickFirstString(record.id),
    kode: pickFirstString(record.kode),
    nama: pickFirstString(record.nama),
    fakultasId: pickFirstString(record.fakultasId),
  };

  if (!entity.id && !entity.kode && !entity.nama && !entity.fakultasId) {
    return undefined;
  }

  return entity;
}

function parseDosenPA(value: unknown): SSODosenPA | undefined {
  const record = asRecord(value);
  if (!record) return undefined;

  const profile = asRecord(record.profile);
  const parsedProfile: SSODosenPAProfile | undefined = profile
    ? {
        id: pickFirstString(profile.id),
        fullName: pickFirstString(profile.fullName),
        email: pickEmail(profile.email),
      }
    : undefined;

  const dosenPA: SSODosenPA = {
    id: pickFirstString(record.id),
    profileId: pickFirstString(record.profileId),
    nidn: pickFirstString(record.nidn),
    profile: parsedProfile,
  };

  if (!dosenPA.id && !dosenPA.profileId && !dosenPA.nidn && !dosenPA.profile) {
    return undefined;
  }

  return dosenPA;
}

function parseIdentityProfile(
  raw: Record<string, unknown>,
): SSOIdentityProfile {
  const metadata = asRecord(raw.metadata) || {};
  const metadataProfile = asRecord(metadata.profile) || {};

  const prodiDetail =
    parseReferenceEntity(raw.prodi) ||
    parseReferenceEntity(metadataProfile.prodi);
  const fakultasDetail =
    parseReferenceEntity(raw.fakultas) ||
    parseReferenceEntity(metadataProfile.fakultas);
  const dosenPA =
    parseDosenPA(raw.dosenPA) || parseDosenPA(metadataProfile.dosenPA);

  return {
    id: pickFirstString(
      raw.id,
      raw.identityId,
      raw.profileId,
      metadataProfile.id,
    ),
    profileId: pickFirstString(raw.profileId, metadataProfile.profileId),
    authUserId: pickFirstString(raw.authUserId, metadataProfile.authUserId),
    nama: pickFirstString(
      raw.nama,
      raw.fullName,
      raw.displayName,
      raw.name,
      metadataProfile.nama,
      metadataProfile.fullName,
      metadataProfile.name,
      metadata.fullName,
    ),
    email:
      pickEmail(
        raw.email,
        metadataProfile.email,
        metadata.email,
        dosenPA?.profile?.email,
      ) || pickEmail(raw.identifier),
    nim: pickFirstString(raw.nim, metadataProfile.nim),
    nip: pickFirstString(raw.nip, metadataProfile.nip),
    nidn: pickFirstString(raw.nidn, metadataProfile.nidn, dosenPA?.nidn),
    instansi: pickFirstString(raw.instansi, metadataProfile.instansi),
    phone: pickFirstString(
      raw.phone,
      raw.noTelepon,
      metadataProfile.phone,
      metadataProfile.noTelepon,
    ),
    jabatan: pickFirstString(
      raw.jabatan,
      raw.jabatanFungsional,
      metadataProfile.jabatan,
      metadataProfile.jabatanFungsional,
    ),
    jabatanFungsional: pickFirstString(
      raw.jabatanFungsional,
      metadataProfile.jabatanFungsional,
    ),
    jabatanStruktural:
      pickStringArray(raw.jabatanStruktural) ||
      pickStringArray(metadataProfile.jabatanStruktural),
    bidang: pickFirstString(raw.bidang, metadataProfile.bidang),
    bidangKeahlian: pickFirstString(
      raw.bidangKeahlian,
      metadataProfile.bidangKeahlian,
    ),
    status: pickFirstString(raw.status, metadataProfile.status),
    angkatan: pickNumber(raw.angkatan) ?? pickNumber(metadataProfile.angkatan),
    semester:
      pickNumber(raw.semester) ??
      pickNumber(raw.semesterAktif) ??
      pickNumber(metadataProfile.semester) ??
      pickNumber(metadataProfile.semesterAktif),
    semesterAktif:
      pickNumber(raw.semesterAktif) ??
      pickNumber(raw.semester) ??
      pickNumber(metadataProfile.semesterAktif) ??
      pickNumber(metadataProfile.semester),
    jumlahSksLulus:
      pickNumber(raw.jumlahSksLulus) ??
      pickNumber(metadataProfile.jumlahSksLulus),
    prodiId: pickFirstString(raw.prodiId, metadataProfile.prodiId),
    fakultasId: pickFirstString(raw.fakultasId, metadataProfile.fakultasId),
    dosenPAProfileId: pickFirstString(
      raw.dosenPAProfileId,
      metadataProfile.dosenPAProfileId,
    ),
    prodi:
      pickFirstString(raw.prodi, metadataProfile.prodi) ||
      prodiDetail?.nama ||
      prodiDetail?.kode,
    fakultas:
      pickFirstString(raw.fakultas, metadataProfile.fakultas) ||
      fakultasDetail?.nama ||
      fakultasDetail?.kode,
    prodiDetail,
    fakultasDetail,
    dosenPA,
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
    nidn: pickString(record.nidn) || activeIdentity?.profile.nidn,
    fakultas: pickString(record.fakultas) || activeIdentity?.profile.fakultas,
    prodi: pickString(record.prodi) || activeIdentity?.profile.prodi,
    semester:
      pickNumber(record.semester) ??
      pickNumber(record.semesterAktif) ??
      activeIdentity?.profile.semester,
    semesterAktif:
      pickNumber(record.semesterAktif) ??
      pickNumber(record.semester) ??
      activeIdentity?.profile.semesterAktif,
    angkatan: pickNumber(record.angkatan) ?? activeIdentity?.profile.angkatan,
    jumlahSksLulus:
      pickNumber(record.jumlahSksLulus) ??
      activeIdentity?.profile.jumlahSksLulus,
    phone: pickString(record.phone) || activeIdentity?.profile.phone,
    jabatan: pickString(record.jabatan) || activeIdentity?.profile.jabatan,
    jabatanFungsional:
      pickString(record.jabatanFungsional) ||
      activeIdentity?.profile.jabatanFungsional,
    jabatanStruktural:
      pickStringArray(record.jabatanStruktural) ||
      activeIdentity?.profile.jabatanStruktural,
  };
}
