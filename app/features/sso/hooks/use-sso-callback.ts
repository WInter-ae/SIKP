import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { useUser } from "~/contexts/user-context";
import { handleOAuthCallback } from "~/features/sso/services/auth-client";
import type { LoginMode } from "~/features/sso/types/role.types";
import {
  getAvailableLoginModes,
  getRedirectPathFromRoles,
  hasAdminRole,
  normalizeRoles,
} from "~/features/sso/utils/role-routing";

interface UseSsoCallbackResult {
  error: string | null;
  isProcessing: boolean;
  loginModes: LoginMode[];
  chooseMode: (mode: LoginMode) => void;
}

export function useSsoCallback(): UseSsoCallbackResult {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchCurrentUser } = useUser();

  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [loginModes, setLoginModes] = useState<LoginMode[]>([]);

  const chooseMode = (mode: LoginMode) => {
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

    if (errorParam) {
      const errorMsg = errorDescription || errorParam;
      setError(`Authorization failed: ${errorMsg}`);
      toast.error(`Login gagal: ${errorMsg}`);
      setIsProcessing(false);
      redirectHomeSoon();
      return;
    }

    if (!code || !state) {
      setError("Missing required parameters (code or state)");
      toast.error("Invalid callback parameters");
      setIsProcessing(false);
      redirectHomeSoon();
      return;
    }

    handleOAuthCallback(code, state)
      .then(async () => {
        toast.success("Login berhasil!");

        try {
          const user = await fetchCurrentUser();

          if (user) {
            const normalizedRoles = normalizeRoles(user.roles);

            if (hasAdminRole(normalizedRoles)) {
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

  return {
    error,
    isProcessing,
    loginModes,
    chooseMode,
  };
}
