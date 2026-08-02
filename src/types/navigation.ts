// Types cho điều hướng theo role

export type Role = "admin" | "leader" | "member";

export type NavChild = {
  id: string;
  label: string;
  path: string;
};

export type NavItem = {
  id: string;
  label: string;
  icon: "dashboard" | "recruitment" | "training" | "members" | "events" | "profile" | "settings";
  path: string;
  children?: NavChild[]; // có children → render dạng accordion với sidebar phụ
};

export type SidebarConfig = {
  brand: {
    initial: string; // chữ cái trong ô logo
    title: string;
    subtitle: string;
  };
  items: NavItem[];
};
