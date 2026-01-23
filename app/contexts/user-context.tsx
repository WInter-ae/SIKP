import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  getCurrentUser,
  getAuthToken,
  logout as authLogout,
} from "~/lib/auth-client";

/**
 * User type berdasarkan backend API
 */
export interface User {
  id: string;
  nama: string;
  email: string;
  role:
    | "MAHASISWA"
    | "ADMIN"
    | "DOSEN"
    | "KAPRODI"
    | "WAKIL_DEKAN"
    | "PEMBIMBING_LAPANGAN";
  nim?: string;
  nip?: string;
  fakultas?: string;
  prodi?: string;
  semester?: number;
  angkatan?: string;
  phone?: string;
}

interface UserContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
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
  const [isLoading, setIsLoading] = useState(true);

  // Load user data saat component mount
  useEffect(() => {
    const storedUser = getCurrentUser();
    const storedToken = getAuthToken();

    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
    }

    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    authLogout();
    setUser(null);
    setToken(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        logout: handleLogout,
        setUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
