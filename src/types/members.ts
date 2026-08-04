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
  departmentId: string;
  departmentName: string;
  studentId?: string;
  generation?: string;
};
