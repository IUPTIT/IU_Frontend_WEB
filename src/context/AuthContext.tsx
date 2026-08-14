import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Role } from "../types/navigation";
import {
  loginWithCredentials,
  logoutFromServer,
  restoreSession,
  type AuthUser,
} from "../services/authService";
import { getAccessToken } from "../api/client";

import { AuthContext } from "./auth-context";

const STORAGE_KEY = "iuclub_auth_user";

function readStoredUser(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function persist(user: AuthUser | null) {
  if (!user) {
    sessionStorage.removeItem(STORAGE_KEY);
    return;
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  // Mở lại tab: refresh cookie → access token. Không xoá session nếu vẫn còn access token
  // (tránh race StrictMode / refresh fail làm login lần đầu bị đá ra ngay).
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    if (!readStoredUser()) return;
    restoreSession().then((restored) => {
      if (restored) {
        persist(restored);
        setUser(restored);
        return;
      }
      if (!getAccessToken()) {
        persist(null);
        setUser(null);
      }
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const next = await loginWithCredentials(email, password);
    persist(next);
    setUser(next);
  }, []);

  const logout = useCallback(() => {
    void logoutFromServer();
    persist(null);
    setUser(null);
  }, []);

  const replaceUser = useCallback((next: AuthUser) => {
    persist(next);
    setUser(next);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      login,
      logout,
      replaceUser,
    }),
    [user, login, logout, replaceUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export type { AuthUser, Role };
