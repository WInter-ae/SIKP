/**
 * OAuth 2.0 + PKCE Authentication Client for SIKP
 */

import axios, { AxiosError } from "axios";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
} from "~/features/sso/services/pkce";
import type { ApiResponse } from "~/lib/api-client";
import type { AuthMeData, User } from "~/lib/types";

const SSO_BASE_URL =
  import.meta.env.VITE_SSO_BASE_URL || "http://localhost:8787";
const CLIENT_ID = import.meta.env.VITE_SSO_CLIENT_ID || "sikp-client";
const REDIRECT_URI =
  import.meta.env.VITE_SSO_REDIRECT_URI || "http://localhost:5173/callback";
const SCOPES = import.meta.env.VITE_SSO_SCOPES || "openid profile email";
const BACKEND_SIKP_URL =
  import.meta.env.VITE_BACKEND_SIKP_BASE_URL || "http://localhost:8789";

const authAxios = axios.create({
  baseURL: BACKEND_SIKP_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in: number;
  token_type: string;
}

interface StoredTokens {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
}

export type AuthMeApiResponse = ApiResponse<AuthMeData>;

function pickPrimaryRole(roles: string[] | null | undefined): string {
  const normalized = (roles ?? []).map((r) => String(r).toLowerCase());
  const known = [
    "admin",
    "superadmin",
    "wakil_dekan",
    "kaprodi",
    "dosen",
    "pembimbing_lapangan",
    "mahasiswa",
  ];

  for (const role of known) {
    if (normalized.includes(role)) return role;
  }
  return "mahasiswa";
}

function mapAuthMeToUser(me: AuthMeData): User {
  const primaryRole = pickPrimaryRole(me.roles);
  const id = me.mahasiswa?.id ?? me.dosen?.id ?? me.admin?.id ?? me.sub;

  return {
    sub: me.sub,
    id,
    email: me.email,
    name: me.name,
    nama: me.name,
    roles: me.roles,
    primaryRole,
    mahasiswa: me.mahasiswa ?? null,
    dosen: me.dosen ?? null,
    admin: me.admin ?? null,
    nim: me.mahasiswa?.nim,
    nip: me.dosen?.nidn,
    fakultas: me.mahasiswa?.fakultas ?? me.dosen?.fakultas,
    prodi: me.mahasiswa?.prodi ?? me.dosen?.prodi,
    angkatan:
      me.mahasiswa?.angkatan !== undefined
        ? String(me.mahasiswa.angkatan)
        : undefined,
  };
}

export async function initiateOAuthLogin(): Promise<void> {
  if (typeof window === "undefined") return;

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateState();

  sessionStorage.setItem("pkce_code_verifier", codeVerifier);
  sessionStorage.setItem("oauth_state", state);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  const authorizeUrl = `${SSO_BASE_URL}/oauth/authorize?${params.toString()}`;
  window.location.href = authorizeUrl;
}

export async function handleOAuthCallback(
  code: string,
  state: string,
): Promise<TokenResponse> {
  if (typeof window === "undefined") {
    throw new Error("OAuth callback can only be handled in browser");
  }

  const storedState = sessionStorage.getItem("oauth_state");
  if (state !== storedState) {
    throw new Error("Invalid state parameter - possible CSRF attack");
  }

  const codeVerifier = sessionStorage.getItem("pkce_code_verifier");
  if (!codeVerifier) {
    throw new Error("Code verifier not found in session");
  }

  try {
    const response = await authAxios.post<TokenResponse>("/api/auth/exchange", {
      code,
      redirectUri: REDIRECT_URI,
      codeVerifier,
    });

    const data = response.data;

    const storedTokens: StoredTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + data.expires_in * 1000,
    };
    sessionStorage.setItem("auth_tokens", JSON.stringify(storedTokens));

    sessionStorage.removeItem("pkce_code_verifier");
    sessionStorage.removeItem("oauth_state");

    return data;
  } catch (error) {
    sessionStorage.removeItem("pkce_code_verifier");
    sessionStorage.removeItem("oauth_state");

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{
        message?: string;
        error?: string;
      }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        axiosError.message ||
        "Token exchange failed";
      throw new Error(errorMessage);
    }
    throw error;
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  const storedTokensStr = sessionStorage.getItem("auth_tokens");
  if (!storedTokensStr) return null;

  try {
    const tokens: StoredTokens = JSON.parse(storedTokensStr);

    if (Date.now() >= tokens.expires_at) {
      sessionStorage.removeItem("auth_tokens");
      return null;
    }

    return tokens.access_token;
  } catch {
    return null;
  }
}

export function getStoredTokens(): StoredTokens | null {
  if (typeof window === "undefined") return null;

  const storedTokensStr = sessionStorage.getItem("auth_tokens");
  if (!storedTokensStr) return null;

  try {
    const tokens: StoredTokens = JSON.parse(storedTokensStr);

    if (Date.now() >= tokens.expires_at) {
      sessionStorage.removeItem("auth_tokens");
      return null;
    }

    return tokens;
  } catch {
    return null;
  }
}

export async function refreshAccessToken(): Promise<TokenResponse> {
  const tokens = getStoredTokens();
  if (!tokens?.refresh_token) {
    throw new Error("No refresh token available");
  }

  try {
    const response = await authAxios.post<TokenResponse>("/api/auth/refresh", {
      refreshToken: tokens.refresh_token,
    });

    const data = response.data;

    if (typeof window !== "undefined") {
      const storedTokens: StoredTokens = {
        access_token: data.access_token,
        refresh_token: data.refresh_token || tokens.refresh_token,
        expires_at: Date.now() + data.expires_in * 1000,
      };
      sessionStorage.setItem("auth_tokens", JSON.stringify(storedTokens));
    }

    return data;
  } catch (error) {
    logout();
    throw error;
  }
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

export function logout(): void {
  if (typeof window === "undefined") return;

  sessionStorage.removeItem("auth_tokens");
  sessionStorage.removeItem("pkce_code_verifier");
  sessionStorage.removeItem("oauth_state");

  window.location.href = "/";
}

export async function fetchUserProfile(): Promise<User> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  try {
    const response = await authAxios.get<AuthMeApiResponse | AuthMeData>(
      "/api/auth/me",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const payload = response.data;

    if (payload && typeof payload === "object" && "success" in payload) {
      const apiResponse = payload as AuthMeApiResponse;
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || "Failed to fetch user profile");
      }
      if (!apiResponse.data) {
        throw new Error(apiResponse.message || "User profile data is empty");
      }
      return mapAuthMeToUser(apiResponse.data);
    }

    return mapAuthMeToUser(payload as AuthMeData);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      try {
        await refreshAccessToken();
        return fetchUserProfile();
      } catch {
        logout();
        throw new Error("Session expired");
      }
    }
    throw new Error("Failed to fetch user profile");
  }
}
