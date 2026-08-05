// Training (Đào tạo) — programs/teams/trainees gọi API thật (/api/v1/training).
// Phần tasks/submissions/progress (portal Leader & Member) backend CHƯA có
// endpoint — vẫn dùng mock, sẽ nối API ở PR sau.
import { api } from "../api/client";
import type {
  Trainee,
  TrainingGroup,
  TrainingMentor,
  TrainingProgram,
  TrainingProgress,
  TrainingTask,
  TrainingTaskSubmission,
} from "../types/training";
import {
  mockTaskSubmissions,
  mockTrainingProgress,
  mockTrainingTasks,
} from "../mocks/training.mock";

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
  groupId: {
    _id: string;
    name: string;
    mentorId: { _id: string; name: string } | null;
  } | null;
  cohortLabel: string;
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
    cohortLabel: t.cohortLabel || undefined,
  };
}

function toProgram(p: BackendProgram): TrainingProgram {
  return {
    id: p._id,
    name: p.name,
    departmentId: p.department,
    departmentName: p.department,
    createdById: p.createdBy ?? undefined,
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
        evalStatus: trainee.evalStatus,
        cohortLabel: trainee.cohortLabel || undefined,
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
}): Promise<void> {
  await api.post("/training/tasks", {
    groupId: input.groupId,
    title: input.title,
    description: input.description ?? "",
    attachmentUrl: input.attachmentUrl ?? "",
    deadline: input.deadline ?? null,
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

// ---- Trainees / Mentors ----

export async function getTrainees(departmentId?: string): Promise<Trainee[]> {
  const query = departmentId
    ? `?department=${encodeURIComponent(departmentId)}`
    : "";
  const { trainees } = await api.get<{ trainees: BackendTrainee[] }>(
    `/training/trainees${query}`,
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

/** Random chia đều tân binh chưa có team cho các mentor (mỗi team dùng lộ trình riêng của mentor) */
export async function autoAssignTeams(
  fallbackProgramId?: string,
): Promise<{ assigned: number; mentors: number; groups: unknown[] }> {
  return api.post("/training/groups/auto-assign", {
    programId: fallbackProgramId || null,
  });
}

// ---- Programs ----

export async function getTrainingPrograms(): Promise<TrainingProgram[]> {
  const { programs } = await api.get<{ programs: BackendProgram[] }>(
    "/training/programs",
  );
  return programs.map(toProgram);
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

export async function getTrainingGroups(): Promise<TrainingGroup[]> {
  const { groups } = await api.get<{ groups: BackendGroup[] }>(
    "/training/groups",
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

// ---- Đánh giá tổng kết ----

export type TrainingReviewSummary = {
  totalTrainees: number;
  completionRate: number;
  needsAction: number;
};

export async function getTrainingReviewSummary(): Promise<TrainingReviewSummary> {
  const { summary } = await api.get<{ summary: TrainingReviewSummary }>(
    "/training/review-summary",
  );
  return summary;
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

export async function notifyTrainingGroups(
  groupIds: string[],
): Promise<{ sent: number }> {
  // Email gửi qua module email (SendEmailModal) — hàm này chỉ trả số lượng
  return { sent: groupIds.length };
}

// ---- Tasks / submissions / progress — CHƯA có backend, vẫn mock ----
// TODO: nối API khi backend có module training tasks

export async function getTrainingTasks(
  groupId?: string,
): Promise<TrainingTask[]> {
  if (!groupId) return mockTrainingTasks;
  return mockTrainingTasks.filter((t) => t.groupId === groupId);
}

export async function getTaskSubmissions(
  taskId?: string,
): Promise<TrainingTaskSubmission[]> {
  if (!taskId) return mockTaskSubmissions;
  return mockTaskSubmissions.filter((s) => s.taskId === taskId);
}

export async function getMyTrainingProgress(
  traineeId: string,
): Promise<TrainingProgress> {
  return { ...mockTrainingProgress, traineeId };
}
