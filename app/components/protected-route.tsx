import { useNavigate } from "react-router";
import { useEffect } from "react";
import { useUser } from "~/contexts/user-context";
import { type EffectivePermission, type EffectiveRole } from "~/lib/sso-types";

/**
 * Protected Route Wrapper
 * Melindungi routes yang memerlukan autentikasi
 */
export function ProtectedRoute({
  children,
  requiredRoles,
  requiredPermissions,
}: {
  children: React.ReactNode;
  requiredRoles?: EffectiveRole[];
  requiredPermissions?: EffectivePermission[];
}) {
  const navigate = useNavigate();
  const {
    isLoading,
    isAuthenticated,
    effectiveRoles,
    effectivePermissions,
    activeIdentity,
    availableIdentities,
  } = useUser();

  const hasRoleAccess =
    !requiredRoles ||
    requiredRoles.length === 0 ||
    requiredRoles.some((role) => effectiveRoles.includes(role));

  const hasPermissionAccess =
    !requiredPermissions ||
    requiredPermissions.length === 0 ||
    requiredPermissions.some((permission) =>
      effectivePermissions.includes(permission),
    );

  useEffect(() => {
    if (isLoading) return;

    // Redirect ke login jika belum login
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    if (availableIdentities.length > 1 && !activeIdentity) {
      navigate("/identity-chooser", { replace: true });
      return;
    }

    // Check role-based access
    if (!hasRoleAccess) {
      navigate("/unauthorized", { replace: true });
      return;
    }

    if (!hasPermissionAccess) {
      navigate("/unauthorized", { replace: true });
      return;
    }
  }, [
    activeIdentity,
    availableIdentities.length,
    hasPermissionAccess,
    hasRoleAccess,
    isAuthenticated,
    isLoading,
    navigate,
  ]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  if (availableIdentities.length > 1 && !activeIdentity) {
    return null;
  }

  // Check role
  if (!hasRoleAccess) {
    return null;
  }

  if (!hasPermissionAccess) {
    return null;
  }

  return <>{children}</>;
}
