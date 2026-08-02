import type { Role, SidebarConfig } from "../types/navigation";

// Cấu hình sidebar cho từng role — thêm role mới chỉ cần thêm một entry ở đây.
// Item có `children` sẽ render thành menu accordion với sidebar phụ.
export const SIDEBAR_CONFIG: Record<Role, SidebarConfig> = {
  admin: {
    brand: { initial: "A", title: "Admin Portal", subtitle: "IT Club Management" },
    items: [
      { id: "overview", label: "Tổng quan", icon: "dashboard", path: "/admin" },
      {
        id: "recruitment",
        label: "Tuyển dụng",
        icon: "recruitment",
        path: "/admin/recruitment",
        children: [
          { id: "recruitment-open", label: "Mở đợt tuyển", path: "/admin/recruitment/open" },
          { id: "recruitment-applications", label: "Vòng hồ sơ", path: "/admin/recruitment/applications" },
          { id: "recruitment-interviews", label: "Vòng phỏng vấn", path: "/admin/recruitment/interviews" },
          { id: "recruitment-results", label: "Kết quả", path: "/admin/recruitment/results" },
        ],
      },
      { id: "members", label: "Quản lý thành viên", icon: "members", path: "/admin/members" },
      {
        id: "training",
        label: "Đào tạo",
        icon: "training",
        path: "/admin/training",
        children: [
          { id: "training-roadmap", label: "Lộ trình training", path: "/admin/training/roadmap" },
          { id: "training-teams", label: "Chia đội", path: "/admin/training/teams" },
          { id: "training-review", label: "Đánh giá tổng kết", path: "/admin/training/review" },
        ],
      },
      { id: "settings", label: "Cài đặt", icon: "settings", path: "/admin/settings" },
    ],
  },
  leader: {
    brand: { initial: "L", title: "Leader Portal", subtitle: "IT Club Management" },
    items: [
      { id: "overview", label: "Tổng quan", icon: "dashboard", path: "/leader" },
      { id: "training", label: "Đào tạo", icon: "training", path: "/leader/training" },
      { id: "members", label: "Thành viên ban", icon: "members", path: "/leader/members" },
    ],
  },
  member: {
    brand: { initial: "M", title: "Member Portal", subtitle: "IT Club Management" },
    items: [
      { id: "overview", label: "Tổng quan", icon: "dashboard", path: "/member" },
      { id: "events", label: "Sự kiện", icon: "events", path: "/member/events" },
      { id: "profile", label: "Hồ sơ của tôi", icon: "profile", path: "/member/profile" },
    ],
  },
};
