// Luồng tuyển thành viên CÔNG KHAI (Guest) — gọi API thật /api/v1/public.
import { api } from "../api/client";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3456/api/v1";

/** Upload avatar/CV lên Cloudinary qua backend — trả về URL công khai */
export async function uploadRecruitmentFile(kind: "avatar" | "cv", file: File): Promise<string> {
  const form = new FormData();
  form.append("kind", kind);
  form.append("file", file);
  const res = await fetch(`${BASE_URL}/public/uploads`, { method: "POST", body: form });
  const body = (await res.json().catch(() => null)) as
    | { success: boolean; message: string; data?: { url: string } }
    | null;
  if (!res.ok || !body?.data?.url) {
    throw new Error(body?.message ?? "Upload file thất bại — thử lại sau");
  }
  return body.data.url;
}

// ---- Kiểu dữ liệu backend (model mới) ----

type BackendField = {
  fieldId: string;
  label: string;
  type: "text_short" | "text_long" | "single_choice" | "multi_choice" | "file_upload" | "scale";
  required: boolean;
  order: number;
  options?: string[];
  isFixed: boolean;
};

type BackendCampaign = {
  _id: string;
  name: string;
  description: string;
  openAt: string;
  closeAt: string;
  status: "draft" | "open" | "closed" | "completed";
  quotas: { department: string; quota: number }[];
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
  campaignId: string | { _id: string; name: string; closeAt: string; status: string };
  status: BackendApplicationStatus;
  email: string;
  fullName: string;
  studentId: string;
  className: string;
  faculty: string;
  phone: string;
  dateOfBirth: string;
  avatarUrl: string;
  cvUrl: string;
  departmentPreferences: { department: string; priority: number }[];
  answers: { fieldId: string; value: string | string[] }[];
  submittedAt: string | null;
  createdAt: string;
};

// ---- Kiểu dữ liệu cho UI (giữ nguyên shape cũ, map từ backend) ----

export type PublicQuestion = {
  _id: string; // = fieldId của form
  label: string;
  type: "short_text" | "long_text" | "single_choice" | "multi_choice" | "file" | "scale";
  options?: string[];
  required: boolean;
  order: number;
};

export type PublicCampaign = {
  id: string;
  name: string;
  description: string;
  openAt: string;
  closeAt: string;
  status: "draft" | "open" | "closed" | "completed";
  quotas: { team: string; count: number }[];
  customQuestions: PublicQuestion[];
};

export type PublicApplicationStatus =
  | "pending"
  | "passed_screening"
  | "failed_screening"
  | "passed_interview"
  | "failed_interview"
  | "accepted"
  | "rejected";

export type PublicApplication = {
  id: string;
  code: string;
  fullName: string;
  studentId: string;
  className: string;
  faculty: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  wishes: string[];
  answers: Record<string, string | string[]>;
  status: PublicApplicationStatus;
  createdAt: string;
  campaign: { _id: string; name: string; closeAt: string; status: string };
};

export type SubmitApplicationPayload = {
  campaignId: string;
  fullName: string;
  studentId: string;
  className: string;
  faculty: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  wishes: string[];
  answers: Record<string, string | string[]>;
};

// ---- Map backend → UI ----

const FIELD_TYPE_MAP: Record<BackendField["type"], PublicQuestion["type"]> = {
  text_short: "short_text",
  text_long: "long_text",
  single_choice: "single_choice",
  multi_choice: "multi_choice",
  file_upload: "file",
  scale: "scale",
};

const STATUS_MAP: Record<BackendApplicationStatus, PublicApplicationStatus> = {
  draft: "pending",
  pending_review: "pending",
  passed_cv: "passed_screening",
  failed_cv: "failed_screening",
  passed_interview: "passed_interview",
  failed_interview: "failed_interview",
  admitted: "accepted",
  rejected: "rejected",
};

function toApplication(a: BackendApplication): PublicApplication {
  const campaign =
    typeof a.campaignId === "string"
      ? { _id: a.campaignId, name: "", closeAt: "", status: "" }
      : a.campaignId;
  return {
    id: a._id,
    code: a.applicationCode ?? "",
    fullName: a.fullName,
    studentId: a.studentId,
    className: a.className,
    faculty: a.faculty,
    email: a.email,
    phone: a.phone,
    dateOfBirth: a.dateOfBirth,
    wishes: [...(a.departmentPreferences ?? [])]
      .sort((x, y) => x.priority - y.priority)
      .map((p) => p.department),
    answers: Object.fromEntries((a.answers ?? []).map((ans) => [ans.fieldId, ans.value])),
    status: STATUS_MAP[a.status],
    createdAt: a.submittedAt ?? a.createdAt,
    campaign,
  };
}

function toSubmitBody(payload: SubmitApplicationPayload) {
  return {
    campaignId: payload.campaignId,
    fullName: payload.fullName,
    studentId: payload.studentId,
    className: payload.className,
    faculty: payload.faculty,
    email: payload.email,
    phone: payload.phone,
    dateOfBirth: payload.dateOfBirth,
    departmentPreferences: payload.wishes
      .filter(Boolean)
      .map((department, i) => ({ department, priority: i + 1 })),
    answers: Object.entries(payload.answers).map(([fieldId, value]) => ({ fieldId, value })),
  };
}

// ---- API calls ----

/** Đợt tuyển đang mở đầu tiên (kèm câu hỏi riêng từ form) — null nếu không có */
export async function getActiveCampaign(): Promise<PublicCampaign | null> {
  const { campaigns } = await api.get<{ campaigns: BackendCampaign[] }>("/public/campaigns/active");
  const c = campaigns[0];
  if (!c) return null;

  let customQuestions: PublicQuestion[] = [];
  try {
    const { form } = await api.get<{ form: { fields: BackendField[] } }>(
      `/public/campaigns/${c._id}/form`,
    );
    customQuestions = form.fields
      .filter((f) => !f.isFixed)
      .map((f) => ({
        _id: f.fieldId,
        label: f.label,
        type: FIELD_TYPE_MAP[f.type],
        options: f.options,
        required: f.required,
        order: f.order,
      }))
      .sort((a, b) => a.order - b.order);
  } catch {
    // Form thiếu / lỗi — vẫn hiện đợt (trường cố định đủ để nộp)
    customQuestions = [];
  }

  return {
    id: c._id,
    name: c.name,
    description: c.description,
    openAt: c.openAt,
    closeAt: c.closeAt,
    status: c.status,
    quotas: c.quotas.map((q) => ({ team: q.department, count: q.quota })),
    customQuestions,
  };
}

/** Nộp đơn chính thức — có draftToken thì submit tiếp từ đơn nháp đã lưu */
export function submitApplication(
  payload: SubmitApplicationPayload,
  draftToken?: string,
): Promise<PublicApplication> {
  const path = draftToken
    ? `/public/applications/${encodeURIComponent(draftToken)}/submit`
    : "/public/applications/submit";
  return api
    .post<{ application: BackendApplication }>(path, toSubmitBody(payload))
    .then((d) => toApplication(d.application));
}

export type SaveDraftPayload = {
  campaignId: string;
  email: string;
  fullName?: string;
  studentId?: string;
  className?: string;
  faculty?: string;
  phone?: string;
  dateOfBirth?: string;
  wishes?: string[];
  answers?: Record<string, string | string[]>;
};

/** Lưu đơn nháp — backend gửi link tiếp tục điền qua email */
export function saveDraft(payload: SaveDraftPayload): Promise<void> {
  const body: Record<string, unknown> = {
    campaignId: payload.campaignId,
    email: payload.email,
  };
  if (payload.fullName) body.fullName = payload.fullName;
  if (payload.studentId) body.studentId = payload.studentId;
  if (payload.className) body.className = payload.className;
  if (payload.faculty) body.faculty = payload.faculty;
  if (payload.phone) body.phone = payload.phone;
  if (payload.dateOfBirth) body.dateOfBirth = payload.dateOfBirth;
  if (payload.wishes?.filter(Boolean).length) {
    body.departmentPreferences = payload.wishes
      .filter(Boolean)
      .map((department, i) => ({ department, priority: i + 1 }));
  }
  if (payload.answers && Object.keys(payload.answers).length) {
    body.answers = Object.entries(payload.answers).map(([fieldId, value]) => ({ fieldId, value }));
  }
  return api.post("/public/applications/draft", body).then(() => undefined);
}

export type DraftApplication = {
  campaignId: string;
  email: string;
  fullName: string;
  studentId: string;
  className: string;
  faculty: string;
  phone: string;
  dateOfBirth: string;
  wishes: string[];
  answers: Record<string, string | string[]>;
};

/** Đọc đơn nháp từ link email (?token=) để điền tiếp */
export function getDraft(token: string): Promise<DraftApplication> {
  return api
    .get<{ application: BackendApplication }>(
      `/public/applications/draft/${encodeURIComponent(token)}`,
    )
    .then(({ application: a }) => ({
      campaignId: typeof a.campaignId === "string" ? a.campaignId : a.campaignId._id,
      email: a.email,
      fullName: a.fullName ?? "",
      studentId: a.studentId ?? "",
      className: a.className ?? "",
      faculty: a.faculty ?? "",
      phone: a.phone ?? "",
      dateOfBirth: a.dateOfBirth ?? "",
      wishes: [...(a.departmentPreferences ?? [])]
        .sort((x, y) => x.priority - y.priority)
        .map((p) => p.department),
      answers: Object.fromEntries((a.answers ?? []).map((ans) => [ans.fieldId, ans.value])),
    }));
}

/** Tra cứu bằng mã hồ sơ (APP-...) hoặc email */
export function lookupApplication(query: string): Promise<PublicApplication> {
  const q = query.trim();
  const param = /^APP-/i.test(q)
    ? `code=${encodeURIComponent(q.toUpperCase())}`
    : `email=${encodeURIComponent(q.toLowerCase())}`;
  return api
    .get<{ application: BackendApplication }>(`/public/applications/lookup?${param}`)
    .then((d) => toApplication(d.application));
}

/** Rút đơn = backend XOÁ hồ sơ — không còn bản ghi sau khi rút */
export function withdrawApplication(code: string, email: string): Promise<void> {
  return api.delete(`/public/applications/${encodeURIComponent(code)}`, { email });
}

export type EditApplicationPayload = {
  email: string;
  fullName?: string;
  studentId?: string;
  className?: string;
  faculty?: string;
  phone?: string;
  dateOfBirth?: string;
  wishes?: string[];
  answers?: Record<string, string | string[]>;
};

/** Sửa hồ sơ trước hạn — chỉ khi còn Chờ xét duyệt & chưa chấm */
export function editApplication(
  code: string,
  payload: EditApplicationPayload,
): Promise<PublicApplication> {
  const body: Record<string, unknown> = { email: payload.email };
  if (payload.fullName !== undefined) body.fullName = payload.fullName;
  if (payload.studentId !== undefined) body.studentId = payload.studentId;
  if (payload.className !== undefined) body.className = payload.className;
  if (payload.faculty !== undefined) body.faculty = payload.faculty;
  if (payload.phone !== undefined) body.phone = payload.phone;
  if (payload.dateOfBirth !== undefined) body.dateOfBirth = payload.dateOfBirth;
  if (payload.wishes?.length) {
    body.departmentPreferences = payload.wishes
      .filter(Boolean)
      .map((department, i) => ({ department, priority: i + 1 }));
  }
  if (payload.answers) {
    body.answers = Object.entries(payload.answers).map(([fieldId, value]) => ({ fieldId, value }));
  }
  return api
    .put<{ application: BackendApplication }>(
      `/public/applications/${encodeURIComponent(code)}/edit`,
      body,
    )
    .then((d) => toApplication(d.application));
}
