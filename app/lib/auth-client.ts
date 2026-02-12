/**
 * OAuth 2.0 + PKCE Authentication Client for SIKP
 *
 * Integrates with SSO UNSRI using Authorization Code Flow with PKCE.
 * This replaces the previous custom authentication implementation.
 *
 * Flow:
 * 1. initiateOAuthLogin() → Redirect to SSO authorize
 * 2. SSO redirects back to /callback with code
 * 3. handleOAuthCallback() → Exchange code for tokens via Backend SIKP
 * 4. Store tokens in sessionStorage
 * 5. fetchCurrentUser() → Get user profile from Backend SIKP
 */

import axios, { AxiosError } from "axios";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
} from "./pkce";
import type { ApiResponse } from "./api-client";
import type { User, UserRole } from "./types";

// ========== Configuration ==========

const SSO_BASE_URL =
  import.meta.env.VITE_SSO_BASE_URL || "http://localhost:8787";
const CLIENT_ID = import.meta.env.VITE_SSO_CLIENT_ID || "sikp-client";
const REDIRECT_URI =
  import.meta.env.VITE_SSO_REDIRECT_URI || "http://localhost:5173/callback";
const SCOPES = import.meta.env.VITE_SSO_SCOPES || "openid profile email";
const BACKEND_SIKP_URL =
  import.meta.env.VITE_BACKEND_SIKP_BASE_URL || "http://localhost:8789";

// Create axios instance for auth requests
const authAxios = axios.create({
  baseURL: BACKEND_SIKP_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ========== Types ==========

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

export interface AuthMeMahasiswa {
  id: string;
  nim: string;
  prodi: string;
  fakultas: string;
  angkatan?: number;
}

export interface AuthMeDosen {
  id: string;
  nidn: string;
  prodi: string;
  fakultas: string;
}

export interface AuthMeAdmin {
  id: string;
  level: string;
}

export interface AuthMeData {
  sub: string;
  email: string;
  name: string;
  roles: string[];
  mahasiswa?: AuthMeMahasiswa | null;
  dosen?: AuthMeDosen | null;
  admin?: AuthMeAdmin | null;
}

export type AuthMeApiResponse = ApiResponse<AuthMeData>;

function pickPrimaryRole(roles: string[] | null | undefined): UserRole {
  const normalized = (roles ?? []).map((r) => String(r).toUpperCase());
  const known: UserRole[] = [
    "ADMIN",
    "WAKIL_DEKAN",
    "KAPRODI",
    "DOSEN",
    "PEMBIMBING_LAPANGAN",
    "MAHASISWA",
  ];

  for (const role of known) {
    if (normalized.includes(role)) return role;
  }
  return "MAHASISWA";
}

function mapAuthMeToUser(me: AuthMeData): User {
  const role = pickPrimaryRole(me.roles);
  const id = me.mahasiswa?.id ?? me.dosen?.id ?? me.admin?.id ?? me.sub;

  return {
    id,
    nama: me.name,
    email: me.email,
    role,
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

// ========== OAuth Flow Functions ==========

/**
 * Initiate OAuth 2.0 Authorization Code Flow with PKCE
 * Redirects browser to SSO authorize endpoint
 */
export async function initiateOAuthLogin(): Promise<void> {
  // Only run in browser
  if (typeof window === "undefined") return;

  // 1. Generate PKCE parameters
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateState();

  // 2. Store PKCE parameters in sessionStorage (temporary, for callback)
  sessionStorage.setItem("pkce_code_verifier", codeVerifier);
  sessionStorage.setItem("oauth_state", state);

  // 3. Build authorize URL
  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  // 4. Redirect browser to SSO
  const authorizeUrl = `${SSO_BASE_URL}/oauth/authorize?${params.toString()}`;
  window.location.href = authorizeUrl;
}

/**
 * Handle OAuth callback after user authorizes
 * Exchange authorization code for access token
 *
 * @param code - Authorization code from SSO
 * @param state - State parameter for CSRF protection
 * @returns Token response
 */
export async function handleOAuthCallback(
  code: string,
  state: string,
): Promise<TokenResponse> {
  // Only run in browser
  if (typeof window === "undefined") {
    throw new Error("OAuth callback can only be handled in browser");
  }

  // 1. Verify state parameter (CSRF protection)
  const storedState = sessionStorage.getItem("oauth_state");
  if (state !== storedState) {
    throw new Error("Invalid state parameter - possible CSRF attack");
  }

  // 2. Retrieve code verifier
  const codeVerifier = sessionStorage.getItem("pkce_code_verifier");
  if (!codeVerifier) {
    throw new Error("Code verifier not found in session");
  }

  // 3. Exchange code for tokens via Backend SIKP (acts as proxy to SSO)
  try {
    const response = await authAxios.post<TokenResponse>("/api/auth/exchange", {
      code,
      redirectUri: REDIRECT_URI,
      codeVerifier,
    });

    const data = response.data;

    // 4. Store tokens in sessionStorage with expiry
    const storedTokens: StoredTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + data.expires_in * 1000,
    };
    sessionStorage.setItem("auth_tokens", JSON.stringify(storedTokens));

    // 5. Cleanup PKCE parameters
    sessionStorage.removeItem("pkce_code_verifier");
    sessionStorage.removeItem("oauth_state");

    return data;
  } catch (error) {
    // Cleanup on error
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

// ========== Token Management ==========

/**
 * Get access token from storage
 * @returns Access token string or null
 */
export function getAuthToken(): string | null {
  // Only run in browser
  if (typeof window === "undefined") return null;

  const storedTokensStr = sessionStorage.getItem("auth_tokens");
  if (!storedTokensStr) return null;

  try {
    const tokens: StoredTokens = JSON.parse(storedTokensStr);

    // Check if token is expired
    if (Date.now() >= tokens.expires_at) {
      // Token expired, clear storage
      sessionStorage.removeItem("auth_tokens");
      return null;
    }

    return tokens.access_token;
  } catch {
    return null;
  }
}

/**
 * Get all stored tokens
 * @returns Stored tokens or null
 */
export function getStoredTokens(): StoredTokens | null {
  // Only run in browser
  if (typeof window === "undefined") return null;

  const storedTokensStr = sessionStorage.getItem("auth_tokens");
  if (!storedTokensStr) return null;

  try {
    const tokens: StoredTokens = JSON.parse(storedTokensStr);

    // Check if token is expired
    if (Date.now() >= tokens.expires_at) {
      sessionStorage.removeItem("auth_tokens");
      return null;
    }

    return tokens;
  } catch {
    return null;
  }
}

/**
 * Refresh access token using refresh token
 * @returns New token response
 */
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

    // Store new tokens (only in browser)
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
    // If refresh fails, logout
    logout();
    throw error;
  }
}

/**
 * Check if user is authenticated (has valid token)
 * @returns True if authenticated
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

/**
 * Logout user - clear tokens and redirect
 */
export function logout(): void {
  // Only run in browser
  if (typeof window === "undefined") return;

  // Clear all auth-related storage
  sessionStorage.removeItem("auth_tokens");
  sessionStorage.removeItem("pkce_code_verifier");
  sessionStorage.removeItem("oauth_state");

  // Redirect to home/login
  window.location.href = "/";
}

// ========== User Profile ==========

/**
 * Fetch current user profile from Backend SIKP
 * Backend SIKP will proxy request to SSO /userinfo or /profile
 *
 * @returns User profile data
 */
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

    // Preferred: backend returns ApiResponse<AuthMeData>
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

    // Fallback: backend returns raw AuthMeData
    return mapAuthMeToUser(payload as AuthMeData);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Try to refresh token
      try {
        await refreshAccessToken();
        // Retry with new token
        return fetchUserProfile();
      } catch {
        logout();
        throw new Error("Session expired");
      }
    }
    throw new Error("Failed to fetch user profile");
  }
}
