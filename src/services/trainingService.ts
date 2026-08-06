// Training (Đào tạo thành viên mới) — programs / teams / tasks / progress / chat
import { api } from "../api/client";
import type {
  PenaltyActionType,
  Trainee,
  TrainingChatMessage,
  TrainingGroup,
  TrainingMentor,
  TrainingProgram,
  TrainingProgress,
  TrainingTask,
  TrainingTaskSubmission,
} from "../types/training";

// ---- Kiểu backend ----

type BackendTrainee = {
  _id: string;
  userId: string;
  fullName: string;
  email: string;
  department: string;
  campaignId: string | null;
  status: Trainee["status"];
  evalStatus: NonNullable<Trainee["evalStatus"]>;
  mentorScore?: number | null;
  mentorNote?: string;
  mentorReviewStatus?: "draft" | "submitted";
  mentorReviewSubmittedAt?: string | null;
  groupId: {
    _id: string;
    name: string;
    mentorId: { _id: string; name: string } | null;
  } | null;
  cohortLabel: string;
  certificateCode?: string;
  certificateIssuedAt?: string | null;
  extendedOnce?: boolean;
};

type BackendStage = {
  stageId: string;
  name: string;
  order: number;
  weekLabel?: string;
  durationWeeks?: number | null;
};

type BackendLesson = {
  lessonId: string;
  stageId: string;
  title: string;
  content?: string;
  attachmentUrl?: string;
  kind?: TrainingProgram["lessons"][number]["kind"] | null;
  durationLabel?: string;
};

type BackendProgram = {
  _id: string;
  name: string;
  department: string;
  passThresholdPercent?: number;
  stages: BackendStage[];
  lessons: BackendLesson[];
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
};

type BackendGroup = {
  _id: string;
  name: string;
  programId: string;
  department: string;
  specialtyLabel: string;
  mentorId: { _id: string; name: string } | null;
  memberIds: string[];
  mentorAccepted: boolean;
};

// ---- Map backend → UI (departmentId = departmentName = tên ban) ----

function toTrainee(t: BackendTrainee): Trainee {
  return {
    id: t._id,
    userId: t.userId,
    fullName: t.fullName,
    email: t.email,
    departmentId: t.department,
    departmentName: t.department,
    campaignId: t.campaignId ?? "",
    status: t.status,
    groupId: t.groupId?._id,
    mentorId: t.groupId?.mentorId?._id,
    mentorName: t.groupId?.mentorId?.name,
    evalStatus: t.evalStatus,
    avgScore: t.mentorScore ?? undefined,
    mentorNote: t.mentorNote || undefined,
    mentorReviewStatus: t.mentorReviewStatus ?? "draft",
    mentorReviewSubmittedAt: t.mentorReviewSubmittedAt ?? undefined,
    cohortLabel: t.cohortLabel || undefined,
    certificateCode: t.certificateCode || undefined,
    certificateIssuedAt: t.certificateIssuedAt ?? undefined,
    extendedOnce: t.extendedOnce ?? false,
  };
}

function toProgram(p: BackendProgram): TrainingProgram {
  return {
    id: p._id,
    name: p.name,
    departmentId: p.department,
    departmentName: p.department,
    createdById: p.createdBy != null ? String(p.createdBy) : undefined,
    passThresholdPercent: p.passThresholdPercent ?? 80,
    stages: p.stages.map((s) => ({
      id: s.stageId,
      name: s.name,
      order: s.order,
      weekLabel: s.weekLabel || undefined,
      durationWeeks: s.durationWeeks ?? undefined,
    })),
    lessons: p.lessons.map((l) => ({
      id: l.lessonId,
      stageId: l.stageId,
      title: l.title,
      content: l.content || undefined,
      attachmentUrl: l.attachmentUrl || undefined,
      kind: l.kind ?? undefined,
      durationLabel: l.durationLabel || undefined,
    })),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

function toGroup(g: BackendGroup): TrainingGroup {
  return {
    id: g._id,
    name: g.name,
    programId: g.programId,
    departmentId: g.department,
    departmentName: g.department,
    specialtyLabel: g.specialtyLabel || undefined,
    memberIds: g.memberIds,
    mentorId: g.mentorId?._id,
    mentorName: g.mentorId?.name,
    mentorAccepted: g.mentorAccepted,
  };
}

// ---- Vòng training của tôi (candidate/trainee) ----

// /training/me trả trainee thô (groupId chưa populate) — khác BackendTrainee của /trainees
type BackendMyTrainee = Omit<BackendTrainee, "groupId"> & {
  groupId: string | null;
};

type BackendMyGroup = Omit<BackendGroup, "mentorId" | "programId"> & {
  mentorId: { _id: string; name: string; email?: string } | null;
  programId: string | null;
};

export type MyTraining = {
  trainee: Trainee;
  group: TrainingGroup | null;
  program: TrainingProgram | null;
};

/** Trainee xem team/mentor/lộ trình của chính mình — null nếu chưa vào vòng training */
export async function getMyTraining(): Promise<MyTraining | null> {
  try {
    const { trainee, group, program } = await api.get<{
      trainee: BackendMyTrainee;
      group: BackendMyGroup | null;
      program: BackendProgram | null;
    }>("/training/me");
    return {
      trainee: {
        id: trainee._id,
        userId: trainee.userId,
        fullName: trainee.fullName,
        email: trainee.email,
        departmentId: trainee.department,
        departmentName: trainee.department,
        campaignId: trainee.campaignId ?? "",
        status: trainee.status,
        groupId: trainee.groupId ?? undefined,
        mentorId: group?.mentorId?._id,
        mentorName: group?.mentorId?.name,
        avgScore: trainee.mentorScore ?? undefined,
        mentorNote: trainee.mentorNote || undefined,
        mentorReviewStatus: trainee.mentorReviewStatus,
        evalStatus: trainee.evalStatus,
        cohortLabel: trainee.cohortLabel || undefined,
        certificateCode: trainee.certificateCode || undefined,
        certificateIssuedAt: trainee.certificateIssuedAt ?? undefined,
      },
      group: group
        ? {
            id: group._id,
            name: group.name,
            programId: group.programId ?? "",
            departmentId: group.department,
            departmentName: group.department,
            specialtyLabel: group.specialtyLabel || undefined,
            memberIds: group.memberIds,
            mentorId: group.mentorId?._id,
            mentorName: group.mentorId?.name,
            mentorAccepted: group.mentorAccepted,
          }
        : null,
      program: program ? toProgram(program) : null,
    };
  } catch {
    return null; // 404 = chưa ở vòng training
  }
}

// ---- Task mentor giao (trainee) ----

type BackendTaskAssignment = {
  traineeId: string | { _id: string };
  status: "assigned" | "submitted" | "approved" | "rejected";
  submissionUrl: string;
  submissionNote: string;
  submittedAt: string | null;
  feedback: string;
  score: number | null;
  reviewedAt?: string | null;
  workStartedAt?: string | null;
  progressLogs?: { content: string; createdAt: string }[];
};

type BackendMentorTask = {
  _id: string;
  groupId: { _id: string; name: string } | string;
  title: string;
  description: string;
  attachmentUrl: string;
  deadline: string | null;
  assignments: BackendTaskAssignment[];
  createdAt: string;
};

export type MyMentorTask = {
  id: string;
  title: string;
  description?: string;
  attachmentUrl?: string;
  deadline?: string;
  groupName?: string;
  status: BackendTaskAssignment["status"];
  submissionUrl?: string;
  submissionNote?: string;
  submittedAt?: string;
  feedback?: string;
  score?: number;
  reviewedAt?: string;
  workStartedAt?: string;
  progressLogs: { content: string; createdAt: string }[];
};

function assignmentTraineeId(a: BackendTaskAssignment): string {
  return typeof a.traineeId === "string" ? a.traineeId : a.traineeId._id;
}

/** Task mentor giao cho tôi (kèm trạng thái nộp/chấm của chính mình) */
export async function getMyMentorTasks(
  myTraineeId: string,
): Promise<MyMentorTask[]> {
  const { tasks } = await api.get<{ tasks: BackendMentorTask[] }>(
    "/training/tasks/mine",
  );
  return tasks.map((t) => {
    const mine = t.assignments.find(
      (a) => assignmentTraineeId(a) === myTraineeId,
    );
    return {
      id: t._id,
      title: t.title,
      description: t.description || undefined,
      attachmentUrl: t.attachmentUrl || undefined,
      deadline: t.deadline ?? undefined,
      groupName: typeof t.groupId === "string" ? undefined : t.groupId?.name,
      status: mine?.status ?? "assigned",
      submissionUrl: mine?.submissionUrl || undefined,
      submissionNote: mine?.submissionNote || undefined,
      submittedAt: mine?.submittedAt ?? undefined,
      feedback: mine?.feedback || undefined,
      score: mine?.score ?? undefined,
      reviewedAt: mine?.reviewedAt ?? undefined,
      workStartedAt: mine?.workStartedAt ?? undefined,
      progressLogs: (mine?.progressLogs ?? []).map((l) => ({
        content: l.content,
        createdAt: l.createdAt,
      })),
    };
  });
}

/** Nộp bài cho task mentor giao */
export async function submitMentorTask(
  taskId: string,
  input: { submissionUrl?: string; submissionNote?: string },
): Promise<void> {
  await api.post(`/training/tasks/${taskId}/submit`, input);
}

/** Tân binh ghi nhật ký tiến độ (trước khi nộp chính thức) */
export async function addTaskProgressLog(
  taskId: string,
  content: string,
): Promise<void> {
  await api.post(`/training/tasks/${taskId}/progress-log`, { content });
}

// ---- Task mentor giao (phía mentor: giao / xem bài nộp / chấm) ----

type BackendMentorSideAssignment = Omit<BackendTaskAssignment, "traineeId"> & {
  traineeId:
    | { _id: string; fullName: string; email: string; department: string }
    | string;
};

type BackendMentorSideTask = Omit<BackendMentorTask, "assignments"> & {
  assignments: BackendMentorSideAssignment[];
};

export type MentorTaskAssignment = {
  traineeId: string;
  traineeName: string;
  traineeEmail?: string;
  status: BackendTaskAssignment["status"];
  submissionUrl?: string;
  submissionNote?: string;
  submittedAt?: string;
  feedback?: string;
  score?: number;
};

export type MentorTask = {
  id: string;
  groupId?: string;
  groupName?: string;
  title: string;
  description?: string;
  attachmentUrl?: string;
  deadline?: string;
  createdAt: string;
  assignments: MentorTaskAssignment[];
};

function toMentorTask(t: BackendMentorSideTask): MentorTask {
  return {
    id: t._id,
    groupId: typeof t.groupId === "string" ? t.groupId : t.groupId?._id,
    groupName: typeof t.groupId === "string" ? undefined : t.groupId?.name,
    title: t.title,
    description: t.description || undefined,
    attachmentUrl: t.attachmentUrl || undefined,
    deadline: t.deadline ?? undefined,
    createdAt: t.createdAt,
    assignments: t.assignments.map((a) => ({
      traineeId:
        typeof a.traineeId === "string" ? a.traineeId : a.traineeId._id,
      traineeName:
        typeof a.traineeId === "string" ? "Tân binh" : a.traineeId.fullName,
      traineeEmail:
        typeof a.traineeId === "string" ? undefined : a.traineeId.email,
      status: a.status,
      submissionUrl: a.submissionUrl || undefined,
      submissionNote: a.submissionNote || undefined,
      submittedAt: a.submittedAt ?? undefined,
      feedback: a.feedback || undefined,
      score: a.score ?? undefined,
    })),
  };
}

/** Task của các team mình dẫn (mentor) hoặc theo team (BCN/Leader) */
export async function getMentorTasks(groupId?: string): Promise<MentorTask[]> {
  const query = groupId ? `?groupId=${encodeURIComponent(groupId)}` : "";
  const { tasks } = await api.get<{ tasks: BackendMentorSideTask[] }>(
    `/training/tasks${query}`,
  );
  return tasks.map(toMentorTask);
}

/** Mentor giao task cho team (bỏ trống assigneeIds = cả team) */
export async function createMentorTask(input: {
  groupId: string;
  title: string;
  description?: string;
  attachmentUrl?: string;
  deadline?: string;
  assigneeIds?: string[];
}): Promise<void> {
  await api.post("/training/tasks", {
    groupId: input.groupId,
    title: input.title,
    description: input.description ?? "",
    attachmentUrl: input.attachmentUrl ?? "",
    deadline: input.deadline ?? null,
    ...(input.assigneeIds?.length ? { assigneeIds: input.assigneeIds } : {}),
  });
}

/** Mentor chấm bài nộp của một trainee trong task */
export async function reviewMentorTask(
  taskId: string,
  traineeId: string,
  input: { status: "approved" | "rejected"; feedback?: string; score?: number },
): Promise<void> {
  await api.patch(`/training/tasks/${taskId}/review/${traineeId}`, {
    status: input.status,
    feedback: input.feedback ?? "",
    score: input.score ?? null,
  });
}

/** Tân binh trong các team mình dẫn (mentor) — để đánh giá cuối vòng training */
export async function getMyTeamTrainees(): Promise<Trainee[]> {
  const { trainees } = await api.get<{ trainees: BackendTrainee[] }>(
    "/training/my-team",
  );
  return trainees.map(toTrainee);
}

// ---- Trainees / Mentors ----

export async function getTrainees(
  departmentId?: string,
  campaignId?: string,
): Promise<Trainee[]> {
  const params = new URLSearchParams();
  if (departmentId) params.set("department", departmentId);
  if (campaignId) params.set("campaignId", campaignId);
  const qs = params.toString();
  const { trainees } = await api.get<{ trainees: BackendTrainee[] }>(
    `/training/trainees${qs ? `?${qs}` : ""}`,
  );
  return trainees.map(toTrainee);
}

/** Mentor tiềm năng = member/leader đang hoạt động — không gắn ban cụ thể nên bỏ qua tham số lọc ban */
export async function getMentors(): Promise<TrainingMentor[]> {
  const { mentors } = await api.get<{
    mentors: { _id: string; name: string; role: string }[];
  }>("/training/mentors");
  return mentors.map((m) => ({
    id: m._id,
    name: m.name,
    roleLabel: m.role === "leader" ? "Leader" : "Member",
    departmentId: "",
  }));
}

export type MentorCandidate = {
  id: string;
  name: string;
  email: string;
  roleLabel: string;
  isMentor: boolean;
};

/** Toàn bộ member/leader active kèm cờ mentor — cho BCN đẩy/gỡ quyền */
export async function getMentorCandidates(): Promise<MentorCandidate[]> {
  const { candidates } = await api.get<{
    candidates: {
      _id: string;
      name: string;
      email: string;
      role: string;
      isMentor?: boolean;
    }[];
  }>("/training/mentor-candidates");
  return candidates.map((c) => ({
    id: c._id,
    name: c.name,
    email: c.email,
    roleLabel: c.role === "leader" ? "Leader" : "Member",
    isMentor: c.isMentor ?? false,
  }));
}

/** Đẩy / gỡ quyền mentor cho member */
export async function setMentorFlag(
  userId: string,
  isMentor: boolean,
): Promise<void> {
  await api.patch(`/training/mentors/${userId}`, { isMentor });
}

/** Tự động chia nhóm — BE chưa có; báo rõ thay vì gọi 404 */
export async function autoAssignTeams(
  _fallbackProgramId?: string,
  _campaignId?: string,
): Promise<{ assigned: number; mentors: number; groups: unknown[] }> {
  throw new Error(
    "Chức năng tự động chia nhóm chưa được bật — hãy tạo nhóm thủ công tại Quản lý nhóm.",
  );
}

// ---- Programs ----

export async function getTrainingPrograms(): Promise<TrainingProgram[]> {
  const { programs } = await api.get<{ programs: BackendProgram[] }>(
    "/training/programs",
  );
  return programs.map(toProgram);
}

/** Xóa lộ trình (mentor xóa của mình, BCN/Leader xóa tất cả) — team đang dùng được gỡ về null */
export async function deleteTrainingProgram(id: string): Promise<void> {
  await api.delete(`/training/programs/${id}`);
}

export async function getTrainingProgramById(
  id: string,
): Promise<TrainingProgram | undefined> {
  const { program } = await api.get<{ program: BackendProgram }>(
    `/training/programs/${id}`,
  );
  return toProgram(program);
}

export type SaveProgramInput = {
  name: string;
  departmentId: string;
  departmentName: string;
  passThresholdPercent?: number;
  stages: TrainingProgram["stages"];
  lessons: TrainingProgram["lessons"];
};

export async function createTrainingProgram(
  input: SaveProgramInput,
): Promise<TrainingProgram> {
  const { program } = await api.post<{ program: BackendProgram }>(
    "/training/programs",
    {
      name: input.name,
      department: input.departmentName || input.departmentId,
      passThresholdPercent: input.passThresholdPercent ?? 80,
      stages: input.stages.map((s) => ({
        stageId: s.id,
        name: s.name,
        order: s.order,
        weekLabel: s.weekLabel ?? "",
        durationWeeks: s.durationWeeks ?? null,
      })),
      lessons: input.lessons.map((l) => ({
        lessonId: l.id,
        stageId: l.stageId,
        title: l.title,
        content: l.content ?? "",
        attachmentUrl: l.attachmentUrl ?? "",
        kind: l.kind ?? null,
        durationLabel: l.durationLabel ?? "",
      })),
    },
  );
  return toProgram(program);
}

export async function updateTrainingProgram(
  id: string,
  input: SaveProgramInput,
): Promise<TrainingProgram> {
  const { program } = await api.patch<{ program: BackendProgram }>(
    `/training/programs/${id}`,
    {
      name: input.name,
      department: input.departmentName || input.departmentId,
      passThresholdPercent: input.passThresholdPercent ?? 80,
      stages: input.stages.map((s) => ({
        stageId: s.id,
        name: s.name,
        order: s.order,
        weekLabel: s.weekLabel ?? "",
        durationWeeks: s.durationWeeks ?? null,
      })),
      lessons: input.lessons.map((l) => ({
        lessonId: l.id,
        stageId: l.stageId,
        title: l.title,
        content: l.content ?? "",
        attachmentUrl: l.attachmentUrl ?? "",
        kind: l.kind ?? null,
        durationLabel: l.durationLabel ?? "",
      })),
    },
  );
  return toProgram(program);
}

// ---- Groups ----

export async function getTrainingGroups(
  campaignId?: string,
): Promise<TrainingGroup[]> {
  const query = campaignId
    ? `?campaignId=${encodeURIComponent(campaignId)}`
    : "";
  const { groups } = await api.get<{ groups: BackendGroup[] }>(
    `/training/groups${query}`,
  );
  return groups.map(toGroup);
}

export async function getTrainingGroupById(
  id: string,
): Promise<TrainingGroup | undefined> {
  const groups = await getTrainingGroups();
  return groups.find((g) => g.id === id);
}

export type CreateGroupInput = {
  name: string;
  programId: string;
  departmentId: string;
  departmentName: string;
  specialtyLabel?: string;
  mentorId?: string;
  mentorName?: string;
  memberIds: string[];
};

export async function createTrainingGroup(
  input: CreateGroupInput,
): Promise<TrainingGroup> {
  const { group } = await api.post<{ group: BackendGroup }>(
    "/training/groups",
    {
      name: input.name,
      programId: input.programId,
      department: input.departmentName || input.departmentId,
      specialtyLabel: input.specialtyLabel ?? "",
      mentorId: input.mentorId || null,
      memberIds: input.memberIds,
    },
  );
  return toGroup(group);
}

export async function updateTrainingGroup(
  id: string,
  input: Partial<{
    name: string;
    programId: string | null;
    department: string;
    specialtyLabel: string;
    mentorId: string | null;
    memberIds: string[];
  }>,
): Promise<TrainingGroup> {
  const { group } = await api.patch<{ group: BackendGroup }>(
    `/training/groups/${id}`,
    input,
  );
  return toGroup(group);
}

export async function deleteTrainingGroup(id: string): Promise<void> {
  await api.delete(`/training/groups/${id}`);
}

// ---- Đánh giá tổng kết ----

export type TrainingReviewSummary = {
  totalTrainees: number;
  completionRate: number;
  needsAction: number;
};

export async function getTrainingReviewSummary(
  campaignId?: string,
): Promise<TrainingReviewSummary> {
  const query = campaignId
    ? `?campaignId=${encodeURIComponent(campaignId)}`
    : "";
  const { summary } = await api.get<{ summary: TrainingReviewSummary }>(
    `/training/review-summary${query}`,
  );
  return summary;
}

/** Mentor lưu đánh giá quá trình (note + điểm): submit=false lưu nháp, true gửi lên BCN */
export async function saveMentorTraineeReview(
  traineeId: string,
  input: { score?: number | null; note?: string; submit?: boolean },
): Promise<void> {
  await api.patch(`/training/trainees/${traineeId}/mentor-review`, input);
}

export async function confirmTrainingCompletion(
  traineeId: string,
  note?: string,
): Promise<void> {
  await api.post(`/training/trainees/${traineeId}/confirm-completion`, {
    note: note ?? "",
  });
}

export async function setTraineeEvalStatus(
  traineeId: string,
  evalStatus: NonNullable<Trainee["evalStatus"]>,
): Promise<void> {
  await api.patch(`/training/trainees/${traineeId}/eval`, { evalStatus });
}

export async function issueCertificates(
  traineeIds: string[],
): Promise<{ issued: number }> {
  return api.post<{ issued: number }>("/training/certificates", { traineeIds });
}

export async function handleIncompleteTrainee(
  traineeId: string,
  input: { action: PenaltyActionType; reason: string },
): Promise<void> {
  await api.post(`/training/trainees/${traineeId}/incomplete-action`, input);
}

export async function notifyTrainingGroups(
  groupIds: string[],
): Promise<{ sent: number }> {
  return api.post<{ sent: number }>("/training/groups/notify", { groupIds });
}

/** Cập nhật deadline / nội dung task (Leader UC #2) */
export async function updateMentorTask(
  taskId: string,
  input: {
    title?: string;
    description?: string;
    attachmentUrl?: string;
    deadline?: string | null;
  },
): Promise<void> {
  await api.patch(`/training/tasks/${taskId}`, input);
}

// ---- Tasks / submissions / progress (API thật) ----

export async function getTrainingTasks(
  groupId?: string,
): Promise<TrainingTask[]> {
  const tasks = await getMentorTasks(groupId);
  return tasks.map((t) => ({
    id: t.id,
    groupId: t.groupId ?? "",
    title: t.title,
    description: t.description ?? "",
    assigneeIds: t.assignments.map((a) => a.traineeId),
    attachmentUrl: t.attachmentUrl,
    deadline: t.deadline ?? "",
    createdBy: "",
    createdAt: t.createdAt,
  }));
}

export async function getTaskSubmissions(
  taskId?: string,
): Promise<TrainingTaskSubmission[]> {
  const tasks = await getMentorTasks();
  const list = taskId ? tasks.filter((t) => t.id === taskId) : tasks;
  return list.flatMap((t) =>
    t.assignments
      .filter((a) => a.status !== "assigned")
      .map((a) => ({
        id: `${t.id}-${a.traineeId}`,
        taskId: t.id,
        traineeId: a.traineeId,
        linkUrl: a.submissionUrl,
        note: a.submissionNote,
        submittedAt: a.submittedAt ?? "",
        score: a.score,
        feedback: a.feedback,
        status:
          a.status === "approved"
            ? ("graded" as const)
            : a.status === "rejected"
              ? ("todo" as const)
              : ("submitted" as const),
      })),
  );
}

export async function getMyTrainingProgress(
  _traineeId?: string,
): Promise<TrainingProgress> {
  const { progress } = await api.get<{
    progress: TrainingProgress & { submittedOrDone?: number };
  }>("/training/me/progress");
  return {
    traineeId: progress.traineeId,
    percentComplete: progress.percentComplete,
    completedTasks: progress.completedTasks,
    totalTasks: progress.totalTasks,
  };
}

// ---- Chat nhóm training ----

type BackendMessage = {
  _id: string;
  groupId: string;
  content: string;
  createdAt: string;
  senderId: { _id: string; name: string; role?: string } | string;
};

export async function getGroupMessages(
  groupId: string,
): Promise<TrainingChatMessage[]> {
  const { messages } = await api.get<{ messages: BackendMessage[] }>(
    `/training/groups/${groupId}/messages`,
  );
  return messages
    .map((m) => ({
      id: m._id,
      groupId: m.groupId,
      senderId: typeof m.senderId === "string" ? m.senderId : m.senderId._id,
      senderName:
        typeof m.senderId === "string" ? "Thành viên" : m.senderId.name,
      content: m.content,
      createdAt: m.createdAt,
    }))
    .reverse();
}

export async function sendGroupMessage(
  groupId: string,
  content: string,
): Promise<TrainingChatMessage> {
  const { message } = await api.post<{ message: BackendMessage }>(
    `/training/groups/${groupId}/messages`,
    { content },
  );
  return {
    id: message._id,
    groupId: message.groupId,
    senderId:
      typeof message.senderId === "string"
        ? message.senderId
        : message.senderId._id,
    senderName:
      typeof message.senderId === "string"
        ? "Thành viên"
        : message.senderId.name,
    content: message.content,
    createdAt: message.createdAt,
  };
}
