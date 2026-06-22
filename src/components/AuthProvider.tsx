"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { login as apiLogin, logout as apiLogout, signup as apiSignup } from "@/lib/api";
import {
  getStoredUser,
  saveAuth,
  subscribeAuth,
} from "@/lib/auth-storage";
import { User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
    return subscribeAuth(() => setUser(getStoredUser()));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    saveAuth(data.user, data.accessToken, data.refreshToken);
    setUser(data.user);
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const data = await apiSignup(name, email, password);
      saveAuth(data.user, data.accessToken, data.refreshToken);
      setUser(data.user);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
