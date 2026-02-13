/**
 * OAuth Callback Route
 *
 * Handles the OAuth 2.0 authorization callback from SSO UNSRI.
 * After user authorizes the app, SSO redirects back to this page with:
 * - code: Authorization code
 * - state: CSRF protection token
 *
 * This route will:
 * 1. Validate state parameter
 * 2. Exchange code for tokens via Backend SIKP
 * 3. Store tokens in sessionStorage
 * 4. Fetch user profile
 * 5. Redirect to appropriate dashboard based on role
 */

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { handleOAuthCallback } from "~/lib/auth-client";
import { useUser } from "~/contexts/user-context";
import { toast } from "sonner";

type LoginMode = "mahasiswa" | "dosen";

function normalizeRoles(roles: string[] | undefined): string[] {
  return (roles ?? []).map((r) => String(r).toLowerCase());
}

function getAvailableLoginModes(roles: string[]): LoginMode[] {
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

function getRedirectPathFromRoles(roles: string[] | undefined): string {
  const normalized = normalizeRoles(roles);

  if (normalized.includes("admin") || normalized.includes("superadmin"))
    return "/admin";
  if (normalized.includes("wakil_dekan")) return "/wakil-dekan";
  if (normalized.includes("kaprodi")) return "/kaprodi";
  if (normalized.includes("dosen") || normalized.includes("lektor"))
    return "/dosen";
  if (normalized.includes("pembimbing_lapangan")) return "/mentor";
  if (normalized.includes("mahasiswa") || normalized.includes("alumni"))
    return "/mahasiswa";

  return "/";
}

export default function CallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchCurrentUser } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [loginModes, setLoginModes] = useState<LoginMode[]>([]);

  const handleChooseMode = (mode: LoginMode) => {
    navigate(mode === "mahasiswa" ? "/mahasiswa" : "/dosen", {
      replace: true,
    });
  };

  useEffect(() => {
    const redirectHomeSoon = () => {
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 3000);
    };

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const errorParam = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    // Handle OAuth error response
    if (errorParam) {
      const errorMsg = errorDescription || errorParam;
      setError(`Authorization failed: ${errorMsg}`);
      toast.error(`Login gagal: ${errorMsg}`);
      setIsProcessing(false);

      redirectHomeSoon();
      return;
    }

    // Validate required parameters
    if (!code || !state) {
      setError("Missing required parameters (code or state)");
      toast.error("Invalid callback parameters");
      setIsProcessing(false);

      redirectHomeSoon();
      return;
    }

    // Process OAuth callback
    handleOAuthCallback(code, state)
      .then(async () => {
        // Token exchange successful
        toast.success("Login berhasil!");

        // Fetch user profile to determine role
        try {
          const user = await fetchCurrentUser();

          if (user) {
            const normalizedRoles = normalizeRoles(user.roles);

            // Admin always goes to admin dashboard
            if (
              normalizedRoles.includes("admin") ||
              normalizedRoles.includes("superadmin")
            ) {
              navigate("/admin", { replace: true });
              return;
            }

            const modes = getAvailableLoginModes(normalizedRoles);
            if (modes.length > 1) {
              setLoginModes(modes);
              setIsProcessing(false);
              return;
            }
          }

          const redirectPath = user
            ? getRedirectPathFromRoles(user.roles)
            : "/mahasiswa";

          navigate(redirectPath, { replace: true });
        } catch (err) {
          console.error("Failed to fetch user profile:", err);
          toast.error("Gagal memuat profil pengguna");
          setError("Failed to load user profile");

          redirectHomeSoon();
        }
      })
      .catch((err) => {
        console.error("OAuth callback error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        toast.error("Login gagal: " + errorMessage);
        setIsProcessing(false);

        redirectHomeSoon();
      });
  }, [searchParams, navigate, fetchCurrentUser]);

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Login Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  if (loginModes.length > 1) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Pilih Mode Login
          </h1>
          <p className="text-gray-600 mb-6">
            Akun Anda memiliki beberapa role. Silakan pilih ingin masuk sebagai
            apa.
          </p>

          <div className="grid gap-3">
            {loginModes.includes("mahasiswa") && (
              <button
                type="button"
                onClick={() => handleChooseMode("mahasiswa")}
                className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
              >
                Masuk sebagai Mahasiswa
              </button>
            )}

            {loginModes.includes("dosen") && (
              <button
                type="button"
                onClick={() => handleChooseMode("dosen")}
                className="w-full rounded-md border border-input bg-background px-4 py-2 hover:bg-accent"
              >
                Masuk sebagai Dosen
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Processing state
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        <div className="mb-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {isProcessing ? "Processing login..." : "Redirecting..."}
        </h2>
        <p className="text-gray-600">
          Please wait while we complete your authentication
        </p>
      </div>
    </div>
  );
}
