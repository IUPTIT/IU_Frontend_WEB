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
    departments: "/admin/departments",
    departmentDetail: (id: string) => `/admin/departments/${id}`,
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
    members: "/leader/members",
    recruitment: {
      interviews: "/leader/recruitment/interviews",
      interviewSlot: (slotId: string) =>
        `/leader/recruitment/interviews/slots/${slotId}`,
      interviewNote: (bookingId: string) =>
        `/leader/recruitment/interviews/notes/${bookingId}`,
    },
    training: {
      programs: "/leader/training/programs",
      groups: "/leader/training/groups",
      tasks: "/leader/training/tasks",
      evaluation: "/leader/training/evaluation",
      myRoadmap: "/leader/training/my-roadmap",
      myTasks: "/leader/training/my-tasks",
    },
    settings: "/leader/settings",
    help: "/leader/help",
  },
  candidate: {
    interview: "/candidate/interview",
    training: "/candidate/training",
    trainingRoadmap: "/candidate/training/roadmap",
    trainingTasks: "/candidate/training/tasks",
    trainingTaskDetail: (id: string) => `/candidate/training/tasks/${id}`,
    trainingProgress: "/candidate/training/progress",
    profile: "/candidate/profile",
  },
  member: {
    overview: "/member",
    recruitment: {
      interviews: "/member/recruitment/interviews",
      interviewSlot: (slotId: string) =>
        `/member/recruitment/interviews/slots/${slotId}`,
      interviewNote: (bookingId: string) =>
        `/member/recruitment/interviews/notes/${bookingId}`,
    },
    mentorRoadmap: "/member/mentor/roadmap",
    mentorTasks: "/member/mentor/tasks",
    training: {
      roadmap: "/member/training/roadmap",
      tasks: "/member/training/tasks",
      taskDetail: (id: string) => `/member/training/tasks/${id}`,
      progress: "/member/training/progress",
    },
    settings: "/member/settings",
    help: "/member/help",
  },
} as const;
