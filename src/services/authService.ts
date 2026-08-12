// Auth qua API thật (backend /api/v1/auth)
import { api, setAccessToken, ApiRequestError } from "../api/client";
import type { Role } from "../types/navigation";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** Additive roles — dual Member+Leader = ["member","leader"] */
  roles?: Role[];
  phone?: string;
  bio?: string;
  avatarDataUrl?: string;
  /** true = tài khoản sinh tự động (ứng viên) — bắt đổi mật khẩu trước khi dùng portal */
  requirePasswordChange?: boolean;
  /** ID hồ sơ ứng tuyển gắn với tài khoản candidate */
  sourceApplicationId?: string;
  /** Member được đẩy quyền mentor dẫn team vòng training */
  isMentor?: boolean;
  /** Ch.2.4: Đang training | Chính thức (chỉ khi role=member) */
  memberStatus?: "training" | "official" | null;
};

// Backend dùng role "bcn" cho Ban Chủ nhiệm — frontend gọi là "admin"
type BackendRole = "bcn" | "leader" | "member" | "candidate";

type BackendUser = {
  id: string;
  name: string;
  email: string;
  role: BackendRole;
  roles?: BackendRole[];
  avatar?: string;
  phone?: string;
  bio?: string;
  requirePasswordChange?: boolean;
  sourceApplicationId?: string | null;
  isMentor?: boolean;
  memberStatus?: "training" | "official" | null;
};

function mapRole(r: BackendRole): Role {
  return r === "bcn" ? "admin" : r;
}

function toAuthUser(u: BackendUser): AuthUser {
  const roles = (u.roles?.length ? u.roles : [u.role]).map(mapRole);
  const id =
    u.id ||
    (typeof (u as { _id?: string })._id === "string"
      ? (u as { _id: string })._id
      : "");
  return {
    id,
    name: u.name,
    email: u.email,
    role: mapRole(u.role),
    roles,
    phone: u.phone || undefined,
    bio: u.bio || undefined,
    avatarDataUrl: u.avatar || undefined,
    requirePasswordChange: u.requirePasswordChange ?? false,
    sourceApplicationId: u.sourceApplicationId
      ? String(u.sourceApplicationId)
      : undefined,
    isMentor: u.isMentor ?? false,
    memberStatus: u.memberStatus ?? null,
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
      // 400 Celebrate: email không hợp lệ / thiếu field
      const msg = err.message || "";
      if (msg.toLowerCase().includes("validation") || msg.toLowerCase().includes("email")) {
        throw new Error(
          "Email hoặc mật khẩu không hợp lệ — với ứng viên Pass vòng đơn, mật khẩu mặc định là ngày sinh DDMMYYYY",
          { cause: err },
        );
      }
      throw new Error("Email hoặc mật khẩu không đúng", { cause: err });
    }
    if (err instanceof ApiRequestError && err.status === 403) {
      throw new Error(err.message, { cause: err });
    }
    if (err instanceof TypeError) {
      throw new Error("Không kết nối được máy chủ — kiểm tra backend đã chạy chưa", { cause: err });
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

/** User tự cập nhật hồ sơ của mình — trả user đã lưu ở backend */
export async function updateMyProfile(patch: {
  name?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
}): Promise<AuthUser> {
  const { user } = await api.patch<{ user: BackendUser }>("/auth/me", patch);
  return toAuthUser(user);
}

/** Đổi mật khẩu — backend cấp lại token mới và trả user đã cập nhật */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<AuthUser> {
  const { user, accessToken } = await api.post<{ user: BackendUser; accessToken: string }>(
    "/auth/change-password",
    { currentPassword, newPassword },
  );
  setAccessToken(accessToken);
  return toAuthUser(user);
}

export async function logoutFromServer(): Promise<void> {
  // Xoá access token sync trước — tránh race còn gọi API với JWT cũ
  setAccessToken(null);
  try {
    await api.post("/auth/logout");
  } catch {
    // logout là best-effort — kể cả lỗi mạng vẫn đã xoá phiên phía client
  }
}
