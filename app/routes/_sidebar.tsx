import { useEffect, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { AppSidebar } from "~/feature/sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { useUser } from "~/contexts/user-context";
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
  const {
    isLoading,
    isAuthenticated,
    availableIdentities,
    activeIdentity,
    effectiveRoles,
  } = useUser();

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
        <header className="flex h-14 md:hidden shrink-0 items-center gap-2 border-b bg-background px-4 sticky top-0 z-10">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1" />
          <span className="font-semibold text-sm text-primary">SIKP Mobile</span>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
