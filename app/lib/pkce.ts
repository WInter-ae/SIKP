/**
 * PKCE (Proof Key for Code Exchange) Utilities
 * For OAuth 2.0 Authorization Code Flow with PKCE (RFC 7636)
 *
 * Uses Web Crypto API (built-in, no external dependencies)
 */

/**
 * Generate a cryptographically random string
 * @param length - Length of the string to generate
 * @returns Random string using characters A-Z, a-z, 0-9, -, ., _, ~
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

/**
 * Base64-URL encode (without padding)
 * @param buffer - Buffer to encode
 * @returns Base64-URL encoded string
 */
function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Generate PKCE code verifier
 * A high-entropy cryptographic random string (43-128 characters)
 * @returns Code verifier string
 */
export function generateCodeVerifier(): string {
  return generateRandomString(128);
}

/**
 * Generate PKCE code challenge from code verifier
 * SHA256 hash of the verifier, then base64-url encoded
 * @param verifier - Code verifier string
 * @returns Promise<Code challenge string>
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hashed = await crypto.subtle.digest("SHA-256", data);
  return base64urlEncode(hashed);
}

/**
 * Generate OAuth state parameter
 * Used to prevent CSRF attacks
 * @returns Random state string
 */
export function generateState(): string {
  return generateRandomString(32);
}

/**
 * Generate nonce for OpenID Connect
 * @returns Random nonce string
 */
export function generateNonce(): string {
  return generateRandomString(32);
}
