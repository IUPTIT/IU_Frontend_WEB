/** Thành viên chính thức CLB (Member + Leader) — không gồm trainee đang đào tạo */

export type ClubMemberRole = "member" | "leader" | "admin";

export type ClubMemberStatus = "active" | "inactive" | "alumni";

export type ClubMember = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: ClubMemberRole;
  departmentId: string;
  departmentName: string;
  status: ClubMemberStatus;
  joinedAt: string;
  avatarInitials?: string;
  studentId?: string;
  generation?: string; // Gen 4, Gen 10...
};

export type CreateClubMemberInput = {
  fullName: string;
  email: string;
  phone?: string;
  role: Exclude<ClubMemberRole, "admin">;
  departmentId?: string;
  departmentName?: string;
  studentId?: string;
  generation?: string;
};

/** Một dòng đã map từ Excel — gửi lên BE validate/import */
export type MemberImportRow = {
  rowIndex?: number;
  fullName: string;
  email: string;
  phone?: string;
  studentId?: string;
  generation?: string;
  departmentName?: string;
};

export type MemberImportInvalid = {
  rowIndex: number;
  data: MemberImportRow;
  errors: string[];
};

export type MemberImportValidateResult = {
  valid: MemberImportRow[];
  invalid: MemberImportInvalid[];
};

export type MemberImportResult = {
  created: ClubMember[];
  createdCount: number;
  skippedCount: number;
  invalid: MemberImportInvalid[];
};
