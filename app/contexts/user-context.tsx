import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
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
import {
  type AuthStatus,
  type EffectivePermission,
  type EffectiveRole,
  type SSOIdentity,
  type SessionUser,
} from "~/lib/sso-types";

/**
 * User type berdasarkan backend API
 */
export type User = SessionUser;

interface CallbackResult {
  success: boolean;
  message: string;
  requiresIdentitySelection: boolean;
}

interface UserContextType {
  user: User | null;
  token: string | null;
  authStatus: AuthStatus;
  isLoading: boolean;
  isAuthenticated: boolean;
  availableIdentities: SSOIdentity[];
  activeIdentity: SSOIdentity | null;
  effectiveRoles: EffectiveRole[];
  effectivePermissions: EffectivePermission[];
  callbackError: string | null;
  initiateLogin: () => Promise<void>;
  handleCallback: (code: string, state: string) => Promise<CallbackResult>;
  selectActiveIdentity: (identityType: string) => Promise<boolean>;
  hydrateSession: () => Promise<void>;
  setCallbackError: (message: string | null) => void;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
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
  const [token, setToken] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("idle");
  const [isLoading, setIsLoading] = useState(true);
  const [availableIdentities, setAvailableIdentities] = useState<SSOIdentity[]>(
    [],
  );
  const [activeIdentity, setActiveIdentity] = useState<SSOIdentity | null>(
    null,
  );
  const [effectiveRoles, setEffectiveRoles] = useState<EffectiveRole[]>([]);
  const [effectivePermissions, setEffectivePermissions] = useState<
    EffectivePermission[]
  >([]);
  const [callbackError, setCallbackError] = useState<string | null>(null);

  const applySession = useCallback(
    (session: ReturnType<typeof getAuthSession>) => {
      if (!session || !session.sessionEstablished) {
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
    },
    [],
  );

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
    [applySession],
  );

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
    [applySession],
  );

  useEffect(() => {
    void hydrateSession();
  }, [hydrateSession]);

  const handleLogout = useCallback(async () => {
    await authLogout();
    applySession(null);
  }, [applySession]);

  const setUserCompat = useCallback((nextUser: User | null) => {
    setUser(nextUser);
    if (!nextUser) {
      setAuthStatus("unauthenticated");
      return;
    }

    setAuthStatus("authenticated");
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        authStatus,
        isLoading,
        isAuthenticated: authStatus === "authenticated",
        availableIdentities,
        activeIdentity,
        effectiveRoles,
        effectivePermissions,
        callbackError,
        initiateLogin,
        handleCallback,
        selectActiveIdentity,
        hydrateSession,
        setCallbackError,
        logout: handleLogout,
        setUser: setUserCompat,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
