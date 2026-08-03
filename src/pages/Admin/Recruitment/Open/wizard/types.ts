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

export function createEmptyDraft(): CampaignDraft {
  return {
    name: "",
    dateRangeLabel: "",
    openAt: "",
    closeAt: "",
    description: "",
    quotas: DEFAULT_QUOTAS.map((q) => ({ ...q })),
    questions: [
      {
        id: "q-draft-1",
        content: "Họ và tên",
        type: "short_text",
        required: true,
        options: [],
      },
      {
        id: "q-draft-2",
        content: "Bạn đăng ký vào ban nào?",
        type: "single_choice",
        required: true,
        options: [
          { id: "opt-1", label: "Ban Chuyên môn" },
          { id: "opt-2", label: "Ban Truyền thông" },
        ],
      },
    ],
    activateOnPublish: true,
    notifyOnPublish: true,
  };
}

export function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
