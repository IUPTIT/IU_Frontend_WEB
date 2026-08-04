// Recruitment (Admin) — campaigns/hồ sơ/câu hỏi/thống kê gọi API thật.
// Phần chấm điểm vòng đơn & phỏng vấn backend CHƯA có endpoint — các hàm giữ
// nguyên chữ ký, lưu in-memory (khởi đầu rỗng) để UI hoạt động, sẽ nối API sau.
import { api } from "../api/client";
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
  QuestionType,
  RecruitmentCampaign,
  RecruitmentStats,
  ScreeningCriterion,
} from "../types/recruitment";

// ---- Kiểu dữ liệu backend trả về ----

type BackendQuestion = {
  _id: string;
  label: string;
  type: "short_text" | "long_text" | "single_choice" | "multi_choice" | "file" | "scale";
  options?: string[];
  required: boolean;
  order: number;
};

type BackendCampaign = {
  id: string;
  name: string;
  description: string;
  openAt: string;
  closeAt: string;
  status: "draft" | "open" | "closed" | "completed";
  quotas: { team: string; count: number }[];
  customQuestions: BackendQuestion[];
  createdAt: string;
  updatedAt: string;
};

type BackendApplicationStatus =
  | "pending"
  | "passed_screening"
  | "failed_screening"
  | "passed_interview"
  | "failed_interview"
  | "accepted"
  | "rejected"
  | "withdrawn";

type BackendApplication = {
  id: string;
  code: string;
  fullName: string;
  studentId: string;
  className: string;
  faculty: string;
  email: string;
  phone: string;
  wishes: string[];
  answers: Record<string, string | string[]>;
  status: BackendApplicationStatus;
  createdAt: string;
  campaign: string | { _id: string; name: string };
};

// ---- Map backend → types admin UI ----

const QUESTION_TYPE_MAP: Record<BackendQuestion["type"], QuestionType> = {
  short_text: "short_text",
  long_text: "long_text",
  single_choice: "single_choice",
  multi_choice: "multi_choice",
  file: "file_upload",
  scale: "rating",
};

function toCampaign(c: BackendCampaign): RecruitmentCampaign {
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    openAt: c.openAt,
    closeAt: c.closeAt,
    quotas: c.quotas.map((q) => ({
      departmentId: q.team,
      departmentName: q.team,
      quota: q.count,
    })),
    status: c.status === "open" ? "published" : c.status === "draft" ? "draft" : "closed",
    isActive: c.status === "open",
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

function toQuestion(campaignId: string, q: BackendQuestion): FormQuestion {
  return {
    id: q._id,
    campaignId,
    content: q.label,
    type: QUESTION_TYPE_MAP[q.type],
    required: q.required,
    order: q.order,
    options: q.options?.map((label, i) => ({ id: `${q._id}-${i}`, label, order: i })),
  };
}

function campaignIdOf(a: BackendApplication): string {
  return typeof a.campaign === "string" ? a.campaign : a.campaign._id;
}

function toApplication(a: BackendApplication): Application {
  const status: Application["status"] =
    a.status === "pending"
      ? "submitted"
      : a.status === "passed_screening"
        ? "interview"
        : a.status === "passed_interview"
          ? "interview"
          : a.status === "accepted"
            ? "accepted"
            : "rejected";

  const screeningResult: PassFail =
    a.status === "pending"
      ? "pending"
      : ["failed_screening", "withdrawn"].includes(a.status)
        ? "fail"
        : "pass";
  const interviewResult: PassFail = ["passed_interview", "accepted"].includes(a.status)
    ? "pass"
    : ["failed_interview", "rejected"].includes(a.status)
      ? "fail"
      : "pending";
  const finalResult: PassFail =
    a.status === "accepted" ? "pass" : a.status === "rejected" ? "fail" : "pending";

  return {
    id: a.id,
    campaignId: campaignIdOf(a),
    fullName: a.fullName,
    email: a.email,
    phone: a.phone,
    education: `${a.className} — ${a.faculty}`,
    preferredDepartmentId: a.wishes[0] ?? "",
    preferredDepartmentName: a.wishes[0] ?? "",
    status,
    screeningResult,
    interviewResult,
    finalResult,
    submittedAt: a.createdAt,
  };
}

// ---- Campaigns (API thật) ----

export async function getCampaigns(): Promise<RecruitmentCampaign[]> {
  const { campaigns } = await api.get<{ campaigns: BackendCampaign[] }>("/recruitment/campaigns");
  return campaigns.map(toCampaign);
}

export async function getCampaignById(id: string): Promise<RecruitmentCampaign | undefined> {
  const { campaign } = await api.get<{ campaign: BackendCampaign }>(`/recruitment/campaigns/${id}`);
  return toCampaign(campaign);
}

export async function setCampaignActive(
  id: string,
  isActive: boolean,
): Promise<RecruitmentCampaign | undefined> {
  const action = isActive ? "publish" : "close";
  const { campaign } = await api.post<{ campaign: BackendCampaign }>(
    `/recruitment/campaigns/${id}/${action}`,
  );
  return toCampaign(campaign);
}

export async function deleteCampaign(id: string): Promise<void> {
  await api.delete(`/recruitment/campaigns/${id}`);
}

export type CreateCampaignQuestion = {
  label: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
  order: number;
};

export type CreateCampaignInput = {
  name: string;
  description?: string;
  openAt: string | null;
  closeAt: string | null;
  quotas: { departmentId: string; departmentName: string; quota: number }[];
  customQuestions?: CreateCampaignQuestion[];
  status: "draft" | "published";
  isActive: boolean;
};

const QUESTION_TYPE_TO_BACKEND: Record<QuestionType, BackendQuestion["type"]> = {
  short_text: "short_text",
  long_text: "long_text",
  single_choice: "single_choice",
  multi_choice: "multi_choice",
  file_upload: "file",
  rating: "scale",
};

export async function createCampaign(input: CreateCampaignInput): Promise<RecruitmentCampaign> {
  const { campaign } = await api.post<{ campaign: BackendCampaign }>("/recruitment/campaigns", {
    name: input.name,
    description: input.description ?? "",
    openAt: input.openAt,
    closeAt: input.closeAt,
    // Backend yêu cầu count >= 1 — bỏ các ban không đặt chỉ tiêu
    quotas: input.quotas
      .filter((q) => q.quota > 0)
      .map((q) => ({ team: q.departmentName, count: q.quota })),
    customQuestions: (input.customQuestions ?? []).map((q) => ({
      label: q.label,
      type: QUESTION_TYPE_TO_BACKEND[q.type],
      options: q.options?.length ? q.options : undefined,
      required: q.required,
      order: q.order,
    })),
  });
  if (input.status === "published" || input.isActive) {
    const { campaign: published } = await api.post<{ campaign: BackendCampaign }>(
      `/recruitment/campaigns/${campaign.id}/publish`,
    );
    return toCampaign(published);
  }
  return toCampaign(campaign);
}

export type UpdateCampaignInput = {
  name?: string;
  description?: string;
  openAt?: string | null;
  closeAt?: string | null;
  quotas?: { departmentId: string; departmentName: string; quota: number }[];
  customQuestions?: CreateCampaignQuestion[];
};

// Sửa đợt tuyển. Đợt đã publish: backend chỉ nhận closeAt/quotas/description
// (+ customQuestions khi chưa có hồ sơ) — caller tự lọc field trước khi gọi.
export async function updateCampaign(
  id: string,
  input: UpdateCampaignInput,
): Promise<RecruitmentCampaign> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body.name = input.name;
  if (input.description !== undefined) body.description = input.description;
  if (input.openAt != null) body.openAt = input.openAt;
  if (input.closeAt != null) body.closeAt = input.closeAt;
  if (input.quotas) {
    body.quotas = input.quotas
      .filter((q) => q.quota > 0)
      .map((q) => ({ team: q.departmentName, count: q.quota }));
  }
  if (input.customQuestions) {
    body.customQuestions = input.customQuestions.map((q) => ({
      label: q.label,
      type: QUESTION_TYPE_TO_BACKEND[q.type],
      options: q.options?.length ? q.options : undefined,
      required: q.required,
      order: q.order,
    }));
  }
  const { campaign } = await api.patch<{ campaign: BackendCampaign }>(
    `/recruitment/campaigns/${id}`,
    body,
  );
  return toCampaign(campaign);
}

export async function getFormQuestions(campaignId: string): Promise<FormQuestion[]> {
  const { campaign } = await api.get<{ campaign: BackendCampaign }>(
    `/recruitment/campaigns/${campaignId}`,
  );
  return campaign.customQuestions
    .map((q) => toQuestion(campaignId, q))
    .sort((a, b) => a.order - b.order);
}

// ---- Applications (API thật) ----

async function fetchApplications(campaignId?: string): Promise<BackendApplication[]> {
  const query = campaignId ? `?campaign=${campaignId}` : "";
  const { applications } = await api.get<{ applications: BackendApplication[] }>(
    `/recruitment/applications${query}`,
  );
  return applications;
}

export async function getApplications(campaignId?: string): Promise<Application[]> {
  return (await fetchApplications(campaignId)).map(toApplication);
}

export async function getApplicationById(id: string): Promise<Application | undefined> {
  const all = await fetchApplications();
  const found = all.find((a) => a.id === id);
  return found ? toApplication(found) : undefined;
}

export async function getApplicationAnswers(applicationId: string): Promise<ApplicationAnswer[]> {
  const all = await fetchApplications();
  const app = all.find((a) => a.id === applicationId);
  if (!app) return [];
  const questions = await getFormQuestions(campaignIdOf(app));
  return questions
    .filter((q) => app.answers?.[q.id] !== undefined)
    .map((q) => ({
      id: `${applicationId}-${q.id}`,
      applicationId,
      questionId: q.id,
      questionOrder: q.order,
      questionContent: q.content,
      value: app.answers[q.id],
    }));
}

export async function getRecruitmentStats(campaignId: string): Promise<RecruitmentStats> {
  const apps = await fetchApplications(campaignId);
  const total = apps.length;
  const screened = apps.filter((a) => a.status !== "pending" && a.status !== "withdrawn");
  const screeningPassed = apps.filter((a) =>
    ["passed_screening", "passed_interview", "accepted", "failed_interview", "rejected"].includes(
      a.status,
    ),
  );
  const interviewed = apps.filter((a) =>
    ["passed_interview", "failed_interview", "accepted", "rejected"].includes(a.status),
  );
  const interviewPassed = apps.filter((a) => ["passed_interview", "accepted"].includes(a.status));

  const byTeam = new Map<string, { total: number; accepted: number }>();
  for (const a of apps) {
    const team = a.wishes[0] ?? "Khác";
    const entry = byTeam.get(team) ?? { total: 0, accepted: 0 };
    entry.total += 1;
    if (a.status === "accepted") entry.accepted += 1;
    byTeam.set(team, entry);
  }

  return {
    campaignId,
    totalApplications: total,
    screeningPassRate: screened.length ? screeningPassed.length / screened.length : 0,
    interviewPassRate: interviewed.length ? interviewPassed.length / interviewed.length : 0,
    acceptRateByDepartment: [...byTeam.entries()].map(([team, v]) => ({
      departmentId: team,
      departmentName: team,
      rate: v.total ? v.accepted / v.total : 0,
    })),
  };
}

// ---- Chấm điểm vòng đơn / phỏng vấn — CHƯA có API, lưu in-memory (rỗng) ----
// TODO: nối API khi backend có module screening/interview

let scoresStore: ApplicationScore[] = [];
let interviewSlotsStore: InterviewSlot[] = [];
let interviewScoresStore: InterviewScore[] = [];

const SCREENING_CRITERIA: ScreeningCriterion[] = [
  { id: "sc-1", name: "Học lực", maxScore: 10 },
  { id: "sc-2", name: "Kinh nghiệm / kỹ năng", maxScore: 10 },
  { id: "sc-3", name: "Định hướng với CLB", maxScore: 10 },
];

const INTERVIEW_CRITERIA: InterviewCriterion[] = [
  { id: "ic-1", name: "Kiến thức chuyên môn", maxScore: 10 },
  { id: "ic-2", name: "Thái độ & tinh thần", maxScore: 10 },
  { id: "ic-3", name: "Giao tiếp", maxScore: 10 },
];

export async function getScreeningCriteria(): Promise<ScreeningCriterion[]> {
  return [...SCREENING_CRITERIA];
}

export async function getApplicationScore(
  applicationId: string,
): Promise<ApplicationScore | undefined> {
  return scoresStore.find((s) => s.applicationId === applicationId);
}

export type SaveScreeningScoreInput = {
  applicationId: string;
  reviewerId: string;
  reviewerName: string;
  criteriaScores: { criteriaId: string; criteriaName: string; score: number; maxScore: number }[];
  comment: string;
};

export async function saveApplicationScore(
  input: SaveScreeningScoreInput,
): Promise<ApplicationScore> {
  const now = new Date().toISOString();
  const existing = scoresStore.find((s) => s.applicationId === input.applicationId);
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
  return next;
}

export async function setScreeningDecision(
  applicationId: string,
  _result: Extract<PassFail, "pass" | "fail">,
): Promise<Application | undefined> {
  // TODO: gọi API cập nhật trạng thái khi backend có endpoint screening decision
  return getApplicationById(applicationId);
}

export async function getInterviewers(): Promise<InterviewerRef[]> {
  return [];
}

export async function getInterviewSlots(
  campaignId?: string,
  date?: string,
): Promise<InterviewSlot[]> {
  return interviewSlotsStore.filter((s) => {
    if (campaignId && s.campaignId !== campaignId) return false;
    if (date && s.date !== date) return false;
    return true;
  });
}

export async function getInterviewDatesWithSlots(campaignId: string): Promise<string[]> {
  return [
    ...new Set(
      interviewSlotsStore.filter((s) => s.campaignId === campaignId).map((s) => s.date),
    ),
  ];
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
  const apps = await getApplications(input.campaignId);
  const targets = apps.filter((a) => input.applicationIds.includes(a.id));
  const times = input.startTimes.length
    ? input.startTimes
    : ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00"];

  const created: InterviewSlot[] = targets.map((app, i) => ({
    id: `slot-${Date.now()}-${i}`,
    campaignId: input.campaignId,
    date: input.date,
    startTime: times[i % times.length],
    durationMinutes: input.durationMinutes,
    locationOrLink: input.locationOrLink,
    applicationId: app.id,
    candidateName: app.fullName,
    candidateDepartment: app.preferredDepartmentName,
    interviewers: [],
    requiredInterviewers: input.requiredInterviewers ?? 2,
    status: "missing_interviewers",
  }));

  interviewSlotsStore = [...interviewSlotsStore, ...created];
  return created;
}

export async function assignInterviewersToSlot(
  slotId: string,
  interviewers: InterviewerRef[],
): Promise<InterviewSlot | undefined> {
  interviewSlotsStore = interviewSlotsStore.map((s) => {
    if (s.id !== slotId) return s;
    const next = { ...s, interviewers };
    return {
      ...next,
      status:
        next.status === "done"
          ? "done"
          : next.interviewers.length < next.requiredInterviewers
            ? "missing_interviewers"
            : "scheduled",
    };
  });
  return interviewSlotsStore.find((s) => s.id === slotId);
}

export async function rescheduleInterviewSlot(
  slotId: string,
  patch: { date: string; startTime: string; reason?: string },
): Promise<InterviewSlot | undefined> {
  interviewSlotsStore = interviewSlotsStore.map((s) =>
    s.id === slotId ? { ...s, date: patch.date, startTime: patch.startTime } : s,
  );
  return interviewSlotsStore.find((s) => s.id === slotId);
}

export async function getInterviewCriteria(): Promise<InterviewCriterion[]> {
  return [...INTERVIEW_CRITERIA];
}

export async function getInterviewScore(slotId: string): Promise<InterviewScore | undefined> {
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
  _result: Extract<PassFail, "pass" | "fail">,
): Promise<Application | undefined> {
  // TODO: gọi API cập nhật trạng thái khi backend có endpoint interview decision
  interviewSlotsStore = interviewSlotsStore.map((s) =>
    s.applicationId === applicationId ? { ...s, status: "done" } : s,
  );
  return getApplicationById(applicationId);
}

export async function notifyInterviewResults(applicationIds: string[]): Promise<{ sent: number }> {
  return { sent: applicationIds.length };
}

export async function notifyFinalResults(applicationIds: string[]): Promise<{ sent: number }> {
  return { sent: applicationIds.length };
}

export async function convertAcceptedToMembers(
  applicationIds: string[],
): Promise<{ converted: number }> {
  // TODO: nối API chuyển Ứng viên → Member khi backend có endpoint
  return { converted: applicationIds.length };
}

export async function getPassedScreeningApplications(campaignId: string): Promise<Application[]> {
  const apps = await getApplications(campaignId);
  return apps.filter((a) => a.screeningResult === "pass" || a.status === "accepted");
}

export type CampaignResultSummary = {
  totalApplications: number;
  interviewed: number;
  accepted: number;
};

export async function getCampaignResultSummary(campaignId: string): Promise<CampaignResultSummary> {
  const apps = await getApplications(campaignId);
  return {
    totalApplications: apps.length,
    interviewed: apps.filter((a) => a.interviewResult !== "pending").length,
    accepted: apps.filter((a) => a.finalResult === "pass" || a.status === "accepted").length,
  };
}
