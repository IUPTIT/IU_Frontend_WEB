/** Types Quản lý Ban CLB */

export type DepartmentStatus = "active" | "paused";

export type ClubDepartment = {
  id: string;
  name: string;
  code: string;
  description?: string;
  field?: string;
  headcountTarget?: number | null;
  status: DepartmentStatus;
  sortOrder?: number;
  headUserId?: string | null;
  headUserName?: string | null;
  headVacantSince?: string | null;
  memberCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type LeadershipTitle = "head";

export type DepartmentMember = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: "member" | "leader" | "admin";
  roles?: string[];
  departmentId?: string | null;
  departmentName?: string;
  memberStatus?: "training" | "official" | null;
  clubStatus?: string;
  leadershipTitle?: LeadershipTitle | null;
  departmentJoinedAt?: string | null;
};

export type MembershipHistoryEvent = {
  id: string;
  action: "assign" | "transfer" | "remove";
  fromDepartment?: string | null;
  toDepartment?: string | null;
  department?: string | null;
  reason?: string;
  actorName?: string | null;
  effectiveAt: string;
};

export type LeadershipHistoryEvent = {
  id: string;
  action: string;
  title: LeadershipTitle;
  titleLabel: string;
  userId?: string | null;
  userName?: string | null;
  startAt: string;
  endAt?: string | null;
  termLabel?: string;
  reason?: string;
  isActive: boolean;
  actorName?: string | null;
};

export type CreateDepartmentInput = {
  name: string;
  code?: string;
  description?: string;
  field?: string;
  headcountTarget?: number | null;
  status?: DepartmentStatus;
  memberIds?: string[];
  headUserId?: string | null;
};
