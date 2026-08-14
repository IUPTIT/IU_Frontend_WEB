import { createContext } from "react";
import type { AuthUser } from "../services/authService";

export type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  /** Thay toàn bộ user sau khi backend trả user mới (đổi mật khẩu, cập nhật hồ sơ) */
  replaceUser: (user: AuthUser) => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
