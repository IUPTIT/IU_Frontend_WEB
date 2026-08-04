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

// ---- Kiểu dữ liệu backend trả về (model mới: RecruitmentCampaign + ApplicationForm) ----

type BackendFieldType =
  | "text_short"
  | "text_long"
  | "single_choice"
  | "multi_choice"
  | "file_upload"
  | "scale";

type BackendField = {
  fieldId: string;
  label: string;
  type: BackendFieldType;
  required: boolean;
  order: number;
  options?: string[];
  isFixed: boolean;
};

type BackendForm = {
  _id: string;
  campaignId: string;
  fields: BackendField[];
  isLocked: boolean;
};

type BackendCampaign = {
  _id: string;
  name: string;
  description: string;
  openAt: string;
  closeAt: string;
  status: "draft" | "open" | "closed" | "completed";
  quotas: { department: string; quota: number }[];
  createdAt: string;
  updatedAt: string;
};

type BackendApplicationStatus =
  | "draft"
  | "pending_review"
  | "passed_cv"
  | "failed_cv"
  | "passed_interview"
  | "failed_interview"
  | "admitted"
  | "rejected";

type BackendApplication = {
  _id: string;
  applicationCode: string | null;
  campaignId: string | { _id: string; name: string };
  status: BackendApplicationStatus;
  email: string;
  fullName: string;
  studentId: string;
  className: string;
  faculty: string;
  phone: string;
  avatarUrl: string;
  cvUrl: string;
  departmentPreferences: { department: string; priority: number }[];
  answers: { fieldId: string; value: string | string[] }[];
  submittedAt: string | null;
  createdAt: string;
};

// ---- Map backend → types admin UI ----

const FIELD_TYPE_TO_UI: Record<BackendFieldType, QuestionType> = {
  text_short: "short_text",
  text_long: "long_text",
  single_choice: "single_choice",
  multi_choice: "multi_choice",
  file_upload: "file_upload",
  scale: "rating",
};

const UI_TYPE_TO_FIELD: Record<QuestionType, BackendFieldType> = {
  short_text: "text_short",
  long_text: "text_long",
  single_choice: "single_choice",
  multi_choice: "multi_choice",
  file_upload: "file_upload",
  rating: "scale",
};

function toCampaign(c: BackendCampaign): RecruitmentCampaign {
  return {
    id: c._id,
    name: c.name,
    description: c.description,
    openAt: c.openAt,
    closeAt: c.closeAt,
    quotas: c.quotas.map((q) => ({
      departmentId: q.department,
      departmentName: q.department,
      quota: q.quota,
    })),
    status: c.status === "open" ? "published" : c.status === "draft" ? "draft" : "closed",
    isActive: c.status === "open",
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

function toQuestion(campaignId: string, f: BackendField): FormQuestion {
  return {
    id: f.fieldId,
    campaignId,
    content: f.label,
    type: FIELD_TYPE_TO_UI[f.type],
    required: f.required,
    order: f.order,
    options: f.options?.map((label, i) => ({ id: `${f.fieldId}-${i}`, label, order: i })),
  };
}

function campaignIdOf(a: BackendApplication): string {
  return typeof a.campaignId === "string" ? a.campaignId : a.campaignId._id;
}

function toApplication(a: BackendApplication): Application {
  const status: Application["status"] =
    a.status === "draft" || a.status === "pending_review"
      ? "submitted"
      : a.status === "passed_cv" || a.status === "passed_interview"
        ? "interview"
        : a.status === "admitted"
          ? "accepted"
          : "rejected";

  const screeningResult: PassFail =
    a.status === "draft" || a.status === "pending_review"
      ? "pending"
      : a.status === "failed_cv"
        ? "fail"
        : "pass";
  const interviewResult: PassFail = ["passed_interview", "admitted"].includes(a.status)
    ? "pass"
    : a.status === "failed_interview"
      ? "fail"
      : "pending";
  const finalResult: PassFail =
    a.status === "admitted" ? "pass" : a.status === "rejected" ? "fail" : "pending";

  const preferred = [...(a.departmentPreferences ?? [])].sort(
    (x, y) => x.priority - y.priority,
  )[0]?.department;

  return {
    id: a._id,
    campaignId: campaignIdOf(a),
    fullName: a.fullName,
    email: a.email,
    phone: a.phone,
    education: `${a.className} — ${a.faculty}`,
    preferredDepartmentId: preferred ?? "",
    preferredDepartmentName: preferred ?? "",
    status,
    screeningResult,
    interviewResult,
    finalResult,
    submittedAt: a.submittedAt ?? a.createdAt,
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

function toQuotasBody(quotas: CreateCampaignInput["quotas"]) {
  // Backend yêu cầu quota >= 1 — bỏ các ban không đặt chỉ tiêu
  return quotas
    .filter((q) => q.quota > 0)
    .map((q) => ({ department: q.departmentName, quota: q.quota }));
}

// Câu hỏi riêng lưu trong ApplicationForm: giữ 10 trường cố định đã seed,
// thay toàn bộ trường custom bằng danh sách mới
async function saveCustomQuestions(campaignId: string, questions: CreateCampaignQuestion[]) {
  const { form } = await api.get<{ form: BackendForm }>(
    `/recruitment/campaigns/${campaignId}/form`,
  );
  const fixedFields = form.fields.filter((f) => f.isFixed);
  const maxFixedOrder = Math.max(...fixedFields.map((f) => f.order), 0);
  const customFields: BackendField[] = questions.map((q, i) => ({
    fieldId: `custom_question_${i + 1}`,
    label: q.label,
    type: UI_TYPE_TO_FIELD[q.type],
    required: q.required,
    order: maxFixedOrder + 1 + (q.order ?? i),
    options: q.options?.length ? q.options : undefined,
    isFixed: false,
  }));
  const { form: saved } = await api.put<{ form: BackendForm }>(
    `/recruitment/campaigns/${campaignId}/form`,
    { fields: [...fixedFields, ...customFields] },
  );
  return saved;
}

export async function createCampaign(input: CreateCampaignInput): Promise<RecruitmentCampaign> {
  const { campaign } = await api.post<{ campaign: BackendCampaign }>("/recruitment/campaigns", {
    name: input.name,
    description: input.description ?? "",
    openAt: input.openAt,
    closeAt: input.closeAt,
    quotas: toQuotasBody(input.quotas),
  });
  if (input.customQuestions?.length) {
    await saveCustomQuestions(campaign._id, input.customQuestions);
  }
  if (input.status === "published" || input.isActive) {
    const { campaign: published } = await api.post<{ campaign: BackendCampaign }>(
      `/recruitment/campaigns/${campaign._id}/publish`,
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
// — caller tự lọc field trước khi gọi. Câu hỏi riêng đi qua endpoint form
// (backend chặn khi form khoá do đã có hồ sơ nộp).
export async function updateCampaign(
  id: string,
  input: UpdateCampaignInput,
): Promise<RecruitmentCampaign> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body.name = input.name;
  if (input.description !== undefined) body.description = input.description;
  if (input.openAt != null) body.openAt = input.openAt;
  if (input.closeAt != null) body.closeAt = input.closeAt;
  if (input.quotas) body.quotas = toQuotasBody(input.quotas);

  let campaign: BackendCampaign | undefined;
  if (Object.keys(body).length) {
    ({ campaign } = await api.patch<{ campaign: BackendCampaign }>(
      `/recruitment/campaigns/${id}`,
      body,
    ));
  }
  if (input.customQuestions) {
    await saveCustomQuestions(id, input.customQuestions);
  }
  if (!campaign) {
    ({ campaign } = await api.get<{ campaign: BackendCampaign }>(`/recruitment/campaigns/${id}`));
  }
  return toCampaign(campaign);
}

export async function getFormQuestions(campaignId: string): Promise<FormQuestion[]> {
  const { form } = await api.get<{ form: BackendForm }>(
    `/recruitment/campaigns/${campaignId}/form`,
  );
  return form.fields
    .filter((f) => !f.isFixed)
    .map((f) => toQuestion(campaignId, f))
    .sort((a, b) => a.order - b.order);
}

// ---- Applications (API thật) ----

async function fetchApplications(campaignId?: string): Promise<BackendApplication[]> {
  const query = campaignId ? `?campaignId=${campaignId}&limit=100` : "?limit=100";
  const { applications } = await api.get<{ applications: BackendApplication[]; total: number }>(
    `/recruitment/applications${query}`,
  );
  return applications;
}

export async function getApplications(campaignId?: string): Promise<Application[]> {
  return (await fetchApplications(campaignId)).map(toApplication);
}

export async function getApplicationById(id: string): Promise<Application | undefined> {
  const all = await fetchApplications();
  const found = all.find((a) => a._id === id);
  return found ? toApplication(found) : undefined;
}

export async function getApplicationAnswers(applicationId: string): Promise<ApplicationAnswer[]> {
  const all = await fetchApplications();
  const app = all.find((a) => a._id === applicationId);
  if (!app) return [];
  const questions = await getFormQuestions(campaignIdOf(app));
  const answerByField = new Map((app.answers ?? []).map((ans) => [ans.fieldId, ans.value]));
  return questions
    .filter((q) => answerByField.get(q.id) !== undefined)
    .map((q) => ({
      id: `${applicationId}-${q.id}`,
      applicationId,
      questionId: q.id,
      questionOrder: q.order,
      questionContent: q.content,
      value: answerByField.get(q.id) as string | string[],
    }));
}

export async function getRecruitmentStats(campaignId: string): Promise<RecruitmentStats> {
  const apps = await fetchApplications(campaignId);
  const total = apps.length;
  const screened = apps.filter((a) => !["draft", "pending_review"].includes(a.status));
  const screeningPassed = apps.filter((a) =>
    ["passed_cv", "passed_interview", "failed_interview", "admitted", "rejected"].includes(
      a.status,
    ),
  );
  const interviewed = apps.filter((a) =>
    ["passed_interview", "failed_interview", "admitted", "rejected"].includes(a.status),
  );
  const interviewPassed = apps.filter((a) => ["passed_interview", "admitted"].includes(a.status));

  const byDepartment = new Map<string, { total: number; accepted: number }>();
  for (const a of apps) {
    const preferred =
      [...(a.departmentPreferences ?? [])].sort((x, y) => x.priority - y.priority)[0]
        ?.department ?? "Khác";
    const entry = byDepartment.get(preferred) ?? { total: 0, accepted: 0 };
    entry.total += 1;
    if (a.status === "admitted") entry.accepted += 1;
    byDepartment.set(preferred, entry);
  }

  return {
    campaignId,
    totalApplications: total,
    screeningPassRate: screened.length ? screeningPassed.length / screened.length : 0,
    interviewPassRate: interviewed.length ? interviewPassed.length / interviewed.length : 0,
    acceptRateByDepartment: [...byDepartment.entries()].map(([department, v]) => ({
      departmentId: department,
      departmentName: department,
      rate: v.total ? v.accepted / v.total : 0,
    })),
  };
}

// ---- Chấm điểm vòng đơn / phỏng vấn — CHƯA có API, lưu in-memory (rỗng) ----
// TODO: nối API khi backend có module screening/interview (Phần 2-4 spec)

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
  // TODO: gọi POST /recruitment/applications/:id/decide khi backend có endpoint
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
