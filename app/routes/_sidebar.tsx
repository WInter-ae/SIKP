import { useIdentity } from "~/contexts/identity-context";
import { useAuth } from "~/contexts/auth-context";
import { useEffect, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { AppSidebar } from "~/feature/sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";

import { type EffectiveRole, getDashboardPath } from "~/lib/sso-types";

function getRequiredRoles(pathname: string): EffectiveRole[] {
  if (pathname.startsWith("/admin")) {
    return ["ADMIN"];
  }

  if (pathname.startsWith("/dosen")) {
    return ["DOSEN", "KAPRODI", "WAKIL_DEKAN"];
  }

  if (pathname.startsWith("/mentor")) {
    return ["MENTOR"];
  }

  if (pathname.startsWith("/mahasiswa")) {
    return ["MAHASISWA"];
  }

  return [];
}

export default function Page() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, isAuthenticated } = useAuth();
  const { availableIdentities, activeIdentity, effectiveRoles } = useIdentity();

  const requiredRoles = useMemo(
    () => getRequiredRoles(location.pathname),
    [location.pathname],
  );

  const hasRoleAccess = useMemo(() => {
    if (requiredRoles.length === 0) return true;
    return requiredRoles.some((role) => effectiveRoles.includes(role));
  }, [requiredRoles, effectiveRoles]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    if (availableIdentities.length > 1 && !activeIdentity) {
      navigate("/identity-chooser", { replace: true });
      return;
    }

    if (location.pathname === "/dashboard") {
      navigate(getDashboardPath(effectiveRoles, activeIdentity), {
        replace: true,
      });
      return;
    }

    if (!hasRoleAccess) {
      navigate("/unauthorized", { replace: true });
    }
  }, [
    activeIdentity,
    availableIdentities.length,
    effectiveRoles,
    hasRoleAccess,
    isAuthenticated,
    isLoading,
    location.pathname,
    navigate,
  ]);

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (availableIdentities.length > 1 && !activeIdentity) {
    return null;
  }

  if (!hasRoleAccess) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="bg-yellow-300 fixed inset-x-0 top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4 md:hidden">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1" />
          <span className="bg-white border-2 border-white px-2 py-0.5 font-bold text-xs tracking-widest text-black rounded uppercase shadow-[2px_4px_8px_rgba(0,0,0,0.15)]">
            SIKP MI
          </span>
        </header>
        <div className="pt-14 md:pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
