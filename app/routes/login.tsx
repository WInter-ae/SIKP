import { GalleryVerticalEnd } from "lucide-react";
import { Link } from "react-router";

import { LoginForm } from "~/feature/login/components/login-form";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#f8fafc] p-6 md:p-10">
      {/* Subtle Pattern or Clean White */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Link to="/" className="group flex items-center gap-3">
            <div className="bg-primary flex size-10 items-center justify-center rounded-xl shadow-lg transition-transform group-hover:rotate-12">
              <GalleryVerticalEnd className="text-primary-foreground size-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase">
              SIKP
            </span>
          </Link>
        </div>

        <LoginForm />

        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-xs font-medium opacity-60">
            &copy; {new Date().getFullYear()} Universitas Sriwijaya. All rights
            reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
