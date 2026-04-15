import { Link } from "react-router";
import { ShieldX } from "lucide-react";

import { Button } from "~/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-border/60 bg-card p-6 text-center shadow-sm">
        <div className="bg-destructive/10 text-destructive mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <ShieldX className="h-6 w-6" />
        </div>

        <h1 className="text-2xl font-semibold">Akses Ditolak</h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Role aktif Anda tidak memiliki izin untuk mengakses halaman ini.
          Silakan pilih identity lain atau login ulang.
        </p>

        <div className="mt-6 grid gap-2">
          <Button asChild>
            <Link to="/identity-chooser">Pilih Identity Lain</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/login">Kembali ke Login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
