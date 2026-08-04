// TODO: MOCK — thay bằng API thật khi có backend
import type {
  Trainee,
  TrainingGroup,
  TrainingMentor,
  TrainingProgram,
  TrainingProgress,
  TrainingTask,
  TrainingTaskSubmission,
  TraineeEvalStatus,
} from "../types/training";
import {
  mockMentors,
  mockTaskSubmissions,
  mockTrainees,
  mockTrainingGroups,
  mockTrainingPrograms,
  mockTrainingProgress,
  mockTrainingTasks,
} from "../mocks/training.mock";

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

let programsStore = [...mockTrainingPrograms];
let groupsStore = [...mockTrainingGroups];
let traineesStore = [...mockTrainees];

export async function getTrainees(departmentId?: string): Promise<Trainee[]> {
  await delay();
  if (!departmentId) return [...traineesStore];
  return traineesStore.filter((t) => t.departmentId === departmentId);
}

export async function getMentors(departmentId?: string): Promise<TrainingMentor[]> {
  await delay(150);
  if (!departmentId) return [...mockMentors];
  return mockMentors.filter((m) => m.departmentId === departmentId);
}

export async function getTrainingPrograms(): Promise<TrainingProgram[]> {
  await delay();
  return [...programsStore];
}

export async function getTrainingProgramById(id: string): Promise<TrainingProgram | undefined> {
  await delay();
  return programsStore.find((p) => p.id === id);
}

export type SaveProgramInput = {
  name: string;
  departmentId: string;
  departmentName: string;
  stages: TrainingProgram["stages"];
  lessons: TrainingProgram["lessons"];
};

export async function createTrainingProgram(input: SaveProgramInput): Promise<TrainingProgram> {
  await delay(400);
  const now = new Date().toISOString();
  const created: TrainingProgram = {
    id: `prog-${Date.now()}`,
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  programsStore = [created, ...programsStore];
  return created;
}

export async function getTrainingGroups(): Promise<TrainingGroup[]> {
  await delay();
  return [...groupsStore];
}

export async function getTrainingGroupById(id: string): Promise<TrainingGroup | undefined> {
  await delay();
  return groupsStore.find((g) => g.id === id);
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

export async function createTrainingGroup(input: CreateGroupInput): Promise<TrainingGroup> {
  await delay(400);
  const created: TrainingGroup = {
    id: `grp-${Date.now()}`,
    name: input.name,
    programId: input.programId,
    departmentId: input.departmentId,
    departmentName: input.departmentName,
    specialtyLabel: input.specialtyLabel,
    mentorId: input.mentorId,
    mentorName: input.mentorName,
    mentorAccepted: Boolean(input.mentorId),
    memberIds: input.memberIds,
  };
  groupsStore = [created, ...groupsStore];
  traineesStore = traineesStore.map((t) =>
    input.memberIds.includes(t.id)
      ? { ...t, groupId: created.id, mentorId: input.mentorId, mentorName: input.mentorName }
      : t,
  );
  return created;
}

export async function getTrainingTasks(groupId?: string): Promise<TrainingTask[]> {
  await delay();
  if (!groupId) return mockTrainingTasks;
  return mockTrainingTasks.filter((t) => t.groupId === groupId);
}

export async function getTaskSubmissions(taskId?: string): Promise<TrainingTaskSubmission[]> {
  await delay();
  if (!taskId) return mockTaskSubmissions;
  return mockTaskSubmissions.filter((s) => s.taskId === taskId);
}

export async function getMyTrainingProgress(traineeId: string): Promise<TrainingProgress> {
  await delay();
  return { ...mockTrainingProgress, traineeId };
}

export type TrainingReviewSummary = {
  totalTrainees: number;
  completionRate: number;
  needsAction: number;
};

export async function getTrainingReviewSummary(): Promise<TrainingReviewSummary> {
  await delay(200);
  const total = traineesStore.length;
  const done = traineesStore.filter(
    (t) => t.evalStatus === "qualified" || t.evalStatus === "certified" || t.status === "completed",
  ).length;
  const needs = traineesStore.filter((t) => t.evalStatus === "failed").length;
  return {
    totalTrainees: total,
    completionRate: total ? Math.round((done / total) * 100) : 0,
    needsAction: needs,
  };
}

export async function issueCertificates(traineeIds: string[]): Promise<{ issued: number }> {
  await delay(400);
  let issued = 0;
  traineesStore = traineesStore.map((t) => {
    if (!traineeIds.includes(t.id)) return t;
    if (t.evalStatus !== "qualified" && t.evalStatus !== "certified") return t;
    issued += 1;
    return { ...t, evalStatus: "certified" as TraineeEvalStatus, status: "completed" };
  });
  return { issued };
}

export async function notifyTrainingGroups(groupIds: string[]): Promise<{ sent: number }> {
  await delay(400);
  return { sent: groupIds.length };
}
