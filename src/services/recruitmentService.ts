// Recruitment (Admin) — campaigns/hồ sơ/câu hỏi/thống kê gọi API thật.
// Phần chấm điểm vòng đơn & phỏng vấn backend CHƯA có endpoint — các hàm giữ
// nguyên chữ ký, lưu in-memory (khởi đầu rỗng) để UI hoạt động, sẽ nối API sau.
import { api, ApiRequestError, getAccessToken } from "../api/client";
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

const EXPORT_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3456/api/v1";

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
  dateOfBirth?: string | null;
  avatarUrl: string;
  cvUrl: string;
  departmentPreferences: { department: string; priority: number }[];
  answers: { fieldId: string; value: string | string[] }[];
  submittedAt: string | null;
  createdAt: string;
  /** Điểm TB vòng đơn / phỏng vấn — backend thang 0-100 */
  cvScore?: number | null;
  interviewScore?: number | null;
  resultNotifyStatus?: "pending" | "email_sent" | "converted";
  needsManualReview?: boolean;
  assignedDepartment?: string | null;
  reviewerIds?: { _id: string; name: string; email: string }[] | string[];
};

// UI dùng thang 0-10, backend lưu 0-100 — quy đổi tại MỘT chỗ duy nhất
function toUiScale(score: number | null | undefined): number | undefined {
  return score != null ? Number((score / 10).toFixed(1)) : undefined;
}

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
    status:
      c.status === "open"
        ? "published"
        : c.status === "completed"
          ? "completed"
          : c.status === "draft"
            ? "draft"
            : "closed",
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
      : a.status === "passed_cv"
        ? "interview"
        : a.status === "passed_interview"
          ? "interview_passed"
          : a.status === "admitted"
            ? "accepted"
            : a.status === "failed_cv"
              ? "cv_failed"
              : a.status === "failed_interview"
                ? "interview_failed"
                : "rejected";

  const screeningResult: PassFail =
    a.status === "draft" || a.status === "pending_review"
      ? "pending"
      : a.status === "failed_cv"
        ? "fail"
        : "pass";
  // rejected (kết quả cuối) cũng đã Pass PV — state machine chỉ reject từ passed_interview
  const interviewResult: PassFail = ["passed_interview", "admitted", "rejected"].includes(
    a.status,
  )
    ? "pass"
    : a.status === "failed_interview"
      ? "fail"
      : "pending";
  const finalResult: PassFail =
    a.status === "admitted" ? "pass" : a.status === "rejected" ? "fail" : "pending";

  const prefs = [...(a.departmentPreferences ?? [])].sort((x, y) => x.priority - y.priority);
  const preferred = a.assignedDepartment || prefs[0]?.department;

  const attachments: Application["attachments"] = [];
  if (a.avatarUrl) {
    attachments.push({ id: `${a._id}-avatar`, label: "Ảnh đại diện", kind: "link", url: a.avatarUrl });
  }
  if (a.cvUrl) {
    attachments.push({ id: `${a._id}-cv`, label: "CV", kind: "pdf", url: a.cvUrl });
  }

  return {
    id: a._id,
    campaignId: campaignIdOf(a),
    applicationCode: a.applicationCode ?? a._id,
    fullName: a.fullName,
    email: a.email,
    phone: a.phone,
    studentId: a.studentId ?? "",
    className: a.className ?? "",
    faculty: a.faculty ?? "",
    dateOfBirth: a.dateOfBirth
      ? String(a.dateOfBirth).slice(0, 10)
      : null,
    education: `${a.className} — ${a.faculty}`,
    preferredDepartmentId: preferred ?? "",
    preferredDepartmentName: preferred ?? "",
    departmentPreferences: prefs,
    assignedDepartment: a.assignedDepartment ?? null,
    status,
    screeningResult,
    interviewResult,
    finalResult,
    totalScore: toUiScale(a.cvScore),
    interviewScore: toUiScale(a.interviewScore),
    submittedAt: a.submittedAt ?? a.createdAt,
    attachments,
    needsManualReview: a.needsManualReview ?? false,
    reviewerIds: (a.reviewerIds ?? []).map((r) =>
      typeof r === "string" ? r : r._id,
    ),
    reviewerNames: (a.reviewerIds ?? [])
      .map((r) => (typeof r === "string" ? "" : r.name))
      .filter(Boolean),
    resultNotifyStatus: a.resultNotifyStatus ?? "pending",
    answers: Object.fromEntries((a.answers ?? []).map((ans) => [ans.fieldId, ans.value])),
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
  opts?: { notify?: boolean },
): Promise<RecruitmentCampaign | undefined> {
  const action = isActive ? "publish" : "close";
  const { campaign } = await api.post<{ campaign: BackendCampaign }>(
    `/recruitment/campaigns/${id}/${action}`,
    action === "publish" ? { notify: opts?.notify !== false } : {},
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
  /** Gửi in-app cho BCN/Leader khi publish (mặc định true) */
  notifyOnPublish?: boolean;
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
      { notify: input.notifyOnPublish !== false },
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
  const params = new URLSearchParams({ limit: "100", page: "1" });
  if (campaignId) params.set("campaignId", campaignId);
  // Lấy đủ trang nếu total > 100
  const first = await api.get<{
    applications: BackendApplication[];
    total: number;
    page: number;
    limit: number;
  }>(`/recruitment/applications?${params.toString()}`);
  const all = [...first.applications];
  const total = first.total ?? all.length;
  const limit = first.limit ?? 100;
  const pages = Math.ceil(total / limit);
  for (let page = 2; page <= pages; page += 1) {
    params.set("page", String(page));
    const next = await api.get<{ applications: BackendApplication[] }>(
      `/recruitment/applications?${params.toString()}`,
    );
    all.push(...next.applications);
  }
  return all;
}

/** List có phân trang server — dùng cho UI bảng */
export async function getApplicationsPage(input: {
  campaignId?: string;
  department?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{
  items: Application[];
  total: number;
  page: number;
  limit: number;
}> {
  const params = new URLSearchParams();
  if (input.campaignId) params.set("campaignId", input.campaignId);
  if (input.department) params.set("department", input.department);
  if (input.status) params.set("status", input.status);
  params.set("page", String(input.page ?? 1));
  params.set("limit", String(input.limit ?? 20));
  const data = await api.get<{
    applications: BackendApplication[];
    total: number;
    page: number;
    limit: number;
  }>(`/recruitment/applications?${params.toString()}`);
  return {
    items: data.applications.map(toApplication),
    total: data.total,
    page: data.page,
    limit: data.limit,
  };
}

export async function getApplications(campaignId?: string): Promise<Application[]> {
  return (await fetchApplications(campaignId)).map(toApplication);
}

export async function getApplicationById(id: string): Promise<Application | undefined> {
  try {
    const { application } = await api.get<{ application: BackendApplication }>(
      `/recruitment/applications/${id}`,
    );
    return toApplication(application);
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) return undefined;
    throw err;
  }
}

export async function getApplicationAnswers(applicationId: string): Promise<ApplicationAnswer[]> {
  const { application: app } = await api.get<{ application: BackendApplication }>(
    `/recruitment/applications/${applicationId}`,
  );
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

// ---- Chấm điểm vòng đơn / phỏng vấn (API thật — Phần 2-4) ----
// Backend chấm theo thang 0-100 với trọng số tổng 100; UI dùng thang 0-maxScore.
// Các hàm dưới chuyển đổi 2 chiều để giữ nguyên giao diện.

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

type BackendCriterionScore = { criterion: string; weight: number; score: number };

type BackendScore = {
  _id: string;
  applicationId: string;
  round: "cv" | "interview";
  scoredBy: { _id: string; name: string } | string;
  criteriaScores: BackendCriterionScore[];
  totalScore: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
};

type BackendScoreSummary = {
  average: number;
  maxDiffPercent: number;
  count: number;
  scores: BackendScore[];
};

// UI (0..maxScore) → backend (0..100, trọng số chia đều tổng 100)
function toBackendCriteria(
  criteriaScores: { criteriaName: string; score: number; maxScore: number }[],
): BackendCriterionScore[] {
  const n = criteriaScores.length;
  return criteriaScores.map((c, i) => ({
    criterion: c.criteriaName,
    // Chia đều, dồn phần dư vào tiêu chí cuối để tổng đúng 100
    weight: i === n - 1 ? 100 - Math.floor(100 / n) * (n - 1) : Math.floor(100 / n),
    score: c.maxScore > 0 ? (c.score / c.maxScore) * 100 : 0,
  }));
}

function fromBackendCriteria(
  criteriaScores: BackendCriterionScore[],
  template: { id: string; name: string; maxScore: number }[],
) {
  return criteriaScores.map((c, i) => {
    const t = template.find((x) => x.name === c.criterion) ?? template[i];
    const maxScore = t?.maxScore ?? 10;
    return {
      criteriaId: t?.id ?? c.criterion,
      criteriaName: c.criterion,
      score: Number(((c.score / 100) * maxScore).toFixed(1)),
      maxScore,
    };
  });
}

function scorerOf(s: BackendScore): { id: string; name: string } {
  if (!s.scoredBy) return { id: "", name: "" };
  return typeof s.scoredBy === "string"
    ? { id: s.scoredBy, name: "" }
    : { id: s.scoredBy._id, name: s.scoredBy.name };
}

async function fetchScoreSummary(
  applicationId: string,
  round: "cv" | "interview",
): Promise<BackendScoreSummary> {
  const { summary } = await api.get<{ summary: BackendScoreSummary }>(
    `/recruitment/applications/${applicationId}/scores?round=${round}`,
  );
  return summary;
}

export async function getScreeningCriteria(): Promise<ScreeningCriterion[]> {
  return [...SCREENING_CRITERIA];
}

export async function getApplicationScore(
  applicationId: string,
): Promise<ApplicationScore | undefined> {
  const summary = await fetchScoreSummary(applicationId, "cv");
  const s = summary.scores[0];
  if (!s) return undefined;
  const scorer = scorerOf(s);
  return {
    id: s._id,
    applicationId,
    reviewerId: scorer.id,
    reviewerName: scorer.name,
    criteriaScores: fromBackendCriteria(s.criteriaScores, SCREENING_CRITERIA),
    comment: s.comment,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
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
  const { score } = await api.post<{ score: BackendScore }>(
    `/recruitment/applications/${input.applicationId}/score`,
    {
      applicationId: input.applicationId,
      round: "cv",
      criteriaScores: toBackendCriteria(input.criteriaScores),
      comment: input.comment,
    },
  );
  const scorer = scorerOf(score);
  return {
    id: score._id,
    applicationId: input.applicationId,
    reviewerId: scorer.id || input.reviewerId,
    reviewerName: scorer.name || input.reviewerName,
    criteriaScores: input.criteriaScores,
    comment: input.comment,
    createdAt: score.createdAt,
    updatedAt: score.updatedAt,
  };
}

export async function setScreeningDecision(
  applicationId: string,
  result: Extract<PassFail, "pass" | "fail">,
): Promise<Application | undefined> {
  await api.post(`/recruitment/applications/${applicationId}/decide`, {
    status: result === "pass" ? "passed_cv" : "failed_cv",
  });
  return getApplicationById(applicationId);
}

export async function getInterviewers(
  campaignId?: string,
): Promise<InterviewerRef[]> {
  const qs = campaignId
    ? `?campaignId=${encodeURIComponent(campaignId)}`
    : "";
  const { interviewers } = await api.get<{
    interviewers: { _id: string; name: string; role?: InterviewerRef["role"] }[];
  }>(`/recruitment/interviewers${qs}`);
  return interviewers.map((u) => ({
    id: u._id,
    name: u.name,
    role: u.role,
  }));
}

// ---- Slot phỏng vấn (API thật) ----
// Row id = "<slotId>::<bookingId>::<applicationId>" — các hàm dưới tự parse.

type BackendSlot = {
  _id: string;
  campaignId: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  interviewerIds: { _id: string; name: string }[];
  capacity: number;
  bookedCount: number;
};

type BackendBooking = {
  _id: string;
  slotId: string;
  status: "booked" | "changed" | "no_show" | "completed";
  applicationId: {
    _id: string;
    fullName: string;
    departmentPreferences: { department: string; priority: number }[];
  } | null;
};

function parseRowId(rowId: string) {
  if (!rowId.includes("::")) {
    return { slotId: rowId, bookingId: undefined as string | undefined, applicationId: undefined as string | undefined };
  }
  const [slotId, bookingId, applicationId] = rowId.split("::");
  return { slotId, bookingId: bookingId || undefined, applicationId: applicationId || undefined };
}

function minutesBetween(start: string, end: string) {
  const [h1, m1] = start.split(":").map(Number);
  const [h2, m2] = end.split(":").map(Number);
  return h2 * 60 + m2 - (h1 * 60 + m1);
}

function addMinutes(start: string, minutes: number) {
  const [h, m] = start.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** 1 ca BE → 1 row UI (không nhân theo từng booking/ứng viên) */
function toUiSlot(s: BackendSlot, bookings: BackendBooking[] = []): InterviewSlot {
  const interviewers = (s.interviewerIds ?? []).map((u) => ({ id: u._id, name: u.name }));
  const bookedCount = s.bookedCount ?? bookings.length;
  const allDone =
    bookings.length > 0 &&
    bookings.every((b) => b.status === "completed" || b.status === "no_show");
  return {
    id: s._id,
    campaignId: s.campaignId,
    date: s.date.slice(0, 10),
    startTime: s.startTime,
    durationMinutes: Math.max(minutesBetween(s.startTime, s.endTime), 0),
    locationOrLink: s.location,
    capacity: s.capacity,
    bookedCount,
    interviewers,
    status: allDone
      ? "done"
      : interviewers.length === 0
        ? "missing_interviewers"
        : "scheduled",
  };
}

async function fetchSlots(campaignId: string): Promise<InterviewSlot[]> {
  const { slots, bookings } = await api.get<{
    slots: BackendSlot[];
    bookings: BackendBooking[];
  }>(`/recruitment/campaigns/${campaignId}/slots`);
  const bySlot = new Map<string, BackendBooking[]>();
  for (const b of bookings) {
    const list = bySlot.get(b.slotId) ?? [];
    list.push(b);
    bySlot.set(b.slotId, list);
  }
  return slots.map((s) => toUiSlot(s, bySlot.get(s._id) ?? []));
}

export async function getInterviewSlots(
  campaignId?: string,
  date?: string,
): Promise<InterviewSlot[]> {
  if (!campaignId) return [];
  const rows = await fetchSlots(campaignId);
  return date ? rows.filter((r) => r.date === date) : rows;
}

/** Ca Leader/BCN đang phụ trách (interviewerIds chứa mình) */
export async function getMyInterviewSlots(): Promise<InterviewSlot[]> {
  const { slots, bookings } = await api.get<{
    slots: BackendSlot[];
    bookings: BackendBooking[];
  }>("/recruitment/slots/mine");
  const bySlot = new Map<string, BackendBooking[]>();
  for (const b of bookings) {
    const list = bySlot.get(b.slotId) ?? [];
    list.push(b);
    bySlot.set(b.slotId, list);
  }
  return slots.map((s) => toUiSlot(s, bySlot.get(s._id) ?? []));
}

export async function getInterviewDatesWithSlots(campaignId: string): Promise<string[]> {
  const rows = await fetchSlots(campaignId);
  return [...new Set(rows.map((r) => r.date))];
}

export type BatchScheduleInput = {
  campaignId: string;
  date: string;
  /** Mỗi phần tử = 1 ca (sáng hoặc chiều) với giờ bắt đầu–kết thúc */
  sessions: { startTime: string; endTime: string; label?: string }[];
  locationOrLink: string;
  /** Số ứng viên tối đa mỗi ca */
  capacity?: number;
  /** Người PV phụ trách ca (chung cho mọi ứng viên trong ca) */
  interviewerIds?: string[];
};

/** Tạo tối đa 2 ca/ngày (sáng/chiều) + gắn panel interviewer */
export async function createBatchInterviewSlots(
  input: BatchScheduleInput,
): Promise<InterviewSlot[]> {
  const created: InterviewSlot[] = [];
  for (const session of input.sessions) {
    const { slot } = await api.post<{ slot: BackendSlot }>("/recruitment/slots", {
      campaignId: input.campaignId,
      date: input.date,
      startTime: session.startTime,
      endTime: session.endTime,
      location: input.locationOrLink,
      capacity: input.capacity ?? 8,
      interviewerIds: input.interviewerIds ?? [],
    });
    created.push(toUiSlot(slot, []));
  }
  return created;
}

export async function assignInterviewersToSlot(
  rowId: string,
  interviewers: InterviewerRef[],
): Promise<InterviewSlot | undefined> {
  const { slotId } = parseRowId(rowId);
  const { slot } = await api.patch<{ slot: BackendSlot }>(`/recruitment/slots/${slotId}`, {
    interviewerIds: interviewers.map((i) => i.id),
  });
  return toUiSlot(slot, []);
}

export type EditSlotPatch = {
  date: string;
  startTime: string;
  durationMinutes?: number;
  locationOrLink?: string;
  capacity?: number;
};

// Sửa ca: giờ/ngày/địa điểm/sức chứa — không gửi duration thì backend tự giữ thời lượng cũ
export async function rescheduleInterviewSlot(
  rowId: string,
  patch: EditSlotPatch,
): Promise<InterviewSlot | undefined> {
  const { slotId } = parseRowId(rowId);
  const body: Record<string, unknown> = {
    date: patch.date,
    startTime: patch.startTime,
  };
  if (patch.durationMinutes != null) {
    body.endTime = addMinutes(patch.startTime, patch.durationMinutes);
  }
  if (patch.locationOrLink) body.location = patch.locationOrLink;
  if (patch.capacity != null) body.capacity = patch.capacity;
  const { slot } = await api.patch<{ slot: BackendSlot }>(
    `/recruitment/slots/${slotId}`,
    body,
  );
  return toUiSlot(slot, []);
}

// Xoá ca — backend chặn nếu đã có ứng viên đặt lịch
export async function deleteInterviewSlot(rowId: string): Promise<void> {
  const { slotId } = parseRowId(rowId);
  await api.delete(`/recruitment/slots/${slotId}`);
}

// ---- Chi tiết ca / trang note phỏng vấn / kết quả toàn đợt ----

type BackendBookingApp = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  applicationCode: string | null;
  status: string;
  departmentPreferences: { department: string; priority: number }[];
};

export type SlotCandidate = {
  bookingId: string;
  applicationId: string;
  fullName: string;
  email: string;
  phone?: string;
  applicationCode: string;
  department: string;
  bookingStatus: "booked" | "changed" | "no_show" | "completed";
  /** Điểm PV trung bình thang 10 (null = chưa chấm) */
  interviewScore: number | null;
  scoreCount: number;
  /** Từng người chấm — thang 10 */
  scores: { scoredBy: string; name: string; totalScore: number; comment: string }[];
};

export type SlotInfo = {
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  interviewers: InterviewerRef[];
};

function preferredDept(app: BackendBookingApp | null): string {
  if (!app) return "";
  return (
    [...(app.departmentPreferences ?? [])].sort((x, y) => x.priority - y.priority)[0]
      ?.department ?? ""
  );
}

/** Chi tiết 1 ca: thông tin ca + bảng ứng viên đã đặt */
export async function getSlotCandidates(
  slotRowId: string,
): Promise<{ slot: SlotInfo; candidates: SlotCandidate[] }> {
  const { slotId } = parseRowId(slotRowId);
  const { slot, bookings } = await api.get<{
    slot: BackendSlot;
    bookings: {
      _id: string;
      status: SlotCandidate["bookingStatus"];
      applicationId: BackendBookingApp | null;
      interviewScore: number | null;
      scoreCount: number;
      scores?: {
        scoredBy: string;
        name: string;
        totalScore: number;
        comment: string;
        attendance?: string | null;
      }[];
    }[];
  }>(`/recruitment/slots/${slotId}`);

  return {
    slot: {
      slotId: slot._id,
      date: slot.date.slice(0, 10),
      startTime: slot.startTime,
      endTime: slot.endTime,
      location: slot.location,
      capacity: slot.capacity,
      interviewers: (slot.interviewerIds ?? []).map((u) => ({ id: u._id, name: u.name })),
    },
    candidates: bookings
      .filter((b) => b.applicationId)
      .map((b) => ({
        bookingId: b._id,
        applicationId: b.applicationId!._id,
        fullName: b.applicationId!.fullName,
        email: b.applicationId!.email,
        phone: b.applicationId!.phone,
        applicationCode: b.applicationId!.applicationCode ?? "",
        department: preferredDept(b.applicationId),
        bookingStatus: b.status,
        interviewScore: toUiScale(b.interviewScore) ?? null,
        scoreCount: b.scoreCount,
        scores: (b.scores ?? []).map((s) => ({
          scoredBy: s.scoredBy,
          name: s.name,
          totalScore: toUiScale(s.totalScore) ?? 0,
          comment: s.comment ?? "",
        })),
      })),
  };
}

export type BookingReviewerScore = {
  reviewerId: string;
  reviewerName: string;
  /** Thang 10 */
  totalScore: number;
  comment: string;
  attendance: "present" | "absent" | null;
};

export type BookingDetail = {
  bookingId: string;
  applicationId: string;
  fullName: string;
  email: string;
  phone?: string;
  applicationCode: string;
  applicationStatus: string;
  department: string;
  slot: { slotId: string; date: string; startTime: string; endTime: string; location: string };
  /** Điểm TB thang 10 + danh sách điểm từng reviewer */
  averageScore: number | null;
  reviewerScores: BookingReviewerScore[];
};

/** Chi tiết booking cho trang note phỏng vấn */
export async function getBookingDetail(bookingId: string): Promise<BookingDetail> {
  const { booking, summary } = await api.get<{
    booking: {
      _id: string;
      applicationId: BackendBookingApp;
      slotId: { _id: string; date: string; startTime: string; endTime: string; location: string };
    };
    summary: {
      average: number;
      count: number;
      scores: {
        scoredBy: { name: string } | string;
        totalScore: number;
        comment: string;
        attendance: "present" | "absent" | null;
      }[];
    };
  }>(`/recruitment/bookings/${bookingId}`);

  const app = booking.applicationId;
  return {
    bookingId: booking._id,
    applicationId: app._id,
    fullName: app.fullName,
    email: app.email,
    phone: app.phone,
    applicationCode: app.applicationCode ?? "",
    applicationStatus: app.status,
    department: preferredDept(app),
    slot: {
      slotId: booking.slotId._id,
      date: booking.slotId.date.slice(0, 10),
      startTime: booking.slotId.startTime,
      endTime: booking.slotId.endTime,
      location: booking.slotId.location,
    },
    averageScore: summary.count ? (toUiScale(summary.average) ?? null) : null,
    reviewerScores: summary.scores.map((s) => ({
      reviewerId:
        typeof s.scoredBy === "object" && s.scoredBy && "_id" in s.scoredBy
          ? String((s.scoredBy as { _id: string })._id)
          : typeof s.scoredBy === "string"
            ? s.scoredBy
            : "",
      reviewerName: typeof s.scoredBy === "object" ? (s.scoredBy as { name: string }).name : "",
      totalScore: toUiScale(s.totalScore) ?? 0,
      comment: s.comment,
      attendance: s.attendance,
    })),
  };
}

/** Chấm điểm + note trực tiếp theo bookingId (trang note phỏng vấn) */
export async function saveBookingScore(input: {
  bookingId: string;
  applicationId: string;
  criteriaScores: { criteriaName: string; score: number; maxScore: number }[];
  comment: string;
  attendance: "present" | "absent";
  /** BCN sửa điểm hộ interviewer */
  asUserId?: string;
}): Promise<void> {
  await api.post(`/recruitment/bookings/${input.bookingId}/score`, {
    applicationId: input.applicationId,
    round: "interview",
    criteriaScores: toBackendCriteria(input.criteriaScores),
    comment: input.comment,
    attendance: input.attendance,
    ...(input.asUserId ? { asUserId: input.asUserId } : {}),
  });
}

export type InterviewResultRow = {
  applicationId: string;
  bookingId?: string;
  applicationCode: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  slotDate: string;
  slotTime: string;
  location: string;
  bookingStatus: string;
  /** Thang 10 */
  averageScore: number | null;
  reviewerCount: number;
  /** "Tên: điểm — nhận xét" nối bằng " | " */
  reviewerNotes: string;
  applicationStatus: string;
};

/** Kết quả phỏng vấn TOÀN BỘ ca của đợt — phục vụ xuất file thảo luận */
export async function getInterviewResults(campaignId: string): Promise<InterviewResultRow[]> {
  const { results } = await api.get<{
    results: {
      booking: {
        _id?: string;
        status: string;
        applicationId: (BackendBookingApp & { _id: string }) | null;
      };
      slot: { date: string; startTime: string; endTime: string; location: string } | null;
      averageScore: number | null;
      scores: { reviewerName: string; totalScore: number; comment: string }[];
    }[];
  }>(`/recruitment/campaigns/${campaignId}/interview-results`);

  return results
    .filter((r) => r.booking.applicationId)
    .map((r) => {
      const app = r.booking.applicationId!;
      return {
        applicationId: app._id,
        bookingId: r.booking._id,
        applicationCode: app.applicationCode ?? "",
        fullName: app.fullName,
        email: app.email,
        phone: app.phone ?? "",
        department: preferredDept(app),
        slotDate: r.slot ? r.slot.date.slice(0, 10) : "",
        slotTime: r.slot ? `${r.slot.startTime} - ${r.slot.endTime}` : "",
        location: r.slot?.location ?? "",
        bookingStatus: r.booking.status,
        averageScore: toUiScale(r.averageScore) ?? null,
        reviewerCount: r.scores.length,
        reviewerNotes: r.scores
          .map((s) => `${s.reviewerName}: ${toUiScale(s.totalScore)}${s.comment ? ` — ${s.comment}` : ""}`)
          .join(" | "),
        applicationStatus: app.status,
      };
    });
}

export async function getInterviewCriteria(): Promise<InterviewCriterion[]> {
  return [...INTERVIEW_CRITERIA];
}

export async function getInterviewScore(rowId: string): Promise<InterviewScore | undefined> {
  const { applicationId } = parseRowId(rowId);
  if (!applicationId) return undefined;
  const summary = await fetchScoreSummary(applicationId, "interview");
  const s = summary.scores[0];
  if (!s) return undefined;
  const scorer = scorerOf(s);
  return {
    id: s._id,
    applicationId,
    slotId: rowId,
    interviewerId: scorer.id,
    interviewerName: scorer.name,
    criteriaScores: fromBackendCriteria(s.criteriaScores, INTERVIEW_CRITERIA),
    comment: s.comment,
    result: "pending",
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
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
  const { bookingId } = parseRowId(input.slotId);
  if (!bookingId) {
    throw new Error("Ca này chưa có ứng viên đặt lịch — không chấm điểm được");
  }
  const { score } = await api.post<{ score: BackendScore }>(
    `/recruitment/bookings/${bookingId}/score`,
    {
      applicationId: input.applicationId,
      round: "interview",
      criteriaScores: toBackendCriteria(input.criteriaScores),
      comment: input.comment,
      attendance: "present",
    },
  );
  const scorer = scorerOf(score);
  return {
    id: score._id,
    applicationId: input.applicationId,
    slotId: input.slotId,
    interviewerId: scorer.id || input.interviewerId,
    interviewerName: scorer.name || input.interviewerName,
    criteriaScores: input.criteriaScores,
    comment: input.comment,
    result: input.result ?? "pending",
    createdAt: score.createdAt,
    updatedAt: score.updatedAt,
  };
}

export async function setInterviewDecision(
  applicationId: string,
  result: Extract<PassFail, "pass" | "fail">,
): Promise<Application | undefined> {
  await api.post(`/recruitment/applications/${applicationId}/decide-interview`, {
    status: result === "pass" ? "passed_interview" : "failed_interview",
  });
  return getApplicationById(applicationId);
}

export async function notifyInterviewResults(applicationIds: string[]): Promise<{ sent: number }> {
  if (applicationIds.length === 0) return { sent: 0 };
  const { notified } = await api.post<{ notified: number }>(
    "/recruitment/applications/notify-interview",
    { applicationIds },
  );
  return { sent: notified };
}

// Đánh dấu đã gửi email kết quả cuối (lưu backend — hiển thị cột "Trạng thái xử lý")
export async function notifyFinalResults(applicationIds: string[]): Promise<{ sent: number }> {
  const { notified } = await api.post<{ notified: number }>(
    "/recruitment/applications/notify-final",
    { applicationIds },
  );
  return { sent: notified };
}

// Xác nhận trúng tuyển / không trúng tuyển — từ pool Đạt phỏng vấn
export async function confirmFinalDecision(
  applicationId: string,
  status: "admitted" | "rejected",
): Promise<Application | undefined> {
  await api.post(`/recruitment/applications/${applicationId}/confirm-final`, { status });
  return getApplicationById(applicationId);
}

/** Đổi ban chính thức (NV2/NV3) trước khi xác nhận trúng tuyển */
export async function assignOfficialDepartment(
  applicationId: string,
  department: string,
): Promise<Application | undefined> {
  await api.patch(`/recruitment/applications/${applicationId}/assigned-department`, {
    department,
  });
  return getApplicationById(applicationId);
}

/** Duyệt hàng loạt vòng đơn theo ngưỡng điểm (backend thang 0–100; UI truyền 0–10) */
export async function bulkDecideCvByThreshold(
  campaignId: string,
  uiThreshold: number,
  failBelow = true,
): Promise<{ passed: number; failed: number; skipped: number }> {
  return api.post("/recruitment/applications/bulk-decide-cv", {
    campaignId,
    threshold: uiThreshold * 10,
    failBelow,
  });
}

// Xác nhận trúng tuyển cuối — state machine tự enqueue job nâng role candidate → member
export async function convertAcceptedToMembers(
  applicationIds: string[],
): Promise<{ converted: number; failed: number }> {
  let converted = 0;
  let failed = 0;
  const errors: string[] = [];
  for (const id of applicationIds) {
    try {
      await api.post(`/recruitment/applications/${id}/confirm-final`, { status: "admitted" });
      converted += 1;
    } catch (err) {
      failed += 1;
      if (errors.length < 3) {
        errors.push(err instanceof Error ? err.message : "Lỗi không xác định");
      }
    }
  }
  if (converted === 0 && failed > 0) {
    throw new Error(errors[0] ?? "Không xác nhận được ứng viên nào.");
  }
  return { converted, failed };
}

export async function rejectFinalCandidates(
  applicationIds: string[],
): Promise<{ rejected: number; failed: number }> {
  let rejected = 0;
  let failed = 0;
  const errors: string[] = [];
  for (const id of applicationIds) {
    try {
      await api.post(`/recruitment/applications/${id}/confirm-final`, { status: "rejected" });
      rejected += 1;
    } catch (err) {
      failed += 1;
      if (errors.length < 3) {
        errors.push(err instanceof Error ? err.message : "Lỗi không xác định");
      }
    }
  }
  if (rejected === 0 && failed > 0) {
    throw new Error(errors[0] ?? "Không đánh dấu được ứng viên nào.");
  }
  return { rejected, failed };
}

export async function assignReviewers(
  applicationId: string,
  reviewerIds: string[],
): Promise<Application | undefined> {
  await api.post(`/recruitment/applications/${applicationId}/assign-reviewers`, {
    reviewerIds,
  });
  return getApplicationById(applicationId);
}

export type UnbookedApplication = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  applicationCode?: string;
  bookingReminderSentAt?: string | null;
  updatedAt: string;
};

export async function listUnbookedApplications(
  campaignId: string,
): Promise<UnbookedApplication[]> {
  const { applications } = await api.get<{ applications: UnbookedApplication[] }>(
    `/recruitment/campaigns/${campaignId}/unbooked`,
  );
  return applications;
}

export async function assignInterviewSlot(
  applicationId: string,
  slotId: string,
): Promise<void> {
  await api.post(`/recruitment/applications/${applicationId}/assign-slot`, { slotId });
}

export async function markUnbookedNoShow(applicationId: string): Promise<void> {
  await api.post(`/recruitment/applications/${applicationId}/mark-unbooked-no-show`);
}

export async function completeCampaign(id: string): Promise<RecruitmentCampaign | undefined> {
  const { campaign } = await api.post<{ campaign: BackendCampaign }>(
    `/recruitment/campaigns/${id}/complete`,
  );
  return toCampaign(campaign);
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

export async function exportApplications(
  campaignId: string,
  body: { applicationIds: string[]; columns: string[]; questionFieldIds: string[] },
): Promise<void> {
  const token = getAccessToken();
  const res = await fetch(
    `${EXPORT_BASE}/recruitment/campaigns/${campaignId}/applications/export`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) throw new Error("Xuất file thất bại — thử lại sau");
  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match = /filename="?([^"]+)"?/.exec(disposition);
  const filename = match?.[1] ?? `ho_so_${campaignId}.xlsx`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
