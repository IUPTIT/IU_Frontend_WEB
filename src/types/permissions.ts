/** Types phân quyền Admin — tạo tài khoản Member training & role Leader */

export type AccountRole = "member" | "leader" | "admin";

export type ManagedAccount = {
  id: string;
  fullName: string;
  email: string;
  role: AccountRole;
  /** Additive roles — dual Member+Leader = ["member","leader"] */
  roles?: AccountRole[];
  /** Member đang trong chương trình training */
  isTrainingMember?: boolean;
  departmentId?: string;
  departmentName?: string;
  createdAt: string;
  createdBy: string;
};

export type CreateTrainingMemberAccountInput = {
  fullName: string;
  email: string;
  departmentId: string;
  temporaryPassword?: string;
};

export type CreateLeaderAccountInput = {
  fullName: string;
  email: string;
  departmentId: string; // ban mà Leader phụ trách
  temporaryPassword?: string;
};
