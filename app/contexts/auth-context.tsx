import { createContext, useContext } from "react";
import type { AuthStatus } from "~/lib/sso-types";

export interface CallbackResult {
  success: boolean;
  message: string;
  requiresIdentitySelection: boolean;
}

export interface AuthContextType {
  token: string | null;
  authStatus: AuthStatus;
  isLoading: boolean;
  isAuthenticated: boolean;
  callbackError: string | null;
  setCallbackError: (message: string | null) => void;
  initiateLogin: () => Promise<void>;
  handleCallback: (code: string, state: string) => Promise<CallbackResult>;
  hydrateSession: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider/SessionProvider");
  }
  return context;
};
