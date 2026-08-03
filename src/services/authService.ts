// TODO: MOCK — thay bằng API thật khi có backend
import { DEMO_ACCOUNTS } from "../mocks/auth.mock";
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

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export async function loginWithCredentials(
  email: string,
  password: string,
): Promise<AuthUser> {
  await delay();

  const account = DEMO_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password,
  );

  if (!account) {
    throw new Error("Email hoặc mật khẩu không đúng");
  }

  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
  };
}
