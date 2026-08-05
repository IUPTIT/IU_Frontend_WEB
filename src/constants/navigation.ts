import type { Role, SidebarConfig } from "../types/navigation";
import { ROUTES } from "./routes";

// Cấu hình sidebar theo đúng menu thiết kế 3 role.
// Item có `children` → accordion; `section.label` → heading nhóm (CHÍNH, ĐÀO TẠO...).
export const SIDEBAR_CONFIG: Record<Role, SidebarConfig> = {
  admin: {
    brand: {
      initial: "A",
      title: "IU Club",
      subtitle: "Admin Console",
    },
    sections: [
      {
        id: "main",
        label: "ĐIỀU HƯỚNG",
        items: [
          {
            id: "overview",
            label: "Tổng quan",
            icon: "dashboard",
            path: ROUTES.admin.overview,
          },
          {
            id: "recruitment",
            label: "Tuyển dụng",
            icon: "recruitment",
            path: ROUTES.admin.recruitment.open,
            children: [
              {
                id: "recruitment-open",
                label: "Mở đợt tuyển",
                path: ROUTES.admin.recruitment.open,
              },
              {
                id: "recruitment-applications",
                label: "Vòng hồ sơ",
                path: ROUTES.admin.recruitment.applications,
              },
              {
                id: "recruitment-interviews",
                label: "Vòng phỏng vấn",
                path: ROUTES.admin.recruitment.interviews,
              },
          {
            id: "recruitment-results",
            label: "Kết quả",
            path: ROUTES.admin.recruitment.results,
          },
            ],
          },
          // Members / Permissions / Email Configuration: MOCK FE — ẩn nav đến khi có API thật
          // Đào tạo thành viên mới (sau trúng tuyển) — không gộp vào Tuyển dụng
          {
            id: "training",
            label: "Đào tạo",
            icon: "training",
            path: ROUTES.admin.training.trainees,
            children: [
              {
                id: "training-trainees",
                label: "Danh sách tân binh",
                path: ROUTES.admin.training.trainees,
              },
              {
                id: "training-programs",
                label: "Lộ trình training",
                path: ROUTES.admin.training.programs,
              },
              {
                id: "training-teams",
                label: "Chia đội",
                path: ROUTES.admin.training.teams,
              },
              {
                id: "training-review",
                label: "Đánh giá tổng kết",
                path: ROUTES.admin.training.review,
              },
            ],
          },
          {
            id: "settings",
            label: "Cài đặt",
            icon: "settings",
            path: ROUTES.admin.settings,
          },
        ],
      },
      {
        id: "footer",
        items: [
          {
            id: "help",
            label: "Trợ giúp",
            icon: "help",
            path: ROUTES.admin.help,
          },
          {
            id: "logout",
            label: "Đăng xuất",
            icon: "logout",
            path: "#logout",
            action: "logout",
            tone: "danger",
          },
        ],
      },
    ],
  },

  leader: {
    brand: {
      initial: "L",
      title: "IU Club",
      subtitle: "Leader Console",
    },
    sections: [
      {
        id: "chinh",
        label: "CHÍNH",
        items: [
          {
            id: "overview",
            label: "Tổng quan",
            icon: "dashboard",
            path: ROUTES.leader.overview,
          },
          {
            id: "recruitment",
            label: "Tuyển dụng",
            icon: "recruitment",
            path: ROUTES.leader.recruitment.interviews,
            children: [
              {
                id: "recruitment-interviews",
                label: "Ca của tôi",
                path: ROUTES.leader.recruitment.interviews,
              },
            ],
          },
        ],
      },
      {
        id: "hoi-vien",
        label: "HỘI VIÊN",
        items: [
          {
            id: "training",
            label: "Đào tạo thành viên mới",
            icon: "training",
            path: ROUTES.leader.training.groups,
            children: [
              {
                id: "training-groups",
                label: "Quản lý nhóm",
                path: ROUTES.leader.training.groups,
              },
              {
                id: "training-tasks",
                label: "Task training",
                path: ROUTES.leader.training.tasks,
              },
              {
                id: "training-evaluation",
                label: "Đánh giá",
                path: ROUTES.leader.training.evaluation,
              },
            ],
          },
        ],
      },
      {
        id: "he-thong",
        label: "HỆ THỐNG",
        items: [
          {
            id: "settings",
            label: "Cài đặt",
            icon: "settings",
            path: ROUTES.leader.settings,
          },
        ],
      },
      {
        id: "footer",
        items: [
          {
            id: "help",
            label: "Trợ giúp",
            icon: "help",
            path: ROUTES.leader.help,
          },
          {
            id: "logout",
            label: "Đăng xuất",
            icon: "logout",
            path: "#logout",
            action: "logout",
            tone: "danger",
          },
        ],
      },
    ],
  },

  member: {
    brand: {
      initial: "M",
      title: "IU Club",
      subtitle: "Member Console",
    },
    sections: [
      {
        id: "main",
        items: [
          {
            id: "overview",
            label: "Tổng quan",
            icon: "dashboard",
            path: ROUTES.member.overview,
          },
          // Trang mentor — CHỈ hiện với member được đẩy quyền mentor
          {
            id: "mentor-roadmap",
            label: "Lộ trình mentor",
            icon: "roadmap",
            path: ROUTES.member.mentorRoadmap,
            mentorOnly: true,
          },
          {
            id: "mentor-tasks",
            label: "Task cho team",
            icon: "tasks",
            path: ROUTES.member.mentorTasks,
            mentorOnly: true,
          },
        ],
      },
      {
        id: "dao-tao",
        label: "ĐÀO TẠO THÀNH VIÊN MỚI",
        // Khu tự học của member thường — mentor dẫn team, không học khu này
        hideForMentor: true,
        items: [
          {
            id: "training-roadmap",
            label: "Lộ trình & nhóm",
            icon: "roadmap",
            path: ROUTES.member.training.roadmap,
          },
          {
            id: "training-tasks",
            label: "Task training",
            icon: "tasks",
            path: ROUTES.member.training.tasks,
          },
          {
            id: "training-progress",
            label: "Tiến độ & Trao đổi",
            icon: "progress",
            path: ROUTES.member.training.progress,
          },
        ],
      },
      {
        id: "he-thong",
        label: "HỆ THỐNG",
        items: [
          {
            id: "settings",
            label: "Cài đặt",
            icon: "settings",
            path: ROUTES.member.settings,
          },
        ],
      },
      {
        id: "footer",
        items: [
          {
            id: "help",
            label: "Trợ giúp",
            icon: "help",
            path: ROUTES.member.help,
          },
          {
            id: "logout",
            label: "Đăng xuất",
            icon: "logout",
            path: "#logout",
            action: "logout",
            tone: "danger",
          },
        ],
      },
    ],
  },
  // Ứng viên (candidate) — chỉ đặt lịch PV + xem hồ sơ
  candidate: {
    brand: { initial: "U", title: "IU Club", subtitle: "Ứng viên" },
    sections: [
      {
        id: "main",
        items: [
          {
            id: "interview",
            label: "Lịch phỏng vấn",
            icon: "events",
            path: ROUTES.candidate.interview,
          },
          {
            id: "profile",
            label: "Hồ sơ của tôi",
            icon: "profile",
            path: ROUTES.candidate.profile,
          },
        ],
      },
      {
        id: "footer",
        items: [
          {
            id: "logout",
            label: "Đăng xuất",
            icon: "logout",
            path: "#logout",
            action: "logout",
            tone: "danger",
          },
        ],
      },
    ],
  },
};

/** Path mặc định khi vào portal theo role */
export function getDefaultPath(role: Role): string {
  const first = SIDEBAR_CONFIG[role].sections[0]?.items[0];
  return first?.children?.[0]?.path ?? first?.path ?? "/";
}

/** Tìm nav item/child theo path (dùng cho highlight sidebar) */
export function findNavIdByPath(role: Role, path: string): string {
  for (const section of SIDEBAR_CONFIG[role].sections) {
    for (const item of section.items) {
      if (item.children) {
        // Exact trước, sau đó prefix (vd. /applications/app-1)
        const exact = item.children.find((c) => c.path === path);
        if (exact) return exact.id;
        const nested = item.children.find(
          (c) => path.startsWith(`${c.path}/`) && c.path !== "/",
        );
        if (nested) return nested.id;
      }
      if (item.path === path) return item.id;
      if (path.startsWith(`${item.path}/`) && item.path !== "/") return item.id;
    }
  }
  return SIDEBAR_CONFIG[role].sections[0]?.items[0]?.id ?? "";
}
