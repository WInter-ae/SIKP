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

export default function CallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchCurrentUser } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
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

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 3000);
      return;
    }

    // Validate required parameters
    if (!code || !state) {
      setError("Missing required parameters (code or state)");
      toast.error("Invalid callback parameters");
      setIsProcessing(false);

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 3000);
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

          // Redirect based on user role
          let redirectPath = "/mahasiswa"; // Default

          if (user) {
            switch (user.role) {
              case "MAHASISWA":
                redirectPath = "/mahasiswa";
                break;
              case "DOSEN":
                redirectPath = "/dosen";
                break;
              case "ADMIN":
                redirectPath = "/admin";
                break;
              case "KAPRODI":
                redirectPath = "/kaprodi";
                break;
              case "WAKIL_DEKAN":
                redirectPath = "/wakil-dekan";
                break;
              case "PEMBIMBING_LAPANGAN":
                redirectPath = "/mentor";
                break;
              default:
                redirectPath = "/";
            }
          }

          navigate(redirectPath, { replace: true });
        } catch (err) {
          console.error("Failed to fetch user profile:", err);
          toast.error("Gagal memuat profil pengguna");
          setError("Failed to load user profile");

          setTimeout(() => {
            navigate("/", { replace: true });
          }, 3000);
        }
      })
      .catch((err) => {
        console.error("OAuth callback error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        toast.error("Login gagal: " + errorMessage);
        setIsProcessing(false);

        setTimeout(() => {
          navigate("/", { replace: true });
        }, 3000);
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
