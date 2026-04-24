import { useIdentity } from "~/contexts/identity-context";
import { useAuth } from "~/contexts/auth-context";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Link, useNavigate } from "react-router";
import { Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { getDashboardPath } from "~/lib/sso-types";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const navigate = useNavigate();
  const { initiateLogin, isLoading, isAuthenticated, callbackError, setCallbackError } = useAuth();
  const { effectiveRoles, activeIdentity } = useIdentity();;
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !activeIdentity) return;
    navigate(getDashboardPath(effectiveRoles, activeIdentity), {
      replace: true,
    });
  }, [isAuthenticated, activeIdentity, effectiveRoles, navigate]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setError(null);
      setCallbackError(null);
      setIsSubmitting(true);
      await initiateLogin();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal mengarahkan ke SSO.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={onSubmit}
      {...props}
    >
      <div className="flex flex-col gap-5 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">Masuk dengan SSO UNSRI</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Autentikasi akun SIKP sekarang menggunakan SSO UNSRI dengan keamanan
            Authorization Code + PKCE.
          </p>
        </div>

        {(error || callbackError) && (
          <div
            role="alert"
            className="rounded-md bg-destructive/15 p-3 text-sm text-destructive"
          >
            {error || callbackError}
          </div>
        )}

        <Button type="submit" disabled={isSubmitting || isLoading}>
          {isSubmitting || isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              Login dengan SSO UNSRI
            </>
          )}
        </Button>

        <p className="text-muted-foreground text-center text-xs">
          Login email/password lokal sudah dinonaktifkan pada mode integrasi
          SSO.
        </p>

        <div className="text-center text-sm">
          <Link to="/" className="text-primary underline underline-offset-4">
            Kembali ke beranda
          </Link>
        </div>
      </div>
    </form>
  );
}
