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
              {
                id: "training-trainees",
                label: "Tân binh training",
                path: ROUTES.admin.training.trainees,
              },
              {
                id: "training-teams",
                label: "Chia đội & phân Mentor",
                path: ROUTES.admin.training.teams,
              },
              {
                id: "training-review",
                label: "Đánh giá training",
                path: ROUTES.admin.training.review,
              },
            ],
          },
          {
            id: "members",
            label: "Quản lý thành viên",
            icon: "members",
            path: ROUTES.admin.members,
          },
          {
            id: "departments",
            label: "Quản lý Ban",
            icon: "members",
            path: ROUTES.admin.departments,
          },
          {
            id: "permissions",
            label: "Phân quyền",
            icon: "permissions",
            path: ROUTES.admin.permissions,
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
            id: "department-members",
            label: "Thành viên Ban",
            icon: "members",
            path: ROUTES.leader.members,
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
          {
            id: "mentor-training",
            label: "Đào tạo (Mentor)",
            icon: "training",
            path: ROUTES.leader.training.programs,
            mentorOnly: true,
            children: [
              {
                id: "training-programs",
                label: "Tạo lộ trình training",
                path: ROUTES.leader.training.programs,
                mentorOnly: true,
              },
              {
                id: "training-groups",
                label: "Nhóm training phụ trách",
                path: ROUTES.leader.training.groups,
                mentorOnly: true,
              },
              {
                id: "training-tasks",
                label: "Task training",
                path: ROUTES.leader.training.tasks,
                mentorOnly: true,
              },
              {
                id: "training-evaluation",
                label: "Đánh giá tổng kết",
                path: ROUTES.leader.training.evaluation,
                mentorOnly: true,
              },
            ],
          },
          {
            id: "member-workspace",
            label: "Không gian Member",
            icon: "roadmap",
            path: ROUTES.leader.training.myRoadmap,
            dualMemberOnly: true,
            children: [
              {
                id: "my-member-roadmap",
                label: "Lộ trình của tôi",
                path: ROUTES.leader.training.myRoadmap,
                dualMemberOnly: true,
              },
              {
                id: "my-member-tasks",
                label: "Task của tôi",
                path: ROUTES.leader.training.myTasks,
                dualMemberOnly: true,
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
          {
            id: "recruitment-interviews",
            label: "Ca phỏng vấn của tôi",
            icon: "recruitment",
            path: ROUTES.member.recruitment.interviews,
          },
        ],
      },
      {
        id: "mentor",
        label: "MENTOR TRAINING",
        items: [
          {
            id: "mentor-roadmap",
            label: "Lộ trình phụ trách",
            icon: "roadmap",
            path: ROUTES.member.mentorRoadmap,
            mentorOnly: true,
          },
          {
            id: "mentor-tasks",
            label: "Nhóm & task phụ trách",
            icon: "tasks",
            path: ROUTES.member.mentorTasks,
            mentorOnly: true,
          },
        ],
      },
      {
        id: "dao-tao",
        label: "ĐÀO TẠO THÀNH VIÊN MỚI",
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
            label: "Tiến độ & Kết quả",
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
  // Ứng viên + Tân binh (candidate) — lịch PV, training, hồ sơ
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
            id: "training",
            label: "Đào tạo tân binh",
            icon: "training",
            path: ROUTES.candidate.training,
            children: [
              {
                id: "training-hub",
                label: "Training của tôi",
                path: ROUTES.candidate.training,
              },
              {
                id: "training-roadmap",
                label: "Lộ trình",
                path: ROUTES.candidate.trainingRoadmap,
              },
              {
                id: "training-tasks",
                label: "Nhiệm vụ & Bài tập",
                path: ROUTES.candidate.trainingTasks,
              },
              {
                id: "training-progress",
                label: "Tiến độ & Kết quả",
                path: ROUTES.candidate.trainingProgress,
              },
            ],
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
        const exact = item.children.find((c) => c.path === path);
        if (exact) return exact.id;
        // Ưu tiên prefix dài nhất (tránh /training khớp trước /training/tasks/…)
        let best: { id: string; len: number } | null = null;
        for (const c of item.children) {
          if (c.path === "/" || !path.startsWith(`${c.path}/`)) continue;
          if (!best || c.path.length > best.len) {
            best = { id: c.id, len: c.path.length };
          }
        }
        if (best) return best.id;
      }
      if (item.path === path) return item.id;
      if (path.startsWith(`${item.path}/`) && item.path !== "/") return item.id;
    }
  }
  return SIDEBAR_CONFIG[role].sections[0]?.items[0]?.id ?? "";
}
