// Types cho điều hướng theo role

export type Role = "admin" | "leader" | "member" | "candidate";

export type NavChild = {
  id: string;
  label: string;
  path: string;
  /** Chỉ hiện trên Leader portal khi user.roles gồm member (dual account) */
  dualMemberOnly?: boolean;
  /** Chỉ hiện khi tài khoản có quyền Mentor training. */
  mentorOnly?: boolean;
};

export type NavIcon =
  | "dashboard"
  | "recruitment"
  | "training"
  | "members"
  | "events"
  | "profile"
  | "settings"
  | "permissions"
  | "roadmap"
  | "tasks"
  | "progress"
  | "help"
  | "logout";

export type NavItem = {
  id: string;
  label: string;
  icon: NavIcon;
  path: string;
  children?: NavChild[];
  /** Màu chữ/icon — logout đỏ */
  tone?: "default" | "danger";
  /** logout = gọi AuthContext.logout thay vì navigate */
  action?: "navigate" | "logout";
  /** Chỉ hiện khi user.isMentor (member được đẩy quyền mentor) */
  mentorOnly?: boolean;
  /** Chỉ hiện trên Leader portal khi user.roles gồm member (dual account) */
  dualMemberOnly?: boolean;
};

/** Nhóm menu — `label` là heading section (VD: ĐÀO TẠO, CHÍNH); bỏ trống thì không hiện heading */
export type NavSection = {
  id: string;
  label?: string;
  items: NavItem[];
  /** Ẩn cả section với mentor (VD: khu training tân binh không dành cho mentor) */
  hideForMentor?: boolean;
};

export type SidebarConfig = {
  brand: {
    initial: string;
    title: string;
    subtitle: string;
  };
  sections: NavSection[];
};
