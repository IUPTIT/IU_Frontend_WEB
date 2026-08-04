/** Route path theo menu 3 role — khớp SIDEBAR_CONFIG */

export const ROUTES = {
  admin: {
    overview: "/admin",
    recruitment: {
      open: "/admin/recruitment/open",
      applications: "/admin/recruitment/applications",
      applicationDetail: (id: string) => `/admin/recruitment/applications/${id}`,
      interviews: "/admin/recruitment/interviews",
      interviewSlot: (slotId: string) => `/admin/recruitment/interviews/slots/${slotId}`,
      interviewNote: (bookingId: string) => `/admin/recruitment/interviews/notes/${bookingId}`,
      results: "/admin/recruitment/results",
    },
    members: "/admin/members",
    training: {
      roadmap: "/admin/training/roadmap",
      teams: "/admin/training/teams",
      review: "/admin/training/review",
    },
    settings: "/admin/settings",
    email: "/admin/settings/email",
    permissions: "/admin/permissions",
    help: "/admin/help",
  },
  leader: {
    overview: "/leader",
    training: {
      groups: "/leader/training/groups",
      tasks: "/leader/training/tasks",
      evaluation: "/leader/training/evaluation",
    },
    settings: "/leader/settings",
    help: "/leader/help",
  },
  candidate: {
    interview: "/candidate/interview",
    profile: "/candidate/profile",
  },
  member: {
    overview: "/member",
    training: {
      roadmap: "/member/training/roadmap",
      tasks: "/member/training/tasks",
      progress: "/member/training/progress",
    },
    settings: "/member/settings",
    help: "/member/help",
  },
} as const;
