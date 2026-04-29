import { createContext, useContext } from "react";
import type {
  EffectivePermission,
  EffectiveRole,
  SSOIdentity,
} from "~/lib/sso-types";

export interface IdentityContextType {
  availableIdentities: SSOIdentity[];
  activeIdentity: SSOIdentity | null;
  effectiveRoles: EffectiveRole[];
  effectivePermissions: EffectivePermission[];
  selectActiveIdentity: (identityType: string) => Promise<boolean>;
}

export const IdentityContext = createContext<IdentityContextType | undefined>(
  undefined,
);

export const useIdentity = () => {
  const context = useContext(IdentityContext);
  if (context === undefined) {
    throw new Error(
      "useIdentity must be used within an IdentityProvider/SessionProvider",
    );
  }
  return context;
};
