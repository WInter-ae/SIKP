import { createContext, useContext } from "react";
import type { SessionUser } from "~/lib/sso-types";

export type User = SessionUser;

export interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider/SessionProvider");
  }
  return context;
};
