import { useNavigate } from "react-router";
import { useEffect } from "react";
import { useUser } from "~/contexts/user-context";

/**
 * Protected Route Wrapper
 * Melindungi routes yang memerlukan autentikasi
 */
export function ProtectedRoute({
  children,
  requiredRoles,
}: {
  children: React.ReactNode;
  requiredRoles?: string[];
}) {
  const navigate = useNavigate();
  const { user, isLoading, isAuthenticated } = useUser();

  useEffect(() => {
    if (isLoading) return;

    // Redirect ke login jika belum login
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    // Check role-based access
    if (requiredRoles && user && !requiredRoles.includes(user.role)) {
      navigate("/unauthorized", { replace: true });
      return;
    }
  }, [isLoading, isAuthenticated, user, requiredRoles, navigate]);

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

  // Check role
  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
