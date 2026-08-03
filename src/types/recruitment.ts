/** Types module Tuyển dụng (Recruitment) — Admin */

export type CampaignStatus = "draft" | "published" | "closed";

export type QuestionType =
  | "short_text"
  | "long_text"
  | "single_choice"
  | "multi_choice"
  | "file_upload"
  | "rating";

export type PassFail = "pass" | "fail" | "pending";

/** Chỉ tiêu theo từng ban */
export type DepartmentQuota = {
  departmentId: string;
  departmentName: string;
  quota: number;
};

export type RecruitmentCampaign = {
  id: string;
  name: string; // Tên đợt tuyển *
  description?: string;
  /** null = chưa set (nháp) → UI hiện --/--/---- */
  openAt: string | null;
  closeAt: string | null;
  quotas: DepartmentQuota[]; // Chỉ tiêu theo từng ban *
  status: CampaignStatus;
  /** Cột Kích hoạt trên bảng danh sách */
  isActive: boolean;
  closeReason?: string; // Lý do đóng sớm
  createdAt: string;
  updatedAt: string;
};

/** Label trạng thái hiển thị trên UI danh sách */
export type CampaignStatusLabel = "Đang diễn ra" | "Đã kết thúc" | "Nháp";

export type FormOption = {
  id: string;
  label: string;
  order: number;
};

export type FormQuestion = {
  id: string;
  campaignId: string;
  content: string; // Nội dung câu hỏi *
  type: QuestionType; // Loại câu hỏi *
  required: boolean;
  order: number;
  options?: FormOption[]; // cho choice/rating
};

export type ApplicationStatus =
  | "submitted"
  | "screening"
  | "interview"
  | "accepted"
  | "rejected";

export type Application = {
  id: string;
  campaignId: string;
  fullName: string;
  email: string;
  phone?: string;
  /** VD: K62 - Khoa CNTT */
  education?: string;
  preferredDepartmentId: string; // Ban nguyện vọng
  preferredDepartmentName: string;
  status: ApplicationStatus;
  screeningResult: PassFail;
  interviewResult: PassFail;
  finalResult: PassFail;
  totalScore?: number;
  /** Điểm phỏng vấn (nếu có) */
  interviewScore?: number;
  submittedAt: string;
  attachments?: ApplicationAttachment[];
  /** Trạng thái xử lý sau kết quả cuối: chờ / đã gửi email / đã chuyển Member */
  resultNotifyStatus?: "pending" | "email_sent" | "converted";
};

export type ApplicationAttachment = {
  id: string;
  label: string;
  kind: "pdf" | "link";
  url: string;
};

export type ApplicationAnswer = {
  id: string;
  applicationId: string;
  questionId: string;
  questionOrder: number;
  questionContent: string;
  value: string | string[] | number;
};

export type ReviewAssignment = {
  id: string;
  applicationIds: string[];
  reviewerId: string;
  reviewerName: string;
};

export type ScreeningCriterion = {
  id: string;
  name: string;
  maxScore: number;
};

export type ApplicationScore = {
  id: string;
  applicationId: string;
  reviewerId: string;
  reviewerName: string;
  criteriaScores: { criteriaId: string; criteriaName: string; score: number; maxScore: number }[];
  comment?: string;
  createdAt: string;
  updatedAt?: string;
};

export type InterviewerRef = {
  id: string;
  name: string;
};

export type InterviewSlotStatus = "scheduled" | "missing_interviewers" | "done";

export type InterviewSlot = {
  id: string;
  campaignId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  durationMinutes: number;
  locationOrLink: string;
  applicationId?: string;
  candidateName?: string;
  candidateDepartment?: string;
  interviewers: InterviewerRef[];
  requiredInterviewers: number;
  status: InterviewSlotStatus;
};

export type InterviewCriterion = {
  id: string;
  name: string;
  maxScore: number;
};

export type InterviewScore = {
  id: string;
  applicationId: string;
  slotId: string;
  interviewerId: string;
  interviewerName: string;
  criteriaScores: { criteriaId: string; criteriaName: string; score: number; maxScore: number }[];
  comment: string;
  result: PassFail;
  createdAt: string;
  updatedAt?: string;
};

export type RecruitmentStats = {
  campaignId: string;
  totalApplications: number;
  screeningPassRate: number;
  interviewPassRate: number;
  acceptRateByDepartment: { departmentId: string; departmentName: string; rate: number }[];
};
