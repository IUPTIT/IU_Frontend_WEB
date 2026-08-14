import { api, ApiRequestError } from "../api/client";
import type {
  ClubDepartment,
  CreateDepartmentInput,
  DepartmentMember,
  LeadershipHistoryEvent,
  LeadershipTitle,
  MembershipHistoryEvent,
} from "../types/departments";

type BackendDept = {
  id: string;
  name: string;
  code: string;
  description?: string;
  field?: string;
  headcountTarget?: number | null;
  status: "active" | "paused";
  sortOrder?: number;
  headUserId?: string | null;
  headUserName?: string | null;
  headVacantSince?: string | null;
  memberCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

type BackendMember = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "bcn" | "leader" | "member";
  roles?: string[];
  department?: string;
  departmentId?: string | null;
  departmentJoinedAt?: string | null;
  memberStatus?: "training" | "official" | null;
  clubStatus?: string;
  leadershipTitle?: LeadershipTitle | null;
};

function mapErr(err: unknown, fallback: string): never {
  if (err instanceof ApiRequestError) {
    throw new Error(err.message || fallback, { cause: err });
  }
  throw err instanceof Error ? err : new Error(fallback);
}

function toDept(d: BackendDept): ClubDepartment {
  return { ...d };
}

function toMember(u: BackendMember): DepartmentMember {
  return {
    id: u.id,
    fullName: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role === "bcn" ? "admin" : u.role,
    roles: u.roles,
    departmentId: u.departmentId,
    departmentName: u.department,
    memberStatus: u.memberStatus,
    clubStatus: u.clubStatus,
    leadershipTitle: u.leadershipTitle ?? null,
    departmentJoinedAt: u.departmentJoinedAt,
  };
}

export async function getDepartments(
  status?: "active" | "paused" | "",
): Promise<ClubDepartment[]> {
  try {
    const qs = status ? `?status=${status}` : "";
    const { departments } = await api.get<{ departments: BackendDept[] }>(
      `/admin/departments${qs}`,
    );
    return departments.map(toDept);
  } catch (err) {
    mapErr(err, "Không tải được danh sách Ban");
  }
}

export async function createDepartment(
  input: CreateDepartmentInput,
): Promise<ClubDepartment> {
  try {
    const { department } = await api.post<{ department: BackendDept }>(
      "/admin/departments",
      input,
    );
    return toDept(department);
  } catch (err) {
    mapErr(err, "Không tạo được Ban");
  }
}

export async function updateDepartment(
  id: string,
  input: Partial<CreateDepartmentInput>,
): Promise<ClubDepartment> {
  try {
    const { department } = await api.patch<{ department: BackendDept }>(
      `/admin/departments/${id}`,
      input,
    );
    return toDept(department);
  } catch (err) {
    mapErr(err, "Không cập nhật được Ban");
  }
}

export async function deleteDepartment(id: string): Promise<void> {
  try {
    await api.delete(`/admin/departments/${id}`);
  } catch (err) {
    mapErr(err, "Không xóa được Ban");
  }
}

export async function getDepartment(id: string): Promise<ClubDepartment> {
  try {
    const { department } = await api.get<{ department: BackendDept }>(
      `/admin/departments/${id}`,
    );
    return toDept(department);
  } catch (err) {
    mapErr(err, "Không tải được Ban");
  }
}

export async function getDepartmentMembers(
  id: string,
): Promise<DepartmentMember[]> {
  try {
    const { members } = await api.get<{ members: BackendMember[] }>(
      `/admin/departments/${id}/members`,
    );
    return members.map(toMember);
  } catch (err) {
    mapErr(err, "Không tải được thành viên Ban");
  }
}

export async function getUnassignedOfficialMembers(
  q?: string,
): Promise<DepartmentMember[]> {
  try {
    const qs = q?.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
    const { members } = await api.get<{ members: BackendMember[] }>(
      `/admin/members/unassigned${qs}`,
    );
    return members.map(toMember);
  } catch (err) {
    mapErr(err, "Không tải được danh sách chưa phân Ban");
  }
}

export async function assignMemberToDepartment(
  userId: string,
  departmentId: string,
  opts?: { joinedAt?: string; reason?: string },
): Promise<void> {
  try {
    await api.post(`/admin/members/${userId}/department`, {
      departmentId,
      joinedAt: opts?.joinedAt,
      reason: opts?.reason,
    });
  } catch (err) {
    mapErr(err, "Không gán được thành viên vào Ban");
  }
}

export async function removeMemberFromDepartment(
  userId: string,
  reason?: string,
): Promise<void> {
  try {
    await api.delete(`/admin/members/${userId}/department`, { reason });
  } catch (err) {
    mapErr(err, "Không gỡ được thành viên khỏi Ban");
  }
}

export async function getMemberDepartmentHistory(
  userId: string,
): Promise<MembershipHistoryEvent[]> {
  try {
    const { events } = await api.get<{ events: MembershipHistoryEvent[] }>(
      `/admin/members/${userId}/department-history`,
    );
    return events;
  } catch (err) {
    mapErr(err, "Không tải được lịch sử Ban");
  }
}

export async function appointLeader(
  departmentId: string,
  input: {
    userId: string;
    title?: LeadershipTitle;
    startAt: string;
    endAt?: string | null;
    termLabel?: string;
    reason?: string;
  },
): Promise<void> {
  try {
    await api.post(`/admin/departments/${departmentId}/leaders`, input);
  } catch (err) {
    mapErr(err, "Không chỉ định được Leader");
  }
}

export async function getMyLedDepartment(): Promise<{
  department: ClubDepartment;
  members: DepartmentMember[];
  unassigned: DepartmentMember[];
}> {
  try {
    const data = await api.get<{
      department: BackendDept;
      members: BackendMember[];
      unassigned: BackendMember[];
    }>("/leader/department");
    return {
      department: toDept(data.department),
      members: data.members.map(toMember),
      unassigned: data.unassigned.map(toMember),
    };
  } catch (err) {
    mapErr(err, "Không tải được Ban đang phụ trách");
  }
}

export async function assignMyDepartmentMember(userId: string): Promise<void> {
  try {
    await api.post(`/leader/department/members/${userId}`);
  } catch (err) {
    mapErr(err, "Không thêm được thành viên vào Ban");
  }
}

export async function removeMyDepartmentMember(userId: string): Promise<void> {
  try {
    await api.delete(`/leader/department/members/${userId}`);
  } catch (err) {
    mapErr(err, "Không gỡ được thành viên khỏi Ban");
  }
}

export async function updateMyDepartmentMember(
  userId: string,
  input: { name?: string; phone?: string },
): Promise<void> {
  try {
    await api.patch(`/leader/department/members/${userId}`, input);
  } catch (err) {
    mapErr(err, "Không sửa được thành viên");
  }
}

export async function revokeLeader(
  departmentId: string,
  userId: string,
  reason?: string,
): Promise<void> {
  try {
    await api.post(`/admin/departments/${departmentId}/leaders/${userId}/revoke`, {
      reason,
    });
  } catch (err) {
    mapErr(err, "Không thu hồi được vai trò Leader");
  }
}

export async function getLeadershipHistory(
  departmentId: string,
): Promise<LeadershipHistoryEvent[]> {
  try {
    const { events } = await api.get<{ events: LeadershipHistoryEvent[] }>(
      `/admin/departments/${departmentId}/leadership-history`,
    );
    return events;
  } catch (err) {
    mapErr(err, "Không tải được lịch sử Leader");
  }
}

export async function getLeaderVacancies(): Promise<
  (ClubDepartment & { vacantDays: number; overdue: boolean })[]
> {
  try {
    const { vacancies } = await api.get<{
      vacancies: (BackendDept & { vacantDays: number; overdue: boolean })[];
    }>("/admin/departments/leader-vacancies");
    return vacancies.map((v) => ({ ...toDept(v), vacantDays: v.vacantDays, overdue: v.overdue }));
  } catch (err) {
    mapErr(err, "Không tải được cảnh báo thiếu Trưởng ban");
  }
}
