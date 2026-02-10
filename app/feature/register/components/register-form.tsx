// 1. External dependencies
import { UserPlus } from "lucide-react";
import { Link } from "react-router";

// 2. Internal utilities
import { cn } from "~/lib/utils";

// 3. Components
import { Button } from "~/components/ui/button";
// SSO Base URL from environment variable
const SSO_BASE_URL =
  import.meta.env.VITE_SSO_BASE_URL || "http://localhost:8787";

/**
 * Register Form - Redirects to SSO UNSRI Registration
 *
 * All user registrations (Mahasiswa, Dosen, Mentor, Admin) now happen
 * directly on SSO UNSRI platform. This component provides links to
 * redirect users to the appropriate SSO registration page.
 */

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const handleRegisterMahasiswa = () => {
    window.location.href = `${SSO_BASE_URL}/register/mahasiswa`;
  };

  const handleRegisterDosen = () => {
    window.location.href = `${SSO_BASE_URL}/register/dosen`;
  };

  const handleRegisterMentor = () => {
    window.location.href = `${SSO_BASE_URL}/register/mentor`;
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Buat Akun SIKP</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Registrasi dilakukan melalui SSO UNSRI. Pilih jenis akun Anda:
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleRegisterMahasiswa}
            className="w-full justify-start"
            size="lg"
            variant="outline"
            type="button"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Daftar sebagai Mahasiswa
          </Button>

          <Button
            onClick={handleRegisterDosen}
            className="w-full justify-start"
            size="lg"
            variant="outline"
            type="button"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Daftar sebagai Dosen
          </Button>

          <Button
            onClick={handleRegisterMentor}
            className="w-full justify-start"
            size="lg"
            variant="outline"
            type="button"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Daftar sebagai Pembimbing Lapangan
          </Button>
        </div>

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
          Sudah punya akun?{" "}
          <Link
            to="/login"
            className="text-primary underline-offset-4 hover:underline font-medium"
          >
            Login sekarang
          </Link>
        </p>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Dengan mendaftar, Anda menyetujui{" "}
        <Link to="/terms" className="underline hover:text-primary">
          Syarat & Ketentuan
        </Link>{" "}
        dan{" "}
        <Link to="/privacy" className="underline hover:text-primary">
          Kebijakan Privasi
        </Link>
      </p>
    </div>
  );
}
