// TODO: MOCK — thay bằng API thật khi có backend
import type {
  AccountRole,
  CreateLeaderAccountInput,
  CreateTrainingMemberAccountInput,
  ManagedAccount,
} from "../types/permissions";
import { mockManagedAccounts } from "../mocks/permissions.mock";

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

let accounts = [...mockManagedAccounts];

const DEPT_NAMES: Record<string, string> = {
  "dept-tech": "Ban Chuyên môn",
  "dept-media": "Ban Truyền thông",
  "dept-event": "Ban Sự kiện",
  "dept-hr": "Ban Nhân sự",
};

export async function getManagedAccounts(): Promise<ManagedAccount[]> {
  await delay();
  return [...accounts];
}

export type CreateAccountInput = {
  fullName: string;
  email: string;
  role: AccountRole;
  departmentId: string;
  temporaryPassword?: string;
  isTrainingMember?: boolean;
};

export async function createManagedAccount(input: CreateAccountInput): Promise<ManagedAccount> {
  await delay(400);
  if (accounts.some((a) => a.email.toLowerCase() === input.email.trim().toLowerCase())) {
    throw new Error("Email đã tồn tại trong hệ thống.");
  }
  const created: ManagedAccount = {
    id: `acc-${Date.now()}`,
    fullName: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    role: input.role,
    isTrainingMember: input.role === "member" ? (input.isTrainingMember ?? true) : false,
    departmentId: input.departmentId,
    departmentName: DEPT_NAMES[input.departmentId] ?? input.departmentId,
    createdAt: new Date().toISOString(),
    createdBy: "admin-1",
  };
  accounts = [created, ...accounts];
  return created;
}

export async function createTrainingMemberAccount(
  input: CreateTrainingMemberAccountInput,
): Promise<ManagedAccount> {
  return createManagedAccount({
    ...input,
    role: "member",
    isTrainingMember: true,
  });
}

export async function createLeaderAccount(
  input: CreateLeaderAccountInput,
): Promise<ManagedAccount> {
  return createManagedAccount({
    ...input,
    role: "leader",
  });
}

export async function updateAccountRole(
  id: string,
  role: AccountRole,
): Promise<ManagedAccount | undefined> {
  await delay(250);
  accounts = accounts.map((a) =>
    a.id === id
      ? {
          ...a,
          role,
          isTrainingMember: role === "member" ? a.isTrainingMember : false,
        }
      : a,
  );
  return accounts.find((a) => a.id === id);
}

export async function deactivateAccount(id: string): Promise<void> {
  await delay(250);
  accounts = accounts.filter((a) => a.id !== id);
}
