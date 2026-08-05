/** Route path theo menu 3 role — khớp SIDEBAR_CONFIG */

export const ROUTES = {
  admin: {
    overview: "/admin",
    recruitment: {
      open: "/admin/recruitment/open",
      applications: "/admin/recruitment/applications",
      applicationDetail: (id: string) =>
        `/admin/recruitment/applications/${id}`,
      interviews: "/admin/recruitment/interviews",
      interviewSlot: (slotId: string) =>
        `/admin/recruitment/interviews/slots/${slotId}`,
      interviewNote: (bookingId: string) =>
        `/admin/recruitment/interviews/notes/${bookingId}`,
      results: "/admin/recruitment/results",
    },
    members: "/admin/members",
    training: {
      trainees: "/admin/training/trainees",
      programs: "/admin/training/programs",
      teams: "/admin/training/teams",
      review: "/admin/training/review",
    },
    clubTraining: "/admin/club-training",
    settings: "/admin/settings",
    email: "/admin/settings/email",
    permissions: "/admin/permissions",
    help: "/admin/help",
  },
  leader: {
    overview: "/leader",
    recruitment: {
      interviews: "/leader/recruitment/interviews",
      interviewSlot: (slotId: string) =>
        `/leader/recruitment/interviews/slots/${slotId}`,
      interviewNote: (bookingId: string) =>
        `/leader/recruitment/interviews/notes/${bookingId}`,
    },
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
    training: "/candidate/training",
    profile: "/candidate/profile",
  },
  member: {
    overview: "/member",
    mentorRoadmap: "/member/mentor/roadmap",
    mentorTasks: "/member/mentor/tasks",
    training: {
      roadmap: "/member/training/roadmap",
      tasks: "/member/training/tasks",
      progress: "/member/training/progress",
    },
    settings: "/member/settings",
    help: "/member/help",
  },
} as const;
