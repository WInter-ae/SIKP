import { Link } from "react-router";
import { UserRoundX } from "lucide-react";

import { Button } from "~/components/ui/button";

export default function RegisterPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-border/60 bg-card p-6 text-center shadow-sm">
        <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <UserRoundX className="h-6 w-6" />
        </div>

        <h1 className="text-2xl font-semibold">
          Registrasi Lokal Dinonaktifkan
        </h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Aplikasi SIKP sekarang terintegrasi ke SSO UNSRI. Silakan login
          melalui halaman SSO untuk mengakses sistem.
        </p>

        <div className="mt-6 grid gap-2">
          <Button asChild>
            <Link to="/login">Login dengan SSO</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Kembali ke Beranda</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
