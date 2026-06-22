"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { login as apiLogin, logout as apiLogout, signup as apiSignup } from "@/lib/api";
import {
  clearAuth,
  getAuthSnapshot,
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
  const user = useSyncExternalStore(
    subscribeAuth,
    getAuthSnapshot,
    () => null
  );

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    saveAuth(data.user, data.accessToken, data.refreshToken);
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const data = await apiSignup(name, email, password);
      saveAuth(data.user, data.accessToken, data.refreshToken);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      clearAuth();
    }
  }, []);

  const value = useMemo(
    () => ({ user, login, signup, logout }),
    [user, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
