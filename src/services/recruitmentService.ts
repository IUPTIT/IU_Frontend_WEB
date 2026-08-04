// TODO: MOCK — thay bằng API thật khi có backend
import type {
  Application,
  ApplicationAnswer,
  ApplicationScore,
  FormQuestion,
  InterviewCriterion,
  InterviewScore,
  InterviewSlot,
  InterviewerRef,
  PassFail,
  RecruitmentCampaign,
  RecruitmentStats,
  ScreeningCriterion,
} from "../types/recruitment";
import {
  mockApplicationAnswers,
  mockApplicationScores,
  mockApplications,
  mockCampaigns,
  mockFormQuestions,
  mockInterviewCriteria,
  mockInterviewScores,
  mockInterviewSlots,
  mockInterviewers,
  mockRecruitmentStats,
  mockScreeningCriteria,
} from "../mocks/recruitment.mock";

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

/** In-memory store để toggle/xóa phản ánh trên UI */
let campaignsStore = [...mockCampaigns];
let applicationsStore = [...mockApplications];
let scoresStore = [...mockApplicationScores];
let interviewSlotsStore = [...mockInterviewSlots];
let interviewScoresStore = [...mockInterviewScores];

export async function getCampaigns(): Promise<RecruitmentCampaign[]> {
  await delay();
  return [...campaignsStore];
}

export async function getCampaignById(id: string): Promise<RecruitmentCampaign | undefined> {
  await delay();
  return campaignsStore.find((c) => c.id === id);
}

export async function setCampaignActive(id: string, isActive: boolean): Promise<RecruitmentCampaign | undefined> {
  await delay(250);
  campaignsStore = campaignsStore.map((c) => {
    if (c.id !== id) {
      return isActive ? { ...c, isActive: false } : c;
    }
    return {
      ...c,
      isActive,
      status: isActive ? "published" : c.status === "draft" ? "draft" : c.status,
      updatedAt: new Date().toISOString(),
    };
  });
  return campaignsStore.find((c) => c.id === id);
}

export async function deleteCampaign(id: string): Promise<void> {
  await delay(250);
  campaignsStore = campaignsStore.filter((c) => c.id !== id);
}

export type CreateCampaignInput = {
  name: string;
  description?: string;
  openAt: string | null;
  closeAt: string | null;
  quotas: { departmentId: string; departmentName: string; quota: number }[];
  status: "draft" | "published";
  isActive: boolean;
};

export async function createCampaign(input: CreateCampaignInput): Promise<RecruitmentCampaign> {
  await delay(400);
  const now = new Date().toISOString();
  const created: RecruitmentCampaign = {
    id: `camp-${Date.now()}`,
    name: input.name,
    description: input.description,
    openAt: input.openAt,
    closeAt: input.closeAt,
    quotas: input.quotas,
    status: input.status,
    isActive: input.isActive,
    createdAt: now,
    updatedAt: now,
  };

  if (created.isActive) {
    campaignsStore = campaignsStore.map((c) => ({ ...c, isActive: false }));
  }

  campaignsStore = [created, ...campaignsStore];
  return created;
}

export async function getFormQuestions(campaignId: string): Promise<FormQuestion[]> {
  await delay();
  return mockFormQuestions.filter((q) => q.campaignId === campaignId);
}

export async function getApplications(campaignId?: string): Promise<Application[]> {
  await delay();
  if (!campaignId) return [...applicationsStore];
  return applicationsStore.filter((a) => a.campaignId === campaignId);
}

export async function getApplicationById(id: string): Promise<Application | undefined> {
  await delay();
  return applicationsStore.find((a) => a.id === id);
}

export async function getApplicationAnswers(applicationId: string): Promise<ApplicationAnswer[]> {
  await delay(200);
  return mockApplicationAnswers
    .filter((a) => a.applicationId === applicationId)
    .sort((a, b) => a.questionOrder - b.questionOrder);
}

export async function getScreeningCriteria(): Promise<ScreeningCriterion[]> {
  await delay(100);
  return [...mockScreeningCriteria];
}

export async function getApplicationScore(applicationId: string): Promise<ApplicationScore | undefined> {
  await delay(200);
  return scoresStore.find((s) => s.applicationId === applicationId);
}

export type SaveScreeningScoreInput = {
  applicationId: string;
  reviewerId: string;
  reviewerName: string;
  criteriaScores: { criteriaId: string; criteriaName: string; score: number; maxScore: number }[];
  comment: string;
};

export async function saveApplicationScore(input: SaveScreeningScoreInput): Promise<ApplicationScore> {
  await delay(300);
  const now = new Date().toISOString();
  const existing = scoresStore.find((s) => s.applicationId === input.applicationId);
  const avg =
    input.criteriaScores.reduce((sum, c) => sum + c.score, 0) / Math.max(1, input.criteriaScores.length);

  const next: ApplicationScore = {
    id: existing?.id ?? `score-${Date.now()}`,
    applicationId: input.applicationId,
    reviewerId: input.reviewerId,
    reviewerName: input.reviewerName,
    criteriaScores: input.criteriaScores,
    comment: input.comment,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  scoresStore = existing
    ? scoresStore.map((s) => (s.applicationId === input.applicationId ? next : s))
    : [...scoresStore, next];

  applicationsStore = applicationsStore.map((a) =>
    a.id === input.applicationId
      ? {
          ...a,
          totalScore: Math.round(avg * 10) / 10,
          status: a.status === "submitted" ? "screening" : a.status,
        }
      : a,
  );

  return next;
}

export async function setScreeningDecision(
  applicationId: string,
  result: Extract<PassFail, "pass" | "fail">,
): Promise<Application | undefined> {
  await delay(300);
  applicationsStore = applicationsStore.map((a) => {
    if (a.id !== applicationId) return a;
    if (result === "pass") {
      return {
        ...a,
        screeningResult: "pass",
        status: "interview",
      };
    }
    return {
      ...a,
      screeningResult: "fail",
      finalResult: "fail",
      status: "rejected",
    };
  });
  return applicationsStore.find((a) => a.id === applicationId);
}

export async function getRecruitmentStats(campaignId: string): Promise<RecruitmentStats> {
  await delay();
  return { ...mockRecruitmentStats, campaignId };
}

export async function getInterviewers(): Promise<InterviewerRef[]> {
  await delay(150);
  return mockInterviewers.map(({ id, name }) => ({ id, name }));
}

export async function getInterviewSlots(campaignId?: string, date?: string): Promise<InterviewSlot[]> {
  await delay(250);
  return interviewSlotsStore.filter((s) => {
    if (campaignId && s.campaignId !== campaignId) return false;
    if (date && s.date !== date) return false;
    return true;
  });
}

export async function getInterviewDatesWithSlots(campaignId: string): Promise<string[]> {
  await delay(100);
  return [
    ...new Set(
      interviewSlotsStore.filter((s) => s.campaignId === campaignId).map((s) => s.date),
    ),
  ];
}

function deriveSlotStatus(slot: InterviewSlot): InterviewSlot["status"] {
  if (slot.status === "done") return "done";
  if (slot.interviewers.length < slot.requiredInterviewers) return "missing_interviewers";
  return "scheduled";
}

export type BatchScheduleInput = {
  campaignId: string;
  date: string;
  startTimes: string[];
  durationMinutes: number;
  locationOrLink: string;
  applicationIds: string[];
  requiredInterviewers?: number;
};

export async function createBatchInterviewSlots(input: BatchScheduleInput): Promise<InterviewSlot[]> {
  await delay(400);
  const apps = applicationsStore.filter((a) => input.applicationIds.includes(a.id));
  const created: InterviewSlot[] = [];
  const times = input.startTimes.length
    ? input.startTimes
    : ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00"];

  apps.forEach((app, i) => {
    const startTime = times[i % times.length];
    const slot: InterviewSlot = {
      id: `slot-${Date.now()}-${i}`,
      campaignId: input.campaignId,
      date: input.date,
      startTime,
      durationMinutes: input.durationMinutes,
      locationOrLink: input.locationOrLink,
      applicationId: app.id,
      candidateName: app.fullName,
      candidateDepartment: app.preferredDepartmentName,
      interviewers: [],
      requiredInterviewers: input.requiredInterviewers ?? 2,
      status: "missing_interviewers",
    };
    created.push(slot);
  });

  interviewSlotsStore = [...interviewSlotsStore, ...created];
  return created;
}

export async function assignInterviewersToSlot(
  slotId: string,
  interviewers: InterviewerRef[],
): Promise<InterviewSlot | undefined> {
  await delay(250);
  interviewSlotsStore = interviewSlotsStore.map((s) => {
    if (s.id !== slotId) return s;
    const next = { ...s, interviewers };
    return { ...next, status: deriveSlotStatus(next) };
  });
  return interviewSlotsStore.find((s) => s.id === slotId);
}

export async function rescheduleInterviewSlot(
  slotId: string,
  patch: { date: string; startTime: string; reason?: string },
): Promise<InterviewSlot | undefined> {
  await delay(250);
  interviewSlotsStore = interviewSlotsStore.map((s) =>
    s.id === slotId ? { ...s, date: patch.date, startTime: patch.startTime } : s,
  );
  return interviewSlotsStore.find((s) => s.id === slotId);
}

export async function getInterviewCriteria(): Promise<InterviewCriterion[]> {
  await delay(100);
  return [...mockInterviewCriteria];
}

export async function getInterviewScore(slotId: string): Promise<InterviewScore | undefined> {
  await delay(150);
  return interviewScoresStore.find((s) => s.slotId === slotId);
}

export type SaveInterviewScoreInput = {
  slotId: string;
  applicationId: string;
  interviewerId: string;
  interviewerName: string;
  criteriaScores: { criteriaId: string; criteriaName: string; score: number; maxScore: number }[];
  comment: string;
  result?: PassFail;
};

export async function saveInterviewScore(input: SaveInterviewScoreInput): Promise<InterviewScore> {
  await delay(300);
  const now = new Date().toISOString();
  const existing = interviewScoresStore.find((s) => s.slotId === input.slotId);
  const next: InterviewScore = {
    id: existing?.id ?? `iscore-${Date.now()}`,
    applicationId: input.applicationId,
    slotId: input.slotId,
    interviewerId: input.interviewerId,
    interviewerName: input.interviewerName,
    criteriaScores: input.criteriaScores,
    comment: input.comment,
    result: input.result ?? existing?.result ?? "pending",
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  interviewScoresStore = existing
    ? interviewScoresStore.map((s) => (s.slotId === input.slotId ? next : s))
    : [...interviewScoresStore, next];
  return next;
}

export async function setInterviewDecision(
  applicationId: string,
  result: Extract<PassFail, "pass" | "fail">,
): Promise<Application | undefined> {
  await delay(300);
  applicationsStore = applicationsStore.map((a) => {
    if (a.id !== applicationId) return a;
    if (result === "pass") {
      return { ...a, interviewResult: "pass", finalResult: "pass", status: "accepted" };
    }
    return { ...a, interviewResult: "fail", finalResult: "fail", status: "rejected" };
  });
  interviewSlotsStore = interviewSlotsStore.map((s) =>
    s.applicationId === applicationId ? { ...s, status: "done" } : s,
  );
  return applicationsStore.find((a) => a.id === applicationId);
}

/** Mock gửi thông báo kết quả PV */
export async function notifyInterviewResults(
  applicationIds: string[],
): Promise<{ sent: number }> {
  await delay(500);
  return { sent: applicationIds.length };
}

/** Gửi thông báo kết quả cuối (email) hàng loạt */
export async function notifyFinalResults(
  applicationIds: string[],
): Promise<{ sent: number }> {
  await delay(500);
  applicationsStore = applicationsStore.map((a) => {
    if (!applicationIds.includes(a.id)) return a;
    if (a.resultNotifyStatus === "converted") return a;
    return { ...a, resultNotifyStatus: "email_sent" };
  });
  return { sent: applicationIds.length };
}

/** Chuyển ứng viên trúng tuyển thành Member */
export async function convertAcceptedToMembers(
  applicationIds: string[],
): Promise<{ converted: number }> {
  await delay(500);
  let converted = 0;
  applicationsStore = applicationsStore.map((a) => {
    if (!applicationIds.includes(a.id)) return a;
    if (a.finalResult !== "pass" && a.status !== "accepted") return a;
    converted += 1;
    return { ...a, resultNotifyStatus: "converted", status: "accepted", finalResult: "pass" };
  });
  return { converted };
}

export async function getPassedScreeningApplications(campaignId: string): Promise<Application[]> {
  await delay(200);
  return applicationsStore.filter(
    (a) =>
      a.campaignId === campaignId &&
      (a.screeningResult === "pass" || a.status === "interview" || a.status === "accepted"),
  );
}

export type CampaignResultSummary = {
  totalApplications: number;
  interviewed: number;
  accepted: number;
};

export async function getCampaignResultSummary(campaignId: string): Promise<CampaignResultSummary> {
  await delay(200);
  const apps = applicationsStore.filter((a) => a.campaignId === campaignId);
  return {
    totalApplications: apps.length,
    interviewed: apps.filter(
      (a) =>
        a.interviewResult !== "pending" ||
        a.status === "interview" ||
        a.status === "accepted" ||
        a.status === "rejected",
    ).length,
    accepted: apps.filter((a) => a.finalResult === "pass" || a.status === "accepted").length,
  };
}
