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

const QUOTA_STYLES: Pick<QuotaDraft, "icon" | "tone">[] = [
  { icon: "code", tone: "blue" },
  { icon: "event", tone: "purple" },
  { icon: "media", tone: "green" },
  { icon: "external", tone: "red" },
];

/**
 * Chỉ tiêu dự kiến = đúng danh sách Ban CLB đang active.
 * Giữ số chỉ tiêu đã nhập nếu trùng tên ban (khi sửa đợt).
 */
export function quotasFromDepartments(
  departments: { id: string; name: string; headcountTarget?: number | null }[],
  existing?: { departmentName: string; quota: number }[],
): QuotaDraft[] {
  return departments.map((d, i) => {
    const style = QUOTA_STYLES[i % QUOTA_STYLES.length];
    const found = existing?.find((q) => q.departmentName === d.name);
    const fromTarget =
      d.headcountTarget != null && d.headcountTarget > 0
        ? Number(d.headcountTarget)
        : 0;
    return {
      departmentId: d.id,
      departmentName: d.name,
      icon: style.icon,
      tone: style.tone,
      quota: found?.quota ?? fromTarget,
    };
  });
}

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
  { label: "Ngày sinh", hint: "Bắt buộc tuyệt đối — dùng sinh mật khẩu tài khoản Ứng viên" },
  { label: "Ban nguyện vọng", hint: "Chọn tối đa 2 ban theo thứ tự ưu tiên" },
];

export function createEmptyDraft(quotas: QuotaDraft[] = []): CampaignDraft {
  return {
    name: "",
    dateRangeLabel: "",
    openAt: "",
    closeAt: "",
    description: "",
    quotas: quotas.map((q) => ({ ...q })),
    // Chỉ chứa câu hỏi BCN tự thêm — trường cố định nằm ở FIXED_FIELDS
    questions: [],
    activateOnPublish: true,
    notifyOnPublish: true,
  };
}

export function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
