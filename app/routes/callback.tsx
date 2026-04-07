import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { AlertCircle, Loader2 } from "lucide-react";

import { Button } from "~/components/ui/button";
import { useUser } from "~/contexts/user-context";

export default function CallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleCallback, setCallbackError } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      setError(
        "Parameter callback tidak lengkap. Pastikan code dan state tersedia.",
      );
      setIsProcessing(false);
      return;
    }

    const run = async () => {
      const result = await handleCallback(code, state);

      if (!result.success) {
        setError(result.message || "Callback SSO gagal diproses.");
        setIsProcessing(false);
        return;
      }

      setCallbackError(null);

      if (result.requiresIdentitySelection) {
        navigate("/identity-chooser", { replace: true });
        return;
      }

      navigate("/dashboard", { replace: true });
    };

    void run();
  }, [handleCallback, navigate, searchParams, setCallbackError]);

  if (isProcessing) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <div className="w-full max-w-md rounded-xl border border-border/60 bg-card p-6 text-center shadow-sm">
          <div className="mb-4 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <h1 className="text-xl font-semibold">Memproses Callback SSO</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Mohon tunggu, sesi Anda sedang divalidasi melalui backend SIKP.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-destructive/30 bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-center text-destructive">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="text-center text-xl font-semibold">
          Callback SSO Gagal
        </h1>
        <p className="text-muted-foreground mt-2 text-center text-sm leading-relaxed">
          {error || "Terjadi kesalahan saat memproses callback SSO."}
        </p>

        <div className="mt-6 grid gap-2">
          <Button asChild>
            <Link to="/login">Kembali ke Login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Kembali ke Beranda</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
