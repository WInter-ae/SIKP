import {
  type ApiEnvelope,
  type AuthSessionSnapshot,
  type CallbackResponseData,
  type EffectivePermission,
  type EffectiveRole,
  type SSOIdentity,
  getDashboardPath,
  normalizeIdentity,
  normalizeRoles,
  pickPrimaryRole,
  toSessionUser,
} from "~/lib/sso-types";

interface PKCEState {
  state: string;
  codeVerifier: string;
  codeChallenge: string;
  redirectUri: string;
  createdAt: number;
  expiresAt: number;
}

interface CallbackRequest {
  code: string;
  state: string;
  redirectUri?: string;
}

interface PrepareResponseData {
  state?: unknown;
  authorizeUrl?: unknown;
}

interface SessionResult {
  success: boolean;
  message: string;
  session: AuthSessionSnapshot | null;
  requiresIdentitySelection: boolean;
}

interface IdentitySelectionPayload {
  activeIdentity?: unknown;
  effectiveRoles?: unknown[];
  user?: unknown;
  availableIdentities?: unknown[];
  identities?: unknown[];
  token?: unknown;
  accessToken?: unknown;
  sessionToken?: unknown;
}

const DEFAULT_API_BASE_URL = "https://backend-sikp.backend-sikp.workers.dev";

const STORAGE_KEYS = {
  session: "sikp_auth_session",
  pkce: "sikp_pkce_state",
  legacyToken: "auth_token",
  legacyUser: "user_data",
} as const;

const PKCE_TTL_MS = 5 * 60 * 1000;
const FORBIDDEN_SSO_ROLES = new Set(["SUPERADMIN", "USER"]);

function isBrowser() {
  return typeof window !== "undefined";
}

function pickString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeSsoRoleTag(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const normalized = raw.trim().toUpperCase().replace(/[-\s]/g, "_");
  return normalized || null;
}

function hasForbiddenSsoRole(payload: Record<string, unknown>) {
  const user =
    payload.user && typeof payload.user === "object"
      ? (payload.user as Record<string, unknown>)
      : null;

  const rawRoles: unknown[] = [];

  if (user?.role) rawRoles.push(user.role);
  if (Array.isArray(user?.roles)) rawRoles.push(...user.roles);

  for (const role of rawRoles) {
    const normalizedRole = normalizeSsoRoleTag(role);
    if (normalizedRole && FORBIDDEN_SSO_ROLES.has(normalizedRole)) {
      return true;
    }
  }

  return false;
}

function getApiBaseUrl() {
  return (
    import.meta.env.VITE_SIKP_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_APP_AUTH_URL ||
    DEFAULT_API_BASE_URL
  );
}

export function getRedirectUri() {
  const redirectUri = pickString(import.meta.env.VITE_SSO_REDIRECT_URI);
  if (redirectUri) {
    return redirectUri;
  }

  if (isBrowser()) {
    return `${window.location.origin}/callback`;
  }

  return "/callback";
}

function normalizeToken(rawToken: unknown): string | null {
  const token = pickString(rawToken);
  if (!token) return null;

  const lowered = token.toLowerCase();
  if (lowered === "null" || lowered === "undefined") {
    return null;
  }

  const unquoted =
    (token.startsWith('"') && token.endsWith('"')) ||
    (token.startsWith("'") && token.endsWith("'"))
      ? token.slice(1, -1).trim()
      : token;

  if (!unquoted) return null;

  return unquoted.replace(/^Bearer\s+/i, "").trim() || null;
}

function extractToken(
  data: Record<string, unknown>,
  seed: AuthSessionSnapshot | null,
) {
  return (
    normalizeToken(data.token) ||
    normalizeToken(data.accessToken) ||
    normalizeToken(data.sessionToken) ||
    seed?.token ||
    getLegacyStoredToken()
  );
}

function normalizeIdentities(
  data: Record<string, unknown>,
  seed: AuthSessionSnapshot | null,
): SSOIdentity[] {
  const rawIdentities =
    (Array.isArray(data.availableIdentities)
      ? data.availableIdentities
      : null) ||
    (Array.isArray(data.identities) ? data.identities : null) ||
    [];

  const normalized = rawIdentities
    .map((identity) => normalizeIdentity(identity))
    .filter((identity): identity is SSOIdentity => Boolean(identity));

  if (normalized.length > 0) {
    return normalized;
  }

  return seed?.availableIdentities || [];
}

function normalizeActiveIdentity(
  data: Record<string, unknown>,
  availableIdentities: SSOIdentity[],
  seed: AuthSessionSnapshot | null,
) {
  const parsedActiveIdentity = normalizeIdentity(data.activeIdentity);
  if (parsedActiveIdentity) {
    return parsedActiveIdentity;
  }

  if (seed?.activeIdentity) {
    const matched = availableIdentities.find(
      (identity) => identity.identityType === seed.activeIdentity?.identityType,
    );

    if (matched) {
      return matched;
    }
  }

  if (availableIdentities.length === 1) {
    return availableIdentities[0];
  }

  return null;
}

function normalizeEffectiveRoles(
  data: Record<string, unknown>,
  activeIdentity: SSOIdentity | null,
  seed: AuthSessionSnapshot | null,
) {
  const rawRoles = Array.isArray(data.effectiveRoles)
    ? data.effectiveRoles
    : [];
  const normalizedRoles = normalizeRoles(rawRoles);

  if (
    activeIdentity?.identityType &&
    !normalizedRoles.includes(activeIdentity.identityType)
  ) {
    normalizedRoles.push(activeIdentity.identityType);
  }

  if (normalizedRoles.length > 0) {
    return normalizedRoles;
  }

  if (seed?.effectiveRoles?.length) {
    return normalizeRoles(seed.effectiveRoles);
  }

  return activeIdentity ? normalizeRoles([activeIdentity.identityType]) : [];
}

function normalizeEffectivePermissions(
  data: Record<string, unknown>,
  seed: AuthSessionSnapshot | null,
): EffectivePermission[] {
  const rawPermissions = Array.isArray(data.effectivePermissions)
    ? data.effectivePermissions
    : [];

  const normalized = Array.from(
    new Set(
      rawPermissions
        .map((permission) =>
          typeof permission === "string" ? permission.trim() : "",
        )
        .filter((permission) => permission.length > 0),
    ),
  );

  if (normalized.length > 0) {
    return normalized;
  }

  return seed?.effectivePermissions || [];
}

function fallbackUserFromIdentity(
  identity: SSOIdentity | null,
  roles: EffectiveRole[],
) {
  if (!identity) return null;

  const role = pickPrimaryRole(roles, identity);
  if (!role) return null;

  const email = identity.profile.email || "unknown@example.com";
  const nama = identity.profile.nama || "User SSO";
  const id = identity.profile.id || `${identity.identityType}:${email}`;

  return {
    id,
    nama,
    email,
    role,
    nim: identity.profile.nim,
    nip: identity.profile.nip,
    fakultas: identity.profile.fakultas,
    prodi: identity.profile.prodi,
    semester: identity.profile.semester,
    angkatan: identity.profile.angkatan,
    phone: identity.profile.phone,
    jabatan: identity.profile.jabatan,
  };
}

function buildSessionFromPayload(
  payload: Record<string, unknown>,
  seed?: AuthSessionSnapshot | null,
): AuthSessionSnapshot {
  const previousSession = seed ?? getAuthSession();
  const availableIdentities = normalizeIdentities(payload, previousSession);
  const activeIdentity = normalizeActiveIdentity(
    payload,
    availableIdentities,
    previousSession,
  );
  const effectiveRoles = normalizeEffectiveRoles(
    payload,
    activeIdentity,
    previousSession,
  );
  const effectivePermissions = normalizeEffectivePermissions(
    payload,
    previousSession,
  );
  const authzSource =
    typeof payload.authzSource === "string" &&
    payload.authzSource.trim().length > 0
      ? "ACCESS_TOKEN_CLAIMS"
      : previousSession?.authzSource || null;

  const rawUser = payload.user;
  const normalizedUser =
    toSessionUser(rawUser, activeIdentity, effectiveRoles) ||
    fallbackUserFromIdentity(activeIdentity, effectiveRoles) ||
    null;

  const token = extractToken(payload, previousSession);

  const sessionEstablished =
    typeof payload.sessionEstablished === "boolean"
      ? payload.sessionEstablished
      : previousSession?.sessionEstablished || Boolean(normalizedUser || token);

  const requiresIdentitySelection =
    (typeof payload.requiresIdentitySelection === "boolean"
      ? payload.requiresIdentitySelection
      : false) ||
    (sessionEstablished && availableIdentities.length > 1 && !activeIdentity);

  return {
    user: normalizedUser,
    token,
    availableIdentities,
    activeIdentity,
    effectiveRoles,
    effectivePermissions,
    authzSource,
    sessionEstablished,
    requiresIdentitySelection,
  };
}

function getLegacyStoredToken() {
  if (!isBrowser()) return null;
  return normalizeToken(localStorage.getItem(STORAGE_KEYS.legacyToken));
}

function getHeaders(extraHeaders?: HeadersInit): HeadersInit {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Browser app relies on httpOnly session cookie.
  if (token && !isBrowser()) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (extraHeaders && typeof extraHeaders === "object") {
    Object.assign(headers, extraHeaders as Record<string, string>);
  }

  return headers;
}

async function requestAuth<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiEnvelope<T>> {
  const baseUrl = getApiBaseUrl();

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      credentials: "include",
      headers: getHeaders(options.headers),
    });

    const text = await response.text();
    const parsed = text ? (JSON.parse(text) as Partial<ApiEnvelope<T>>) : null;

    if (!response.ok) {
      return {
        success: false,
        message:
          parsed?.message ||
          (response.status === 401
            ? "Sesi Anda telah berakhir. Silakan login kembali."
            : `Request gagal dengan status ${response.status}`),
        data: (parsed?.data as T) || (null as T),
      };
    }

    return {
      success: Boolean(parsed?.success ?? true),
      message: parsed?.message || "OK",
      data: (parsed?.data as T) || ({} as T),
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menghubungi auth endpoint.",
      data: null as T,
    };
  }
}

function readPKCEState(): PKCEState | null {
  if (!isBrowser()) return null;

  const raw = sessionStorage.getItem(STORAGE_KEYS.pkce);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as PKCEState;
    if (!parsed.state || !parsed.codeVerifier || !parsed.redirectUri) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function savePKCEState(state: PKCEState) {
  if (!isBrowser()) return;
  sessionStorage.setItem(STORAGE_KEYS.pkce, JSON.stringify(state));
}

export function clearPKCEState() {
  if (!isBrowser()) return;
  sessionStorage.removeItem(STORAGE_KEYS.pkce);
}

function randomString(length: number) {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const random = new Uint8Array(length);
  crypto.getRandomValues(random);

  return Array.from(random)
    .map((value) => charset[value % charset.length])
    .join("");
}

async function sha256Base64Url(value: string) {
  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  const bytes = Array.from(new Uint8Array(digest));
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function generatePKCE() {
  const codeVerifier = randomString(96);
  const codeChallenge = await sha256Base64Url(codeVerifier);
  return { codeVerifier, codeChallenge };
}

export function generateState() {
  return randomString(48);
}

export async function initiateSsoLogin(): Promise<void> {
  if (!isBrowser()) return;

  const { codeVerifier, codeChallenge } = await generatePKCE();
  const redirectUri = getRedirectUri();

  const prepareResponse = await requestAuth<PrepareResponseData>(
    "/api/auth/prepare",
    {
      method: "POST",
      body: JSON.stringify({ codeChallenge, redirectUri }),
    },
  );

  if (!prepareResponse.success || !prepareResponse.data) {
    throw new Error(
      prepareResponse.message || "Gagal memulai login SSO. Coba lagi.",
    );
  }

  const state = pickString(prepareResponse.data.state);
  const authorizeUrl = pickString(prepareResponse.data.authorizeUrl);

  if (!state || !authorizeUrl) {
    throw new Error("Response /api/auth/prepare tidak lengkap.");
  }

  savePKCEState({
    state,
    codeVerifier,
    codeChallenge,
    redirectUri,
    createdAt: Date.now(),
    expiresAt: Date.now() + PKCE_TTL_MS,
  });

  window.location.assign(authorizeUrl);
}

export async function exchangeAuthorizationCode(
  payload: CallbackRequest,
): Promise<SessionResult> {
  const storedPKCEState = readPKCEState();

  if (!storedPKCEState) {
    return {
      success: false,
      message: "State PKCE tidak ditemukan. Silakan login ulang.",
      session: null,
      requiresIdentitySelection: false,
    };
  }

  if (storedPKCEState.state !== payload.state) {
    clearPKCEState();
    return {
      success: false,
      message: "State callback tidak valid. Silakan login ulang.",
      session: null,
      requiresIdentitySelection: false,
    };
  }

  if (Date.now() > storedPKCEState.expiresAt) {
    clearPKCEState();
    return {
      success: false,
      message: "Sesi login sudah kedaluwarsa. Silakan login ulang.",
      session: null,
      requiresIdentitySelection: false,
    };
  }

  const response = await requestAuth<CallbackResponseData>(
    "/api/auth/callback",
    {
      method: "POST",
      body: JSON.stringify({
        code: payload.code,
        state: payload.state,
        codeVerifier: storedPKCEState.codeVerifier,
        redirectUri: payload.redirectUri || storedPKCEState.redirectUri,
      }),
    },
  );

  clearPKCEState();

  if (!response.success || !response.data) {
    return {
      success: false,
      message: response.message || "Callback SSO gagal diproses.",
      session: null,
      requiresIdentitySelection: false,
    };
  }

  if (
    hasForbiddenSsoRole(response.data as unknown as Record<string, unknown>)
  ) {
    clearAuthSession();
    return {
      success: false,
      message: "Role SSO Anda tidak diizinkan mengakses SIKP.",
      session: null,
      requiresIdentitySelection: false,
    };
  }

  const session = buildSessionFromPayload(
    response.data as unknown as Record<string, unknown>,
    getAuthSession(),
  );
  storeAuthSession(session);

  if (!session.requiresIdentitySelection) {
    const meResult = await getAuthMe();
    if (meResult.success && meResult.session) {
      return {
        success: true,
        message: response.message || "Login SSO berhasil.",
        session: meResult.session,
        requiresIdentitySelection: meResult.requiresIdentitySelection,
      };
    }
  }

  return {
    success: true,
    message: response.message || "Login SSO berhasil.",
    session,
    requiresIdentitySelection: session.requiresIdentitySelection,
  };
}

export async function getAuthMe(): Promise<SessionResult> {
  const response = await requestAuth<Record<string, unknown>>("/api/auth/me", {
    method: "GET",
  });

  if (!response.success || !response.data) {
    return {
      success: false,
      message: response.message || "Gagal mengambil sesi pengguna.",
      session: null,
      requiresIdentitySelection: false,
    };
  }

  if (hasForbiddenSsoRole(response.data)) {
    clearAuthSession();
    return {
      success: false,
      message: "Role SSO Anda tidak diizinkan mengakses SIKP.",
      session: null,
      requiresIdentitySelection: false,
    };
  }

  const session = buildSessionFromPayload(response.data, getAuthSession());
  storeAuthSession(session);

  return {
    success: true,
    message: response.message || "Sesi pengguna valid.",
    session,
    requiresIdentitySelection: session.requiresIdentitySelection,
  };
}

export async function getIdentities(): Promise<SessionResult> {
  const response = await requestAuth<Record<string, unknown>>(
    "/api/auth/identities",
    {
      method: "GET",
    },
  );

  if (!response.success || !response.data) {
    return {
      success: false,
      message: response.message || "Gagal mengambil daftar identity.",
      session: null,
      requiresIdentitySelection: false,
    };
  }

  if (
    hasForbiddenSsoRole(response.data as unknown as Record<string, unknown>)
  ) {
    clearAuthSession();
    return {
      success: false,
      message: "Role SSO Anda tidak diizinkan mengakses SIKP.",
      session: null,
      requiresIdentitySelection: false,
    };
  }

  const session = buildSessionFromPayload(response.data, getAuthSession());
  storeAuthSession(session);

  return {
    success: true,
    message: response.message || "Daftar identity berhasil diambil.",
    session,
    requiresIdentitySelection: session.requiresIdentitySelection,
  };
}

export async function selectIdentity(
  identityType: string,
): Promise<SessionResult> {
  const response = await requestAuth<IdentitySelectionPayload>(
    "/api/auth/select-identity",
    {
      method: "POST",
      body: JSON.stringify({ identityType }),
    },
  );

  if (!response.success || !response.data) {
    return {
      success: false,
      message: response.message || "Gagal memilih identity aktif.",
      session: null,
      requiresIdentitySelection: false,
    };
  }

  const session = buildSessionFromPayload(
    response.data as unknown as Record<string, unknown>,
    getAuthSession(),
  );
  storeAuthSession(session);

  const meResult = await getAuthMe();
  if (meResult.success && meResult.session) {
    return {
      success: true,
      message: response.message || "Identity aktif berhasil diperbarui.",
      session: meResult.session,
      requiresIdentitySelection: meResult.requiresIdentitySelection,
    };
  }

  return {
    success: true,
    message: response.message || "Identity aktif berhasil diperbarui.",
    session,
    requiresIdentitySelection: session.requiresIdentitySelection,
  };
}

export function getAuthSession(): AuthSessionSnapshot | null {
  if (!isBrowser()) return null;

  const rawSession = sessionStorage.getItem(STORAGE_KEYS.session);
  if (!rawSession) return null;

  try {
    const parsed = JSON.parse(rawSession) as AuthSessionSnapshot;
    const normalized = buildSessionFromPayload(
      parsed as unknown as Record<string, unknown>,
      null,
    );
    return normalized;
  } catch {
    return null;
  }
}

export function storeAuthSession(session: AuthSessionSnapshot) {
  if (!isBrowser()) return;

  sessionStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));

  if (session.token) {
    sessionStorage.setItem(STORAGE_KEYS.legacyToken, session.token);
  } else {
    sessionStorage.removeItem(STORAGE_KEYS.legacyToken);
  }

  if (session.user) {
    sessionStorage.setItem(
      STORAGE_KEYS.legacyUser,
      JSON.stringify(session.user),
    );
  } else {
    sessionStorage.removeItem(STORAGE_KEYS.legacyUser);
  }

  // Cleanup legacy localStorage auth keys to avoid stale persistence across sessions.
  localStorage.removeItem(STORAGE_KEYS.legacyToken);
  localStorage.removeItem(STORAGE_KEYS.legacyUser);
}

export function clearAuthSession() {
  if (!isBrowser()) return;

  sessionStorage.removeItem(STORAGE_KEYS.session);
  sessionStorage.removeItem(STORAGE_KEYS.pkce);
  sessionStorage.removeItem(STORAGE_KEYS.legacyToken);
  sessionStorage.removeItem(STORAGE_KEYS.legacyUser);

  localStorage.removeItem(STORAGE_KEYS.legacyToken);
  localStorage.removeItem(STORAGE_KEYS.legacyUser);
}

export async function logout(): Promise<void> {
  try {
    await requestAuth<{ success: boolean; message?: string }>(
      "/api/auth/logout",
      {
        method: "POST",
        body: JSON.stringify({}),
      },
    );
  } finally {
    clearAuthSession();
  }
}

export function getCurrentUser() {
  const session = getAuthSession();
  if (session?.user) {
    return session.user;
  }

  if (!isBrowser()) return null;

  const rawUser = sessionStorage.getItem(STORAGE_KEYS.legacyUser);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

export function getAuthToken(): string | null {
  const session = getAuthSession();
  if (session?.token) {
    return normalizeToken(session.token);
  }

  if (!isBrowser()) return null;

  const sessionToken = sessionStorage.getItem(STORAGE_KEYS.legacyToken);
  if (sessionToken) {
    return normalizeToken(sessionToken);
  }

  return getLegacyStoredToken();
}

export function isAuthenticated(): boolean {
  const session = getAuthSession();
  if (session?.sessionEstablished || session?.user) {
    return true;
  }

  return false;
}

export function getDashboardPathFromSession() {
  const session = getAuthSession();
  if (!session) return "/login";
  return getDashboardPath(session.effectiveRoles, session.activeIdentity);
}

/**
 * Flow auth lokal diputus di mode SSO big-bang.
 * Fungsi dipertahankan sementara untuk kompatibilitas compile.
 */
export async function login(_email: string, _password: string) {
  void _email;
  void _password;

  return {
    success: false,
    error: "Login lokal dinonaktifkan. Gunakan Login dengan SSO UNSRI.",
  };
}

/**
 * Flow register lokal diputus di mode SSO big-bang.
 * Fungsi dipertahankan sementara untuk kompatibilitas compile.
 */
export async function registerMahasiswa(_data: {
  nim: string;
  nama: string;
  email: string;
  password: string;
  phone: string;
  fakultas: string;
  prodi: string;
  semester: number;
  angkatan: string;
}) {
  void _data;

  return {
    success: false,
    error: "Registrasi lokal dinonaktifkan. Silakan login via SSO UNSRI.",
  };
}

/**
 * Flow register lokal diputus di mode SSO big-bang.
 * Fungsi dipertahankan sementara untuk kompatibilitas compile.
 */
export async function registerFieldMentor(_data: {
  email: string;
  password: string;
  nama: string;
  nip?: string;
  instansi?: string;
  jabatan?: string;
  no_telepon?: string;
}) {
  void _data;

  return {
    success: false,
    message: "Registrasi lokal dinonaktifkan. Silakan login via SSO UNSRI.",
  };
}
