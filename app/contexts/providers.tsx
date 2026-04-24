import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import {
  clearAuthSession,
  exchangeAuthorizationCode,
  getAuthMe,
  getAuthSession,
  initiateSsoLogin,
  logout as authLogout,
  selectIdentity,
} from "~/lib/auth-client";
import type {
  AuthStatus,
  EffectivePermission,
  EffectiveRole,
  SSOIdentity,
} from "~/lib/sso-types";
import { AuthContext, type CallbackResult } from "./auth-context";
import { UserContext, type User } from "./user-context";
import { IdentityContext } from "./identity-context";

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider = ({ children }: SessionProviderProps) => {
  // --- Auth State ---
  const [token, setToken] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("idle");
  const [isLoading, setIsLoading] = useState(true);
  const [callbackError, setCallbackError] = useState<string | null>(null);

  // --- User State ---
  const [user, setUser] = useState<User | null>(null);

  // --- Identity State ---
  const [availableIdentities, setAvailableIdentities] = useState<SSOIdentity[]>([]);
  const [activeIdentity, setActiveIdentity] = useState<SSOIdentity | null>(null);
  const [effectiveRoles, setEffectiveRoles] = useState<EffectiveRole[]>([]);
  const [effectivePermissions, setEffectivePermissions] = useState<EffectivePermission[]>([]);

  // --- Core Session Application Logic ---
  const applySession = useCallback((session: ReturnType<typeof getAuthSession>) => {
    const hasPendingIdentitySelection =
      Boolean(session?.requiresIdentitySelection) &&
      (session?.availableIdentities?.length || 0) > 0;

    if (!session || (!session.sessionEstablished && !hasPendingIdentitySelection)) {
      setUser(null);
      setToken(null);
      setAvailableIdentities([]);
      setActiveIdentity(null);
      setEffectiveRoles([]);
      setEffectivePermissions([]);
      setAuthStatus("unauthenticated");
      return;
    }

    setUser(session.user);
    setToken(session.token);
    setAvailableIdentities(session.availableIdentities);
    setActiveIdentity(session.activeIdentity);
    setEffectiveRoles(session.effectiveRoles);
    setEffectivePermissions(session.effectivePermissions);
    setAuthStatus("authenticated");
  }, []);

  const hydrateSession = useCallback(async () => {
    setIsLoading(true);
    setAuthStatus("loading");

    const cachedSession = getAuthSession();
    if (cachedSession?.sessionEstablished) {
      applySession(cachedSession);
    }

    const meResult = await getAuthMe();
    if (meResult.success && meResult.session) {
      applySession(meResult.session);
      setIsLoading(false);
      return;
    }

    clearAuthSession();
    applySession(null);
    setIsLoading(false);
  }, [applySession]);

  useEffect(() => {
    void hydrateSession();
  }, [hydrateSession]);

  // --- Auth Methods ---
  const initiateLogin = useCallback(async () => {
    setCallbackError(null);
    await initiateSsoLogin();
  }, []);

  const handleCallback = useCallback(
    async (code: string, state: string): Promise<CallbackResult> => {
      setIsLoading(true);
      setAuthStatus("loading");
      setCallbackError(null);

      const result = await exchangeAuthorizationCode({ code, state });
      if (!result.success || !result.session) {
        setCallbackError(result.message);
        clearAuthSession();
        applySession(null);
        setIsLoading(false);

        return {
          success: false,
          message: result.message,
          requiresIdentitySelection: false,
        };
      }

      applySession(result.session);
      setIsLoading(false);

      return {
        success: true,
        message: result.message,
        requiresIdentitySelection: result.requiresIdentitySelection,
      };
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    await authLogout();
    applySession(null);
  }, [applySession]);

  // --- User Methods ---
  const setUserCompat = useCallback((nextUser: User | null) => {
    setUser(nextUser);
    if (!nextUser) {
      setAuthStatus("unauthenticated");
      return;
    }
    setAuthStatus("authenticated");
  }, []);

  // --- Identity Methods ---
  const selectActiveIdentity = useCallback(
    async (identityType: string) => {
      setIsLoading(true);
      setAuthStatus("loading");
      setCallbackError(null);

      const result = await selectIdentity(identityType);
      if (!result.success || !result.session) {
        setCallbackError(result.message);
        setIsLoading(false);
        setAuthStatus("authenticated");
        return false;
      }

      applySession(result.session);
      setIsLoading(false);
      return true;
    },
    [applySession]
  );

  // --- Memoized Context Values ---
  const authValue = useMemo(
    () => ({
      token,
      authStatus,
      isLoading,
      isAuthenticated: authStatus === "authenticated",
      callbackError,
      setCallbackError,
      initiateLogin,
      handleCallback,
      hydrateSession,
      logout,
    }),
    [token, authStatus, isLoading, callbackError, initiateLogin, handleCallback, hydrateSession, logout]
  );

  const userValue = useMemo(
    () => ({
      user,
      setUser: setUserCompat,
    }),
    [user, setUserCompat]
  );

  const identityValue = useMemo(
    () => ({
      availableIdentities,
      activeIdentity,
      effectiveRoles,
      effectivePermissions,
      selectActiveIdentity,
    }),
    [availableIdentities, activeIdentity, effectiveRoles, effectivePermissions, selectActiveIdentity]
  );

  return (
    <AuthContext.Provider value={authValue}>
      <UserContext.Provider value={userValue}>
        <IdentityContext.Provider value={identityValue}>
          {children}
        </IdentityContext.Provider>
      </UserContext.Provider>
    </AuthContext.Provider>
  );
};
