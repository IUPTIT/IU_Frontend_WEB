// Quản lý thành viên CLB — API thật /admin/members
import { api, ApiRequestError } from "../api/client";
import type {
  ClubMember,
  CreateClubMemberInput,
  MemberImportResult,
  MemberImportRow,
  MemberImportValidateResult,
} from "../types/members";

type BackendRole = "bcn" | "leader" | "member";

type BackendMember = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: BackendRole;
  roles?: BackendRole[];
  department?: string;
  departmentId?: string | null;
  studentId?: string;
  generation?: string;
  clubStatus?: "active" | "inactive" | "alumni";
  createdAt?: string;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function toClubMember(u: BackendMember): ClubMember {
  const departmentName = u.department || "";
  return {
    id: u.id,
    fullName: u.name,
    email: u.email,
    phone: u.phone || undefined,
    role: u.role === "bcn" ? "admin" : u.role,
    departmentId: u.departmentId || "",
    departmentName,
    status: u.clubStatus ?? "active",
    joinedAt: u.createdAt ?? new Date().toISOString(),
    avatarInitials: initials(u.name),
    studentId: u.studentId || undefined,
    generation: u.generation || undefined,
  };
}

function mapErr(err: unknown, fallback: string): never {
  if (err instanceof ApiRequestError) {
    throw new Error(err.message || fallback, { cause: err });
  }
  throw err instanceof Error ? err : new Error(fallback);
}

export async function getClubMembers(params?: {
  q?: string;
  role?: string;
  department?: string;
  clubStatus?: string;
}): Promise<ClubMember[]> {
  try {
    const qs = new URLSearchParams();
    if (params?.q) qs.set("q", params.q);
    if (params?.role) qs.set("role", params.role);
    if (params?.department) qs.set("department", params.department);
    if (params?.clubStatus) qs.set("clubStatus", params.clubStatus);
    const query = qs.toString() ? `?${qs}` : "";
    const data = await api.get<{
      members: BackendMember[];
      total?: number;
    }>(`/admin/members${query}`);
    return data.members.map(toClubMember);
  } catch (err) {
    mapErr(err, "Không tải được danh sách thành viên");
  }
}

export async function getClubMembersPage(input: {
  q?: string;
  role?: string;
  department?: string;
  clubStatus?: string;
  page?: number;
  limit?: number;
}): Promise<{
  members: ClubMember[];
  total: number;
  page: number;
  limit: number;
}> {
  try {
    const qs = new URLSearchParams();
    if (input.q) qs.set("q", input.q);
    if (input.role) qs.set("role", input.role);
    if (input.department) qs.set("department", input.department);
    if (input.clubStatus) qs.set("clubStatus", input.clubStatus);
    qs.set("page", String(input.page ?? 1));
    qs.set("limit", String(input.limit ?? 20));
    const data = await api.get<{
      members: BackendMember[];
      total: number;
      page: number;
      limit: number;
    }>(`/admin/members?${qs}`);
    return {
      members: data.members.map(toClubMember),
      total: data.total,
      page: data.page,
      limit: data.limit,
    };
  } catch (err) {
    mapErr(err, "Không tải được danh sách thành viên");
  }
}

export async function createClubMember(input: CreateClubMemberInput): Promise<ClubMember> {
  try {
    const body: Record<string, unknown> = {
      fullName: input.fullName,
      email: input.email,
      phone: input.phone || undefined,
      role: input.role,
      studentId: input.studentId || undefined,
      generation: input.generation || undefined,
    };
    if (input.departmentId) {
      body.departmentId = input.departmentId;
      body.departmentName = input.departmentName;
    }
    const { member } = await api.post<{ member: BackendMember }>(
      "/admin/members",
      body,
    );
    return toClubMember(member);
  } catch (err) {
    mapErr(err, "Không tạo được thành viên");
  }
}

export async function setClubMemberStatus(
  id: string,
  status: ClubMember["status"],
): Promise<ClubMember | undefined> {
  try {
    const { member } = await api.patch<{ member: BackendMember }>(
      `/admin/members/${id}/status`,
      { clubStatus: status },
    );
    return toClubMember(member);
  } catch (err) {
    mapErr(err, "Không cập nhật được trạng thái");
  }
}

export async function updateClubMemberRole(
  id: string,
  role: ClubMember["role"],
): Promise<ClubMember | undefined> {
  if (role === "admin") {
    throw new Error("Đổi role Admin chỉ thực hiện ở Phân quyền");
  }
  try {
    const { member } = await api.patch<{ member: BackendMember }>(
      `/admin/members/${id}/role`,
      { role },
    );
    return toClubMember(member);
  } catch (err) {
    mapErr(err, "Không cập nhật được vai trò");
  }
}

export async function updateClubMember(
  id: string,
  input: Partial<{
    fullName: string;
    email: string;
    phone: string;
    studentId: string;
    generation: string;
  }>,
): Promise<ClubMember> {
  try {
    const { member } = await api.patch<{ member: BackendMember }>(
      `/admin/members/${id}`,
      input,
    );
    return toClubMember(member);
  } catch (err) {
    mapErr(err, "Không cập nhật được thành viên");
  }
}

export async function deleteClubMember(id: string): Promise<void> {
  try {
    await api.delete(`/admin/members/${id}`);
  } catch (err) {
    mapErr(err, "Không xóa được thành viên");
  }
}

export async function validateMemberImport(
  rows: MemberImportRow[],
): Promise<MemberImportValidateResult> {
  try {
    return await api.post<MemberImportValidateResult>(
      "/admin/members/import/validate",
      { rows },
    );
  } catch (err) {
    mapErr(err, "Không kiểm tra được dữ liệu import");
  }
}

export async function importClubMembers(
  rows: MemberImportRow[],
  { skipInvalid = true }: { skipInvalid?: boolean } = {},
): Promise<MemberImportResult> {
  try {
    const result = await api.post<{
      created: BackendMember[];
      createdCount: number;
      skippedCount: number;
      invalid: MemberImportValidateResult["invalid"];
    }>("/admin/members/import", { rows, skipInvalid });
    return {
      created: result.created.map(toClubMember),
      createdCount: result.createdCount,
      skippedCount: result.skippedCount,
      invalid: result.invalid,
    };
  } catch (err) {
    mapErr(err, "Không import được thành viên");
  }
}
