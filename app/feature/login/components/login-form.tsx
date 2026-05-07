import { useIdentity } from "~/contexts/identity-context";
import { useAuth } from "~/contexts/auth-context";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Link, useNavigate } from "react-router";
import { Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { getDashboardPath } from "~/lib/sso-types";
import logoUnsri from "~/assets/images/unsri.png";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const navigate = useNavigate();
  const {
    initiateLogin,
    isLoading,
    isAuthenticated,
    callbackError,
    setCallbackError,
  } = useAuth();
  const { effectiveRoles, activeIdentity } = useIdentity();
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
      <div className="group relative flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-300 sm:gap-6 sm:rounded-[2rem] sm:p-10 hover:-translate-y-1 dark:bg-slate-900">
        {/* 3D "Thickness" Simulation - hidden or smaller on mobile */}
        <div className="absolute inset-0 -z-10 translate-x-[4px] translate-y-[4px] rounded-3xl bg-slate-200/50 sm:translate-x-[6px] sm:translate-y-[6px] sm:rounded-[2rem]" />

        <div className="flex flex-col items-center gap-4 text-center sm:gap-6">
          <div className="relative">
            <div className="animate-glow-pulse absolute inset-0 rounded-full bg-primary/20 blur-xl sm:blur-2xl"></div>
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05),0_10px_20px_rgba(0,0,0,0.1)] sm:h-24 sm:w-24 sm:rounded-[1.5rem] sm:p-4 dark:bg-slate-800">
              <img
                src={logoUnsri}
                alt="Logo UNSRI"
                className="h-12 w-12 object-contain sm:h-16 sm:w-16"
              />
            </div>
          </div>

          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              Masuk ke SIKP
            </h1>
            <div className="mx-auto h-1 w-8 rounded-full bg-primary/30 sm:w-12" />
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 sm:text-xs">
              Integrasi SSO UNSRI
            </p>
          </div>

          <p className="text-slate-500 max-w-[260px] text-xs leading-relaxed sm:max-w-[300px] sm:text-sm dark:text-slate-400">
            Akses portal Kerja Praktik Anda dengan aman melalui sistem
            autentikasi terpusat.
          </p>
        </div>

        {(error || callbackError) && (
          <div
            role="alert"
            className="animate-in fade-in zoom-in-95 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-center text-xs font-semibold text-destructive sm:rounded-2xl sm:p-4 sm:text-sm"
          >
            {error || callbackError}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting || isLoading}
          className="relative h-12 w-full overflow-hidden rounded-xl bg-primary text-base font-bold shadow-[0_10px_20px_-5px_rgba(var(--primary),0.4)] transition-all sm:h-14 sm:rounded-2xl sm:text-lg hover:translate-y-[-2px] active:translate-y-[1px]"
        >
          {isSubmitting || isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
              <span>Memproses...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />
              <span>Login SSO UNSRI</span>
            </div>
          )}
        </Button>

        <div className="space-y-4 sm:space-y-6">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100 dark:border-slate-800" />
            </div>
            <span className="relative bg-white px-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 sm:px-4 sm:text-[10px] dark:bg-slate-900">
              Keamanan Terjamin
            </span>
          </div>

          <div className="flex items-center justify-center">
            <Link
              to="/"
              className="text-primary hover:text-primary/80 group flex items-center gap-2 text-xs font-bold transition-all sm:text-sm"
            >
              <span>Kembali ke Beranda</span>
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
