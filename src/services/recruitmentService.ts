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
    attachments,
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

export async function getInterviewers(): Promise<InterviewerRef[]> {
  const { interviewers } = await api.get<{
    interviewers: { _id: string; name: string }[];
  }>("/recruitment/interviewers");
  return interviewers.map((u) => ({ id: u._id, name: u.name }));
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

function toUiSlot(s: BackendSlot, booking: BackendBooking | null): InterviewSlot {
  const app = booking?.applicationId ?? null;
  const preferred = app
    ? [...(app.departmentPreferences ?? [])].sort((x, y) => x.priority - y.priority)[0]?.department
    : undefined;
  const interviewers = (s.interviewerIds ?? []).map((u) => ({ id: u._id, name: u.name }));
  const done = booking?.status === "completed" || booking?.status === "no_show";
  return {
    id: `${s._id}::${booking?._id ?? ""}::${app?._id ?? ""}`,
    bookingId: booking?._id,
    campaignId: s.campaignId,
    date: s.date.slice(0, 10),
    startTime: s.startTime,
    durationMinutes: Math.max(minutesBetween(s.startTime, s.endTime), 0),
    locationOrLink: s.location,
    applicationId: app?._id,
    candidateName: app?.fullName,
    candidateDepartment: preferred,
    interviewers,
    requiredInterviewers: 2,
    status: done ? "done" : interviewers.length < 2 ? "missing_interviewers" : "scheduled",
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
  return slots.flatMap((s) => {
    const slotBookings = bySlot.get(s._id) ?? [];
    if (!slotBookings.length) return [toUiSlot(s, null)];
    return slotBookings.map((b) => toUiSlot(s, b));
  });
}

export async function getInterviewSlots(
  campaignId?: string,
  date?: string,
): Promise<InterviewSlot[]> {
  if (!campaignId) return [];
  const rows = await fetchSlots(campaignId);
  return date ? rows.filter((r) => r.date === date) : rows;
}

export async function getInterviewDatesWithSlots(campaignId: string): Promise<string[]> {
  const rows = await fetchSlots(campaignId);
  return [...new Set(rows.map((r) => r.date))];
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

// Tạo mỗi ứng viên 1 ca (capacity 1) rồi gán luôn ứng viên vào ca đó
export async function createBatchInterviewSlots(input: BatchScheduleInput): Promise<InterviewSlot[]> {
  // Backend bắt buộc slot có >= 1 người phỏng vấn — mặc định lấy người đầu danh sách,
  // phân công lại sau bằng nút "Phân công" trên từng ca
  const interviewers = await getInterviewers();
  if (!interviewers.length) {
    throw new Error("Chưa có tài khoản BCN/Leader nào để phân công phỏng vấn");
  }
  const defaultInterviewer = interviewers[0].id;
  const times = input.startTimes.length
    ? input.startTimes
    : ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00"];

  const created: InterviewSlot[] = [];
  for (const [i, applicationId] of input.applicationIds.entries()) {
    const startTime = times[i % times.length];
    const { slot } = await api.post<{ slot: BackendSlot }>("/recruitment/slots", {
      campaignId: input.campaignId,
      date: input.date,
      startTime,
      endTime: addMinutes(startTime, input.durationMinutes),
      location: input.locationOrLink,
      interviewerIds: [defaultInterviewer],
      capacity: 1,
    });
    await api.post(`/recruitment/applications/${applicationId}/assign-slot`, {
      slotId: slot._id,
    });
    created.push(toUiSlot(slot, null));
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
  return toUiSlot(slot, null);
}

export async function rescheduleInterviewSlot(
  rowId: string,
  patch: { date: string; startTime: string; reason?: string },
): Promise<InterviewSlot | undefined> {
  const { slotId } = parseRowId(rowId);
  // Không gửi endTime — backend tự dời endTime giữ nguyên thời lượng ca
  const { slot } = await api.patch<{ slot: BackendSlot }>(`/recruitment/slots/${slotId}`, {
    date: patch.date,
    startTime: patch.startTime,
  });
  return toUiSlot(slot, null);
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
  return { sent: applicationIds.length };
}

export async function notifyFinalResults(applicationIds: string[]): Promise<{ sent: number }> {
  return { sent: applicationIds.length };
}

// Xác nhận trúng tuyển cuối — state machine tự enqueue job nâng role candidate → member
export async function convertAcceptedToMembers(
  applicationIds: string[],
): Promise<{ converted: number }> {
  let converted = 0;
  for (const id of applicationIds) {
    try {
      await api.post(`/recruitment/applications/${id}/confirm-final`, { status: "admitted" });
      converted += 1;
    } catch {
      // hồ sơ chưa đủ điều kiện (chưa passed_interview) — bỏ qua
    }
  }
  return { converted };
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
