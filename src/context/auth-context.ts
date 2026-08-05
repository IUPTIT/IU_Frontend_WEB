import { createContext } from "react";
import type { AuthUser } from "../services/authService";

export type ProfilePatch = Partial<Pick<AuthUser, "name" | "phone" | "bio" | "avatarDataUrl">>;

export type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (patch: ProfilePatch) => void;
  /** Thay toàn bộ user (sau đổi mật khẩu — backend trả user mới) */
  replaceUser: (user: AuthUser) => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
