// HTTP client dùng chung — mọi service gọi API qua đây, không fetch trực tiếp trong component.
// Tự gắn Bearer access token; gặp 401 thì thử refresh (cookie httpOnly) rồi gọi lại 1 lần.

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3456/api/v1";

const TOKEN_KEY = "iuclub_access_token";

let accessToken: string | null = sessionStorage.getItem(TOKEN_KEY);

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

export function getAccessToken() {
  return accessToken;
}

// Backend trả { success, message, data } — lỗi thì { success: false, message }
type ApiEnvelope<T> = { success: boolean; message: string; data: T };

export class ApiRequestError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function rawRequest<T>(path: string, options: RequestInit): Promise<ApiEnvelope<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include", // gửi/nhận cookie refresh token
  });

  const body = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!res.ok) {
    throw new ApiRequestError(res.status, body?.message ?? `API ${res.status}: ${res.statusText}`);
  }
  return body as ApiEnvelope<T>;
}

async function tryRefresh(): Promise<boolean> {
  try {
    const { data } = await rawRequest<{ accessToken: string }>("/auth/refresh", { method: "POST" });
    setAccessToken(data.accessToken);
    return true;
  } catch {
    setAccessToken(null);
    return false;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  try {
    const { data } = await rawRequest<T>(path, options);
    return data;
  } catch (err) {
    // Access token hết hạn → refresh rồi gọi lại đúng 1 lần
    const is401 = err instanceof ApiRequestError && err.status === 401;
    const isAuthPath = path.startsWith("/auth/login") || path.startsWith("/auth/refresh");
    if (is401 && !isAuthPath && (await tryRefresh())) {
      const { data } = await rawRequest<T>(path, options);
      return data;
    }
    throw err;
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "DELETE",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
};
