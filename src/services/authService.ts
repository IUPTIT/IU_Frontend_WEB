// Auth qua API thật (backend /api/v1/auth)
import { api, setAccessToken, ApiRequestError } from "../api/client";
import type { Role } from "../types/navigation";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  bio?: string;
  avatarDataUrl?: string;
};

// Backend dùng role "bcn" cho Ban Chủ nhiệm — frontend gọi là "admin"
type BackendRole = "bcn" | "leader" | "member";

type BackendUser = {
  id: string;
  name: string;
  email: string;
  role: BackendRole;
  avatar?: string;
};

function toAuthUser(u: BackendUser): AuthUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role === "bcn" ? "admin" : u.role,
    avatarDataUrl: u.avatar || undefined,
  };
}

export async function loginWithCredentials(email: string, password: string): Promise<AuthUser> {
  try {
    const { user, accessToken } = await api.post<{ user: BackendUser; accessToken: string }>(
      "/auth/login",
      { email: email.trim(), password },
    );
    setAccessToken(accessToken);
    return toAuthUser(user);
  } catch (err) {
    if (err instanceof ApiRequestError && (err.status === 401 || err.status === 400)) {
      throw new Error("Email hoặc mật khẩu không đúng");
    }
    if (err instanceof ApiRequestError && err.status === 403) {
      throw new Error(err.message); // tài khoản bị khoá / email chưa xác thực
    }
    if (err instanceof TypeError) {
      throw new Error("Không kết nối được máy chủ — kiểm tra backend đã chạy chưa");
    }
    throw err;
  }
}

/** Khôi phục phiên khi mở lại tab: refresh cookie đổi access token mới, user trả về cùng response */
export async function restoreSession(): Promise<AuthUser | null> {
  try {
    const { accessToken, user } = await api.post<{ accessToken: string; user: BackendUser }>("/auth/refresh");
    setAccessToken(accessToken);
    return toAuthUser(user);
  } catch {
    setAccessToken(null);
    return null;
  }
}

export async function logoutFromServer(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } catch {
    // logout là best-effort — kể cả lỗi mạng vẫn xoá phiên phía client
  }
  setAccessToken(null);
}
