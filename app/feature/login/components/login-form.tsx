import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { initiateSsoLogin } from "~/lib/sso-client";
import { LogIn } from "lucide-react";

/**
 * Login Form - OAuth 2.0 SSO UNSRI
 *
 * Replaces the old email/password form with OAuth redirect.
 * Clicking "Login dengan SSO UNSRI" will redirect to SSO authorize page.
 */
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const handleLogin = () => {
    initiateSsoLogin();
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Selamat Datang di SIKP</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Sistem Informasi Kerja Praktik Universitas Sriwijaya
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Button
            onClick={handleLogin}
            className="w-full"
            size="lg"
            type="button"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Login dengan SSO UNSRI
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                atau
              </span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link
              to="/register"
              className="text-primary underline-offset-4 hover:underline font-medium"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Dengan login, Anda menyetujui{" "}
          <Link to="/terms" className="underline hover:text-primary">
            Syarat & Ketentuan
          </Link>{" "}
          dan{" "}
          <Link to="/privacy" className="underline hover:text-primary">
            Kebijakan Privasi
          </Link>
        </p>
      </div>
    </div>
  );
}
