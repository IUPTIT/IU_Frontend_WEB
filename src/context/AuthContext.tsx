import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Role } from "../types/navigation";
import {
  loginWithCredentials,
  logoutFromServer,
  restoreSession,
  type AuthUser,
} from "../services/authService";

type ProfilePatch = Partial<Pick<AuthUser, "name" | "phone" | "bio" | "avatarDataUrl">>;

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (patch: ProfilePatch) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

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

  // Mở lại tab: xác thực lại phiên với server (refresh cookie còn hạn thì giữ đăng nhập).
  // Ref chặn StrictMode (dev) chạy effect 2 lần → tránh gọi refresh trùng.
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    if (!readStoredUser()) return;
    restoreSession().then((restored) => {
      persist(restored);
      setUser(restored);
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

  const updateProfile = useCallback((patch: ProfilePatch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      persist(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      login,
      logout,
      updateProfile,
    }),
    [user, login, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải dùng bên trong <AuthProvider>");
  return ctx;
}

export type { AuthUser, Role };
