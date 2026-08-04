export type WizardStepId = 1 | 2 | 3;

export const WIZARD_STEPS: { id: WizardStepId; label: string }[] = [
  { id: 1, label: "Thông tin chung" },
  { id: 2, label: "Form Builder" },
  { id: 3, label: "Xuất bản" },
];

export type QuotaDraft = {
  departmentId: string;
  departmentName: string;
  icon: "code" | "event" | "media" | "external";
  tone: "blue" | "purple" | "green" | "red";
  quota: number;
};

export type QuestionDraft = {
  id: string;
  content: string;
  type: "short_text" | "long_text" | "single_choice" | "file_upload";
  required: boolean;
  options: { id: string; label: string }[];
};

export type CampaignDraft = {
  name: string;
  dateRangeLabel: string;
  openAt: string;
  closeAt: string;
  description: string;
  quotas: QuotaDraft[];
  questions: QuestionDraft[];
  /** Bật ngay khi xuất bản */
  activateOnPublish: boolean;
  /** Gửi email thông báo khi publish */
  notifyOnPublish: boolean;
};

export const DEFAULT_QUOTAS: QuotaDraft[] = [
  { departmentId: "dept-pro", departmentName: "Chuyên Môn", icon: "code", tone: "blue", quota: 0 },
  { departmentId: "dept-event", departmentName: "Sự Kiện", icon: "event", tone: "purple", quota: 0 },
  { departmentId: "dept-media", departmentName: "Truyền Thông", icon: "media", tone: "green", quota: 0 },
  { departmentId: "dept-ext", departmentName: "Đối Ngoại", icon: "external", tone: "red", quota: 0 },
];

/**
 * Trường CỐ ĐỊNH theo tài liệu nghiệp vụ (mục 0.2) — luôn có trong mọi đợt
 * tuyển, không xoá/sửa được, luôn bắt buộc. Backend tự validate các trường
 * này khi ứng viên nộp đơn; form builder chỉ hiển thị để BCN thấy đủ cấu trúc.
 */
export const FIXED_FIELDS: { label: string; hint: string }[] = [
  { label: "Họ và tên", hint: "Văn bản ngắn" },
  { label: "MSSV", hint: "Văn bản ngắn" },
  { label: "Lớp", hint: "Văn bản ngắn" },
  { label: "Khoa/Ngành", hint: "Văn bản ngắn" },
  { label: "Email", hint: "Email — dùng đăng nhập tài khoản Ứng viên" },
  { label: "Số điện thoại", hint: "10 chữ số" },
  { label: "Số CCCD", hint: "12 chữ số" },
  { label: "Ngày sinh", hint: "Bắt buộc tuyệt đối — dùng sinh mật khẩu tài khoản Ứng viên" },
  { label: "Ảnh đại diện", hint: "JPG/PNG, tối đa 2MB" },
  { label: "CV", hint: "PDF/DOCX, tối đa 5MB" },
  { label: "Ban nguyện vọng", hint: "Chọn tối đa 3 ban theo thứ tự ưu tiên" },
];

export function createEmptyDraft(): CampaignDraft {
  return {
    name: "",
    dateRangeLabel: "",
    openAt: "",
    closeAt: "",
    description: "",
    quotas: DEFAULT_QUOTAS.map((q) => ({ ...q })),
    // Chỉ chứa câu hỏi BCN tự thêm — trường cố định nằm ở FIXED_FIELDS
    questions: [],
    activateOnPublish: true,
    notifyOnPublish: true,
  };
}

export function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
