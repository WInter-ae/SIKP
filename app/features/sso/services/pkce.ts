/**
 * PKCE (Proof Key for Code Exchange) Utilities
 * For OAuth 2.0 Authorization Code Flow with PKCE (RFC 7636)
 *
 * Uses Web Crypto API (built-in, no external dependencies)
 */

function generateRandomString(length: number): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let result = "";
  const randomValues = crypto.getRandomValues(new Uint8Array(length));
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}

function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function generateCodeVerifier(): string {
  return generateRandomString(128);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hashed = await crypto.subtle.digest("SHA-256", data);
  return base64urlEncode(hashed);
}

export function generateState(): string {
  return generateRandomString(32);
}

export function generateNonce(): string {
  return generateRandomString(32);
}
