import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  fetchSsoUserProfile,
  hasValidSsoSession,
  logoutFromSso,
  refreshSsoAccessToken,
} from "~/lib/sso-client";
import type { User } from "~/lib/types";

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  logout: () => void;
  setUser: (user: User | null) => void;
  fetchCurrentUser: () => Promise<User | null>;
  refreshToken: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authenticated = hasValidSsoSession();

  /**
   * Fetch current user profile from Backend SIKP
   * This replaces the old getCurrentUser() which read from localStorage
   */
  const fetchCurrentUser = useCallback(async (): Promise<User | null> => {
    // Check if user has valid token
    if (!hasValidSsoSession()) {
      setUser(null);
      setIsLoading(false);
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userProfile = await fetchSsoUserProfile();
      setUser(userProfile);
      return userProfile;
    } catch (err) {
      console.error("Error fetching user profile:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch user";
      setError(errorMessage);

      // If fetch fails and it's an auth error, logout
      if (
        errorMessage.includes("Session expired") ||
        errorMessage.includes("Not authenticated")
      ) {
        logoutFromSso();
      }

      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh access token
   */
  const refreshToken = useCallback(async (): Promise<void> => {
    try {
      await refreshSsoAccessToken();
      // After refresh, fetch user again
      await fetchCurrentUser();
    } catch (err) {
      console.error("Token refresh failed:", err);
      logoutFromSso();
    }
  }, [fetchCurrentUser]);

  /**
   * Logout handler
   */
  const handleLogout = useCallback(() => {
    logoutFromSso();
    setUser(null);
    setError(null);
  }, []);

  // Load user on mount
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const value: UserContextType = {
    user,
    isLoading,
    isAuthenticated: authenticated,
    error,
    logout: handleLogout,
    setUser,
    fetchCurrentUser,
    refreshToken,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
