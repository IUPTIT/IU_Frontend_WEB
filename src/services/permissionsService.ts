// Phân quyền portal — API thật /admin/accounts
import { api, ApiRequestError } from "../api/client";
import type {
  AccountRole,
  CreateLeaderAccountInput,
  CreateTrainingMemberAccountInput,
  ManagedAccount,
} from "../types/permissions";

type BackendRole = "bcn" | "leader" | "member";

type BackendAccount = {
  id: string;
  name: string;
  email: string;
  role: BackendRole;
  roles?: BackendRole[];
  department?: string;
  departmentId?: string | null;
  isTrainingMember?: boolean;
  createdAt?: string;
};

function toManagedAccount(u: BackendAccount): ManagedAccount {
  const departmentName = u.department || "";
  const roles = (u.roles?.length ? u.roles : [u.role]).map((r) =>
    r === "bcn" ? ("admin" as const) : r,
  );
  return {
    id: u.id,
    fullName: u.name,
    email: u.email,
    role: u.role === "bcn" ? "admin" : u.role,
    roles,
    isTrainingMember: u.isTrainingMember ?? false,
    departmentId: u.departmentId || undefined,
    departmentName: departmentName || undefined,
    createdAt: u.createdAt ?? new Date().toISOString(),
    createdBy: "",
  };
}

function mapErr(err: unknown, fallback: string): never {
  if (err instanceof ApiRequestError) {
    throw new Error(err.message || fallback, { cause: err });
  }
  throw err instanceof Error ? err : new Error(fallback);
}

export async function getManagedAccounts(): Promise<ManagedAccount[]> {
  try {
    const { accounts } = await api.get<{ accounts: BackendAccount[] }>("/admin/accounts");
    return accounts.map(toManagedAccount);
  } catch (err) {
    mapErr(err, "Không tải được danh sách tài khoản");
  }
}

export type CreateAccountInput = {
  fullName: string;
  email: string;
  role: AccountRole;
  departmentId: string;
  departmentName?: string;
  temporaryPassword?: string;
  isTrainingMember?: boolean;
};

export async function createManagedAccount(input: CreateAccountInput): Promise<ManagedAccount> {
  try {
    const { account } = await api.post<{ account: BackendAccount }>("/admin/accounts", {
      fullName: input.fullName,
      email: input.email,
      role: input.role, // BE map admin → bcn
      departmentId: input.departmentId || undefined,
      departmentName: input.departmentName || undefined,
      temporaryPassword: input.temporaryPassword || "Temp@123",
      isTrainingMember: input.role === "member" ? (input.isTrainingMember ?? true) : false,
    });
    return toManagedAccount(account);
  } catch (err) {
    mapErr(err, "Không cấp được tài khoản");
  }
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
  try {
    const { account } = await api.patch<{ account: BackendAccount }>(
      `/admin/accounts/${id}/role`,
      { role },
    );
    return toManagedAccount(account);
  } catch (err) {
    mapErr(err, "Không cập nhật được vai trò");
  }
}

export async function deactivateAccount(id: string): Promise<void> {
  try {
    await api.post(`/admin/accounts/${id}/deactivate`);
  } catch (err) {
    mapErr(err, "Không khoá được tài khoản");
  }
}
