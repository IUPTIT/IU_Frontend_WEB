// Types cho điều hướng theo role

export type Role = "admin" | "leader" | "member";

export type NavChild = {
  id: string;
  label: string;
  path: string;
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
};

/** Nhóm menu — `label` là heading section (VD: ĐÀO TẠO, CHÍNH); bỏ trống thì không hiện heading */
export type NavSection = {
  id: string;
  label?: string;
  items: NavItem[];
};

export type SidebarConfig = {
  brand: {
    initial: string;
    title: string;
    subtitle: string;
  };
  sections: NavSection[];
};
